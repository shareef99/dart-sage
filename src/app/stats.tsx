import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StatTile } from '@/components/stat-tile';
import { db } from '@/db/client';
import { legs, matches, players } from '@/db/schema';
import { colors, spacing, typography } from '@/theme';

export default function StatsScreen() {
  const { data: matchRows } = useLiveQuery(
    db
      .select({
        id: matches.id,
        mode: matches.mode,
        finishedAt: matches.finishedAt,
        winnerName: players.name,
      })
      .from(matches)
      .leftJoin(players, eq(matches.winnerPlayerId, players.id))
      .orderBy(desc(matches.startedAt)),
  );

  const { data: legRows } = useLiveQuery(
    db
      .select({
        checkoutScore: legs.checkoutScore,
        dartsUsed: legs.dartsUsed,
        winnerName: players.name,
      })
      .from(legs)
      .leftJoin(players, eq(legs.winnerPlayerId, players.id)),
  );

  const allMatches = matchRows ?? [];
  const yourLegs = (legRows ?? []).filter((leg) => leg.winnerName === 'You');
  const wins = allMatches.filter((match) => match.winnerName === 'You').length;
  const highFinish = yourLegs.reduce(
    (best, leg) => Math.max(best, leg.checkoutScore ?? 0),
    0,
  );
  const bestLeg = yourLegs.reduce(
    (best: number | null, leg) =>
      leg.dartsUsed === null ? best : best === null ? leg.dartsUsed : Math.min(best, leg.dartsUsed),
    null,
  );

  return (
    <Screen>
      <Text style={styles.heading}>Your Game</Text>

      <View style={styles.tiles}>
        <StatTile label="Matches" value={String(allMatches.length)} />
        <StatTile label="Wins" value={String(wins)} />
      </View>
      <View style={styles.tiles}>
        <StatTile label="High Finish" value={highFinish > 0 ? String(highFinish) : '—'} />
        <StatTile label="Best Leg" value={bestLeg === null ? '—' : `${bestLeg} darts`} />
      </View>

      <Text style={styles.sectionLabel}>RECENT MATCHES</Text>
      <FlatList
        data={allMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No matches yet — go throw some darts.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.matchRow}>
            <Text style={styles.matchMode}>{item.mode.toUpperCase()}</Text>
            <Text style={styles.matchWinner}>
              {item.winnerName === 'You' ? 'You won' : `${item.winnerName ?? 'Unknown'} won`}
            </Text>
            <Text style={styles.matchDate}>
              {item.finishedAt === null ? '' : new Date(item.finishedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.brass,
    letterSpacing: 2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  matchMode: {
    ...typography.caption,
    color: colors.brass,
    fontWeight: '700',
    letterSpacing: 1,
  },
  matchWinner: {
    ...typography.body,
    color: colors.textPrimary,
  },
  matchDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
