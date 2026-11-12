import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Eye, EyeOff, Plus, Sparkles, ArrowDownLeft, ArrowUpRight, AlertTriangle, Target, ChevronRight, X } from "lucide-react";
import { Avatar, Card, Progress, SectionTitle, TxRow, btn, SimulationBadge } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { budgetRows, financialProgress, spendingByCategory, summary } from "@/services/finance";
import { brl, greeting, masked } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_main/inicio")({
  head: pageHead("Início", "Seu saldo, orçamento, insights do Tokeni e seu sonho em destaque."),
  component: Dashboard,
});

function Dashboard() {
  const { persona, state, update } = useSession();
  const [bell, setBell] = useState(false);
  const hide = state.hideValues;
  const s = summary(state.transactions);
  const rows = budgetRows(state);
  const cats = spendingByCategory(state.transactions).slice(0, 5);
  const maxCat = Math.max(...cats.map((c) => c.value), 1);
  const worst = [...rows].sort((a, b) => b.pct - a.pct)[0];
  const alerts = rows.filter((r) => r.status !== "ok");
  const j = state.journey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Link to="/perfil" className="flex min-w-0 items-center gap-3">
          <Avatar name={persona.name} />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{greeting()},</p>
            <h1 className="truncate text-xl font-bold sm:text-2xl">{persona.firstName}!</h1>
          </div>
        </Link>
        <div className="relative flex items-center gap-2">
          <Link to="/nova" className={cn(btn({ size: "sm" }), "hidden sm:inline-flex lg:hidden")}><Plus className="h-4 w-4" />Registrar</Link>
          <button onClick={() => setBell(!bell)} aria-label="Notificações" className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card hover:bg-surface">
            <Bell className="h-5 w-5" />
            {alerts.length > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-negative" />}
          </button>
          {bell && (
            <div className="absolute right-0 top-14 z-30 w-80 animate-rise card-surface p-4">
              <div className="mb-2 flex items-center justify-between"><p className="font-semibold">Notificações</p><button onClick={() => setBell(false)} aria-label="Fechar"><X className="h-4 w-4" /></button></div>
              {alerts.length === 0 ? <p className="text-sm text-muted-foreground">Tudo em dia por aqui. 🌱</p> : alerts.map((a) => (
                <p key={a.category} className="border-t border-border py-2 text-sm first:border-0">
                  <span className={a.status === "over" ? "text-negative" : "text-warning"}>●</span> {a.category}: {Math.round(a.pct * 100)}% do limite usado.
                </p>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Balance */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-brand-gradient p-6 shadow-glow">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-primary/20" />
            <div className="pointer-events-none absolute -right-4 top-10 h-40 w-72 rotate-[-20deg] rounded-[50%] border border-foreground/10" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Saldo disponível</p>
              <button onClick={() => update((x) => ({ ...x, hideValues: !x.hideValues }))} aria-label={hide ? "Mostrar valores" : "Ocultar valores"} className="grid h-9 w-9 place-items-center rounded-full bg-background/30 hover:bg-background/50">
                {hide ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="tabular mt-2 font-display text-4xl font-bold sm:text-5xl">{masked(s.balance, hide)}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-background/30 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowDownLeft className="h-3.5 w-3.5 text-positive" />Receitas (30 dias)</p>
                <p className="tabular mt-1 font-semibold text-positive">{masked(s.income, hide)}</p>
              </div>
              <div className="rounded-2xl bg-background/30 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowUpRight className="h-3.5 w-3.5 text-negative" />Despesas (30 dias)</p>
                <p className="tabular mt-1 font-semibold">{masked(s.expenses, hide)}</p>
              </div>
            </div>
          </div>

          {/* Summary + chart */}
          <Card>
            <SectionTitle title="Resumo financeiro" action={<span className="text-xs text-muted-foreground">Últimos 30 dias</span>} />
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Entradas", v: s.income, c: "text-positive" },
                { l: "Saídas", v: s.expenses, c: "text-negative" },
                { l: "Saldo mensal", v: s.net, c: s.net >= 0 ? "text-positive" : "text-negative" },
              ].map((k) => (
                <div key={k.l} className="rounded-2xl bg-surface p-3">
                  <p className="text-[11px] text-muted-foreground">{k.l}</p>
                  <p className={cn("tabular mt-1 truncate text-sm font-bold sm:text-base", k.c)}>{masked(k.v, hide)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2.5">
              {cats.map((c, i) => (
                <div key={c.category} className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{c.category}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full animate-grow rounded-full" style={{ width: `${(c.value / maxCat) * 100}%`, background: `var(--chart-${(i % 5) + 1})` }} />
                  </div>
                  <span className="tabular font-semibold">{masked(c.value, hide)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Budget */}
          <Card>
            <SectionTitle title="Orçamento" action={<Link to="/perfil" className="text-sm font-semibold text-primary">Ajustar limites</Link>} />
            <div className="space-y-4">
              {rows.map((r) => (
                <div key={r.category}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {r.category}
                      {r.status !== "ok" && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", r.status === "over" ? "bg-negative/15 text-negative" : "bg-warning/15 text-warning")}>
                          {r.status === "over" ? "Acima" : "Atenção"}
                        </span>
                      )}
                    </span>
                    <span className="tabular text-muted-foreground"><span className="font-semibold text-foreground">{masked(r.spent, hide)}</span> / {masked(r.limit, hide)}</span>
                  </div>
                  <Progress value={r.pct} tone={r.status === "over" ? "negative" : r.status === "attention" ? "warning" : "brand"} />
                  {r.status === "over" && (
                    <p className="mt-2 flex items-start gap-2 rounded-xl bg-negative/10 p-2.5 text-xs text-negative">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Você passou {brl(r.spent - r.limit)} do limite. O Tokeni sugere pausar gastos de {r.category.toLowerCase()} até o próximo mês.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* AI insight */}
          {worst && (
            <div className="relative overflow-hidden rounded-3xl border border-ai/25 bg-ai-gradient p-5 shadow-ai">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-ai"><Sparkles className="h-4 w-4" />Insight do Tokeni</span>
                <SimulationBadge />
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                Você já utilizou <b>{Math.round(worst.pct * 100)}%</b> do seu orçamento de {worst.category.toLowerCase()}.{" "}
                {j ? `Que tal revisar os próximos gastos para continuar avançando em "${j.dream}"?` : "Que tal revisar seus próximos gastos e começar a guardar para um sonho?"}
              </p>
              <Link to="/ia" className={cn(btn({ variant: "ai", size: "sm" }), "mt-4")}>Conversar com o Tokeni</Link>
            </div>
          )}

          {/* Dream */}
          <Card className="border-reward/20">
            {j ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-reward/15 text-reward"><Target className="h-5 w-5" /></div>
                  <div className="min-w-0"><p className="text-xs text-muted-foreground">Sonho em destaque</p><p className="truncate font-semibold">{j.dream}</p></div>
                </div>
                <div className="mt-4 flex items-end justify-between text-sm">
                  <span className="tabular font-bold">{masked(j.saved, hide)}</span>
                  <span className="tabular text-muted-foreground">de {masked(j.target, hide)}</span>
                </div>
                <Progress value={financialProgress(j)} tone="reward" className="mt-2" />
                <p className="mt-3 text-xs text-muted-foreground">Próxima etapa: {j.missions.find((m) => m.main && !state.completedMissions.includes(m.id))?.title ?? "Sonho conquistado!"}</p>
                <Link to="/sonhos" className={cn(btn({ variant: "secondary", size: "sm" }), "mt-4 w-full")}>Ver minha jornada</Link>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Sonhos</p>
                <p className="mt-1 font-display text-lg font-semibold">Qual é o seu próximo sonho?</p>
                <p className="mt-1 text-sm text-muted-foreground">Ex.: {persona.dreamHint.toLowerCase()}.</p>
                <Link to="/ia" search={{ start: "dream" }} className={cn(btn({ variant: "reward", size: "sm" }), "mt-4 w-full")}>Criar minha jornada</Link>
              </>
            )}
          </Card>

          {/* Recent */}
          <Card className="p-3">
            <div className="px-2 pt-2"><SectionTitle title="Movimentações recentes" action={<Link to="/movimentacoes" className="flex items-center text-sm font-semibold text-primary">Ver todas<ChevronRight className="h-4 w-4" /></Link>} /></div>
            {state.transactions.slice(0, 5).map((t) => <TxRow key={t.id} t={t} hide={hide} />)}
          </Card>
        </div>
      </div>

      <Link to="/nova" aria-label="Nova movimentação" className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow sm:hidden">
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
