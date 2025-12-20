export interface GeniusLyricsResponse {
  lyrics: string;
}

export interface GeniusApiError {
  error: string;
}

export interface LyricLine {
  text: string;
  index: number;
  selected: boolean;
  selectionOrder: number | null; // 1, 2, or 3
}
