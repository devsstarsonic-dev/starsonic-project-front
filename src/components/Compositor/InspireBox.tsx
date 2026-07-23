"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { Icon } from "@/components/Icon";
import { LANGUAGES } from "@/lib/data/languages";
import { extractSpotifyTrackId, type SpotifyAudioFeatures } from "@/lib/compositor/spotify";

function langLabel(code: string): string {
  const l = LANGUAGES.find((x) => x.code === code);
  return l ? `${l.flag} ${l.label}` : code;
}

function structureLabel(value: string): string {
  if (value === "estendida") return "Estendida (+5 min)";
  if (value === "completa") return "Completa (3–5 min)";
  return "Padrão (2–3 min)";
}

// "Inspire-se": informe uma música de referência (link + nome), a IA IDENTIFICA
// a música e extrai todo o DNA musical (gênero, voz, tom, emoções, instrumentos,
// referências, estrutura, idioma, público). Você decide "Manter similar" (gera
// direto no /revisar, com letra diferente) ou "Personalizar" (abre o formulário
// já pré-preenchido com tudo).

// Candidato do MusicBrainz para o autocomplete (resolve QUAL música antes do submit).
type Candidate = {
  id: string;
  title: string;
  artist: string;
  year: string;
  isrc: string;
  cover: string;
  score: number;
};

type Detected = {
  recognized: boolean;
  title: string;
  artist: string;
  cover?: string;
  genre: string;
  voice: string;
  voiceTone: string[];
  emotions: string[];
  instruments: string[];
  bpm: number | null;
  references: string;
  vibe: string;
  theme: string;
  structure: string;
  language: string;
  audience: string;
  // Métricas reais do Spotify (só quando o input é um link de faixa).
  audio?: SpotifyAudioFeatures | null;
  // Motivo de não ter vindo métrica num link de faixa: "quota" | "unavailable" | "no-key".
  audioError?: string | null;
};

