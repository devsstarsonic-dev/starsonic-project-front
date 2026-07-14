import { SimpleForm } from "@/components/SimpleForm";
import { JINGLE_FORM } from "@/lib/data/simpleForms";

// Jingle Comercial — Fluxo Técnico:
// Mesmo motor da Música/Instrumental (ReviewPanel): a Suno gera 2 versões
// (v1/v2) de um único take direto — SEM corte por FFmpeg. O jingle sai curto
// por causa da letra curta (até 500 caracteres) + uma dica de estilo pedindo
// explicitamente "very short and punchy, under 30 seconds" (ver
// buildMusicStyle / RevisarView.tsx). As 2 versões são salvas em `creations`
// (kind='jingle') exatamente como uma música normal — dá pra tocar, baixar e
// compartilhar cada uma.
//
// Fluxo geral
//   [Usuário preenche 8 perguntas]                     (este formulário)
//     |
//     v
//   [Letra curta (até 500 car.) com o slogan embutido]  (compositor/revisar,
//     |                                                  useLyricsGeneration)
//     v
//   [Suno gera 2 versões curtas]                        (ReviewPanel, mesmo
//     |                                                  fluxo do Studio)
//     v
//   [Salva as 2 versões em creations, kind='jingle']    (/api/criar-musica/salvar)
//
// ponytail: não há controle exato de duração na API da Suno — o "menor
// tempo possível" é só uma dica de prompt/style, não uma garantia. Se a Suno
// adicionar um parâmetro de duração no futuro, é o lugar certo pra usar.

export default function JinglePage() {
  return <SimpleForm config={JINGLE_FORM} />;
}
