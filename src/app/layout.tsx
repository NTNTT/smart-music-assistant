import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MusicProvider } from '@/context/MusicContext';
import { Sidebar } from '@/components/Sidebar';
import { MusicPlayer } from '@/components/MusicPlayer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Music Assistant – AI Recommendations',
  description: 'Trải nghiệm nghe nhạc thông minh với sự hỗ trợ của Trợ lý AI và Spotify',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full scroll-smooth">
      <body className={`${inter.className} h-full bg-[#08090f] text-zinc-100 antialiased overflow-hidden`}>
        <MusicProvider>
          <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Application Area */}
            <main className="flex-1 pl-64 pb-24 h-full relative overflow-y-auto flex flex-col">
              <div className="flex-1 w-full max-w-7xl mx-auto p-8">
                {children}
              </div>
            </main>

            {/* Persistent Audio Player */}
            <MusicPlayer />
          </div>
        </MusicProvider>
      </body>
    </html>
  );
}
