import aiohttp
from typing import Optional, Dict, Any, Union
from backend.settings import app_settings
from aiohttp import ClientError

class ElevenLabsError(Exception):
    """Custom exception for ElevenLabs API errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ElevenLabsClient:
    def __init__(self):
        if not app_settings.elevenlabs.key:
            raise ValueError("ElevenLabs API key not configured")
        self.api_key = app_settings.elevenlabs.key
        self.endpoint = (app_settings.elevenlabs.endpoint or "https://api.elevenlabs.io/v1").rstrip('/')

    def _get_headers(self, content_type: str = "application/json", accept: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": content_type,
        }
        if accept:
            headers["Accept"] = accept
        return headers

    def _handle_error(self, e: ClientError, operation: str) -> Dict[str, Any]:
        """Standardized error handling"""
        error_message = f"Error during {operation}: {str(e)}"
        status_code = getattr(e, 'status', 500)
        
        return {
            "error": {
                "message": error_message,
                "status_code": status_code
            }
        }

    async def get_voices(self) -> Union[Dict[str, Any], None]:
        """Retrieve the list of available voices from the ElevenLabs API."""
        url = f"{self.endpoint}/voices"
        headers = self._get_headers()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    response.raise_for_status()
                    return await response.json()
        except ClientError as e:
            return self._handle_error(e, "fetching voices")
        
    async def get_models(self) -> Union[Dict[str, Any], None]:
        """Retrieve the list of available models from the ElevenLabs API."""
        url = f"{self.endpoint}/models"
        headers = self._get_headers()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    response.raise_for_status()
                    return await response.json()
        except ClientError as e:
            return self._handle_error(e, "fetching models")

    async def generate_audio(
        self,
        text: str,
        model_id: str,
        voice_id: str,
        stability: float = 0.5,
        similarity_boost: float = 0.5,
        style: int = 0,
        use_speaker_boost: bool = True,
        previous_text: Optional[str] = None,
        next_text: Optional[str] = None,
        language_code: Optional[str] = None,
        seed: Optional[int] = None
    ) -> Union[bytes, Dict[str, Any]]:
        """
        Generate audio using ElevenLabs Text-to-Speech API.

        Parameters:
            text (str): The text to synthesize.
            model_id (str): The model ID to use.
            voice_id (str): The voice ID to use.
            stability (float): Stability setting for voice synthesis (0-1).
            similarity_boost (float): Similarity boost for the voice (0-1).
            style (int): Style parameter for the audio generation.
            use_speaker_boost (bool): Whether to enable speaker boost.
            previous_text (str, optional): Context from previous text.
            next_text (str, optional): Context for next text.
            language_code (str, optional): Language code for the text.
            seed (int, optional): Random seed for reproducibility.

        Returns:
            Union[bytes, Dict[str, Any]]: Audio data in MPEG format or error dict
        """
        url = f"{self.endpoint}/text-to-speech/{voice_id}"
        headers = self._get_headers(accept="audio/mpeg")
        
        payload = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
                "style": style,
                "use_speaker_boost": use_speaker_boost
            }
        }
        
        if previous_text:
            payload["previous_text"] = previous_text
        if next_text:
            payload["next_text"] = next_text
        if seed is not None:
            payload["seed"] = seed
        if language_code is not None:
            payload["language_code"] = language_code

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    response.raise_for_status()
                    return await response.read()
        except ClientError as e:
            return self._handle_error(e, "generating audio")

    async def validate_api_key(self) -> bool:
        """Validate if the API key is working"""
        try:
            response = await self.get_models()
            return not bool(response.get('error'))
        except Exception:
            return False