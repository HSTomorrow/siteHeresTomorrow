import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import Anthropic, { toFile } from "@anthropic-ai/sdk";
import { getMateria } from "../../shared/materiais";
import { MATERIALS_DIR, listarMateriaisEnviados } from "../routes/materiais";

/**
 * Arquivos de estudo de uma matéria (catálogo em public/ + enviados pelo admin)
 * e o envio deles para a Files API do Claude. Usado pelo Reprocessamento e pela
 * geração da apostila.
 */

/** Pasta de dados persistentes (no fly.io, /data — o volume). */
export const DATA_DIR = path.dirname(MATERIALS_DIR);
export const QUESTIONS_DIR = path.resolve(
  process.env.QUESTIONS_DIR ?? path.join(DATA_DIR, "questoes"),
);
const PUBLIC_DIR = path.resolve("public");
// file_ids já enviados à Files API, por arquivo local (caminho + tamanho + data).
// (fica em subpasta: GET /api/questoes lê todo *.json da raiz de QUESTIONS_DIR)
const ARQUIVO_CACHE_FILES = path.join(QUESTIONS_DIR, "_meta", "files-api.json");

const IMAGEM_MIME: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export interface Fonte {
  nome: string;
  arquivo: string;
  tipo: "pdf" | "imagem";
  mime: string;
  tamanho: number;
  /** Identifica a versão do arquivo: muda se ele for substituído. */
  chave: string;
}

/** Lista os arquivos da matéria na ordem em que aparecem no site. */
export async function listarFontes(materiaId: string) {
  const materia = getMateria(materiaId);
  const candidatos: { nome: string; arquivo: string }[] = [];

  for (const a of materia?.arquivos ?? []) {
    candidatos.push({ nome: a.titulo, arquivo: path.join(PUBLIC_DIR, a.caminho) });
  }
  for (const m of await listarMateriaisEnviados()) {
    if (m.materiaId === materiaId) {
      candidatos.push({ nome: m.titulo, arquivo: path.join(MATERIALS_DIR, path.basename(m.caminho)) });
    }
  }

  const fontes: Fonte[] = [];
  const ignorados: string[] = [];
  for (const c of candidatos) {
    const ext = path.extname(c.arquivo).toLowerCase();
    if (ext !== ".pdf" && !IMAGEM_MIME[ext]) {
      ignorados.push(`${c.nome} (formato não suportado)`);
      continue;
    }
    try {
      const info = await fs.stat(c.arquivo);
      fontes.push({
        ...c,
        tipo: ext === ".pdf" ? "pdf" : "imagem",
        mime: ext === ".pdf" ? "application/pdf" : IMAGEM_MIME[ext],
        tamanho: info.size,
        chave: `${c.arquivo}|${info.size}|${info.mtimeMs}`,
      });
    } catch {
      ignorados.push(`${c.nome} (arquivo não encontrado)`);
    }
  }
  return { fontes, ignorados };
}

/* ───────────── Files API ───────────── */

type CacheFiles = Record<string, string>; // chave da fonte -> file_id

// Serializa leituras/gravações do cache (Reprocessamento e apostila podem rodar juntos).
let filaCache: Promise<unknown> = Promise.resolve();

async function lerCacheFiles(): Promise<CacheFiles> {
  try {
    return JSON.parse(await fs.readFile(ARQUIVO_CACHE_FILES, "utf8"));
  } catch {
    return {};
  }
}

async function gravarCacheFiles(cache: CacheFiles) {
  await fs.mkdir(path.dirname(ARQUIVO_CACHE_FILES), { recursive: true });
  await fs.writeFile(`${ARQUIVO_CACHE_FILES}.tmp`, JSON.stringify(cache, null, 2));
  await fs.rename(`${ARQUIVO_CACHE_FILES}.tmp`, ARQUIVO_CACHE_FILES);
}

/** file_id da fonte na Files API; envia o arquivo (em streaming, do disco) se preciso. */
export function obterFileId(client: Anthropic, fonte: Fonte): Promise<string> {
  const tarefa = filaCache.then(async () => {
    const cache = await lerCacheFiles();
    const existente = cache[fonte.chave];
    if (existente) {
      try {
        await client.files.retrieveMetadata(existente);
        return existente;
      } catch (err) {
        // Apagado da conta: envia de novo. Outros erros sobem.
        if (!(err instanceof Anthropic.NotFoundError)) throw err;
      }
    }
    const enviado = await client.files.upload({
      file: await toFile(createReadStream(fonte.arquivo), path.basename(fonte.arquivo), {
        type: fonte.mime,
      }),
    });
    cache[fonte.chave] = enviado.id;
    await gravarCacheFiles(cache).catch((err) =>
      console.error("⚠️ Não foi possível gravar o cache da Files API:", err),
    );
    return enviado.id;
  });
  filaCache = tarefa.catch(() => undefined);
  return tarefa;
}

/** Mensagem amigável para erros da API do Claude. */
export function mensagemDeErroClaude(err: unknown, padrao: string): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "Chave da API do Claude inválida. Confira ANTHROPIC_API_KEY no servidor.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Limite de uso da API atingido. Aguarde alguns minutos e tente de novo.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Erro da API do Claude (${err.status ?? "sem status"}): ${err.message}`;
  }
  return err instanceof Error ? err.message : padrao;
}

/** Bloco de conteúdo que referencia a fonte já enviada à Files API. */
export async function blocoDoArquivo(client: Anthropic, fonte: Fonte): Promise<Anthropic.ContentBlockParam> {
  const fileId = await obterFileId(client, fonte);
  return fonte.tipo === "pdf"
    ? { type: "document", source: { type: "file", file_id: fileId }, title: fonte.nome }
    : { type: "image", source: { type: "file", file_id: fileId } };
}
