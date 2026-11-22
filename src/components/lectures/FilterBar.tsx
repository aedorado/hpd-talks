'use client';

import React from 'react';
import { StatusFilter, SortOption, ViewMode } from '@/types/player';
import { FILTER_CHIPS } from '@/lib/constants';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  statusCounts: {
    all: number;
    unheard: number;
    heard: number;
    starred: number;
  };
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  activeSubcategory: string;
  onSubcategoryChange: (subcat: string) => void;
  subcategories: string[];
  activeSpeaker: string;
  onSpeakerChange: (speaker: string) => void;
  speakers: string[];
  activeChannel: string;
  onChannelChange: (channel: string) => void;
  channels: string[];
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  statusCounts,
  activeCategory,
  onCategoryChange,
  categories,
  activeSubcategory,
  onSubcategoryChange,
  subcategories,
  activeSpeaker,
  onSpeakerChange,
  speakers,
  activeChannel,
  onChannelChange,
  channels,
  activeSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalCount,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    activeStatus !== 'all' ||
    activeCategory !== 'all' ||
    activeSubcategory !== 'all' ||
    activeSpeaker !== 'all' ||
    activeChannel !== 'all' ||
    activeSort !== 'reverse';

  const showSubcategories = subcategories.length > 0 && activeCategory !== 'all';
  const showUpadeshamritaBanner = activeCategory === 'Upadeshamrta (Seminar)';

  return (
    <>
      {/* Search & Filter Controls Card */}
      <section className="controls-card" aria-label="Search and Filter Lectures">
        {/* Row 1: Search Bar & View Mode Toggle */}
        <div className="search-row">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="searchInput"
              placeholder="Search by lecture title, topic, channel, catalog code, or YouTube ID..."
              autoComplete="off"
              spellCheck="false"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <kbd className="search-kbd" title="Press '/' to quickly search">/</kbd>
            {searchQuery && (
              <button
                className="clear-search-btn"
                id="clearSearchBtn"
                title="Clear search"
                style={{ display: 'flex' }}
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switch (Grid vs List) */}
          <div className="view-switch-group">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              id="viewGridBtn"
              title="Grid View"
              onClick={() => onViewModeChange('grid')}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              id="viewListBtn"
              title="Compact List View"
              onClick={() => onViewModeChange('list')}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2: Status Tabs & Dropdown Selects */}
        <div className="filter-row">
          <div className="status-tabs" id="statusTabs" role="tablist">
            <button
              className={`tab-btn ${activeStatus === 'all' ? 'active' : ''}`}
              data-status="all"
              onClick={() => onStatusChange('all')}
            >
              All <span className="tab-count" id="countAll">{statusCounts.all}</span>
            </button>
            <button
              className={`tab-btn ${activeStatus === 'unheard' ? 'active' : ''}`}
              data-status="unheard"
              onClick={() => onStatusChange('unheard')}
            >
              Unheard <span className="tab-count" id="countUnheard">{statusCounts.unheard}</span>
            </button>
            <button
              className={`tab-btn ${activeStatus === 'heard' ? 'active' : ''}`}
              data-status="heard"
              onClick={() => onStatusChange('heard')}
            >
              Heard ✓ <span className="tab-count" id="countHeard">{statusCounts.heard}</span>
            </button>
            <button
              className={`tab-btn ${activeStatus === 'starred' ? 'active' : ''}`}
              data-status="starred"
              onClick={() => onStatusChange('starred')}
            >
              Favorites ★ <span className="tab-count" id="countStarred">{statusCounts.starred}</span>
            </button>
          </div>

          <div className="select-filters">
            {/* Category / Topic Select */}
            <div className="custom-select-wrap">
              <label htmlFor="categorySelect">Topic / Series:</label>
              <select
                id="categorySelect"
                value={activeCategory}
                onChange={(e) => {
                  onCategoryChange(e.target.value);
                  onSubcategoryChange('all');
                }}
              >
                <option value="all">All Topics</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Topic / Canto Select */}
            {showSubcategories && (
              <div className="custom-select-wrap" id="subcategorySelectWrap">
                <label htmlFor="subcategorySelect">Sub-Topic:</label>
                <select
                  id="subcategorySelect"
                  value={activeSubcategory}
                  onChange={(e) => onSubcategoryChange(e.target.value)}
                >
                  <option value="all">All Sub-Topics</option>
                  {subcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speaker Select */}
            <div className="custom-select-wrap">
              <label htmlFor="speakerSelect">Speaker:</label>
              <select
                id="speakerSelect"
                value={activeSpeaker}
                onChange={(e) => onSpeakerChange(e.target.value)}
              >
                <option value="all">All Speakers</option>
                {speakers.map((spk) => (
                  <option key={spk} value={spk}>
                    {spk}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Select */}
            <div className="custom-select-wrap">
              <label htmlFor="channelSelect">Channel:</label>
              <select
                id="channelSelect"
                value={activeChannel}
                onChange={(e) => onChannelChange(e.target.value)}
              >
                <option value="all">All Channels</option>
                {channels.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="custom-select-wrap">
              <label htmlFor="sortSelect">Sort:</label>
              <select
                id="sortSelect"
                value={activeSort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
              >
                <option value="reverse">Latest First (Default)</option>
                <option value="default">Earliest First</option>
                <option value="titleAsc">Title (A → Z)</option>
                <option value="category">By Topic / Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 3: Quick Topic Chips Bar */}
        <div className="quick-chips-bar" id="quickChipsBar">
          <span className="chips-label">Popular Series:</span>
          <div className="chips-scroll" id="chipsContainer">
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeCategory === chip.category;
              return (
                <button
                  key={chip.label}
                  type="button"
                  className={`chip-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onCategoryChange(isActive ? 'all' : chip.category);
                    onSubcategoryChange('all');
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Filters Summary & Result Stats */}
      <section className="results-bar">
        <div className="results-stats">
          Showing <span id="resultsCount">{totalFilteredCount}</span> talks
          {hasActiveFilters && (
            <span id="activeFilterNote" className="filter-note">
              (filtered from {totalCount})
            </span>
          )}
        </div>
        <div className="results-actions">
          {hasActiveFilters && (
            <button
              className="btn btn-ghost btn-sm"
              id="resetFiltersBtn"
              onClick={onResetFilters}
            >
              Clear All Filters ✕
            </button>
          )}
        </div>
      </section>

      {/* Contextual Companion Resource Alert Banner */}
      {showUpadeshamritaBanner && (
        <aside
          className="series-resource-banner"
          id="seriesResourceBanner"
          aria-label="Companion Study Material"
        >
          <div className="resource-banner-content">
            <span className="resource-banner-icon">📖</span>
            <div className="resource-banner-text">
              <strong className="resource-banner-title">
                Companion Study Material: Sri Upadeshamrita Q&amp;A
              </strong>
              <span className="resource-banner-desc">
                421-page exhaustive compilation of Q&amp;A by HG Hari Parshad Das from the seminar WhatsApp group.
              </span>
            </div>
          </div>
          <div className="resource-banner-actions">
            <a
              href="resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
            >
              Open PDF ↗
            </a>
            <a
              href="resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf"
              download="Answers_HPD_Upadeshamritam_WhatsApp.pdf"
              className="btn btn-sm btn-secondary"
            >
              Download (6.7 MB)
            </a>
          </div>
        </aside>
      )}
    </>
  );
};