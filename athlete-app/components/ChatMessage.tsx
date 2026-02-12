
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ChatMessage as ChatMessageType } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

type Props = {
    message: ChatMessageType;
    isMe: boolean;
    onReport: (messageId: string, reportedId: string) => void;
    onBlock: (blockedId: string) => void;
};

export const ChatMessage = ({ message, isMe, onReport, onBlock }: Props) => {
    const { brandColors } = useAuth();

    const handleLongPress = () => {
        if (isMe) return;

        Alert.alert(
            "Opções da Mensagem",
            "O que deseja fazer com este conteúdo?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Denunciar Mensagem",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Confirmar Denúncia",
                            "Tem certeza que deseja denunciar esta mensagem por conteúdo inadequado? Nossa equipe irá analisar.",
                            [
                                { text: "Voltar", style: "cancel" },
                                {
                                    text: "Sim, Denunciar",
                                    style: "destructive",
                                    onPress: () => onReport(message.id, message.sender_id)
                                }
                            ]
                        );
                    }
                },
                {
                    text: "Bloquear Usuário",
                    style: "default",
                    onPress: () => {
                        Alert.alert(
                            "Bloquear Usuário",
                            "Você deixará de receber mensagens deste usuário. Deseja continuar?",
                            [
                                { text: "Cancelar", style: 'cancel' },
                                {
                                    text: "Sim, Bloquear",
                                    onPress: () => onBlock(message.sender_id)
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    // Format time HH:mm
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={[
            styles.container,
            isMe ? styles.containerMe : styles.containerOther
        ]}>
            <TouchableOpacity
                activeOpacity={0.8}
                onLongPress={handleLongPress}
                style={[
                    styles.bubble,
                    isMe
                        ? { backgroundColor: 'rgba(212, 255, 0, 0.1)', borderColor: brandColors.primary, borderBottomRightRadius: 0 }
                        : { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', borderBottomLeftRadius: 0 }
                ]}
            >
                <Text style={[
                    styles.text,
                    isMe ? { color: brandColors.primary } : { color: '#fff' }
                ]}>
                    {message.content}
                </Text>
                <Text style={[
                    styles.time,
                    isMe ? { color: 'rgba(212, 255, 0, 0.4)' } : { color: 'rgba(255, 255, 255, 0.3)' }
                ]}>
                    {time} • {isMe ? 'TRANSMITIDO' : 'RECEBIDO'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
        flexDirection: 'row',
    },
    containerMe: {
        justifyContent: 'flex-end',
    },
    containerOther: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        // Skew effect for tactical look
        transform: [{ skewX: '-6deg' }]
    },
    text: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        lineHeight: 20,
        // Un-skew text so it's readable
        transform: [{ skewX: '6deg' }],
        fontStyle: 'italic',
        letterSpacing: 0.5,
    },
    time: {
        fontSize: 9,
        fontFamily: 'Inter_700Bold',
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
        transform: [{ skewX: '6deg' }],
        textAlign: 'right'
    }
});
