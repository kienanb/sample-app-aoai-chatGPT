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
    const [selectedModel, setSelectedModel] = useState<string | undefined>();

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

    const generateImages = async () => {
        setIsGenerating(true);
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
            if (result.image_url) {
                setImage(result.image_url); // Update the single image URL
            } else {
                console.error("Error: No image URL returned");
            }
        } catch (error) {
            console.error("Error generating image:", error);
        }
        setIsGenerating(false);
    };

    return (
        <Stack className={styles.container} tokens={{ childrenGap: 20 }}>
            <Stack horizontal tokens={{ childrenGap: 20 }} styles={{ root: { height: "100%" } }}>
                <Stack className={styles.textContainer} styles={{ root: { flex: 1 } }}>
                    <TextField
                        multiline
                        autoAdjustHeight={false}
                        value={prompt}
                        onChange={(_, newValue) => setPrompt(newValue || "")}
                        placeholder="Enter text to describe the image..."
                        styles={{
                            root: { height: "100%", flex: 1, display: "flex", flexDirection: "column" },
                            fieldGroup: { height: "100%", flex: 1, background: "transparent", border: "none" },
                            field: { height: "100%", padding: "10px" },
                        }}
                    />
                </Stack>
                <Stack
                    className={styles.settingsContainer}
                    styles={{ root: { flex: 1, padding: "10px" } }}
                    tokens={{ childrenGap: 10 }} // Add consistent spacing
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
                            { key: "vivid", text: "Vivid" },
                            { key: "natural", text: "Natural" },
                        ]}
                    />
                    <Dropdown
                        label="Quality"
                        selectedKey={quality}
                        onChange={(_, option) => option && setQuality(option.key as string)}
                        options={[
                            { key: "standard", text: "Standard" },
                            { key: "hd", text: "HD" },
                        ]}
                    />
                    {!isGenerating ? (
                        <DefaultButton
                            primary
                            text="Generate Image"
                            onClick={generateImages}
                            disabled={!prompt}
                        />
                    ) : (
                        <Spinner label="Generating image..." styles={{ root: { marginTop: "10px" } }} />
                    )}
                </Stack>

                <Stack className={styles.imageContainer} styles={{ root: { flex: 1 } }}>
                    {isGenerating ? (
                        <Spinner label="Generating image..." styles={{ root: { marginTop: "20px" } }} />
                    ) : image ? (
                        <div className={styles.generatedImageWrapper}>
                            <img src={image} alt="Generated" className={styles.generatedImage} />
                            <DefaultButton
                                href={image}
                                download="generated_image.png"
                                text="Download"
                                styles={{
                                    root: { backgroundColor: "transparent", border: "none" },
                                }}
                            />
                        </div>
                    ) : (
                        <div className={styles.placeholder}>Your generated image will appear here</div>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};

export default ImageGen;
