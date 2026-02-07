
import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAthleteAppointments } from '@/hooks/useAthleteData';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Calendar } from 'lucide-react-native';

export default function ScheduleScreen() {
    const { tenant, brandColors } = useAuth();
    const router = useRouter();
    const { data: appointments, isLoading, refetch, isRefetching } = useAthleteAppointments();

    return (
        <Container variant="page">
            <Header
                title="AGENDA TÁTICA"
                subtitle="PRÓXIMAS MISSÕES"
                onBack={() => router.back()}
            />

            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={brandColors.primary} size="large" />
                    </View>
                ) : !appointments || appointments.length === 0 ? (
                    <View style={styles.center}>
                        <View style={[styles.emptyIcon, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                            <Calendar size={32} color="rgba(255,255,255,0.2)" />
                        </View>
                        <Text style={styles.emptyText}>SEM MISSÕES AGENDADAS</Text>
                        <Text style={styles.emptySubtext}>AGUARDE NOVAS ATUALIZAÇÕES</Text>
                    </View>
                ) : (
                    <FlatList
                        data={appointments}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <AppointmentCard appointment={item} />
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor={brandColors.primary}
                                colors={[brandColors.primary]}
                            />
                        }
                    />
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    list: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7,
        marginTop: 100
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderWidth: 2,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderStyle: 'dashed'
    },
    emptyText: {
        color: '#fff',
        fontFamily: 'Inter_900Black',
        fontSize: 16,
        textTransform: 'uppercase',
        fontStyle: 'italic',
        letterSpacing: 1
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 2
    }
});
