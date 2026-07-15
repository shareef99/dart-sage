import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { colors, spacing, typography } from '@/theme';
import type { OptionChipProps } from '@/types/ui';

export function OptionChip({ label, active, onPress }: OptionChipProps) {
  return (
    <PressableScale onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.feltDeep,
    borderColor: colors.brass,
  },
  chipLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.brassBright,
    fontWeight: '600',
  },
});
