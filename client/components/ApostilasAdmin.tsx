import { useCallback, useEffect, useState } from "react";
import { BookText, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { materias } from "@/data/materiais";
import { cn } from "@/lib/utils";
import type { ApostilaResumo, ApostilasResponse } from "@shared/api";

async function mensagemDeErro(r: Response): Promise<string> {
  try {
    const d = await r.json();
    return d.error ?? `Erro ${r.status}`;
  } catch {
    return `Erro ${r.status}`;
  }
}

/**
 * /admin → "Apostilas": transcreve os materiais de cada matéria em texto
 * (uma vez por arquivo). A apostila aparece na Consulta e deixa o
 * Reprocessamento mais barato.
 */
export default function ApostilasAdmin({
  token,
  onSair,
  versaoMateriais,
}: {
  token: string;
  onSair: () => void;
  /** Muda quando a lista de materiais muda (upload/remoção): recarrega os pendentes. */
  versaoMateriais?: unknown;
}) {
  const [resumos, setResumos] = useState<ApostilaResumo[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    try {
      const r = await fetch("/api/apostilas");
      const d: ApostilasResponse = await r.json();
      setResumos(d.apostilas);
    } catch {
      /* mantém a lista anterior */
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar, versaoMateriais]);

  // Enquanto alguma apostila estiver sendo gerada, atualiza o andamento.
  const gerando = resumos.some((r) => r.geracao?.estado === "processando");
  useEffect(() => {
    if (!gerando) return;
    const t = setInterval(carregar, 4000);
    return () => clearInterval(t);
  }, [gerando, carregar]);

  const gerar = async (materiaId: string) => {
    setErros((e) => ({ ...e, [materiaId]: "" }));
    const r = await fetch(`/api/apostilas/${encodeURIComponent(materiaId)}/gerar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.status === 401) return onSair();
    if (!r.ok) {
      const msg = await mensagemDeErro(r);
      setErros((e) => ({ ...e, [materiaId]: msg }));
      return;
    }
    carregar();
  };

  return (
    <div>
      <h2 className="text-xl font-bold font-poppins mb-1">Apostilas</h2>
      <p className="text-sm text-muted-foreground mb-4">
        O Claude transcreve cada PDF e imagem da matéria em texto, uma única vez por arquivo. A apostila
        aparece na Consulta, com índice e busca, e o Reprocessamento passa a usar o texto no lugar dos
        arquivos, o que gasta bem menos créditos. Ao enviar arquivos novos, clique em atualizar: só os
        novos são transcritos.
      </p>
      <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
        {materias.map((m) => {
          const r = resumos.find((x) => x.materiaId === m.id);
          const total = (r?.secoes ?? 0) + (r?.pendentes.length ?? 0);
          const g = r?.geracao;
          const processando = g?.estado === "processando";
          const atualizada = !!r && total > 0 && r.pendentes.length === 0;
          return (
            <li key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <BookText className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-medium">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {total === 0
                      ? "Nenhum PDF ou imagem enviado."
                      : `${r?.secoes ?? 0} de ${total} arquivo(s) transcrito(s)`}
                  </p>
                  {processando && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {g.total > 0
                        ? `Transcrevendo ${Math.min(g.concluidos + 1, g.total)} de ${g.total}${g.atual ? `: ${g.atual}` : ""}`
                        : "Preparando..."}
                    </p>
                  )}
                  {!processando && g?.mensagem && (
                    <p
                      className={cn(
                        "text-xs mt-1",
                        g.estado === "erro" ? "text-red-700" : "text-green-700",
                      )}
                    >
                      {g.mensagem}
                    </p>
                  )}
                  {!processando && g?.falhas && g.falhas.length > 0 && (
                    <p className="text-xs mt-1 text-amber-700">
                      Não transcritos (continuam sendo usados como arquivo): {g.falhas.join("; ")}
                    </p>
                  )}
                  {erros[m.id] && <p className="text-xs mt-1 text-red-700">{erros[m.id]}</p>}
                </div>
              </div>
              {atualizada && !processando ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 sm:w-44 justify-end">
                  <CheckCircle2 className="w-4 h-4" /> Atualizada
                </span>
              ) : (
                <button
                  onClick={() => gerar(m.id)}
                  disabled={total === 0 || processando}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-dark disabled:opacity-40 sm:w-44"
                >
                  {processando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {(r?.secoes ?? 0) > 0
                    ? `Atualizar (${r?.pendentes.length} novo(s))`
                    : "Gerar apostila"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
