import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container, Header, LoadingSpinner, EmptyState } from '../../components/ui';
import { useWorkoutDetail } from '../../hooks/useAthleteData';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutExerciseCard } from '../../components/WorkoutExerciseCard';
import { Play, CheckCircle2, Clock, RotateCcw, Dumbbell, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

/**
 * Tela de Detalhes/Execução do Treino
 * Exibe lista de exercícios, cargas, repetições e GIFs explicativos
 */
export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { brandColors } = useAuth();
    const { data: workout, isLoading } = useWorkoutDetail(id as string);
    const [selectedExercise, setSelectedExercise] = useState<any>(null); // Para modal de GIF full
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

    const toggleExercise = (index: number) => {
        setCompletedExercises(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    if (isLoading) {
        return <LoadingSpinner message="Carregando treino..." />;
    }

    if (!workout) {
        return (
            <Container variant="page">
                <Header title="Erro" subtitle="Treino não encontrado" />
                <EmptyState
                    icon={<Dumbbell size={40} color={brandColors.primary} />}
                    title="Erro ao carregar"
                    description="Não conseguimos encontrar este treino."
                />
            </Container>
        );
    }

    const exercises = workout.exercises || [];

    return (
        <Container variant="page">
            <Header
                title="Execução"
                subtitle={workout.title}
                onBack={() => router.back()}
                variant="default"
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Workout Header Info */}
                <View style={[styles.summaryCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={styles.summaryItem}>
                        <Dumbbell size={16} color={brandColors.primary} />
                        <Text style={styles.summaryText}>{exercises.length} Exercícios</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Clock size={16} color={brandColors.primary} />
                        <Text style={styles.summaryText}>~60 min</Text>
                    </View>
                </View>

                {/* Exercises List */}
                {exercises.map((exercise: any, index: number) => (
                    <WorkoutExerciseCard
                        key={exercise.id || index}
                        exercise={exercise}
                        index={index}
                        isCompleted={completedExercises.has(index)}
                        onToggleComplete={() => toggleExercise(index)}
                        onPressMedia={(ex) => setSelectedExercise({
                            ...ex,
                            gifUrl: ex.gifUrl,
                            exerciseName: ex.exerciseName
                        })}
                    />
                ))}

                <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: brandColors.primary }]}
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        // TODO: Implement completion logic
                        router.back();
                    }}
                >
                    <CheckCircle2 color={brandColors.secondary} size={20} />
                    <Text style={[styles.completeText, { color: brandColors.secondary }]}>CONCLUIR TREINO</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Modal de Visualização Ampliada */}
            {selectedExercise && (
                <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedExercise(null)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedExercise.exerciseName}</Text>
                                <TouchableOpacity onPress={() => setSelectedExercise(null)} style={styles.closeButton}>
                                    <X size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalMediaContainer}>
                                <Image
                                    source={{ uri: selectedExercise.gifUrl }}
                                    style={styles.fullImage}
                                    resizeMode="contain"
                                />
                            </View>
                            {selectedExercise.notes && (
                                <Text style={styles.modalNotes}>{selectedExercise.notes}</Text>
                            )}
                        </View>
                    </View>
                </Modal>
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
        marginBottom: 24,
        borderWidth: 1,
        borderRadius: 4,
        transform: [{ skewX: '-2deg' }],
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        transform: [{ skewX: '2deg' }],
    },
    summaryText: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    exerciseCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderRadius: 4,
        padding: 16,
        marginBottom: 16,
        transform: [{ skewX: '-2deg' }],
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
        transform: [{ skewX: '2deg' }],
    },
    indexBadge: {
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: {
        fontSize: 12,
        fontWeight: '900',
    },
    exerciseName: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    mediaContainer: {
        height: 200,
        backgroundColor: '#000',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ skewX: '2deg' }],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    playOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    noMediaContainer: {
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 4,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 16,
        transform: [{ skewX: '2deg' }],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    noMediaContent: {
        flex: 1,
    },
    noMediaTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    noMediaText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
    },
    prescriptionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 4,
        transform: [{ skewX: '2deg' }],
    },
    prescriptionItem: {
        alignItems: 'center',
        flex: 1,
    },
    prescriptionLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '900',
        marginBottom: 4,
    },
    prescriptionValue: {
        fontSize: 14,
        fontWeight: '900',
    },
    notesContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 4,
        transform: [{ skewX: '2deg' }],
    },
    noteText: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '600',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 20,
        gap: 10,
        transform: [{ skewX: '-5deg' }],
    },
    completeText: {
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 1,
        transform: [{ skewX: '5deg' }],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 16,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 16,
        fontStyle: 'italic',
        textTransform: 'uppercase',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    modalMediaContainer: {
        height: 300,
        backgroundColor: '#000',
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    modalNotes: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        lineHeight: 20,
        marginTop: 8,
    }
});
