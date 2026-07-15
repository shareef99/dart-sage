import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OptionChip } from '@/components/option-chip';
import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { BOT_SKILL_NAMES } from '@/engine/bot';
import { useX01Store } from '@/stores/x01-store';
import { colors, spacing, typography } from '@/theme';
import type { BotSkill } from '@/types/bot';
import type { Player } from '@/types/darts';
import type { X01StartingScore } from '@/types/x01';

const STARTING_SCORES: X01StartingScore[] = [301, 501];
const LEG_OPTIONS = [1, 2, 3, 5];
const SKILLS: BotSkill[] = [1, 2, 3, 4, 5];

export default function NewMatchScreen() {
  const router = useRouter();
  const startMatch = useX01Store((state) => state.startMatch);

  const [startingScore, setStartingScore] = useState<X01StartingScore>(501);
  const [legsToWin, setLegsToWin] = useState(3);
  const [vsBot, setVsBot] = useState(true);
  const [botSkill, setBotSkill] = useState<BotSkill>(3);

  const begin = () => {
    const you: Player = { id: 'p1', name: 'You', isBot: false };
    const opponent: Player = vsBot
      ? { id: 'p2', name: BOT_SKILL_NAMES[botSkill], isBot: true, botSkill }
      : { id: 'p2', name: 'Player 2', isBot: false };

    startMatch(
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
  };

  return (
    <Screen>
      <Text style={styles.heading}>New Match</Text>

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
    marginBottom: spacing.lg,
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
