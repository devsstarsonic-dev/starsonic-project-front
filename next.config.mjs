/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // ffmpeg-static só devolve um CAMINHO pro binário (lido e executado via
    // child_process, não "require()"ado como código). Se o webpack tentar
    // empacotar esse require, ele reescreve o caminho pra dentro de
    // .next/server/vendor-chunks/ffmpeg(.exe) — arquivo que nunca é copiado
    // pra lá, causando ENOENT ao rodar (tanto em `next dev` quanto build).
    // Marcando como "external" o Next usa o require() nativo do Node, que
    // resolve o caminho real dentro de node_modules.
    serverComponentsExternalPackages: ["ffmpeg-static"],
    // O binário em si (não é código JS) também precisa ser rastreado pra ir
    // pra function da Vercel — o file tracing não pega sozinho.
    outputFileTracingIncludes: {
      "/api/criar-musica/jingle": ["./node_modules/ffmpeg-static/ffmpeg"],
    },
  },
};

export default nextConfig;
