import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useCoachProfile } from '../hooks/useAthleteData';
import { getBadgeStyle, getVisibleColor } from '../lib/whitelabel';
import {
    Award,
    Instagram,
    Linkedin,
    Globe,
    BookOpen,
    Info,
    Mail,
    X,
    ExternalLink
} from 'lucide-react-native';

/**
 * Coach Profile Screen - Displays personal trainer's professional information
 */
export default function CoachProfileScreen() {
    const { tenant, brandColors } = useAuth();
    const router = useRouter();
    const { data: coach, isLoading } = useCoachProfile();

    const primaryBadge = getBadgeStyle(brandColors.primary);
    const visiblePrimary = getVisibleColor(brandColors.primary);

    if (isLoading) {
        return <LoadingSpinner message="LOCALIZANDO COMANDANTE..." />;
    }

    const openSocial = (url: string | null) => {
        if (url) {
            Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
        }
    };

    return (
        <Container variant="page">
            <Header
                title="MEU TREINADOR"
                subtitle="DADOS DO COMANDO TÁTICO"
                onBack={() => router.back()}
                rightAction={
                    <TouchableOpacity onPress={() => router.back()}>
                        <X size={24} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header Card */}
                <View style={[styles.profileCard, { borderColor: `${brandColors.primary}40`, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatarContainer, { borderColor: brandColors.primary }]}>
                            {coach?.avatar_url ? (
                                <Image source={{ uri: coach.avatar_url }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: `${brandColors.primary}20` }]}>
                                    <Award size={40} color={brandColors.primary} />
                                </View>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.coachName}>{coach?.full_name || tenant?.business_name}</Text>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, {
                                    backgroundColor: primaryBadge.background,
                                    borderColor: primaryBadge.border,
                                    borderWidth: 1
                                }]}>
                                    <Text style={[styles.badgeText, { color: primaryBadge.text }]}>PROFISSIONAL</Text>
                                </View>
                                {coach?.cref && (
                                    <View style={[styles.badge, {
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderWidth: 1
                                    }]}>
                                        <Text style={[styles.badgeText, { color: 'rgba(255,255,255,0.7)' }]}>CREF: {coach.cref}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Specialty Section */}
                    {coach?.specialty && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Award size={14} color={visiblePrimary} />
                                <Text style={[styles.sectionTitle, { color: visiblePrimary }]}>ESPECIALIDADE</Text>
                            </View>
                            <Text style={styles.sectionContent}>{coach.specialty}</Text>
                        </View>
                    )}
                </View>

                {/* Grid Info */}
                <View style={styles.infoGrid}>
                    {coach?.education && (
                        <View style={styles.gridCard}>
                            <View style={styles.sectionHeader}>
                                <BookOpen size={14} color={visiblePrimary} />
                                <Text style={[styles.sectionTitle, { color: visiblePrimary }]}>FORMAÇÃO</Text>
                            </View>
                            <Text style={styles.gridContent}>{coach.education}</Text>
                        </View>
                    )}

                    {tenant?.contact_email && (
                        <View style={styles.gridCard}>
                            <View style={styles.sectionHeader}>
                                <Mail size={14} color={visiblePrimary} />
                                <Text style={[styles.sectionTitle, { color: visiblePrimary }]}>CONTATO</Text>
                            </View>
                            <Text style={styles.gridContent} numberOfLines={1} ellipsizeMode="tail">
                                {tenant.contact_email}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bio Section */}
                {coach?.bio && (
                    <View style={styles.bioContainer}>
                        <View style={styles.sectionHeader}>
                            <Info size={14} color={visiblePrimary} />
                            <Text style={[styles.sectionTitle, { color: visiblePrimary }]}>BIOGRAFIA PROFISSIONAL</Text>
                        </View>
                        <Text style={styles.bioText}>{coach.bio}</Text>
                    </View>
                )}

                {/* Social Links */}
                <View style={styles.socialSection}>
                    <Text style={styles.socialLabel}>REDES SOCIAIS E LINKS</Text>
                    <View style={styles.socialGrid}>
                        {coach?.instagram && (
                            <TouchableOpacity
                                style={[styles.socialButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => openSocial(coach.instagram)}
                            >
                                <Instagram size={20} color="#FFF" />
                                <Text style={styles.socialButtonText}>INSTAGRAM</Text>
                                <ExternalLink size={12} color="rgba(255,255,255,0.3)" />
                            </TouchableOpacity>
                        )}
                        {coach?.linkedin && (
                            <TouchableOpacity
                                style={[styles.socialButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => openSocial(coach.linkedin)}
                            >
                                <Linkedin size={20} color="#FFF" />
                                <Text style={styles.socialButtonText}>LINKEDIN</Text>
                                <ExternalLink size={12} color="rgba(255,255,255,0.3)" />
                            </TouchableOpacity>
                        )}
                        {coach?.website && (
                            <TouchableOpacity
                                style={[styles.socialButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
                                onPress={() => openSocial(coach.website)}
                            >
                                <Globe size={20} color="#FFF" />
                                <Text style={styles.socialButtonText}>WEBSITE</Text>
                                <ExternalLink size={12} color="rgba(255,255,255,0.3)" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
    },
    profileCard: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 20,
        marginBottom: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        padding: 3,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    coachName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        marginBottom: 6,
        lineHeight: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    section: {
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    sectionContent: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    gridCard: {
        flex: 1,
        minWidth: '45%', // Allow wrapping on very small screens
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 4,
    },
    gridContent: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
    },
    bioContainer: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 4,
        marginBottom: 24,
    },
    bioText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 22,
    },
    socialSection: {
        gap: 12,
    },
    socialLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 4,
    },
    socialGrid: {
        gap: 8,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderRadius: 4,
    },
    socialButtonText: {
        flex: 1,
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    }
});
