/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O binário do FFmpeg (ffmpeg-static) não é "require()"ado como código —
  // só tem o caminho lido e é executado via child_process — então o file
  // tracing da Vercel não o inclui sozinho na function. Força a inclusão
  // pra /api/criar-musica/jingle (corte dos clipes de 15s/30s/60s) funcionar
  // em produção. (Next 14.2 ainda expõe isso em "experimental".)
  experimental: {
    outputFileTracingIncludes: {
      "/api/criar-musica/jingle": ["./node_modules/ffmpeg-static/ffmpeg"],
    },
  },
};

export default nextConfig;
