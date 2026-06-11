import { CompositionResult, CompositionVersion } from "@/lib/types";

export const MOCK_LYRICS = `[Intro]

[Verse 1]
Hoje a vida me deu um susto
A porta fechou no meu rosto
Mas eu sei que Deus me ajusta
E amanhã eu trago o gosto

[Chorus]
Vou levantar, vou levantar
A poeira vai assentar
Amanhã é melhor, vou cantar
Quem é forte sabe esperar

[Verse 2]
A barba cresce, o tempo passa
Nada para por causa dela
Tomo café com muita graça
Coloco o chinelo na areia

[Chorus]
Vou levantar, vou levantar
A poeira vai assentar
Amanhã é melhor, vou cantar
Quem é forte sabe esperar

[Bridge]
Cada queda me ensina
A levantar com mais força
Cada estrada que termina
Outra estrada se reforça

[Chorus]
Vou levantar, vou levantar
A poeira vai assentar
Amanhã é melhor, vou cantar
Quem é forte sabe esperar

[Outro]`;

export const MOCK_VERSIONS: CompositionVersion[] = [
  {
    id: "v1",
    version: 1,
    duration: "2:34",
    genre: "Sertanejo",
    audioUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    badge: "VERSÃO PRINCIPAL",
    generatedAt: new Date().toISOString(),
  },
  {
    id: "v2",
    version: 2,
    duration: "2:48",
    genre: "Sertanejo",
    audioUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    badge: "VERSÃO ALTERNATIVA",
    generatedAt: new Date().toISOString(),
  },
];

export async function generateMockComposition(
  title: string,
  mode: string
): Promise<CompositionResult> {
  // Simula delay de processamento
  await new Promise((r) => setTimeout(r, 100));

  return {
    id: `comp_${Date.now()}`,
    title,
    mode: mode as any,
    lyrics: MOCK_LYRICS,
    versions: MOCK_VERSIONS,
    status: "success",
    createdAt: new Date().toISOString(),
  };
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
