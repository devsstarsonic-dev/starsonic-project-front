"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { ReviewPanel } from "@/components/Compositor/ReviewPanel";
import { JingleReviewPanel } from "@/components/Compositor/JingleReviewPanel";
import { MOCK_LYRICS } from "@/lib/mocks/composition";
import {
  buildLyricsPrompt,
  buildMusicStyle,
  buildNegativeTags,
  hasAnswers,
} from "@/lib/compositor/lyricsPrompt";
import { useLyricsGeneration } from "@/lib/hooks/useLyricsGeneration";
import { useState, useEffect, useRef, useCallback } from "react";

// Códigos de idioma (Etapa 3) → rótulo legível em "Suas escolhas".
const LANG_LABELS: Record<string, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "Inglês",
  "es-ES": "Espanhol",
};

export default function RevisarPage() {
  const router = useRouter();
  const { state, markGenerated, reset, applyPendingSeed } = useComposition();
  const [mounted, setMounted] = useState(false);
  const { lyrics, loading, error, generate } = useLyricsGeneration();
  const startedRef = useRef(false);
  // Instrumental (Sonic Lab): trilha sem vocal — não gera letra nem título por letra.
  const instrumental = state.simpleMode === "instrumental";
  // Jingle Comercial: tem letra (com o slogan embutido), mas usa seu próprio
  // painel — que corta o áudio completo em 15s/30s/60s com FFmpeg ao final.
  const jingle = state.simpleMode === "jingle";
  // Título gerado pelo GPT quando o usuário deixa o STARSONIC escolher o nome.
  const [genTitle, setGenTitle] = useState<string | null>(null);
  const titleRef = useRef(false);

  // Ao montar, consome uma semente pendente do Instrumental/Jingle (se houver)
  // — funciona mesmo se o layout do compositor já estava montado de antes
  // (nesse caso o efeito de hidratação do Provider, que só roda no mount dele,
  // não pegaria a resposta nova).
  useEffect(() => {
    applyPendingSeed();
    setMounted(true);
  }, [applyPendingSeed]);

  // Quando a opção é "STARSONIC escolhe o nome", gera o título (GPT) assim que
  // a letra estiver pronta — baseado na letra. Roda uma única vez.
  useEffect(() => {
    if (titleRef.current || instrumental) return;
    const musicName = typeof state.formData.musicName === "string" ? state.formData.musicName.trim() : "";
    if (musicName) return; // o usuário definiu o nome
    if (!hasAnswers(state.formData)) return;
    const lyr = (lyrics || "").trim();
    if (!lyr || loading) return;
    titleRef.current = true;
    (async () => {
      try {
        const genre = typeof state.formData.genre === "string" ? state.formData.genre : "";
        const r = await fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lyrics: lyr, genre }),
        });
        const d = await r.json();
        if (r.ok && d.title) setGenTitle(d.title as string);
        else titleRef.current = false; // permite nova tentativa
      } catch {
        titleRef.current = false;
      }
    })();
  }, [lyrics, loading, state.formData, instrumental]);

  // Gera a letra automaticamente a partir das respostas das 3 etapas
  // assim que houver respostas disponíveis. Roda uma única vez. Instrumental
  // não tem vocal, então não gera (nem precisa de) letra.
  useEffect(() => {
    if (!mounted || startedRef.current || instrumental) return;
    if (!hasAnswers(state.formData)) return;
    startedRef.current = true;
    generate(buildLyricsPrompt(state.formData));
  }, [mounted, state.formData, generate, instrumental]);

  const handleRegenerate = useCallback(() => {
    generate(buildLyricsPrompt(state.formData));
  }, [generate, state.formData]);

  if (!mounted) return null;

  const handleEdit = () => {
    router.push("/compositor/step-3");
  };

  // "Criar nova música": limpa toda a composição e volta ao início do formulário.
  const handleNewSong = () => {
    reset();
    router.push("/compositor");
  };

  // Estilo enviado para a Suno: todas as especificações musicais do wizard
  // (gênero, emoções, estilo/tons de voz, instrumentos, referências, idioma).
  // Instrumental reforça "sem vocal" no próprio texto de estilo (além da flag
  // instrumental na API), já que a Suno também lê essas dicas no style.
  const composeStyle = buildMusicStyle(state.formData)
    + (instrumental ? ", instrumental, no vocals" : "")
    + (jingle ? ", commercial jingle, catchy, radio/tv ad" : "");
  // Restrições → estilos/conteúdos a evitar na geração.
  const negativeTags = buildNegativeTags(state.formData);

  // Todas as respostas das 3 etapas, na ordem do wizard, com rótulos legíveis.
  const fd = state.formData;
  const txt = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const list = (v: unknown) => (Array.isArray(v) && v.length ? v.join(", ") : "");
  const langCode = txt(fd.language);

  const selectedAnswers: Record<string, string> = {
    "Nome da Música": txt(fd.musicName) || "—",
    "Gênero": txt(fd.genre) || "—",
    "Tema": txt(fd.theme) || "—",
    "História": txt(fd.history) || "—",
    "Público": txt(fd.audience) || "—",
    "Emoções": list(fd.emotions) || "—",
    "Palavras obrigatórias": txt(fd.mandatoryPhrases) || "—",
    "Estilo de Voz": txt(fd.voiceStyle) || "—",
    "Tom da Voz": list(fd.voiceTone) || "—",
    "Referências": txt(fd.references) || "—",
    "Citar nomes": txt(fd.names) || "—",
    "Estrutura": txt(fd.songStructure) || "—",
    "Instrumentos": list(fd.instruments) || "—",
    "Idioma": LANG_LABELS[langCode] || langCode || "—",
    "Restrições": txt(fd.restrictions) || "—",
    "Versões": fd.quantity ? `${fd.quantity} música(s)` : "—",
  };

  // Instrumental: só as 6 perguntas reais do formulário — nos mesmos rótulos
  // usados lá, incluindo o Andamento (BPM), que não existe no Studio/Jingle.
  const instrumentalAnswers: Record<string, string> = {
    "Nome da trilha": txt(fd.musicName) || "—",
    "Gênero musical": txt(fd.genre) || "—",
    "Clima / emoção": list(fd.emotions) || "—",
    "Instrumentos principais": list(fd.instruments) || "—",
    "Andamento": typeof fd.bpm === "number" ? `${Math.round(fd.bpm)} BPM` : "—",
    "Onde vai usar": txt(fd.audience) || "—",
  };

  // Jingle: as 8 perguntas reais do formulário, nos mesmos rótulos usados lá.
  const jingleAnswers: Record<string, string> = {
    "Nome da marca": txt(fd.musicName) || "—",
    "O que vende": txt(fd.theme) || "—",
    "Slogan": txt(fd.mandatoryPhrases) || "—",
    "Público-alvo": txt(fd.audience) || "—",
    "Estilo musical": txt(fd.genre) || "—",
    "Vibe": list(fd.emotions) || "—",
    "Duração desejada": txt(fd.duration) || "—",
    "Estilo de voz": txt(fd.voiceStyle) || "—",
  };

  // Sem respostas (ex.: acesso direto à URL) → cai na letra de exemplo editável.
  const answered = hasAnswers(state.formData);
  const lyricsForPanel = instrumental ? "" : answered ? lyrics : MOCK_LYRICS;

  // Instrumental não tem GPT-título (não há letra pra basear) — deriva do
  // nome informado ou do gênero escolhido. Jingle usa o nome da marca.
  const instrumentalTitle = txt(fd.genre) ? `${txt(fd.genre)} Instrumental` : "Instrumental";
  const title = instrumental
    ? txt(state.formData.musicName) || instrumentalTitle
    : jingle
      ? (txt(state.formData.musicName) ? `${txt(state.formData.musicName)} · Jingle` : "Jingle Comercial")
      : txt(state.formData.musicName) || genTitle || txt(state.formData.theme) || "Sua Música";

  return (
    <div className="page">
      {jingle ? (
        <JingleReviewPanel
          title={title}
          lyrics={lyricsForPanel}
          lyricsLoading={answered && loading}
          lyricsError={answered ? error : null}
          onRegenerateLyrics={answered ? handleRegenerate : undefined}
          style={composeStyle}
          negativeTags={negativeTags}
          selectedAnswers={jingleAnswers}
          brandName={txt(fd.musicName)}
          slogan={txt(fd.mandatoryPhrases)}
          audience={txt(fd.audience)}
          genre={txt(fd.genre)}
          vibe={list(fd.emotions)}
          durationChosen={txt(fd.duration)}
          voiceStyle={txt(fd.voiceStyle)}
          onGenerated={markGenerated}
          saldo={300}
          onEdit={handleEdit}
          onNewSong={handleNewSong}
        />
      ) : (
        <ReviewPanel
          title={title}
          lyrics={lyricsForPanel}
          lyricsLoading={!instrumental && answered && loading}
          lyricsError={!instrumental && answered ? error : null}
          onRegenerateLyrics={!instrumental && answered ? handleRegenerate : undefined}
          style={composeStyle}
          negativeTags={negativeTags}
          selectedAnswers={instrumental ? instrumentalAnswers : selectedAnswers}
          answers={state.formData as Record<string, unknown>}
          autoTitle={!instrumental && !txt(state.formData.musicName) && !genTitle}
          quantity={typeof state.formData.quantity === "number" ? state.formData.quantity : 2}
          onGenerated={markGenerated}
          totalCost={75}
          saldo={300}
          onEdit={handleEdit}
          onNewSong={handleNewSong}
          instrumental={instrumental}
        />
      )}
    </div>
  );
}
