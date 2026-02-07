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
 * Redesigned with a Premium Tactical HUD aesthetic
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
            {/* Background Decorative Element - Scanlines/Grid effect */}
            <View style={styles.backgroundDecoration}>
                <View style={[styles.gridLine, { backgroundColor: `${brandColors.primary}05`, height: 1, width: '100%', top: '25%' }]} />
                <View style={[styles.gridLine, { backgroundColor: `${brandColors.primary}05`, height: 1, width: '100%', top: '50%' }]} />
                <View style={[styles.gridLine, { backgroundColor: `${brandColors.primary}05`, height: 1, width: '100%', top: '75%' }]} />
            </View>

            {/* Tactical Icon Box */}
            <View style={styles.iconWrapper}>
                <View style={[styles.targetCorner, styles.topLeft, { borderColor: brandColors.primary }]} />
                <View style={[styles.targetCorner, styles.topRight, { borderColor: brandColors.primary }]} />
                <View style={[styles.targetCorner, styles.bottomLeft, { borderColor: brandColors.primary }]} />
                <View style={[styles.targetCorner, styles.bottomRight, { borderColor: brandColors.primary }]} />

                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: `${brandColors.primary}08`,
                            borderColor: `${brandColors.primary}20`,
                        }
                    ]}
                >
                    {icon}
                </View>
            </View>

            <View style={styles.textContainer}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: brandColors.primary }]} />
                    <Text style={[styles.statusLabel, { color: brandColors.primary }]}>AGUARDANDO DADOS</Text>
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            {action && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: brandColors.primary },
                    ]}
                    onPress={action.onPress}
                    activeOpacity={0.8}
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

            {/* Decorative bottom text */}
            {/* Removed Footer Code */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 80,
    },
    backgroundDecoration: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-around',
        opacity: 0.5,
    },
    gridLine: {
        position: 'absolute',
    },
    iconWrapper: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 4,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ skewX: '-8deg' }],
    },
    targetCorner: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderWidth: 2,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        transform: [{ skewX: '-10deg' }],
        borderRadius: 2,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        transform: [{ skewX: '10deg' }],
    },
    footerCode: {
        position: 'absolute',
        bottom: 20,
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: 2,
        fontFamily: 'monospace',
    }
});
