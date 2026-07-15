import Link from "next/link";
import { getCreations } from "@/lib/data";
import { IcSliders, IcZap, IcSparkles } from "@/components/mixer/icons";
import { MixerTrackPicker } from "@/components/mixer/MixerTrackPicker";

const FEATURES = [
  { Icon: IcSliders, title: "5 canais separados", desc: "Controle bateria, baixo, voz, teclado e demais instrumentos individualmente" },
  { Icon: IcZap, title: "6 estilos prontos", desc: "Festa, Rádio, Acústico, Karaokê, Vintage — um clique aplica" },
  { Icon: IcSparkles, title: "Preview ao vivo", desc: "Ouça as mudanças em tempo real conforme você mexe" },
];

export default async function MixerPage() {
  const creations = await getCreations();
  const tracks = creations
    .filter((c) => c.kind === "music" && c.status === "finalized" && c.audio_url)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="mixer">
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 8 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 16 }}>
          <span className="mx-live-dot" />
          <span style={{ color: "var(--cyan-1)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>NOVO · STARMIX</span>
        </div>
        <h1 className="mx-title" style={{ fontSize: 40, marginBottom: 10 }}>Personalize sua música</h1>
        <p className="mx-sub" style={{ maxWidth: 560, margin: "0 auto", fontSize: 15 }}>
          Ajuste cada instrumento do jeito que quiser. Mais grave, menos voz, adicionar reverb — tudo com controles simples.
        </p>
      </div>

      <div className="mx-features">
        {FEATURES.map((f) => (
          <div className="mx-feature" key={f.title}>
            <div className="mx-feature-ico"><f.Icon width={22} height={22} /></div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mx-title" style={{ fontSize: 20, marginBottom: 16 }}>Escolha uma música pra remixar</h2>

      {tracks.length === 0 ? (
        <div className="mx-card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ color: "var(--text-3)", marginBottom: 10, display: "flex", justifyContent: "center" }}>
            <IcSliders width={36} height={36} />
          </div>
          <p style={{ color: "var(--white)", fontWeight: 700, fontSize: 16 }}>Nenhuma música pronta pra remixar</p>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 6, marginBottom: 16 }}>
            Finalize uma criação no Sonic Lab pra ela aparecer aqui.
          </p>
          <Link href="/criar-musica" className="btn-primary" style={{ display: "inline-flex" }}>Criar música</Link>
        </div>
      ) : (
        <MixerTrackPicker tracks={tracks} />
      )}
    </div>
  );
}
