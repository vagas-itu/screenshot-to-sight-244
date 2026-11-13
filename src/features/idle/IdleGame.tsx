/**
 * IdleGame — Main orchestrator for the Tokeni Idle Game.
 *
 * Features:
 * - Dream selector (Casa / Carro)
 * - Live sync with real Journey data (when available)
 * - Simulation slider for demo purposes (clearly labelled)
 * - Scene + progress panel side-by-side on desktop
 * - Missions and rewards tabs below
 */

import { useEffect, useReducer, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Car, Sliders, Gift, Map, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button, SimulationBadge, btn } from "@/components/cards/kit";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";
import { useSession } from "@/contexts/AppContext";
import { HOUSE_DREAM } from "./dreams/house";
import { CAR_DREAM } from "./dreams/car";
import { SceneContainer } from "./SceneContainer";
import { ProgressPanel } from "./ProgressPanel";
import { IdleMissions } from "./IdleMissions";
import { IdleRewards } from "./IdleRewards";
import type { DreamConfig, IdleState } from "./types";
import { completeMission, pct, unlockCosmetic, updateSaved } from "./engine";

// ─── Reducer ─────────────────────────────────────────────────────

type Action =
  | { type: "SET_SAVED"; saved: number }
  | { type: "COMPLETE_MISSION"; missionId: string; slot: string }
  | { type: "SYNC_JOURNEY"; saved: number; target: number };

function reducer(state: IdleState, action: Action): IdleState {
  switch (action.type) {
    case "SET_SAVED":
      return updateSaved(state, action.saved);
    case "COMPLETE_MISSION":
      return unlockCosmetic(completeMission(state, action.missionId), action.slot);
    case "SYNC_JOURNEY":
      return { ...state, saved: action.saved, target: action.target };
    default:
      return state;
  }
}

function makeInitialState(config: DreamConfig, journeySaved?: number, journeyTarget?: number): IdleState {
  return {
    kind: config.kind,
    target: journeyTarget ?? config.mockTarget,
    saved: journeySaved ?? config.mockSaved,
    completedMissions: [],
    unlockedCosmetics: [],
    celebratedStage: -1,
  };
}

// ─── Dream selector tab ───────────────────────────────────────────
interface DreamTabProps {
  config: DreamConfig;
  active: boolean;
  onClick: () => void;
  usesRealData: boolean;
}

function DreamTab({ config, active, onClick, usesRealData }: DreamTabProps) {
  const Icon = config.kind === "house" ? Home : Car;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
      {usesRealData && (
        <span className="rounded-full bg-positive/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-positive">Ativo</span>
      )}
    </button>
  );
}

// ─── Simulation slider ────────────────────────────────────────────
function SimSlider({ state, dispatch }: { state: IdleState; dispatch: React.Dispatch<Action> }) {
  const p = Math.round(pct(state) * 100);
  return (
    <div className="rounded-2xl border border-ai/20 bg-ai-gradient p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sliders className="h-3.5 w-3.5 text-ai" />
        <p className="text-xs font-semibold text-ai">Simulação de progresso</p>
        <SimulationBadge />
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Mova o controle para visualizar como o cenário evolui conforme o valor acumulado. Dados fictícios para demonstração.
      </p>
      <input
        type="range"
        min={0}
        max={state.target}
        step={state.target / 100}
        value={state.saved}
        onChange={(e) => dispatch({ type: "SET_SAVED", saved: Number(e.target.value) })}
        className="w-full accent-primary"
        aria-label="Simular valor acumulado"
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="tabular text-muted-foreground">R$ 0</span>
        <span className="tabular font-bold">{brl(state.saved)} <span className="text-muted-foreground">({p}%)</span></span>
        <span className="tabular text-muted-foreground">{brl(state.target)}</span>
      </div>
    </div>
  );
}

// ─── Main IdleGame component ──────────────────────────────────────
type TabId = "progress" | "missions" | "rewards";

const TABS: { k: TabId; l: string; icon: typeof Map }[] = [
  { k: "progress", l: "Progresso", icon: Map },
  { k: "missions", l: "Missões", icon: Gift },
];

