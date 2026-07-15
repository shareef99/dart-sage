import type { AroundTheClockConfig, AroundTheClockState } from '@/types/around-the-clock';
import type { Dart, SegmentNumber } from '@/types/darts';

import {
  aroundTheClockReducer,
  createAroundTheClockState,
  currentTargetLabel,
  targetSequenceLength,
} from './around-the-clock';

function single(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 1 };
}

function treble(segment: SegmentNumber): Dart {
  return { kind: 'number', segment, multiplier: 3 };
}

const bull: Dart = { kind: 'bull', multiplier: 1 };
const miss: Dart = { kind: 'miss' };

function makeConfig(overrides: Partial<AroundTheClockConfig> = {}): AroundTheClockConfig {
  return { playerIds: ['p1', 'p2'], includeBull: false, skipOnMultiples: false, ...overrides };
}

function throwDarts(state: AroundTheClockState, darts: Dart[]): AroundTheClockState {
  return darts.reduce(
    (current, dart) => aroundTheClockReducer(current, { type: 'throw', dart }),
    state,
  );
}

describe('progression', () => {
  it('advances only on the current target', () => {
    const state = throwDarts(createAroundTheClockState(makeConfig()), [
      single(1),
      single(3),
      single(2),
    ]);
    expect(state.players['p1']?.targetIndex).toBe(2);
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('skips ahead on doubles and trebles when enabled', () => {
    const config = makeConfig({ skipOnMultiples: true });
    const state = throwDarts(createAroundTheClockState(config), [treble(1)]);
    expect(state.players['p1']?.targetIndex).toBe(3);
    expect(currentTargetLabel(config, 3)).toBe('4');
  });

  it('ignores multiplier without the skip variant', () => {
    const state = throwDarts(createAroundTheClockState(makeConfig()), [treble(1)]);
    expect(state.players['p1']?.targetIndex).toBe(1);
  });
});

describe('winning', () => {
  function runThrough(config: AroundTheClockConfig): AroundTheClockState {
    let state = createAroundTheClockState(config);
    const targets: Dart[] = [];
    for (let segment = 1; segment <= 20; segment += 1) {
      targets.push(single(segment as SegmentNumber));
    }
    if (config.includeBull) {
      targets.push(bull);
    }
    // p1 hits every target in order; p2 misses their whole visit.
    let thrown = 0;
    for (const dart of targets) {
      state = throwDarts(state, [dart]);
      thrown += 1;
      if (thrown % 3 === 0 && state.phase === 'playing') {
        state = throwDarts(state, [miss, miss, miss]);
      }
    }
    return state;
  }

  it('ends when the sequence is complete without bull', () => {
    const finished = runThrough(makeConfig());
    expect(finished.phase).toBe('over');
    expect(finished.winnerId).toBe('p1');
  });

  it('requires the bull when enabled', () => {
    const config = makeConfig({ includeBull: true });
    expect(targetSequenceLength(config)).toBe(21);
    const finished = runThrough(config);
    expect(finished.phase).toBe('over');
    expect(finished.winnerId).toBe('p1');
    expect(currentTargetLabel(config, 20)).toBe('BULL');
  });
});

describe('undo', () => {
  it('replays history without the last dart', () => {
    const state = throwDarts(createAroundTheClockState(makeConfig()), [single(1), single(2)]);
    const undone = aroundTheClockReducer(state, { type: 'undo' });
    expect(undone.players['p1']?.targetIndex).toBe(1);
    expect(undone.dartsThisTurn).toBe(1);
  });

  it('reopens a finished game', () => {
    const config = makeConfig({ skipOnMultiples: true });
    // Trebles jump three targets: 1→4→7→10→13→16→19→done.
    let state = createAroundTheClockState(config);
    state = throwDarts(state, [treble(1), treble(4), treble(7)]);
    state = throwDarts(state, [miss, miss, miss]);
    state = throwDarts(state, [treble(10), treble(13), treble(16)]);
    state = throwDarts(state, [miss, miss, miss]);
    state = throwDarts(state, [treble(19)]);
    expect(state.phase).toBe('over');
    expect(state.winnerId).toBe('p1');
    const undone = aroundTheClockReducer(state, { type: 'undo' });
    expect(undone.phase).toBe('playing');
    expect(undone.winnerId).toBeNull();
    expect(undone.players['p1']?.targetIndex).toBe(18);
  });
});
