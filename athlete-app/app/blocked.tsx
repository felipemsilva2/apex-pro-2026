import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function BlockedScreen() {
    const { tenant, brandColors, signOut } = useAuth();

    const coachName = tenant?.business_name || 'seu treinador';
    // Ideally we want a phone. Let's assume we use the support email if phone is not available, 
    // but the user asked for "Contact Coach". 
    // If we have a phone/whatsapp in marketing_config, we use it.

    const handleContact = () => {
        // Removido o link direto para e-mail conforme solicitado pelo usuário.
        // O atleta deve entrar em contato pelos meios que já utiliza com o personal.
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <FontAwesome5 name="user-lock" size={64} color={brandColors.primary} />
                </View>

                <Text style={styles.title}>ACESSO SUSPENSO</Text>

                <View style={styles.divider} />

                <Text style={styles.description}>
                    Prezado atleta, seu acesso ao ecossistema {coachName} encontra-se suspenso.
                </Text>

                <Text style={styles.subDescription}>
                    Por favor, entre em contato diretamente com seu treinador para regularizar sua situação.
                </Text>

                <View style={styles.infoBox}>
                    <FontAwesome5 name="info-circle" size={14} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.infoText}>
                        O Apex PRO apenas fornece a tecnologia; o contato para suporte deve ser feito pelos seus canais habituais com o personal.
                    </Text>
                </View>


                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={signOut}
                >
                    <Text style={styles.signOutText}>SAIR DO SISTEMA</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>APEX PRO // TACTICAL ECOSYSTEM</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0B',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(212, 255, 0, 0.05)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(212, 255, 0, 0.1)',
    },
    title: {
        fontFamily: 'Syne_800ExtraBold',
        fontSize: 32,
        color: '#FFF',
        fontStyle: 'italic',
        textAlign: 'center',
        letterSpacing: -1,
    },
    divider: {
        width: 60,
        height: 4,
        backgroundColor: '#D4FF00',
        marginVertical: 24,
    },
    description: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 16,
    },
    subDescription: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 4,
        width: '100%',
        gap: 12,
        shadowColor: '#D4FF00',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonText: {
        fontFamily: 'Syne_800ExtraBold',
        fontSize: 14,
        color: '#000',
        fontStyle: 'italic',
    },
    signOutButton: {
        marginTop: 20,
        padding: 10,
    },
    signOutText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        letterSpacing: 1,
        textDecorationLine: 'underline',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        width: '100%',
    },
    infoText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Syne_700Bold',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.2)',
        letterSpacing: 4,
    },
});
