
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import { FileText, Image as ImageIcon, Plus, Trash2, ExternalLink, Download } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DocumentsScreen() {
    const { brandColors } = useAuth();
    const router = useRouter();
    const { documents, isLoading, uploadDocument, isUploading, deleteDocument } = useDocuments();
    const [uploadingState, setUploadingState] = useState(false);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // Ask for a custom title or use filename
            // For simplicity in mobile, we'll use filename but could add a modal here

            setUploadingState(true);
            await uploadDocument({
                uri: file.uri,
                fileName: file.name,
                mimeType: file.mimeType || 'application/octet-stream',
                title: file.name,
                category: 'lab_exam'
            });
            Alert.alert("Sucesso", "Documento enviado com sucesso!");

        } catch (error: any) {
            Alert.alert("Erro", "Falha ao enviar documento: " + error.message);
        } finally {
            setUploadingState(false);
        }
    };

    const handleDelete = (id: string, url: string, title: string) => {
        Alert.alert(
            "Excluir Documento",
            `Deseja realmente excluir "${title}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDocument({ id, fileUrl: url });
                        } catch (err) {
                            Alert.alert("Erro", "Não foi possível excluir o documento.");
                        }
                    }
                }
            ]
        );
    };

    const openDocument = (url: string) => {
        Linking.openURL(url);
    };

    const getIcon = (type: string) => {
        if (type === 'pdf') return <FileText size={24} color={brandColors.primary} />;
        if (type === 'image') return <ImageIcon size={24} color={brandColors.secondary} />;
        return <FileText size={24} color="#fff" />;
    };

    return (
        <Container variant="page">
            <Header
                title="MEUS ARQUIVOS"
                subtitle="EXAMES & DOCUMENTOS"
                onBack={() => router.back()}
            />

            <View style={styles.content}>
                {/* Upload Button */}
                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        { borderColor: brandColors.primary, backgroundColor: `${brandColors.primary}10` }
                    ]}
                    onPress={handlePickDocument}
                    disabled={uploadingState || isUploading}
                >
                    {uploadingState || isUploading ? (
                        <ActivityIndicator color={brandColors.primary} />
                    ) : (
                        <>
                            <Plus size={20} color={brandColors.primary} />
                            <Text style={[styles.uploadText, { color: brandColors.primary }]}>ADICIONAR NOVO EXAME</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* List */}
                <ScrollView contentContainerStyle={styles.listContent}>
                    {isLoading ? (
                        <ActivityIndicator color={brandColors.primary} style={{ marginTop: 40 }} />
                    ) : documents?.length === 0 ? (
                        <View style={styles.emptyState}>
                            <FileText size={48} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyTitle}>Nenhum arquivo encontrado</Text>
                            <Text style={styles.emptySubtitle}>
                                Importe seus exames laboratoriais ou documentos importantes aqui.
                            </Text>
                        </View>
                    ) : (
                        documents?.map((doc) => (
                            <TouchableOpacity
                                key={doc.id}
                                style={styles.docItem}
                                onPress={() => openDocument(doc.file_url)}
                            >
                                <View style={styles.docIcon}>
                                    {getIcon(doc.file_type)}
                                </View>

                                <View style={styles.docInfo}>
                                    <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                                    <Text style={styles.docDate}>
                                        {format(new Date(doc.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleDelete(doc.id, doc.file_url, doc.title);
                                    }}
                                >
                                    <Trash2 size={18} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 24,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        marginBottom: 24,
    },
    uploadText: {
        fontFamily: 'Inter_900Black',
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    listContent: {
        paddingBottom: 40,
        gap: 12,
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    docIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        color: '#fff',
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        marginBottom: 4,
    },
    docDate: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyTitle: {
        color: '#fff',
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        fontSize: 14,
        maxWidth: 250,
        lineHeight: 20,
    }
});
