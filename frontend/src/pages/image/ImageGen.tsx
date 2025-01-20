import React, { useState } from "react";
import {
    Stack,
    TextField,
    Dropdown,
    DefaultButton,
    Label,
    IDropdownOption,
} from "@fluentui/react";
import styles from "./ImageGen.module.css";

const ImageGen: React.FC = () => {
    const [prompt, setPrompt] = useState<string>("");
    const [size, setSize] = useState<string>("1024x1024");
    const [style, setStyle] = useState<string>("vivid");
    const [quality, setQuality] = useState<string>("standard");
    const [image, setImage] = useState<string | null>(null); // Single image URL
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

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
            <Stack horizontal tokens={{ childrenGap: 20 }}>
                {/* Left Column */}
                <Stack.Item grow>
                    <Stack horizontal tokens={{ childrenGap: 20 }} className={styles.leftPanel}>
                        {/* Text Container */}
                        <Stack className={styles.textContainer}>
                            <TextField
                                multiline
                                autoAdjustHeight={false}
                                value={prompt}
                                onChange={(_, newValue) => setPrompt(newValue || "")}
                                placeholder="Enter text to describe the image..."
                                styles={{
                                    root: { height: "100%", border: "none", boxShadow: "none" },
                                    fieldGroup: { height: "100%", background: "transparent", border: "none" },
                                    field: { height: "100%", padding: "10px" },
                                }}
                            />
                        </Stack>
                        {/* Settings Container */}
                        <Stack className={styles.settingsContainer}>
                            <Dropdown
                                label="Model"
                                options={[{ key: "dalle_v1", text: "DALL-E v1" }]}
                                selectedKey="dalle_v1"
                                disabled
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
                            <DefaultButton
                                primary
                                text={isGenerating ? "Generating..." : "Generate Image"}
                                onClick={generateImages}
                                disabled={isGenerating || !prompt}
                            />
                        </Stack>
                    </Stack>
                </Stack.Item>

                {/* Right Column */}
                <Stack.Item grow>
                    <Stack className={styles.imageContainer}>
                        {image ? (
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
                </Stack.Item>
            </Stack>
        </Stack>
    );
};

export default ImageGen;
