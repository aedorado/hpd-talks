'use client';

import React from 'react';
import { ContentMode } from '@/types/player';

interface ModeNavProps {
  activeMode: ContentMode;
  kathasCount: number;
  shortsCount: number;
  onModeChange: (mode: ContentMode) => void;
}

export const ModeNav: React.FC<ModeNavProps> = ({
  activeMode,
  kathasCount,
  shortsCount,
  onModeChange,
}) => {
  return (
    <nav className="mode-navigation-bar" aria-label="Content Mode">
      <div className="mode-nav-container">
        <button
          className={`nav-mode-btn ${activeMode === 'kathas' ? 'active' : ''}`}
          id="tabKathasBtn"
          data-mode="kathas"
          title="View Full Lectures Archive"
          onClick={() => onModeChange('kathas')}
        >
          <span className="nav-mode-icon">🎙️</span>
          <span className="nav-mode-text">Kathas</span>
          <span className="nav-mode-count" id="navKathasCount">
            {kathasCount}
          </span>
        </button>

        <button
          className={`nav-mode-btn ${activeMode === 'shorts' ? 'active' : ''}`}
          id="tabShortsBtn"
          data-mode="shorts"
          title="View Upadesh Shorts Archive"
          onClick={() => onModeChange('shorts')}
        >
          <span className="nav-mode-icon">⚡</span>
          <span className="nav-mode-text">Shorts</span>
          <span className="nav-mode-count" id="navShortsCount">
            {shortsCount}
          </span>
        </button>
      </div>
    </nav>
  );
};
