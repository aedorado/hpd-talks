'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Lecture } from '@/types/lecture';
import { parseDurationToSeconds } from '@/lib/formatters';

interface UsePlayerProps {
  onProgress?: (ytId: string, currentTime: number, duration: number) => void;
  onLectureEnd?: (ytId: string) => void;
  onPlay?: (ytId: string) => void;
}

export function usePlayer({ onProgress, onLectureEnd, onPlay }: UsePlayerProps = {}) {
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isVideoExpanded, setIsVideoExpanded] = useState(true);
  const [initialStartTime, setInitialStartTime] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isSeekingRef = useRef(false);

  // Send command to YouTube iframe via postMessage
  const sendIframeCommand = useCallback((command: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: args,
          }),
          '*'
        );
      } catch (e) {}
    }
  }, []);

  // Listen to postMessage from YouTube iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }

      if (data && data.event === 'infoDelivery' && data.info) {
        if (data.info.currentTime !== undefined) {
          const curr = data.info.currentTime;
          const dur = data.info.duration || duration;

          if (typeof curr === 'number' && curr >= 0) {
            if (!isSeekingRef.current) {
              setCurrentTime(curr);
            }
            if (dur && dur > 0) {
              setDuration(dur);
            }
            if (activeLecture) {
              onProgress?.(activeLecture.yt_id || activeLecture.id, curr, dur);
            }
          }

          if (data.info.playerState === 1) {
            // Playing
            setIsPlaying(true);
          } else if (data.info.playerState === 2) {
            // Paused
            setIsPlaying(false);
          } else if (data.info.playerState === 0) {
            // Ended
            setIsPlaying(false);
            if (activeLecture) {
              onLectureEnd?.(activeLecture.yt_id || activeLecture.id);
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeLecture, duration, onProgress, onLectureEnd]);

  // Request periodic time updates from iframe
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      sendIframeCommand('getCurrentTime');
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, sendIframeCommand]);

  const play = useCallback(
    (lecture: Lecture, { showVideo = true, startTime = 0 }: { showVideo?: boolean; startTime?: number } = {}) => {
      const ytId = lecture.yt_id || lecture.id;
      setActiveLecture(lecture);
      setIsVideoExpanded(showVideo);
      setIsPlaying(true);
      setInitialStartTime(startTime);

      const parsedDur = parseDurationToSeconds(lecture.duration);
      setDuration(parsedDur);
      setCurrentTime(startTime);

      onPlay?.(ytId);

      // Update URL hash
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#v=${ytId}`);
      }
    },
    [onPlay]
  );

  const pause = useCallback(() => {
    sendIframeCommand('pauseVideo');
    setIsPlaying(false);
  }, [sendIframeCommand]);

  const resume = useCallback(() => {
    sendIframeCommand('playVideo');
    setIsPlaying(true);
  }, [sendIframeCommand]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const seekTo = useCallback(
    (seconds: number) => {
      isSeekingRef.current = false;
      setCurrentTime(seconds);
      sendIframeCommand('seekTo', [seconds, true]);
    },
    [sendIframeCommand]
  );

  const stepSeek = useCallback(
    (deltaSeconds: number) => {
      const nextTime = Math.max(0, Math.min(currentTime + deltaSeconds, duration || Infinity));
      seekTo(nextTime);
    },
    [currentTime, duration, seekTo]
  );

  const cyclePlaybackRate = useCallback(() => {
    const rates = [1.0, 1.25, 1.5, 1.75, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    sendIframeCommand('setPlaybackRate', [nextRate]);
  }, [playbackRate, sendIframeCommand]);

  const toggleVideoExtension = useCallback(() => {
    setIsVideoExpanded((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    sendIframeCommand('pauseVideo');
    setActiveLecture(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [sendIframeCommand]);

  return {
    activeLecture,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isVideoExpanded,
    initialStartTime,
    iframeRef,
    isSeekingRef,
    play,
    pause,
    resume,
    togglePlayPause,
    seekTo,
    stepSeek,
    cyclePlaybackRate,
    toggleVideoExtension,
    setIsVideoExpanded,
    close,
  };
}
