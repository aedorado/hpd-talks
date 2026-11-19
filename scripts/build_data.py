#!/usr/bin/env python3
"""
Convert 'combined_hpd_lectures.csv' (or 'talks - HPD.csv') into:
1. data/lectures.json (clean JSON dataset using 11-char YouTube ID as primary key)
2. data/lectures-data.js (fallback for local file:// testing without CORS)
Includes 2-level Category and Subcategory taxonomy.
"""
import csv
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from taxonomy_overrides import get_speaker, get_catalog_id, get_category_override, IGNORED_VIDEO_IDS

REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(REPO_ROOT, "data")
MASTER_CSV = os.path.join(DATA_DIR, "combined_hpd_lectures.csv")
FALLBACK_CSV = os.path.join(DATA_DIR, "talks - HPD.csv")
JSON_OUTPUT = os.path.join(DATA_DIR, "lectures.json")
JS_OUTPUT = os.path.join(DATA_DIR, "lectures-data.js")


def extract_yt_id(url: str) -> str:
    """Extract 11-char YouTube video ID from various YouTube URL patterns."""
    match = re.search(r"(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""


def main():
    source_file = MASTER_CSV if os.path.exists(MASTER_CSV) else FALLBACK_CSV
    if not os.path.exists(source_file):
        print(f"Error: Neither {MASTER_CSV} nor {FALLBACK_CSV} found!")
        return

    print(f"Building web dataset from: {source_file}")
    os.makedirs(DATA_DIR, exist_ok=True)
    lectures = []

    with open(source_file, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        idx = 0
        for row in reader:
            link = row.get("URL") or row.get("link") or ""
            yt_id = extract_yt_id(link)
            if yt_id in IGNORED_VIDEO_IDS:
                continue
            idx += 1

            title = row.get("Title") or row.get("title") or "Untitled"
            channel = row.get("Channel") or "Unknown Channel"
            category = row.get("Category") or row.get("folder") or "General Discourses"
            subcategory = row.get("Subcategory") or ""
            upload_date = row.get("Upload Date", "")
            duration = row.get("Duration", "")

            # Check category override if any
            cat_override = get_category_override(yt_id, title)
            if cat_override:
                category, subcategory = cat_override

            # Resolve speaker
            speaker = row.get("Speaker") or get_speaker(yt_id, idx)
            catalog_id = get_catalog_id(yt_id, idx, speaker)
            primary_id = yt_id if yt_id else catalog_id

            lecture_entry = {
                "id": primary_id,
                "yt_id": yt_id,
                "catalog_id": catalog_id,
                "speaker": speaker,
                "index": idx,
                "title": title.strip(),
                "category": category.strip(),
                "subcategory": subcategory.strip(),
                "upload_date": upload_date.strip(),
                "duration": duration.strip(),
                "channel": channel.strip(),
                "url": f"https://www.youtube.com/watch?v={yt_id}"
                if yt_id
                else link,
                "thumbnail": f"https://img.youtube.com/vi/{yt_id}/mqdefault.jpg"
                if yt_id
                else "",
            }

            if category.strip() == "Upadeshamrta (Seminar)":
                lecture_entry["resources"] = [
                    {
                        "title": "Upadeshamrita Q&A (WhatsApp Compilation)",
                        "pages": 421,
                        "size": "6.7 MB",
                        "url": "resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf",
                        "description": "Comprehensive 421-page Q&A exchanges by HG Hari Parshad Das clarifying verses 1 to 11.",
                    }
                ]

            lectures.append(lecture_entry)

    # Write JSON
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(lectures, f, ensure_ascii=False, indent=2)

    # Write JS file for zero-CORS / offline file opening
    with open(JS_OUTPUT, "w", encoding="utf-8") as f:
        f.write(
            "// Auto-generated lectures dataset for local offline fallback\n"
        )
        f.write(
            "window.LECTURES_DATA = "
            + json.dumps(lectures, ensure_ascii=False)
            + ";\n"
        )

    # Sync Shorts data if present
    shorts_json_path = os.path.join(DATA_DIR, "shorts.json")
    shorts_js_path = os.path.join(DATA_DIR, "shorts-data.js")
    if os.path.exists(shorts_json_path):
        with open(shorts_json_path, "r", encoding="utf-8") as f:
            shorts_data = json.load(f)
        with open(shorts_js_path, "w", encoding="utf-8") as f:
            f.write("/**\n * Offline fallback dataset for HG Hari Parshad Das - Upadesh Shorts\n */\n")
            f.write("window.SHORTS_DATA = " + json.dumps(shorts_data, ensure_ascii=False, indent=2) + ";\n")
        print(f"✓ Synced {len(shorts_data)} shorts to {shorts_js_path}")

    print(f"✓ Converted {len(lectures)} lectures successfully!")
    print(f"  • Primary Key: 11-char YouTube Video ID")
    print(f"  • Categories & Subcategories included")
    print(f"  • Chronological Order: Earliest to Latest")
    print(f"  • Output JSON : {JSON_OUTPUT}")
    print(f"  • Output JS   : {JS_OUTPUT}")


if __name__ == "__main__":
    main()
