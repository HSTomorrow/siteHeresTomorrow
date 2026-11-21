import fs from "fs/promises";
import path from "path";
import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import type {
  ApostilaGeracao,
  ApostilaResponse,
  ApostilaResumo,
  ApostilaSecao,
  ApostilasResponse,
} from "@shared/api";
import { getMateria, materias } from "../../shared/materiais";
import { exigirAdmin } from "./materiais";
import {
  DATA_DIR,
  blocoDoArquivo,
  listarFontes,
  mensagemDeErroClaude,
  type Fonte,
} from "../lib/fontes-materia";

/**
 * Apostila: o Claude transcreve cada PDF/imagem da matéria em Markdown, uma
 * única vez. As transcrições ficam em APOSTILAS_DIR (no fly.io, /data/apostilas)
 * e servem para:
 *   - a página Consulta (leitura e busca no navegador);
 *   - o Reprocessamento, que manda o texto no lugar do PDF — bem mais barato
 *     em tokens do que reler as páginas do arquivo a cada rodada.
 *
 * Cada transcrição é ligada à versão do arquivo (caminho + tamanho + data).
 * Arquivo novo ou substituído fica "pendente" até gerar a apostila de novo;
 * só os pendentes são transcritos.
 */

const APOSTILAS_DIR = path.resolve(process.env.APOSTILAS_DIR ?? path.join(DATA_DIR, "apostilas"));
const MODELO = "claude-opus-5-5";

const SYSTEM = `Você transcreve material de estudo para uma apostila digital em Markdown. A apostila é lida por alunos e também usada como fonte para elaborar questões de prova, então nada do conteúdo pode se perder.

Regras:
- Transcreva todo o conteúdo do arquivo, na ordem original, sem resumir nem omitir. Mantenha o idioma do original (português do Brasil).
- Use títulos ## e ### para a estrutura do documento. Não use # (o título do arquivo já é exibido acima).
- Tabelas viram tabelas Markdown, com todos os valores.
- Fórmulas em texto simples, legível (ex.: M = C × (1 + i)^n).
- Exemplos e exercícios resolvidos: transcreva enunciado, todos os passos e o resultado.
- Gráficos, diagramas e figuras: descreva em uma ou duas frases o que mostram, com os números relevantes.
- Ignore cabeçalhos e rodapés repetidos, números de página e marcas d'água.
- Responda só com o Markdown, sem comentários antes ou depois.`;

/* ───────────── Armazenamento ───────────── */

type Transcricoes = Record<string, ApostilaSecao>; // chave da fonte -> seção

function arquivoTranscricoes(materiaId: string) {
  return path.join(APOSTILAS_DIR, `${materiaId}.json`);
}
function arquivoStatus(materiaId: string) {
  return path.join(APOSTILAS_DIR, `${materiaId}.status.json`);
}

async function lerJson<T>(arquivo: string): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(arquivo, "utf8"));
  } catch {
    return undefined;
  }
}

async function gravarJson(arquivo: string, dados: unknown) {
  await fs.mkdir(path.dirname(arquivo), { recursive: true });
  await fs.writeFile(`${arquivo}.tmp`, JSON.stringify(dados));
  await fs.rename(`${arquivo}.tmp`, arquivo);
}

export async function lerTranscricoes(materiaId: string): Promise<Transcricoes> {
  return (await lerJson<Transcricoes>(arquivoTranscricoes(materiaId))) ?? {};
}

/* ───────────── Status da geração ───────────── */

const geracoes = new Map<string, ApostilaGeracao>();

async function salvarStatus(materiaId: string, status: ApostilaGeracao) {
  await gravarJson(arquivoStatus(materiaId), status).catch((err) =>
    console.error("⚠️ Não foi possível gravar o status da apostila:", err),
  );
}

async function statusDaGeracao(materiaId: string): Promise<ApostilaGeracao | undefined> {
  const emMemoria = geracoes.get(materiaId);
  if (emMemoria) return emMemoria;
  const salvo = await lerJson<ApostilaGeracao>(arquivoStatus(materiaId));
  if (salvo?.estado === "processando") {
    // Estava em andamento quando o servidor reiniciou.
    return {
      ...salvo,
      estado: "erro",
      atual: undefined,
      mensagem:
        "O servidor reiniciou durante a geração. O que já foi transcrito está salvo; clique em gerar de novo para continuar.",
    };
  }
  return salvo;
}

/* ───────────── Montagem ───────────── */

async function montarApostila(materiaId: string): Promise<ApostilaResponse> {
  const [{ fontes }, transcricoes, geracao] = await Promise.all([
    listarFontes(materiaId),
    lerTranscricoes(materiaId),
    statusDaGeracao(materiaId),
  ]);
  const secoes: ApostilaSecao[] = [];
  const pendentes: string[] = [];
  for (const f of fontes) {
    const t = transcricoes[f.chave];
    if (t) secoes.push({ ...t, titulo: f.nome });
    else pendentes.push(f.nome);
  }
  return { materiaId, secoes, pendentes, ...(geracao ? { geracao } : {}) };
}

