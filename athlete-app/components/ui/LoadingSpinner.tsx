import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

/**
 * Loading spinner redesigned as a "Tactical Scan"
 * Uses tenant brand color for a premium Apex experience
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message,
}) => {
    const { brandColors } = useAuth();
    const scanAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Scanner Up/Down animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(scanAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Subtle rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const getSize = () => {
        if (size === 'small') return 60;
        if (size === 'large') return 120;
        return 90;
    };

    const spinnerSize = getSize();

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const translateY = scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, spinnerSize - 4],
    });

    return (
        <View style={styles.container}>
            <View style={[styles.scannerWrapper, { width: spinnerSize, height: spinnerSize }]}>
                {/* Decorative Corners */}
                <View style={[styles.corner, styles.tl, { borderColor: brandColors.primary }]} />
                <View style={[styles.corner, styles.tr, { borderColor: brandColors.primary }]} />
                <View style={[styles.corner, styles.bl, { borderColor: brandColors.primary }]} />
                <View style={[styles.corner, styles.br, { borderColor: brandColors.primary }]} />

                {/* Rotating Element */}
                <Animated.View
                    style={[
                        styles.rotatingCircle,
                        {
                            width: spinnerSize - 20,
                            height: spinnerSize - 20,
                            borderColor: `${brandColors.primary}30`,
                            transform: [{ rotate: spin }]
                        }
                    ]}
                >
                    <View style={[styles.dot, { backgroundColor: brandColors.primary, top: -4 }]} />
                </Animated.View>

                {/* Scanning Vertical Line */}
                <Animated.View
                    style={[
                        styles.scanLine,
                        {
                            width: spinnerSize - 10,
                            backgroundColor: brandColors.primary,
                            transform: [{ translateY }],
                            shadowColor: brandColors.primary,
                            shadowOpacity: 0.8,
                            shadowRadius: 10,
                            elevation: 5,
                        }
                    ]}
                />
            </View>

            {message && (
                <View style={styles.messageRow}>
                    <Text style={[styles.message, { color: 'rgba(255,255,255,0.6)' }]}>
                        {message}
                    </Text>
                    <Text style={[styles.loadingDots, { color: brandColors.primary }]}>...</Text>
                </View>
            )}

            {/* Removed System Tag */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#0A0A0B',
    },
    scannerWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 4,
    },
    corner: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderWidth: 1.5,
    },
    tl: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
    rotatingCircle: {
        borderRadius: 1000,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    scanLine: {
        position: 'absolute',
        top: 2,
        height: 1.5,
        borderRadius: 1,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        gap: 4,
    },
    message: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontStyle: 'italic',
    },
    loadingDots: {
        fontSize: 14,
        fontWeight: '900',
    },
    systemTag: {
        fontSize: 8,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: 1.5,
        marginTop: 12,
        fontFamily: 'monospace',
    }
});
