/**
 * IdleRewards — Grid of all cosmetic rewards showing locked/unlocked status.
 */

import { Lock, Check, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DreamConfig, IdleState } from "./types";

interface Props {
  config: DreamConfig;
  idleState: IdleState;
}

export function IdleRewards({ config, idleState }: Props) {
  const allRewards = config.missions.map((m) => m.reward);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recompensas cosméticas</h3>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted-foreground">
          {idleState.unlockedCosmetics.length}/{allRewards.length} desbloqueadas
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Decorações visuais do cenário — não afetam o progresso financeiro.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {allRewards.map((r) => {
          const unlocked = idleState.unlockedCosmetics.includes(r.slot);
          return (
            <div
              key={r.id}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all",
                unlocked
                  ? "border-reward/30 bg-card"
                  : "border-border bg-card/50 opacity-50",
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl",
                  unlocked ? "bg-reward/15 text-reward" : "bg-surface-2 text-muted-foreground",
                )}
              >
                {unlocked
                  ? <Gift className="h-4 w-4" />
                  : <Lock className="h-4 w-4" />}
              </div>

              <div>
                <p className="text-[11px] font-semibold leading-tight">{r.label}</p>
                {unlocked && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{r.description}</p>
                )}
              </div>

              {/* Status corner badge */}
              {unlocked && (
                <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-positive">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
