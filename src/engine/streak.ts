import type { StreakSummary } from '@/types/streak';
import type { TrainerQuestion } from '@/types/trainer';

import { generateTrainerQuestion } from './trainer';

const MS_PER_DAY = 86_400_000;

export const DAILY_CHALLENGE_SIZE = 5;

function toDayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return Number.NaN;
  }
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

export function computeStreak(completedDates: string[], today: string): StreakSummary {
  const days = [...new Set(completedDates.map(toDayNumber))]
    .filter((day) => !Number.isNaN(day))
    .sort((a, b) => a - b);
  const todayNumber = toDayNumber(today);

  let best = 0;
  let run = 0;
  let previous: number | null = null;
  let runEnd = Number.NaN;
  let currentRunEnd = Number.NaN;
  let current = 0;

  for (const day of days) {
    run = previous !== null && day === previous + 1 ? run + 1 : 1;
    previous = day;
    runEnd = day;
    if (run > best) {
      best = run;
    }
    // The streak is alive if its last day is today or yesterday.
    if (runEnd === todayNumber || runEnd === todayNumber - 1) {
      current = run;
      currentRunEnd = runEnd;
    }
  }

  return {
    current: Number.isNaN(currentRunEnd) ? 0 : current,
    best,
    completedToday: days.includes(todayNumber),
  };
}

export function generateDailyChallenge(isoDate: string): TrainerQuestion[] {
  const rng = seededRngFromDate(isoDate);
  const questions: TrainerQuestion[] = [];
  const seen = new Set<string>();
  while (questions.length < DAILY_CHALLENGE_SIZE) {
    const question = generateTrainerQuestion(rng);
    const key = `${question.remaining}-${question.dartsLeft}`;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push(question);
    }
  }
  return questions;
}

function seededRngFromDate(isoDate: string): () => number {
  let state = 0;
  for (const char of isoDate) {
    state = (state * 31 + char.charCodeAt(0)) >>> 0;
  }
  if (state === 0) {
    state = 1;
  }
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}
