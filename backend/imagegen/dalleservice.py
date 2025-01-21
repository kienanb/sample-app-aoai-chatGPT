import aiohttp
from typing import Optional, Dict, Any, Union
from backend.settings import app_settings
from aiohttp import ClientError

class DalleError(Exception):
    """Custom exception for Dalle API errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class DalleClient:
    def __init__(self):
        if not app_settings.dalle.key:
            raise ValueError("DALL-E API key not configured")
        self.api_key = app_settings.dalle.key
        self.endpoint = (app_settings.dalle.endpoint or "https://api.openai.com/v1").rstrip('/')
        self.generation_model_name = app_settings.dalle.generation_model_name

    def _get_headers(self, content_type: str = "application/json", accept: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": content_type,
        }
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

    async def generate_images(
        self,
        prompt: str,
        size: str,
        quality: Optional[str] = None,
        style: Optional[str] = None,
        image_count: int = 1
    ) -> Union[bytes, Dict[str, Any]]:
        url = f"{self.endpoint}/images/generations"
        headers = self._get_headers()
        
        payload = {
            "prompt": prompt,
            "model": self.generation_model_name,
            "n" : image_count,
            "size" : size
        }

        if quality:
            payload['quality'] = quality
        if style:
            payload['style'] = style

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    response.raise_for_status()
                    return await response.json()
        except ClientError as e:
            return self._handle_error(e, "generating image")