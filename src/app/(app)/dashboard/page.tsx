import Link from "next/link";
import { getProfile, getCreations } from "@/lib/data";
import HeroBanner from "@/components/HeroBanner";
import StatusDot from "@/components/StatusDot";
import type { Creation } from "@/lib/types";

function formatCreationDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return `Hoje, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  if (diffDays === 1) {
    return `Ontem, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function getVersionLabel(_c: Creation): string {
  return "Versão 1";
}

const QUICK_ACTIONS = [
  {
    href: "/compositor",
    label: "Compositor",
    desc: "Crie melodias e arranjos únicos",
    color: "rgba(0, 212, 255, 0.12)",
    iconColor: "var(--cyan-1)",
    icon: (
      <svg
        className="quick-card-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 3h6l-3 7 3 7H9l3-7-3-7z" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    href: "/letrista",
    label: "Letrista",
    desc: "Gere letras originais em segundos",
    color: "rgba(168, 85, 247, 0.12)",
    iconColor: "var(--purple)",
    icon: (
      <svg
        className="quick-card-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: "/vocalista",
    label: "Vocalista",
    desc: "Vozes realistas com IA avançada",
    color: "rgba(20, 184, 166, 0.12)",
    iconColor: "#14b8a6",
    icon: (
      <svg
        className="quick-card-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    href: "/cover-studio",
    label: "Cover Studio",
    desc: "Crie capas profissionais",
    color: "rgba(251, 146, 60, 0.12)",
    iconColor: "var(--orange)",
    icon: (
      <svg
        className="quick-card-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
];

const ArrowIcon = () => (
  <svg
    className="quick-card-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const PlayIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const KebabIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color: "inherit" }}
  >
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

export default async function DashboardPage() {
  const [profile, creations] = await Promise.all([
    getProfile(),
    getCreations(),
  ]);

  const firstName = (profile?.full_name ?? "Artista").split(" ")[0];
  const recent = creations.slice(0, 4);

  return (
    <section className="page">
      {/* Greeting */}


      {/* Hero Banner */}
      <HeroBanner />

      {/* Ações rápidas */}
      <h2
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-1)",
          marginBottom: 12,
        }}
      >
        Ações rápidas
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
        className="quick-grid"
      >
        {QUICK_ACTIONS.map((a) => (
          <Link href={a.href} key={a.href} className="quick-card">
            <div
              className="quick-card-icon-wrap"
              style={{ background: a.color, color: a.iconColor }}
            >
              {a.icon}
            </div>
            <div className="quick-card-title">{a.label}</div>
            <div className="quick-card-desc">{a.desc}</div>
            <ArrowIcon />
          </Link>
        ))}
      </div>

      {/* Últimas criações */}
      <div className="card" style={{ padding: "20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px 16px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--white)",
            }}
          >
            Últimas criações
          </h3>
          <Link
            href="/criacoes"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--cyan-1)" }}
          >
            Ver todas
          </Link>
        </div>

        <div className="table-scroll">
        <table className="music-table">
          <thead className="music-table-head">
            <tr>
              <th style={{ paddingLeft: 20, width: 56 }}></th>
              <th style={{ width: 40 }}></th>
              <th>Nome</th>
              <th>Gênero</th>
              <th>Criada em</th>
              <th>Status</th>
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id} className="music-table-row">
                {/* Thumbnail */}
                <td style={{ paddingLeft: 20 }}>
                  <div
                    className="music-thumb"
                    style={{
                      background: `linear-gradient(135deg, ${c.gradient_from}, ${c.gradient_to})`,
                    }}
                  >
                    {c.emoji}
                  </div>
                </td>

                {/* Play */}
                <td>
                  <button className="music-play-btn" aria-label={`Reproduzir ${c.title}`}>
                    <PlayIcon />
                  </button>
                </td>

                {/* Name + version */}
                <td>
                  <div className="music-title">{c.title}</div>
                  <div className="music-version">{getVersionLabel(c)}</div>
                </td>

                {/* Genre */}
                <td>
                  <span className="music-genre">{c.genre || "—"}</span>
                </td>

                {/* Date */}
                <td>
                  <span className="music-date">{formatCreationDate(c.created_at)}</span>
                </td>

                {/* Status */}
                <td>
                  <StatusDot status={c.status} />
                </td>

                {/* Kebab */}
                <td>
                  <button className="music-kebab" aria-label="Mais opções">
                    <KebabIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .quick-grid { grid-template-columns: 1fr !important; }
        }
        .music-table-head th { padding-left: 10px; }
        @media (max-width: 700px) {
          .music-date, .music-genre { display: none; }
        }
      `}</style>
    </section>
  );
}
