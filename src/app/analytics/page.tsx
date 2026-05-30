'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, Heart, Library, MessageSquare, Clock, Music, Sparkles, TrendingUp, HelpCircle, Activity } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { FeedbackForm } from '@/components/FeedbackForm';

interface PlayStat {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  playedAt: string;
}

export default function AnalyticsPage() {
  const { likedSongIds, customPlaylists } = useMusic();
  const [playStats, setPlayStats] = useState<PlayStat[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load play stats
    const savedStats = localStorage.getItem('smart_music_play_stats');
    if (savedStats) {
      setPlayStats(JSON.parse(savedStats).reverse()); // Show newest first
    }

    // Load chat message count
    const savedChat = localStorage.getItem('smart_music_chat');
    if (savedChat) {
      try {
        const messages = JSON.parse(savedChat);
        // Exclude the initial welcome message from counting
        const userAndAIOnly = messages.filter((m: any) => m.id !== 'welcome');
        setChatCount(userAndAIOnly.length);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Safe SSR placeholder
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Đang tải số liệu thống kê...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalPlays = playStats.length;
  const totalPlaylists = customPlaylists.length;
  const totalLiked = likedSongIds.length;

  // Identify top artist from stats
  const artistCounts: Record<string, number> = {};
  playStats.forEach(s => {
    artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
  });
  const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chưa xác định';

  return (
    <div className="flex flex-col gap-8 pb-10 select-none animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
          Thống kê & Analytics
        </h1>
        <p className="text-zinc-400 text-xs mt-1">
          Báo cáo cá nhân hóa về hành trình âm nhạc của bạn cùng Trợ lý AI
        </p>
      </div>

      {/* Main Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Plays */}
        <div className="glass-card p-5 rounded-2xl border border-zinc-800/20 flex flex-col gap-4 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Lượt nghe nhạc</span>
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
              <Music className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-black text-white">{totalPlays}</span>
            <span className="block text-[10px] text-zinc-400 mt-1">Bài hát đã phát gần đây</span>
          </div>
        </div>

        {/* Stat 2: Likes */}
        <div className="glass-card p-5 rounded-2xl border border-zinc-800/20 flex flex-col gap-4 relative overflow-hidden group hover:border-rose-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Thả tim</span>
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/30 text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-black text-white">{totalLiked}</span>
            <span className="block text-[10px] text-zinc-400 mt-1">Bài hát trong yêu thích</span>
          </div>
        </div>

        {/* Stat 3: Playlists */}
        <div className="glass-card p-5 rounded-2xl border border-zinc-800/20 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Playlists</span>
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-400">
              <Library className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-black text-white">{totalPlaylists}</span>
            <span className="block text-[10px] text-zinc-400 mt-1">Danh sách phát cá nhân</span>
          </div>
        </div>

        {/* Stat 4: AI Chats */}
        <div className="glass-card p-5 rounded-2xl border border-zinc-800/20 flex flex-col gap-4 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Hội thoại AI</span>
            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30 text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-black text-white">{chatCount}</span>
            <span className="block text-[10px] text-zinc-400 mt-1">Tin nhắn cùng AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Listening History (7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Lịch sử nghe gần đây</h2>
          </div>

          <div className="glass-panel border border-zinc-800/30 rounded-3xl p-4 max-h-[31rem] overflow-y-auto flex flex-col gap-2.5">
            {playStats.length === 0 ? (
              <div className="py-24 text-center max-w-sm mx-auto">
                <Music className="w-8 h-8 text-zinc-700 animate-bounce mx-auto mb-3" />
                <h3 className="font-semibold text-white text-xs">Lịch sử nghe còn trống</h3>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Hãy quay lại Trang chủ phát thử các bản nhạc hoặc chat cùng AI để lưu lại lịch sử trải nghiệm của bạn nhé.
                </p>
              </div>
            ) : (
              playStats.map((stat, index) => {
                const playedTime = new Date(stat.playedAt);
                const formatTime = playedTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + playedTime.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-zinc-800/10">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={stat.coverUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%2318181b" rx="12"/><g transform="translate(20, 20) scale(1.6)" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></g></svg>`}
                        alt={stat.title}
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%2318181b" rx="12"/><g transform="translate(20, 20) scale(1.6)" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></g></svg>`;
                        }}
                      />
                      <div className="min-w-0">
                        <span className="block font-bold text-white text-xs truncate">{stat.title}</span>
                        <span className="block text-[10px] text-zinc-500 truncate mt-0.5">{stat.artist}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1.5 flex-shrink-0">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      {formatTime}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: AI Insights & Activities (5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Section 1: Music Profile */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Chân dung âm nhạc</h2>
            </div>

            <div className="glass-panel border border-zinc-800/30 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">Nghệ sĩ nghe nhiều nhất</span>
                <span className="text-lg font-extrabold text-white">{topArtist}</span>
              </div>

              {/* Listening activity level bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Mức độ hoạt động tuần này
                  </span>
                  <span className="font-bold text-cyan-400">{totalPlays > 0 ? 'Tích cực' : 'Thấp'}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800/60 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(15, totalPlays * 8))}%` }}
                  />
                </div>
              </div>

              {/* Personal Music Taste insight block */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 flex gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/50 text-emerald-400 flex items-center justify-center h-fit">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-white text-xs">Nhận xét từ AI Assistant</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                    {totalPlays === 0
                      ? 'AI chưa có đủ dữ liệu lịch sử nghe để đưa ra nhận xét cá nhân hóa. Hãy trải nghiệm nhiều hơn nhé!'
                      : `Dựa trên sở thích gần đây, bạn thích nghe các dòng nhạc từ nghệ sĩ ${topArtist}. Bạn thường tìm kiếm sự cân bằng và thư giãn qua âm nhạc.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mood Activity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Phân tích hội thoại</h2>
            </div>

            <div className="glass-panel border border-zinc-800/30 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none" />

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">Tỷ lệ sử dụng Trợ lý AI</span>
                <span className="text-lg font-extrabold text-white">
                  {chatCount > 0 ? `${chatCount} tin nhắn trao đổi` : 'Chưa sử dụng'}
                </span>
              </div>

              <div className="flex flex-col gap-3 text-[10px] text-zinc-400 font-medium">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/10">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Trực quan hóa tin nhắn
                  </span>
                  <span className="text-zinc-500">{chatCount} tin</span>
                </div>
                
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/10">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    Quick Prompts được bấm nhiều
                  </span>
                  <span className="text-zinc-500">{chatCount > 2 ? 'Focus Study study' : 'Acoustic Pop'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Feedback Form Row */}
      <div className="max-w-xl">
        <FeedbackForm />
      </div>

    </div>
  );
}
