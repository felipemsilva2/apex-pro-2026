import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, TrendingDown, TrendingUp, Minus, CheckCircle2 } from 'lucide-react-native';

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
        if (!previousAssessment) return <Minus size={12} color="rgba(255,255,255,0.2)" />;

        if (Math.abs(value) < 0.1) return <Minus size={12} color="rgba(255,255,255,0.2)" />;

        const isPositive = value > 0;
        // For weight/fat, usually negative is good (green), positive is bad (red)
        // Unless inverse is true (e.g. muscle mass)
        const isGood = inverse ? isPositive : !isPositive;
        const color = isGood ? '#10B981' : '#EF4444';
        const Icon = isPositive ? TrendingUp : TrendingDown;

        return (
            <View style={styles.deltaContainer}>
                <Icon size={12} color={color} />
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
            {/* Date Column */}
            <View style={styles.dateCol}>
                <Text style={styles.day}>
                    {format(new Date(assessment.assessment_date), 'dd', { locale: ptBR })}
                </Text>
                <Text style={styles.month}>
                    {format(new Date(assessment.assessment_date), 'MMM', { locale: ptBR }).toUpperCase()}
                </Text>
                {hasPhotos && (
                    <View style={[styles.photoBadge, { backgroundColor: brandColors.primary }]}>
                        <Text style={styles.photoBadgeText}>FOTOS</Text>
                    </View>
                )}
                {assessment.status === 'reviewed' && (
                    <View style={styles.reviewedBadge}>
                        <CheckCircle2 size={8} color="#10B981" />
                        <Text style={styles.reviewedBadgeText}>LIDO</Text>
                    </View>
                )}
            </View>

            {/* Metrics */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>PESO</Text>
                    <Text style={styles.metricValue}>{assessment.weight_kg.toFixed(1)}kg</Text>
                    {renderDelta(weightDelta, 'kg')}
                </View>

                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>GORDURA</Text>
                    <Text style={styles.metricValue}>
                        {assessment.body_fat_percentage ? `${assessment.body_fat_percentage.toFixed(1)}%` : '--'}
                    </Text>
                    {renderDelta(fatDelta, '%')}
                </View>
            </View>

            <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 8,
    },
    dateCol: {
        alignItems: 'center',
        marginRight: 16,
        width: 48,
    },
    day: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#FFF',
    },
    month: {
        fontSize: 10,
        fontFamily: 'Inter_500Medium',
        color: 'rgba(255,255,255,0.5)',
    },
    photoBadge: {
        marginTop: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 2,
    },
    photoBadgeText: {
        fontSize: 7,
        fontFamily: 'Inter_900Black',
        color: '#000',
    },
    metricsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    metricItem: {
        alignItems: 'flex-start',
    },
    metricLabel: {
        fontSize: 10,
        fontFamily: 'Inter_500Medium',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#FFF',
        marginBottom: 2,
    },
    deltaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    deltaText: {
        fontSize: 10,
        fontFamily: 'Inter_600SemiBold',
    },
    reviewedBadge: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 2,
    },
    reviewedBadgeText: {
        fontSize: 7,
        fontFamily: 'Inter_900Black',
        color: '#10B981',
    },
});
