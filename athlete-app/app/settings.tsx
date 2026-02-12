import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl, Platform, Alert } from 'react-native';
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
    Info,
    Settings,
    Bell,
    CreditCard
} from 'lucide-react-native';
import { getVisibleColor } from '../lib/whitelabel';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
    const { profile: contextProfile, tenant, brandColors, signOut, deleteAccount } = useAuth();
    const router = useRouter();
    const { data: serverProfile, refetch, isRefetching } = useAthleteProfile();
    const profile = serverProfile || contextProfile;

    const visiblePrimary = getVisibleColor(brandColors.primary);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setModalVisible(true);
    };

    const handleDeleteAccount = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setDeleteModalVisible(true);
    };

    const confirmLogout = async () => {
        setModalVisible(false);
        await signOut();
    };

    const confirmDelete = async () => {
        setDeleteModalVisible(false);
        await deleteAccount();
    };

    const SettingItem = ({ icon: Icon, label, onPress, subLabel, isLast }: any) => (
        <TouchableOpacity
            style={[styles.item, !isLast && styles.itemBorder]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                <Icon size={18} color={visiblePrimary} />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemLabel}>{label}</Text>
                {subLabel && <Text style={styles.itemSubLabel}>{subLabel}</Text>}
            </View>
            <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>
    );

    return (
        <Container variant="page" seamless>
            <Header
                title="Configurações"
                subtitle="PREFERÊNCIAS E PERFIL"
                variant="hero"
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
                    />
                }
            >
                <View style={styles.content}>
                    {/* Bento Grid Header */}
                    <View style={styles.bentoGrid}>
                        {/* Profile Main Card */}
                        <TouchableOpacity
                            style={styles.profileCard}
                            onPress={() => router.push('/profile_edit')}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.avatarWrapper, { borderColor: `${visiblePrimary}40` }]}>
                                {profile?.avatar_url ? (
                                    <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                                ) : (
                                    <User size={32} color={visiblePrimary} />
                                )}
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.userName}>{profile?.full_name || 'Atleta'}</Text>
                                <Text style={styles.userEmail}>{profile?.email}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: `${visiblePrimary}15` }]}>
                                    <Text style={[styles.roleText, { color: visiblePrimary }]}>MEMBRO ATIVO</Text>
                                </View>
                            </View>
                            <View style={styles.editBadge}>
                                <Settings size={14} color="rgba(255,255,255,0.4)" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.bentoRow}>
                            {/* Coach Card */}
                            <TouchableOpacity
                                style={styles.coachCardMini}
                                onPress={() => router.push('/coach_profile')}
                            >
                                <Award size={20} color={brandColors.primary} />
                                <Text style={styles.miniCardLabel}>TREINADOR</Text>
                                <Text style={styles.miniCardValue}>
                                    {tenant?.business_name || "Profissional"}
                                </Text>
                            </TouchableOpacity>

                            {/* Status Card */}
                            <View style={styles.statusCardMini}>
                                <Bell size={20} color="#10B981" />
                                <Text style={styles.miniCardLabel}>STATUS</Text>
                                <Text style={[styles.miniCardValue, { color: '#10B981' }]}>ATIVO</Text>
                            </View>
                        </View>
                    </View>

                    {/* Account Settings Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>GERENCIAMENTO DE CONTA</Text>
                    </View>
                    <View style={styles.listContainer}>
                        <SettingItem
                            icon={User}
                            label="Dados Biométricos"
                            subLabel="Peso, altura e objetivos"
                            onPress={() => router.push('/profile_edit')}
                        />
                        <SettingItem
                            icon={CreditCard}
                            label="Assinatura e Planos"
                            subLabel="Status do plano (Ativo)"
                            onPress={() => {
                                Alert.alert("Informação", "Sua assinatura é gerenciada diretamente com seu treinador.");
                            }}
                        />
                        <SettingItem
                            icon={Award}
                            label="Perfil do Treinador"
                            subLabel="Especialidades e contato"
                            onPress={() => router.push('/coach_profile')}
                            isLast
                        />
                    </View>

                    {/* Support Settings Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>AJUDA E SEGURANÇA</Text>
                    </View>
                    <View style={styles.listContainer}>
                        <SettingItem
                            icon={MessageSquare}
                            label="Suporte Técnico"
                            subLabel="Dúvidas e feedback"
                            onPress={() => router.push('/chat')}
                        />
                        <SettingItem
                            icon={Shield}
                            label="Privacidade e Termos"
                            onPress={() => router.push('/privacy')}
                        />
                        <SettingItem
                            icon={Info}
                            label="Termos de Uso"
                            onPress={() => router.push('/terms')}
                        />
                        <SettingItem
                            icon={Info}
                            label="Sobre o Aplicativo"
                            subLabel="Versão 1.2.0"
                            onPress={() => { }}
                            isLast
                        />
                    </View>

                    {/* Logout Section */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <LogOut size={18} color="#EF4444" />
                        <Text style={styles.logoutText}>Encerrar Sessão</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton, { marginTop: 12, backgroundColor: 'rgba(255, 0, 0, 0.02)', borderColor: 'rgba(255, 0, 0, 0.05)' }]}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.logoutText, { color: 'rgba(255, 255, 255, 0.2)', fontSize: 10 }]}>SOLICITAR EXCLUSÃO DE CONTA</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>POWERED BY APEX PRO ECOSYSTEM</Text>
                    </View>
                </View>
            </ScrollView>

            <ConfirmationModal
                visible={modalVisible}
                title="Sair da Conta"
                message="Deseja realmente encerrar sua sessão neste dispositivo?"
                type="warning"
                onConfirm={confirmLogout}
                onCancel={() => setModalVisible(false)}
                confirmText="Sair"
                brandColors={brandColors}
            />

            <ConfirmationModal
                visible={deleteModalVisible}
                title="Excluir Conta"
                message="Esta ação é permanente. Todos os seus dados de treino e evolução serão removidos. Deseja prosseguir?"
                type="warning"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                confirmText="Excluir"
                brandColors={brandColors}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    bentoGrid: {
        gap: 12,
        marginBottom: 32,
    },
    profileCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 32,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        position: 'relative',
    },
    avatarWrapper: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        color: '#FFF',
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        marginBottom: 2,
    },
    userEmail: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 10,
    },
    roleText: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 0.5,
    },
    editBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bentoRow: {
        flexDirection: 'row',
        gap: 12,
    },
    coachCardMini: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    statusCardMini: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    miniCardLabel: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
    },
    miniCardValue: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
    sectionHeader: {
        marginBottom: 12,
        paddingLeft: 4,
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
    },
    listContainer: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 32,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
        marginLeft: 16,
    },
    itemLabel: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    itemSubLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 24,
        padding: 18,
        marginTop: 8,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.1)',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    footer: {
        marginTop: 48,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.1)',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
    },
});
