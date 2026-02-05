
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Calendar, Clock, Video, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Appointment = {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    location: string | null;
    video_link: string | null;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    type: 'consultation' | 'check_in' | 'training_session' | 'other';
};

type Props = {
    appointment: Appointment;
};

export const AppointmentCard = ({ appointment }: Props) => {
    const { brandColors } = useAuth();

    // Safety check for date formatting
    let dateFormatted = '';
    let timeStart = '';
    let timeEnd = '';

    try {
        const startDate = parseISO(appointment.start_time);
        const endDate = parseISO(appointment.end_time);

        dateFormatted = format(startDate, "EEEE, d 'de' MMMM", { locale: ptBR });
        timeStart = format(startDate, 'HH:mm');
        timeEnd = format(endDate, 'HH:mm');
    } catch (e) {
        dateFormatted = 'Data inválida';
    }

    const handleJoinVideo = () => {
        if (appointment.video_link) {
            Linking.openURL(appointment.video_link);
        }
    };

    return (
        <View style={styles.container}>
            {/* Left strip */}
            <View style={[styles.strip, { backgroundColor: brandColors.primary }]} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.type, { color: brandColors.primary }]}>
                        {appointment.type === 'consultation' ? 'CONSULTA' :
                            appointment.type === 'check_in' ? 'CHECK-IN' :
                                appointment.type === 'training_session' ? 'TREINO PRESENCIAL' : 'AGENDA'}
                    </Text>
                    {appointment.status === 'scheduled' && (
                        <View style={[styles.badge, { backgroundColor: 'rgba(212, 255, 0, 0.1)' }]}>
                            <Text style={[styles.badgeText, { color: brandColors.primary }]}>AGENDADO</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title}>{appointment.title}</Text>

                <View style={styles.infoRow}>
                    <Calendar size={14} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.infoText}>{dateFormatted.toUpperCase()}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Clock size={14} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.infoText}>{timeStart} - {timeEnd}</Text>
                </View>

                {appointment.location && (
                    <View style={styles.infoRow}>
                        <MapPin size={14} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.infoText}>{appointment.location}</Text>
                    </View>
                )}

                {appointment.video_link && (
                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: brandColors.primary }]}
                        onPress={handleJoinVideo}
                    >
                        <Video size={16} color={brandColors.primary} />
                        <Text style={[styles.actionText, { color: brandColors.primary }]}>ENTRAR NA CHAMADA</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 0, // Tactical square
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    strip: {
        width: 4,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    type: {
        fontSize: 10,
        fontFamily: 'Inter_900Black',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontStyle: 'italic',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 8,
        fontFamily: 'Inter_700Bold',
        textTransform: 'uppercase',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        fontStyle: 'italic',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    infoText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        textTransform: 'uppercase',
    },
    actionButton: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        transform: [{ skewX: '-6deg' }]
    },
    actionText: {
        fontSize: 12,
        fontFamily: 'Inter_900Black',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        transform: [{ skewX: '6deg' }]
    }
});
