import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ApostilasAdmin from "@/components/ApostilasAdmin";
import { materias, getMateria } from "@/data/materiais";
import type { MateriaisResponse, MaterialEnviado } from "@shared/api";
import { cn } from "@/lib/utils";
import { FileText, Image as ImageIcon, Loader2, LogOut, Trash2, Upload as UploadIcon, X } from "lucide-react";

const CHAVE_TOKEN = "admin-token";
const ACEITOS = "application/pdf,image/png,image/jpeg,image/webp,image/gif";

function lerToken(): string {
  try {
    return sessionStorage.getItem(CHAVE_TOKEN) ?? "";
  } catch {
    return "";
  }
}

function salvarToken(token: string) {
  try {
    if (token) sessionStorage.setItem(CHAVE_TOKEN, token);
    else sessionStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* sessionStorage indisponível: o login vale só até recarregar a página */
  }
}

async function mensagemDeErro(r: Response): Promise<string> {
  try {
    const d = await r.json();
    return d.error ?? `Erro ${r.status}`;
  } catch {
    return `Erro ${r.status}`;
  }
}

function formatarTamanho(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Login({ onEntrar }: { onEntrar: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    try {
      const r = await fetch("/api/admin/verificar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(await mensagemDeErro(r));
      onEntrar(token);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao entrar.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={entrar} className="max-w-md mx-auto rounded-3xl bg-white border border-neutral-200 p-8 shadow-sm">
      <h2 className="text-xl font-bold font-poppins mb-2">Acesso do administrador</h2>
      <p className="text-sm text-muted-foreground mb-6">Informe o token de administrador para enviar materiais.</p>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Token"
        autoComplete="current-password"
        className="w-full px-4 py-3 rounded-xl border border-neutral-300 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {erro && <p className="text-sm text-red-600 mb-4">{erro}</p>}
      <button
        type="submit"
        disabled={!token || carregando}
        className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors disabled:opacity-40"
      >
        {carregando ? "Verificando..." : "Entrar"}
      </button>
    </form>
  );
}

type ItemEnvio = {
  chave: string;
  arquivo: File;
  titulo: string;
  estado: "pendente" | "enviando" | "ok" | "erro";
  erro?: string;
};

function tituloDoArquivo(nome: string) {
  return nome.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function Painel({ token, onSair }: { token: string; onSair: () => void }) {
  const [materiaId, setMateriaId] = useState(materias[0]?.id ?? "");
  const [descricao, setDescricao] = useState("");
  const [itens, setItens] = useState<ItemEnvio[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [lista, setLista] = useState<MaterialEnviado[]>([]);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch("/api/materiais");
      const d: MateriaisResponse = await r.json();
      setLista([...d.materiais].reverse());
    } catch {
      setLista([]);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const adicionarArquivos = (files: FileList | null) => {
    if (!files?.length) return;
    const novos: ItemEnvio[] = Array.from(files).map((f) => ({
      chave: `${f.name}-${f.size}-${f.lastModified}-${Math.random()}`,
      arquivo: f,
      titulo: tituloDoArquivo(f.name),
      estado: "pendente",
    }));
    setItens((atual) => [...atual.filter((i) => i.estado !== "ok"), ...novos]);
    setMensagem(null);
    if (inputArquivo.current) inputArquivo.current.value = "";
  };

  const alterarItem = (chave: string, dados: Partial<ItemEnvio>) =>
    setItens((atual) => atual.map((i) => (i.chave === chave ? { ...i, ...dados } : i)));

  const pendentes = itens.filter((i) => i.estado === "pendente" || i.estado === "erro");

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (pendentes.length === 0) return;
    setEnviando(true);
    setMensagem(null);
    let ok = 0;
    let falhas = 0;

    // Envia um por vez: mantém o servidor leve e mostra o andamento de cada arquivo.
    for (const item of pendentes) {
      if (!item.titulo.trim()) {
        alterarItem(item.chave, { estado: "erro", erro: "Informe um título." });
        falhas++;
        continue;
      }
      alterarItem(item.chave, { estado: "enviando", erro: undefined });
      const params = new URLSearchParams({
        materia: materiaId,
        titulo: item.titulo.trim(),
        descricao,
        nome: item.arquivo.name,
      });
      try {
        const r = await fetch(`/api/materiais?${params}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": item.arquivo.type || "application/octet-stream",
          },
          body: item.arquivo,
        });
        if (r.status === 401) {
          onSair();
          return;
        }
        if (!r.ok) throw new Error(await mensagemDeErro(r));
        alterarItem(item.chave, { estado: "ok" });
        ok++;
      } catch (err) {
        alterarItem(item.chave, {
          estado: "erro",
          erro: err instanceof Error ? err.message : "Falha no envio.",
        });
        falhas++;
      }
    }

    setEnviando(false);
    setMensagem(
      falhas === 0
        ? { tipo: "ok", texto: `${ok} arquivo(s) enviado(s) com sucesso.` }
        : { tipo: "erro", texto: `${ok} enviado(s), ${falhas} com erro. Corrija e clique em Enviar de novo.` },
    );
    if (ok > 0) carregar();
  };

  const remover = async (m: MaterialEnviado) => {
    if (!window.confirm(`Remover "${m.titulo}"? O arquivo será apagado do servidor.`)) return;
    const r = await fetch(`/api/materiais/${m.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.status === 401) return onSair();
    if (!r.ok) {
      setMensagem({ tipo: "erro", texto: await mensagemDeErro(r) });
      return;
    }
    carregar();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <form onSubmit={enviar} className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-poppins">Enviar materiais</h2>
          <button
            type="button"
            onClick={onSair}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-1.5 text-sm font-medium">
            Matéria
            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              disabled={enviando}
              className="px-4 py-3 rounded-xl border border-neutral-300 bg-white font-normal"
            >
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Arquivos (PDF ou imagem PNG, JPG, WEBP, GIF — até 25 MB cada; selecione vários de uma vez)
            <input
              ref={inputArquivo}
              type="file"
              accept={ACEITOS}
              multiple
              disabled={enviando}
              onChange={(e) => adicionarArquivos(e.target.files)}
              className="px-4 py-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 font-normal file:mr-4 file:px-4 file:py-1.5 file:rounded-full file:border-0 file:bg-primary file:text-white file:font-semibold"
            />
          </label>

          {itens.length > 0 && (
            <ul className="grid gap-2">
              {itens.map((item) => (
                <li
                  key={item.chave}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl border",
                    item.estado === "ok" && "border-green-200 bg-green-50",
                    item.estado === "erro" && "border-red-200 bg-red-50",
                    (item.estado === "pendente" || item.estado === "enviando") && "border-neutral-200",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 sm:w-56 flex-shrink-0">
                    {item.arquivo.type === "application/pdf" ? (
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground truncate" title={item.arquivo.name}>
                      {item.arquivo.name} · {formatarTamanho(item.arquivo.size)}
                    </span>
                  </div>
                  <input
                    value={item.titulo}
                    onChange={(e) => alterarItem(item.chave, { titulo: e.target.value })}
                    disabled={enviando || item.estado === "ok"}
                    maxLength={200}
                    placeholder="Título"
                    aria-label={`Título de ${item.arquivo.name}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
                  />
                  <div className="flex items-center gap-2 sm:w-40 justify-end text-xs">
                    {item.estado === "enviando" && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Loader2 className="w-3 h-3 animate-spin" /> Enviando
                      </span>
                    )}
                    {item.estado === "ok" && <span className="text-green-700 font-semibold">Enviado</span>}
                    {item.estado === "erro" && (
                      <span className="text-red-700" title={item.erro}>
                        {item.erro}
                      </span>
                    )}
                    {(item.estado === "pendente" || item.estado === "erro") && !enviando && (
                      <button
                        type="button"
                        onClick={() => setItens((atual) => atual.filter((i) => i.chave !== item.chave))}
                        className="p-1 rounded-full text-muted-foreground hover:bg-neutral-100"
                        aria-label={`Tirar ${item.arquivo.name} da lista`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <label className="grid gap-1.5 text-sm font-medium">
            Descrição (opcional — vale para todos os arquivos deste envio)
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={enviando}
              maxLength={1000}
              rows={2}
              className="px-4 py-3 rounded-xl border border-neutral-300 font-normal"
            />
          </label>
        </div>

        {mensagem && (
          <p
            className={cn(
              "mt-5 p-3 rounded-xl text-sm",
              mensagem.tipo === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700",
            )}
          >
            {mensagem.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={pendentes.length === 0 || enviando}
          className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
          {enviando ? "Enviando..." : `Enviar ${pendentes.length || ""} arquivo(s)`}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold font-poppins mb-4">Materiais enviados ({lista.length})</h2>
        {lista.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum material enviado ainda.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
            {lista.map((m) => (
              <li key={m.id} className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  {m.tipo === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={m.caminho}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary truncate block"
                  >
                    {m.titulo}
                  </a>
                  <p className="text-xs text-muted-foreground truncate">
                    {getMateria(m.materiaId)?.nome ?? m.materiaId} · {formatarTamanho(m.tamanho)} ·{" "}
                    {new Date(m.enviadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => remover(m)}
                  className="p-2 rounded-full text-red-600 hover:bg-red-50"
                  aria-label={`Remover ${m.titulo}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ApostilasAdmin token={token} onSair={onSair} versaoMateriais={lista} />
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(lerToken);

  const entrar = (t: string) => {
    salvarToken(t);
    setToken(t);
  };
  const sair = () => {
    salvarToken("");
    setToken("");
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold font-poppins mb-3">Administração de Materiais</h1>
          <p className="text-white/90">
            Os arquivos enviados aparecem em{" "}
            <Link to="/upload" className="underline font-semibold">
              Materiais
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="py-14 bg-neutral-50/50 min-h-[50vh]">
        <div className="px-4 sm:px-6 lg:px-8">
          {token ? <Painel token={token} onSair={sair} /> : <Login onEntrar={entrar} />}
        </div>
      </section>
    </Layout>
  );
}
