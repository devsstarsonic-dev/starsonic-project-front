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

export type CreationKind = "music" | "instrumental" | "jingle" | "lyric" | "video" | "cover" | "podcast" | "voice";
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

export type NotificationType = "info" | "transfer_request" | "transfer_accepted" | "transfer_rejected";

export type Notification = {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  kind: "cyan" | "green" | "orange";
  type: NotificationType;
  creation_id: string | null;
  is_read: boolean;
  created_at: string;
};

// ponytail: a tabela public.jingles (ver supabase/schema.sql) ficou legada —
// o jingle hoje é uma criação normal (kind='jingle' em "creations", 2
// versões como música/instrumental). Não há mais tipo/escrita pra ela aqui;
// se for reaproveitar duração exata por versão no futuro, é o lugar certo.

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
  /** Amostra gerada pela Suno (etapa "gerando"), usada na amostra e ao salvar. */
  sampleUrl?: string;
  sampleImageUrl?: string;
  sampleDuration?: number;
  sampleTaskId?: string;
  sampleAudioId?: string;
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

// Voz criada pelo usuário (creations kind='voice' + creation_answers) importada
// como referência no formulário. Todos os campos salvos no banco viram tags no
// style enviado à Suno (ver buildVoiceReferenceStyle).
export type VoiceReference = {
  id: string;
  name: string;
  gender: string; // "male" | "female" | "nb" | ""
  timbre: string;
  styles: string[];
  description: string;
  imageUrl?: string;
  audioUrl?: string;
};

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
  // Voz criada importada como referência (Etapa 1) — vira tags no style da Suno.
  voiceRef?: VoiceReference;

  // Step 3: Conteúdo
  songStructure: string;
  structure: string;
  duration?: string; // referência de duração: 1min | 2min | 3min | 4min
  bpm?: number; // andamento aproximado (BPM), detectado no "Inspire-se"
  // Métricas reais do Spotify (audio-features) quando o "Inspire-se" recebe um
  // link de faixa — alimentam tags do estilo (energy/mood/tom).
  spotifyFeatures?: import("@/lib/compositor/spotify").SpotifyAudioFeatures;
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
  /** true assim que o CompositionProvider decide o formData final (veio do sessionStorage, veio vazio, ou falhou ao ler) — nunca muda depois. */
  hydrated?: boolean;
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
  gradientFrom: string;
  gradientTo: string;
  audioUrl: string;
  imageUrl: string | null;
};

// Liga uma criação (public.creations) à sua listagem à venda na loja do
// usuário — 1 linha por criação (ver supabase/schema.sql). Ausência de linha
// pra uma criação = ainda não foi colocada à venda.
export type StoreListing = {
  id: string;
  profile_id: string;
  creation_id: string;
  price_cents: number;
  on_sale: boolean;
  created_at: string;
  updated_at: string;
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
