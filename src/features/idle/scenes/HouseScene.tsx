/**
 * HouseScene — Stardew Valley-inspired 16-bit pixel-art SVG.
 *
 * Design principles:
 * - Rich palette: 3-4 shades per material for dithering & depth
 * - Top-down / three-quarter perspective (Stardew Valley style)
 * - Layered: sky → distant hills → ground → house structure → details → cosmetics
 * - Textures via alternating pixel rows and dithering patterns
 * - Atmospheric: clouds, animated grass tips, window glow, cast shadows
 * - All shapes are axis-aligned rects for true pixel-art fidelity
 */

import { cn } from "@/lib/utils";

interface Props {
  stageIndex: number;
  unlockedSlots: Set<string>;
  celebrating?: boolean;
  className?: string;
}

// ─── 16-bit rich palette (Stardew Valley tones) ──────────────────
const P = {
  // Sky
  sky0: "#1a3a5c",   // deep dusk blue
  sky1: "#1f4870",   // mid sky
  sky2: "#2a5f8a",   // upper sky
  sky3: "#3572a0",   // horizon glow
  skyPink: "#6a3a5c",// sunset pink stripe
  skyOrange: "#a05030",// horizon orange

  // Clouds
  cloud0: "#d4e8f8",
  cloud1: "#eaf4ff",
  cloud2: "#b8d4ee",
  cloudShadow: "#8aabcc",

  // Distant hills
  hill0: "#1e4030",
  hill1: "#254a38",
  hill2: "#2c5540",
  hill3: "#336048",

  // Ground / grass — 5-layer Stardew grass dithering
  grass0: "#2a6030",  // deepest shadow
  grass1: "#327838",  // mid dark
  grass2: "#3d8a40",  // base
  grass3: "#4ea050",  // highlight
  grass4: "#60b860",  // bright tip
  grassDry: "#5a7830",// dry patch accent
  dirt0: "#3a2210",
  dirt1: "#4a2e18",
  dirt2: "#5c3a22",
  dirt3: "#6e4a2e",
  dirtLight: "#7e5a3a",

  // Construction / foundation
  concrete0: "#3a3a3a",
  concrete1: "#484848",
  concrete2: "#585858",
  concreteLight: "#686868",
  rebar: "#8a7060",

  // Stone / foundation blocks
  stone0: "#2e2e2e",
  stone1: "#3c3c3c",
  stone2: "#4a4a4a",
  stone3: "#5a5a5a",
  stoneMoss: "#3a5a3a",
  stoneMortar: "#252525",

  // Brick walls
  brick0: "#7a3a28",  // dark brick
  brick1: "#9a4e38",  // base brick
  brick2: "#b05a40",  // mid brick
  brick3: "#c06850",  // highlight brick
  mortar: "#3a3028",  // mortar line
  mortarLight: "#4a4038",

  // Painted walls (finished exterior)
  paint0: "#3a6a5a",  // deep shadow
  paint1: "#4a8070",  // base paint
  paint2: "#5a9a88",  // mid paint (Tokeni green)
  paint3: "#6ab0a0",  // light paint
  paintHighlight: "#7ec4b4",

  // Roof tiles — warm terracotta
  roof0: "#5a2a18",  // deep shadow tile
  roof1: "#7a3c28",  // base tile
  roof2: "#9a5038",  // highlight tile
  roof3: "#b06045",  // lit tile
  roofRidge: "#3a1e10", // ridge line

  // Wood (door, trim, fence)
  wood0: "#4a2e10",
  wood1: "#6a4420",
  wood2: "#8a5c2e",
  wood3: "#a87040",
  woodHighlight: "#c08850",
  woodGrain: "#3e2810",

  // Window glass
  win0: "#1a3a50",  // dark glass
  win1: "#2a5a78",  // mid glass
  win2: "#4a90b8",  // bright glass
  win3: "#7abcd8",  // highlight
  winFrame: "#2e1e10",
  winGlow: "#d8a050",   // warm interior glow
  winGlowMid: "#e0b870",

  // Garden path
  path0: "#3a3030",
  path1: "#484040",
  path2: "#585050",
  pathMoss: "#3a4a30",

  // Tree foliage — rich layered green
  leaf0: "#1a4020",
  leaf1: "#2a5c30",
  leaf2: "#3a7040",
  leaf3: "#4a8850",
  leaf4: "#5aa060",
  leafLight: "#6ab870",
  leafDark: "#142e18",

  // Tree trunk
  trunk0: "#4a2e10",
  trunk1: "#6a4020",
  trunk2: "#8a5830",
  trunkDark: "#2e1c08",
  trunkLight: "#a06840",

  // Fence
  fence0: "#4a3018",
  fence1: "#6a4828",
  fence2: "#8a6038",
  fenceLight: "#a07848",
  fenceShadow: "#2e1c0c",

  // Flowers
  flowerStem: "#2a6020",
  flowerStemLight: "#4a8040",
  petalRed0: "#8a2010",
  petalRed1: "#c03020",
  petalRed2: "#e04030",
  petalYellow0: "#806010",
  petalYellow1: "#c09020",
  petalYellow2: "#e8c030",
  petalPink0: "#782060",
  petalPink1: "#b83090",
  petalPink2: "#e050b8",
  petalCenter: "#f8e050",

  // Mailbox
  mailPost0: "#4a3018",
  mailPost1: "#7a5028",
  mailBox0: "#2a5a2a",
  mailBox1: "#3a7a3a",
  mailBox2: "#4a9a4a",
  mailFlag: "#c03020",

  // Lamp
  lampMetal0: "#484838",
  lampMetal1: "#686858",
  lampMetal2: "#888878",
  lampGlass: "#f8e080",
  lampGlow0: "#f8c840",
  lampGlow1: "#f8e090",
  lampHalo: "#f8d060",

  // Dog
  dogBody0: "#8a6030",
  dogBody1: "#b07840",
  dogBody2: "#d09850",
  dogNose: "#1a1010",
  dogEye: "#1a1010",

  // Shadow (cast on ground)
  shadow: "#1a2a1a",

  // Celebration
  confetti0: "#e8d030",
  confetti1: "#e05030",
  confetti2: "#4090e0",
  confetti3: "#40c060",
  banner: "#1a3020",
};

