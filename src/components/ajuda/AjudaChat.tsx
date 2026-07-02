"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

type Msg = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "Como eu crio uma música?",
  "Como monto uma playlist?",
  "Como funcionam os créditos?",
  "Como faço um avatar?",
];

const SAUDACAO: Msg = {
  role: "assistant",
  content:
    "Oi! Eu sou a Sonic 🤖, a assistente da Star Sonic. Posso te ajudar a criar músicas, montar playlists, entender os créditos e muito mais. Como posso ajudar?",
};

export function AjudaChat() {
  const [messages, setMessages] = useState<Msg[]>([SAUDACAO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function enviar(texto: string) {
    const pergunta = texto.trim();
    if (!pergunta || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: pergunta }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ajuda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Não enviamos a saudação inicial; só o diálogo real.
        body: JSON.stringify({ messages: next.filter((m) => m !== SAUDACAO) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Erro ao responder.");
      setMessages((prev) => [...prev, { role: "assistant", content: String(data.reply) }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao responder.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tive um problema para responder agora 😕. Tente novamente em instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-glow" style={{ display: "flex", flexDirection: "column", height: "min(74vh, 660px)", overflow: "hidden", padding: 0 }}>
      <style>{`
        .aj-row { display: flex; gap: 10px; align-items: flex-end; max-width: 88%; }
        .aj-row.user { align-self: flex-end; flex-direction: row-reverse; }
        .aj-row.bot { align-self: flex-start; }
        .aj-av { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          color: #04130a; background: linear-gradient(135deg, #00d4ff, #a855f7); box-shadow: 0 2px 8px rgba(0,212,255,0.35); }
        .aj-msg { padding: 11px 15px; border-radius: 16px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; box-shadow: 0 3px 12px rgba(0,0,0,0.22); }
        .aj-user .aj-msg { background: linear-gradient(135deg, #00d4ff, #3b9eff); color: #04130a; border-bottom-right-radius: 5px; font-weight: 600; }
        .aj-bot .aj-msg { background: var(--bg-card-2, #16164d); color: var(--text-1, #e8e8ff); border: 1px solid var(--border-soft, rgba(255,255,255,0.1)); border-bottom-left-radius: 5px; }
        .aj-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan-1, #00d4ff); display: inline-block; animation: aj-blink 1.2s infinite; }
        .aj-dot:nth-child(2){ animation-delay: .2s } .aj-dot:nth-child(3){ animation-delay: .4s }
        @keyframes aj-blink { 0%,80%,100%{ opacity:.25 } 40%{ opacity:1 } }
        .aj-pop { animation: aj-pop .25s ease both; }
        @keyframes aj-pop { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform:none;} }
        .aj-sug { padding: 8px 13px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer;
          background: var(--bg-card, rgba(22,22,77,0.6)); color: var(--text-1, #e8e8ff); border: 1px solid var(--border-soft, rgba(255,255,255,0.12)); transition: all .15s; }
        .aj-sug:hover { background: var(--bg-card-2, #16164d); border-color: var(--cyan-1, #00d4ff); transform: translateY(-1px); }
      `}</style>

      {/* Cabeçalho do chat */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--border-soft)", background: "linear-gradient(180deg, rgba(0,212,255,0.06), transparent)" }}>
        <span style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#04130a", background: "linear-gradient(135deg, #00d4ff, #a855f7)", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,212,255,0.4)" }}>
          <Icon name="robot" size={25} />
        </span>
        <div>
          <div style={{ fontWeight: 800, color: "var(--white)", fontFamily: "'Sora', sans-serif", fontSize: 15 }}>Sonic · Assistente</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} /> Online agora
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} className={`aj-row aj-pop ${m.role === "user" ? "user" : "bot"}`}>
            {m.role === "assistant" && <span className="aj-av"><Icon name="robot" size={16} /></span>}
            <div className="aj-msg">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="aj-row bot">
            <span className="aj-av"><Icon name="robot" size={16} /></span>
            <div className="aj-msg" style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span className="aj-dot" /><span className="aj-dot" /><span className="aj-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Sugestões (só no começo) */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 18px 12px" }}>
          {SUGESTOES.map((s) => (
            <button key={s} className="aj-sug" onClick={() => enviar(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: "0 18px 8px", fontSize: 12, color: "var(--orange, #fb923c)" }}>⚠️ {error}</div>
      )}

      {/* Campo de envio */}
      <form
        onSubmit={(e) => { e.preventDefault(); enviar(input); }}
        style={{ display: "flex", gap: 10, padding: 14, borderTop: "1px solid var(--border-soft)" }}
      >
        <input
          className="wiz-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida…"
          disabled={loading}
          style={{ flex: 1 }}
          autoFocus
        />
        <button type="submit" className="btn-primary" disabled={loading || !input.trim()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="send" size={16} /> Enviar
        </button>
      </form>
    </div>
  );
}
