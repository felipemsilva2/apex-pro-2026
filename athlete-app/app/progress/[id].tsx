import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container, Header, LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteAssessments } from '../../hooks/useAthleteData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Share2, ArrowLeft, TrendingUp, TrendingDown, Minus, Camera, Trophy, User, MessageSquareText, Info, Clock } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';

import { captureRef } from 'react-native-view-shot';

// Screen dimensions for responsive layout
const { width } = Dimensions.get('window');

export default function AssessmentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { profile, brandColors, tenant } = useAuth();
    const { data: assessments, isLoading } = useAthleteAssessments();
    const cardRef = useRef(null);

    // Find key data
    const assessmentsData = assessments as any[];
    const currentAssessmentIndex = assessmentsData?.findIndex(a => a.id === id);
    const assessment = assessmentsData?.[currentAssessmentIndex ?? -1];
    const previousAssessment = assessmentsData?.[(currentAssessmentIndex ?? -1) + 1];

    const handleShare = async () => {
        try {
            if (!cardRef.current) return;

            const uri = await captureRef(cardRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile'
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    dialogTitle: 'Compartilhar Progresso',
                    mimeType: 'image/png',
                    UTI: 'public.png'
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Optional: Add an alert here if sharing fails
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (!assessment) {
        return (
            <Container variant="page">
                <Header title="Detalhes" variant="default" />
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>Avaliação não encontrada.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Vololtar</Text>
                    </TouchableOpacity>
                </View>
            </Container>
        );
    }

    // Calculations
    const weightDelta = previousAssessment ? assessment.weight_kg - previousAssessment.weight_kg : 0;
    const bodyFatDelta = (previousAssessment?.body_fat_percentage && assessment.body_fat_percentage)
        ? assessment.body_fat_percentage - previousAssessment.body_fat_percentage
        : 0;
    const leanMassDelta = (previousAssessment?.lean_mass_kg && assessment.lean_mass_kg)
        ? assessment.lean_mass_kg - previousAssessment.lean_mass_kg
        : 0;
    const fatMassDelta = (previousAssessment?.fat_mass_kg && assessment.fat_mass_kg)
        ? assessment.fat_mass_kg - previousAssessment.fat_mass_kg
        : 0;

    // Keywords for positive reinforcement
    const positiveKeywords = ['massa', 'ganho', 'evolução', 'boa', 'top', 'parabéns', 'excelente', 'conquistada', 'músculo'];
    const hasPositiveFeedback = assessment.coach_feedback &&
        positiveKeywords.some(word => assessment.coach_feedback?.toLowerCase().includes(word));

    // Success detection: Weight loss OR (Weight gain + (stable fat OR positive coach feedback))
    const isSuccess = weightDelta < -0.3 ||
        (weightDelta > 0.3 && (fatMassDelta <= 0.2 || hasPositiveFeedback));

    const successColor = '#10B981';
    const warningColor = '#94A3B8'; // More neutral for "Improvement" state

    // Messaging based on results and coach evaluation
    const getStatusContent = () => {
        // State 1: Awaiting review
        if (assessment.status === 'pending') {
            return {
                title: "AGUARDANDO AVALIAÇÃO",
                subtitle: "O seu personal está analisando seus dados.",
                icon: Clock,
                color: '#94A3B8'
            };
        }

        // State 2: Categorized review
        if (assessment.coach_category === 'needs_improvement') {
            return {
                title: "FOCO NO PLANO",
                subtitle: "Ajustando a rota com o seu treinador para chegar lá.",
                icon: Info,
                color: '#EF4444'
            };
        }

        if (assessment.coach_category === 'good_progress') {
            return {
                title: "EVOLUÇÃO CONSTANTE",
                subtitle: "Você está indo muito bem! Mantenha a constância.",
                icon: Trophy,
                color: '#3B82F6'
            };
        }

        if (assessment.coach_category === 'excellent') {
            return {
                title: "EXCELENTE / NO PLANO",
                subtitle: "Resultado incrível! Você está voando.",
                icon: Trophy,
                color: '#10B981'
            };
        }

        // Fallback: Automatic detection (for legacy assessments without category)
        if (isSuccess) {
            return {
                title: "EVOLUÇÃO CONSTANTE",
                subtitle: "Cada passo conta na sua jornada de sucesso!",
                icon: Trophy,
                color: successColor
            };
        }

        return {
            title: "FOCO NA CONSTÂNCIA",
            subtitle: "Ajustando a rota com o seu treinador para chegar lá.",
            icon: Info,
            color: warningColor
        };
    };

    const status = getStatusContent();
    const StatusIcon = status.icon;

    const formattedDate = format(new Date(assessment.assessment_date), "d 'de' MMMM, yyyy", { locale: ptBR });

    // Helper for rendering deltas
    const renderDelta = (value: number, suffix: string, inverse: boolean = false) => {
        if (!previousAssessment || Math.abs(value) < 0.1) return null;
        const isPositive = value > 0;
        const isGood = inverse ? isPositive : !isPositive;
        const color = isGood ? '#10B981' : '#EF4444';
        const Icon = isPositive ? TrendingUp : TrendingDown;

        return (
            <View style={[styles.deltaBadge, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
                <Icon size={14} color={color} />
                <Text style={[styles.deltaText, { color }]}>
                    {Math.abs(value).toFixed(1)}{suffix}
                </Text>
            </View>
        );
    };

    return (
        <Container variant="page">
            <View style={styles.safeHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navBack}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>RELATÓRIO DE EVOLUÇÃO</Text>
                <TouchableOpacity style={styles.navShare} onPress={handleShare}>
                    <Share2 size={24} color={brandColors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* SHAREABLE CARD CONTAINER */}
                <View
                    ref={cardRef}
                    collapsable={false}
                    style={[styles.storyCardShadow, { backgroundColor: '#000' }]} // Added bg color to ensure capture has background
                >
                    <View style={[styles.storyCardContent, { borderColor: `${brandColors.primary}20` }]}>

                        {/* Header Strip */}
                        <View style={[styles.cardHeader, { backgroundColor: brandColors.primary }]}>
                            <Text style={[styles.cardHeaderTitle, { color: brandColors.secondary }]}>
                                CHECK-IN {assessment.status === 'reviewed' ? 'VALIDADO' : 'EM ANÁLISE'}
                            </Text>
                        </View>

                        {/* Content Body */}
                        <View style={styles.cardBody}>

                            {/* Athlete Info (Compact) */}
                            <View style={styles.athleteInfo}>
                                <View style={styles.avatarContainer}>
                                    {profile?.avatar_url ? (
                                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatarPlaceholder, { backgroundColor: brandColors.primary }]}>
                                            <Text style={[styles.avatarInitials, { color: brandColors.secondary }]}>
                                                {profile?.full_name?.substring(0, 2) || 'AT'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.athleteName}>{profile?.full_name}</Text>
                                    <Text style={styles.assessmentDate}>{formattedDate}</Text>
                                </View>
                            </View>

                            {/* HERO STAT: The Main Result */}
                            <View style={styles.heroStatContainer}>
                                <Text style={styles.heroStatLabel}>SUA JORNADA</Text>
                                <View style={styles.heroStatValueContainer}>
                                    <View style={[styles.heroIconCircle, { backgroundColor: `${status.color}20` }]}>
                                        <StatusIcon size={32} color={status.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.heroStatValue, { color: isSuccess ? status.color : '#FFF', fontSize: 22, lineHeight: 26 }]}>
                                            {status.title}
                                        </Text>
                                        <Text style={[styles.heroStatContext, { marginTop: 4 }]}>
                                            {status.subtitle}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Secondary Grid */}
                            <View style={styles.gridStats}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>PESO ATUAL</Text>
                                    <Text style={styles.gridValue}>{assessment.weight_kg.toFixed(1)}kg</Text>
                                    {renderDelta(weightDelta, 'kg', weightDelta < 0)}
                                </View>

                                {assessment.body_fat_percentage !== null && assessment.body_fat_percentage !== undefined && (
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>GORDURA</Text>
                                        <Text style={styles.gridValue}>
                                            {assessment.body_fat_percentage.toFixed(1)}%
                                        </Text>
                                        {renderDelta(bodyFatDelta, '%', true)}
                                    </View>
                                )}

                                {assessment.lean_mass_kg !== null && assessment.lean_mass_kg !== undefined && (
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>MASSA MAGRA</Text>
                                        <Text style={styles.gridValue}>
                                            {assessment.lean_mass_kg.toFixed(1)}kg
                                        </Text>
                                        {renderDelta(leanMassDelta, 'kg', false)}
                                    </View>
                                )}
                            </View>

                            {/* Verified Badge (Conditional) */}
                            {assessment.status === 'reviewed' && (
                                <View style={styles.verifiedBadge}>
                                    <View style={[styles.verifiedIcon, { backgroundColor: brandColors.primary }]}>
                                        <User size={12} color={brandColors.secondary} />
                                    </View>
                                    <Text style={[styles.verifiedText, { color: brandColors.primary }]}>
                                        VALIDADO PELO TREINADOR
                                    </Text>
                                </View>
                            )}

                            {/* Branding Footer */}
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.coachedBy}>ACOMPANHAMENTO POR</Text>
                                    <Text style={[styles.coachName, { color: '#FFF' }]}>
                                        {tenant?.business_name || 'PERSONAL TRAINER'}
                                    </Text>
                                </View>
                                <View style={styles.brandBadge}>
                                    <Text style={[styles.brandBadgeText, { color: brandColors.primary }]}>APEX PRO</Text>
                                </View>
                            </View>
                        </View>

                        {/* Decorative Elements */}
                        <View style={[styles.cornerTL, { borderColor: brandColors.primary }]} />
                        <View style={[styles.cornerBR, { borderColor: brandColors.primary }]} />
                    </View>
                </View>

                {/* Professional Analysis Section */}
                {assessment.coach_feedback && (
                    <View style={styles.feedbackContainer}>
                        <View style={styles.feedbackHeader}>
                            <MessageSquareText size={18} color={brandColors.primary} />
                            <Text style={[styles.feedbackTitle, { color: brandColors.primary }]}>
                                ANÁLISE DO TREINADOR
                            </Text>
                        </View>
                        <View style={styles.feedbackContent}>
                            <Text style={styles.feedbackText}>{assessment.coach_feedback}</Text>
                        </View>
                        <View style={styles.feedbackFooter}>
                            <Text style={styles.feedbackMeta}>Avaliado em {assessment.updated_at ? format(new Date(assessment.updated_at), "dd/MM 'às' HH:mm") : '--/--'}</Text>
                        </View>
                    </View>
                )}

                <Text style={styles.shareHint}>
                    Tire um print ou toque no ícone acima para compartilhar seu progresso.
                </Text>

            </ScrollView>
        </Container>
    );
}

// Simple Icon Component for reuse
const ActivityIcon = ({ color, size }: { color: string, size: number }) => (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }} />
);

