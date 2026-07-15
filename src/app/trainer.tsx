import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { ScoreKeypad } from '@/components/score-keypad';
import { useTrainerStore } from '@/stores/trainer-store';
import { colors, spacing, typography } from '@/theme';
import { dartLabel } from '@/utils/dart-label';

const CORRECT_ADVANCE_MS = 700;

export default function TrainerScreen() {
  const question = useTrainerStore((state) => state.question);
  const streak = useTrainerStore((state) => state.streak);
  const attempts = useTrainerStore((state) => state.attempts);
  const correctCount = useTrainerStore((state) => state.correctCount);
  const lastResult = useTrainerStore((state) => state.lastResult);
  const suggestedRoute = useTrainerStore((state) => state.suggestedRoute);
  const start = useTrainerStore((state) => state.start);
  const answer = useTrainerStore((state) => state.answer);
  const nextQuestion = useTrainerStore((state) => state.nextQuestion);
  const skip = useTrainerStore((state) => state.skip);

  const shake = useSharedValue(0);
  const streakScale = useSharedValue(1);

  useEffect(() => {
    if (question === null) {
      start();
    }
  }, [question, start]);

  useEffect(() => {
    if (lastResult === 'correct') {
      streakScale.value = withSequence(
        withSpring(1.25, { damping: 12, stiffness: 260 }),
        withSpring(1, { damping: 16, stiffness: 200 }),
      );
      const timer = setTimeout(nextQuestion, CORRECT_ADVANCE_MS);
      return () => clearTimeout(timer);
    }
    if (lastResult === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 45 }),
        withTiming(5, { duration: 45 }),
        withTiming(0, { duration: 40 }),
      );
    }
    return undefined;
  }, [lastResult, nextQuestion, shake, streakScale]);

  const remainingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  if (question === null) {
    return <Screen>{null}</Screen>;
  }

  const accuracy = attempts === 0 ? 100 : Math.round((correctCount / attempts) * 100);

  return (
    <Screen>
      <View style={styles.header}>
        <Animated.View style={[styles.streakBadge, streakStyle]}>
          <Text style={styles.streakValue}>{streak}</Text>
          <Text style={styles.streakLabel}>STREAK</Text>
        </Animated.View>
        <Text style={styles.accuracy}>{accuracy}% accuracy</Text>
      </View>

      <View style={styles.questionArea}>
        <View style={styles.pips}>
          {[1, 2, 3].map((pip) => (
            <View
              key={pip}
              style={[styles.pip, pip <= question.dartsLeft && styles.pipActive]}
            />
          ))}
        </View>
        <Animated.Text
          style={[
            styles.remaining,
            remainingStyle,
            lastResult === 'correct' && styles.remainingCorrect,
            lastResult === 'wrong' && styles.remainingWrong,
          ]}
        >
          {question.remaining}
        </Animated.Text>
        <Text style={styles.prompt}>
          {question.dartsLeft === 1 ? 'One dart. Hit the finish.' : 'What do you throw first?'}
        </Text>

        {lastResult === 'wrong' && suggestedRoute !== null ? (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.solution}>
            <View style={styles.routeChips}>
              {suggestedRoute.map((dart, index) => (
                <View key={`${dartLabel(dart)}-${index}`} style={styles.routeChip}>
                  <Text style={styles.routeChipLabel}>{dartLabel(dart)}</Text>
                </View>
              ))}
            </View>
            <PressableScale onPress={nextQuestion} style={styles.continueButton}>
              <Text style={styles.continueLabel}>Continue</Text>
            </PressableScale>
          </Animated.View>
        ) : null}
      </View>

      <ScoreKeypad onDart={answer} onUndo={skip} disabled={lastResult !== null} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    backgroundColor: colors.feltDeep,
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  streakValue: {
    ...typography.heading,
    color: colors.brassBright,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 1.5,
  },
  accuracy: {
    ...typography.caption,
    color: colors.textMuted,
  },
  questionArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.line,
  },
  pipActive: {
    backgroundColor: colors.brass,
  },
  remaining: {
    ...typography.score,
    fontSize: 96,
    color: colors.textPrimary,
  },
  remainingCorrect: {
    color: colors.boardGreen,
  },
  remainingWrong: {
    color: colors.boardRed,
  },
  prompt: {
    ...typography.body,
    color: colors.textSecondary,
  },
  solution: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  routeChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  routeChip: {
    backgroundColor: colors.feltDeep,
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  routeChipLabel: {
    ...typography.heading,
    color: colors.brassBright,
  },
  continueButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  continueLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
