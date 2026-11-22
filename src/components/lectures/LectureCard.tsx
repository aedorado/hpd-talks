'use client';

import React from 'react';
import { Lecture } from '@/types/lecture';
import { PlaybackProgress } from '@/types/player';
import { formatTime, formatDisplayDate, copyToClipboard } from '@/lib/formatters';

interface LectureCardProps {
  lecture: Lecture;
  isHeard: boolean;
  isStarred: boolean;
  progress?: PlaybackProgress;
  searchQuery?: string;
  onPlay: (lecture: Lecture, showVideo: boolean) => void;
  onToggleHeard: (ytId: string) => void;
  onToggleStar: (ytId: string) => void;
  onShowToast: (msg: string) => void;
  onOpenResourcesModal?: () => void;
}

export const LectureCard: React.FC<LectureCardProps> = ({
  lecture,
  isHeard,
  isStarred,
  progress,
  searchQuery = '',
  onPlay,
  onToggleHeard,
  onToggleStar,
  onShowToast,
  onOpenResourcesModal,
}) => {
  const ytId = lecture.yt_id || lecture.id;
  const badgeLabel = lecture.catalog_id || (lecture.index ? `HPD${lecture.index.toString().padStart(4, '0')}` : '');

  // Deduplicate guest speaker and category
  const isGuestSpeaker = lecture.speaker && lecture.speaker !== 'HG Hari Parshad Das';
  const showCategory = !isGuestSpeaker || (lecture.category && lecture.category !== lecture.speaker);
  const showChannel = lecture.channel && lecture.channel !== 'Hari Parshad Das' && lecture.channel !== lecture.speaker;

  // Playback progress
  const hasProgress =
    progress &&
    progress.currentTime > 5 &&
    (!progress.duration || progress.currentTime < progress.duration - 15) &&
    !isHeard;
  const progressPercent =
    hasProgress && progress.duration
      ? Math.min(100, Math.round((progress.currentTime / progress.duration) * 100))
      : hasProgress
      ? 30
      : 0;

  // Highlight search matches in title
  const renderTitle = () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return lecture.title;
    }
    const escaped = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = lecture.title.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>
        )}
      </>
    );
  };

  const hasUpadeshamritaPdf =
    lecture.category === 'Upadeshamrta (Seminar)' || (lecture.resources && lecture.resources.length > 0);

  return (
    <article className={`lecture-card ${isHeard ? 'is-heard' : ''}`} id={`card-${ytId}`} data-yt-id={ytId}>
      {/* Thumbnail Wrap */}
      <div
        className="card-thumb-wrap"
        role="button"
        aria-label={`Play ${lecture.title}`}
        onClick={() => onPlay(lecture, true)}
      >
        <img
          className="card-thumb-img"
          src={lecture.thumbnail || `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt={lecture.title}
          loading="lazy"
        />
        {lecture.duration && (
          <span className="card-duration-badge" title="Duration">
            {lecture.duration}
          </span>
        )}
        {hasProgress && progress && (
          <>
            <div className="card-playback-progress" title={`Resumes at ${formatTime(progress.currentTime)}`}>
              <div className="card-playback-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="card-progress-badge" title="Resumed progress">
              ⏱️ {formatTime(progress.currentTime)}
            </span>
          </>
        )}
        <span className="card-heard-tag">✓ Heard</span>
        <div className="card-play-overlay">
          <div className="play-circle">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="card-content-col">
          <h3
            className="card-title"
            title={lecture.title}
            onClick={() => onPlay(lecture, true)}
            style={{ cursor: 'pointer' }}
          >
            {renderTitle()}
          </h3>

          <div className="card-meta-line">
            {badgeLabel && (
              <span className="badge-catalog" title={`Catalog: ${badgeLabel}`}>
                {badgeLabel}
              </span>
            )}
            {isGuestSpeaker && (
              <span className="badge-speaker" title={`Speaker: ${lecture.speaker}`}>
                🎙️ {lecture.speaker}
              </span>
            )}
            {showCategory && (
              <span className="badge-category" title={`Topic: ${lecture.category}`}>
                {lecture.category}
              </span>
            )}
            {lecture.subcategory && (
              <span className="badge-subcategory" title={`Sub-Topic: ${lecture.subcategory}`}>
                {lecture.subcategory}
              </span>
            )}
            {lecture.upload_date && (
              <span className="card-meta-item card-date" title={`Uploaded on ${lecture.upload_date}`}>
                <span>📅 {formatDisplayDate(lecture.upload_date)}</span>
              </span>
            )}
            {lecture.duration && (
              <span className="card-meta-item card-duration" title={`Duration: ${lecture.duration}`}>
                <span>⏱️ {lecture.duration}</span>
              </span>
            )}
            {showChannel && (
              <span className="card-meta-item card-channel" title={`Channel: ${lecture.channel}`}>
                <span>{lecture.channel}</span>
              </span>
            )}
          </div>

          {hasUpadeshamritaPdf && (
            <div className="card-resource-pill">
              <a
                href="/resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-card-resource"
                title="Sri Upadeshamrita Q&A PDF (421 Pages) by HG Hari Parshad Das"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '12px', height: '12px' }}
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Companion Q&amp;A PDF (421p)</span>
              </a>
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="card-actions">
          <button
            className="btn-toggle-heard"
            onClick={(e) => {
              e.stopPropagation();
              onToggleHeard(ytId);
            }}
          >
            <span className="check-icon">{isHeard ? '✓' : ''}</span>
            <span className="heard-label">{isHeard ? 'Heard' : 'Mark Heard'}</span>
          </button>

          <div className="card-sub-actions">
            <button
              className="btn-sub-action btn-stream-card"
              title="Stream Audio in Bottom Player (🎧)"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(lecture, false);
              }}
            >
              <span style={{ fontSize: '13px' }}>🎧</span>
            </button>

            <button
              className={`btn-sub-action btn-star ${isStarred ? 'active' : ''}`}
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(ytId);
              }}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>

            <button
              className="btn-sub-action btn-share"
              title={`Copy YouTube Link (${ytId})`}
              onClick={async (e) => {
                e.stopPropagation();
                const ok = await copyToClipboard(lecture.url || `https://www.youtube.com/watch?v=${ytId}`);
                if (ok) onShowToast(`YouTube link copied! (${ytId})`);
              }}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>

            <a
              href={lecture.url || `https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sub-action"
              title="Open directly on YouTube"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
