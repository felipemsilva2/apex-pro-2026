import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Info } from 'lucide-react-native';

export default function TermsScreen() {
    const { brandColors } = useAuth();
    const router = useRouter();

    const sections = [
        {
            title: "1. ACEITAÇÃO DOS TERMOS",
            content: "Ao acessar e utilizar este aplicativo, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve utilizar nossos serviços."
        },
        {
            title: "2. ISENÇÃO DE RESPONSABILIDADE MÉDICA",
            content: "Esta plataforma é uma ferramenta de suporte tecnológico. Não fornecemos aconselhamento médico, diagnóstico ou tratamento. O uso dos protocolos é de inteira responsabilidade do profissional prescritor e do usuário. Consulte um médico antes de iniciar exercícios ou dietas."
        },
        {
            title: "3. PROPRIEDADE INTELECTUAL",
            content: "Toda a estrutura, design e marcas associadas são de propriedade exclusiva. O usuário retém a propriedade dos dados inseridos, mas concede licença limitada para processamento para a finalidade do serviço."
        },
        {
            title: "4. ASSINATURAS EXTERNAS",
            content: "Este aplicativo funciona como uma plataforma de visualização para serviços contratados diretamente com seu treinador. Não realizamos vendas diretas de conteúdo digital dentro do app (In-App Purchases)."
        },
        {
            title: "5. WHITELABEL E DISPONIBILIDADE",
            content: "Não nos responsabilizamos por interrupções de serviço causadas por falhas de rede externa ou mudanças súbitas nas políticas das lojas de aplicativos (Apple/Google)."
        },
        {
            title: "6. RESCISÃO",
            content: "Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, pratiquem atividades ilegais ou utilizem a plataforma para propagar conteúdo ofensivo."
        },
        {
            title: "7. SUPORTE",
            content: "Para qualquer dúvida sobre estes termos, utilize o canal de suporte interno ou envie um e-mail para: ola@apexpro.fit"
        }
    ];

    return (
        <Container variant="page" seamless>
            <Header
                title="Termos"
                subtitle="CONTRATO DE USO"
                variant="hero"
                onBack={() => router.back()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.intro}>
                    <FileText size={40} color={brandColors.primary} style={styles.icon} />
                    <Text style={styles.title}>TERMOS DE USO DA PLATAFORMA</Text>
                    <Text style={styles.subtitle}>Importante: Leia atentamente antes de prosseguir com seu treinamento.</Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Info size={14} color={brandColors.primary} />
                            <Text style={[styles.sectionTitle, { color: brandColors.primary }]}>{section.title}</Text>
                        </View>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Versão: 1.2.0 • Fevereiro 2026</Text>
                </View>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    intro: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 10,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        color: '#FFF',
        fontSize: 26,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        textAlign: 'center',
        lineHeight: 32,
        letterSpacing: -1,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 20,
        borderRadius: 20,
        borderLeftWidth: 3,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sectionContent: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        lineHeight: 22,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    }
});
