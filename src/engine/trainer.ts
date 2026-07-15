import type { TrainerQuestion } from '@/types/trainer';

import { hasCheckout } from './checkout';

const DARTS_LEFT_WEIGHTS: [1 | 2 | 3, number][] = [
  [3, 0.6],
  [2, 0.3],
  [1, 0.1],
];

const candidateCache = new Map<1 | 2 | 3, number[]>();

function candidatesFor(dartsLeft: 1 | 2 | 3): number[] {
  const cached = candidateCache.get(dartsLeft);
  if (cached !== undefined) {
    return cached;
  }
  const candidates: number[] = [];
  for (let remaining = 2; remaining <= 170; remaining += 1) {
    if (hasCheckout(remaining, dartsLeft)) {
      candidates.push(remaining);
    }
  }
  candidateCache.set(dartsLeft, candidates);
  return candidates;
}

export function generateTrainerQuestion(rng: () => number): TrainerQuestion {
  const dartsLeft = pickDartsLeft(rng());
  const candidates = candidatesFor(dartsLeft);
  const index = Math.min(Math.floor(rng() * candidates.length), candidates.length - 1);
  return { remaining: candidates[index] ?? 40, dartsLeft };
}

function pickDartsLeft(roll: number): 1 | 2 | 3 {
  let cumulative = 0;
  for (const [dartsLeft, weight] of DARTS_LEFT_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) {
      return dartsLeft;
    }
  }
  return 3;
}
