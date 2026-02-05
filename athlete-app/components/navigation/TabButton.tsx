import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

interface TabButtonProps {
    icon: LucideIcon;
    label: string;
    badge?: number;
    active: boolean;
    onPress: () => void;
}

/**
 * Individual tab button for custom bottom navigation
 * Tactical HUD styled with badges and active state
 */
export const TabButton: React.FC<TabButtonProps> = ({
    icon: Icon,
    label,
    badge,
    active,
    onPress,
}) => {
    const { brandColors } = useAuth();

    const iconColor = active ? brandColors.primary : 'rgba(255,255,255,0.4)';
    const textColor = active ? brandColors.primary : 'rgba(255,255,255,0.5)';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${label} tab`}
            accessibilityState={{ selected: active }}
        >
            <View style={styles.iconContainer}>
                <Icon size={24} color={iconColor} strokeWidth={active ? 2.5 : 2} />
                {badge !== undefined && badge > 0 && (
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: brandColors.primary },
                        ]}
                    >
                        <Text
                            style={[
                                styles.badgeText,
                                { color: brandColors.secondary },
                            ]}
                        >
                            {badge > 99 ? '99+' : badge}
                        </Text>
                    </View>
                )}
            </View>

            <Text
                style={[
                    styles.label,
                    { color: textColor },
                    active && styles.labelActive,
                ]}
            >
                {label}
            </Text>

            {active && (
                <View
                    style={[
                        styles.activeIndicator,
                        { backgroundColor: brandColors.primary },
                    ]}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        position: 'relative',
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -10,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    labelActive: {
        fontWeight: '900',
        fontStyle: 'italic',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 40,
        height: 2,
    },
});
