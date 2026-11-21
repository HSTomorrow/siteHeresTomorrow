import { useEffect, useMemo, useState } from "react";
import { BookOpen, Download, ExternalLink, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { materias, getMateria, type ArquivoMaterial } from "@/data/materiais";
import { cn } from "@/lib/utils";
import type { MateriaisResponse } from "@shared/api";

type Documento = ArquivoMaterial & { materiaId: string };

function nomeParaDownload(doc: Documento) {
  return doc.nomeOriginal ?? doc.caminho.split("/").pop() ?? doc.titulo;
}

/**
 * Botão "Consulta": abre um painel lateral com todos os materiais (os do site
 * e os enviados pelo admin) para consultar sem sair do simulado.
 */
export default function ConsultaDocumentos({ materiaAtual }: { materiaAtual?: string }) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [enviados, setEnviados] = useState<Documento[]>([]);
  const [filtro, setFiltro] = useState<string>(materiaAtual ?? "todas");
  const [selecionado, setSelecionado] = useState<Documento | null>(null);

  // Recarrega a lista sempre que o painel abre (pega uploads recentes)
  useEffect(() => {
    if (!aberto) return;
    setCarregando(true);
    fetch("/api/materiais")
      .then((r) => (r.ok ? r.json() : { materiais: [] }))
      .then((d: MateriaisResponse) => setEnviados(d.materiais))
      .catch(() => setEnviados([]))
      .finally(() => setCarregando(false));
  }, [aberto]);

  const documentos = useMemo<Documento[]>(
    () => [
      ...materias.flatMap((m) => m.arquivos.map((a) => ({ ...a, materiaId: m.id }))),
      ...enviados,
    ],
    [enviados],
  );

  // Se a matéria atual não tem documentos, mostra todos
  useEffect(() => {
    if (!aberto || carregando) return;
    if (filtro !== "todas" && !documentos.some((d) => d.materiaId === filtro)) setFiltro("todas");
  }, [aberto, carregando, documentos, filtro]);

  const visiveis = documentos.filter((d) => filtro === "todas" || d.materiaId === filtro);
  const grupos = materias
    .map((m) => ({ materia: m, docs: visiveis.filter((d) => d.materiaId === m.id) }))
    .filter((g) => g.docs.length > 0);

  return (
    <Sheet
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        if (!v) setSelecionado(null);
      }}
    >
      <SheetTrigger asChild>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
          <BookOpen className="w-4 h-4" />
          Consulta
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-neutral-200 text-left">
          <SheetTitle className="font-poppins">Consulta de materiais</SheetTitle>
          <SheetDescription>
            Todos os documentos disponíveis. Clique em um para ler aqui sem sair do simulado.
          </SheetDescription>
          <select
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setSelecionado(null);
            }}
            className="mt-2 px-3 py-2 rounded-xl border border-neutral-300 bg-white text-sm"
            aria-label="Filtrar por matéria"
          >
            <option value="todas">Todas as matérias</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {selecionado ? (
            <div className="flex flex-col h-full">
              <div className="flex flex-wrap items-center gap-2 p-4 border-b border-neutral-200">
                <button
                  onClick={() => setSelecionado(null)}
                  className="text-sm text-muted-foreground hover:text-primary mr-auto"
                >
                  ← Voltar à lista
                </button>
                <a
                  href={selecionado.caminho}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-300 text-xs font-semibold hover:bg-neutral-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Nova aba
                </a>
                <a
                  href={selecionado.caminho}
                  download={nomeParaDownload(selecionado)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-dark"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </a>
              </div>
              <p className="px-4 pt-3 text-sm font-semibold">{selecionado.titulo}</p>
              <div className="flex-1 p-4">
                {selecionado.tipo === "pdf" ? (
                  <>
                    <iframe
                      src={selecionado.caminho}
                      title={selecionado.titulo}
                      className="w-full h-[70vh] rounded-xl border border-neutral-200 bg-neutral-50"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Se o PDF não aparecer (comum no celular), use "Nova aba".
                    </p>
                  </>
                ) : (
                  <img
                    src={selecionado.caminho}
                    alt={selecionado.titulo}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 object-contain"
                  />
                )}
              </div>
            </div>
          ) : carregando ? (
            <p className="p-6 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando documentos...
            </p>
          ) : grupos.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhum documento para esta matéria ainda. Os arquivos enviados pelo administrador
              aparecem aqui.
            </p>
          ) : (
            <div className="p-4 space-y-6">
              {grupos.map(({ materia, docs }) => (
                <div key={materia.id}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    {materia.nome} ({docs.length})
                  </h3>
                  <ul className="grid gap-2">
                    {docs.map((d) => (
                      <li key={d.caminho}>
                        <button
                          onClick={() => setSelecionado(d)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 text-left",
                            "hover:border-primary hover:bg-primary/5 transition-colors",
                          )}
                        >
                          <span className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            {d.tipo === "pdf" ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <ImageIcon className="w-4 h-4" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-sm truncate">{d.titulo}</span>
                            {d.descricao && (
                              <span className="block text-xs text-muted-foreground truncate">
                                {d.descricao}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {materiaAtual && getMateria(materiaAtual) && (
          <p className="px-5 py-3 border-t border-neutral-200 text-xs text-muted-foreground">
            Dica: o simulado continua de onde você parou ao fechar este painel.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
