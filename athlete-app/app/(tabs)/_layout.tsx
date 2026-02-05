import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { CustomBottomNav } from '../../components/navigation';

/**
 * Tabs layout with custom bottom navigation
 * Replaces default Expo Router tabs with tactical HUD styled nav
 */
export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* Render the active tab content */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Custom bottom navigation */}
      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  content: {
    flex: 1,
  },
});
