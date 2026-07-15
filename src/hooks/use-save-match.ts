import { useEffect, useRef } from 'react';

import { saveFinishedX01Match } from '@/services/match-repository';
import { useX01Store } from '@/stores/x01-store';
import type { X01State } from '@/types/x01';

export function useSaveMatch() {
  const match = useX01Store((state) => state.match);
  const roster = useX01Store((state) => state.roster);
  const saved = useRef<X01State | null>(null);

  useEffect(() => {
    if (match === null || match.phase !== 'match-over' || saved.current === match) {
      return;
    }
    saved.current = match;
    saveFinishedX01Match(match, roster, new Date()).catch((error: unknown) => {
      console.warn('Failed to save match:', error);
    });
  }, [match, roster]);
}
