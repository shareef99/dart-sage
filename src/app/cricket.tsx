import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CricketBoard } from '@/components/cricket-board';
import { CricketPlayerScore } from '@/components/cricket-player-score';
import { MatchOverlay } from '@/components/match-overlay';
import { Screen } from '@/components/screen';
import { ScoreKeypad } from '@/components/score-keypad';
import { maybeShowInterstitialAfterMatch } from '@/services/ads';
import { useCricketStore } from '@/stores/cricket-store';
import { colors, spacing, typography } from '@/theme';

const PLAYER_NAMES: Record<string, string> = { p1: 'You', p2: 'Player 2' };

export default function CricketScreen() {
  const router = useRouter();
  const match = useCricketStore((state) => state.match);
  const throwDart = useCricketStore((state) => state.throwDart);
  const undo = useCricketStore((state) => state.undo);
  const startMatch = useCricketStore((state) => state.startMatch);
  const endMatch = useCricketStore((state) => state.endMatch);

  if (match === null) {
    return <Redirect href="/" />;
  }

  const [leftId, rightId] = match.config.playerIds;
  if (leftId === undefined || rightId === undefined) {
    return <Redirect href="/" />;
  }
  const currentId = match.config.playerIds[match.currentPlayerIndex];
  const left = match.players[leftId];
  const right = match.players[rightId];
  const winnerName =
    match.winnerId === null ? '' : (PLAYER_NAMES[match.winnerId] ?? match.winnerId);

  return (
    <Screen>
      <View style={styles.header}>
        <CricketPlayerScore
          name={PLAYER_NAMES[leftId] ?? leftId}
          points={left?.points ?? 0}
          isActive={currentId === leftId && match.phase === 'playing'}
        />
        <Text style={styles.variant}>
          {match.config.variant === 'standard' ? 'CRICKET' : 'CUT-THROAT'}
        </Text>
        <CricketPlayerScore
          name={PLAYER_NAMES[rightId] ?? rightId}
          points={right?.points ?? 0}
          isActive={currentId === rightId && match.phase === 'playing'}
        />
      </View>

      <View style={styles.boardWrap}>
        <CricketBoard
          leftMarks={left?.marks ?? emptyMarks()}
          rightMarks={right?.marks ?? emptyMarks()}
        />
        <Text style={styles.dartsLeft}>
          {'●'.repeat(3 - match.dartsThisTurn)}
          {'○'.repeat(match.dartsThisTurn)}
        </Text>
      </View>

      <ScoreKeypad onDart={throwDart} onUndo={undo} disabled={match.phase !== 'playing'} />

      {match.phase === 'over' ? (
        <MatchOverlay
          title={winnerName === 'You' ? 'You win!' : `${winnerName} wins!`}
          subtitle={
            match.config.variant === 'standard'
              ? `${left?.points ?? 0} — ${right?.points ?? 0}`
              : `${left?.points ?? 0} — ${right?.points ?? 0} (low wins)`
          }
          primaryLabel="Rematch"
          onPrimary={() => {
            maybeShowInterstitialAfterMatch();
            startMatch(match.config);
          }}
          secondaryLabel="Back to Menu"
          onSecondary={() => {
            maybeShowInterstitialAfterMatch();
            endMatch();
            router.replace('/');
          }}
        />
      ) : null}
    </Screen>
  );
}

function emptyMarks() {
  return { '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, bull: 0 } as const;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  variant: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 2,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dartsLeft: {
    ...typography.caption,
    color: colors.brass,
    textAlign: 'center',
    letterSpacing: 4,
  },
});
