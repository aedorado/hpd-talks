#!/usr/bin/env python3
"""
Reusable utility to append ANY YouTube Playlist or Channel to combined_hpd_lectures.csv.
Automatically assigns smart category, checks for duplicates, and sorts earliest to latest.

Usage:
    python3 append_playlist.py "https://www.youtube.com/playlist?list=..."
    python3 append_playlist.py "https://www.youtube.com/@channelname/videos"
"""
import csv
import json
import os
import re
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
CSV_FILE = os.path.join(REPO_ROOT, "data", "combined_hpd_lectures.csv")


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


def main():
    if len(sys.argv) < 2:
        print("=" * 65)
        print(" YouTube Lecture Appender — Incremental & Chronological")
        print("=" * 65)
        print("Usage:")
        print(
            "  python3 append_playlist.py <YouTube_Playlist_or_Channel_URL> [Optional_Source_Label]\n"
        )
        print("Example:")
        print(
            '  python3 append_playlist.py "https://www.youtube.com/playlist?list=PLi0jknRok56lADNPPKotZjiproO8GSK34"\n'
        )
        sys.exit(1)

    target_url = sys.argv[1].strip()
    source_label = (
        sys.argv[2].strip()
        if len(sys.argv) > 2
        else "YouTube Playlist / Channel"
    )

    if not os.path.exists(CSV_FILE):
        print(f"Error: {CSV_FILE} not found!")
        sys.exit(1)

    # 1. Read existing rows
    existing_rows = []
    seen_yt_ids = set()

    with open(CSV_FILE, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            vid = extract_yt_id(r.get("URL", ""))
            if vid:
                seen_yt_ids.add(vid)
            existing_rows.append(r)

    print("=" * 65)
    print(f" Checking Target: {target_url}")
    print(f" Existing Lectures in Database: {len(existing_rows)}")
    print("=" * 65)

    # 2. Fetch with yt-dlp
    print("Fetching video list from YouTube...")
    cmd = [
        "yt-dlp",
        "--no-update",
        "--ignore-errors",
        "--skip-download",
        "--dump-json",
        target_url,
    ]

    proc = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    added_rows = []
    skipped_count = 0

    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue

        vid = item.get("id")
        title = item.get("title", "").strip()
        if not vid or not title:
            continue

        from taxonomy_overrides import IGNORED_VIDEO_IDS
        if vid in seen_yt_ids or vid in IGNORED_VIDEO_IDS:
            skipped_count += 1
            print(f"  [ALREADY EXISTS / IGNORED] ({vid}) {title[:55]}")
            continue

        upload_date = format_date(item.get("upload_date", ""))
        duration = item.get("duration_string") or "N/A"
        channel = (
            item.get("channel")
            or item.get("uploader")
            or "Unknown Channel"
        )
        video_url = f"https://www.youtube.com/watch?v={vid}"
        from apply_full_taxonomy import assign_taxonomy, load_curated_folders
        from taxonomy_overrides import get_speaker
        if not hasattr(main, 'curated'):
            main.curated = load_curated_folders()
        category, subcategory = assign_taxonomy(item, main.curated)
        speaker = get_speaker(vid)

        row_dict = {
            "Index": len(existing_rows) + len(added_rows) + 1,
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
        added_rows.append(row_dict)
        seen_yt_ids.add(vid)
        print(
            f"  [+NEW] [{category} > {subcategory}] ({vid}) {title[:40]} | {upload_date} | {duration}"
        )

    proc.wait()

    print("\n" + "=" * 65)
    print(f" Scan Finished!")
    print(f" • Skipped already present : {skipped_count}")
    print(f" • Newly added             : {len(added_rows)}")

    if added_rows:
        all_rows = existing_rows + added_rows
        all_rows.sort(
            key=lambda r: (
                r.get("Upload Date") or "9999-99-99",
                extract_part_num(r.get("Title", "")),
                r.get("Title", ""),
            )
        )

        for idx, r in enumerate(all_rows, 1):
            r["Index"] = idx

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
        with open(CSV_FILE, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_rows)

        print(f" ✓ Successfully updated {CSV_FILE}!")
        print(f" • Total Lectures Now     : {len(all_rows)}")
    else:
        print(" Database is already up-to-date! No changes made.")
    print("=" * 65)


if __name__ == "__main__":
    main()
