-- ============================================================
-- STAR SONIC · Schema do Supabase (modo dados públicos / demo)
-- Cole TODO este arquivo no SQL Editor do Supabase e execute.
-- Cria as tabelas, políticas de leitura pública e os dados (seed)
-- que substituem o conteúdo "mock" do protótipo.
-- ============================================================

-- ---------- Limpeza idempotente (re-executável) ----------
drop table if exists public.notifications cascade;
drop table if exists public.creations cascade;
drop table if exists public.presets cascade;
drop table if exists public.dsps cascade;
drop table if exists public.catalog_songs cascade;
drop table if exists public.plans cascade;
drop table if exists public.profiles cascade;

-- ============================================================
-- TABELAS
-- ============================================================

-- Perfil (usuário demo único enquanto não há login)
create table public.profiles (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null default 'Artista',
  email          text,
  plan           text not null default 'Free',
  credits        int  not null default 50,
  avatar_initial text not null default 'A',
  avatar_url     text default '',
  bio            text default '',
  location       text default '',
  website        text default '',
  total_plays    int  not null default 0,
  created_at     timestamptz not null default now()
);

-- Planos
create table public.plans (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text not null,
  price_label text not null,
  price_cents int  not null default 0,
  is_popular  boolean not null default false,
  features    jsonb not null default '[]'::jsonb,  -- [{ "text": "...", "included": true }]
  sort_order  int  not null default 0
);

-- Catálogo da comunidade
create table public.catalog_songs (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  artist        text not null,
  genre         text not null,
  plays         int not null default 0,
  likes         int not null default 0,
  shares        int not null default 0,
  duration      text default '',
  emoji         text default '🎵',
  gradient_from text default '#00d4ff',
  gradient_to   text default '#3b9eff',
  is_trending   boolean not null default false,
  sort_order    int not null default 0
);

-- Plataformas de distribuição (DSPs)
create table public.dsps (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  emoji      text not null,
  reach      text default '',
  sort_order int not null default 0
);

-- Presets rápidos
create table public.presets (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  emoji      text default '🎤',
  sort_order int not null default 0
);

-- Biblioteca de criações (do usuário demo)
create table public.creations (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete cascade,
  title         text not null,
  kind          text not null default 'music',  -- music | lyric | video | cover | podcast
  genre         text default '',
  duration      text default '',
  status        text not null default 'finalized', -- processing | draft | finalized
  progress      int not null default 100,
  plays         int not null default 0,
  words         int default 0,
  resolution    text default '',
  is_favorite   boolean not null default false,
  is_public     boolean not null default false,
  has_video     boolean not null default false,
  badge_label   text default '',
  emoji         text default '🎵',
  gradient_from text default '#3be6ff',
  gradient_to   text default '#3b9eff',
  audio_url     text default '',   -- URL do áudio gerado pela Suno (MP3)
  image_url     text default '',   -- capa gerada pela Suno
  created_at    timestamptz not null default now()
);
create index creations_profile_idx on public.creations(profile_id);

-- Notificações (do usuário demo)
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  title      text not null,
  message    text default '',
  kind       text not null default 'cyan',   -- cyan | green | orange
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_profile_idx on public.notifications(profile_id);

-- ============================================================
-- RLS · leitura pública para todas as tabelas (sem autenticação)
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.plans         enable row level security;
alter table public.catalog_songs enable row level security;
alter table public.dsps          enable row level security;
alter table public.presets       enable row level security;
alter table public.creations     enable row level security;
alter table public.notifications enable row level security;

create policy "profiles readable"      on public.profiles      for select using (true);
create policy "plans readable"         on public.plans         for select using (true);
create policy "catalog readable"       on public.catalog_songs for select using (true);
create policy "dsps readable"          on public.dsps          for select using (true);
create policy "presets readable"       on public.presets       for select using (true);
create policy "creations readable"     on public.creations     for select using (true);
create policy "notifications readable" on public.notifications for select using (true);

