import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { Container, Header, ConfirmationModal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateAthleteProfile } from '../hooks/useAthleteData';
import {
    User,
    Calendar,
    Phone,
    Scale,
    Target,
    Activity,
    Save,
    X,
    ChevronDown,
    Camera
} from 'lucide-react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

export default function ProfileEditScreen() {
    const { profile, brandColors } = useAuth();
    const router = useRouter();
    const updateProfile = useUpdateAthleteProfile();

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        gender: profile?.gender || '',
        birth_date: profile?.birth_date || '',
        phone: profile?.phone || '',
        current_weight: profile?.current_weight?.toString().replace('.', ',') || '',
        target_weight: profile?.target_weight?.toString().replace('.', ',') || '',
        height: profile?.height?.toString().replace('.', ',') || '',
        avatar_url: profile?.avatar_url || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setIsUploading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
                const asset = result.assets[0];
                const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
                const fileName = `${profile?.id}-${Math.random()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, decode(asset.base64!), {
                        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
                console.error('Error uploading image:', error);
                Alert.alert('Erro no Upload', 'Não foi possível carregar sua imagem.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!profile?.id) {
            setErrorMessage('Perfil não carregado. Tente reiniciar o aplicativo.');
            setModalVisible(true);
            return;
        }

        setIsSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const normalizedCurrentWeight = formData.current_weight.replace(',', '.');
            const normalizedTargetWeight = formData.target_weight.replace(',', '.');
            const normalizedHeight = formData.height.replace(',', '.');

            await updateProfile.mutateAsync({
                full_name: formData.full_name,
                gender: formData.gender,
                birth_date: formData.birth_date,
                phone: cleanPhone,
                current_weight: formData.current_weight ? parseFloat(normalizedCurrentWeight) : null,
                target_weight: formData.target_weight ? parseFloat(normalizedTargetWeight) : null,
                height: formData.height ? parseFloat(normalizedHeight) : null,
                avatar_url: formData.avatar_url,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error: any) {
            console.error('Error saving profile:', error);
            setErrorMessage(error.message || 'Não foi possível salvar os dados.');
            setModalVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData({ ...formData, birth_date: format(selectedDate, 'yyyy-MM-dd') });
        }
    };

    const formatPhone = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
        if (!match) return cleaned;
        if (!match[2]) return match[1];
        return `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
    };

    const formatDecimal = (text: string) => {
        return text.replace(/[^0-9,.]/g, '').replace(/\./g, ',');
    };

    const renderInput = (
        label: string,
        value: string,
        onChange: (val: string) => void,
        icon: React.ReactNode,
        placeholder: string,
        keyboardType: 'default' | 'numeric' | 'phone-pad' | 'decimal-pad' = 'default',
        maskType?: 'cel-phone' | 'datetime'
    ) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
                {icon}
                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => {
                        let formatted = text;
                        if (maskType === 'cel-phone') {
                            formatted = formatPhone(text);
                        } else if (keyboardType === 'decimal-pad') {
                            formatted = formatDecimal(text);
                        }
                        onChange(formatted);
                    }}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    return (
        <Container variant="page" seamless>
            <Header
                title="Editar Perfil"
                subtitle="DADOS E CONTATO"
                variant="hero"
                onBack={() => router.back()}
                rightAction={
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <X size={20} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Avatar Upload Selection */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            style={[styles.avatarUploadContainer, { borderColor: 'rgba(255,255,255,0.05)' }]}
                            onPress={handlePickImage}
                            activeOpacity={0.8}
                            disabled={isUploading}
                        >
                            {formData.avatar_url ? (
                                <Image source={{ uri: formData.avatar_url }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                                    <User size={32} color="rgba(255,255,255,0.2)" />
                                </View>
                            )}
                            <View style={[styles.editIconContainer, { backgroundColor: brandColors.primary }]}>
                                <Camera size={14} color={brandColors.secondary} />
                            </View>
                            {isUploading && (
                                <View style={styles.uploadOverlay}>
                                    <ActivityIndicator color="#FFF" size="small" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.avatarLabel}>FOTO DE PERFIL</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {renderInput(
                            "NOME DE EXIBIÇÃO",
                            formData.full_name,
                            (val) => setFormData({ ...formData, full_name: val }),
                            <User size={12} color={brandColors.primary} />,
                            "Como devemos te chamar?"
                        )}

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <View style={styles.labelContainer}>
                                    <Activity size={12} color={brandColors.primary} />
                                    <Text style={styles.label}>GÊNERO</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.pickerTrigger}
                                    onPress={() => setShowGenderModal(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.pickerText, !formData.gender && { color: 'rgba(255,255,255,0.2)' }]}>
                                        {formData.gender === 'male' ? 'Masculino' :
                                            formData.gender === 'female' ? 'Feminino' :
                                                formData.gender === 'other' ? 'Outro' : 'Selecione'}
                                    </Text>
                                    <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <View style={styles.labelContainer}>
                                    <Calendar size={12} color={brandColors.primary} />
                                    <Text style={styles.label}>NASCIMENTO</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.pickerTrigger}
                                    onPress={() => setShowDatePicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.pickerText, !formData.birth_date && { color: 'rgba(255,255,255,0.2)' }]}>
                                        {formData.birth_date ? format(new Date(formData.birth_date + 'T12:00:00'), 'dd/MM/yyyy') : 'DD/MM/AAAA'}
                                    </Text>
                                    <Calendar size={14} color="rgba(255,255,255,0.3)" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                {renderInput(
                                    "PESO (KG)",
                                    formData.current_weight,
                                    (val) => setFormData({ ...formData, current_weight: val }),
                                    <Scale size={12} color={brandColors.primary} />,
                                    "0.0",
                                    "decimal-pad"
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                {renderInput(
                                    "ALVO (KG)",
                                    formData.target_weight,
                                    (val) => setFormData({ ...formData, target_weight: val }),
                                    <Target size={12} color={brandColors.primary} />,
                                    "0.0",
                                    "decimal-pad"
                                )}
                            </View>
                        </View>

                        {renderInput(
                            "CONTATO WHATSAPP",
                            formData.phone,
                            (val) => setFormData({ ...formData, phone: val }),
                            <Phone size={12} color={brandColors.primary} />,
                            "(00) 00000-0000",
                            "phone-pad",
                            "cel-phone"
                        )}

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: brandColors.primary }]}
                            onPress={handleSave}
                            disabled={isSaving}
                            activeOpacity={0.8}
                        >
                            {isSaving ? (
                                <ActivityIndicator color={brandColors.secondary} />
                            ) : (
                                <>
                                    <Text style={[styles.saveButtonText, { color: brandColors.secondary }]}>Salvar Alterações</Text>
                                    <Save size={18} color={brandColors.secondary} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Gender Selection Modal */}
            <ConfirmationModal
                visible={showGenderModal}
                title="Gênero"
                message="Como você se identifica?"
                type="info"
                onConfirm={() => { }}
                onCancel={() => setShowGenderModal(false)}
                showFooter={false}
                brandColors={brandColors}
            >
                <View style={styles.modalOptions}>
                    {[
                        { id: 'male', label: 'Masculino' },
                        { id: 'female', label: 'Feminino' },
                        { id: 'other', label: 'Outro' }
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.optionButton,
                                formData.gender === opt.id && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: brandColors.primary }
                            ]}
                            onPress={() => {
                                setFormData({ ...formData, gender: opt.id as any });
                                setShowGenderModal(false);
                            }}
                        >
                            <Text style={[
                                styles.optionText,
                                formData.gender === opt.id && { color: brandColors.primary }
                            ]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ConfirmationModal>

            {/* Native Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.birth_date ? new Date(formData.birth_date + 'T12:00:00') : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    themeVariant="dark"
                />
            )}

            <ConfirmationModal
                visible={modalVisible}
                title="Erro ao Salvar"
                message={errorMessage}
                type="warning"
                onConfirm={() => setModalVisible(false)}
                onCancel={() => setModalVisible(false)}
                confirmText="Ok"
                brandColors={brandColors}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 60,
    },
    closeBtn: {
        padding: 4,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    avatarUploadContainer: {
        width: 100,
        height: 100,
        borderRadius: 32,
        borderWidth: 1,
        padding: 4,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#050505',
    },
    avatarLabel: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        marginTop: 16,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        paddingLeft: 4,
    },
    label: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 56,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    input: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
    },
    pickerTrigger: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 56,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : 'Outfit_500Medium',
    },
    saveButton: {
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
    },
    modalOptions: {
        gap: 8,
        marginTop: 16,
    },
    optionButton: {
        height: 56,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFF',
    },
});
