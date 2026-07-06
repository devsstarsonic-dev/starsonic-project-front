// Mapeamento de rotas -> painel contextual, breadcrumb e ícone ativo da sidebar.
// Espelha PAGE_TO_PANEL / PAGE_TO_BREADCRUMB do protótipo.

export type PanelKey =
  | "dashboard"
  | "criar-musica"
  | "catalogo"
  | "criacoes"
  | "minha-loja"
  | "sonic-lab"
  | "distribuicao"
  | "planos"
  | "perfil";

export type SidebarKey =
  | "dashboard"
  | "criar-musica"
  | "catalogo"
  | "criacoes"
  | "minha-loja"
  | "loja-catalogo"
  | "loja-vendas"
  | "loja-saques"
  | "compositor"
  | "letrista"
  | "vocalista"
  | "cover-studio"
  | "midia"
  | "avatar-studio"
  | "projetos"
  | "playlists"
  | "analytics"
  | "royalties"
  | "distribuicao"
  | "planos"
  | "configuracoes"
  | "conta";

type PageMeta = {
  panel: PanelKey;
  breadcrumb: string;
  sidebar: SidebarKey | null;
};

export const SONIC_LAB_PAGES = [
  "compositor",
  "letrista",
  "vocalista",
  "cover-studio",
  "midia",
  "mixer",
  "podcast-studio",
  "avatar-studio",
  "promotor",
];

export const PAGE_META: Record<string, PageMeta> = {
  dashboard: { panel: "dashboard", breadcrumb: "Dashboard", sidebar: "dashboard" },
  "criar-musica": { panel: "criar-musica", breadcrumb: "Criar Música", sidebar: "criar-musica" },
  instrumental: { panel: "criar-musica", breadcrumb: "Criar Música › Instrumental", sidebar: "criar-musica" },
  jingle: { panel: "criar-musica", breadcrumb: "Criar Música › Jingle Comercial", sidebar: "criar-musica" },
  catalogo: { panel: "catalogo", breadcrumb: "Catálogo", sidebar: "catalogo" },
  playlist: { panel: "catalogo", breadcrumb: "Catálogo › Playlist", sidebar: "catalogo" },
  criacoes: { panel: "criacoes", breadcrumb: "Criações", sidebar: "criacoes" },
  "minha-loja": { panel: "minha-loja", breadcrumb: "Minha Loja", sidebar: "minha-loja" },
  "loja-catalogo": { panel: "minha-loja", breadcrumb: "Minha Loja › Catálogo", sidebar: "loja-catalogo" },
  "loja-vendas": { panel: "minha-loja", breadcrumb: "Minha Loja › Vendas", sidebar: "loja-vendas" },
  "loja-saques": { panel: "minha-loja", breadcrumb: "Minha Loja › Saques", sidebar: "loja-saques" },
  compositor: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Compositor", sidebar: "compositor" },
  letrista: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Letrista", sidebar: "letrista" },
  vocalista: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Vocalista", sidebar: "vocalista" },
  "cover-studio": { panel: "sonic-lab", breadcrumb: "Sonic Lab › Cover Studio", sidebar: "cover-studio" },
  midia: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Mídia", sidebar: "midia" },
  mixer: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Mixer", sidebar: "compositor" },
  "podcast-studio": { panel: "sonic-lab", breadcrumb: "Sonic Lab › Podcast Studio", sidebar: "compositor" },
  "avatar-studio": { panel: "sonic-lab", breadcrumb: "Sonic Lab › Avatar Studio", sidebar: "avatar-studio" },
  promotor: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Promotor", sidebar: "compositor" },
  distribuicao: { panel: "distribuicao", breadcrumb: "Distribuição", sidebar: "distribuicao" },
  planos: { panel: "planos", breadcrumb: "Planos", sidebar: "planos" },
  "meu-perfil": { panel: "perfil", breadcrumb: "Conta › Meu Perfil", sidebar: "conta" },
  "editar-perfil": { panel: "perfil", breadcrumb: "Conta › Editar Perfil", sidebar: "conta" },
  configuracoes: { panel: "perfil", breadcrumb: "Conta › Configurações", sidebar: "configuracoes" },
  "tornar-se-persona": { panel: "perfil", breadcrumb: "Conta › Tornar-se Artista", sidebar: "conta" },
  analytics: { panel: "dashboard", breadcrumb: "Analytics", sidebar: "analytics" },
  royalties: { panel: "dashboard", breadcrumb: "Royalties", sidebar: "royalties" },
  projetos: { panel: "criacoes", breadcrumb: "Projetos", sidebar: "projetos" },
  playlists: { panel: "criacoes", breadcrumb: "Playlists", sidebar: "playlists" },
  conta: { panel: "perfil", breadcrumb: "Conta", sidebar: "conta" },
  ajuda: { panel: "dashboard", breadcrumb: "Ajuda", sidebar: null },
};

export function metaForPath(pathname: string): PageMeta {
  const segs = pathname.split("/").filter(Boolean);
  let seg = segs[0] ?? "dashboard";

  // Se a rota é /minha-loja/*, considerar o 2º segmento pra ativar o item certo da sidebar
  if (seg === "minha-loja" && segs[1]) {
    seg = `loja-${segs[1]}`;
  }

  return (
    PAGE_META[seg] ?? {
      panel: "dashboard",
      breadcrumb: "Dashboard",
      sidebar: "dashboard",
    }
  );
}
