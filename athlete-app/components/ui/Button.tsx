import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp,
    Platform
} from 'react-native';
import { getVisibleColor } from '../../lib/whitelabel';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    brandColors: {
        primary: string;
        secondary: string;
    };
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
    brandColors,
}) => {
    const visiblePrimary = getVisibleColor(brandColors.primary);
    const isDark = variant === 'primary';

    const buttonStyles = [
        styles.base,
        styles[size],
        variant === 'primary' && { backgroundColor: brandColors.primary },
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && [styles.outline, { borderColor: `${visiblePrimary}40` }],
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        style,
    ];

    const titleStyles = [
        styles.text,
        styles[`${size}Text`],
        variant === 'primary' && { color: brandColors.secondary },
        (variant === 'secondary' || variant === 'outline' || variant === 'ghost') && { color: visiblePrimary },
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={buttonStyles}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{
                disabled: disabled || loading,
                busy: loading
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            {loading ? (
                <ActivityIndicator
                    color={isDark ? brandColors.secondary : visiblePrimary}
                    size="small"
                    accessibilityLabel="Carregando"
                />
            ) : (
                <>
                    {icon && <React.Fragment>{icon}</React.Fragment>}
                    <Text style={titleStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        gap: 8,
    },
    sm: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    md: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    lg: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    secondary: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    smText: {
        fontSize: 12,
    },
    mdText: {
        fontSize: 14,
    },
    lgText: {
        fontSize: 16,
    },
    disabledText: {
        color: 'rgba(255,255,255,0.3)',
    },
});
