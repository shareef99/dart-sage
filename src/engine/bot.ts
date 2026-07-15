import type { AimDistribution, AimOutcome, BotSkill } from '@/types/bot';
import type { Dart, SegmentNumber } from '@/types/darts';

import { checkoutRoute } from './checkout';

export const BOT_SKILL_NAMES: Record<BotSkill, string> = {
  1: 'Pub Rookie',
  2: 'Casual Thrower',
  3: 'League Player',
  4: 'County Ace',
  5: 'Pro Sage',
};

// Clockwise segment order on a standard dartboard, starting at the top.
const BOARD_WHEEL: SegmentNumber[] = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

const TREBLE_AIM: Record<BotSkill, AimDistribution> = {
  1: { hit: 0.08, 'ring-slip': 0.52, neighbor: 0.1, 'neighbor-slip': 0.22, 'board-miss': 0.08 },
  2: { hit: 0.15, 'ring-slip': 0.55, neighbor: 0.08, 'neighbor-slip': 0.18, 'board-miss': 0.04 },
  3: { hit: 0.24, 'ring-slip': 0.55, neighbor: 0.06, 'neighbor-slip': 0.13, 'board-miss': 0.02 },
  4: { hit: 0.33, 'ring-slip': 0.52, neighbor: 0.05, 'neighbor-slip': 0.09, 'board-miss': 0.01 },
  5: { hit: 0.42, 'ring-slip': 0.47, neighbor: 0.04, 'neighbor-slip': 0.07, 'board-miss': 0 },
};

const SINGLE_AIM: Record<BotSkill, AimDistribution> = {
  1: { hit: 0.6, 'ring-slip': 0.14, neighbor: 0.16, 'neighbor-slip': 0.04, 'board-miss': 0.06 },
  2: { hit: 0.7, 'ring-slip': 0.12, neighbor: 0.12, 'neighbor-slip': 0.03, 'board-miss': 0.03 },
  3: { hit: 0.78, 'ring-slip': 0.1, neighbor: 0.08, 'neighbor-slip': 0.02, 'board-miss': 0.02 },
  4: { hit: 0.85, 'ring-slip': 0.08, neighbor: 0.05, 'neighbor-slip': 0.01, 'board-miss': 0.01 },
  5: { hit: 0.9, 'ring-slip': 0.06, neighbor: 0.03, 'neighbor-slip': 0.01, 'board-miss': 0 },
};

const DOUBLE_AIM: Record<BotSkill, AimDistribution> = {
  1: { hit: 0.06, 'ring-slip': 0.4, neighbor: 0.06, 'neighbor-slip': 0.12, 'board-miss': 0.36 },
  2: { hit: 0.12, 'ring-slip': 0.42, neighbor: 0.05, 'neighbor-slip': 0.11, 'board-miss': 0.3 },
  3: { hit: 0.2, 'ring-slip': 0.44, neighbor: 0.05, 'neighbor-slip': 0.09, 'board-miss': 0.22 },
  4: { hit: 0.3, 'ring-slip': 0.44, neighbor: 0.04, 'neighbor-slip': 0.07, 'board-miss': 0.15 },
  5: { hit: 0.4, 'ring-slip': 0.42, neighbor: 0.03, 'neighbor-slip': 0.05, 'board-miss': 0.1 },
};

// Bull aim reuses the outcome vocabulary: hit = bullseye, ring-slip = outer 25,
// neighbor = a stray single, board-miss = off the scoring area entirely.
const BULL_AIM: Record<BotSkill, AimDistribution> = {
  1: { hit: 0.04, 'ring-slip': 0.3, neighbor: 0.56, 'neighbor-slip': 0, 'board-miss': 0.1 },
  2: { hit: 0.08, 'ring-slip': 0.38, neighbor: 0.49, 'neighbor-slip': 0, 'board-miss': 0.05 },
  3: { hit: 0.14, 'ring-slip': 0.46, neighbor: 0.37, 'neighbor-slip': 0, 'board-miss': 0.03 },
  4: { hit: 0.22, 'ring-slip': 0.52, neighbor: 0.25, 'neighbor-slip': 0, 'board-miss': 0.01 },
  5: { hit: 0.32, 'ring-slip': 0.53, neighbor: 0.15, 'neighbor-slip': 0, 'board-miss': 0 },
};

