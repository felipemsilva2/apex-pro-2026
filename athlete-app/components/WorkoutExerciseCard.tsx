import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabaseUrl } from '../lib/supabase';
import { Play, AlertCircle, ImageOff, Dumbbell, CheckCircle2, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface WorkoutExerciseCardProps {
    exercise: any;
    index: number;
    isCompleted?: boolean;
    onToggleComplete?: () => void;
    onPressMedia: (exercise: any) => void;
}

export const WorkoutExerciseCard = ({ exercise, index, isCompleted = false, onToggleComplete, onPressMedia }: WorkoutExerciseCardProps) => {
    const { brandColors } = useAuth();
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // State para controlar estratégia de carregamento
    const [loadStrategy, setLoadStrategy] = useState<'proxy' | 'direct' | 'error'>('proxy');

    // Recupera URL original de várias fontes possíveis
    const rawUrl = exercise.gif_url || exercise.video_url || exercise.exercise?.gif_url || exercise.exercise?.video_url;

    // Constrói URL absoluta se for relativa (Supabase Storage)
    const fullUrl = useMemo(() => {
        if (!rawUrl) return null;
        if (rawUrl.startsWith('http')) return rawUrl;
        if (rawUrl.startsWith('/')) {
            return `${supabaseUrl}/storage/v1/object/public${rawUrl}`;
        }
        return rawUrl;
    }, [rawUrl]);

    // Constrói URL Proxy baseada na URL completa
    const proxyUrl = fullUrl ? `https://wsrv.nl/?url=${encodeURIComponent(fullUrl)}&output=gif` : null;

    // Define source baseado na estratégia atual
    const imageSource = useMemo(() => {
        if (!fullUrl) return null;
        if (loadStrategy === 'proxy') return { uri: proxyUrl };
        return {
            uri: fullUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        };
    }, [fullUrl, proxyUrl, loadStrategy]);

    const handleImageError = (e: any) => {
        // console.log(`Erro carregando imagem (${loadStrategy}):`, e.nativeEvent.error);
        if (loadStrategy === 'proxy') {
            setLoadStrategy('direct'); // Fallback para direto com headers
        } else {
            // console.log("Falha total na imagem:", fullUrl);
            setLoadStrategy('error'); // Falha final
        }
        // Não para o loading ainda pois vai tentar de novo, a menos que seja erro final
        if (loadStrategy === 'direct') setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    // Fallback para nome
    const exerciseName = exercise.exercise_name || exercise.exercise?.name_pt || exercise.exercise?.name || "Exercício sem nome";

    return (
        <View style={[
            styles.exerciseCard,
            { borderColor: isCompleted ? brandColors.primary : `${brandColors.primary}20` },
            isCompleted && { backgroundColor: `${brandColors.primary}10` }
        ]}>
            <View style={styles.exerciseHeader}>
                <View style={[
                    styles.indexBadge,
                    { backgroundColor: isCompleted ? brandColors.primary : `${brandColors.primary}40` }
                ]}>
                    <Text style={[styles.indexText, { color: brandColors.secondary }]}>
                        {index + 1}
                    </Text>
                </View>
                <Text style={[
                    styles.exerciseName,
                    isCompleted && { textDecorationLine: 'line-through', opacity: 0.7 }
                ]}>{exerciseName}</Text>

                {onToggleComplete && (
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            onToggleComplete();
                        }}
                        style={styles.checkButton}
                    >
                        {isCompleted ? (
                            <CheckCircle2 color={brandColors.primary} size={28} fill={`${brandColors.primary}20`} />
                        ) : (
                            <Circle color={brandColors.primary} size={28} strokeWidth={1.5} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Mídia com tratamento de erro e loading */}
            {!isCompleted && (
                fullUrl && loadStrategy !== 'error' ? (
                    <TouchableOpacity
                        style={styles.mediaContainer}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onPressMedia({ ...exercise, gifUrl: imageSource?.uri, exerciseName });
                        }}
                    >
                        {imageLoading && (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator color={brandColors.primary} />
                            </View>
                        )}
                        <Image
                            source={imageSource as any}
                            style={styles.mediaPreview}
                            resizeMode="cover"
                            onError={handleImageError}
                            onLoadEnd={handleImageLoad}
                        />
                        {!imageLoading && (
                            <View style={styles.playOverlay}>
                                <Play size={24} color="#FFF" fill="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.noMediaContainer}>
                        <Dumbbell size={32} color="rgba(255,255,255,0.1)" strokeWidth={1.5} />
                        <View style={styles.noMediaContent}>
                            <Text style={styles.noMediaTitle}>Visualização não disponível</Text>
                            <Text style={styles.noMediaText}>Toque para ver detalhes</Text>
                        </View>
                    </View>
                )
            )}

            {/* Prescrições (Esconder se completado para limpar visual?) Não, manter mas dim */}
            <View style={[styles.prescriptionGrid, isCompleted && { opacity: 0.5 }]}>
                <View style={styles.prescriptionItem}>
                    <Text style={styles.prescriptionLabel}>SETS</Text>
                    <Text style={[styles.prescriptionValue, { color: brandColors.primary }]}>
                        {exercise.sets || '--'}
                    </Text>
                </View>
                <View style={styles.prescriptionItem}>
                    <Text style={styles.prescriptionLabel}>REPS</Text>
                    <Text style={[styles.prescriptionValue, { color: brandColors.primary }]}>
                        {exercise.reps || '--'}
                    </Text>
                </View>
                <View style={styles.prescriptionItem}>
                    <Text style={styles.prescriptionLabel}>CARGA</Text>
                    <Text style={[styles.prescriptionValue, { color: brandColors.primary }]}>
                        {exercise.weight_kg ? `${exercise.weight_kg}kg` : '--'}
                    </Text>
                </View>
                <View style={styles.prescriptionItem}>
                    <Text style={styles.prescriptionLabel}>REST</Text>
                    <Text style={[styles.prescriptionValue, { color: brandColors.primary }]}>
                        {exercise.rest_seconds ? `${exercise.rest_seconds}s` : '--'}
                    </Text>
                </View>
            </View>

            {exercise.notes && !isCompleted && (
                <View style={[styles.notesContainer, { backgroundColor: `${brandColors.primary}10` }]}>
                    <Text style={[styles.noteText, { color: brandColors.primary }]}>💡 {exercise.notes}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
    checkButton: {
        padding: 4,
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
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 1,
    },
    playOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        zIndex: 2,
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
});
