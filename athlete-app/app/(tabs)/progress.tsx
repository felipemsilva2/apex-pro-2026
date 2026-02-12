import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, Platform } from 'react-native';
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
import * as Haptics from 'expo-haptics';

type ViewMode = 'charts' | 'list';

export default function ProgressScreen() {
    const { brandColors } = useAuth();
    const router = useRouter();
    const { data: assessments, isLoading, refetch, isRefetching } = useAthleteAssessments();
    const [viewMode, setViewMode] = useState<ViewMode>('list');

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

    const handleToggleView = (mode: ViewMode) => {
        if (mode !== viewMode) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode(mode);
        }
    };

    return (
        <Container variant="page" seamless>
            <Header
                title="Evolução"
                subtitle="MÉTRICAS E RESULTADOS"
                variant="hero"
            />

            <View style={styles.content}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={brandColors.primary}
                        />
                    }
                >
                    {!hasAnyData ? (
                        <EmptyState
                            icon={<TrendingUp size={40} color={brandColors.primary} />}
                            title="Sem Dados de Evolução"
                            description="Realize reportes de evolução para acompanhar seu progresso aqui."
                        />
                    ) : (
                        <>
                            {/* Reacticx View Switcher */}
                            <View style={styles.navWrapper}>
                                <View style={styles.tabsContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dayTab,
                                            viewMode === 'list' && { backgroundColor: 'rgba(255,255,255,0.06)' }
                                        ]}
                                        onPress={() => handleToggleView('list')}
                                    >
                                        <View style={styles.tabContent}>
                                            <List size={14} color={viewMode === 'list' ? '#FFF' : 'rgba(255,255,255,0.3)'} />
                                            <Text style={[
                                                styles.dayTabText,
                                                viewMode === 'list' ? { color: '#FFF' } : { color: 'rgba(255,255,255,0.3)' }
                                            ]}>
                                                HISTÓRICO
                                            </Text>
                                        </View>
                                        {viewMode === 'list' && (
                                            <View style={[styles.activeIndicator, { backgroundColor: brandColors.primary }]} />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.dayTab,
                                            viewMode === 'charts' && { backgroundColor: 'rgba(255,255,255,0.06)' }
                                        ]}
                                        onPress={() => handleToggleView('charts')}
                                    >
                                        <View style={styles.tabContent}>
                                            <BarChart2 size={14} color={viewMode === 'charts' ? '#FFF' : 'rgba(255,255,255,0.3)'} />
                                            <Text style={[
                                                styles.dayTabText,
                                                viewMode === 'charts' ? { color: '#FFF' } : { color: 'rgba(255,255,255,0.3)' }
                                            ]}>
                                                GRÁFICOS
                                            </Text>
                                        </View>
                                        {viewMode === 'charts' && (
                                            <View style={[styles.activeIndicator, { backgroundColor: brandColors.primary }]} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Summary Stats (Always visible in Reacticx) */}
                            <ProgressStats assessments={assessments || []} />

                            {viewMode === 'charts' ? (
                                <View style={styles.section}>
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
                                            <AlertCircle size={32} color="rgba(255,255,255,0.15)" />
                                            <Text style={styles.insufficientDataText}>
                                                Histórico completo disponível na aba {'\n'}"HISTÓRICO".
                                                Gráficos requerem pelo menos 2 reportes de shape.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionLabel}>HISTÓRICO DE EVOLUÇÃO</Text>
                                        <View style={[styles.countBadge, { backgroundColor: `${brandColors.primary}15` }]}>
                                            <Text style={[styles.countText, { color: brandColors.primary }]}>{assessments?.length}</Text>
                                        </View>
                                    </View>

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
            </View>

            {/* Floating Action Button for New Check-in */}
            <FAB onPress={() => router.push('/checkin/new')} />
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    navWrapper: {
        marginBottom: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 4,
    },
    dayTab: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dayTabText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 0.5,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 6,
        width: 12,
        height: 2,
        borderRadius: 1,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    countText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    insufficientData: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    insufficientDataText: {
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 20,
        fontSize: 13,
        fontWeight: '600',
    }
});
