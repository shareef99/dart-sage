import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CheckoutHint } from '@/components/checkout-hint';
import { MatchOverlay } from '@/components/match-overlay';
import { PlayerPanel } from '@/components/player-panel';
import { Screen } from '@/components/screen';
import { ScoreKeypad } from '@/components/score-keypad';
import { computePlayerStats } from '@/engine/x01-stats';
import { useBotPlayer } from '@/hooks/use-bot-player';
import { useSaveMatch } from '@/hooks/use-save-match';
import { useX01Store } from '@/stores/x01-store';
import { colors, spacing, typography } from '@/theme';
import { dartLabel } from '@/utils/dart-label';

export default function X01Screen() {
  const router = useRouter();
  const match = useX01Store((state) => state.match);
  const roster = useX01Store((state) => state.roster);
  const throwDart = useX01Store((state) => state.throwDart);
  const undo = useX01Store((state) => state.undo);
  const nextLeg = useX01Store((state) => state.nextLeg);
  const startMatch = useX01Store((state) => state.startMatch);
  const endMatch = useX01Store((state) => state.endMatch);

  useBotPlayer();
  useSaveMatch();

  if (match === null) {
    return <Redirect href="/" />;
  }

  const currentPlayerId = match.turnOrder[match.currentPlayerIndex];
  const currentIsBot = currentPlayerId !== undefined && (roster[currentPlayerId]?.isBot ?? false);
  const dartsLeft = (3 - match.currentTurn.darts.length) as 1 | 2 | 3;
  const currentRemaining =
    currentPlayerId === undefined ? 0 : (match.players[currentPlayerId]?.remaining ?? 0);
  const lastLeg = match.completedLegs[match.completedLegs.length - 1];
  const legWinnerName =
    lastLeg === undefined ? '' : (roster[lastLeg.winnerId]?.name ?? 'Winner');
  const matchWinnerName =
    match.winnerId === null ? '' : (roster[match.winnerId]?.name ?? 'Winner');

  return (
    <Screen>
      <View style={styles.panels}>
        {match.turnOrder.map((playerId) => (
          <PlayerPanel
            key={playerId}
            name={roster[playerId]?.name ?? playerId}
            remaining={match.players[playerId]?.remaining ?? 0}
            legsWon={match.players[playerId]?.legsWon ?? 0}
            isActive={playerId === currentPlayerId && match.phase === 'playing'}
            average={computePlayerStats(match, playerId).threeDartAverage}
          />
        ))}
      </View>

      <View style={styles.turnRow}>
        {[0, 1, 2].map((slot) => {
          const dart = match.currentTurn.darts[slot];
          return (
            <View key={slot} style={[styles.dartSlot, dart !== undefined && styles.dartSlotFilled]}>
              <Text style={[styles.dartSlotLabel, dart !== undefined && styles.dartSlotLabelFilled]}>
                {dart === undefined ? '·' : dartLabel(dart)}
              </Text>
            </View>
          );
        })}
      </View>

      {match.config.doubleOut && match.phase === 'playing' ? (
        <CheckoutHint remaining={currentRemaining} dartsLeft={dartsLeft} />
      ) : null}

      <View style={styles.keypadWrap}>
        <ScoreKeypad
          onDart={throwDart}
          onUndo={undo}
          disabled={match.phase !== 'playing' || currentIsBot}
        />
      </View>

      {match.phase === 'leg-over' ? (
        <MatchOverlay
          title={
            legWinnerName === 'You' ? 'You take the leg!' : `${legWinnerName} takes the leg!`
          }
          subtitle={
            lastLeg === undefined
              ? ''
              : `${lastLeg.checkoutScore} checkout · ${lastLeg.dartsUsed} darts`
          }
          primaryLabel="Next Leg"
          onPrimary={nextLeg}
        />
      ) : null}

      {match.phase === 'match-over' ? (
        <MatchOverlay
          title={matchWinnerName === 'You' ? 'You win!' : `${matchWinnerName} wins!`}
          subtitle={
            lastLeg === undefined
              ? ''
              : `${lastLeg.checkoutScore} checkout · ${lastLeg.dartsUsed} darts`
          }
          primaryLabel="Rematch"
          onPrimary={() => startMatch(match.config, roster)}
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
  panels: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  turnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  dartSlot: {
    minWidth: 64,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  dartSlotFilled: {
    borderColor: colors.brass,
    backgroundColor: colors.feltDeep,
  },
  dartSlotLabel: {
    ...typography.heading,
    color: colors.textMuted,
  },
  dartSlotLabelFilled: {
    color: colors.brassBright,
  },
  keypadWrap: {
    marginTop: 'auto',
  },
});
