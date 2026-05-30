'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Library, PlusCircle, Music, Heart, LogOut, LogIn, BarChart2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { customPlaylists, createNewPlaylist, currentSong, isPlaying, user, signOut } = useMusic();

  const menuItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Trợ lý AI Chat', href: '/chat', icon: Sparkles, badge: 'Smart' },
    { name: 'Thư viện & Playlist', href: '/playlists', icon: Library },
    { name: 'Thống kê & Analytics', href: '/analytics', icon: BarChart2 },
  ];

  const handleCreatePlaylist = () => {
    const name = prompt('Nhập tên Playlist mới:');
    if (!name) return;
    const desc = prompt('Nhập mô tả Playlist (không bắt buộc):') || '';
    createNewPlaylist(name, desc);
  };

  return (
    <aside className="w-64 glass-panel border-r border-zinc-800/40 h-screen flex flex-col fixed left-0 top-0 text-zinc-300 select-none z-30">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800/30">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Music className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
            Smart Music
          </span>
          <span className="block text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex flex-col gap-1.5">
        <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 block">
          Khám phá
        </span>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/40 to-emerald-950/20 text-cyan-400 border border-cyan-800/30 shadow-inner'
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/50 text-cyan-400 font-semibold tracking-wider uppercase animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Playlists Section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 py-1 mt-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            Playlist của tôi
          </span>
          <button
            onClick={handleCreatePlaylist}
            className="text-zinc-500 hover:text-cyan-400 p-0.5 rounded-md transition-colors"
            title="Tạo playlist mới"
          >
            <PlusCircle className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {customPlaylists.map((pl) => {
            const isFav = pl.id === 'favorites';
            return (
              <Link
                key={pl.id}
                href={`/playlists?id=${pl.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent transition-all"
              >
                {isFav ? (
                  <div className="w-7 h-7 rounded-lg bg-rose-950/30 border border-rose-800/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <Music className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 truncate">
                  <span className="block truncate font-medium">{pl.name}</span>
                  <span className="block text-[10px] text-zinc-500">
                    {pl.songs.length} bài hát
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Active Song Mini Visualizer */}
      {currentSong && (
        <div className="p-3.5 m-3 mb-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 flex items-center gap-3">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className={`w-9 h-9 rounded-xl object-cover border border-zinc-800 ${
              isPlaying ? 'animate-spin [animation-duration:12s]' : ''
            }`}
          />
          <div className="flex-1 min-w-0">
            <span className="block text-[11px] font-semibold text-white truncate">
              {currentSong.title}
            </span>
            <span className="block text-[9px] text-zinc-400 truncate">
              {currentSong.artist}
            </span>
          </div>
          {isPlaying && (
            <div className="flex gap-0.5 items-end h-3 pr-1">
              <span className="sound-bar" />
              <span className="sound-bar" />
              <span className="sound-bar" />
            </div>
          )}
        </div>
      )}

      {/* User Profile / Authentication Section */}
      <div className="p-3.5 mt-auto border-t border-zinc-800/40 bg-zinc-950/40 flex items-center justify-between gap-3 text-xs">
        {user ? (
          <div className="flex items-center justify-between w-full gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="block font-semibold text-white truncate">
                {user.user_metadata?.display_name || user.email.split('@')[0]}
              </span>
              <span className="block text-[9px] text-zinc-500 truncate mt-0.5">
                {user.email}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="min-w-0">
              <span className="block font-medium text-zinc-400">Chế độ khách</span>
              <span className="block text-[9px] text-zinc-600 mt-0.5">Không đồng bộ đám mây</span>
            </div>
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/20 transition-all flex items-center gap-1.5 font-semibold text-[10px] tracking-wide uppercase"
            >
              <span>Đăng nhập</span>
              <LogIn className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
