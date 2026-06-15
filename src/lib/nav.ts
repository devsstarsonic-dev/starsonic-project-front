// Mapeamento de rotas -> painel contextual, breadcrumb e ícone ativo da sidebar.
// Espelha PAGE_TO_PANEL / PAGE_TO_BREADCRUMB do protótipo.

export type PanelKey =
  | "dashboard"
  | "criar-musica"
  | "catalogo"
  | "criacoes"
  | "sonic-lab"
  | "distribuicao"
  | "planos"
  | "perfil";

export type SidebarKey =
  | "dashboard"
  | "criar-musica"
  | "catalogo"
  | "criacoes"
  | "compositor"
  | "letrista"
  | "vocalista"
  | "cover-studio"
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
  "mixer",
  "podcast-studio",
  "avatar-studio",
  "promotor",
];

export const PAGE_META: Record<string, PageMeta> = {
  dashboard: { panel: "dashboard", breadcrumb: "Dashboard", sidebar: "dashboard" },
  "criar-musica": { panel: "criar-musica", breadcrumb: "Criar Música", sidebar: "criar-musica" },
  catalogo: { panel: "catalogo", breadcrumb: "Catálogo", sidebar: "catalogo" },
  criacoes: { panel: "criacoes", breadcrumb: "Criações", sidebar: "criacoes" },
  compositor: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Compositor", sidebar: "compositor" },
  letrista: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Letrista", sidebar: "letrista" },
  vocalista: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Vocalista", sidebar: "vocalista" },
  "cover-studio": { panel: "sonic-lab", breadcrumb: "Sonic Lab › Cover Studio", sidebar: "cover-studio" },
  mixer: { panel: "sonic-lab", breadcrumb: "Sonic Lab › Mixer", sidebar: "compositor" },
  "podcast-studio": { panel: "sonic-lab", breadcrumb: "Sonic Lab › Podcast Studio", sidebar: "compositor" },
  "avatar-studio": { panel: "sonic-lab", breadcrumb: "Sonic Lab › Avatar Studio", sidebar: "compositor" },
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
};

export function metaForPath(pathname: string): PageMeta {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return (
    PAGE_META[seg] ?? {
      panel: "dashboard",
      breadcrumb: "Dashboard",
      sidebar: "dashboard",
    }
  );
}
