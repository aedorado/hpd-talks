'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lecture, ShortItem } from '@/types/lecture';
import { ContentMode } from '@/types/player';

// Data imports
import lecturesData from '@/../data/lectures.json';
import shortsData from '@/../data/shorts.json';

// Hooks
import { useTheme } from '@/hooks/useTheme';
import { useSadhana } from '@/hooks/useSadhana';
import { useFilters } from '@/hooks/useFilters';
import { usePlayer } from '@/hooks/usePlayer';

// Components
import { Header } from '@/components/layout/Header';
import { ModeNav } from '@/components/layout/ModeNav';
import { Toast } from '@/components/layout/Toast';
import { Footer } from '@/components/layout/Footer';
import { ContinueHearing } from '@/components/lectures/ContinueHearing';
import { FilterBar } from '@/components/lectures/FilterBar';
import { LectureList } from '@/components/lectures/LectureList';
import { DockedBottomPlayer } from '@/components/player/DockedBottomPlayer';
import { ShortsHero } from '@/components/shorts/ShortsHero';
import { ShortsGrid } from '@/components/shorts/ShortsGrid';
import { ShortsPlayerModal } from '@/components/shorts/ShortsPlayerModal';
import { ResourcesModal } from '@/components/modals/ResourcesModal';
import { BackupModal } from '@/components/modals/BackupModal';

