import type { Dart, PlayerId } from './darts';

export type AroundTheClockConfig = {
  playerIds: PlayerId[];
  includeBull: boolean;
  skipOnMultiples: boolean;
};

export type AroundTheClockPlayerState = {
  targetIndex: number;
};

export type AroundTheClockPhase = 'playing' | 'over';

export type AroundTheClockState = {
  config: AroundTheClockConfig;
  history: Dart[];
  players: Record<PlayerId, AroundTheClockPlayerState>;
  currentPlayerIndex: number;
  dartsThisTurn: number;
  phase: AroundTheClockPhase;
  winnerId: PlayerId | null;
};

export type AroundTheClockAction = { type: 'throw'; dart: Dart } | { type: 'undo' };
