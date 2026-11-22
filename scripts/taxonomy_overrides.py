#!/usr/bin/env python3
"""
Taxonomy Overrides & Speaker Exceptions for HPD Katha Sangraha.

Contains curated overrides for:
1. Speakers (Gour Govinda Swami Maharaja, Madhavananda Das, Sacinandana Swami, Srila Prabhupada)
2. Catalog ID prefixes
3. Specific lecture category & subcategory corrections (e.g. podcasts mislabeled due to title words)
"""

# Video IDs to completely exclude from the repository (e.g. non-HPD lectures scraped accidentally)
IGNORED_VIDEO_IDS = {
    "-uabMD0KaUc",  # HPD0029: Personal family clip (~ Hari forces Papa to chant Harinam ~)
    "-uabMD0KaUc",  # HPD0029: Personal family clip (~ Hari forces Papa to chant Harinam ~)
}

# YouTube Video ID -> Speaker Name
SPEAKER_BY_YT_ID = {
    # 1-20: HH Gour Govinda Swami Maharaja lectures uploaded on @hpdrgg in 2011-2012
    "uSEQA3KYmpc": "HH Gour Govinda Swami",
    "2_7snnyFggM": "HH Gour Govinda Swami",
    "TRxa3wIZofU": "HH Gour Govinda Swami",
    "BxWaUDNdTXQ": "HH Gour Govinda Swami",
    "XHsaC6kPvl0": "HH Gour Govinda Swami",
    "Hz16fmVFbcc": "HH Gour Govinda Swami",
    "mxD-nkZxGFE": "HH Gour Govinda Swami",
    "eQn3o9tafec": "HH Gour Govinda Swami",
    "lRB_E3Uqyrc": "HH Gour Govinda Swami",
    "Bc0MryHP_lM": "HH Gour Govinda Swami",
    "sPTWnO9XZiM": "HH Gour Govinda Swami",
    "8U1_19BH40Y": "HH Gour Govinda Swami",
    "jkSZ6faIEK8": "HH Gour Govinda Swami",
    "a0HagjyGLTY": "HH Gour Govinda Swami",
    "Qb_n_w6y7gE": "HH Gour Govinda Swami",
    "rRJd5lWtllk": "HH Gour Govinda Swami",
    "en7qDKMcqzA": "HH Gour Govinda Swami",
    "_gmBxAZA1No": "HH Gour Govinda Swami",
    "xrTMAIYeNS8": "HH Gour Govinda Swami",
    "BvQtfWM95Kc": "HH Gour Govinda Swami",
    
    # 32-34: HG Madhavananda Das lectures
    "SLUekIyb3cc": "HG Madhavananda Das",
    "2xgqKeIOui0": "HG Madhavananda Das",
    "xi9EXdQc7_U": "HG Madhavananda Das",
    
    # Other Acaryas & Joint Seminars
    "wfazGLT3cfs": "HH Radha Govinda Dasa Goswami",
    "eM1K70220z0": "HG Hari Parshad Das & HH Sacinandana Swami",
    "m6v1c8L4mrs": "HG Hari Parshad Das & HH Sacinandana Swami",
    "0v5Fw3yWpBs": "HH Sacinandana Swami",
    "R_K_6_d5r58": "HH Romapada Swami, HH Jayadvaita Swami & HG Hari Parshad Das",
}

