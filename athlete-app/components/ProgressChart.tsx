import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
                        Dados insuficientes{'\n'}Necessário pelo menos 2 avaliações
                    </Text>
                </View>
            </View>
        );
    }

    // Prepara dados para o gráfico (máximo 10 pontos para não ficar muito denso)
    const chartData = data.slice(0, 10).reverse();

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
            <View style={styles.chartContainer}>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: [{
                            data: values,
                            strokeWidth: 3,
                        }],
                    }}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#0A0A0B',
                        backgroundGradientFrom: 'rgba(255,255,255,0.03)',
                        backgroundGradientTo: 'rgba(255,255,255,0.03)',
                        decimalPlaces: decimalPlaces,
                        color: (opacity = 1) => color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.4})`,
                        style: {
                            borderRadius: 0,
                        },
                        propsForDots: {
                            r: '5',
                            strokeWidth: '2',
                            stroke: color,
                            fill: '#0A0A0B',
                        },
                        propsForBackgroundLines: {
                            strokeDasharray: '', // solid lines
                            stroke: 'rgba(255,255,255,0.05)',
                            strokeWidth: 1,
                        },
                    }}
                    bezier
                    style={styles.chart}
                    fromZero={false}
                    yAxisSuffix={suffix}
                    segments={4}
                />

                {/* Trend Indicator */}
                <View style={styles.trendContainer}>
                    {values[values.length - 1] < values[0] ? (
                        <>
                            <Text style={styles.trendDown}>↓</Text>
                            <Text style={styles.trendLabel}>
                                Redução: {(values[0] - values[values.length - 1]).toFixed(decimalPlaces)}{suffix}
                            </Text>
                        </>
                    ) : values[values.length - 1] > values[0] ? (
                        <>
                            <Text style={styles.trendUp}>↑</Text>
                            <Text style={styles.trendLabel}>
                                Aumento: {(values[values.length - 1] - values[0]).toFixed(decimalPlaces)}{suffix}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.trendNeutral}>→</Text>
                            <Text style={styles.trendLabel}>Estável</Text>
                        </>
                    )}
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
        color: '#D4FF00',
        fontSize: 12,
        fontWeight: '900',
        fontStyle: 'italic',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chartContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 0,
    },
    emptyChart: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '900',
        fontStyle: 'italic',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    trendUp: {
        color: '#FF4444',
        fontSize: 20,
        fontWeight: '900',
    },
    trendDown: {
        color: '#D4FF00',
        fontSize: 20,
        fontWeight: '900',
    },
    trendNeutral: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 20,
        fontWeight: '900',
    },
    trendLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: '900',
        fontStyle: 'italic',
    },
} as any);
