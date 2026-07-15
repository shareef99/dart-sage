import { hasCheckout } from './checkout';
import { computeStreak, DAILY_CHALLENGE_SIZE, generateDailyChallenge } from './streak';

describe('computeStreak', () => {
  it('returns zeros with no history', () => {
    expect(computeStreak([], '2026-07-16')).toEqual({
      current: 0,
      best: 0,
      completedToday: false,
    });
  });

  it('counts a live streak ending today', () => {
    const summary = computeStreak(['2026-07-14', '2026-07-15', '2026-07-16'], '2026-07-16');
    expect(summary.current).toBe(3);
    expect(summary.best).toBe(3);
    expect(summary.completedToday).toBe(true);
  });

  it('keeps the streak alive if the last completion was yesterday', () => {
    const summary = computeStreak(['2026-07-14', '2026-07-15'], '2026-07-16');
    expect(summary.current).toBe(2);
    expect(summary.completedToday).toBe(false);
  });

  it('kills the streak after a missed day but remembers the best', () => {
    const summary = computeStreak(['2026-07-10', '2026-07-11', '2026-07-12'], '2026-07-16');
    expect(summary.current).toBe(0);
    expect(summary.best).toBe(3);
  });

  it('handles duplicates and unsorted input across a month boundary', () => {
    const summary = computeStreak(
      ['2026-07-01', '2026-06-30', '2026-07-01', '2026-06-29'],
      '2026-07-01',
    );
    expect(summary.current).toBe(3);
    expect(summary.best).toBe(3);
  });
});

describe('generateDailyChallenge', () => {
  it('is deterministic for a given date', () => {
    expect(generateDailyChallenge('2026-07-16')).toEqual(generateDailyChallenge('2026-07-16'));
  });

  it('differs across dates', () => {
    const today = generateDailyChallenge('2026-07-16');
    const tomorrow = generateDailyChallenge('2026-07-17');
    expect(today).not.toEqual(tomorrow);
  });

  it('produces the configured number of unique, finishable questions', () => {
    const questions = generateDailyChallenge('2026-07-16');
    expect(questions).toHaveLength(DAILY_CHALLENGE_SIZE);
    const keys = new Set(questions.map((q) => `${q.remaining}-${q.dartsLeft}`));
    expect(keys.size).toBe(DAILY_CHALLENGE_SIZE);
    for (const question of questions) {
      expect(hasCheckout(question.remaining, question.dartsLeft)).toBe(true);
    }
  });
});
