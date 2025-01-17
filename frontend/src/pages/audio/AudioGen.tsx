import { useRef, useState, useEffect } from 'react'
import { 
    Stack,
    Slider,
    Toggle,
    TextField,
    DefaultButton,
    Dropdown,
    IDropdownOption,
    IStackTokens,
    IStackStyles,
    ITextFieldStyles,
    SpinButton,
    Label
} from '@fluentui/react'
import { ArrowDownload20Regular } from '@fluentui/react-icons'

import styles from './AudioGen.module.css'

// Types
interface Voice {
    voice_id: string;
    name: string;
}

interface Language {
    language_id: string;
    name: string;
}

interface Model {
    model_id: string;
    name: string;
    languages: Language[];
}

// Styles
const textFieldStyles: Partial<ITextFieldStyles> = {
    root: {
        flex: 1
    },
    field: {
        height: '100%',
        minHeight: '600px'
    }
};

const stackTokens: IStackTokens = {
    childrenGap: 15,
    padding: 10
};

const rightPanelStyles: IStackStyles = {
    root: {
        width: 320,
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        height: '600px',
        overflowY: 'auto'
    }
};

// Audio Player Component
const AudioPlayer: React.FC<{ audioUrl: string; onClose: () => void }> = ({ audioUrl, onClose }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    // Reset the audio player when audioUrl changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause(); // Stop any current playback
            audioRef.current.load(); // Reload the new audio source
        }
    }, [audioUrl]);

    if (!audioUrl) return null;

    return (
        <Stack
            className={styles.audioPlayer}
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            tokens={{ padding: 20 }}
        >
            <Stack.Item grow>
                <audio ref={audioRef} controls className={styles.audioControl}>
                    <source src={audioUrl} type="audio/mpeg" />
                </audio>
            </Stack.Item>
            <Stack.Item>
                <DefaultButton
                    href={audioUrl}
                    download="generated-speech.mp3"
                    iconProps={{
                        iconName: 'Download',
                        styles: { root: { color: 'inherit' } }
                    }}
                    styles={{
                        root: {
                            backgroundColor: 'transparent',
                            border: 'none',
                            minWidth: '32px',
                            padding: '6px'
                        },
                        rootHovered: {
                            backgroundColor: '#f3f2f1'
                        }
                    }}
                />
            </Stack.Item>
        </Stack>
    );
};


const AudioGen: React.FC = () => {
    const [text, setText] = useState('');
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [stability, setStability] = useState<number>(0.5);
    const [similarity, setSimilarity] = useState<number>(0.75);
    const [styleExaggeration, setStyleExaggeration] = useState<number>(0.3);
    const [speakerBoost, setSpeakerBoost] = useState<boolean>(true);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const showLanguageSelector = selectedModel === 'eleven_turbo_v2_5';

    useEffect(() => {
        fetchVoices();
        fetchModels();
    }, []);

    const fetchVoices = async () => {
        try {
            const response = await fetch('/api/voices');
            const data = await response.json();
            // Extract the voices array from the response
            setVoices(data.voices || []);
        } catch (error) {
            console.error('Error fetching voices:', error);
            setVoices([]);
        }
    };

    const fetchModels = async () => {
        try {
            const response = await fetch('/api/models');
            const data = await response.json();
            setModels(data);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const getLanguagesForModel = (modelId: string) => {
        const model = models.find(m => m.model_id === modelId);
        return model?.languages || [];
    };

    const handleModelChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (option) {
            const modelId = option.key as string;
            setSelectedModel(modelId);
            const languages = getLanguagesForModel(modelId);
            if (!languages.find(lang => lang.language_id === selectedLanguage)) {
                setSelectedLanguage('');
            }
        }
    };

    const generateSpeech = async () => {
        if (!text || !selectedVoice || !selectedModel) return;
    
        setIsGenerating(true);
        try {
            const payload: any = {
                text,
                voice_id: selectedVoice,
                model_id: selectedModel,
                stability,
                similarity_boost: similarity,
                style: styleExaggeration,
                use_speaker_boost: speakerBoost,
            };
    
            // Only add language_code if using the turbo model
            if (selectedModel === 'eleven_turbo_v2_5' && selectedLanguage) {
                payload.language_code = selectedLanguage;
            }
    
            const response = await fetch('/api/generate-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error generating speech:', error);
        }
        setIsGenerating(false);
    };

    return (
        <Stack className={styles.container} tokens={stackTokens}>
            <Stack horizontal tokens={{ childrenGap: 20 }}>
                {/* Left Column - Text Input */}
                <Stack.Item grow>
                    <div className={styles.roundedContainer}>
                        <TextField
                            multiline
                            autoAdjustHeight={false} // Disable auto-height to let the container control the height
                            value={text}
                            onChange={(_, newValue) => setText(newValue || '')}
                            placeholder="Enter text to convert to speech..."
                            styles={{
                                root: { height: '100%', border: 'none', boxShadow: 'none' },
                                fieldGroup: { background: 'transparent', border: 'none', height: '100%' },
                                field: { height: '100%', padding: '10px' },
                            }}
                        />
                    </div>
                </Stack.Item>


                {/* Right Column - Settings */}
                <Stack styles={rightPanelStyles} tokens={stackTokens}>
                    <Dropdown
                        label="Model"
                        selectedKey={selectedModel}
                        onChange={handleModelChange}
                        options={models.map(model => ({
                            key: model.model_id,
                            text: model.name
                        }))}
                        placeholder="Select Model"
                    />

                    {selectedModel && showLanguageSelector && (
                        <Dropdown
                            label="Language"
                            selectedKey={selectedLanguage}
                            onChange={(_, option) => option && setSelectedLanguage(option.key as string)}
                            options={getLanguagesForModel(selectedModel).map(lang => ({
                                key: lang.language_id,
                                text: lang.name
                            }))}
                            placeholder="Select Language"
                        />
                    )}

                    <Dropdown
                        label="Voice"
                        selectedKey={selectedVoice}
                        onChange={(_, option) => option && setSelectedVoice(option.key as string)}
                        options={voices.map(voice => ({
                            key: voice.voice_id,
                            text: voice.name
                        }))}
                        placeholder="Select Voice"
                    />

                    <Stack tokens={{ childrenGap: 10 }}>
                        <Label>Stability ({(stability * 100).toFixed(0)}%)</Label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={stability}
                            onChange={value => setStability(value)}
                        />

                        <Label>Similarity ({(similarity * 100).toFixed(0)}%)</Label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={similarity}
                            onChange={value => setSimilarity(value)}
                        />

                        <Label>Style Exaggeration ({(styleExaggeration * 100).toFixed(0)}%)</Label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={styleExaggeration}
                            onChange={value => setStyleExaggeration(value)}
                        />

                        <Toggle
                            label="Speaker boost"
                            checked={speakerBoost}
                            onChange={(_, checked) => setSpeakerBoost(checked || false)}
                        />
                    </Stack>
                </Stack>
            </Stack>

            {/* Bottom Controls */}
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <span className={styles.characterCount}>
                    {text.length} / 5,000 characters
                </span>
                <DefaultButton
                    primary
                    text={isGenerating ? 'Generating...' : 'Generate speech'}
                    onClick={generateSpeech}
                    disabled={isGenerating || !text || !selectedVoice || !selectedModel}
                />
            </Stack>

            {/* Audio Player */}
            {audioUrl && (
                <AudioPlayer 
                    audioUrl={audioUrl} 
                    onClose={() => setAudioUrl('')} 
                />
            )}
        </Stack>
    );
};

export default AudioGen;