import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Check, Trophy } from "lucide-react";
import { Button, Card, Progress, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { ACHIEVEMENTS, financialProgress, journeyProgress, levelStates, xpOf } from "@/services/finance";
import { brl } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/sonhos")({
  head: pageHead("Sonhos", "Sua jornada, níveis, missões, XP e conquistas."),
  component: Dreams,
});

function Dreams() {
  const { state, completeMission } = useSession();
  const j = state.journey;
  if (!j) return (
    <Card className="mx-auto max-w-md text-center">
      <Lock className="mx-auto h-10 w-10 text-reward" />
      <h1 className="mt-4 text-2xl font-bold">Qual é o seu próximo sonho?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Conte ao Tokeni o que você deseja conquistar e vamos construir um caminho para chegar lá.</p>
      <Link to="/ia" className={cn(btn({ variant: "reward" }), "mt-5")}>Criar minha jornada</Link>
    </Card>
  );
  const states = levelStates(j, state.completedMissions);
  const xp = xpOf(state);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{j.dream}</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-muted-foreground">XP acumulado</p><p className="text-2xl font-bold text-reward">{xp} XP</p></Card>
        <Card><p className="text-xs text-muted-foreground">Progresso da jornada</p><p className="text-2xl font-bold">{Math.round(journeyProgress(j, state.completedMissions) * 100)}%</p><Progress value={journeyProgress(j, state.completedMissions)} tone="ai" className="mt-2" /></Card>
        <Card><p className="text-xs text-muted-foreground">Progresso financeiro</p><p className="text-lg font-bold">{brl(j.saved)} / {brl(j.target)}</p><Progress value={financialProgress(j)} className="mt-2" /></Card>
      </div>
      <div className="space-y-3">
        {j.levels.map((l, i) => {
          const m = j.missions.find((x) => x.id === l.missionId)!;
          const st = states[i];
          return (
            <Card key={l.name} className={cn(st === "locked" && "opacity-50", st === "current" && "border-primary/40")}>
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs text-muted-foreground">Nível {i + 1} · {st === "done" ? "Concluído" : st === "current" ? "Atual" : "Bloqueado"}</p><p className="font-semibold">{l.name}</p><p className="text-sm text-muted-foreground">{l.description}</p></div>
                <span className="shrink-0 text-sm font-bold text-reward">+{m.xp} XP</span>
              </div>
              <p className="mt-3 text-sm"><b>Missão:</b> {m.title} — {m.description}</p>
              {st === "current" && <Button size="sm" className="mt-3" onClick={() => { completeMission(m.id); toast.success(`+${m.xp} XP`); }}>Concluir missão</Button>}
              {st === "done" && <p className="mt-2 flex items-center gap-1 text-xs text-positive"><Check className="h-3.5 w-3.5" />Concluída</p>}
            </Card>
          );
        })}
      </div>
      <h2 className="text-lg font-semibold">Missões secundárias</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {j.missions.filter((m) => !m.main).map((m) => (
          <Card key={m.id}><p className="font-semibold">{m.title}</p><p className="text-sm text-muted-foreground">{m.description}</p>
            {state.completedMissions.includes(m.id) ? <p className="mt-2 text-xs text-positive">Concluída</p> : <Button size="sm" variant="secondary" className="mt-3" onClick={() => completeMission(m.id)}>Começar missão · +{m.xp} XP</Button>}
          </Card>
        ))}
      </div>
      <h2 className="text-lg font-semibold">Conquistas</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const on = state.unlockedAchievements.includes(a.id);
          return <Card key={a.id} className={on ? "border-reward/40" : "opacity-50"}><Trophy className={cn("h-6 w-6", on ? "text-reward" : "text-muted-foreground")} /><p className="mt-2 font-semibold">{a.title}</p><p className="text-xs text-muted-foreground">{a.description} · +{a.xp} XP</p></Card>;
        })}
      </div>
    </div>
  );
}
