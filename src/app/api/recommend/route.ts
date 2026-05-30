import { NextResponse } from 'next/server';
import { searchSpotifyTracks } from '@/services/spotify';
import { getSongsByMoods } from '@/services/mockData';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const ip = getClientIP(request);

  // 1. Rate Limiting Check
  const { allowed, remaining, resetAt } = checkRateLimit(ip, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) {
    logger.warn('Recommend API', 'Rate limit exceeded', { ip });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetAt.toString()
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood') || '';
  const query = searchParams.get('q') || '';
  const limitStr = searchParams.get('limit') || '8';
  
  // 2. Input Validation
  let limit = parseInt(limitStr, 10);
  if (isNaN(limit) || limit < 1 || limit > 50) {
    limit = 8; // fallback to default
  }

  if (query.length > 100 || mood.length > 50) {
    logger.warn('Recommend API', 'Input parameters exceed maximum length', { ip, queryLen: query.length, moodLen: mood.length });
    return NextResponse.json(
      { error: 'Search query or mood is too long.' },
      { status: 400 }
    );
  }

  try {
    logger.info('Recommend API', 'Processing recommendation request', { ip, query, mood, limit });

    if (query || mood) {
      const searchTerm = query || mood;
      // This will automatically try Spotify or fallback to Mock internally
      const tracks = await searchSpotifyTracks(searchTerm, limit);
      
      return NextResponse.json(tracks, {
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetAt.toString()
        }
      });
    }

    // Default: return some nice mock songs
    const defaultSongs = getSongsByMoods(['chill', 'happy']).slice(0, limit);
    return NextResponse.json(defaultSongs, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetAt.toString()
      }
    });
  } catch (error: any) {
    logger.error('Recommend API', 'Failed to fetch recommendations', { ip, error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    );
  }
}

