import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header, EmptyState, LoadingSpinner } from '../../components/ui';
import { Dumbbell, Zap, ChevronRight, Calendar, Clock, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteWorkouts, useAthleteProtocols } from '../../hooks/useAthleteData';
import { format, differenceInWeeks, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper to parse "YYYY-MM-DD" as local date, avoiding UTC shift
const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

type Tab = 'workouts' | 'protocols';

export default function TrainingScreen() {
    const { brandColors } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('workouts');

    const { data: workouts, isLoading: loadingWorkouts, refetch: refetchWorkouts, isRefetching: refetchingWorkouts } = useAthleteWorkouts();
    const { data: protocols, isLoading: loadingProtocols, refetch: refetchProtocols, isRefetching: refetchingProtocols } = useAthleteProtocols();

    const isLoading = loadingWorkouts || loadingProtocols;
    const isRefetching = refetchingWorkouts || refetchingProtocols;

    const handleRefresh = () => {
        refetchWorkouts();
        refetchProtocols();
    };

    if (isLoading) {
        return <LoadingSpinner message="Carregando arsenal..." />;
    }

    return (
        <Container variant="page">
            <Header
                title="Arsenal"
                subtitle="Protocolos & Treinos"
            />

            {/* Custom Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'workouts' && { backgroundColor: brandColors.primary }
                    ]}
                    onPress={() => setActiveTab('workouts')}
                >
                    <Dumbbell
                        size={16}
                        color={activeTab === 'workouts' ? brandColors.secondary : 'rgba(255,255,255,0.4)'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'workouts' ? { color: brandColors.secondary } : { color: 'rgba(255,255,255,0.4)' }
                    ]}>
                        TREINOS ({workouts?.length || 0})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'protocols' && { backgroundColor: brandColors.primary }
                    ]}
                    onPress={() => setActiveTab('protocols')}
                >
                    <Zap
                        size={16}
                        color={activeTab === 'protocols' ? brandColors.secondary : 'rgba(255,255,255,0.4)'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'protocols' && { color: brandColors.secondary }
                    ]}>
                        PROTOCOLOS ({protocols?.length || 0})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={handleRefresh}
                        tintColor={brandColors.primary}
                        colors={[brandColors.primary]}
                    />
                }
            >
                {activeTab === 'workouts' ? (
                    <>
                        {workouts && workouts.length > 0 ? (
                            workouts.map((workout, index) => {
                                // Highlight logic: Find if this workout is for today
                                const workoutDate = workout.scheduled_date ? parseLocalDate(workout.scheduled_date) : null;
                                const today = startOfDay(new Date());
                                const isToday = workoutDate && startOfDay(workoutDate).getTime() === today.getTime();
                                const isNext = isToday || (index === 0 && !workouts.some(w => w.scheduled_date && startOfDay(parseLocalDate(w.scheduled_date)).getTime() === today.getTime()));

                                return (
                                    <TouchableOpacity
                                        key={workout.id}
                                        activeOpacity={0.9}
                                        style={[
                                            styles.card,
                                            isNext && { borderColor: brandColors.primary, borderWidth: 1 }
                                        ]}
                                        onPress={() => router.push(`/workout/${workout.id}` as any)}
                                    >
                                        <View style={[styles.statusStripe, { backgroundColor: isNext ? brandColors.primary : 'rgba(255,255,255,0.1)' }]} />

                                        <View style={styles.cardContent}>
                                            <View style={styles.cardHeader}>
                                                <View style={{ flex: 1 }}>
                                                    <View style={styles.headerTopRow}>
                                                        {isToday ? (
                                                            <View style={[styles.nextBadge, { backgroundColor: brandColors.primary }]}>
                                                                <Text style={[styles.nextBadgeText, { color: brandColors.secondary }]}>MISSÃO DE HOJE</Text>
                                                            </View>
                                                        ) : isNext ? (
                                                            <View style={[styles.nextBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                                                <Text style={[styles.nextBadgeText, { color: 'rgba(255,255,255,0.4)' }]}>DURANTE A SEMANA</Text>
                                                            </View>
                                                        ) : null}
                                                        {workout.scheduled_date && (
                                                            <Text style={[styles.dateText, isNext && { color: brandColors.primary }]}>
                                                                {format(parseLocalDate(workout.scheduled_date), "EEEE", { locale: ptBR }).toUpperCase()}
                                                                <Text style={{ opacity: 0.3 }}> • {format(parseLocalDate(workout.scheduled_date), "d 'DE' MMM", { locale: ptBR }).toUpperCase()}</Text>
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.cardTitle}>{workout.title}</Text>
                                                </View>
                                                <View style={[styles.iconBox, { borderColor: isNext ? brandColors.primary : 'rgba(255,255,255,0.1)' }]}>
                                                    <ChevronRight size={20} color={isNext ? brandColors.primary : 'rgba(255,255,255,0.4)'} />
                                                </View>
                                            </View>

                                            <View style={styles.statsRow}>
                                                <View style={styles.statItem}>
                                                    <Dumbbell size={12} color="rgba(255,255,255,0.4)" />
                                                    <Text style={styles.statText}>{workout.exercises?.length || 0} EXERCÍCIOS</Text>
                                                </View>
                                                <View style={styles.statDivider} />
                                                <View style={styles.statItem}>
                                                    <Clock size={12} color="rgba(255,255,255,0.4)" />
                                                    <Text style={styles.statText}>~60 MIN</Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.previewList}>
                                                {workout.exercises?.slice(0, 3).map((ex: any, i: number) => {
                                                    // FIX: Usar name_pt se disponível, senão name, senão exercise_name
                                                    const name = ex.exercise?.name_pt || ex.exercise?.name || ex.exercise_name || "Exercício";
                                                    return (
                                                        <View key={i} style={styles.previewRow}>
                                                            <View style={[styles.bullet, { backgroundColor: isNext ? brandColors.primary : 'rgba(255,255,255,0.2)' }]} />
                                                            <Text style={styles.previewText} numberOfLines={1}>
                                                                {name}
                                                            </Text>
                                                            <Text style={styles.previewSets}>
                                                                {ex.sets}x{ex.reps}
                                                            </Text>
                                                        </View>
                                                    );
                                                })}
                                                {workout.exercises && workout.exercises.length > 3 && (
                                                    <Text style={styles.moreText}>
                                                        + {workout.exercises.length - 3} outros exercícios...
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <EmptyState
                                icon={<Dumbbell size={40} color={brandColors.primary} />}
                                title="Nenhum Treino"
                                description="Seus treinos aparecerão aqui."
                            />
                        )}
                    </>
                ) : (
                    <>
                        {protocols && protocols.length > 0 ? (
                            protocols.map((protocol) => {
                                const startDate = protocol.start_date ? new Date(protocol.start_date) : new Date();
                                const currentWeek = differenceInWeeks(new Date(), startDate) + 1;

                                return (
                                    <View
                                        key={protocol.id}
                                        style={styles.card}
                                    >
                                        <View style={[styles.statusStripe, { backgroundColor: brandColors.primary }]} />

                                        <View style={styles.cardContent}>
                                            <View style={styles.cardHeader}>
                                                <View style={{ flex: 1 }}>
                                                    <View style={styles.headerTopRow}>
                                                        <View style={[styles.nextBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                                            <Text style={styles.nextBadgeText}>PROTOCOLO</Text>
                                                        </View>
                                                        <Text style={styles.dateText}>SEMANA {currentWeek}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{protocol.name}</Text>
                                                </View>
                                                <View style={[styles.iconBox, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                                                    <Zap size={20} color={brandColors.primary} />
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.previewList}>
                                                {protocol.compounds?.map((compound: any, i: number) => (
                                                    <View key={i} style={styles.previewRow}>
                                                        <View style={[styles.bullet, { backgroundColor: brandColors.primary }]} />
                                                        <Text style={styles.previewText} numberOfLines={1}>
                                                            {compound.name}
                                                        </Text>
                                                        <Text style={styles.previewSets}>
                                                            {compound.dosage}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>

                                            {protocol.description && (
                                                <View style={styles.noteContainer}>
                                                    <AlertTriangle size={12} color={brandColors.primary} />
                                                    <Text style={[styles.noteText, { color: brandColors.primary }]} numberOfLines={2}>
                                                        {protocol.description}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <EmptyState
                                icon={<Zap size={40} color={brandColors.primary} />}
                                title="Nenhum Protocolo"
                                description="Seus protocolos hormonais aparecerão aqui."
                            />
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 4,
        borderRadius: 8,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 8,
    },
    tabText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statusStripe: {
        width: 4,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    nextBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    nextBadgeText: {
        fontSize: 9,
        fontWeight: '900',
    },
    dateText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFF',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
    },
    statDivider: {
        width: 1,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    previewList: {
        gap: 6,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginRight: 8,
    },
    previewText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        flex: 1,
        fontWeight: '500',
    },
    previewSets: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    moreText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 4,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
    },
    noteContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 8,
        marginTop: 12,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
        borderRadius: 4,
    },
    noteText: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 16,
    },
});
