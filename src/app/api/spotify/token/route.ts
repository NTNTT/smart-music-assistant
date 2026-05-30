import { NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Spotify credentials not configured' },
      { status: 400 }
    );
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return NextResponse.json({ access_token: cachedToken });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch Spotify token', details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // Expires in (data.expires_in) seconds, subtract 60 seconds buffer
    tokenExpiresAt = now + (data.expires_in - 60) * 1000;

    return NextResponse.json({ access_token: cachedToken });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
