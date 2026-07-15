import type {
  AroundTheClockAction,
  AroundTheClockConfig,
  AroundTheClockPlayerState,
  AroundTheClockState,
} from '@/types/around-the-clock';
import type { Dart, PlayerId } from '@/types/darts';

export function targetSequenceLength(config: AroundTheClockConfig): number {
  return config.includeBull ? 21 : 20;
}

export function currentTargetLabel(config: AroundTheClockConfig, targetIndex: number): string {
  if (targetIndex >= targetSequenceLength(config)) {
    return 'DONE';
  }
  return targetIndex === 20 ? 'BULL' : String(targetIndex + 1);
}

export function createAroundTheClockState(config: AroundTheClockConfig): AroundTheClockState {
  return deriveState(config, []);
}

export function aroundTheClockReducer(
  state: AroundTheClockState,
  action: AroundTheClockAction,
): AroundTheClockState {
  switch (action.type) {
    case 'throw':
      return state.phase === 'over'
        ? state
        : deriveState(state.config, [...state.history, action.dart]);
    case 'undo':
      return deriveState(state.config, state.history.slice(0, -1));
  }
}

function deriveState(config: AroundTheClockConfig, history: Dart[]): AroundTheClockState {
  const players: Record<PlayerId, AroundTheClockPlayerState> = {};
  for (const id of config.playerIds) {
    players[id] = { targetIndex: 0 };
  }

  const sequenceLength = targetSequenceLength(config);
  let currentPlayerIndex = 0;
  let dartsThisTurn = 0;
  let winnerId: PlayerId | null = null;

  for (const dart of history) {
    const playerId = config.playerIds[currentPlayerIndex];
    const player = playerId === undefined ? undefined : players[playerId];
    if (playerId === undefined || player === undefined) {
      break;
    }

    const advance = advanceFor(config, player.targetIndex, dart);
    player.targetIndex = Math.min(player.targetIndex + advance, sequenceLength);
    if (player.targetIndex >= sequenceLength) {
      winnerId = playerId;
      break;
    }

    dartsThisTurn += 1;
    if (dartsThisTurn === 3) {
      dartsThisTurn = 0;
      currentPlayerIndex = (currentPlayerIndex + 1) % config.playerIds.length;
    }
  }

  return {
    config,
    history,
    players,
    currentPlayerIndex,
    dartsThisTurn,
    phase: winnerId === null ? 'playing' : 'over',
    winnerId,
  };
}

function advanceFor(config: AroundTheClockConfig, targetIndex: number, dart: Dart): number {
  const isBullTarget = targetIndex === 20;
  if (isBullTarget) {
    return dart.kind === 'bull' ? 1 : 0;
  }
  if (dart.kind !== 'number' || dart.segment !== targetIndex + 1) {
    return 0;
  }
  return config.skipOnMultiples ? dart.multiplier : 1;
}
