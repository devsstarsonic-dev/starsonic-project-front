"use client";

import { useEffect, useState } from "react";
import { PIX_TYPES, detectPixType, isValidPixKey, maskPixKey, type PixKeyType } from "@/lib/store/pixKey";

const CHIPS: PixKeyType[] = ["celular", "cpf", "cnpj", "email", "aleatoria"];

function PixLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Pix">
      <path
        fill="#32BCAD"
        d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"
      />
    </svg>
  );
}

export function PixKeyModal({
  open,
  currentKey,
  onClose,
  onSave,
}: {
  open: boolean;
  currentKey: string | null;
  onClose: () => void;
  onSave: (type: PixKeyType, value: string) => void;
}) {
  const [type, setType] = useState<PixKeyType>("celular");
  const [value, setValue] = useState("");
  // Depois que o usuário escolhe o tipo na mão, a detecção automática não
  // sobrescreve mais a escolha dele.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(detectPixType(currentKey ?? "") ?? "celular");
    setValue("");
    setManual(false);
  }, [open, currentKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = anterior;
    };
  }, [open, onClose]);

  if (!open) return null;

  const cfg = PIX_TYPES[type];
  const preenchido = value.trim() !== "";
  const valido = preenchido && isValidPixKey(type, value);

  function handleChange(raw: string) {
    const detectado = manual ? null : detectPixType(raw);
    const proximo = detectado ?? type;
    if (proximo !== type) setType(proximo);
    setValue(maskPixKey(proximo, raw));
  }

  function escolherTipo(t: PixKeyType) {
    setManual(true);
    setType(t);
    setValue((v) => maskPixKey(t, v));
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="store-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Alterar chave Pix"
      style={{ zIndex: 320 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pix-modal-box">
        <button type="button" className="store-modal-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>

        <div className="pix-modal-head">
          <span className="pix-modal-logo">
            <PixLogo />
          </span>
          <div>
            <h3 className="pix-modal-title">Alterar chave Pix</h3>
            <p className="pix-modal-sub">Digite sua chave — identificamos o tipo automaticamente</p>
          </div>
        </div>

        <div className="pix-current">
          <span>Chave atual</span>
          <b>{currentKey ?? "Nenhuma cadastrada"}</b>
        </div>

        <p className="pix-lbl">Tipo de chave</p>
        <div className="pix-chips">
          {CHIPS.map((t) => (
            <button
              key={t}
              type="button"
              className={`pix-chip${t === type ? " active" : ""}`}
              onClick={() => escolherTipo(t)}
            >
              {PIX_TYPES[t].label}
            </button>
          ))}
        </div>

        <p className="pix-lbl" style={{ marginTop: 16 }}>
          Nova chave
        </p>
        <div className={`pix-field${valido ? " valid" : preenchido ? " invalid" : ""}`}>
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            inputMode={cfg.inputMode}
            placeholder={cfg.placeholder}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            aria-label="Nova chave Pix"
          />
          <span className="pix-detect">{cfg.label}</span>
        </div>
        <p className={`pix-hint ${!preenchido ? "neutral" : valido ? "ok" : "err"}`}>
          {valido ? `Tudo certo — chave ${cfg.label} válida.` : cfg.hint}
        </p>

        <div className="pix-actions">
          <button type="button" className="btn-secondary pix-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary pix-btn"
            disabled={!valido}
            onClick={() => onSave(type, value.trim())}
          >
            Salvar chave
          </button>
        </div>
      </div>
    </div>
  );
}
