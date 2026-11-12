import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Avatar, Button, Card } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { pageHead } from "@/lib/seo";
import type { FinancialProfile } from "@/types";

export const Route = createFileRoute("/_main/perfil")({
  head: pageHead("Perfil", "Seus dados, preferências e informações financeiras usadas pelo Tokeni."),
  component: Profile,
});

const input = "h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-primary";

function Profile() {
  const { persona, state, update, signOut, resetPersona } = useSession();
  const setFin = (k: keyof FinancialProfile, v: string) => update((s) => ({ ...s, financial: { ...s.financial, [k]: k === "priorities" ? v : Number(v) || 0 } }));
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="flex items-center gap-4"><Avatar name={persona.name} className="h-16 w-16" /><div><h1 className="text-xl font-bold">{persona.name}</h1><p className="text-sm text-muted-foreground">{persona.email}</p><p className="text-xs text-muted-foreground">{persona.occupation}</p></div></Card>
      <Card className="space-y-3">
        <h2 className="font-semibold">Informações financeiras usadas pelo Tokeni</h2>
        {([["monthlyIncome", "Renda mensal"], ["fixedExpenses", "Despesas fixas"], ["debts", "Dívidas"], ["emergencyFund", "Reserva"]] as const).map(([k, l]) => (
          <label key={k} className="block text-xs text-muted-foreground">{l}<input type="number" className={input} value={state.financial[k]} onChange={(e) => setFin(k, e.target.value)} /></label>
        ))}
        <label className="block text-xs text-muted-foreground">Prioridades<input className={input} value={state.financial.priorities} onChange={(e) => setFin("priorities", e.target.value)} /></label>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-semibold">Limites de orçamento</h2>
        {state.budgets.map((b, i) => (
          <label key={b.category} className="flex items-center justify-between gap-3 text-sm">{b.category}
            <input type="number" className={`${input} w-32`} value={b.limit} onChange={(e) => update((s) => ({ ...s, budgets: s.budgets.map((x, j) => (j === i ? { ...x, limit: Number(e.target.value) || 0 } : x)) }))} />
          </label>
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-semibold">Preferências</h2>
        <label className="flex items-center justify-between text-sm">Notificações<input type="checkbox" checked={state.notifications} onChange={(e) => update((s) => ({ ...s, notifications: e.target.checked }))} /></label>
        <label className="flex items-center justify-between text-sm">Ocultar valores<input type="checkbox" checked={state.hideValues} onChange={(e) => update((s) => ({ ...s, hideValues: e.target.checked }))} /></label>
        <p className="text-xs text-muted-foreground">Tema: escuro · Sobre: Tokeni, projeto acadêmico com dados fictícios.</p>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => { resetPersona(); toast.success("Dados da demo restaurados"); }}>Restaurar dados da demo</Button>
        <Button variant="ghost" onClick={signOut}>Sair</Button>
      </div>
    </div>
  );
}
