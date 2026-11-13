/**
 * HouseScene — PNG sprite integration for Tokeni house dream.
 *
 * Visual architecture:
 *   Layer 1 — Main stage sprite (casa-1.png … casa-8.png), fills the full viewBox
 *   Layer 2 — Secondary element PNG sprites (unlocked via missions), composited
 *             at isometrically-correct positions inside the scene
 *   Layer 3 — Celebration overlay (SVG text banner + confetti)
 *
 * All <image> elements use preserveAspectRatio="xMidYMax meet" so the sprite
 * always anchors at the bottom of its bounding box — this ensures elements
 * "sit on the ground" rather than floating. Proportions are never distorted.
 *
 * Sprite selection: driven by pct (0-100) passed from SceneContainer via pctInt().
 * Crossfade: 400ms opacity transition when the stage sprite changes.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Main stage sprites ───────────────────────────────────────────
import casa1 from "@/assets/sonhos/casa/casa-1.png";
import casa2 from "@/assets/sonhos/casa/casa-2.png";
import casa3 from "@/assets/sonhos/casa/casa-3.png";
import casa4 from "@/assets/sonhos/casa/casa-4.png";
import casa5 from "@/assets/sonhos/casa/casa-5.png";
import casa6 from "@/assets/sonhos/casa/casa-6.png";
import casa7 from "@/assets/sonhos/casa/casa-7.png";
import casa8 from "@/assets/sonhos/casa/casa-8.png";

// ─── Secondary element sprites ────────────────────────────────────
import imgBicicleta   from "@/assets/sonhos/casa/elementos-secundarios/bicicleta.png";
import imgCachorro    from "@/assets/sonhos/casa/elementos-secundarios/cachorro.png";
import imgCanteiro    from "@/assets/sonhos/casa/elementos-secundarios/canteiro-de-flores.png";
import imgCasaCachorro from "@/assets/sonhos/casa/elementos-secundarios/casa-de-cachorro.png";
import imgCasaGato    from "@/assets/sonhos/casa/elementos-secundarios/casa-de-gato.png";
import imgGato        from "@/assets/sonhos/casa/elementos-secundarios/gato.png";
import imgPoste       from "@/assets/sonhos/casa/elementos-secundarios/poste.png";
import imgArvore      from "@/assets/sonhos/casa/elementos-secundarios/árvore-com-balanço.png";

// ─── Props ────────────────────────────────────────────────────────
interface Props {
  stageIndex: number;
  unlockedSlots: Set<string>;
  celebrating?: boolean;
  className?: string;
  /** 0-100 integer percentage — primary driver for stage sprite selection */
  pct?: number;
}

// ─── Stage sprite mapping (pct% → PNG) ───────────────────────────
const STAGE_MAP: { minPct: number; src: string }[] = [
  { minPct: 0,  src: casa1 },
  { minPct: 10, src: casa2 },
  { minPct: 20, src: casa3 },
  { minPct: 30, src: casa4 },
  { minPct: 40, src: casa5 },
  { minPct: 60, src: casa6 },
  { minPct: 70, src: casa7 },
  { minPct: 90, src: casa8 },
];

function stageSrc(p: number): string {
  let chosen = STAGE_MAP[0]!.src;
  for (const s of STAGE_MAP) {
    if (p >= s.minPct) chosen = s.src;
  }
  return chosen;
}

// ─── Cross-fade main sprite ────────────────────────────────────────
// Renders two <image> layers: old fades out while new fades in (400ms).
function MainSprite({ src }: { src: string }) {
  const [current, setCurrent] = useState(src);
  const [prev,    setPrev]    = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (src === current) return;
    setPrev(current);
    setCurrent(src);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPrev(null), 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Previous stage — fade out */}
      {prev && (
        <image
          key={`prev-${prev}`}
          href={prev}
          x="0" y="0" width="400" height="200"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: 0, transition: "opacity 400ms ease-out" }}
        />
      )}
      {/* Current stage — fade in */}
      <image
        key={`cur-${current}`}
        href={current}
        x="0" y="0" width="400" height="200"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 1, transition: "opacity 400ms ease-in" }}
      />
    </>
  );
}

// ─── Secondary element positioning ───────────────────────────────
//
// The main sprites are ~16:9 isometric scenes (similar to casa-1..8).
// Key landmarks visible in all stages:
//   - Path enters from bottom-center (~x:160-240 in a 400-wide viewBox)
//   - House occupies center-left of scene
//   - Fence line runs horizontally across mid-scene (~y:110-130)
//   - Trees line the left and right edges
//   - Foreground ground: y≈145 to y≈195
//
// Placement rules:
//   - Elements anchor at BOTTOM of their bounding box (preserveAspectRatio="xMidYMax meet")
//   - This means y+height = ground contact point
//   - Width/height define the bounding box; actual pixel art sits at the bottom
//
// Each element is sized to look natural relative to the ~400×200 scene.
// The sprites are small pixel-art items — we scale them so they feel proportional
// to the isometric scene (roughly 1/8 to 1/5 of the scene width).

interface ElementProps {
  visible: boolean;
}

// Bicicleta — left of path entrance, foreground
// Small item ~60×50px apparent size — x:110, bottom at y:192
function Bicicleta({ visible }: ElementProps) {
  if (!visible) return null;
  return (
    <image
      href={imgBicicleta}
      x="140" y="160" width="52" height="38"
      preserveAspectRatio="xMidYMax meet"
      className="idle-rise"
    />
  );
}

// Árvore com balanço — left side, slightly back (mid-ground)
// Tall narrow item — x:18, bottom at y:170
function ArvoreBalanco({ visible }: ElementProps) {
  if (!visible) return null;
  return (
    <image
      href={imgArvore}
      x="45" y="20" width="72" height="90"
      preserveAspectRatio="xMidYMax meet"
      className="idle-rise"
    />
  );
}

