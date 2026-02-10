import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, Platform, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Container, Header, EmptyState, LoadingSpinner, Button } from '../../components/ui';
import { Apple, Clock, Flame, X, ChevronRight, Target, Activity } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteDiet } from '../../hooks/useAthleteData';
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
    const hasSpecificDays = meals.some((m: any) => m.day_of_week !== null && m.day_of_week !== undefined);

    // Filter meals for the current view
    const displayedMeals = React.useMemo(() => {
        if (!hasSpecificDays) {
            // If no specific days, show all meals (Daily plan)
            return [...meals].sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''));
        }

        return meals.filter((meal: any) => {
            const isDaily = meal.day_of_week === null || meal.day_of_week === undefined;
            const isToday = meal.day_of_week === activeDay;
            return isDaily || isToday;
        }).sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''));
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
        weekDays.find(d => d.id === 0)!
    ];

    const visiblePrimary = diet ? brandColors.primary : 'rgba(255,255,255,0.4)';

    return (
        <Container variant="page" seamless>
            <Header
                title="Nutrição"
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
                            {/* Reacticx Summary Module */}
                            <Animated.View
                                entering={FadeInDown.delay(100).duration(600).springify()}
                                style={styles.summaryModule}
                            >
                                <View style={styles.summaryHeader}>
                                    <View style={[styles.statusBadge, { backgroundColor: brandColors.primary }]}>
                                        <Text style={[styles.statusLabel, { color: brandColors.secondary }]}>PLANO ATIVO</Text>
                                    </View>
                                </View>

                                <Text style={styles.planName}>{diet.title}</Text>

                                <View style={styles.readoutContainer}>
                                    <View style={styles.mainReadout}>
                                        <View style={styles.kcalContainer}>
                                            <Flame size={20} color={brandColors.primary} />
                                            <View>
                                                <Text style={styles.kcalValue}>
                                                    {Math.round(dailyTotals.kcal) || diet.daily_calories || '--'}
                                                </Text>
                                                <Text style={styles.kcalLabel}>KCAL / DIA</Text>
                                            </View>
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
                            </Animated.View>

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
                                        : `REFEIÇÕES DIÁRIAS`
                                    }
                                </Text>
                                <View style={[styles.mealCount, { backgroundColor: `${brandColors.primary}15` }]}>
                                    <Text style={[styles.countText, { color: brandColors.primary }]}>{displayedMeals.length}</Text>
                                </View>
                            </View>

                            {displayedMeals.length > 0 ? (
                                displayedMeals.map((meal: any, index: number) => (
                                    <Animated.View
                                        key={meal.id}
                                        entering={FadeInDown.delay(index * 100).duration(600).springify()}
                                    >
                                        <TouchableOpacity
                                            style={styles.mealCard}
                                            onPress={() => setSelectedMeal(meal)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.mealHeader}>
                                                <View style={[styles.timeBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                                    <Clock size={12} color="rgba(255,255,255,0.4)" />
                                                    <Text style={styles.timeText}>
                                                        {meal.time ? meal.time.slice(0, 5) : `Ref ${index + 1}`}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.mealTitle} numberOfLines={1}>{meal.name}</Text>
                                                    {meal.description && (
                                                        <Text style={styles.mealDescription} numberOfLines={1}>
                                                            {meal.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                <View style={styles.actionIcon}>
                                                    <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                                                </View>
                                            </View>

                                            {meal.foods && meal.foods.length > 0 && (
                                                <View style={styles.foodsPreview}>
                                                    <Text style={styles.previewText} numberOfLines={1}>
                                                        {meal.foods.map((f: any) => f.name).join(', ')}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
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
                            description="Seu plano alimentar estratégico aparecerá aqui em breve."
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
                                        {selectedMeal?.time ? selectedMeal.time.slice(0, 5) : 'Horário sugerido'}
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
                                    <Text style={styles.boxLabel}>OBSERVAÇÕES</Text>
                                    <Text style={styles.boxText}>{selectedMeal.description}</Text>
                                </View>
                            )}

                            <Text style={styles.foodsTitleLabel}>COMPOSIÇÃO DA REFEIÇÃO</Text>
                            {selectedMeal?.foods?.map((food: any, i: number) => (
                                <View key={i} style={styles.foodItem}>
                                    <View style={styles.foodInfo}>
                                        <Text style={styles.foodName}>{food.name}</Text>
                                        <Text style={styles.foodQty}>{food.qty} {food.unit}</Text>
                                    </View>
                                    <View style={styles.foodMacros}>
                                        <Text style={styles.foodKcal}>{Math.round(food.kcal)} KCAL</Text>
                                        <Text style={styles.foodMacroDetail}>
                                            P:{Math.round(food.protein)}g • C:{Math.round(food.carbs)}g • G:{Math.round(food.fats)}g
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
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        flex: 1,
    },
    // Redesigned Summary Module (Reacticx)
    summaryModule: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusLabel: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    planName: {
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
        marginBottom: 20,
    },
    readoutContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    mainReadout: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
    },
    kcalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    kcalValue: {
        fontSize: 24,
        fontFamily: Platform.OS === 'ios' ? 'Syne-Bold' : 'Syne_700Bold',
        color: '#FFF',
    },
    kcalLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 0.5,
    },
    macroGrid: {
        flexDirection: 'column',
        gap: 6,
        flex: 1,
        maxWidth: 120,
    },
    macroBox: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    macroLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
    },
    macroValueSmall: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },

    // Redesigned Nav Tabs (Bento Style)
    navWrapper: {
        marginBottom: 24,
    },
    tabsContainer: {
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    dayTab: {
        width: 50,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayTabText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 6,
        width: 10,
        height: 2,
        borderRadius: 1,
    },

    // Section Styling
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.5)',
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

    // Cards (Reacticx)
    mealCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    timeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFF',
    },
    mealTitle: {
        fontSize: 17,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
        marginBottom: 2,
    },
    mealDescription: {
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        color: 'rgba(255,255,255,0.4)',
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.02)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    foodsPreview: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.03)',
    },
    previewText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '500',
    },

    // Modal Styles (Reacticx)
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
    }
});
