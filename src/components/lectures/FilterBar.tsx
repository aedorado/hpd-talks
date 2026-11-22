'use client';

import React from 'react';
import { StatusFilter, SortOption, ViewMode } from '@/types/player';
import { FILTER_CHIPS } from '@/lib/constants';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
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
  return (
    <section className="search-filter-section" aria-label="Search and Filter Lectures">
      {/* Search Input Row */}
      <div className="search-row">
        <div className="search-box">
          <svg className="icon search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            id="searchInput"
            className="search-input"
            placeholder="Search talks by title, topic, speaker, date, verse, or code..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              id="clearSearchBtn"
              title="Clear search"
              onClick={() => onSearchChange('')}
              style={{ display: 'flex' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs" id="statusTabs" role="tablist" aria-label="Status filters">
          <button
            className={`tab-btn ${activeStatus === 'all' ? 'active' : ''}`}
            data-status="all"
            role="tab"
            onClick={() => onStatusChange('all')}
          >
            All
          </button>
          <button
            className={`tab-btn ${activeStatus === 'unheard' ? 'active' : ''}`}
            data-status="unheard"
            role="tab"
            onClick={() => onStatusChange('unheard')}
          >
            Unheard
          </button>
          <button
            className={`tab-btn ${activeStatus === 'heard' ? 'active' : ''}`}
            data-status="heard"
            role="tab"
            onClick={() => onStatusChange('heard')}
          >
            Heard
          </button>
          <button
            className={`tab-btn ${activeStatus === 'starred' ? 'active' : ''}`}
            data-status="starred"
            role="tab"
            onClick={() => onStatusChange('starred')}
          >
            Starred ★
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="dropdowns-row">
        <div className="select-wrap">
          <label htmlFor="categorySelect" className="select-label">
            Series / Topic
          </label>
          <select
            id="categorySelect"
            className="filter-select"
            value={activeCategory}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              onSubcategoryChange('all');
            }}
          >
            <option value="all">All Topics / Series</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="select-wrap">
          <label htmlFor="subcategorySelect" className="select-label">
            Sub-topic / Canto
          </label>
          <select
            id="subcategorySelect"
            className="filter-select"
            value={activeSubcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
          >
            <option value="all">All Sub-topics</option>
            {subcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          </select>
        </div>

        <div className="select-wrap">
          <label htmlFor="speakerSelect" className="select-label">
            Speaker
          </label>
          <select
            id="speakerSelect"
            className="filter-select"
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

        <div className="select-wrap">
          <label htmlFor="channelSelect" className="select-label">
            Channel
          </label>
          <select
            id="channelSelect"
            className="filter-select"
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

        <div className="select-wrap select-wrap-sort">
          <label htmlFor="sortSelect" className="select-label">
            Order
          </label>
          <select
            id="sortSelect"
            className="filter-select"
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="default">Chronological (Earliest First)</option>
            <option value="reverse">Newest First</option>
            <option value="titleAsc">Title (A → Z)</option>
            <option value="category">Topic / Series</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="view-mode-toggle" aria-label="Card view mode">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            id="viewGridBtn"
            title="Grid View"
            onClick={() => onViewModeChange('grid')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            id="viewListBtn"
            title="List View"
            onClick={() => onViewModeChange('list')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
              <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"></line>
              <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"></line>
              <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"></line>
              <circle cx="4" cy="6" r="1.5"></circle>
              <circle cx="4" cy="12" r="1.5"></circle>
              <circle cx="4" cy="18" r="1.5"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Filter Chips Strip */}
      <div className="filter-chips-wrapper">
        <div className="filter-chips-container" id="filterChipsContainer">
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeCategory === chip.category;
            return (
              <button
                key={chip.label}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                data-category={chip.category}
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

      {/* Meta Strip: Result Count & Active Filters */}
      <div className="results-meta-bar">
        <div className="results-count" id="resultsCount">
          Showing <strong>{totalFilteredCount}</strong> {totalFilteredCount === 1 ? 'talk' : 'talks'}
          {totalFilteredCount !== totalCount && ` of ${totalCount}`}
        </div>
        {(searchQuery ||
          activeCategory !== 'all' ||
          activeSubcategory !== 'all' ||
          activeSpeaker !== 'all' ||
          activeChannel !== 'all' ||
          activeStatus !== 'all') && (
          <button className="btn-link" id="resetFiltersBtn" onClick={onResetFilters}>
            Clear all filters
          </button>
        )}
      </div>
    </section>
  );
};
