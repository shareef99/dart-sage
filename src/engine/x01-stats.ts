import type { PlayerId } from '@/types/darts';
import type { X01PlayerStats } from '@/types/stats';
import type { X01State, X01Turn } from '@/types/x01';

import { hasCheckout } from './checkout';
import { dartScore } from './x01';

export function computePlayerStats(state: X01State, playerId: PlayerId): X01PlayerStats {
  const legs: X01Turn[][] = state.completedLegs.map((record) => record.turns);
  if (state.phase === 'playing' && state.turns.length > 0) {
    legs.push(state.turns);
  }

  let dartsThrown = 0;
  let pointsScored = 0;
  let firstNineDarts = 0;
  let firstNinePoints = 0;
  let checkoutOpportunities = 0;
  let count180s = 0;

  for (const legTurns of legs) {
    let playerTurnsInLeg = 0;
    for (const turn of legTurns) {
      if (turn.playerId !== playerId) {
        continue;
      }
      const scored = turn.end === 'busted' ? 0 : turnPoints(turn);
      dartsThrown += turn.darts.length;
      pointsScored += scored;
      if (playerTurnsInLeg < 3) {
        firstNineDarts += turn.darts.length;
        firstNinePoints += scored;
      }
      playerTurnsInLeg += 1;
      // A checkout opportunity is any visit starting on a finishable score.
      // Without per-dart aim data this is the honest denominator; real
      // "darts at double" tracking can refine it later.
      if (state.config.doubleOut && hasCheckout(turn.scoreBefore, 3)) {
        checkoutOpportunities += 1;
      }
      if (turn.end !== 'busted' && turnPoints(turn) === 180) {
        count180s += 1;
      }
    }
  }

  const wonLegs = state.completedLegs.filter((record) => record.winnerId === playerId);
  const checkoutsHit = wonLegs.length;
  const highestFinish =
    wonLegs.length === 0 ? null : Math.max(...wonLegs.map((record) => record.checkoutScore));
  const bestLegDarts =
    wonLegs.length === 0 ? null : Math.min(...wonLegs.map((record) => record.dartsUsed));

  return {
    dartsThrown,
    pointsScored,
    threeDartAverage: dartsThrown === 0 ? 0 : (pointsScored / dartsThrown) * 3,
    firstNineAverage: firstNineDarts === 0 ? 0 : (firstNinePoints / firstNineDarts) * 3,
    checkoutPercent:
      checkoutOpportunities === 0 ? 0 : (checkoutsHit / checkoutOpportunities) * 100,
    checkoutOpportunities,
    checkoutsHit,
    highestFinish,
    bestLegDarts,
    count180s,
  };
}

function turnPoints(turn: X01Turn): number {
  return turn.darts.reduce((sum, dart) => sum + dartScore(dart), 0);
}
