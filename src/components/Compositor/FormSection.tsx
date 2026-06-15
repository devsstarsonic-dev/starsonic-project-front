"use client";

import { ReactNode, memo } from "react";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
  infoBox?: ReactNode;
  isChild?: boolean;
}

function FormSectionComponent({
  icon,
  title,
  subtitle,
  required = false,
  helpText,
  children,
  infoBox,
  isChild = false,
}: Props) {
  return (
    <div style={{ marginBottom: isChild ? 0 : 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: isChild ? "var(--font-editorial)" : "var(--font-mono)",
          fontSize: isChild ? 13 : 11,
          color: isChild ? "var(--text-2)" : "var(--cyan-1)",
          letterSpacing: isChild ? "0" : "0.15em",
          textTransform: isChild ? "none" : "uppercase",
          fontWeight: isChild ? 600 : 700,
          marginBottom: 12,
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
        {required && (
          <span style={{ color: "var(--red)", marginLeft: "auto", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            ● OBRIGATÓRIO
          </span>
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

export const FormSection = memo(FormSectionComponent);
