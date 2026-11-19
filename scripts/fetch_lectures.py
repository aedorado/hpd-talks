import csv
import json
import os
import re
import subprocess
import threading
import time
from datetime import timedelta

SOURCES = [
    ("Channel (@hpdrgg - Videos)", "https://www.youtube.com/@hpdrgg/videos"),
    ("Channel (@hpdrgg - Live)", "https://www.youtube.com/@hpdrgg/streams"),
    (
        "Playlist (HG Hari Parshad Das)",
        "https://www.youtube.com/playlist?list=PLZ0olUjYhjaQh_ptzM-dgq7hdsK9Wxjr6",
    ),
    (
        "Playlist (Bhakti Sanga Japa - HG Hari Parshad Das)",
        "https://www.youtube.com/playlist?list=PLi0jknRok56lADNPPKotZjiproO8GSK34",
    ),
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_FILE = os.path.join(REPO_ROOT, "data", "combined_hpd_lectures.csv")

# False = exact YYYY-MM-DD publish dates (~5-10 mins)
# True  = approximate dates (~10 seconds)
USE_FAST_APPROX_DATES = False


class LiveState:
    def __init__(self):
        self.lock = threading.Lock()
        self.source = "Initializing..."
        self.status = "Starting up"
        self.unique = 0
        self.dupes = 0
        self.done = False


def extract_yt_id(url: str) -> str:
    match = re.search(r"(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""


def extract_part_num(title: str) -> int:
    m = re.search(
        r"(?:session|part|भाग|day|episode)\s*(?:—|-|:)?\s*0*(\d+)",
        title,
        re.IGNORECASE,
    )
    return int(m.group(1)) if m else 0


def format_date(raw_date: str) -> str:
    if raw_date and len(raw_date) == 8 and raw_date.isdigit():
        return f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}"
    return ""


def get_smart_category(title: str, channel: str = "") -> str:
    t = title.lower()
    if "siksastakam" in t or "śikṣāṣṭakam" in t or "shikshashtakam" in t:
        return "Caitanya Siksastakam"
    if (
        "upadeshamrit" in t
        or "upadeśāmṛta" in t
        or "nectar of instruction" in t
        or "noi" in t
    ):
        return "Upadeshamrta"
    if "beyond bhoga and tyaga" in t:
        return "Beyond Bhoga and Tyaga"
    if "padyavali" in t or "padyāvalī" in t:
        return "Padyavali"
    if "damodara" in t or "dāmodara" in t or "damodar" in t:
        return "Damodara Lila"
    if (
        "bhagavad gita" in t
        or "bhagavad-gītā" in t
        or "bhagavad-gita" in t
        or "भगवद्गीता" in t
        or re.search(r"\bbg\b", t)
        or "gita overview" in t
        or "advent of bhagavad gita" in t
    ):
        return "Bhagavad Gita"
    if (
        "bhagavatam" in t
        or "bhāgavatam" in t
        or "bhagawatam" in t
        or "sb " in t
        or "śrīmad-bhāgavatam" in t
        or "srimad bhagavatam" in t
        or "भागवत" in t
        or re.search(r"\bsb\s*\d", t)
        or re.search(r"canto\s*\d", t)
        or "bhagavat sravana" in t
        or "remaining leg of dharma" in t
    ):
        return "Srimad Bhagavatam"
    if (
        "caitanya caritamrta" in t
        or "caitanya-caritāmṛta" in t
        or "chaitanya caritamrita" in t
        or "cc " in t
        or "caitanya carithamrtha" in t
        or "antya lila" in t
        or "madhya lila" in t
        or "adi lila" in t
        or "vidagdha madhava" in t
    ):
        return "Caitanya Caritamrta"
    if "caitanya bhagavata" in t or "caitanya-bhāgavata" in t:
        return "Caitanya Bhagavata"
    if (
        "bhakti-rasamrita" in t
        or "bhakti rasamrita" in t
        or "bhakti rasa" in t
        or "bhakti-rasāmṛta" in t
        or "brs" in t
        or "rasamrita" in t
        or "ujjwala rasa" in t
        or "unnata ujjwala" in t
        or "bhakti ras" in t
    ):
        return "Bhakti-rasamrita-sindhu"
    if "radha" in t or "rādhā" in t or "radharani" in t or "rādhārāṇī" in t:
        return "Radha Tattva"
    if "balaram" in t or "bālarāma" in t:
        return "Balarama"
    if "nityananda" in t or "nityānanda" in t or "nitai" in t:
        return "Nityananda"
    if (
        "gaura" in t
        or "mahaprabhu" in t
        or "caitanya" in t
        or "chaitanya" in t
    ):
        return "Gaura/Mahaprabhu"
    if "narasimha" in t or "nṛsiṁha" in t or "nrsimha" in t:
        return "Narasimha"
    if (
        "ramayana" in t
        or "ram navami" in t
        or "lord rama" in t
        or "rāma" in t
    ):
        return "Ramayana/Rama"
    if (
        "jagannath" in t
        or "jagannātha" in t
        or "gundica" in t
        or "puri" in t
    ):
        return "Jagannatha"
    if "shiva" in t or "śiva" in t:
        return "Shiva Tattva"
    if "prabhupada" in t or "prabhupāda" in t:
        return "Srila Prabhupada"
    if (
        "rupa goswami" in t
        or "rūpa gosvāmī" in t
        or "goswamis" in t
        or "guru" in t
        or "acharya" in t
    ):
        return "Guru & Acharya Tattva"
    if (
        "janmashtami" in t
        or "janmāṣṭamī" in t
        or "appearance of the full moon" in t
    ):
        return "Janmashtami"
    if (
        "sharad p" in t
        or "rasa dance" in t
        or "rāsa dance" in t
        or "shravanotsav" in t
    ):
        return "Sharad Poornima / Rasa Lila"
    if (
        "krishna lila" in t
        or "vatasura" in t
        or "vatsasura" in t
        or "putana" in t
        or "mrd-bhakshana" in t
    ):
        return "Krishna Lila"
    if (
        "govardhan" in t
        or "vrindavan" in t
        or "vraja" in t
        or "yamuna" in t
        or "dhama" in t
    ):
        return "Dhama Tattva"
    if (
        "japa" in t
        or "kirtan" in t
        or "kīrtana" in t
        or "harinam" in t
        or "chanting" in t
    ):
        return "Japa-Kirtan-Smarana"
    if (
        "marriage" in t
        or "grihastha" in t
        or "gṛhastha" in t
        or "social life" in t
    ):
        return "Grihastha / Marriage"
    if (
        "lust" in t
        or "anger" in t
        or "anartha" in t
        or "vairagya" in t
        or "fleeting nature" in t
    ):
        return "Anarthas & Vairagya"
    if "prema" in t or "hankering god" in t or "priti" in t:
        return "Prema Bhakti"
    if "retreat" in t or "seminar" in t or "immersion" in t:
        return "Retreats/Seminars"
    if "stotra" in t or "recitation" in t or "meter:" in t:
        return "Stotras & Sanskrit Recitation"
    if "pushpa" in t or "utsava" in t or "festival" in t:
        return "Festivals & Utsavas"
    if "krishna" in t or "kṛṣṇa" in t or "bhagavan" in t:
        return "Krishna / Bhagavan Tattva"
    if "bhakti" in t or "भजन" in t:
        return "Sadhana Bhakti"
    return "General Discourses"


def log_event(msg: str):
    print(f"\r\033[K{msg}", flush=True)


def heartbeat_worker(state: LiveState, start_time: float):
    spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    tick = 0
    while True:
        with state.lock:
            if state.done:
                break
            elapsed = str(timedelta(seconds=int(time.time() - start_time)))
            spin = spinner[tick % len(spinner)]
            line = (
                f"\r\033[K{spin} [{elapsed}] {state.source} | "
                f"Total: {state.unique} | Dupes: {state.dupes} | {state.status}"
            )
        print(line[:120], end="", flush=True)
        tick += 1
        time.sleep(1.0)


def stream_stderr(pipe, state: LiveState):
    for line in pipe:
        clean = line.strip()
        if not clean:
            continue
        if "[download]" in clean or "[youtube" in clean:
            with state.lock:
                state.status = clean.split("]", 1)[-1].strip()
        elif "ERROR:" in clean:
            log_event(f"  [yt-dlp ERROR] {clean}")


def load_existing_lectures(filepath: str):
    seen = {}
    rows = []
    if not os.path.exists(filepath):
        return seen, rows

    with open(filepath, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            url = r.get("URL", "").strip()
            vid = extract_yt_id(url)
            if vid:
                seen[vid] = r.get("Title", "")
            rows.append(r)

    return seen, rows


def main():
    start_time = time.time()
    state = LiveState()
    stats = {}

    print("============================================================")
    print(" Starting YouTube Lecture Scraper (Incremental & Chronological)")
    print(f" Target File: {OUTPUT_FILE}")
    print(
        f" Mode       : {'FAST (Approx Dates)' if USE_FAST_APPROX_DATES else 'EXACT (Full Per-Video Metadata)'}"
    )

    seen_ids, rows = load_existing_lectures(OUTPUT_FILE)
    initial_count = len(rows)
    print(f" Loaded {initial_count} existing lectures from {OUTPUT_FILE}")
    print(" (Duplicates are skipped automatically)")
    print("============================================================", flush=True)

    state.unique = len(rows)

    hb_thread = threading.Thread(
        target=heartbeat_worker, args=(state, start_time), daemon=True
    )
    hb_thread.start()

    newly_added_total = 0

    for source_idx, (source_label, url) in enumerate(SOURCES, 1):
        source_start = time.time()
        with state.lock:
            state.source = f"[{source_idx}/{len(SOURCES)}] {source_label}"
            state.status = "Connecting..."

        log_event(f"\n[{source_idx}/{len(SOURCES)}] Connecting to: {source_label}")

        if USE_FAST_APPROX_DATES:
            cmd = [
                "yt-dlp",
                "--no-update",
                "--no-quiet",
                "--lazy-playlist",
                "--flat-playlist",
                "--ignore-errors",
                "--extractor-args",
                "youtubetab:approximate_date",
                "--dump-json",
                url,
            ]
        else:
            cmd = [
                "yt-dlp",
                "--no-update",
                "--no-quiet",
                "--lazy-playlist",
                "--skip-download",
                "--ignore-errors",
                "--sleep-requests",
                "0.75",
                "--dump-json",
                url,
            ]

        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1
        )

        err_thread = threading.Thread(
            target=stream_stderr, args=(proc.stderr, state), daemon=True
        )
        err_thread.start()

        added = 0
        dupes = 0

        for line in proc.stdout:
            line = line.strip()
            if not line:
                continue

            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            vid = entry.get("id")
            if not vid:
                continue

            title = entry.get("title", "Untitled").strip()

            from taxonomy_overrides import get_speaker, IGNORED_VIDEO_IDS
            if vid in seen_ids or vid in IGNORED_VIDEO_IDS:
                dupes += 1
                with state.lock:
                    state.dupes += 1
                log_event(f"  [SKIP ALREADY EXISTS / IGNORED] ({vid}) {title[:60]}")
                continue

            seen_ids[vid] = title
            added += 1
            newly_added_total += 1

            upload_date = format_date(entry.get("upload_date", ""))
            duration = entry.get("duration_string") or "N/A"
            channel = entry.get("channel") or entry.get("uploader") or "Unknown"
            video_url = f"https://www.youtube.com/watch?v={vid}"
            from apply_full_taxonomy import assign_taxonomy, load_curated_folders
            from taxonomy_overrides import get_speaker
            if not hasattr(main, 'curated'):
                main.curated = load_curated_folders()
            category, subcategory = assign_taxonomy(entry, main.curated)
            speaker = get_speaker(vid)

            rows.append(
                {
                    "Index": len(rows) + 1,
                    "Title": title,
                    "Speaker": speaker,
                    "Category": category,
                    "Subcategory": subcategory,
                    "Upload Date": upload_date,
                    "Duration": duration,
                    "Channel": channel,
                    "Source": source_label,
                    "URL": video_url,
                }
            )

            with state.lock:
                state.unique = len(rows)

            elapsed = str(timedelta(seconds=int(time.time() - start_time)))
            log_event(
                f"  [+NEW #{len(rows):03d} | {elapsed}] [{category} > {subcategory}] {upload_date} | {title[:40]}"
            )

        proc.wait()
        err_thread.join(timeout=2)

        source_elapsed = str(timedelta(seconds=int(time.time() - source_start)))
        stats[source_label] = {"added": added, "dupes": dupes, "time": source_elapsed}
        log_event(
            f"--- Completed {source_label} in {source_elapsed} -> New Added: {added}, Skipped Existing: {dupes} ---"
        )

    with state.lock:
        state.done = True
    hb_thread.join(timeout=1.5)

    if newly_added_total > 0:
        log_event(f"\nSorting all {len(rows)} lectures chronologically (earliest to latest)...")
        # Chronological earliest to latest, with series part numbers in order
        rows.sort(
            key=lambda r: (
                r.get("Upload Date") or "9999-99-99",
                extract_part_num(r.get("Title", "")),
                r.get("Title", ""),
            )
        )
        for idx, row in enumerate(rows, 1):
            row["Index"] = idx

        fieldnames = [
            "Index",
            "Title",
            "Speaker",
            "Category",
            "Subcategory",
            "Upload Date",
            "Duration",
            "Channel",
            "Source",
            "URL",
        ]
        with open(OUTPUT_FILE, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        log_event(f"✓ Saved updated database to {OUTPUT_FILE} ({len(rows)} total)")
    else:
        log_event(f"\nNo new lectures found across all sources. Database is already up-to-date!")

    total_elapsed = str(timedelta(seconds=int(time.time() - start_time)))
    total_dupes = sum(s["dupes"] for s in stats.values())

    print("\n============================================================")
    print(f" DONE in {total_elapsed}")
    print(f" Output File            : {OUTPUT_FILE}")
    print(f" Initial Existing Count : {initial_count}")
    print(f" Newly Added Lectures   : {newly_added_total}")
    print(f" Total Unique Videos    : {len(rows)}")
    print(f" Total Duplicates Skipped: {total_dupes}")
    print("============================================================")


if __name__ == "__main__":
    main()
