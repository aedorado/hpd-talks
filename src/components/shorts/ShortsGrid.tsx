'use client';

import React from 'react';
import { ShortItem } from '@/types/lecture';
import { ShortCard } from './ShortCard';

interface ShortsGridProps {
  shorts: ShortItem[];
  watchedSet: Set<string>;
  onOpenPlayer: (short: ShortItem) => void;
  onToggleWatched: (ytId: string) => void;
}

export const ShortsGrid: React.FC<ShortsGridProps> = ({
  shorts,
  watchedSet,
  onOpenPlayer,
  onToggleWatched,
}) => {
  return (
    <div className="shorts-grid" id="shortsGrid">
      {shorts.map((short) => {
        const ytId = short.yt_id || short.id;
        return (
          <ShortCard
            key={ytId}
            short={short}
            isWatched={watchedSet.has(ytId)}
            onOpenPlayer={onOpenPlayer}
            onToggleWatched={onToggleWatched}
          />
        );
      })}
    </div>
  );
};
