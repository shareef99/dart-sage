import type { Dart, SegmentNumber } from '@/types/darts';
import type { X01Config, X01State } from '@/types/x01';

import { createX01State, dartScore, x01Reducer } from './x01';

function single(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 1 };
}

function double(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 2 };
}

function treble(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 3 };
}

const bull: Dart = { kind: 'bull', multiplier: 1 };
const bullseye: Dart = { kind: 'bull', multiplier: 2 };
const miss: Dart = { kind: 'miss' };

function makeConfig(overrides: Partial<X01Config> = {}): X01Config {
  return {
    startingScore: 501,
    doubleOut: true,
    legsPerSet: 1,
    setsToWin: 1,
    playerIds: ['p1', 'p2'],
    ...overrides,
  };
}

function throwDarts(state: X01State, darts: Dart[]): X01State {
  return darts.reduce((current, dart) => x01Reducer(current, { type: 'throw', dart }), state);
}

function undo(state: X01State): X01State {
  return x01Reducer(state, { type: 'undo' });
}

function nextLeg(state: X01State): X01State {
  return x01Reducer(state, { type: 'next-leg' });
}

const oneEighty: Dart[] = [treble(20), treble(20), treble(20)];
const noScore: Dart[] = [miss, miss, miss];
const oneTwentyOneOut: Dart[] = [treble(20), single(11), bullseye];

function winLegFrom301(state: X01State): X01State {
  const afterScoring = throwDarts(state, oneEighty);
  const afterOpponent = throwDarts(afterScoring, noScore);
  return throwDarts(afterOpponent, oneTwentyOneOut);
}

describe('dartScore', () => {
  it('scores number segments with multipliers', () => {
    expect(dartScore(single(20))).toBe(20);
    expect(dartScore(double(16))).toBe(32);
    expect(dartScore(treble(20))).toBe(60);
  });

  it('scores bull as 25 and bullseye as 50', () => {
    expect(dartScore(bull)).toBe(25);
    expect(dartScore(bullseye)).toBe(50);
  });

  it('scores a miss as zero', () => {
    expect(dartScore(miss)).toBe(0);
  });
});

describe('scoring turns', () => {
  it('reduces the current player remaining per dart', () => {
    const state = throwDarts(createX01State(makeConfig()), [treble(20), single(5)]);
    expect(state.players['p1']?.remaining).toBe(501 - 60 - 5);
    expect(state.currentTurn.darts).toHaveLength(2);
  });

  it('ends the turn after three darts and rotates to the next player', () => {
    const state = throwDarts(createX01State(makeConfig()), oneEighty);
    expect(state.players['p1']?.remaining).toBe(321);
    expect(state.currentTurn.playerId).toBe('p2');
    expect(state.currentTurn.scoreBefore).toBe(501);
    expect(state.turns).toHaveLength(1);
    expect(state.turns[0]?.end).toBe('completed');
  });
});

describe('bust rules with double-out', () => {
  function stateWithP1At(remaining: 40 | 50): X01State {
    const start = createX01State(makeConfig({ startingScore: 301 }));
    const afterP1 = throwDarts(start, oneEighty);
    const afterP2 = throwDarts(afterP1, noScore);
    const setup: Dart[] =
      remaining === 40 ? [treble(20), single(20), single(1)] : [treble(17), single(20), miss];
    const afterSetup = throwDarts(afterP2, setup);
    return throwDarts(afterSetup, noScore);
  }

  it('busts when going below zero and restores the turn-start score', () => {
    const before = stateWithP1At(40);
    const after = throwDarts(before, [treble(20)]);
    expect(after.players['p1']?.remaining).toBe(40);
    expect(after.turns[after.turns.length - 1]?.end).toBe('busted');
    expect(after.currentTurn.playerId).toBe('p2');
  });

  it('busts when leaving exactly 1', () => {
    const before = stateWithP1At(40);
    const after = throwDarts(before, [single(19), single(20)]);
    expect(after.players['p1']?.remaining).toBe(40);
    expect(after.turns[after.turns.length - 1]?.end).toBe('busted');
  });

  it('busts when reaching zero without a double', () => {
    const before = stateWithP1At(40);
    const after = throwDarts(before, [single(20), single(20)]);
    expect(after.players['p1']?.remaining).toBe(40);
    expect(after.turns[after.turns.length - 1]?.end).toBe('busted');
  });

  it('accepts a double for the checkout', () => {
    const before = stateWithP1At(40);
    const after = throwDarts(before, [double(20)]);
    expect(after.phase).toBe('match-over');
    expect(after.winnerId).toBe('p1');
  });

  it('accepts the bullseye as a checkout double from 50', () => {
    const before = stateWithP1At(50);
    const after = throwDarts(before, [bullseye]);
    expect(after.phase).toBe('match-over');
    expect(after.winnerId).toBe('p1');
  });
});

