import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { ScoreKeypad } from '@/components/score-keypad';
import { toIsoDate } from '@/services/daily-repository';
import { useDailyStore } from '@/stores/daily-store';
import { colors, spacing, typography } from '@/theme';
import { dartLabel } from '@/utils/dart-label';

export default function DailyScreen() {
  const router = useRouter();
  const phase = useDailyStore((state) => state.phase);
  const questions = useDailyStore((state) => state.questions);
  const questionIndex = useDailyStore((state) => state.questionIndex);
  const results = useDailyStore((state) => state.results);
  const suggestedRoute = useDailyStore((state) => state.suggestedRoute);
  const streak = useDailyStore((state) => state.streak);
  const canRestoreStreak = useDailyStore((state) => state.canRestoreStreak);
  const load = useDailyStore((state) => state.load);
  const start = useDailyStore((state) => state.start);
  const answer = useDailyStore((state) => state.answer);
  const continueAfterReveal = useDailyStore((state) => state.continueAfterReveal);
  const restoreStreak = useDailyStore((state) => state.restoreStreak);

  useEffect(() => {
    void load(toIsoDate(new Date()));
  }, [load]);

  const question = questions[questionIndex];
  const score = results.filter(Boolean).length;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakValue}>{streak.current}</Text>
          <Text style={styles.streakLabel}>DAY STREAK</Text>
        </View>
        <Text style={styles.progress}>
          {phase === 'playing' || phase === 'revealing'
            ? `${Math.min(results.length + 1, questions.length)}/${questions.length}`
            : `Best ${streak.best}`}
        </Text>
      </View>

      {phase === 'ready' ? (
        <View style={styles.center}>
          <Text style={styles.title}>Today&apos;s Five</Text>
          <Text style={styles.subtitle}>
            The same five finishes for every player, every day.
          </Text>
          <PressableScale onPress={start} style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>Start</Text>
          </PressableScale>
          {canRestoreStreak ? (
            <PressableScale onPress={restoreStreak} style={styles.restoreButton}>
              <Text style={styles.restoreLabel}>Restore streak · watch an ad</Text>
            </PressableScale>
          ) : null}
        </View>
      ) : null}

      {(phase === 'playing' || phase === 'revealing') && question !== undefined ? (
        <>
          <View style={styles.center}>
            <View style={styles.pips}>
              {[1, 2, 3].map((pip) => (
                <View key={pip} style={[styles.pip, pip <= question.dartsLeft && styles.pipActive]} />
              ))}
            </View>
            <Text style={[styles.remaining, phase === 'revealing' && styles.remainingWrong]}>
              {question.remaining}
            </Text>
            <Text style={styles.subtitle}>
              {question.dartsLeft === 1 ? 'One dart. Hit the finish.' : 'What do you throw first?'}
            </Text>
            {phase === 'revealing' && suggestedRoute !== null ? (
              <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.solution}>
                <View style={styles.routeChips}>
                  {suggestedRoute.map((dart, index) => (
                    <View key={`${dartLabel(dart)}-${index}`} style={styles.routeChip}>
                      <Text style={styles.routeChipLabel}>{dartLabel(dart)}</Text>
                    </View>
                  ))}
                </View>
                <PressableScale onPress={continueAfterReveal} style={styles.continueButton}>
                  <Text style={styles.continueLabel}>Continue</Text>
                </PressableScale>
              </Animated.View>
            ) : null}
          </View>
          <ScoreKeypad
            onDart={answer}
            onUndo={continueAfterReveal}
            disabled={phase !== 'playing'}
          />
        </>
      ) : null}

      {phase === 'done' ? (
        <View style={styles.center}>
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(140)}
            style={styles.doneCard}
          >
            <Text style={styles.title}>
              {results.length > 0 ? `${score}/${questions.length}` : 'Done for today!'}
            </Text>
            <Text style={styles.subtitle}>
              {streak.completedToday
                ? `Streak alive: ${streak.current} ${streak.current === 1 ? 'day' : 'days'}`
                : 'Come back tomorrow for five new finishes.'}
            </Text>
            <PressableScale onPress={() => router.replace('/')} style={styles.primaryButton}>
              <Text style={styles.primaryLabel}>Back to Menu</Text>
            </PressableScale>
          </Animated.View>
        </View>
      ) : null}
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
  progress: {
    ...typography.caption,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  remainingWrong: {
    color: colors.boardRed,
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
  doneCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brass,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.felt,
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryLabel: {
    ...typography.heading,
    color: colors.brassBright,
  },
  restoreButton: {
    paddingVertical: spacing.sm,
  },
  restoreLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
