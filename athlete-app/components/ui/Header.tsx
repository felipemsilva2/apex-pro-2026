import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
    onBack?: () => void;
    variant?: 'default' | 'hero' | 'brand' | 'hero-detail';
}

/**
 * Header component with Reacticx-inspired aesthetic
 * Uses BlurView for depth and clean technical typography
 */
export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    rightAction,
    onBack,
    variant = 'default',
}) => {
    const { brandColors, tenant } = useAuth();
    const insets = useSafeAreaInsets();

    const Wrapper = (variant === 'hero' || variant === 'hero-detail') ? View : BlurView;

    return (
        <Wrapper
            intensity={(variant === 'hero' || variant === 'hero-detail') ? 0 : 80}
            tint="dark"
            style={[
                styles.container,
                variant === 'hero' && styles.heroContainer,
                variant === 'brand' && styles.brandContainer,
                variant === 'hero-detail' && styles.heroDetailContainer,
                (variant !== 'hero' && variant !== 'hero-detail') && styles.floatingHeader,
                { paddingTop: insets.top + 24 }
            ]}
        >
            {onBack && (
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                    accessibilityLabel="Voltar para tela anterior"
                    accessibilityRole="button"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={24} color="#FFF" opacity={0.7} />
                </TouchableOpacity>
            )}

            <View style={[
                styles.content,
                variant === 'hero' && styles.heroContentRow
            ]}>
                {variant === 'brand' && tenant ? (
                    <View
                        style={styles.brandContent}
                        accessibilityRole="header"
                    >
                        {tenant.logo_url ? (
                            tenant.logo_url.toLowerCase().endsWith('.svg') ? (
                                <SvgUri
                                    uri={tenant.logo_url}
                                    width={140}
                                    height={40}
                                    preserveAspectRatio="xMinYMin meet"
                                    accessibilityLabel={`Logo ${tenant.business_name}`}
                                />
                            ) : (
                                <Image
                                    source={{ uri: tenant.logo_url }}
                                    style={styles.brandLogo}
                                    resizeMode="contain"
                                    accessibilityLabel={`Logo ${tenant.business_name}`}
                                    accessibilityRole="image"
                                />
                            )
                        ) : (
                            <View accessibilityRole="header">
                                <Text style={[styles.brandTitle, { color: '#FFF' }]}>
                                    EQUIPE {tenant.business_name?.split(' ')[0]}
                                </Text>
                            </View>
                        )}
                        {subtitle && <Text style={styles.brandSubtitle}>{subtitle}</Text>}
                    </View>
                ) : (
                    <>
                        {variant === 'hero' ? (
                            <View
                                style={styles.heroProfileRow}
                                accessibilityRole="header"
                            >
                                <View style={[styles.heroAvatarContainer, { borderColor: `${brandColors.primary}40` }]}>
                                    {tenant?.logo_url ? (
                                        tenant.logo_url.toLowerCase().endsWith('.svg') ? (
                                            <SvgUri
                                                uri={tenant.logo_url}
                                                width={56}
                                                height={56}
                                                preserveAspectRatio="xMidYMid meet"
                                                accessibilityLabel={`Logo ${tenant.business_name}`}
                                            />
                                        ) : (
                                            <Image
                                                source={{ uri: tenant.logo_url }}
                                                style={styles.heroAvatar}
                                                resizeMode="cover"
                                                accessibilityLabel={`Logo ${tenant.business_name}`}
                                                accessibilityRole="image"
                                            />
                                        )
                                    ) : (
                                        <ShieldCheck size={28} color={brandColors.primary} />
                                    )}
                                </View>
                                <View style={styles.heroTextContainer}>
                                    <View style={styles.heroTitleRow}>
                                        <Text style={styles.heroTitle} numberOfLines={1}>{title}</Text>
                                        <View style={[styles.heroStatusDot, { backgroundColor: brandColors.primary }]} />
                                    </View>
                                    {subtitle && <Text style={styles.heroSubtitle} numberOfLines={1}>{subtitle}</Text>}
                                </View>
                            </View>
                        ) : (
                            <View
                                style={styles.titleContainer}
                                accessibilityRole="header"
                            >
                                {title && (
                                    <Text
                                        style={variant === 'hero-detail' ? styles.heroDetailTitle : styles.title}
                                        numberOfLines={1}
                                    >
                                        {title}
                                    </Text>
                                )}
                                {subtitle && (
                                    <Text
                                        style={variant === 'hero-detail' ? styles.heroDetailSubtitle : styles.subtitle}
                                        numberOfLines={1}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                        )}
                    </>
                )}
            </View>

            {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        minHeight: 64,
        zIndex: 100,
    },
    floatingHeader: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        position: 'relative',
    },
    heroContainer: {
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    heroDetailContainer: {
        paddingVertical: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    heroContentRow: {
        flex: 1,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    heroDetailTitle: {
        fontSize: 24,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : 'Outfit_400Regular',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    heroDetailSubtitle: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-SemiBold' : 'Outfit_600SemiBold',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    heroTitle: {
        fontSize: 28,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : 'Outfit_700Bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        textTransform: 'uppercase',
    },
    heroTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroStatusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginLeft: 8,
        opacity: 0.8,
    },
    heroProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroAvatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        padding: 2,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.02)',
        marginRight: 16,
    },
    heroAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    heroTextContainer: {
        flex: 1,
    },
    heroSubtitle: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Outfit-SemiBold' : 'Outfit_600SemiBold',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    rightAction: {
        marginLeft: 12,
    },
    brandContainer: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    brandContent: {
        justifyContent: 'center',
    },
    brandLogo: {
        height: 32,
        width: 100,
    },
    brandTitle: {
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Syne-ExtraBold' : 'Syne_800ExtraBold',
        letterSpacing: -0.5,
        textTransform: 'uppercase',
    },
    brandSubtitle: {
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginTop: 2,
    }
});
