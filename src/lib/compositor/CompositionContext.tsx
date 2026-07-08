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
  SimpleMode,
  WizardState,
} from "@/lib/types";

// Estado do wizard de composição compartilhado entre as etapas.
// O provider fica no layout do compositor, então o estado sobrevive à
// navegação entre /compositor → step-2 → step-3 → revisar. Também é
// persistido em sessionStorage para resistir a um refresh da página.

const STORAGE_KEY = "starsonic:composition";
// Chave separada para o "hand-off" do Instrumental/Jingle → /compositor/revisar.
// Precisa ser distinta do STORAGE_KEY porque o layout do compositor (e o
// Provider) pode continuar montado entre navegações internas (ex.: o usuário
// já tinha aberto /compositor antes) — nesse caso o efeito de hidratação do
// Provider (que só roda uma vez, no mount) NUNCA rodaria de novo, e a nova
// resposta do Instrumental ficaria "presa" no sessionStorage sem aparecer.
// A tela de revisão consome essa semente sozinha, a cada vez que monta.
const SEED_KEY = "starsonic:simpleSeed";

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
  /** Aplica uma semente pendente do Instrumental/Jingle (se houver). Retorna
   *  true se havia uma e foi aplicada. Chamado pela tela de revisão ao montar. */
  applyPendingSeed: () => boolean;
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
      const { mode, step, formData, result, generated, simpleMode } = state;
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, step, formData, result, generated, simpleMode })
      );
    } catch {
      /* ignora limite de quota */
    }
  }, [state]);

  const setMode = useCallback((mode: CompositionMode) => {
    setState((prev) => ({ ...prev, mode, step: 1, formData: {}, simpleMode: undefined }));
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

  // Lê e consome (remove) a semente do Instrumental/Jingle, se houver, e
  // aplica direto no estado atual — funciona mesmo se este Provider já
  // estava montado de antes (não depende do efeito de hidratação no mount).
  const applyPendingSeed = useCallback(() => {
    try {
      const raw = window.sessionStorage.getItem(SEED_KEY);
      if (!raw) return false;
      window.sessionStorage.removeItem(SEED_KEY);
      const seed = JSON.parse(raw) as {
        formData?: Partial<DetailedFormData>;
        simpleMode?: SimpleMode;
      };
      setState((prev) => ({
        ...prev,
        mode: "detailed",
        step: 1,
        formData: seed.formData ?? {},
        result: null,
        generated: false,
        simpleMode: seed.simpleMode,
      }));
      return true;
    } catch {
      return false;
    }
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
    applyPendingSeed,
  };

  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

// Semeia as respostas do Instrumental/Jingle (telas fora do CompositorLayout)
// numa chave própria; a tela de revisão consome essa semente sozinha, ao
// montar (ver applyPendingSeed), e navega para lá em seguida.
export function seedCompositionStorage(
  formData: Partial<DetailedFormData>,
  simpleMode?: SimpleMode,
) {
  try {
    window.sessionStorage.setItem(SEED_KEY, JSON.stringify({ formData, simpleMode }));
  } catch {
    /* ignora limite de quota */
  }
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