// ─── Sky with gradient bands + clouds + sunset ────────────────────
function Sky({ stage }: { stage: number }) {
  // Later stages = daytime (brighter sky), early = dusk/evening
  const dayStage = stage >= 6;
  return (
    <>
      {/* Sky gradient — 8 horizontal bands */}
      <rect x="0" y="0"   width="400" height="18" fill={dayStage ? P.sky2 : P.sky0} />
      <rect x="0" y="18"  width="400" height="14" fill={dayStage ? P.sky3 : P.sky1} />
      <rect x="0" y="32"  width="400" height="12" fill={dayStage ? "#3a80b0" : P.sky1} />
      <rect x="0" y="44"  width="400" height="10" fill={dayStage ? "#4090c0" : P.sky2} />
      <rect x="0" y="54"  width="400" height="10" fill={dayStage ? "#5098c8" : P.sky2} />
      <rect x="0" y="64"  width="400" height="8"  fill={dayStage ? "#60a8d0" : P.sky3} />
      <rect x="0" y="72"  width="400" height="8"  fill={dayStage ? "#70b8d8" : P.skyPink} />
      <rect x="0" y="80"  width="400" height="8"  fill={dayStage ? "#80c8e0" : P.skyOrange} />

      {/* Sun / Moon */}
      {dayStage ? (
        <>
          {/* Sun */}
          <rect x="340" y="10" width="16" height="16" fill="#f8d840" />
          <rect x="338" y="12" width="20" height="12" fill="#f8d840" />
          <rect x="342" y="8"  width="12" height="20" fill="#f8d840" />
          {/* Sun corona */}
          <rect x="336" y="14" width="4"  height="4"  fill="#f8f060" opacity="0.6" />
          <rect x="360" y="14" width="4"  height="4"  fill="#f8f060" opacity="0.6" />
          <rect x="348" y="6"  width="4"  height="4"  fill="#f8f060" opacity="0.6" />
        </>
      ) : (
        <>
          {/* Moon with craters */}
          <rect x="344" y="10" width="14" height="14" fill="#e8d888" />
          <rect x="342" y="12" width="18" height="10" fill="#e8d888" />
          <rect x="344" y="8"  width="14" height="18" fill="#e8d888" />
          <rect x="346" y="14" width="4"  height="4"  fill="#c8b868" opacity="0.8" />
          <rect x="352" y="18" width="3"  height="3"  fill="#c8b868" opacity="0.6" />
          {/* Stars */}
          {[[20,8],[55,14],[100,6],[145,18],[190,10],[235,16],[275,7],[310,20],[25,22],[80,28],[160,25],[220,29],[290,26],[360,24]].map(([x,y],i)=>(
            <rect key={i} x={x} y={y} width={i%3===0?2:1} height={i%3===0?2:1} fill="#e8e8c8" opacity={0.5+0.5*(i%3)*0.2} />
          ))}
        </>
      )}

      {/* Clouds */}
      <g className="idle-sway" style={{ transformOrigin: "100px 30px", animationDuration: "12s" }}>
        {/* Cloud 1 */}
        <rect x="60"  y="24" width="60" height="8"  fill={P.cloudShadow} />
        <rect x="58"  y="22" width="64" height="10" fill={P.cloud2} />
        <rect x="64"  y="16" width="28" height="10" fill={P.cloud1} />
        <rect x="70"  y="14" width="20" height="6"  fill={P.cloud0} />
        <rect x="92"  y="18" width="20" height="8"  fill={P.cloud1} />
        <rect x="88"  y="14" width="14" height="6"  fill={P.cloud2} />
      </g>
      <g className="idle-sway" style={{ transformOrigin: "270px 35px", animationDuration: "18s", animationDirection: "reverse" }}>
        {/* Cloud 2 */}
        <rect x="230" y="30" width="80" height="8"  fill={P.cloudShadow} />
        <rect x="228" y="28" width="84" height="10" fill={P.cloud2} />
        <rect x="240" y="20" width="32" height="12" fill={P.cloud1} />
        <rect x="246" y="16" width="22" height="8"  fill={P.cloud0} />
        <rect x="268" y="22" width="24" height="10" fill={P.cloud1} />
        <rect x="272" y="18" width="16" height="8"  fill={P.cloud2} />
      </g>
    </>
  );
}

// ─── Distant hills with depth layers ─────────────────────────────
function Hills() {
  return (
    <>
      {/* Farthest hill */}
      <rect x="0"   y="80" width="400" height="8"  fill={P.hill0} />
      <rect x="0"   y="85" width="80"  height="5"  fill={P.hill0} />
      <rect x="80"  y="83" width="60"  height="7"  fill={P.hill0} />
      <rect x="140" y="81" width="80"  height="9"  fill={P.hill0} />
      <rect x="220" y="84" width="100" height="6"  fill={P.hill0} />
      <rect x="320" y="82" width="80"  height="8"  fill={P.hill0} />

      {/* Mid hill — with pixel staircase top */}
      <rect x="0"   y="86" width="400" height="10" fill={P.hill1} />
      <rect x="20"  y="84" width="12"  height="2"  fill={P.hill2} />
      <rect x="32"  y="82" width="16"  height="4"  fill={P.hill2} />
      <rect x="48"  y="80" width="20"  height="6"  fill={P.hill2} />
      <rect x="68"  y="83" width="14"  height="3"  fill={P.hill2} />
      <rect x="200" y="82" width="18"  height="4"  fill={P.hill2} />
      <rect x="218" y="80" width="22"  height="6"  fill={P.hill2} />
      <rect x="300" y="83" width="20"  height="3"  fill={P.hill2} />

      {/* Near hill treeline suggestion */}
      <rect x="0"   y="88" width="400" height="12" fill={P.hill2} />
      {/* Pixel tree silhouettes on horizon */}
      {[0,16,32,48,64,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380].map((x,i)=>(
        <rect key={i} x={x} y={88-(i%3)*2} width="10" height={8+(i%3)*2} fill={i%3===2?P.hill3:P.hill2} />
      ))}
    </>
  );
}

