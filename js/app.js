/**
 * HG Hari Parshad Das — Katha Sangraha
 * Core Application Logic & Local Storage Management
 * Uses 11-character YouTube Video ID as the immutable primary key.
 * Supports 2-level Category & Subcategory taxonomy.
 */

(function () {
  'use strict';

  // Local Storage Keys
  const STORAGE_KEYS = {
    HEARD: 'hpd_talks_heard_yt_v2',
    STARRED: 'hpd_talks_starred_yt_v2',
    LEGACY_HEARD: 'hpd_talks_heard_v1',
    LEGACY_STARRED: 'hpd_talks_starred_v1',
    THEME: 'hpd_talks_theme_v1',
    VIEW: 'hpd_talks_view_v1',
    LAST_PLAYED: 'hpd_talks_last_played_yt_v1',
    PROGRESS: 'hpd_talks_progress_yt_v1',
    SHORTS_WATCHED: 'hpd_shorts_watched_v1'
  };

  // State
  let allLectures = [];
  let lectureMapByYtId = new Map();
  let lectureMapByCatalogId = new Map();
  let categorySubcategoriesMap = new Map();
  let filteredLectures = [];
  let heardSet = new Set(); // Stores 11-character YouTube IDs
  let starredSet = new Set(); // Stores 11-character YouTube IDs
  let playbackProgressMap = new Map(); // Stores yt_id -> { currentTime, duration, updatedAt }

  // Shorts State
  let allShorts = [];
  let filteredShorts = [];
  let shortsWatchedSet = new Set(); // Stores 11-char YouTube IDs
  let currentPlayingShortIndex = -1;
  let activeContentMode = 'kathas'; // 'kathas' or 'shorts'
  let shortsSearchQuery = '';
  let activeShortsFilter = 'all'; // 'all', 'unwatched', 'watched'

  // Docked Bottom Player & Video Extension Dock State
  let activePlayerYtId = null;
  let activePlayerLecture = null;
  let isPlayerPlaying = false;
  let playerCurrentTime = 0;
  let playerDuration = 0;
  let playerPlaybackRate = 1.0;
  let isSeekingPlayer = false;
  let isVideoExpanded = true;

  let activeStatus = 'all'; // 'all', 'unheard', 'heard', 'starred'
  let activeCategory = 'all';
  let activeSubcategory = 'all';
  let activeSpeaker = 'all';
  let activeChannel = 'all';
  let activeSort = 'default';
  let searchQuery = '';
  let viewMode = 'grid'; // 'grid' or 'list'

  // Pagination batching
  const BATCH_SIZE = 36;
  let currentlyDisplayed = 0;

  // Active playing lecture index in filtered list
  let currentPlayingIndex = -1;

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categorySelect = document.getElementById('categorySelect');
  const subcategorySelect = document.getElementById('subcategorySelect');
  const subcategorySelectWrap = document.getElementById('subcategorySelectWrap');
  const speakerSelect = document.getElementById('speakerSelect');
  const channelSelect = document.getElementById('channelSelect');
  const sortSelect = document.getElementById('sortSelect');
  const statusTabs = document.getElementById('statusTabs');
  const chipsContainer = document.getElementById('chipsContainer');

  const lecturesContainer = document.getElementById('lecturesContainer');
  const resultsCount = document.getElementById('resultsCount');
  const activeFilterNote = document.getElementById('activeFilterNote');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyState = document.getElementById('emptyState');
  const emptyResetBtn = document.getElementById('emptyResetBtn');

  const paginationBar = document.getElementById('paginationBar');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const loadAllBtn = document.getElementById('loadAllBtn');
  const remainingCount = document.getElementById('remainingCount');

  // Continue Hearing Section Elements
  const continueHearingSection = document.getElementById('continueHearingSection');
  const continueHearingContent = document.getElementById('continueHearingContent');
  const dismissContinueBtn = document.getElementById('dismissContinueBtn');

  // Header & Stats Elements
  const heardFraction = document.getElementById('heardFraction');
  const progressBarFill = document.getElementById('progressBarFill');
  const heardPercentage = document.getElementById('heardPercentage');
  const countAll = document.getElementById('countAll');
  const countUnheard = document.getElementById('countUnheard');
  const countHeard = document.getElementById('countHeard');
  const countStarred = document.getElementById('countStarred');

  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const randomTalkBtn = document.getElementById('randomTalkBtn');
  const headerProgressWidget = document.getElementById('headerProgressWidget');

  // Player Modal Elements
  const playerModal = document.getElementById('playerModal');
  const playerOverlay = document.getElementById('playerOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const ytPlayerIframe = document.getElementById('ytPlayerIframe');
  const modalLectureId = document.getElementById('modalLectureId');
  const modalLectureTitle = document.getElementById('modalLectureTitle');
  const modalLectureMeta = document.getElementById('modalLectureMeta');
  const modalHeardBtn = document.getElementById('modalHeardBtn');
  const modalStarBtn = document.getElementById('modalStarBtn');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');
  const modalYtDirectLink = document.getElementById('modalYtDirectLink');
  const modalResourceLink = document.getElementById('modalResourceLink');
  const modalRestartBtn = document.getElementById('modalRestartBtn');

  // Docked Bottom Player & Video Dock Elements
  const dockedBottomPlayer = document.getElementById('dockedBottomPlayer');
  const bpVideoDock = document.getElementById('bpVideoDock');
  const bpSwitchToAudioBtn = document.getElementById('bpSwitchToAudioBtn');
  const bpPlayerIframe = document.getElementById('bpPlayerIframe');
  const bpThumbWrap = document.getElementById('bpThumbWrap');
  const bpThumbImg = document.getElementById('bpThumbImg');
  const bpLiveWave = document.getElementById('bpLiveWave');
  const bpTitle = document.getElementById('bpTitle');
  const bpSpeaker = document.getElementById('bpSpeaker');
  const bpCategory = document.getElementById('bpCategory');
  const bpPrevBtn = document.getElementById('bpPrevBtn');
  const bpRewind10Btn = document.getElementById('bpRewind10Btn');
  const bpPlayPauseBtn = document.getElementById('bpPlayPauseBtn');
  const bpPlayIcon = document.getElementById('bpPlayIcon');
  const bpForward10Btn = document.getElementById('bpForward10Btn');
  const bpNextBtn = document.getElementById('bpNextBtn');
  const bpCurrentTime = document.getElementById('bpCurrentTime');
  const bpProgressSlider = document.getElementById('bpProgressSlider');
  const bpSliderFill = document.getElementById('bpSliderFill');
  const bpTotalDuration = document.getElementById('bpTotalDuration');
  const bpSpeedBtn = document.getElementById('bpSpeedBtn');
  const bpSpeedLabel = document.getElementById('bpSpeedLabel');
  const bpHeardBtn = document.getElementById('bpHeardBtn');
  const bpHeardIcon = document.getElementById('bpHeardIcon');
  const bpStarBtn = document.getElementById('bpStarBtn');
  const bpStarIcon = document.getElementById('bpStarIcon');
  const bpToggleVideoBtn = document.getElementById('bpToggleVideoBtn');
  const bpToggleVideoLabel = document.getElementById('bpToggleVideoLabel');
  const bpToggleVideoChevron = document.getElementById('bpToggleVideoChevron');
  const bpDirectYtLink = document.getElementById('bpDirectYtLink');
  const bpCloseBtn = document.getElementById('bpCloseBtn');

  // Backup Modal Elements
  const openBackupBtn = document.getElementById('openBackupBtn');
  const backupModal = document.getElementById('backupModal');
  const backupOverlay = document.getElementById('backupOverlay');
  const closeBackupModalBtn = document.getElementById('closeBackupModalBtn');
  const statTotalHeard = document.getElementById('statTotalHeard');
  const statTotalRemaining = document.getElementById('statTotalRemaining');
  const statTotalFavorites = document.getElementById('statTotalFavorites');
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importFileInput = document.getElementById('importFileInput');
  const resetProgressBtn = document.getElementById('resetProgressBtn');

  // Study Materials Modal Elements
  const openResourcesBtn = document.getElementById('openResourcesBtn');
  const resourcesModal = document.getElementById('resourcesModal');
  const resourcesOverlay = document.getElementById('resourcesOverlay');
  const closeResourcesModalBtn = document.getElementById('closeResourcesModalBtn');
  const filterUpadeshamritaBtn = document.getElementById('filterUpadeshamritaBtn');

  // Navigation Mode Switcher Elements
  const tabKathasBtn = document.getElementById('tabKathasBtn');
  const tabShortsBtn = document.getElementById('tabShortsBtn');
  const kathasViewSection = document.getElementById('kathasViewSection');
  const shortsViewSection = document.getElementById('shortsViewSection');
  const navKathasCount = document.getElementById('navKathasCount');
  const navShortsCount = document.getElementById('navShortsCount');

  // Shorts View Elements
  const shortsGrid = document.getElementById('shortsGrid');
  const shortsSearchInput = document.getElementById('shortsSearchInput');
  const clearShortsSearchBtn = document.getElementById('clearShortsSearchBtn');
  const shortsEmptyState = document.getElementById('shortsEmptyState');
  const shortsEmptyResetBtn = document.getElementById('shortsEmptyResetBtn');
  const shortsWatchedCount = document.getElementById('shortsWatchedCount');
  const shortsTotalCount = document.getElementById('shortsTotalCount');
  const shortsFilterAllCount = document.getElementById('shortsFilterAllCount');
  const shortsFilterUnwatchedCount = document.getElementById('shortsFilterUnwatchedCount');
  const shortsFilterWatchedCount = document.getElementById('shortsFilterWatchedCount');

  // Shorts Player Modal Elements
  const shortsPlayerModal = document.getElementById('shortsPlayerModal');
  const shortsPlayerOverlay = document.getElementById('shortsPlayerOverlay');
  const shortsModalCloseBtn = document.getElementById('shortsModalCloseBtn');
  const shortsIframe = document.getElementById('shortsIframe');
  const shortsModalBadge = document.getElementById('shortsModalBadge');
  const shortsModalTitle = document.getElementById('shortsModalTitle');
  const shortsModalWatchedBtn = document.getElementById('shortsModalWatchedBtn');
  const shortsModalPrevBtn = document.getElementById('shortsModalPrevBtn');
  const shortsModalNextBtn = document.getElementById('shortsModalNextBtn');
  const shortsModalDirectLink = document.getElementById('shortsModalDirectLink');

  const appToast = document.getElementById('appToast');

  // ==========================================================================
  // Initialization
  // ==========================================================================
  async function init() {
    loadTheme();
    loadViewMode();

    await Promise.all([loadLecturesData(), loadShortsData()]);
    buildLookupMaps();
    loadLocalStorageData();
    loadShortsWatchedData();
    loadPlaybackProgressFromStorage();

    populateFilterOptions();
    renderQuickChips();
    setupEventListeners();

    applyFilters();
    updateGlobalStats();
    renderContinueHearingSection();

    // Initialize shorts view
    applyShortsFilters();

    checkUrlHashForLecture();
  }

  // ==========================================================================
  // Load Lectures Dataset
  // ==========================================================================
  async function loadLecturesData() {
    try {
      const response = await fetch('data/lectures.json');
      if (response.ok) {
        allLectures = await response.json();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      if (window.LECTURES_DATA && Array.isArray(window.LECTURES_DATA)) {
        allLectures = window.LECTURES_DATA;
      } else {
        console.error('Failed to load lectures data:', err);
      }
    }
  }

  async function loadShortsData() {
    try {
      const response = await fetch('data/shorts.json');
      if (response.ok) {
        allShorts = await response.json();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      if (window.SHORTS_DATA && Array.isArray(window.SHORTS_DATA)) {
        allShorts = window.SHORTS_DATA;
      } else {
        console.warn('Failed to load shorts data from JSON, fallback unavailable:', err);
      }
    }
    if (navShortsCount) navShortsCount.textContent = allShorts.length;
  }

  function loadShortsWatchedData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHORTS_WATCHED);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          arr.forEach(id => shortsWatchedSet.add(id));
        }
      }
    } catch (e) {
      console.warn('Error reading shorts watched state:', e);
    }
  }

  function saveShortsWatchedData() {
    try {
      localStorage.setItem(STORAGE_KEYS.SHORTS_WATCHED, JSON.stringify(Array.from(shortsWatchedSet)));
    } catch (e) {
      console.error('Failed to save shorts watched state to localStorage:', e);
    }
  }

  function buildLookupMaps() {
    lectureMapByYtId.clear();
    lectureMapByCatalogId.clear();
    categorySubcategoriesMap.clear();

    allLectures.forEach(l => {
      const ytId = l.yt_id || l.id;
      lectureMapByYtId.set(ytId, l);
      if (l.catalog_id) {
        lectureMapByCatalogId.set(l.catalog_id, l);
      }

      // Build Category -> Subcategories map
      const cat = l.category || 'General';
      const sub = l.subcategory || 'General';
      if (!categorySubcategoriesMap.has(cat)) {
        categorySubcategoriesMap.set(cat, new Map());
      }
      const subMap = categorySubcategoriesMap.get(cat);
      subMap.set(sub, (subMap.get(sub) || 0) + 1);
    });
  }

  // ==========================================================================
  // LocalStorage Helpers
  // ==========================================================================
  function loadLocalStorageData() {
    heardSet = new Set();
    starredSet = new Set();

    try {
      const savedHeard = localStorage.getItem(STORAGE_KEYS.HEARD);
      if (savedHeard) {
        const arr = JSON.parse(savedHeard);
        if (Array.isArray(arr)) {
          arr.forEach(id => {
            const resolved = resolveToYtId(id);
            if (resolved) heardSet.add(resolved);
          });
        }
      }
    } catch (e) {
      console.warn('Error reading heard data from localStorage:', e);
    }

    try {
      const legacyHeard = localStorage.getItem(STORAGE_KEYS.LEGACY_HEARD);
      if (legacyHeard) {
        const legacyArr = JSON.parse(legacyHeard);
        if (Array.isArray(legacyArr)) {
          legacyArr.forEach(id => {
            const resolved = resolveToYtId(id);
            if (resolved) heardSet.add(resolved);
          });
        }
      }
    } catch (e) { }

    try {
      const savedStarred = localStorage.getItem(STORAGE_KEYS.STARRED);
      if (savedStarred) {
        const arr = JSON.parse(savedStarred);
        if (Array.isArray(arr)) {
          arr.forEach(id => {
            const resolved = resolveToYtId(id);
            if (resolved) starredSet.add(resolved);
          });
        }
      }
    } catch (e) { }

    try {
      const legacyStarred = localStorage.getItem(STORAGE_KEYS.LEGACY_STARRED);
      if (legacyStarred) {
        const legacyArr = JSON.parse(legacyStarred);
        if (Array.isArray(legacyArr)) {
          legacyArr.forEach(id => {
            const resolved = resolveToYtId(id);
            if (resolved) starredSet.add(resolved);
          });
        }
      }
    } catch (e) { }

    saveHeardData();
    saveStarredData();
  }

  function resolveToYtId(id) {
    if (!id) return null;
    if (lectureMapByYtId.has(id)) return id;
    if (lectureMapByCatalogId.has(id)) {
      return lectureMapByCatalogId.get(id).yt_id;
    }
    if (id.length === 11) return id;
    return null;
  }

  function saveHeardData() {
    try {
      localStorage.setItem(STORAGE_KEYS.HEARD, JSON.stringify(Array.from(heardSet)));
    } catch (e) {
      console.error('Failed to save heard data to localStorage:', e);
    }
  }

  function saveStarredData() {
    try {
      localStorage.setItem(STORAGE_KEYS.STARRED, JSON.stringify(Array.from(starredSet)));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }

  // ==========================================================================
  // Playback Progress & Timestamp Tracking
  // ==========================================================================
  function loadPlaybackProgressFromStorage() {
    playbackProgressMap.clear();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            const item = obj[key];
            if (item && typeof item.currentTime === 'number') {
              playbackProgressMap.set(key, item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error reading playback progress from localStorage:', e);
    }
  }

  let lastProgressSaveTime = 0;
  function savePlaybackProgress(ytId, currentTime, duration) {
    if (!ytId || typeof currentTime !== 'number' || currentTime < 2) return;

    const now = Date.now();
    playbackProgressMap.set(ytId, {
      currentTime: Math.floor(currentTime),
      duration: duration ? Math.floor(duration) : 0,
      updatedAt: now
    });

    // Throttle writing to localStorage to once every 2 seconds
    if (now - lastProgressSaveTime > 2000) {
      lastProgressSaveTime = now;
      savePlaybackProgressToStorage();

      // Dynamically update the continue hearing section if this is the active talk
      const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
      if (lastPlayed === ytId) {
        updateContinueHearingLiveProgress(ytId, currentTime, duration);
      }
    }
  }

  function savePlaybackProgressToStorage() {
    try {
      const obj = {};
      playbackProgressMap.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save playback progress to localStorage:', e);
    }
  }

  function formatTime(totalSeconds) {
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0:00';
    const s = Math.floor(totalSeconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    showToast(`Switched to ${newTheme} theme`);
  }

  function loadViewMode() {
    const savedView = localStorage.getItem(STORAGE_KEYS.VIEW) || 'grid';
    setViewMode(savedView);
  }

  function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem(STORAGE_KEYS.VIEW, mode);

    if (mode === 'grid') {
      lecturesContainer.classList.add('grid-view');
      lecturesContainer.classList.remove('list-view');
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
    } else {
      lecturesContainer.classList.add('list-view');
      lecturesContainer.classList.remove('grid-view');
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
    }
  }

  // ==========================================================================
  // Populate Filter Dropdowns & Dynamic Subcategories
  // ==========================================================================
  function populateFilterOptions() {
    const categoriesMap = {};
    const channelsMap = {};
    const speakersMap = {};

    allLectures.forEach(l => {
      categoriesMap[l.category] = (categoriesMap[l.category] || 0) + 1;
      channelsMap[l.channel] = (channelsMap[l.channel] || 0) + 1;
      const spk = l.speaker || 'HG Hari Parshad Das';
      speakersMap[spk] = (speakersMap[spk] || 0) + 1;
    });

    // Populate Category Dropdown (Alphabetical order A → Z)
    const sortedCategories = Object.keys(categoriesMap).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    categorySelect.innerHTML = `<option value="all">All Topics (${allLectures.length})</option>`;
    sortedCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${cat} (${categoriesMap[cat]})`;
      categorySelect.appendChild(opt);
    });

    // Populate Speaker Dropdown (HPD first, then alphabetical)
    if (speakerSelect) {
      const sortedSpeakers = Object.keys(speakersMap).sort((a, b) => {
        if (a === 'HG Hari Parshad Das') return -1;
        if (b === 'HG Hari Parshad Das') return 1;
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
      });
      speakerSelect.innerHTML = `<option value="all">All Speakers (${allLectures.length})</option>`;
      sortedSpeakers.forEach(spk => {
        const opt = document.createElement('option');
        opt.value = spk;
        opt.textContent = `${spk} (${speakersMap[spk]})`;
        speakerSelect.appendChild(opt);
      });
    }

    // Populate Channel Dropdown (Alphabetical order A → Z)
    const sortedChannels = Object.keys(channelsMap).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    channelSelect.innerHTML = `<option value="all">All Channels</option>`;
    sortedChannels.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = `${ch} (${channelsMap[ch]})`;
      channelSelect.appendChild(opt);
    });
  }

  function updateSubcategoryDropdown(cat) {
    if (!subcategorySelect || !subcategorySelectWrap) return;

    if (cat === 'all' || !categorySubcategoriesMap.has(cat)) {
      subcategorySelectWrap.style.display = 'none';
      activeSubcategory = 'all';
      return;
    }

    const subMap = categorySubcategoriesMap.get(cat);
    const sortedSubs = Array.from(subMap.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    subcategorySelect.innerHTML = `<option value="all">All Sub-Topics (${Array.from(subMap.values()).reduce((a, b) => a + b, 0)})</option>`;
    sortedSubs.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = `${sub} (${subMap.get(sub)})`;
      subcategorySelect.appendChild(opt);
    });

    subcategorySelect.value = 'all';
    activeSubcategory = 'all';
    subcategorySelectWrap.style.display = 'flex';
  }

  function renderQuickChips() {
    const popularCategories = [
      'Caitanya Siksastakam (Seminar)',
      'Upadeshamrta (Seminar)',
      'Srimad Bhagavatam',
      'Sri Krishna & Vraja Lila',
      'Bhagavad Gita',
      'Bhakti-rasamrita-sindhu',
      'Sri Caitanya Caritamrta',
      'Lord Nityananda Prabhu',
      'Srimati Radharani (Radha Tattva)',
      'Beyond Bhoga & Tyaga (Seminar)',
      'Sharad Poornima (Seminar)',
      'Grihastha Ashrama & Family Life'
    ];

    chipsContainer.innerHTML = '';

    // "All" chip
    const allChip = document.createElement('button');
    allChip.className = 'chip-btn active';
    allChip.textContent = 'All';
    allChip.dataset.category = 'all';
    allChip.onclick = () => selectCategoryFromChip('all');
    chipsContainer.appendChild(allChip);

    popularCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'chip-btn';
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.onclick = () => selectCategoryFromChip(cat);
      chipsContainer.appendChild(btn);
    });
  }

  function selectCategoryFromChip(cat) {
    activeCategory = cat;
    categorySelect.value = cat;
    updateSubcategoryDropdown(cat);
    updateChipActiveState();
    applyFilters();
  }

  function updateChipActiveState() {
    const chips = chipsContainer.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      if (chip.dataset.category === activeCategory) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // Filter & Search Logic
  // ==========================================================================
  function applyFilters() {
    const query = searchQuery.trim().toLowerCase();

    filteredLectures = allLectures.filter(lecture => {
      const ytId = lecture.yt_id || lecture.id;
      const isHeard = heardSet.has(ytId);
      const isStarred = starredSet.has(ytId);

      // Status tab filter
      if (activeStatus === 'heard' && !isHeard) return false;
      if (activeStatus === 'unheard' && isHeard) return false;
      if (activeStatus === 'starred' && !isStarred) return false;

      // Category filter
      if (activeCategory !== 'all' && lecture.category !== activeCategory) {
        return false;
      }

      // Subcategory filter
      if (activeSubcategory !== 'all' && lecture.subcategory !== activeSubcategory) {
        return false;
      }

      // Speaker filter
      if (activeSpeaker !== 'all' && (lecture.speaker || 'HG Hari Parshad Das') !== activeSpeaker) {
        return false;
      }

      // Channel filter
      if (activeChannel !== 'all' && lecture.channel !== activeChannel) {
        return false;
      }

      // Search Query filter
      if (query) {
        const titleMatch = lecture.title.toLowerCase().includes(query);
        const catMatch = lecture.category.toLowerCase().includes(query);
        const subcatMatch = lecture.subcategory && lecture.subcategory.toLowerCase().includes(query);
        const speakerMatch = lecture.speaker && lecture.speaker.toLowerCase().includes(query);
        const chanMatch = lecture.channel.toLowerCase().includes(query);
        const ytIdMatch = ytId.toLowerCase().includes(query);
        const catalogMatch = lecture.catalog_id && lecture.catalog_id.toLowerCase().includes(query);
        if (!titleMatch && !catMatch && !subcatMatch && !speakerMatch && !chanMatch && !ytIdMatch && !catalogMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    sortLectures();

    // Reset pagination batch
    currentlyDisplayed = 0;
    lecturesContainer.innerHTML = '';

    renderNextBatch();
    updateResultsSummary();
  }

  function sortLectures() {
    if (activeSort === 'default') {
      filteredLectures.sort((a, b) => a.index - b.index);
    } else if (activeSort === 'reverse') {
      filteredLectures.sort((a, b) => b.index - a.index);
    } else if (activeSort === 'titleAsc') {
      filteredLectures.sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeSort === 'category') {
      filteredLectures.sort((a, b) =>
        a.category.localeCompare(b.category) ||
        (a.subcategory || '').localeCompare(b.subcategory || '') ||
        a.index - b.index
      );
    }
  }

  // ==========================================================================
  // Batch Rendering
  // ==========================================================================
  function renderNextBatch(limit = BATCH_SIZE) {
    if (filteredLectures.length === 0) {
      emptyState.style.display = 'block';
      paginationBar.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';

    const start = currentlyDisplayed;
    const end = Math.min(start + limit, filteredLectures.length);
    const fragment = document.createDocumentFragment();

    for (let i = start; i < end; i++) {
      const lecture = filteredLectures[i];
      const card = createLectureCard(lecture, i);
      fragment.appendChild(card);
    }

    lecturesContainer.appendChild(fragment);
    currentlyDisplayed = end;

    const remaining = filteredLectures.length - currentlyDisplayed;
    if (remaining > 0) {
      paginationBar.style.display = 'flex';
      remainingCount.textContent = remaining;
    } else {
      paginationBar.style.display = 'none';
    }
  }

  // ==========================================================================
  // Date Formatting Helper
  // ==========================================================================
  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
    return dateStr;
  }

  // ==========================================================================
  // Create Single Lecture Card Element
  // ==========================================================================
  function createLectureCard(lecture, filteredIndex) {
    const ytId = lecture.yt_id || lecture.id;
    const isHeard = heardSet.has(ytId);
    const isStarred = starredSet.has(ytId);

    const card = document.createElement('article');
    card.className = `lecture-card ${isHeard ? 'is-heard' : ''}`;
    card.id = `card-${ytId}`;
    card.dataset.ytId = ytId;

    let displayTitle = escapeHtml(lecture.title);
    if (searchQuery.trim().length > 1) {
      const reg = new RegExp(`(${escapeRegExp(searchQuery.trim())})`, 'gi');
      displayTitle = displayTitle.replace(reg, '<mark>$1</mark>');
    }

    const badgeLabel = lecture.catalog_id || (typeof lecture.index === 'number' ? `HPD${lecture.index.toString().padStart(4, '0')}` : '');

    // Deduplicate speaker and category
    const isGuestSpeaker = lecture.speaker && lecture.speaker !== 'HG Hari Parshad Das';
    const showCategory = !isGuestSpeaker || (lecture.category && lecture.category !== lecture.speaker);
    const showChannel = lecture.channel && lecture.channel !== 'Hari Parshad Das' && lecture.channel !== lecture.speaker;

    // Playback progress for this lecture
    const prog = playbackProgressMap.get(ytId);
    const hasProgress = prog && prog.currentTime > 15 && (!prog.duration || prog.currentTime < prog.duration - 25) && !isHeard;
    const progressPercent = hasProgress && prog.duration ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : (hasProgress ? 30 : 0);

    card.innerHTML = `
      <div class="card-thumb-wrap" role="button" aria-label="Play ${escapeHtml(lecture.title)}">
        <img 
          class="card-thumb-img" 
          src="${lecture.thumbnail}" 
          alt="${escapeHtml(lecture.title)}"
          loading="lazy"
          onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'"
        >
        ${lecture.duration ? `<span class="card-duration-badge" title="Duration">${escapeHtml(lecture.duration)}</span>` : ''}
        ${hasProgress ? `
          <div class="card-playback-progress" title="Resumes at ${formatTime(prog.currentTime)}">
            <div class="card-playback-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <span class="card-progress-badge" title="Resumed progress">⏱️ ${formatTime(prog.currentTime)}</span>
        ` : ''}
        <span class="card-heard-tag">✓ Heard</span>
        <div class="card-play-overlay">
          <div class="play-circle">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="card-content-col">
          <h3 class="card-title" title="${escapeHtml(lecture.title)}">${displayTitle}</h3>

          <div class="card-meta-line">
            ${badgeLabel ? `<span class="badge-catalog" title="Catalog: ${badgeLabel}">${badgeLabel}</span>` : ''}
            ${isGuestSpeaker ? `<span class="badge-speaker" title="Speaker: ${escapeHtml(lecture.speaker)}">🎙️ ${escapeHtml(lecture.speaker)}</span>` : ''}
            ${showCategory ? `<span class="badge-category" title="Topic: ${escapeHtml(lecture.category)}">${escapeHtml(lecture.category)}</span>` : ''}
            ${lecture.subcategory ? `<span class="badge-subcategory" title="Sub-Topic: ${escapeHtml(lecture.subcategory)}">${escapeHtml(lecture.subcategory)}</span>` : ''}
            ${lecture.upload_date ? `
              <span class="card-meta-item card-date" title="Uploaded on ${escapeHtml(lecture.upload_date)}">
                <span>📅 ${formatDisplayDate(lecture.upload_date)}</span>
              </span>
            ` : ''}
            ${lecture.duration ? `
              <span class="card-meta-item card-duration" title="Duration: ${escapeHtml(lecture.duration)}">
                <span>⏱️ ${escapeHtml(lecture.duration)}</span>
              </span>
            ` : ''}
            ${showChannel ? `
              <span class="card-meta-item card-channel" title="Channel: ${escapeHtml(lecture.channel)}">
                <span>${escapeHtml(lecture.channel)}</span>
              </span>
            ` : ''}
          </div>

          ${((lecture.resources && lecture.resources.length > 0) || lecture.category === 'Upadeshamrta (Seminar)') ? `
            <div class="card-resource-pill">
              <a href="resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf" target="_blank" rel="noopener noreferrer" class="btn-card-resource" title="Sri Upadeshamrita Q&amp;A PDF (421 Pages) by HG Hari Parshad Das" onclick="event.stopPropagation()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>Companion Q&amp;A PDF (421p)</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div class="card-actions">
          <button class="btn-toggle-heard" data-yt-id="${ytId}">
            <span class="check-icon">${isHeard ? '✓' : ''}</span>
            <span class="heard-label">${isHeard ? 'Heard' : 'Mark Heard'}</span>
          </button>

          <div class="card-sub-actions">
            <button class="btn-sub-action btn-stream-card" data-yt-id="${ytId}" title="Stream Audio in Bottom Player (🎧)">
              <span style="font-size: 13px;">🎧</span>
            </button>
            <button class="btn-sub-action btn-star ${isStarred ? 'active' : ''}" data-yt-id="${ytId}" title="${isStarred ? 'Remove from favorites' : 'Add to favorites'}">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button class="btn-sub-action btn-share" data-url="${lecture.url}" title="Copy YouTube Link (${ytId})">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            <a href="${lecture.url}" target="_blank" rel="noopener noreferrer" class="btn-sub-action" title="Open directly on YouTube">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;

    const thumbWrap = card.querySelector('.card-thumb-wrap');
    if (thumbWrap) {
      thumbWrap.addEventListener('click', () => {
        playLecture(ytId, { showVideo: true });
      });
    }

    const cardTitle = card.querySelector('.card-title');
    if (cardTitle) {
      cardTitle.addEventListener('click', () => {
        playLecture(ytId, { showVideo: true });
      });
    }

    const streamCardBtn = card.querySelector('.btn-stream-card');
    if (streamCardBtn) {
      streamCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prog = playbackProgressMap.get(ytId);
        const startTime = (prog && prog.currentTime > 2) ? prog.currentTime : 0;
        startAudioStream(ytId, startTime);
      });
    }

    const toggleHeardBtn = card.querySelector('.btn-toggle-heard');
    toggleHeardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHeardStatus(ytId);
    });

    const starBtn = card.querySelector('.btn-star');
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStarStatus(ytId);
    });

    const shareBtn = card.querySelector('.btn-share');
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(lecture.url);
      showToast(`YouTube link copied! (${ytId})`);
    });

    return card;
  }

  // ==========================================================================
  // Toggle Actions: Heard & Starred
  // ==========================================================================
  function toggleHeardStatus(ytId) {
    if (!ytId) return;
    const isNowHeard = !heardSet.has(ytId);

    if (isNowHeard) {
      heardSet.add(ytId);
      showToast('Marked as Heard! Haribol 🪷');
    } else {
      heardSet.delete(ytId);
      showToast('Marked as Unheard');
    }

    saveHeardData();
    updateGlobalStats();
    updateCardDOM(ytId);

    if (currentPlayingIndex >= 0 && (filteredLectures[currentPlayingIndex]?.yt_id === ytId || filteredLectures[currentPlayingIndex]?.id === ytId)) {
      updateModalControls();
    }

    if (activeStatus === 'unheard' || activeStatus === 'heard') {
      applyFilters();
    }
  }

  function toggleStarStatus(ytId) {
    if (!ytId) return;
    const isNowStarred = !starredSet.has(ytId);

    if (isNowStarred) {
      starredSet.add(ytId);
      showToast('Added to Favorites ★');
    } else {
      starredSet.delete(ytId);
      showToast('Removed from Favorites');
    }

    saveStarredData();
    updateGlobalStats();
    updateCardDOM(ytId);

    if (currentPlayingIndex >= 0 && (filteredLectures[currentPlayingIndex]?.yt_id === ytId || filteredLectures[currentPlayingIndex]?.id === ytId)) {
      updateModalControls();
    }

    if (activeStatus === 'starred') {
      applyFilters();
    }
  }

  function updateCardDOM(ytId) {
    const card = document.getElementById(`card-${ytId}`);
    if (!card) return;

    const isHeard = heardSet.has(ytId);
    const isStarred = starredSet.has(ytId);

    if (isHeard) {
      card.classList.add('is-heard');
    } else {
      card.classList.remove('is-heard');
    }

    const toggleBtn = card.querySelector('.btn-toggle-heard');
    if (toggleBtn) {
      const checkIcon = toggleBtn.querySelector('.check-icon');
      const label = toggleBtn.querySelector('.heard-label');
      if (checkIcon) checkIcon.textContent = isHeard ? '✓' : '';
      if (label) label.textContent = isHeard ? 'Heard' : 'Mark Heard';
    }

    const starBtn = card.querySelector('.btn-star');
    if (starBtn) {
      if (isStarred) {
        starBtn.classList.add('active');
        starBtn.title = 'Remove from favorites';
      } else {
        starBtn.classList.remove('active');
        starBtn.title = 'Add to favorites';
      }
    }
  }

  // ==========================================================================
  // Update Global Stats & Progress Pill
  // ==========================================================================
  function updateGlobalStats() {
    const total = allLectures.length || 700;
    const heardCount = heardSet.size;
    const unheardCount = Math.max(0, total - heardCount);
    const starredCount = starredSet.size;
    const percentage = total > 0 ? Math.round((heardCount / total) * 100) : 0;

    heardFraction.textContent = `${heardCount} / ${total}`;
    progressBarFill.style.width = `${percentage}%`;
    heardPercentage.textContent = `${percentage}%`;

    countAll.textContent = total;
    countUnheard.textContent = unheardCount;
    countHeard.textContent = heardCount;
    countStarred.textContent = starredCount;

    statTotalHeard.textContent = heardCount;
    statTotalRemaining.textContent = unheardCount;
    statTotalFavorites.textContent = starredCount;
  }

  function updateResultsSummary() {
    resultsCount.textContent = filteredLectures.length;

    let notes = [];
    if (activeStatus !== 'all') {
      notes.push(activeStatus.toUpperCase());
    }
    if (activeCategory !== 'all') {
      notes.push(`Topic: "${activeCategory}"`);
    }
    if (activeSubcategory !== 'all') {
      notes.push(`Sub-Topic: "${activeSubcategory}"`);
    }
    if (activeSpeaker !== 'all') {
      notes.push(`Speaker: "${activeSpeaker}"`);
    }
    if (activeChannel !== 'all') {
      notes.push(`Channel: "${activeChannel}"`);
    }
    if (searchQuery.trim()) {
      notes.push(`Matching: "${searchQuery.trim()}"`);
    }

    if (notes.length > 0) {
      activeFilterNote.textContent = `(${notes.join(' • ')})`;
      resetFiltersBtn.style.display = 'inline-flex';
    } else {
      activeFilterNote.textContent = '';
      resetFiltersBtn.style.display = 'none';
    }

    // Toggle contextual companion resource banner
    const seriesBanner = document.getElementById('seriesResourceBanner');
    if (seriesBanner) {
      const q = searchQuery.toLowerCase();
      const isUpadeshamrta = activeCategory === 'Upadeshamrta (Seminar)' ||
        q.includes('upadeshamrit') ||
        q.includes('nectar of instruction');
      seriesBanner.style.display = isUpadeshamrta ? 'flex' : 'none';
    }
  }

  // ==========================================================================
  // Continue Hearing / Resume Sadhana Section
  // ==========================================================================
  function renderContinueHearingSection() {
    if (!continueHearingSection || !continueHearingContent) return;

    if (sessionStorage.getItem('hpd_talks_dismiss_continue') === 'true') {
      continueHearingSection.style.display = 'none';
      return;
    }

    const lastYtId = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
    if (!lastYtId || !lectureMapByYtId.has(lastYtId)) {
      continueHearingSection.style.display = 'none';
      return;
    }

    const lecture = lectureMapByYtId.get(lastYtId);
    const isHeard = heardSet.has(lastYtId);
    const isStarred = starredSet.has(lastYtId);
    const badgeLabel = lecture.catalog_id || (typeof lecture.index === 'number' ? `HPD${lecture.index.toString().padStart(4, '0')}` : '');

    // Playback progress
    const prog = playbackProgressMap.get(lastYtId);
    const hasProgress = prog && prog.currentTime > 15 && (!prog.duration || prog.currentTime < prog.duration - 25) && !isHeard;
    const progTimeStr = hasProgress ? formatTime(prog.currentTime) : '';
    const progPercent = hasProgress && prog.duration ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : (hasProgress ? 30 : 0);

    continueHearingContent.innerHTML = `
      <div class="continue-thumb-wrap" role="button" aria-label="Resume ${escapeHtml(lecture.title)}">
        <img class="continue-thumb-img" src="${lecture.thumbnail}" alt="${escapeHtml(lecture.title)}" onerror="this.src='https://img.youtube.com/vi/${lastYtId}/hqdefault.jpg'">
        ${lecture.duration ? `<span class="card-duration-badge">${escapeHtml(lecture.duration)}</span>` : ''}
        ${hasProgress ? `<span class="continue-progress-pill">⏱️ ${progTimeStr}</span>` : ''}
        <div class="continue-play-overlay">
          <div class="continue-play-icon">▶</div>
        </div>
      </div>
      <div class="continue-info">
        <div class="continue-meta-tags">
          ${badgeLabel ? `<span class="badge-catalog">${badgeLabel}</span>` : ''}
          ${lecture.speaker && lecture.speaker !== 'HG Hari Parshad Das' ? `<span class="badge-speaker">🎙️ ${escapeHtml(lecture.speaker)}</span>` : ''}
          <span class="badge-category">${escapeHtml(lecture.category)}</span>
          ${lecture.subcategory ? `<span class="badge-subcategory">${escapeHtml(lecture.subcategory)}</span>` : ''}
        </div>
        <h3 class="continue-title" title="${escapeHtml(lecture.title)}">${escapeHtml(lecture.title)}</h3>
        <div class="continue-meta-sub">
          <span>📅 ${formatDisplayDate(lecture.upload_date)}</span>
          <span>•</span>
          <span>${escapeHtml(lecture.channel)}</span>
        </div>
        ${hasProgress ? `
          <div class="continue-progress-wrap" id="continueProgressWrap">
            <div class="continue-progress-bar">
              <div class="continue-progress-fill" style="width: ${progPercent}%;"></div>
            </div>
            <span class="continue-progress-text">⏱️ Left off at ${progTimeStr} (${progPercent}% completed)</span>
          </div>
        ` : ''}
        <div class="continue-actions">
          <button class="btn-resume" id="btnResumeLecture">
            <span>▶</span>
            <span>${hasProgress ? `Resume from ${progTimeStr}` : 'Resume Lecture'}</span>
          </button>
          <button class="btn-stream-audio" id="btnContinueStreamAudio" title="Stream Audio in Bottom Player without opening video modal">
            <span class="audio-pulse-icon">🎧</span>
            <span>Stream Audio</span>
          </button>
          ${hasProgress ? `
            <button class="btn btn-sm btn-ghost" id="btnContinueRestart" title="Start this lecture from 0:00">
              <span>↺ 0:00</span>
            </button>
          ` : ''}
          <button class="btn btn-sm ${isHeard ? 'btn-primary' : 'btn-secondary'}" id="btnContinueToggleHeard">
            <span>${isHeard ? '✓ Heard' : 'Mark as Heard'}</span>
          </button>
          <button class="btn btn-sm btn-ghost" id="btnContinueToggleStar" title="Favorite">
            <span>${isStarred ? '★ Favorited' : '☆ Favorite'}</span>
          </button>
        </div>
      </div>
    `;

    continueHearingSection.style.display = 'block';

    const resumeAction = (startTime) => {
      let idx = filteredLectures.findIndex(l => (l.yt_id || l.id) === lastYtId);
      if (idx === -1) {
        resetAllFilters();
        idx = filteredLectures.findIndex(l => (l.yt_id || l.id) === lastYtId);
      }
      if (idx !== -1) {
        openPlayerModal(idx, startTime);
      }
    };

    const thumbWrap = continueHearingContent.querySelector('.continue-thumb-wrap');
    const resumeBtn = continueHearingContent.querySelector('#btnResumeLecture');
    const restartBtn = continueHearingContent.querySelector('#btnContinueRestart');
    const streamAudioBtn = continueHearingContent.querySelector('#btnContinueStreamAudio');

    if (thumbWrap) thumbWrap.addEventListener('click', () => resumeAction());
    if (resumeBtn) resumeBtn.addEventListener('click', () => resumeAction());
    if (restartBtn) restartBtn.addEventListener('click', () => resumeAction(0));
    if (streamAudioBtn) {
      streamAudioBtn.addEventListener('click', () => {
        let startTime = 0;
        if (prog && prog.currentTime && prog.currentTime > 2) {
          startTime = prog.currentTime;
        }
        startAudioStream(lastYtId, startTime);
      });
    }

    const toggleHeardBtn = continueHearingContent.querySelector('#btnContinueToggleHeard');
    if (toggleHeardBtn) {
      toggleHeardBtn.addEventListener('click', () => {
        toggleHeardStatus(lastYtId);
        renderContinueHearingSection();
      });
    }

    const toggleStarBtn = continueHearingContent.querySelector('#btnContinueToggleStar');
    if (toggleStarBtn) {
      toggleStarBtn.addEventListener('click', () => {
        toggleStarStatus(lastYtId);
        renderContinueHearingSection();
      });
    }
  }

  // ==========================================================================
  // Embedded Video Player Modal & Playback Tracking
  // ==========================================================================
  let playerTrackingTimer = null;
  let ytPlayer = null;

  function startTrackingPlayback() {
    clearInterval(playerTrackingTimer);
    playerTrackingTimer = setInterval(() => {
      if (playerModal.classList.contains('active') && ytPlayerIframe && ytPlayerIframe.contentWindow) {
        try {
          ytPlayerIframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'getCurrentTime'
          }), '*');
          ytPlayerIframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'getDuration'
          }), '*');
        } catch (e) {}

        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          try {
            const curr = ytPlayer.getCurrentTime();
            const dur = ytPlayer.getDuration();
            if (typeof curr === 'number' && curr > 0 && currentPlayingIndex >= 0) {
              const l = filteredLectures[currentPlayingIndex];
              const ytId = l.yt_id || l.id;
              savePlaybackProgress(ytId, curr, dur);
            }
          } catch (e) {}
        }
      }
    }, 2000);
  }

  function stopTrackingPlayback() {
    clearInterval(playerTrackingTimer);
  }

  function updateContinueHearingLiveProgress(ytId, currentTime, duration) {
    if (!continueHearingSection || continueHearingSection.style.display === 'none') return;
    const progressWrap = document.getElementById('continueProgressWrap');
    if (!progressWrap) return;
    const fill = progressWrap.querySelector('.continue-progress-fill');
    const text = progressWrap.querySelector('.continue-progress-text');
    const percent = duration ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `⏱️ Left off at ${formatTime(currentTime)} (${percent}% completed)`;
  }

  // ==========================================================================
  // Unified Docked Player & Video Extension Dock Controller
  // ==========================================================================
  const AUDIO_SPEEDS = [1.0, 1.25, 1.5, 1.75, 2.0];

  function sendIframeCommand(iframeEl, func, args = []) {
    if (iframeEl && iframeEl.contentWindow) {
      try {
        iframeEl.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }), '*');
      } catch (e) {}
    }
  }

  function setVideoExtensionVisible(show) {
    isVideoExpanded = !!show;
    if (dockedBottomPlayer) {
      if (isVideoExpanded) {
        dockedBottomPlayer.classList.add('is-video-visible');
      } else {
        dockedBottomPlayer.classList.remove('is-video-visible');
      }
    }
    if (bpToggleVideoLabel) {
      bpToggleVideoLabel.textContent = isVideoExpanded ? 'Hide Video' : 'Show Video';
    }
    if (bpToggleVideoChevron) {
      bpToggleVideoChevron.textContent = isVideoExpanded ? '∨' : '∧';
    }
  }

  function toggleVideoExtension() {
    setVideoExtensionVisible(!isVideoExpanded);
  }

  function playLecture(lectureOrIndex, { showVideo = true, forcedStartTime = null } = {}) {
    let lecture = null;
    let filteredIndex = -1;

    if (typeof lectureOrIndex === 'number') {
      filteredIndex = lectureOrIndex;
      if (filteredIndex >= 0 && filteredIndex < filteredLectures.length) {
        lecture = filteredLectures[filteredIndex];
      }
    } else if (typeof lectureOrIndex === 'string') {
      const ytId = lectureOrIndex;
      lecture = lectureMapByYtId.get(ytId);
      filteredIndex = filteredLectures.findIndex(l => (l.yt_id || l.id) === ytId);
    } else if (lectureOrIndex && typeof lectureOrIndex === 'object') {
      lecture = lectureOrIndex;
      const ytId = lecture.yt_id || lecture.id;
      filteredIndex = filteredLectures.findIndex(l => (l.yt_id || l.id) === ytId);
    }

    if (!lecture) return;
    const ytId = lecture.yt_id || lecture.id;

    // If same lecture is already active in player
    if (activePlayerYtId === ytId && bpPlayerIframe && bpPlayerIframe.src && bpPlayerIframe.src.includes(ytId)) {
      setVideoExtensionVisible(showVideo);
      if (!isPlayerPlaying) {
        resumePlayer();
      }
      return;
    }

    currentPlayingIndex = filteredIndex;
    activePlayerYtId = ytId;
    activePlayerLecture = lecture;

    // Determine start timestamp
    let startTime = 0;
    if (typeof forcedStartTime === 'number') {
      startTime = Math.max(0, Math.floor(forcedStartTime));
    } else {
      const prog = playbackProgressMap.get(ytId);
      if (prog && prog.currentTime > 5 && (!prog.duration || prog.currentTime < prog.duration - 15)) {
        startTime = Math.floor(prog.currentTime);
      }
    }

    // Convert duration string
    playerDuration = 0;
    if (lecture.duration) {
      const parts = lecture.duration.split(':').map(Number);
      if (parts.length === 3) {
        playerDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        playerDuration = parts[0] * 60 + parts[1];
      }
    }
    playerCurrentTime = startTime;

    // Populate bottom player UI elements
    if (bpTitle) {
      bpTitle.textContent = lecture.title;
      bpTitle.title = lecture.title;
    }
    if (bpSpeaker) bpSpeaker.textContent = lecture.speaker || 'HG Hari Parshad Das';
    if (bpCategory) {
      const subcat = lecture.subcategory ? ` • ${lecture.subcategory}` : '';
      bpCategory.textContent = `${lecture.category}${subcat}`;
    }
    if (bpThumbImg) {
      bpThumbImg.src = lecture.thumbnail || `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      bpThumbImg.alt = lecture.title;
    }
    if (bpDirectYtLink) {
      bpDirectYtLink.href = lecture.url || `https://www.youtube.com/watch?v=${ytId}`;
    }
    if (bpCurrentTime) bpCurrentTime.textContent = formatTime(startTime);
    if (bpTotalDuration) bpTotalDuration.textContent = playerDuration > 0 ? formatTime(playerDuration) : (lecture.duration || '0:00');

    const percent = playerDuration > 0 ? Math.min(100, (startTime / playerDuration) * 100) : 0;
    if (bpProgressSlider) bpProgressSlider.value = percent;
    if (bpSliderFill) bpSliderFill.style.width = `${percent}%`;

    updateBottomPlayerButtons();

    // Show docked player
    if (dockedBottomPlayer) dockedBottomPlayer.style.display = 'block';
    document.body.classList.add('has-bottom-player');

    setVideoExtensionVisible(showVideo);

    // Load iframe
    const startParam = startTime > 0 ? `&start=${startTime}` : '';
    if (bpPlayerIframe) {
      bpPlayerIframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0${startParam}`;
    }

    isPlayerPlaying = true;
    if (bpPlayIcon) bpPlayIcon.textContent = '⏸';
    if (bpPlayPauseBtn) bpPlayPauseBtn.classList.add('playing');
    if (bpLiveWave) bpLiveWave.classList.add('playing');

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, ytId);
      renderContinueHearingSection();
    } catch (e) {}

    history.replaceState(null, '', `#v=${ytId}`);

    if (startTime > 0) {
      showToast(`Resumed playback at ${formatTime(startTime)}`);
    } else {
      showToast(`Playing: ${lecture.title.substring(0, 32)}...`);
    }
  }

  // Backward-compatible bridge aliases
  function openPlayerModal(filteredIndex, forcedStartTime) {
    playLecture(filteredIndex, { showVideo: true, forcedStartTime });
  }

  function startAudioStream(ytId, forcedStartTime) {
    playLecture(ytId, { showVideo: false, forcedStartTime });
  }

  function pausePlayer() {
    if (!activePlayerYtId || !bpPlayerIframe) return;
    sendIframeCommand(bpPlayerIframe, 'pauseVideo');
    isPlayerPlaying = false;
    if (bpPlayIcon) bpPlayIcon.textContent = '▶';
    if (bpPlayPauseBtn) bpPlayPauseBtn.classList.remove('playing');
    if (bpLiveWave) bpLiveWave.classList.remove('playing');
  }

  function resumePlayer() {
    if (!activePlayerYtId || !bpPlayerIframe) return;
    sendIframeCommand(bpPlayerIframe, 'playVideo');
    isPlayerPlaying = true;
    if (bpPlayIcon) bpPlayIcon.textContent = '⏸';
    if (bpPlayPauseBtn) bpPlayPauseBtn.classList.add('playing');
    if (bpLiveWave) bpLiveWave.classList.add('playing');
  }

  function togglePlayerPlayPause() {
    if (!activePlayerYtId) {
      const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
      if (lastPlayed) {
        playLecture(lastPlayed, { showVideo: true });
      }
      return;
    }
    if (isPlayerPlaying) {
      pausePlayer();
    } else {
      resumePlayer();
    }
  }

  function seekPlayerTo(targetSeconds) {
    if (!bpPlayerIframe || !activePlayerYtId) return;
    targetSeconds = Math.max(0, targetSeconds);
    if (playerDuration > 0) {
      targetSeconds = Math.min(playerDuration, targetSeconds);
    }
    playerCurrentTime = targetSeconds;
    sendIframeCommand(bpPlayerIframe, 'seekTo', [targetSeconds, true]);
    if (bpCurrentTime) bpCurrentTime.textContent = formatTime(targetSeconds);
    const percent = playerDuration > 0 ? (targetSeconds / playerDuration) * 100 : 0;
    if (bpProgressSlider) bpProgressSlider.value = percent;
    if (bpSliderFill) bpSliderFill.style.width = `${percent}%`;
    savePlaybackProgress(activePlayerYtId, targetSeconds, playerDuration);
  }

  function stepPlayerSeek(deltaSeconds) {
    seekPlayerTo(playerCurrentTime + deltaSeconds);
  }

  function cyclePlayerSpeed() {
    let nextIdx = (AUDIO_SPEEDS.indexOf(playerPlaybackRate) + 1) % AUDIO_SPEEDS.length;
    playerPlaybackRate = AUDIO_SPEEDS[nextIdx];
    sendIframeCommand(bpPlayerIframe, 'setPlaybackRate', [playerPlaybackRate]);
    if (bpSpeedLabel) bpSpeedLabel.textContent = `${playerPlaybackRate}x`;
    showToast(`Speed: ${playerPlaybackRate}x`);
  }

  function closePlayer() {
    if (bpPlayerIframe) {
      sendIframeCommand(bpPlayerIframe, 'pauseVideo');
      bpPlayerIframe.src = '';
    }
    isPlayerPlaying = false;
    activePlayerYtId = null;
    activePlayerLecture = null;
    currentPlayingIndex = -1;
    if (dockedBottomPlayer) dockedBottomPlayer.style.display = 'none';
    document.body.classList.remove('has-bottom-player');
    savePlaybackProgressToStorage();
    renderContinueHearingSection();
    history.replaceState(null, '', window.location.pathname);
  }

  function playPreviousLecture() {
    if (currentPlayingIndex > 0) {
      playLecture(currentPlayingIndex - 1, { showVideo: isVideoExpanded });
    }
  }

  function playNextLecture() {
    if (currentPlayingIndex >= 0 && currentPlayingIndex < filteredLectures.length - 1) {
      playLecture(currentPlayingIndex + 1, { showVideo: isVideoExpanded });
    }
  }

  function closePlayerModal() {
    closePlayer();
  }

  function updateModalControls() {}

  function updateBottomPlayerButtons() {
    if (!activePlayerYtId) return;
    const isHeard = heardSet.has(activePlayerYtId);
    const isStarred = starredSet.has(activePlayerYtId);

    if (bpHeardBtn && bpHeardIcon) {
      if (isHeard) {
        bpHeardBtn.classList.add('active');
        bpHeardIcon.textContent = '✓';
        bpHeardBtn.title = 'Heard (Click to unmark)';
      } else {
        bpHeardBtn.classList.remove('active');
        bpHeardIcon.textContent = '✓';
        bpHeardBtn.title = 'Mark as Heard';
      }
    }

    if (bpStarBtn && bpStarIcon) {
      if (isStarred) {
        bpStarBtn.classList.add('active');
        bpStarIcon.textContent = '★';
        bpStarIcon.title = 'Favorited (Click to remove)';
      } else {
        bpStarBtn.classList.remove('active');
        bpStarIcon.textContent = '★';
        bpStarIcon.title = 'Add to Favorites';
      }
    }

    if (bpPrevBtn) bpPrevBtn.disabled = currentPlayingIndex <= 0;
    if (bpNextBtn) bpNextBtn.disabled = currentPlayingIndex < 0 || currentPlayingIndex >= filteredLectures.length - 1;
  }

  function checkUrlHashForLecture() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#v=')) {
      const targetYtId = hash.replace('#v=', '').trim();
      if (lectureMapByYtId.has(targetYtId)) {
        setTimeout(() => playLecture(targetYtId, { showVideo: true }), 200);
      }
    } else if (hash && hash.startsWith('#s=')) {
      const targetShortId = hash.replace('#s=', '').trim();
      switchContentMode('shorts');
      setTimeout(() => openShortModalById(targetShortId), 200);
    } else if (hash === '#shorts') {
      switchContentMode('shorts');
    }
  }

  // ==========================================================================
  // Content Mode Navigation (Kathas vs Upadesh Shorts)
  // ==========================================================================
  function switchContentMode(mode) {
    if (mode === activeContentMode) return;
    activeContentMode = mode;

    if (mode === 'shorts') {
      if (tabKathasBtn) tabKathasBtn.classList.remove('active');
      if (tabShortsBtn) tabShortsBtn.classList.add('active');
      if (kathasViewSection) kathasViewSection.style.display = 'none';
      if (shortsViewSection) shortsViewSection.style.display = 'block';
      applyShortsFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (tabShortsBtn) tabShortsBtn.classList.remove('active');
      if (tabKathasBtn) tabKathasBtn.classList.add('active');
      if (shortsViewSection) shortsViewSection.style.display = 'none';
      if (kathasViewSection) kathasViewSection.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ==========================================================================
  // Shorts Logic & Rendering
  // ==========================================================================
  function applyShortsFilters() {
    let result = [...allShorts];

    // Text search query
    if (shortsSearchQuery.trim()) {
      const q = shortsSearchQuery.toLowerCase().trim();
      result = result.filter(s => {
        return (s.title && s.title.toLowerCase().includes(q)) ||
          (s.raw_title && s.raw_title.toLowerCase().includes(q)) ||
          (s.catalog_id && s.catalog_id.toLowerCase().includes(q));
      });
    }

    // Watched / Unwatched filter
    if (activeShortsFilter === 'watched') {
      result = result.filter(s => shortsWatchedSet.has(s.yt_id || s.id));
    } else if (activeShortsFilter === 'unwatched') {
      result = result.filter(s => !shortsWatchedSet.has(s.yt_id || s.id));
    }

    filteredShorts = result;
    updateShortsStats();
    renderShortsGrid();
  }

  function updateShortsStats() {
    const total = allShorts.length;
    const watched = shortsWatchedSet.size;
    const unwatched = Math.max(0, total - watched);

    if (shortsWatchedCount) shortsWatchedCount.textContent = watched;
    if (shortsTotalCount) shortsTotalCount.textContent = total;
    if (shortsFilterAllCount) shortsFilterAllCount.textContent = total;
    if (shortsFilterUnwatchedCount) shortsFilterUnwatchedCount.textContent = unwatched;
    if (shortsFilterWatchedCount) shortsFilterWatchedCount.textContent = watched;
    if (navShortsCount) navShortsCount.textContent = total;
  }

  function renderShortsGrid() {
    if (!shortsGrid) return;
    shortsGrid.innerHTML = '';

    if (filteredShorts.length === 0) {
      if (shortsEmptyState) shortsEmptyState.style.display = 'block';
      return;
    }

    if (shortsEmptyState) shortsEmptyState.style.display = 'none';

    const fragment = document.createDocumentFragment();

    filteredShorts.forEach((short, idx) => {
      const ytId = short.yt_id || short.id;
      const isWatched = shortsWatchedSet.has(ytId);

      const card = document.createElement('article');
      card.className = `short-card ${isWatched ? 'watched' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Watch ${short.title}`);

      card.innerHTML = `
        <div class="short-thumb-wrap">
          <img class="short-thumb-img" src="${short.thumbnail}" alt="${escapeHtml(short.title)}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'">
          <div class="short-play-overlay">
            <div class="short-play-icon">▶</div>
          </div>
          <span class="short-badge-id">${short.catalog_id}</span>
          ${isWatched ? '<span class="short-badge-watched">✓ Watched</span>' : ''}
        </div>
        <div class="short-card-body">
          <h4 class="short-card-title" title="${escapeHtml(short.title)}">${escapeHtml(short.title)}</h4>
          <div class="short-card-footer">
            <button class="btn-short-watched ${isWatched ? 'active' : ''}" data-ytid="${ytId}">
              <span>${isWatched ? '✓ Watched' : 'Mark Watched'}</span>
            </button>
            <a href="${short.shorts_url || short.url}" target="_blank" rel="noopener noreferrer" class="btn-short-open-yt" title="Open on YouTube Shorts">
              ↗ YouTube
            </a>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-short-watched') || e.target.closest('.btn-short-open-yt')) {
          return;
        }
        openShortPlayer(idx);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.btn-short-watched') || e.target.closest('.btn-short-open-yt')) {
            return;
          }
          e.preventDefault();
          openShortPlayer(idx);
        }
      });

      const watchedBtn = card.querySelector('.btn-short-watched');
      if (watchedBtn) {
        watchedBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleShortWatchedStatus(ytId);
        });
      }

      fragment.appendChild(card);
    });

    shortsGrid.appendChild(fragment);
  }

  function toggleShortWatchedStatus(ytId) {
    if (!ytId) return;
    const isWatched = shortsWatchedSet.has(ytId);
    if (isWatched) {
      shortsWatchedSet.delete(ytId);
      showToast('Marked short as unwatched');
    } else {
      shortsWatchedSet.add(ytId);
      showToast('Marked short as watched ✓');
    }
    saveShortsWatchedData();
    applyShortsFilters();
    updateShortModalState();
  }

  // ==========================================================================
  // Shorts Modal Player
  // ==========================================================================
  function openShortPlayer(index) {
    if (index < 0 || index >= filteredShorts.length) return;
    currentPlayingShortIndex = index;
    const short = filteredShorts[index];
    const ytId = short.yt_id || short.id;

    if (shortsModalBadge) shortsModalBadge.textContent = short.catalog_id;
    if (shortsModalTitle) shortsModalTitle.textContent = short.title;
    if (shortsModalDirectLink) shortsModalDirectLink.href = short.shorts_url || `https://www.youtube.com/shorts/${ytId}`;

    if (shortsIframe) {
      shortsIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&loop=1`;
    }

    updateShortModalState();

    if (shortsPlayerModal) {
      shortsPlayerModal.classList.add('active');
      shortsPlayerModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    history.replaceState(null, '', `#s=${ytId}`);
  }

  function openShortModalById(ytId) {
    if (!ytId) return;
    const idx = allShorts.findIndex(s => (s.yt_id || s.id) === ytId);
    if (idx !== -1) {
      shortsSearchQuery = '';
      if (shortsSearchInput) shortsSearchInput.value = '';
      activeShortsFilter = 'all';
      const pills = document.querySelectorAll('.shorts-filter-pills .pill-btn');
      pills.forEach(p => {
        p.classList.toggle('active', p.dataset.shortsFilter === 'all');
      });
      applyShortsFilters();
      const filteredIdx = filteredShorts.findIndex(s => (s.yt_id || s.id) === ytId);
      openShortPlayer(filteredIdx !== -1 ? filteredIdx : 0);
    }
  }

  function updateShortModalState() {
    if (currentPlayingShortIndex < 0 || currentPlayingShortIndex >= filteredShorts.length) return;
    const short = filteredShorts[currentPlayingShortIndex];
    const ytId = short.yt_id || short.id;
    const isWatched = shortsWatchedSet.has(ytId);

    if (shortsModalWatchedBtn) {
      shortsModalWatchedBtn.classList.toggle('active', isWatched);
      const txt = shortsModalWatchedBtn.querySelector('.heard-text');
      if (txt) txt.textContent = isWatched ? 'Watched ✓' : 'Mark as Watched';
    }

    if (shortsModalPrevBtn) shortsModalPrevBtn.disabled = currentPlayingShortIndex <= 0;
    if (shortsModalNextBtn) shortsModalNextBtn.disabled = currentPlayingShortIndex >= filteredShorts.length - 1;
  }

  function closeShortPlayer() {
    if (shortsPlayerModal) {
      shortsPlayerModal.classList.remove('active');
      shortsPlayerModal.setAttribute('aria-hidden', 'true');
    }
    if (shortsIframe) shortsIframe.src = '';
    currentPlayingShortIndex = -1;
    document.body.style.overflow = '';
    history.replaceState(null, '', window.location.pathname);
  }

  function playPreviousShort() {
    if (currentPlayingShortIndex > 0) {
      openShortPlayer(currentPlayingShortIndex - 1);
    }
  }

  function playNextShort() {
    if (currentPlayingShortIndex < filteredShorts.length - 1) {
      openShortPlayer(currentPlayingShortIndex + 1);
    }
  }

  // ==========================================================================
  // Surprise Me / Random Talk
  // ==========================================================================
  function playRandomTalk() {
    let pool = allLectures.filter(l => !heardSet.has(l.yt_id || l.id));
    if (pool.length === 0) {
      pool = allLectures;
    }

    if (pool.length === 0) {
      showToast('No lectures found!');
      return;
    }

    const randomLecture = pool[Math.floor(Math.random() * pool.length)];
    const targetYtId = randomLecture.yt_id || randomLecture.id;

    resetAllFilters();
    searchQuery = targetYtId;
    searchInput.value = targetYtId;
    applyFilters();

    openPlayerModal(0);
    showToast(`Now playing: ${randomLecture.title.substring(0, 35)}...`);
  }

  // ==========================================================================
  // Reset All Filters
  // ==========================================================================
  function resetAllFilters() {
    searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';

    activeStatus = 'all';
    statusTabs.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.status === 'all');
    });

    activeCategory = 'all';
    categorySelect.value = 'all';
    updateSubcategoryDropdown('all');
    updateChipActiveState();

    activeSpeaker = 'all';
    if (speakerSelect) speakerSelect.value = 'all';

    activeChannel = 'all';
    channelSelect.value = 'all';

    activeSort = 'default';
    sortSelect.value = 'default';

    applyFilters();
  }

  // ==========================================================================
  // Export & Import Progress
  // ==========================================================================
  function exportUserData() {
    const progressObj = {};
    playbackProgressMap.forEach((v, k) => {
      progressObj[k] = v;
    });

    const data = {
      version: 2,
      idType: "youtube_video_id_11char",
      exportDate: new Date().toISOString(),
      totalHeard: heardSet.size,
      heardYouTubeIds: Array.from(heardSet),
      starredYouTubeIds: Array.from(starredSet),
      playbackProgress: progressObj
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hpd-lectures-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Progress backup downloaded successfully (YouTube IDs)!');
  }

  function importUserData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const incomingHeard = json.heardYouTubeIds || json.heardIds || [];
        const incomingStarred = json.starredYouTubeIds || json.starredIds || [];

        let count = 0;
        if (Array.isArray(incomingHeard)) {
          incomingHeard.forEach(id => {
            const resolved = resolveToYtId(id);
            if (resolved) {
              heardSet.add(resolved);
              count++;
            }
          });
        }
        if (Array.isArray(incomingStarred)) {
          incomingStarred.forEach(id => {
            const resolved = resolveToYtId(id);
            if (resolved) starredSet.add(resolved);
          });
        }

        if (json.playbackProgress && typeof json.playbackProgress === 'object') {
          Object.keys(json.playbackProgress).forEach(k => {
            const resolved = resolveToYtId(k);
            if (resolved) {
              playbackProgressMap.set(resolved, json.playbackProgress[k]);
            }
          });
          savePlaybackProgressToStorage();
        }

        saveHeardData();
        saveStarredData();
        updateGlobalStats();
        applyFilters();

        showToast(`Imported progress: ${count} heard talks restored!`);
        closeBackupModal();
      } catch (err) {
        showToast('Error reading backup file. Please verify JSON format.');
      }
    };
    reader.readAsText(file);
  }

  function resetAllProgress() {
    if (confirm('Are you sure you want to reset all your heard lecture history? This will clear your local storage progress.')) {
      heardSet.clear();
      starredSet.clear();
      playbackProgressMap.clear();
      saveHeardData();
      saveStarredData();
      savePlaybackProgressToStorage();
      updateGlobalStats();
      applyFilters();
      showToast('All progress reset to 0');
      closeBackupModal();
    }
  }

  function openBackupModal() {
    updateGlobalStats();
    backupModal.classList.add('active');
    backupModal.setAttribute('aria-hidden', 'false');
  }

  function closeBackupModal() {
    backupModal.classList.remove('active');
    backupModal.setAttribute('aria-hidden', 'true');
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    appToast.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2800);
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================
  function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
      applyFilters();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      applyFilters();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== shortsSearchInput && !playerModal.classList.contains('active') && (!shortsPlayerModal || !shortsPlayerModal.classList.contains('active'))) {
        e.preventDefault();
        if (activeContentMode === 'shorts' && shortsSearchInput) {
          shortsSearchInput.focus();
          shortsSearchInput.select();
        } else {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape') {
        if (shortsPlayerModal && shortsPlayerModal.classList.contains('active')) {
          closeShortPlayer();
        } else if (backupModal.classList.contains('active')) {
          closeBackupModal();
        } else if (resourcesModal && resourcesModal.classList.contains('active')) {
          closeResourcesModal();
        } else if (activePlayerYtId && isVideoExpanded) {
          setVideoExtensionVisible(false);
        } else if (activePlayerYtId) {
          closePlayer();
        }
      } else if (shortsPlayerModal && shortsPlayerModal.classList.contains('active')) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          playPreviousShort();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          playNextShort();
        }
      } else if (activePlayerYtId && (!shortsPlayerModal || !shortsPlayerModal.classList.contains('active'))) {
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
        if (!isInput) {
          if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePlayerPlayPause();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            stepPlayerSeek(-10);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            stepPlayerSeek(10);
          }
        }
      }
    });

    statusTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      statusTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.dataset.status;
      applyFilters();
    });

    categorySelect.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      updateSubcategoryDropdown(activeCategory);
      updateChipActiveState();
      applyFilters();
    });

    if (subcategorySelect) {
      subcategorySelect.addEventListener('change', (e) => {
        activeSubcategory = e.target.value;
        applyFilters();
      });
    }

    if (speakerSelect) {
      speakerSelect.addEventListener('change', (e) => {
        activeSpeaker = e.target.value;
        applyFilters();
      });
    }

    channelSelect.addEventListener('change', (e) => {
      activeChannel = e.target.value;
      applyFilters();
    });

    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      applyFilters();
    });

    viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    viewListBtn.addEventListener('click', () => setViewMode('list'));

    themeToggleBtn.addEventListener('click', toggleTheme);
    randomTalkBtn.addEventListener('click', playRandomTalk);

    resetFiltersBtn.addEventListener('click', resetAllFilters);
    emptyResetBtn.addEventListener('click', resetAllFilters);

    if (dismissContinueBtn) {
      dismissContinueBtn.addEventListener('click', () => {
        sessionStorage.setItem('hpd_talks_dismiss_continue', 'true');
        if (continueHearingSection) continueHearingSection.style.display = 'none';
      });
    }

    loadMoreBtn.addEventListener('click', () => renderNextBatch(BATCH_SIZE));
    loadAllBtn.addEventListener('click', () => renderNextBatch(filteredLectures.length));

    modalCloseBtn.addEventListener('click', closePlayerModal);
    playerOverlay.addEventListener('click', closePlayerModal);
    modalPrevBtn.addEventListener('click', playPreviousLecture);
    modalNextBtn.addEventListener('click', playNextLecture);

    // Docked Bottom Player & Video Extension Dock Events
    if (bpPlayPauseBtn) bpPlayPauseBtn.addEventListener('click', togglePlayerPlayPause);
    if (bpRewind10Btn) bpRewind10Btn.addEventListener('click', () => stepPlayerSeek(-10));
    if (bpForward10Btn) bpForward10Btn.addEventListener('click', () => stepPlayerSeek(10));
    if (bpPrevBtn) bpPrevBtn.addEventListener('click', playPreviousLecture);
    if (bpNextBtn) bpNextBtn.addEventListener('click', playNextLecture);
    if (bpSpeedBtn) bpSpeedBtn.addEventListener('click', cyclePlayerSpeed);
    if (bpSwitchToAudioBtn) bpSwitchToAudioBtn.addEventListener('click', () => setVideoExtensionVisible(false));
    if (bpToggleVideoBtn) bpToggleVideoBtn.addEventListener('click', toggleVideoExtension);
    if (bpThumbWrap) bpThumbWrap.addEventListener('click', toggleVideoExtension);
    if (bpCloseBtn) bpCloseBtn.addEventListener('click', closePlayer);

    if (bpHeardBtn) {
      bpHeardBtn.addEventListener('click', () => {
        if (activePlayerYtId) {
          toggleHeardStatus(activePlayerYtId);
          updateBottomPlayerButtons();
        }
      });
    }

    if (bpStarBtn) {
      bpStarBtn.addEventListener('click', () => {
        if (activePlayerYtId) {
          toggleStarStatus(activePlayerYtId);
          updateBottomPlayerButtons();
        }
      });
    }

    if (bpProgressSlider) {
      bpProgressSlider.addEventListener('input', (e) => {
        isSeekingPlayer = true;
        const val = parseFloat(e.target.value);
        if (bpSliderFill) bpSliderFill.style.width = `${val}%`;
        if (playerDuration > 0 && bpCurrentTime) {
          const previewSec = (val / 100) * playerDuration;
          bpCurrentTime.textContent = formatTime(previewSec);
        }
      });

      bpProgressSlider.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (playerDuration > 0) {
          const targetSec = (val / 100) * playerDuration;
          seekPlayerTo(targetSec);
        }
        isSeekingPlayer = false;
      });
    }

    if (bpPlayerIframe) {
      bpPlayerIframe.addEventListener('load', () => {
        try {
          bpPlayerIframe.contentWindow.postMessage('{"event":"listening"}', '*');
        } catch (e) {}
      });
    }

    modalHeardBtn.addEventListener('click', () => {
      if (currentPlayingIndex >= 0) {
        const l = filteredLectures[currentPlayingIndex];
        toggleHeardStatus(l.yt_id || l.id);
      }
    });

    modalStarBtn.addEventListener('click', () => {
      if (currentPlayingIndex >= 0) {
        const l = filteredLectures[currentPlayingIndex];
        toggleStarStatus(l.yt_id || l.id);
      }
    });

    headerProgressWidget.addEventListener('click', openBackupModal);
    openBackupBtn.addEventListener('click', openBackupModal);
    closeBackupModalBtn.addEventListener('click', closeBackupModal);
    backupOverlay.addEventListener('click', closeBackupModal);

    // Study Resources Modal
    function openResourcesModal() {
      if (resourcesModal) {
        resourcesModal.classList.add('active');
        resourcesModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeResourcesModal() {
      if (resourcesModal) {
        resourcesModal.classList.remove('active');
        resourcesModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    if (openResourcesBtn) openResourcesBtn.addEventListener('click', openResourcesModal);
    if (closeResourcesModalBtn) closeResourcesModalBtn.addEventListener('click', closeResourcesModal);
    if (resourcesOverlay) resourcesOverlay.addEventListener('click', closeResourcesModal);

    if (filterUpadeshamritaBtn) {
      filterUpadeshamritaBtn.addEventListener('click', () => {
        closeResourcesModal();
        activeCategory = 'Upadeshamrta (Seminar)';
        categorySelect.value = 'Upadeshamrta (Seminar)';
        updateSubcategoryDropdown('Upadeshamrta (Seminar)');
        updateChipActiveState();
        applyFilters();
        const ctrls = document.querySelector('.controls-section');
        if (ctrls) {
          window.scrollTo({ top: ctrls.offsetTop - 15, behavior: 'smooth' });
        }
      });
    }

    exportDataBtn.addEventListener('click', exportUserData);
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importUserData(e.target.files[0]);
        e.target.value = '';
      }
    });
    resetProgressBtn.addEventListener('click', resetAllProgress);

    // Navigation Mode Switcher Tabs
    if (tabKathasBtn) tabKathasBtn.addEventListener('click', () => switchContentMode('kathas'));
    if (tabShortsBtn) tabShortsBtn.addEventListener('click', () => switchContentMode('shorts'));

    // Shorts Search & Filters
    if (shortsSearchInput) {
      shortsSearchInput.addEventListener('input', (e) => {
        shortsSearchQuery = e.target.value;
        if (clearShortsSearchBtn) clearShortsSearchBtn.style.display = shortsSearchQuery ? 'flex' : 'none';
        applyShortsFilters();
      });
    }

    if (clearShortsSearchBtn) {
      clearShortsSearchBtn.addEventListener('click', () => {
        shortsSearchQuery = '';
        if (shortsSearchInput) {
          shortsSearchInput.value = '';
          shortsSearchInput.focus();
        }
        clearShortsSearchBtn.style.display = 'none';
        applyShortsFilters();
      });
    }

    // Shorts Filter Pills
    const shortsPills = document.querySelectorAll('.shorts-filter-pills .pill-btn');
    shortsPills.forEach(pill => {
      pill.addEventListener('click', () => {
        shortsPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeShortsFilter = pill.dataset.shortsFilter || 'all';
        applyShortsFilters();
      });
    });

    if (shortsEmptyResetBtn) {
      shortsEmptyResetBtn.addEventListener('click', () => {
        shortsSearchQuery = '';
        if (shortsSearchInput) shortsSearchInput.value = '';
        if (clearShortsSearchBtn) clearShortsSearchBtn.style.display = 'none';
        activeShortsFilter = 'all';
        shortsPills.forEach(p => {
          p.classList.toggle('active', p.dataset.shortsFilter === 'all');
        });
        applyShortsFilters();
      });
    }

    // Shorts Player Modal Events
    if (shortsModalCloseBtn) shortsModalCloseBtn.addEventListener('click', closeShortPlayer);
    if (shortsPlayerOverlay) shortsPlayerOverlay.addEventListener('click', closeShortPlayer);
    if (shortsModalPrevBtn) shortsModalPrevBtn.addEventListener('click', playPreviousShort);
    if (shortsModalNextBtn) shortsModalNextBtn.addEventListener('click', playNextShort);
    if (shortsModalWatchedBtn) {
      shortsModalWatchedBtn.addEventListener('click', () => {
        if (currentPlayingShortIndex >= 0 && currentPlayingShortIndex < filteredShorts.length) {
          const s = filteredShorts[currentPlayingShortIndex];
          toggleShortWatchedStatus(s.yt_id || s.id);
        }
      });
    }

    // YouTube Iframe load event to initiate postMessage handshake
    if (ytPlayerIframe) {
      ytPlayerIframe.addEventListener('load', () => {
        try {
          ytPlayerIframe.contentWindow.postMessage('{"event":"listening"}', '*');
        } catch (e) {}
      });
    }

    // PostMessage listener for YouTube Iframe playback progress
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }

      if (data && data.event === 'infoDelivery' && data.info) {
        // 1. Video Player Modal Progress
        if (currentPlayingIndex >= 0 && currentPlayingIndex < filteredLectures.length) {
          const l = filteredLectures[currentPlayingIndex];
          const ytId = l.yt_id || l.id;
          const curr = data.info.currentTime;
          const dur = data.info.duration;

          if (typeof curr === 'number' && curr > 0) {
            savePlaybackProgress(ytId, curr, dur);
          }

          if (data.info.playerState === 0) { // Video ended
            if (!heardSet.has(ytId)) {
              toggleHeardStatus(ytId);
              showToast('Lecture completed! Marked as Heard ✓');
            }
          }
        }

        // 2. Docked Bottom Player & Video Extension Dock Progress
        if (activePlayerYtId && data.info.currentTime !== undefined) {
          const curr = data.info.currentTime;
          const dur = data.info.duration || playerDuration;

          if (typeof curr === 'number' && curr >= 0) {
            playerCurrentTime = curr;
            if (dur && dur > 0) playerDuration = dur;

            if (!isSeekingPlayer) {
              if (bpCurrentTime) bpCurrentTime.textContent = formatTime(curr);
              if (playerDuration > 0) {
                if (bpTotalDuration) bpTotalDuration.textContent = formatTime(playerDuration);
                const pct = Math.min(100, (curr / playerDuration) * 100);
                if (bpProgressSlider) bpProgressSlider.value = pct;
                if (bpSliderFill) bpSliderFill.style.width = `${pct}%`;
              }
            }

            savePlaybackProgress(activePlayerYtId, curr, dur);
          }

          if (data.info.playerState === 1) { // Playing
            isPlayerPlaying = true;
            if (bpPlayIcon) bpPlayIcon.textContent = '⏸';
            if (bpPlayPauseBtn) bpPlayPauseBtn.classList.add('playing');
            if (bpLiveWave) bpLiveWave.classList.add('playing');
          } else if (data.info.playerState === 2) { // Paused
            isPlayerPlaying = false;
            if (bpPlayIcon) bpPlayIcon.textContent = '▶';
            if (bpPlayPauseBtn) bpPlayPauseBtn.classList.remove('playing');
            if (bpLiveWave) bpLiveWave.classList.remove('playing');
          } else if (data.info.playerState === 0) { // Ended
            if (!heardSet.has(activePlayerYtId)) {
              toggleHeardStatus(activePlayerYtId);
              showToast('Lecture completed! Marked as Heard ✓');
              updateBottomPlayerButtons();
            }
          }
        }
      }
    });
  }

  // YouTube Iframe API Ready Global Callback
  window.onYouTubeIframeAPIReady = function () {
    try {
      if (window.YT && window.YT.Player && ytPlayerIframe) {
        ytPlayer = new YT.Player('ytPlayerIframe', {
          events: {
            'onStateChange': (event) => {
              if (event.data === 0) { // ENDED
                if (currentPlayingIndex >= 0 && currentPlayingIndex < filteredLectures.length) {
                  const l = filteredLectures[currentPlayingIndex];
                  const ytId = l.yt_id || l.id;
                  if (!heardSet.has(ytId)) {
                    toggleHeardStatus(ytId);
                    showToast('Lecture completed! Marked as Heard ✓');
                  }
                }
              }
            }
          }
        });
      }
    } catch (e) {}
  };

  // ==========================================================================
  // Utilities
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
