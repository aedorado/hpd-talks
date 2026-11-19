#!/usr/bin/env python3
"""
Applies the approved human-devotional 2-level taxonomy to combined_hpd_lectures.csv
and sorts chronologically earliest to latest.
"""
import csv
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from taxonomy_overrides import get_category_override, get_speaker, IGNORED_VIDEO_IDS

REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(REPO_ROOT, "data")
CSV_FILE = os.path.join(DATA_DIR, "combined_hpd_lectures.csv")
TALKS_CSV = os.path.join(DATA_DIR, "talks - HPD.csv")


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


def load_curated_folders():
    curated = {}
    if os.path.exists(TALKS_CSV):
        with open(TALKS_CSV, mode="r", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                vid = extract_yt_id(r.get("link", ""))
                fol = r.get("folder", "").strip()
                if vid and fol:
                    curated[vid] = fol
    return curated


def assign_taxonomy(r, curated):
    title = r.get("Title") or r.get("title") or ""
    t = title.lower()
    ch = r.get("Channel", "")
    vid = extract_yt_id(r.get("URL") or r.get("link") or "")
    cur = curated.get(vid, "")

    # 0. Check Manual / Curated Overrides first
    override = get_category_override(vid, title)
    if override:
        return override

    # =========================================================================
    # 1. FLAGSHIP MULTI-PART SEMINARS
    # =========================================================================
    if "intermediate rasa" in t or "intermediate rasas" in t:
        cat = "Three Intermediate Rasas (Seminar)"
        if "part 1" in t or "dāsya" in t or "dasya" in t:
            sub = "Part 1: Dasya-rasa (Servitorship)"
        elif "part 2" in t:
            sub = "Part 2: Sakhya-rasa (Fraternity)"
        elif "part 3" in t:
            sub = "Part 3: Sakhya-rasa (Fraternity - Contd)"
        elif "part 4" in t or "vātsalya" in t or "vatsalya" in t:
            sub = "Part 4: Vatsalya-rasa (Parental Affection)"
        else:
            sub = "Intermediate Rasas Overview"
        return cat, sub
    if "siksastakam" in t or "śikṣāṣṭakam" in t or "shikshashtakam" in t:
        cat = "Caitanya Siksastakam (Seminar)"
        if (
            "verse 01" in t
            or "verse 1" in t
            or "ceto-darpana" in t
            or "param vijayate" in t
            or "sarvatma-snapanam" in t
            or "vidya-vadhu" in t
            or "anandambudhi" in t
            or "sreya" in t
            or "bhava-maha" in t
        ):
            sub = "Verse 01: Ceto-Darpana-Marjanam"
        elif "verse 02" in t or "verse 2" in t or "namnam akari" in t:
            sub = "Verse 02: Namnam Akari Bahudha"
        elif "verse 03" in t or "verse 3" in t or "trnad api" in t:
            sub = "Verse 03: Trnad Api Sunicena"
        elif "verse 04" in t or "verse 4" in t or "na dhanam" in t:
            sub = "Verse 04: Na Dhanam Na Janam"
        elif "verse 05" in t or "verse 5" in t or "ayi nanda" in t:
            sub = "Verse 05: Ayi Nanda-Tanuja Kinkaram"
        elif "verse 06" in t or "verse 6" in t:
            sub = "Verse 06: Nayanam Galad-Asru"
        elif "verse 07" in t or "verse 7" in t:
            sub = "Verse 07: Yugayitam Nimesena"
        elif "verse 08" in t or "verse 8" in t:
            sub = "Verse 08: Aslisya Va"
        else:
            sub = "Introduction & Siksastakam Mahatmya"
        return cat, sub

    if (
        "upadeshamrit" in t
        or "upadeśāmṛta" in t
        or "nectar of instruction" in t
        or "noi" in t
    ):
        cat = "Upadeshamrta (Seminar)"
        if "recitation" in t or "introduction" in t:
            sub = "Introduction & Sanskrit Recitation"
        else:
            m = re.search(r"part\s*0*(\d+)", t)
            if m:
                num = int(m.group(1))
                if num <= 15:
                    sub = "Texts 01–03: Sense Control & Obstacles"
                elif num <= 30:
                    sub = "Texts 04–06: Loving Exchanges & Vaishnava Sanga"
                elif num <= 45:
                    sub = "Texts 07–08: Holy Name & Raganuga Practice"
                else:
                    sub = "Texts 09–11: Radha Kunda & Highest Perfection"
            else:
                sub = "Texts 01–03: Sense Control & Obstacles"
        return cat, sub

    if "beyond bhoga and tyaga" in t or cur == "Beyond Bhoga and Tyaga":
        m = re.search(r"session\s*(\d+)", t)
        sess = (
            f"Session {m.group(1)}"
            if m
            else "Govardhana Saranagati Retreat"
        )
        return "Beyond Bhoga & Tyaga (Seminar)", sess

    if "padyavali" in t or cur == "Padyavali":
        m = re.search(r"session\s*(\d+)", t)
        sess = f"Session {m.group(1)}" if m else "Padyavali Discourses"
        return "Sri Padyavali (Seminar)", sess

    if "sharad" in t and (
        "shravanotsav" in t or "pournima katha" in t or "ravet" in t
    ):
        if (
            "2026" in t
            or "24 oct 2026" in t
            or "25 oct 2026" in t
            or "26 oct 2026" in t
            or "11.03.38" in t
        ):
            sub = "Sharad Shravanotsav 2026 (5-Part Seminar)"
        elif "23" in t:
            sub = "Sharad Pournima 2023 (2-Part Seminar)"
        else:
            sub = "Sharad Poornima Shravanotsav"
        return "Sharad Poornima (Seminar)", sub

    # =========================================================================
    # 2. INDEPENDENT DIVINE PERSONALITIES
    # =========================================================================
    if "nityananda" in t or "nitai" in t or cur == "Nityananda":
        if "trayodashi" in t or "appearance" in t:
            sub = "Nityananda Trayodashi & Appearance Glories"
        elif "crest jewel" in t or "avadhuta" in t:
            sub = "Nitai — Crest Jewel of All Avadhutas"
        else:
            sub = "Pastimes & Merciful Mood of Nitai"
        return "Lord Nityananda Prabhu", sub

    if (
        "ramayana" in t
        or "ram navami" in t
        or "lord rama" in t
        or "rāma" in t
        or cur == "Ramayana/Rama"
    ):
        sub = (
            "Rama Navami Special"
            if "navami" in t
            else "Teachings from the Ramayana"
        )
        return "Lord Ramacandra", sub

    if "narasimha" in t or "nrsimha" in t or cur == "Narasimha":
        sub = (
            "Narasimha Caturdashi Special"
            if "caturdashi" in t or "chaturdashi" in t
            else "Prahlada Maharaja & Lord Narasimha"
        )
        return "Lord Narasimhadeva", sub

    if "balaram" in t or cur == "Balarama":
        sub = (
            "Balarama Purnima: Origin of Devotional Service"
            if "purnima" in t or "poornima" in t
            else "Glories & Pastimes of Lord Balarama"
        )
        return "Lord Balarama", sub

    if "shiva" in t or cur == "Shiva Tattva":
        return "Lord Shiva (Shiva Tattva)", "Vaishnavanam Yatha Sambhu"

    if (
        "jagannath" in t
        or "gundica" in t
        or "puri" in t
        or cur == "Jagannatha"
    ):
        sub = (
            "Gundica Temple Marjana"
            if "gundica" in t
            else "Jagannatha Puri Lila & Ratha Yatra"
        )
        return "Lord Jagannatha", sub

    clean_radha_t = re.sub(r"radhadesh|aparadha|aparādha|aparādhāḥ", "", t)
    if (
        ("radha" in clean_radha_t and not any(w in clean_radha_t for w in ["radhagovinda", "radhanath"]))
        or "radharani" in t
        or "barsana" in t
        or cur == "Radha Tattva"
    ):
        sub = (
            "Radhastami Special"
            if "radhastami" in t
            else "Glories, Compassion & Mood of Sri Radha"
        )
        return "Srimati Radharani (Radha Tattva)", sub

    if ("gaura" in t or "mahaprabhu" in t) and not (
        "caitanya caritamrta" in t or "caitanya bhagavata" in t
    ):
        sub = (
            "Gaura Purnima & Appearance"
            if "purnima" in t or "appearance" in t
            else "The Mood & Teachings of Gauranga"
        )
        return "Sri Caitanya Mahaprabhu (Gaura Tattva)", sub

    # =========================================================================
    # 3. MAJOR SCRIPTURES
    # =========================================================================
    if (
        "bhagavatam" in t
        or "sb " in t
        or "भागवत" in t
        or "remaining leg of dharma" in t
        or "bhagavat sravana" in t
        or cur in ["Srimad Bhagavatam", "Bhishma", "Creation", "Yajna-patnis"]
    ):
        cat = "Srimad Bhagavatam"
        if "11." in t or "canto 11" in t:
            sub = "Canto 11: Uddhava Gita & Mukti"
        elif "10." in t or "canto 10" in t or cur == "Yajna-patnis":
            sub = "Canto 10: Vraja Lila & Pastimes"
        elif "8." in t or "canto 8" in t:
            sub = "Canto 08: Gajendra & Samudra Manthan"
        elif "7." in t or "canto 7" in t or "prahlada" in t:
            sub = "Canto 07: Prahlada Maharaja Teachings"
        elif "5." in t or "canto 5" in t:
            sub = "Canto 05: Lord Rsabhadeva"
        elif "4." in t or "canto 4" in t:
            sub = "Canto 04: Prithu Maharaja & Pracetas"
        elif (
            "1." in t
            or "canto 1" in t
            or "remaining leg of dharma" in t
            or cur in ["Bhishma", "Creation"]
        ):
            sub = "Canto 01: Foundation of Bhakti & Dharma"
        else:
            sub = "Bhagavata Mahatmya & Overview"
        return cat, sub

    if (
        "bhagavad gita" in t
        or re.search(r"\bbg\b", t)
        or "gita overview" in t
        or cur == "Bhagavad Gita"
    ):
        cat = "Bhagavad Gita"
        if "hindi" in t or "हिन्दी" in t or "प्रवचनमाला" in t:
            sub = "Hindi Discourse Series (भाग ००१–००८)"
        elif "1." in t or "chapter 1" in t:
            sub = "Chapter 1: Observing the Armies"
        elif "3." in t or "chapter 3" in t:
            sub = "Chapter 3: Karma Yoga"
        elif "5." in t or "chapter 5" in t:
            sub = "Chapter 5: Karma Sannyasa Yoga"
        else:
            sub = "Advent & Traditions of Bhagavad Gita"
        return cat, sub

    if (
        "caitanya caritamrta" in t
        or "cc " in t
        or cur == "Caitanya Caritamrta"
    ):
        cat = "Sri Caitanya Caritamrta"
        if "antya" in t:
            sub = "Antya Lila: Gambhira Moods of Separation"
        elif "madhya" in t:
            sub = "Madhya Lila: Ecstatic Travels & Tattva"
        elif "adi" in t:
            sub = "Adi Lila: The Golden Descent"
        else:
            sub = "Caitanya Caritamrta Katha"
        return cat, sub

    if "caitanya bhagavata" in t or cur == "Caitanya Bhagavata":
        return "Sri Caitanya Bhagavata", "Adi Khanda & Early Pastimes"

    if (
        "bhakti-rasamrita" in t
        or "bhakti rasa" in t
        or "brs" in t
        or "ujjwala rasa" in t
        or cur
        in [
            "Bhakti-rasamrita-sindhu",
            "Three Intermediate rasas",
            "Bhakti — Definition & Nature",
            "Vaidhi-Raganuga Bhakti",
            "Pure Devotion",
        ]
    ):
        cat = "Bhakti-rasamrita-sindhu"
        if (
            "definition" in t
            or "paribhasha" in t
            or cur in ["Bhakti — Definition & Nature", "Pure Devotion"]
        ):
            sub = "Definition & Nature of Uttama Bhakti"
        elif (
            "ujjwala" in t
            or "intermediate" in t
            or cur == "Three Intermediate rasas"
        ):
            sub = "Ujjwala & Intermediate Rasas"
        elif (
            "sadhana" in t
            or "vaidhi" in t
            or "raganuga" in t
            or cur == "Vaidhi-Raganuga Bhakti"
        ):
            sub = "Sadhana Bhakti: Vaidhi & Raganuga"
        else:
            sub = "Science of Devotional Mellows"
        return cat, sub

    # =========================================================================
    # 4. SRI KRISHNA & VRAJA LILA
    # =========================================================================
    if "damodara" in t or cur == "Damodara Lila":
        return "Sri Krishna & Vraja Lila", "Damodara Lila (Kartika Katha)"
    if (
        "sharad" in t
        or "rasa dance" in t
        or cur in ["Rasa Dance", "Sharad Poornima Katha"]
    ):
        return "Sri Krishna & Vraja Lila", "Sharad Poornima & Rasa Lila"
    if "janmashtami" in t or cur == "Janmashtami":
        return (
            "Sri Krishna & Vraja Lila",
            "Janmashtami: The Divine Appearance",
        )
    if "putana" in t or cur == "Putana Lila":
        return "Sri Krishna & Vraja Lila", "Putana Moksha Lila"
    if (
        "vatasura" in t
        or "mrd-bhakshana" in t
        or "syamantaka" in t
        or "krishna lila" in t
        or cur
        in [
            "Krishna Lila",
            "Mrd-bhakshana Lila",
            "Syamantaka Jewel",
            "Vatsasura Lila",
        ]
    ):
        return "Sri Krishna & Vraja Lila", "Childhood Pastimes & Vraja Lila"
    if "krishna" in t or cur == "Krishna / Bhagavan Tattva":
        return "Sri Krishna & Vraja Lila", "Krishna Tattva & The Supreme Lord"
    if "prema" in t or "priti" in t or cur == "Prema Bhakti":
        return "Sri Krishna & Vraja Lila", "The Awakening of Prema Bhakti"

    # =========================================================================
    # 5. RETREATS & SPECIAL SEMINARS
    # =========================================================================
    if (
        "god’s unfulfilled" in t
        or "god's unfulfilled" in t
        or "hankering god" in t
        or "immersion" in t
        or cur == "Retreats/Seminars"
    ):
        if "unfulfilled" in t:
            sub = "God’s Unfulfilled Desires (Bhakti Immersion)"
        elif "hankering god" in t:
            sub = "The Hankering God Seminar"
        else:
            sub = "Bhakti Immersion Retreats"
        return "Thematic Seminars & Retreats", sub

    # =========================================================================
    # 6. GAUDIYA ACARYAS
    # =========================================================================
    if (
        "rupa goswami" in t
        or "goswamis" in t
        or "vallabhacharya" in t
        or "narottama" in t
        or cur
        in [
            "Rupa Goswami",
            "Hari Suri / Commentary",
            "Narottama Dasa Thakura",
            "Scripture Study",
            "Shastra / Scripture Approach",
        ]
    ):
        return "The Gaudiya Acaryas", "Six Goswamis & Acarya Commentaries"
    if "prabhupada" in t or cur == "Srila Prabhupada":
        return "The Gaudiya Acaryas", "Srila Prabhupada Teachings & Legacy"
    if (
        "sandarbha" in t
        or "gopala tapani" in t
        or "vedas" in t
        or cur
        in [
            "Tattva Sandarbha",
            "Gopala Tapani Upanishad",
            "Vedas & Tantras",
        ]
    ):
        return "The Gaudiya Acaryas", "Sandarbhas & Upanishads"

    # =========================================================================
    # 7. PRACTICAL BHAKTI & SADHANA
    # =========================================================================
    if (
        "marriage" in t
        or "grihastha" in t
        or "social life" in t
        or cur == "Grihastha / Marriage"
    ):
        sub = (
            "Principles of Vedic Marriage"
            if "marriage" in t
            else "Social Life & Individual Bhakti"
        )
        return "Grihastha Ashrama & Family Life", sub
    if (
        "japa" in t
        or "kirtan" in t
        or "harinam" in t
        or cur in ["Japa-Kirtan-Smarana", "Harinama/Chanting"]
    ):
        return "Japa, Kirtan & Harinama", "Nama Tattva, Meditation & Kirtan"
    if (
        "lust" in t
        or "anger" in t
        or "anartha" in t
        or "vairagya" in t
        or "fleeting" in t
        or cur in ["Anarthas / Overcoming Lust", "Vairagya", "Lust / Anarthas"]
    ):
        return (
            "Mind, Anarthas & Vairagya",
            "Purifying the Heart & True Detachment",
        )
    if (
        "guru" in t
        or "diksha" in t
        or "दीक्षा" in t
        or cur in ["Guru & Acharya Tattva", "Initiation Ceremonies"]
    ):
        return (
            "Guru Tattva & Initiation",
            "The Shelter of Sadhu Guru & Diksha",
        )
    if (
        "sadhu sanga" in t
        or "vaishnava" in t
        or "friendship" in t
        or "simplicity" in t
        or cur in ["Vaishnava Friendship", "Siksa / Vaishnava Society"]
    ):
        return (
            "Vaishnava Qualities & Sangha",
            "Sadhu-Sanga & Childlike Simplicity",
        )
    if (
        "govardhan" in t
        or "vrindavan" in t
        or "vraja" in t
        or "yamuna" in t
        or "dhama" in t
        or cur in ["Dhama Tattva", "Govardhan", "Vrindavana/Vraja"]
    ):
        return (
            "Dhama Tattva & Sacred Places",
            "Vrindavana, Govardhana & Sri Yamuna",
        )
    if "stotra" in t or "recitation" in t or "meter:" in t:
        return (
            "Sanskrit Stotras & Recitations",
            "Vedic Metres & Acarya Prayers",
        )
    if (
        "pushpa" in t
        or "utsava" in t
        or cur in ["Deity Worship", "Seva"]
    ):
        return "Festivals & Temple Seva", "Utsavas & Deity Worship"
    if (
        "q & a" in t
        or "qa" in t
        or "podcast" in t
        or cur in ["Q&A Sessions", "Podcasts/Interviews"]
    ):
        return (
            "Q&A, Podcasts & Interviews",
            "Devotee Inquiries & Discussions",
        )
    if "sunday" in t or "Sunday" in ch or cur == "Sunday Programs":
        return "Community Discourses", "Sunday Feast Lectures"

    if (
        "bhakti" in t
        or "भजन" in t
        or "yogi" in t
        or cur
        in [
            "Bhakti — Practical Progress",
            "Practical Bhakti Topics",
            "Sadhana Bhakti",
            "Karma-Jnana-Moksha",
            "Jiva & Maya Tattva",
            "Universal Nature of Bhakti Yoga",
            "Mercy / Kripa",
        ]
    ):
        return "Practical Bhakti & Sadhana", "Living a Life of Devotion"

    return "Community Discourses", "General Assembly Lectures"


def main():
    curated = load_curated_folders()

    with open(CSV_FILE, mode="r", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    # Filter out completely ignored videos (e.g. non-HPD accidental scrapes)
    rows = [r for r in rows if extract_yt_id(r.get("URL") or "") not in IGNORED_VIDEO_IDS]

    for r in rows:
        cat, sub = assign_taxonomy(r, curated)
        r["Category"] = cat
        r["Subcategory"] = sub

    # Chronological sort: earliest to latest, with part numbers in order
    rows.sort(
        key=lambda r: (
            r.get("Upload Date") or "9999-99-99",
            extract_part_num(r.get("Title", "")),
            r.get("Title", ""),
        )
    )

    for idx, r in enumerate(rows, 1):
        r["Index"] = idx
        vid = extract_yt_id(r.get("URL") or "")
        r["Speaker"] = get_speaker(vid, idx)

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

    with open(CSV_FILE, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✓ Successfully wrote {len(rows)} lectures to {CSV_FILE}")
    print(f"  Columns: {fieldnames}")


if __name__ == "__main__":
    main()
