import type { Dart, SegmentNumber } from '@/types/darts';

import { dartScore } from './x01';

const SEGMENTS: SegmentNumber[] = [
  20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
];

// Order reflects standard checkout-chart conventions: prefer leaving the
// classic doubles (D20/D16/D18...), and treat the bullseye as a last-resort
// finish — required for e.g. 110 (T20, Bull) but never preferred over D19.
const FINISH_PRIORITY: Dart[] = [
  { kind: 'number', segment: 20, multiplier: 2 },
  { kind: 'number', segment: 16, multiplier: 2 },
  { kind: 'number', segment: 18, multiplier: 2 },
  { kind: 'number', segment: 12, multiplier: 2 },
  { kind: 'number', segment: 10, multiplier: 2 },
  { kind: 'number', segment: 8, multiplier: 2 },
  { kind: 'number', segment: 14, multiplier: 2 },
  { kind: 'number', segment: 6, multiplier: 2 },
  { kind: 'number', segment: 4, multiplier: 2 },
  { kind: 'number', segment: 2, multiplier: 2 },
  { kind: 'number', segment: 1, multiplier: 2 },
  { kind: 'number', segment: 19, multiplier: 2 },
  { kind: 'number', segment: 17, multiplier: 2 },
  { kind: 'number', segment: 15, multiplier: 2 },
  { kind: 'number', segment: 13, multiplier: 2 },
  { kind: 'number', segment: 11, multiplier: 2 },
  { kind: 'number', segment: 9, multiplier: 2 },
  { kind: 'number', segment: 7, multiplier: 2 },
  { kind: 'number', segment: 5, multiplier: 2 },
  { kind: 'number', segment: 3, multiplier: 2 },
  { kind: 'bull', multiplier: 2 },
];

// Setup darts follow throwing convention: big trebles first, then singles,
// bulls, small trebles. Doubles as setup darts are a separate last resort —
// without that split, 62 would resolve to D11+D20 instead of the standard T10+D16.
const SETUP_PRIORITY: Dart[] = [
  ...SEGMENTS.slice(0, 6).map((segment): Dart => ({ kind: 'number', segment, multiplier: 3 })),
  ...SEGMENTS.map((segment): Dart => ({ kind: 'number', segment, multiplier: 1 })),
  { kind: 'bull', multiplier: 2 },
  { kind: 'bull', multiplier: 1 },
  ...SEGMENTS.slice(6).map((segment): Dart => ({ kind: 'number', segment, multiplier: 3 })),
];

const SETUP_DOUBLES: Dart[] = SEGMENTS.map(
  (segment): Dart => ({ kind: 'number', segment, multiplier: 2 }),
);

export function isFinishingDouble(dart: Dart, remaining: number): boolean {
  return (
    (dart.kind === 'number' || dart.kind === 'bull') &&
    dart.multiplier === 2 &&
    dartScore(dart) === remaining
  );
}

export function checkoutRoute(remaining: number, dartsLeft: 1 | 2 | 3): Dart[] | null {
  if (remaining < 2 || remaining > 170) {
    return null;
  }

  const oneDart = FINISH_PRIORITY.find((dart) => dartScore(dart) === remaining);
  if (oneDart !== undefined) {
    return [oneDart];
  }
  if (dartsLeft === 1) {
    return null;
  }

  const twoDart = findTwoDartRoute(remaining);
  if (twoDart !== null) {
    return twoDart;
  }
  if (dartsLeft === 2) {
    return null;
  }

  for (const first of SETUP_PRIORITY) {
    const rest = remaining - dartScore(first);
    if (rest >= 2) {
      const tail = findTwoDartRoute(rest);
      if (tail !== null) {
        return [first, ...tail];
      }
    }
  }
  return null;
}

function findTwoDartRoute(remaining: number): Dart[] | null {
  for (const setupPool of [SETUP_PRIORITY, SETUP_DOUBLES]) {
    for (const finish of FINISH_PRIORITY) {
      const setupNeeded = remaining - dartScore(finish);
      const setup = setupPool.find((dart) => dartScore(dart) === setupNeeded);
      if (setup !== undefined) {
        return [setup, finish];
      }
    }
  }
  return null;
}

export function hasCheckout(remaining: number, dartsLeft: 1 | 2 | 3): boolean {
  return checkoutRoute(remaining, dartsLeft) !== null;
}

export function isViableFirstDart(remaining: number, dartsLeft: 1 | 2 | 3, dart: Dart): boolean {
  if (remaining < 2 || remaining > 170) {
    return false;
  }
  const rest = remaining - dartScore(dart);
  if (rest === 0) {
    return isFinishingDouble(dart, remaining);
  }
  if (dartsLeft === 1) {
    return false;
  }
  const restDarts = (dartsLeft - 1) as 1 | 2;
  return rest >= 2 && hasCheckout(rest, restDarts);
}
