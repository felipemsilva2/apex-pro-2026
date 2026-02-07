import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header, EmptyState, LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteAssessments } from '../../hooks/useAthleteData';
import { ProgressChart } from '../../components/ProgressChart';
import { ProgressStats } from '../../components/ProgressStats';
import { BeforeAfterComparison } from '../../components/BeforeAfterComparison';
import { AssessmentRow } from '../../components/AssessmentRow';
import { FAB } from '../../components/ui/FAB';
import { TrendingUp, List, BarChart2, AlertCircle } from 'lucide-react-native';

type ViewMode = 'charts' | 'list';

/**
 * Progress screen - Consolidates Assessments and Evolution
 * Features toggle between Charts and List view
 */
export default function ProgressScreen() {
    const { brandColors } = useAuth();
    const router = useRouter();
    const { data: assessments, isLoading, refetch, isRefetching } = useAthleteAssessments();
    const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default to list for better data visibility

    if (isLoading) {
        return <LoadingSpinner message="Analisando evolução..." />;
    }

    const hasEnoughData = assessments && assessments.length >= 2;
    const hasAnyData = assessments && assessments.length > 0;

    // Prepare chart data
    const weightData = assessments
        ?.filter(a => a.weight_kg)
        .map(a => ({
            date: a.assessment_date,
            value: a.weight_kg,
        })) || [];

    const bodyFatData = assessments
        ?.filter(a => a.body_fat_percentage)
        .map(a => ({
            date: a.assessment_date,
            value: a.body_fat_percentage,
        })) || [];

    const leanMassData = assessments
        ?.filter(a => a.lean_mass_kg)
        .map(a => ({
            date: a.assessment_date,
            value: a.lean_mass_kg,
        })) || [];

    return (
        <Container variant="page">
            <Header
                title="EVOLUÇÃO"
                subtitle="ANALYTICS & PERFORMANCE"
                rightAction={
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                viewMode === 'charts' && { backgroundColor: brandColors.primary }
                            ]}
                            onPress={() => setViewMode('charts')}
                        >
                            <BarChart2
                                size={16}
                                color={viewMode === 'charts' ? brandColors.secondary : 'rgba(255,255,255,0.4)'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                viewMode === 'list' && { backgroundColor: brandColors.primary }
                            ]}
                            onPress={() => setViewMode('list')}
                        >
                            <List
                                size={16}
                                color={viewMode === 'list' ? brandColors.secondary : 'rgba(255,255,255,0.4)'}
                            />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={brandColors.primary}
                        colors={[brandColors.primary]}
                    />
                }
            >
                {!hasAnyData ? (
                    <EmptyState
                        icon={<TrendingUp size={40} color={brandColors.primary} />}
                        title="Sem Dados de Evolução"
                        description="Realize avaliações físicas com seu profissional para acompanhar seu progresso aqui."
                    />
                ) : (
                    <>
                        {/* Summary Stats always visible */}
                        <View style={styles.section}>
                            <ProgressStats assessments={assessments || []} />
                        </View>

                        {viewMode === 'charts' ? (
                            <View style={styles.contentContainer}>
                                {hasEnoughData ? (
                                    <>
                                        <BeforeAfterComparison
                                            firstAssessment={assessments[assessments.length - 1]}
                                            latestAssessment={assessments[0]}
                                        />

                                        {weightData.length >= 2 && (
                                            <ProgressChart
                                                data={weightData}
                                                title="Evolução de Peso"
                                                color={brandColors.primary}
                                                suffix="kg"
                                                decimalPlaces={1}
                                            />
                                        )}

                                        {bodyFatData.length >= 2 && (
                                            <ProgressChart
                                                data={bodyFatData}
                                                title="Gordura Corporal"
                                                color="#EF4444"
                                                suffix="%"
                                                decimalPlaces={1}
                                            />
                                        )}

                                        {leanMassData.length >= 2 && (
                                            <ProgressChart
                                                data={leanMassData}
                                                title="Massa Magra"
                                                color="#10B981"
                                                suffix="kg"
                                                decimalPlaces={1}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <View style={styles.insufficientData}>
                                        <AlertCircle size={32} color="rgba(255,255,255,0.4)" />
                                        <Text style={styles.insufficientDataText}>
                                            Visualize seu histórico completo na aba de lista.{'\n'}
                                            Gráficos requerem pelo menos 2 avaliações.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.contentContainer}>
                                <Text style={styles.listTitle}>HISTÓRICO DE CHECK-INS</Text>
                                {assessments?.map((assessment, index) => (
                                    <AssessmentRow
                                        key={assessment.id}
                                        assessment={assessment}
                                        previousAssessment={assessments[index + 1]}
                                        onPress={() => router.push({
                                            pathname: '/progress/[id]',
                                            params: { id: assessment.id }
                                        })}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Floating Action Button for New Check-in */}
            <FAB onPress={() => router.push('/checkin/new')} />
        </Container>
    );
}

const styles = StyleSheet.create({
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 2,
    },
    toggleButton: {
        padding: 8,
        borderRadius: 6,
    },
    section: {
        marginBottom: 24,
        gap: 12,
    },
    contentContainer: {
        gap: 24,
    },
    insufficientData: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    insufficientDataText: {
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
        fontSize: 13,
    },
    listTitle: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 8,
    }
});
