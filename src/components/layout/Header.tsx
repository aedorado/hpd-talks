'use client';

import React from 'react';
import { ThemeMode } from '@/types/player';

interface HeaderProps {
  heardCount: number;
  totalLectures: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenResources: () => void;
  onOpenBackup: () => void;
  onSurpriseMe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  heardCount,
  totalLectures,
  theme,
  onToggleTheme,
  onOpenResources,
  onOpenBackup,
  onSurpriseMe,
}) => {
  const percent = totalLectures > 0 ? Math.round((heardCount / totalLectures) * 100) : 0;

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-symbol">🪷</div>
          <div className="brand-text">
            <h1 className="brand-title">Hari Parshad Das Katha Sangraha</h1>
            <p className="brand-subtitle">Curated Discourses, Seminars &amp; Vaishnava Tattva</p>
          </div>
        </div>

        {/* Header Actions & Progress Summary */}
        <div className="header-actions">
          {/* Progress Counter Pill */}
          <div
            className="progress-pill"
            id="headerProgressWidget"
            title="Click to view listening stats"
            onClick={onOpenBackup}
            role="button"
            tabIndex={0}
          >
            <div className="progress-meta">
              <span className="progress-label">Lectures Heard</span>
              <span className="progress-fraction" id="heardFraction">
                {heardCount} / {totalLectures}
              </span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                id="progressBarFill"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <span className="progress-percent" id="heardPercentage">
              {percent}%
            </span>
          </div>

          {/* Resources / Study Material Modal Trigger */}
          <button
            className="btn btn-secondary btn-icon-text"
            id="openResourcesBtn"
            title="View Companion Study Materials &amp; PDFs"
            onClick={onOpenResources}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span className="btn-text">Study Materials</span>
            <span className="resource-count-badge">1</span>
          </button>

          {/* Random Talk Button */}
          <button
            className="btn btn-secondary btn-icon-text"
            id="randomTalkBtn"
            title="Play a random unheard talk"
            onClick={onSurpriseMe}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            <span className="btn-text">Surprise Me</span>
          </button>

          {/* Backup/Restore Modal Trigger */}
          <button
            className="btn btn-icon"
            id="openBackupBtn"
            title="Backup or restore listening history"
            onClick={onOpenBackup}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            className="btn btn-icon"
            id="themeToggleBtn"
            title="Toggle Light / Dark theme"
            onClick={onToggleTheme}
          >
            <svg className="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg className="icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};