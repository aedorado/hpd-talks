'use client';

import React from 'react';
import { Lecture } from '@/types/lecture';
import { VideoDock } from './VideoDock';
import { formatTime } from '@/lib/formatters';

interface DockedBottomPlayerProps {
  activeLecture: Lecture | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isVideoExpanded: boolean;
  initialStartTime?: number;
  isHeard: boolean;
  isStarred: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  isSeekingRef: React.MutableRefObject<boolean>;
  onTogglePlayPause: () => void;
  onStepSeek: (deltaSec: number) => void;
  onSeekTo: (sec: number) => void;
  onCyclePlaybackRate: () => void;
  onToggleVideoExtension: () => void;
  onSetVideoExpanded: (expanded: boolean) => void;
  onToggleHeard: (ytId: string) => void;
  onToggleStar: (ytId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onClose: () => void;
}

export const DockedBottomPlayer: React.FC<DockedBottomPlayerProps> = ({
  activeLecture,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  isVideoExpanded,
  initialStartTime = 0,
  isHeard,
  isStarred,
  iframeRef,
  isSeekingRef,
  onTogglePlayPause,
  onStepSeek,
  onSeekTo,
  onCyclePlaybackRate,
  onToggleVideoExtension,
  onSetVideoExpanded,
  onToggleHeard,
  onToggleStar,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  onClose,
}) => {
  if (!activeLecture) return null;

  const ytId = activeLecture.yt_id || activeLecture.id;
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <aside
      className={`docked-bottom-player ${isVideoExpanded ? 'is-video-visible' : ''}`}
      id="dockedBottomPlayer"
      aria-label="Katha Player"
    >
      {/* Centered Expandable Video Dock attached directly above bottom player bar */}
      <VideoDock
        ytId={ytId}
        startTime={initialStartTime}
        iframeRef={iframeRef}
        onSwitchToAudio={() => onSetVideoExpanded(false)}
      />

      <div className="bottom-player-container">
        {/* Left: Track Metadata & Live Status */}
        <div className="bp-track-info">
          <div
            className="bp-thumb-wrap"
            id="bpThumbWrap"
            title="Click to show/hide video"
            onClick={onToggleVideoExtension}
          >
            <img
              className="bp-thumb-img"
              id="bpThumbImg"
              src={activeLecture.thumbnail || `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
              alt={activeLecture.title}
            />
            <div className="bp-thumb-overlay">
              <span className="bp-expand-icon">📹</span>
            </div>
            <div className={`bp-live-wave ${isPlaying ? 'playing' : ''}`} id="bpLiveWave">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="bp-meta-text">
            <div className="bp-title-wrap">
              <h4 className="bp-title" id="bpTitle" title={activeLecture.title}>
                {activeLecture.title}
              </h4>
            </div>
            <div className="bp-sub-meta">
              <span className="bp-speaker" id="bpSpeaker">
                {activeLecture.speaker || 'HG Hari Parshad Das'}
              </span>
              <span className="bp-dot">•</span>
              <span className="bp-category" id="bpCategory">
                {activeLecture.category}
                {activeLecture.subcategory && ` • ${activeLecture.subcategory}`}
              </span>
            </div>
            <div className="bp-stream-badge">
              <span className="bp-stream-dot"></span>
              <span className="bp-stream-text">YouTube Audio Stream</span>
            </div>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="bp-center-controls">
          <div className="bp-btn-row">
            <button
              className="bp-ctrl-btn"
              id="bpPrevBtn"
              title="Previous Lecture"
              onClick={onPrev}
              disabled={!hasPrev}
            >
              ⏮
            </button>
            <button
              className="bp-ctrl-btn bp-seek-btn"
              id="bpRewind10Btn"
              title="Rewind 10s"
              onClick={() => onStepSeek(-10)}
            >
              ↺
            </button>
            <button
              className={`bp-ctrl-btn bp-play-btn ${isPlaying ? 'playing' : ''}`}
              id="bpPlayPauseBtn"
              title="Play / Pause"
              onClick={onTogglePlayPause}
            >
              <span className="bp-play-icon" id="bpPlayIcon">
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
            <button
              className="bp-ctrl-btn bp-seek-btn"
              id="bpForward10Btn"
              title="Forward 10s"
              onClick={() => onStepSeek(10)}
            >
              ↻
            </button>
            <button
              className="bp-ctrl-btn"
              id="bpNextBtn"
              title="Next Lecture"
              onClick={onNext}
              disabled={!hasNext}
            >
              ⏭
            </button>
          </div>

          <div className="bp-scrubber-row">
            <span className="bp-time" id="bpCurrentTime">
              {formatTime(currentTime)}
            </span>
            <div className="bp-progress-track" id="bpProgressTrack">
              <input
                type="range"
                className="bp-progress-slider"
                id="bpProgressSlider"
                min="0"
                max="100"
                value={isNaN(progressPercent) ? 0 : progressPercent}
                step="0.2"
                aria-label="Audio scrubber"
                onMouseDown={() => {
                  isSeekingRef.current = true;
                }}
                onTouchStart={() => {
                  isSeekingRef.current = true;
                }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (duration > 0) {
                    const targetSec = (val / 100) * duration;
                    onSeekTo(targetSec);
                  }
                }}
              />
              <div
                className="bp-slider-fill"
                id="bpSliderFill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="bp-time bp-time-duration" id="bpTotalDuration">
              {duration > 0 ? formatTime(duration) : activeLecture.duration || '0:00'}
            </span>
          </div>
        </div>

        {/* Right: Speed, Mode & Dismiss Actions */}
        <div className="bp-right-actions">
          {/* Speed Selector */}
          <button
            className="bp-tool-btn bp-speed-btn"
            id="bpSpeedBtn"
            title="Change Playback Speed"
            onClick={onCyclePlaybackRate}
          >
            <span id="bpSpeedLabel">{playbackRate.toFixed(1)}x</span>
            <span className="bp-speed-chevron">∨</span>
          </button>

          {/* Mark as Heard */}
          <button
            className={`bp-tool-btn ${isHeard ? 'active' : ''}`}
            id="bpHeardBtn"
            title={isHeard ? 'Heard (Click to unmark)' : 'Mark as Heard'}
            onClick={() => onToggleHeard(ytId)}
          >
            <span id="bpHeardIcon">✓</span>
          </button>

          {/* Favorite Star */}
          <button
            className={`bp-tool-btn ${isStarred ? 'active' : ''}`}
            id="bpStarBtn"
            title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => onToggleStar(ytId)}
          >
            <span id="bpStarIcon">★</span>
          </button>

          {/* Saffron Video Toggle Pill */}
          <button
            className="bp-video-toggle-pill"
            id="bpToggleVideoBtn"
            title="Toggle Video Extension"
            onClick={onToggleVideoExtension}
          >
            <span className="bp-toggle-icon">📹</span>
            <span id="bpToggleVideoLabel">{isVideoExpanded ? 'Hide Video' : 'Show Video'}</span>
            <span className="bp-toggle-chevron" id="bpToggleVideoChevron">
              {isVideoExpanded ? '∨' : '∧'}
            </span>
          </button>

          {/* External Direct Link */}
          <a
            href={activeLecture.url || `https://www.youtube.com/watch?v=${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bp-tool-btn bp-yt-link"
            id="bpDirectYtLink"
            title="Watch on YouTube"
          >
            ↗
          </a>

          {/* Close Player */}
          <button
            className="bp-tool-btn bp-close-btn"
            id="bpCloseBtn"
            title="Close Player"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
};
