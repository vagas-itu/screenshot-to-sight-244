import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Check, Trophy, Star, Zap, Target, ChevronRight, Flag, Sparkles } from "lucide-react";
import { Button, Card, Progress, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { ACHIEVEMENTS, financialProgress, journeyProgress, levelStates, xpOf } from "@/services/finance";
import { brl } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IdleGame } from "@/features/idle/IdleGame";

export const Route = createFileRoute("/_main/sonhos")({
  head: pageHead("Sonhos", "Sua jornada, níveis, missões, XP e conquistas."),
  component: Dreams,
});

const LEVEL_ICONS = [Target, Star, Zap, Flag, Trophy];

function XpRing({ xp }: { xp: number }) {
  const max = 1000;
  const pct = Math.min(xp / max, 1);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--reward)" strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 1s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-bold text-reward">{xp}</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">XP</span>
      </div>
    </div>
  );
}

function Dreams() {
  const { state, completeMission } = useSession();
  const j = state.journey;

  if (!j) {
    return (
      <div className="space-y-6">
        {/* Show the idle game even without a journey — lets users explore */}
        <IdleGame />

        {/* Section divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Sua jornada</span>
          <div className="h-px flex-1 bg-border" />
        </div>

      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-reward/20 bg-card p-8 text-center shadow-glow">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-reward/5 blur-3xl" />
          <div className="relative mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[1.75rem] bg-reward/10 text-reward">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">Qual é o seu próximo sonho?</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Conte ao Tokeni o que você deseja conquistar e vamos construir um caminho personalizado para chegar lá.
          </p>
          <Link to="/ia" className={cn(btn({ variant: "reward" }), "mt-6 w-full")}>
            Criar minha jornada
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            O assistente vai te guiar em 5 níveis até a conquista.
          </p>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Como funciona</p>
          <div className="space-y-2">
            {[
              { n: 1, label: "Sonhador", desc: "Conhecer sua situação financeira" },
              { n: 2, label: "Explorador", desc: "Organizar o orçamento" },
              { n: 3, label: "Construtor", desc: "Juntar o dinheiro com constância" },
              { n: 4, label: "Conquistador", desc: "Avaliar as melhores opções" },
              { n: 5, label: "Realizador", desc: "Conquistar o seu sonho" },
            ].map(({ n, label, desc }) => (
              <div key={n} className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3 opacity-60">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-xs font-bold">{n}</span>
                <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    );
  }

  const states = levelStates(j, state.completedMissions);
  const xp = xpOf(state);
  const jpct = journeyProgress(j, state.completedMissions);
  const fpct = financialProgress(j);
  const currentLevelIdx = states.indexOf("current");

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          IDLE GAME — pixel-art interactive scene
          ════════════════════════════════════════════════════════ */}
      <IdleGame />

      {/* Section divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Sua jornada financeira</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Dream Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-reward/20 bg-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-reward/5 blur-3xl" />
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-reward/15 text-reward">
            <Target className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Seu sonho</p>
            <h1 className="mt-0.5 truncate text-xl font-bold">{j.dream}</h1>
            <div className="mt-2 flex items-end justify-between text-sm">
              <span className="tabular font-bold text-positive">{brl(j.saved)}</span>
              <span className="tabular text-muted-foreground">de {brl(j.target)}</span>
            </div>
            <Progress value={fpct} tone="reward" className="mt-2" />
          </div>
        </div>
        {currentLevelIdx >= 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-reward/10 px-3 py-1.5 text-xs font-semibold text-reward">
            <Star className="h-3 w-3" />
            Nível {currentLevelIdx + 1} — {j.levels[currentLevelIdx]?.name}
          </div>
        )}
      </div>

      {/* Three Progress Indicators */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {/* XP */}
        <div className="card-surface flex flex-col items-center gap-2 p-5">
          <XpRing xp={xp} />
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">XP Acumulado</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">de 1000 XP para o próximo rank</p>
          </div>
        </div>
        {/* Journey Progress */}
        <div className="card-surface flex flex-col justify-between p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Progresso da jornada</p>
          <p className="mt-2 font-display text-3xl font-bold">{Math.round(jpct * 100)}%</p>
          <div className="mt-3">
            <Progress value={jpct} tone="ai" />
            <p className="mt-2 text-xs text-muted-foreground">{states.filter((s) => s === "done").length} de {j.levels.length} níveis concluídos</p>
          </div>
        </div>
        {/* Financial Progress */}
        <div className="card-surface flex flex-col justify-between p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Progresso financeiro</p>
          <p className="mt-2 font-display text-3xl font-bold">{Math.round(fpct * 100)}%</p>
          <div className="mt-3">
            <Progress value={fpct} />
            <p className="mt-2 text-xs text-muted-foreground">{brl(j.saved)} de {brl(j.target)}</p>
          </div>
        </div>
      </div>

      {/* Levels */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Sua jornada</h2>
        <div className="space-y-3">
          {j.levels.map((l, i) => {
            const m = j.missions.find((x) => x.id === l.missionId)!;
            const st = states[i];
            const Icon = LEVEL_ICONS[i] ?? Target;
            const done = st === "done";
            const current = st === "current";
            const locked = st === "locked";
            return (
              <div key={l.name} className={cn(
                "relative overflow-hidden rounded-3xl border p-5 transition-all",
                done && "border-positive/20 bg-positive/5",
                current && "border-primary/30 bg-card",
                locked && "border-border bg-card/50 opacity-60",
              )}>
                {current && <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />}
                <div className="relative flex items-start gap-4">
                  <div className={cn(
                    "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
                    done ? "bg-positive/15 text-positive" : current ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted-foreground",
                  )}>
                    {done ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        done ? "bg-positive/15 text-positive" : current ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted-foreground",
                      )}>
                        Nível {i + 1}
                      </span>
                      {current && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary animate-pulse">Atual</span>}
                      {done && <span className="rounded-full bg-positive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-positive">Concluído</span>}
                    </div>
                    <p className="mt-1.5 font-semibold">{l.name}</p>
                    <p className="text-sm text-muted-foreground">{l.description}</p>
                    <div className="mt-3 rounded-2xl border border-border bg-background/40 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Missão principal</p>
                          <p className="mt-1 text-sm font-semibold">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.description}</p>
                        </div>
                        <span className="shrink-0 rounded-xl bg-reward/10 px-2.5 py-1 text-xs font-bold text-reward">+{m.xp} XP</span>
                      </div>
                      {current && (
                        <Button size="sm" className="mt-3" onClick={() => { completeMission(m.id); toast.success(`+${m.xp} XP conquistados!`); }}>
                          Concluir missão
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Missions */}
      {j.missions.filter((m) => !m.main).length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">Missões extras</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {j.missions.filter((m) => !m.main).map((m) => {
              const done = state.completedMissions.includes(m.id);
              return (
                <Card key={m.id} className={cn(done && "border-positive/20")}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{m.title}</p>
                    <span className="shrink-0 rounded-xl bg-reward/10 px-2 py-0.5 text-[11px] font-bold text-reward">+{m.xp}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                  {done ? (
                    <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-positive"><Check className="h-3.5 w-3.5" />Concluída</p>
                  ) : (
                    <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => { completeMission(m.id); toast.success(`+${m.xp} XP`); }}>
                      Começar · +{m.xp} XP
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Conquistas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const on = state.unlockedAchievements.includes(a.id);
            return (
              <div key={a.id} className={cn(
                "rounded-3xl border p-4 transition-all",
                on ? "border-reward/30 bg-card" : "border-border bg-card/50 opacity-50",
              )}>
                <div className={cn("mb-3 grid h-11 w-11 place-items-center rounded-2xl", on ? "bg-reward/15 text-reward" : "bg-surface-2 text-muted-foreground")}>
                  <Trophy className="h-5 w-5" />
                </div>
                <p className={cn("font-semibold text-sm", on && "text-foreground")}>{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn("text-xs font-bold", on ? "text-reward" : "text-muted-foreground")}>+{a.xp} XP</span>
                  {on && <span className="flex items-center gap-1 text-[10px] font-semibold text-positive"><Check className="h-3 w-3" />Desbloqueada</span>}
                  {!on && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue learning */}
      <div className="rounded-3xl border border-ai/20 bg-ai-gradient p-5">
        <p className="text-sm font-semibold text-ai flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Dica do Tokeni</p>
        <p className="mt-2 text-sm leading-relaxed">
          {j.saved < j.target * 0.1
            ? `Comece pequeno. Guardar R$ 50 por semana já é um passo real em direção ao seu sonho "${j.dream}".`
            : j.saved < j.target * 0.5
            ? `Você já juntou ${Math.round(fpct * 100)}% do valor. Continue com consistência e em breve chegará lá!`
            : `Incrível! Você está na reta final. Só ${brl(j.target - j.saved)} separa você do seu sonho "${j.dream}".`}
        </p>
        <Link to="/ia" className={cn(btn({ variant: "ai", size: "sm" }), "mt-4")}>
          <ChevronRight className="h-3.5 w-3.5" />Conversar com o Tokeni
        </Link>
      </div>
    </div>
  );
}
