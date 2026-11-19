# 🪷 HG Hari Parshad Das — Katha Sangraha

A clean, responsive, fast web repository of 540+ discourses, seminars, and lectures by **HG Hari Parshad Das**.

Designed for effortless listening, tracking sadhana progress in your browser via `localStorage`, and deploying instantly to **Vercel** with zero build configuration.

---

## ✨ Features

- **543 Curated Lectures**: Full metadata including Category/Topic (e.g., *Srimad Bhagavatam*, *Bhakti-rasamrita-sindhu*, *Bhagavad Gita*, *Damodara Lila*, *Radha Tattva*, *Padyavali*, *Caitanya Caritamrta*), Channel, and unique catalog ID (`#HPD0001` - `#HPD0543`).
- **Local Storage Progress Tracking**:
  - One-click **"Mark as Heard ✓"** button on cards and in the player.
  - Interactive **Sadhana Progress Bar**: Live count (e.g. `12 / 543`) and percentage completion.
  - **Favorites ★**: Save talks for quick replay.
  - **Status Tabs**: Easily filter between *All*, *Unheard*, *Heard ✓*, and *Favorites ★*.
  - **Export & Import Backup**: Download a `.json` backup of your listening progress to transfer between phone, tablet, and computer without losing data.
- **Instant Search & Deep Filtering**:
  - Live search across lecture titles, topics, channels, and IDs (with keyboard shortcut `/`).
  - 1-click **Quick Series Chips** for popular seminar topics.
  - Dropdown filters for Topic, Channel, and Sorting (Catalog ID, Reverse/Newest, Title A-Z, Topic).
- **Embedded Player Modal**:
  - Watch/listen directly inside the app without ads or distractions.
  - Previous & Next buttons to seamlessly marathon a series.
  - Direct "Open in YouTube" button if you prefer the YouTube app.
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
   git commit -m "Initial commit of HPD talks repository"
   git branch -M main
   git remote add origin https://github.com/<your-username>/hpd-talks.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** and select your `hpd-talks` repository.
4. Leave all settings at their defaults (Framework Preset: *Other*, Root Directory: `./`).
5. Click **"Deploy"**. Your site is live in ~5 seconds!

### Option B: Deploy via Vercel CLI

If you have Node.js and Vercel CLI installed:
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy directly from this directory
vercel
```

Follow the prompts (accept default settings) and your site will be deployed immediately with a production URL.

---

## 💻 Local Testing & Development

You can run the web app locally using Python's built-in web server:

```bash
python3 -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your web browser.

You can also double-click `index.html` directly—it includes an offline fallback (`data/lectures-data.js`) that works without any web server.

---

## 🔄 Adding New Lectures

Whenever you add new rows to `talks - HPD.csv` or run your scraping script, update the web dataset by running:

```bash
python3 build_data.py
```

This updates both `data/lectures.json` and `data/lectures-data.js`.

---

## 📁 Project Structure

```
hpd-talks/
├── index.html            # Main web application
├── css/
│   └── style.css         # Responsive styling, themes, animations
├── js/
│   └── app.js           # Filtering, player, progress, and localStorage
├── data/
│   ├── lectures.json     # 543 talks dataset in JSON
│   └── lectures-data.js  # Offline/zero-CORS fallback
├── build_data.py         # Converter script: talks - HPD.csv -> JSON/JS
├── talks - HPD.csv       # Source catalog of talks
├── vercel.json           # Vercel caching, headers, and clean URLs
└── README.md             # Documentation
```