// ─── Rich ground — 5-layer dithered grass ────────────────────────
function Ground() {
  return (
    <>
      {/* Ground base layers */}
      <rect x="0" y="96"  width="400" height="4"  fill={P.grass0} />
      <rect x="0" y="100" width="400" height="4"  fill={P.grass1} />
      <rect x="0" y="104" width="400" height="4"  fill={P.grass2} />
      <rect x="0" y="108" width="400" height="6"  fill={P.grass1} />
      <rect x="0" y="114" width="400" height="6"  fill={P.grass2} />
      <rect x="0" y="120" width="400" height="8"  fill={P.grass3} />
      <rect x="0" y="128" width="400" height="8"  fill={P.grass2} />
      <rect x="0" y="136" width="400" height="6"  fill={P.grass3} />
      <rect x="0" y="142" width="400" height="6"  fill={P.grass2} />
      <rect x="0" y="148" width="400" height="6"  fill={P.grass3} />
      <rect x="0" y="154" width="400" height="6"  fill={P.grass1} />
      <rect x="0" y="160" width="400" height="6"  fill={P.grass2} />
      <rect x="0" y="166" width="400" height="8"  fill={P.grass3} />
      <rect x="0" y="174" width="400" height="6"  fill={P.grass4} />
      <rect x="0" y="180" width="400" height="6"  fill={P.grass2} />
      <rect x="0" y="186" width="400" height="6"  fill={P.grass3} />
      <rect x="0" y="192" width="400" height="8"  fill={P.grass1} />

      {/* Dithering checkerboard accents — brightens some patches */}
      {[6,14,22,30,38,46,54,62,70,78,86,94,102,110,118,126,134,142,150,158,166,174,182,190,198,
        206,214,222,230,238,246,254,262,270,278,286,294,302,310,318,326,334,342,350,358,366,374,382,390].map((x,i)=>(
        <rect key={i} x={x} y={100+(i%8)*2} width="6" height="2" fill={i%3===0?P.grass4:i%3===1?P.grass3:P.grassDry} opacity="0.35" />
      ))}

      {/* Grass blade tips — animated gentle sway */}
      <g className="idle-sway" style={{ transformOrigin: "200px 165px", animationDuration: "4s" }}>
        {[4,12,20,28,36,44,52,60,68,76,84,92,100,108,116,124,132,140,148,156,164,172,180,188,196,
          204,212,220,228,236,244,252,260,268,276,284,292,300,308,316,324,332,340,348,356,364,372,380,388,396].map((x,i)=>(
          i%4!==2 && <rect key={i} x={x} y={172-(i%3)} width="2" height={3+(i%2)} fill={i%2===0?P.grass4:P.grass3} />
        ))}
      </g>

      {/* Dry grass / texture variation patches */}
      {[30,90,160,230,290,350].map((x,i)=>(
        <rect key={i} x={x} y={108+(i%3)*8} width={10+(i%3)*4} height="4" fill={P.grassDry} opacity="0.4" />
      ))}

      {/* Small rocks on ground */}
      {[42,130,300,370].map((x,i)=>(
        <g key={i}>
          <rect x={x}   y="162" width="8" height="4" fill={P.stone1} />
          <rect x={x+1} y="161" width="6" height="2" fill={P.stone2} />
          <rect x={x}   y="164" width="8" height="1" fill={P.stone0} />
        </g>
      ))}
    </>
  );
}

// ─── Dirt area (building footprint) ──────────────────────────────
function DirtPatch({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      <rect x="100" y="120" width="200" height="60" fill={P.dirt1} />
      {/* Dithered dirt texture rows */}
      {[122,126,130,134,138,142,146,150,154,158,162].map((y,i)=>(
        <rect key={i} x="100" y={y} width="200" height="2" fill={i%2===0?P.dirt2:P.dirt0} opacity="0.6" />
      ))}
      {/* Dirt pebbles */}
      {[110,135,165,190,230,265,285].map((x,i)=>(
        <g key={i}>
          <rect x={x}   y={124+(i%3)*10} width="4" height="2" fill={P.dirtLight} />
          <rect x={x+1} y={123+(i%3)*10} width="2" height="2" fill={P.dirt3} />
        </g>
      ))}
      {/* Shovel marks */}
      <rect x="120" y="158" width="20" height="2" fill={P.dirt0} opacity="0.7" />
      <rect x="240" y="154" width="16" height="2" fill={P.dirt0} opacity="0.7" />
    </>
  );
}

// ─── Foundation — rough stone blocks ─────────────────────────────
function Foundation({ visible }: { visible: boolean }) {
  if (!visible) return null;
  // 3D-ish foundation: top face lighter, front face darker
  return (
    <g className="idle-rise">
      {/* Foundation top face */}
      <rect x="106" y="126" width="188" height="10" fill={P.stone2} />
      {/* Top face dithering */}
      {[108,120,132,144,156,168,180,192,204,216,228,240,252,264,276,288].map((x,i)=>(
        <rect key={i} x={x} y="127" width="10" height="2" fill={i%2===0?P.stone3:P.stone1} opacity="0.5" />
      ))}
      {/* Stone block top — mortar lines */}
      {[120,148,176,204,232,260,288].map((x,i)=>(
        <rect key={i} x={x} y="126" width="2" height="10" fill={P.stoneMortar} />
      ))}
      <rect x="106" y="130" width="188" height="2" fill={P.stoneMortar} opacity="0.5" />

      {/* Foundation front face */}
      <rect x="106" y="136" width="188" height="28" fill={P.stone1} />
      {/* Front face texture */}
      {[110,130,150,170,190,210,230,250,270,290].map((x,i)=>(
        <g key={i}>
          {/* Stone block */}
          <rect x={x}   y="138" width="18" height="10" fill={i%2===0?P.stone2:P.stone1} />
          <rect x={x+1} y="139" width="16" height="3"  fill={P.stone3} opacity="0.3" />
          {/* Mortar gap */}
          <rect x={x}   y="148" width="20" height="2"  fill={P.stoneMortar} />
          <rect x={x+18}y="138" width="2"  height="12" fill={P.stoneMortar} />
        </g>
      ))}
      {/* Moss on lower foundation */}
      {[108,136,168,200,240,268,290].map((x,i)=>(
        <rect key={i} x={x} y="158" width={4+(i%3)*2} height="3" fill={P.stoneMoss} opacity="0.6" />
      ))}
      {/* Foundation shadow on ground */}
      <rect x="106" y="162" width="190" height="4" fill={P.shadow} opacity="0.4" />
    </g>
  );
}

// ─── Partial walls (stage 3) — exposed brick ─────────────────────
function WallsPartial({ visible }: { visible: boolean }) {
  if (!visible) return null;
  // Left section and right section, mid-height
  const BrickSection = ({ x, y, w, h }: { x:number; y:number; w:number; h:number }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.brick1} />
      {/* Brick rows — alternating offset */}
      {Array.from({ length: Math.floor(h/5) }, (_, r) => (
        Array.from({ length: Math.floor(w/12)+1 }, (_, c) => {
          const bx = x + (r%2===0 ? c*12 : c*12-6);
          const by = y + r*5;
          if (bx < x || bx >= x+w) return null;
          return (
            <g key={`${r}-${c}`}>
              <rect x={bx} y={by} width={Math.min(11, x+w-bx)} height="4" fill={r%3===0?P.brick2:r%3===1?P.brick1:P.brick3} />
              <rect x={bx} y={by} width={Math.min(11, x+w-bx)} height="1" fill={P.mortarLight} opacity="0.4" />
            </g>
          );
        })
      ))}
      {/* Mortar between rows */}
      {Array.from({ length: Math.floor(h/5) }, (_, r) => (
        <rect key={r} x={x} y={y+r*5+4} width={w} height="1" fill={P.mortar} />
      ))}
    </g>
  );
  return (
    <g className="idle-rise">
      <BrickSection x={108} y={106} w={50} h={30} />
      <BrickSection x={242} y={106} w={50} h={30} />
      {/* Top stubs */}
      <BrickSection x={108} y={80} w={30} h={26} />
      <BrickSection x={260} y={84} w={30} h={22} />
      {/* Scaffolding hint */}
      <rect x="104" y="78"  width="4"  height="60" fill={P.wood2} />
      <rect x="292" y="80"  width="4"  height="58" fill={P.wood2} />
      <rect x="104" y="100" width="196" height="3" fill={P.wood1} />
      <rect x="104" y="120" width="196" height="3" fill={P.wood1} />
    </g>
  );
}

