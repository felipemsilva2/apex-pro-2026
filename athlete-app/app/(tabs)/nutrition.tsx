import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, Platform, Pressable } from 'react-native';

import { Container, Header, EmptyState, LoadingSpinner, Button } from '../../components/ui';
import { Apple, Clock, Flame, X, ChevronRight, Target, Activity } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteDiet } from '../../hooks/useAthleteData';
import * as Haptics from 'expo-haptics';

import { getVisibleColor, getTerminology } from '../../lib/whitelabel';

export default function NutritionScreen() {
    const { brandColors, tenant } = useAuth();
    const { data: dietPlans, isLoading, refetch, isRefetching } = useAthleteDiet() as any;
    const [selectedMeal, setSelectedMeal] = React.useState<any>(null);

    // Carb Cycling State
    const [activeDietId, setActiveDietId] = React.useState<string | null>(null);

    // State for active day tab (0-6)
    const [activeDay, setActiveDay] = React.useState<number>(new Date().getDay());

    // Sorted strategies by day of week (Monday first)
    const sortedDietPlans = React.useMemo(() => {
        if (!dietPlans) return [];

        const dayWeights: Record<number, number> = {
            1: 1, // SEG
            2: 2, // TER
            3: 3, // QUA
            4: 4, // QUI
            5: 5, // SEX
            6: 6, // SAB
            0: 7  // DOM
        };

        return [...dietPlans].sort((a: any, b: any) => {
            const aDays = a.days_of_week || [];
            const bDays = b.days_of_week || [];

            if (aDays.length === 0 && bDays.length === 0) return 0;
            if (aDays.length === 0) return 1;
            if (bDays.length === 0) return -1;

            const aMinWeight = Math.min(...aDays.map((d: number) => dayWeights[d] || 99));
            const bMinWeight = Math.min(...bDays.map((d: number) => dayWeights[d] || 99));

            return aMinWeight - bMinWeight;
        });
    }, [dietPlans]);

    // Effect to set initial diet based on scheduling
    React.useEffect(() => {
        if (dietPlans && dietPlans.length > 0 && !activeDietId) {
            const today = new Date().getDay();
            // Try to find a diet assigned to today
            const dietForToday = dietPlans.find((d: any) =>
                d.days_of_week && d.days_of_week.includes(today)
            );

            if (dietForToday) {
                setActiveDietId(dietForToday.id);
            } else if (sortedDietPlans.length > 0) {
                setActiveDietId(sortedDietPlans[0].id);
            }
        }
    }, [dietPlans]);

    if (isLoading) {
        return <LoadingSpinner message="Carregando dieta..." />;
    }

    const diet = sortedDietPlans?.find((d: any) => d.id === activeDietId) || sortedDietPlans?.[0];
    const meals = diet?.meals || [];

    // Check if we have any specific day meals to decide if we show tabs
    const hasSpecificDays = meals.some((m: any) => m.day_of_week !== null && m.day_of_week !== undefined);

    // Filter meals for the current view
    const displayedMeals = React.useMemo(() => {
        if (!hasSpecificDays) {
            // If no specific days, show all meals (Daily plan)
            return [...meals].sort((a: any, b: any) => (a.time_of_day || '').localeCompare(b.time_of_day || ''));
        }

        return meals.filter((meal: any) => {
            const isDaily = meal.day_of_week === null || meal.day_of_week === undefined;
            const isToday = meal.day_of_week === activeDay;
            return isDaily || isToday;
        }).sort((a: any, b: any) => (a.time_of_day || '').localeCompare(b.time_of_day || ''));
    }, [meals, hasSpecificDays, activeDay]);

    // Calculate totals for displayed meals
    const dailyTotals = React.useMemo(() => {
        return displayedMeals.reduce((acc: any, meal: any) => {
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
        weekDays.find(d => d.id === 0) || weekDays[0]
    ];

    const visiblePrimary = diet ? brandColors.primary : 'rgba(255,255,255,0.4)';

    return (
        <Container variant="page" seamless>
            <Header
                title={getTerminology(tenant, 'nutrition', 'Nutrição')}
                subtitle="PLANO ALIMENTAR"
                variant="hero"
            />

            <View style={styles.scrollContent}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={brandColors.primary}
                        />
                    }
                >
                    {diet ? (
                        <>
                            {/* Simplified Summary Module */}
                            <View style={styles.summaryModule}>
                                <View style={styles.summaryMainRow}>
                                    <View style={{ flex: 1 }}>
                                        <View style={[styles.statusBadge, { backgroundColor: brandColors.primary }]}>
                                            <Text style={[styles.statusLabel, { color: brandColors.secondary }]}>PLANO ATIVO</Text>
                                        </View>
                                        <Text style={styles.planName} numberOfLines={1}>
                                            {diet.day_label ? diet.day_label.replace('_', ' ').toUpperCase() : (diet.name || diet.title).toUpperCase()}
                                        </Text>
                                    </View>

                                    <View style={styles.kcalBadge}>
                                        <Flame size={14} color={brandColors.primary} fill={brandColors.primary} />
                                        <Text style={styles.kcalValue}>
                                            {Math.round(dailyTotals.kcal) || diet.daily_calories || '--'}
                                        </Text>
                                        <Text style={styles.kcalLabel}>KCAL</Text>
                                    </View>
                                </View>

                                <View style={styles.macroRowSimplified}>
                                    <View style={styles.macroItemSmall}>
                                        <Text style={styles.macroTag}>P</Text>
                                        <Text style={styles.macroVal}>{Math.round(dailyTotals.protein)}g</Text>
                                    </View>
                                    <View style={styles.macroItemSmall}>
                                        <Text style={styles.macroTag}>C</Text>
                                        <Text style={styles.macroVal}>{Math.round(dailyTotals.carbs)}g</Text>
                                    </View>
                                    <View style={styles.macroItemSmall}>
                                        <Text style={styles.macroTag}>G</Text>
                                        <Text style={styles.macroVal}>{Math.round(dailyTotals.fats)}g</Text>
                                    </View>
                                </View>

                                {diet.description && (
                                    <View style={styles.minimalInstructions}>
                                        <Text style={styles.instructionsText} numberOfLines={2}>{diet.description}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Strategy Selection */}
                            {sortedDietPlans && sortedDietPlans.length > 1 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ marginBottom: 20 }}
                                    contentContainerStyle={{ gap: 8 }}
                                >
                                    {sortedDietPlans.map((plan: any) => (
                                        <TouchableOpacity
                                            key={plan.id}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                setActiveDietId(plan.id);
                                            }}
                                            style={[
                                                styles.strategyTab,
                                                activeDietId === plan.id && { backgroundColor: brandColors.primary }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.strategyTabText,
                                                activeDietId === plan.id ? { color: brandColors.secondary } : { color: 'rgba(255,255,255,0.4)' }
                                            ]}>
                                                {plan.day_label ? plan.day_label.replace('_', ' ').toUpperCase() : getTerminology(tenant, 'nutrition', 'Dieta').toUpperCase()}
                                            </Text>
                                            {plan.days_of_week && plan.days_of_week.length > 0 && (
                                                <View style={styles.dotIndicatorRow}>
                                                    {plan.days_of_week.map((dayNum: number, i: number) => (
                                                        <Text
                                                            key={i}
                                                            style={[
                                                                styles.dayInitialText,
                                                                { color: activeDietId === plan.id ? brandColors.secondary : brandColors.primary }
                                                            ]}
                                                        >
                                                            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'][dayNum]}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            {/* Weekly Tabs (Bento Style) */}
                            {hasSpecificDays && (
                                <View style={styles.navWrapper}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                                        {sortedWeekDays.map(day => (
                                            <TouchableOpacity
                                                key={day.id}
                                                onPress={() => handleDayChange(day.id)}
                                                style={[
                                                    styles.dayTab,
                                                    activeDay === day.id && { backgroundColor: 'rgba(255,255,255,0.06)' }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.dayTabText,
                                                    activeDay === day.id ? { color: '#FFF' } : { color: 'rgba(255,255,255,0.3)' }
                                                ]}>
                                                    {day.label}
                                                </Text>
                                                {activeDay === day.id && (
                                                    <View style={[styles.activeIndicator, { backgroundColor: brandColors.primary }]} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionLabel}>
                                    {hasSpecificDays
                                        ? `PLANILHA DE ${weekDays.find(d => d.id === activeDay)?.label}`
                                        : "REFEICOES DIARIAS"
                                    }
                                </Text>
                                <View style={[styles.mealCount, { backgroundColor: `${brandColors.primary}15` }]}>
                                    <Text style={[styles.countText, { color: brandColors.primary }]}>{displayedMeals.length}</Text>
                                </View>
                            </View>

                            {displayedMeals.length > 0 ? (
                                displayedMeals.map((meal: any, index: number) => {
                                    return (
                                        <View
                                            key={meal.id}
                                        >
                                            <TouchableOpacity
                                                style={styles.mealCardSimplified}
                                                onPress={() => setSelectedMeal(meal)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.mealRow}>
                                                    <View style={styles.mealTimeContainer}>
                                                        <Text style={[styles.mealTimeText, { color: brandColors.primary }]}>
                                                            {meal.time_of_day ? meal.time_of_day.slice(0, 5) : '--:--'}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                                        <Text style={styles.mealNameText} numberOfLines={1}>{meal.name}</Text>
                                                        {meal.foods && (
                                                            <Text style={styles.mealFoodsText} numberOfLines={1}>
                                                                {meal.foods.slice(0, 3).map((f: any) => f.name).join(', ')}
                                                                {meal.foods.length > 3 ? '...' : ''}
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<Apple size={40} color={brandColors.primary} />}
                                    title="Nenhuma refeicao"
                                    description="Nenhuma refeicao especifica para este dia."
                                />
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={<Target size={40} color={brandColors.primary} />}
                            title="Nenhuma Dieta Ativa"
                            description="Seu plano alimentar estrategico aparecera aqui em breve."
                        />
                    )}
                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>

            {/* Premium Meal Modal */}
            <Modal
                visible={!!selectedMeal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSelectedMeal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIcon, { backgroundColor: `${brandColors.primary}15` }]}>
                                <Apple size={24} color={brandColors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>{selectedMeal?.name}</Text>
                                <View style={styles.modalMetaRow}>
                                    <Clock size={12} color="rgba(255,255,255,0.4)" />
                                    <Text style={styles.modalMetaText}>
                                        {selectedMeal?.time_of_day ? selectedMeal.time_of_day.slice(0, 5) : 'Horario sugerido'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedMeal(null)} style={styles.closeBtn}>
                                <X size={20} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {selectedMeal?.description && (
                                <View style={styles.instructionBox}>
                                    <Text style={styles.boxLabel}>OBSERVACOES</Text>
                                    <Text style={styles.boxText}>{selectedMeal.description}</Text>
                                </View>
                            )}

                            <Text style={styles.foodsTitleLabel}>COMPOSICAO DA REFEICAO</Text>
                            {selectedMeal?.foods?.map((food: any, i: number) => (
                                <View key={i} style={styles.foodItem}>
                                    <View style={styles.foodInfo}>
                                        <Text style={styles.foodName}>{food.name}</Text>
                                        <Text style={styles.foodQty}>{food.qty} {food.unit}</Text>
                                    </View>
                                    <View style={styles.foodMacros}>
                                        <Text style={styles.foodKcal}>{Math.round(food.kcal)} KCAL</Text>
                                        <Text style={styles.foodMacroDetail}>
                                            P:{Math.round(food.protein)}g | C:{Math.round(food.carbs)}g | G:{Math.round(food.fats)}g
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {(!selectedMeal?.foods || selectedMeal.foods.length === 0) && (
                                <Text style={styles.emptyFoodsText}>Nenhum alimento listado detalhadamente.</Text>
                            )}
                        </ScrollView>

                        <Button
                            title="ENTENDIDO"
                            onPress={() => setSelectedMeal(null)}
                            brandColors={brandColors}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </Container>);
}

const styles = StyleSheet.create({
    // Simplified Nutrition Styles
    summaryModule: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    summaryMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    planName: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
    },
    kcalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    kcalValue: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    kcalLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.3)',
    },
    macroRowSimplified: {
        flexDirection: 'row',
        gap: 12,
    },
    macroItemSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    macroTag: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.2)',
    },
    macroVal: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFF',
    },
    minimalInstructions: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.03)',
    },
    strategyTab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        minWidth: 100,
    },
    strategyTabText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    dotIndicatorRow: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 6,
    },
    dayInitialText: {
        fontSize: 9,
        fontWeight: '900',
    },
    mealCardSimplified: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 18,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealTimeContainer: {
        width: 50,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.05)',
        paddingRight: 10,
    },
    mealTimeText: {
        fontSize: 12,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    mealNameText: {
        fontSize: 15,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    mealFoodsText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        flex: 1,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 10,
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
    },
    mealCount: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    countText: {
        fontSize: 10,
        fontWeight: '900',
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
        gap: 16,
        marginBottom: 20,
    },
    modalIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    modalMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    modalMetaText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
    },
    closeBtn: {
        padding: 8,
    },
    modalBody: {
        marginVertical: 10,
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
    foodsTitleLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
        marginBottom: 2,
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
        marginTop: 2,
        fontWeight: '700',
    },
    emptyFoodsText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 32,
    },
    navWrapper: {
        marginBottom: 20,
    },
    tabsContainer: {
        gap: 8,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 12,
        height: 2,
        borderRadius: 1,
    },
    dayTab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    dayTabText: {
        fontSize: 12,
        fontWeight: '800',
    },
    instructionsText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#FFF',
        fontStyle: 'italic',
    }
});
