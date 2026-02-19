import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Modal, Platform } from 'react-native';

import { useRouter } from 'expo-router';
import { Container, Header, EmptyState, LoadingSpinner, Button } from '../../components/ui';
import { Dumbbell, Zap, ChevronRight, Calendar, Clock, Info } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteWorkouts, useAthleteProtocols } from '../../hooks/useAthleteData';
import { format, differenceInWeeks, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getVisibleColor, getTerminology } from '../../lib/whitelabel';

const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

type Tab = 'workouts' | 'protocols';

export default function TrainingScreen() {
    const { brandColors, tenant } = useAuth();
    const router = useRouter();
    const visiblePrimary = getVisibleColor(brandColors.primary);
    const [activeTab, setActiveTab] = useState<Tab>('workouts');
    const [selectedProtocol, setSelectedProtocol] = useState<any>(null);

    const { data: workouts, isLoading: loadingWorkouts, refetch: refetchWorkouts, isRefetching: refetchingWorkouts } = useAthleteWorkouts();
    const { data: protocols, isLoading: loadingProtocols, refetch: refetchProtocols, isRefetching: refetchingProtocols } = useAthleteProtocols();

    const isLoading = loadingWorkouts || loadingProtocols;
    const isRefetching = refetchingWorkouts || refetchingProtocols;

    const handleRefresh = () => {
        refetchWorkouts();
        refetchProtocols();
    };

    if (isLoading) return <LoadingSpinner message="Atualizando treinos..." />;

    return (
        <Container variant="page" seamless>
            <Header
                title="CT Atleta"
                subtitle="PLANOS DE TREINO"
                variant="hero"
            />

            <View style={styles.scrollContent}>
                {/* Bento Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'workouts' && { backgroundColor: 'rgba(255,255,255,0.06)' }
                        ]}
                        onPress={() => setActiveTab('workouts')}
                    >
                        <Dumbbell
                            size={16}
                            color={activeTab === 'workouts' ? visiblePrimary : 'rgba(255,255,255,0.3)'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'workouts' ? { color: '#FFF' } : { color: 'rgba(255,255,255,0.3)' }
                        ]}>
                            {getTerminology(tenant, 'training', 'Treinos')}
                        </Text>
                        {workouts && workouts.length > 0 && (
                            <View style={[styles.tabBadge, { backgroundColor: activeTab === 'workouts' ? visiblePrimary : 'rgba(255,255,255,0.1)' }]}>
                                <Text style={[styles.tabBadgeText, { color: activeTab === 'workouts' ? brandColors.secondary : 'rgba(255,255,255,0.4)' }]}>{workouts.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'protocols' && { backgroundColor: 'rgba(255,255,255,0.06)' }
                        ]}
                        onPress={() => setActiveTab('protocols')}
                    >
                        <Zap
                            size={16}
                            color={activeTab === 'protocols' ? visiblePrimary : 'rgba(255,255,255,0.3)'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'protocols' ? { color: '#FFF' } : { color: 'rgba(255,255,255,0.3)' }
                        ]}>
                            {getTerminology(tenant, 'protocols', 'Protocolos')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={brandColors.primary} />
                    }
                >
                    {activeTab === 'workouts' ? (
                        <>
                            {workouts && workouts.length > 0 ? (
                                workouts.map((workout: any, index: number) => {
                                    const workoutDate = workout.scheduled_date ? parseLocalDate(workout.scheduled_date) : null;
                                    const today = startOfDay(new Date());
                                    const isToday = workoutDate && startOfDay(workoutDate).getTime() === today.getTime();
                                    const isNext = isToday || (index === 0 && !workouts.some(w => w.scheduled_date && startOfDay(parseLocalDate(w.scheduled_date)).getTime() === today.getTime()));

                                    return (
                                        <View
                                            key={workout.id}
                                        >
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                style={[styles.workoutCard, isNext && { borderColor: `${visiblePrimary}40` }]}
                                                onPress={() => router.push(`/workout/${workout.id}` as any)}
                                            >
                                                <View style={styles.cardHeader}>
                                                    <View style={styles.headerInfo}>
                                                        {isToday && (
                                                            <View style={[styles.statusBadge, { backgroundColor: visiblePrimary }]}>
                                                                <Text style={[styles.statusBadgeText, { color: brandColors.secondary }]}>AGENDADO HOJE</Text>
                                                            </View>
                                                        )}
                                                        <Text style={styles.cardTitle}>{workout.title}</Text>
                                                        <Text style={styles.cardSubtitle}>
                                                            {workout.scheduled_date
                                                                ? format(parseLocalDate(workout.scheduled_date), "EEEE, d 'de' MMMM", { locale: ptBR })
                                                                : 'Treino Flexível'}
                                                        </Text>
                                                    </View>
                                                    <View style={[styles.actionIcon, { backgroundColor: isNext ? `${visiblePrimary}15` : 'rgba(255,255,255,0.05)' }]}>
                                                        <ChevronRight size={20} color={isNext ? visiblePrimary : 'rgba(255,255,255,0.4)'} />
                                                    </View>
                                                </View>

                                                <View style={styles.statsRow}>
                                                    <View style={styles.statChip}>
                                                        <Dumbbell size={12} color="rgba(255,255,255,0.4)" />
                                                        <Text style={styles.statLabel}>{workout.exercises?.length || 0} Atividades</Text>
                                                    </View>
                                                    <View style={styles.statChip}>
                                                        <Clock size={12} color="rgba(255,255,255,0.4)" />
                                                        <Text style={styles.statLabel}>~55 min</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.previewContainer}>
                                                    {workout.exercises?.slice(0, 3).map((ex: any, i: number) => (
                                                        <View key={i} style={styles.previewItem}>
                                                            <Text style={styles.previewName} numberOfLines={1}>
                                                                {ex.exercise?.name_pt || ex.exercise?.name || ex.exercise_name || "Exercício"}
                                                            </Text>
                                                            <Text style={styles.previewMeta}>{ex.sets}x{ex.reps}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<Dumbbell size={40} color={visiblePrimary} />}
                                    title="Tudo pronto!"
                                    description="Seus novos treinos e planos aparecerão aqui em breve."
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {protocols && protocols.length > 0 ? (
                                protocols.map((protocol: any, index: number) => (
                                    <View
                                        key={protocol.id}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.protocolCard}
                                            onPress={() => setSelectedProtocol(protocol)}
                                        >
                                            <View style={styles.protocolHeader}>
                                                <Zap size={20} color={visiblePrimary} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.protocolTitle}>{protocol.name}</Text>
                                                    <Text style={styles.protocolSubtitle}>
                                                        {protocol.start_date ? `Início em ${format(new Date(protocol.start_date), "dd/MM/yy")}` : 'Plano Vitalício'}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity style={styles.infoButton} onPress={() => setSelectedProtocol(protocol)}>
                                                    <Info size={18} color="rgba(255,255,255,0.3)" />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.compoundGrid}>
                                                {protocol.compounds?.slice(0, 2).map((comp: any, i: number) => (
                                                    <View key={i} style={styles.compoundItem}>
                                                        <Text style={styles.compoundName} numberOfLines={1}>{comp.name}</Text>
                                                        <Text style={[styles.compoundMeta, { color: visiblePrimary }]}>{comp.dosage}</Text>
                                                    </View>
                                                ))}
                                                {protocol.compounds?.length > 2 && (
                                                    <Text style={styles.moreCount}>+ {protocol.compounds.length - 2} itens</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <EmptyState
                                    icon={<Zap size={40} color={visiblePrimary} />}
                                    title="Sem protocolos"
                                    description="Você não possui protocolos auxiliares ativos."
                                />
                            )}
                        </>
                    )}
                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>

            {/* Premium Protocol Modal */}
            <Modal
                visible={!!selectedProtocol}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSelectedProtocol(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Zap size={24} color={visiblePrimary} />
                            <Text style={styles.modalTitle}>{selectedProtocol?.name}</Text>
                            <TouchableOpacity onPress={() => setSelectedProtocol(null)} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {selectedProtocol?.description && (
                                <View style={styles.instructionBox}>
                                    <Text style={styles.boxLabel}>ORIENTAÇÕES</Text>
                                    <Text style={styles.boxText}>{selectedProtocol.description}</Text>
                                </View>
                            )}

                            <Text style={styles.compoundLabel}>CONTEÚDO DO PLANO</Text>
                            {selectedProtocol?.compounds?.map((comp: any, i: number) => (
                                <View key={i} style={styles.modalCompoundItem}>
                                    <View style={[styles.dot, { backgroundColor: visiblePrimary }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalCompName}>{comp.name}</Text>
                                        <Text style={styles.modalCompFreq}>{comp.frequency || 'Sob demanda'}</Text>
                                    </View>
                                    <Text style={[styles.modalCompDosage, { color: visiblePrimary }]}>{comp.dosage}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <Button
                            title="ENTENDIDO"
                            onPress={() => setSelectedProtocol(null)}
                            brandColors={brandColors}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </Container >
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
    },
    tabText: {
        fontSize: 15,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-SemiBold' : 'Outfit_600SemiBold',
    },
    tabBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 8,
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    workoutCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 20,
    },
    headerInfo: {
        flex: 1,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 8,
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'capitalize',
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-SemiBold' : 'Outfit_600SemiBold',
        color: 'rgba(255,255,255,0.5)',
    },
    previewContainer: {
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
    previewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewName: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.7)',
        flex: 1,
    },
    previewMeta: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.3)',
    },
    protocolCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    protocolHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    protocolTitle: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    protocolSubtitle: {
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        color: 'rgba(255,255,255,0.4)',
    },
    infoButton: {
        padding: 8,
    },
    compoundGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    compoundItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: '45%',
    },
    compoundName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    compoundMeta: {
        fontSize: 10,
        fontWeight: '900',
    },
    moreCount: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        alignSelf: 'center',
        marginLeft: 8,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 20,
    },
    modalSheet: {
        backgroundColor: '#0A0A0B',
        borderRadius: 32,
        padding: 24,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    modalTitle: {
        flex: 1,
        fontSize: 24,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    closeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    closeBtnText: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
    },
    modalBody: {
        marginVertical: 20,
    },
    instructionBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    boxLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        marginBottom: 8,
    },
    boxText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#FFF',
    },
    compoundLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    modalCompoundItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        borderRadius: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    modalCompName: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    modalCompFreq: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 2,
    },
    modalCompDosage: {
        fontSize: 14,
        fontWeight: '900',
    },
});