// ─── Full brick walls (stage 4) ───────────────────────────────────
function WallsBrick({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const drawBrickWall = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.brick1} />
      {Array.from({ length: Math.ceil(h/6) }, (_, r) =>
        Array.from({ length: Math.ceil(w/14)+1 }, (_, c) => {
          const bx = x + (r%2===0 ? c*14 : c*14-7);
          const by = y + r*6;
          const bw = Math.min(13, x+w-bx);
          if (bx >= x+w || bw <= 0) return null;
          const bxClamped = Math.max(x, bx);
          const bwClamped = Math.min(13, x+w-bxClamped);
          return (
            <g key={`${r}-${c}`}>
              <rect x={bxClamped} y={by}   width={bwClamped} height="5" fill={r%4===0?P.brick3:r%4===1?P.brick2:r%4===2?P.brick1:P.brick0} />
              <rect x={bxClamped} y={by}   width={bwClamped} height="1" fill={P.mortarLight} opacity="0.3" />
              <rect x={bxClamped} y={by+1} width="1"         height="3" fill={P.brick3} opacity="0.2" />
            </g>
          );
        })
      )}
      {Array.from({ length: Math.ceil(h/6) }, (_, r) => (
        <rect key={r} x={x} y={y+r*6+5} width={w} height="1" fill={P.mortar} />
      ))}
    </g>
  );

  return (
    <g className="idle-rise">
      {/* Left wall */}
      {drawBrickWall(108, 70, 52, 90)}
      {/* Right wall */}
      {drawBrickWall(240, 70, 52, 90)}
      {/* Back wall (recessed) */}
      {drawBrickWall(160, 76, 80, 84)}
      {/* Wall shadow on ground */}
      <rect x="108" y="158" width="184" height="4" fill={P.shadow} opacity="0.5" />
      {/* Corner shadows */}
      <rect x="108" y="70"  width="6"  height="90" fill={P.brick0} opacity="0.4" />
      <rect x="286" y="70"  width="6"  height="90" fill={P.shadow} opacity="0.3" />
    </g>
  );
}

// ─── Painted walls (stage 7+) — Tokeni green stucco ──────────────
function WallsPainted({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const drawStucco = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.paint1} />
      {/* Stucco texture: alternating light/dark rows */}
      {Array.from({ length: Math.ceil(h/3) }, (_, r) => (
        <rect key={r} x={x} y={y+r*3} width={w} height="1" fill={r%2===0?P.paint2:P.paint0} opacity="0.3" />
      ))}
      {/* Vertical texture marks */}
      {Array.from({ length: Math.ceil(w/8) }, (_, c) => (
        <rect key={c} x={x+c*8} y={y} width="1" height={h} fill={P.paint0} opacity="0.15" />
      ))}
      {/* Highlight top edge */}
      <rect x={x} y={y} width={w} height="2" fill={P.paint3} opacity="0.5" />
      {/* Shadow bottom edge */}
      <rect x={x} y={y+h-2} width={w} height="2" fill={P.paint0} opacity="0.5" />
    </g>
  );
  return (
    <g>
      {drawStucco(108, 70, 52, 90)}
      {drawStucco(240, 70, 52, 90)}
      {drawStucco(160, 76, 80, 84)}
      {/* Corner trim */}
      <rect x="108" y="68"  width="6"  height="92" fill={P.wood2} />
      <rect x="286" y="68"  width="6"  height="92" fill={P.wood2} />
      <rect x="108" y="68"  width="184" height="4" fill={P.wood2} />
    </g>
  );
}

// ─── Roof partial (stage 5) ───────────────────────────────────────
function RoofPartial({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-rise">
      {/* Ridge beam */}
      <rect x="150" y="42" width="100" height="6" fill={P.wood0} />
      {/* Rafters */}
      {[108,128,148,168,188,208,228,248,268,288].map((x,i) => (
        <rect key={i} x={x} y={42+(Math.abs(i-5)*4)} width="6" height={30-(Math.abs(i-5)*3)} fill={P.wood1} />
      ))}
      {/* Partial tile — left half */}
      <rect x="108" y="64" width="80"  height="6" fill={P.roof1} />
      <rect x="188" y="60" width="24"  height="6" fill={P.roof1} />
      {/* Chimney stub — rough stone */}
      <rect x="224" y="36" width="16" height="30" fill={P.stone1} />
      <rect x="222" y="34" width="20" height="6"  fill={P.stone0} />
      {[224,228,232,236].map((x,i) => (
        <rect key={i} x={x} y="36" width="3" height="30" fill={i%2===0?P.stone2:P.stoneMortar} opacity="0.4" />
      ))}
    </g>
  );
}

