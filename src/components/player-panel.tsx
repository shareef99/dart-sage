import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import type { PlayerPanelProps } from '@/types/ui';

const ACTIVE_SPRING = { damping: 20, stiffness: 180 };

export function PlayerPanel({ name, remaining, legsWon, isActive, average }: PlayerPanelProps) {
  const activeStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(isActive ? colors.brass : colors.line, ACTIVE_SPRING),
    transform: [{ scale: withSpring(isActive ? 1 : 0.96, ACTIVE_SPRING) }],
    opacity: withSpring(isActive ? 1 : 0.75, ACTIVE_SPRING),
  }));

  return (
    <Animated.View style={[styles.container, activeStyle]}>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.remaining}>{remaining}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Legs {legsWon}</Text>
        <Text style={styles.meta}>Avg {average.toFixed(1)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  remaining: {
    ...typography.score,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
