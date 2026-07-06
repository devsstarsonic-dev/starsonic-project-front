"use client";

import { useState } from "react";

export function CopyLinkButton({
  link,
  label = "Copiar link",
}: {
  link: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-secondary"
      style={{
        padding: "8px 14px",
        fontSize: 12,
        borderRadius: 8,
      }}
    >
      {copied ? "✓ Copiado!" : label}
    </button>
  );
}
