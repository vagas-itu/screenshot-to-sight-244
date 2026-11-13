/**
 * IdleMissions — Secondary mission list with cosmetic unlock rewards.
 * Completing a mission calls onComplete(missionId) and unlocks the slot.
 * NOTE: missions do NOT affect financial progress (by design).
 */

import { Check, Gift, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/cards/kit";
import { cn } from "@/lib/utils";
import type { DreamConfig, IdleState } from "./types";

interface Props {
  config: DreamConfig;
  idleState: IdleState;
  onComplete: (missionId: string, cosmeticSlot: string) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  daily: "Missão diária",
  interaction: "Interação",
};

export function IdleMissions({ config, idleState, onComplete }: Props) {
  const available = config.missions.filter((m) => !idleState.completedMissions.includes(m.id));
  const completed = config.missions.filter((m) => idleState.completedMissions.includes(m.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Missões do sonho</h3>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted-foreground">
          {completed.length}/{config.missions.length}
        </span>
      </div>

      {/* Available missions */}
      {available.length > 0 && (
        <div className="space-y-2">
          {available.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted-foreground">
                <Gift className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{m.title}</p>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {CATEGORY_LABEL[m.category]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-reward/30 bg-reward/10 px-2 py-0.5 text-[10px] font-semibold text-reward">
                    <Gift className="h-3 w-3" />{m.reward.label}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0 mt-0.5"
                onClick={() => {
                  onComplete(m.id, m.reward.slot);
                  toast.success(`${m.reward.label} desbloqueado!`, {
                    description: m.reward.description,
                  });
                }}
              >
                Concluir
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Completed missions */}
      {completed.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Concluídas</p>
          <div className="space-y-2">
            {completed.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-positive/15 bg-positive/5 px-4 py-3"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-positive/15 text-positive">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.reward.label} desbloqueado</p>
                </div>
                <Check className="h-3.5 w-3.5 text-positive shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {available.length === 0 && completed.length === config.missions.length && (
        <div className="rounded-2xl border border-reward/20 bg-reward/5 p-4 text-center">
          <p className="text-sm font-semibold text-reward flex items-center gap-2"><Trophy className="h-4 w-4" />Todas as missões concluídas!</p>
          <p className="mt-1 text-xs text-muted-foreground">Você desbloqueou todas as decorações do cenário.</p>
        </div>
      )}
    </div>
  );
}
