import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
    unit?: string;
}

/**
 * Stat card component with trend indicators
 * Shows metrics with optional trend and icon
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    trend,
    trendValue,
    icon,
    unit,
}) => {
    const { brandColors } = useAuth();

    const getTrendColor = () => {
        if (trend === 'up') return '#4ADE80'; // Green
        if (trend === 'down') return '#F87171'; // Red
        return 'rgba(255,255,255,0.4)'; // Gray
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={14} color={getTrendColor()} />;
        if (trend === 'down') return <TrendingDown size={14} color={getTrendColor()} />;
        return <Minus size={14} color={getTrendColor()} />;
    };

    return (
        <View
            style={[
                styles.container,
                { borderColor: `${brandColors.primary}20` },
            ]}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}

            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>

                <View style={styles.valueRow}>
                    <Text style={styles.value}>
                        {value}
                        {unit && <Text style={styles.unit}>{unit}</Text>}
                    </Text>

                    {trend && (
                        <View style={styles.trendContainer}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderRadius: 4,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ skewX: '-2deg' }],
    },
    iconContainer: {
        marginRight: 12,
        transform: [{ skewX: '2deg' }],
    },
    content: {
        flex: 1,
        transform: [{ skewX: '2deg' }],
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    value: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
    },
    unit: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        marginLeft: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendValue: {
        fontSize: 12,
        fontWeight: '700',
    },
});
