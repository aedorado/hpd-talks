export interface LectureResource {
  title: string;
  pages: number;
  size: string;
  url: string;
  description: string;
}

export interface Lecture {
  id: string;
  yt_id: string;
  catalog_id: string;
  speaker: string;
  index: number;
  title: string;
  category: string;
  subcategory: string;
  upload_date: string;
  duration: string;
  channel: string;
  url: string;
  thumbnail: string;
  resources?: LectureResource[];
}

export interface ShortItem {
  id: string;
  yt_id: string;
  catalog_id: string;
  title: string;
  raw_title?: string;
  duration?: string;
  thumbnail: string;
  url: string;
  shorts_url: string;
  speaker?: string;
  index?: number;
  category?: string;
  upload_date?: string;
  channel?: string;
}
