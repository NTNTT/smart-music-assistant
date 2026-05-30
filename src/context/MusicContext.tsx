'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song, Playlist } from '../types/music';
import { supabase } from '@/lib/supabase';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playlist: Song[];
  currentIndex: number;
  duration: number;
  currentTime: number;
  volume: number;
  likedSongIds: string[];
  customPlaylists: Playlist[];
  user: any;
  playSong: (song: Song, newPlaylist?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLikeSong: (song: Song) => void;
  createNewPlaylist: (name: string, description?: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  signOut: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>([]);
  const [user, setUser] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to load standard local data
  const loadLocalData = () => {
    const savedLikes = localStorage.getItem('smart_music_likes');
    if (savedLikes) {
      setLikedSongIds(JSON.parse(savedLikes));
    } else {
      setLikedSongIds([]);
    }

    const savedPlaylists = localStorage.getItem('smart_music_playlists');
    if (savedPlaylists) {
      setCustomPlaylists(JSON.parse(savedPlaylists));
    } else {
      const defaultFav = {
        id: 'favorites',
        name: 'Bài hát yêu thích',
        description: 'Những bài hát bạn đã thả tim ❤️',
        songs: [],
        createdAt: new Date().toISOString()
      };
      setCustomPlaylists([defaultFav]);
      localStorage.setItem('smart_music_playlists', JSON.stringify([defaultFav]));
    }
  };

  // Sync data with Supabase when authenticated
  const syncSupabaseData = async (supabaseUser: any) => {
    if (!supabase) return;
    try {
      // 1. Fetch user's playlists from Supabase
      const { data: dbPlaylists, error: plError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', supabaseUser.id);
        
      if (plError) throw plError;
      
      let playlistsToSet: Playlist[] = [];
      
      if (dbPlaylists && dbPlaylists.length > 0) {
        // Fetch songs for each playlist
        for (const pl of dbPlaylists) {
          const { data: songJunctions, error: sError } = await supabase
            .from('playlist_songs')
            .select(`
              song_id,
              songs (
                id,
                title,
                artist,
                album,
                audio_url,
                cover_url,
                duration,
                moods,
                genre
              )
            `)
            .eq('playlist_id', pl.id);
            
          if (sError) throw sError;
          
          const songs = (songJunctions || [])
            .map((j: any) => j.songs)
            .filter((s: any) => s !== null)
            .map((s: any) => ({
              id: s.id,
              title: s.title,
              artist: s.artist,
              album: s.album || '',
              audioUrl: s.audio_url,
              coverUrl: s.cover_url || '',
              duration: s.duration,
              moods: s.moods || [],
              genre: s.genre || ''
            }));
          
          playlistsToSet.push({
            id: pl.id,
            name: pl.name,
            description: pl.description || '',
            songs: songs,
            createdAt: pl.created_at
          });
        }
      } else {
        // Upload local playlists to Supabase (so the user doesn't lose local data upon signup)
        const savedPlaylists = localStorage.getItem('smart_music_playlists');
        const localPlaylists: Playlist[] = savedPlaylists ? JSON.parse(savedPlaylists) : [];
        
        for (const lp of localPlaylists) {
          const newPlId = lp.id === 'favorites' ? window.crypto.randomUUID() : (lp.id.startsWith('playlist-') ? window.crypto.randomUUID() : lp.id);
          
          const { error: insPlError } = await supabase
            .from('playlists')
            .insert({
              id: newPlId,
              user_id: supabaseUser.id,
              name: lp.name,
              description: lp.description || ''
            });
            
          if (insPlError) continue;
          
          for (const song of lp.songs) {
            // Upsert song metadata
            await supabase.from('songs').upsert({
              id: song.id,
              title: song.title,
              artist: song.artist,
              album: song.album || '',
              audio_url: song.audioUrl,
              cover_url: song.coverUrl,
              duration: song.duration,
              moods: song.moods || [],
              genre: song.genre || ''
            });
            
            // Insert junction
            await supabase.from('playlist_songs').insert({
              playlist_id: newPlId,
              song_id: song.id
            });
          }
          
          playlistsToSet.push({
            ...lp,
            id: newPlId
          });
        }
      }
      
      // Look for or create the "Bài hát yêu thích" (favorites) playlist in Supabase
      let favPlaylist = playlistsToSet.find(p => p.name === 'Bài hát yêu thích');
      if (favPlaylist) {
        setLikedSongIds(favPlaylist.songs.map(s => s.id));
      } else {
        const newFavId = window.crypto.randomUUID();
        await supabase.from('playlists').insert({
          id: newFavId,
          user_id: supabaseUser.id,
          name: 'Bài hát yêu thích',
          description: 'Những bài hát bạn đã thả tim ❤️'
        });
        
        const newFavPl = {
          id: newFavId,
          name: 'Bài hát yêu thích',
          description: 'Những bài hát bạn đã thả tim ❤️',
          songs: [],
          createdAt: new Date().toISOString()
        };
        playlistsToSet.unshift(newFavPl); // put at start
        setLikedSongIds([]);
      }
      
      setCustomPlaylists(playlistsToSet);
      localStorage.setItem('smart_music_playlists', JSON.stringify(playlistsToSet));
      
    } catch (error) {
      console.error('Error syncing data with Supabase:', error);
    }
  };

  // Load Session and Subscribe to Supabase Auth Changes & Realtime Updates
  useEffect(() => {
    if (supabase) {
      const client = supabase; // Capture non-nullable client for closure type safety
      let realtimeChannel: any = null;

      client.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          syncSupabaseData(currentUser);
          
          // Subscribe to Realtime postgres changes on public.playlists
          realtimeChannel = client
            .channel('realtime-playlists')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'playlists' },
              () => {
                syncSupabaseData(currentUser);
              }
            )
            .subscribe();
        } else {
          loadLocalData();
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Clean up old channel on auth status change
        if (realtimeChannel) {
          client.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }

        if (currentUser) {
          syncSupabaseData(currentUser);

          // Re-subscribe under the new user session
          realtimeChannel = client
            .channel('realtime-playlists')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'playlists' },
              () => {
                syncSupabaseData(currentUser);
              }
            )
            .subscribe();
        } else {
          loadLocalData();
        }
      });

      return () => {
        subscription.unsubscribe();
        if (realtimeChannel) {
          client.removeChannel(realtimeChannel);
        }
      };
    } else {
      loadLocalData();
    }
  }, []);

  // Initialize Audio Element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    // Audio element event listeners
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      nextSong();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [playlist, currentIndex]);

  // Handle current song changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;
    
    // Check if source changed
    if (audio.src !== currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Audio play interrupted:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentSong]);

  // Handle play/pause state change
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Audio play failed:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const playSong = (song: Song, newPlaylist?: Song[]) => {
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      const index = newPlaylist.findIndex((s) => s.id === song.id);
      setCurrentIndex(index !== -1 ? index : 0);
    } else {
      const index = playlist.findIndex((s) => s.id === song.id);
      if (index === -1) {
        const updatedPlaylist = [...playlist, song];
        setPlaylist(updatedPlaylist);
        setCurrentIndex(updatedPlaylist.length - 1);
      } else {
        setCurrentIndex(index);
      }
    }
    setCurrentSong(song);
    setIsPlaying(true);

    // Track play stats in localStorage for Analytics Dashboard
    try {
      const savedStats = localStorage.getItem('smart_music_play_stats') || '[]';
      const stats = JSON.parse(savedStats);
      stats.push({
        id: song.id,
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        playedAt: new Date().toISOString()
      });
      // Limit to 100 entries to prevent localStorage bloat
      if (stats.length > 100) stats.shift();
      localStorage.setItem('smart_music_play_stats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to log play stats:', e);
    }
  };

  const togglePlay = () => {
    if (!currentSong && playlist.length > 0) {
      playSong(playlist[0]);
    } else if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    if (playlist.length === 0 || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    setCurrentSong(playlist[nextIdx]);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (playlist.length === 0 || currentIndex === -1) return;
    const prevIdx = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIdx);
    setCurrentSong(playlist[prevIdx]);
    setIsPlaying(true);
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    const safeVol = Math.max(0, Math.min(1, vol));
    setVolumeState(safeVol);
    if (audioRef.current) {
      audioRef.current.volume = safeVol;
    }
  };

  const toggleLikeSong = async (song: Song) => {
    let updatedLikes: string[];
    const isLiked = likedSongIds.includes(song.id);
    
    if (isLiked) {
      updatedLikes = likedSongIds.filter((id) => id !== song.id);
    } else {
      updatedLikes = [...likedSongIds, song.id];
    }
    
    setLikedSongIds(updatedLikes);
    localStorage.setItem('smart_music_likes', JSON.stringify(updatedLikes));

    // Update in Favorites Playlist state
    const updatedPlaylists = customPlaylists.map((pl) => {
      if (pl.name === 'Bài hát yêu thích' || pl.id === 'favorites') {
        const isSongInFav = pl.songs.some((s) => s.id === song.id);
        const updatedSongs = isSongInFav
          ? pl.songs.filter((s) => s.id !== song.id)
          : [...pl.songs, song];
        return { ...pl, songs: updatedSongs };
      }
      return pl;
    });
    setCustomPlaylists(updatedPlaylists);
    localStorage.setItem('smart_music_playlists', JSON.stringify(updatedPlaylists));

    // Sync to Supabase
    if (supabase && user) {
      try {
        const favPl = customPlaylists.find(p => p.name === 'Bài hát yêu thích' || p.id === 'favorites');
        if (favPl) {
          if (isLiked) {
            // Delete junction entry
            await supabase
              .from('playlist_songs')
              .delete()
              .eq('playlist_id', favPl.id)
              .eq('song_id', song.id);
          } else {
            // Upsert song, then insert junction
            await supabase.from('songs').upsert({
              id: song.id,
              title: song.title,
              artist: song.artist,
              album: song.album || '',
              audio_url: song.audioUrl,
              cover_url: song.coverUrl,
              duration: song.duration,
              moods: song.moods || [],
              genre: song.genre || ''
            });

            await supabase.from('playlist_songs').insert({
              playlist_id: favPl.id,
              song_id: song.id
            });
          }
        }
      } catch (err) {
        console.error('Error syncing like action to Supabase:', err);
      }
    }
  };

  const createNewPlaylist = async (name: string, description = '') => {
    const plId = (supabase && user) ? window.crypto.randomUUID() : `playlist-${Date.now()}`;
    const newPl: Playlist = {
      id: plId,
      name,
      description,
      songs: [],
      createdAt: new Date().toISOString()
    };
    
    const updated = [...customPlaylists, newPl];
    setCustomPlaylists(updated);
    localStorage.setItem('smart_music_playlists', JSON.stringify(updated));

    if (supabase && user) {
      try {
        await supabase.from('playlists').insert({
          id: plId,
          user_id: user.id,
          name,
          description
        });
      } catch (err) {
        console.error('Error creating playlist in Supabase:', err);
      }
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const updated = customPlaylists.map((pl) => {
      if (pl.id === playlistId) {
        const isAlreadyAdded = pl.songs.some((s) => s.id === song.id);
        if (isAlreadyAdded) return pl;
        return {
          ...pl,
          songs: [...pl.songs, song]
        };
      }
      return pl;
    });
    setCustomPlaylists(updated);
    localStorage.setItem('smart_music_playlists', JSON.stringify(updated));

    if (supabase && user) {
      try {
        // Upsert song metadata
        await supabase.from('songs').upsert({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album || '',
          audio_url: song.audioUrl,
          cover_url: song.coverUrl,
          duration: song.duration,
          moods: song.moods || [],
          genre: song.genre || ''
        });

        // Insert junction
        await supabase.from('playlist_songs').insert({
          playlist_id: playlistId,
          song_id: song.id
        });
      } catch (err) {
        console.error('Error adding song to Supabase playlist:', err);
      }
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const updated = customPlaylists.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          songs: pl.songs.filter((s) => s.id !== songId),
        };
      }
      return pl;
    });
    setCustomPlaylists(updated);
    localStorage.setItem('smart_music_playlists', JSON.stringify(updated));

    if (supabase && user) {
      try {
        await supabase
          .from('playlist_songs')
          .delete()
          .eq('playlist_id', playlistId)
          .eq('song_id', songId);
      } catch (err) {
        console.error('Error removing song from Supabase:', err);
      }
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (playlistId === 'favorites') return;
    
    const updated = customPlaylists.filter((pl) => pl.id !== playlistId);
    setCustomPlaylists(updated);
    localStorage.setItem('smart_music_playlists', JSON.stringify(updated));

    if (supabase && user) {
      try {
        await supabase
          .from('playlists')
          .delete()
          .eq('id', playlistId);
      } catch (err) {
        console.error('Error deleting playlist from Supabase:', err);
      }
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        playlist,
        currentIndex,
        duration,
        currentTime,
        volume,
        likedSongIds,
        customPlaylists,
        user,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolume,
        toggleLikeSong,
        createNewPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        signOut
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
