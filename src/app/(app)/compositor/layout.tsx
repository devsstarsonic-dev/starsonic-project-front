import { ReactNode } from "react";
import { CompositionProvider } from "@/lib/compositor/CompositionContext";

export default function CompositorLayout({ children }: { children: ReactNode }) {
  return (
    <CompositionProvider>
      <style>{`.app-main:has(.compositor-page){padding-bottom:0!important}`}</style>
      <section className="page compositor-page">
        {children}
      </section>
    </CompositionProvider>
  );
}
