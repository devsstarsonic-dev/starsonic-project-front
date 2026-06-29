"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  CompositionMode,
  DetailedFormData,
  WizardState,
} from "@/lib/types";

// Estado do wizard de composição compartilhado entre as etapas.
// O provider fica no layout do compositor, então o estado sobrevive à
// navegação entre /compositor → step-2 → step-3 → revisar. Também é
// persistido em sessionStorage para resistir a um refresh da página.

const STORAGE_KEY = "starsonic:composition";

const EMPTY: WizardState = {
  mode: undefined,
  step: 1,
  formData: {},
  result: null,
  loading: false,
  error: null,
};

type CompositionContextValue = {
  state: WizardState;
  setMode: (mode: CompositionMode) => void;
  updateFormData: (newData: Partial<DetailedFormData>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  /** Marca que a música foi gerada (form será limpo na próxima). */
  markGenerated: () => void;
  /** Limpa o form se já houve geração — usado ao abrir a etapa 1. */
  resetIfGenerated: () => void;
};

const CompositionContext = createContext<CompositionContextValue | null>(null);

export function CompositionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(EMPTY);

  // Reidrata o estado salvo (sobrevive a refresh). Roda só no cliente, após
  // o mount, para não causar divergência de hidratação.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Se a música já foi gerada, NÃO restaura o form — começa limpo para a
      // próxima criação (e descarta o salvo).
      if (saved.generated) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      setState((prev) => ({ ...prev, ...saved, loading: false, error: null }));
    } catch {
      /* ignora JSON inválido */
    }
  }, []);

  // Persiste a cada mudança (apenas os campos serializáveis úteis).
  useEffect(() => {
    try {
      const { mode, step, formData, result, generated } = state;
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, step, formData, result, generated })
      );
    } catch {
      /* ignora limite de quota */
    }
  }, [state]);

  const setMode = useCallback((mode: CompositionMode) => {
    setState((prev) => ({ ...prev, mode, step: 1, formData: {} }));
  }, []);

  const updateFormData = useCallback((newData: Partial<DetailedFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...newData },
    }));
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setState((prev) => ({ ...prev, step }));
      scrollToTop();
    },
    [scrollToTop]
  );

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
    scrollToTop();
  }, [scrollToTop]);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
    scrollToTop();
  }, [scrollToTop]);

  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  // Marca que a música foi gerada → o form será limpo ao reentrar no compositor.
  const markGenerated = useCallback(() => {
    setState((prev) => ({ ...prev, generated: true }));
  }, []);

  // Limpa o formulário se já houve geração (chamado ao abrir a etapa 1).
  const resetIfGenerated = useCallback(() => {
    setState((prev) => {
      if (!prev.generated) return prev;
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* noop */
      }
      return EMPTY;
    });
  }, []);

  const value: CompositionContextValue = {
    state,
    setMode,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    reset,
    markGenerated,
    resetIfGenerated,
  };

  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

export function useComposition() {
  const ctx = useContext(CompositionContext);
  if (!ctx) {
    throw new Error(
      "useComposition deve ser usado dentro de <CompositionProvider>"
    );
  }
  return ctx;
}
