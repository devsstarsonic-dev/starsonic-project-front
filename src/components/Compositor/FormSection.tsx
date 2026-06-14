"use client";

import { ReactNode } from "react";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
  infoBox?: ReactNode;
}

export function FormSection({
  icon,
  title,
  subtitle,
  required = false,
  helpText,
  children,
  infoBox,
}: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--cyan-1)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
        {required && (
          <span style={{ color: "var(--red)", marginLeft: "auto" }}>● OBRIGATÓRIO</span>
        )}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            marginBottom: 8,
          }}
        >
          {subtitle}
        </div>
      )}

      {children}

      {helpText && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            marginTop: 4,
          }}
        >
          {helpText}
        </div>
      )}

      {infoBox && <div style={{ marginTop: 10 }}>{infoBox}</div>}
    </div>
  );
}
