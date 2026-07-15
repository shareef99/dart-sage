import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OptionChip } from '@/components/option-chip';
import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { BOT_SKILL_NAMES } from '@/engine/bot';
import { useAroundTheClockStore } from '@/stores/around-the-clock-store';
import { useCricketStore } from '@/stores/cricket-store';
import { useX01Store } from '@/stores/x01-store';
import { colors, spacing, typography } from '@/theme';
import type { BotSkill } from '@/types/bot';
import type { CricketVariant } from '@/types/cricket';
import type { Player } from '@/types/darts';
import type { X01StartingScore } from '@/types/x01';

type GameMode = 'x01' | 'cricket' | 'clock';

const STARTING_SCORES: X01StartingScore[] = [301, 501];
const LEG_OPTIONS = [1, 2, 3, 5];
const SKILLS: BotSkill[] = [1, 2, 3, 4, 5];

export default function NewMatchScreen() {
  const router = useRouter();
  const startX01 = useX01Store((state) => state.startMatch);
  const startCricket = useCricketStore((state) => state.startMatch);
  const startClock = useAroundTheClockStore((state) => state.startMatch);

  const [mode, setMode] = useState<GameMode>('x01');
  const [startingScore, setStartingScore] = useState<X01StartingScore>(501);
  const [legsToWin, setLegsToWin] = useState(3);
  const [vsBot, setVsBot] = useState(true);
  const [botSkill, setBotSkill] = useState<BotSkill>(3);
  const [cricketVariant, setCricketVariant] = useState<CricketVariant>('standard');
  const [includeBull, setIncludeBull] = useState(true);
  const [skipOnMultiples, setSkipOnMultiples] = useState(false);

  const begin = () => {
    if (mode === 'x01') {
      const you: Player = { id: 'p1', name: 'You', isBot: false };
      const opponent: Player = vsBot
        ? { id: 'p2', name: BOT_SKILL_NAMES[botSkill], isBot: true, botSkill }
        : { id: 'p2', name: 'Player 2', isBot: false };
      startX01(
        {
          startingScore,
          doubleOut: true,
          legsPerSet: legsToWin,
          setsToWin: 1,
          playerIds: [you.id, opponent.id],
        },
        { [you.id]: you, [opponent.id]: opponent },
      );
      router.replace('/x01');
      return;
    }
    if (mode === 'cricket') {
      startCricket({ variant: cricketVariant, playerIds: ['p1', 'p2'] });
      router.replace('/cricket');
      return;
    }
    startClock({ playerIds: ['p1', 'p2'], includeBull, skipOnMultiples });
    router.replace('/around-the-clock');
  };

  return (
    <Screen>
      <Text style={styles.heading}>New Match</Text>

      <Text style={styles.sectionLabel}>MODE</Text>
      <View style={styles.optionRow}>
        <OptionChip label="X01" active={mode === 'x01'} onPress={() => setMode('x01')} />
        <OptionChip
          label="Cricket"
          active={mode === 'cricket'}
          onPress={() => setMode('cricket')}
        />
        <OptionChip label="Clock" active={mode === 'clock'} onPress={() => setMode('clock')} />
      </View>

      {mode === 'x01' ? (
        <>
          <Text style={styles.sectionLabel}>GAME</Text>
          <View style={styles.optionRow}>
            {STARTING_SCORES.map((score) => (
              <OptionChip
                key={score}
                label={String(score)}
                active={startingScore === score}
                onPress={() => setStartingScore(score)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>FIRST TO</Text>
          <View style={styles.optionRow}>
            {LEG_OPTIONS.map((legs) => (
              <OptionChip
                key={legs}
                label={`${legs} ${legs === 1 ? 'leg' : 'legs'}`}
                active={legsToWin === legs}
                onPress={() => setLegsToWin(legs)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>OPPONENT</Text>
          <View style={styles.optionRow}>
            <OptionChip label="Bot" active={vsBot} onPress={() => setVsBot(true)} />
            <OptionChip label="Friend" active={!vsBot} onPress={() => setVsBot(false)} />
          </View>

          {vsBot ? (
            <>
              <Text style={styles.sectionLabel}>BOT LEVEL</Text>
              <View style={styles.optionRow}>
                {SKILLS.map((skill) => (
                  <OptionChip
                    key={skill}
                    label={String(skill)}
                    active={botSkill === skill}
                    onPress={() => setBotSkill(skill)}
                  />
                ))}
              </View>
              <Text style={styles.botName}>{BOT_SKILL_NAMES[botSkill]}</Text>
            </>
          ) : null}
        </>
      ) : null}

      {mode === 'cricket' ? (
        <>
          <Text style={styles.sectionLabel}>VARIANT</Text>
          <View style={styles.optionRow}>
            <OptionChip
              label="Standard"
              active={cricketVariant === 'standard'}
              onPress={() => setCricketVariant('standard')}
            />
            <OptionChip
              label="Cut-throat"
              active={cricketVariant === 'cut-throat'}
              onPress={() => setCricketVariant('cut-throat')}
            />
          </View>
          <Text style={styles.botName}>Two players at one board</Text>
        </>
      ) : null}

      {mode === 'clock' ? (
        <>
          <Text style={styles.sectionLabel}>FINISH</Text>
          <View style={styles.optionRow}>
            <OptionChip
              label="End on 20"
              active={!includeBull}
              onPress={() => setIncludeBull(false)}
            />
            <OptionChip
              label="End on Bull"
              active={includeBull}
              onPress={() => setIncludeBull(true)}
            />
          </View>
          <Text style={styles.sectionLabel}>DOUBLES & TREBLES</Text>
          <View style={styles.optionRow}>
            <OptionChip
              label="Count as one"
              active={!skipOnMultiples}
              onPress={() => setSkipOnMultiples(false)}
            />
            <OptionChip
              label="Skip ahead"
              active={skipOnMultiples}
              onPress={() => setSkipOnMultiples(true)}
            />
          </View>
        </>
      ) : null}

      <View style={styles.footer}>
        <PressableScale onPress={begin} style={styles.startButton}>
          <Text style={styles.startLabel}>Throw First Dart</Text>
        </PressableScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  botName: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
  },
  startButton: {
    backgroundColor: colors.felt,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 16,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
  },
  startLabel: {
    ...typography.heading,
    color: colors.brassBright,
  },
});
