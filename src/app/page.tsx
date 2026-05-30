'use client';

import React, { useState, useEffect } from 'react';
import { Search, Flame, Sparkles, Smile, BookOpen, Coffee, Dumbbell, Compass, Gamepad2, Volume2 } from 'lucide-react';
import { Song } from '@/types/music';
import { SongCard } from '@/components/SongCard';
import { useMusic } from '@/context/MusicContext';

export default function Home() {
  const { playSong, currentSong, isPlaying } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState('chill');

  const moods = [
    { id: 'chill', name: 'Thư giãn', icon: Coffee, query: 'chill acoustic lofi', color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30' },
    { id: 'focus', name: 'Tập trung', icon: BookOpen, query: 'lofi focus study ambient', color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30' },
    { id: 'happy', name: 'Vui vẻ', icon: Smile, query: 'happy acoustic pop indie', color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30' },
    { id: 'workout', name: 'Tập thể thao', icon: Dumbbell, query: 'workout gym energetic power', color: 'from-rose-500/20 to-orange-500/10 text-rose-400 border-rose-500/30' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, query: 'synthwave cyberpunk gaming', color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30' },
  ];

  // Fetch recommendations based on active mood or search query
  const fetchSongs = async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommend?q=${encodeURIComponent(term)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs(activeMood);
  }, [activeMood]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchSongs(searchQuery);
  };

  const handleMoodClick = (moodId: string, query: string) => {
    setActiveMood(moodId);
    setSearchQuery('');
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Top Bar: Search & User Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Khám phá Âm nhạc
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Gợi ý thông minh dựa trên tâm trạng và hoạt động của bạn
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm bài hát, ca sĩ, mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl text-sm text-zinc-200 glass-input"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <button type="submit" className="hidden" />
        </form>
      </div>

      {/* Mood Selectors Panel */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Bạn đang cảm thấy thế nào?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = activeMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodClick(mood.id, mood.query)}
                className={`glass-card p-4 rounded-2xl flex flex-col items-center gap-3 text-center border transition-all cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-b ${mood.color} ring-1 ring-white/10 scale-[1.02]`
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className={`p-3 rounded-xl ${isSelected ? 'bg-black/35 shadow-inner' : 'bg-zinc-900/60'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-xs">{mood.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Music Playlist Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {searchQuery ? (
              <Search className="w-5 h-5 text-cyan-400" />
            ) : (
              <Flame className="w-5 h-5 text-amber-500" />
            )}
            <h2 className="text-lg font-bold text-white">
              {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Đề xuất hàng đầu'}
            </h2>
          </div>

          {songs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Phát tất cả</span>
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="glass-card p-3 rounded-2xl animate-pulse flex flex-col gap-3">
                <div className="aspect-square w-full rounded-xl bg-zinc-800/40" />
                <div className="h-4 bg-zinc-800/40 rounded-md w-3/4" />
                <div className="h-3 bg-zinc-800/40 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl text-center border border-zinc-800/20 max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Không tìm thấy bài hát nào phù hợp.</p>
            <p className="text-xs text-zinc-500 mt-1">Hãy thử tìm kiếm với các từ khóa khác xem sao nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} playlistContext={songs} />
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Promo Banner */}
      <section className="mt-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-950/30 via-emerald-950/20 to-zinc-950/50 border border-cyan-800/10 flex flex-col sm:flex-row items-center gap-6 justify-between glow-cyan">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-950 border border-cyan-800/50 text-cyan-400 shadow-lg shadow-cyan-500/5 hidden sm:block">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Gặp gỡ Trợ lý Âm nhạc thông minh AI</h3>
            <p className="text-xs text-zinc-400 max-w-md mt-1.5 leading-relaxed">
              Bạn đang mệt mỏi, cần tập trung học bài hay đơn giản muốn tâm sự? Hãy trò chuyện trực tiếp với Trợ lý AI để được thấu hiểu cảm xúc và nhận những danh sách nhạc gợi ý cá nhân hóa tức thì.
            </p>
          </div>
        </div>
        <a
          href="/chat"
          className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black font-semibold text-xs hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/10 transition-all text-center flex-shrink-0 cursor-pointer"
        >
          Trò chuyện ngay
        </a>
      </section>

    </div>
  );
}
