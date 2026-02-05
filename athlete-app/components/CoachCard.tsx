import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Instagram, Mail, Globe, ShieldCheck } from 'lucide-react-native';

export const CoachCard = () => {
    const { tenant, brandColors } = useAuth();

    if (!tenant) return null;

    const handleLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={styles.container}>
            <View style={[styles.card, { borderColor: `${brandColors.primary}20` }]}>
                {/* Stripe */}
                <View style={[styles.stripe, { backgroundColor: brandColors.primary }]} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <ShieldCheck size={16} color={brandColors.primary} />
                            <Text style={[styles.label, { color: brandColors.primary }]}>SEU TREINADOR</Text>
                        </View>
                        {tenant.plan_tier === 'elite' && (
                            <View style={[styles.badge, { backgroundColor: `${brandColors.primary}20` }]}>
                                <Text style={[styles.badgeText, { color: brandColors.primary }]}>ELITE</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.coachName}>{tenant.business_name}</Text>

                    {tenant.tagline && (
                        <Text style={styles.tagline}>{tenant.tagline}</Text>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.actions}>
                        {tenant.contact_email && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleLink(`mailto:${tenant.contact_email}`)}
                            >
                                <Mail size={18} color="rgba(255,255,255,0.6)" />
                                <Text style={styles.actionText}>Email</Text>
                            </TouchableOpacity>
                        )}

                        {/* Placeholder for Instagram/Web - In a real scenario these would be in the tenant object */}
                        <TouchableOpacity style={styles.actionBtn}>
                            <Instagram size={18} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.actionText}>Instagram</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        flexDirection: 'row',
    },
    stripe: {
        width: 4,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
    },
    coachName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    actionText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
});
