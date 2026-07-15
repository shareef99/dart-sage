import type { Dart, PlayerId } from '@/types/darts';
import type {
  CricketAction,
  CricketConfig,
  CricketPlayerState,
  CricketState,
  CricketTarget,
} from '@/types/cricket';

const TARGETS: CricketTarget[] = ['20', '19', '18', '17', '16', '15', 'bull'];

const CLOSED = 3;

export function createCricketState(config: CricketConfig): CricketState {
  return deriveState(config, []);
}

export function cricketReducer(state: CricketState, action: CricketAction): CricketState {
  switch (action.type) {
    case 'throw':
      return state.phase === 'over'
        ? state
        : deriveState(state.config, [...state.history, action.dart]);
    case 'undo':
      return deriveState(state.config, state.history.slice(0, -1));
  }
}

export function targetValue(target: CricketTarget): number {
  return target === 'bull' ? 25 : Number(target);
}

export function dartTarget(dart: Dart): CricketTarget | null {
  if (dart.kind === 'bull') {
    return 'bull';
  }
  if (dart.kind === 'number' && dart.segment >= 15) {
    return String(dart.segment) as CricketTarget;
  }
  return null;
}

function deriveState(config: CricketConfig, history: Dart[]): CricketState {
  const players: Record<PlayerId, CricketPlayerState> = {};
  for (const id of config.playerIds) {
    players[id] = { marks: emptyMarks(), points: 0 };
  }

  let currentPlayerIndex = 0;
  let dartsThisTurn = 0;
  let winnerId: PlayerId | null = null;

  for (const dart of history) {
    const playerId = config.playerIds[currentPlayerIndex];
    if (playerId === undefined) {
      break;
    }
    applyDart(config, players, playerId, dart);
    winnerId = findWinner(config, players);
    if (winnerId !== null) {
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

function emptyMarks(): Record<CricketTarget, number> {
  return { '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, bull: 0 };
}

function applyDart(
  config: CricketConfig,
  players: Record<PlayerId, CricketPlayerState>,
  playerId: PlayerId,
  dart: Dart,
): void {
  const target = dartTarget(dart);
  if (target === null || dart.kind === 'miss') {
    return;
  }

  const player = players[playerId];
  if (player === undefined) {
    return;
  }

  const marksThrown = dart.multiplier;
  const marksToClose = Math.max(0, CLOSED - player.marks[target]);
  const overflow = Math.max(0, marksThrown - marksToClose);
  player.marks[target] += marksThrown;

  if (overflow === 0) {
    return;
  }

  const openOpponents = config.playerIds.filter(
    (id) => id !== playerId && (players[id]?.marks[target] ?? CLOSED) < CLOSED,
  );
  if (openOpponents.length === 0) {
    return;
  }

  const points = overflow * targetValue(target);
  if (config.variant === 'standard') {
    player.points += points;
    return;
  }
  for (const id of openOpponents) {
    const opponent = players[id];
    if (opponent !== undefined) {
      opponent.points += points;
    }
  }
}

function findWinner(
  config: CricketConfig,
  players: Record<PlayerId, CricketPlayerState>,
): PlayerId | null {
  for (const id of config.playerIds) {
    const player = players[id];
    if (player === undefined || !hasClosedAll(player)) {
      continue;
    }
    const opponents = config.playerIds.filter((other) => other !== id);
    const wins =
      config.variant === 'standard'
        ? opponents.every((other) => player.points >= (players[other]?.points ?? 0))
        : opponents.every((other) => player.points <= (players[other]?.points ?? 0));
    if (wins) {
      return id;
    }
  }
  return null;
}

function hasClosedAll(player: CricketPlayerState): boolean {
  return TARGETS.every((target) => player.marks[target] >= CLOSED);
}
