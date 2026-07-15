import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';

import { dartScore } from '@/engine/x01';
import { useX01Store } from '@/stores/x01-store';

// Classic caller behavior: announce each completed visit's total,
// "No score" on a bust, and "Game shot!" on a checkout.
export function useVoiceCaller() {
  const match = useX01Store((state) => state.match);
  const announcedTurns = useRef(0);

  useEffect(() => {
    if (match === null) {
      announcedTurns.current = 0;
      return;
    }
    if (match.turns.length === 0) {
      announcedTurns.current = 0;
      return;
    }
    if (match.turns.length <= announcedTurns.current) {
      announcedTurns.current = match.turns.length;
      return;
    }
    announcedTurns.current = match.turns.length;

    const turn = match.turns[match.turns.length - 1];
    if (turn === undefined) {
      return;
    }
    if (turn.end === 'checkout') {
      Speech.speak('Game shot!', { rate: 0.95 });
      return;
    }
    if (turn.end === 'busted') {
      Speech.speak('No score!', { rate: 0.95 });
      return;
    }
    const points = turn.darts.reduce((sum, dart) => sum + dartScore(dart), 0);
    if (points === 180) {
      Speech.speak('One hundred and eighty!', { rate: 0.9, pitch: 1.05 });
      return;
    }
    Speech.speak(String(points), { rate: 1.0 });
  }, [match]);
}
