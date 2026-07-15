import type { Dart, PlayerId } from './darts';

export type CricketTarget = '15' | '16' | '17' | '18' | '19' | '20' | 'bull';

export type CricketVariant = 'standard' | 'cut-throat';

export type CricketConfig = {
  variant: CricketVariant;
  playerIds: PlayerId[];
};

export type CricketPlayerState = {
  marks: Record<CricketTarget, number>;
  points: number;
};

export type CricketPhase = 'playing' | 'over';

export type CricketState = {
  config: CricketConfig;
  history: Dart[];
  players: Record<PlayerId, CricketPlayerState>;
  currentPlayerIndex: number;
  dartsThisTurn: number;
  phase: CricketPhase;
  winnerId: PlayerId | null;
};

export type CricketAction = { type: 'throw'; dart: Dart } | { type: 'undo' };

export type CricketStore = {
  match: CricketState | null;
  startMatch: (config: CricketConfig) => void;
  throwDart: (dart: Dart) => void;
  undo: () => void;
  endMatch: () => void;
};
