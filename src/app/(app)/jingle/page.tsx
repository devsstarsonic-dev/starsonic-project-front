import { SimpleForm } from "@/components/SimpleForm";
import { JINGLE_FORM } from "@/lib/data/simpleForms";

// Jingle Comercial — Fluxo Técnico:
// Produto que entrega SEMPRE 3 versões finais (15s/30s/60s) de jingles
// publicitários — nunca o áudio completo. Como a Suno não gera áudios
// curtos, geramos 1 áudio completo como fonte interna, achamos o refrão
// pelos timestamps da letra e cortamos ali com FFmpeg.
//
// Fluxo geral
//   [Usuário preenche 8 perguntas]                     (este formulário)
//     |
//     v
//   [Letra curta com o slogan embutido + style otimizado]  (compositor/revisar,
//     |                                                     useLyricsGeneration)
//     v
//   [Suno gera áudio completo ~1:30-2:00 + taskId/audioId]  (POST /api/criar-musica)
//     |
//     v
//   [Backend consulta GET timestamps por seção/palavra]  (POST /api/v1/generate/
//     |                                                    get-timestamped-lyrics,
//     |                                                    src/lib/suno/hookWindow.ts)
//     v
//   [Acha o início do 1º refrão → fim do 2º (ou cai pra 0s se não achar)]
//     |
//     v
//   [FFmpeg corta ali em 15s/30s/60s + fade in/out + normaliza + 320kbps]
//     |                                                  (src/lib/ffmpeg.ts)
//     v
//   [Salva as 3 versões no R2 + registra em jingles/creations]  (src/lib/r2.ts,
//     |                                                          uploadBufferToR2)
//     v
//   [Entrega ao cliente]                                (JingleReviewPanel: 3 players
//                                                          + download de cada versão)
//
// Estrutura de pastas no R2
//   jingles/{profileId}/{jingleId}/
//     ├── 15s.mp3   (cortado 15 segundos, a partir do refrão)
//     ├── 30s.mp3   (cortado 30 segundos, a partir do refrão)
//     └── 60s.mp3   (cortado 60 segundos, a partir do refrão)
//   (o áudio completo da Suno é só fonte interna do corte — nunca sobe pro R2)
//
// Tabela `public.jingles` (ver supabase/schema.sql) guarda as respostas do
// formulário + as 3 URLs do R2, e tem uma linha espelho em `creations`
// (kind='jingle', audio_url = url_60s) pra aparecer em Minhas Criações/Catálogo.

export default function JinglePage() {
  return <SimpleForm config={JINGLE_FORM} />;
}
