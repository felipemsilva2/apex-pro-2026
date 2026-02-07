import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'success' | 'info';
    brandColors: { primary: string; secondary: string };
    children?: React.ReactNode;
    showFooter?: boolean;
    containerStyle?: any;
}

export const ConfirmationModal = ({
    visible,
    title,
    message,
    confirmText = 'CONFIRMAR',
    cancelText = 'CANCELAR',
    onConfirm,
    onCancel,
    type = 'warning',
    brandColors,
    children,
    showFooter = true,
    containerStyle,
}: ConfirmationModalProps) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { borderColor: `${brandColors.primary}30` }, containerStyle]}>
                    {/* Decorative Corner */}
                    <View style={[styles.corner, { backgroundColor: brandColors.primary }]} />

                    <View style={styles.header}>
                        {type === 'warning' && <AlertTriangle size={24} color={brandColors.primary} />}
                        {type === 'success' && <CheckCircle2 size={24} color={brandColors.primary} />}
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    <Text style={styles.message}>{message}</Text>

                    {children}



                    {showFooter && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    { backgroundColor: brandColors.primary }
                                ]}
                                onPress={onConfirm}
                            >
                                <Text style={[styles.confirmText, { color: brandColors.secondary }]}>
                                    {confirmText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker overlay for focus
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        width: '100%',
        backgroundColor: '#0A0A0B',
        borderWidth: 1,
        padding: 24,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 20,
        height: 20,
        opacity: 0.5,
        borderBottomLeftRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Syne', // Assuming font is loaded globally, strictly enforcing font-family usually requires checks
        fontWeight: '700',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    message: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    warningBox: {
        borderWidth: 1,
        padding: 12,
        marginBottom: 24,
        borderStyle: 'dashed',
    },
    warningText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    cancelText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 1,
    },
    confirmButton: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmText: {
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 1,
        fontStyle: 'italic',
    },
});
