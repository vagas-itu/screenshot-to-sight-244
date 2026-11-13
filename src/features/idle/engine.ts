/**
 * Tokeni Idle Game — Pure progression engine.
 * No React, no side effects. Easily testable and reusable.
 */

import type { DreamConfig, IdleState, SceneStage } from "./types";
import { brl } from "@/lib/format";

/** 0-1 financial progress ratio */
export const pct = (s: IdleState) => Math.min(1, s.saved / Math.max(s.target, 1));

/** Integer 0-100 percentage */
export const pctInt = (s: IdleState) => Math.round(pct(s) * 100);

/** Which stage index is active given current progress */
export function activeStageIndex(stages: SceneStage[], progress: number): number {
  let best = 0;
  for (let i = 0; i < stages.length; i++) {
    if (progress >= stages[i]!.minPct) best = i;
  }
  return best;
}

/** Active stage object */
export function activeStage(config: DreamConfig, state: IdleState): SceneStage {
  return config.stages[activeStageIndex(config.stages, pct(state))]!;
}

/** Next unlockable stage (null if at max) */
export function nextStage(config: DreamConfig, state: IdleState): SceneStage | null {
  const idx = activeStageIndex(config.stages, pct(state));
  return config.stages[idx + 1] ?? null;
}

/** How much money is needed to reach the next stage (0 if already at max) */
export function amountToNextStage(config: DreamConfig, state: IdleState): number {
  const next = nextStage(config, state);
  if (!next) return 0;
  return Math.max(0, next.minPct * state.target - state.saved);
}

/** Context-aware motivational insight */
export function contextInsight(config: DreamConfig, state: IdleState): string {
  const stage = activeStage(config, state);
  const p = pct(state);
  if (p >= 1) return `Parabéns! Você conquistou seu sonho "${config.label}"!`;
  const remaining = state.target - state.saved;
  const next = nextStage(config, state);
  const base = stage.insight;
  if (next && amountToNextStage(config, state) > 0) {
    return `${base} Faltam apenas ${brl(amountToNextStage(config, state))} para a próxima melhoria!`;
  }
  return base;
}

/** Estimated months to completion based on a monthly saving rate */
export function estimatedMonths(state: IdleState, monthlySaving: number): number | null {
  if (monthlySaving <= 0) return null;
  const remaining = state.target - state.saved;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / monthlySaving);
}

/** Cosmetics that are currently visible in the scene */
export function unlockedSlots(state: IdleState): Set<string> {
  return new Set(state.unlockedCosmetics);
}

/** Complete a mission: unlock its cosmetic reward and mark as done */
export function completeMission(state: IdleState, missionId: string): IdleState {
  if (state.completedMissions.includes(missionId)) return state;
  return {
    ...state,
    completedMissions: [...state.completedMissions, missionId],
  };
}

/** Unlock a cosmetic slot */
export function unlockCosmetic(state: IdleState, slot: string): IdleState {
  if (state.unlockedCosmetics.includes(slot)) return state;
  return { ...state, unlockedCosmetics: [...state.unlockedCosmetics, slot] };
}

/** Update saved amount (simulated — real integration would read from Journey.saved) */
export function updateSaved(state: IdleState, saved: number): IdleState {
  return { ...state, saved: Math.min(state.target, Math.max(0, saved)) };
}
