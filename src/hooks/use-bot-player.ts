import { useEffect } from 'react';

import { chooseTarget, throwAtTarget } from '@/engine/bot';
import { useX01Store } from '@/stores/x01-store';

const BOT_THROW_DELAY_MS = 900;

export function useBotPlayer() {
  const match = useX01Store((state) => state.match);
  const roster = useX01Store((state) => state.roster);
  const throwDart = useX01Store((state) => state.throwDart);

  useEffect(() => {
    if (match === null || match.phase !== 'playing') {
      return;
    }
    const playerId = match.turnOrder[match.currentPlayerIndex];
    const player = playerId === undefined ? undefined : roster[playerId];
    if (player === undefined || !player.isBot || playerId === undefined) {
      return;
    }
    const remaining = match.players[playerId]?.remaining;
    if (remaining === undefined) {
      return;
    }

    const dartsLeft = (3 - match.currentTurn.darts.length) as 1 | 2 | 3;
    const target = chooseTarget(remaining, dartsLeft, match.config.doubleOut);
    const timer = setTimeout(() => {
      throwDart(throwAtTarget(target, player.botSkill ?? 3, Math.random));
    }, BOT_THROW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [match, roster, throwDart]);
}
