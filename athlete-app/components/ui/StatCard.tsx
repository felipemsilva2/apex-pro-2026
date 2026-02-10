import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
    unit?: string;
    brandColor?: string;
}

/**
 * Stat card component with Reacticx-inspired aesthetic
 * Clean, bento-style card with refined typography
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    trend,
    trendValue,
    icon,
    unit,
    brandColor = '#FFFFFF',
}) => {
    const getTrendColor = () => {
        if (trend === 'up') return '#4ADE80'; // Green
        if (trend === 'down') return '#F87171'; // Red
        return 'rgba(255,255,255,0.3)'; // Gray
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={12} color={getTrendColor()} />;
        if (trend === 'down') return <TrendingDown size={12} color={getTrendColor()} />;
        return <Minus size={12} color={getTrendColor()} />;
    };

    return (
        <View style={styles.container}>
            {/* Subtle Inner Glow */}
            <View style={[styles.innerGlow, { backgroundColor: brandColor }]} />

            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
            </View>

            <View style={styles.valueRow}>
                <Text style={styles.value}>
                    {value}
                    {unit && <Text style={styles.unit}>{unit}</Text>}
                </Text>

                {trend && (
                    <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor()}15` }]}>
                        {getTrendIcon()}
                        {trendValue && (
                            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
                                {trendValue}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)', // Slightly more visible for glass effect
        borderRadius: 24,
        padding: 20,
        flex: 1,
        overflow: 'hidden', // Contain the glow
    },
    innerGlow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.05,
        zIndex: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    iconContainer: {
        opacity: 0.5,
    },
    label: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-SemiBold' : 'Outfit_600SemiBold',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    value: {
        fontSize: 34,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    unit: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.3)',
        marginLeft: 4,
        marginBottom: 4,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    trendValue: {
        fontSize: 11,
        fontWeight: '800',
    },
});