// ─── Roof complete — layered tiles (stage 6+) ────────────────────
function RoofComplete({ visible, stage }: { visible: boolean; stage: number }) {
  if (!visible) return null;
  // Stardew-style: top-down perspective roof has stacked tile rows
  // Each row is offset and uses 3 shades: shadow(bottom), base(mid), highlight(top of tile)
  const tileRow = (y: number, xStart: number, rowW: number, rowNum: number) => {
    const tileW = 16;
    const tiles = [];
    for (let tx = xStart; tx < xStart + rowW; tx += tileW) {
      const tw = Math.min(tileW - 1, xStart + rowW - tx);
      const shade = rowNum % 3;
      tiles.push(
        <g key={tx}>
          <rect x={tx}   y={y}   width={tw} height="6" fill={shade===0?P.roof2:shade===1?P.roof1:P.roof0} />
          <rect x={tx}   y={y}   width={tw} height="2" fill={P.roof3} opacity="0.5" />
          <rect x={tx}   y={y+4} width={tw} height="2" fill={P.roof0} opacity="0.6" />
          <rect x={tx+tw}y={y}   width="1"  height="6" fill={P.roofRidge} />
        </g>
      );
    }
    return tiles;
  };

  return (
    <g>
      {/* Ridge */}
      <rect x="192" y="18" width="16" height="4" fill={P.roof0} />
      <rect x="192" y="16" width="16" height="4" fill={P.roofRidge} />

      {/* Left slope — staircase pixel outline */}
      <rect x="108" y="56" width="200" height="6" fill={P.roof0} />
      {tileRow(58, 108, 200, 0)}
      <rect x="110" y="50" width="180" height="6" fill={P.roof1} />
      {tileRow(52, 110, 180, 1)}
      <rect x="116" y="44" width="168" height="6" fill={P.roof2} />
      {tileRow(46, 116, 168, 2)}
      <rect x="124" y="38" width="152" height="6" fill={P.roof1} />
      {tileRow(40, 124, 152, 0)}
      <rect x="136" y="32" width="128" height="6" fill={P.roof2} />
      {tileRow(34, 136, 128, 1)}
      <rect x="150" y="26" width="100" height="6" fill={P.roof3} />
      {tileRow(28, 150, 100, 2)}
      <rect x="164" y="22" width="72"  height="6" fill={P.roof2} />
      {tileRow(24, 164, 72, 0)}
      <rect x="178" y="18" width="44"  height="6" fill={P.roof1} />

      {/* Roof eave underside — dark shadow */}
      <rect x="106" y="62" width="204" height="4" fill={P.roof0} />
      <rect x="104" y="64" width="208" height="2" fill={P.roofRidge} />

      {/* Chimney — detailed */}
      <g>
        {/* Chimney body */}
        <rect x="228" y="24" width="20" height="40" fill={P.brick1} />
        {Array.from({ length: 7 }, (_, r) => [
          <rect key={`a${r}`} x="228" y={24+r*6}   width="19" height="4" fill={r%2===0?P.brick2:P.brick1} />,
          <rect key={`b${r}`} x="228" y={24+r*6+4} width="19" height="2" fill={P.mortar} />,
        ])}
        {/* Chimney cap */}
        <rect x="226" y="22" width="24" height="4" fill={P.stone1} />
        <rect x="224" y="20" width="28" height="4" fill={P.stone0} />
        {/* Chimney shadow */}
        <rect x="228" y="24" width="3"  height="40" fill={P.shadow} opacity="0.4" />
        {/* Smoke — only late stages */}
        {stage >= 7 && (
          <g className="idle-smoke">
            <rect x="234" y="14" width="6" height="6" fill="#8a9a8a" opacity="0.7" />
            <rect x="232" y="6"  width="6" height="6" fill="#7a8a7a" opacity="0.5" />
            <rect x="234" y="0"  width="4" height="4" fill="#6a7a6a" opacity="0.3" />
          </g>
        )}
      </g>

      {/* Roof shadow on wall */}
      <rect x="106" y="62" width="204" height="6" fill={P.shadow} opacity="0.3" />
    </g>
  );
}

// ─── Door — wood plank style ──────────────────────────────────────
function Door({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Door frame */}
      <rect x="178" y="118" width="44" height="46" fill={P.wood0} />
      {/* Door panels */}
      <rect x="180" y="120" width="40" height="44" fill={P.wood1} />
      {/* Wood plank lines */}
      {[120,126,132,138,144,150,156].map((y,i)=>(
        <rect key={i} x="180" y={y} width="40" height="1" fill={i%2===0?P.woodGrain:P.wood2} opacity="0.6" />
      ))}
      {/* Top panel */}
      <rect x="183" y="122" width="16" height="18" fill={P.wood2} />
      <rect x="201" y="122" width="16" height="18" fill={P.wood2} />
      {/* Top panel shading */}
      <rect x="184" y="123" width="14" height="2"  fill={P.wood3} opacity="0.5" />
      <rect x="202" y="123" width="14" height="2"  fill={P.wood3} opacity="0.5" />
      {/* Bottom panel */}
      <rect x="183" y="142" width="34" height="16" fill={P.wood2} />
      <rect x="184" y="143" width="32" height="2"  fill={P.wood3} opacity="0.4" />
      {/* Doorknob */}
      <rect x="214" y="140" width="4" height="4" fill="#c8a040" />
      <rect x="215" y="141" width="2" height="2" fill="#e8c060" />
      {/* Doorstep — stone */}
      <rect x="176" y="162" width="48" height="6" fill={P.stone2} />
      <rect x="176" y="162" width="48" height="2" fill={P.stone3} />
      <rect x="176" y="164" width="48" height="1" fill={P.stoneMortar} />
      {/* Door shadow */}
      <rect x="178" y="116" width="44" height="4" fill={P.shadow} opacity="0.4" />
    </g>
  );
}

// ─── Windows — detailed glass pane with glow ─────────────────────
function Windows({ visible, stage }: { visible: boolean; stage: number }) {
  if (!visible) return null;
  const hasLight = stage >= 6;
  const WindowUnit = ({ x }: { x: number }) => (
    <g>
      {/* Outer frame */}
      <rect x={x}    y="102" width="34" height="30" fill={P.winFrame} />
      {/* Inner frame */}
      <rect x={x+2}  y="104" width="30" height="26" fill={P.winFrame} />
      {/* Glass panes — 4 quadrants */}
      <rect x={x+4}  y="106" width="12" height="10" fill={hasLight?P.winGlow:P.win1} />
      <rect x={x+18} y="106" width="12" height="10" fill={hasLight?P.winGlowMid:P.win1} />
      <rect x={x+4}  y="118" width="12" height="10" fill={P.win2} />
      <rect x={x+18} y="118" width="12" height="10" fill={P.win2} />
      {/* Window cross bars */}
      <rect x={x+2}  y="115" width="30" height="2"  fill={P.winFrame} />
      <rect x={x+15} y="104" width="2"  height="26" fill={P.winFrame} />
      {/* Glass reflections */}
      <rect x={x+5}  y="107" width="5"  height="4"  fill="#ffffff" opacity="0.18" />
      <rect x={x+19} y="107" width="4"  height="3"  fill="#ffffff" opacity="0.18" />
      {/* Windowsill */}
      <rect x={x-2}  y="130" width="38" height="4"  fill={P.wood2} />
      <rect x={x-2}  y="130" width="38" height="1"  fill={P.wood3} />
      {/* Window glow on wall */}
      {hasLight && (
        <>
          <rect x={x-4}  y="102" width="42" height="32" fill={P.winGlow} opacity="0.08" />
          <rect x={x-8}  y="98"  width="50" height="40" fill={P.winGlow} opacity="0.04" />
        </>
      )}
    </g>
  );
  return (
    <>
      <WindowUnit x={128} />
      <WindowUnit x={238} />
    </>
  );
}

// ─── Garden path with stepping stones ────────────────────────────
function GardenPath({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Path base */}
      <rect x="160" y="162" width="80" height="22" fill={P.path0} />
      {/* Stepping stones */}
      {[
        {x:162,y:162,w:18,h:8},
        {x:184,y:164,w:16,h:8},
        {x:204,y:162,w:18,h:8},
        {x:164,y:172,w:16,h:8},
        {x:184,y:174,w:18,h:8},
        {x:206,y:172,w:16,h:8},
      ].map((s,i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={i%2===0?P.path2:P.path1} />
          <rect x={s.x} y={s.y} width={s.w} height="2" fill={P.concreteLight} opacity="0.4" />
          <rect x={s.x} y={s.y+s.h-1} width={s.w} height="1" fill={P.path0} opacity="0.5" />
          {/* Moss on stone edges */}
          <rect x={s.x}   y={s.y+s.h-2} width={3+(i%3)} height="2" fill={P.pathMoss} opacity="0.5" />
        </g>
      ))}
      {/* Shadow under path */}
      <rect x="160" y="182" width="80" height="3" fill={P.shadow} opacity="0.3" />
    </g>
  );
}

