import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, TrendingDown, TrendingUp, Minus, CheckCircle2, Camera } from 'lucide-react-native';

interface Assessment {
    id: string;
    assessment_date: string;
    weight_kg: number;
    body_fat_percentage?: number;
    front_photo?: string;
    back_photo?: string;
    side_photo?: string;
    status?: 'pending' | 'reviewed';
    coach_feedback?: string;
}

interface AssessmentRowProps {
    assessment: Assessment;
    previousAssessment?: Assessment;
    onPress?: () => void;
}

export const AssessmentRow = ({ assessment, previousAssessment, onPress }: AssessmentRowProps) => {
    const { brandColors } = useAuth();

    const weightDelta = previousAssessment
        ? assessment.weight_kg - previousAssessment.weight_kg
        : 0;

    const fatDelta = (previousAssessment?.body_fat_percentage && assessment.body_fat_percentage)
        ? assessment.body_fat_percentage - previousAssessment.body_fat_percentage
        : 0;

    const hasPhotos = !!(assessment.front_photo || assessment.back_photo || assessment.side_photo);

    const renderDelta = (value: number, suffix: string, inverse: boolean = false) => {
        if (!previousAssessment) return <Minus size={10} color="rgba(255,255,255,0.15)" />;

        if (Math.abs(value) < 0.1) return <Minus size={10} color="rgba(255,255,255,0.15)" />;

        const isPositive = value > 0;
        // For weight/fat, usually negative is good (green), positive is bad (red)
        const isGood = inverse ? isPositive : !isPositive;
        const color = isGood ? '#D4FF00' : '#FF4444';
        const Icon = isPositive ? TrendingUp : TrendingDown;

        return (
            <View style={styles.deltaContainer}>
                <Icon size={10} color={color} />
                <Text style={[styles.deltaText, { color }]}>
                    {Math.abs(value).toFixed(1)}{suffix}
                </Text>
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Date Bento */}
            <View style={styles.dateCol}>
                <Text style={styles.day}>
                    {format(new Date(assessment.assessment_date), 'dd', { locale: ptBR })}
                </Text>
                <Text style={styles.month}>
                    {format(new Date(assessment.assessment_date), 'MMM', { locale: ptBR }).toUpperCase()}
                </Text>
            </View>

            {/* Metrics */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>PESO</Text>
                    <Text style={styles.metricValue}>{assessment.weight_kg.toFixed(1)}kg</Text>
                    {renderDelta(weightDelta, 'kg')}
                </View>

                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>GORDURA</Text>
                    <Text style={styles.metricValue}>
                        {assessment.body_fat_percentage ? `${assessment.body_fat_percentage.toFixed(1)}%` : '--'}
                    </Text>
                    {renderDelta(fatDelta, '%')}
                </View>

                <View style={styles.statusCol}>
                    {hasPhotos && (
                        <View style={[styles.badge, { backgroundColor: brandColors.primary }]}>
                            <Camera size={10} color={brandColors.secondary} />
                        </View>
                    )}
                    {assessment.status === 'reviewed' && (
                        <View style={[styles.badge, { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}>
                            <CheckCircle2 size={10} color="rgba(255,255,255,0.4)" />
                        </View>
                    )}
                    <View style={styles.arrowBox}>
                        <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 10,
        gap: 16,
    },
    dateCol: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 54,
        height: 54,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    day: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
    },
    month: {
        fontSize: 9,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.3)',
        marginTop: -2,
    },
    metricsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
        alignItems: 'flex-start',
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: 12,
    },
    metricLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
    },
    deltaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    deltaText: {
        fontSize: 10,
        fontWeight: '800',
    },
    statusCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowBox: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.01)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    }
});
