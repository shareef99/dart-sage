import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { StatTileProps } from '@/types/ui';

export function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.title,
    color: colors.brassBright,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