export function InspireBox({ onPersonalize }: { onPersonalize: () => void }) {
  const router = useRouter();
  const { updateFormData } = useComposition();

  // Campo único: o usuário informa um LINK (Spotify/YouTube) OU o NOME da música;
  // detectamos qual é e buscamos os candidatos no MusicBrainz.
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [choice, setChoice] = useState<"manter" | "personalizar" | null>(null);
  // trackId do Spotify preservado do link colado — sobrevive à seleção de um
  // candidato no autocomplete (que reescreve o campo e apagaria o link).
  const [spotifyId, setSpotifyId] = useState<string | null>(null);

  // Autocomplete MusicBrainz: candidatos + a gravação escolhida pelo usuário.
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  // Evita re-disparar a busca logo após escolher um candidato (o setQuery reabriria).
  const skipSearch = useRef(false);
  const searchAbort = useRef<AbortController | null>(null);

  // É link? (Spotify/YouTube ou qualquer URL) → resolvemos via oEmbed no servidor.
  const isLink = (s: string) =>
    /^https?:\/\//i.test(s) || s.startsWith("spotify:") ||
    s.includes("spotify.com") || s.includes("youtu");

  // Autocomplete no MusicBrainz — SÓ para busca por NOME digitado.
  async function searchMB(q: string) {
    searchAbort.current?.abort();
    const ctrl = new AbortController();
    searchAbort.current = ctrl;
    setSearching(true);
    try {
      const res = await fetch(`/api/musicbrainz/search?q=${encodeURIComponent(q)}`, {
        signal: ctrl.signal,
      });
      const data = await res.json();
      const list: Candidate[] = Array.isArray(data?.candidates) ? data.candidates : [];
      setCandidates(list);
      setShowDrop(list.length > 0);
    } catch {
      // Abortado ou falha de rede: degrada silencioso (sem dropdown).
    } finally {
      if (searchAbort.current === ctrl) setSearching(false);
    }
  }

  // Debounce (400ms). LINK não abre autocomplete: basta extrair o trackId e usar
  // a faixa direto na RapidAPI. A escolha da música só existe ao digitar o NOME.
  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const s = query.trim();
    // Fixa o trackId do Spotify assim que aparece; só limpa quando o texto vira
    // um nome (não-link) — assim selecionar candidato não apaga o id.
    const tid = extractSpotifyTrackId(s);
    if (tid) setSpotifyId(tid);
    else if (!isLink(s)) setSpotifyId(null);

    if (isLink(s)) {
      // Link colado: nada de busca/dropdown — só o trackId.
      searchAbort.current?.abort();
      setCandidates([]);
      setShowDrop(false);
      setSelected(null);
      setSearching(false);
      return;
    }

    if (s.length < 3) {
      setCandidates([]);
      setShowDrop(false);
      return;
    }
    const t = setTimeout(() => searchMB(s), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Ao selecionar um candidato: preenche o campo e guarda a gravação escolhida.
  function selectCandidate(c: Candidate) {
    skipSearch.current = true;
    setSelected(c);
    setQuery(c.artist ? `${c.title} — ${c.artist}` : c.title);
    setCandidates([]);
    setShowDrop(false);
  }

  async function concluir() {
    if (loading) return;
    const q = query.trim();
    if (!q) {
      setError("Informe o link ou o nome da música.");
      return;
    }
    setError(null);
    setLoading(true);
    setDetected(null);
    setChoice(null);
    try {
      const asLink = isLink(q);
      // Link de faixa do Spotify: manda o trackId pra puxar as métricas reais
      // na RapidAPI. Usa o id fixado; senão extrai do texto.
      const spotifyTrackId = spotifyId ?? extractSpotifyTrackId(q);

      // Link colado: identificação vem 100% da RapidAPI (trackId → /v1/tracks +
      // /v1/audio-features no servidor). Sem MusicBrainz aqui.
      // Busca por NOME: o candidato escolhido no autocomplete trava a música.
      const mbTitle = selected?.title;
      const mbArtist = selected?.artist;

      const res = await fetch("/api/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: asLink ? q : "",
          name: mbTitle
            ? `${mbTitle}${mbArtist ? ` — ${mbArtist}` : ""}`.trim()
            : asLink
              ? ""
              : q,
          mbTitle,
          mbArtist,
          year: selected?.year,
          isrc: selected?.isrc,
          spotifyTrackId: spotifyTrackId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Não foi possível analisar a música.");
      setDetected(data as Detected);
      // Já preenche o formulário com TUDO que veio da música (tema, gênero, voz,
      // tom, emoções, instrumentos, BPM, estrutura, idioma, público e métricas
      // reais da RapidAPI) — sem esperar o "Finalizar".
      aplicarDetectado(data as Detected);
      setChoice("manter"); // padrão sugerido
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao analisar a música.");
    } finally {
      setLoading(false);
    }
  }

  // Aplica TODO o DNA detectado ao formData compartilhado do wizard, para que a
  // música nova saia fiel ao estilo do original (letra diferente).
  function aplicarDetectado(d: Detected) {
    updateFormData({
      genre: d.genre,
      emotions: d.emotions,
      voiceStyle: d.voice,
      voiceTone: d.voiceTone,
      instruments: d.instruments,
      bpm: d.bpm ?? undefined,
      references: d.references,
      theme: d.theme,
      songStructure: d.structure,
      audience: d.audience,
      language: d.language || "pt-BR",
      // Métricas reais do Spotify → tags de energia/humor/tom no estilo da Suno.
      spotifyFeatures: d.audio ?? undefined,
      musicName: "", // deixa a STARSONIC criar um novo nome
      quantity: 2,
    });
  }

  function finalizar() {
    if (!detected || !choice) return;
    aplicarDetectado(detected);
    if (choice === "manter") {
      // Gera direto: vai para o /revisar com tudo pronto (letra nova, estilo similar).
      router.push("/compositor/revisar");
    } else {
      // Abre o formulário personalizado já pré-preenchido.
      onPersonalize();
    }
  }

  const chip = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 14,
    border: active ? "1.5px solid rgba(168,85,247,0.9)" : "1px solid rgba(10,10,46,0.14)",
    background: active
      ? "linear-gradient(135deg, #2a1758 0%, #17123f 100%)"
      : "rgba(255,255,255,0.92)",
    color: active ? "#ffffff" : "#0a0a2e",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "center",
    transition: "all .18s",
    boxShadow: active ? "0 10px 26px rgba(124,58,237,0.34)" : "0 1px 3px rgba(0,0,0,0.08)",
  });

  const DETECTED_CARDS = [
    { label: "Gênero", key: "genre" as const, icon: "music" as const, accent: "#a855f7" },
    { label: "Voz", key: "voice" as const, icon: "mic" as const, accent: "#ec4899" },
    { label: "Vibe", key: "vibe" as const, icon: "bolt" as const, accent: "#fb923c" },
  ];

  const DETAIL_ROWS = detected
    ? [
        { label: "Tom da voz", icon: "mic" as const, value: detected.voiceTone.join(", ") },
        { label: "Emoções", icon: "bolt" as const, value: detected.emotions.join(", ") },
        { label: "Instrumentos", icon: "music" as const, value: detected.instruments.join(", ") },
        { label: "Andamento", icon: "bolt" as const, value: detected.bpm ? `${detected.bpm} BPM` : "" },
        { label: "Referências", icon: "sparkle" as const, value: detected.references },
        { label: "Tema", icon: "pencil" as const, value: detected.theme },
        { label: "Público", icon: "users" as const, value: detected.audience },
        { label: "Estrutura", icon: "target" as const, value: structureLabel(detected.structure) },
        { label: "Idioma", icon: "globe" as const, value: langLabel(detected.language) },
      ]
    : [];

  // Métricas reais da faixa (só quando veio de um link do Spotify).
  const audio = detected?.audio ?? null;
  const mmss = (ms: number) => {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  // Barras (0–1) — exatamente os campos que a RapidAPI (Spotify audio-features)
  // devolve como proporção.
  const AUDIO_BARS = audio
    ? [
        { label: "Energia", value: audio.energy, accent: "#fb923c" },
        { label: "Dançabilidade", value: audio.danceability, accent: "#ec4899" },
        { label: "Humor", value: audio.valence, accent: "#a855f7" },
        { label: "Acústico", value: audio.acousticness, accent: "#22d3ee" },
        { label: "Instrumental", value: audio.instrumentalness, accent: "#38bdf8" },
        { label: "Ao vivo", value: audio.liveness, accent: "#34d399" },
        { label: "Fala", value: audio.speechiness, accent: "#f472b6" },
      ]
    : [];
  // Valores numéricos crus da RapidAPI.
  const AUDIO_STATS = audio
    ? [
        { label: "BPM real", value: `${Math.round(audio.tempo)}` },
        { label: "Tom", value: audio.keyLabel || "—" },
        { label: "Duração", value: mmss(audio.durationMs) },
        { label: "Compasso", value: audio.timeSignature ? `${audio.timeSignature}/4` : "—" },
        { label: "Volume", value: `${audio.loudness.toFixed(1)} dB` },
      ]
    : [];

  return (
    <div className="e1-panel">
      <style>{`
        .insp-check { width:18px; height:18px; border-radius:50%; border:2px solid;
          display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
        @keyframes insp-spin { to { transform: rotate(360deg); } }
        .insp-spin { width:16px; height:16px; border:2px solid rgba(255,255,255,0.5);
          border-top-color:#fff; border-radius:50%; display:inline-block; animation: insp-spin .8s linear infinite; }
        .insp-reveal { animation: insp-fade .35s ease both; }
        @keyframes insp-fade { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }

        .insp-drop { position:absolute; top:100%; left:0; right:0; margin-top:6px; z-index:120;
          background: linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98));
          border:1px solid rgba(168,85,247,0.45); border-radius:12px; overflow:hidden;
          box-shadow: 0 18px 44px rgba(10,10,46,0.55); backdrop-filter: blur(20px);
          animation: insp-fade .18s ease both; }
        .insp-drop-head { padding:8px 14px; font-size:10.5px; text-transform:uppercase;
          letter-spacing:0.1em; color: rgba(255,255,255,0.55); font-family:'JetBrains Mono', monospace;
          border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:8px; }
        .insp-drop-head .insp-spin { width:12px; height:12px; border-width:2px;
          border-color: rgba(255,255,255,0.25); border-top-color:#c084fc; }
        .insp-dots span { display:inline-block; width:4px; height:4px; margin-left:2px; border-radius:50%;
          background:#c084fc; animation: insp-blink 1s ease-in-out infinite; }
        .insp-dots span:nth-child(2) { animation-delay:.16s; }
        .insp-dots span:nth-child(3) { animation-delay:.32s; }
        @keyframes insp-blink { 0%,80%,100% { opacity:.25; transform:translateY(0);} 40% { opacity:1; transform:translateY(-2px);} }

        /* Skeleton shimmer enquanto busca a música */
        .insp-skel-row { display:flex; align-items:center; gap:10px; padding:11px 14px;
          border-bottom:1px solid rgba(255,255,255,0.06); }
        .insp-skel-row:last-child { border-bottom:0; }
        .insp-skel-cover { width:40px; height:40px; flex-shrink:0; border-radius:8px; }
        .insp-skel-lines { flex:1; min-width:0; display:flex; flex-direction:column; gap:7px; }
        .insp-skel-line { height:10px; border-radius:6px; }
        .insp-skel { position:relative; overflow:hidden; background: rgba(255,255,255,0.07); }
        .insp-skel::after { content:''; position:absolute; inset:0; transform:translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(192,132,252,0.28), transparent);
          animation: insp-shimmer 1.15s ease-in-out infinite; }
        @keyframes insp-shimmer { 100% { transform:translateX(100%); } }
        .insp-drop-item { display:flex; align-items:center; gap:10px; width:100%; text-align:left;
          padding:11px 14px; background:transparent; border:0; border-bottom:1px solid rgba(255,255,255,0.06);
          color:#fff; cursor:pointer; transition: background .14s; }
        .insp-drop-item:last-child { border-bottom:0; }
        .insp-drop-item:hover { background: rgba(168,85,247,0.18); }
        .insp-drop-cover { position:relative; width:40px; height:40px; flex-shrink:0; border-radius:8px;
          overflow:hidden; display:flex; align-items:center; justify-content:center;
          background: rgba(168,85,247,0.22); }
        .insp-drop-cover img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .insp-drop-cover.no-art img { display:none; }
        .insp-drop-star { color:#fbbf24; display:inline-flex; }
        .insp-hero-cover { position:relative; width:48px; height:48px; flex-shrink:0; border-radius:12px;
          overflow:hidden; display:flex; align-items:center; justify-content:center; color:#fff;
          background: linear-gradient(135deg, #a855f7, #ec4899); }
        .insp-hero-cover img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .insp-hero-cover.no-art img { display:none; }

        .insp-preview { display:flex; align-items:center; gap:14px; padding:12px 14px; margin-bottom:16px;
          border-radius:14px; background: linear-gradient(135deg, #2a1758 0%, #17123f 100%);
          border:1px solid rgba(168,85,247,0.45); box-shadow: 0 10px 26px rgba(124,58,237,0.28); }
        .insp-preview .insp-hero-cover { width:56px; height:56px; }
        .insp-preview-tag { font-size:10px; text-transform:uppercase; letter-spacing:0.12em;
          color: rgba(255,255,255,0.6); font-family:'JetBrains Mono', monospace; margin-bottom:3px; }
        .insp-preview-title { font-size:16px; font-weight:800; color:#fff; line-height:1.2;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .insp-preview-sub { font-size:12.5px; color: rgba(255,255,255,0.7); margin-top:2px;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .insp-preview-x { flex-shrink:0; width:28px; height:28px; border-radius:8px; border:0;
          background: rgba(255,255,255,0.12); color:#fff; font-size:18px; line-height:1; cursor:pointer;
          display:flex; align-items:center; justify-content:center; transition: background .14s; }
        .insp-preview-x:hover { background: rgba(255,255,255,0.24); }
        .insp-drop-txt { font-size:13.5px; line-height:1.35; color: rgba(255,255,255,0.82);
          overflow:hidden; text-overflow:ellipsis; }
        .insp-drop-txt strong { color:#fff; font-weight:800; }
        .insp-drop-isrc { color: rgba(255,255,255,0.5); font-family:'JetBrains Mono', monospace; font-size:12px; }
      `}</style>

      <h1 className="e1-title">
        Inspire-se em uma música
      </h1>
      <div style={{ color: "black", fontSize: 14, marginTop: -6, marginBottom: 22, textAlign: "center" }}>
        Informe uma música de referência e a IA detecta o estilo para criar uma música nova parecida.
      </div>

      {/* Box com o campo único (link ou nome) + Concluir */}
      <div
        style={{
          borderRadius: 18,
          display: "flex",
          flexDirection: "column",
        }}
      >
     

        <div style={{ position: "relative" }}>
      
          <input
            className="e1-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            onFocus={() => { if (candidates.length) setShowDrop(true); }}
            placeholder="Cole um link (Spotify/YouTube) ou digite o nome"
            maxLength={500}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowDrop(false);
              else if (e.key === "Enter" && !showDrop) concluir();
            }}
          />
          

          {searching && candidates.length === 0 && (
            <div className="insp-drop">
              <div className="insp-drop-head">
                <span className="insp-spin" />
                Procurando música
                <span className="insp-dots"><span /><span /><span /></span>
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="insp-skel-row" style={{ opacity: 1 - i * 0.22 }}>
                  <div className="insp-skel-cover insp-skel" />
                  <div className="insp-skel-lines">
                    <div className="insp-skel-line insp-skel" style={{ width: `${80 - i * 14}%` }} />
                    <div className="insp-skel-line insp-skel" style={{ width: `${52 - i * 10}%`, height: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDrop && candidates.length > 0 && (
            <div className="insp-drop">
              <div className="insp-drop-head">
                {searching ? <><span className="insp-spin" /> Atualizando<span className="insp-dots"><span /><span /><span /></span></> : `${candidates.length} resultado(s) — escolha a música`}
              </div>
              {candidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="insp-drop-item"
                  onMouseDown={(e) => { e.preventDefault(); selectCandidate(c); }}
                >
                  <span className="insp-drop-cover">
                    {c.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.cover}
                        alt=""
                        loading="lazy"
                        onError={(e) => { (e.currentTarget.parentElement as HTMLElement).classList.add("no-art"); }}
                      />
                    ) : null}
                    <span className="insp-drop-star"><Icon name="star" size={13} /></span>
                  </span>
                  <span className="insp-drop-txt">
                    <strong>{c.title}</strong>
                    {c.artist ? <> · {c.artist}</> : null}
                    {c.year ? <> · {c.year}</> : null}
                    {c.isrc ? <span className="insp-drop-isrc"> · ISRC: {c.isrc}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <span style={{ fontSize: 12, color: "black", marginTop: 20 }}>
            ✓ Nome    ✓ Link Spotify    ✓ Link YouTube
          </span>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            type="button"
            className="e1-next"
            onClick={concluir}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", alignSelf: "center", gap: 8, opacity: loading ? 0.85 : 1, cursor: loading ? "default" : "pointer" }}
          >
            {loading ? <><span className="insp-spin" /> Analisando…</> : <><Icon name="sparkle" size={16} /> Concluir</>}
          </button>
        </div>
      </div>

      {/* Resultado da detecção */}
      {detected && (
        <div className="insp-reveal" style={{ marginTop: 24 }}>
          {/* Música identificada — confiança de que a IA pegou a certa */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 14,
              marginBottom: 20,
              background: "linear-gradient(135deg, #2a1758 0%, #17123f 100%)",
              border: "1px solid rgba(168,85,247,0.45)",
              boxShadow: "0 10px 26px rgba(124,58,237,0.28)",
            }}
          >
            {(detected.cover || selected?.cover) ? (
              <span className="insp-hero-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detected.cover || selected?.cover}
                  alt=""
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).classList.add("no-art"); }}
                />
                <Icon name="music" size={20} />
              </span>
            ) : (
              <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
                <Icon name="music" size={20} />
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>
                {detected.recognized ? "Música identificada" : "Estimativa pelo nome"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis" }}>
                {detected.title}
                {detected.artist ? <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}> — {detected.artist}</span> : null}
              </div>
            </div>
          </div>

          {/* Confirmação de que a música do link já preencheu o formulário */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 11,
              marginBottom: 18,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#166534",
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            ✓ Informações da música aplicadas ao formulário — tema, gênero, voz, tom, emoções,
            instrumentos, andamento, estrutura, idioma e público já vêm selecionados.
          </div>

          {/* DNA estimado pela IA — só aparece quando a RapidAPI NÃO respondeu.
              Com dados reais da RapidAPI, mostramos apenas o que ela devolve. */}
          {!audio && (
          <>
          <div style={{ fontSize: 13, fontWeight: 700, color: "black", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="sparkle" size={16} style={{ color: "black" }} /> DNA musical detectado:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>
            {DETECTED_CARDS.map((d) => (
              <div
                key={d.label}
                style={{
                  position: "relative",
                  background: "linear-gradient(180deg, rgba(22,22,77,0.85), rgba(10,10,46,0.85))",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "16px 16px 16px 18px",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: d.accent }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: d.accent, background: `${d.accent}22` }}>
                    <Icon name={d.icon} size={16} />
                  </span>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>{d.label}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--white)", lineHeight: 1.3 }}>{detected[d.key]}</div>
              </div>
            ))}
          </div>

          {/* Detalhes complementares extraídos da referência */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 22 }}>
            {DETAIL_ROWS.map((d) => (
              <div
                key={d.label}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "11px 14px",
                  borderRadius: 11,
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(10,10,46,0.08)",
                }}
              >
                <span style={{ color: "#7c3aed", flexShrink: 0, marginTop: 1 }}><Icon name={d.icon} size={15} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(10,10,46,0.5)", fontWeight: 700, marginBottom: 2 }}>{d.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a2e", lineHeight: 1.35 }}>{d.value || "—"}</div>
                </div>
              </div>
            ))}
          </div>
          </>
          )}

          {/* Métricas do Spotify indisponíveis (ex.: cota diária da API estourou) */}
          {!audio && detected.audioError && (
            <div style={{ padding: "11px 14px", borderRadius: 11, marginBottom: 18, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 12.5, lineHeight: 1.5 }}>
              {detected.audioError === "quota"
                ? "⚠️ Limite de análises atingido — mostrei o DNA estimado pela IA. Tente novamente mais tarde para ver as métricas reais."
                : "⚠️ Não foi possível obter as métricas da faixa agora — usei o DNA estimado pela IA."}
            </div>
          )}

          {/* Análise real do Spotify (audio-features) — só em links de faixa */}
          {audio && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "black", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="bolt" size={16} style={{ color: "black" }} /> Análise da faixa (Spotify):
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
                {AUDIO_STATS.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "linear-gradient(180deg, rgba(22,22,77,0.85), rgba(10,10,46,0.85))",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--white)", lineHeight: 1.2 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {AUDIO_BARS.map((b) => (
                  <div
                    key={b.label}
                    style={{
                      padding: "11px 14px",
                      borderRadius: 11,
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(10,10,46,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(10,10,46,0.55)", fontWeight: 700 }}>{b.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#0a0a2e" }}>{Math.round(b.value * 100)}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 99, background: "rgba(10,10,46,0.1)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, b.value * 100))}%`, borderRadius: 99, background: b.accent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escolha: manter similar ou personalizar */}
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "black", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
            E agora?
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <button type="button" style={chip(choice === "manter")} onClick={() => setChoice("manter")}>
              {choice === "manter" && <span className="insp-check"><Icon name="check" size={11} style={{ color: "#fff" }} /></span>}
              Manter similar
            </button>
            <button type="button" style={chip(choice === "personalizar")} onClick={() => setChoice("personalizar")}>
              {choice === "personalizar" && <span className="insp-check"><Icon name="check" size={11} style={{ color: "#fff" }} /></span>}
              Personalizar
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 20, lineHeight: 1.6 }}>
            {choice === "personalizar"
              ? "Abre o formulário completo já preenchido para você ajustar cada detalhe."
              : "Gera uma música nova no mesmo estilo detectado, com uma letra totalmente diferente."}
          </div>

          <div className="e1-actions">
            <button type="button" className="e1-next" onClick={finalizar} disabled={!choice}>
              Finalizar →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
