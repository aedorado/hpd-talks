'use client';

import React from 'react';
import { ShortItem } from '@/types/lecture';
import { ShortCard } from './ShortCard';

interface ShortsGridProps {
  shorts: ShortItem[];
  watchedSet: Set<string>;
  onOpenPlayer: (short: ShortItem) => void;
  onToggleWatched: (ytId: string) => void;
  onResetFilters?: () => void;
}

export const ShortsGrid: React.FC<ShortsGridProps> = ({
  shorts,
  watchedSet,
  onOpenPlayer,
  onToggleWatched,
  onResetFilters,
}) => {
  if (shorts.length === 0) {
    return (
      <div className="empty-state" id="shortsEmptyState" style={{ display: 'block' }}>
        <div className="empty-icon">⚡</div>
        <h3 className="empty-title">No shorts match your search</h3>
        <p className="empty-desc">
          Try clearing your keywords or switching between Watched / Unwatched filters.
        </p>
        {onResetFilters && (
          <button className="btn btn-primary" id="shortsEmptyResetBtn" onClick={onResetFilters}>
            Reset Shorts Filters
          </button>
        )}
      </div>
    );
  }

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
