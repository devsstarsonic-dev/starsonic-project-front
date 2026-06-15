import { ReactNode } from "react";

export default function CompositorLayout({ children }: { children: ReactNode }) {
  return (
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
  );
}
