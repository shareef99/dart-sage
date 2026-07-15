import { create } from 'zustand';

import { createCricketState, cricketReducer } from '@/engine/cricket';
import type { CricketStore } from '@/types/cricket';

export const useCricketStore = create<CricketStore>((set) => ({
  match: null,
  startMatch: (config) => set({ match: createCricketState(config) }),
  throwDart: (dart) =>
    set((state) =>
      state.match ? { match: cricketReducer(state.match, { type: 'throw', dart }) } : state,
    ),
  undo: () =>
    set((state) =>
      state.match ? { match: cricketReducer(state.match, { type: 'undo' }) } : state,
    ),
  endMatch: () => set({ match: null }),
}));
