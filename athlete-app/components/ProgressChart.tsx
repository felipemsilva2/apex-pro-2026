import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ProgressChartProps {
    data: {
        date: string;
        value: number;
    }[];
    title: string;
    color: string;
    suffix?: string;
    decimalPlaces?: number;
}

export function ProgressChart({ data, title, color, suffix = '', decimalPlaces = 1 }: ProgressChartProps) {
    // Se não há dados suficientes, mostra mensagem
    if (!data || data.length < 2) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.emptyChart}>
                    <Text style={styles.emptyText}>
                        Aguardando dados{'\n'}Mínimo de 2 check-ins necessário
                    </Text>
                </View>
            </View>
        );
    }

    // Prepara dados para o gráfico (máximo 10 pontos para não ficar muito denso)
    const chartData = [...data].slice(0, 10).reverse();

    const values = chartData.map(d => d.value);
    const labels = chartData.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const yAxisMin = Math.max(0, minValue - range * 0.1);
    const yAxisMax = maxValue + range * 0.1;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.chartWrapper}>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: [{
                            data: values,
                            strokeWidth: 3,
                        }],
                    }}
                    width={screenWidth - 40}
                    height={200}
                    chartConfig={{
                        backgroundColor: '#050505',
                        backgroundGradientFrom: 'rgba(255,255,255,0.01)',
                        backgroundGradientTo: 'rgba(255,255,255,0.01)',
                        decimalPlaces: decimalPlaces,
                        color: (opacity = 1) => color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.3})`,
                        style: {
                            borderRadius: 24,
                        },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: color,
                            fill: '#050505',
                        },
                        propsForBackgroundLines: {
                            strokeDasharray: '5, 5',
                            stroke: 'rgba(255,255,255,0.05)',
                            strokeWidth: 1,
                        },
                    }}
                    bezier
                    style={styles.chart}
                    fromZero={false}
                    yAxisSuffix={suffix}
                    segments={3}
                />

                {/* Trend Indicator (Bento Style) */}
                <View style={styles.trendContainer}>
                    <View style={styles.trendRow}>
                        <View style={[styles.trendBadge, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                            {values[values.length - 1] < values[0] ? (
                                <>
                                    <Text style={[styles.trendSymbol, { color: '#D4FF00' }]}>↓</Text>
                                    <Text style={styles.trendLabel}>
                                        VARIANDO: -{(values[0] - values[values.length - 1]).toFixed(decimalPlaces)}{suffix}
                                    </Text>
                                </>
                            ) : values[values.length - 1] > values[0] ? (
                                <>
                                    <Text style={[styles.trendSymbol, { color: '#FF4444' }]}>↑</Text>
                                    <Text style={styles.trendLabel}>
                                        VARIANDO: +{(values[values.length - 1] - values[0]).toFixed(decimalPlaces)}{suffix}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.trendSymbol, { color: 'rgba(255,255,255,0.3)' }]}>→</Text>
                                    <Text style={styles.trendLabel}>ESTÁVEL</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    chartWrapper: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        paddingTop: 16,
    },
    chart: {
        borderRadius: 24,
    },
    emptyChart: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '800',
        lineHeight: 18,
    },
    trendContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 8,
    },
    trendSymbol: {
        fontSize: 16,
        fontWeight: '900',
    },
    trendLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});
