import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

/**
 * Loading spinner with tactical HUD styling
 * Uses tenant brand color
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message,
}) => {
    const { brandColors } = useAuth();

    const getSize = () => {
        if (size === 'small') return 24;
        if (size === 'large') return 48;
        return 32;
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size={getSize()} color={brandColors.primary} />
            {message && (
                <Text style={styles.message}>{message}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    message: {
        marginTop: 16,
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
