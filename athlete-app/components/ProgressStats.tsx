import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

interface ProgressStatsProps {
    assessments: any[];
}

export function ProgressStats({ assessments }: ProgressStatsProps) {
    const { brandColors } = useAuth();

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
            <Text style={styles.sectionTitle}>Sumário de Resultados</Text>

            <View style={styles.statsGrid}>
                {/* Weight Change */}
                {weightDiff !== null && (
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            {weightDiff < 0 ? (
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 255, 0, 0.1)' }]}>
                                    <TrendingDown size={14} color="#D4FF00" />
                                </View>
                            ) : (
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
                                    <TrendingUp size={14} color="#FF4444" />
                                </View>
                            )}
                            <Text style={styles.statLabel}>PESO TOTAL</Text>
                        </View>
                        <Text style={[
                            styles.statValue,
                            weightDiff < 0 ? styles.positive : styles.negative
                        ]}>
                            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}kg
                        </Text>
                    </View>
                )}

                {/* Body Fat Change */}
                {bodyFatDiff !== null && (
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            {bodyFatDiff < 0 ? (
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 255, 0, 0.1)' }]}>
                                    <TrendingDown size={14} color="#D4FF00" />
                                </View>
                            ) : (
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
                                    <TrendingUp size={14} color="#FF4444" />
                                </View>
                            )}
                            <Text style={styles.statLabel}> % GORDURA</Text>
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
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 255, 0, 0.1)' }]}>
                                    <TrendingUp size={14} color="#D4FF00" />
                                </View>
                            ) : (
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
                                    <TrendingDown size={14} color="#FF4444" />
                                </View>
                            )}
                            <Text style={styles.statLabel}>MASSA MAGRA</Text>
                        </View>
                        <Text style={[
                            styles.statValue,
                            leanMassDiff > 0 ? styles.positive : styles.negative
                        ]}>
                            {leanMassDiff > 0 ? '+' : ''}{leanMassDiff.toFixed(1)}kg
                        </Text>
                    </View>
                )}

                {/* Time Period */}
                <View style={[styles.statCard, { borderStyle: 'dashed', backgroundColor: 'transparent' }]}>
                    <View style={styles.statHeader}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                            <Calendar size={14} color="rgba(255,255,255,0.4)" />
                        </View>
                        <Text style={styles.statLabel}>PERÍODO</Text>
                    </View>
                    <Text style={styles.statValue}>
                        {daysBetween} dias
                    </Text>
                </View>

                {/* Total Assessments */}
                <View style={[styles.statCard, { borderStyle: 'dashed', backgroundColor: 'transparent' }]}>
                    <View style={styles.statHeader}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                            <Target size={14} color="rgba(255,255,255,0.4)" />
                        </View>
                        <Text style={styles.statLabel}>CHECK-INS</Text>
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
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    statValue: {
        color: '#FFF',
        fontSize: 22,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
    },
    positive: {
        color: '#D4FF00',
    },
    negative: {
        color: '#FF4444',
    },
});
