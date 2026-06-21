export type Role = "admin" | "user";

export interface Profile {
  id: string;
  nome: string;
  email: string;
  role: Role;
  criado_em: string;
}

export interface Area {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  criado_em: string;
}

export interface Relatorio {
  id: string;
  nome: string;
  descricao: string;
  pbi_workspace_id: string;
  pbi_report_id: string;
  area_id: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface PermissaoArea {
  id: string;
  user_id: string;
  area_id: string;
  criado_em: string;
}

// Resposta da API /api/embed-token
export interface EmbedConfig {
  reportId: string;
  embedUrl: string;
  accessToken: string;
  expiry: string;
}
