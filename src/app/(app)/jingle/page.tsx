import { SimpleForm } from "@/components/SimpleForm";
import { JINGLE_FORM } from "@/lib/data/simpleForms";

// Jingle Comercial — Fluxo Técnico:
// Produto que gera versões curtas (15s/30s/60s) de jingles publicitários.
// Como a Suno não gera áudios curtos, geramos um áudio padrão e cortamos com FFmpeg.
//
// Fluxo geral
//   [Usuário preenche 8 perguntas]                    (este formulário)
//     |
//     v
//   [Letra curta com o slogan embutido + style otimizado]  (compositor/revisar,
//     |                                                     useLyricsGeneration)
//     v
//   [Suno gera áudio completo (1:30-2:00)]             (POST /api/criar-musica)
//     |
//     v
//   [FFmpeg corta em 15s / 30s / 60s com fade-out]     (POST /api/criar-musica/jingle,
//     |                                                  src/lib/ffmpeg.ts)
//     v
//   [Salva as 4 versões no R2 + registra em jingles/creations]  (src/lib/r2.ts,
//     |                                                          uploadBufferToR2)
//     v
//   [Entrega tudo pro usuário]                         (JingleReviewPanel: 4 players
//                                                        + download de cada versão)
//
// Estrutura de pastas no R2
//   jingles/{profileId}/{jingleId}/
//     ├── full.mp3  (áudio completo do Suno)
//     ├── 15s.mp3   (cortado 15 segundos)
//     ├── 30s.mp3   (cortado 30 segundos)
//     └── 60s.mp3   (cortado 60 segundos)
//
// Tabela `public.jingles` (ver supabase/schema.sql) guarda as respostas do
// formulário + as 4 URLs do R2, e tem uma linha espelho em `creations`
// (kind='jingle', audio_url = url_full) pra aparecer em Minhas Criações/Catálogo.

export default function JinglePage() {
  return <SimpleForm config={JINGLE_FORM} />;
}
