import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, ChevronRight } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signIn, brandColors, tenant } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Preencha todos os campos');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Managed Login Logic: If no @, assume it's a managed username
            const identification = email.includes('@')
                ? email.trim()
                : `${email.trim().toLowerCase()}@managed.nutripro.pro`;

            const { error: signInError } = await signIn(identification, password);
            if (signInError) throw signInError;
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                {/* Tactical HUD Header */}
                <View style={styles.header}>
                    <View style={styles.badge}>
                        <Shield size={12} color={brandColors.primary} />
                        <Text style={[styles.badgeText, { color: brandColors.primary }]}>ACESSO EXCLUSIVO</Text>
                    </View>
                    <Text style={styles.title}>
                        {tenant?.business_name || 'PORTAL'}<Text style={[styles.titleHighlight, { color: brandColors.primary }]}>{tenant?.business_name ? '' : ' DO ALUNO'}</Text>
                    </Text>
                    <View style={[styles.line, { backgroundColor: `${brandColors.primary}4D` }]} />
                    <Text style={styles.subtitle}>Sua evolução começa aqui</Text>
                </View>

                {/* Login Form */}
                <View style={styles.form}>
                    {error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>IDENTIFICAÇÃO (E-MAIL OU USUÁRIO)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com ou usuario"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="default"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>CÓDIGO DE ACESSO (SENHA)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: brandColors.primary },
                            loading && styles.buttonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <View style={styles.buttonContent}>
                            {loading ? (
                                <ActivityIndicator color={brandColors.secondary} />
                            ) : (
                                <>
                                    <Text style={[styles.buttonText, { color: brandColors.secondary }]}>ENTRAR NO TREINO</Text>
                                    <ChevronRight size={18} color={brandColors.secondary} />
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Footer info */}
                <View style={styles.footer}>
                    <Text style={styles.version}>VERSION 1.0.4 Alpha // HUD-OS</Text>
                    <Text style={styles.copyright}>© 2026 APEXPRO PERFORMANCE</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0B',
        minHeight: '100%',
    },
    inner: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        width: '100%',
    },
    header: {
        marginBottom: 40,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    title: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: '900',
        fontStyle: 'italic',
        lineHeight: 42,
    },
    titleHighlight: {
        // color set dynamically
    },
    line: {
        height: 1,
        width: 60,
        marginTop: 15,
        marginBottom: 15,
        // backgroundColor set dynamically
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    inputLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 18,
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        width: '100%',
    },
    button: {
        padding: 20,
        marginTop: 10,
        transform: [{ skewX: '-10deg' }],
        // backgroundColor set dynamically
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transform: [{ skewX: '10deg' }],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '900',
        fontStyle: 'italic',
        // color set dynamically
    },
    errorBanner: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        padding: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#FF3B30',
        marginBottom: 10,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 30,
        right: 30,
        alignItems: 'center',
        opacity: 0.2,
    },
    version: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },
    copyright: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
        marginTop: 4,
    }
} as any);
