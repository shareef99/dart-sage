import type { Dart, SegmentNumber } from '@/types/darts';
import type { X01Config, X01State } from '@/types/x01';

import { createX01State, x01Reducer } from './x01';
import { computePlayerStats } from './x01-stats';

function single(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 1 };
}

function treble(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 3 };
}

const bullseye: Dart = { kind: 'bull', multiplier: 2 };
const miss: Dart = { kind: 'miss' };

const config: X01Config = {
  startingScore: 301,
  doubleOut: true,
  legsPerSet: 1,
  setsToWin: 1,
  playerIds: ['p1', 'p2'],
};

function throwDarts(state: X01State, darts: Dart[]): X01State {
  return darts.reduce((current, dart) => x01Reducer(current, { type: 'throw', dart }), state);
}

function playWonMatch(): X01State {
  const afterP1 = throwDarts(createX01State(config), [treble(20), treble(20), treble(20)]);
  const afterP2 = throwDarts(afterP1, [miss, miss, miss]);
  return throwDarts(afterP2, [treble(20), single(11), bullseye]);
}

describe('computePlayerStats', () => {
  it('computes averages, checkout rate, and finishes for the winner', () => {
    const stats = computePlayerStats(playWonMatch(), 'p1');
    expect(stats.dartsThrown).toBe(6);
    expect(stats.pointsScored).toBe(301);
    expect(stats.threeDartAverage).toBeCloseTo(150.5);
    expect(stats.firstNineAverage).toBeCloseTo(150.5);
    expect(stats.count180s).toBe(1);
    expect(stats.checkoutOpportunities).toBe(1);
    expect(stats.checkoutsHit).toBe(1);
    expect(stats.checkoutPercent).toBe(100);
    expect(stats.highestFinish).toBe(121);
    expect(stats.bestLegDarts).toBe(6);
  });

  it('gives the loser their darts with no finishes', () => {
    const stats = computePlayerStats(playWonMatch(), 'p2');
    expect(stats.dartsThrown).toBe(3);
    expect(stats.pointsScored).toBe(0);
    expect(stats.threeDartAverage).toBe(0);
    expect(stats.checkoutOpportunities).toBe(0);
    expect(stats.highestFinish).toBeNull();
    expect(stats.bestLegDarts).toBeNull();
  });

  it('counts busted visits as thrown darts with zero points', () => {
    const afterP1 = throwDarts(createX01State(config), [treble(20), treble(20), treble(20)]);
    const afterP2 = throwDarts(afterP1, [miss, miss, miss]);
    const busted = throwDarts(afterP2, [treble(20), treble(20)]);
    const stats = computePlayerStats(busted, 'p1');
    expect(stats.dartsThrown).toBe(5);
    expect(stats.pointsScored).toBe(180);
    expect(stats.threeDartAverage).toBeCloseTo(108);
  });

  it('returns zeroed stats before any dart is thrown', () => {
    const stats = computePlayerStats(createX01State(config), 'p1');
    expect(stats.dartsThrown).toBe(0);
    expect(stats.threeDartAverage).toBe(0);
    expect(stats.checkoutPercent).toBe(0);
  });
});
