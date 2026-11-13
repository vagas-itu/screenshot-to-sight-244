import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Target, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, CategoryIcon, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/services/categories";
import { brl } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { TxType } from "@/types";

export const Route = createFileRoute("/_main/nova")({
  head: pageHead("Nova movimentação", "Registre receitas, despesas ou contribuições para seus sonhos."),
  component: NewTx,
});

const input = "h-12 w-full rounded-2xl border border-input bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

const AMOUNT_PRESETS = [50, 100, 200, 500];

const STEPS = ["Dados", "Revisar", "Concluído"] as const;

function StepIndicator({ step }: { step: "form" | "review" | "done" }) {
  const idx = step === "form" ? 0 : step === "review" ? 1 : 2;
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
            i < idx ? "bg-primary text-primary-foreground" : i === idx ? "ring-2 ring-primary bg-primary/15 text-primary" : "bg-surface-2 text-muted-foreground",
          )}>
            {i < idx ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={cn("hidden text-xs font-medium sm:inline", i === idx ? "text-foreground" : "text-muted-foreground")}>{s}</span>
          {i < STEPS.length - 1 && <div className={cn("mx-1 h-px w-8", i < idx ? "bg-primary" : "bg-surface-2")} />}
        </div>
      ))}
    </div>
  );
}

