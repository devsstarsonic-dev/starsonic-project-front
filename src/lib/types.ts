// Tipos das tabelas do Supabase (espelham supabase/schema.sql)

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  plan: string;
  credits: number;
  avatar_initial: string;
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

export type CreationKind = "music" | "lyric" | "video" | "cover" | "podcast";
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

// ============================================
// COMPOSITION / WIZARD TYPES
// ============================================

export type CompositionMode = "detailed";

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
};
