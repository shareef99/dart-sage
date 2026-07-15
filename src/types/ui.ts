import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { CricketTarget } from './cricket';
import type { Dart } from './darts';

export type PressableScaleProps = {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export type ScreenProps = {
  children: ReactNode;
};

export type ScoreKeypadProps = {
  onDart: (dart: Dart) => void;
  onUndo: () => void;
  disabled?: boolean;
};

export type PlayerPanelProps = {
  name: string;
  remaining: number;
  legsWon: number;
  isActive: boolean;
  average: number;
};

export type MenuCardProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export type OptionChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export type CheckoutHintProps = {
  remaining: number;
  dartsLeft: 1 | 2 | 3;
};

export type StatTileProps = {
  label: string;
  value: string;
};

export type CricketPlayerScoreProps = {
  name: string;
  points: number;
  isActive: boolean;
};

export type CricketBoardProps = {
  leftMarks: Record<CricketTarget, number>;
  rightMarks: Record<CricketTarget, number>;
};

export type MatchOverlayProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};
