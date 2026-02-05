import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onPress: () => void;
    };
}

/**
 * Empty state component for when lists/data are empty
 * Tactical HUD styled with optional action button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    const { brandColors } = useAuth();

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: `${brandColors.primary}10` },
                ]}
            >
                {icon}
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {action && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: brandColors.primary },
                    ]}
                    onPress={action.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            { color: brandColors.secondary },
                        ]}
                    >
                        {action.label}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        transform: [{ skewX: '-5deg' }],
        marginTop: 8,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: 1,
        transform: [{ skewX: '5deg' }],
    },
});
