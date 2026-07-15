import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MatchOverlay } from '@/components/match-overlay';
import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { currentTargetLabel, targetSequenceLength } from '@/engine/around-the-clock';
import { useAroundTheClockStore } from '@/stores/around-the-clock-store';
import { colors, spacing, typography } from '@/theme';
import type { Dart, SegmentNumber } from '@/types/darts';

const PLAYER_NAMES: Record<string, string> = { p1: 'You', p2: 'Player 2' };

export default function AroundTheClockScreen() {
  const router = useRouter();
  const match = useAroundTheClockStore((state) => state.match);
  const throwDart = useAroundTheClockStore((state) => state.throwDart);
  const undo = useAroundTheClockStore((state) => state.undo);
  const startMatch = useAroundTheClockStore((state) => state.startMatch);
  const endMatch = useAroundTheClockStore((state) => state.endMatch);

  if (match === null) {
    return <Redirect href="/" />;
  }

  const currentId = match.config.playerIds[match.currentPlayerIndex];
  const currentPlayer = currentId === undefined ? undefined : match.players[currentId];
  const targetIndex = currentPlayer?.targetIndex ?? 0;
  const isBullTarget = targetIndex === 20;
  const sequenceLength = targetSequenceLength(match.config);
  const winnerName =
    match.winnerId === null ? '' : (PLAYER_NAMES[match.winnerId] ?? match.winnerId);

  const throwAtTarget = (multiplier: 1 | 2 | 3): void => {
    if (isBullTarget) {
      throwDart({ kind: 'bull', multiplier: multiplier === 3 ? 2 : (multiplier as 1 | 2) });
      return;
    }
    throwDart({ kind: 'number', segment: (targetIndex + 1) as SegmentNumber, multiplier });
  };

  const missDart: Dart = { kind: 'miss' };

  return (
    <Screen>
      <View style={styles.playersRow}>
        {match.config.playerIds.map((playerId) => {
          const player = match.players[playerId];
          const isActive = playerId === currentId && match.phase === 'playing';
          return (
            <View key={playerId} style={[styles.playerCard, isActive && styles.playerCardActive]}>
              <Text style={styles.playerName}>{PLAYER_NAMES[playerId] ?? playerId}</Text>
              <Text style={styles.playerTarget}>
                {currentTargetLabel(match.config, player?.targetIndex ?? 0)}
              </Text>
              <Text style={styles.playerProgress}>
                {Math.min(player?.targetIndex ?? 0, sequenceLength)}/{sequenceLength}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.center}>
        <Text style={styles.prompt}>TARGET</Text>
        <Text style={styles.target}>{currentTargetLabel(match.config, targetIndex)}</Text>
        <Text style={styles.dartsLeft}>
          {'●'.repeat(3 - match.dartsThisTurn)}
          {'○'.repeat(match.dartsThisTurn)}
        </Text>
      </View>

      <View style={styles.buttons}>
        <View style={styles.hitRow}>
          <PressableScale onPress={() => throwAtTarget(1)} style={styles.hitButton}>
            <Text style={styles.hitLabel}>{isBullTarget ? '25' : 'HIT'}</Text>
          </PressableScale>
          <PressableScale onPress={() => throwAtTarget(2)} style={styles.hitButton}>
            <Text style={styles.hitLabel}>{isBullTarget ? 'BULL' : 'DOUBLE'}</Text>
          </PressableScale>
          {isBullTarget ? null : (
            <PressableScale onPress={() => throwAtTarget(3)} style={styles.hitButton}>
              <Text style={styles.hitLabel}>TREBLE</Text>
            </PressableScale>
          )}
        </View>
        <View style={styles.hitRow}>
          <PressableScale onPress={() => throwDart(missDart)} style={styles.missButton}>
            <Text style={styles.missLabel}>MISS</Text>
          </PressableScale>
          <PressableScale onPress={undo} style={styles.undoButton}>
            <Text style={styles.undoLabel}>UNDO</Text>
          </PressableScale>
        </View>
      </View>

      {match.phase === 'over' ? (
        <MatchOverlay
          title={winnerName === 'You' ? 'You win!' : `${winnerName} wins!`}
          subtitle={`${match.history.length} darts thrown`}
          primaryLabel="Rematch"
          onPrimary={() => startMatch(match.config)}
          secondaryLabel="Back to Menu"
          onSecondary={() => {
            endMatch();
            router.replace('/');
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  playersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  playerCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  playerCardActive: {
    borderColor: colors.brass,
  },
  playerName: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playerTarget: {
    ...typography.title,
    color: colors.textPrimary,
  },
  playerProgress: {
    ...typography.caption,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  prompt: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 2,
  },
  target: {
    ...typography.score,
    fontSize: 110,
    color: colors.textPrimary,
  },
  dartsLeft: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 4,
  },
  buttons: {
    gap: spacing.sm,
  },
  hitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hitButton: {
    flex: 1,
    backgroundColor: colors.feltDeep,
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  hitLabel: {
    ...typography.heading,
    color: colors.brassBright,
  },
  missButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  missLabel: {
    ...typography.heading,
    color: colors.textMuted,
  },
  undoButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.boardRed,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  undoLabel: {
    ...typography.heading,
    color: colors.boardRed,
  },
});
