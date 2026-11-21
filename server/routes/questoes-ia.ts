import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type {
  QuestaoGerada,
  QuestoesResponse,
  ReprocessamentoStatus,
  ReprocessarRequest,
} from "@shared/api";
import { getMateria } from "../../shared/materiais";
import { getQuestoesDaMateria } from "../../client/data/questoes";
import { MATERIALS_DIR, exigirAdmin, listarMateriaisEnviados } from "./materiais";

/**
 * "Reprocessamento": gera questões novas com o Claude a partir dos materiais
 * (PDFs e imagens) de uma matéria. Exige ADMIN_TOKEN (custa créditos da API)
 * e ANTHROPIC_API_KEY no servidor.
 *
 * As questões geradas ficam em QUESTIONS_DIR (padrão: pasta "questoes" ao
 * lado de MATERIALS_DIR — no fly.io, /data/questoes, dentro do volume).
 */

const QUESTIONS_DIR = path.resolve(
  process.env.QUESTIONS_DIR ?? path.join(path.dirname(MATERIALS_DIR), "questoes"),
);
const PUBLIC_DIR = path.resolve("public");
const MODELO = "claude-opus-5-5";
// Limite de anexos por requisição (a API aceita até 32 MB; base64 aumenta ~33%).
const LIMITE_BYTES_ANEXOS = 20 * 1024 * 1024;

const TECLAS_HP =
  "f g n i PV PMT FV CHS ENTER CLx STO RCL EEX % yˣ LN + − × ÷ CF0 CFj Nj NPV IRR INT BEG END 12÷ 12× D.MY M.DY ΔDYS DATE x≷y, e os comandos compostos \"f CLEAR FIN\" e \"f CLEAR REG\"";

/* ───────────── Armazenamento ───────────── */

function arquivoDaMateria(materiaId: string) {
  return path.join(QUESTIONS_DIR, `${materiaId}.json`);
}

async function lerGeradas(materiaId: string): Promise<QuestaoGerada[]> {
  try {
    return JSON.parse(await fs.readFile(arquivoDaMateria(materiaId), "utf8"));
  } catch {
    return [];
  }
}

async function gravarGeradas(materiaId: string, lista: QuestaoGerada[]) {
  await fs.mkdir(QUESTIONS_DIR, { recursive: true });
  const destino = arquivoDaMateria(materiaId);
  await fs.writeFile(`${destino}.tmp`, JSON.stringify(lista, null, 2));
  await fs.rename(`${destino}.tmp`, destino);
}

/* ───────────── Saída estruturada ───────────── */

const SCHEMA_SAIDA = {
  type: "object",
  properties: {
    questoes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          enunciado: { type: "string" },
          alternativas: { type: "array", items: { type: "string" } },
          correta: { type: "integer" },
          fundamentacao: { type: "string" },
          hp12c: {
            type: "array",
            items: {
              type: "object",
              properties: {
                teclas: { type: "string" },
                descricao: { type: "string" },
              },
              required: ["teclas", "descricao"],
              additionalProperties: false,
            },
          },
        },
        required: ["enunciado", "alternativas", "correta", "fundamentacao", "hp12c"],
        additionalProperties: false,
      },
    },
  },
  required: ["questoes"],
  additionalProperties: false,
} as const;

const QuestaoSchema = z
  .object({
    enunciado: z.string().min(10),
    alternativas: z.array(z.string().min(1)).min(4).max(5),
    correta: z.number().int(),
    fundamentacao: z.string().min(20),
    hp12c: z.array(z.object({ teclas: z.string().min(1), descricao: z.string() })),
  })
  .refine((q) => q.correta >= 0 && q.correta < q.alternativas.length, {
    message: "índice da alternativa correta fora do intervalo",
  });

/* ───────────── Anexos (materiais da matéria) ───────────── */

type Anexo = { nome: string; bloco: Anthropic.ContentBlockParam; bytes: number };

