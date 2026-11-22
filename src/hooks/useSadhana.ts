'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { PlaybackProgress } from '@/types/player';

export function useSadhana() {
  const [heardSet, setHeardSet] = useState<Set<string>>(new Set());
  const [starredSet, setStarredSet] = useState<Set<string>>(new Set());
  const [shortsWatchedSet, setShortsWatchedSet] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, PlaybackProgress>>({});
  const [lastPlayedYtId, setLastPlayedYtId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const heardRaw = localStorage.getItem(STORAGE_KEYS.HEARD);
      if (heardRaw) {
        const parsed = JSON.parse(heardRaw);
        if (Array.isArray(parsed)) setHeardSet(new Set(parsed));
      }

      const starredRaw = localStorage.getItem(STORAGE_KEYS.STARRED);
      if (starredRaw) {
        const parsed = JSON.parse(starredRaw);
        if (Array.isArray(parsed)) setStarredSet(new Set(parsed));
      }

      const shortsRaw = localStorage.getItem(STORAGE_KEYS.SHORTS_WATCHED);
      if (shortsRaw) {
        const parsed = JSON.parse(shortsRaw);
        if (Array.isArray(parsed)) setShortsWatchedSet(new Set(parsed));
      }

      const progRaw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (progRaw) {
        const parsed = JSON.parse(progRaw);
        if (parsed && typeof parsed === 'object') setProgressMap(parsed);
      }

      const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
      if (lastPlayed) setLastPlayedYtId(lastPlayed);
    } catch (e) {
      console.error('Error loading sadhana data from localStorage:', e);
    }
    setMounted(true);
  }, []);

  const toggleHeard = useCallback((ytId: string): boolean => {
    if (!ytId) return false;
    let isNowHeard = false;
    setHeardSet((prev) => {
      const next = new Set(prev);
      if (next.has(ytId)) {
        next.delete(ytId);
        isNowHeard = false;
      } else {
        next.add(ytId);
        isNowHeard = true;
      }
      try {
        localStorage.setItem(STORAGE_KEYS.HEARD, JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
    return isNowHeard;
  }, []);

  const toggleStar = useCallback((ytId: string): boolean => {
    if (!ytId) return false;
    let isNowStarred = false;
    setStarredSet((prev) => {
      const next = new Set(prev);
      if (next.has(ytId)) {
        next.delete(ytId);
        isNowStarred = false;
      } else {
        next.add(ytId);
        isNowStarred = true;
      }
      try {
        localStorage.setItem(STORAGE_KEYS.STARRED, JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
    return isNowStarred;
  }, []);

  const toggleShortWatched = useCallback((ytId: string): boolean => {
    if (!ytId) return false;
    let isNowWatched = false;
    setShortsWatchedSet((prev) => {
      const next = new Set(prev);
      if (next.has(ytId)) {
        next.delete(ytId);
        isNowWatched = false;
      } else {
        next.add(ytId);
        isNowWatched = true;
      }
      try {
        localStorage.setItem(STORAGE_KEYS.SHORTS_WATCHED, JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
    return isNowWatched;
  }, []);

  const saveProgress = useCallback((ytId: string, currentTime: number, duration: number) => {
    if (!ytId || isNaN(currentTime) || currentTime < 5) return;
    setProgressMap((prev) => {
      const next = {
        ...prev,
        [ytId]: {
          currentTime: Math.floor(currentTime),
          duration: Math.floor(duration),
          updatedAt: Date.now(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const setLastPlayed = useCallback((ytId: string) => {
    if (!ytId) return;
    setLastPlayedYtId(ytId);
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, ytId);
    } catch (e) {}
  }, []);

  const resetAllProgress = useCallback(() => {
    setHeardSet(new Set());
    setStarredSet(new Set());
    setShortsWatchedSet(new Set());
    setProgressMap({});
    setLastPlayedYtId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.HEARD);
      localStorage.removeItem(STORAGE_KEYS.STARRED);
      localStorage.removeItem(STORAGE_KEYS.SHORTS_WATCHED);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.LAST_PLAYED);
    } catch (e) {}
  }, []);

  const exportData = useCallback((): string => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      heardLectures: Array.from(heardSet),
      starredLectures: Array.from(starredSet),
      watchedShorts: Array.from(shortsWatchedSet),
      playbackProgress: progressMap,
      lastPlayed: lastPlayedYtId,
    };
    return JSON.stringify(payload, null, 2);
  }, [heardSet, starredSet, shortsWatchedSet, progressMap, lastPlayedYtId]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.heardLectures)) {
        const nextHeard = new Set<string>(data.heardLectures);
        setHeardSet(nextHeard);
        localStorage.setItem(STORAGE_KEYS.HEARD, JSON.stringify(Array.from(nextHeard)));
      }
      if (Array.isArray(data.starredLectures)) {
        const nextStarred = new Set<string>(data.starredLectures);
        setStarredSet(nextStarred);
        localStorage.setItem(STORAGE_KEYS.STARRED, JSON.stringify(Array.from(nextStarred)));
      }
      if (Array.isArray(data.watchedShorts)) {
        const nextShorts = new Set<string>(data.watchedShorts);
        setShortsWatchedSet(nextShorts);
        localStorage.setItem(STORAGE_KEYS.SHORTS_WATCHED, JSON.stringify(Array.from(nextShorts)));
      }
      if (data.playbackProgress && typeof data.playbackProgress === 'object') {
        setProgressMap(data.playbackProgress);
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.playbackProgress));
      }
      if (data.lastPlayed) {
        setLastPlayedYtId(data.lastPlayed);
        localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, data.lastPlayed);
      }
      return true;
    } catch (e) {
      console.error('Failed to import user sadhana data:', e);
      return false;
    }
  }, []);

  return {
    heardSet,
    starredSet,
    shortsWatchedSet,
    progressMap,
    lastPlayedYtId,
    toggleHeard,
    toggleStar,
    toggleShortWatched,
    saveProgress,
    setLastPlayed,
    resetAllProgress,
    exportData,
    importData,
    mounted,
  };
}
