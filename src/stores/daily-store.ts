import { create } from 'zustand';

import { checkoutRoute, isViableFirstDart } from '@/engine/checkout';
import { computeStreak, generateDailyChallenge } from '@/engine/streak';
import { showRewardedAd } from '@/services/ads';
import {
  loadDailyCompletionDates,
  saveDailyCompletion,
  toIsoDate,
} from '@/services/daily-repository';
import type { DailyStore } from '@/types/daily';

let todayIsoDate = '';

export const useDailyStore = create<DailyStore>((set, get) => ({
  phase: 'loading',
  questions: [],
  questionIndex: 0,
  results: [],
  suggestedRoute: null,
  streak: { current: 0, best: 0, completedToday: false },
  canRestoreStreak: false,

  load: async (todayIso) => {
    todayIsoDate = todayIso;
    const dates = await loadDailyCompletionDates();
    const streak = computeStreak(dates, todayIso);
    // A restore makes sense when a previous streak just died: history exists,
    // today is not yet part of a live run, and yesterday was missed.
    const canRestoreStreak = dates.length > 0 && streak.current === 0;
    set({
      phase: streak.completedToday ? 'done' : 'ready',
      questions: generateDailyChallenge(todayIso),
      questionIndex: 0,
      results: [],
      suggestedRoute: null,
      streak,
      canRestoreStreak,
    });
  },

  start: () => {
    const { phase } = get();
    if (phase === 'ready') {
      set({ phase: 'playing', questionIndex: 0, results: [] });
    }
  },

  answer: (dart) => {
    const { phase, questions, questionIndex, results } = get();
    if (phase !== 'playing') {
      return;
    }
    const question = questions[questionIndex];
    if (question === undefined) {
      return;
    }
    const correct = isViableFirstDart(question.remaining, question.dartsLeft, dart);
    const nextResults = [...results, correct];
    if (correct) {
      advance(nextResults);
      return;
    }
    set({
      phase: 'revealing',
      results: nextResults,
      suggestedRoute: checkoutRoute(question.remaining, question.dartsLeft),
    });
  },

  continueAfterReveal: () => {
    const { phase, results } = get();
    if (phase === 'revealing') {
      advance(results);
    }
  },

  restoreStreak: () => {
    showRewardedAd(
      () => {
        void restoreYesterday();
      },
      () => {
        // No fill or ad failed: nothing to do, the button stays available.
      },
    );
  },
}));

function advance(results: boolean[]): void {
  const { questions } = useDailyStore.getState();
  const nextIndex = results.length;
  if (nextIndex < questions.length) {
    useDailyStore.setState({
      phase: 'playing',
      questionIndex: nextIndex,
      results,
      suggestedRoute: null,
    });
    return;
  }
  const score = results.filter(Boolean).length;
  useDailyStore.setState({ phase: 'done', results, suggestedRoute: null });
  void saveDailyCompletion(todayIsoDate, score, questions.length).then(async () => {
    const dates = await loadDailyCompletionDates();
    useDailyStore.setState({
      streak: computeStreak(dates, todayIsoDate),
      canRestoreStreak: false,
    });
  });
}

async function restoreYesterday(): Promise<void> {
  const today = new Date(`${todayIsoDate}T12:00:00`);
  const yesterday = new Date(today.getTime() - 86_400_000);
  await saveDailyCompletion(toIsoDate(yesterday), 0, 0);
  const dates = await loadDailyCompletionDates();
  useDailyStore.setState({
    streak: computeStreak(dates, todayIsoDate),
    canRestoreStreak: false,
  });
}
