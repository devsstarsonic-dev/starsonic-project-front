"use client";

import { ReactNode, useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import Link from "next/link";
import type { ReviewUi } from "@/lib/data/reviewConfigs";
import { useRouter, usePathname } from "next/navigation";
import { AudioPlayer } from "./AudioPlayer";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { useGeneration, type GenTrack, type GenJob } from "@/lib/generation/GenerationContext";
import { MUSIC_CREDIT_COST } from "@/lib/credits";
import { GENRES } from "@/lib/data/genres";
import { LANGUAGES } from "@/lib/data/languages";
import {
  VIDEO_FAILED,
  MUSIC_STATUS_LABEL as STATUS_LABEL,
  VIDEO_STATUS_LABEL,
  MUSIC_STEPS as STEPS,
  musicStepIndex as stepIndex,
  audioDownloadHref as downloadHref,
} from "@/lib/suno/status";

interface Props {
  title: string;
  lyrics: string;
  /** A letra está sendo gerada pela IA (Suno). */
  lyricsLoading?: boolean;
  /** Erro ocorrido ao gerar a letra. */
  lyricsError?: string | null;
  /** Dispara uma nova geração da letra a partir das respostas. */
  onRegenerateLyrics?: () => void;
  /** Trilha sem vocal (modo Instrumental): esconde a letra e envia instrumental=true à Suno. */
  instrumental?: boolean;
  /** Tipo salvo em creations.kind — default deriva de `instrumental` se omitido. */
  kind?: "music" | "instrumental" | "jingle";
  /** Limita o tamanho da letra editável (usado pelo Jingle, que precisa de letra curta). */
  maxLyricsLength?: number;
  /** Estilo/gênero enviado para a Suno (ex.: "Pop brasileiro, voz feminina"). */
  style?: string;
  /** Estilos/conteúdos a evitar na geração (negativeTags da Suno). */
  negativeTags?: string;
  selectedAnswers: Record<string, string | string[]>;
  /** Respostas completas do formulário (DetailedFormData) — salvas junto da música. */
  answers?: Record<string, unknown>;
  /** "STARSONIC cria o nome": gera o título pela OpenAI a partir da letra, ao salvar. */
  autoTitle?: boolean;
  /** Quantas músicas gerar (2, 4 ou 6). A Suno gera 2 por chamada. */
  quantity?: number;
  /** Chamado quando a música é gerada/salva — para limpar o form na próxima. */
  onGenerated?: () => void;
  /** Novo gênero escolhido em "Gerar com outros estilos" — atualiza "Suas escolhas". */
  onGenreChange?: (genre: string) => void;
  /** Novo idioma escolhido em "Gerar com outros estilos" — atualiza "Suas escolhas". */
  onLanguageChange?: (languageCode: string) => void;
  totalCost: number;
  saldo: number;
  onEdit?: () => void;
  /** Limpa a composição atual e volta ao início do formulário (etapa 1). */
  onNewSong?: () => void;
  statsInfo?: ReactNode;
  /** Cópia específica do modo (Studio / Instrumental / Jingle). */
  ui: ReviewUi;
}

function ReviewPanelComponent({
  title,
  lyrics,
  lyricsLoading = false,
  lyricsError = null,
  onRegenerateLyrics,
  instrumental = false,
  kind,
  maxLyricsLength,
  style = "",
  negativeTags = "",
  selectedAnswers,
  answers,
  autoTitle,
  quantity,
  onGenerated,
  onGenreChange,
  onLanguageChange,
  totalCost,
  saldo,
  onEdit,
  onNewSong,
  ui,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const gen = useGeneration();

  // Job de geração em segundo plano DESTA tela (o mesmo job aparece no card da
  // sidebar). Casado pelo returnHref para não cruzar studio/instrumental/jingle.
  const job = gen?.job && gen.job.returnHref === pathname ? gen.job : null;

  // Espelho local do job. Ao voltar para esta tela o card da sidebar é
  // descartado (o job vira null), mas o resultado — players, vídeo, "salva em
  // Minhas Criações" — precisa continuar aqui. Como o espelho é estado LOCAL,
  // uma visita nova (sem job) começa limpa, sem resquício da criação anterior.
  const [jobMirror, setJobMirror] = useState<GenJob | null>(null);
  useEffect(() => {
    if (job) setJobMirror(job);
  }, [job]);
  const view = job ?? jobMirror;

  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  // A letra chega de forma assíncrona (gerada pela IA). Quando uma nova letra
  // chega, sincroniza o textarea — sem sobrescrever com vazio enquanto gera.
  // Se já existe um job (ex.: voltou da sidebar depois de gerar em 2º plano),
  // usa a letra do snapshot do job — o form pode ter sido limpo ao navegar.
  useEffect(() => {
    if (view?.editedLyrics) {
      setEditedLyrics(maxLyricsLength ? view.editedLyrics.slice(0, maxLyricsLength) : view.editedLyrics);
      return;
    }
    if (lyrics) setEditedLyrics(maxLyricsLength ? lyrics.slice(0, maxLyricsLength) : lyrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyrics, maxLyricsLength, view?.id]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Caixa "Gerar com outros estilos": escolha de estilos mantendo a mesma letra.
  const [stylesOpen, setStylesOpen] = useState(false);
  const [chosenStyles, setChosenStyles] = useState<string[]>([]);
  const [customStyle, setCustomStyle] = useState("");
  // Idioma da nova versão (opcional). "" = mantém o idioma original.
  const [chosenLang, setChosenLang] = useState("");
  // Estilo enviado na próxima composição: undefined = estilo normal;
  // preenchido = "Gerar com outros estilos" (recompõe com variação).
  const [pendingStyleOverride, setPendingStyleOverride] = useState<string | undefined>(undefined);
  // Estado da geração vem do provider (job); aqui só um erro local de validação
  // (letra vazia / créditos) exibido antes do job existir.
  const [localError, setLocalError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  // "Gerar com outros estilos": gênero/idioma a adaptar a letra antes de compor.
  const [pendingAdapt, setPendingAdapt] = useState<{ genre?: string; language?: string } | null>(null);
  const [adapting, setAdapting] = useState(false);

  // Versões já geradas antes de um "Gerar com outros estilos" — ficam na tela
  // junto com as novas (as antigas já estão salvas na biblioteca).
  const [previousTracks, setPreviousTracks] = useState<GenTrack[]>([]);

  // Derivados do espelho (sobrevivem ao descarte do card na sidebar).
  const status = view?.status ?? null;
  const tracks = view?.tracks ?? [];
  // Todas as versões exibidas: as de gerações anteriores + as do job atual.
  const allTracks = previousTracks.length ? [...previousTracks, ...tracks] : tracks;
  const saving = view?.saving ?? false;
  const saved = view?.saved ?? false;
  const saveError = view?.saveError ?? null;
  const error = localError ?? view?.error ?? null;

  // Vídeo (MP4) gerado a partir da música pronta.
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detecta convidado e, se logado, carrega os créditos do profile.
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      setIsGuest(!user);
      if (user) {
        const { data } = await sb
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .maybeSingle();
        if (data) setCredits(data.credits as number);
      }
    });
  }, []);

  const cost = MUSIC_CREDIT_COST;
  const versions = quantity && quantity > 0 ? quantity : 2;
  const saldoView = credits ?? saldo;

  // Nome exibido da música: prefere o snapshot do job (correto ao voltar da
  // sidebar, quando o form já pode ter sido limpo).
  const composedTitle = view?.title || title;

  // "Suas escolhas": todas as respostas ficam sempre visíveis (sem expandir/recolher).
  // Se o form foi limpo ao navegar mas há job, usa as respostas do snapshot.
  const liveAnswerEntries = Object.entries(selectedAnswers);
  const liveAnswersEmpty = liveAnswerEntries.every(([, v]) => {
    const s = String(Array.isArray(v) ? v.join("") : v).replace(/—/g, "").trim();
    return s.length === 0;
  });
  const answerEntries =
    view && liveAnswersEmpty ? Object.entries(view.selectedAnswers) : liveAnswerEntries;

  // Estilo enviado quando o usuário pede "Gerar com outros estilos" sem escolher
  // estilos específicos (variação livre do estilo atual).
  const variationStyle = `${style || "Pop brasileiro"} — versão alternativa, explore um ritmo, andamento e arranjo diferentes`;

  // Monta o estilo a partir dos estilos escolhidos na caixa. Com vocal, a LETRA
  // é adaptada ao novo gênero/idioma (ver confirmCompose), então o estilo só
  // descreve o gênero — não pede tradução nem "manter a mesma letra".
  const chosenStylesText = [...chosenStyles, customStyle.trim()].filter(Boolean).join(", ");
  const stylesOverride = chosenStylesText
    ? `${chosenStylesText} — explore um ritmo, andamento e arranjo de ${chosenStylesText}`
    : variationStyle;

  function toggleStyle(g: string) {
    setChosenStyles((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  const lyricsStats = useMemo(
    () => ({
      words: editedLyrics.split(/\s+/).filter(Boolean).length,
      choruses: (editedLyrics.match(/\[Chorus\]|\[Refrão\]/gi) || []).length,
    }),
    [editedLyrics]
  );

  // "Gerando" olha o job VIVO: o espelho pode existir com o job já descartado.
  const generating = gen?.generating && !!job ? true : status === "SUBMITTING";
  const started = !!view || !!localError;

  // Quando o job termina de salvar, avisa o wizard (limpa o form na próxima).
  const notifiedJobRef = useRef<string | null>(null);
  useEffect(() => {
    if (saved && view && notifiedJobRef.current !== view.id) {
      notifiedJobRef.current = view.id;
      onGenerated?.();
    }
  }, [saved, view, onGenerated]);

  // Envia a letra (do box acima) para a Suno via provider — a geração segue em
  // segundo plano (continua ao navegar; aparece no card da sidebar direita).
  // styleOverride: usado por "Gerar com outros estilos" para variar o ritmo/estilo.
  const handleCompose = useCallback(async (styleOverride?: string, lyricsOverride?: string) => {
    if (generating || !gen) return;
    setLocalError(null);

    const lyricsToUse = lyricsOverride ?? editedLyrics;
    if (!instrumental && !lyricsToUse.trim()) {
      setLocalError("Escreva a letra da música no box acima antes de compor.");
      return;
    }

    // "Gerar com outros estilos": mantém as versões já geradas na tela e cria
    // MAIS 2 versões com o novo gênero (a composição normal usa a quantidade
    // escolhida no formulário).
    if (styleOverride) {
      setPreviousTracks((prev) => [...prev, ...tracks.filter((t) => t.audioUrl)]);
    } else {
      setPreviousTracks([]); // composição do zero: recomeça a lista de versões
    }

    const res = await gen.start({
      title,
      style,
      negativeTags,
      kind: kind ?? (instrumental ? "instrumental" : "music"),
      instrumental,
      quantity: styleOverride ? 2 : versions,
      autoTitle: !!autoTitle,
      editedLyrics: lyricsToUse,
      answers: answers ?? null,
      selectedAnswers,
      returnHref: pathname,
      styleOverride,
    });
    if (!res.ok && res.error) setLocalError(res.error);
  }, [
    generating,
    gen,
    instrumental,
    editedLyrics,
    title,
    style,
    negativeTags,
    kind,
    versions,
    autoTitle,
    answers,
    selectedAnswers,
    pathname,
    tracks,
  ]);

  // Confirmação do modal de créditos. Quando é "Gerar com outros estilos" com
  // vocal, ADAPTA a letra ao novo gênero/idioma antes de compor (a nova versão
  // sai com a letra no estilo/idioma escolhido, mantendo a história).
  const confirmCompose = useCallback(async () => {
    setConfirmOpen(false);
    const override = pendingStyleOverride;
    const adapt = pendingAdapt;
    setPendingAdapt(null);

    const precisaAdaptar =
      !!override && !!adapt && !instrumental && !!editedLyrics.trim() && (!!adapt.genre || !!adapt.language);

    if (precisaAdaptar) {
      setAdapting(true);
      try {
        const res = await fetch("/api/criar-musica/adaptar-letra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lyrics: editedLyrics, genre: adapt!.genre, language: adapt!.language }),
        });
        const data = await res.json();
        setAdapting(false);
        if (res.ok && data.lyrics) {
          setEditedLyrics(data.lyrics);
          await handleCompose(override, data.lyrics as string);
          return;
        }
      } catch {
        setAdapting(false);
      }
      // Falha ao adaptar: compõe com a letra atual mesmo assim (não trava o fluxo).
      await handleCompose(override);
      return;
    }

    await handleCompose(override);
  }, [pendingStyleOverride, pendingAdapt, instrumental, editedLyrics, handleCompose]);

  const primaryImage = tracks.find((t) => t.audioUrl)?.imageUrl ?? null;
  const videoGenerating = !!videoStatus && !videoUrl && !videoError;

  useEffect(
    () => () => {
      if (videoPollRef.current) clearInterval(videoPollRef.current);
    },
    [],
  );

  // Gera o vídeo (MP4) da música pronta na Suno (usa o taskId + audioId).
  async function generateVideo() {
    const primary = tracks.find((t) => t.audioUrl);
    if (!primary?.id || !primary.taskId) {
      setVideoError("Faltam os dados da Suno para gerar o vídeo.");
      return;
    }
    setVideoError(null);
    setVideoUrl(null);
    setVideoStatus("PENDING");

    let vt: string | null = null;
    try {
      const res = await fetch("/api/criar-musica/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: primary.taskId, audioId: primary.id }),
      });
      const d = await res.json();
      if (!res.ok || !d.taskId) {
        setVideoError(d.error ?? "Não foi possível iniciar o vídeo.");
        setVideoStatus(null);
        return;
      }
      vt = d.taskId;
    } catch {
      setVideoError("Falha de conexão ao gerar o vídeo.");
      setVideoStatus(null);
      return;
    }

    if (videoPollRef.current) clearInterval(videoPollRef.current);
    const check = async () => {
      try {
        const r = await fetch(`/api/criar-musica/video/status?taskId=${encodeURIComponent(vt!)}`);
        const d = await r.json();
        if (!r.ok) {
          setVideoError(d.error ?? "Erro ao consultar o vídeo.");
          setVideoStatus(null);
          if (videoPollRef.current) clearInterval(videoPollRef.current);
          return;
        }
        setVideoStatus(d.status);
        if (d.videoUrl) {
          setVideoUrl(d.videoUrl);
          if (videoPollRef.current) clearInterval(videoPollRef.current);
        } else if (VIDEO_FAILED.has(d.status)) {
          setVideoError("A geração do vídeo falhou na Suno.");
          if (videoPollRef.current) clearInterval(videoPollRef.current);
        }
      } catch {
        // rede transitória
      }
    };
    check();
    videoPollRef.current = setInterval(check, 5000);
  }

  // Fecha o modal de confirmação com a tecla Esc.
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  // Fecha a caixa de "outros estilos" com a tecla Esc.
  useEffect(() => {
    if (!stylesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStylesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stylesOpen]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>

      {/* Modal de confirmação de créditos */}
      {confirmOpen && (
        <div
          onClick={() => setConfirmOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar geração da música"
            onClick={(e) => e.stopPropagation()}
            style={{
            background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
            border: "1px solid rgba(168,85,247,0.4)",
            borderRadius: 16, padding: "28px 32px", maxWidth: 400, width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 8 }}>
              Confirmar geração
            </div>
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 20 }}>
              Você vai usar <b style={{ color: "var(--cyan-1)" }}>{cost} créditos</b> para compor esta música.
              <br />Saldo atual: <b style={{ color: "var(--text-1)" }}>{saldoView} créditos</b>.
              {pendingStyleOverride && (
                <>
                  <br />
                  <span style={{ color: "var(--cyan-1)" }}>
                    Serão geradas <b>mais 2 versões</b> no novo estilo — as versões já
                    criadas continuam na tela.
                  </span>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "var(--bg-card)", border: "1px solid var(--border-soft)",
                  color: "var(--text-1)", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmCompose}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  color: "#fff", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
                }}
              >
                Confirmar e Compor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caixa "Gerar com outros estilos" — escolha de estilos (mesma letra) */}
      {stylesOpen && (
        <div
          onClick={() => setStylesOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Escolha os estilos para gerar com a mesma letra"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
              border: "1px solid rgba(0,214,247,0.4)",
              borderRadius: 16, padding: "24px 28px", maxWidth: 520, width: "100%",
              maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 6 }}>
              {ui.otherModalTitle}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 16 }}>
              {ui.otherModalDesc}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {GENRES.map((g) => {
                const on = chosenStyles.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleStyle(g)}
                    aria-pressed={on}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: on ? "linear-gradient(135deg, #a855f7, #ec4899)" : "var(--bg-card)",
                      color: on ? "#fff" : "var(--text-1)",
                      border: on ? "1px solid transparent" : "1px solid var(--border-soft)",
                      boxShadow: on ? "0 4px 16px rgba(168,85,247,0.35)" : "none",
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
              Outro estilo (opcional)
            </label>
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Ex.: Bossa nova acústica, voz feminina suave"
              maxLength={120}
              style={{
                width: "100%",
                background: "rgba(10,10,46,0.6)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "var(--text-1)",
                fontSize: 13,
                marginBottom: 20,
              }}
            />

            {/* Idioma da nova versão — só com vocal (instrumental não tem letra). */}
            {!instrumental && (
              <>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Idioma da versão (opcional)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {LANGUAGES.map((l) => {
                    const on = chosenLang === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setChosenLang(on ? "" : l.code)}
                        aria-pressed={on}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 100,
                          fontSize: 12,
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: on ? "linear-gradient(135deg, #00D6F7, #a855f7)" : "var(--bg-card)",
                          color: on ? "#fff" : "var(--text-1)",
                          border: on ? "1px solid transparent" : "1px solid var(--border-soft)",
                          boxShadow: on ? "0 4px 16px rgba(0,214,247,0.35)" : "none",
                        }}
                      >
                        <span>{l.flag}</span>
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setStylesOpen(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "var(--bg-card)", border: "1px solid var(--border-soft)",
                  color: "var(--text-1)", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setPendingStyleOverride(stylesOverride);
                  // Gênero/idioma escolhidos → adaptam a letra e atualizam "Suas escolhas".
                  setPendingAdapt({ genre: chosenStylesText || undefined, language: chosenLang || undefined });
                  if (chosenStylesText) onGenreChange?.(chosenStylesText);
                  if (chosenLang) onLanguageChange?.(chosenLang);
                  setStylesOpen(false);
                  setConfirmOpen(true);
                }}
                disabled={chosenStyles.length === 0 && !customStyle.trim() && !chosenLang}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  color: "#fff", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13,
                  cursor: chosenStyles.length === 0 && !customStyle.trim() && !chosenLang ? "not-allowed" : "pointer",
                  opacity: chosenStyles.length === 0 && !customStyle.trim() && !chosenLang ? 0.5 : 1,
                  boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
                }}
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de 3 colunas: Letra (esq) | Música+Vídeo (meio) | Escolhas (dir).
          Instrumental não tem letra: usa grid de 2 colunas (Escolhas | Música+Vídeo). */}
      <div className={instrumental ? "rev-grid2" : "rev-grid3"}>
        {/* Card 1: Sua Letra (coluna esquerda, trilho de altura cheia) — oculto no Instrumental */}
        {!instrumental && (
        <div
          className="rev-lyrics"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              📝
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "var(--white)",
                }}
              >
                {ui.lyricsLabel}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "'Sora', sans-serif" }}>
                {generating ? "Gerando — letra bloqueada" : "Clique para editar"}
              </div>
            </div>

            {onRegenerateLyrics && (
              <button
                onClick={onRegenerateLyrics}
                disabled={lyricsLoading || generating}
                title="Gerar a letra novamente a partir das suas respostas"
                style={{
                  marginLeft: "auto",
                  flexShrink: 0,
                  padding: "6px 10px",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "var(--bg-card)",
                  color: "var(--cyan-1)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 8,
                  cursor: lyricsLoading || generating ? "not-allowed" : "pointer",
                  opacity: lyricsLoading || generating ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {lyricsLoading ? "↻ gerando…" : "↻ gerar de novo"}
              </button>
            )}
          </div>

          {/* Textarea */}
          <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={editedLyrics}
              onChange={(e) =>
                setEditedLyrics(maxLyricsLength ? e.target.value.slice(0, maxLyricsLength) : e.target.value)
              }
              disabled={generating || lyricsLoading || adapting}
              maxLength={maxLyricsLength}
              placeholder={
                lyricsLoading
                  ? "Gerando a letra a partir das suas respostas…"
                  : "[Verso]\nEscreva ou edite a letra da sua música…"
              }
              style={{
                width: "100%",
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
                lineHeight: 1.6,
                flex: 1,
                minHeight: 300,
                maxHeight: 1000,
                background: "rgba(10, 10, 46, 0.6)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--text-1)",
                resize: "vertical",
                cursor: generating || lyricsLoading || adapting ? "not-allowed" : "text",
                opacity: generating || lyricsLoading || adapting ? 0.6 : 1,
              }}
            />
            {maxLyricsLength && (
              <div style={{ marginTop: 6, textAlign: "right", fontSize: 11, color: editedLyrics.length >= maxLyricsLength ? "var(--orange)" : "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                {editedLyrics.length}/{maxLyricsLength}
              </div>
            )}

            {lyricsError && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(251, 146, 60, 0.08)",
                  border: "1px solid rgba(251, 146, 60, 0.25)",
                  color: "var(--orange)",
                  fontSize: 12,
                }}
              >
                ⚠️ {lyricsError} Você pode escrever a letra manualmente acima.
              </div>
            )}


          </div>
        </div>
        )}

        {/* Card 2: Suas Escolhas (coluna direita, trilho alto — ocupa toda a altura) */}
        <div
          className="rev-answers-rail"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Suas escolhas
            <button
              type="button"
              onClick={onEdit}
              style={{
                marginLeft: "auto",
                color: "var(--cyan-1)",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                textTransform: "none",
                letterSpacing: 0,
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              editar
            </button>
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {answerEntries.map(([key, value]) => {
              const full = String(Array.isArray(value) ? value.join(", ") : value);
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "5px 0",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <span style={{ color: "var(--text-3)", fontSize: 12, flexShrink: 0 }}>{key}</span>
                  <span
                    style={{
                      color: "var(--white)",
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: "right",
                      wordBreak: "break-word",
                    }}
                  >
                    {full}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sua Música (coluna do meio, topo) */}
        <div
          className="rev-col2"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px",
          }}
        >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {ui.musicEmoji} {ui.musicLabel}
        </div>

        {/* Erro */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: "rgba(251, 146, 60, 0.08)",
              border: "1px solid rgba(251, 146, 60, 0.25)",
              color: "var(--orange)",
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Adaptando a letra ao novo gênero/idioma (antes de compor a variação) */}
        {adapting && (
          <div style={{ padding: 16, borderRadius: 14, background: "var(--bg-card-2)", border: "1px solid var(--border-soft)", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 26, height: 26, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)" }}>Adaptando a letra ao novo estilo…</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Reescrevendo no gênero/idioma escolhido, mantendo a história.</div>
            </div>
          </div>
        )}

        {/* TELA DE LOADING enquanto a música é processada */}
        {generating && (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "var(--bg-card-2)",
              border: "1px solid var(--border-soft)",
              marginBottom: tracks.length ? 16 : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  border: "3px solid var(--cyan-1)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)" }}>
                  Compondo sua música…
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {STATUS_LABEL[status ?? "PENDING"] ?? "Processando…"} · costuma levar 2-3 minutos
                </div>
              </div>
            </div>

            {/* barra de progresso por etapa */}
            <div style={{ height: 6, background: "var(--bg-card)", borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 100,
                  background: "var(--grad-brand)",
                  width: `${((stepIndex(status) + 1) / STEPS.length) * 100}%`,
                  transition: "width .4s ease",
                }}
              />
            </div>

            {/* etapas */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {STEPS.map((s, i) => {
                const cur = stepIndex(status);
                const state = i < cur ? "done" : i === cur ? "active" : "todo";
                const color =
                  state === "todo" ? "var(--text-3)" : state === "done" ? "var(--green)" : "var(--cyan-1)";
                return (
                  <div
                    key={s.status}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color,
                    }}
                  >
                    <span>{state === "done" ? "✓" : state === "active" ? "●" : "○"}</span>
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONCLUÍDA + status de gravação na biblioteca */}
        {status === "SUCCESS" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              fontSize: 13,
              color: "var(--green)",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ✓ Concluída!
            {saving && <span style={{ color: "var(--text-3)", fontWeight: 400 }}>· salvando na biblioteca…</span>}
            {saved && (
              <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                · salva em{" "}
                <Link href="/criacoes" style={{ color: "var(--cyan-1)", fontWeight: 600 }}>
                  Minhas Criações
                </Link>
              </span>
            )}
          </div>
        )}

        {saveError && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: "rgba(251, 146, 60, 0.08)",
              border: "1px solid rgba(251, 146, 60, 0.25)",
              color: "var(--orange)",
              fontSize: 13,
            }}
          >
            ⚠️ {saveError}
          </div>
        )}

        {/* Versões geradas (anteriores + as novas do estilo escolhido) */}
        {allTracks.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allTracks.map((t, i) =>
              t.audioUrl ? (
                <div key={t.id ?? i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <AudioPlayer
                    audioUrl={t.audioUrl}
                    title={`${t.title || composedTitle || `Versão ${i + 1}`} · v${i + 1}`}
                    subtitle={style || "Star Sonic"}
                    imageUrl={t.imageUrl}
                    primary={i === 0}
                    downloadHref={downloadHref(
                      t.audioUrl,
                      t.title || composedTitle || `Versão ${i + 1}`,
                    )}
                    lockDownload={isGuest}
                    onLockedAction={() => router.push("/cadastro")}
                  />
                  {/* Publicar + Compartilhar link desta versão. Convidado não
                      publica (não tem conta) — envia para o cadastro. */}
                  {isGuest ? (
                    <button
                      type="button"
                      onClick={() => router.push("/cadastro")}
                      style={{ alignSelf: "flex-start", fontSize: 12, color: "var(--cyan-1)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                    >
                      Crie uma conta para publicar e compartilhar
                    </button>
                  ) : (
                    <TrackShareActions creationId={t.creationId} title={t.savedTitle} />
                  )}
                </div>
              ) : (
                <div
                  key={t.id ?? i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: 14,
                    borderRadius: 14,
                    background: "var(--bg-card-2)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: "var(--grad-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🎵
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)" }}>
                      {t.title || `Versão ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                      gerando áudio…
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          !generating &&
          !error && (
            <div
              style={{
                background: "rgba(10, 10, 46, 0.4)",
                border: "1px dashed var(--border-soft)",
                borderRadius: 10,
                padding: "20px",
                textAlign: "center",
                color: "var(--text-3)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
              }}
            >
              {started ? "[Aguardando o áudio…]" : ui.emptyHint}
            </div>
          )
        )}
        </div>

        {/* Seu Video (coluna do meio, abaixo da música) */}
        <div
          className="rev-col2"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>
            🎬 Seu Video
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {videoUrl ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={videoUrl}
                  controls
                  poster={primaryImage || undefined}
                  style={{ width: "100%", flex: 1, minHeight: 220, borderRadius: 8, background: "#000", border: "1px solid var(--border)", objectFit: "cover" }}
                />
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                  ⬇ Baixar vídeo (MP4)
                </a>
              </>
            ) : status === "SUCCESS" && tracks.some((t) => t.audioUrl) ? (
              <button
                onClick={generateVideo}
                disabled={videoGenerating}
                style={{ width: "100%", flex: 1, minHeight: 220, background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(249,115,22,0.12))", border: "1px dashed var(--border-soft)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, cursor: videoGenerating ? "default" : "pointer", color: "var(--text-2)" }}
              >
                {videoGenerating ? (
                  <>
                    <span style={{ width: 30, height: 30, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} />
                    <span style={{ fontSize: 12 }}>{VIDEO_STATUS_LABEL[videoStatus ?? "PENDING"] ?? "Renderizando…"}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>leva 1-3 min</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 36 }}>🎥</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Clique para gerar vídeo (MP4)</span>
                  </>
                )}
              </button>
            ) : (
              <div style={{ width: "100%", flex: 1, minHeight: 220, background: "rgba(10, 10, 46, 0.4)", border: "1px dashed var(--border-soft)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 32, opacity: 0.4 }}>📺</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>{generating ? "Gerando música…" : "Gere a música primeiro"}</div>
              </div>
            )}

            {videoError && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 12 }}>
                ⚠️ {videoError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "var(--grad-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldoView} créditos</b>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'Sora', sans-serif" }}>
            Esta ação utilizará <b style={{ color: "var(--cyan-1)" }}>{cost} créditos</b> · {ui.footerExtra} · {versions} versões
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onNewSong && status === "SUCCESS" && (
            <button
              onClick={() => {
                gen?.dismiss();
                setJobMirror(null); // limpa o resultado desta tela
                setPreviousTracks([]);
                onNewSong?.();
              }}
              title="Limpa tudo e volta ao início do formulário de criação"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                color: "#fff",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
              }}
            >
              ＋ Criar nova música
            </button>
          )}
          <button
            onClick={onEdit}
            disabled={generating || adapting}
            style={{
              background: "var(--bg-card)",
              color: "var(--text-1)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.6 : 1,
            }}
          >
            ← Editar respostas
          </button>
          <button
            onClick={() => {
              if (generating || lyricsLoading || adapting) return;
              setStylesOpen(true);
            }}
            disabled={generating || lyricsLoading || adapting}
            title="Escolha outros estilos e gere novas versões com a mesma letra"
            style={{
              background: "var(--bg-card)",
              color: "var(--cyan-1)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(0, 214, 247, 0.4)",
              cursor: generating || lyricsLoading || adapting ? "not-allowed" : "pointer",
              opacity: generating || lyricsLoading || adapting ? 0.6 : 1,
            }}
          >
            ↻ {ui.otherActionLabel}
          </button>
          <button
            onClick={() => {
              if (generating || lyricsLoading || adapting) return;
              setPendingStyleOverride(undefined);
              setConfirmOpen(true);
            }}
            disabled={generating || lyricsLoading || adapting}
            style={{
              background: "#00D6F7",
              color: "#0a0a2e",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              cursor: generating || lyricsLoading || adapting ? "not-allowed" : "pointer",
              letterSpacing: "0.3px",
              opacity: generating || lyricsLoading || adapting ? 0.7 : 1,
              boxShadow: generating || lyricsLoading || adapting ? "none" : "0 4px 20px rgba(0, 214, 247, 0.4)",
            }}
          >
            {adapting
              ? "ADAPTANDO LETRA…"
              : generating
                ? "GERANDO…"
                : lyricsLoading
                  ? "AGUARDE A LETRA…"
                  : `COMPOR ${kind === "jingle" ? "JINGLE" : instrumental ? "INSTRUMENTAL" : "MÚSICA"} · ${cost} CRÉDITOS`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Ações por VERSÃO gerada: Publicar (torna a criação pública → aparece no
// Explorar) e Compartilhar link (copia /song/<slug>). Só habilita depois que a
// versão foi salva na biblioteca (creationId presente).
function TrackShareActions({ creationId, title }: { creationId?: string; title?: string }) {
  const [isPublic, setIsPublic] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!creationId) {
    return (
      <div style={{ fontSize: 11, color: "var(--text-3)", padding: "2px 4px" }}>
        Salvando na biblioteca… as opções de publicar e compartilhar aparecem aqui.
      </div>
    );
  }

  async function togglePublicar() {
    if (publishing) return;
    const next = !isPublic;
    setPublishing(true);
    setMsg(null);
    const { error } = await createClient().from("creations").update({ is_public: next }).eq("id", creationId);
    setPublishing(false);
    if (error) {
      setMsg("Erro ao publicar.");
      return;
    }
    setIsPublic(next);
    setMsg(next ? "Publicada no catálogo ✓" : "Agora está privada ✓");
  }

  async function compartilhar() {
    const url = `${window.location.origin}/song/${slugify(title || "musica")}`;
    // Link público: se ainda estiver privada, publica antes (senão o link abre 404).
    if (!isPublic) {
      setPublishing(true);
      const { error } = await createClient().from("creations").update({ is_public: true }).eq("id", creationId);
      setPublishing(false);
      if (!error) setIsPublic(true);
    }
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copiado ✓");
    } catch {
      setMsg(url);
    }
  }

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: publishing ? "default" : "pointer",
    background: "var(--bg-card)", border: "1px solid var(--border-soft)", color: "var(--text-1)",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "2px 4px 6px" }}>
      <button
        type="button"
        onClick={togglePublicar}
        disabled={publishing}
        style={{ ...btn, color: isPublic ? "var(--text-2)" : "var(--green)", borderColor: isPublic ? "var(--border-soft)" : "rgba(34,197,94,0.4)" }}
      >
        <Icon name="globe" size={13} /> {publishing ? "Salvando…" : isPublic ? "Tornar privada" : "Publicar"}
      </button>
      <button type="button" onClick={compartilhar} disabled={publishing} style={{ ...btn, color: "var(--cyan-1)", borderColor: "rgba(0,214,247,0.4)" }}>
        <Icon name="send" size={13} /> Compartilhar link
      </button>
      {msg && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{msg}</span>}
    </div>
  );
}

export const ReviewPanel = memo(ReviewPanelComponent);
