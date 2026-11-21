import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { materias, getMateria } from "@/data/materiais";
import { getQuestoesDaMateria, type PassoHP12C, type Questao } from "@/data/questoes";
import { cn } from "@/lib/utils";
import type {
  QuestaoGerada,
  QuestoesResponse,
  ReprocessamentoStatus,
} from "@shared/api";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

/* ───────────── Teclas da HP 12C ───────────── */

const TECLAS_HP = new Set([
  "f", "g", "n", "i", "PV", "PMT", "FV", "CHS", "ENTER", "CLEAR FIN", "CLEAR REG",
  "CLx", "INT", "NPV", "IRR", "CF0", "CFj", "Nj", "BEG", "END", "LN", "yˣ", "+", "−", "×", "÷",
  "STO", "RCL", "EEX", "%", "12÷", "12×", "D.MY", "M.DY", "ΔDYS", "DATE", "x≷y",
]);

function Tecla({ rotulo }: { rotulo: string }) {
  const corPrefixo =
    rotulo === "f"
      ? "bg-amber-500 text-white border-amber-600"
      : rotulo === "g"
        ? "bg-sky-600 text-white border-sky-700"
        : "bg-neutral-800 text-white border-neutral-950";
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-md border-b-2 text-xs font-bold font-mono shadow-sm",
        corPrefixo,
      )}
    >
      {rotulo}
    </kbd>
  );
}

function SequenciaTeclas({ teclas }: { teclas: string }) {
  let texto = teclas.replace(/CLEAR (FIN|REG)/g, "CLEAR $1");
  let prefixo: string | null = null;
  if (texto.startsWith("Alternativa:")) {
    prefixo = "Alternativa:";
    texto = texto.slice(prefixo.length);
  }
  if (texto.startsWith("Ex.:")) {
    prefixo = "Ex.:";
    texto = texto.slice(prefixo.length);
  }
  const tokens = texto.trim().split(/\s+/);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {prefixo && <span className="text-xs font-semibold text-muted-foreground mr-1">{prefixo}</span>}
      {tokens.map((tk, idx) =>
        TECLAS_HP.has(tk) ? (
          <Tecla key={idx} rotulo={tk} />
        ) : (
          <span key={idx} className="font-mono text-sm font-semibold text-foreground px-0.5">
            {tk}
          </span>
        ),
      )}
    </div>
  );
}