const styles = StyleSheet.create({
    safeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60, // Safe Area top
        paddingBottom: 20,
    },
    navTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    navBack: {
        padding: 8,
    },
    navShare: {
        padding: 8,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 20,
    },
    backButton: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFF',
    },

    // Card Styles
    storyCardShadow: {
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderRadius: 24,
    },
    storyCardContent: {
        width: '100%',
        backgroundColor: '#121214',
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
        // iOS Continuous Curve for smoother corners
        ...Platform.select({
            ios: {
                borderCurve: 'continuous',
            },
        }),
    },
    cardHeader: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cardHeaderTitle: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    cardBody: {
        padding: 24,
    },
    athleteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    athleteName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    assessmentDate: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 2,
    },
    heroStatContainer: {
        alignItems: 'center',
        marginVertical: 32,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroStatLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 12,
    },
    heroStatValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    heroIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroStatValue: {
        color: '#FFF',
        fontSize: 56,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: -2,
    },
    heroStatUnit: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        color: 'rgba(255,255,255,0.4)',
        marginTop: 18,
    },
    heroStatContext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '500',
    },

    // Grid Stats
    gridStats: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 24,
    },
    gridItem: {
        flex: 1,
    },
    gridLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    gridValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    verifiedIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 20,
    },
    coachedBy: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 4,
    },
    coachName: {
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    brandBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
    },
    brandBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 2,
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 6,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 6,
    },
    shareHint: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 32,
    },
    deltaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 4,
    },
    deltaText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    feedbackContainer: {
        width: '100%',
        marginTop: 24,
        backgroundColor: '#1A1A1C',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    feedbackTitle: {
        fontSize: 12,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    feedbackContent: {
        padding: 16,
    },
    feedbackText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        lineHeight: 22,
    },
    feedbackFooter: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'flex-end',
    },
    feedbackMeta: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
