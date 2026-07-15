import type { Dart } from '@/types/darts';

export function dartLabel(dart: Dart): string {
  switch (dart.kind) {
    case 'miss':
      return 'MISS';
    case 'bull':
      return dart.multiplier === 2 ? 'BULL' : '25';
    case 'number': {
      const prefix = dart.multiplier === 3 ? 'T' : dart.multiplier === 2 ? 'D' : '';
      return `${prefix}${dart.segment}`;
    }
  }
}
