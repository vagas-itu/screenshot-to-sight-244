/**
 * Tokeni Idle Game — Type definitions.
 * These types are self-contained and do not depend on the main app types.
 * The IdleDream.saved / IdleDream.target mirror Journey.saved / Journey.target
 * so future integration is a single prop-mapping step.
 */

export type DreamKind = "house" | "car";

/** A visual stage of the idle scene. Triggered by financial progress thresholds. */
export interface SceneStage {
  /** 0-based index, lower = earlier in progression */
  index: number;
  /** Financial progress threshold (0-1) to enter this stage */
  minPct: number;
  /** Human-readable label */
  label: string;
  /** Short description of what the scene looks like at this stage */
  sceneDesc: string;
  /** Contextual insight message shown in the progress panel */
  insight: string;
}

/** A cosmetic reward unlocked by completing an idle mission (does NOT affect finances) */
export interface CosmeticReward {
  id: string;
  label: string;
  description: string;
  /** Which cosmetic slot it populates in the scene */
  slot: string;
}

/** A secondary mission that unlocks cosmetic rewards */
export interface IdleMission {
  id: string;
  title: string;
  description: string;
  /** Cosmetic reward unlocked on completion */
  reward: CosmeticReward;
  /** Category for grouping */
  category: "daily" | "interaction";
}

/** The static configuration for a dream kind */
export interface DreamConfig {
  kind: DreamKind;
  label: string;
  /** Default mock values used when no real journey exists */
  mockTarget: number;
  mockSaved: number;
  stages: SceneStage[];
  missions: IdleMission[];
}

/** Runtime state stored per idle dream (kept in local React state, not persisted to AppContext) */
export interface IdleState {
  kind: DreamKind;
  /** Mirror of financial target — kept as live prop */
  target: number;
  /** Mirror of saved amount — can be incremented via simulate slider */
  saved: number;
  completedMissions: string[];
  unlockedCosmetics: string[];
  /** Whether the celebration animation has been shown for the current stage */
  celebratedStage: number;
}