const IMAGEM_MIME: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function montarAnexos(materiaId: string) {
  const materia = getMateria(materiaId);
  const fontes: { nome: string; arquivo: string }[] = [];

  // Arquivos estáticos do catálogo (public/...)
  for (const a of materia?.arquivos ?? []) {
    fontes.push({ nome: a.titulo, arquivo: path.join(PUBLIC_DIR, a.caminho) });
  }
  // Arquivos enviados pelo administrador
  for (const m of await listarMateriaisEnviados()) {
    if (m.materiaId === materiaId) {
      fontes.push({ nome: m.titulo, arquivo: path.join(MATERIALS_DIR, path.basename(m.caminho)) });
    }
  }

  const usados: Anexo[] = [];
  const ignorados: string[] = [];
  let total = 0;

  for (const f of fontes) {
    const ext = path.extname(f.arquivo).toLowerCase();
    if (ext !== ".pdf" && !IMAGEM_MIME[ext]) {
      ignorados.push(`${f.nome} (formato não suportado)`);
      continue;
    }
    let dados: Buffer;
    try {
      dados = await fs.readFile(f.arquivo);
    } catch {
      ignorados.push(`${f.nome} (arquivo não encontrado)`);
      continue;
    }
    if (total + dados.length > LIMITE_BYTES_ANEXOS) {
      ignorados.push(`${f.nome} (limite de tamanho por reprocessamento)`);
      continue;
    }
    total += dados.length;
    const data = dados.toString("base64");
    const bloco: Anthropic.ContentBlockParam =
      ext === ".pdf"
        ? {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data },
            title: f.nome,
          }
        : { type: "image", source: { type: "base64", media_type: IMAGEM_MIME[ext], data } };
    usados.push({ nome: f.nome, bloco, bytes: dados.length });
  }

  return { usados, ignorados };
}

/* ───────────── Geração ───────────── */

const SYSTEM = `Você é um professor universitário brasileiro que elabora simulados de múltipla escolha a partir do material de estudo fornecido.

Regras:
- Baseie cada questão no conteúdo dos materiais anexados. Não cobre assuntos que não aparecem neles.
- Escreva em português do Brasil, com valores no formato brasileiro (R$ 1.234,56; 2,5%).
- Cada questão tem 4 ou 5 alternativas, exatamente uma correta. "correta" é o índice da alternativa certa, começando em 0. Varie a posição da correta entre as questões.
- As alternativas erradas devem ser plausíveis e, sempre que possível, corresponder a erros comuns (taxa proporcional no lugar da equivalente, esquecer a entrada, inverter uma razão etc.).
- "fundamentacao" explica por que a correta está certa, mostra o cálculo passo a passo quando houver, e diz qual erro leva às principais alternativas erradas. 2 a 5 frases.
- Confira todas as contas antes de responder. Se não tiver certeza de um resultado numérico, não use aquela questão.
- Não repita questões da lista "Questões já existentes".`;

function instrucaoHP12C(materiaId: string) {
  if (materiaId !== "matematica-financeira") {
    return 'Esta matéria não usa calculadora financeira: devolva "hp12c" como lista vazia em todas as questões.';
  }
  return `Esta é a matéria de Matemática Financeira: TODA questão com cálculo deve trazer em "hp12c" o passo a passo na calculadora HP 12C (notação RPN). Em questões só conceituais, devolva lista vazia.
Formato de cada passo: "teclas" com números e teclas separados por espaço, na ordem exata em que são pressionados; "descricao" diz o que o passo faz e o valor que aparece no visor.
Use exatamente estes rótulos de tecla: ${TECLAS_HP}. Números com ponto decimal (ex.: 1.5).
Lembre: comece com "f CLEAR FIN"; saídas de caixa com CHS; g BEG/g END para séries antecipadas/postecipadas; com n fracionário use STO EEX (indicador C) para a convenção exponencial; a HP arredonda n para cima ao calcular n.
Exemplo: [{"teclas":"f CLEAR FIN","descricao":"Limpa os registradores financeiros"},{"teclas":"1000 CHS PV","descricao":"Valor presente"},{"teclas":"2 i","descricao":"Taxa de 2% ao mês"},{"teclas":"6 n","descricao":"6 meses"},{"teclas":"FV","descricao":"Visor: 1.126,16"}]`;
}

