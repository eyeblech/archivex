import { ArchiveItem, ArchiveMetadata, ArchiveSearchResponse } from "@/types";

const UPLOADER = process.env.ARCHIVE_UPLOADER ?? "";
const BASE_URL = "https://archive.org";
const SEARCH_URL = `${BASE_URL}/advancedsearch.php`;

export function getThumbUrl(identifier: string): string {
  return `${BASE_URL}/services/img/${identifier}`;
}

export function getWatchUrl(identifier: string): string {
  return `${BASE_URL}/details/${identifier}`;
}

export function getEmbedUrl(identifier: string): string {
  return `${BASE_URL}/embed/${identifier}`;
}

export async function fetchUploads(
  query: string = "",
  page: number = 1,
  rows: number = 24
): Promise<{ items: ArchiveItem[]; total: number }> {
  const searchQuery = query
    ? `uploader:${UPLOADER} AND (title:(${query}) OR subject:(${query}))`
    : `uploader:${UPLOADER}`;

  const params = new URLSearchParams({
    q: searchQuery,
    "fl[]": "identifier,title,description,subject,creator,date,mediatype,downloads",
    sort: "date desc",
    rows: rows.toString(),
    page: page.toString(),
    output: "json",
  });

  const res = await fetch(`${SEARCH_URL}?${params}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error("Failed to fetch from Archive.org");
  const data: ArchiveSearchResponse = await res.json();
  return { items: data.response.docs, total: data.response.numFound };
}

export async function fetchItemMetadata(identifier: string): Promise<ArchiveMetadata> {
  const res = await fetch(`${BASE_URL}/metadata/${identifier}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch metadata for ${identifier}`);
  return res.json();
}

// Broader format list — covers all common archive.org video formats
export function getBestVideoFile(
  files: ArchiveMetadata["files"],
  identifier: string
): string | null {
  const priority = [
    "h.264",
    "MPEG4",
    "H.264",
    "512Kb MPEG4",
    "Ogg Video",
    "WebM",
    "AVI",
    "Matroska",
    "QuickTime",
    "Windows Media",
    "MPEG2",
    "DivX",
    "Flash Video",
  ];

  // First try priority formats
  for (const format of priority) {
    const file = files.find(
      (f) =>
        f.format?.toLowerCase() === format.toLowerCase() &&
        f.source !== "metadata" &&
        /\.(mp4|webm|ogv|avi|mkv|mov|wmv|mpg|mpeg|flv|m4v)$/i.test(f.name)
    );
    if (file) return `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`;
  }

  // Fallback: any file with a video extension
  const videoFile = files.find(
    (f) =>
      f.source !== "metadata" &&
      /\.(mp4|webm|ogv|avi|mkv|mov|wmv|mpg|mpeg|m4v)$/i.test(f.name)
  );
  if (videoFile) return `https://archive.org/download/${identifier}/${encodeURIComponent(videoFile.name)}`;

  return null;
}

export function getSubtitleFiles(
  files: ArchiveMetadata["files"],
  identifier: string
) {
  return files
    .filter((f) => /\.(srt|vtt)$/i.test(f.name) && f.source !== "metadata")
    .map((f) => ({
      name: f.name,
      url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
      label: f.name.replace(/\.(srt|vtt)$/i, "").replace(/[_\-\.]/g, " ").trim(),
    }));
}
