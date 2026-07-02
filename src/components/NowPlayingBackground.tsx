"use client";

import { usePathname } from "next/navigation";
import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";

// Rotas que já têm o próprio fundo → não recebem a capa ambiente.
const NO_COVER_BG = ["compositor", "dashboard"];

// Fundo ambiente: quando há uma música tocando, mostra a capa dela no fundo
// do site — bem borrada e escurecida, criando clima sem competir com o conteúdo.
// Sem música (ou sem capa), a camada some e volta ao fundo normal.
export function NowPlayingBackground() {
  const player = useNowPlaying();
  const pathname = usePathname();
  const seg = pathname?.split("/").filter(Boolean)[0] ?? "";
  const img = player?.track?.imageUrl || null;
  const active = !!img;

  // No compositor e no dashboard não mostramos a capa como fundo.
  if (NO_COVER_BG.includes(seg)) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity .8s ease",
      }}
    >
      {img && (
        <div
          // key força recriar ao trocar de faixa (cross-fade natural pela opacity do pai)
          key={img}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // borra bastante, escurece e satura um pouco → clima sem destaque
            filter: "blur(20px) brightness(0.5) saturate(1)",
            transform: "scale(1.18)", // evita bordas transparentes do blur
          }}
        />
      )}
      {/* Escurecimento extra por cima, no tom do tema */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1200px 700px at 50% 30%, rgba(5,6,31,0.55), rgba(5,6,31,0.9))",
        }}
      />
    </div>
  );
}
