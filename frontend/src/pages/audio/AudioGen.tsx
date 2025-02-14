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
    Label,
    TooltipHost,
    DirectionalHint,
    Icon
} from '@fluentui/react'

import styles from './AudioGen.module.css'
import TooltipIcon from '../../components/common/TooltipIcon'

// Types
interface Voice {
    voice_id: string;
    name: string;
    category?: string; // Optional in case some voices lack it
    labels?: Record<string, string>; // Dictionary for label values
    description?: string; // Optional
}


interface Language {
    language_id: string;
    name: string;
}

interface Model {
    model_id: string;
    name: string;
    description: string;
    languages: Language[];
}

const stackTokens: IStackTokens = {
    childrenGap: 15,
    padding: 10
};

const rightPanelStyles: IStackStyles = {
    root: {
        width: "340px",
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        height: '100%',
        overflow: 'auto'
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
    const [styleExaggeration, setStyleExaggeration] = useState<number>(0.0);
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
    
            setVoices(data.voices.map((voice: Voice) => ({
                ...voice, 
                category: voice.category || '', // Default to empty string
                labels: voice.labels || {}, // Default to empty object
                description: voice.description || '' // Default to empty string
            })));
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
            <Stack 
                horizontal 
                styles={{ 
                    root: { 
                        height: 'calc(100vh - 319px)', 
                        width: '100%',
                        position: 'relative'
                    } 
                }} 
                tokens={{ childrenGap: 20 }}
            >
                {/* Left Column - Text Input */}
                <Stack.Item grow styles={{ root: { height: '100%' } }}>
                    <div className={styles.roundedContainer}>
                        <TextField
                            multiline
                            autoAdjustHeight={false}
                            value={text}
                            onChange={(_, newValue) => setText(newValue || '')}
                            placeholder="Enter text to convert to speech..."
                            styles={{
                                root: { 
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0
                                },
                                wrapper: {
                                    height: '100%'
                                },
                                fieldGroup: {
                                    height: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    selectors: {
                                        ':after': {
                                            border: 'none'
                                        }
                                    }
                                },
                                field: {
                                    height: '100%',
                                    padding: '10px',
                                    resize: 'none',
                                    overflow: 'auto'
                                }
                            }}
                        />
                    </div>
                </Stack.Item>

                {/* Right Column - Settings */}
                <Stack styles={rightPanelStyles} tokens={stackTokens}>
                    <Stack horizontal verticalAlign="center">
                        <Label>Model</Label>
                        <TooltipIcon content="Select a model for voice generation. Hover over each option for more details." />
                    </Stack>

                    <Dropdown
                        label={undefined} // Hide default label since we manually created one
                        selectedKey={selectedModel}
                        onChange={handleModelChange}
                        options={models.map(model => ({
                            key: model.model_id,
                            text: model.name,
                            data: model // Store full model object for tooltip rendering
                        }))}
                        placeholder="Select Model"
                        onRenderOption={(option) => {
                            if (!option?.data) return <span>{option?.text}</span>;
                        
                            const voice = option.data as Voice;
                            const { category, labels, description } = voice;
                        
                            // Build tooltip content dynamically, ensuring non-null values are displayed
                            const tooltipParts = [
                                category ? `<strong>${category.toUpperCase()}</strong>` : null, // Bold uppercase category
                                labels && Object.values(labels).length ? `<em>${Object.values(labels).join(', ')}</em>` : null, // Italicized labels
                                description ? `<span style="font-size: 12px">${description}</span>` : null // Smaller font description
                            ].filter(Boolean); // Remove null values
                        
                            // Ensure tooltip always has content
                            const tooltipContent = tooltipParts.length > 0 
                                ? tooltipParts.join('<br/>') 
                                : 'No additional details available'; // Fallback text if all fields are null
                        
                            return (
                                <TooltipHost
                                    content={<span dangerouslySetInnerHTML={{ __html: tooltipContent }} />}
                                    directionalHint={DirectionalHint.rightCenter}
                                >
                                    <span>{option.text}</span>
                                </TooltipHost>
                            );
                        }}
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

                    <Stack horizontal verticalAlign="center">
                        <Label>Voice</Label>
                        <TooltipIcon content="Select a voice model. Voice models dictate the style of the voice. Hover over each option for more details." />
                    </Stack>

                    <Dropdown
                        label={undefined} // Hide the default label since we manually created one
                        selectedKey={selectedVoice}
                        onChange={(_, option) => option && setSelectedVoice(option.key as string)}
                        options={voices.map((voice) => ({
                            key: voice.voice_id,
                            text: voice.name,
                            data: voice as Voice
                        }))}
                        placeholder="Select Voice"
                        onRenderOption={(option) => {
                            if (!option?.data) return <span>{option?.text}</span>;
                        
                            const voice = option.data as Voice;
                            const { category, labels, description } = voice;
                        
                            const tooltipContent = [
                                category ? `<strong>${category.toUpperCase()}</strong>` : null, // Bold
                                labels && Object.values(labels).length ? `<em>${Object.values(labels).join(', ')}</em>` : null, // Italic
                                description ? `<span style="font-size: 12px">${description}</span>` : null // Smaller text
                            ].filter(Boolean).join('<br/>'); // Ensure valid formatting
                        
                            return (
                                <TooltipHost
                                    content={<span dangerouslySetInnerHTML={{ __html: tooltipContent }} />} // Renders formatted HTML
                                    directionalHint={DirectionalHint.rightCenter}
                                >
                                    <span>{option.text}</span>
                                </TooltipHost>
                            );
                        }}
                    />


                    <Stack tokens={{ childrenGap: 10 }}>
                        {/* Stability */}
                        <Stack horizontal verticalAlign="center">
                            <Label>Stability</Label>
                            <TooltipIcon content="The stability slider determines how stable the voice is and the randomness between each generation. Lowering this slider introduces a broader emotional range for the voice. Setting the slider too low may result in odd performances that are overly random and cause the character to speak too quickly. On the other hand, setting it too high can lead to a monotonous voice with limited emotion." />
                        </Stack>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={stability}
                            onChange={value => setStability(value)}
                        />

                        {/* Similarity */}
                        <Stack horizontal verticalAlign="center">
                            <Label>Similarity</Label>
                            <TooltipIcon content="The similarity slider dictates how closely the AI should adhere to the original voice when attempting to replicate it." />
                        </Stack>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={similarity}
                            onChange={value => setSimilarity(value)}
                        />

                        {/* Style Exaggeration */}
                        <Stack horizontal verticalAlign="center">
                            <Label>Style Exaggeration</Label>
                            <TooltipIcon content="The style exaggeration slider attempts to amplify the style of the original speaker. It’s important to note that using this setting has shown to make the model slightly less stable, as it strives to emphasize and imitate the style of the original voice. For most use cases, it is suggested to set the slider to 0." />
                        </Stack>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={styleExaggeration}
                            onChange={value => setStyleExaggeration(value)}
                        />

                        {/* Speaker Boost */}
                        <Stack horizontal verticalAlign="center">
                            <Label>Speaker Boost</Label>
                            <TooltipIcon content="This setting boosts the similarity to the original speaker. However, using this setting requires a slightly higher computational load, which in turn increases latency. The differences introduced by this setting are generally rather subtle." />
                        </Stack>
                        <Toggle
                            label=""
                            checked={speakerBoost}
                            onChange={(_, checked) => setSpeakerBoost(checked || false)}
                        />
                    </Stack>
                </Stack>
            </Stack>

            {/* Bottom Controls */}
            <Stack
                horizontal
                horizontalAlign="space-between"
                verticalAlign="center"
                styles={{
                    root: {
                        marginTop: '20px'
                    }
                }}
            >
                <Stack.Item>
                    <span className={styles.characterCount}>
                        {text.length} / 5,000 characters
                    </span>
                </Stack.Item>
                <Stack.Item>
                    <DefaultButton
                        primary
                        text={isGenerating ? 'Generating...' : 'Generate speech'}
                        onClick={generateSpeech}
                        disabled={isGenerating || !text || !selectedVoice || !selectedModel}
                        styles={{
                            root: {
                                width: '340px'
                            }
                        }}
                    />
                </Stack.Item>
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