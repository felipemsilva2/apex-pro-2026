import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react-native';

interface ProgressStatsProps {
    assessments: any[];
}

export function ProgressStats({ assessments }: ProgressStatsProps) {
    if (!assessments || assessments.length < 2) {
        return null;
    }

    const latest = assessments[0];
    const first = assessments[assessments.length - 1];

    // Calculate differences
    const weightDiff = latest.weight_kg && first.weight_kg
        ? latest.weight_kg - first.weight_kg
        : null;

    const bodyFatDiff = latest.body_fat_percentage && first.body_fat_percentage
        ? latest.body_fat_percentage - first.body_fat_percentage
        : null;

    const leanMassDiff = latest.lean_mass_kg && first.lean_mass_kg
        ? latest.lean_mass_kg - first.lean_mass_kg
        : null;

    // Calculate days between assessments
    const daysBetween = Math.floor(
        (new Date(latest.assessment_date).getTime() - new Date(first.assessment_date).getTime())
        / (1000 * 60 * 60 * 24)
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Resultados Totais</Text>

            <View style={styles.statsGrid}>
                {/* Weight Change */}
                {weightDiff !== null && (
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            {weightDiff < 0 ? (
                                <TrendingDown size={16} color="#D4FF00" />
                            ) : (
                                <TrendingUp size={16} color="#FF4444" />
                            )}
                            <Text style={styles.statLabel}>Variação de Peso</Text>
                        </View>
                        <Text style={[
                            styles.statValue,
                            weightDiff < 0 ? styles.positive : styles.negative
                        ]}>
                            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                        </Text>
                    </View>
                )}

                {/* Body Fat Change */}
                {bodyFatDiff !== null && (
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            {bodyFatDiff < 0 ? (
                                <TrendingDown size={16} color="#D4FF00" />
                            ) : (
                                <TrendingUp size={16} color="#FF4444" />
                            )}
                            <Text style={styles.statLabel}>Variação Gordura</Text>
                        </View>
                        <Text style={[
                            styles.statValue,
                            bodyFatDiff < 0 ? styles.positive : styles.negative
                        ]}>
                            {bodyFatDiff > 0 ? '+' : ''}{bodyFatDiff.toFixed(1)}%
                        </Text>
                    </View>
                )}

                {/* Lean Mass Change */}
                {leanMassDiff !== null && (
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            {leanMassDiff > 0 ? (
                                <TrendingUp size={16} color="#D4FF00" />
                            ) : (
                                <TrendingDown size={16} color="#FF4444" />
                            )}
                            <Text style={styles.statLabel}>Massa Magra</Text>
                        </View>
                        <Text style={[
                            styles.statValue,
                            leanMassDiff > 0 ? styles.positive : styles.negative
                        ]}>
                            {leanMassDiff > 0 ? '+' : ''}{leanMassDiff.toFixed(1)} kg
                        </Text>
                    </View>
                )}

                {/* Time Period */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Calendar size={16} color="#D4FF00" />
                        <Text style={styles.statLabel}>Período</Text>
                    </View>
                    <Text style={styles.statValue}>
                        {daysBetween} dias
                    </Text>
                </View>

                {/* Total Assessments */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Target size={16} color="#D4FF00" />
                        <Text style={styles.statLabel}>Avaliações</Text>
                    </View>
                    <Text style={styles.statValue}>
                        {assessments.length}
                    </Text>
                </View>
            </View>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: 'calc(50% - 6px)' as any,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        transform: [{ skewX: '-3deg' }],
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '900',
    },
    statValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    positive: {
        color: '#D4FF00',
    },
    negative: {
        color: '#FF4444',
    },
} as any);
