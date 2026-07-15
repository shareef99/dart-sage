import type { Dart } from '@/types/darts';
import type {
  X01Action,
  X01Config,
  X01LegRecord,
  X01PlayerState,
  X01State,
  X01Turn,
} from '@/types/x01';

export function dartScore(dart: Dart): number {
  switch (dart.kind) {
    case 'number':
      return dart.segment * dart.multiplier;
    case 'bull':
      return 25 * dart.multiplier;
    case 'miss':
      return 0;
  }
}

export function isDouble(dart: Dart): boolean {
  return (dart.kind === 'number' || dart.kind === 'bull') && dart.multiplier === 2;
}

export function createX01State(config: X01Config): X01State {
  const players: Record<string, X01PlayerState> = {};
  for (const id of config.playerIds) {
    players[id] = { remaining: config.startingScore, legsWon: 0, setsWon: 0 };
  }
  return {
    config,
    players,
    turnOrder: [...config.playerIds],
    currentPlayerIndex: 0,
    currentTurn: freshTurn(config.playerIds[0] ?? '', config.startingScore),
    turns: [],
    completedLegs: [],
    legStarterIndex: 0,
    phase: 'playing',
    winnerId: null,
  };
}

export function x01Reducer(state: X01State, action: X01Action): X01State {
  switch (action.type) {
    case 'throw':
      return applyThrow(state, action.dart);
    case 'undo':
      return applyUndo(state);
    case 'next-leg':
      return startNextLeg(state);
  }
}

function freshTurn(playerId: string, scoreBefore: number): X01Turn {
  return { playerId, darts: [], scoreBefore, end: 'in-progress' };
}

function turnScore(turn: X01Turn): number {
  return turn.darts.reduce((sum, dart) => sum + dartScore(dart), 0);
}

function applyThrow(state: X01State, dart: Dart): X01State {
  if (state.phase !== 'playing') {
    return state;
  }

  const playerId = state.turnOrder[state.currentPlayerIndex];
  if (playerId === undefined) {
    return state;
  }
  const player = state.players[playerId];
  if (player === undefined) {
    return state;
  }

  const darts = [...state.currentTurn.darts, dart];
  const newRemaining = player.remaining - dartScore(dart);
  const turn: X01Turn = { ...state.currentTurn, darts };

  if (isBust(newRemaining, dart, state.config.doubleOut)) {
    return endTurn(
      {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...player, remaining: state.currentTurn.scoreBefore },
        },
      },
      { ...turn, end: 'busted' },
    );
  }

  if (newRemaining === 0) {
    return completeLeg(state, { ...turn, end: 'checkout' }, playerId);
  }

  const updated: X01State = {
    ...state,
    players: { ...state.players, [playerId]: { ...player, remaining: newRemaining } },
    currentTurn: turn,
  };

  return darts.length === 3 ? endTurn(updated, { ...turn, end: 'completed' }) : updated;
}

function isBust(newRemaining: number, dart: Dart, doubleOut: boolean): boolean {
  if (newRemaining < 0) {
    return true;
  }
  if (!doubleOut) {
    return false;
  }
  if (newRemaining === 1) {
    return true;
  }
  return newRemaining === 0 && !isDouble(dart);
}

function endTurn(state: X01State, finishedTurn: X01Turn): X01State {
  const nextIndex = (state.currentPlayerIndex + 1) % state.turnOrder.length;
  const nextPlayerId = state.turnOrder[nextIndex];
  const nextPlayer = nextPlayerId === undefined ? undefined : state.players[nextPlayerId];
  if (nextPlayerId === undefined || nextPlayer === undefined) {
    return state;
  }
  return {
    ...state,
    turns: [...state.turns, finishedTurn],
    currentPlayerIndex: nextIndex,
    currentTurn: freshTurn(nextPlayerId, nextPlayer.remaining),
  };
}

