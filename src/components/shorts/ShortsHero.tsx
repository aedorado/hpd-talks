'use client';

import React from 'react';

interface ShortsHeroProps {
  totalShorts: number;
  watchedCount: number;
}

export const ShortsHero: React.FC<ShortsHeroProps> = ({ totalShorts, watchedCount }) => {
  return (
    <div className="shorts-hero-banner">
      <div className="shorts-hero-badge-wrap">
        <span className="shorts-hero-badge">⚡ Micro Katha Sangraha</span>
      </div>

      <div className="shorts-hero-content">
        <h2 className="shorts-hero-title">Shorts Archive</h2>
        <p className="shorts-hero-desc">
          Bite-sized spiritual wisdom, verse commentaries, and essential Krishna consciousness insights by HG Hari
          Parshad Das — preserved in distraction-free vertical cards.
        </p>
      </div>

      <div className="shorts-stats-strip">
        <div className="shorts-stat-item">
          <span className="shorts-stat-val" id="shortsTotalCount">
            {totalShorts}
          </span>
          <span className="shorts-stat-lbl">Total Shorts</span>
        </div>
        <div className="shorts-stat-item">
          <span className="shorts-stat-val" id="shortsWatchedCount">
            {watchedCount}
          </span>
          <span className="shorts-stat-lbl">Watched</span>
        </div>
        <div className="shorts-stat-item">
          <span className="shorts-stat-val" id="shortsRemainingCount">
            {Math.max(0, totalShorts - watchedCount)}
          </span>
          <span className="shorts-stat-lbl">Unwatched</span>
        </div>
      </div>
    </div>
  );
};