export default function Home() {
  const allLectures = useMemo(() => lecturesData as Lecture[], []);
  const allShorts = useMemo(() => shortsData as ShortItem[], []);

  // Content mode: Kathas vs Shorts
  const [contentMode, setContentMode] = useState<ContentMode>('kathas');

  // Modals state
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [activeShortModal, setActiveShortModal] = useState<ShortItem | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  // Sadhana tracking hook
  const {
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
    mounted: sadhanaMounted,
  } = useSadhana();

  // Theme hook
  const { theme, toggleTheme } = useTheme();

  // Player hook
  const {
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
    togglePlayPause,
    seekTo,
    stepSeek,
    cyclePlaybackRate,
    toggleVideoExtension,
    setIsVideoExpanded,
    close: closePlayer,
  } = usePlayer({
    onProgress: (ytId, curr, dur) => {
      saveProgress(ytId, curr, dur);
    },
    onLectureEnd: (ytId) => {
      if (!heardSet.has(ytId)) {
        toggleHeard(ytId);
        showToast('Lecture completed! Marked as Heard ✓');
      }
    },
    onPlay: (ytId) => {
      setLastPlayed(ytId);
    },
  });

  // Filter & Search hook
  const {
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
  } = useFilters({
    lectures: allLectures,
    heardSet,
    starredSet,
  });

  // Last played lecture object
  const lastPlayedLecture = useMemo(() => {
    if (!lastPlayedYtId) return null;
    return allLectures.find((l) => (l.yt_id || l.id) === lastPlayedYtId) || null;
  }, [allLectures, lastPlayedYtId]);

  // Playlist navigation in bottom player
  const currentLectureIndex = useMemo(() => {
    if (!activeLecture) return -1;
    const activeYtId = activeLecture.yt_id || activeLecture.id;
    return filteredLectures.findIndex((l) => (l.yt_id || l.id) === activeYtId);
  }, [activeLecture, filteredLectures]);

  const hasPrevLecture = currentLectureIndex > 0;
  const hasNextLecture = currentLectureIndex >= 0 && currentLectureIndex < filteredLectures.length - 1;

  const playPrevLecture = useCallback(() => {
    if (hasPrevLecture) {
      play(filteredLectures[currentLectureIndex - 1], { showVideo: isVideoExpanded });
    }
  }, [hasPrevLecture, currentLectureIndex, filteredLectures, play, isVideoExpanded]);

  const playNextLecture = useCallback(() => {
    if (hasNextLecture) {
      play(filteredLectures[currentLectureIndex + 1], { showVideo: isVideoExpanded });
    }
  }, [hasNextLecture, currentLectureIndex, filteredLectures, play, isVideoExpanded]);

  // Surprise Me: Play random talk
  const handleSurpriseMe = useCallback(() => {
    if (allLectures.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allLectures.length);
    const randomTalk = allLectures[randomIndex];
    play(randomTalk, { showVideo: true });
    showToast(`Surprise discourse: ${randomTalk.title.substring(0, 36)}...`);
  }, [allLectures, play, showToast]);

  // Deep linking URL hash handler (#v= or #s=)
  useEffect(() => {
    if (!sadhanaMounted || typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash && hash.startsWith('#v=')) {
      const targetId = hash.replace('#v=', '').trim();
      const targetLecture = allLectures.find((l) => (l.yt_id || l.id) === targetId);
      if (targetLecture) {
        setTimeout(() => play(targetLecture, { showVideo: true }), 250);
      }
    } else if (hash && hash.startsWith('#s=')) {
      const targetShortId = hash.replace('#s=', '').trim();
      const targetShort = allShorts.find((s) => (s.yt_id || s.id) === targetShortId);
      if (targetShort) {
        setContentMode('shorts');
        setTimeout(() => setActiveShortModal(targetShort), 250);
      }
    }
  }, [sadhanaMounted, allLectures, allShorts, play]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '');

      if (e.key === '/' && !isInput && !activeShortModal && !isResourcesOpen && !isBackupOpen) {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape') {
        if (isResourcesOpen) setIsResourcesOpen(false);
        if (isBackupOpen) setIsBackupOpen(false);
        if (activeShortModal) setActiveShortModal(null);
        if (isVideoExpanded) setIsVideoExpanded(false);
      } else if (!isInput && activeLecture && !activeShortModal && !isResourcesOpen && !isBackupOpen) {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          togglePlayPause();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          stepSeek(-10);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          stepSeek(10);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    activeLecture,
    activeShortModal,
    isResourcesOpen,
    isBackupOpen,
    isVideoExpanded,
    togglePlayPause,
    stepSeek,
    setIsVideoExpanded,
  ]);

  // Body padding adjustment when bottom player is active
  useEffect(() => {
    if (activeLecture) {
      document.body.classList.add('has-bottom-player');
    } else {
      document.body.classList.remove('has-bottom-player');
    }
  }, [activeLecture]);

  // Handle export & import
  const handleExportBackup = useCallback(() => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hpd-katha-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Progress backup downloaded successfully!');
  }, [exportData, showToast]);

  const handleImportFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const success = importData(text);
          if (success) {
            showToast('Progress restored successfully! Haribol 🪷');
            setIsBackupOpen(false);
          } else {
            alert('Invalid backup file. Please select a valid JSON backup file.');
          }
        }
      };
      reader.readAsText(file);
    },
    [importData, showToast]
  );

  return (
    <>
      <Header
        heardCount={heardSet.size}
        totalLectures={allLectures.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenResources={() => setIsResourcesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onSurpriseMe={handleSurpriseMe}
      />

      <ModeNav
        activeMode={contentMode}
        kathasCount={allLectures.length}
        shortsCount={allShorts.length}
        onModeChange={(mode) => setContentMode(mode)}
      />

      <main className="main-container">
        {contentMode === 'kathas' ? (
          <div id="kathasViewSection">
            <ContinueHearing
              lecture={lastPlayedLecture}
              progress={lastPlayedYtId ? progressMap[lastPlayedYtId] : undefined}
              isHeard={lastPlayedYtId ? heardSet.has(lastPlayedYtId) : false}
              isStarred={lastPlayedYtId ? starredSet.has(lastPlayedYtId) : false}
              onResume={(l, startTime) => play(l, { showVideo: true, startTime })}
              onStreamAudio={(l, startTime) => play(l, { showVideo: false, startTime })}
              onToggleHeard={(id) => {
                const nowHeard = toggleHeard(id);
                showToast(nowHeard ? 'Marked as Heard! Haribol 🪷' : 'Marked as Unheard');
              }}
              onToggleStar={(id) => {
                const nowStarred = toggleStar(id);
                showToast(nowStarred ? 'Added to favorites ★' : 'Removed from favorites');
              }}
            />

            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
              statusCounts={{
                all: allLectures.length,
                unheard: Math.max(0, allLectures.length - heardSet.size),
                heard: heardSet.size,
                starred: starredSet.size,
              }}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              categories={categories}
              activeSubcategory={activeSubcategory}
              onSubcategoryChange={setActiveSubcategory}
              subcategories={subcategories}
              activeSpeaker={activeSpeaker}
              onSpeakerChange={setActiveSpeaker}
              speakers={speakers}
              activeChannel={activeChannel}
              onChannelChange={setActiveChannel}
              channels={channels}
              activeSort={activeSort}
              onSortChange={setActiveSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFilteredCount={filteredLectures.length}
              totalCount={allLectures.length}
              onResetFilters={resetAllFilters}
            />

            <LectureList
              lectures={filteredLectures}
              heardSet={heardSet}
              starredSet={starredSet}
              progressMap={progressMap}
              searchQuery={searchQuery}
              viewMode={viewMode}
              onPlay={(lecture, showVideo) => {
                play(lecture, { showVideo });
              }}
              onToggleHeard={(id) => {
                const nowHeard = toggleHeard(id);
                showToast(nowHeard ? 'Marked as Heard! Haribol 🪷' : 'Marked as Unheard');
              }}
              onToggleStar={(id) => {
                const nowStarred = toggleStar(id);
                showToast(nowStarred ? 'Added to favorites ★' : 'Removed from favorites');
              }}
              onShowToast={showToast}
              onResetFilters={resetAllFilters}
            />
          </div>
        ) : (
          <div id="shortsViewSection">
            <ShortsHero
              totalShorts={allShorts.length}
              watchedCount={shortsWatchedSet.size}
            />

            <ShortsGrid
              shorts={allShorts}
              watchedSet={shortsWatchedSet}
              onOpenPlayer={(short) => setActiveShortModal(short)}
              onToggleWatched={(id) => {
                const nowWatched = toggleShortWatched(id);
                showToast(nowWatched ? 'Short marked as Watched ✓' : 'Short unmarked');
              }}
            />
          </div>
        )}
      </main>

      {/* Minimalist Site Footer */}
      <Footer
        totalLectures={allLectures.length}
        totalShorts={allShorts.length}
        onOpenResources={() => setIsResourcesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Docked Bottom Player & Expandable Video Dock */}
      <DockedBottomPlayer
        activeLecture={activeLecture}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        isVideoExpanded={isVideoExpanded}
        initialStartTime={initialStartTime}
        isHeard={activeLecture ? heardSet.has(activeLecture.yt_id || activeLecture.id) : false}
        isStarred={activeLecture ? starredSet.has(activeLecture.yt_id || activeLecture.id) : false}
        iframeRef={iframeRef}
        isSeekingRef={isSeekingRef}
        onTogglePlayPause={togglePlayPause}
        onStepSeek={stepSeek}
        onSeekTo={seekTo}
        onCyclePlaybackRate={cyclePlaybackRate}
        onToggleVideoExtension={toggleVideoExtension}
        onSetVideoExpanded={setIsVideoExpanded}
        onToggleHeard={(id) => {
          const nowHeard = toggleHeard(id);
          showToast(nowHeard ? 'Marked as Heard! Haribol 🪷' : 'Marked as Unheard');
        }}
        onToggleStar={(id) => {
          const nowStarred = toggleStar(id);
          showToast(nowStarred ? 'Added to favorites ★' : 'Removed from favorites');
        }}
        onPrev={playPrevLecture}
        onNext={playNextLecture}
        hasPrev={hasPrevLecture}
        hasNext={hasNextLecture}
        onClose={closePlayer}
      />

      {/* Upadesh Shorts Player Modal */}
      <ShortsPlayerModal
        short={activeShortModal}
        isWatched={activeShortModal ? shortsWatchedSet.has(activeShortModal.yt_id || activeShortModal.id) : false}
        onClose={() => setActiveShortModal(null)}
        onToggleWatched={(id) => {
          const nowWatched = toggleShortWatched(id);
          showToast(nowWatched ? 'Short marked as Watched ✓' : 'Short unmarked');
        }}
        onPrev={() => {
          if (!activeShortModal) return;
          const idx = allShorts.findIndex((s) => s.id === activeShortModal.id);
          if (idx > 0) setActiveShortModal(allShorts[idx - 1]);
        }}
        onNext={() => {
          if (!activeShortModal) return;
          const idx = allShorts.findIndex((s) => s.id === activeShortModal.id);
          if (idx < allShorts.length - 1) setActiveShortModal(allShorts[idx + 1]);
        }}
        hasPrev={activeShortModal ? allShorts.findIndex((s) => s.id === activeShortModal.id) > 0 : false}
        hasNext={
          activeShortModal
            ? allShorts.findIndex((s) => s.id === activeShortModal.id) < allShorts.length - 1
            : false
        }
      />

      {/* Companion PDF Resources Modal */}
      <ResourcesModal
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
        onFilterUpadeshamrita={() => {
          setContentMode('kathas');
          setActiveCategory('Upadeshamrta (Seminar)');
          setActiveSubcategory('all');
        }}
      />

      {/* Backup & Local Storage Management Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        heardCount={heardSet.size}
        totalLectures={allLectures.length}
        starredCount={starredSet.size}
        onExport={handleExportBackup}
        onImportFile={handleImportFile}
        onResetAll={() => {
          resetAllProgress();
          showToast('All progress reset');
        }}
      />

      <Toast message={toastMessage} />
    </>
  );
}
