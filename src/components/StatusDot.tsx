import type { CreationStatus } from "@/lib/types";

const STATUS_MAP: Record<
  CreationStatus,
  { color: string; label: string }
> = {
  finalized: { color: "var(--green)", label: "Concluída" },
  processing: { color: "var(--orange)", label: "Em produção" },
  draft: { color: "var(--text-3)", label: "Rascunho" },
};

export default function StatusDot({ status }: { status: CreationStatus }) {
  const { color, label } = STATUS_MAP[status] ?? STATUS_MAP.draft;
  return (
    <span className="status-dot">
      <span className="status-dot-circle" style={{ background: color }} />
      <span style={{ fontSize: 12, color }}>{label}</span>
    </span>
  );
}