// ─── House trim/details (stage 8+) ───────────────────────────────
function HouseDetails({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Window flower boxes */}
      <rect x="126" y="134" width="38" height="6" fill={P.wood1} />
      <rect x="236" y="134" width="38" height="6" fill={P.wood1} />
      <rect x="126" y="134" width="38" height="2" fill={P.wood2} opacity="0.6" />
      {/* Flowers in boxes */}
      {[130,136,142,148,154].map((x,i)=>(
        <g key={i}>
          <rect x={x}   y="128" width="2" height="6"  fill={P.flowerStem} />
          <rect x={x-2} y="122" width="6" height="6"  fill={[P.petalRed1,P.petalYellow1,P.petalPink1][i%3]} />
          <rect x={x-1} y="120" width="4" height="4"  fill={[P.petalRed2,P.petalYellow2,P.petalPink2][i%3]} />
          <rect x={x}   y="121" width="2" height="2"  fill={P.petalCenter} />
        </g>
      ))}
      {[240,246,252,258,264].map((x,i)=>(
        <g key={i}>
          <rect x={x}   y="128" width="2" height="6"  fill={P.flowerStem} />
          <rect x={x-2} y="122" width="6" height="6"  fill={[P.petalPink1,P.petalRed1,P.petalYellow1][i%3]} />
          <rect x={x-1} y="120" width="4" height="4"  fill={[P.petalPink2,P.petalRed2,P.petalYellow2][i%3]} />
          <rect x={x}   y="121" width="2" height="2"  fill={P.petalCenter} />
        </g>
      ))}
      {/* Shutters on windows */}
      <rect x="120" y="100" width="8"  height="32" fill={P.wood2} />
      <rect x="162" y="100" width="8"  height="32" fill={P.wood2} />
      <rect x="230" y="100" width="8"  height="32" fill={P.wood2} />
      <rect x="272" y="100" width="8"  height="32" fill={P.wood2} />
      {/* Shutter slats */}
      {[102,106,110,114,118,122,126].map((y,i)=>(
        <>
          <rect key={`a${i}`} x="120" y={y} width="8" height="2" fill={P.wood3} opacity="0.3" />
          <rect key={`b${i}`} x="162" y={y} width="8" height="2" fill={P.wood3} opacity="0.3" />
          <rect key={`c${i}`} x="230" y={y} width="8" height="2" fill={P.wood3} opacity="0.3" />
          <rect key={`d${i}`} x="272" y={y} width="8" height="2" fill={P.wood3} opacity="0.3" />
        </>
      ))}
    </g>
  );
}

// ─── Cosmetic: Mailbox ────────────────────────────────────────────
function Mailbox({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Post */}
      <rect x="100" y="150" width="4"  height="18" fill={P.mailPost0} />
      <rect x="101" y="150" width="2"  height="18" fill={P.mailPost1} />
      {/* Box body */}
      <rect x="95"  y="138" width="18" height="14" fill={P.mailBox1} />
      <rect x="95"  y="136" width="18" height="4"  fill={P.mailBox2} />
      <rect x="95"  y="148" width="18" height="2"  fill={P.mailBox0} />
      {/* Arched top */}
      <rect x="97"  y="132" width="14" height="6"  fill={P.mailBox2} />
      <rect x="99"  y="130" width="10" height="4"  fill={P.mailBox2} />
      {/* Door slot */}
      <rect x="100" y="143" width="8"  height="2"  fill={P.mailBox0} />
      {/* Flag */}
      <rect x="112" y="136" width="2"  height="10" fill={P.mailPost1} />
      <rect x="114" y="136" width="6"  height="5"  fill={P.mailFlag} />
      {/* Shadow */}
      <rect x="95"  y="152" width="18" height="3"  fill={P.shadow} opacity="0.3" />
    </g>
  );
}

// ─── Cosmetic: Tree (Stardew Valley oak style) ────────────────────
function Tree({ x, flip, visible }: { x: number; flip?: boolean; visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-sway" style={{ transformOrigin: `${x + 14}px 165px` }}>
      {/* Shadow ellipse */}
      <rect x={x-2}  y="166" width="32" height="6"  fill={P.shadow} opacity="0.35" />
      {/* Trunk — 3 shades */}
      <rect x={x+10} y="138" width="8"  height="30" fill={P.trunk0} />
      <rect x={x+11} y="138" width="4"  height="30" fill={P.trunk1} />
      <rect x={x+12} y="140" width="2"  height="26" fill={P.trunk2} />
      {/* Trunk knot detail */}
      <rect x={x+10} y="152" width="4"  height="3"  fill={P.trunkDark} />
      <rect x={x+11} y="153" width="2"  height="2"  fill={P.trunk2} opacity="0.5" />
      {/* Root flare */}
      <rect x={x+8}  y="162" width="12" height="4"  fill={P.trunk0} />
      <rect x={x+6}  y="164" width="16" height="2"  fill={P.trunkDark} opacity="0.6" />

      {/* Canopy — 5 layers of leaf shades for Stardew depth */}
      {/* Back dark shadow layer */}
      <rect x={x}    y="114" width="28" height="28" fill={P.leaf0} />
      <rect x={x+4}  y="108" width="20" height="10" fill={P.leaf0} />
      <rect x={x+8}  y="104" width="12" height="8"  fill={P.leaf0} />
      {/* Main canopy */}
      <rect x={x+2}  y="116" width="24" height="22" fill={P.leaf1} />
      <rect x={x+4}  y="112" width="20" height="8"  fill={P.leaf1} />
      <rect x={x+8}  y="106" width="12" height="8"  fill={P.leaf2} />
      {/* Highlight clusters */}
      <rect x={x+4}  y="118" width="10" height="8"  fill={P.leaf2} />
      <rect x={x+16} y="116" width="8"  height="10" fill={P.leaf2} />
      <rect x={x+8}  y="110" width="8"  height="6"  fill={P.leaf3} />
      {/* Light tips */}
      <rect x={x+6}  y="120" width="6"  height="4"  fill={P.leaf4} />
      <rect x={x+16} y="118" width="4"  height="4"  fill={P.leaf4} />
      <rect x={x+10} y="108" width="6"  height="4"  fill={P.leafLight} />
      {/* Pixel leaf details */}
      <rect x={x+2}  y="134" width="4"  height="4"  fill={P.leaf3} />
      <rect x={x+22} y="130" width="4"  height="6"  fill={P.leaf2} />
      <rect x={x}    y="126" width="4"  height="6"  fill={P.leafDark} opacity="0.6" />
      {/* Apple accent (decorative fruit) */}
      <rect x={x+18} y="126" width="4"  height="4"  fill="#c03020" />
      <rect x={x+19} y="124" width="2"  height="2"  fill="#e05030" />
    </g>
  );
}