-- Modo demo (sem login): permite gravar as músicas geradas pela Suno.
create policy "creations insertable"   on public.creations     for insert with check (true);

-- ------------------------------------------------------------
-- Autenticação (Supabase Auth · e-mail/senha)
-- O id de cada profile é o mesmo id do usuário em auth.users.
-- No cadastro, o cliente insere a linha com id = auth.uid().
-- ------------------------------------------------------------
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cria automaticamente a linha em profiles quando um usuário se cadastra.
-- Roda como SECURITY DEFINER (ignora a RLS) e funciona mesmo com a
-- confirmação de e-mail ligada, pois dispara na criação do auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, plan, credits, avatar_initial, bio, location, website)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Artista'),
    new.email,
    'Free',
    50,
    upper(left(coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'A'), 1)),
    '',
    '',
    coalesce(new.raw_user_meta_data->>'website', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SEED
-- ============================================================

-- Usuário demo (igual ao protótipo)
insert into public.profiles (id, full_name, email, plan, credits, avatar_initial, bio, location, website, total_plays)
values (
  '00000000-0000-0000-0000-000000000001',
  'Marina Silva',
  'marina@email.com',
  'Free',
  50,
  'M',
  'Criadora de músicas na Star Sonic. Apaixonada por MPB e pop.',
  'São Paulo, BR',
  'starsonic.com.br/marina',
  12400
);

-- Planos
insert into public.plans (slug, name, tagline, price_label, price_cents, is_popular, sort_order, features) values
('free',    'Free',    'Pra experimentar',           'R$ 0',      0,    false, 0,
  '[{"text":"50 créditos no cadastro","included":true},{"text":"Até 30s por música","included":true},{"text":"Qualidade rascunho","included":true},{"text":"Uso comercial","included":false},{"text":"Distribuição","included":false}]'),
('starter', 'Starter', 'Pra criar com regularidade',  'R$ 19,90', 1990, false, 1,
  '[{"text":"800 créditos/mês","included":true},{"text":"Até 120s por música","included":true},{"text":"Qualidade padrão","included":true},{"text":"Uso pessoal e comercial","included":true},{"text":"Distribuição","included":false}]'),
('plus',    'Plus',    'Pra criadores ativos',        'R$ 32,90', 3290, true,  2,
  '[{"text":"1.800 créditos/mês","included":true},{"text":"Até 180s por música","included":true},{"text":"Qualidade premium","included":true},{"text":"Prioridade na fila","included":true},{"text":"Suporte por chat","included":true}]'),
('creator', 'Creator', 'Pra artistas profissionais',  'R$ 54,90', 5490, false, 3,
  '[{"text":"4.000 créditos/mês","included":true},{"text":"Multitrack (stems)","included":true},{"text":"Uso comercial estendido","included":true},{"text":"Acesso antecipado","included":true},{"text":"Suporte prioritário","included":true}]');

-- Catálogo da comunidade
insert into public.catalog_songs (title, artist, genre, plays, likes, shares, duration, emoji, gradient_from, gradient_to, is_trending, sort_order) values
('Coração Sertanejo', '@joaoartista',      'Sertanejo', 2400, 187, 42, '',     '🤠', '#fb923c', '#eab308', true,  0),
('Brilho da Manhã',   '@marina.musica',    'Pop',       1800, 153, 38, '',     '🌟', '#ec4899', '#a855f7', true,  1),
('Fé Inabalável',     '@pastorpaulo',      'Gospel',    3100, 412, 89, '',     '🙏', '#a855f7', '#6366f1', true,  2),
('Bati de Frente',    '@dj_lucas',         'Funk',      5200, 287, 64, '',     '🔊', '#00d4ff', '#3b9eff', true,  3),
('Caminhos da Vida',  '@anajulia',         'MPB',        892,   0,  0, '3:24', '🎶', '#22c55e', '#00d4ff', false, 4),
('Forró da Saudade',  '@nordeste.musical', 'Forró',     1200,   0,  0, '2:48', '🪗', '#fb923c', '#ec4899', false, 5),
('Rock dos Anos 80',  '@bandaretro',       'Rock',       678,   0,  0, '4:12', '🎸', '#6366f1', '#a855f7', false, 6);

-- DSPs
insert into public.dsps (name, emoji, reach, sort_order) values
('Spotify', '🎵', '600M+', 0),
('Apple Music', '🍎', '100M+', 1),
('YouTube Music', '▶️', '2B+', 2),
('Amazon Music', '🎶', '80M+', 3),
('Deezer', '🎧', '9M+', 4),
('Tidal', '📻', 'Hi-Fi', 5),
('TikTok', '📱', '1B+', 6);

-- Presets
insert into public.presets (label, emoji, sort_order) values
('Pop Feminino · 60s', '🎤', 0),
('Sertanejo Médio', '🎤', 1),
('Lofi Instrumental', '🎵', 2);

-- Criações do usuário demo
insert into public.creations
  (profile_id, title, kind, genre, duration, status, progress, plays, words, resolution,
   is_favorite, is_public, has_video, badge_label, emoji, gradient_from, gradient_to, created_at) values
('00000000-0000-0000-0000-000000000001', 'Aniversário da Mamãe',       'music',   'Sertanejo', '3:00',  'processing', 65,    0,   0, '',          false, false, false, 'EM ANDAMENTO', '🎵', '#1d1d5e', '#252570', now() - interval '5 minutes'),
('00000000-0000-0000-0000-000000000001', 'Vou Levantar',               'music',   'Sertanejo', '2:34',  'draft',      100,   0,   0, '',          false, false, false, 'RASCUNHO',     '🎵', '#3be6ff', '#3b9eff', now() - interval '7 minutes'),
('00000000-0000-0000-0000-000000000001', 'Caminhos da Fé',             'music',   'Gospel',    '3:12',  'finalized',  100,  6200, 0, '',          true,  true,  true,  'FAVORITA',     '🎵', '#a855f7', '#ec4899', now() - interval '2 days'),
('00000000-0000-0000-0000-000000000001', 'Coração Sincero',            'music',   'MPB',       '2:56',  'finalized',  100,  890,  0, '',          false, false, false, 'FINALIZADA',   '🎵', '#22c55e', '#00d4ff', now() - interval '3 days'),
('00000000-0000-0000-0000-000000000001', 'Poema da Saudade',           'lyric',   '',          '',      'finalized',  100,   0, 142, '',          false, false, false, 'SÓ LETRA',     '📝', '#fb923c', '#eab308', now() - interval '4 days'),
('00000000-0000-0000-0000-000000000001', 'Caminhos da Fé · Vídeo MP4', 'video',   '',          '3:12',  'finalized',  100,   0,   0, '1080p',     false, false, false, 'VÍDEO',        '🎬', '#eab308', '#fb923c', now() - interval '2 days'),
('00000000-0000-0000-0000-000000000001', 'Capa - EP Verão 2026',       'cover',   '',          '',      'finalized',  100,   0,   0, '1500x1500', false, false, false, 'CAPA',         '🎨', '#ec4899', '#a855f7', now() - interval '7 days'),
('00000000-0000-0000-0000-000000000001', 'Podcast - Episódio Piloto',  'podcast', '',          '12:34', 'finalized',  100,   0,   0, '',          false, false, false, 'PODCAST',      '🎙️', '#6366f1', '#a855f7', now() - interval '14 days');

-- Notificações do usuário demo
insert into public.notifications (profile_id, title, message, kind, created_at) values
('00000000-0000-0000-0000-000000000001', '✓ Aniversário da Mamãe quase pronto', 'Sua música está sendo finalizada', 'cyan',   now() - interval '10 minutes'),
('00000000-0000-0000-0000-000000000001', '📤 Distribuição confirmada',          '"Caminhos da Fé" no Spotify',       'green',  now() - interval '2 hours'),
('00000000-0000-0000-0000-000000000001', '💎 Plano Plus em promoção',           '10% off até domingo',               'orange', now() - interval '1 day');
