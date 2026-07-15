import type { BotSkill } from '@/types/bot';
import type { Dart } from '@/types/darts';

import { BOT_SKILL_NAMES, chooseTarget, throwAtTarget } from './bot';

const SKILLS: BotSkill[] = [1, 2, 3, 4, 5];

function rngQueue(values: number[]): () => number {
  const queue = [...values];
  return () => queue.shift() ?? 0;
}

describe('chooseTarget', () => {
  it('follows the checkout route when one exists', () => {
    expect(chooseTarget(170, 3, true)).toEqual({ kind: 'number', segment: 20, multiplier: 3 });
    expect(chooseTarget(40, 3, true)).toEqual({ kind: 'number', segment: 20, multiplier: 2 });
    expect(chooseTarget(32, 1, true)).toEqual({ kind: 'number', segment: 16, multiplier: 2 });
    expect(chooseTarget(45, 2, true)).toEqual({ kind: 'number', segment: 5, multiplier: 1 });
    expect(chooseTarget(50, 1, true)).toEqual({ kind: 'bull', multiplier: 2 });
  });

  it('aims treble 20 when no checkout is reachable', () => {
    expect(chooseTarget(501, 3, true)).toEqual({ kind: 'number', segment: 20, multiplier: 3 });
    expect(chooseTarget(159, 3, true)).toEqual({ kind: 'number', segment: 20, multiplier: 3 });
  });

  it('plays position instead of busting with one dart and no double', () => {
    const target = chooseTarget(39, 1, true);
    expect(target).toEqual({ kind: 'number', segment: 1, multiplier: 1 });
    const leaveTarget = chooseTarget(52, 1, true);
    expect(leaveTarget).toEqual({ kind: 'number', segment: 12, multiplier: 1 });
  });

  it('always aims treble 20 in straight-out games until the finish', () => {
    expect(chooseTarget(501, 3, false)).toEqual({ kind: 'number', segment: 20, multiplier: 3 });
  });
});

describe('throwAtTarget', () => {
  const t20: Dart = { kind: 'number', segment: 20, multiplier: 3 };
  const d16: Dart = { kind: 'number', segment: 16, multiplier: 2 };
  const bull: Dart = { kind: 'bull', multiplier: 2 };

  it('hits the target when the roll lands in the hit band', () => {
    expect(throwAtTarget(t20, 5, rngQueue([0]))).toEqual(t20);
    expect(throwAtTarget(d16, 5, rngQueue([0]))).toEqual(d16);
    expect(throwAtTarget(bull, 5, rngQueue([0]))).toEqual(bull);
  });

  it('slips into the single ring on a ring-slip roll', () => {
    expect(throwAtTarget(t20, 5, rngQueue([0.5]))).toEqual({
      kind: 'number',
      segment: 20,
      multiplier: 1,
    });
  });

  it('lands in a wheel neighbor on a neighbor roll', () => {
    const result = throwAtTarget(t20, 5, rngQueue([0.91, 0.1]));
    expect(result).toEqual({ kind: 'number', segment: 5, multiplier: 3 });
    const other = throwAtTarget(t20, 5, rngQueue([0.91, 0.9]));
    expect(other).toEqual({ kind: 'number', segment: 1, multiplier: 3 });
  });

  it('misses the board entirely on a board-miss roll', () => {
    expect(throwAtTarget(t20, 1, rngQueue([0.999]))).toEqual({ kind: 'miss' });
  });

  it('drops into the outer bull on a bull ring-slip', () => {
    expect(throwAtTarget(bull, 5, rngQueue([0.5]))).toEqual({ kind: 'bull', multiplier: 1 });
  });

  it('passes a miss target through untouched', () => {
    expect(throwAtTarget({ kind: 'miss' }, 3, rngQueue([0]))).toEqual({ kind: 'miss' });
  });
});

describe('skill model integrity', () => {
  it('names every skill tier', () => {
    for (const skill of SKILLS) {
      expect(BOT_SKILL_NAMES[skill].length).toBeGreaterThan(0);
    }
  });

  it('higher skill hits the treble strictly more often across a uniform roll sweep', () => {
    const counts = SKILLS.map((skill) => trebleHitsAcrossRollSweep(skill));
    for (let i = 1; i < counts.length; i += 1) {
      const current = counts[i];
      const previous = counts[i - 1];
      expect(current).toBeDefined();
      expect(previous).toBeDefined();
      if (current !== undefined && previous !== undefined) {
        expect(current).toBeGreaterThan(previous);
      }
    }
  });

  it('matches the configured hit probability for the top tier', () => {
    expect(trebleHitsAcrossRollSweep(5)).toBeGreaterThanOrEqual(415);
    expect(trebleHitsAcrossRollSweep(5)).toBeLessThanOrEqual(425);
  });
});

function trebleHitsAcrossRollSweep(skill: BotSkill): number {
  let hits = 0;
  for (let i = 0; i < 1000; i += 1) {
    const roll = i / 1000;
    const dart = throwAtTarget({ kind: 'number', segment: 20, multiplier: 3 }, skill, () => roll);
    if (dart.kind === 'number' && dart.segment === 20 && dart.multiplier === 3) {
      hits += 1;
    }
  }
  return hits;
}
