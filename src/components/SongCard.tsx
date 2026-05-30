'use client';

import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, Check } from 'lucide-react';
import { Song } from '../types/music';
import { useMusic } from '../context/MusicContext';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, playlistContext }) => {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    likedSongIds,
    toggleLikeSong,
    customPlaylists,
    addSongToPlaylist,
  } = useMusic();

  const [showPlaylistsDropdown, setShowPlaylistsDropdown] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isLiked = likedSongIds.includes(song.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeSong(song);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylistsDropdown(!showPlaylistsDropdown);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, plId: string) => {
    e.stopPropagation();
    addSongToPlaylist(plId, song);
    setShowPlaylistsDropdown(false);
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`glass-card p-3 rounded-2xl cursor-pointer relative group flex flex-col gap-3 select-none ${
        isCurrent ? 'ring-1 ring-cyan-500/30 bg-zinc-900/60' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/40">
        <img
          src={song.coverUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%2318181b" rx="12"/><g transform="translate(20, 20) scale(1.6)" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></g></svg>`}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%2318181b" rx="12"/><g transform="translate(20, 20) scale(1.6)" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></g></svg>`;
          }}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 transform scale-90 group-hover:scale-100 transition-all duration-300 hover:scale-105 active:scale-95 text-black"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>
        </div>

        {/* Visual indicator for current active song */}
        {isCurrent && (
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/5 flex items-center gap-1.5">
            {isPlaying ? (
              <div className="flex gap-0.5 items-end h-3">
                <span className="sound-bar !h-3 !w-[2px]" />
                <span className="sound-bar !h-3 !w-[2px]" />
                <span className="sound-bar !h-3 !w-[2px]" />
              </div>
            ) : (
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            )}
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {isPlaying ? 'Đang phát' : 'Tạm dừng'}
            </span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0 flex-1">
          <span className={`block font-semibold text-sm truncate ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
            {song.title}
          </span>
          <span className="block text-xs text-zinc-400 truncate mt-0.5">
            {song.artist}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className={`p-1.5 rounded-lg transition-colors hover:bg-white/5 ${
              isLiked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={isLiked ? 'Bỏ thích' : 'Thích bài hát'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Add to Playlist button */}
          <div className="relative">
            <button
              onClick={handleAddClick}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
              title="Thêm vào Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Playlists Dropdown List */}
            {showPlaylistsDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-zinc-950/95 border border-zinc-800/80 shadow-2xl backdrop-blur-md p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="block px-2.5 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/40 mb-1">
                  Thêm vào Playlist
                </span>
                
                {customPlaylists.filter(pl => pl.id !== 'favorites').length === 0 ? (
                  <span className="block px-2.5 py-1.5 text-xs text-zinc-500 italic">
                    Chưa có playlist khác
                  </span>
                ) : (
                  customPlaylists
                    .filter((pl) => pl.id !== 'favorites')
                    .map((pl) => {
                      const songAlreadyInPl = pl.songs.some((s) => s.id === song.id);
                      return (
                        <button
                          key={pl.id}
                          onClick={(e) => handleAddToPlaylist(e, pl.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors"
                        >
                          <span className="truncate">{pl.name}</span>
                          {songAlreadyInPl && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SongCard;
