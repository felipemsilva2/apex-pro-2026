import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Container, Header, StatCard, LoadingSpinner, ConfirmationModal } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteWorkouts, useAthleteDiet, useUpdateAthleteProfile, useAthleteProfile, useCoachProfile } from '../../hooks/useAthleteData';
import { getVisibleColor } from '../../lib/whitelabel';
import {
  Scale,
  Activity,
  Target,
  Dumbbell,
  Apple,
  TrendingUp,
  ChevronRight,
  MessageSquare,
  Calendar,
  FileText,
  LogOut,
  User,
  Award,
  Power
} from 'lucide-react-native';

/**
 * Home/Dashboard screen - Main hub with quick stats and actions
 */
export default function HomeScreen() {
  const { profile: contextProfile, brandColors, tenant, signOut } = useAuth();
  const router = useRouter();

  const visiblePrimary = getVisibleColor(brandColors.primary);

  // Pre-fetch coach profile data to warm the cache
  const { data: coach, refetch: refetchCoach, isRefetching: isRefetchingCoach } = useCoachProfile();

  const { data: serverProfile, isLoading: loadingProfile, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useAthleteProfile();
  const profile = serverProfile || contextProfile;

  const { data: workouts, isLoading: loadingWorkouts, refetch: refetchWorkouts, isRefetching: isRefetchingWorkouts } = useAthleteWorkouts();
  const { data: diet, isLoading: loadingDiet, refetch: refetchDiet, isRefetching: isRefetchingDiet } = useAthleteDiet();
  const updateProfile = useUpdateAthleteProfile();

  const isRefetching = isRefetchingProfile || isRefetchingWorkouts || isRefetchingDiet || isRefetchingCoach;

  const handleRefresh = async () => {
    await Promise.all([
      refetchProfile(),
      refetchWorkouts(),
      refetchDiet(),
      refetchCoach()
    ]);
  };

  const [newWeight, setNewWeight] = useState(profile?.current_weight?.toString().replace('.', ',') || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'warning' as 'warning' | 'success' | 'info',
    onConfirm: () => { },
    confirmText: 'CONFIRMAR',
    showCancel: true
  });

  const isLoading = loadingWorkouts || loadingDiet || loadingProfile;

  // Check if profile needs more data - Essential fields
  const isIncompleteProfile = !profile?.gender || !profile?.birth_date || !profile?.target_weight;

  // Keep internal weight state in sync when profile loads
  React.useEffect(() => {
    if (profile?.current_weight) {
      setNewWeight(profile.current_weight.toString().replace('.', ','));
    }
  }, [profile?.current_weight]);

  const handleWeightUpdate = async () => {
    if (!newWeight || isUpdating) return;

    // 1. Check if 24h has passed since last update
    if (profile?.last_weight_update) {
      const lastUpdate = new Date(profile.last_weight_update);
      const now = new Date();
      const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        const hoursRemaining = Math.ceil(24 - diffInHours);
        setModalConfig({
          title: '⏳ Aguarde',
          message: `Você já realizou seu check-in hoje.\n\nPróxima atualização disponível em aprox. ${hoursRemaining}h.\n\nDica: Pese-se sempre no mesmo horário para maior precisão.`,
          type: 'info',
          onConfirm: () => setModalVisible(false),
          confirmText: 'ENTENDI',
          showCancel: false
        });
        setModalVisible(true);
        return;
      }
    }

    // 2. Confirmation Alert
    setModalConfig({
      title: '⚖️ Confirmar Peso',
      message: `Registrar ${newWeight}kg como seu peso oficial de hoje?`,
      type: 'warning',
      onConfirm: performUpdate,
      confirmText: 'CONFIRMAR',
      showCancel: true
    });
    setModalVisible(true);
  };

  const performUpdate = async () => {
    setModalVisible(false);
    setIsUpdating(true);
    const normalizedWeight = newWeight.replace(',', '.');
    try {
      await updateProfile.mutateAsync({
        current_weight: parseFloat(normalizedWeight),
        last_weight_update: new Date().toISOString()
      });

      setModalConfig({
        title: '✅ Sucesso',
        message: 'Peso registrado e média atualizada!',
        type: 'success',
        onConfirm: () => setModalVisible(false),
        confirmText: 'OK',
        showCancel: false
      });
      setModalVisible(true);
    } catch (err: any) {
      console.error("Weight update error:", err);
      setModalConfig({
        title: '❌ Erro',
        message: `Não foi possível atualizar o peso: ${err.message || 'Erro desconhecido'}`,
        type: 'warning',
        onConfirm: () => setModalVisible(false),
        confirmText: 'OK',
        showCancel: false
      });
      setModalVisible(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    setModalConfig({
      title: 'SAIR DO SISTEMA',
      message: 'Deseja realmente encerrar sua sessão?',
      type: 'warning',
      onConfirm: async () => {
        setModalVisible(false);
        await signOut();
      },
      confirmText: 'SAIR',
      showCancel: true
    });
    setModalVisible(true);
  };

  // Helper to format weight values (e.g., 90.5 -> 90,5)
  const formatWeight = (val: any) => {
    if (!val) return '--';
    return val.toString().replace('.', ',');
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando..." />;
  }

  return (
    <Container variant="page" seamless>
      <Header
        title={`Olá, ${profile?.full_name?.split(' ')[0] || 'Atleta'}`}
        subtitle={`PERSONAL ${(coach?.full_name || tenant?.business_name || "PRO").replace(/^personal\s+/i, '').toUpperCase()}`}
        variant="hero"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={{ padding: 4 }}
          >
            <User size={28} color={visiblePrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }} // Add padding back for scrollable content
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
      >
        {/* Profile Alert Banner */}
        {isIncompleteProfile && (
          <TouchableOpacity
            onPress={() => router.push('/profile_edit')}
            activeOpacity={0.9}
            style={[styles.alertBanner, { borderColor: `${visiblePrimary}40`, backgroundColor: `${visiblePrimary}08` }]}
          >
            <View style={[styles.alertIndicator, { backgroundColor: visiblePrimary }]} />
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: visiblePrimary }]}>AVISO: PERFIL INCOMPLETO</Text>
              <Text style={styles.alertText}>Faltam dados biométricos essenciais para otimizar seus resultados.</Text>
            </View>
            <ChevronRight size={16} color={visiblePrimary} />
          </TouchableOpacity>
        )}



        {/* Quick Weight Check-in */}
        <View style={[styles.section, { borderColor: `${visiblePrimary}20` }]}>
          <View style={styles.sectionHeader}>
            <Activity size={16} color={visiblePrimary} />
            <Text style={styles.sectionTitle}>CHECK-IN RÁPIDO</Text>
          </View>

          <View style={styles.weightInput}>
            <TextInput
              style={[styles.input, { borderColor: `${visiblePrimary}40` }]}
              placeholder="Peso atual (kg)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="decimal-pad"
              value={newWeight}
              onChangeText={setNewWeight}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: brandColors.primary }]}
              onPress={handleWeightUpdate}
              disabled={isUpdating}
            >
              <Text style={[styles.buttonText, { color: brandColors.secondary }]}>
                {isUpdating ? 'SALVANDO...' : 'SALVAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Core Tactical Actions - 2x2 Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MENU PRINCIPAL</Text>
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridItem, { borderColor: `${visiblePrimary}30` }]}
              onPress={() => router.push('/(tabs)/training')}
            >
              <Dumbbell size={24} color={visiblePrimary} />
              <Text style={styles.gridItemTitle}>TREINOS</Text>
              <Text style={styles.gridItemSubtitle}>{workouts?.length || 0} PROTOCOLOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridItem, { borderColor: `${visiblePrimary}30` }]}
              onPress={() => router.push('/(tabs)/nutrition')}
            >
              <Apple size={24} color={visiblePrimary} />
              <Text style={styles.gridItemTitle}>DIETA</Text>
              <Text style={styles.gridItemSubtitle}>{diet?.meals?.length || 0} REFEIÇÕES</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridItem, { borderColor: `${visiblePrimary}30` }]}
              onPress={() => router.push('/(tabs)/progress')}
            >
              <TrendingUp size={24} color={visiblePrimary} />
              <Text style={styles.gridItemTitle}>PROGRESSO</Text>
              <Text style={styles.gridItemSubtitle}>AVALIAÇÕES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridItem, { borderColor: `${visiblePrimary}30` }]}
              onPress={() => router.push('/schedule')}
            >
              <Calendar size={24} color={visiblePrimary} />
              <Text style={styles.gridItemTitle}>AGENDA</Text>
              <Text style={styles.gridItemSubtitle}>AGENDA E CONSULTAS</Text>
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* Chat FAB */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/chat')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: brandColors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: brandColors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          borderWidth: 1,
          borderColor: '#000',
          transform: [{ skewX: '-6deg' }]
        }}
      >
        <MessageSquare size={28} color="#000" style={{ transform: [{ skewX: '6deg' }] }} />
      </TouchableOpacity>

      <ConfirmationModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.showCancel ? "CANCELAR" : ""}
        brandColors={brandColors}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 20,
    marginTop: 10,
    gap: 12,
  },
  alertIndicator: {
    width: 2,
    height: '100%',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  gridItemTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  gridItemSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  compactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
  },
  compactItemText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtleLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    opacity: 0.6,
  },
  subtleLogoutText: {
    color: 'rgba(255, 68, 68, 0.8)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  weightInput: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ skewX: '-5deg' }],
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    transform: [{ skewX: '5deg' }],
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
});
