import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Target } from "lucide-react";
import { CategoryIcon, Card, Progress, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { spentBy } from "@/services/finance";
import { brl, fmtTime } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

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
      <button onClick={() => router.history.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar</button>

      <Card className="text-center">
        <div className="flex justify-center"><CategoryIcon category={t.category} type={t.type} /></div>
        <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
        <p className={cn("tabular mt-1 font-display text-4xl font-bold", t.type === "income" ? "text-positive" : t.type === "dream" ? "text-reward" : "")}>{sign}{brl(t.amount)}</p>
        <span className="mt-3 inline-block rounded-full bg-positive/15 px-3 py-1 text-xs font-semibold text-positive">Registrada</span>
      </Card>

      <Card className="divide-y divide-border p-0">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </Card>

      {(budget || t.type === "dream") && (
        <div className="rounded-3xl border border-ai/25 bg-ai-gradient p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ai"><Sparkles className="h-4 w-4" />Impacto no orçamento</p>
          {budget && t.type === "expense" && (
            <>
              <p className="mt-2 text-sm">Esta compra representa <b>{Math.round(share * 100)}%</b> do seu orçamento mensal de {t.category.toLowerCase()}.</p>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Usado: {brl(spent)}</span><span>Limite: {brl(budget.limit)}</span></div>
              <Progress value={spent / budget.limit} tone={spent > budget.limit ? "negative" : "ai"} className="mt-1.5" />
            </>
          )}
          {t.type === "dream" && j && (
            <p className="mt-2 flex items-start gap-2 text-sm"><Target className="mt-0.5 h-4 w-4 text-reward" />Esta contribuição adicionou {Math.round((t.amount / j.target) * 100)}% ao seu sonho "{j.dream}".</p>
          )}
          {t.type === "expense" && j && <p className="mt-3 text-xs text-muted-foreground">Equivale a {Math.round((t.amount / j.target) * 1000) / 10}% do valor do seu sonho "{j.dream}".</p>}
        </div>
      )}
    </div>
  );
}
