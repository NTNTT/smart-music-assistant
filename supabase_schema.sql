-- ==========================================
-- SUPABASE DATABASE SCHEMA - SMART MUSIC ASSISTANT
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Songs Table
create table public.songs (
  id text primary key, -- Changed from uuid to text to support Spotify and custom track IDs
  title text not null,
  artist text not null,
  album text,
  genre text,
  moods text[] default '{}'::text[] not null,
  audio_url text not null,
  cover_url text,
  duration integer not null, -- in seconds
  play_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Songs (public read, admin write)
alter table public.songs enable row level security;

create policy "Anyone can read songs" on public.songs
  for select using (true);

-- 3. Playlists Table
create table public.playlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_private boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Playlists
alter table public.playlists enable row level security;

create policy "Users can manage their own playlists" on public.playlists
  for all using (auth.uid() = user_id);

create policy "Anyone can view public playlists" on public.playlists
  for select using (is_private = false);

-- 4. Playlist Songs Junction Table
create table public.playlist_songs (
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  song_id text references public.songs(id) on delete cascade not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (playlist_id, song_id)
);

-- Enable RLS for Playlist Songs
alter table public.playlist_songs enable row level security;

create policy "Users can manage songs in their playlists" on public.playlist_songs
  for all using (
    exists (
      select 1 from public.playlists
      where id = playlist_songs.playlist_id and user_id = auth.uid()
    )
  );

-- 5. Chat History Table
create table public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  recommended_songs jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Chat History
alter table public.chat_history enable row level security;

create policy "Users can manage their own chat history" on public.chat_history
  for all using (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS & FUNCTIONS FOR USER SIGNUP
-- ==========================================

-- Function to handle new user registration from Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create a profile after signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Indexes for faster querying
create index idx_songs_moods on public.songs using gin(moods);
create index idx_playlists_user on public.playlists(user_id);
create index idx_chat_history_user on public.chat_history(user_id);