function PassoAPassoHP12C({ passos }: { passos: PassoHP12C[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Como calcular na HP 12C</h4>
      </div>
      <ol className="space-y-3">
        {passos.map((p, idx) => (
          <li key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="hidden sm:flex w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <div className="sm:min-w-[16rem]">
              <SequenciaTeclas teclas={p.teclas} />
            </div>
            <span className="text-sm text-muted-foreground">{p.descricao}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">
        A HP 12C usa notação RPN: digite o número e pressione a tecla da operação. Convenção de
        sinais: dinheiro que sai é negativo (CHS), dinheiro que entra é positivo.
      </p>
    </div>
  );
}

/* ───────────── Prova ───────────── */

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const LETRAS = ["A", "B", "C", "D", "E", "F"];

function SeletorMateria({ geradas }: { geradas: QuestaoGerada[] }) {
  const total = (id: string) =>
    getQuestoesDaMateria(id).length + geradas.filter((g) => g.materiaId === id).length;
  const disponiveis = materias.filter((m) => total(m.id) > 0);
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold font-poppins mb-6 text-center">Escolha a matéria</h2>
      <div className="grid gap-4">
        {disponiveis.map((m) => (
          <Link
            key={m.id}
            to={`/prova?materia=${m.id}`}
            className="flex items-center justify-between gap-4 p-6 rounded-2xl border border-neutral-200 bg-white hover:border-primary hover:shadow-md transition-all"
          >
            <div>
              <h3 className="font-semibold text-lg mb-1">{m.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {total(m.id)} questões
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Simulado({ todas }: { todas: Questao[] }) {
  const [rodada, setRodada] = useState(0);
  const questoes = useMemo<Questao[]>(
    () => embaralhar(todas),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todas, rodada],
  );
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});

  const total = questoes.length;
  const finalizado = indice >= total;
  const questao = questoes[indice];
  const respondida = questao ? respostas[questao.id] !== undefined : false;
  const acertos = questoes.filter((q) => respostas[q.id] === q.correta).length;

  const reiniciar = () => {
    setRodada((r) => r + 1);
    setIndice(0);
    setSelecionada(null);
    setRespostas({});
  };

  const confirmar = () => {
    if (selecionada === null || !questao) return;
    setRespostas((r) => ({ ...r, [questao.id]: selecionada }));
  };

  const proxima = () => {
    setIndice((i) => i + 1);
    setSelecionada(null);
  };

  if (total === 0) {
    return <p className="text-center text-muted-foreground">Ainda não há questões para esta matéria.</p>;
  }

  if (finalizado) {
    const pct = Math.round((acertos / total) * 100);
    const erradas = questoes.filter((q) => respostas[q.id] !== q.correta);
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center p-10 rounded-3xl bg-white border border-neutral-200 shadow-sm mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Resultado
          </p>
          <p className="text-6xl font-bold font-poppins text-primary mb-2">{pct}%</p>
          <p className="text-lg mb-8">
            Você acertou <strong>{acertos}</strong> de <strong>{total}</strong> questões.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={reiniciar}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer prova
            </button>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 font-semibold rounded-full hover:bg-neutral-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Revisar materiais
            </Link>
          </div>
        </div>

        {erradas.length > 0 && (
          <div>
            <h3 className="text-xl font-bold font-poppins mb-4">Revise as questões que você errou</h3>
            <div className="space-y-4">
              {erradas.map((q) => (
                <details key={q.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <summary className="cursor-pointer font-medium">{q.enunciado}</summary>
                  <p className="mt-4 text-sm">
                    <span className="text-red-600 font-semibold">Sua resposta:</span>{" "}
                    {q.alternativas[respostas[q.id]]}
                  </p>
                  <p className="text-sm">
                    <span className="text-green-700 font-semibold">Resposta correta:</span>{" "}
                    {q.alternativas[q.correta]}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{q.fundamentacao}</p>
                  {q.hp12c && <PassoAPassoHP12C passos={q.hp12c} />}
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const respostaDada = respostas[questao.id];
  const acertou = respostaDada === questao.correta;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progresso */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>
          Questão {indice + 1} de {total}
        </span>
        <span>
          {acertos} acerto{acertos === 1 ? "" : "s"}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 mb-8 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((indice + (respondida ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-6 sm:p-10">
        {questao.origem === "ia" && (
          <span className="inline-flex items-center gap-1 mb-4 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold uppercase tracking-wide">
            <Sparkles className="w-3 h-3" /> Gerada por IA
          </span>
        )}
        <h2 className="text-lg sm:text-xl font-semibold leading-relaxed mb-8">{questao.enunciado}</h2>

        <div className="space-y-3" role="radiogroup">
          {questao.alternativas.map((alt, idx) => {
            const ehCorreta = idx === questao.correta;
            const ehEscolhida = respondida ? idx === respostaDada : idx === selecionada;
            return (
              <button
                key={idx}
                role="radio"
                aria-checked={ehEscolhida}
                disabled={respondida}
                onClick={() => setSelecionada(idx)}
                className={cn(
                  "w-full flex items-center gap-4 text-left p-4 rounded-xl border-2 transition-all",
                  !respondida && ehEscolhida && "border-primary bg-primary/5",
                  !respondida && !ehEscolhida && "border-neutral-200 hover:border-neutral-400",
                  respondida && ehCorreta && "border-green-600 bg-green-50",
                  respondida && ehEscolhida && !ehCorreta && "border-red-500 bg-red-50",
                  respondida && !ehCorreta && !ehEscolhida && "border-neutral-200 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                    respondida && ehCorreta
                      ? "bg-green-600 text-white"
                      : respondida && ehEscolhida
                        ? "bg-red-500 text-white"
                        : ehEscolhida
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-foreground",
                  )}
                >
                  {LETRAS[idx]}
                </span>
                <span className="flex-1">{alt}</span>
                {respondida && ehCorreta && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {respondida && ehEscolhida && !ehCorreta && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {respondida && (
          <div className="mt-8" aria-live="polite">
            <div
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl font-semibold",
                acertou ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800",
              )}
            >
              {acertou ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {acertou
                ? "Resposta correta!"
                : `Resposta incorreta. A alternativa correta é a ${LETRAS[questao.correta]}.`}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Fundamentação</h4>
              <p className="text-muted-foreground leading-relaxed">{questao.fundamentacao}</p>
            </div>

            {questao.hp12c && <PassoAPassoHP12C passos={questao.hp12c} />}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          {!respondida ? (
            <button
              onClick={confirmar}
              disabled={selecionada === null}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Responder
            </button>
          ) : (
            <button
              onClick={proxima}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors"
            >
              {indice + 1 < total ? "Próxima questão" : "Ver resultado"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Reprocessamento (gera questões novas com IA) ───────────── */

const CHAVE_TOKEN = "admin-token";

function lerToken(): string {
  try {
    return sessionStorage.getItem(CHAVE_TOKEN) ?? "";
  } catch {
    return "";
  }
}

function salvarToken(token: string) {
  try {
    sessionStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    /* sem sessionStorage: o token vale só nesta tela */
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

function PainelReprocessamento({
  materiaId,
  temGeradas,
  onConcluido,
}: {
  materiaId: string;
  temGeradas: boolean;
  onConcluido: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [token, setToken] = useState(lerToken);
  const [quantidade, setQuantidade] = useState(10);
  const [modo, setModo] = useState<"substituir" | "adicionar">("substituir");
  const [status, setStatus] = useState<ReprocessamentoStatus | null>(null);
  const [erro, setErro] = useState("");
  const processando = status?.estado === "processando";

  // Acompanha o job até terminar
  useEffect(() => {
    if (!status || status.estado !== "processando") return;
    const timer = window.setInterval(async () => {
      try {
        const r = await fetch(`/api/questoes/reprocessar/${status.id}`);
        if (!r.ok) throw new Error(await mensagemDeErro(r));
        const atual: ReprocessamentoStatus = await r.json();
        setStatus(atual);
        if (atual.estado === "concluido") onConcluido();
      } catch (err) {
        setStatus(null);
        setErro(err instanceof Error ? err.message : "Falha ao consultar o andamento.");
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [status, onConcluido]);

  const iniciar = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setStatus(null);
    try {
      const r = await fetch("/api/questoes/reprocessar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ materia: materiaId, quantidade, modo }),
      });
      if (!r.ok) throw new Error(await mensagemDeErro(r));
      salvarToken(token);
      setStatus(await r.json());
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao iniciar o reprocessamento.");
    }
  };

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-300 text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reprocessamento
      </button>
    );
  }

  return (
    <form onSubmit={iniciar} className="w-full rounded-2xl border border-violet-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" /> Reprocessamento
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gera questões novas com IA a partir dos PDFs e imagens desta matéria. As questões fixas
            continuam no simulado. Pode levar alguns minutos.
          </p>
        </div>
        {!processando && (
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Fechar
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">
          Quantidade
          <select
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            disabled={processando}
            className="px-3 py-2.5 rounded-xl border border-neutral-300 bg-white font-normal"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} questões
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          O que fazer
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as "substituir" | "adicionar")}
            disabled={processando}
            className="px-3 py-2.5 rounded-xl border border-neutral-300 bg-white font-normal"
          >
            <option value="substituir">{temGeradas ? "Refazer (substitui as geradas)" : "Criar novas"}</option>
            <option value="adicionar">Adicionar às já geradas</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Token de administrador
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={processando}
            autoComplete="current-password"
            className="px-3 py-2.5 rounded-xl border border-neutral-300 font-normal"
          />
        </label>
      </div>

      {erro && <p className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{erro}</p>}

      {status?.estado === "processando" && (
        <p className="mt-4 p-3 rounded-xl bg-violet-50 text-violet-800 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando questões a partir dos materiais... você pode continuar nesta página.
        </p>
      )}
      {status?.estado === "erro" && (
        <p className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{status.mensagem}</p>
      )}
      {status?.estado === "concluido" && (
        <div className="mt-4 p-3 rounded-xl bg-green-50 text-green-800 text-sm">
          <p className="font-semibold">{status.geradas} questões geradas. O simulado foi reiniciado com elas.</p>
          {!!status.arquivosUsados?.length && <p className="mt-1">Materiais usados: {status.arquivosUsados.join("; ")}</p>}
        </div>
      )}
      {!!status?.arquivosIgnorados?.length && (
        <p className="mt-2 text-xs text-muted-foreground">Ignorados: {status.arquivosIgnorados.join("; ")}</p>
      )}

      <button
        type="submit"
        disabled={!token || processando}
        className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-full hover:bg-violet-700 transition-colors disabled:opacity-40"
      >
        {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {processando ? "Processando..." : "Gerar questões"}
      </button>
    </form>
  );
}

export default function Prova() {
  const [searchParams] = useSearchParams();
  const materia = getMateria(searchParams.get("materia"));
  const [geradas, setGeradas] = useState<QuestaoGerada[]>([]);
  const [versao, setVersao] = useState(0);

  const carregarGeradas = useCallback(async () => {
    try {
      const r = await fetch("/api/questoes");
      const d: QuestoesResponse = await r.json();
      setGeradas(d.questoes ?? []);
    } catch {
      setGeradas([]);
    }
  }, []);

  useEffect(() => {
    carregarGeradas();
  }, [carregarGeradas]);

  const aposReprocessar = useCallback(async () => {
    await carregarGeradas();
    setVersao((v) => v + 1);
  }, [carregarGeradas]);

  const todas = useMemo<Questao[]>(
    () =>
      materia
        ? [...getQuestoesDaMateria(materia.id), ...geradas.filter((g) => g.materiaId === materia.id)]
        : [],
    [materia, geradas],
  );
  const temGeradas = !!materia && geradas.some((g) => g.materiaId === materia.id);

  return (
    <Layout>
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-poppins">
            {materia ? `Simulado: ${materia.nome}` : "Simulado"}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Responda às questões sobre os materiais de estudo. A cada resposta você vê se acertou e
            a fundamentação{materia?.id === "matematica-financeira" ? ", incluindo o cálculo na HP 12C" : ""}.
          </p>
        </div>
      </section>

      <section className="py-14 bg-neutral-50/50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {materia && (
            <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/prova"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Trocar matéria
              </Link>
              <PainelReprocessamento
                key={materia.id}
                materiaId={materia.id}
                temGeradas={temGeradas}
                onConcluido={aposReprocessar}
              />
            </div>
          )}
          {materia ? (
            <Simulado key={`${materia.id}-${versao}`} todas={todas} />
          ) : (
            <SeletorMateria geradas={geradas} />
          )}
        </div>
      </section>
    </Layout>
  );
}
