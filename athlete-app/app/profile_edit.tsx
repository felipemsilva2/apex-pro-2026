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
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
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
    ChevronDown
} from 'lucide-react-native';
import { TextInputMask } from 'react-native-masked-text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

/**
 * Profile Edit Screen - Allows athletes to fill in their own biometric data
 */
export default function ProfileEditScreen() {
    const { profile, brandColors } = useAuth();
    const router = useRouter();
    const updateProfile = useUpdateAthleteProfile();

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        gender: profile?.gender || '',
        birth_date: profile?.birth_date || '', // Expected format: YYYY-MM-DD
        phone: profile?.phone || '',
        current_weight: profile?.current_weight?.toString().replace('.', ',') || '',
        target_weight: profile?.target_weight?.toString().replace('.', ',') || '',
        height: profile?.height?.toString().replace('.', ',') || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Clean up phone number: remove masking characters (keep only digits)
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
            });
            router.back();
        } catch (error) {
            console.error('Error saving profile:', error);
            setModalVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Store as ISO YYYY-MM-DD
            setFormData({ ...formData, birth_date: format(selectedDate, 'yyyy-MM-dd') });
        }
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
                <View style={[styles.indicator, { backgroundColor: brandColors.primary }]} />
                {maskType ? (
                    <TextInputMask
                        type={maskType}
                        options={maskType === 'datetime' ? { format: 'DD/MM/YYYY' } : { maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
                        style={styles.input}
                        value={value}
                        includeRawValueInChangeText={true}
                        onChangeText={(text, raw) => {
                            if (maskType === 'datetime') {
                                // For datetime, we handle conversion if needed, but here text is masked
                                onChange(text);
                            } else {
                                onChange(text);
                            }
                        }}
                        placeholder={placeholder}
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType={keyboardType}
                    />
                ) : (
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        placeholder={placeholder}
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType={keyboardType}
                    />
                )}
            </View>
        </View>
    );

    return (
        <Container variant="page">
            <Header
                title="AJUSTE DE PERFIL"
                subtitle="CONFIGURAÇÃO TÁTICA BIOMÉTRICA"
                onBack={() => router.back()}
                rightAction={
                    <TouchableOpacity onPress={() => router.back()}>
                        <X size={24} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {renderInput(
                        "NOME COMPLETO",
                        formData.full_name,
                        (val) => setFormData({ ...formData, full_name: val }),
                        <User size={14} color={brandColors.primary} />,
                        "Seu nome completo"
                    )}

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <View style={styles.labelContainer}>
                                <Activity size={14} color={brandColors.primary} />
                                <Text style={styles.label}>GÊNERO</Text>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <View style={[styles.indicator, { backgroundColor: brandColors.primary }]} />
                                <TouchableOpacity
                                    style={styles.pickerTrigger}
                                    onPress={() => setShowGenderModal(true)}
                                >
                                    <Text style={[styles.pickerText, !formData.gender && { color: 'rgba(255,255,255,0.2)' }]}>
                                        {formData.gender === 'male' ? 'MASCULINO' :
                                            formData.gender === 'female' ? 'FEMININO' :
                                                formData.gender === 'other' ? 'OUTRO' : 'SELECIONE'}
                                    </Text>
                                    <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <View style={styles.labelContainer}>
                                <Calendar size={14} color={brandColors.primary} />
                                <Text style={styles.label}>NASCIMENTO</Text>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <View style={[styles.indicator, { backgroundColor: brandColors.primary }]} />
                                <TouchableOpacity
                                    style={styles.pickerTrigger}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={[styles.pickerText, !formData.birth_date && { color: 'rgba(255,255,255,0.2)' }]}>
                                        {formData.birth_date ? format(new Date(formData.birth_date + 'T12:00:00'), 'dd/MM/yyyy') : 'DD/MM/AAAA'}
                                    </Text>
                                    <Calendar size={16} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            {renderInput(
                                "PESO ATUAL (KG)",
                                formData.current_weight,
                                (val) => setFormData({ ...formData, current_weight: val }),
                                <Scale size={14} color={brandColors.primary} />,
                                "00.0",
                                "decimal-pad"
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            {renderInput(
                                "ALVO TÁTICO (KG)",
                                formData.target_weight,
                                (val) => setFormData({ ...formData, target_weight: val }),
                                <Target size={14} color={brandColors.primary} />,
                                "00.0",
                                "decimal-pad"
                            )}
                        </View>
                    </View>

                    {renderInput(
                        "CONTATO (WHATSAPP)",
                        formData.phone,
                        (val) => setFormData({ ...formData, phone: val }),
                        <Phone size={14} color={brandColors.primary} />,
                        "(00) 00000-0000",
                        "phone-pad",
                        "cel-phone"
                    )}

                    <View style={{ height: 40 }} />

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: brandColors.primary }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={brandColors.secondary} />
                        ) : (
                            <>
                                <Text style={[styles.saveButtonText, { color: brandColors.secondary }]}>CONSOLIDAR ALTERAÇÕES</Text>
                                <Save size={20} color={brandColors.secondary} />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Gender Selection Modal */}
            <ConfirmationModal
                visible={showGenderModal}
                title="SELECIONE O GÊNERO"
                message="Como você se identifica?"
                type="info"
                onConfirm={() => { }} // Not used here as we have custom buttons
                onCancel={() => setShowGenderModal(false)}
                showFooter={false}
                cancelText="CANCELAR"
                brandColors={brandColors}
            >
                <View style={styles.modalOptions}>
                    {[
                        { id: 'male', label: 'MASCULINO' },
                        { id: 'female', label: 'FEMININO' },
                        { id: 'other', label: 'OUTRO' }
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.optionButton,
                                formData.gender === opt.id && { backgroundColor: `${brandColors.primary}20`, borderColor: brandColors.primary }
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

                    <TouchableOpacity
                        style={[styles.optionButton, { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }]}
                        onPress={() => setShowGenderModal(false)}
                    >
                        <Text style={[styles.optionText, { color: 'rgba(255,255,255,0.5)' }]}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </ConfirmationModal>

            {/* Native Date Picker Helper */}
            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <ConfirmationModal
                        visible={showDatePicker}
                        title="EFETOR CALENDÁRIO"
                        message="SINCRONIZAR DATA DE NASCIMENTO"
                        type="info"
                        onConfirm={() => setShowDatePicker(false)}
                        onCancel={() => setShowDatePicker(false)}
                        brandColors={brandColors}
                        containerStyle={{ paddingHorizontal: 12 }}
                    >
                        <View style={styles.datePickerContainer}>
                            <View style={[styles.hudLine, { backgroundColor: brandColors.primary }]} />
                            <DateTimePicker
                                value={formData.birth_date ? new Date(formData.birth_date + 'T12:00:00') : new Date()}
                                mode="date"
                                display="inline"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                                themeVariant="dark"
                                accentColor={brandColors.primary}
                                textColor="#FFFFFF"
                                style={{ width: '100%', alignSelf: 'center' }}
                            />
                        </View>
                    </ConfirmationModal>
                ) : (
                    <DateTimePicker
                        value={formData.birth_date ? new Date(formData.birth_date + 'T12:00:00') : new Date()}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )
            )}

            <ConfirmationModal
                visible={modalVisible}
                title="ERRO DE SINCRONIZAÇÃO"
                message="Não foi possível salvar os dados. Verifique sua conexão e tente novamente."
                type="warning"
                onConfirm={() => setModalVisible(false)}
                onCancel={() => setModalVisible(false)}
                confirmText="ENTENDI"
                brandColors={brandColors}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(212, 255, 0, 0.6)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontStyle: 'italic',
        fontFamily: 'Syne',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        height: 60,
    },
    indicator: {
        width: 3,
        height: '60%',
        marginRight: 15,
        shadowColor: '#D4FF00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        height: 60,
    },
    pickerTrigger: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 15,
    },
    pickerText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
        fontStyle: 'italic',
        paddingLeft: 18,
    },
    saveButton: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        transform: [{ skewX: '-10deg' }],
        shadowColor: '#D4FF00',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
        fontStyle: 'italic',
        transform: [{ skewX: '10deg' }],
    },
    modalOptions: {
        gap: 12,
        marginTop: 20,
    },
    optionButton: {
        height: 54,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 12,
        fontWeight: '800',
        fontStyle: 'italic',
        color: '#FFF',
    },
    datePickerContainer: {
        width: '100%',
        padding: 0,
        marginTop: 10,
    },
    hudLine: {
        height: 2,
        width: 30,
        marginBottom: 10,
    },
});
