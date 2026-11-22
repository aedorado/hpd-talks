'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Lecture } from '@/types/lecture';
import { StatusFilter, SortOption, ViewMode } from '@/types/player';
import { STORAGE_KEYS } from '@/lib/constants';

interface UseFiltersProps {
  lectures: Lecture[];
  heardSet: Set<string>;
  starredSet: Set<string>;
}

export function useFilters({ lectures, heardSet, starredSet }: UseFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [activeSpeaker, setActiveSpeaker] = useState('all');
  const [activeChannel, setActiveChannel] = useState('all');
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [viewMode, setViewModeState] = useState<ViewMode>('list');

  // Load viewMode preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode | null;
      if (saved === 'list' || saved === 'grid') {
        setViewModeState(saved);
      }
    } catch (e) {}
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    } catch (e) {}
  }, []);

  // Compute unique sorted filter options
  const categories = useMemo(() => {
    const set = new Set<string>();
    lectures.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [lectures]);

  const subcategories = useMemo(() => {
    const set = new Set<string>();
    lectures.forEach((l) => {
      if (activeCategory === 'all' || l.category === activeCategory) {
        if (l.subcategory) set.add(l.subcategory);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [lectures, activeCategory]);

  const speakers = useMemo(() => {
    const set = new Set<string>();
    lectures.forEach((l) => {
      if (l.speaker) set.add(l.speaker);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [lectures]);

  const channels = useMemo(() => {
    const set = new Set<string>();
    lectures.forEach((l) => {
      if (l.channel) set.add(l.channel);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [lectures]);

  // Main filtering & sorting pipeline
  const filteredLectures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = lectures.filter((l) => {
      const ytId = l.yt_id || l.id;

      // Status filter
      if (activeStatus === 'heard' && !heardSet.has(ytId)) return false;
      if (activeStatus === 'unheard' && heardSet.has(ytId)) return false;
      if (activeStatus === 'starred' && !starredSet.has(ytId)) return false;

      // Category & Subcategory
      if (activeCategory !== 'all' && l.category !== activeCategory) return false;
      if (activeSubcategory !== 'all' && l.subcategory !== activeSubcategory) return false;

      // Speaker & Channel
      if (activeSpeaker !== 'all' && l.speaker !== activeSpeaker) return false;
      if (activeChannel !== 'all' && l.channel !== activeChannel) return false;

      // Search query filter
      if (q) {
        const titleMatch = l.title.toLowerCase().includes(q);
        const catMatch = l.category?.toLowerCase().includes(q);
        const subcatMatch = l.subcategory?.toLowerCase().includes(q);
        const speakerMatch = l.speaker?.toLowerCase().includes(q);
        const channelMatch = l.channel?.toLowerCase().includes(q);
        const catalogMatch = l.catalog_id?.toLowerCase().includes(q);
        const dateMatch = l.upload_date?.toLowerCase().includes(q);

        if (!titleMatch && !catMatch && !subcatMatch && !speakerMatch && !channelMatch && !catalogMatch && !dateMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (activeSort === 'reverse') {
      result.reverse();
    } else if (activeSort === 'titleAsc') {
      result.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    } else if (activeSort === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: 'base' }));
    }

    return result;
  }, [
    lectures,
    searchQuery,
    activeStatus,
    activeCategory,
    activeSubcategory,
    activeSpeaker,
    activeChannel,
    activeSort,
    heardSet,
    starredSet,
  ]);

  const resetAllFilters = useCallback(() => {
    setSearchQuery('');
    setActiveStatus('all');
    setActiveCategory('all');
    setActiveSubcategory('all');
    setActiveSpeaker('all');
    setActiveChannel('all');
    setActiveSort('default');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    activeStatus,
    setActiveStatus,
    activeCategory,
    setActiveCategory,
    activeSubcategory,
    setActiveSubcategory,
    activeSpeaker,
    setActiveSpeaker,
    activeChannel,
    setActiveChannel,
    activeSort,
    setActiveSort,
    viewMode,
    setViewMode,
    categories,
    subcategories,
    speakers,
    channels,
    filteredLectures,
    resetAllFilters,
  };
}
