import { create } from 'zustand';

import { checkoutRoute, isViableFirstDart } from '@/engine/checkout';
import { generateTrainerQuestion } from '@/engine/trainer';
import type { TrainerStore } from '@/types/trainer';

export const useTrainerStore = create<TrainerStore>((set, get) => ({
  question: null,
  streak: 0,
  bestStreak: 0,
  attempts: 0,
  correctCount: 0,
  lastResult: null,
  suggestedRoute: null,

  start: () =>
    set({
      question: generateTrainerQuestion(Math.random),
      streak: 0,
      attempts: 0,
      correctCount: 0,
      lastResult: null,
      suggestedRoute: null,
    }),

  answer: (dart) => {
    const { question, streak, bestStreak, attempts, correctCount, lastResult } = get();
    if (question === null || lastResult !== null) {
      return;
    }
    const correct = isViableFirstDart(question.remaining, question.dartsLeft, dart);
    set({
      attempts: attempts + 1,
      correctCount: correct ? correctCount + 1 : correctCount,
      streak: correct ? streak + 1 : 0,
      bestStreak: correct ? Math.max(bestStreak, streak + 1) : bestStreak,
      lastResult: correct ? 'correct' : 'wrong',
      suggestedRoute: correct ? null : checkoutRoute(question.remaining, question.dartsLeft),
    });
  },

  nextQuestion: () =>
    set({
      question: generateTrainerQuestion(Math.random),
      lastResult: null,
      suggestedRoute: null,
    }),

  skip: () => {
    const { question, attempts, lastResult } = get();
    if (question === null || lastResult !== null) {
      return;
    }
    set({
      attempts: attempts + 1,
      streak: 0,
      lastResult: 'wrong',
      suggestedRoute: checkoutRoute(question.remaining, question.dartsLeft),
    });
  },
}));
