
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/ChatMessage';
import { Header } from '@/components/ui/Header';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { supabase } from '@/lib/supabase';
import { Send, MessageSquare, ShieldAlert } from 'lucide-react-native';

export default function ChatScreen() {
    const { profile, brandColors, tenant } = useAuth();
    const router = useRouter();
    const { messages, loading, sendMessage, sending, reportMessage, blockUser } = useChat();
    const [inputText, setInputText] = React.useState('');
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText(''); // Optimistic clear
        Keyboard.dismiss();

        try {
            await sendMessage(text);
        } catch (error) {
            setInputText(text); // Restore on error
            alert('Erro ao enviar mensagem');
        }
    };

    const handleReport = async () => {
        try {
            const { error } = await supabase
                .from('content_reports')
                .insert({
                    tenant_id: tenant?.id,
                    reporter_id: profile?.user_id,
                    content_type: 'chat_conversation',
                    content_snapshot: `Denúncia de conversa no chat. Aluno: ${profile?.full_name}. Coach/Tenant: ${tenant?.business_name}`,
                    status: 'pending'
                } as any);

            if (error) throw error;

            setReportModalVisible(false);
            setTimeout(() => {
                setSuccessModalVisible(true);
            }, 500);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar a denúncia. Tente novamente mais tarde.');
        }
    };

    // Auto scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            // Small timeout to ensure layout is done
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    return (
        <View style={styles.container}>
            <Header
                title="COMUNICAÇÃO"
                subtitle={tenant?.business_name ? `CANAL DIRETO: ${tenant.business_name}` : "CANAL DIRETO"}
                onBack={() => router.back()}
                variant="hero"
                rightAction={
                    <TouchableOpacity
                        onPress={() => setReportModalVisible(true)}
                        accessibilityLabel="Denunciar conteúdo impróprio"
                        accessibilityRole="button"
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <ShieldAlert size={22} color="rgba(255,100,100,0.7)" />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                    accessible={false}
                >
                    <View style={styles.flex1}>
                        {loading ? (
                            <View style={styles.center}>
                                <ActivityIndicator
                                    color={brandColors.primary}
                                    size="large"
                                    accessibilityLabel="Carregando mensagens"
                                />
                            </View>
                        ) : messages.length === 0 ? (
                            <View
                                style={styles.center}
                                accessibilityRole="summary"
                            >
                                <View style={[styles.emptyIcon, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                                    <MessageSquare size={32} color="rgba(255,255,255,0.2)" />
                                </View>
                                <Text style={styles.emptyText}>NENHUMA MENSAGEM</Text>
                                <Text style={styles.emptySubtext}>ENVIE UMA MENSAGEM PARA SEU TREINADOR</Text>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <ChatMessage
                                        message={item}
                                        isMe={item.sender_id === profile?.user_id}
                                        onReport={(messageId, reportedId) => reportMessage(messageId, reportedId, 'Conteúdo Inadequado (App)')}
                                        onBlock={(blockedId) => blockUser(blockedId)}
                                    />
                                )}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                keyboardShouldPersistTaps="handled"
                                accessibilityLabel="Lista de mensagens da conversa"
                            />
                        )}
                    </View>
                </TouchableWithoutFeedback>

                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <TextInput
                        style={[styles.input, { borderColor: 'rgba(255,255,255,0.1)' }]}
                        placeholder="Digitar mensagem..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        onSubmitEditing={handleSend}
                        blurOnSubmit={false}
                        accessibilityLabel="Campo de entrada de texto da mensagem"
                        accessibilityHint="Digite sua mensagem para o treinador aqui"
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: brandColors.primary },
                            (!inputText.trim() || sending) && styles.disabledButton
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                        accessibilityLabel="Enviar mensagem"
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !inputText.trim() || sending }}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Send size={20} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <ConfirmationModal
                visible={reportModalVisible}
                title="DENUNCIAR CONTEÚDO"
                message="Deseja denunciar esta conversa por conteúdo impróprio? Nossa equipe de moderação irá analisar em até 24h."
                confirmText="DENUNCIAR"
                cancelText="CANCELAR"
                onConfirm={handleReport}
                onCancel={() => setReportModalVisible(false)}
                brandColors={brandColors}
            />

            <ConfirmationModal
                visible={successModalVisible}
                title="DENÚNCIA ENVIADA"
                message="Obrigado por nos ajudar a manter a comunidade segura. Recebemos sua denúncia e tomaremos as medidas necessárias."
                confirmText="OK"
                showFooter
                onConfirm={() => setSuccessModalVisible(false)}
                onCancel={() => setSuccessModalVisible(false)}
                type="success"
                brandColors={brandColors}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0B',
    },
    flex1: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7
    },
    listContent: {
        padding: 20,
        paddingBottom: 20,
    },
    inputContainer: {
        padding: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        paddingTop: 12,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        transform: [{ skewX: '-6deg' }]
    },
    disabledButton: {
        opacity: 0.5
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
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        fontSize: 18,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        fontSize: 12,
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 1.5
    }
});
