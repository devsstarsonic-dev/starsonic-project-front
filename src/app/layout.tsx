import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Star Sonic · Plataforma",
  description: "Músicas que conectam e emocionam.",
};

// `viewportFit: cover` deixa o fundo sangrar sob o notch/indicador do iPhone.
// O padding com env(safe-area-inset-*) em globals.css impede que o conteúdo
// fique debaixo deles.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a2e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Caveat:wght@400;500;600;700&family=Orbitron:wght@500;700;800;900&family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Fonte única no app inteiro, no estilo do Spotify (Circular → Montserrat,
            equivalente gratuita). Fica no body (não no head) para evitar mismatch de
            hidratação; o !important sobrescreve as fontes dos estilos inline. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --font-ui: 'Montserrat', sans-serif;
            --font-editorial: 'Montserrat', sans-serif;
            --font-display: 'Montserrat', sans-serif;
            --font-mono: 'Montserrat', sans-serif;
          }
          html, body, button, input, textarea, select, optgroup,
          *, *::before, *::after {
            font-family: 'Circular', 'Montserrat', -apple-system, BlinkMacSystemFont,
              'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          }
        `,
          }}
        />
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
