import { TooltipHost, Icon, DirectionalHint } from '@fluentui/react';

interface TooltipIconProps {
    content: string;
    directionalHint?: any; // Optional: Customize tooltip position
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ content, directionalHint }) => {
    return (
        <TooltipHost
            content={content}
            directionalHint={directionalHint || DirectionalHint.topCenter} // Default position
        >
            <Icon 
                iconName="Info" 
                styles={{ 
                    root: { 
                        fontSize: 12, // Standardized small icon
                        color: 'gray', // Soft gray color
                        marginLeft: 5, // Spacing from label
                        position: 'relative',
                        top: 1 // Adjust alignment with text
                    } 
                }} 
            />
        </TooltipHost>
    );
};

export default TooltipIcon;