"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

// Botão flutuante (canto inferior direito) com um robô perguntando se o usuário
// precisa de ajuda. Ao clicar, vai para /ajuda (chat de dúvidas).
// Sobe um pouco quando o player inferior está aberto (body.player-open).
export function HelpFab() {
  const pathname = usePathname();
  // Não mostra na própria página de ajuda.
  if (pathname?.startsWith("/ajuda")) return null;

  return (
    <>
      <style>{`
        .help-fab {
          position: fixed; right: 24px; bottom: 24px; z-index: 60;
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        body.player-open .help-fab { bottom: 84px; }
        .help-fab-bubble {
          background: var(--bg-card-2, #16164d); color: var(--white, #fff);
          border: 1px solid var(--border-soft, rgba(255,255,255,0.12));
          padding: 9px 13px; border-radius: 12px; font-size: 13px; font-weight: 600;
          white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          opacity: 0; transform: translateX(8px); pointer-events: none;
          transition: opacity .2s, transform .2s;
        }
        .help-fab:hover .help-fab-bubble { opacity: 1; transform: translateX(0); }
        .help-fab-btn {
          width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; color: #04130a;
          background: linear-gradient(135deg, #00d4ff,rgb(131, 233, 253));
          box-shadow: 0 8px 26px rgba(0,212,255,0.45);
          animation: help-fab-bob 2.8s ease-in-out infinite;
          transition: transform .15s;
        }
        .help-fab:hover .help-fab-btn { transform: scale(1.07); }
        @keyframes help-fab-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (max-width: 640px){ .help-fab-bubble { display: none; } }
      `}</style>
      <Link href="/ajuda" className="help-fab" aria-label="Precisa de ajuda?" title="Precisa de ajuda?">
        <span className="help-fab-bubble">Precisa de ajuda? 🤖</span>
        <span className="help-fab-btn">
          <Icon name="robot" size={28} strokeWidth={2} />
        </span>
      </Link>
    </>
  );
}
