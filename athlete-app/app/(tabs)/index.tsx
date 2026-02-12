import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Platform } from 'react-native';

import { useRouter } from 'expo-router';
import { Container, Header, StatCard, LoadingSpinner, ConfirmationModal } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useAthleteWorkouts, useAthleteDiet, useUpdateAthleteProfile, useAthleteProfile, useCoachProfile } from '../../hooks/useAthleteData';
import { getVisibleColor } from '../../lib/whitelabel';
import {
  Activity,
  Dumbbell,
  Apple,
  TrendingUp,
  ChevronRight,
  MessageSquare,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react-native';

/**
 * HomeScreen - Redesigned with premium Reacticx/Bento aesthetic
 */
export default function HomeScreen() {
  const { profile: contextProfile, brandColors, tenant, signOut } = useAuth();
  const router = useRouter();
  const visiblePrimary = getVisibleColor(brandColors.primary);

  const { data: coach } = useCoachProfile();
  const { data: serverProfile, isLoading: loadingProfile, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useAthleteProfile();
  const profile = serverProfile || contextProfile;

  const { data: workouts, isLoading: loadingWorkouts, refetch: refetchWorkouts, isRefetching: isRefetchingWorkouts } = useAthleteWorkouts();
  const { data: diet, isLoading: loadingDiet, refetch: refetchDiet, isRefetching: isRefetchingDiet } = useAthleteDiet();
  const updateProfile = useUpdateAthleteProfile();

  const isRefetching = isRefetchingProfile || isRefetchingWorkouts || isRefetchingDiet;

  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchWorkouts(), refetchDiet()]);
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
  const isIncompleteProfile = !profile?.gender || !profile?.birth_date || !profile?.target_weight;

  React.useEffect(() => {
    if (profile?.current_weight) {
      setNewWeight(profile.current_weight.toString().replace('.', ','));
    }
  }, [profile?.current_weight]);

  const handleWeightUpdate = async () => {
    if (!newWeight || isUpdating) return;
    setModalConfig({
      title: '⚖️ Peso de Hoje',
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
    try {
      await updateProfile.mutateAsync({
        current_weight: parseFloat(newWeight.replace(',', '.')),
        last_weight_update: new Date().toISOString()
      });
      setModalConfig({
        title: '✅ Sucesso',
        message: 'Progresso registrado!',
        type: 'success',
        onConfirm: () => setModalVisible(false),
        confirmText: 'OK',
        showCancel: false
      });
      setModalVisible(true);
    } catch (err: any) {
      setModalConfig({
        title: '❌ Erro',
        message: 'Não foi possível atualizar o peso.',
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

  if (isLoading) return <LoadingSpinner message="Atualizando..." />;

  return (
    <Container variant="page" seamless>
      <Header
        title={`Olá, ${profile?.full_name?.split(' ')[0] || ''}`}
        subtitle={coach?.full_name ? `CONSULTORIA: ${coach.full_name.toUpperCase()}` : "TIME DE ALTA PERFORMANCE"}
        variant="hero"
        rightAction={
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.profileButton}>
            <User size={22} color={visiblePrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={brandColors.primary} />
        }
      >
        <View style={styles.horizontalPadding}>
          {/* Profile Alert */}
          {isIncompleteProfile && (
            <TouchableOpacity
              onPress={() => router.push('/profile_edit')}
              activeOpacity={0.9}
              style={[styles.alertBanner, { borderColor: `${visiblePrimary}20` }]}
            >
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: visiblePrimary }]}>DADOS PENDENTES</Text>
                <Text style={styles.alertText}>Atualize seu perfil para cálculos precisos.</Text>
              </View>
              <ChevronRight size={16} color={visiblePrimary} opacity={0.5} />
            </TouchableOpacity>
          )}

          {/* Bento Stats Grid */}
          <View
            style={styles.bentoGrid}
          >
            <View style={styles.bentoCol}>
              <StatCard
                label="Peso Atual"
                value={newWeight || '--'}
                unit="KG"
                brandColor={brandColors.primary}
                icon={<TrendingUp size={16} color="rgba(255,255,255,0.2)" />}
              />
            </View>
            <View style={styles.bentoCol}>
              <StatCard
                label="Meta"
                value={profile?.target_weight || '--'}
                unit="KG"
                brandColor={brandColors.primary}
                trend="neutral"
              />
            </View>
          </View>

          {/* Bento Quick Action - Interactive Weight */}
          <View
            style={styles.bentoSection}
          >
            <View style={styles.sectionHeader}>
              <Activity size={14} color={visiblePrimary} />
              <Text style={styles.sectionTitle}>Evolução Corporal</Text>
            </View>
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.input}
                placeholder="00,0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="decimal-pad"
                value={newWeight}
                onChangeText={setNewWeight}
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: brandColors.primary }]}
                onPress={handleWeightUpdate}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>{isUpdating ? '...' : 'SALVAR'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Grid Actions */}
          <View
            style={styles.mainGrid}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/training')}
              style={styles.gridCard}
            >
              <View style={[styles.gridIconBg, { backgroundColor: `${visiblePrimary}10` }]}>
                <Dumbbell size={24} color={visiblePrimary} />
              </View>
              <Text style={styles.gridTitle}>TREINOS</Text>
              <Text style={styles.gridSubtitle}>{workouts?.length || 0} TREINOS ATIVOS</Text>
              <ExternalLink size={12} color="rgba(255,255,255,0.2)" style={styles.gridCornerIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/nutrition')}
              style={styles.gridCard}
            >
              <View style={[styles.gridIconBg, { backgroundColor: `${visiblePrimary}10` }]}>
                <Apple size={24} color={visiblePrimary} />
              </View>
              <Text style={styles.gridTitle}>DIETA</Text>
              <Text style={styles.gridSubtitle}>{diet?.meals?.length || 0} REFEIÇÕES</Text>
              <ExternalLink size={12} color="rgba(255,255,255,0.2)" style={styles.gridCornerIcon} />
            </TouchableOpacity>
          </View>

          <View
            style={styles.mainGrid}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/progress')}
              style={styles.gridCard}
            >
              <View style={[styles.gridIconBg, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <TrendingUp size={24} color="#FFF" />
              </View>
              <Text style={styles.gridTitle}>PROGRESSO</Text>
              <Text style={styles.gridSubtitle}>FOTOS E MEDIDAS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/schedule')}
              style={styles.gridCard}
            >
              <View style={[styles.gridIconBg, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Calendar size={24} color="#FFF" />
              </View>
              <Text style={styles.gridTitle}>AGENDA</Text>
              <Text style={styles.gridSubtitle}>CONSULTAS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Premium FAB */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/chat')}
        style={[styles.fab, { backgroundColor: brandColors.primary, shadowColor: brandColors.primary }]}
      >
        <MessageSquare size={26} color="#000" />
      </TouchableOpacity>

      <ConfirmationModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.showCancel ? "REVISAR" : ""}
        brandColors={brandColors}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
  },
  horizontalPadding: {
    paddingHorizontal: 16, // Reduced slightly for more edge-to-edge feel
    paddingTop: 8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bentoCol: {
    flex: 1,
  },
  bentoSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-SemiBold' : 'Outfit_600SemiBold',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  weightInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    color: '#FFF',
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
  },
  saveButton: {
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    letterSpacing: 0.5,
    color: '#000',
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  gridIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  gridSubtitle: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  gridCornerIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
});
