/**
 * SceneContainer — Frame that holds the pixel-art scene.
 * Provides the dark "game window" look with a scanline overlay,
 * stage label badge, and transition animation when stage changes.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { DreamConfig, IdleState } from "./types";
import { activeStage } from "./engine";
import { HouseScene } from "./scenes/HouseScene";
import { CarScene } from "./scenes/CarScene";

interface Props {
  config: DreamConfig;
  idleState: IdleState;
  celebrating: boolean;
  className?: string;
}

export function SceneContainer({ config, idleState, celebrating, className }: Props) {
  const stage = activeStage(config, idleState);
  const [flash, setFlash] = useState(false);
  const prevStageRef = useRef(stage.index);

  // Trigger flash animation when stage advances
  useEffect(() => {
    if (stage.index !== prevStageRef.current) {
      prevStageRef.current = stage.index;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [stage.index]);

  const unlockedSlots = new Set(idleState.unlockedCosmetics);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-[#080f14]", className)}>
      {/* Pixel-art scene */}
      <div className={cn("transition-opacity duration-300", flash && "opacity-0 animate-scene-flash")}>
        {config.kind === "house" ? (
          <HouseScene
            stageIndex={stage.index}
            unlockedSlots={unlockedSlots}
            celebrating={celebrating}
          />
        ) : (
          <CarScene
            stageIndex={stage.index}
            unlockedSlots={unlockedSlots}
            celebrating={celebrating}
          />
        )}
      </div>

      {/* CRT scanline overlay — pure aesthetic, 8% opacity */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* Stage progress pips */}
      <div className="absolute bottom-3 right-3 flex gap-1" aria-label={`Estágio ${stage.index + 1} de ${config.stages.length}`}>
        {config.stages.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all",
              i < stage.index ? "bg-primary" : i === stage.index ? "bg-reward w-3" : "bg-white/20",
            )}
          />
        ))}
      </div>

      {/* Evolution flash overlay */}
      {flash && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-scene-flash rounded-2xl bg-primary/15"
        />
      )}
    </div>
  );
}