# YouTube Video ID -> (Category, Subcategory)
CATEGORY_OVERRIDES = {
    # Non-HPD Talks: Dedicated speaker categories so they never mix into HPD topic categories
    "uSEQA3KYmpc": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "2_7snnyFggM": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "TRxa3wIZofU": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "BxWaUDNdTXQ": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "XHsaC6kPvl0": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "Hz16fmVFbcc": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "mxD-nkZxGFE": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "eQn3o9tafec": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "lRB_E3Uqyrc": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "Bc0MryHP_lM": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "sPTWnO9XZiM": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "8U1_19BH40Y": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "jkSZ6faIEK8": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "a0HagjyGLTY": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "Qb_n_w6y7gE": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "rRJd5lWtllk": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "en7qDKMcqzA": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "_gmBxAZA1No": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "xrTMAIYeNS8": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),
    "BvQtfWM95Kc": ("HH Gour Govinda Swami", "Katha Archive (@hpdrgg)"),

    # HG Madhavananda Das Lectures
    "SLUekIyb3cc": ("HG Madhavananda Das", "Guest Discourses"),
    "2xgqKeIOui0": ("HG Madhavananda Das", "Guest Discourses"),
    "xi9EXdQc7_U": ("HG Madhavananda Das", "Guest Discourses"),

    # Other Guest Speakers
    "wfazGLT3cfs": ("HH Radha Govinda Dasa Goswami", "Initiation Ceremony"),
    "0v5Fw3yWpBs": ("HH Sacinandana Swami", "Concluding Words"),

    # Short Q&A and Practical Bhakti Talks (Hare Krsna TV)
    "SKfLBawvkrI": (
        "Practical Bhakti & Sadhana",
        "Karma, Destiny & Devotional Outlook",
    ),
    "tChzjdB6aFk": (
        "Japa, Kirtan & Harinama",
        "Harinama Mahatmya & Purpose of Chanting",
    ),

    # Three Intermediate Rasas (Seminar) — Parts 1 to 4
    "7WjcZmWOaN4": (
        "Three Intermediate Rasas (Seminar)",
        "Part 1: Dasya-rasa (Servitorship)",
    ),
    "aibmGf3cs1c": (
        "Three Intermediate Rasas (Seminar)",
        "Part 1: Dasya-rasa (Servitorship)",
    ),
    "MpNV4326Zfk": (
        "Three Intermediate Rasas (Seminar)",
        "Part 2: Sakhya-rasa (Fraternity)",
    ),
    "WEjGmy4hQPs": (
        "Three Intermediate Rasas (Seminar)",
        "Part 2: Sakhya-rasa (Fraternity)",
    ),
    "QxMGnI0D374": (
        "Three Intermediate Rasas (Seminar)",
        "Part 3: Sakhya-rasa (Fraternity - Contd)",
    ),
    "CJ5jiUL0bwg": (
        "Three Intermediate Rasas (Seminar)",
        "Part 3: Sakhya-rasa (Fraternity - Contd)",
    ),
    "JMDVqSKkFG8": (
        "Three Intermediate Rasas (Seminar)",
        "Part 4: Vatsalya-rasa (Parental Affection)",
    ),
    "dAiW3kiyBNA": (
        "Three Intermediate Rasas (Seminar)",
        "Part 4: Vatsalya-rasa (Parental Affection)",
    ),

    # Radhadesh talks misclassified due to 'radha' in Radhadesh
    "3xcr08Qu1u4": (
        "Mind, Anarthas & Vairagya",
        "Overcoming Pride, Lust & Obstacles",
    ),
    "XnGSDjfluuk": (
        "Practical Bhakti & Sadhana",
        "Surrender, Faith & Sharanagati",
    ),
    "b8TOf4kvjfg": (
        "Practical Bhakti & Sadhana",
        "Surrender, Faith & Sharanagati",
    ),
    "aOhTVjI3Np8": (
        "Sri Krishna & Vraja Lila",
        "Krishna Tattva & Inconceivable Nature",
    ),

    # The Ten Nama Aparadhas (misclassified due to 'radha' in aparadha)
    "VEhM0FCnVG8": (
        "Japa, Kirtan & Harinama",
        "Nama-Aparadha & Offenses to Avoid",
    ),

    # Detailed LLM Audited Topic Corrections
    "sIFFmYlYhAs": (
        "Q&A, Podcasts & Interviews",
        "Ask a Hare Krsna (Q&A)",
    ),
    "wzGdPFXQSok": (
        "The Gaudiya Acaryas",
        "Nine Pillars of Madhvacarya's Philosophy",
    ),
    "o6L9osoZ4HQ": (
        "The Gaudiya Acaryas",
        "Nine Pillars of Madhvacarya's Philosophy",
    ),
    "aZjHe1cRIjQ": (
        "The Gaudiya Acaryas",
        "Nine Pillars of Madhvacarya's Philosophy",
    ),
    "CjlKbpj047w": (
        "Japa, Kirtan & Harinama",
        "Namashtakam & Holy Name Glories",
    ),
    "VqZRGNFa4ZU": (
        "Guru Tattva & Initiation",
        "Diksha, Shiksha & Guru Parampara",
    ),
    "eq1K1ws1Ufs": (
        "Srimad Bhagavatam",
        "Canto 01: Creation & Srimad Bhagavatam Mahatmya",
    ),
    "NzGFnopsa78": (
        "Upadeshamrta (Seminar)",
        "Texts 01–03: Sense Control & Obstacles",
    ),
    "1HGqwEtnDM8": (
        "Upadeshamrta (Seminar)",
        "Texts 01–03: Sense Control & Obstacles",
    ),
    "98W_SLjE3UE": (
        "Srimad Bhagavatam",
        "Canto 05: Rishabhadeva & Bharata Maharaja",
    ),
    "5hMut8GPBJw": (
        "Japa, Kirtan & Harinama",
        "Harinama Mahatmya & Purpose of Chanting",
    ),
    "0QNzSFWIyDY": (
        "Bhakti-rasamrita-sindhu",
        "Bhakti-rasa & Devotional Mellows",
    ),
    "7bz_z5iKizo": (
        "Bhakti-rasamrita-sindhu",
        "Bhakti-rasa & Devotional Mellows",
    ),
    "TSTMvm5ywX0": (
        "Japa, Kirtan & Harinama",
        "Kirtan Sessions & Harinama Sankirtana",
    ),
    "QmWckGFU0MY": (
        "Practical Bhakti & Sadhana",
        "Universality of Bhakti",
    ),
    "T0CQhwWQfng": (
        "Festivals & Temple Seva",
        "Bhishma Panchak Vishesh Katha (Nashik)",
    ),
    "QS7w2vJb9XY": (
        "Festivals & Temple Seva",
        "Govardhana Puja & Annakuta",
    ),
    "Im1LBGiKx5g": (
        "Q&A, Podcasts & Interviews",
        "Retreat & Seminar Q&A",
    ),
    "iBnvOASqfSs": (
        "Bhakti-rasamrita-sindhu",
        "Bhakti-rasa & Devotional Mellows",
    ),
    "m08VHNTO2sA": (
        "Festivals & Temple Seva",
        "Govardhana Puja & Annakuta",
    ),
    "WDiFM-F-erE": (
        "Sri Padyavali (Seminar)",
        "The Joyous Waves of Padyavali",
    ),
    "3vgoL_4-78E": (
        "Sri Padyavali (Seminar)",
        "The Joyous Waves of Padyavali",
    ),
    "NWHEaQ4XvLM": (
        "Sanskrit Stotras & Recitations",
        "Stotras & Prayers with Commentary",
    ),
    "wckxWxE2vxQ": (
        "Grihastha Ashrama & Family Life",
        "Vedic Family Life & Duties",
    ),
    "vEj0sdNmufo": (
        "Bhagavad Gita",
        "Hindi Discourse Series (भाग ००१–००८)",
    ),

    # Podcasts & Interviews Corrections
    # Index 355: Yoga of Love Podcast on Lord Shiva, Demigods & Gita
    "v3HEpDIUO00": (
        "Q&A, Podcasts & Interviews",
        "Yoga of Love Podcast",
    ),
    # Index 572: The Namarasa Podcast Ep. 188
    "s4urMweShR8": (
        "Q&A, Podcasts & Interviews",
        "The Namarasa Podcast",
    ),
    # Index 577: Podcast with Siksastakam Prabhu (not part of Caitanya Siksastakam seminar)
    "0bjvi3eAs74": (
        "Q&A, Podcasts & Interviews",
        "Atma-manthana Podcast (Devotee Inquiries)",
    ),
    # Index 356: Podcast with Ishvara Gauranga Pr
    "PqakbosgZ18": (
        "Q&A, Podcasts & Interviews",
        "Yoga of Love Podcast",
    ),
    # Index 479: Hare Krishna TV Hindi Interview
    "qIAXpocTaKs": (
        "Q&A, Podcasts & Interviews",
        "Hare Krishna TV Interview",
    ),
    # Index 597: ISKCON Vrindavan Podcast Hindi - Ep 1
    "JtkT1Go8m6U": (
        "Q&A, Podcasts & Interviews",
        "ISKCON Vrindavan Podcast",
    ),
    # Index 598: Podcast with ISKCON Vrindavan
    "n4kt95pDSNY": (
        "Q&A, Podcasts & Interviews",
        "ISKCON Vrindavan Podcast",
    ),
}


