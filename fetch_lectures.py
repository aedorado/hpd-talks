import csv
import json
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
]

OUTPUT_FILE = "combined_hpd_lectures.csv"

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


def format_date(raw_date: str) -> str:
    if raw_date and len(raw_date) == 8 and raw_date.isdigit():
        return f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}"
    return "Unknown Date"


def log_event(msg: str):
    """Clears the current heartbeat line, prints a permanent log line, and flushes."""
    print(f"\r\033[K{msg}", flush=True)


def heartbeat_worker(state: LiveState, start_time: float):
    """Updates the bottom status line every 1 second."""
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
                f"Unique: {state.unique} | Dupes: {state.dupes} | {state.status}"
            )
        print(line[:120], end="", flush=True)
        tick += 1
        time.sleep(1.0)


def stream_stderr(pipe, state: LiveState):
    """Reads yt-dlp's live item/page progress and updates the 1s status bar."""
    for line in pipe:
        clean = line.strip()
        if not clean:
            continue
        # Update status bar with yt-dlp's current action (e.g., "Downloading item 14 of 120")
        if "[download]" in clean or "[youtube" in clean:
            with state.lock:
                state.status = clean.split("]", 1)[-1].strip()
        elif "ERROR:" in clean:
            log_event(f"  [yt-dlp ERROR] {clean}")


def main():
    start_time = time.time()
    seen_ids = {}
    rows = []
    stats = {}
    state = LiveState()

    print("============================================================")
    print(" Starting YouTube Lecture Scraper (1s Live Heartbeat)")
    print(
        f" Mode: {'FAST (Approx Dates)' if USE_FAST_APPROX_DATES else 'EXACT (Full Per-Video Metadata)'}"
    )
    print("============================================================", flush=True)

    hb_thread = threading.Thread(
        target=heartbeat_worker, args=(state, start_time), daemon=True
    )
    hb_thread.start()

    for source_idx, (source_label, url) in enumerate(SOURCES, 1):
        source_start = time.time()
        with state.lock:
            state.source = f"[{source_idx}/{len(SOURCES)}] {source_label}"
            state.status = "Fetching first page..."

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
                "--no-quiet",       # Overrides --dump-json's --quiet so item progress prints live
                "--lazy-playlist",  # Emits videos immediately instead of waiting for all pages
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

            if vid in seen_ids:
                dupes += 1
                with state.lock:
                    state.dupes += 1
                log_event(f"  [SKIP DUPE #{dupes}] ({vid}) {title[:65]}")
                continue

            seen_ids[vid] = title
            added += 1

            upload_date = format_date(entry.get("upload_date", ""))
            duration = entry.get("duration_string") or "N/A"
            channel = entry.get("channel") or entry.get("uploader") or "Unknown"
            video_url = f"https://www.youtube.com/watch?v={vid}"

            rows.append(
                [
                    len(rows) + 1,
                    title,
                    "" if upload_date == "Unknown Date" else upload_date,
                    duration,
                    channel,
                    source_label,
                    video_url,
                ]
            )

            with state.lock:
                state.unique = len(rows)

            elapsed = str(timedelta(seconds=int(time.time() - start_time)))
            log_event(
                f"  [+{len(rows):03d} | {elapsed}] {upload_date} | {duration:>8} | {title[:58]}"
            )

        proc.wait()
        err_thread.join(timeout=2)

        source_elapsed = str(timedelta(seconds=int(time.time() - source_start)))
        stats[source_label] = {"added": added, "dupes": dupes, "time": source_elapsed}
        log_event(
            f"--- Completed {source_label} in {source_elapsed} -> Added: {added}, Dupes: {dupes} ---"
        )

    with state.lock:
        state.done = True
    hb_thread.join(timeout=1.5)

    log_event("\nSorting all lectures chronologically (newest first)...")
    rows.sort(key=lambda r: r[2] or "0000-00-00", reverse=True)
    for idx, row in enumerate(rows, 1):
        row[0] = idx

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "Index",
                "Title",
                "Upload Date",
                "Duration",
                "Channel",
                "Source",
                "URL",
            ]
        )
        writer.writerows(rows)

    total_elapsed = str(timedelta(seconds=int(time.time() - start_time)))
    total_dupes = sum(s["dupes"] for s in stats.values())

    print("\n============================================================")
    print(f" DONE in {total_elapsed}")
    print(f" Output File          : {OUTPUT_FILE}")
    print(f" Total Unique Videos  : {len(rows)}")
    print(f" Total Dupes Skipped  : {total_dupes}")
    print("------------------------------------------------------------")
    for label, s in stats.items():
        print(f"   • {label}: +{s['added']} added, {s['dupes']} dupes ({s['time']})")
    print("============================================================")


if __name__ == "__main__":
    main()