function NewTx() {
  const { persona, state, addTransaction } = useSession();
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [type, setType] = useState<TxType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]!);
  const [date, setDate] = useState(today());
  const [account, setAccount] = useState<string>(persona.accounts[0] ?? "");
  const [note, setNote] = useState("");
  const [savedId, setSavedId] = useState("");
  const value = parseFloat(amount.replace(",", ".")) || 0;
  const j = state.journey;

  const types = [
    { k: "expense" as const, l: "Despesa", icon: ArrowUpRight, tone: "border-primary/40 bg-primary/10 text-primary", inactive: "border-border bg-card text-muted-foreground" },
    { k: "income" as const, l: "Receita", icon: ArrowDownLeft, tone: "border-positive/40 bg-positive/10 text-positive", inactive: "border-border bg-card text-muted-foreground" },
    { k: "dream" as const, l: "Sonho", icon: Target, tone: "border-reward/40 bg-reward/10 text-reward", inactive: "border-border bg-card text-muted-foreground" },
  ];
  const pickType = (k: TxType) => {
    setType(k);
    setCategory(k === "income" ? INCOME_CATEGORIES[0]! : k === "dream" ? "Sonho" : EXPENSE_CATEGORIES[0]!);
    if (k === "dream" && j) setDescription(`Guardar para ${j.dream}`);
    if (k !== "dream") setDescription("");
  };

  const confirm = () => {
    const now = new Date();
    const [y = 2026, m = 1, d = 1] = date.split("-").map(Number);
    const iso = new Date(y, m - 1, d, now.getHours(), now.getMinutes()).toISOString();
    const t = addTransaction({ type, description: description.trim(), amount: value, category, date: iso, account, note: note.trim() || undefined });
    setSavedId(t.id);
    setStep("done");
    toast.success(type === "dream" ? "Contribuição registrada! Seu sonho avançou." : "Movimentação registrada.");
  };

  if (step === "done") {
    return (
      <div className="mx-auto max-w-md space-y-6 pt-8 text-center">
        <div className="mx-auto grid h-24 w-24 animate-pop place-items-center rounded-full bg-primary/15 text-primary animate-pulse-ring">
          <Check className="h-12 w-12" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Tudo certo!</h1>
          <p className="mt-2 text-muted-foreground">
            {brl(value)} {type === "income" ? "entrou na sua conta" : type === "dream" ? "foi guardado para seu sonho" : "foi registrado como despesa"}.
          </p>
        </div>
        {type === "dream" && j && (
          <div className="card-surface rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Progresso atualizado para</p>
            <p className="mt-1 font-display text-2xl font-bold text-reward">{Math.min(100, Math.round(((j.saved + value) / j.target) * 100))}%</p>
            <p className="text-xs text-muted-foreground">de {brl(j.target)} para "{j.dream}"</p>
          </div>
        )}
        <div className="grid gap-2">
          <Link to="/movimentacoes/$id" params={{ id: savedId }} className={btn({ variant: "secondary" })}>Ver detalhes</Link>
          {type === "dream" && <Link to="/sonhos" className={btn({ variant: "reward" })}>Ver minha jornada</Link>}
          <Link to="/inicio" className={btn()}>Voltar ao início</Link>
        </div>
      </div>
    );
  }

  if (step === "review") {
    const rows: [string, string][] = [
      ["Tipo", types.find((t) => t.k === type)!.l],
      ["Descrição", description],
      ["Categoria", category],
      ["Data", new Date(date + "T12:00").toLocaleDateString("pt-BR")],
      ["Conta", account],
      ["Observação", note || "—"],
    ];
    return (
      <div className="mx-auto max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep("form")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Editar</button>
          <StepIndicator step="review" />
        </div>
        <h1 className="text-2xl font-bold">Revise antes de confirmar</h1>
        <Card className="text-center">
          <div className="flex justify-center"><CategoryIcon category={category} type={type} /></div>
          <p className="tabular mt-3 font-display text-4xl font-bold">{brl(value)}</p>
          {type === "dream" && j && (
            <p className="mt-2 text-sm text-reward">
              Seu sonho irá de {Math.round((j.saved / j.target) * 100)}% para {Math.min(100, Math.round(((j.saved + value) / j.target) * 100))}%
            </p>
          )}
        </Card>
        <Card className="divide-y divide-border p-0">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-right font-medium">{v}</span>
            </div>
          ))}
        </Card>
        <Button size="lg" className="w-full" onClick={confirm}>Confirmar registro</Button>
        <p className="text-center text-xs text-muted-foreground">Registro financeiro simulado — nenhuma transferência bancária é realizada.</p>
      </div>
    );
  }

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const valid = description.trim().length > 1 && value > 0 && (type !== "dream" || !!j);

  return (
    <form className="mx-auto max-w-xl space-y-5" onSubmit={(e) => { e.preventDefault(); if (valid) setStep("review"); }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova movimentação</h1>
        <StepIndicator step="form" />
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-2">
        {types.map((t) => (
          <button
            type="button" key={t.k} onClick={() => pickType(t.k)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-semibold transition active:scale-95",
              type === t.k ? t.tone : t.inactive + " hover:text-foreground",
            )}
          >
            <t.icon className="h-5 w-5" />{t.l}
          </button>
        ))}
      </div>

      {type === "dream" && !j && (
        <div className="rounded-2xl border border-reward/30 bg-reward/10 p-4 text-sm">
          Você ainda não tem uma jornada ativa.{" "}
          <Link to="/ia" className="font-semibold text-reward underline">Crie seu sonho com o Tokeni</Link> para começar a guardar.
        </div>
      )}

      <Card className="space-y-4">
        {/* Amount input */}
        <label className="block text-center">
          <span className="text-xs text-muted-foreground">Valor</span>
          <div className="mt-1 flex items-center justify-center gap-2 font-display text-4xl font-bold">
            <span className="text-muted-foreground">R$</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d,.]/g, ""))}
              placeholder="0,00"
              className="tabular w-44 bg-transparent text-center outline-none placeholder:text-muted-foreground/40"
              aria-label="Valor"
            />
          </div>
          {/* Quick presets */}
          <div className="mt-3 flex justify-center gap-2">
            {AMOUNT_PRESETS.map((p) => (
              <button
                key={p} type="button"
                onClick={() => setAmount(p.toString())}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  value === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                {brl(p)}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Descrição</span>
          <input
            className={input} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === "expense" ? "Ex.: Mercado da semana" : type === "income" ? "Ex.: Salário" : j ? `Guardar para ${j.dream}` : "Contribuição para sonho"}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          {type !== "dream" && (
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted-foreground">Categoria</span>
              <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">Data</span>
            <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">Conta</span>
            <select className={input} value={account} onChange={(e) => setAccount(e.target.value)}>
              {persona.accounts.map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Observação (opcional)</span>
          <textarea
            rows={2}
            className={cn(input, "h-auto py-3")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alguma observação sobre esta movimentação…"
          />
        </label>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={!valid}>Revisar</Button>
      <p className="text-center text-xs text-muted-foreground">Registro financeiro simulado — nenhuma transferência bancária é realizada.</p>
    </form>
  );
}