def get_speaker(yt_id: str, index: int = 0) -> str:
    """Return the designated speaker for a lecture, defaulting to HG Hari Parshad Das."""
    if yt_id in SPEAKER_BY_YT_ID:
        return SPEAKER_BY_YT_ID[yt_id]
    if 1 <= index <= 20:
        return "HH Gour Govinda Swami"
    if index in (32, 33, 34):
        return "HG Madhavananda Das"
    return "HG Hari Parshad Das"


def get_catalog_id(yt_id: str, index: int, speaker: str) -> str:
    """Generate appropriate catalog code prefix based on speaker."""
    if speaker == "HH Gour Govinda Swami":
        return f"GGS{index:04d}"
    if speaker == "HG Madhavananda Das":
        return f"MD{index:04d}"
    if speaker == "Srila Prabhupada":
        return f"SP{index:04d}"
    return f"HPD{index:04d}"


def get_category_override(yt_id: str, title: str = ""):
    """Return (Category, Subcategory) override if exists, else None."""
    if yt_id in CATEGORY_OVERRIDES:
        return CATEGORY_OVERRIDES[yt_id]
    
    # Catch any titles with Siksastakam Prabhu in podcasts
    if "श्री-शिक्षाष्टकं प्रभु" in title or "śikṣāṣṭakam prabhu" in title.lower():
        return (
            "Q&A, Podcasts & Interviews",
            "Atma-manthana Podcast (Devotee Inquiries)",
        )

    # Catch Namarasa podcast
    if "namarasa" in title.lower() or "ep. 188" in title.lower():
        return (
            "Q&A, Podcasts & Interviews",
            "The Namarasa Podcast",
        )

    # Any other non-HPD speaker should not be placed into HPD topic categories
    speaker = SPEAKER_BY_YT_ID.get(yt_id)
    if speaker in (
        "HH Gour Govinda Swami",
        "HG Madhavananda Das",
        "HH Radha Govinda Dasa Goswami",
        "Srila Prabhupada",
        "HH Sacinandana Swami",
    ):
        return speaker, "Archival / Guest Discourses"

    return None
