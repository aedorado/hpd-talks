#!/usr/bin/env python3
"""
Convert 'talks - HPD.csv' into:
1. data/lectures.json (clean JSON dataset using 11-char YouTube ID as primary key)
2. data/lectures-data.js (fallback for local file:// testing without CORS)
"""
import csv
import json
import os
import re

CSV_FILE = "talks - HPD.csv"
DATA_DIR = "data"
JSON_OUTPUT = os.path.join(DATA_DIR, "lectures.json")
JS_OUTPUT = os.path.join(DATA_DIR, "lectures-data.js")


def extract_yt_id(url: str) -> str:
    """Extract 11-char YouTube video ID from various YouTube URL patterns."""
    match = re.search(r"(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""


def main():
    if not os.path.exists(CSV_FILE):
        print(f"Error: {CSV_FILE} not found!")
        return

    os.makedirs(DATA_DIR, exist_ok=True)
    lectures = []

    with open(CSV_FILE, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            link = row.get("link", "").strip()
            yt_id = extract_yt_id(link)
            title = row.get("title", "").strip()
            channel = row.get("Channel", "").strip() or "Unknown Channel"
            category = row.get("folder", "").strip() or "Miscellaneous"

            title_updated = row.get("title_updated", "").strip()
            if title_updated and " - " in title_updated:
                catalog_id = title_updated.split(" - ")[0].strip()
            else:
                catalog_id = f"HPD{i + 1:04d}"

            # Primary key is the permanent 11-char YouTube ID
            primary_id = yt_id if yt_id else catalog_id

            lectures.append(
                {
                    "id": primary_id,
                    "yt_id": yt_id,
                    "catalog_id": catalog_id,
                    "index": i + 1,
                    "title": title,
                    "channel": channel,
                    "category": category,
                    "url": f"https://www.youtube.com/watch?v={yt_id}"
                    if yt_id
                    else link,
                    "thumbnail": f"https://img.youtube.com/vi/{yt_id}/mqdefault.jpg"
                    if yt_id
                    else "",
                }
            )

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

    print(f"✓ Converted {len(lectures)} lectures successfully!")
    print(f"  • Primary Key: 11-char YouTube Video ID")
    print(f"  • {JSON_OUTPUT}")
    print(f"  • {JS_OUTPUT}")


if __name__ == "__main__":
    main()
