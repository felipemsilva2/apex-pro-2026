

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Camera, Upload, Check, X, FileText, Paperclip, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import * as Haptics from 'expo-haptics';
import { getVisibleColor } from '@/lib/whitelabel';

export default function NewCheckinScreen() {
    const { profile, tenant, brandColors } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const visiblePrimary = getVisibleColor(brandColors.primary);

    const [weight, setWeight] = useState(profile?.current_weight?.toString() || '');
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);

    const [photos, setPhotos] = useState<{
        front: string | null;
        back: string | null;
        side: string | null;
    }>({
        front: null,
        back: null,
        side: null
    });

    const [documents, setDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
    const [isPicking, setIsPicking] = useState(false);

    const pickImage = async (type: 'front' | 'back' | 'side') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPhotos(prev => ({ ...prev, [type]: result.assets[0].uri }));
        }
    };

    const pickDocument = async () => {
        if (isPicking) return;
        setIsPicking(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                multiple: true
            });

            if (!result.canceled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDocuments(prev => [...prev, ...result.assets]);
            }
        } catch (err) {
            console.error("Error picking document", err);
        } finally {
            setIsPicking(false);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImage = async (uri: string, path: string) => {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const { data, error } = await supabase.storage
                .from('checkins')
                .upload(path, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) {
                console.error('Upload Error Details:', error);
                throw error;
            }

            const publicUrl = supabase.storage.from('checkins').getPublicUrl(path).data.publicUrl;
            return publicUrl;
        } catch (error) {
            console.error("Upload failed", error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!weight) {
            Alert.alert("Atenção", "Por favor, informe seu peso atual.");
            return;
        }

        setUploading(true);
        try {
            const assessmentId = Math.random().toString(36).substring(2, 11);
            const timestamp = new Date().getTime();

            // Upload Photos
            let photoUrls: { front: string | null; back: string | null; side: string | null } = { front: null, back: null, side: null };

            if (photos.front) photoUrls.front = await uploadImage(photos.front, `${profile?.id}/${assessmentId}/front_${timestamp}.jpg`);
            if (photos.back) photoUrls.back = await uploadImage(photos.back, `${profile?.id}/${assessmentId}/back_${timestamp}.jpg`);
            if (photos.side) photoUrls.side = await uploadImage(photos.side, `${profile?.id}/${assessmentId}/side_${timestamp}.jpg`);

            // Save to DB
            const { error } = await supabase.from('body_assessments').insert({
                client_id: profile?.id,
                tenant_id: tenant?.id,
                assessment_date: new Date().toISOString(),
                weight_kg: parseFloat(weight.replace(',', '.')),
                front_photo: photoUrls.front,
                back_photo: photoUrls.back,
                side_photo: photoUrls.side,
                notes: notes,
                created_at: new Date().toISOString(),
            });

            if (error) throw error;

            // Update Current Weight in Profile
            await supabase.from('clients').update({ current_weight: parseFloat(weight.replace(',', '.')) }).eq('id', profile?.id);

            // Upload Documents
            for (const doc of documents) {
                const docId = Math.random().toString(36).substring(2, 11);
                const fileExt = doc.name.split('.').pop() || 'file';
                const formattedName = doc.name.replace(/\s+/g, '_');
                const docPath = `${profile?.id}/${docId}_${formattedName}`;

                const base64Doc = await FileSystem.readAsStringAsync(doc.uri, { encoding: 'base64' });

                const { error: uploadDocError } = await supabase.storage
                    .from('documents')
                    .upload(docPath, decode(base64Doc), {
                        contentType: doc.mimeType || 'application/octet-stream',
                        upsert: true
                    });

                if (uploadDocError) throw uploadDocError;

                const fileUrl = supabase.storage.from('documents').getPublicUrl(docPath).data.publicUrl;

                await supabase.from('client_documents').insert({
                    client_id: profile?.id,
                    tenant_id: tenant?.id,
                    title: doc.name,
                    file_url: fileUrl,
                    file_type: doc.mimeType?.includes('pdf') ? 'pdf' : (doc.mimeType?.includes('image') ? 'image' : 'other'),
                    category: 'bioimpedance',
                    created_at: new Date().toISOString()
                });
            }

            // Invalidate queries to refresh data
            await queryClient.invalidateQueries({ queryKey: ['athlete-assessments'] });
            await queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
            await queryClient.invalidateQueries({ queryKey: ['client-documents'] });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Sucesso", "Check-in e documentos enviados com sucesso! Aguarde o feedback do seu treinador.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Erro", "Falha ao enviar check-in: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const renderPhotoBox = (type: 'front' | 'back' | 'side', label: string) => (
        <TouchableOpacity
            style={[styles.photoBox, { borderColor: photos[type] ? brandColors.primary : 'rgba(255,255,255,0.1)' }]}
            onPress={() => pickImage(type)}
            activeOpacity={0.8}
        >
            {photos[type] ? (
                <>
                    <Image source={{ uri: photos[type]! }} style={styles.photoPreview} />
                    <View style={[styles.checkBadge, { backgroundColor: brandColors.primary }]}>
                        <Check size={12} color="#000" />
                    </View>
                </>
            ) : (
                <View style={styles.photoPlaceholder}>
                    <Camera size={24} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.photoLabel}>{label}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <Container variant="page" seamless>
            <Header
                title="ATUALIZAR SHAPE"
                subtitle="REPORTE DE EVOLUÇÃO"
                onBack={() => router.back()}
                variant="hero"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Weight Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>PESO ATUAL (KG)</Text>
                        <TextInput
                            style={[styles.input, { borderColor: 'rgba(255,255,255,0.1)' }]}
                            value={weight}
                            onChangeText={setWeight}
                            placeholder="00.0"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Photos */}
                    <View style={styles.section}>
                        <Text style={styles.label}>REGISTRO FOTOGRÁFICO</Text>
                        <Text style={styles.sublabel}>Use roupas leves e mantenha boa iluminação</Text>

                        <View style={styles.photosGrid}>
                            {renderPhotoBox('front', 'FRENTE')}
                            {renderPhotoBox('back', 'COSTAS')}
                            {renderPhotoBox('side', 'PERFIL')}
                        </View>
                    </View>

                    {/* Documents & Exams */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderLine}>
                            <Text style={styles.label}>DOCUMENTOS & EXAMES (OPCIONAL)</Text>
                            <TouchableOpacity onPress={pickDocument} style={styles.addDocButton}>
                                <Plus size={16} color={brandColors.primary} />
                                <Text style={[styles.addDocText, { color: brandColors.primary }]}>ANEXAR</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sublabel}>Bioimpedâncias, laudos médios ou resultados de exames</Text>

                        {documents.length > 0 ? (
                            <View style={styles.docsList}>
                                {documents.map((doc, index) => (
                                    <View key={index} style={styles.docItem}>
                                        <FileText size={18} color="rgba(255,255,255,0.6)" />
                                        <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                                        <TouchableOpacity onPress={() => removeDocument(index)} style={styles.removeDoc}>
                                            <X size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.docPlaceholder}
                                onPress={pickDocument}
                                activeOpacity={0.7}
                            >
                                <Paperclip size={24} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.docPlaceholderText}>Nenhum arquivo anexado</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Notes */}
                    <View style={styles.section}>
                        <Text style={styles.label}>OBSERVAÇÕES (OPCIONAL)</Text>
                        <TextInput
                            style={[styles.textArea, { borderColor: 'rgba(255,255,255,0.1)' }]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Como está se sentindo? Alguma dor ou dificuldade?"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: brandColors.primary },
                            uploading && styles.disabledButton
                        ]}
                        onPress={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color={brandColors.secondary} />
                        ) : (
                            <>
                                <Upload size={20} color={brandColors.secondary} />
                                <Text style={[styles.submitText, { color: brandColors.secondary }]}>ENVIAR RELATÓRIO</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    label: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        fontSize: 12,
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sublabel: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
        fontSize: 12,
        marginBottom: 16,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        fontSize: 24,
    },
    textArea: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 120,
    },
    photosGrid: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    photoBox: {
        flex: 1,
        aspectRatio: 3 / 4,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    photoLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        textTransform: 'uppercase',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 64,
        borderRadius: 24,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitText: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionHeaderLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addDocButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    addDocText: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        letterSpacing: 0.5,
    },
    docsList: {
        gap: 10,
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    docName: {
        flex: 1,
        color: '#fff',
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
        marginLeft: 12,
    },
    removeDoc: {
        padding: 4,
    },
    docPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.01)',
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.05)',
    },
    docPlaceholderText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
    }
});
