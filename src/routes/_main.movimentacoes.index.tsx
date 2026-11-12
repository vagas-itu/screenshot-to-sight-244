import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { TxRow, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { fmtDayLabel, masked } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/_main/movimentacoes/")({
  head: pageHead("Movimentações", "Histórico de entradas, saídas e contribuições para sonhos."),
  component: History,
});

const PERIODS = [{ k: 7, l: "7 dias" }, { k: 15, l: "15 dias" }, { k: 30, l: "30 dias" }, { k: 0, l: "Tudo" }];
const TYPES: { k: "all" | Transaction["type"]; l: string }[] = [{ k: "all", l: "Todas" }, { k: "income", l: "Entradas" }, { k: "expense", l: "Saídas" }, { k: "dream", l: "Sonhos" }];
const chip = (on: boolean) => cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground");

function History() {
  const { state } = useSession();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState(30);
  const [type, setType] = useState<(typeof TYPES)[number]["k"]>("all");
  const [cat, setCat] = useState("Todas");
  const cats = ["Todas", ...new Set(state.transactions.map((t) => t.category))];

  const list = useMemo(() => state.transactions
    .filter((t) => !period || Date.now() - new Date(t.date).getTime() <= period * 86400000)
    .filter((t) => type === "all" || t.type === type)
    .filter((t) => cat === "Todas" || t.category === cat)
    .filter((t) => t.description.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [state.transactions, period, type, cat, q]);

  const groups = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    list.forEach((t) => { const k = new Date(t.date).toDateString(); m.set(k, [...(m.get(k) ?? []), t]); });
    return [...m.values()];
  }, [list]);

  const inSum = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const outSum = list.filter((t) => t.type !== "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate text-2xl font-bold">Movimentações</h1>
        <Link to="/nova" className={btn({ size: "sm" })}><Plus className="h-4 w-4" />Nova</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por descrição" className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm outline-none focus:border-primary" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">{TYPES.map((t) => <button key={t.k} className={chip(type === t.k)} onClick={() => setType(t.k)}>{t.l}</button>)}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">{PERIODS.map((p) => <button key={p.k} className={chip(period === p.k)} onClick={() => setPeriod(p.k)}>{p.l}</button>)}</div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoria" className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-primary">
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div className="card-surface p-3"><p className="text-[11px] text-muted-foreground">Entradas</p><p className="tabular font-bold text-positive">{masked(inSum, state.hideValues)}</p></div>
            <div className="card-surface p-3"><p className="text-[11px] text-muted-foreground">Saídas</p><p className="tabular font-bold">{masked(outSum, state.hideValues)}</p></div>
          </div>
        </div>

        <div className="space-y-4">
          {groups.length === 0 && (
            <div className="card-surface p-10 text-center">
              <p className="font-semibold">Nenhuma movimentação encontrada</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou registre algo novo.</p>
            </div>
          )}
          {groups.map((g) => (
            <section key={g[0]!.date} className="card-surface p-3">
              <p className="px-2 pb-1 pt-1 text-xs font-semibold capitalize text-muted-foreground">{fmtDayLabel(g[0]!.date)}</p>
              {g.map((t) => <TxRow key={t.id} t={t} hide={state.hideValues} />)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
