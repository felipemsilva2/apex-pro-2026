import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface FABProps {
    onPress: () => void;
    style?: ViewStyle;
}

export const FAB = ({ onPress, style }: FABProps) => {
    const { brandColors } = useAuth();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: brandColors.primary, shadowColor: brandColors.primary },
                style
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Plus size={28} color="#000" strokeWidth={2.5} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 50,
    },
});
