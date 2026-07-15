import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { CricketTarget } from '@/types/cricket';
import type { CricketBoardProps } from '@/types/ui';

const TARGETS: CricketTarget[] = ['20', '19', '18', '17', '16', '15', 'bull'];

const MARK_GLYPHS = ['·', '/', 'X', '⊗'] as const;

function markGlyph(marks: number): string {
  return MARK_GLYPHS[Math.min(marks, 3)] ?? '·';
}

export function CricketBoard({ leftMarks, rightMarks }: CricketBoardProps) {
  return (
    <View style={styles.container}>
      {TARGETS.map((target) => {
        const leftClosed = leftMarks[target] >= 3;
        const rightClosed = rightMarks[target] >= 3;
        return (
          <View key={target} style={styles.row}>
            <Text style={[styles.mark, leftClosed && styles.markClosed]}>
              {markGlyph(leftMarks[target])}
            </Text>
            <View style={[styles.targetPill, leftClosed && rightClosed && styles.targetDead]}>
              <Text style={styles.targetLabel}>{target === 'bull' ? 'BULL' : target}</Text>
            </View>
            <Text style={[styles.mark, rightClosed && styles.markClosed]}>
              {markGlyph(rightMarks[target])}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mark: {
    ...typography.heading,
    color: colors.textSecondary,
    width: 96,
    textAlign: 'center',
  },
  markClosed: {
    color: colors.brassBright,
  },
  targetPill: {
    width: 88,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
  },
  targetDead: {
    opacity: 0.35,
  },
  targetLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
