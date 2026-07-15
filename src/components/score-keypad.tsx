import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { colors, spacing, typography } from '@/theme';
import type { Multiplier, SegmentNumber } from '@/types/darts';
import type { ScoreKeypadProps } from '@/types/ui';

const SEGMENT_ROWS: SegmentNumber[][] = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
];

const MULTIPLIER_LABELS: Record<Multiplier, string> = {
  1: 'SINGLE',
  2: 'DOUBLE',
  3: 'TREBLE',
};

export function ScoreKeypad({ onDart, onUndo, disabled = false }: ScoreKeypadProps) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);

  const emitSegment = (segment: SegmentNumber) => {
    onDart({ kind: 'number', segment, multiplier });
    setMultiplier(1);
  };

  const emitBull = (bullMultiplier: 1 | 2) => {
    onDart({ kind: 'bull', multiplier: bullMultiplier });
    setMultiplier(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.multiplierRow}>
        {([1, 2, 3] as const).map((value) => (
          <PressableScale
            key={value}
            onPress={() => setMultiplier(multiplier === value ? 1 : value)}
            style={[styles.multiplierKey, multiplier === value && styles.multiplierKeyActive]}
            disabled={disabled}
          >
            <Text
              style={[
                styles.multiplierLabel,
                multiplier === value && styles.multiplierLabelActive,
              ]}
            >
              {MULTIPLIER_LABELS[value]}
            </Text>
          </PressableScale>
        ))}
      </View>

      {SEGMENT_ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((segment) => (
            <PressableScale
              key={segment}
              onPress={() => emitSegment(segment)}
              style={styles.key}
              disabled={disabled}
            >
              <Text style={styles.keyLabel}>{segment}</Text>
            </PressableScale>
          ))}
        </View>
      ))}

      <View style={styles.row}>
        <PressableScale
          onPress={() => emitBull(1)}
          style={[styles.key, multiplier === 3 && styles.keyDisabled]}
          disabled={disabled || multiplier === 3}
        >
          <Text style={styles.keyLabel}>25</Text>
        </PressableScale>
        <PressableScale
          onPress={() => emitBull(2)}
          style={[styles.key, styles.bullKey, multiplier === 3 && styles.keyDisabled]}
          disabled={disabled || multiplier === 3}
        >
          <Text style={[styles.keyLabel, styles.bullLabel]}>BULL</Text>
        </PressableScale>
        <PressableScale
          onPress={() => onDart({ kind: 'miss' })}
          style={[styles.key, styles.missKey]}
          disabled={disabled}
        >
          <Text style={[styles.keyLabel, styles.missLabel]}>MISS</Text>
        </PressableScale>
        <PressableScale onPress={onUndo} style={[styles.key, styles.undoKey]} disabled={disabled}>
          <Text style={[styles.keyLabel, styles.undoLabel]}>UNDO</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  multiplierRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  multiplierKey: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  multiplierKeyActive: {
    backgroundColor: colors.feltDeep,
    borderColor: colors.brass,
  },
  multiplierLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  multiplierLabelActive: {
    color: colors.brassBright,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  key: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: {
    opacity: 0.35,
  },
  keyLabel: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  bullKey: {
    backgroundColor: colors.feltDeep,
  },
  bullLabel: {
    color: colors.brassBright,
    fontSize: 15,
    letterSpacing: 1,
  },
  missKey: {
    backgroundColor: colors.surface,
  },
  missLabel: {
    color: colors.textMuted,
    fontSize: 15,
    letterSpacing: 1,
  },
  undoKey: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.boardRed,
  },
  undoLabel: {
    color: colors.boardRed,
    fontSize: 15,
    letterSpacing: 1,
  },
});
