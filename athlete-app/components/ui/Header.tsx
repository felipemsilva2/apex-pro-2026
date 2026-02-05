import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
    onBack?: () => void;
    variant?: 'default' | 'hero' | 'brand';
}

/**
 * Header component with tactical HUD styling
 * Supports back navigation and right actions
 */
export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    rightAction,
    onBack,
    variant = 'default',
}) => {
    const { brandColors, tenant } = useAuth();

    return (
        <View style={[styles.container, variant === 'hero' && styles.heroContainer, variant === 'brand' && styles.brandContainer]}>
            {onBack && (
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                    accessibilityLabel="Voltar"
                    accessibilityRole="button"
                >
                    <ChevronLeft size={24} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            )}

            <View style={styles.content}>
                {variant === 'brand' && tenant ? (
                    <View style={styles.brandContent}>
                        {tenant.logo_url ? (
                            <Image
                                source={{ uri: tenant.logo_url }}
                                style={styles.brandLogo}
                                resizeMode="contain"
                            />
                        ) : (
                            <View>
                                <Text style={[styles.brandTitle, { color: '#FFF' }]}>
                                    TEAM {tenant.business_name?.split(' ')[0]}
                                </Text>
                                <View style={[styles.line, { backgroundColor: brandColors.primary, width: 20, marginTop: 2 }]} />
                            </View>
                        )}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                ) : (
                    <View style={styles.titleContainer}>
                        <Text
                            style={[
                                styles.title,
                                variant === 'hero' && styles.heroTitle,
                            ]}
                            numberOfLines={1}
                        >
                            {title || 'ApexPRO'}
                        </Text>
                        <View
                            style={[
                                styles.line,
                                { backgroundColor: `${brandColors.primary}4D` },
                            ]}
                        />
                        {subtitle && (
                            <Text style={styles.subtitle} numberOfLines={2}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 60,
    },
    heroContainer: {
        paddingVertical: 24,
        minHeight: 100,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    content: {
        flex: 1,
    },
    titleContainer: {
        marginBottom: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    heroTitle: {
        fontSize: 28,
        marginBottom: 8,
    },
    line: {
        height: 2,
        width: 40,
        marginTop: 6,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    rightAction: {
        marginLeft: 12,
    },
    brandContainer: {
        paddingVertical: 16,
    },
    brandContent: {
        justifyContent: 'center',
    },
    brandLogo: {
        height: 32,
        width: 120,
        marginBottom: 4,
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: -0.5,
        textTransform: 'uppercase',
    },
});
