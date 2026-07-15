import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { CricketPlayerScoreProps } from '@/types/ui';

export function CricketPlayerScore({ name, points, isActive }: CricketPlayerScoreProps) {
  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.points}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 104,
  },
  containerActive: {
    borderColor: colors.brass,
    backgroundColor: colors.surface,
  },
  name: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  points: {
    ...typography.title,
    color: colors.textPrimary,
  },
});
