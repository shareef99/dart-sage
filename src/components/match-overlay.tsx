import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { PressableScale } from '@/components/pressable-scale';
import { colors, spacing, typography } from '@/theme';
import type { MatchOverlayProps } from '@/types/ui';

export function MatchOverlay({
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: MatchOverlayProps) {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
      <Animated.View entering={ZoomIn.springify().damping(16).stiffness(140)} style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.actions}>
          <PressableScale onPress={onPrimary} style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>{primaryLabel}</Text>
          </PressableScale>
          {secondaryLabel !== undefined && onSecondary !== undefined ? (
            <PressableScale onPress={onSecondary} style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
            </PressableScale>
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(4, 8, 6, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brass,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.brassBright,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.felt,
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryLabel: {
    ...typography.heading,
    color: colors.brassBright,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
});
