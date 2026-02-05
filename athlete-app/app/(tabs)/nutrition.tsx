import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Container, Header, EmptyState, LoadingSpinner } from '../../components/ui';
import { Apple, Clock, Flame, Utensils } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteDiet } from '../../hooks/useAthleteData';

export default function NutritionScreen() {
    const { brandColors } = useAuth();
    const { data: diet, isLoading, refetch, isRefetching } = useAthleteDiet();

    if (isLoading) {
        return <LoadingSpinner message="Carregando dieta..." />;
    }

    const meals = diet?.meals || [];
    // Ordenar refeições por horário se possível, ou ordem de criação
    const sortedMeals = [...meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    return (
        <Container variant="page">
            <Header
                title="Dieta"
                subtitle="Combustível Tático"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
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
                        <View style={[styles.infoCard, { borderColor: `${brandColors.primary}20` }]}>
                            <Text style={styles.planTitle}>{diet.title}</Text>
                            <View style={styles.macrosRow}>
                                <View style={styles.macroItem}>
                                    <Flame size={14} color={brandColors.primary} />
                                    <Text style={styles.macroValue}>
                                        {diet.daily_calories || '--'} <Text style={styles.macroLabel}>kcal</Text>
                                    </Text>
                                </View>
                                {diet.protein_grams && (
                                    <Text style={styles.macroText}>P: {diet.protein_grams}g</Text>
                                )}
                                {diet.carbs_grams && (
                                    <Text style={styles.macroText}>C: {diet.carbs_grams}g</Text>
                                )}
                                {diet.fats_grams && (
                                    <Text style={styles.macroText}>G: {diet.fats_grams}g</Text>
                                )}
                            </View>
                        </View>

                        <Text style={styles.sectionLabel}>REFEIÇÕES ({meals.length})</Text>

                        {sortedMeals.length > 0 ? (
                            sortedMeals.map((meal, index) => (
                                <View
                                    key={meal.id}
                                    style={[styles.mealCard, { borderColor: 'rgba(255,255,255,0.05)' }]}
                                >
                                    <View style={styles.mealHeader}>
                                        <View style={styles.timeBadge}>
                                            <Clock size={12} color={brandColors.primary} />
                                            <Text style={[styles.timeText, { color: brandColors.primary }]}>
                                                {meal.time ? meal.time.slice(0, 5) : `Ref ${index + 1}`}
                                            </Text>
                                        </View>
                                        <Text style={styles.mealTitle}>{meal.name}</Text>
                                    </View>

                                    {meal.description && (
                                        <View style={styles.mealContent}>
                                            <Text style={styles.mealDescription}>
                                                {meal.description}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Nenhuma refeição cadastrada neste plano.</Text>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<Apple size={40} color={brandColors.primary} />}
                        title="Nenhuma Dieta Disponível"
                        description="Seu plano alimentar aparecerá aqui assim que seu profissional criar para você."
                    />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderRadius: 4,
        padding: 16,
        marginBottom: 24,
        transform: [{ skewX: '-2deg' }],
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFF',
        marginBottom: 8,
        transform: [{ skewX: '2deg' }],
    },
    macrosRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        transform: [{ skewX: '2deg' }],
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    macroValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    macroLabel: {
        fontSize: 11,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.5)',
    },
    macroText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    mealCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        padding: 12,
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
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    mealContent: {
        paddingLeft: 4,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(255,255,255,0.1)',
        marginLeft: 4,
    },
    mealDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 20,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    }
});
