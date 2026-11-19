# 🪷 HG Hari Parshad Das — Katha Sangraha

A clean, responsive, high-performance web repository of discourses, seminars, and lectures by **HG Hari Parshad Das**.

Designed for effortless listening, tracking sadhana progress in your browser via `localStorage`, and deploying instantly to **Vercel** with zero build configuration.

---

## ✨ Features

- **700 Curated Lectures**: Full metadata across 32 comprehensive categories and subcategories (*Caitanya Siksastakam*, *Upadeshamrta*, *Srimad Bhagavatam*, *Bhakti-rasamrita-sindhu*, *Bhagavad Gita*, *Lord Nityananda*, *Sharad Poornima*, etc.), sorted chronologically from earliest (2011) to latest (2026).
- **2-Level Intelligent Taxonomy**: Filter by major category and subcategory (e.g., specific verses, cantos, seminar parts), with 0 uncategorized or miscellaneous talks.
- **11-Character YouTube Video ID as Primary Key**:
  - All tracking, state, DOM identifiers, and data lookups use the permanent, immutable YouTube Video ID (e.g. `GNFJXTpDu_s`).
  - Progress tracking never breaks when new lectures are added, re-indexed, or re-sorted.
- **Local Storage Progress Tracking**:
  - One-click **"Mark as Heard ✓"** button on cards and in the player.
  - Interactive **Sadhana Progress Bar**: Live count (e.g. `14 / 543`) and percentage completion.
  - **Favorites ★**: Star talks for quick replay.
  - **Status Tabs**: Easily filter between *All*, *Unheard*, *Heard ✓*, and *Favorites ★*.
  - **Export & Import Backup**: Download a `.json` backup of your listening progress to transfer between phone, tablet, and computer without losing data.
- **Instant Search & Deep Filtering**:
  - Real-time search across lecture titles, topics, channels, and YouTube IDs (with keyboard shortcut `/`).
  - **Alphabetically Sorted (A → Z)**: Channel list and Topic/Series dropdowns are cleanly alphabetized with lecture counts.
  - 1-click **Quick Series Chips** for popular seminar topics.
  - Sort by Catalog ID, Latest/Reverse, or Title (A–Z).
- **Embedded Player Modal & Deep-Linking**:
  - Watch/listen directly inside the app without ads or distractions.
  - Previous & Next buttons to seamlessly marathon a series.
  - Direct URL deep-linking (e.g. `https://yoursite.vercel.app/#v=GNFJXTpDu_s`) to open specific talks.
- **"Surprise Me" Random Talk Picker**:
  - Plays a random unheard lecture from your collection for daily inspiration.
- **Grid & List Views**:
  - Switch between visual Card Grid and high-density Compact List view.
- **Dark & Light Mode**:
  - Tasteful midnight slate and warm devotional saffron/amber palette with system preference auto-detection.
- **Zero-Dependency & Offline Friendly**:
  - Pure HTML/CSS/Vanilla JS with cached dataset fallback.

---

## 🚀 Easy Deployment on Vercel

This repository is a **static web application** that requires **no build step**. Deploying to Vercel takes under 1 minute.

### Option A: Deploy via GitHub (Recommended)

1. Push this directory to your GitHub account:
   ```bash
   git add .
   git commit -m "HG Hari Parshad Das talks repository"
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** and select your `hpd-talks` repository.
4. Leave all settings at their defaults:
   - **Framework Preset**: *Other*
   - **Root Directory**: `./`
   - **Build Command**: *None*
   - **Output Directory**: *None*
5. Click **"Deploy"**. Your site is live in ~5 seconds!

### Option B: Deploy via Vercel CLI

```bash
# Deploy directly from your terminal
npx vercel
```
Follow the interactive prompts (press Enter to accept default settings).

---

## 💻 Local Testing & Development

No Python server or backend is required. You can test locally using any static runner:

```bash
npx serve .
```
Or simply double-click [`index.html`](file:///Users/anuragsharma/code/hpd-talks/index.html) to run directly in your web browser with offline fallback.

---

## 🔄 Scraping & Data Pipeline Scripts

All scraping and dataset tools are organized inside the `scripts/` directory:

### 1. Main Scraper: `scripts/fetch_lectures.py`
Scrapes all configured channels and playlists incrementally into `data/combined_hpd_lectures.csv`:
```bash
python3 scripts/fetch_lectures.py
```
- **Automatic Resume & Duplicate Skipping**: Pre-loads existing records from `data/combined_hpd_lectures.csv` on startup. Any video already in the CSV is **skipped immediately** without redundant YouTube API calls.
- Fetches upload dates, durations, channels, and video links.
- Sorts chronologically earliest to latest and updates `data/combined_hpd_lectures.csv`.

### 2. Universal Appender: `scripts/append_playlist.py`
Quickly scan and append **any** YouTube Playlist or Channel into `data/combined_hpd_lectures.csv`:
```bash
python3 scripts/append_playlist.py "<YouTube_Playlist_or_Channel_URL>"
```
*Example:*
```bash
python3 scripts/append_playlist.py "https://www.youtube.com/playlist?list=PLi0jknRok56lADNPPKotZjiproO8GSK34"
```
- Compares every video ID against existing records.
- Skips videos that already exist in `data/combined_hpd_lectures.csv`.
- Appends only new lectures with 2-level taxonomy and sorts by date.

### 3. Web Dataset Builder: `scripts/build_data.py`
Converts `data/combined_hpd_lectures.csv` into the web app's JSON and JS datasets:
```bash
python3 scripts/build_data.py
# Or using npm:
npm run build:data
```
- Outputs `data/lectures.json` and `data/lectures-data.js`.
- Binds companion resources (e.g. Upadeshamrita Q&A PDF) directly to relevant seminar categories.
- Uses 11-character YouTube video IDs as primary keys.

---

## 📁 Project Structure

```
hpd-talks/
├── index.html                               # Main responsive web application
├── css/
│   └── style.css                            # Styling, dark/light themes, animations
├── js/
│   └── app.js                               # App logic, localStorage, filtering, player modal
├── data/
│   ├── combined_hpd_lectures.csv            # 700+ chronological archive with dates & durations
│   ├── talks - HPD.csv                      # Curated catalog backup
│   ├── lectures.json                        # Web app JSON dataset (keyed by YT ID)
│   └── lectures-data.js                     # Offline & local file:// fallback
├── resources/
│   └── Answers_HPD_Upadeshamritam_WhatsApp.pdf # 421-page Upadeshamrita Q&A companion PDF
├── scripts/
│   ├── build_data.py                        # Web dataset generator
│   ├── fetch_lectures.py                    # Incremental scraper (skips existing videos)
│   ├── append_playlist.py                   # Reusable playlist/channel appender
│   ├── apply_full_taxonomy.py               # 2-level devotional taxonomy processor
│   └── taxonomy_overrides.py                # Speaker & category manual overrides
├── vercel.json                              # Vercel caching & routing headers
├── package.json                             # Project metadata & npm scripts
├── AGENTS.md                                # Developer & AI agent specifications
└── README.md                                # Project documentation
```
