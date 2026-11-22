'use client';

import React, { useEffect } from 'react';
import { ShortItem } from '@/types/lecture';

interface ShortsPlayerModalProps {
  short: ShortItem | null;
  isWatched: boolean;
  onClose: () => void;
  onToggleWatched: (ytId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ShortsPlayerModal: React.FC<ShortsPlayerModalProps> = ({
  short,
  isWatched,
  onClose,
  onToggleWatched,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (hasPrev) onPrev?.();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (hasNext) onNext?.();
      }
    };

    if (short) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [short, hasPrev, hasNext, onClose, onPrev, onNext]);

  if (!short) return null;

  const ytId = short.yt_id || short.id;

  return (
    <div className="shorts-player-modal active" id="shortsPlayerModal" aria-hidden="false">
      <div className="shorts-player-overlay" id="shortsPlayerOverlay" onClick={onClose}></div>
      <div className="shorts-player-dialog" role="dialog" aria-modal="true">
        <div className="shorts-dialog-header">
          <div className="shorts-dialog-title-info">
            <span className="shorts-badge" id="shortsModalBadge">
              {short.catalog_id}
            </span>
            <h3 className="shorts-dialog-title" id="shortsModalTitle" title={short.title}>
              {short.title}
            </h3>
          </div>
          <button className="shorts-close-btn" id="shortsModalCloseBtn" title="Close Short Player (Esc)" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="shorts-video-wrap">
          <iframe
            id="shortsIframe"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0`}
            title="YouTube Shorts player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="shorts-dialog-footer">
          <div className="shorts-footer-left">
            <button
              className={`btn btn-sm btn-heard-toggle ${isWatched ? 'active' : ''}`}
              id="shortsModalWatchedBtn"
              onClick={() => onToggleWatched(ytId)}
            >
              <span className="heard-icon">✓</span>
              <span className="heard-text">{isWatched ? 'Watched' : 'Mark as Watched'}</span>
            </button>
          </div>

          <div className="shorts-footer-right">
            <button
              className="btn btn-sm btn-secondary"
              id="shortsModalPrevBtn"
              title="Previous Short (ArrowUp)"
              disabled={!hasPrev}
              onClick={onPrev}
            >
              ↑ Prev
            </button>
            <button
              className="btn btn-sm btn-secondary"
              id="shortsModalNextBtn"
              title="Next Short (ArrowDown)"
              disabled={!hasNext}
              onClick={onNext}
            >
              Next ↓
            </button>
            <a
              href={short.shorts_url || short.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
              id="shortsModalDirectLink"
            >
              Open in Youtube ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
