'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Heart, Music, Play, Trash2, Calendar, Sparkles, FolderHeart } from 'lucide-react';
import { Song, Playlist } from '@/types/music';
import { useMusic } from '@/context/MusicContext';

function PlaylistsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('id') || 'favorites'; // Default to Favorites

  const {
    customPlaylists,
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
    likedSongIds,
    toggleLikeSong,
    removeSongFromPlaylist,
    deletePlaylist,
  } = useMusic();

  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  // Sync state whenever the list of playlists or searchParams changes
  useEffect(() => {
    const pl = customPlaylists.find((p) => p.id === playlistId);
    if (pl) {
      setActivePlaylist(pl);
    } else if (customPlaylists.length > 0) {
      // Default to first playlist (which is usually favorites) if id is invalid
      setActivePlaylist(customPlaylists[0]);
    }
  }, [customPlaylists, playlistId]);

  const handlePlayRow = (song: Song) => {
    if (!activePlaylist) return;
    playSong(song, activePlaylist.songs);
  };

  const handlePlayPlaylist = () => {
    if (!activePlaylist || activePlaylist.songs.length === 0) return;
    playSong(activePlaylist.songs[0], activePlaylist.songs);
  };

  const handleRemoveSong = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (activePlaylist?.id === 'favorites') {
      toggleLikeSong(song);
    } else if (activePlaylist) {
      removeSongFromPlaylist(activePlaylist.id, song.id);
    }
  };

  const handleDeletePlaylist = () => {
    if (playlistId === 'favorites') return; // Can't delete favorites
    if (!confirm(`Bạn có chắc muốn xóa Playlist "${activePlaylist?.name}" không?`)) return;

    deletePlaylist(playlistId);
    router.push('/playlists?id=favorites');
  };

  if (!activePlaylist) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Music className="w-8 h-8 text-zinc-600 animate-bounce mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Đang tải danh sách phát...</p>
        </div>
      </div>
    );
  }

  const isFav = activePlaylist.id === 'favorites';

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-10 select-none">
      
      {/* Left panel: Playlists navigation */}
      <div className="w-full md:w-60 flex-shrink-0 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white px-2">Thư viện</h2>
        
        <div className="flex flex-col gap-1.5">
          {customPlaylists.map((pl) => {
            const isSelected = pl.id === playlistId;
            const isPlFav = pl.id === 'favorites';
            return (
              <button
                key={pl.id}
                onClick={() => router.push(`/playlists?id=${pl.id}`)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/40 to-emerald-950/20 border-cyan-800/25 text-cyan-400 font-semibold'
                    : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                {isPlFav ? (
                  <Heart className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-cyan-400 fill-cyan-400' : 'text-zinc-500'}`} />
                ) : (
                  <Music className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                )}
                <span className="truncate flex-1">{pl.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">{pl.songs.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Selected Playlist tracks list */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Playlist Banner Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900/60 to-zinc-950/40 border border-zinc-800/40 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full filter blur-[100px] pointer-events-none opacity-20 -mr-16 -mt-16 ${
            isFav ? 'bg-rose-500' : 'bg-cyan-500'
          }`} />

          {/* Large cover icon */}
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border flex-shrink-0 ${
            isFav
              ? 'bg-rose-950/30 border-rose-800/25 text-rose-400 shadow-rose-500/5'
              : 'bg-cyan-950/30 border-cyan-800/25 text-cyan-400 shadow-cyan-500/5'
          }`}>
            {isFav ? (
              <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
            ) : (
              <FolderHeart className="w-10 h-10 text-cyan-400" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-semibold block">
              PLAYLIST CỦA TÔI
            </span>
            <h1 className="text-2xl font-extrabold text-white truncate mt-1 leading-tight">
              {activePlaylist.name}
            </h1>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              {activePlaylist.description || 'Không có mô tả nào cho playlist này.'}
            </p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[10px] text-zinc-500 mt-4 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Đã tạo ngày: {new Date(activePlaylist.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span>•</span>
              <span>{activePlaylist.songs.length} bài hát</span>
            </div>
          </div>

          {/* Play & Delete buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 self-center sm:self-end mt-4 sm:mt-0">
            {activePlaylist.songs.length > 0 && (
              <button
                onClick={handlePlayPlaylist}
                className="px-5 py-3 rounded-2xl bg-white text-black font-semibold text-xs hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Phát ngay</span>
              </button>
            )}

            {!isFav && (
              <button
                onClick={handleDeletePlaylist}
                className="p-3 rounded-2xl text-zinc-500 hover:text-rose-400 hover:bg-white/5 border border-zinc-800/40 hover:border-rose-950/20 transition-all cursor-pointer"
                title="Xóa Playlist này"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tracks Table List */}
        <div className="flex flex-col gap-2">
          {activePlaylist.songs.length === 0 ? (
            <div className="glass-panel p-16 rounded-3xl text-center border border-zinc-800/20 max-w-md mx-auto mt-6">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-white text-sm">Playlist này còn trống</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Bạn chưa thêm bài hát nào vào danh sách này. Hãy quay lại trang chủ khám phá nhạc hoặc trò chuyện cùng AI để lưu các bài hát bạn thích nhé!
              </p>
              <a
                href="/"
                className="inline-block mt-5 px-4.5 py-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black font-semibold text-xs hover:scale-105 active:scale-95 transition-all"
              >
                Khám phá âm nhạc
              </a>
            </div>
          ) : (
            <div className="flex flex-col border border-zinc-800/10 rounded-2xl overflow-hidden bg-zinc-950/15">
              
              {/* Header row */}
              <div className="grid grid-cols-12 px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500 border-b border-zinc-800/20">
                <span className="col-span-1">#</span>
                <span className="col-span-6 md:col-span-7">Tiêu đề</span>
                <span className="col-span-3 md:col-span-2 hidden sm:block">Album / Nguồn</span>
                <span className="col-span-2 text-right">Tùy chọn</span>
              </div>

              {/* Songs Rows */}
              <div className="flex flex-col">
                {activePlaylist.songs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handlePlayRow(song)}
                      className={`grid grid-cols-12 px-6 py-3.5 items-center text-xs transition-colors cursor-pointer border-b border-zinc-800/10 last:border-b-0 hover:bg-white/5 ${
                        isCurrent ? 'bg-zinc-900/40 text-cyan-400' : 'text-zinc-300'
                      }`}
                    >
                      {/* Song index / Play icon */}
                      <div className="col-span-1 flex items-center font-medium">
                        {isCurrent && isPlaying ? (
                          <div className="flex gap-0.5 items-end h-3">
                            <span className="sound-bar !h-3 !w-[1.5px]" />
                            <span className="sound-bar !h-3 !w-[1.5px]" />
                            <span className="sound-bar !h-3 !w-[1.5px]" />
                          </div>
                        ) : (
                          <span className="text-zinc-500 group-hover:hidden">{index + 1}</span>
                        )}
                      </div>

                      {/* Song Details Title/Artist */}
                      <div className="col-span-11 sm:col-span-6 md:col-span-7 flex items-center gap-3.5 min-w-0">
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-9 h-9 rounded-lg object-cover border border-zinc-800 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <span className={`block font-semibold truncate ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                            {song.title}
                          </span>
                          <span className="block text-[10px] text-zinc-500 truncate mt-0.5">
                            {song.artist}
                          </span>
                        </div>
                      </div>

                      {/* Album / Source */}
                      <div className="col-span-3 md:col-span-2 truncate text-zinc-500 hidden sm:block">
                        {song.album}
                      </div>

                      {/* Options (Remove button) */}
                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          onClick={(e) => handleRemoveSong(e, song)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                          title={isFav ? 'Bỏ thích' : 'Xóa khỏi playlist'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function PlaylistsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Đang tải thư viện...</p>
        </div>
      </div>
    }>
      <PlaylistsContent />
    </Suspense>
  );
}
