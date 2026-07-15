import type { Dart } from '@/types/darts';

import { checkoutRoute, hasCheckout, isFinishingDouble, isViableFirstDart } from './checkout';
import { dartScore, isDouble } from './x01';

const BOGEY_NUMBERS = [169, 168, 166, 165, 163, 162, 159];

function label(dart: Dart): string {
  if (dart.kind === 'miss') {
    return 'miss';
  }
  if (dart.kind === 'bull') {
    return dart.multiplier === 2 ? 'Bull' : '25';
  }
  const prefix = dart.multiplier === 3 ? 'T' : dart.multiplier === 2 ? 'D' : 'S';
  return `${prefix}${dart.segment}`;
}

function routeLabel(remaining: number, dartsLeft: 1 | 2 | 3 = 3): string | null {
  const route = checkoutRoute(remaining, dartsLeft);
  return route === null ? null : route.map(label).join(' ');
}

describe('checkoutRoute — canonical finishes', () => {
  it.each([
    [170, 'T20 T20 Bull'],
    [167, 'T20 T19 Bull'],
    [164, 'T20 T18 Bull'],
    [161, 'T20 T17 Bull'],
    [160, 'T20 T20 D20'],
    [158, 'T20 T20 D19'],
    [136, 'T20 T12 D20'],
    [130, 'T20 T10 D20'],
    [100, 'T20 D20'],
    [98, 'T20 D19'],
    [80, 'T16 D16'],
    [62, 'T10 D16'],
    [40, 'D20'],
    [36, 'D18'],
    [32, 'D16'],
    [2, 'D1'],
  ])('%i → %s', (remaining, expected) => {
    expect(routeLabel(remaining)).toBe(expected);
  });

  it('routes 110 through the bullseye when no better two-dart route exists', () => {
    expect(routeLabel(110)).toBe('T20 Bull');
  });
});

describe('checkoutRoute — structural properties', () => {
  it('finds a route for every non-bogey score from 2 to 170', () => {
    for (let remaining = 2; remaining <= 170; remaining += 1) {
      const route = checkoutRoute(remaining, 3);
      if (BOGEY_NUMBERS.includes(remaining)) {
        expect(route).toBeNull();
      } else {
        expect(route).not.toBeNull();
      }
    }
  });

  it('every route sums to the remaining score and ends on a double', () => {
    for (let remaining = 2; remaining <= 170; remaining += 1) {
      const route = checkoutRoute(remaining, 3);
      if (route === null) {
        continue;
      }
      const total = route.reduce((sum, dart) => sum + dartScore(dart), 0);
      const last = route[route.length - 1];
      expect(total).toBe(remaining);
      expect(last).toBeDefined();
      expect(last !== undefined && isDouble(last)).toBe(true);
    }
  });

  it('never returns a route longer than the darts available', () => {
    for (const dartsLeft of [1, 2, 3] as const) {
      for (let remaining = 2; remaining <= 170; remaining += 1) {
        const route = checkoutRoute(remaining, dartsLeft);
        if (route !== null) {
          expect(route.length).toBeLessThanOrEqual(dartsLeft);
        }
      }
    }
  });

  it('rejects scores outside the checkout window', () => {
    expect(checkoutRoute(1, 3)).toBeNull();
    expect(checkoutRoute(0, 3)).toBeNull();
    expect(checkoutRoute(171, 3)).toBeNull();
  });
});

describe('hasCheckout', () => {
  it('respects the darts available', () => {
    expect(hasCheckout(40, 1)).toBe(true);
    expect(hasCheckout(100, 1)).toBe(false);
    expect(hasCheckout(100, 2)).toBe(true);
    expect(hasCheckout(170, 2)).toBe(false);
    expect(hasCheckout(170, 3)).toBe(true);
  });
});

describe('isViableFirstDart', () => {
  const t20: Dart = { kind: 'number', segment: 20, multiplier: 3 };
  const s19: Dart = { kind: 'number', segment: 19, multiplier: 1 };
  const d20: Dart = { kind: 'number', segment: 20, multiplier: 2 };

  it('accepts a direct finishing double', () => {
    expect(isViableFirstDart(40, 3, d20)).toBe(true);
    expect(isViableFirstDart(40, 1, d20)).toBe(true);
  });

  it('accepts any first dart that leaves a live finish', () => {
    expect(isViableFirstDart(170, 3, t20)).toBe(true);
    expect(isViableFirstDart(59, 2, s19)).toBe(true);
  });

  it('accepts leaving the madhouse (2) because D1 is still a finish', () => {
    expect(isViableFirstDart(42, 3, d20)).toBe(true);
  });

  it('rejects darts that bust or strand the score', () => {
    expect(isViableFirstDart(40, 3, t20)).toBe(false);
    expect(isViableFirstDart(41, 3, d20)).toBe(false);
    expect(isViableFirstDart(170, 2, t20)).toBe(false);
    expect(isViableFirstDart(40, 1, s19)).toBe(false);
  });

  it('rejects anything outside the checkout window', () => {
    expect(isViableFirstDart(171, 3, t20)).toBe(false);
    expect(isViableFirstDart(1, 3, s19)).toBe(false);
  });
});

describe('isFinishingDouble', () => {
  it('accepts only the exact double for the remaining score', () => {
    expect(isFinishingDouble({ kind: 'number', segment: 20, multiplier: 2 }, 40)).toBe(true);
    expect(isFinishingDouble({ kind: 'bull', multiplier: 2 }, 50)).toBe(true);
    expect(isFinishingDouble({ kind: 'number', segment: 20, multiplier: 2 }, 32)).toBe(false);
    expect(isFinishingDouble({ kind: 'number', segment: 20, multiplier: 1 }, 20)).toBe(false);
  });
});
