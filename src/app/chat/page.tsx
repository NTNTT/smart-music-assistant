'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, RefreshCw, Volume2, HelpCircle } from 'lucide-react';
import { Message, Song } from '@/types/music';
import { SongCard } from '@/components/SongCard';
import { useMusic } from '@/context/MusicContext';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const { playSong, user } = useMusic();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    { text: 'Mưa buồn quá, bật nhạc tâm trạng đi 🌧️' },
    { text: 'Tập trung học bài, cần nhạc không lời 📚' },
    { text: 'Tập gym hăng hái, lên nhạc sôi động 🏋️' },
    { text: 'Mệt mỏi quá, ru mình ngủ ngon nhé 🌙' },
  ];

  // Initialize and load chat history (Supabase vs local storage)
  useEffect(() => {
    const loadChatHistory = async () => {
      if (supabase && user) {
        try {
          const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            const dbMessages: Message[] = data.map((m: any) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              recommendedSongs: m.recommended_songs || [],
              timestamp: m.created_at
            }));
            setMessages(dbMessages);
            localStorage.setItem('smart_music_chat', JSON.stringify(dbMessages));
          } else {
            showWelcomeMessage();
          }
        } catch (err) {
          console.error('Error loading chat history from Supabase:', err);
          loadLocalChatHistory();
        }
      } else {
        loadLocalChatHistory();
      }
    };

    const showWelcomeMessage = () => {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Xin chào! Mình là **Trợ lý Âm nhạc Thông minh (Smart Music AI)**. 🎵\n\nHôm nay bạn thế nào? Hãy chia sẻ cho mình biết cảm xúc hiện tại, thời tiết nơi bạn đang ở, hoặc hoạt động bạn sắp làm (ví dụ: *học bài, chạy bộ, buồn bã, cần chill...*) để mình chọn cho bạn những bản nhạc đồng điệu nhất nhé!',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('smart_music_chat', JSON.stringify([welcomeMessage]));
    };

    const loadLocalChatHistory = () => {
      const savedChat = localStorage.getItem('smart_music_chat');
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        showWelcomeMessage();
      }
    };

    loadChatHistory();
  }, [user]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem('smart_music_chat', JSON.stringify(updatedMessages));
    setInputValue('');
    setLoading(true);

    // Save user message to Supabase database
    if (supabase && user) {
      (async () => {
        const { error } = await supabase.from('chat_history').insert({
          user_id: user.id,
          role: 'user',
          content: text
        });
        if (error) console.error('Error saving user message to Supabase:', error);
      })();
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages,
        }),
      });

      if (!res.ok) throw new Error('API server error');

      const data = await res.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        recommendedSongs: data.recommendedSongs || [],
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      localStorage.setItem('smart_music_chat', JSON.stringify(finalMessages));

      // Save AI reply to Supabase database
      if (supabase && user) {
        (async () => {
          const { error } = await supabase.from('chat_history').insert({
            user_id: user.id,
            role: 'assistant',
            content: data.reply,
            recommended_songs: data.recommendedSongs || []
          });
          if (error) console.error('Error saving assistant message to Supabase:', error);
        })();
      }
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Thành thật xin lỗi bạn, hệ thống AI của mình đang gặp một chút gián đoạn kỹ thuật. Tuy nhiên bạn vẫn có thể nghe danh sách nhạc có sẵn ngoài trang chủ cực kỳ mượt mà nhé!',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleClearChat = async () => {
    if (!confirm('Bạn có chắc muốn xóa lịch sử trò chuyện không?')) return;
    
    if (supabase && user) {
      try {
        const { error } = await supabase
          .from('chat_history')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (err) {
        console.error('Error clearing chat history from Supabase:', err);
      }
    }

    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: 'Lịch sử trò chuyện đã được làm mới. 🌟 Hãy cho mình biết cảm xúc hiện tại của bạn nhé!',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('smart_music_chat', JSON.stringify([welcomeMessage]));
  };

  const handlePlayRecommended = (songs: Song[]) => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-3xl overflow-hidden glass-panel border border-zinc-800/40 shadow-2xl relative">
      
      {/* Chat Room Header */}
      <div className="px-6 py-4 bg-zinc-950/60 border-b border-zinc-800/40 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-md shadow-cyan-500/10">
            <Sparkles className="w-5.5 h-5.5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Trợ lý Âm nhạc AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Trực tuyến</span>
            </div>
            <span className="block text-[10px] text-zinc-500 mt-0.5">Sẵn sàng thấu hiểu mọi cảm xúc âm nhạc của bạn</span>
          </div>
        </div>

        {/* Clear chat button */}
        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-white/5 border border-transparent transition-all cursor-pointer"
          title="Làm mới cuộc trò chuyện"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scrolling Container */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth bg-zinc-950/20">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                isAI
                  ? 'bg-zinc-900 border-zinc-800 text-cyan-400'
                  : 'bg-cyan-950 border-cyan-800/50 text-emerald-400'
              }`}>
                {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col gap-3">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line border ${
                  isAI
                    ? 'bg-zinc-900/60 border-zinc-800/40 text-zinc-200 rounded-tl-sm'
                    : 'bg-gradient-to-tr from-cyan-950/40 to-emerald-950/20 border-cyan-800/20 text-cyan-100 rounded-tr-sm shadow-inner'
                }`}>
                  {msg.content}
                </div>

                {/* AI Interactive Song Recommendations */}
                {isAI && msg.recommendedSongs && msg.recommendedSongs.length > 0 && (
                  <div className="mt-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-zinc-800/30 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        Danh sách bài hát dành cho bạn
                      </span>
                      <button
                        onClick={() => handlePlayRecommended(msg.recommendedSongs || [])}
                        className="text-[10px] font-bold text-cyan-400 hover:text-emerald-400 transition-colors"
                      >
                        Phát tất cả
                      </button>
                    </div>
                    
                    {/* Recommendations Song Card Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.recommendedSongs.map((song) => (
                        <SongCard key={song.id} song={song} playlistContext={msg.recommendedSongs} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-4 self-start max-w-[80%]">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center animate-spin">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/20 text-zinc-400 text-xs flex items-center gap-2 rounded-tl-sm">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span>AI đang chọn nhạc cho bạn...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Prompts */}
      {messages.length <= 1 && (
        <div className="px-6 py-2 flex flex-wrap gap-2 justify-center z-10">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(prompt.text)}
              className="px-3.5 py-2 rounded-full border border-zinc-800/60 bg-zinc-900/30 text-[10px] text-zinc-400 hover:text-cyan-400 hover:border-cyan-800/40 hover:bg-zinc-900/60 transition-all cursor-pointer"
            >
              {prompt.text}
            </button>
          ))}
        </div>
      )}

      {/* Message input area */}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 bg-zinc-950/60 border-t border-zinc-800/40 flex gap-3 items-center backdrop-blur-md z-10"
      >
        <input
          type="text"
          placeholder="Chia sẻ cảm xúc của bạn tại đây để AI gợi ý bài hát..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl text-xs text-zinc-200 glass-input disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-cyan-500/10"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>

    </div>
  );
}
