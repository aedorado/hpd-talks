# 🤖 AGENTS.md — Developer & AI Assistant Guide

This document provides system specifications, data contracts, and operational guidelines for AI agents and human developers maintaining the **HG Hari Parshad Das — Katha Sangraha** repository.

---

## 1. Project Overview & Architecture

- **Goal**: A fast, elegant, distraction-free lecture repository with browser-based sadhana tracking (`localStorage`), designed for effortless deployment on **Vercel** with clean, modular component architecture.
- **Tech Stack**: **Next.js (App Router)**, **React 19**, **TypeScript**, and Modern CSS3 (Variables, Dark/Light Themes, Flex/Grid).
- **Hosting**: Vercel Native Next.js Platform (configured via [`vercel.json`](vercel.json)).
- **Build Command**: `npm run build` (outputs optimized static pages via Next.js SSG).
- **Local Runner**: `npm run dev` (starts Next.js local development server on port 3000).

---

## 2. Core Architectural Invariants

### 🔑 2.1 The 11-Character YouTube Video ID Rule
- **Rule**: All data structures, local storage entries, DOM element IDs, and event handlers **MUST** use the **11-character YouTube video ID** (`yt_id`) as the primary key.
- **Why**: Sequential IDs like `HPD0001` or row indexes shift whenever lectures are added, re-ordered, or re-scraped. YouTube video IDs are globally unique and immutable.
- `catalog_id` (e.g., `HPD0012`) is strictly a secondary label displayed for user convenience.
- When saving to `localStorage`:
  - Heard key: `hpd_talks_heard_yt_v2` (Stores array/set of 11-char YouTube IDs).
  - Favorites key: `hpd_talks_starred_yt_v2` (Stores array/set of 11-char YouTube IDs).
  - Last Played key: `hpd_talks_last_played_yt_v1` (Stores 11-char YouTube ID for "Continue Hearing").
  - Playback Progress key: `hpd_talks_progress_yt_v1` (Stores map of `yt_id -> { currentTime, duration, updatedAt }` for seamless timestamp resume).
  - Shorts Watched key: `hpd_shorts_watched_v1` (Stores array/set of 11-char YouTube IDs for Upadesh Shorts).
- When deep-linking via URL:
  - Full Lectures format: `/#v=<11-char-yt-id>` (e.g. `/#v=GNFJXTpDu_s`).
  - Upadesh Shorts format: `/#s=<11-char-yt-id>` (e.g. `/#s=o8a5SKPsEsg`).

### 📦 2.2 Dual Data Output Contract
Whenever updating lecture data for the web app, [`scripts/build_data.py`](scripts/build_data.py) produces two outputs:
1. `data/lectures.json`: Standard JSON array fetched/imported statically by the Next.js app.
2. `data/lectures-data.js`: Assigns `window.LECTURES_DATA = [...]` to allow offline testing.

---

## 3. Directory Structure & Component Architecture

