export const EMOTIONS = [
  "Motivação",
  "Fé",
  "Determinação",
  "Alegria",
  "Esperança",
  "Inspiração",
  "Emoção",
  "Romance",
  "Nostalgia",
  "Gratidão",
  "Superação",
  "Energia",
] as const;

export type Emotion = typeof EMOTIONS[number];

export const EMOTION_EMOJIS: Record<Emotion, string> = {
  "Motivação": "💪",
  "Fé": "🙏",
  "Determinação": "🎯",
  "Alegria": "😊",
  "Esperança": "✨",
  "Inspiração": "💡",
  "Emoção": "💖",
  "Romance": "💕",
  "Nostalgia": "🌙",
  "Gratidão": "🙌",
  "Superação": "🏔️",
  "Energia": "⚡",
};
