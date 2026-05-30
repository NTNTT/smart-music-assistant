'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { submitUserFeedback } from '@/app/actions';

export const FeedbackForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('feedback', feedback);

      // Call the Next.js Server Action directly!
      const response = await submitUserFeedback(formData);
      setResult(response);

      if (response.success) {
        setEmail('');
        setFeedback('');
      }
    } catch (err) {
      setResult({ error: 'Không thể kết nối tới máy chủ.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-zinc-800/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2.5 mb-4">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold text-white text-base">Gửi ý kiến phản hồi</h3>
      </div>
      
      <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
        Đóng góp ý kiến của bạn để giúp chúng tôi nâng cấp Trợ lý AI và trải nghiệm âm nhạc tốt hơn.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Email Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="feedback-email" className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            Email của bạn (tùy chọn)
          </label>
          <input
            id="feedback-email"
            type="email"
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full py-2.5 px-3.5 rounded-xl text-xs text-zinc-200 glass-input disabled:opacity-50"
          />
        </div>

        {/* Feedback Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="feedback-content" className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            Nội dung đóng góp *
          </label>
          <textarea
            id="feedback-content"
            rows={3}
            placeholder="Nhập ý kiến, phản hồi hoặc báo lỗi của bạn tại đây..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isSubmitting}
            required
            className="w-full py-2.5 px-3.5 rounded-xl text-xs text-zinc-200 glass-input min-h-[5rem] max-h-[8rem] disabled:opacity-50"
          />
        </div>

        {/* Status Messages */}
        {result && (
          <div className={`p-3 rounded-xl flex items-start gap-2.5 text-[11px] border ${
            result.success 
              ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400' 
              : 'bg-rose-950/20 border-rose-800/30 text-rose-400'
          }`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{result.message || result.error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!feedback.trim() || isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black font-semibold text-xs hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/5 mt-1"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Gửi ý kiến</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
