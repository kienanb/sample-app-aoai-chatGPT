import React, { useEffect, useState } from "react";
import {
    Stack,
    TextField,
    Dropdown,
    DefaultButton,
    Label,
    IDropdownOption,
    Spinner
} from "@fluentui/react";
import styles from "./ImageGen.module.css";

const ImageGen: React.FC = () => {
    const [prompt, setPrompt] = useState<string>("");
    const [size, setSize] = useState<string>("1024x1024");
    const [style, setStyle] = useState<string>("vivid");
    const [quality, setQuality] = useState<string>("standard");
    const [image, setImage] = useState<string | null>(null); // Single image URL
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [models, setModels] = useState<IDropdownOption[]>([]);
    const [selectedModel, setSelectedModel] = useState(models[0]?.key);
    const [error, setError] = useState<{ message: string; type: string } | null>(null);

    useEffect(() => {
        const fetchModel = async () => {
            try {
                const response = await fetch("/api/dalle/model");
                const result = await response.json();
                if (result.model_name) {
                    setModels([{ key: result.model_name, text: result.model_name }]);
                }
            } catch (error) {
                console.error("Error fetching model name:", error);
            }
        };
        fetchModel();
    }, []);

    useEffect(() => {
        // Ensure selectedModel is always set to the first option if models change
        if (models.length > 0 && !models.some(model => model.key === selectedModel)) {
            setSelectedModel(models[0].key);
        }
    }, [models]);

    const generateImages = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch("/api/dalle/generate-images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt,
                    size: size.toLowerCase(),
                    style: style.toLowerCase(),
                    quality: quality.toLowerCase(),
                    model: selectedModel,
                }),                
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                setError({
                    message: result.message || "An error occurred",
                    type: result.type || "general"
                });
                return;
            }
    
            if (result.image_url) {
                setImage(result.image_url);
            }
        } catch (error) {
            setError({
                message: "Failed to generate image. Please try again.",
                type: "general"
            });
            console.error("Error generating image:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Stack className={styles.container}>
            <Stack 
                horizontal 
                tokens={{ childrenGap: 20 }} 
                styles={{ 
                    root: { 
                        height: 'calc(100vh - 95px)',  // Account for container padding
                        position: 'relative'
                    } 
                }}
            >
                {/* Left Panel */}
                <Stack 
                    styles={{ 
                        root: { 
                            width: "33%", 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "20px",
                            height: "100%"
                        } 
                    }}
                >
                    {/* Text Container */}
                    <Stack.Item grow styles={{ root: { position: 'relative', height: '50%' } }}>
                        <div className={styles.textContainer}>
                            <TextField
                                multiline
                                autoAdjustHeight={false}
                                value={prompt}
                                onChange={(_, newValue) => setPrompt(newValue || "")}
                                placeholder="Enter text to describe the image..."
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
    
                    {/* Settings Container */}
                    <Stack.Item grow styles={{ root: { height: '50%' } }}>
                        <Stack
                            className={styles.settingsContainer}
                            tokens={{ childrenGap: 10 }}
                            styles={{
                                root: {
                                    height: '100%',
                                    padding: '10px',
                                    overflowY: 'auto'
                                }
                            }}
                        >
                            <Dropdown
                                label="Model"
                                options={models}
                                selectedKey={selectedModel}
                                onChange={(_, option) => option && setSelectedModel(option.key as string)}
                            />
                            <Dropdown
                                label="Size"
                                selectedKey={size}
                                onChange={(_, option) => option && setSize(option.key as string)}
                                options={[
                                    { key: "1024x1024", text: "1024x1024" },
                                    { key: "1792x1024", text: "1792x1024" },
                                    { key: "1024x1792", text: "1024x1792" },
                                ]}
                            />
                            <Dropdown
                                label="Style"
                                selectedKey={style}
                                onChange={(_, option) => option && setStyle(option.key as string)}
                                options={[
                                    { key: "vivid", text: "Vivid", title: "Vivid causes the model to lean towards generating hyper-real and dramatic images." },
                                    { key: "natural", text: "Natural", title: "Natural causes the model to produce more natural, less hyper-real looking images." },
                                ]}
                            />
                            <Dropdown
                                label="Quality"
                                selectedKey={quality}
                                onChange={(_, option) => option && setQuality(option.key as string)}
                                options={[
                                    { key: "standard", text: "Standard", title: "Standard creates images with less fine details and less consistency across the image. However, it is cheaper to run."},
                                    { key: "hd", text: "HD", title: "HD creates images with finer details and greater consistency across the image." },
                                ]}
                            />
                        </Stack>
                    </Stack.Item>
                    <Stack.Item styles={{ root: { height: '40px' } }}>
                        <DefaultButton
                            primary
                            text="Generate Image"
                            onClick={generateImages}
                            disabled={!prompt || isGenerating || !selectedModel}
                            styles={{
                                root: {
                                    width: '100%',
                                    height: '40px'
                                }
                            }}
                        />
                    </Stack.Item>
                </Stack>
    
                {/* Right Panel (Image Container) */}
                <Stack.Item grow styles={{ root: { height: '100%' } }}>
                    <Stack 
                        className={styles.imageContainer} 
                        styles={{ 
                            root: { 
                                height: '100%',
                                position: 'relative'
                            } 
                        }}
                    >
                        {isGenerating ? (
                            <Spinner label="Generating image..." styles={{ root: { marginTop: "20px" } }} />
                        ) : error ? (
                            <Stack tokens={{ childrenGap: 10 }} className={styles.errorContainer}>
                                <Label styles={{ root: { color: '#a4262c' } }}>
                                    Please try adjusting your prompt and try again.
                                </Label>
                            </Stack>
                        ) : image ? (
                            <div className={styles.generatedImageWrapper}>
                                <img src={image} alt="Generated" className={styles.generatedImage} />
                                <DefaultButton
                                    iconProps={{
                                        iconName: 'OpenInNewWindow',
                                        styles: { root: { color: 'inherit' } }
                                    }}
                                    styles={{
                                        root: { 
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            minWidth: '32px',
                                            padding: '10px'
                                        },
                                        rootHovered: {
                                            backgroundColor: '#f3f2f1'
                                        }
                                    }}
                                    onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = image; // Use the signed Azure Blob URL directly
                                        link.download = "generated_image.png"; // Suggest filename
                                        link.target = "_blank"; // Open in new tab to avoid issues
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                />

                            </div>
                        ) : (
                            <div className={styles.placeholder}>Your generated image will appear here</div>
                        )}
                    </Stack>
                </Stack.Item>
            </Stack>
        </Stack>
    );
};

export default ImageGen;
