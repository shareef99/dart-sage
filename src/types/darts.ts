import type { BotSkill } from './bot';

export type Multiplier = 1 | 2 | 3;

export type SegmentNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export type Dart =
  | { kind: 'number'; segment: SegmentNumber; multiplier: Multiplier }
  | { kind: 'bull'; multiplier: 1 | 2 }
  | { kind: 'miss' };

export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  isBot: boolean;
  botSkill?: BotSkill;
};
