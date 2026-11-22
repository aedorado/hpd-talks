export const STORAGE_KEYS = {
  HEARD: 'hpd_talks_heard_yt_v2',
  STARRED: 'hpd_talks_starred_yt_v2',
  LAST_PLAYED: 'hpd_talks_last_played_yt_v1',
  PROGRESS: 'hpd_talks_progress_yt_v1',
  SHORTS_WATCHED: 'hpd_shorts_watched_v1',
  THEME: 'hpd_talks_theme_v1',
  VIEW_MODE: 'hpd_talks_view_mode_v1',
} as const;

export const BATCH_SIZE = 36;

export const FILTER_CHIPS = [
  { label: '✨ Recent (Nashik)', category: 'Festivals & Temple Seva' },
  { label: '📖 Upadeshamrta', category: 'Upadeshamrta (Seminar)' },
  { label: '🌺 Siksastakam', category: 'Caitanya Siksastakam (Seminar)' },
  { label: '🐚 Srimad Bhagavatam', category: 'Srimad Bhagavatam' },
  { label: '☸️ Bhagavad Gita', category: 'Bhagavad Gita' },
  { label: '🌊 Bhakti Rasamrita', category: 'Bhakti-rasamrita-sindhu' },
  { label: '🪷 Sri Krishna Lila', category: 'Sri Krishna & Vraja Lila' },
  { label: '💛 Gaura Tattva', category: 'Sri Caitanya Mahaprabhu (Gaura Tattva)' },
  { label: '🏛️ Dhama Tattva', category: 'Dhama Tattva & Sacred Places' },
  { label: '🎙️ Q&A & Interviews', category: 'Q&A, Podcasts & Interviews' },
] as const;
