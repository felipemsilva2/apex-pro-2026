import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Container, Header, EmptyState, LoadingSpinner } from '../../components/ui';
import { Apple, Clock, Flame, X, ChevronRight, Target, Activity } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteDiet } from '../../hooks/useAthleteData';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function NutritionScreen() {
    const { brandColors } = useAuth();
    const { data: diet, isLoading, refetch, isRefetching } = useAthleteDiet();
    const [selectedMeal, setSelectedMeal] = React.useState<any>(null);

    // State for active day tab (0-6)
    const [activeDay, setActiveDay] = React.useState<number>(new Date().getDay());

    if (isLoading) {
        return <LoadingSpinner message="Carregando dieta..." />;
    }

    const meals = diet?.meals || [];

    // Check if we have any specific day meals to decide if we show tabs
    const hasSpecificDays = meals.some(m => m.day_of_week !== null && m.day_of_week !== undefined);

    // Filter meals for the current view
    const displayedMeals = React.useMemo(() => {
        if (!hasSpecificDays) {
            // If no specific days, show all meals (Daily plan)
            return [...meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        }

        return meals.filter(meal => {
            const isDaily = meal.day_of_week === null || meal.day_of_week === undefined;
            const isToday = meal.day_of_week === activeDay;
            return isDaily || isToday;
        }).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }, [meals, hasSpecificDays, activeDay]);

    // Calculate totals for displayed meals
    const dailyTotals = React.useMemo(() => {
        return displayedMeals.reduce((acc, meal) => {
            const mealTotals = meal.foods?.reduce((mAcc: any, food: any) => ({
                kcal: mAcc.kcal + (Number(food.kcal) || 0),
                protein: mAcc.protein + (Number(food.protein) || 0),
                carbs: mAcc.carbs + (Number(food.carbs) || 0),
                fats: mAcc.fats + (Number(food.fats) || 0),
            }), { kcal: 0, protein: 0, carbs: 0, fats: 0 }) || { kcal: 0, protein: 0, carbs: 0, fats: 0 };

            return {
                kcal: acc.kcal + mealTotals.kcal,
                protein: acc.protein + mealTotals.protein,
                carbs: acc.carbs + mealTotals.carbs,
                fats: acc.fats + mealTotals.fats,
            };
        }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });
    }, [displayedMeals]);

    const handleDayChange = (id: number) => {
        if (id !== activeDay) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveDay(id);
        }
    };

    const weekDays = [
        { id: 1, label: 'SEG' },
        { id: 2, label: 'TER' },
        { id: 3, label: 'QUA' },
        { id: 4, label: 'QUI' },
        { id: 5, label: 'SEX' },
        { id: 6, label: 'SÁB' },
        { id: 0, label: 'DOM' },
    ];

    // Reorder based on starting day (Monday first)
    const sortedWeekDays = [
        ...weekDays.filter(d => d.id !== 0),
        weekDays.find(d => d.id === 0)!
    ];

    return (
        <Container variant="page">
            <Header
                title="Dieta"
                subtitle="Plano Alimentar"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={brandColors.primary}
                        colors={[brandColors.primary]}
                    />
                }
            >
                {diet ? (
                    <>
                        {/* Premium Summary Module */}
                        <View style={styles.summaryModule}>
                            {/* HUD Decorative Elements */}
                            <View style={[styles.summaryCorner, styles.tl, { borderColor: brandColors.primary }]} />
                            <View style={[styles.summaryCorner, styles.tr, { borderColor: brandColors.primary }]} />

                            <View style={styles.summaryHeader}>
                                <View style={styles.statusBadge}>
                                    <View style={[styles.statusDot, { backgroundColor: brandColors.primary }]} />
                                    <View style={[styles.statusDot, { backgroundColor: brandColors.primary, opacity: 0.5 }]} />
                                    <Text style={[styles.statusLabel, { color: brandColors.primary }]}>PLANO ATIVO</Text>
                                </View>
                                {/* Removed Intel Tag */}
                            </View>

                            <Text style={styles.planName}>{diet.title}</Text>

                            <View style={styles.readoutContainer}>
                                <View style={styles.mainReadout}>
                                    <View style={styles.kcalContainer}>
                                        <Flame size={16} color={brandColors.primary} />
                                        <Text style={styles.kcalValue}>
                                            {Math.round(dailyTotals.kcal) || diet.daily_calories || '--'}
                                        </Text>
                                        <Text style={styles.kcalLabel}>KCAL / DIA</Text>
                                    </View>
                                </View>

                                <View style={styles.macroGrid}>
                                    <View style={styles.macroBox}>
                                        <Text style={styles.macroLabel}>PROT</Text>
                                        <Text style={styles.macroValueSmall}>{Math.round(dailyTotals.protein)}g</Text>
                                    </View>
                                    <View style={styles.macroBox}>
                                        <Text style={styles.macroLabel}>CARB</Text>
                                        <Text style={styles.macroValueSmall}>{Math.round(dailyTotals.carbs)}g</Text>
                                    </View>
                                    <View style={styles.macroBox}>
                                        <Text style={styles.macroLabel}>GORD</Text>
                                        <Text style={styles.macroValueSmall}>{Math.round(dailyTotals.fats)}g</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.bottomBar, { backgroundColor: `${brandColors.primary}10` }]}>
                                <Activity size={10} color={brandColors.primary} />
                                <Text style={[styles.bottomBarText, { color: brandColors.primary }]}>
                                    ANÁLISE DE CONSUMO DIÁRIO
                                </Text>
                            </View>
                        </View>

                        {/* Weekly Tabs (Redesigned) */}
                        {hasSpecificDays && (
                            <View style={styles.navWrapper}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                                    {sortedWeekDays.map(day => (
                                        <TouchableOpacity
                                            key={day.id}
                                            onPress={() => handleDayChange(day.id)}
                                            style={[
                                                styles.dayTab,
                                                activeDay === day.id && { backgroundColor: brandColors.primary, borderColor: brandColors.primary }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.dayTabText,
                                                activeDay === day.id ? { color: brandColors.secondary } : { color: 'rgba(255,255,255,0.4)' }
                                            ]}>
                                                {day.label}
                                            </Text>
                                            {activeDay === day.id && (
                                                <View style={[styles.activeIndicator, { backgroundColor: brandColors.secondary }]} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIndicator, { backgroundColor: brandColors.primary }]} />
                            <Text style={styles.sectionLabel}>
                                {hasSpecificDays
                                    ? `PLANILHA DE ${weekDays.find(d => d.id === activeDay)?.label}`
                                    : `REFEIÇÕES DIÁRIAS`
                                }
                            </Text>
                            <View style={styles.mealCount}>
                                <Text style={[styles.countText, { color: brandColors.primary }]}>{displayedMeals.length}</Text>
                            </View>
                        </View>

                        {displayedMeals.length > 0 ? (
                            displayedMeals.map((meal, index) => (
                                <TouchableOpacity
                                    key={meal.id}
                                    style={[styles.mealCard, { borderColor: 'rgba(255,255,255,0.05)' }]}
                                    onPress={() => setSelectedMeal(meal)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.mealHeader}>
                                        <View style={styles.timeBadge}>
                                            <Clock size={12} color={brandColors.primary} />
                                            <Text style={[styles.timeText, { color: brandColors.primary }]}>
                                                {meal.time ? meal.time.slice(0, 5) : `Ref ${index + 1}`}
                                            </Text>
                                        </View>
                                        <Text style={styles.mealTitle} numberOfLines={1}>{meal.name}</Text>
                                        <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                                    </View>

                                    {meal.description && (
                                        <View style={styles.mealContent}>
                                            <Text style={styles.mealDescription} numberOfLines={2}>
                                                {meal.description}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))
                        ) : (
                            <EmptyState
                                icon={<Apple size={40} color={brandColors.primary} />}
                                title="Nenhuma refeição"
                                description="Nenhuma refeição específica para este dia."
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<Target size={40} color={brandColors.primary} />}
                        title="Nenhuma Dieta Ativa"
                        description="Seu plano alimentar estratégico aparecerá aqui assim que o comando for processado."
                    />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Meal Detail Modal (Already polished) */}
            <Modal
                visible={!!selectedMeal}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedMeal(null)}
            >
                <BlurView intensity={20} style={StyleSheet.absoluteFill}>
                    <Pressable style={styles.modalOverlay} onPress={() => setSelectedMeal(null)} />
                </BlurView>

                {selectedMeal && (
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.timeBadge, { alignSelf: 'flex-start', marginBottom: 8 }]}>
                                <Clock size={12} color={brandColors.primary} />
                                <Text style={[styles.timeText, { color: brandColors.primary }]}>
                                    {selectedMeal.time ? selectedMeal.time.slice(0, 5) : 'Refeição'}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedMeal(null)}
                                    style={styles.closeButton}
                                >
                                    <X size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedMeal.description && (
                                <Text style={styles.modalDescription}>{selectedMeal.description}</Text>
                            )}

                            <Text style={styles.foodsTitle}>DETALHES DA REFEIÇÃO</Text>

                            {selectedMeal.foods && selectedMeal.foods.length > 0 ? (
                                selectedMeal.foods.map((food: any, idx: number) => (
                                    <View key={idx} style={styles.foodItem}>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>{food.name}</Text>
                                            <Text style={styles.foodQty}>{food.qty} {food.unit}</Text>
                                        </View>
                                        <View style={styles.foodMacros}>
                                            <Text style={styles.foodKcal}>{Math.round(food.kcal)} KCAL</Text>
                                            <Text style={styles.foodMacroDetail}>
                                                P:{Math.round(food.protein)}G • C:{Math.round(food.carbs)}G • G:{Math.round(food.fats)}G
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyFoodsText}>Nenhum alimento listado detalhadamente.</Text>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 100,
        paddingHorizontal: 4,
    },
    // Redesigned Summary Module
    summaryModule: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        padding: 20,
        marginBottom: 32,
        overflow: 'hidden',
    },
    summaryCorner: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderWidth: 1.5,
    },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 2,
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    intelTag: {
        fontSize: 8,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'monospace',
    },
    planName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFF',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    readoutContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    mainReadout: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    kcalContainer: {
        alignItems: 'center',
    },
    kcalValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        lineHeight: 38,
    },
    kcalLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
    },
    macroGrid: {
        flexDirection: 'column',
        gap: 4,
        width: 80,
    },
    macroBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.02)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    macroValueSmall: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFF',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: -20,
        marginBottom: -20,
        marginTop: 10,
    },
    bottomBarText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },

    // Redesigned Nav Tabs
    navWrapper: {
        marginBottom: 24,
    },
    tabsContainer: {
        gap: 8,
        paddingHorizontal: 2,
    },
    dayTab: {
        width: 54,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayTabText: {
        fontSize: 11,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 12,
        height: 2,
        borderRadius: 1,
    },

    // Section Styling
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    sectionIndicator: {
        width: 3,
        height: 14,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    mealCount: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        fontSize: 10,
        fontWeight: '900',
    },

    // Cards
    mealCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        padding: 16,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    mealTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '800',
        color: '#FFF',
        textTransform: 'uppercase',
        fontStyle: 'italic',
    },
    mealContent: {
        paddingLeft: 4,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(255,255,255,0.05)',
        marginLeft: 2,
    },
    mealDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 18,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0F0F0F',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFF',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        flex: 1,
        marginRight: 16,
    },
    closeButton: {
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    modalDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 22,
        marginBottom: 24,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 8,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(255,255,255,0.1)',
    },
    foodsTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
        letterSpacing: 2,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    foodQty: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
    },
    foodMacros: {
        alignItems: 'flex-end',
    },
    foodKcal: {
        fontSize: 14,
        fontWeight: '900',
        color: '#FFF',
    },
    foodMacroDetail: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 4,
        fontWeight: '700',
    },
    emptyFoodsText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 32,
    }
});
