import { useEffect, useMemo, useState } from "react";
import type { MateriaisResponse, MaterialEnviado } from "@shared/api";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { materias, type ArquivoMaterial } from "@/data/materiais";
import { getQuestoesDaMateria } from "@/data/questoes";
import { cn } from "@/lib/utils";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  ClipboardCheck,
  Search,
} from "lucide-react";

type FiltroTipo = "todos" | "pdf" | "imagem";

function nomeDoArquivo(caminho: string) {
  return caminho.split("/").pop() ?? caminho;
}

function CartaoArquivo({ arquivo }: { arquivo: ArquivoMaterial }) {
  const isPdf = arquivo.tipo === "pdf";

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-40 bg-neutral-50 flex items-center justify-center border-b border-neutral-200">
        {isPdf ? (
          <FileText className="w-16 h-16 text-primary/70" />
        ) : (
          <img
            src={arquivo.caminho}
            alt={arquivo.titulo}
            loading="lazy"
            className="h-full w-full object-contain p-2"
          />
        )}
      </div>

      <div className="flex flex-col flex-grow p-5">
        <span
          className={cn(
            "self-start inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-3",
            isPdf ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700",
          )}
        >
          {isPdf ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          {isPdf ? "PDF" : "Imagem"}
        </span>
        <h3 className="font-semibold text-foreground mb-2 leading-snug">{arquivo.titulo}</h3>
        <p className="text-sm text-muted-foreground mb-5 flex-grow">{arquivo.descricao}</p>

        <div className="flex gap-2">
          <a
            href={arquivo.caminho}
            download={arquivo.nomeOriginal ?? nomeDoArquivo(arquivo.caminho)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar
          </a>
          <a
            href={arquivo.caminho}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-300 text-sm font-semibold rounded-full hover:bg-neutral-100 transition-colors"
            aria-label={`Visualizar ${arquivo.titulo}`}
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Upload() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [enviados, setEnviados] = useState<MaterialEnviado[]>([]);

  useEffect(() => {
    fetch("/api/materiais")
      .then((r) => (r.ok ? r.json() : { materiais: [] }))
      .then((d: MateriaisResponse) => setEnviados(d.materiais))
      .catch(() => setEnviados([]));
  }, []);

  const materiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return materias
      .map((m) => ({
        ...m,
        arquivos: [
          ...m.arquivos,
          ...enviados.filter((e) => e.materiaId === m.id),
        ].filter(
          (a) =>
            (tipo === "todos" || a.tipo === tipo) &&
            (!termo ||
              a.titulo.toLowerCase().includes(termo) ||
              a.descricao.toLowerCase().includes(termo) ||
              m.nome.toLowerCase().includes(termo)),
        ),
      }))
      .filter((m) => m.arquivos.length > 0);
  }, [busca, tipo, enviados]);

  return (
    <Layout>
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-20 sm:py-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 font-poppins">Materiais de Estudo</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Baixe apostilas em PDF e imagens de apoio. Depois, teste seus conhecimentos no simulado
            de cada matéria.
          </p>
          <Link
            to="/prova"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors"
          >
            <ClipboardCheck className="w-5 h-5" />
            Ir para o simulado
          </Link>
        </div>
      </section>

      <section className="py-16 bg-neutral-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar material..."
                className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["todos", "Todos"],
                  ["pdf", "PDFs"],
                  ["imagem", "Imagens"],
                ] as const
              ).map(([valor, rotulo]) => (
                <button
                  key={valor}
                  onClick={() => setTipo(valor)}
                  className={cn(
                    "px-5 py-3 rounded-full text-sm font-semibold transition-colors",
                    tipo === valor
                      ? "bg-primary text-white"
                      : "bg-white border border-neutral-300 hover:bg-neutral-100",
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          {materiasFiltradas.length === 0 && (
            <p className="text-center text-muted-foreground py-16">
              Nenhum material encontrado para esse filtro.
            </p>
          )}

          <div className="space-y-16">
            {materiasFiltradas.map((materia) => {
              const totalQuestoes = getQuestoesDaMateria(materia.id).length;
              return (
                <div key={materia.id}>
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-poppins mb-2">
                        {materia.nome}
                      </h2>
                      <p className="text-muted-foreground max-w-2xl">{materia.descricao}</p>
                    </div>
                    {totalQuestoes > 0 && (
                      <Link
                        to={`/prova?materia=${materia.id}`}
                        className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 border-2 border-primary text-primary text-sm font-semibold rounded-full hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        Fazer prova ({totalQuestoes} questões)
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materia.arquivos.map((arquivo) => (
                      <CartaoArquivo key={arquivo.caminho} arquivo={arquivo} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