function completeLeg(state: X01State, checkoutTurn: X01Turn, winnerId: string): X01State {
  const winner = state.players[winnerId];
  if (winner === undefined) {
    return state;
  }

  const record: X01LegRecord = {
    winnerId,
    turns: [...state.turns, checkoutTurn],
    checkoutScore: checkoutTurn.scoreBefore,
    dartsUsed: countDarts(state.turns, checkoutTurn, winnerId),
    playersBefore: state.players,
  };

  const wonSet = winner.legsWon + 1 >= state.config.legsPerSet;
  const newSetsWon = wonSet ? winner.setsWon + 1 : winner.setsWon;
  const matchOver = newSetsWon >= state.config.setsToWin;

  const players: Record<string, X01PlayerState> = {};
  for (const [id, playerState] of Object.entries(state.players)) {
    players[id] = {
      ...playerState,
      remaining: id === winnerId ? 0 : playerState.remaining,
      legsWon: wonSet ? 0 : id === winnerId ? playerState.legsWon + 1 : playerState.legsWon,
      setsWon: id === winnerId ? newSetsWon : playerState.setsWon,
    };
  }

  return {
    ...state,
    players,
    turns: [...state.turns, checkoutTurn],
    currentTurn: { ...checkoutTurn },
    completedLegs: [...state.completedLegs, record],
    phase: matchOver ? 'match-over' : 'leg-over',
    winnerId: matchOver ? winnerId : null,
  };
}

function countDarts(turns: X01Turn[], checkoutTurn: X01Turn, playerId: string): number {
  const previous = turns
    .filter((turn) => turn.playerId === playerId)
    .reduce((sum, turn) => sum + turn.darts.length, 0);
  return previous + checkoutTurn.darts.length;
}

function applyUndo(state: X01State): X01State {
  if (state.phase !== 'playing') {
    return undoLegCompletion(state);
  }
  if (state.currentTurn.darts.length > 0) {
    return undoDartInCurrentTurn(state);
  }
  return undoIntoPreviousTurn(state);
}

function undoDartInCurrentTurn(state: X01State): X01State {
  const darts = state.currentTurn.darts.slice(0, -1);
  const turn: X01Turn = { ...state.currentTurn, darts };
  const remaining = turn.scoreBefore - turnScore(turn);
  const player = state.players[turn.playerId];
  if (player === undefined) {
    return state;
  }
  return {
    ...state,
    players: { ...state.players, [turn.playerId]: { ...player, remaining } },
    currentTurn: turn,
  };
}

function undoIntoPreviousTurn(state: X01State): X01State {
  const lastTurn = state.turns[state.turns.length - 1];
  if (lastTurn === undefined) {
    return state;
  }

  const darts = lastTurn.darts.slice(0, -1);
  const reopened: X01Turn = { ...lastTurn, darts, end: 'in-progress' };
  const remaining = reopened.scoreBefore - turnScore(reopened);
  const player = state.players[reopened.playerId];
  if (player === undefined) {
    return state;
  }

  return {
    ...state,
    players: { ...state.players, [reopened.playerId]: { ...player, remaining } },
    turns: state.turns.slice(0, -1),
    currentPlayerIndex: state.turnOrder.indexOf(reopened.playerId),
    currentTurn: reopened,
  };
}

function undoLegCompletion(state: X01State): X01State {
  const record = state.completedLegs[state.completedLegs.length - 1];
  if (record === undefined) {
    return state;
  }

  const checkoutTurn = record.turns[record.turns.length - 1];
  if (checkoutTurn === undefined) {
    return state;
  }

  const darts = checkoutTurn.darts.slice(0, -1);
  const reopened: X01Turn = { ...checkoutTurn, darts, end: 'in-progress' };
  const remaining = reopened.scoreBefore - turnScore(reopened);
  const playerBefore = record.playersBefore[reopened.playerId];
  if (playerBefore === undefined) {
    return state;
  }

  return {
    ...state,
    players: {
      ...record.playersBefore,
      [reopened.playerId]: { ...playerBefore, remaining },
    },
    turns: record.turns.slice(0, -1),
    currentPlayerIndex: state.turnOrder.indexOf(reopened.playerId),
    currentTurn: reopened,
    completedLegs: state.completedLegs.slice(0, -1),
    phase: 'playing',
    winnerId: null,
  };
}

function startNextLeg(state: X01State): X01State {
  if (state.phase !== 'leg-over') {
    return state;
  }

  const players: Record<string, X01PlayerState> = {};
  for (const [id, playerState] of Object.entries(state.players)) {
    players[id] = { ...playerState, remaining: state.config.startingScore };
  }

  const legStarterIndex = (state.legStarterIndex + 1) % state.turnOrder.length;
  const starterId = state.turnOrder[legStarterIndex];
  if (starterId === undefined) {
    return state;
  }

  return {
    ...state,
    players,
    turns: [],
    currentPlayerIndex: legStarterIndex,
    currentTurn: freshTurn(starterId, state.config.startingScore),
    legStarterIndex,
    phase: 'playing',
    winnerId: null,
  };
}