// ─── Cosmetic: Fence — wooden split-rail ─────────────────────────
function Fence({ visible }: { visible: boolean }) {
  if (!visible) return null;
  // Left section
  const posts = [94, 110, 126, 142, 158, 242, 258, 274, 290, 306];
  const leftRails = [[94, 148, 66], [94, 156, 66]];
  const rightRails = [[242, 148, 66], [242, 156, 66]];
  return (
    <g>
      {posts.map((px, i) => (
        <g key={i}>
          {/* Post with cap */}
          <rect x={px}   y="138" width="6" height="24" fill={P.fence1} />
          <rect x={px+1} y="138" width="4" height="24" fill={P.fence2} />
          <rect x={px}   y="136" width="6" height="4"  fill={P.fenceLight} />
          <rect x={px}   y="160" width="6" height="2"  fill={P.fenceShadow} />
        </g>
      ))}
      {/* Rails */}
      {[...leftRails, ...rightRails].map(([rx, ry, rw], i) => (
        <g key={i}>
          <rect x={rx}   y={ry}   width={rw} height="4" fill={P.fence1} />
          <rect x={rx}   y={ry}   width={rw} height="1" fill={P.fenceLight} opacity="0.6" />
          <rect x={rx}   y={ry+3} width={rw} height="1" fill={P.fenceShadow} opacity="0.4" />
        </g>
      ))}
    </g>
  );
}

// ─── Cosmetic: Flower patch ───────────────────────────────────────
function Flowers({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const flowers = [
    { x: 86,  y: 158, petal: 0, size: 1 },
    { x: 92,  y: 154, petal: 1, size: 0 },
    { x: 98,  y: 160, petal: 2, size: 1 },
    { x: 104, y: 155, petal: 0, size: 0 },
    { x: 270, y: 156, petal: 1, size: 1 },
    { x: 278, y: 160, petal: 2, size: 0 },
    { x: 284, y: 154, petal: 0, size: 1 },
    { x: 292, y: 158, petal: 1, size: 0 },
  ];
  const petals = [
    [P.petalRed0,  P.petalRed1,  P.petalRed2],
    [P.petalYellow0,P.petalYellow1,P.petalYellow2],
    [P.petalPink0, P.petalPink1, P.petalPink2],
  ];
  return (
    <g>
      {flowers.map((f, i) => {
        const [p0, p1, p2] = petals[f.petal]!;
        const s = f.size;
        return (
          <g key={i}>
            {/* Stem */}
            <rect x={f.x+2} y={f.y+3}  width="2" height={5+s*2} fill={P.flowerStem} />
            <rect x={f.x+2} y={f.y+4}  width="1" height={5+s*2} fill={P.flowerStemLight} opacity="0.5" />
            {/* Petals */}
            <rect x={f.x}   y={f.y}    width={6+s*2} height={5+s} fill={p0} />
            <rect x={f.x+1} y={f.y-1}  width={4+s*2} height={3+s} fill={p1} />
            <rect x={f.x+1} y={f.y}    width={2+s}   height={3+s} fill={p2} />
            {/* Center */}
            <rect x={f.x+2} y={f.y+1}  width="2" height="2" fill={P.petalCenter} />
            {/* Ground leaf */}
            <rect x={f.x-2} y={f.y+6}  width="4" height="2" fill={P.flowerStemLight} opacity="0.6" />
          </g>
        );
      })}
    </g>
  );
}

// ─── Cosmetic: Street lamp ────────────────────────────────────────
function StreetLamp({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Post */}
      <rect x="362" y="108" width="4"  height="58" fill={P.lampMetal0} />
      <rect x="363" y="108" width="2"  height="58" fill={P.lampMetal1} />
      <rect x="364" y="108" width="1"  height="58" fill={P.lampMetal2} opacity="0.5" />
      {/* Arm */}
      <rect x="346" y="108" width="20" height="4"  fill={P.lampMetal1} />
      <rect x="346" y="108" width="20" height="1"  fill={P.lampMetal2} opacity="0.6" />
      {/* Lamp housing */}
      <rect x="340" y="96"  width="18" height="14" fill={P.lampMetal0} />
      <rect x="342" y="98"  width="14" height="10" fill={P.lampGlass} />
      <rect x="342" y="98"  width="14" height="3"  fill={P.lampGlow1} opacity="0.8" />
      {/* Glass highlight */}
      <rect x="343" y="99"  width="4"  height="3"  fill="#ffffff" opacity="0.3" />
      {/* Glow halos */}
      <rect x="332" y="92"  width="34" height="22" fill={P.lampGlow0} opacity="0.12" />
      <rect x="320" y="88"  width="58" height="30" fill={P.lampGlow0} opacity="0.06" />
      {/* Light cone on ground */}
      <rect x="344" y="162" width="10" height="4"  fill={P.lampHalo} opacity="0.12" />
      <rect x="338" y="164" width="22" height="4"  fill={P.lampHalo} opacity="0.07" />
      {/* Base */}
      <rect x="360" y="162" width="8"  height="4"  fill={P.lampMetal0} />
      <rect x="358" y="164" width="12" height="2"  fill={P.lampMetal1} />
    </g>
  );
}

