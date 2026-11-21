/**
 * Catálogo de materiais disponíveis para download na página /upload.
 *
 * Para adicionar um material:
 * 1. Copie o arquivo (PDF ou imagem) para `public/materiais/<id-da-materia>/`
 *    (ou envie pela página /admin, sem precisar mexer no código).
 * 2. Adicione uma entrada em `arquivos` da matéria correspondente abaixo.
 * 3. (Opcional) Adicione questões dessa matéria em `client/data/questoes.ts`.
 */

export type TipoArquivo = "pdf" | "imagem";

export interface ArquivoMaterial {
  titulo: string;
  descricao: string;
  tipo: TipoArquivo;
  /** Caminho público do arquivo, a partir de /public */
  caminho: string;
  /** Nome sugerido no download (arquivos enviados pelo admin) */
  nomeOriginal?: string;
}

export interface Materia {
  id: string;
  nome: string;
  descricao: string;
  arquivos: ArquivoMaterial[];
}

export const materias: Materia[] = [
  {
    id: "matematica-financeira",
    nome: "Matemática Financeira",
    descricao:
      "Juros simples e compostos, taxas equivalentes, séries de pagamentos, VPL e TIR — com o passo a passo na calculadora HP 12C.",
    arquivos: [
      {
        titulo: "Apostila de Matemática Financeira com HP 12C",
        descricao:
          "Resumo teórico, fórmulas e exemplos resolvidos na HP 12C (juros, taxas, Price, VPL e TIR).",
        tipo: "pdf",
        caminho: "/materiais/matematica-financeira/apostila-matematica-financeira-hp12c.pdf",
      },
      {
        titulo: "Mapa de teclas financeiras da HP 12C",
        descricao:
          "Guia visual das teclas n, i, PV, PMT, FV, CF0, CFj, NPV, IRR e convenção de sinais.",
        tipo: "imagem",
        caminho: "/materiais/matematica-financeira/hp12c-teclas-financeiras.svg",
      },
    ],
  },
  {
    id: "economia",
    nome: "Economia",
    descricao:
      "Mercado e taxas de câmbio, valorização e desvalorização cambial, regimes cambiais, ACC, PIB, Selic, inflação e teoria da produção.",
    arquivos: [],
  },
  {
    id: "contabilidade-tributaria",
    nome: "Contabilidade e Planejamento Tributário",
    descricao:
      "PIS e COFINS cumulativo e não cumulativo, créditos, IRPJ e CSLL, lucro contábil x lucro fiscal e carga tributária.",
    arquivos: [],
  },
  {
    id: "cultura-digital",
    nome: "Tecnologia, Sociedade e Cultura Digital",
    descricao:
      "Pós-verdade, cultura troll, efeito bolha, Quarta Revolução Industrial, uberização, pós-fordismo e transumanismo.",
    arquivos: [],
  },
];

export function getMateria(id: string | null | undefined): Materia | undefined {
  return materias.find((m) => m.id === id);
}