export function chooseTarget(remaining: number, dartsLeft: 1 | 2 | 3, doubleOut: boolean): Dart {
  if (doubleOut) {
    const route = checkoutRoute(remaining, dartsLeft);
    const first = route?.[0];
    if (first !== undefined) {
      return first;
    }
    // No checkout available: play the position by aiming at the fat 20,
    // but never bust — leave at least 2 by switching to a small single.
    if (remaining <= 60) {
      return safePositionTarget(remaining);
    }
  }
  return { kind: 'number', segment: 20, multiplier: 3 };
}

function safePositionTarget(remaining: number): Dart {
  const leaveForty = remaining - 40;
  if (leaveForty >= 1 && leaveForty <= 20) {
    return { kind: 'number', segment: leaveForty as SegmentNumber, multiplier: 1 };
  }
  return { kind: 'number', segment: 1, multiplier: 1 };
}

export function throwAtTarget(target: Dart, skill: BotSkill, rng: () => number): Dart {
  if (target.kind === 'miss') {
    return target;
  }
  if (target.kind === 'bull') {
    return resolveBullAim(sample(BULL_AIM[skill], rng), rng);
  }
  const table =
    target.multiplier === 3 ? TREBLE_AIM : target.multiplier === 2 ? DOUBLE_AIM : SINGLE_AIM;
  return resolveNumberAim(target.segment, target.multiplier, sample(table[skill], rng), rng);
}

function sample(distribution: AimDistribution, rng: () => number): AimOutcome {
  const roll = rng();
  let cumulative = 0;
  const outcomes: AimOutcome[] = ['hit', 'ring-slip', 'neighbor', 'neighbor-slip', 'board-miss'];
  for (const outcome of outcomes) {
    cumulative += distribution[outcome];
    if (roll < cumulative) {
      return outcome;
    }
  }
  return 'board-miss';
}

function resolveNumberAim(
  segment: SegmentNumber,
  multiplier: 1 | 2 | 3,
  outcome: AimOutcome,
  rng: () => number,
): Dart {
  switch (outcome) {
    case 'hit':
      return { kind: 'number', segment, multiplier };
    case 'ring-slip':
      return { kind: 'number', segment, multiplier: 1 };
    case 'neighbor':
      return { kind: 'number', segment: neighborOf(segment, rng), multiplier };
    case 'neighbor-slip':
      return { kind: 'number', segment: neighborOf(segment, rng), multiplier: 1 };
    case 'board-miss':
      return { kind: 'miss' };
  }
}

function resolveBullAim(outcome: AimOutcome, rng: () => number): Dart {
  switch (outcome) {
    case 'hit':
      return { kind: 'bull', multiplier: 2 };
    case 'ring-slip':
      return { kind: 'bull', multiplier: 1 };
    case 'neighbor':
    case 'neighbor-slip': {
      const segment = BOARD_WHEEL[Math.floor(rng() * BOARD_WHEEL.length)] ?? 20;
      return { kind: 'number', segment, multiplier: 1 };
    }
    case 'board-miss':
      return { kind: 'miss' };
  }
}

function neighborOf(segment: SegmentNumber, rng: () => number): SegmentNumber {
  const index = BOARD_WHEEL.indexOf(segment);
  const step = rng() < 0.5 ? -1 : 1;
  const neighborIndex = (index + step + BOARD_WHEEL.length) % BOARD_WHEEL.length;
  return BOARD_WHEEL[neighborIndex] ?? segment;
}