async function gerarQuestoes(
  materiaId: string,
  quantidade: number,
  anexos: Anexo[],
  existentes: string[],
): Promise<z.infer<typeof QuestaoSchema>[]> {
  const materia = getMateria(materiaId);
  const client = new Anthropic();

  const texto = [
    `Matéria: ${materia?.nome ?? materiaId}${materia ? ` — ${materia.descricao}` : ""}`,
    `Elabore ${quantidade} questões novas de múltipla escolha a partir dos materiais anexados, cobrindo tópicos variados.`,
    instrucaoHP12C(materiaId),
    existentes.length
      ? `Questões já existentes (não repita):\n${existentes.map((e) => `- ${e}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const stream = client.beta.messages.stream({
    model: MODELO,
    max_tokens: 64000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: SCHEMA_SAIDA },
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        // Os materiais vêm primeiro e o último recebe cache_control: nas rodadas
        // seguintes (até 1 h) a releitura dos PDFs custa ~10% do preço normal.
        // O texto com a lista de questões existentes muda a cada rodada, por
        // isso fica depois do ponto de cache.
        content: [
          ...anexos.map((a, i) =>
            i === anexos.length - 1
              ? ({ ...a.bloco, cache_control: { type: "ephemeral", ttl: "1h" } } as Anthropic.ContentBlockParam)
              : a.bloco,
          ),
          { type: "text", text: texto },
        ],
      },
    ],
  });
  const resposta = await stream.finalMessage();
  const uso = resposta.usage;
  console.log(
    `🧠 Reprocessamento ${materiaId}: entrada ${uso.input_tokens} | cache gravado ${uso.cache_creation_input_tokens ?? 0} | cache lido ${uso.cache_read_input_tokens ?? 0} | saída ${uso.output_tokens}`,
  );

  if (resposta.stop_reason === "refusal") {
    throw new Error("O modelo recusou gerar questões para este material.");
  }
  if (resposta.stop_reason === "max_tokens") {
    throw new Error("A resposta ficou longa demais. Tente uma quantidade menor de questões.");
  }
  const bloco = resposta.content.find((b) => b.type === "text");
  if (!bloco || bloco.type !== "text") throw new Error("Resposta vazia do modelo.");

  const bruto = JSON.parse(bloco.text) as { questoes: unknown[] };
  return bruto.questoes.flatMap((q) => {
    const r = QuestaoSchema.safeParse(q);
    return r.success ? [r.data] : [];
  });
}

/* ───────────── Jobs em segundo plano ───────────── */

const jobs = new Map<string, ReprocessamentoStatus>();
const emAndamento = new Set<string>();

