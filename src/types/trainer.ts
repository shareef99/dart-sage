import type { Dart } from './darts';

export type TrainerQuestion = {
  remaining: number;
  dartsLeft: 1 | 2 | 3;
};

export type TrainerResult = 'correct' | 'wrong' | null;

export type TrainerStore = {
  question: TrainerQuestion | null;
  streak: number;
  bestStreak: number;
  attempts: number;
  correctCount: number;
  lastResult: TrainerResult;
  suggestedRoute: Dart[] | null;
  start: () => void;
  answer: (dart: Dart) => void;
  nextQuestion: () => void;
  skip: () => void;
};