export function IdleGame() {
  const { state: appState } = useSession();
  const journey = appState.journey;

  // Determine if the active journey matches one of our dream kinds
  const journeyKind: DreamConfig["kind"] | null =
    journey?.dream.toLowerCase().includes("casa") ? "house"
    : journey?.dream.toLowerCase().includes("carro") || journey?.dream.toLowerCase().includes("moto") || journey?.dream.toLowerCase().includes("veículo") ? "car"
    : null;

  // Active dream config — default to house
  const [activeKind, setActiveKind] = useState<DreamConfig["kind"]>(journeyKind ?? "house");
  const config = activeKind === "house" ? HOUSE_DREAM : CAR_DREAM;
  const usesRealData = journey !== null && journeyKind === activeKind;

  // Per-dream idle states
  const [houseState, houseDispatch] = useReducer(reducer, makeInitialState(
    HOUSE_DREAM,
    usesRealData && activeKind === "house" ? journey.saved : undefined,
    usesRealData && activeKind === "house" ? journey.target : undefined,
  ));
  const [carState, carDispatch] = useReducer(reducer, makeInitialState(
    CAR_DREAM,
    usesRealData && activeKind === "car" ? journey.saved : undefined,
    usesRealData && activeKind === "car" ? journey.target : undefined,
  ));

  const idleState = activeKind === "house" ? houseState : carState;
  const dispatch = activeKind === "house" ? houseDispatch : carDispatch;

  // Sync real journey data when it changes
  useEffect(() => {
    if (journey && journeyKind === "house") {
      houseDispatch({ type: "SYNC_JOURNEY", saved: journey.saved, target: journey.target });
    }
    if (journey && journeyKind === "car") {
      carDispatch({ type: "SYNC_JOURNEY", saved: journey.saved, target: journey.target });
    }
  }, [journey?.saved, journey?.target, journeyKind]);

  const [tab, setTab] = useState<TabId>("progress");
  const celebrating = pct(idleState) >= 1;

  const monthlyIncome = appState.financial.monthlyIncome;
  const fixedExpenses = appState.financial.fixedExpenses;
  const monthlySaving = Math.max(100, monthlyIncome - fixedExpenses);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Mundo do sonho</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Acompanhe a construção visual do seu sonho conforme você economiza.
          </p>
        </div>
        {!journey && (
          <Link to="/ia" className={cn(btn({ size: "sm", variant: "ai" }), "shrink-0")}>
            Criar sonho
          </Link>
        )}
      </div>

      {/* Dream selector */}
      <div className="flex gap-2 overflow-x-auto">
        <DreamTab config={HOUSE_DREAM} active={activeKind === "house"} onClick={() => setActiveKind("house")} usesRealData={journeyKind === "house" && !!journey} />
        <DreamTab config={CAR_DREAM} active={activeKind === "car"} onClick={() => setActiveKind("car")} usesRealData={journeyKind === "car" && !!journey} />
      </div>

      {/* Real data indicator */}
      {usesRealData && journey && (
        <div className="flex items-center gap-2 rounded-xl border border-positive/20 bg-positive/5 px-4 py-2.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-positive" />
          <span className="text-positive font-semibold">Dados reais da jornada</span>
          <span className="text-muted-foreground">— "{journey.dream}" · {brl(journey.saved)} de {brl(journey.target)}</span>
        </div>
      )}

      {/* Scene + panel layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: scene */}
        <div className="space-y-3">
          <SceneContainer
            config={config}
            idleState={idleState}
            celebrating={celebrating}
            className="aspect-[2/1] sm:aspect-[16/9] lg:aspect-[4/3]"
          />
          <SimSlider state={idleState} dispatch={dispatch} />
        </div>

        {/* Right: tabbed panel */}
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  tab === t.k
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.l}
              </button>
            ))}
          </div>

          {tab === "progress" && (
            <ProgressPanel
              config={config}
              idleState={idleState}
              monthlySaving={monthlySaving}
            />
          )}

          {tab === "missions" && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <IdleMissions
                config={config}
                idleState={idleState}
                onComplete={(missionId, slot) => dispatch({ type: "COMPLETE_MISSION", missionId, slot })}
              />
              <div className="mt-6 border-t border-border pt-5">
                <IdleRewards config={config} idleState={idleState} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
