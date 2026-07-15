import { db } from '@/db/client';
import { legs, matches, matchPlayers, players } from '@/db/schema';
import type { Player, PlayerId } from '@/types/darts';
import type { X01State } from '@/types/x01';
import { createId } from '@/utils/create-id';

// Session player ids ('p1'/'p2') are namespaced per match so the players
// table can hold every participant across matches without collisions.
function persistentPlayerId(matchId: string, sessionId: PlayerId): string {
  return `${matchId}-${sessionId}`;
}

export async function saveFinishedX01Match(
  state: X01State,
  roster: Record<PlayerId, Player>,
  finishedAt: Date,
): Promise<string> {
  const matchId = createId();

  for (const player of Object.values(roster)) {
    await db.insert(players).values({
      id: persistentPlayerId(matchId, player.id),
      name: player.name,
      isBot: player.isBot,
      botSkill: player.botSkill ?? null,
      createdAt: finishedAt,
    });
  }

  await db.insert(matches).values({
    id: matchId,
    mode: 'x01',
    configJson: JSON.stringify(state.config),
    winnerPlayerId: state.winnerId === null ? null : persistentPlayerId(matchId, state.winnerId),
    startedAt: finishedAt,
    finishedAt,
  });

  for (const [position, playerId] of state.turnOrder.entries()) {
    await db.insert(matchPlayers).values({
      matchId,
      playerId: persistentPlayerId(matchId, playerId),
      position,
    });
  }

  for (const [index, record] of state.completedLegs.entries()) {
    await db.insert(legs).values({
      id: createId(),
      matchId,
      legNumber: index + 1,
      winnerPlayerId: persistentPlayerId(matchId, record.winnerId),
      checkoutScore: record.checkoutScore,
      dartsUsed: record.dartsUsed,
      turnsJson: JSON.stringify(record.turns),
    });
  }

  return matchId;
}
