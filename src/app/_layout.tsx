import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useDatabase } from '@/hooks/use-database';
import { colors, spacing, typography } from '@/theme';

export default function RootLayout() {
  const { ready, error } = useDatabase();

  if (error !== null) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Database failed to initialize: {error.message}</Text>
      </View>
    );
  }

  if (!ready) {
    return <View style={styles.fallback} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fallbackText: {
    ...typography.body,
    color: colors.boardRed,
    textAlign: 'center',
  },
});
