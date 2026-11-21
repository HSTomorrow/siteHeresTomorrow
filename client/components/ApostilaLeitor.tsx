import { useEffect, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Search } from "lucide-react";
import type { ApostilaResponse } from "@shared/api";

/** Minúsculas e sem acentos, para a busca achar "credito" em "crédito". */
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Tabelas largas rolam na horizontal em vez de estourar o painel.
// (react-markdown não interpreta HTML do texto: o conteúdo é sempre exibido com segurança.)
const componentes: Components = {
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

/** Lê e pesquisa a apostila (transcrição dos materiais) de uma matéria. */
export default function ApostilaLeitor({ materiaId }: { materiaId: string }) {
  const [apostila, setApostila] = useState<ApostilaResponse | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    setApostila(null);
    setErro("");
    fetch(`/api/apostilas/${encodeURIComponent(materiaId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erro ${r.status}`))))
      .then((d: ApostilaResponse) => ativo && setApostila(d))
      .catch(() => ativo && setErro("Não foi possível carregar a apostila."));
    return () => {
      ativo = false;
    };
  }, [materiaId]);

  const termo = normalizar(busca.trim());
  const secoes = useMemo(
    () =>
      (apostila?.secoes ?? [])
        .map((s, i) => ({ ...s, ancora: `apostila-secao-${i}` }))
        .filter((s) => !termo || normalizar(`${s.titulo}\n${s.markdown}`).includes(termo)),
    [apostila, termo],
  );

  if (erro) return <p className="p-4 text-sm text-red-700">{erro}</p>;
  if (!apostila) {
    return (
      <p className="p-4 text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando apostila...
      </p>
    );
  }

  return (
    <div className="p-4">
      <label className="relative block mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar na apostila (ex.: crédito de PIS)"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-sm"
        />
      </label>

      {apostila.pendentes.length > 0 && (
        <p className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-xs">
          Ainda sem transcrição: {apostila.pendentes.join(", ")}. Consulte esses arquivos na lista de
          documentos.
        </p>
      )}

      {termo && (
        <p className="mb-4 text-xs text-muted-foreground">
          {secoes.length === 0
            ? "Nenhuma seção contém esse termo."
            : `${secoes.length} seção(ões) com "${busca.trim()}". Use Ctrl+F para achar o trecho.`}
        </p>
      )}

      {secoes.length > 1 && (
        <nav className="mb-6 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Índice</p>
          <ol className="grid gap-1 text-sm list-decimal list-inside">
            {secoes.map((s) => (
              <li key={s.ancora}>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(s.ancora)?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-primary text-left"
                >
                  {s.titulo}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-10">
        {secoes.map((s) => (
          <article key={s.ancora} id={s.ancora} className="scroll-mt-4">
            <h2 className="text-lg font-bold font-poppins mb-3 pb-2 border-b border-neutral-200">
              {s.titulo}
            </h2>
            <div className="prose prose-sm max-w-none prose-table:text-xs prose-th:bg-neutral-100 prose-th:px-2 prose-td:px-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentes}>
                {s.markdown}
              </ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
