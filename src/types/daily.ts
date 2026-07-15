import type { Dart } from './darts';
import type { StreakSummary } from './streak';
import type { TrainerQuestion } from './trainer';

export type DailyPhase = 'loading' | 'ready' | 'playing' | 'revealing' | 'done';

export type DailyStore = {
  phase: DailyPhase;
  questions: TrainerQuestion[];
  questionIndex: number;
  results: boolean[];
  suggestedRoute: Dart[] | null;
  streak: StreakSummary;
  canRestoreStreak: boolean;
  load: (todayIso: string) => Promise<void>;
  start: () => void;
  answer: (dart: Dart) => void;
  continueAfterReveal: () => void;
  restoreStreak: () => void;
};
