export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  moods: string[];
  genre: string;
  isSpotify?: boolean;
  popularity?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedSongs?: Song[];
  timestamp: string; // ISO string
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  createdAt: string;
}
