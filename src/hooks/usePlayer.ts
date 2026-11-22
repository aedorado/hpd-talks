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

  // Synchronous refs to avoid stale closure values during seeks and callbacks
  const activeLectureRef = useRef<Lecture | null>(activeLecture);
  activeLectureRef.current = activeLecture;

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const onLectureEndRef = useRef(onLectureEnd);
  onLectureEndRef.current = onLectureEnd;

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

      if (data && (data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
        // 1. Current Time delivery
        if (data.info.currentTime !== undefined && typeof data.info.currentTime === 'number') {
          const curr = data.info.currentTime;
          if (curr >= 0) {
            currentTimeRef.current = curr;
            if (!isSeekingRef.current) {
              setCurrentTime(curr);
            }
            const currentDur = durationRef.current;
            if (activeLectureRef.current) {
              onProgressRef.current?.(
                activeLectureRef.current.yt_id || activeLectureRef.current.id,
                curr,
                currentDur
              );
            }
          }
        }

        // 2. Duration delivery
        if (data.info.duration !== undefined && typeof data.info.duration === 'number' && data.info.duration > 0) {
          durationRef.current = data.info.duration;
          setDuration(data.info.duration);
        }

        // 3. Player State delivery
        if (data.info.playerState !== undefined) {
          if (data.info.playerState === 1) {
            // Playing
            setIsPlaying(true);
          } else if (data.info.playerState === 2) {
            // Paused
            setIsPlaying(false);
          } else if (data.info.playerState === 0) {
            // Ended
            setIsPlaying(false);
            if (activeLectureRef.current) {
              onLectureEndRef.current?.(activeLectureRef.current.yt_id || activeLectureRef.current.id);
            }
          }
        }
      } else if (data && data.event === 'onStateChange') {
        const state = typeof data.info === 'number' ? data.info : data.info?.playerState;
        if (state === 1) {
          setIsPlaying(true);
        } else if (state === 2) {
          setIsPlaying(false);
        } else if (state === 0) {
          setIsPlaying(false);
          if (activeLectureRef.current) {
            onLectureEndRef.current?.(activeLectureRef.current.yt_id || activeLectureRef.current.id);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Continuous handshake & time poll from iframe while active
  useEffect(() => {
    if (!activeLecture) return;

    const poll = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage('{"event":"listening"}', '*');
      } catch (e) {}
      sendIframeCommand('getCurrentTime');
      sendIframeCommand('getDuration');
    };

    poll();
    const timer = setInterval(poll, 1000);
    return () => clearInterval(timer);
  }, [activeLecture, sendIframeCommand]);

  const play = useCallback(
    (lecture: Lecture, { showVideo = true, startTime = 0 }: { showVideo?: boolean; startTime?: number } = {}) => {
      const ytId = lecture.yt_id || lecture.id;
      setActiveLecture(lecture);
      activeLectureRef.current = lecture;
      setIsVideoExpanded(showVideo);
      setIsPlaying(true);
      setInitialStartTime(startTime);

      const parsedDur = parseDurationToSeconds(lecture.duration);
      setDuration(parsedDur);
      durationRef.current = parsedDur;
      setCurrentTime(startTime);
      currentTimeRef.current = startTime;

      onPlay?.(ytId);

      // Attempt immediate handshake
      try {
        iframeRef.current?.contentWindow?.postMessage('{"event":"listening"}', '*');
      } catch (e) {}

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
      currentTimeRef.current = seconds;
      setCurrentTime(seconds);
      sendIframeCommand('seekTo', [seconds, true]);
      if (activeLectureRef.current) {
        onProgressRef.current?.(
          activeLectureRef.current.yt_id || activeLectureRef.current.id,
          seconds,
          durationRef.current
        );
      }
    },
    [sendIframeCommand]
  );

  const stepSeek = useCallback(
    (deltaSeconds: number) => {
      const curr = currentTimeRef.current;
      const dur = durationRef.current;
      const nextTime = Math.max(0, Math.min(curr + deltaSeconds, dur > 0 ? dur : Infinity));
      seekTo(nextTime);
    },
    [seekTo]
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
    activeLectureRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDuration(0);
    durationRef.current = 0;
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
