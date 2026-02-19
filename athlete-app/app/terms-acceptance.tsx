import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { Scale, Check, Shield } from 'lucide-react-native';
import AnimatedMeshGradient from '../components/AnimatedMeshGradient';
import { IMeshGradientColor } from '../components/AnimatedMeshGradient/types';

export default function TermsAcceptanceScreen() {
    const { user, profile, brandColors, tenant, refreshProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAcceptTerms = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Update the client record with the timestamp
            // @ts-ignore
            const { error } = await (supabase
                .from('clients') as any)
                .update({ terms_accepted_at: new Date().toISOString() })
                .eq('user_id', user.id);

            if (error) throw error;

            // Refresh the profile to update the context state
            await refreshProfile();

            // Navigate to tabs
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível registrar o aceite. Tente novamente.');
            console.error('Error accepting terms:', error);
        } finally {
            setLoading(false);
        }
    };

    const gradientColors = useMemo<IMeshGradientColor[]>(() => {
        // Convert hex to normalized RGB for the shader
        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return { r, g, b };
        };

        const primary = hexToRgb(brandColors.primary);
        return [
            primary,
            { r: 0.05, g: 0.05, b: 0.06 }, // Dark background color
            { r: primary.r * 0.5, g: primary.g * 0.5, b: primary.b * 0.5 }, // Dimmed primary
            { r: 0.1, g: 0.1, b: 0.12 }, // Another dark tone
        ];
    }, [brandColors.primary]);

    return (
        <View style={styles.container}>
            <AnimatedMeshGradient
                style={StyleSheet.absoluteFill}
                colors={gradientColors}
                speed={0.4}
                blur={0.8}
            />
            <View style={styles.overlay} />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Shield size={48} color={brandColors.primary} />
                </View>

                <Text style={styles.title}>Termos de Uso</Text>
                <Text style={styles.subtitle}>
                    Para continuar utilizando o app do <Text style={{ color: brandColors.primary, fontWeight: 'bold' }}>{tenant?.business_name || 'Apex Pro'}</Text>,
                    você precisa aceitar os termos atualizados.
                </Text>

                <View style={styles.termsBox}>
                    <View style={styles.termItem}>
                        <Check size={16} color={brandColors.primary} />
                        <Text style={styles.termText}>Concordo com a Política de Privacidade</Text>
                    </View>
                    <View style={styles.termItem}>
                        <Check size={16} color={brandColors.primary} />
                        <Text style={styles.termText}>Concordo com os Termos de Serviço</Text>
                    </View>
                    <View style={styles.termItem}>
                        <Check size={16} color={brandColors.primary} />
                        <Text style={styles.termText}>Aceito receber comunicações sobre treinos</Text>
                    </View>
                </View>

                <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => router.push('/terms')}>
                        <Text style={styles.linkText}>Ler Termos de Uso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/privacy')}>
                        <Text style={styles.linkText}>Ler Política de Privacidade</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: brandColors.primary }]}
                    onPress={handleAcceptTerms}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={brandColors.secondary} />
                    ) : (
                        <Text style={[styles.buttonText, { color: brandColors.secondary }]}>LI E ACEITO</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0B',
        justifyContent: 'center',
        padding: 30,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 10, 11, 0.9)',
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: 10,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    termsBox: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        gap: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    termItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    termText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    linksContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    linkText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        textDecorationLine: 'underline',
    },
    button: {
        width: '100%',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
