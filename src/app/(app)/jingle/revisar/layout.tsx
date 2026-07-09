import { ReactNode } from "react";
import { CompositionProvider } from "@/lib/compositor/CompositionContext";

// Provider próprio da revisão do Jingle. Monta ao entrar em /jingle/revisar
// (vindo do formulário) e hidrata as respostas semeadas no sessionStorage.
export default function JingleRevisarLayout({ children }: { children: ReactNode }) {
  return (
    <CompositionProvider>
      <style>{`.app-main:has(.compositor-page){padding-bottom:0!important}`}</style>
      <section className="page compositor-page">{children}</section>
    </CompositionProvider>
  );
}
