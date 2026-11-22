'use client';

import React, { useMemo } from 'react';

interface VideoDockProps {
  ytId: string | null;
  startTime?: number;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onSwitchToAudio: () => void;
}

export const VideoDock: React.FC<VideoDockProps> = ({ ytId, startTime = 0, iframeRef, onSwitchToAudio }) => {
  // Reconstruct iframe src when ytId changes, including initial start time
  const iframeSrc = useMemo(() => {
    if (!ytId) return '';
    const startParam = startTime > 0 ? `&start=${Math.floor(startTime)}` : '';
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0${startParam}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytId]);

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
            src={iframeSrc}
            title="Katha Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              try {
                iframeRef.current?.contentWindow?.postMessage('{"event":"listening"}', '*');
              } catch (e) {}
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
