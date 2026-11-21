import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import express, { RequestHandler, Router } from "express";
import type { MaterialEnviado, MateriaisResponse } from "@shared/api";

/**
 * Upload de materiais pelo administrador.
 *
 * - Arquivos e índice ficam em MATERIALS_DIR (padrão: ./data/materiais).
 *   Em produção no fly.io, aponte para um volume persistente, senão os
 *   arquivos somem a cada deploy.
 * - Upload/remoção exigem o header "Authorization: Bearer <ADMIN_TOKEN>".
 *   Sem ADMIN_TOKEN configurado, o upload fica desativado.
 */

export const MATERIALS_DIR = path.resolve(process.env.MATERIALS_DIR ?? "data/materiais");
export const MATERIALS_URL = "/arquivos/materiais";
const INDEX_FILE = path.join(MATERIALS_DIR, "index.json");
const MAX_BYTES = 25 * 1024 * 1024;

// SVG fica de fora de propósito: pode conter scripts e é servido na mesma origem do site.
const TIPOS_PERMITIDOS: Record<string, { ext: string; tipo: MaterialEnviado["tipo"] }> = {
  "application/pdf": { ext: ".pdf", tipo: "pdf" },
  "image/png": { ext: ".png", tipo: "imagem" },
  "image/jpeg": { ext: ".jpg", tipo: "imagem" },
  "image/webp": { ext: ".webp", tipo: "imagem" },
  "image/gif": { ext: ".gif", tipo: "imagem" },
};

/** Confere a "assinatura" binária para não aceitar arquivo com tipo falsificado. */
function assinaturaValida(buf: Buffer, mime: string): boolean {
  const ini = (bytes: number[]) => bytes.every((b, i) => buf[i] === b);
  switch (mime) {
    case "application/pdf":
      return buf.subarray(0, 5).toString("latin1") === "%PDF-";
    case "image/png":
      return ini([0x89, 0x50, 0x4e, 0x47]);
    case "image/jpeg":
      return ini([0xff, 0xd8, 0xff]);
    case "image/gif":
      return buf.subarray(0, 4).toString("latin1") === "GIF8";
    case "image/webp":
      return (
        buf.subarray(0, 4).toString("latin1") === "RIFF" &&
        buf.subarray(8, 12).toString("latin1") === "WEBP"
      );
    default:
      return false;
  }
}

async function lerIndice(): Promise<MaterialEnviado[]> {
  try {
    return JSON.parse(await fs.readFile(INDEX_FILE, "utf8"));
  } catch {
    return [];
  }
}

// Serializa as gravações do índice para evitar perda em uploads simultâneos.
let fila: Promise<unknown> = Promise.resolve();
function alterarIndice<T>(fn: (lista: MaterialEnviado[]) => Promise<T> | T): Promise<T> {
  const tarefa = fila.then(async () => {
    await fs.mkdir(MATERIALS_DIR, { recursive: true });
    const lista = await lerIndice();
    const resultado = await fn(lista);
    const tmp = `${INDEX_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(lista, null, 2));
    await fs.rename(tmp, INDEX_FILE);
    return resultado;
  });
  fila = tarefa.catch(() => undefined);
  return tarefa;
}

function tokenValido(header: string | undefined): boolean {
  const esperado = process.env.ADMIN_TOKEN;
  if (!esperado || !header?.startsWith("Bearer ")) return false;
  const a = crypto.createHash("sha256").update(header.slice(7)).digest();
  const b = crypto.createHash("sha256").update(esperado).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function listarMateriaisEnviados(): Promise<MaterialEnviado[]> {
  return lerIndice();
}

export const exigirAdmin: RequestHandler = (req, res, next) => {
  if (!process.env.ADMIN_TOKEN) {
    res.status(503).json({ error: "Upload desativado: defina ADMIN_TOKEN no servidor." });
    return;
  }
  if (!tokenValido(req.headers.authorization)) {
    res.status(401).json({ error: "Token de administrador inválido." });
    return;
  }
  next();
};

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

export function materiaisRouter(): Router {
  const router = Router();

  router.get("/api/materiais", async (_req, res) => {
    const resposta: MateriaisResponse = { materiais: await lerIndice() };
    res.json(resposta);
  });

  router.post("/api/admin/verificar", exigirAdmin, (_req, res) => {
    res.json({ ok: true });
  });

  router.post(
    "/api/materiais",
    exigirAdmin,
    express.raw({ type: () => true, limit: MAX_BYTES }),
    async (req, res) => {
      const mime = String(req.headers["content-type"] ?? "").split(";")[0].trim();
      const permitido = TIPOS_PERMITIDOS[mime];
      const corpo = req.body;
      if (!permitido) {
        res.status(415).json({ error: "Envie apenas PDF ou imagem (PNG, JPG, WEBP, GIF)." });
        return;
      }
      if (!Buffer.isBuffer(corpo) || corpo.length === 0) {
        res.status(400).json({ error: "Arquivo vazio." });
        return;
      }
      if (!assinaturaValida(corpo, mime)) {
        res.status(400).json({ error: "O conteúdo do arquivo não corresponde ao tipo informado." });
        return;
      }

      const materiaId = texto(req.query.materia, 80);
      const titulo = texto(req.query.titulo, 200);
      if (!/^[a-z0-9-]+$/.test(materiaId) || !titulo) {
        res.status(400).json({ error: "Informe a matéria e o título." });
        return;
      }

      const id = crypto.randomUUID();
      const nomeArquivo = `${id}${permitido.ext}`;
      await fs.mkdir(MATERIALS_DIR, { recursive: true });
      await fs.writeFile(path.join(MATERIALS_DIR, nomeArquivo), corpo);

      const material: MaterialEnviado = {
        id,
        materiaId,
        titulo,
        descricao: texto(req.query.descricao, 1000),
        tipo: permitido.tipo,
        caminho: `${MATERIALS_URL}/${nomeArquivo}`,
        nomeOriginal: texto(req.query.nome, 200) || nomeArquivo,
        tamanho: corpo.length,
        enviadoEm: new Date().toISOString(),
      };
      await alterarIndice((lista) => {
        lista.push(material);
      });
      res.status(201).json(material);
    },
  );

  router.delete("/api/materiais/:id", exigirAdmin, async (req, res) => {
    const removido = await alterarIndice((lista) => {
      const idx = lista.findIndex((m) => m.id === req.params.id);
      return idx >= 0 ? lista.splice(idx, 1)[0] : undefined;
    });
    if (!removido) {
      res.status(404).json({ error: "Material não encontrado." });
      return;
    }
    await fs.rm(path.join(MATERIALS_DIR, path.basename(removido.caminho)), { force: true });
    res.json({ ok: true });
  });

  // Arquivos enviados: só nomes gerados pelo servidor (uuid + extensão);
  // o index.json e qualquer outro arquivo do diretório ficam inacessíveis.
  router.use(
    MATERIALS_URL,
    (req, res, next) => {
      if (!/^\/[0-9a-f-]{36}\.(pdf|png|jpg|webp|gif)$/.test(req.path)) {
        res.status(404).end();
        return;
      }
      next();
    },
    express.static(MATERIALS_DIR, {
      index: false,
      dotfiles: "deny",
      // Arquivo inexistente → 404 (sem cair no fallback da SPA)
      fallthrough: false,
      setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    }),
  );

  return router;
}
