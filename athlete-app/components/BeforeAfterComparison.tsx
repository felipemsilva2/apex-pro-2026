import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

interface BeforeAfterComparisonProps {
    firstAssessment: any;
    latestAssessment: any;
}

export function BeforeAfterComparison({ firstAssessment, latestAssessment }: BeforeAfterComparisonProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Transformação</Text>

            <View style={styles.comparisonRow}>
                {/* Before */}
                <View style={styles.comparisonCard}>
                    <Text style={styles.cardLabel}>Início</Text>
                    <Text style={styles.cardDate}>{formatDate(firstAssessment.assessment_date)}</Text>

                    <View style={styles.metricsContainer}>
                        {firstAssessment.weight_kg && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>Peso</Text>
                                <Text style={styles.metricValue}>{firstAssessment.weight_kg.toFixed(1)} kg</Text>
                            </View>
                        )}
                        {firstAssessment.body_fat_percentage && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>Gordura</Text>
                                <Text style={styles.metricValue}>{firstAssessment.body_fat_percentage.toFixed(1)}%</Text>
                            </View>
                        )}
                        {firstAssessment.lean_mass_kg && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>M. Magra</Text>
                                <Text style={styles.metricValue}>{firstAssessment.lean_mass_kg.toFixed(1)} kg</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                    <ArrowRight size={24} color="#D4FF00" />
                </View>

                {/* After */}
                <View style={styles.comparisonCard}>
                    <Text style={styles.cardLabel}>Atual</Text>
                    <Text style={styles.cardDate}>{formatDate(latestAssessment.assessment_date)}</Text>

                    <View style={styles.metricsContainer}>
                        {latestAssessment.weight_kg && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>Peso</Text>
                                <Text style={styles.metricValue}>{latestAssessment.weight_kg.toFixed(1)} kg</Text>
                            </View>
                        )}
                        {latestAssessment.body_fat_percentage && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>Gordura</Text>
                                <Text style={styles.metricValue}>{latestAssessment.body_fat_percentage.toFixed(1)}%</Text>
                            </View>
                        )}
                        {latestAssessment.lean_mass_kg && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>M. Magra</Text>
                                <Text style={styles.metricValue}>{latestAssessment.lean_mass_kg.toFixed(1)} kg</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Measurements Comparison */}
            {(firstAssessment.waist_cm || latestAssessment.waist_cm) && (
                <View style={styles.measurementsComparison}>
                    <Text style={styles.measurementsTitle}>Medidas Comparativas</Text>
                    <View style={styles.measurementsList}>
                        {firstAssessment.waist_cm && latestAssessment.waist_cm && (
                            <View style={styles.measurementRow}>
                                <Text style={styles.measurementName}>Cintura</Text>
                                <Text style={styles.measurementBefore}>{firstAssessment.waist_cm.toFixed(1)}</Text>
                                <ArrowRight size={12} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.measurementAfter}>{latestAssessment.waist_cm.toFixed(1)} cm</Text>
                                <Text style={[
                                    styles.measurementDiff,
                                    latestAssessment.waist_cm < firstAssessment.waist_cm ? styles.diffPositive : styles.diffNegative
                                ]}>
                                    {(latestAssessment.waist_cm - firstAssessment.waist_cm).toFixed(1)}
                                </Text>
                            </View>
                        )}
                        {firstAssessment.hip_cm && latestAssessment.hip_cm && (
                            <View style={styles.measurementRow}>
                                <Text style={styles.measurementName}>Quadril</Text>
                                <Text style={styles.measurementBefore}>{firstAssessment.hip_cm.toFixed(1)}</Text>
                                <ArrowRight size={12} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.measurementAfter}>{latestAssessment.hip_cm.toFixed(1)} cm</Text>
                                <Text style={[
                                    styles.measurementDiff,
                                    latestAssessment.hip_cm < firstAssessment.hip_cm ? styles.diffPositive : styles.diffNegative
                                ]}>
                                    {(latestAssessment.hip_cm - firstAssessment.hip_cm).toFixed(1)}
                                </Text>
                            </View>
                        )}
                        {firstAssessment.arm_cm && latestAssessment.arm_cm && (
                            <View style={styles.measurementRow}>
                                <Text style={styles.measurementName}>Braço</Text>
                                <Text style={styles.measurementBefore}>{firstAssessment.arm_cm.toFixed(1)}</Text>
                                <ArrowRight size={12} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.measurementAfter}>{latestAssessment.arm_cm.toFixed(1)} cm</Text>
                                <Text style={[
                                    styles.measurementDiff,
                                    latestAssessment.arm_cm > firstAssessment.arm_cm ? styles.diffPositive : styles.diffNegative
                                ]}>
                                    {(latestAssessment.arm_cm - firstAssessment.arm_cm).toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#D4FF00',
        fontSize: 12,
        fontWeight: '900',
        fontStyle: 'italic',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    comparisonCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
    },
    cardLabel: {
        color: '#D4FF00',
        fontSize: 9,
        fontWeight: '900',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    cardDate: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        marginBottom: 12,
    },
    metricsContainer: {
        gap: 8,
    },
    metric: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    metricLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '900',
    },
    metricValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    arrowContainer: {
        opacity: 0.6,
    },
    measurementsComparison: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
    },
    measurementsTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    measurementsList: {
        gap: 10,
    },
    measurementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    measurementName: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '900',
        width: 60,
    },
    measurementBefore: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
    },
    measurementAfter: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '900',
    },
    measurementDiff: {
        fontSize: 10,
        fontWeight: '900',
        marginLeft: 'auto',
    },
    diffPositive: {
        color: '#D4FF00',
    },
    diffNegative: {
        color: '#FF4444',
    },
} as any);
