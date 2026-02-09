import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
            <Text style={styles.sectionTitle}>Transformação Estratégica</Text>

            <View style={styles.comparisonRow}>
                {/* Before */}
                <View style={styles.comparisonCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>INÍCIO</Text>
                        <Text style={styles.cardDate}>{formatDate(firstAssessment.assessment_date)}</Text>
                    </View>

                    <View style={styles.metricsContainer}>
                        {firstAssessment.weight_kg && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>PESO</Text>
                                <Text style={styles.metricValue}>{firstAssessment.weight_kg.toFixed(1)}kg</Text>
                            </View>
                        )}
                        {firstAssessment.body_fat_percentage && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>GORDURA</Text>
                                <Text style={styles.metricValue}>{firstAssessment.body_fat_percentage.toFixed(1)}%</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Arrow Bento */}
                <View style={styles.arrowWrapper}>
                    <ArrowRight size={20} color="rgba(255,255,255,0.2)" />
                </View>

                {/* After */}
                <View style={[styles.comparisonCard, { borderColor: 'rgba(212, 255, 0, 0.2)' }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardLabel, { color: '#D4FF00' }]}>ATUAL</Text>
                        <Text style={styles.cardDate}>{formatDate(latestAssessment.assessment_date)}</Text>
                    </View>

                    <View style={styles.metricsContainer}>
                        {latestAssessment.weight_kg && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>PESO</Text>
                                <Text style={styles.metricValue}>{latestAssessment.weight_kg.toFixed(1)}kg</Text>
                            </View>
                        )}
                        {latestAssessment.body_fat_percentage && (
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>GORDURA</Text>
                                <Text style={styles.metricValue}>{latestAssessment.body_fat_percentage.toFixed(1)}%</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Measurements Comparison Bento */}
            {(firstAssessment.waist_cm || latestAssessment.waist_cm) && (
                <View style={styles.measurementsBox}>
                    <Text style={styles.measurementsTitle}>MEDIDAS COMPARATIVAS</Text>
                    <View style={styles.measurementsList}>
                        {firstAssessment.waist_cm && latestAssessment.waist_cm && (
                            <View style={styles.measurementRow}>
                                <Text style={styles.measurementName}>Cintura</Text>
                                <View style={styles.measureFlow}>
                                    <Text style={styles.measureBefore}>{firstAssessment.waist_cm.toFixed(1)}</Text>
                                    <ArrowRight size={10} color="rgba(255,255,255,0.1)" />
                                    <Text style={styles.measureAfter}>{latestAssessment.waist_cm.toFixed(1)}cm</Text>
                                </View>
                                <View style={[
                                    styles.diffBadge,
                                    { backgroundColor: latestAssessment.waist_cm < firstAssessment.waist_cm ? 'rgba(212, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)' }
                                ]}>
                                    <Text style={[
                                        styles.diffText,
                                        { color: latestAssessment.waist_cm < firstAssessment.waist_cm ? '#D4FF00' : '#FF4444' }
                                    ]}>
                                        {(latestAssessment.waist_cm - firstAssessment.waist_cm).toFixed(1)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {firstAssessment.hip_cm && latestAssessment.hip_cm && (
                            <View style={styles.measurementRow}>
                                <Text style={styles.measurementName}>Quadril</Text>
                                <View style={styles.measureFlow}>
                                    <Text style={styles.measureBefore}>{firstAssessment.hip_cm.toFixed(1)}</Text>
                                    <ArrowRight size={10} color="rgba(255,255,255,0.1)" />
                                    <Text style={styles.measureAfter}>{latestAssessment.hip_cm.toFixed(1)}cm</Text>
                                </View>
                                <View style={[
                                    styles.diffBadge,
                                    { backgroundColor: latestAssessment.hip_cm < firstAssessment.hip_cm ? 'rgba(212, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)' }
                                ]}>
                                    <Text style={[
                                        styles.diffText,
                                        { color: latestAssessment.hip_cm < firstAssessment.hip_cm ? '#D4FF00' : '#FF4444' }
                                    ]}>
                                        {(latestAssessment.hip_cm - firstAssessment.hip_cm).toFixed(1)}
                                    </Text>
                                </View>
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
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    comparisonCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
    },
    metricsContainer: {
        gap: 8,
    },
    metric: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.25)',
    },
    metricValue: {
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
    },
    arrowWrapper: {
        opacity: 0.5,
    },
    measurementsBox: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    measurementsTitle: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    measurementsList: {
        gap: 12,
    },
    measurementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    measurementName: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        width: 70,
    },
    measureFlow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    measureBefore: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.2)',
    },
    measureAfter: {
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
    },
    diffBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        minWidth: 40,
        alignItems: 'center',
    },
    diffText: {
        fontSize: 10,
        fontWeight: '900',
    }
});
