import { NextResponse } from 'next/server';
import { askMusicAssistant } from '@/services/ai';
import { searchSpotifyTracks } from '@/services/spotify';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  const ip = getClientIP(request);
  
  // 1. Rate Limiting Check
  const { allowed, remaining, resetAt } = checkRateLimit(ip, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) {
    logger.warn('Chat API', 'Rate limit exceeded', { ip });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetAt.toString()
        }
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      logger.warn('Chat API', 'Empty request body received', { ip });
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { message, history } = body;

    // 2. Input Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      logger.warn('Chat API', 'Missing or empty message parameter', { ip });
      return NextResponse.json(
        { error: 'Message content is required and must be a valid non-empty string.' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      logger.warn('Chat API', 'Message exceeds maximum length', { ip, length: message.length });
      return NextResponse.json(
        { error: 'Message is too long. Maximum length is 1000 characters.' },
        { status: 400 }
      );
    }

    if (history && !Array.isArray(history)) {
      logger.warn('Chat API', 'History must be an array', { ip });
      return NextResponse.json(
        { error: 'History must be an array.' },
        { status: 400 }
      );
    }

    logger.info('Chat API', 'Processing message', { ip, messageLength: message.length, historyLength: history?.length || 0 });

    // 3. Get AI Analysis & Reply from Gemini or Local NLP
    const aiResponse = await askMusicAssistant(message, history || []);

    // 4. Query Spotify or Mock DB using the AI's smart searchQuery keywords
    logger.info('Chat API', `AI recommended search query: "${aiResponse.searchQuery}"`, {
      moods: aiResponse.extractedMoods,
    });
    
    const recommendedSongs = await searchSpotifyTracks(aiResponse.searchQuery, 4);

    // 5. Return aggregated payload
    return NextResponse.json(
      {
        reply: aiResponse.reply,
        recommendedSongs: recommendedSongs,
      },
      {
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetAt.toString()
        }
      }
    );
  } catch (error: any) {
    logger.error('Chat API', 'Failed to process chat session', { ip, error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: 'Failed to process chat session', details: error.message },
      { status: 500 }
    );
  }
}

