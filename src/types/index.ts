export interface ArchiveItem {
  identifier: string;
  title: string;
  description?: string;
  subject?: string | string[];
  creator?: string;
  date?: string;
  mediatype: string;
  thumb?: string;
  downloads?: number;
}

export interface ArchiveSearchResponse {
  response: {
    docs: ArchiveItem[];
    numFound: number;
    start: number;
  };
}

export interface ArchiveFile {
  name: string;
  format: string;
  size?: string;
  source: string;
}

export interface ArchiveMetadata {
  metadata: {
    title: string;
    description?: string;
    creator?: string;
    date?: string;
    subject?: string | string[];
    mediatype: string;
  };
  files: ArchiveFile[];
}