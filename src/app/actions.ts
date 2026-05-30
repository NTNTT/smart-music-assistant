'use server';

import { logger } from '@/lib/logger';

export interface FeedbackResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

/**
 * Next.js Server Action to handle user feedback submissions
 * Fully executed on the server side securely.
 */
export async function submitUserFeedback(formData: FormData): Promise<FeedbackResponse> {
  try {
    const email = formData.get('email') as string;
    const feedback = formData.get('feedback') as string;

    logger.info('Server Actions', 'Processing user feedback submission', {
      email: email || 'anonymous',
      feedbackLength: feedback?.length || 0
    });

    // 1. Validation
    if (!feedback || feedback.trim() === '') {
      return { error: 'Nội dung phản hồi không được để trống.' };
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Địa chỉ email không đúng định dạng.' };
    }

    // 2. Mock business logic (e.g. saving to database or sending notification)
    // In a real application, this could insert into a public.feedback table in Supabase
    logger.info('Server Actions', 'Feedback successfully logged on server', {
      email: email || 'anonymous',
      content: feedback.trim()
    });

    return {
      success: true,
      message: 'Cảm ơn ý kiến đóng góp quý báu của bạn! Ý kiến đã được ghi nhận trên máy chủ.'
    };
  } catch (err: any) {
    logger.error('Server Actions', 'Failed to process feedback', { error: err.message });
    return { error: 'Đã có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau.' };
  }
}
