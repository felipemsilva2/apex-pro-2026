import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Home, Dumbbell, Apple, TrendingUp } from 'lucide-react-native';
import { TabButton } from './TabButton';

/**
 * Custom bottom navigation bar with tactical HUD styling
 * Replaces default Expo Router tabs
 */
export const CustomBottomNav: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const tabs = [
        {
            name: '/(tabs)',
            displayName: 'index',
            label: 'Início',
            icon: Home,
        },
        {
            name: '/(tabs)/training',
            displayName: 'training',
            label: 'Treinos',
            icon: Dumbbell,
            badge: 0, // TODO: Connect to real data
        },
        {
            name: '/(tabs)/nutrition',
            displayName: 'nutrition',
            label: 'Dieta',
            icon: Apple,
        },
        {
            name: '/(tabs)/progress',
            displayName: 'progress',
            label: 'Progresso',
            icon: TrendingUp,
        },
    ];

    const isTabActive = (tabName: string) => {
        // Handle index route specially
        if (tabName === 'index') {
            return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';
        }
        return pathname.includes(tabName);
    };

    const handleTabPress = (tabName: string) => {
        if (tabName === 'index') {
            router.push('/(tabs)');
        } else {
            router.push(`/(tabs)/${tabName}` as any);
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.content}>
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.displayName}
                        icon={tab.icon}
                        label={tab.label}
                        badge={tab.badge}
                        active={isTabActive(tab.displayName)}
                        onPress={() => handleTabPress(tab.displayName)}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0A0A0B',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    content: {
        flexDirection: 'row',
        paddingTop: 4,
        paddingHorizontal: 8,
    },
});
