export type BotSkill = 1 | 2 | 3 | 4 | 5;

export type BotProfile = {
  skill: BotSkill;
  name: string;
};

export type AimOutcome = 'hit' | 'ring-slip' | 'neighbor' | 'neighbor-slip' | 'board-miss';

export type AimDistribution = Record<AimOutcome, number>;
