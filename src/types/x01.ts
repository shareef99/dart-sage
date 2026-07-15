import type { Dart, Player, PlayerId } from './darts';

export type X01StartingScore = 301 | 501 | 701;

export type X01Config = {
  startingScore: X01StartingScore;
  doubleOut: boolean;
  legsPerSet: number;
  setsToWin: number;
  playerIds: PlayerId[];
};

export type TurnEnd = 'in-progress' | 'completed' | 'busted' | 'checkout';

export type X01Turn = {
  playerId: PlayerId;
  darts: Dart[];
  scoreBefore: number;
  end: TurnEnd;
};

export type X01LegRecord = {
  winnerId: PlayerId;
  turns: X01Turn[];
  checkoutScore: number;
  dartsUsed: number;
  playersBefore: Record<PlayerId, X01PlayerState>;
};

export type X01PlayerState = {
  remaining: number;
  legsWon: number;
  setsWon: number;
};

export type X01Phase = 'playing' | 'leg-over' | 'match-over';

export type X01State = {
  config: X01Config;
  players: Record<PlayerId, X01PlayerState>;
  turnOrder: PlayerId[];
  currentPlayerIndex: number;
  currentTurn: X01Turn;
  turns: X01Turn[];
  completedLegs: X01LegRecord[];
  legStarterIndex: number;
  phase: X01Phase;
  winnerId: PlayerId | null;
};

export type X01Action =
  | { type: 'throw'; dart: Dart }
  | { type: 'undo' }
  | { type: 'next-leg' };

export type X01Store = {
  match: X01State | null;
  roster: Record<PlayerId, Player>;
  startMatch: (config: X01Config, roster: Record<PlayerId, Player>) => void;
  throwDart: (dart: Dart) => void;
  undo: () => void;
  nextLeg: () => void;
  endMatch: () => void;
};