/* ───────────── Transcrição ───────────── */

function limparMarkdown(texto: string) {
  // Às vezes o modelo embrulha tudo em ```markdown ... ```
  return texto
    .trim()
    .replace(/^```(?:markdown|md)?\s*\n/i, "")
    .replace(/\n```\s*$/, "")
    .trim();
}

async function transcrever(client: Anthropic, fonte: Fonte): Promise<string> {
  const bloco = await blocoDoArquivo(client, fonte);
  const stream = client.beta.messages.stream({
    model: MODELO,
    max_tokens: 128000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [bloco, { type: "text", text: `Transcreva o arquivo "${fonte.nome}".` }],
      },
    ],
  });
  const resposta = await stream.finalMessage();
  const uso = resposta.usage;
  console.log(
    `📘 Apostila "${fonte.nome}": entrada ${uso.input_tokens} | saída ${uso.output_tokens}`,
  );

  if (resposta.stop_reason === "refusal") throw new Error("o modelo recusou transcrever este arquivo");
  if (resposta.stop_reason === "max_tokens") throw new Error("arquivo longo demais para transcrever");
  const texto = resposta.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n");
  const markdown = limparMarkdown(texto);
  if (markdown.length < 20) throw new Error("transcrição vazia");
  return markdown;
}

function erroFatal(err: unknown) {
  // Sem chave válida ou sem cota, não adianta continuar nos outros arquivos.
  return err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.RateLimitError;
}

async function executarGeracao(materiaId: string, status: ApostilaGeracao) {
  try {
    const client = new Anthropic();
    const { fontes } = await listarFontes(materiaId);
    const salvas = await lerTranscricoes(materiaId);
    // Descarta transcrições de arquivos removidos ou substituídos.
    const transcricoes: Transcricoes = {};
    for (const f of fontes) if (salvas[f.chave]) transcricoes[f.chave] = salvas[f.chave];

    const pendentes = fontes.filter((f) => !transcricoes[f.chave]);
    status.total = pendentes.length;
    const falhas: string[] = [];

    for (const f of pendentes) {
      status.atual = f.nome;
      await salvarStatus(materiaId, status);
      try {
        transcricoes[f.chave] = {
          titulo: f.nome,
          markdown: await transcrever(client, f),
          geradaEm: new Date().toISOString(),
        };
        // Grava a cada arquivo: um reinício não perde o que já foi feito.
        await gravarJson(arquivoTranscricoes(materiaId), transcricoes);
      } catch (err) {
        if (erroFatal(err)) throw err;
        console.error(`❌ Apostila: falha ao transcrever "${f.nome}":`, err);
        falhas.push(`${f.nome} (${mensagemDeErroClaude(err, "falha ao transcrever")})`);
      }
      status.concluidos++;
    }
    await gravarJson(arquivoTranscricoes(materiaId), transcricoes);

    status.atual = undefined;
    status.falhas = falhas;
    if (pendentes.length > 0 && falhas.length === pendentes.length) {
      status.estado = "erro";
      status.mensagem = "Nenhum arquivo pôde ser transcrito.";
    } else {
      status.estado = "concluido";
      status.mensagem =
        pendentes.length === 0
          ? "A apostila já estava atualizada."
          : `${pendentes.length - falhas.length} arquivo(s) transcrito(s).`;
    }
  } catch (err) {
    status.estado = "erro";
    status.atual = undefined;
    status.mensagem = mensagemDeErroClaude(err, "Falha ao gerar a apostila.");
    console.error("❌ Geração da apostila falhou:", err);
  } finally {
    await salvarStatus(materiaId, status);
    geracoes.delete(materiaId);
  }
}

/* ───────────── Rotas ───────────── */

export function apostilaRouter(): Router {
  const router = Router();

  router.get("/api/apostilas", async (_req, res) => {
    const apostilas: ApostilaResumo[] = await Promise.all(
      materias.map(async (m) => {
        const a = await montarApostila(m.id);
        return { ...a, secoes: a.secoes.length };
      }),
    );
    const resposta: ApostilasResponse = { apostilas };
    res.json(resposta);
  });

  router.get("/api/apostilas/:materia", async (req, res) => {
    if (!getMateria(req.params.materia)) {
      res.status(404).json({ error: "Matéria não encontrada." });
      return;
    }
    res.json(await montarApostila(req.params.materia));
  });

  router.post("/api/apostilas/:materia/gerar", exigirAdmin, async (req, res) => {
    const materiaId = req.params.materia;
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "Geração desativada: defina ANTHROPIC_API_KEY no servidor." });
      return;
    }
    if (!getMateria(materiaId)) {
      res.status(404).json({ error: "Matéria não encontrada." });
      return;
    }
    if (geracoes.has(materiaId)) {
      res.status(409).json({ error: "A apostila desta matéria já está sendo gerada." });
      return;
    }
    const status: ApostilaGeracao = { estado: "processando", total: 0, concluidos: 0 };
    geracoes.set(materiaId, status);
    await salvarStatus(materiaId, status);
    void executarGeracao(materiaId, status);
    res.status(202).json(status);
  });

  return router;
}
