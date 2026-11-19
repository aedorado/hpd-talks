/**
 * HG Hari Parshad Das — Katha Sangraha
 * Core Application Logic & Local Storage Management
 */

(function () {
  'use strict';

  // Local Storage Keys
  const STORAGE_KEYS = {
    HEARD: 'hpd_talks_heard_v1',
    STARRED: 'hpd_talks_starred_v1',
    THEME: 'hpd_talks_theme_v1',
    VIEW: 'hpd_talks_view_v1'
  };

  // State
  let allLectures = [];
  let filteredLectures = [];
  let heardSet = new Set();
  let starredSet = new Set();

  let activeStatus = 'all'; // 'all', 'unheard', 'heard', 'starred'
  let activeCategory = 'all';
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

  const appToast = document.getElementById('appToast');

  // ==========================================================================
  // Initialization
  // ==========================================================================
  async function init() {
    loadTheme();
    loadViewMode();
    loadLocalStorageData();

    await loadLecturesData();

    populateFilterOptions();
    renderQuickChips();
    setupEventListeners();

    applyFilters();
    updateGlobalStats();
  }

  // ==========================================================================
  // Load Lectures Dataset (HTTP Fetch with fallback to window.LECTURES_DATA)
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
      // Offline or file:// protocol fallback
      if (window.LECTURES_DATA && Array.isArray(window.LECTURES_DATA)) {
        allLectures = window.LECTURES_DATA;
      } else {
        console.error('Failed to load lectures data:', err);
      }
    }
  }

  // ==========================================================================
  // LocalStorage Helpers
  // ==========================================================================
  function loadLocalStorageData() {
    try {
      const savedHeard = localStorage.getItem(STORAGE_KEYS.HEARD);
      if (savedHeard) {
        heardSet = new Set(JSON.parse(savedHeard));
      }
    } catch (e) {
      heardSet = new Set();
    }

    try {
      const savedStarred = localStorage.getItem(STORAGE_KEYS.STARRED);
      if (savedStarred) {
        starredSet = new Set(JSON.parse(savedStarred));
      }
    } catch (e) {
      starredSet = new Set();
    }
  }

  function saveHeardData() {
    try {
      localStorage.setItem(STORAGE_KEYS.HEARD, JSON.stringify(Array.from(heardSet)));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  function saveStarredData() {
    try {
      localStorage.setItem(STORAGE_KEYS.STARRED, JSON.stringify(Array.from(starredSet)));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
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
  // Populate Filter Dropdowns & Quick Chips
  // ==========================================================================
  function populateFilterOptions() {
    const categoriesMap = {};
    const channelsMap = {};

    allLectures.forEach(l => {
      categoriesMap[l.category] = (categoriesMap[l.category] || 0) + 1;
      channelsMap[l.channel] = (channelsMap[l.channel] || 0) + 1;
    });

    // Populate Category Dropdown
    const sortedCategories = Object.keys(categoriesMap).sort((a, b) => categoriesMap[b] - categoriesMap[a]);
    categorySelect.innerHTML = `<option value="all">All Topics (${allLectures.length})</option>`;
    sortedCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${cat} (${categoriesMap[cat]})`;
      categorySelect.appendChild(opt);
    });

    // Populate Channel Dropdown
    const sortedChannels = Object.keys(channelsMap).sort((a, b) => channelsMap[b] - channelsMap[a]);
    channelSelect.innerHTML = `<option value="all">All Channels</option>`;
    sortedChannels.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = `${ch} (${channelsMap[ch]})`;
      channelSelect.appendChild(opt);
    });
  }

  function renderQuickChips() {
    const popularCategories = [
      'Srimad Bhagavatam',
      'Bhakti-rasamrita-sindhu',
      'Bhagavad Gita',
      'Damodara Lila',
      'Radha Tattva',
      'Padyavali',
      'Caitanya Caritamrta',
      'Janmashtami',
      'Retreats/Seminars',
      'Krishna Lila',
      'Nityananda'
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
      const isHeard = heardSet.has(lecture.id);
      const isStarred = starredSet.has(lecture.id);

      // Status tab filter
      if (activeStatus === 'heard' && !isHeard) return false;
      if (activeStatus === 'unheard' && isHeard) return false;
      if (activeStatus === 'starred' && !isStarred) return false;

      // Category filter
      if (activeCategory !== 'all' && lecture.category !== activeCategory) {
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
        const chanMatch = lecture.channel.toLowerCase().includes(query);
        const idMatch = lecture.id.toLowerCase().includes(query);
        if (!titleMatch && !catMatch && !chanMatch && !idMatch) {
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
      filteredLectures.sort((a, b) => a.category.localeCompare(b.category) || a.index - b.index);
    }
  }

  // ==========================================================================
  // Batch Rendering (Smooth Performance for 543 Items)
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

    // Update Load More Bar
    const remaining = filteredLectures.length - currentlyDisplayed;
    if (remaining > 0) {
      paginationBar.style.display = 'flex';
      remainingCount.textContent = remaining;
    } else {
      paginationBar.style.display = 'none';
    }
  }

  // ==========================================================================
  // Create Single Lecture Card Element
  // ==========================================================================
  function createLectureCard(lecture, filteredIndex) {
    const card = document.createElement('article');
    card.className = `lecture-card ${heardSet.has(lecture.id) ? 'is-heard' : ''}`;
    card.id = `card-${lecture.id}`;
    card.dataset.id = lecture.id;

    const isHeard = heardSet.has(lecture.id);
    const isStarred = starredSet.has(lecture.id);

    // Highlight search match in title
    let displayTitle = escapeHtml(lecture.title);
    if (searchQuery.trim().length > 1) {
      const reg = new RegExp(`(${escapeRegExp(searchQuery.trim())})`, 'gi');
      displayTitle = displayTitle.replace(reg, '<mark>$1</mark>');
    }

    card.innerHTML = `
      <div class="card-thumb-wrap" role="button" aria-label="Play ${escapeHtml(lecture.title)}">
        <img 
          class="card-thumb-img" 
          src="${lecture.thumbnail}" 
          alt="${escapeHtml(lecture.title)}"
          loading="lazy"
          onerror="this.src='https://img.youtube.com/vi/${lecture.yt_id}/hqdefault.jpg'"
        >
        <span class="card-id-badge">#${lecture.id}</span>
        <span class="card-heard-tag">✓ Heard</span>
        <div class="card-play-overlay">
          <div class="play-circle">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="card-tags">
          <span class="badge-category" title="Topic: ${escapeHtml(lecture.category)}">${escapeHtml(lecture.category)}</span>
          <span class="badge-channel" title="Channel: ${escapeHtml(lecture.channel)}">${escapeHtml(lecture.channel)}</span>
        </div>

        <h3 class="card-title" title="${escapeHtml(lecture.title)}">${displayTitle}</h3>

        <div class="card-actions">
          <button class="btn-toggle-heard" data-id="${lecture.id}">
            <span class="check-icon">${isHeard ? '✓' : ''}</span>
            <span class="heard-label">${isHeard ? 'Heard' : 'Mark Heard'}</span>
          </button>

          <div class="card-sub-actions">
            <button class="btn-sub-action btn-star ${isStarred ? 'active' : ''}" data-id="${lecture.id}" title="${isStarred ? 'Remove from favorites' : 'Add to favorites'}">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button class="btn-sub-action btn-share" data-url="${lecture.url}" title="Copy Lecture Link">
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

    // Click on thumbnail -> Open Player
    const thumbWrap = card.querySelector('.card-thumb-wrap');
    thumbWrap.addEventListener('click', () => {
      openPlayerModal(filteredIndex);
    });

    // Click on Heard Toggle
    const toggleHeardBtn = card.querySelector('.btn-toggle-heard');
    toggleHeardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHeardStatus(lecture.id);
    });

    // Click on Star Toggle
    const starBtn = card.querySelector('.btn-star');
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStarStatus(lecture.id);
    });

    // Click on Share Link
    const shareBtn = card.querySelector('.btn-share');
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(lecture.url);
      showToast('Lecture link copied to clipboard!');
    });

    return card;
  }

  // ==========================================================================
  // Toggle Actions: Heard & Starred
  // ==========================================================================
  function toggleHeardStatus(lectureId) {
    const isNowHeard = !heardSet.has(lectureId);

    if (isNowHeard) {
      heardSet.add(lectureId);
      showToast('Marked as Heard! Haribol 🪷');
    } else {
      heardSet.delete(lectureId);
      showToast('Marked as Unheard');
    }

    saveHeardData();
    updateGlobalStats();
    updateCardDOM(lectureId);

    // If modal is open for this lecture, update modal buttons
    if (currentPlayingIndex >= 0 && filteredLectures[currentPlayingIndex]?.id === lectureId) {
      updateModalControls();
    }

    // If currently filtering by status 'unheard' or 'heard', re-filter if desired
    if (activeStatus === 'unheard' || activeStatus === 'heard') {
      applyFilters();
    }
  }

  function toggleStarStatus(lectureId) {
    const isNowStarred = !starredSet.has(lectureId);

    if (isNowStarred) {
      starredSet.add(lectureId);
      showToast('Added to Favorites ★');
    } else {
      starredSet.delete(lectureId);
      showToast('Removed from Favorites');
    }

    saveStarredData();
    updateGlobalStats();
    updateCardDOM(lectureId);

    if (currentPlayingIndex >= 0 && filteredLectures[currentPlayingIndex]?.id === lectureId) {
      updateModalControls();
    }

    if (activeStatus === 'starred') {
      applyFilters();
    }
  }

  function updateCardDOM(lectureId) {
    const card = document.getElementById(`card-${lectureId}`);
    if (!card) return;

    const isHeard = heardSet.has(lectureId);
    const isStarred = starredSet.has(lectureId);

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
    const total = allLectures.length || 543;
    const heardCount = heardSet.size;
    const unheardCount = Math.max(0, total - heardCount);
    const starredCount = starredSet.size;
    const percentage = total > 0 ? Math.round((heardCount / total) * 100) : 0;

    // Header Progress Widget
    heardFraction.textContent = `${heardCount} / ${total}`;
    progressBarFill.style.width = `${percentage}%`;
    heardPercentage.textContent = `${percentage}%`;

    // Filter Tabs Counters
    countAll.textContent = total;
    countUnheard.textContent = unheardCount;
    countHeard.textContent = heardCount;
    countStarred.textContent = starredCount;

    // Backup Modal Stats
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
  }

  // ==========================================================================
  // Embedded Video Player Modal
  // ==========================================================================
  function openPlayerModal(filteredIndex) {
    if (filteredIndex < 0 || filteredIndex >= filteredLectures.length) return;

    currentPlayingIndex = filteredIndex;
    const lecture = filteredLectures[filteredIndex];

    modalLectureId.textContent = `#${lecture.id}`;
    modalLectureTitle.textContent = lecture.title;
    modalLectureMeta.textContent = `${lecture.category} • ${lecture.channel}`;
    modalYtDirectLink.href = lecture.url;

    // Embed YouTube player with autoplay
    ytPlayerIframe.src = `https://www.youtube.com/embed/${lecture.yt_id}?autoplay=1&enablejsapi=1&rel=0`;

    updateModalControls();

    playerModal.classList.add('active');
    playerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function updateModalControls() {
    if (currentPlayingIndex < 0 || currentPlayingIndex >= filteredLectures.length) return;
    const lecture = filteredLectures[currentPlayingIndex];

    const isHeard = heardSet.has(lecture.id);
    const isStarred = starredSet.has(lecture.id);

    // Update Heard Button in Modal
    if (isHeard) {
      modalHeardBtn.classList.add('active');
      modalHeardBtn.querySelector('.heard-text').textContent = 'Heard ✓';
    } else {
      modalHeardBtn.classList.remove('active');
      modalHeardBtn.querySelector('.heard-text').textContent = 'Mark as Heard';
    }

    // Update Star Button in Modal
    if (isStarred) {
      modalStarBtn.classList.add('active');
      modalStarBtn.querySelector('.star-text').textContent = 'Favorited ★';
    } else {
      modalStarBtn.classList.remove('active');
      modalStarBtn.querySelector('.star-text').textContent = 'Favorite';
    }

    // Navigation buttons
    modalPrevBtn.disabled = currentPlayingIndex <= 0;
    modalNextBtn.disabled = currentPlayingIndex >= filteredLectures.length - 1;
  }

  function closePlayerModal() {
    playerModal.classList.remove('active');
    playerModal.setAttribute('aria-hidden', 'true');
    ytPlayerIframe.src = '';
    currentPlayingIndex = -1;
    document.body.style.overflow = '';
  }

  function playPreviousLecture() {
    if (currentPlayingIndex > 0) {
      openPlayerModal(currentPlayingIndex - 1);
    }
  }

  function playNextLecture() {
    if (currentPlayingIndex < filteredLectures.length - 1) {
      openPlayerModal(currentPlayingIndex + 1);
    }
  }

  // ==========================================================================
  // Surprise Me / Random Talk
  // ==========================================================================
  function playRandomTalk() {
    // Pick an unheard talk if available, else pick any talk
    let pool = allLectures.filter(l => !heardSet.has(l.id));
    if (pool.length === 0) {
      pool = allLectures;
    }

    if (pool.length === 0) {
      showToast('No lectures found!');
      return;
    }

    const randomLecture = pool[Math.floor(Math.random() * pool.length)];

    // Reset filters to find it cleanly
    resetAllFilters();
    searchQuery = randomLecture.id;
    searchInput.value = randomLecture.id;
    applyFilters();

    openPlayerModal(0);
    showToast(`Now playing: #${randomLecture.id} — ${randomLecture.title.substring(0, 35)}...`);
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
    updateChipActiveState();

    activeChannel = 'all';
    channelSelect.value = 'all';

    activeSort = 'default';
    sortSelect.value = 'default';

    applyFilters();
  }

  // ==========================================================================
  // Export & Import Progress (JSON)
  // ==========================================================================
  function exportUserData() {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      totalHeard: heardSet.size,
      heardIds: Array.from(heardSet),
      starredIds: Array.from(starredSet)
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

    showToast('Progress backup downloaded successfully!');
  }

  function importUserData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json.heardIds)) {
          json.heardIds.forEach(id => heardSet.add(id));
        }
        if (Array.isArray(json.starredIds)) {
          json.starredIds.forEach(id => starredSet.add(id));
        }

        saveHeardData();
        saveStarredData();
        updateGlobalStats();
        applyFilters();

        showToast(`Imported progress: ${json.heardIds?.length || 0} heard talks restored!`);
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
      saveHeardData();
      saveStarredData();
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
    // Search input with instant reaction
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

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !playerModal.classList.contains('active')) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === 'Escape') {
        if (playerModal.classList.contains('active')) {
          closePlayerModal();
        } else if (backupModal.classList.contains('active')) {
          closeBackupModal();
        }
      }
    });

    // Status tabs
    statusTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      statusTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.dataset.status;
      applyFilters();
    });

    // Category select dropdown
    categorySelect.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      updateChipActiveState();
      applyFilters();
    });

    // Channel select dropdown
    channelSelect.addEventListener('change', (e) => {
      activeChannel = e.target.value;
      applyFilters();
    });

    // Sort select dropdown
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      applyFilters();
    });

    // View toggle buttons
    viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    viewListBtn.addEventListener('click', () => setViewMode('list'));

    // Theme toggle button
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Random Talk button
    randomTalkBtn.addEventListener('click', playRandomTalk);

    // Reset filters buttons
    resetFiltersBtn.addEventListener('click', resetAllFilters);
    emptyResetBtn.addEventListener('click', resetAllFilters);

    // Pagination buttons
    loadMoreBtn.addEventListener('click', () => renderNextBatch(BATCH_SIZE));
    loadAllBtn.addEventListener('click', () => renderNextBatch(filteredLectures.length));

    // Player Modal Events
    modalCloseBtn.addEventListener('click', closePlayerModal);
    playerOverlay.addEventListener('click', closePlayerModal);
    modalPrevBtn.addEventListener('click', playPreviousLecture);
    modalNextBtn.addEventListener('click', playNextLecture);

    modalHeardBtn.addEventListener('click', () => {
      if (currentPlayingIndex >= 0) {
        toggleHeardStatus(filteredLectures[currentPlayingIndex].id);
      }
    });

    modalStarBtn.addEventListener('click', () => {
      if (currentPlayingIndex >= 0) {
        toggleStarStatus(filteredLectures[currentPlayingIndex].id);
      }
    });

    // Backup & Restore Events
    headerProgressWidget.addEventListener('click', openBackupModal);
    openBackupBtn.addEventListener('click', openBackupModal);
    closeBackupModalBtn.addEventListener('click', closeBackupModal);
    backupOverlay.addEventListener('click', closeBackupModal);

    exportDataBtn.addEventListener('click', exportUserData);
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importUserData(e.target.files[0]);
        e.target.value = '';
      }
    });
    resetProgressBtn.addEventListener('click', resetAllProgress);
  }

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

  // Start the application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
