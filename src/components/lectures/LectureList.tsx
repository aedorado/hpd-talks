'use client';

import React, { useState, useEffect } from 'react';
import { Lecture } from '@/types/lecture';
import { PlaybackProgress, ViewMode } from '@/types/player';
import { LectureCard } from './LectureCard';
import { BATCH_SIZE } from '@/lib/constants';

interface LectureListProps {
  lectures: Lecture[];
  heardSet: Set<string>;
  starredSet: Set<string>;
  progressMap: Record<string, PlaybackProgress>;
  searchQuery: string;
  viewMode: ViewMode;
  onPlay: (lecture: Lecture, showVideo: boolean) => void;
  onToggleHeard: (ytId: string) => void;
  onToggleStar: (ytId: string) => void;
  onShowToast: (msg: string) => void;
  onResetFilters: () => void;
}

export const LectureList: React.FC<LectureListProps> = ({
  lectures,
  heardSet,
  starredSet,
  progressMap,
  searchQuery,
  viewMode,
  onPlay,
  onToggleHeard,
  onToggleStar,
  onShowToast,
  onResetFilters,
}) => {
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);

  // Reset pagination when lectures filter changes
  useEffect(() => {
    setDisplayedCount(BATCH_SIZE);
  }, [lectures]);

  if (lectures.length === 0) {
    return (
      <div className="empty-state" id="emptyState" style={{ display: 'block' }}>
        <div className="empty-icon">🪷</div>
        <h3 className="empty-title">No discourses match your filters</h3>
        <p className="empty-desc">
          Try clearing your search query, selecting another category, or viewing all lectures.
        </p>
        <button className="btn btn-primary" id="emptyResetBtn" onClick={onResetFilters}>
          Reset All Filters
        </button>
      </div>
    );
  }

  const visibleLectures = lectures.slice(0, displayedCount);
  const remainingCount = lectures.length - displayedCount;

  return (
    <>
      <div
        className={`lectures-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}
        id="lecturesContainer"
      >
        {visibleLectures.map((lecture) => {
          const ytId = lecture.yt_id || lecture.id;
          return (
            <LectureCard
              key={ytId}
              lecture={lecture}
              isHeard={heardSet.has(ytId)}
              isStarred={starredSet.has(ytId)}
              progress={progressMap[ytId]}
              searchQuery={searchQuery}
              onPlay={onPlay}
              onToggleHeard={onToggleHeard}
              onToggleStar={onToggleStar}
              onShowToast={onShowToast}
            />
          );
        })}
      </div>

      {remainingCount > 0 && (
        <div className="pagination-bar" id="paginationBar" style={{ display: 'flex' }}>
          <button
            className="btn btn-secondary btn-load-more"
            id="loadMoreBtn"
            onClick={() => setDisplayedCount((prev) => prev + BATCH_SIZE)}
          >
            Load More Talks (+{Math.min(BATCH_SIZE, remainingCount)})
          </button>
          <span className="pagination-info" id="paginationInfo">
            <span id="remainingCount">{remainingCount}</span> more available
          </span>
          <button
            className="btn btn-ghost btn-load-all"
            id="loadAllBtn"
            onClick={() => setDisplayedCount(lectures.length)}
          >
            Load All ({lectures.length})
          </button>
        </div>
      )}
    </>
  );
};