// ─── Cosmetic: Dog ────────────────────────────────────────────────
function Dog({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-bounce" style={{ transformOrigin: "80px 165px", animationDuration: "3s" }}>
      {/* Shadow */}
      <rect x="68"  y="169" width="22" height="3"  fill={P.shadow} opacity="0.3" />
      {/* Body */}
      <rect x="68"  y="155" width="22" height="14" fill={P.dogBody1} />
      <rect x="70"  y="154" width="18" height="8"  fill={P.dogBody2} />
      <rect x="68"  y="158" width="22" height="3"  fill={P.dogBody0} opacity="0.4" />
      {/* Head */}
      <rect x="82"  y="146" width="14" height="14" fill={P.dogBody1} />
      <rect x="83"  y="147" width="10" height="6"  fill={P.dogBody2} />
      {/* Ears — floppy */}
      <rect x="82"  y="144" width="4"  height="6"  fill={P.dogBody0} />
      <rect x="92"  y="144" width="4"  height="6"  fill={P.dogBody0} />
      {/* Snout */}
      <rect x="92"  y="154" width="6"  height="4"  fill={P.dogBody2} />
      <rect x="94"  y="155" width="4"  height="2"  fill={P.dogBody0} opacity="0.5" />
      {/* Nose */}
      <rect x="96"  y="153" width="4"  height="2"  fill={P.dogNose} />
      {/* Eye */}
      <rect x="88"  y="150" width="3"  height="3"  fill={P.dogEye} />
      <rect x="89"  y="151" width="1"  height="1"  fill="#ffffff" opacity="0.6" />
      {/* Tail wagging */}
      <rect x="66"  y="152" width="6"  height="4"  fill={P.dogBody1} className="idle-sway" style={{ transformOrigin: "70px 154px", animationDuration: "0.8s" }} />
      <rect x="62"  y="150" width="6"  height="4"  fill={P.dogBody1} className="idle-sway" style={{ transformOrigin: "65px 152px", animationDuration: "0.8s", animationDelay: "0.1s" }} />
      {/* Legs */}
      <rect x="70"  y="167" width="4"  height="5"  fill={P.dogBody1} />
      <rect x="76"  y="167" width="4"  height="5"  fill={P.dogBody0} />
      <rect x="82"  y="167" width="4"  height="5"  fill={P.dogBody1} />
      <rect x="88"  y="167" width="4"  height="5"  fill={P.dogBody0} />
      {/* Paws */}
      <rect x="70"  y="170" width="5"  height="2"  fill={P.dogBody0} />
      <rect x="76"  y="170" width="5"  height="2"  fill={P.dogBody0} />
      <rect x="82"  y="170" width="5"  height="2"  fill={P.dogBody0} />
      <rect x="88"  y="170" width="5"  height="2"  fill={P.dogBody0} />
    </g>
  );
}

// ─── Celebration overlay ──────────────────────────────────────────
function CelebrationOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-celebrate">
      {/* Confetti bursts */}
      {[
        [40,30,0],[60,18,1],[90,40,2],[120,22,3],[160,12,0],[200,28,1],[240,15,2],
        [280,35,3],[310,18,0],[340,42,1],[368,24,2],[50,60,3],[140,65,0],[250,58,1],[330,62,2],
      ].map(([x,y,c],i) => {
        const colors = [P.confetti0,P.confetti1,P.confetti2,P.confetti3];
        return (
          <g key={i}>
            <rect x={x!}   y={y!}   width="4" height="4" fill={colors[c!]} />
            <rect x={x!+6} y={y!-4} width="3" height="3" fill={colors[(c!+1)%4]} />
            <rect x={x!-4} y={y!+4} width="2" height="4" fill={colors[(c!+2)%4]} />
          </g>
        );
      })}
      {/* Banner */}
      <rect x="80" y="4" width="240" height="20" fill={P.banner} opacity="0.92" rx="3" />
      <rect x="80" y="4" width="240" height="3"  fill="#3d8a40" opacity="0.8" />
      <text x="200" y="18" textAnchor="middle" fontSize="11" fontWeight="bold"
        fill="#f8e050" fontFamily="'Courier New', Courier, monospace" letterSpacing="1">
        CASA CONQUISTADA!
      </text>
    </g>
  );
}

// ─── Construction sign ────────────────────────────────────────────
function ConstructionSign() {
  return (
    <g>
      {/* Post */}
      <rect x="189" y="130" width="4" height="40" fill={P.wood1} />
      <rect x="190" y="130" width="2" height="40" fill={P.wood2} />
      {/* Board with angled support */}
      <rect x="162" y="104" width="60" height="28" fill={P.wood0} />
      <rect x="164" y="106" width="56" height="24" fill={P.wood1} />
      <rect x="164" y="106" width="56" height="2"  fill={P.wood3} opacity="0.4" />
      {/* Support brace */}
      <rect x="165" y="128" width="4"  height="8"  fill={P.wood0} />
      <rect x="215" y="128" width="4"  height="8"  fill={P.wood0} />
      {/* Sign text area — wood plank */}
      {[108,112,116,120,124].map((y,i)=>(
        <rect key={i} x="164" y={y} width="56" height="3" fill={i%2===0?P.wood2:P.wood1} opacity="0.5" />
      ))}
      {/* Mini house icon drawn in pixels */}
      <rect x="172" y="110" width="18" height="12" fill={P.brick2} />
      <rect x="170" y="107" width="22" height="5"  fill={P.roof1} />
      <rect x="168" y="105" width="26" height="4"  fill={P.roof2} />
      <rect x="178" y="116" width="5"  height="6"  fill={P.wood1} />
      <rect x="174" y="112" width="5"  height="4"  fill={P.win2} opacity="0.8" />
      <rect x="181" y="112" width="5"  height="4"  fill={P.win2} opacity="0.8" />
      {/* Text hint */}
      <text x="210" y="120" fontSize="7" fill={P.wood3} fontFamily="monospace" opacity="0.9">OBRA</text>
    </g>
  );
}

// ─── Main exported component ──────────────────────────────────────
export function HouseScene({ stageIndex, unlockedSlots, celebrating = false, className }: Props) {
  const s = stageIndex;
  const slots = unlockedSlots;

  return (
    <svg
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full select-none", className)}
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
      aria-label={`Cena da casa — estágio ${s}`}
      role="img"
    >
      {/* ── Layer 1: Sky ── */}
      <Sky stage={s} />

      {/* ── Layer 2: Distant hills ── */}
      <Hills />

      {/* ── Layer 3: Ground ── */}
      <Ground />

      {/* ── Layer 4: Dirt patch (building site) ── */}
      <DirtPatch visible={s >= 1} />

      {/* ── Layer 5: Construction sign (stage 0 only) ── */}
      {s === 0 && <ConstructionSign />}

      {/* ── Layer 6: Foundation ── */}
      <Foundation visible={s >= 2} />

      {/* ── Layer 7: Walls ── */}
      <WallsPartial visible={s === 3} />
      <WallsBrick   visible={s >= 4 && s < 7} />
      <WallsPainted visible={s >= 7} />

      {/* ── Layer 8: Roof ── */}
      <RoofPartial  visible={s === 5} />
      <RoofComplete visible={s >= 6} stage={s} />

      {/* ── Layer 9: Door & Windows ── */}
      <Door    visible={s >= 6} />
      <Windows visible={s >= 6} stage={s} />

      {/* ── Layer 10: Trim & details ── */}
      <HouseDetails visible={s >= 8} />

      {/* ── Layer 11: Garden path ── */}
      <GardenPath visible={s >= 8} />

      {/* ── Layer 12: Cosmetics (missions) ── */}
      <Fence      visible={slots.has("fence")} />
      <Flowers    visible={slots.has("flowers")} />
      <Mailbox    visible={slots.has("mailbox")} />
      <StreetLamp visible={slots.has("lamp")} />
      <Tree x={30}  flip={false} visible={slots.has("tree1")} />
      <Tree x={336} flip={true}  visible={slots.has("tree2")} />
      <Dog        visible={slots.has("dog")} />

      {/* ── Layer 13: Celebration ── */}
      <CelebrationOverlay visible={celebrating || s >= 10} />
    </svg>
  );
}
