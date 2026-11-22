'use client';

import React from 'react';

interface VideoDockProps {
  ytId: string | null;
  startTime?: number;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onSwitchToAudio: () => void;
}

export const VideoDock: React.FC<VideoDockProps> = ({ ytId, startTime = 0, iframeRef, onSwitchToAudio }) => {
  const startParam = startTime > 0 ? `&start=${Math.floor(startTime)}` : '';

  return (
    <div className="bp-video-dock" id="bpVideoDock">
      <div className="bp-video-header">
        <div className="bp-video-header-left">
          <span className="bp-video-badge">📹 Video Mode</span>
        </div>
        <button
          className="bp-switch-audio-btn"
          id="bpSwitchToAudioBtn"
          type="button"
          title="Switch to Audio Only"
          onClick={onSwitchToAudio}
        >
          <span>Switch to Audio Only</span>
          <span className="bp-chevron">∨</span>
        </button>
      </div>

      <div className="bp-video-frame-container">
        {ytId ? (
          <iframe
            ref={iframeRef as any}
            id="bpPlayerIframe"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0${startParam}`}
            title="Katha Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null}
      </div>
    </div>
  );
};
