import type { Dart, SegmentNumber } from '@/types/darts';
import type { CricketConfig, CricketState } from '@/types/cricket';

import { createCricketState, cricketReducer, dartTarget, targetValue } from './cricket';

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

function makeConfig(overrides: Partial<CricketConfig> = {}): CricketConfig {
  return { variant: 'standard', playerIds: ['p1', 'p2'], ...overrides };
}

function throwDarts(state: CricketState, darts: Dart[]): CricketState {
  return darts.reduce((current, dart) => cricketReducer(current, { type: 'throw', dart }), state);
}

function closeAllTargetsFor(state: CricketState): CricketState {
  // p1 closes everything across turns while p2 only misses.
  const p1Turns: Dart[][] = [
    [treble(20), treble(19), treble(18)],
    [treble(17), treble(16), treble(15)],
    [bullseye, bull, miss],
  ];
  let current = state;
  for (const turn of p1Turns) {
    current = throwDarts(current, turn);
    if (current.phase === 'over') {
      return current;
    }
    current = throwDarts(current, [miss, miss, miss]);
  }
  return current;
}

describe('dartTarget and targetValue', () => {
  it('maps cricket segments and bull, ignores everything else', () => {
    expect(dartTarget(treble(20))).toBe('20');
    expect(dartTarget(single(15))).toBe('15');
    expect(dartTarget(bull)).toBe('bull');
    expect(dartTarget(single(14))).toBeNull();
    expect(dartTarget(miss)).toBeNull();
  });

  it('values bull at 25 and numbers at face value', () => {
    expect(targetValue('bull')).toBe(25);
    expect(targetValue('20')).toBe(20);
  });
});

describe('marks and closing', () => {
  it('accumulates marks by multiplier', () => {
    const state = throwDarts(createCricketState(makeConfig()), [single(20), double(20)]);
    expect(state.players['p1']?.marks['20']).toBe(3);
  });

  it('does not score overflow while the target is not closed', () => {
    const state = throwDarts(createCricketState(makeConfig()), [single(20), single(20)]);
    expect(state.players['p1']?.points).toBe(0);
  });

  it('scores overflow marks against an open opponent (standard)', () => {
    const state = throwDarts(createCricketState(makeConfig()), [treble(20), treble(20)]);
    expect(state.players['p1']?.marks['20']).toBe(6);
    expect(state.players['p1']?.points).toBe(60);
  });

  it('splits a dart between closing and scoring', () => {
    const state = throwDarts(createCricketState(makeConfig()), [single(20), single(20), treble(20)]);
    expect(state.players['p1']?.points).toBe(40);
  });

  it('scores nothing once every opponent has closed the target', () => {
    const start = createCricketState(makeConfig());
    const p1Closes = throwDarts(start, [treble(20), miss, miss]);
    const p2Closes = throwDarts(p1Closes, [treble(20), miss, miss]);
    const p1ThrowsMore = throwDarts(p2Closes, [treble(20)]);
    expect(p1ThrowsMore.players['p1']?.points).toBe(0);
  });

  it('counts the bullseye as two marks', () => {
    const state = throwDarts(createCricketState(makeConfig()), [bullseye, bull]);
    expect(state.players['p1']?.marks.bull).toBe(3);
  });
});

describe('cut-throat scoring', () => {
  it('gives overflow points to open opponents instead of the thrower', () => {
    const config = makeConfig({ variant: 'cut-throat', playerIds: ['p1', 'p2', 'p3'] });
    const state = throwDarts(createCricketState(config), [treble(20), treble(20)]);
    expect(state.players['p1']?.points).toBe(0);
    expect(state.players['p2']?.points).toBe(60);
    expect(state.players['p3']?.points).toBe(60);
  });

  it('skips opponents who already closed the target', () => {
    const config = makeConfig({ variant: 'cut-throat', playerIds: ['p1', 'p2', 'p3'] });
    const start = createCricketState(config);
    const p1Turn = throwDarts(start, [treble(19), miss, miss]);
    const p2Turn = throwDarts(p1Turn, [treble(19), miss, miss]);
    const p3Turn = throwDarts(p2Turn, [miss, miss, miss]);
    const p1Scores = throwDarts(p3Turn, [treble(19)]);
    expect(p1Scores.players['p2']?.points).toBe(0);
    expect(p1Scores.players['p3']?.points).toBe(57);
  });
});

describe('turn rotation', () => {
  it('rotates after three darts', () => {
    const state = throwDarts(createCricketState(makeConfig()), [miss, miss, miss]);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.dartsThisTurn).toBe(0);
  });
});

describe('winning', () => {
  it('standard: first player to close all targets with equal-or-higher points wins', () => {
    const finished = closeAllTargetsFor(createCricketState(makeConfig()));
    expect(finished.phase).toBe('over');
    expect(finished.winnerId).toBe('p1');
  });

  it('standard: closing all targets while behind on points does not win', () => {
    const start = createCricketState(makeConfig());
    // p1 closes 20 then racks up points; p2 closes everything but stays behind.
    const p1Racks = throwDarts(start, [treble(20), treble(20), treble(20)]);
    const p2Round1 = throwDarts(p1Racks, [treble(20), treble(19), treble(18)]);
    const p1Idles = throwDarts(p2Round1, [miss, miss, miss]);
    const p2Round2 = throwDarts(p1Idles, [treble(17), treble(16), treble(15)]);
    const p1IdlesAgain = throwDarts(p2Round2, [miss, miss, miss]);
    const p2ClosesBull = throwDarts(p1IdlesAgain, [bullseye, bull]);
    expect(p2ClosesBull.players['p2']?.marks.bull).toBe(3);
    expect(p2ClosesBull.phase).toBe('playing');
    expect(p2ClosesBull.players['p1']?.points).toBe(120);
    expect(p2ClosesBull.players['p2']?.points).toBe(0);
  });

  it('cut-throat: lowest score wins when closing out', () => {
    const config = makeConfig({ variant: 'cut-throat' });
    const finished = closeAllTargetsFor(createCricketState(config));
    expect(finished.phase).toBe('over');
    expect(finished.winnerId).toBe('p1');
  });
});

describe('undo', () => {
  it('replays history without the last dart', () => {
    const start = createCricketState(makeConfig());
    const after = throwDarts(start, [treble(20), treble(20)]);
    const undone = cricketReducer(after, { type: 'undo' });
    expect(undone.players['p1']?.marks['20']).toBe(3);
    expect(undone.players['p1']?.points).toBe(0);
    expect(undone.dartsThisTurn).toBe(1);
  });

  it('reopens a finished game', () => {
    const finished = closeAllTargetsFor(createCricketState(makeConfig()));
    expect(finished.phase).toBe('over');
    const undone = cricketReducer(finished, { type: 'undo' });
    expect(undone.phase).toBe('playing');
    expect(undone.winnerId).toBeNull();
  });
});
