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
  CompositionResult,
  WizardState,
} from "@/lib/types";
import { generateMockComposition } from "@/lib/mocks/composition";

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
  startComposition: () => Promise<CompositionResult>;
  reset: () => void;
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
      setState((prev) => ({ ...prev, ...saved, loading: false, error: null }));
    } catch {
      /* ignora JSON inválido */
    }
  }, []);

  // Persiste a cada mudança (apenas os campos serializáveis úteis).
  useEffect(() => {
    try {
      const { mode, step, formData, result } = state;
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, step, formData, result })
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

  const startComposition = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const title =
        (state.formData as any).musicName ||
        (state.formData as any).title ||
        "Sem Título";

      const result = await generateMockComposition(
        title,
        state.mode || "detailed"
      );

      setState((prev) => ({ ...prev, result, loading: false }));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao gerar composição";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [state.formData, state.mode]);

  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value: CompositionContextValue = {
    state,
    setMode,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    startComposition,
    reset,
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