describe('straight-out (doubleOut disabled)', () => {
  it('accepts any dart that reaches exactly zero', () => {
    const config = makeConfig({ startingScore: 301, doubleOut: false });
    const afterP1 = throwDarts(createX01State(config), oneEighty);
    const afterP2 = throwDarts(afterP1, noScore);
    const finished = throwDarts(afterP2, [treble(20), treble(20), single(1)]);
    expect(finished.phase).toBe('match-over');
    expect(finished.winnerId).toBe('p1');
  });
});

describe('undo', () => {
  it('removes the last dart of the current turn', () => {
    const state = throwDarts(createX01State(makeConfig()), [treble(20), single(5)]);
    const after = undo(state);
    expect(after.players['p1']?.remaining).toBe(441);
    expect(after.currentTurn.darts).toHaveLength(1);
  });

  it('steps back across a turn boundary into the previous player turn', () => {
    const state = throwDarts(createX01State(makeConfig()), oneEighty);
    expect(state.currentTurn.playerId).toBe('p2');
    const after = undo(state);
    expect(after.currentTurn.playerId).toBe('p1');
    expect(after.currentTurn.darts).toHaveLength(2);
    expect(after.players['p1']?.remaining).toBe(381);
    expect(after.turns).toHaveLength(0);
  });

  it('reverts a bust, restoring pre-bust progress minus the offending dart', () => {
    const config = makeConfig({ startingScore: 301 });
    const afterP1 = throwDarts(createX01State(config), oneEighty);
    const afterP2 = throwDarts(afterP1, noScore);
    const busted = throwDarts(afterP2, [treble(20), treble(20)]);
    expect(busted.players['p1']?.remaining).toBe(121);
    expect(busted.turns[busted.turns.length - 1]?.end).toBe('busted');
    expect(busted.currentTurn.playerId).toBe('p2');
    const after = undo(busted);
    expect(after.currentTurn.playerId).toBe('p1');
    expect(after.currentTurn.darts).toHaveLength(1);
    expect(after.players['p1']?.remaining).toBe(61);
  });

  it('reverts a checkout, restoring the leg and player tallies', () => {
    const config = makeConfig({ startingScore: 301 });
    const won = winLegFrom301(createX01State(config));
    expect(won.phase).toBe('match-over');
    const after = undo(won);
    expect(after.phase).toBe('playing');
    expect(after.winnerId).toBeNull();
    expect(after.players['p1']?.remaining).toBe(50);
    expect(after.players['p1']?.legsWon).toBe(0);
    expect(after.players['p1']?.setsWon).toBe(0);
    expect(after.completedLegs).toHaveLength(0);
  });
});

describe('legs and sets', () => {
  it('moves to leg-over and requires next-leg to continue', () => {
    const config = makeConfig({ startingScore: 301, legsPerSet: 2, setsToWin: 1 });
    const won = winLegFrom301(createX01State(config));
    expect(won.phase).toBe('leg-over');
    expect(won.players['p1']?.legsWon).toBe(1);
    expect(won.completedLegs).toHaveLength(1);
    expect(won.completedLegs[0]?.checkoutScore).toBe(121);
    expect(won.completedLegs[0]?.dartsUsed).toBe(6);
  });

  it('rotates the leg starter on next-leg', () => {
    const config = makeConfig({ startingScore: 301, legsPerSet: 2, setsToWin: 1 });
    const won = winLegFrom301(createX01State(config));
    const secondLeg = nextLeg(won);
    expect(secondLeg.phase).toBe('playing');
    expect(secondLeg.currentTurn.playerId).toBe('p2');
    expect(secondLeg.players['p1']?.remaining).toBe(301);
    expect(secondLeg.players['p2']?.remaining).toBe(301);
  });

  it('completes a set, resets leg tallies, and ends the match at setsToWin', () => {
    const config = makeConfig({ startingScore: 301, legsPerSet: 2, setsToWin: 1 });
    const afterLegOne = winLegFrom301(createX01State(config));
    const secondLeg = nextLeg(afterLegOne);
    const afterP2Opens = throwDarts(secondLeg, noScore);
    const finished = winLegFrom301FromP1Turn(afterP2Opens);
    expect(finished.phase).toBe('match-over');
    expect(finished.winnerId).toBe('p1');
    expect(finished.players['p1']?.setsWon).toBe(1);
    expect(finished.players['p1']?.legsWon).toBe(0);
  });

  function winLegFrom301FromP1Turn(state: X01State): X01State {
    const afterScoring = throwDarts(state, oneEighty);
    const afterOpponent = throwDarts(afterScoring, noScore);
    return throwDarts(afterOpponent, oneTwentyOneOut);
  }
});
