import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface ContainerProps {
    variant?: 'page' | 'card' | 'section';
    seamless?: boolean; // If true, removes horizontal padding for edge-to-edge content
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

/**
 * Container component with tactical HUD styling
 * Supports different variants for pages, cards, and sections
 */
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Container: React.FC<ContainerProps> = ({
    variant = 'page',
    seamless = false,
    children,
    style,
}) => {
    const { brandColors } = useAuth();
    const insets = useSafeAreaInsets();

    const containerStyle: any = [
        styles.base,
        variant === 'page' && [
            styles.page,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
            seamless && { paddingHorizontal: 0 }
        ],
        variant === 'card' && [styles.card, { borderColor: `${brandColors.primary}20` }],
        variant === 'section' && styles.section,
        style,
    ];

    return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    base: {
        width: '100%',
    },
    page: {
        flex: 1,
        backgroundColor: '#0A0A0B',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderRadius: 4,
        padding: 16,
        marginBottom: 12,
    },
    section: {
        marginBottom: 24,
    },
});
