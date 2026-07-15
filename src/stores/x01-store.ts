import { create } from 'zustand';

import { createX01State, x01Reducer } from '@/engine/x01';
import type { X01Store } from '@/types/x01';

export const useX01Store = create<X01Store>((set) => ({
  match: null,
  roster: {},
  startMatch: (config, roster) => set({ match: createX01State(config), roster }),
  throwDart: (dart) =>
    set((state) =>
      state.match ? { match: x01Reducer(state.match, { type: 'throw', dart }) } : state,
    ),
  undo: () =>
    set((state) => (state.match ? { match: x01Reducer(state.match, { type: 'undo' }) } : state)),
  nextLeg: () =>
    set((state) =>
      state.match ? { match: x01Reducer(state.match, { type: 'next-leg' }) } : state,
    ),
  endMatch: () => set({ match: null, roster: {} }),
}));
