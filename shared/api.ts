/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * News item from tech websites
 */
export interface NewsItem {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  image?: string;
}

/**
 * Material enviado pelo administrador (GET/POST /api/materiais)
 */
export interface MaterialEnviado {
  id: string;
  materiaId: string;
  titulo: string;
  descricao: string;
  tipo: "pdf" | "imagem";
  /** URL pública do arquivo */
  caminho: string;
  nomeOriginal: string;
  tamanho: number;
  enviadoEm: string;
}

export interface MateriaisResponse {
  materiais: MaterialEnviado[];
}

/**
 * Questão gerada por IA no "Reprocessamento" (GET /api/questoes)
 */
export interface QuestaoGerada {
  id: string;
  materiaId: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  fundamentacao: string;
  hp12c?: { teclas: string; descricao: string }[];
  origem: "ia";
  geradaEm: string;
}

export interface QuestoesResponse {
  questoes: QuestaoGerada[];
}

export interface ReprocessarRequest {
  materia: string;
  quantidade: number;
}

export interface ReprocessamentoStatus {
  id: string;
  materia: string;
  estado: "processando" | "concluido" | "erro";
  mensagem?: string;
  geradas?: number;
  arquivosUsados?: string[];
  arquivosIgnorados?: string[];
}

/**
 * Response type for /api/news
 */
export interface NewsResponse {
  news: NewsItem[];
  cached?: boolean;
  lastUpdate?: string;
  error?: string;
}
