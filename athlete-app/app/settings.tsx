import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header, ConfirmationModal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useAthleteProfile } from '../hooks/useAthleteData';
import {
    User,
    Award,
    MessageSquare,
    Shield,
    LogOut,
    ChevronRight,
    ExternalLink,
    Info
} from 'lucide-react-native';
import { getVisibleColor } from '../lib/whitelabel';

export default function SettingsScreen() {
    const { profile: contextProfile, tenant, brandColors, signOut } = useAuth();
    const router = useRouter();
    const { data: serverProfile, refetch, isRefetching } = useAthleteProfile();
    const profile = serverProfile || contextProfile;

    const visiblePrimary = getVisibleColor(brandColors.primary);

    const [modalVisible, setModalVisible] = React.useState(false);

    const handleLogout = () => {
        setModalVisible(true);
    };

    const confirmLogout = async () => {
        setModalVisible(false);
        await signOut();
    };

    const SettingItem = ({ icon: Icon, label, onPress, subLabel }: any) => (
        <TouchableOpacity
            style={[styles.item, { borderColor: 'rgba(255,255,255,0.05)' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                <Icon size={20} color={visiblePrimary} />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemLabel}>{label}</Text>
                {subLabel && <Text style={styles.itemSubLabel}>{subLabel}</Text>}
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>
    );

    return (
        <Container variant="page">
            <Header
                title="Ajustes"
                onBack={() => router.back()}
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
                {/* User Info Header */}
                <View style={[styles.userCard, { borderColor: `${visiblePrimary}20` }]}>
                    <View style={[styles.avatarContainer, { borderColor: visiblePrimary }]}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                        ) : (
                            <User size={32} color={visiblePrimary} />
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{profile?.full_name || 'Atleta'}</Text>
                        <Text style={styles.userEmail}>{profile?.email}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: `${visiblePrimary}15` }]}>
                            <Text style={[styles.roleText, { color: visiblePrimary }]}>ALUNO ATIVO</Text>
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTA</Text>
                    <View style={styles.sectionItems}>
                        <SettingItem
                            icon={User}
                            label="Editar Perfil"
                            subLabel="Dados biométricos e contato"
                            onPress={() => router.push('/profile_edit')}
                        />
                        <SettingItem
                            icon={Award}
                            label="Meu Treinador"
                            subLabel={tenant?.business_name || "Ver perfil profissional"}
                            onPress={() => router.push('/coach_profile')}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPORTE E LEGAL</Text>
                    <View style={styles.sectionItems}>
                        <SettingItem
                            icon={MessageSquare}
                            label="Falar com Suporte"
                            subLabel="Dúvidas e suporte técnico"
                            onPress={() => {
                                // Logic for WhatsApp support could be added here
                                router.push('/chat');
                            }}
                        />
                        <SettingItem
                            icon={Shield}
                            label="Privacidade & Termos"
                            onPress={() => { }}
                        />
                        <SettingItem
                            icon={Info}
                            label="Versão do App"
                            subLabel="Build 1.0.5 (Beta)"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <LogOut size={20} color="rgba(255, 68, 68, 0.8)" />
                    <Text style={styles.logoutText}>ENCERRAR SESSÃO</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>POWERED BY APEX PRO</Text>
                </View>
            </ScrollView>

            <ConfirmationModal
                visible={modalVisible}
                title="SAIR"
                message="Deseja realmente encerrar sua sessão?"
                type="warning"
                onConfirm={confirmLogout}
                onCancel={() => setModalVisible(false)}
                confirmText="SAIR"
                brandColors={brandColors}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        marginTop: 8,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    userEmail: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 8,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionItems: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
        marginLeft: 16,
    },
    itemLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    itemSubLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 68, 68, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        gap: 12,
    },
    logoutText: {
        color: 'rgba(255, 68, 68, 0.8)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.1)',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 3,
    },
});
