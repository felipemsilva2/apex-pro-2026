import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Linking,
    Share,
    Alert,
    RefreshControl,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useCoachProfile } from '../hooks/useAthleteData';
import { getBadgeStyle, getVisibleColor } from '../lib/whitelabel';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
    Award,
    Instagram,
    Globe,
    BookOpen,
    Info,
    Mail,
    X,
    ExternalLink,
    Music,
    Share2
} from 'lucide-react-native';

/**
 * Coach Profile Screen - Displays personal trainer's professional information
 * Premium Digital Business Card Layout
 */
export default function CoachProfileScreen() {
    const { tenant, brandColors } = useAuth();
    const router = useRouter();
    const { data: coachData, isLoading, refetch, isRefetching } = useCoachProfile();
    const viewRef = useRef(null);

    // Explicitly cast or handle the type for the coach data
    const coach = coachData as any;

    const primaryBadge = getBadgeStyle(brandColors.primary);
    const visiblePrimary = getVisibleColor(brandColors.primary);

    if (isLoading) {
        return <LoadingSpinner message="CARREGANDO PERFIL..." />;
    }

    const openSocial = (url: string | null) => {
        if (url) {
            Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
        }
    };

    const handleShare = async () => {
        try {
            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
                return;
            }

            // Capture the Master Card view as an image
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1.0,
            });

            // Share the image
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Compartilhar Perfil do Treinador',
                UTI: 'public.png',
            });
        } catch (error) {
            console.error('Error sharing image:', error);
            Alert.alert('Erro', 'Não foi possível gerar a imagem para compartilhamento.');
        }
    };

    return (
        <Container variant="page" seamless>
            <Header
                title="MEU TREINADOR"
                subtitle="CARTÃO PROFISSIONAL"
                onBack={() => router.back()}
                variant="hero"
                rightAction={
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity onPress={handleShare}>
                            <Share2 size={24} color={brandColors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.back()}>
                            <X size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>
                }
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
                {/* --- MASTER CARD (The "Instagrammable" Card) --- */}
                <View ref={viewRef} style={[styles.masterCard, { borderColor: `${brandColors.primary}40`, backgroundColor: '#000' }]}>
                    {/* Background Glow Effect */}
                    <View style={[styles.glowEffect, { backgroundColor: brandColors.primary }]} />

                    <View style={styles.masterHeader}>
                        <View style={[styles.avatarContainer, { borderColor: brandColors.primary }]}>
                            {coach?.avatar_url || tenant?.logo_url ? (
                                <Image
                                    source={{ uri: coach?.avatar_url || tenant?.logo_url }}
                                    style={styles.avatar}
                                    resizeMode={coach?.avatar_url ? "cover" : "contain"}
                                />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: `${brandColors.primary}20` }]}>
                                    <Award size={40} color={brandColors.primary} />
                                </View>
                            )}
                        </View>
                        <View style={styles.masterBasicInfo}>
                            <Text style={styles.coachName}>{coach?.full_name || tenant?.business_name}</Text>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, { backgroundColor: brandColors.primary }]}>
                                    <Text style={[styles.badgeText, { color: visiblePrimary }]}>TREINADOR PRO</Text>
                                </View>
                                {coach?.cref && (
                                    <View style={styles.crefBadge}>
                                        <Text style={styles.crefText}>CREF: {coach.cref}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Integrated Specialties */}
                    {coach?.specialty && (
                        <View style={styles.masterSection}>
                            <View style={styles.masterSectionHeader}>
                                <Award size={14} color={brandColors.primary} />
                                <Text style={[styles.masterSectionTitle, { color: brandColors.primary }]}>ESPECIALIDADE</Text>
                            </View>
                            <Text style={styles.masterSpecialtyText}>{coach.specialty}</Text>
                        </View>
                    )}

                    {/* Integrated Bio */}
                    {coach?.bio && (
                        <View style={styles.masterSection}>
                            <View style={styles.masterSectionHeader}>
                                <Info size={14} color={brandColors.primary} />
                                <Text style={[styles.masterSectionTitle, { color: brandColors.primary }]}>SOBRE O PROFISSIONAL</Text>
                            </View>
                            <Text style={styles.masterBioText}>{coach.bio}</Text>
                        </View>
                    )}

                    {/* Integrated Education */}
                    {coach?.education && (
                        <View style={styles.masterSection}>
                            <View style={styles.masterSectionHeader}>
                                <BookOpen size={14} color={brandColors.primary} />
                                <Text style={[styles.masterSectionTitle, { color: brandColors.primary }]}>FORMAÇÃO ACADÊMICA</Text>
                            </View>
                            <Text style={styles.masterEducationText}>{coach.education}</Text>
                        </View>
                    )}

                    {/* Contact Info Footer inside Master Card */}
                    {tenant?.contact_email && (
                        <View style={styles.masterFooter}>
                            <Mail size={12} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.masterFooterText}>{tenant.contact_email}</Text>
                        </View>
                    )}
                </View>

                {/* --- CONNECT SECTION (Socials & Links) --- */}
                <View style={styles.connectSection}>
                    <Text style={styles.connectLabel}>CONECTAR E LINKS</Text>
                    <View style={styles.connectGrid}>
                        {coach?.instagram && (
                            <TouchableOpacity
                                style={[styles.socialButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => openSocial(coach.instagram)}
                            >
                                <View style={styles.socialIconBox}>
                                    <Instagram size={20} color="#FFF" />
                                </View>
                                <Text style={styles.socialButtonText}>INSTAGRAM</Text>
                                <ExternalLink size={14} color="rgba(255,255,255,0.3)" />
                            </TouchableOpacity>
                        )}

                        {coach?.website && (
                            <TouchableOpacity
                                style={[styles.socialButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => openSocial(coach.website)}
                            >
                                <View style={styles.socialIconBox}>
                                    <Globe size={20} color="#FFF" />
                                </View>
                                <Text style={styles.socialButtonText}>WEBSITE</Text>
                                <ExternalLink size={14} color="rgba(255,255,255,0.3)" />
                            </TouchableOpacity>
                        )}

                        {/* Spotify Playlist Section (Standalone) */}
                        {coach?.spotify_playlist_url && (
                            <TouchableOpacity
                                onPress={() => openSocial(coach.spotify_playlist_url)}
                                style={styles.spotifyButton}
                                activeOpacity={0.8}
                            >
                                <View style={styles.spotifyIconBox}>
                                    <Music size={22} color="#1DB954" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.spotifyTitle}>SPOTIFY PLAYLIST</Text>
                                    <Text style={styles.spotifySubtitle}>Ouça a seleção musical do personal</Text>
                                </View>
                                <ExternalLink size={16} color="#1DB954" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Container >
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    // --- Master Card Styles ---
    masterCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 32,
    },
    glowEffect: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.1,
    },
    masterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        padding: 4,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 43,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 43,
        alignItems: 'center',
        justifyContent: 'center',
    },
    masterBasicInfo: {
        flex: 1,
    },
    coachName: {
        color: 'white',
        fontSize: 26,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 1,
    },
    crefBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    crefText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    masterSection: {
        marginBottom: 24,
    },
    masterSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    masterSectionTitle: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    masterSpecialtyText: {
        color: 'white',
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
        lineHeight: 24,
    },
    masterBioText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        lineHeight: 24,
    },
    masterEducationText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
        lineHeight: 22,
    },
    masterFooter: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: 0.5,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 20,
    },
    masterFooterText: {
        color: 'white',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
    },
    // --- Connect Section Styles ---
    connectSection: {
        gap: 16,
    },
    connectLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 2,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    connectGrid: {
        gap: 12,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderRadius: 16,
        gap: 16,
    },
    socialIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 1,
    },
    spotifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(29, 185, 84, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(29, 185, 84, 0.2)',
        borderRadius: 16,
        gap: 16,
        marginTop: 4,
    },
    spotifyIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spotifyTitle: {
        color: '#1DB954',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 1,
    },
    spotifySubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        marginTop: 2,
    },
});
