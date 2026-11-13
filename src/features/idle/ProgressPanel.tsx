/**
 * ProgressPanel — Shows financial progress, next stage unlock info, and motivational insight.
 */

import { Sparkles, ChevronRight, TrendingUp, Trophy } from "lucide-react";
import { Progress } from "@/components/cards/kit";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DreamConfig, IdleState } from "./types";
import { activeStage, amountToNextStage, contextInsight, estimatedMonths, nextStage, pctInt } from "./engine";

interface Props {
  config: DreamConfig;
  idleState: IdleState;
  /** estimated monthly saving rate for completion forecast */
  monthlySaving?: number;
  className?: string;
}

export function ProgressPanel({ config, idleState, monthlySaving = 500, className }: Props) {
  const pct = pctInt(idleState);
  const stage = activeStage(config, idleState);
  const next = nextStage(config, idleState);
  const needed = amountToNextStage(config, idleState);
  const insight = contextInsight(config, idleState);
  const months = estimatedMonths(idleState, monthlySaving);
  const remaining = idleState.target - idleState.saved;
  const done = pct >= 100;

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-5 space-y-5", className)}>
      {/* Financial summary */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso financeiro</p>
          <span className={cn("font-display text-2xl font-bold", done ? "text-reward" : "text-foreground")}>{pct}%</span>
        </div>
        <Progress value={pct / 100} tone={done ? "reward" : "brand"} />
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-surface p-3">
            <p className="text-[10px] text-muted-foreground">Acumulado</p>
            <p className="tabular mt-0.5 text-sm font-bold text-positive">{brl(idleState.saved)}</p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-[10px] text-muted-foreground">Meta total</p>
            <p className="tabular mt-0.5 text-sm font-bold">{brl(idleState.target)}</p>
          </div>
          {!done && (
            <>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-[10px] text-muted-foreground">Falta</p>
                <p className="tabular mt-0.5 text-sm font-bold">{brl(remaining)}</p>
              </div>
              {months !== null && (
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[10px] text-muted-foreground">Previsão</p>
                  <p className="tabular mt-0.5 text-sm font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-ai" />{months}m
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Current / next stage */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Etapa atual</p>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <p className="font-semibold text-sm">{stage.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stage.sceneDesc}</p>
        </div>
        {next && needed > 0 && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-surface/60 p-3 text-xs">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Próxima melhoria: <b className="text-foreground">{next.label}</b></span>
            <span className="ml-auto tabular font-bold text-reward shrink-0">+{brl(needed)}</span>
          </div>
        )}
        {done && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-reward/30 bg-reward/10 p-3 text-xs text-reward font-semibold">
            <Trophy className="h-3.5 w-3.5 shrink-0" /> Sonho realizado! Parabéns!
          </div>
        )}
      </div>

      {/* AI insight */}
      <div className="rounded-2xl border border-ai/20 bg-ai-gradient p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-ai" />
          <p className="text-xs font-semibold text-ai">Insight do Tokeni</p>
        </div>
        <p className="text-sm leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}
