
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/ChatMessage';
import { Header } from '@/components/ui/Header';
import { Send, MessageSquare } from 'lucide-react-native';

export default function ChatScreen() {
    const { profile, brandColors, tenant } = useAuth();
    const router = useRouter();
    const { messages, loading, sendMessage, sending } = useChat();
    const [inputText, setInputText] = React.useState('');
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header
                title="COMUNICAÇÃO"
                subtitle={tenant?.business_name ? `CANAL DIRETO: ${tenant.business_name}` : "CANAL DIRETO"}
                onBack={() => router.back()}
            />

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.flex1}>
                        {loading ? (
                            <View style={styles.center}>
                                <ActivityIndicator color={brandColors.primary} size="large" />
                            </View>
                        ) : messages.length === 0 ? (
                            <View style={styles.center}>
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
                                    />
                                )}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                keyboardShouldPersistTaps="handled"
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
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: brandColors.primary },
                            (!inputText.trim() || sending) && styles.disabledButton
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Send size={20} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        borderRadius: 8,
        padding: 12,
        paddingTop: 12,
        color: '#fff',
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        maxHeight: 100,
        fontStyle: 'italic'
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
