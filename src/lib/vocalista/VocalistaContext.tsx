"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { ArtistVoiceDraft } from "@/lib/types";

// Rascunho da voz de artista compartilhado entre as etapas do Vocalista.
// O provider fica no layout de /vocalista, então o estado sobrevive à navegação
// criar → dna → gerando → amostra. Persistido em sessionStorage para resistir a
// refresh — mesmo padrão do CompositionContext do Compositor.

const STORAGE_KEY = "starsonic:artist-voice";

const EMPTY: ArtistVoiceDraft = {
  name: "",
  description: "",
  gender: null,
  timbre: "",
  styles: [],
  referenceLink: "",
  referenceName: "",
};

type VocalistaContextValue = {
  draft: ArtistVoiceDraft;
  /**
   * Falso até o rascunho ser lido do sessionStorage. As etapas precisam disso:
   * os efeitos delas rodam antes do efeito de reidratação daqui (React executa
   * efeitos de filho antes dos do pai), então um guard que só olhasse `draft`
   * expulsaria o usuário da etapa a cada refresh.
   */
  hydrated: boolean;
  updateDraft: (patch: Partial<ArtistVoiceDraft>) => void;
  reset: () => void;
};

const VocalistaContext = createContext<VocalistaContextValue | null>(null);

export function VocalistaProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ArtistVoiceDraft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Reidrata após o mount, para não divergir da marcação do servidor.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setDraft({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // rascunho corrompido: começa do zero
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // não sobrescreve o storage com o rascunho vazio inicial
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // sessionStorage indisponível: o rascunho vive só em memória
    }
  }, [draft, hydrated]);

  const updateDraft = useCallback((patch: Partial<ArtistVoiceDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // idem
    }
  }, []);

  return (
    <VocalistaContext.Provider value={{ draft, hydrated, updateDraft, reset }}>
      {children}
    </VocalistaContext.Provider>
  );
}

export function useVocalista(): VocalistaContextValue {
  const ctx = useContext(VocalistaContext);
  if (!ctx) throw new Error("useVocalista precisa estar dentro de <VocalistaProvider>");
  return ctx;
}