async function executarJob(job: ReprocessamentoStatus, req: ReprocessarRequest) {
  try {
    const { usados, ignorados } = await montarAnexos(req.materia);
    job.arquivosUsados = usados.map((u) => u.nome);
    job.arquivosIgnorados = ignorados;
    if (usados.length === 0) {
      throw new Error(
        "Esta matéria ainda não tem materiais (PDF ou imagem). Envie arquivos pela página /admin e tente de novo.",
      );
    }

    // Nunca apaga: as novas questões são sempre somadas às já geradas.
    const atuais = await lerGeradas(req.materia);
    const existentes = [
      ...getQuestoesDaMateria(req.materia).map((q) => q.enunciado),
      ...atuais.map((q) => q.enunciado),
    ];

    const novas = await gerarQuestoes(req.materia, req.quantidade, usados, existentes);
    if (novas.length === 0) throw new Error("Nenhuma questão válida foi gerada. Tente novamente.");

    const agora = new Date().toISOString();
    const geradas: QuestaoGerada[] = novas.map((q) => ({
      id: `ia-${crypto.randomUUID()}`,
      materiaId: req.materia,
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      correta: q.correta,
      fundamentacao: q.fundamentacao,
      ...(q.hp12c.length
        ? { hp12c: q.hp12c.map((p) => ({ teclas: p.teclas ?? "", descricao: p.descricao ?? "" })) }
        : {}),
      origem: "ia",
      geradaEm: agora,
    }));

    await gravarGeradas(req.materia, [...atuais, ...geradas]);
    job.estado = "concluido";
    job.geradas = geradas.length;
  } catch (err) {
    job.estado = "erro";
    if (err instanceof Anthropic.AuthenticationError) {
      job.mensagem = "Chave da API do Claude inválida. Confira ANTHROPIC_API_KEY no servidor.";
    } else if (err instanceof Anthropic.RateLimitError) {
      job.mensagem = "Limite de uso da API atingido. Aguarde alguns minutos e tente de novo.";
    } else if (err instanceof Anthropic.APIError) {
      job.mensagem = `Erro da API do Claude (${err.status ?? "sem status"}): ${err.message}`;
    } else {
      job.mensagem = err instanceof Error ? err.message : "Falha ao gerar questões.";
    }
    console.error("❌ Reprocessamento falhou:", err);
  } finally {
    emAndamento.delete(req.materia);
    // Mantém o status por 1 hora para a página consultar
    setTimeout(() => jobs.delete(job.id), 60 * 60 * 1000).unref();
  }
}

/* ───────────── Rotas ───────────── */

export function questoesRouter(): Router {
  const router = Router();

  router.get("/api/questoes", async (req, res) => {
    const materia = typeof req.query.materia === "string" ? req.query.materia : "";
    let questoes: QuestaoGerada[] = [];
    if (materia) {
      if (!getMateria(materia)) {
        res.status(404).json({ error: "Matéria não encontrada." });
        return;
      }
      questoes = await lerGeradas(materia);
    } else {
      const arquivos = await fs.readdir(QUESTIONS_DIR).catch(() => [] as string[]);
      for (const a of arquivos.filter((n) => n.endsWith(".json"))) {
        questoes.push(...(await lerGeradas(a.replace(/\.json$/, ""))));
      }
    }
    const resposta: QuestoesResponse = { questoes };
    res.json(resposta);
  });

  router.post("/api/questoes/reprocessar", exigirAdmin, (req, res) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "Reprocessamento desativado: defina ANTHROPIC_API_KEY no servidor." });
      return;
    }
    const corpo = req.body as Partial<ReprocessarRequest>;
    const materia = typeof corpo.materia === "string" ? corpo.materia : "";
    const quantidade = Number(corpo.quantidade);

    if (!getMateria(materia)) {
      res.status(400).json({ error: "Matéria inválida." });
      return;
    }
    if (!Number.isInteger(quantidade) || quantidade < 3 || quantidade > 20) {
      res.status(400).json({ error: "Quantidade deve ser entre 3 e 20." });
      return;
    }
    if (emAndamento.has(materia)) {
      res.status(409).json({ error: "Já existe um reprocessamento em andamento para esta matéria." });
      return;
    }

    const job: ReprocessamentoStatus = { id: crypto.randomUUID(), materia, estado: "processando" };
    jobs.set(job.id, job);
    emAndamento.add(materia);
    void executarJob(job, { materia, quantidade });
    res.status(202).json(job);
  });

  router.get("/api/questoes/reprocessar/:id", (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Reprocessamento não encontrado (o servidor pode ter reiniciado)." });
      return;
    }
    res.json(job);
  });

  return router;
}
