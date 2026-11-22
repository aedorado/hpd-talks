'use client';

import React from 'react';

interface ShortsHeroProps {
  totalShorts: number;
  watchedCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'all' | 'unwatched' | 'watched';
  onFilterChange: (filter: 'all' | 'unwatched' | 'watched') => void;
}

export const ShortsHero: React.FC<ShortsHeroProps> = ({
  totalShorts,
  watchedCount,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const unwatchedCount = Math.max(0, totalShorts - watchedCount);

  return (
    <section className="shorts-hero-card" aria-label="Shorts Archive Header">
      <div className="shorts-hero-top">
        <div className="shorts-hero-badge-wrap">
          <span className="shorts-hero-badge">⚡ Quick Nectar</span>
          <span className="shorts-hero-sub">Vertical Video Upadesh</span>
        </div>
        <div className="shorts-hero-stats">
          <div className="shorts-stat-box">
            <span className="shorts-stat-val" id="shortsWatchedCount">
              {watchedCount}
            </span>
            <span className="shorts-stat-lbl">Watched</span>
          </div>
          <div className="shorts-stat-sep">/</div>
          <div className="shorts-stat-box">
            <span className="shorts-stat-val" id="shortsTotalCount">
              {totalShorts}
            </span>
            <span className="shorts-stat-lbl">Total Shorts</span>
          </div>
        </div>
      </div>

      <div className="shorts-hero-content">
        <h2 className="shorts-hero-title">Shorts Archive</h2>
        <p className="shorts-hero-desc">
          Bite-sized spiritual wisdom, verse commentaries, and essential Krishna consciousness insights by HG Hari
          Parshad Das — preserved in distraction-free vertical cards.
        </p>
      </div>

      {/* Shorts Search & Filter Controls */}
      <div className="shorts-controls-row">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            id="shortsSearchInput"
            className="search-input"
            placeholder="Search shorts by topic, verse, keywords..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              id="clearShortsSearchBtn"
              title="Clear search"
              style={{ display: 'flex' }}
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="shorts-filter-pills" role="tablist">
          <button
            type="button"
            className={`pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All <span className="pill-count">{totalShorts}</span>
          </button>
          <button
            type="button"
            className={`pill-btn ${activeFilter === 'unwatched' ? 'active' : ''}`}
            onClick={() => onFilterChange('unwatched')}
          >
            Unwatched <span className="pill-count">{unwatchedCount}</span>
          </button>
          <button
            type="button"
            className={`pill-btn ${activeFilter === 'watched' ? 'active' : ''}`}
            onClick={() => onFilterChange('watched')}
          >
            Watched ✓ <span className="pill-count">{watchedCount}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
