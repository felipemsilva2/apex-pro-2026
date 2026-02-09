import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Shield } from 'lucide-react-native';

export default function PrivacyScreen() {
    const { brandColors } = useAuth();
    const router = useRouter();

    const sections = [
        {
            title: "1. CONTROLE E RESPONSABILIDADE",
            content: "Para fins da Lei Geral de Proteção de Dados (LGPD), o ecossistema atua como Operador de Dados em relação às informações dos alunos inseridas pelos profissionais (coaches/nutricionistas), que atuam como Controladores. Nós processamos esses dados apenas sob suas instruções e para a finalidade estrita da prestação do serviço."
        },
        {
            title: "2. DADOS COLETADOS E FINALIDADE",
            content: "Coletamos dados cadastrais (nome, e-mail, CPF, data de nascimento) para gestão de conta e faturamento, além de dados de performance física (peso, medidas, histórico de treino) estritamente necessários para a prescrição de protocolos personalizados."
        },
        {
            title: "3. DADOS SENSÍVEIS (SAÚDE)",
            content: "Como ecossistema de fitness e saúde, processamos dados sensíveis sobre sua condição física e hábitos dietéticos. O processamento desses dados ocorre mediante seu consentimento explícito no momento do cadastro."
        },
        {
            title: "4. COMPARTILHAMENTO COM TERCEIROS",
            content: "Seus dados podem ser compartilhados com parceiros tecnológicos essenciais, tais como Supabase (armazenamento), Gateways de Pagamento e serviços de notificações Push."
        },
        {
            title: "5. TRANSFERÊNCIA INTERNACIONAL",
            content: "Utilizamos infraestrutura de nuvem global (AWS/Supabase), podendo haver processamento de dados fora do território brasileiro, sempre com níveis adequados de proteção."
        },
        {
            title: "6. DIREITOS DOS TITULARES (LGPD)",
            content: "Você possui direitos de acesso, correção, eliminação e portabilidade dos seus dados. Essas solicitações podem ser feitas diretamente ao seu treinador ou via suporte do app."
        },
        {
            title: "7. SEGURANÇA DA INFORMAÇÃO",
            content: "Utilizamos criptografia SSL/TLS em todos os dados em trânsito e firewalls robustos para proteger suas informações."
        },
        {
            title: "8. RETENÇÃO E ELIMINAÇÃO",
            content: "Dados são mantidos enquanto a conta estiver ativa. Você pode solicitar a exclusão de sua conta a qualquer momento nas configurações do perfil."
        },
        {
            title: "9. PROTEÇÃO DE MENORES",
            content: "Nossos serviços não são direcionados a menores de 16 anos sem consentimento dos responsáveis."
        },
        {
            title: "10. COOKIES E RASTREAMENTO",
            content: "Utilizamos tecnologias estritamente necessárias para autenticação e segurança do usuário no aplicativo."
        },
        {
            title: "11. ALTERAÇÕES NA POLÍTICA",
            content: "Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças materiais através do app."
        },
        {
            title: "12. CONTATO",
            content: "Para dúvidas sobre privacidade, entre em contato via chat de suporte ou pelo e-mail: ola@apexpro.fit"
        }
    ];

    return (
        <Container variant="page" seamless>
            <Header
                title="Privacidade"
                subtitle="POLÍTICA DE DADOS"
                variant="default"
                onBack={() => router.back()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.intro}>
                    <Shield size={40} color={brandColors.primary} style={styles.icon} />
                    <Text style={styles.title}>SUA PRIVACIDADE É NOSSA PRIORIDADE</Text>
                    <Text style={styles.subtitle}>Conformidade total com a LGPD e diretrizes da App Store.</Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: brandColors.primary }]}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Última atualização: Fevereiro 2026</Text>
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
        fontSize: 24,
        fontFamily: Platform.OS === 'ios' ? 'Syne-ExtraBold' : 'Syne_800ExtraBold',
        textAlign: 'center',
        lineHeight: 28,
        letterSpacing: -1,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
    section: {
        marginBottom: 32,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    sectionContent: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        fontWeight: 'bold',
    }
});
