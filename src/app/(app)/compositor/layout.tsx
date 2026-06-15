import { ReactNode } from "react";
import { CompositionProvider } from "@/lib/compositor/CompositionContext";

export default function CompositorLayout({ children }: { children: ReactNode }) {
  return (
    <CompositionProvider>
      <section className="page">
        <div className="page-title-row" style={{ marginBottom: 28, alignItems: "flex-start" }}>
          <div>
            <div className="page-title">Compositor</div>
            <div className="page-sub">
              Crie sua música com controle total. Escolha cada detalhe.
            </div>
          </div>
        </div>

        {children}
      </section>
    </CompositionProvider>
  );
}
