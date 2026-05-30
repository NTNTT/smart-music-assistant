'use client';

import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Maximize2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const MusicPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    duration,
    currentTime,
    seekTo,
    volume,
    setVolume,
    likedSongIds,
    toggleLikeSong
  } = useMusic();

  const [previousVolume, setPreviousVolume] = useState(0.8);

  if (!currentSong) return null;

  const isLiked = likedSongIds.includes(currentSong.id);

  // Format seconds to MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t border-zinc-800/40 px-6 flex items-center justify-between z-40 select-none shadow-2xl">
      
      {/* Left section: Song Details */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        <img
          src={currentSong.coverUrl}
          alt={currentSong.title}
          className="w-14 h-14 rounded-xl object-cover border border-zinc-800/80 shadow-md flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white truncate">
            {currentSong.title}
          </span>
          <span className="block text-xs text-zinc-400 truncate mt-0.5">
            {currentSong.artist}
          </span>
        </div>
        <button
          onClick={() => toggleLikeSong(currentSong)}
          className={`p-2 rounded-lg transition-colors hover:bg-white/5 flex-shrink-0 ${
            isLiked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Center section: Playback Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl px-4">
        {/* Buttons */}
        <div className="flex items-center gap-5">
          <button
            onClick={prevSong}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors hover:scale-105 active:scale-95"
            title="Bài trước"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors hover:scale-105 active:scale-95"
            title="Bài tiếp theo"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Progress Bar Slider */}
        <div className="w-full flex items-center gap-3 text-[10px] font-medium text-zinc-500">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 group-hover:h-1.5 transition-all outline-none"
            />
            {/* Custom filled progress bar layer */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-lg pointer-events-none group-hover:h-1.5 transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right section: Volume Control */}
      <div className="flex items-center gap-3 w-1/4 justify-end min-w-[150px]">
        <button
          onClick={toggleMute}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          title={volume === 0 ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5 text-rose-500" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        <div className="relative w-28 group flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 outline-none"
          />
          {/* Custom volume filled layer */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-400 rounded-lg pointer-events-none"
            style={{ width: `${volume * 100}%` }}
          />
        </div>

        <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors" title="Chế độ toàn màn hình">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
export default MusicPlayer;
