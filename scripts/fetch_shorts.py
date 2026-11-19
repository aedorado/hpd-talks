import json
import subprocess
import os
import sys

PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLZ4N58AwlRQ4"
OUTPUT_JSON = os.path.abspath("data/shorts.json")
OUTPUT_JS = os.path.abspath("data/shorts-data.js")

def fetch_shorts():
    print(f"Fetching playlist: {PLAYLIST_URL}")
    cmd = [
        "yt-dlp",
        "--no-update",
        "--dump-single-json",
        "--flat-playlist",
        PLAYLIST_URL
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error fetching playlist:", res.stderr, file=sys.stderr)
        sys.exit(1)
    
    data = json.loads(res.stdout)
    entries = data.get("entries", [])
    
    seen = set()
    shorts = []
    
    for i, e in enumerate(entries, 1):
        yt_id = e.get("id")
        if not yt_id or yt_id in seen:
            continue
        seen.add(yt_id)
        
        title = e.get("title", "")
        # Clean title: remove trailing hashtags if any
        clean_title = title.replace("#shorts", "").replace("#Shorts", "").replace("#bhakti", "").replace("#iskcon", "").replace("@hpdrgg", "").strip()
        clean_title = clean_title.rstrip("|- ").strip()
        
        duration = e.get("duration")
        duration_str = ""
        if duration:
            m = int(duration) // 60
            s = int(duration) % 60
            duration_str = f"{m}:{s:02d}"
        
        shorts.append({
            "id": yt_id,
            "yt_id": yt_id,
            "catalog_id": f"S{len(shorts) + 1:03d}",
            "title": clean_title if clean_title else title,
            "raw_title": title,
            "duration": duration_str,
            "thumbnail": f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg",
            "url": f"https://www.youtube.com/watch?v={yt_id}",
            "shorts_url": f"https://www.youtube.com/shorts/{yt_id}"
        })
        
    # Reverse so newest / latest shorts appear first
    shorts.reverse()
    for i, s in enumerate(shorts, 1):
        s["catalog_id"] = f"S{i:03d}"

    print(f"Total unique shorts: {len(shorts)}")
    
    # Write JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(shorts, f, ensure_ascii=False, indent=2)
    print(f"Saved: {OUTPUT_JSON}")
    
    # Write JS
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write("/**\n * Offline fallback dataset for HG Hari Parshad Das - Upadesh Shorts\n */\n")
        f.write("window.SHORTS_DATA = ")
        json.dump(shorts, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"Saved: {OUTPUT_JS}")

if __name__ == "__main__":
    fetch_shorts()
