import { ReactNode } from "react";
import { CompositionProvider } from "@/lib/compositor/CompositionContext";

// Provider próprio da revisão do Instrumental. Monta ao entrar em
// /instrumental/revisar (vindo do formulário) e hidrata as respostas que o
// SimpleForm semeou no sessionStorage.
export default function InstrumentalRevisarLayout({ children }: { children: ReactNode }) {
  return (
    <CompositionProvider>
      <style>{`.app-main:has(.compositor-page){padding-bottom:0!important}`}</style>
      <section className="page compositor-page">{children}</section>
    </CompositionProvider>
  );
}
