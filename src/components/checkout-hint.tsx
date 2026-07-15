import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { checkoutRoute } from '@/engine/checkout';
import { colors, spacing, typography } from '@/theme';
import type { CheckoutHintProps } from '@/types/ui';
import { dartLabel } from '@/utils/dart-label';

export function CheckoutHint({ remaining, dartsLeft }: CheckoutHintProps) {
  const route = checkoutRoute(remaining, dartsLeft);
  if (route === null) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.container}>
      <Text style={styles.label}>CHECKOUT</Text>
      <View style={styles.chips}>
        {route.map((dart, index) => (
          <View key={`${dartLabel(dart)}-${index}`} style={styles.chip}>
            <Text style={styles.chipLabel}>{dartLabel(dart)}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 2,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.feltDeep,
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.brassBright,
    fontWeight: '700',
  },
});
