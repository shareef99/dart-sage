import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { MenuCard } from '@/components/menu-card';
import { Screen } from '@/components/screen';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const menuShift = useSharedValue<number>(spacing.xl);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
    menuShift.value = withDelay(180, withSpring(0, { damping: 16, stiffness: 110 }));
  }, [scale, opacity, menuShift]);

  const wordmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: menuShift.value }],
    opacity: opacity.value,
  }));

  return (
    <Screen>
      <View style={styles.hero}>
        <Animated.View style={[styles.heroInner, wordmarkStyle]}>
          <Text style={styles.wordmark}>
            Dart<Text style={styles.wordmarkAccent}>Sage</Text>
          </Text>
          <Text style={styles.tagline}>Score. Train. Finish.</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.menu, menuStyle]}>
        <MenuCard
          title="New Match"
          subtitle="501 · 301 · vs bot or a friend"
          onPress={() => router.push('/new-match')}
        />
        <MenuCard
          title="Checkout Trainer"
          subtitle="Drill your finishes · build a streak"
          onPress={() => router.push('/trainer')}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    ...typography.display,
    color: colors.textPrimary,
  },
  wordmarkAccent: {
    color: colors.brass,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  menu: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
