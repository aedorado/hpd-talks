import { Lecture } from './lecture';

export interface PlaybackProgress {
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export type ViewMode = 'list' | 'grid';
export type ContentMode = 'kathas' | 'shorts';
export type StatusFilter = 'all' | 'unheard' | 'heard' | 'starred';
export type SortOption = 'default' | 'reverse' | 'titleAsc' | 'category';
export type ThemeMode = 'light' | 'dark';

export interface PlayerState {
  activeLecture: Lecture | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isVideoExpanded: boolean;
}
