import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scale, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react-native';
import React, { useState } from 'react';

interface AssessmentCardProps {
    assessment: {
        id: string;
        assessment_date: string;
        weight_kg: number | null;
        body_fat_percentage: number | null;
        lean_mass_kg: number | null;
        fat_mass_kg: number | null;
        bmi: number | null;
        waist_cm: number | null;
        hip_cm: number | null;
        arm_cm: number | null;
        thigh_cm: number | null;
        chest_cm: number | null;
        waist_hip_ratio: number | null;
        notes: string | null;
        target_weight_kg: number | null;
        target_body_fat_percentage: number | null;
    };
    previousAssessment?: {
        weight_kg: number | null;
        body_fat_percentage: number | null;
    } | null;
}

export function AssessmentCard({ assessment, previousAssessment }: AssessmentCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Calculate weight difference
    const weightDiff = previousAssessment?.weight_kg
        ? (assessment.weight_kg || 0) - previousAssessment.weight_kg
        : null;

    // Calculate body fat difference
    const bodyFatDiff = previousAssessment?.body_fat_percentage
        ? (assessment.body_fat_percentage || 0) - previousAssessment.body_fat_percentage
        : null;

    const renderTrend = (value: number | null) => {
        if (!value || Math.abs(value) < 0.01) {
            return <Minus size={14} color="rgba(255,255,255,0.4)" />;
        }
        return value > 0
            ? <TrendingUp size={14} color="#FF4444" />
            : <TrendingDown size={14} color="#D4FF00" />;
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Activity size={16} color="#D4FF00" />
                        <Text style={styles.dateLabel}>
                            {format(new Date(assessment.assessment_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </Text>
                    </View>
                    <View style={styles.expandIndicator}>
                        <Text style={styles.expandText}>{expanded ? '▲' : '▼'}</Text>
                    </View>
                </View>

                {/* Main Metrics */}
                <View style={styles.metricsRow}>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Peso</Text>
                        <View style={styles.metricValueRow}>
                            <Text style={styles.metricValue}>
                                {assessment.weight_kg?.toFixed(1) || '--'}
                            </Text>
                            <Text style={styles.metricUnit}>kg</Text>
                            {weightDiff !== null && renderTrend(weightDiff)}
                        </View>
                        {weightDiff !== null && (
                            <Text style={[
                                styles.metricDiff,
                                weightDiff > 0 ? styles.metricDiffNegative : styles.metricDiffPositive
                            ]}>
                                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}kg
                            </Text>
                        )}
                    </View>

                    <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Gordura</Text>
                        <View style={styles.metricValueRow}>
                            <Text style={styles.metricValue}>
                                {assessment.body_fat_percentage?.toFixed(1) || '--'}
                            </Text>
                            <Text style={styles.metricUnit}>%</Text>
                            {bodyFatDiff !== null && renderTrend(bodyFatDiff)}
                        </View>
                        {bodyFatDiff !== null && (
                            <Text style={[
                                styles.metricDiff,
                                bodyFatDiff > 0 ? styles.metricDiffNegative : styles.metricDiffPositive
                            ]}>
                                {bodyFatDiff > 0 ? '+' : ''}{bodyFatDiff.toFixed(1)}%
                            </Text>
                        )}
                    </View>

                    <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Massa Magra</Text>
                        <View style={styles.metricValueRow}>
                            <Text style={styles.metricValue}>
                                {assessment.lean_mass_kg?.toFixed(1) || '--'}
                            </Text>
                            <Text style={styles.metricUnit}>kg</Text>
                        </View>
                    </View>
                </View>

                {/* Expanded Details */}
                {expanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />

                        {/* Measurements */}
                        <Text style={styles.sectionTitle}>Medidas Corporais</Text>
                        <View style={styles.measurementsGrid}>
                            {assessment.waist_cm && (
                                <View style={styles.measurementItem}>
                                    <Text style={styles.measurementLabel}>Cintura</Text>
                                    <Text style={styles.measurementValue}>{assessment.waist_cm.toFixed(1)} cm</Text>
                                </View>
                            )}
                            {assessment.hip_cm && (
                                <View style={styles.measurementItem}>
                                    <Text style={styles.measurementLabel}>Quadril</Text>
                                    <Text style={styles.measurementValue}>{assessment.hip_cm.toFixed(1)} cm</Text>
                                </View>
                            )}
                            {assessment.chest_cm && (
                                <View style={styles.measurementItem}>
                                    <Text style={styles.measurementLabel}>Peitoral</Text>
                                    <Text style={styles.measurementValue}>{assessment.chest_cm.toFixed(1)} cm</Text>
                                </View>
                            )}
                            {assessment.arm_cm && (
                                <View style={styles.measurementItem}>
                                    <Text style={styles.measurementLabel}>Braço</Text>
                                    <Text style={styles.measurementValue}>{assessment.arm_cm.toFixed(1)} cm</Text>
                                </View>
                            )}
                            {assessment.thigh_cm && (
                                <View style={styles.measurementItem}>
                                    <Text style={styles.measurementLabel}>Coxa</Text>
                                    <Text style={styles.measurementValue}>{assessment.thigh_cm.toFixed(1)} cm</Text>
                                </View>
                            )}
                        </View>

                        {/* Additional Metrics */}
                        {(assessment.bmi || assessment.waist_hip_ratio) && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>Indicadores</Text>
                                <View style={styles.measurementsGrid}>
                                    {assessment.bmi && (
                                        <View style={styles.measurementItem}>
                                            <Text style={styles.measurementLabel}>IMC</Text>
                                            <Text style={styles.measurementValue}>{assessment.bmi.toFixed(1)}</Text>
                                        </View>
                                    )}
                                    {assessment.waist_hip_ratio && (
                                        <View style={styles.measurementItem}>
                                            <Text style={styles.measurementLabel}>Relação C/Q</Text>
                                            <Text style={styles.measurementValue}>{assessment.waist_hip_ratio.toFixed(2)}</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Notes */}
                        {assessment.notes && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>Observações do Coach</Text>
                                <Text style={styles.notesText}>{assessment.notes}</Text>
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
        transform: [{ skewY: '-2deg' }],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateLabel: {
        color: '#D4FF00',
        fontSize: 11,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    expandIndicator: {
        opacity: 0.4,
    },
    expandText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },
    metricsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    metricBox: {
        flex: 1,
    },
    metricLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '900',
        marginBottom: 4,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    metricValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    metricUnit: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '900',
    },
    metricDiff: {
        fontSize: 9,
        fontWeight: '900',
        marginTop: 2,
    },
    metricDiffPositive: {
        color: '#D4FF00',
    },
    metricDiffNegative: {
        color: '#FF4444',
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    sectionTitle: {
        color: '#D4FF00',
        fontSize: 10,
        fontWeight: '900',
        fontStyle: 'italic',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    measurementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    measurementItem: {
        width: '30%',
    },
    measurementLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 8,
        fontWeight: '900',
        marginBottom: 2,
    },
    measurementValue: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    notesText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        lineHeight: 18,
    },
} as any);
