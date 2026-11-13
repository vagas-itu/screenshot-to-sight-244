import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Target, CheckCircle2, Share2, AlertTriangle } from "lucide-react";
import { CategoryIcon, Card, Progress, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { spentBy } from "@/services/finance";
import { brl, fmtTime } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/movimentacoes/$id")({
  head: pageHead("Detalhes da movimentação", "Detalhes e impacto no orçamento de uma movimentação."),
  component: Detail,
});

const TYPE_LABEL = { income: "Receita", expense: "Despesa", dream: "Contribuição para sonho" };

function Detail() {
  const { id } = Route.useParams();
  const { state } = useSession();
  const router = useRouter();
  const t = state.transactions.find((x) => x.id === id);

  if (!t) {
    return (
      <div className="card-surface mx-auto max-w-md p-10 text-center">
        <p className="font-semibold">Movimentação não encontrada</p>
        <Link to="/movimentacoes" className={cn(btn({ size: "sm" }), "mt-4")}>Voltar ao histórico</Link>
      </div>
    );
  }

  const budget = state.budgets.find((b) => b.category === t.category);
  const share = budget ? t.amount / budget.limit : 0;
  const spent = budget ? spentBy(state.transactions, t.category) : 0;
  const j = state.journey;
  const sign = t.type === "income" ? "+" : "−";
  const d = new Date(t.date);

  const statusColor = t.type === "income" ? "text-positive" : t.type === "dream" ? "text-reward" : "text-foreground";
  const statusBg = t.type === "income" ? "bg-positive/15 text-positive border-positive/20" : t.type === "dream" ? "bg-reward/15 text-reward border-reward/20" : "bg-surface border-border";

  const rows: [string, string][] = [
    ["Categoria", t.type === "dream" ? "Sonho" : t.category],
    ["Tipo", TYPE_LABEL[t.type]],
    ["Data", d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })],
    ["Horário", fmtTime(t.date)],
    ["Conta", t.account],
    ["Identificador", t.id],
    ["Observações", t.note || "—"],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.history.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Voltar
        </button>
        <button
          onClick={() => toast.success("Comprovante copiado", { description: `Movimentação ${t.id} copiada.` })}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Compartilhar"
        >
          <Share2 className="h-3.5 w-3.5" />Compartilhar
        </button>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center">
        <div className={cn("pointer-events-none absolute inset-0 opacity-5", t.type === "income" ? "bg-positive" : t.type === "dream" ? "bg-reward" : "bg-foreground")} />
        <div className="relative">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <CategoryIcon category={t.category} type={t.type} />
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-positive">
                <CheckCircle2 className="h-3.5 w-3.5 text-positive-foreground" style={{ color: "var(--primary-foreground)" }} />
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t.description}</p>
          <p className={cn("tabular mt-1 font-display text-4xl font-bold", statusColor)}>{sign}{brl(t.amount)}</p>
          <div className="mt-4 flex justify-center">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", statusBg)}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t.type === "dream" ? "Contribuição registrada" : t.type === "income" ? "Receita registrada" : "Despesa registrada"}
            </span>
          </div>
        </div>
      </div>

      {/* Details table */}
      <Card className="divide-y divide-border p-0">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className={cn("text-right font-medium", k === "Identificador" && "font-mono text-xs text-muted-foreground")}>{v}</span>
          </div>
        ))}
      </Card>

      {/* Budget impact */}
      {(budget || t.type === "dream") && (
        <div className="relative overflow-hidden rounded-3xl border border-ai/25 bg-ai-gradient p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ai">
            <Sparkles className="h-4 w-4" />Impacto no orçamento
          </div>
          {budget && t.type === "expense" && (
            <>
              <p className="mt-2 text-sm leading-relaxed">
                Esta compra representa <b>{Math.round(share * 100)}%</b> do seu orçamento mensal de {t.category.toLowerCase()}.
              </p>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>Usado: {brl(spent)}</span>
                <span>Limite: {brl(budget.limit)}</span>
              </div>
              <Progress value={spent / budget.limit} tone={spent > budget.limit ? "negative" : "ai"} className="mt-1.5" />
              {spent > budget.limit && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-negative"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />Limite de {t.category.toLowerCase()} ultrapassado este mês.</p>
              )}
            </>
          )}
          {t.type === "dream" && j && (
            <p className="mt-2 flex items-start gap-2 text-sm">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-reward" />
              Esta contribuição adicionou {Math.round((t.amount / j.target) * 100)}% ao seu sonho "{j.dream}".
            </p>
          )}
          {t.type === "expense" && j && (
            <p className="mt-3 text-xs text-muted-foreground">
              Equivale a {Math.round((t.amount / j.target) * 1000) / 10}% do valor do seu sonho "{j.dream}".
            </p>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="grid gap-2 sm:grid-cols-2">
        <Link to="/movimentacoes" className={cn(btn({ variant: "secondary" }), "justify-center")}>
          Voltar ao histórico
        </Link>
        {t.type === "dream" && j && (
          <Link to="/sonhos" className={cn(btn({ variant: "reward" }), "justify-center")}>
            <Target className="h-4 w-4" />Ver jornada
          </Link>
        )}
        {t.type !== "dream" && (
          <Link to="/nova" className={cn(btn({ size: "md" }), "justify-center")}>
            Nova movimentação
          </Link>
        )}
      </div>
    </div>
  );
}
