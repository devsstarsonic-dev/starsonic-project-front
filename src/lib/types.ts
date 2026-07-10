// Tipos das tabelas do Supabase (espelham supabase/schema.sql)

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  plan: string;
  credits: number;
  avatar_initial: string;
  avatar_url?: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  total_plays: number;
  created_at: string;
};

export type PlanFeature = { text: string; included: boolean };

export type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price_label: string;
  price_cents: number;
  is_popular: boolean;
  features: PlanFeature[];
  sort_order: number;
};

export type CatalogSong = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  plays: number;
  likes: number;
  shares: number;
  duration: string;
  emoji: string;
  gradient_from: string;
  gradient_to: string;
  is_trending: boolean;
  sort_order: number;
};

export type Dsp = {
  id: string;
  name: string;
  emoji: string;
  reach: string;
  sort_order: number;
};

export type Preset = {
  id: string;
  label: string;
  emoji: string;
  sort_order: number;
};

export type CreationKind = "music" | "instrumental" | "jingle" | "lyric" | "video" | "cover" | "podcast";
export type CreationStatus = "processing" | "draft" | "finalized";

export type Creation = {
  id: string;
  profile_id: string;
  title: string;
  kind: CreationKind;
  genre: string;
  duration: string;
  status: CreationStatus;
  progress: number;
  plays: number;
  words: number;
  resolution: string;
  is_favorite: boolean;
  is_public: boolean;
  has_video: boolean;
  badge_label: string;
  emoji: string;
  gradient_from: string;
  gradient_to: string;
  audio_url: string;
  image_url: string;
  // Texto da letra (usado pelo Letrista; kind = 'lyric').
  lyrics?: string | null;
  // Vídeo clipe (gerado pela Suno mp4). Precisa do task/audio id da geração.
  video_url?: string | null;
  suno_task_id?: string | null;
  suno_audio_id?: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  kind: "cyan" | "green" | "orange";
  is_read: boolean;
  created_at: string;
};

// Jingle comercial: 1 take completo da Suno (fonte interna, nunca entregue)
// cortado a partir do refrão em 15s/30s/60s (FFmpeg) — só essas 3 versões
// são entregues. Tem uma linha espelho em "creations" (kind='jingle',
// audio_url = url_60s).
export type JingleStatus = "pending" | "cutting" | "ready" | "failed";

export type Jingle = {
  id: string;
  creation_id: string | null;
  profile_id: string | null;
  brand_name: string;
  slogan: string;
  audience: string;
  genre: string;
  vibe: string;
  duration_chosen: string; // '15s' | '30s' | '60s' | 'pacote'
  voice_style: string;
  url_full?: string; // coluna legada, sempre vazia — não é mais usada
  url_15s: string;
  url_30s: string;
  url_60s: string;
  suno_task_id: string;
  status: JingleStatus;
  created_at: string;
};

// ============================================
// VOCALISTA — VOZES DE ARTISTA
// ============================================

// Ciclo de vida de uma Voz de Artista (persona vocal sintética da Suno).
// 'sample_ready' é o estado em que o usuário ouve a amostra e decide;
// só ao aprovar a voz ganha um persona_id e vira 'active'.
export type ArtistVoiceStatus =
  | "generating"
  | "sample_ready"
  | "active"
  | "discarded"
  | "archived";

export type ArtistVoiceGender = "male" | "female" | "nb";

// Rascunho do wizard: o que o usuário preenche antes de gerar a amostra.
export type ArtistVoiceDraft = {
  name: string;
  description: string;
  gender: ArtistVoiceGender | null;
  timbre: string;
  styles: string[];
  /** Preenchido apenas quando o usuário vem pelo modo "Inspire-se". */
  referenceLink: string;
  referenceName: string;
};

export type ArtistVoice = {
  id: string;
  profile_id: string | null;
  name: string;
  description: string;
  persona_id: string | null;
  persona_model: string;
  gender: ArtistVoiceGender | null;
  styles: string[];
  timbre: string;
  sample_task_id: string | null;
  sample_audio_id: string | null;
  sample_url: string | null;
  songs_generated: number;
  last_used_at: string | null;
  status: ArtistVoiceStatus;
  created_at: string;
};

// ============================================
// COMPOSITION / WIZARD TYPES
// ============================================

export type CompositionMode = "detailed";

// Modo de origem quando a composição vem de uma tela de página única do
// Sonic Lab (Instrumental / Jingle) em vez do wizard completo (Modo Studio).
export type SimpleMode = "instrumental" | "jingle";

// Uma resposta exibida em "Suas escolhas" na tela de revisão.
export type AnswerEntry = { label: string; value: string };

export type DetailedFormData = {
  // Step 1: Identidade
  musicName: string;
  history: string;
  genre: string;
  theme: string;
  emotions: string[];
  audience?: string;

  // Step 2: Voz
  mandatoryPhrases?: string;
  voiceStyle: string;
  vocalGender?: string;
  references?: string;
  voiceTone: string[];
  names?: string;

  // Step 3: Conteúdo
  songStructure: string;
  structure: string;
  duration?: string; // referência de duração: 1min | 2min | 3min | 4min
  bpm?: number; // andamento aproximado (BPM), detectado no "Inspire-se"
  instruments: string[];
  language: string;
  restrictions?: string;
  baseVersion?: string;
  versionTranslation?: string;
  translationDescription?: string;
  quantity: number;
};

export type CompositionVersion = {
  id: string;
  version: number;
  duration: string;
  genre: string;
  audioUrl: string;
  badge: string;
  generatedAt: string;
};

export type CompositionResult = {
  id: string;
  title: string;
  mode: CompositionMode;
  lyrics: string;
  versions: CompositionVersion[];
  status: "loading" | "success" | "error";
  createdAt: string;
};

export type WizardState = {
  mode?: CompositionMode;
  step: number;
  formData: Partial<DetailedFormData>;
  result: CompositionResult | null;
  loading: boolean;
  error: string | null;
  /** true depois que a música foi gerada — usado para limpar o form na próxima. */
  generated?: boolean;
  /** Presente quando a composição veio de Instrumental/Jingle (não do wizard Studio). */
  simpleMode?: SimpleMode;
  /** "Suas escolhas" pré-formatado pela config do form de origem (Instrumental/Jingle). */
  displayAnswers?: AnswerEntry[];
};

// ============================================
// MINHA LOJA
// ============================================

export type StoreProfile = {
  username: string;
  name: string;
  bio: string;
  themeColor: string;
  socials: { instagram?: string; tiktok?: string; youtube?: string; twitter?: string; spotify?: string };
};

export type StoreSong = {
  id: string;
  title: string;
  duration: string;
  genre: string;
  priceCents: number;
  sales: number;
  revenueCents: number;
  onSale: boolean;
  published: boolean;
  gradientFrom: string;
  gradientTo: string;
};

export type SaleOrigin = "star_card" | "marketplace" | "commission";
export type LicenseKind = "pessoal" | "comercial" | "exclusivo";

export type Sale = {
  id: string;
  date: string;
  songTitle: string;
  customer: string;
  origin: SaleOrigin;
  license: LicenseKind;
  netCents: number;
};

export type Withdrawal = {
  id: string;
  date: string;
  amountCents: number;
  method: string;
  status: "pago" | "pendente";
};