// Canteiro de flores — left-front of path, foreground
// Wide low item — bottom at y:195
function Canteiro({ visible, offsetX }: ElementProps & { offsetX?: number }) {
  if (!visible) return null;
  const x = offsetX ?? 100;
  return (
    <image
      href={imgCanteiro}
      x={x} y="105" width="50" height="30"
      preserveAspectRatio="xMidYMax meet"
      className="idle-rise"
    />
  );
}

// Poste de luz — left side of path, slightly back
// Tall narrow — bottom at y:190
function Poste({ visible }: ElementProps) {
  if (!visible) return null;
  return (
    <image
      href={imgPoste}
      x="320" y="50" width="22" height="72"
      preserveAspectRatio="xMidYMax meet"
      className="idle-rise"
    />
  );
}

// Cachorro + casa de cachorro — right-front of scene
// Casa de cachorro: wider, bottom at y:188
// Cachorro: smaller, sits right next to the house
function Cachorro({ visible }: ElementProps) {
  if (!visible) return null;
  return (
    <>
      {/* Dog house */}
      <image
        href={imgCasaCachorro}
        x="275" y="157" width="62" height="44"
        preserveAspectRatio="xMidYMax meet"
        className="idle-rise"
      />
      {/* Dog sitting in front */}
      <image
        href={imgCachorro}
        x="300" y="173" width="34" height="30"
        preserveAspectRatio="xMidYMax meet"
        className="idle-bounce"
        style={{ animationDuration: "2.5s" }}
      />
    </>
  );
}

// Gato + casa de gato — far right, slightly back from cachorro
// Cat house overlaps slightly behind cat
function Gato({ visible }: ElementProps) {
  if (!visible) return null;
  return (
    <>
      {/* Cat house — slightly behind */}
      <image
        href={imgCasaGato}
        x="93" y="120" width="50" height="36"
        preserveAspectRatio="xMidYMax meet"
        className="idle-rise"
      />
      {/* Cat sitting in front */}
      <image
        href={imgGato}
        x="110" y="140" width="28" height="24"
        preserveAspectRatio="xMidYMax meet"
        className="idle-bounce"
        style={{ animationDuration: "3s", animationDelay: "0.8s" }}
      />
    </>
  );
}

// ─── Celebration overlay ──────────────────────────────────────────
function CelebrationOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const confetti = [
    { x: 100, y: 30, c: "#f0d030" }, { x: 160, y: 20, c: "#e02020" },
    { x: 200, y: 15, c: "#2080e0" }, { x: 240, y: 25, c: "#20b840" },
    { x: 300, y: 18, c: "#f0d030" }, { x: 130, y: 40, c: "#c020c0" },
    { x: 270, y: 35, c: "#e06020" }, { x: 180, y: 50, c: "#20d0a0" },
    { x: 80,  y: 45, c: "#f0d030" }, { x: 320, y: 42, c: "#e02020" },
    { x: 110, y: 60, c: "#2080e0" }, { x: 290, y: 55, c: "#20b840" },
  ];
  return (
    <g>
      {confetti.map(({ x, y, c }, i) => (
        <g key={i} className="idle-rise" style={{ animationDelay: `${i * 0.08}s` }}>
          <rect x={x}   y={y}   width="4" height="4" fill={c} opacity="0.9" />
          <rect x={x+6} y={y+8} width="4" height="2" fill={c} opacity="0.7" />
          <rect x={x-4} y={y+5} width="2" height="4" fill={c} opacity="0.8" />
        </g>
      ))}
      {/* Semi-transparent banner overlay */}
      <rect x="60" y="6" width="280" height="26" rx="4" fill="#101820" opacity="0.88" />
      <rect x="60" y="6" width="280" height="3"  rx="2" fill="#3d8a40" />
      <text
        x="200" y="24"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#f8e050"
        fontFamily="'Courier New', Courier, monospace"
        letterSpacing="1.5"
      >
        CASA CONQUISTADA!
      </text>
    </g>
  );
}

// ─── Main exported component ──────────────────────────────────────
export function HouseScene({
  stageIndex,
  unlockedSlots,
  celebrating = false,
  className,
  pct: pctProp = 0,
}: Props) {
  const slots = unlockedSlots;
  const src = stageSrc(pctProp);
  const s = stageIndex; // kept for celebration threshold

  return (
    <svg
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full select-none", className)}
      style={{ imageRendering: "pixelated" }}
      aria-label={`Cena da casa — ${pctProp}% concluído`}
      role="img"
    >
      {/* ── Layer 1: Main stage sprite (fills entire viewBox) ── */}
      <MainSprite src={src} />

      {/* ── Layer 2: Secondary cosmetic elements (mission rewards) ── */}
      {/* Rendered back-to-front for correct depth order */}

      {/* Back-left: tree with swing */}
      <ArvoreBalanco visible={slots.has("arvore")} />

      {/* Mid-right: cat house + cat */}
      <Gato visible={slots.has("gato")} />

      {/* Mid-right: dog house + dog */}
      <Cachorro visible={slots.has("cachorro")} />

      {/* Front-left: flower bed (first) */}
      <Canteiro visible={slots.has("canteiro")} offsetX={55} />

      {/* Front: street lamp left of path */}
      <Poste visible={slots.has("poste")} />

      {/* Front: bicycle left of path entrance */}
      <Bicicleta visible={slots.has("bicicleta")} />

      {/* ── Layer 3: Celebration overlay ── */}
      <CelebrationOverlay visible={celebrating || s >= 10} />
    </svg>
  );
}
