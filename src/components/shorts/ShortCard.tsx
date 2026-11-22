'use client';

import React from 'react';
import { ShortItem } from '@/types/lecture';

interface ShortCardProps {
  short: ShortItem;
  isWatched: boolean;
  onOpenPlayer: (short: ShortItem) => void;
  onToggleWatched: (ytId: string) => void;
}

export const ShortCard: React.FC<ShortCardProps> = ({
  short,
  isWatched,
  onOpenPlayer,
  onToggleWatched,
}) => {
  const ytId = short.yt_id || short.id;

  return (
    <article
      className={`short-card ${isWatched ? 'watched' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${short.title}`}
      onClick={() => onOpenPlayer(short)}
    >
      <div className="short-thumb-wrap">
        <img
          className="short-thumb-img"
          src={short.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
          alt={short.title}
          loading="lazy"
        />
        <div className="short-play-overlay">
          <div className="short-play-icon">▶</div>
        </div>
        <span className="short-badge-id">{short.catalog_id}</span>
        {isWatched && <span className="short-badge-watched">✓ Watched</span>}
      </div>

      <div className="short-card-body">
        <h4 className="short-card-title" title={short.title}>
          {short.title}
        </h4>
        <div className="short-card-footer">
          <button
            className={`btn-short-watched ${isWatched ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatched(ytId);
            }}
          >
            <span>{isWatched ? '✓ Watched' : 'Mark Watched'}</span>
          </button>
          <a
            href={short.shorts_url || short.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-short-open-yt"
            title="Open on YouTube Shorts"
            onClick={(e) => e.stopPropagation()}
          >
            ↗ YouTube
          </a>
        </div>
      </div>
    </article>
  );
};
