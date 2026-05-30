import { Song } from '../types/music';
import { MOCK_SONGS } from './mockData';

// Generate token directly on server-side or fetch via API route on client-side
async function getAccessToken(): Promise<string | null> {
  // If we are in server-side node context with environment variables
  if (typeof window === 'undefined' && process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        return data.access_token;
      }
    } catch (e) {
      console.error('Server-side Spotify token fetch failed:', e);
    }
  }

  // Client-side or fallback to calling our Next.js API route
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch(`${origin}/api/spotify/token`);
    if (res.ok) {
      const data = await res.json();
      return data.access_token;
    }
  } catch (e) {
    console.error('Client-side Spotify token fetch failed:', e);
  }
  return null;
}

async function searchITunesTracks(query: string, limit = 8): Promise<Song[]> {
  try {
    console.log(`[Music API] Falling back to online iTunes Search API for query: "${query}"`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      throw new Error(`iTunes Search failed with status: ${res.status}`);
    }

    const data = await res.json();
    const tracks = data.results || [];

    // Map of mock SoundHelix audios to assign to songs that don't have previewUrl
    const backupAudios = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    ];

    return tracks.map((item: any, idx: number) => {
      const moods = ['trending'];
      const q = query.toLowerCase();
      if (q.includes('chill') || q.includes('thư giãn') || q.includes('nhẹ nhàng')) moods.push('chill', 'relax');
      if (q.includes('sad') || q.includes('buồn') || q.includes('mưa')) moods.push('sad', 'rainy');
      if (q.includes('focus') || q.includes('tập trung') || q.includes('học')) moods.push('focus', 'study');
      if (q.includes('workout') || q.includes('gym') || q.includes('sôi động')) moods.push('workout', 'energetic');
      if (q.includes('happy') || q.includes('vui') || q.includes('đi chơi')) moods.push('happy', 'party');

      // Convert artwork to 400x400 for high resolution
      const coverUrl = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb.jpg', '400x400bb.jpg')
        : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80';

      return {
        id: `itunes-${item.trackId}`,
        title: item.trackName || 'Bài hát không tên',
        artist: item.artistName || 'Nghệ sĩ ẩn danh',
        album: item.collectionName || 'Single / Album',
        duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180,
        audioUrl: item.previewUrl || backupAudios[idx % backupAudios.length],
        coverUrl: coverUrl,
        moods: moods,
        genre: item.primaryGenreName || 'Pop',
        isSpotify: false,
        popularity: 80,
      };
    });
  } catch (error) {
    console.error('iTunes Search API failed:', error);
    // Finally fall back to local mock search
    const lowerQuery = query.toLowerCase();
    const matches = MOCK_SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerQuery) ||
        s.artist.toLowerCase().includes(lowerQuery) ||
        s.moods.some((m) => m.toLowerCase().includes(lowerQuery))
    );
    return matches.slice(0, limit);
  }
}

export async function searchSpotifyTracks(query: string, limit = 8): Promise<Song[]> {
  const token = await getAccessToken();

  if (!token) {
    console.warn('Spotify token fetch failed. Falling back to online iTunes search.');
    return searchITunesTracks(query, limit);
  }

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Spotify search failed with status: ${res.status}`);
    }

    const data = await res.json();
    const tracks = data.tracks?.items || [];

    // Map of mock SoundHelix audios to assign to songs that don't have preview_url
    const backupAudios = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    ];

    return tracks.map((item: any, idx: number) => {
      const moods = ['trending'];
      const q = query.toLowerCase();
      if (q.includes('chill') || q.includes('thư giãn') || q.includes('nhẹ nhàng')) moods.push('chill', 'relax');
      if (q.includes('sad') || q.includes('buồn') || q.includes('mưa')) moods.push('sad', 'rainy');
      if (q.includes('focus') || q.includes('tập trung') || q.includes('học')) moods.push('focus', 'study');
      if (q.includes('workout') || q.includes('gym') || q.includes('sôi động')) moods.push('workout', 'energetic');
      if (q.includes('happy') || q.includes('vui') || q.includes('đi chơi')) moods.push('happy', 'party');

      return {
        id: `spotify-${item.id}`,
        title: item.name,
        artist: item.artists.map((a: any) => a.name).join(', '),
        album: item.album.name,
        duration: Math.round(item.duration_ms / 1000),
        audioUrl: item.preview_url || backupAudios[idx % backupAudios.length],
        coverUrl: item.album.images[0]?.url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
        moods: moods,
        genre: 'Spotify Track',
        isSpotify: true,
        popularity: item.popularity,
      };
    });
  } catch (error) {
    console.error('Spotify API search failed, falling back to online iTunes search:', error);
    return searchITunesTracks(query, limit);
  }
}
