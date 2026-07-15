import { create } from 'zustand';

import { aroundTheClockReducer, createAroundTheClockState } from '@/engine/around-the-clock';
import type { AroundTheClockStore } from '@/types/around-the-clock';

export const useAroundTheClockStore = create<AroundTheClockStore>((set) => ({
  match: null,
  startMatch: (config) => set({ match: createAroundTheClockState(config) }),
  throwDart: (dart) =>
    set((state) =>
      state.match
        ? { match: aroundTheClockReducer(state.match, { type: 'throw', dart }) }
        : state,
    ),
  undo: () =>
    set((state) =>
      state.match ? { match: aroundTheClockReducer(state.match, { type: 'undo' }) } : state,
    ),
  endMatch: () => set({ match: null }),
}));