```
hpd-talks/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root HTML, Google Fonts (Cinzel & Plus Jakarta Sans), metadata
│   │   ├── page.tsx                     # Main interactive page orchestrating Kathas and Shorts
│   │   └── globals.css                  # Global styles, dark/light themes, animations
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Brand, sadhana counter pill, theme toggle, modal triggers
│   │   │   ├── ModeNav.tsx              # Kathas vs Shorts mode tab switcher
│   │   │   └── Toast.tsx                # Non-intrusive action feedback toasts
│   │   ├── lectures/
│   │   │   ├── ContinueHearing.tsx      # Resume Sadhana banner for last-played talk
│   │   │   ├── FilterBar.tsx            # Search bar, 4 dropdowns, sort select, chip strip, view toggle
│   │   │   ├── LectureList.tsx          # Batch rendering with infinite scroll / load more
│   │   │   └── LectureCard.tsx          # Card component (Grid & Compact List row layouts)
│   │   ├── player/
│   │   │   ├── DockedBottomPlayer.tsx   # Fixed bottom player bar with scrubber and controls
│   │   │   └── VideoDock.tsx            # Centered expandable video dock above bottom player
│   │   ├── shorts/
│   │   │   ├── ShortsHero.tsx           # Hero banner with Upadesh Shorts stats
│   │   │   ├── ShortsGrid.tsx           # Vertical card grid
│   │   │   ├── ShortCard.tsx            # Vertical card with watched toggle and player trigger
│   │   │   └── ShortsPlayerModal.tsx    # Vertical 9:16 player modal
│   │   └── modals/
│   │       ├── ResourcesModal.tsx       # 421-page Upadeshamrita Q&A companion PDF modal
│   │       └── BackupModal.tsx          # Export / Import JSON progress & localStorage manager
│   ├── hooks/
│   │   ├── useSadhana.ts                # Central localStorage sadhana tracking hook
│   │   ├── usePlayer.ts                 # Playback state & YouTube iframe postMessage controller
│   │   ├── useFilters.ts                # Multi-level filtering, search, and sorting hook
│   │   └── useTheme.ts                  # Light / Dark theme toggle
│   ├── types/
│   │   ├── lecture.ts                   # Lecture, Short, Resource TypeScript interfaces
│   │   └── player.ts                    # Playback and filter types
│   └── lib/
│       ├── constants.ts                 # Storage keys, batch sizes, filter chips
│       └── formatters.ts                # Time formatting, date formatting, clipboard helpers
├── public/
│   └── resources/
│       └── Answers_HPD_Upadeshamritam_WhatsApp.pdf  # 421-page Upadeshamrita Q&A companion PDF
├── data/
│   ├── combined_hpd_lectures.csv        # Master 700+ lecture chronological archive
│   ├── talks - HPD.csv                  # Curated catalog backup
│   ├── lectures.json                    # Primary JSON dataset (keyed by YT ID)
│   ├── lectures-data.js                 # Offline fallback dataset
│   ├── shorts.json                      # Upadesh Shorts JSON dataset
│   └── shorts-data.js                   # Upadesh Shorts offline dataset
├── scripts/
│   ├── build_data.py                    # Generates web datasets (JSON & JS)
│   ├── fetch_lectures.py                # Reusable incremental scraper
│   ├── fetch_shorts.py                  # YouTube Shorts scraper
│   ├── append_playlist.py               # Reusable playlist/channel appender
│   ├── apply_full_taxonomy.py           # 2-level taxonomy processor
│   └── taxonomy_overrides.py            # Speaker & category manual overrides
├── next.config.mjs                      # Next.js configuration
├── tsconfig.json                        # TypeScript configuration
├── vercel.json                          # Vercel deployment headers
└── package.json                         # Project scripts & dependencies
```

---

## 4. Scripts & Automation Workflows

### 4.1 Incremental Scraper: [`scripts/fetch_lectures.py`](scripts/fetch_lectures.py)
- **Purpose**: Runs a scheduled or manual scrape across all main channels and playlists into `data/combined_hpd_lectures.csv`.
- **Command**:
  ```bash
  python3 scripts/fetch_lectures.py
  ```

### 4.2 Web Builder: [`scripts/build_data.py`](scripts/build_data.py)
- **Purpose**: Re-generates `data/lectures.json` and `data/lectures-data.js` from `data/combined_hpd_lectures.csv`.
- **Command**:
  ```bash
  npm run build:data
  # or
  python3 scripts/build_data.py
  ```

### 4.3 Production Build & Verification
- **Build**:
  ```bash
  npm run build
  ```
- **Local Dev Server**:
  ```bash
  npm run dev
  ```

---

## 5. UI/UX Standards

- **Alphabetical Sorting**: Dropdown filters for **Channel**, **Speaker**, and **Topic/Series** must always be sorted alphabetically (`A → Z`) using `a.localeCompare(b, undefined, { sensitivity: 'base' })`.
- **Batch Rendering**: Render items in batches of 36 (`BATCH_SIZE`) with infinite scroll or a "Load More" trigger.
- **Theme Support**: CSS variables define palettes for `[data-theme="light"]` (default) and `[data-theme="dark"]`. The active theme persists in `localStorage` under `hpd_talks_theme_v1`.
- **Bottom Player**: YouTube iframe uses `enablejsapi=1&rel=0`. Modal supports keyboard controls (`Escape` to close, `Space` to toggle play/pause, `ArrowLeft` / `ArrowRight` to seek).

---

## 6. Vercel Deployment Rules

- **Framework**: `Next.js` (managed by [`vercel.json`](vercel.json)).
- **Build Command**: `next build` (standard Next.js build).
- **Output Directory**: `.next` (automatic).
- **Clean URLs & Security**: Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) configured in `vercel.json`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
