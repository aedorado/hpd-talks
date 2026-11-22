'use client';

import React, { useState } from 'react';
import { Lecture } from '@/types/lecture';
import { PlaybackProgress } from '@/types/player';
import { formatTime, formatDisplayDate } from '@/lib/formatters';

interface ContinueHearingProps {
  lecture: Lecture | null;
  progress?: PlaybackProgress;
  isHeard: boolean;
  isStarred: boolean;
  onResume: (lecture: Lecture, startTime: number) => void;
  onStreamAudio: (lecture: Lecture, startTime: number) => void;
  onToggleHeard: (ytId: string) => void;
  onToggleStar: (ytId: string) => void;
}

export const ContinueHearing: React.FC<ContinueHearingProps> = ({
  lecture,
  progress,
  isHeard,
  isStarred,
  onResume,
  onStreamAudio,
  onToggleHeard,
  onToggleStar,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!lecture || dismissed) return null;

  const ytId = lecture.yt_id || lecture.id;
  const hasProgress =
    progress &&
    progress.currentTime > 15 &&
    (!progress.duration || progress.currentTime < progress.duration - 25) &&
    !isHeard;
  const progTimeStr = hasProgress ? formatTime(progress.currentTime) : '';
  const progPercent =
    hasProgress && progress.duration
      ? Math.min(100, Math.round((progress.currentTime / progress.duration) * 100))
      : hasProgress
      ? 30
      : 0;

  const startTime = hasProgress && progress ? progress.currentTime : 0;
  const badgeLabel = lecture.catalog_id || (lecture.index ? `HPD${lecture.index.toString().padStart(4, '0')}` : '');

  return (
    <section className="continue-hearing-card" id="continueHearingSection" aria-label="Resume Sadhana">
      <div className="continue-hearing-header">
        <div className="continue-hearing-badge">
          <span className="pulse-dot"></span>
          <span>Resume Sadhana • Last Played</span>
        </div>
        <button
          className="continue-dismiss-btn"
          id="btnDismissContinue"
          title="Dismiss Resume Banner"
          onClick={() => setDismissed(true)}
        >
          ✕
        </button>
      </div>

      <div className="continue-hearing-content" id="continueHearingContent">
        <div
          className="continue-thumb-wrap"
          role="button"
          aria-label={`Resume ${lecture.title}`}
          onClick={() => onResume(lecture, startTime)}
        >
          <img
            className="continue-thumb-img"
            src={lecture.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt={lecture.title}
          />
          {lecture.duration && <span className="card-duration-badge">{lecture.duration}</span>}
          {hasProgress && <span className="continue-progress-pill">⏱️ {progTimeStr}</span>}
          <div className="continue-play-overlay">
            <div className="continue-play-icon">▶</div>
          </div>
        </div>

        <div className="continue-info">
          <div className="continue-meta-tags">
            {badgeLabel && <span className="badge-catalog">{badgeLabel}</span>}
            {lecture.speaker && lecture.speaker !== 'HG Hari Parshad Das' && (
              <span className="badge-speaker">🎙️ {lecture.speaker}</span>
            )}
            <span className="badge-category">{lecture.category}</span>
            {lecture.subcategory && <span className="badge-subcategory">{lecture.subcategory}</span>}
          </div>

          <h3
            className="continue-title"
            title={lecture.title}
            onClick={() => onResume(lecture, startTime)}
            style={{ cursor: 'pointer' }}
          >
            {lecture.title}
          </h3>

          <div className="continue-meta-sub">
            <span>📅 {formatDisplayDate(lecture.upload_date)}</span>
            <span>•</span>
            <span>{lecture.channel}</span>
          </div>

          {hasProgress && (
            <div className="continue-progress-wrap" id="continueProgressWrap">
              <div className="continue-progress-bar">
                <div className="continue-progress-fill" style={{ width: `${progPercent}%` }}></div>
              </div>
              <span className="continue-progress-text">
                ⏱️ Left off at {progTimeStr} ({progPercent}% completed)
              </span>
            </div>
          )}

          <div className="continue-actions">
            <button className="btn-resume" id="btnResumeLecture" onClick={() => onResume(lecture, startTime)}>
              <span>▶</span>
              <span>{hasProgress ? `Resume from ${progTimeStr}` : 'Resume Lecture'}</span>
            </button>

            <button
              className="btn-stream-audio"
              id="btnContinueStreamAudio"
              title="Stream Audio in Bottom Player"
              onClick={() => onStreamAudio(lecture, startTime)}
            >
              <span className="audio-pulse-icon">🎧</span>
              <span>Stream Audio</span>
            </button>

            {hasProgress && (
              <button
                className="btn btn-sm btn-ghost"
                id="btnContinueRestart"
                title="Start this lecture from 0:00"
                onClick={() => onResume(lecture, 0)}
              >
                <span>↺ 0:00</span>
              </button>
            )}

            <button
              className={`btn btn-sm ${isHeard ? 'btn-primary' : 'btn-secondary'}`}
              id="btnContinueToggleHeard"
              onClick={() => onToggleHeard(ytId)}
            >
              <span>{isHeard ? '✓ Heard' : 'Mark as Heard'}</span>
            </button>

            <button
              className="btn btn-sm btn-ghost"
              id="btnContinueToggleStar"
              title="Favorite"
              onClick={() => onToggleStar(ytId)}
            >
              <span>{isStarred ? '★ Favorited' : '☆ Favorite'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
