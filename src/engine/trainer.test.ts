import { hasCheckout } from './checkout';
import { generateTrainerQuestion } from './trainer';

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe('generateTrainerQuestion', () => {
  it('always produces a finishable question', () => {
    const rng = seededRng(42);
    for (let i = 0; i < 200; i += 1) {
      const question = generateTrainerQuestion(rng);
      expect(hasCheckout(question.remaining, question.dartsLeft)).toBe(true);
    }
  });

  it('one-dart questions are always finishing doubles', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 200; i += 1) {
      const question = generateTrainerQuestion(rng);
      if (question.dartsLeft === 1) {
        const isDoubleValue =
          question.remaining === 50 ||
          (question.remaining % 2 === 0 && question.remaining <= 40);
        expect(isDoubleValue).toBe(true);
      }
    }
  });

  it('covers all dart counts over enough samples', () => {
    const rng = seededRng(99);
    const seen = new Set<number>();
    for (let i = 0; i < 300; i += 1) {
      seen.add(generateTrainerQuestion(rng).dartsLeft);
    }
    expect(seen).toEqual(new Set([1, 2, 3]));
  });
});
