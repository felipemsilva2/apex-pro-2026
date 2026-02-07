import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';
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

            <View style={[
                styles.content,
                variant === 'hero' && styles.heroContentRow
            ]}>
                {variant === 'brand' && tenant ? (
                    <View style={styles.brandContent}>
                        {tenant.logo_url ? (
                            tenant.logo_url.toLowerCase().endsWith('.svg') ? (
                                <SvgUri
                                    uri={tenant.logo_url}
                                    width={140}
                                    height={50}
                                    preserveAspectRatio="xMinYMin meet"
                                />
                            ) : (
                                <Image
                                    source={{ uri: tenant.logo_url }}
                                    style={styles.brandLogo}
                                    resizeMode="contain"
                                />
                            )
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
                    <>
                        {variant === 'hero' ? (
                            <View style={styles.heroProfileRow}>
                                <View style={[styles.heroAvatarContainer, { borderColor: brandColors.primary }]}>
                                    {tenant?.logo_url ? (
                                        tenant.logo_url.toLowerCase().endsWith('.svg') ? (
                                            <SvgUri
                                                uri={tenant.logo_url}
                                                width={64}
                                                height={64}
                                                preserveAspectRatio="xMidYMid meet"
                                            />
                                        ) : (
                                            <Image
                                                source={{ uri: tenant.logo_url }}
                                                style={styles.heroAvatar}
                                                resizeMode="cover"
                                            />
                                        )
                                    ) : (
                                        <ShieldCheck size={32} color={brandColors.primary} />
                                    )}
                                </View>
                                <View style={styles.heroTextContainer}>
                                    {title && <Text style={styles.heroTitle} numberOfLines={1}>{title}</Text>}
                                    {subtitle && <Text style={styles.heroSubtitle} numberOfLines={1}>{subtitle}</Text>}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.titleContainer}>
                                {title && (
                                    <Text style={styles.title} numberOfLines={1}>
                                        {title}
                                    </Text>
                                )}
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
                    </>
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
        paddingHorizontal: 20, // Standard app padding
        minHeight: 60,
    },
    heroContainer: {
        paddingVertical: 24,
        paddingHorizontal: 20, // Keep consistent with standard
        minHeight: 100,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    content: {
        flex: 1,
        alignItems: 'flex-start',
    },
    heroContentRow: {
        flex: 1,
    },
    titleContainer: {
        width: '100%',
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
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        lineHeight: 28,
    },
    heroProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
    },
    heroAvatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        padding: 2,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginRight: 16,
    },
    heroAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 31,
    },
    heroTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: 2,
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
        height: 40,
        width: 120,
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: -0.5,
        textTransform: 'uppercase',
    },
});
