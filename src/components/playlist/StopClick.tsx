"use client";

import type { ReactNode } from "react";

// Wrapper client: impede que o clique (ex.: no play) acione o Link do card.
export function StopClick({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </span>
  );
}
