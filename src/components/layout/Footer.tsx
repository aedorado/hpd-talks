'use client';

import React from 'react';

interface FooterProps {
  totalLectures: number;
  totalShorts: number;
  onOpenResources: () => void;
  onOpenBackup: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  totalLectures,
  totalShorts,
  onOpenResources,
  onOpenBackup,
}) => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="app-footer" aria-label="Site Footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-symbol">🪷</span>
            <span className="footer-title">Hari Parshad Das Katha Sangraha</span>
          </div>

          <div className="footer-links">
            <button type="button" className="footer-link-btn" onClick={onOpenResources}>
              Study Materials (PDF)
            </button>
            <button type="button" className="footer-link-btn" onClick={onOpenBackup}>
              Backup &amp; Sync
            </button>
            <a
              href="https://www.youtube.com/@hpdrgg"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              title="Katha Archive on YouTube"
            >
              YouTube Archive ↗
            </a>
            <button type="button" className="footer-link-btn footer-scroll-top" onClick={scrollToTop}>
              Back to Top ↑
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-stats">
            {totalLectures} Kathas • {totalShorts} Upadesh Shorts • Sadhana progress saved locally
          </div>
          <div className="footer-tagline">
            Curated with devotion for aspiring practitioners. All glories to Sri Guru and Gauranga.
          </div>
        </div>
      </div>
    </footer>
  );
};
