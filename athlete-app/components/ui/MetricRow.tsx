import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface MetricRowProps {
    label: string;
    value: string;
    unit?: string;
    change?: number;
    previous?: string;
}

/**
 * Metric row component for displaying label:value pairs
 * Shows optional change indicator and previous value
 */
export const MetricRow: React.FC<MetricRowProps> = ({
    label,
    value,
    unit,
    change,
    previous,
}) => {
    const getChangeColor = () => {
        if (!change) return 'rgba(255,255,255,0.4)';
        if (change > 0) return '#4ADE80';
        if (change < 0) return '#F87171';
        return 'rgba(255,255,255,0.4)';
    };

    const getChangeIcon = () => {
        if (!change || change === 0)
            return <Minus size={12} color="rgba(255,255,255,0.4)" />;
        if (change > 0) return <TrendingUp size={12} color="#4ADE80" />;
        return <TrendingDown size={12} color="#F87171" />;
    };

    const formatChange = () => {
        if (!change) return '';
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.valueContainer}>
                {previous && (
                    <Text style={styles.previous}>
                        {previous}
                        {unit && <Text style={styles.unit}> {unit}</Text>}
                    </Text>
                )}

                <View style={styles.currentContainer}>
                    <Text style={styles.value}>
                        {value}
                        {unit && <Text style={styles.unit}> {unit}</Text>}
                    </Text>

                    {change !== undefined && change !== null && (
                        <View style={styles.changeContainer}>
                            {getChangeIcon()}
                            <Text style={[styles.change, { color: getChangeColor() }]}>
                                {formatChange()}
                                {unit}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        flex: 1,
    },
    valueContainer: {
        alignItems: 'flex-end',
        gap: 4,
    },
    previous: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.3)',
        textDecorationLine: 'line-through',
    },
    currentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    value: {
        fontSize: 15,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
    },
    unit: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    change: {
        fontSize: 11,
        fontWeight: '700',
    },
});
