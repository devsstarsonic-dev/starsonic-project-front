import { useState, useCallback } from "react";
import {
  CompositionMode,
  DetailedFormData,
  CompositionResult,
  WizardState,
} from "@/lib/types";
import { generateMockComposition } from "@/lib/mocks/composition";

export function useComposition() {
  const [state, setState] = useState<WizardState>({
    mode: undefined,
    step: 1,
    formData: {},
    result: null,
    loading: false,
    error: null,
  });

  const setMode = useCallback((mode: CompositionMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      step: 1,
      formData: {},
    }));
  }, []);

  const updateFormData = useCallback(
    (newData: Partial<DetailedFormData>) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, ...newData },
      }));
    },
    []
  );

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

      const result = await generateMockComposition(title, state.mode || "detailed");

      setState((prev) => ({
        ...prev,
        result,
        loading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao gerar composição";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.formData, state.mode]);

  const reset = useCallback(() => {
    setState({
      mode: undefined,
      step: 1,
      formData: {},
      result: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    state,
    setMode,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    startComposition,
    reset,
  };
}
