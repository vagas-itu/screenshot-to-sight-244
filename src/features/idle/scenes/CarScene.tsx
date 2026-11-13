/**
 * CarScene — Stardew Valley-inspired 16-bit pixel-art SVG.
 *
 * Depicts a mechanic's garage/workshop. The scene has rich depth:
 * - Atmospheric sky visible through open garage door
 * - Detailed garage interior: concrete floor dithering, brick/metal walls,
 *   tool pegboard, neon/incandescent lighting, workbench
 * - Car rendered in full 16-bit pixel style with 3-4 shade metallic body,
 *   detailed wheels, glass reflections, headlight glow
 * - Progressive restoration: rusted wreck → cleaned → new wheels → bodywork
 *   → paint → glass/lights → interior → accessories → showroom
 */

import { cn } from "@/lib/utils";

interface Props {
  stageIndex: number;
  unlockedSlots: Set<string>;
  celebrating?: boolean;
  className?: string;
}

// ─── 16-bit palette ───────────────────────────────────────────────
const P = {
  // Sky (visible through open garage door / window)
  sky0: "#1a2a3c",
  sky1: "#1e3450",
  sky2: "#243e60",
  sky3: "#2a5070",
  sunYellow: "#f0d040",
  starColor: "#e0e0c0",

  // Garage exterior
  extWall0: "#1a1e24",
  extWall1: "#222830",
  extRoof0: "#181c20",
  extRoof1: "#202428",
  extTrim: "#2a3038",

  // Garage interior — walls
  wall0: "#1e2430",   // deep shadow wall
  wall1: "#252c3a",   // base wall
  wall2: "#2e3648",   // mid wall (slightly lit)
  wall3: "#384058",   // highlight near lamp
  wallBrick0: "#1c2030",
  wallBrick1: "#242838",

  // Concrete floor — 4 shades + dithering
  floor0: "#1a1e24",  // deep shadow
  floor1: "#22262e",  // base
  floor2: "#2a2e38",  // mid
  floor3: "#333840",  // highlight
  floorOil: "#181818",// oil stain
  floorCrack: "#141418",
  floorLine: "#141820",

  // Garage door (metal roll-up)
  door0: "#1e2838",
  door1: "#26303e",
  door2: "#2e3a4e",
  doorFrame: "#181e28",
  doorHandle: "#4a5060",

  // Workbench / pegboard / shelves
  bench0: "#3a2210",
  bench1: "#5a3420",
  bench2: "#7a4c30",
  bench3: "#9a6440",
  peg0: "#1c1c1c",
  peg1: "#2c2c2c",
  tool0: "#6a6050",  // tools/metal
  tool1: "#8a8070",
  tool2: "#b0a890",
  toolRed: "#8a2010",
  toolHandle: "#5a3018",

  // Car body — rusted (stage 0-1)
  rust0: "#4a2a10",
  rust1: "#6a3e18",
  rust2: "#8a5020",
  rust3: "#a06028",
  rustSpot: "#7a3810",
  scratch: "#3a2008",
  dent: "#2a1808",

  // Car body — restored, unpainted (stage 2-4: bare metal)
  metal0: "#2a3040",
  metal1: "#3a4050",
  metal2: "#4a5060",
  metal3: "#5a6070",
  metalHighlight: "#7a8090",
  metalShadow: "#1a2030",

  // Car body — painted (stage 5+: deep ocean blue-green)
  body0: "#1a3048",  // deep shadow
  body1: "#1e3a58",  // base
  body2: "#245070",  // mid
  body3: "#2c6888",  // highlight
  bodyGloss: "#3a80a0",// gloss line
  bodyRoof0: "#141e2c",
  bodyRoof1: "#1a2838",
  bodyRoof2: "#203044",

  // Wheel — old
  tire: "#151515",
  tireRim: "#1a1a1a",
  rimOld0: "#3a3828",
  rimOld1: "#5a5840",
  rimOld2: "#7a7858",
  rimBolt: "#4a4838",

  // Wheel — new / shiny
  rimNew0: "#484838",
  rimNew1: "#707060",
  rimNew2: "#a0a090",
  rimNew3: "#c8c8b0",
  rimSpoke: "#888878",
  rimCenter: "#b0b0a0",
  rimCap: "#d0d0c0",

  // Window glass
  glass0: "#1a2a38",  // dirty
  glass1: "#1a3a58",  // cleaned
  glass2: "#204a70",  // new
  glass3: "#408090",  // bright
  glassDirty: "#201810",
  glassFrame0: "#101418",
  glassFrame1: "#181c20",
  glassReflect: "#80c0e0",
  glassRefract: "#a0d8f0",

  // Headlights
  light0: "#1c1c18",  // dead
  light1: "#e0e0c0",  // new
  lightGlow: "#f8f840",
  lightBeam: "#f0f060",

  // Car interior
  seatOld0: "#2a1808",
  seatOld1: "#3a2010",
  seatNew0: "#2e1e10",
  seatNew1: "#4a3020",
  seatNew2: "#6a4830",
  dash0: "#1a1a1a",
  dash1: "#282828",

  // Bumper
  bumper0: "#1e2028",
  bumper1: "#2a2c38",
  bumperNew0: "#484858",
  bumperNew1: "#606070",
  bumperNew2: "#7a7a8a",

  // Exhaust
  exhaust: "#2a2a28",
  smoke0: "#4a5458",
  smoke1: "#3a4448",
  smoke2: "#2a3438",

  // Lamp / lighting
  lamp0: "#484838",
  lamp1: "#686850",
  lamp2: "#888860",
  lampBulb: "#f8f0c0",
  lampGlow: "#f0e080",
  lampBeam: "#e8d060",
  lampCone: "#d8c050",

  // Toolbox
  tbox0: "#1e1e18",
  tbox1: "#2e2e20",
  tbox2: "#3e3e28",
  tbox3: "#4e4e38",
  tboxMetal: "#6a6a58",
  tboxHandle: "#8a8a70",

  // Mechanic character
  mechSkin0: "#7a5028",
  mechSkin1: "#a06838",
  mechSkin2: "#c88050",
  mechHair0: "#1a1008",
  mechHair1: "#281808",
  mechOverall0: "#1e2838",
  mechOverall1: "#2a3848",
  mechOverall2: "#3a4858",
  mechShirt: "#8a4020",
  mechBoot: "#1a1810",

  // Trophy
  trophy0: "#7a5808",
  trophy1: "#a87820",
  trophy2: "#d0a038",
  trophy3: "#f0c858",
  trophyBase: "#3a2a10",

  // Flag
  flag0: "#8a1010",
  flag1: "#c02020",
  flag2: "#e03030",
  flagCheck: "#f0f0f0",
  flagPole: "#606050",

  // Character (celebrating)
  char0: "#3a6a30",  // Tokeni green clothes
  char1: "#4a8a3c",
  charSkin: "#c88050",
  charSkin2: "#a06838",

  // Sticker
  sticker0: "#1a3850",
  sticker1: "#204868",
  sticker2: "#2c6888",

  // Shadows / atmosphere
  shadow: "#0a0c10",
  shadowMid: "#10141a",
  ambient: "#181e28",

  // Celebration
  conf0: "#f0d030",
  conf1: "#e02020",
  conf2: "#2080e0",
  conf3: "#20b840",
  bannerBg: "#101820",
};

// ─── Sky outside ─────────────────────────────────────────────────
function Sky({ stage }: { stage: number }) {
  const day = stage >= 5;
  return (
    <>
      <rect x="0" y="0" width="400" height="20" fill={day?"#2a5070":P.sky0} />
      <rect x="0" y="20" width="400" height="15" fill={day?"#3a6888":P.sky1} />
      <rect x="0" y="35" width="400" height="10" fill={day?"#4a80a0":P.sky2} />
      <rect x="0" y="45" width="400" height="10" fill={day?"#5a98b8":P.sky3} />
      <rect x="0" y="55" width="400" height="10" fill={day?"#6ab0cc":"#1a2a3c"} />
      {day ? (
        <>
          <rect x="310" y="8" width="14" height="14" fill={P.sunYellow} />
          <rect x="308" y="10" width="18" height="10" fill={P.sunYellow} />
          <rect x="312" y="6" width="10" height="18" fill={P.sunYellow} />
          <rect x="306" y="12" width="4"  height="4"  fill="#f8f870" opacity="0.6" />
          <rect x="326" y="12" width="4"  height="4"  fill="#f8f870" opacity="0.6" />
        </>
      ) : (
        <>
          <rect x="310" y="10" width="10" height="10" fill="#d8c880" />
          <rect x="308" y="12" width="14" height="6"  fill="#d8c880" />
          {[[20,6],[50,12],[80,4],[120,16],[160,8],[200,14],[240,5],[280,18],[350,10],[380,15]].map(([x,y],i)=>(
            <rect key={i} x={x} y={y} width={i%3===0?2:1} height={i%3===0?2:1} fill={P.starColor} opacity="0.6" />
          ))}
        </>
      )}
    </>
  );
}

// ─── Garage exterior (roof and side walls) ───────────────────────
function GarageExterior() {
  return (
    <>
      {/* Roof overhang */}
      <rect x="0"   y="64" width="400" height="6" fill={P.extRoof0} />
      <rect x="0"   y="68" width="400" height="3" fill={P.extRoof1} />
      <rect x="0"   y="71" width="400" height="2" fill={P.extTrim} />
      {/* Side walls */}
      <rect x="0"   y="0"  width="20"  height="200" fill={P.extWall1} />
      <rect x="380" y="0"  width="20"  height="200" fill={P.extWall1} />
      <rect x="0"   y="0"  width="6"   height="200" fill={P.extWall0} />
      <rect x="394" y="0"  width="6"   height="200" fill={P.extWall0} />
    </>
  );
}

// ─── Garage interior walls with brick/panel texture ──────────────
function GarageWalls({ stage }: { stage: number }) {
  return (
    <>
      {/* Back wall */}
      <rect x="20" y="72" width="360" height="80" fill={P.wall1} />
      {/* Brick courses — subtle */}
      {Array.from({length: 13}, (_,r) => (
        <rect key={r} x="20" y={72+r*6} width="360" height="1" fill={r%2===0?P.wallBrick0:P.wallBrick1} opacity="0.4" />
      ))}
      {/* Vertical mortar lines */}
      {Array.from({length: 25}, (_,c) => (
        <rect key={c} x={20+c*15+(c%2)*7} y="72" width="1" height="80" fill={P.wallBrick0} opacity="0.2" />
      ))}

      {/* Ambient wall lighting from lamp (stage 3+) */}
      {stage >= 3 && (
        <>
          <rect x="20"  y="72" width="200" height="80" fill={P.lamp2} opacity="0.04" />
          <rect x="80"  y="72" width="140" height="60" fill={P.lampGlow} opacity="0.03" />
        </>
      )}

      {/* Pegboard tool wall — right side */}
      <rect x="280" y="74" width="100" height="70" fill={P.peg0} />
      {/* Pegboard holes */}
      {Array.from({length:8}, (_,r) => Array.from({length:10}, (_,c) => (
        <rect key={`${r}-${c}`} x={284+c*10} y={78+r*8} width="2" height="2" fill={P.peg1} />
      )))}
      {/* Tools on pegboard */}
      <rect x="286" y="78"  width="4"  height="20" fill={P.tool2} />   {/* wrench */}
      <rect x="285" y="76"  width="6"  height="4"  fill={P.tool1} />
      <rect x="296" y="78"  width="16" height="3"  fill={P.toolRed} /> {/* screwdriver */}
      <rect x="296" y="77"  width="4"  height="5"  fill={P.toolHandle} />
      <rect x="318" y="78"  width="18" height="4"  fill={P.tool2} />   {/* level */}
      <rect x="318" y="76"  width="18" height="2"  fill={P.tool1} />
      <rect x="290" y="94"  width="14" height="14" fill={P.tool1} />   {/* circular saw */}
      <rect x="295" y="99"  width="4"  height="4"  fill={P.peg0} />
      <rect x="310" y="92"  width="8"  height="16" fill={P.toolRed} /> {/* paint can */}
      <rect x="309" y="90"  width="10" height="4"  fill={P.tool1} />
      <rect x="322" y="92"  width="12" height="18" fill={P.tool0} />   {/* toolbox mini */}
      <rect x="321" y="90"  width="14" height="4"  fill={P.tboxMetal} />
      <rect x="335" y="80"  width="6"  height="22" fill={P.tool2} />   {/* pliers */}
      <rect x="333" y="78"  width="10" height="4"  fill={P.tool1} />

      {/* Workbench */}
      <rect x="20"  y="136" width="90"  height="16" fill={P.bench1} />
      <rect x="20"  y="134" width="90"  height="4"  fill={P.bench2} />
      <rect x="20"  y="136" width="90"  height="2"  fill={P.bench3} opacity="0.5" />
      {/* Bench legs */}
      <rect x="22"  y="150" width="6"   height="22" fill={P.bench0} />
      <rect x="98"  y="150" width="6"   height="22" fill={P.bench0} />
      {/* Items on workbench */}
      <rect x="26"  y="126" width="16"  height="10" fill={P.tbox2} />
      <rect x="25"  y="124" width="18"  height="4"  fill={P.tboxMetal} />
      <rect x="45"  y="128" width="12"  height="8"  fill={P.tool1} />
      <rect x="60"  y="125" width="8"   height="11" fill={P.toolRed} />
      <rect x="71"  y="127" width="18"  height="9"  fill={P.tool0} opacity="0.8" />
      <rect x="75"  y="130" width="4"   height="2"  fill={P.tool2} />
    </>
  );
}

// ─── Garage floor — dithered concrete ────────────────────────────
function GarageFloor() {
  return (
    <>
      {/* Floor base layers */}
      <rect x="20" y="152" width="360" height="4"  fill={P.floor1} />
      <rect x="20" y="156" width="360" height="6"  fill={P.floor2} />
      <rect x="20" y="162" width="360" height="6"  fill={P.floor1} />
      <rect x="20" y="168" width="360" height="6"  fill={P.floor2} />
      <rect x="20" y="174" width="360" height="6"  fill={P.floor3} />
      <rect x="20" y="180" width="360" height="6"  fill={P.floor2} />
      <rect x="20" y="186" width="360" height="6"  fill={P.floor1} />
      <rect x="20" y="192" width="360" height="8"  fill={P.floor0} />

      {/* Floor tile lines */}
      {[20,68,116,164,212,260,308,356].map((x,i)=>(
        <rect key={i} x={x} y="152" width="2" height="48" fill={P.floorLine} opacity="0.5" />
      ))}
      {[160,176,190].map((y,i)=>(
        <rect key={i} x="20" y={y} width="360" height="1" fill={P.floorLine} opacity="0.4" />
      ))}

      {/* Dithering texture */}
      {[24,32,40,48,56,64,72,80,88,96,104,112,120,128,136,144,152,160,168,176,184,192,200,
        208,216,224,232,240,248,256,264,272,280,288,296,304,312,320,328,336,344,352,360,368].map((x,i)=>(
        <rect key={i} x={x} y={154+(i%6)*2} width="6" height="2" fill={i%3===0?P.floor3:i%3===1?P.floor1:P.floor0} opacity="0.25" />
      ))}

      {/* Oil stains */}
      <rect x="140" y="164" width="24" height="8"  fill={P.floorOil} opacity="0.5" />
      <rect x="143" y="162" width="18" height="4"  fill={P.floorOil} opacity="0.3" />
      <rect x="230" y="170" width="16" height="6"  fill={P.floorOil} opacity="0.4" />

      {/* Cracks */}
      <rect x="60"  y="168" width="2"  height="14" fill={P.floorCrack} opacity="0.4" />
      <rect x="62"  y="172" width="8"  height="2"  fill={P.floorCrack} opacity="0.3" />
      <rect x="300" y="174" width="2"  height="10" fill={P.floorCrack} opacity="0.35" />
    </>
  );
}

// ─── Overhead lamp ────────────────────────────────────────────────
function OverheadLamp({ stage }: { stage: number }) {
  const on = stage >= 0; // Always on for atmosphere
  return (
    <g>
      {/* Mounting cord */}
      <rect x="198" y="72" width="4" height="14" fill={P.lamp0} />
      {/* Shade */}
      <rect x="186" y="82" width="28" height="10" fill={P.lamp1} />
      <rect x="184" y="86" width="32" height="6"  fill={P.lamp0} />
      <rect x="186" y="86" width="28" height="2"  fill={P.lamp2} opacity="0.5" />
      {/* Bulb */}
      <rect x="194" y="88" width="12" height="8"  fill={on?P.lampBulb:P.lamp0} />
      <rect x="196" y="89" width="8"  height="4"  fill={on?"#ffffff":P.lamp1} opacity={on?0.5:0.2} />
      {/* Light cone */}
      {on && (
        <>
          <rect x="188" y="96"  width="24" height="4"  fill={P.lampBeam} opacity="0.15" />
          <rect x="180" y="100" width="40" height="6"  fill={P.lampBeam} opacity="0.10" />
          <rect x="170" y="106" width="60" height="8"  fill={P.lampCone} opacity="0.07" />
          <rect x="155" y="114" width="90" height="10" fill={P.lampCone} opacity="0.05" />
          <rect x="140" y="124" width="120" height="12" fill={P.lampCone} opacity="0.03" />
        </>
      )}
    </g>
  );
}

// ─── Garage door opening — shows sky outside ─────────────────────
function GarageDoorOpening({ stage }: { stage: number }) {
  // Door is open, revealing sky behind
  return (
    <>
      {/* Sky through opening */}
      <rect x="20" y="72" width="220" height="82" fill={stage>=5?"#243e60":P.sky0} />
      {/* Subtle ground outside */}
      <rect x="20" y="138" width="220" height="16" fill={stage>=5?"#2a4a30":"#1a2a30"} />
      {/* Door frame */}
      <rect x="20" y="70"  width="222" height="6"  fill={P.doorFrame} />
      <rect x="20" y="70"  width="6"   height="86" fill={P.doorFrame} />
      <rect x="236" y="70" width="6"   height="86" fill={P.doorFrame} />
      {/* Door panels (rolled up, visible at top) */}
      <rect x="20" y="70" width="222" height="4"  fill={P.door2} />
      {[72,76,80,84,88,92].map((y,i)=>(
        <rect key={i} x="26" y={y} width="210" height={4} fill={i%2===0?P.door1:P.door0} />
      ))}
      {/* Door handle */}
      <rect x="228" y="100" width="6" height="8" fill={P.doorHandle} />
    </>
  );
}

// ─── Old rusted car (stage 0) ─────────────────────────────────────
function CarRusted({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Body — old sedan, squished and damaged */}
      <rect x="60"  y="118" width="260" height="30" fill={P.rust1} />
      {/* Dents and damage */}
      <rect x="68"  y="120" width="18"  height="8"  fill={P.rust0} />
      <rect x="200" y="119" width="22"  height="6"  fill={P.rust0} />
      <rect x="258" y="121" width="30"  height="10" fill={P.rust0} />
      {/* Rust spots — scattered */}
      {[[75,122],[100,120],[140,124],[175,119],[215,122],[240,120],[268,124],[295,121]].map(([x,y],i)=>(
        <g key={i}>
          <rect x={x}   y={y}   width={4+(i%3)*2} height={3+(i%2)} fill={P.rust3} opacity="0.7" />
          <rect x={x+2} y={y+1} width={2+(i%2)}   height="2"       fill={P.rustSpot} opacity="0.5" />
        </g>
      ))}
      {/* Scratches */}
      {[[80,125,50],[160,122,30],[220,126,40],[270,123,35]].map(([x,y,w],i)=>(
        <rect key={i} x={x} y={y} width={w} height="1" fill={P.scratch} opacity="0.6" />
      ))}
      {/* Roof — dented */}
      <rect x="90"  y="100" width="200" height="22" fill={P.rust1} />
      <rect x="95"  y="98"  width="190" height="6"  fill={P.rust2} opacity="0.6" />
      <rect x="110" y="102" width="40"  height="8"  fill={P.rust0} />  {/* big dent */}
      {/* Windows — cracked/dirty */}
      <rect x="100" y="102" width="70"  height="16" fill={P.glassDirty} />
      <rect x="210" y="102" width="70"  height="16" fill={P.glassDirty} />
      <rect x="108" y="104" width="2"   height="12" fill="#2a1808" opacity="0.7" /> {/* crack */}
      <rect x="108" y="104" width="8"   height="2"  fill="#2a1808" opacity="0.5" />
      {/* Tires — flat/worn */}
      {[90, 240].map((x,i)=>(
        <g key={i}>
          <rect x={x}    y="140" width="40" height="20" fill={P.tire} />
          <rect x={x+2}  y="141" width="36" height="18" fill="#1e1e1e" />
          <rect x={x+8}  y="144" width="24" height="12" fill={P.rimOld0} />
          <rect x={x+10} y="146" width="20" height="8"  fill={P.rimOld1} />
          <rect x={x+14} y="148" width="12" height="4"  fill={P.rimOld2} opacity="0.6" />
          {/* Flat spot */}
          <rect x={x+4}  y="157" width="32" height="4"  fill="#0e0e0e" />
        </g>
      ))}
      {/* Bumpers — mangled */}
      <rect x="54"  y="122" width="10" height="18" fill={P.rust0} />
      <rect x="316" y="122" width="10" height="18" fill={P.rust0} />
      {/* Old dead headlights */}
      <rect x="62"  y="120" width="20" height="12" fill={P.light0} />
      <rect x="298" y="120" width="20" height="12" fill={P.light0} />
      {/* Exhaust — rusted, drooping */}
      <rect x="308" y="143" width="16" height="4"  fill={P.rust1} />
      <rect x="316" y="142" width="8"  height="6"  fill={P.rust0} />
      {/* Car shadow */}
      <rect x="60"  y="157" width="260" height="6"  fill={P.shadow} opacity="0.4" />
    </g>
  );
}

// ─── Cleaned car body shell (stage 1) ────────────────────────────
function CarCleaned({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      <rect x="60"  y="118" width="260" height="30" fill={P.rust2} />
      <rect x="90"  y="100" width="200" height="22" fill={P.rust1} />
      {/* Windows — cleaned */}
      <rect x="100" y="102" width="70"  height="16" fill={P.glass1} />
      <rect x="210" y="102" width="70"  height="16" fill={P.glass1} />
      {/* Tires — old */}
      {[90, 240].map((x,i)=>(
        <g key={i}>
          <rect x={x}    y="140" width="40" height="20" fill={P.tire} />
          <rect x={x+8}  y="144" width="24" height="12" fill={P.rimOld1} />
          <rect x={x+12} y="146" width="16" height="8"  fill={P.rimOld2} />
        </g>
      ))}
      <rect x="60"  y="156" width="260" height="5" fill={P.shadow} opacity="0.4" />
    </g>
  );
}

// ─── New wheels (stage 2+) ────────────────────────────────────────
function CarWheels({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      {[88, 238].map((x,i)=>(
        <g key={i} className="idle-rise">
          {/* Tire outer */}
          <rect x={x}    y="138" width="44" height="24" fill={P.tireRim} />
          <rect x={x+2}  y="139" width="40" height="22" fill={P.tire} />
          {/* Rim base */}
          <rect x={x+6}  y="141" width="32" height="18" fill={P.rimNew0} />
          {/* Spokes — 5 spokes radiating from center */}
          <rect x={x+20} y="141" width="4"  height="18" fill={P.rimNew1} />
          <rect x={x+6}  y="149" width="32" height="4"  fill={P.rimNew1} />
          <rect x={x+8}  y="143" width="28" height="3"  fill={P.rimNew2} opacity="0.5" />
          {/* Diagonal spokes approx */}
          <rect x={x+8}  y="142" width="4"  height="8"  fill={P.rimNew1} opacity="0.7" />
          <rect x={x+30} y="142" width="4"  height="8"  fill={P.rimNew1} opacity="0.7" />
          <rect x={x+8}  y="151" width="4"  height="8"  fill={P.rimNew1} opacity="0.7" />
          <rect x={x+30} y="151" width="4"  height="8"  fill={P.rimNew1} opacity="0.7" />
          {/* Center hub */}
          <rect x={x+17} y="146" width="10" height="10" fill={P.rimCenter} />
          <rect x={x+19} y="148" width="6"  height="6"  fill={P.rimCap} />
          <rect x={x+21} y="150" width="2"  height="2"  fill="#ffffff" opacity="0.4" />
          {/* Lug bolts */}
          {[0,1,2,3,4].map((j)=>{
            const angle = (j / 5) * Math.PI * 2;
            const bx = x + 22 + Math.round(Math.cos(angle) * 7);
            const by = 150 + Math.round(Math.sin(angle) * 5);
            return <rect key={j} x={bx} y={by} width="2" height="2" fill={P.rimNew2} />;
          })}
          {/* Tire highlight */}
          <rect x={x+3}  y="140" width="38" height="3"  fill="#303030" opacity="0.5" />
        </g>
      ))}
    </>
  );
}

// ─── Restored bare metal body (stage 2-4) ────────────────────────
function CarBodyMetal({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-rise">
      {/* Body panels */}
      <rect x="60"  y="116" width="260" height="32" fill={P.metal1} />
      <rect x="60"  y="116" width="260" height="6"  fill={P.metal2} opacity="0.5" />
      <rect x="60"  y="136" width="260" height="4"  fill={P.metalShadow} opacity="0.4" />
      {/* Roof */}
      <rect x="88"  y="98"  width="204" height="22" fill={P.metal0} />
      <rect x="92"  y="100" width="196" height="4"  fill={P.metal1} opacity="0.5" />
      {/* Metallic body line */}
      <rect x="60"  y="126" width="260" height="2"  fill={P.metalHighlight} opacity="0.4" />
      {/* Panel seams */}
      <rect x="160" y="116" width="1"   height="32" fill={P.metalShadow} opacity="0.3" />
      <rect x="220" y="116" width="1"   height="32" fill={P.metalShadow} opacity="0.3" />
    </g>
  );
}

// ─── Painted car body (stage 5+) ─────────────────────────────────
function CarBodyPainted({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Roof */}
      <rect x="88"  y="96"  width="204" height="24" fill={P.bodyRoof0} />
      <rect x="92"  y="97"  width="196" height="10" fill={P.bodyRoof1} />
      <rect x="96"  y="98"  width="186" height="4"  fill={P.bodyRoof2} opacity="0.6" />
      {/* Pillar A/C */}
      <rect x="88"  y="96"  width="14"  height="24" fill={P.bodyRoof0} />
      <rect x="278" y="96"  width="14"  height="24" fill={P.bodyRoof0} />

      {/* Main body */}
      <rect x="60"  y="114" width="260" height="34" fill={P.body1} />
      {/* Body shade gradient sim */}
      <rect x="60"  y="114" width="260" height="8"  fill={P.body2} opacity="0.5" />
      <rect x="60"  y="136" width="260" height="6"  fill={P.body0} opacity="0.5" />
      {/* Gloss highlight line — Stardew signature sheen */}
      <rect x="62"  y="120" width="256" height="3"  fill={P.bodyGloss} opacity="0.35" />
      <rect x="64"  y="121" width="252" height="1"  fill="#60c0e0" opacity="0.2" />
      {/* Body character line */}
      <rect x="60"  y="128" width="260" height="2"  fill={P.body3} opacity="0.3" />
      {/* Panel seams — fine dark line */}
      <rect x="160" y="114" width="1"   height="34" fill={P.body0} opacity="0.25" />
      <rect x="225" y="114" width="1"   height="34" fill={P.body0} opacity="0.25" />
      {/* Wheel arch cutouts shading */}
      <rect x="82"  y="138" width="52"  height="8"  fill={P.body0} opacity="0.3" />
      <rect x="246" y="138" width="52"  height="8"  fill={P.body0} opacity="0.3" />
      {/* Shadow under body */}
      <rect x="60"  y="147" width="260" height="4"  fill={P.shadow} opacity="0.5" />
    </g>
  );
}

// ─── New windows + headlights (stage 6+) ─────────────────────────
function CarGlass({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      {/* Windshield */}
      <rect x="100" y="98"  width="80"  height="18" fill={P.glass2} />
      <rect x="100" y="98"  width="80"  height="4"  fill={P.glass3} opacity="0.5" />
      <rect x="100" y="112" width="80"  height="4"  fill={P.glass1} opacity="0.5" />
      {/* Windshield frame */}
      <rect x="98"  y="96"  width="84"  height="2"  fill={P.glassFrame0} />
      <rect x="98"  y="114" width="84"  height="2"  fill={P.glassFrame0} />
      <rect x="98"  y="96"  width="2"   height="20" fill={P.glassFrame0} />
      <rect x="180" y="96"  width="2"   height="20" fill={P.glassFrame0} />
      {/* Windshield reflections — 2 white diagonal bars */}
      <rect x="104" y="100" width="20"  height="4"  fill={P.glassRefract} opacity="0.25" />
      <rect x="108" y="104" width="12"  height="3"  fill={P.glassReflect} opacity="0.15" />
      {/* Rear window */}
      <rect x="200" y="98"  width="80"  height="18" fill={P.glass2} />
      <rect x="200" y="98"  width="80"  height="4"  fill={P.glass3} opacity="0.5" />
      <rect x="200" y="112" width="80"  height="4"  fill={P.glass1} opacity="0.5" />
      <rect x="198" y="96"  width="84"  height="2"  fill={P.glassFrame0} />
      <rect x="198" y="114" width="84"  height="2"  fill={P.glassFrame0} />
      <rect x="198" y="96"  width="2"   height="20" fill={P.glassFrame0} />
      <rect x="280" y="96"  width="2"   height="20" fill={P.glassFrame0} />
      <rect x="204" y="100" width="16"  height="4"  fill={P.glassRefract} opacity="0.25" />
      {/* Headlights — new bright */}
      <rect x="62"  y="116" width="28"  height="16" fill={P.light1} />
      <rect x="62"  y="116" width="28"  height="4"  fill="#f8f8d8" opacity="0.8" />
      <rect x="62"  y="128" width="28"  height="4"  fill={P.light1} opacity="0.6" />
      <rect x="64"  y="118" width="8"   height="4"  fill="#ffffff" opacity="0.3" />
      {/* Headlight glow */}
      <rect x="42"  y="112" width="32"  height="24" fill={P.lightGlow} opacity="0.14" />
      <rect x="30"  y="108" width="44"  height="32" fill={P.lightBeam} opacity="0.07" />
      {/* Tail lights */}
      <rect x="290" y="116" width="28"  height="16" fill="#601010" />
      <rect x="290" y="116" width="28"  height="4"  fill="#903030" opacity="0.8" />
      <rect x="292" y="118" width="8"   height="4"  fill="#d04040" opacity="0.4" />
      {/* Tail light glow */}
      <rect x="314" y="112" width="20"  height="24" fill="#801010" opacity="0.15" />
    </>
  );
}

// ─── Car interior (stage 7+) ──────────────────────────────────────
function CarInterior({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      {/* Dashboard visible through windshield */}
      <rect x="101" y="112" width="78"  height="4"  fill={P.dash1} />
      <rect x="103" y="110" width="74"  height="4"  fill={P.dash0} />
      {/* Steering wheel */}
      <rect x="148" y="104" width="14"  height="10" fill="#3a2a10" />
      <rect x="150" y="106" width="10"  height="6"  fill="#2a1a08" />
      <rect x="153" y="104" width="4"   height="2"  fill="#6a4a20" />
      {/* Seats visible through rear window */}
      <rect x="202" y="110" width="30"  height="6"  fill={P.seatNew1} />
      <rect x="202" y="108" width="30"  height="4"  fill={P.seatNew2} />
      <rect x="248" y="110" width="28"  height="6"  fill={P.seatNew1} />
      <rect x="248" y="108" width="28"  height="4"  fill={P.seatNew2} />
      <rect x="204" y="110" width="28"  height="1"  fill="#8a6040" opacity="0.5" />
    </>
  );
}

// ─── Accessories (stage 8+) ───────────────────────────────────────
function CarAccessories({ visible, sticker }: { visible: boolean; sticker: boolean }) {
  if (!visible) return null;
  return (
    <>
      {/* New bumpers — chrome */}
      <rect x="54"  y="118" width="10"  height="24" fill={P.bumperNew1} />
      <rect x="56"  y="119" width="6"   height="22" fill={P.bumperNew2} />
      <rect x="57"  y="120" width="2"   height="20" fill="#c8c8c0" opacity="0.4" />
      <rect x="316" y="118" width="10"  height="24" fill={P.bumperNew1} />
      <rect x="318" y="119" width="6"   height="22" fill={P.bumperNew2} />
      {/* Exhaust tip — polished */}
      <rect x="308" y="140" width="14"  height="5"  fill={P.bumperNew0} />
      <rect x="316" y="139" width="6"   height="7"  fill={P.bumperNew1} />
      <rect x="318" y="140" width="2"   height="5"  fill="#a0a090" opacity="0.5" />
      {/* Door handles — chrome strip */}
      <rect x="146" y="124" width="14"  height="3"  fill={P.rimNew2} />
      <rect x="147" y="124" width="12"  height="1"  fill={P.rimNew3} opacity="0.6" />
      <rect x="222" y="124" width="14"  height="3"  fill={P.rimNew2} />
      {/* Side mirror */}
      <rect x="86"  y="112" width="10"  height="6"  fill={P.body2} />
      <rect x="87"  y="113" width="6"   height="4"  fill={P.glassReflect} opacity="0.4" />
      <rect x="284" y="112" width="10"  height="6"  fill={P.body2} />
      <rect x="285" y="113" width="6"   height="4"  fill={P.glassReflect} opacity="0.4" />
      {/* Sticker */}
      {sticker && (
        <g>
          <rect x="248" y="122" width="24"  height="10" fill={P.sticker1} />
          <rect x="250" y="124" width="20"  height="6"  fill={P.sticker2} opacity="0.8" />
          <rect x="252" y="125" width="6"   height="4"  fill="#60b0d0" opacity="0.5" />
          <rect x="260" y="126" width="8"   height="2"  fill="#a0e0f0" opacity="0.3" />
        </g>
      )}
    </>
  );
}

// ─── Exhaust smoke (stage 9+) ─────────────────────────────────────
function ExhaustSmoke({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-smoke">
      <rect x="314" y="136" width="8" height="8" fill={P.smoke0} opacity="0.7" />
      <rect x="310" y="124" width="8" height="8" fill={P.smoke1} opacity="0.5" />
      <rect x="313" y="114" width="6" height="6" fill={P.smoke1} opacity="0.35" />
      <rect x="316" y="106" width="6" height="6" fill={P.smoke2} opacity="0.2" />
      <rect x="312" y="98"  width="4" height="4" fill={P.smoke2} opacity="0.1" />
    </g>
  );
}

// ─── Cosmetic: Toolbox ────────────────────────────────────────────
function Toolbox({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Body */}
      <rect x="30"  y="154" width="40" height="22" fill={P.tbox2} />
      <rect x="30"  y="152" width="40" height="6"  fill={P.tbox3} />
      <rect x="30"  y="154" width="40" height="2"  fill={P.tboxHandle} opacity="0.5" />
      {/* Drawers */}
      {[158,164,168].map((y,i)=>(
        <g key={i}>
          <rect x="32"  y={y}   width="36" height="5" fill={i > 0 ? P.tbox2 : P.tbox1} />
          <rect x="32"  y={y}   width="36" height="1" fill={P.tboxMetal} opacity="0.4" />
          <rect x="32"  y={y+4} width="36" height="1" fill={P.tbox0} opacity="0.5" />
          <rect x="48"  y={y+1} width="8"  height="3" fill={P.tboxHandle} opacity="0.6" />
        </g>
      ))}
      {/* Handle on top */}
      <rect x="46"  y="149" width="8"  height="4"  fill={P.tboxHandle} />
      <rect x="44"  y="150" width="12" height="2"  fill={P.tboxMetal} />
      {/* Wheels */}
      <rect x="32"  y="174" width="6"  height="4"  fill={P.tbox0} />
      <rect x="62"  y="174" width="6"  height="4"  fill={P.tbox0} />
      {/* Shadow */}
      <rect x="30"  y="176" width="40" height="3"  fill={P.shadow} opacity="0.3" />
    </g>
  );
}

// ─── Cosmetic: Mechanic ───────────────────────────────────────────
function Mechanic({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-bounce" style={{ transformOrigin: "355px 155px", animationDuration:"2.5s" }}>
      {/* Shadow */}
      <rect x="342" y="170" width="26" height="4"  fill={P.shadow} opacity="0.3" />
      {/* Legs */}
      <rect x="346" y="154" width="7"  height="18" fill={P.mechOverall1} />
      <rect x="355" y="154" width="7"  height="18" fill={P.mechOverall1} />
      <rect x="347" y="155" width="5"  height="12" fill={P.mechOverall2} opacity="0.4" />
      {/* Boots */}
      <rect x="344" y="170" width="10" height="4"  fill={P.mechBoot} />
      <rect x="354" y="170" width="10" height="4"  fill={P.mechBoot} />
      {/* Body */}
      <rect x="344" y="136" width="20" height="20" fill={P.mechOverall1} />
      <rect x="345" y="137" width="18" height="6"  fill={P.mechOverall2} opacity="0.4" />
      <rect x="348" y="136" width="12" height="4"  fill={P.mechShirt} />
      {/* Arms */}
      <rect x="336" y="138" width="8"  height="6"  fill={P.mechSkin1} />
      <rect x="336" y="136" width="8"  height="4"  fill={P.mechOverall1} />
      <rect x="364" y="138" width="8"  height="6"  fill={P.mechSkin1} />
      <rect x="364" y="136" width="8"  height="4"  fill={P.mechOverall1} />
      {/* Head */}
      <rect x="348" y="122" width="14" height="14" fill={P.mechSkin1} />
      <rect x="349" y="123" width="10" height="5"  fill={P.mechSkin2} opacity="0.5" />
      {/* Hair */}
      <rect x="348" y="120" width="14" height="4"  fill={P.mechHair0} />
      <rect x="346" y="122" width="16" height="2"  fill={P.mechHair1} opacity="0.7" />
      {/* Eyes */}
      <rect x="350" y="128" width="3"  height="3"  fill="#101010" />
      <rect x="357" y="128" width="3"  height="3"  fill="#101010" />
      <rect x="351" y="129" width="1"  height="1"  fill="#ffffff" opacity="0.6" />
      <rect x="358" y="129" width="1"  height="1"  fill="#ffffff" opacity="0.6" />
      {/* Mouth */}
      <rect x="352" y="133" width="6"  height="2"  fill={P.mechSkin0} opacity="0.6" />
      {/* Wrench */}
      <rect x="324" y="136" width="14" height="3"  fill={P.tool2} />
      <rect x="322" y="132" width="6"  height="8"  fill={P.tool2} />
      <rect x="322" y="134" width="6"  height="2"  fill={P.tool1} opacity="0.6" />
      {/* Cap */}
      <rect x="346" y="118" width="18" height="4"  fill={P.mechHair0} />
      <rect x="344" y="120" width="22" height="3"  fill={P.mechHair0} />
    </g>
  );
}

// ─── Cosmetic: Trophy shelf ───────────────────────────────────────
function Trophy({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Shelf */}
      <rect x="358" y="134" width="36" height="4"  fill={P.bench2} />
      <rect x="358" y="132" width="36" height="4"  fill={P.bench3} opacity="0.6" />
      <rect x="360" y="136" width="4"  height="18" fill={P.bench1} />
      <rect x="390" y="136" width="4"  height="18" fill={P.bench1} />
      {/* Trophy */}
      <rect x="368" y="118" width="16" height="4"  fill={P.trophy1} /> {/* cup top */}
      <rect x="366" y="122" width="20" height="12" fill={P.trophy2} /> {/* cup body */}
      <rect x="368" y="122" width="16" height="4"  fill={P.trophy3} opacity="0.7" />
      <rect x="374" y="134" width="6"  height="4"  fill={P.trophy1} /> {/* stem */}
      <rect x="370" y="136" width="14" height="4"  fill={P.trophy0} /> {/* base */}
      <rect x="370" y="134" width="14" height="2"  fill={P.trophy2} opacity="0.5" />
      {/* Star */}
      <rect x="372" y="124" width="4"  height="4"  fill={P.trophy3} opacity="0.8" />
      <rect x="374" y="122" width="2"  height="4"  fill={P.trophy3} opacity="0.6" />
      {/* Glow */}
      <rect x="364" y="116" width="24" height="22" fill={P.trophy3} opacity="0.06" />
    </g>
  );
}

// ─── Cosmetic: Equipment (jack stand + oil drum) ─────────────────
function Equipment({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Hydraulic jack */}
      <rect x="32"  y="168" width="28" height="4"  fill={P.tool1} />
      <rect x="40"  y="154" width="12" height="14" fill={P.tool0} />
      <rect x="38"  y="152" width="16" height="4"  fill={P.tool1} />
      <rect x="40"  y="153" width="12" height="1"  fill={P.tool2} opacity="0.5" />
      {/* Handle */}
      <rect x="50"  y="148" width="2"  height="6"  fill={P.tool2} />
      <rect x="50"  y="146" width="10" height="2"  fill={P.tool2} />
      {/* Oil drum — right side */}
      <rect x="368" y="152" width="22" height="24" fill={P.tbox2} />
      <rect x="368" y="150" width="22" height="5"  fill={P.tbox3} />
      <rect x="370" y="152" width="18" height="4"  fill={P.tboxMetal} opacity="0.4" />
      <rect x="370" y="158" width="18" height="2"  fill={P.tbox1} opacity="0.5" />
      <rect x="370" y="164" width="18" height="2"  fill={P.tbox1} opacity="0.5" />
      <rect x="376" y="154" width="2"  height="8"  fill={P.toolRed} opacity="0.6" />
    </g>
  );
}

// ─── Cosmetic: Checkered flag ────────────────────────────────────
function Flag({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g>
      {/* Pole */}
      <rect x="374" y="74"  width="4"  height="72" fill={P.flagPole} />
      <rect x="375" y="74"  width="2"  height="72" fill={P.lamp2} opacity="0.4" />
      {/* Flag */}
      <rect x="378" y="74"  width="24" height="16" fill={P.flag1} />
      {/* Checkered pattern */}
      {[0,2,4].map((r)=>
        [0,2,4,6,8,10,12,14,16,18,20,22].map((c)=>(
          (Math.floor(c/2)+r)%2===0 &&
          <rect key={`${r}-${c}`} x={378+c} y={74+r*2} width="2" height="2" fill={P.flagCheck} />
        ))
      )}
      <rect x="378" y="74"  width="24" height="2"  fill={P.flag2} opacity="0.4" />
      {/* Shadow */}
      <rect x="374" y="144" width="4"  height="2"  fill={P.shadow} opacity="0.3" />
    </g>
  );
}

// ─── Cosmetic: Celebrating character ─────────────────────────────
function CelebratingCharacter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-jump" style={{ transformOrigin: "52px 158px" }}>
      {/* Shadow */}
      <rect x="36"  y="170" width="26" height="4"  fill={P.shadow} opacity="0.3" />
      {/* Legs */}
      <rect x="40"  y="154" width="7"  height="16" fill={P.char0} />
      <rect x="50"  y="154" width="7"  height="16" fill={P.char0} />
      <rect x="41"  y="155" width="5"  height="10" fill={P.char1} opacity="0.4" />
      {/* Boots */}
      <rect x="38"  y="168" width="10" height="4"  fill={P.mechBoot} />
      <rect x="49"  y="168" width="10" height="4"  fill={P.mechBoot} />
      {/* Body */}
      <rect x="38"  y="134" width="22" height="22" fill={P.char0} />
      <rect x="39"  y="135" width="20" height="8"  fill={P.char1} opacity="0.5" />
      {/* Arms raised in celebration */}
      <rect x="26"  y="126" width="12" height="6"  fill={P.charSkin} />
      <rect x="26"  y="122" width="10" height="6"  fill={P.char0} />
      <rect x="60"  y="126" width="12" height="6"  fill={P.charSkin} />
      <rect x="62"  y="122" width="10" height="6"  fill={P.char0} />
      {/* Hands */}
      <rect x="24"  y="122" width="6"  height="6"  fill={P.charSkin} />
      <rect x="68"  y="122" width="6"  height="6"  fill={P.charSkin} />
      {/* Head */}
      <rect x="40"  y="120" width="18" height="16" fill={P.charSkin} />
      <rect x="41"  y="121" width="14" height="6"  fill={P.charSkin2} opacity="0.4" />
      {/* Eyes */}
      <rect x="43"  y="126" width="3"  height="3"  fill="#101010" />
      <rect x="52"  y="126" width="3"  height="3"  fill="#101010" />
      <rect x="44"  y="127" width="1"  height="1"  fill="#ffffff" opacity="0.7" />
      <rect x="53"  y="127" width="1"  height="1"  fill="#ffffff" opacity="0.7" />
      {/* Smile */}
      <rect x="44"  y="131" width="10" height="2"  fill={P.charSkin2} opacity="0.8" />
      <rect x="46"  y="133" width="6"  height="1"  fill={P.charSkin2} opacity="0.5" />
      {/* Hair */}
      <rect x="40"  y="118" width="18" height="4"  fill={P.mechHair0} />
      <rect x="38"  y="120" width="22" height="3"  fill={P.mechHair1} opacity="0.5" />
      {/* Confetti */}
      <rect x="22"  y="110" width="4"  height="4"  fill={P.conf0} />
      <rect x="70"  y="108" width="4"  height="4"  fill={P.conf1} />
      <rect x="28"  y="128" width="3"  height="3"  fill={P.conf2} />
      <rect x="68"  y="130" width="3"  height="3"  fill={P.conf3} />
    </g>
  );
}

// ─── Celebration overlay ──────────────────────────────────────────
function CelebrationOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <g className="idle-celebrate">
      {[
        [40,25,0],[65,12,1],[100,35,2],[140,18,3],[180,8,0],[220,22,1],[260,14,2],
        [300,30,3],[335,16,0],[365,38,1],[30,55,2],[120,58,3],[220,50,0],[320,54,1],
      ].map(([x,y,c],i)=>{
        const colors=[P.conf0,P.conf1,P.conf2,P.conf3];
        return (
          <g key={i}>
            <rect x={x!}   y={y!}   width="4" height="4" fill={colors[c!]} />
            <rect x={x!+6} y={y!-4} width="3" height="3" fill={colors[(c!+1)%4]} />
            <rect x={x!-4} y={y!+5} width="2" height="4" fill={colors[(c!+2)%4]} />
          </g>
        );
      })}
      <rect x="80" y="3" width="240" height="20" fill={P.bannerBg} opacity="0.94" rx="3" />
      <rect x="80" y="3" width="240" height="3"  fill="#2a5a40" opacity="0.8" />
      <text x="200" y="17" textAnchor="middle" fontSize="11" fontWeight="bold"
        fill={P.conf0} fontFamily="'Courier New', Courier, monospace" letterSpacing="1">
        CARRO CONQUISTADO!
      </text>
    </g>
  );
}

// ─── Main exported component ──────────────────────────────────────
export function CarScene({ stageIndex, unlockedSlots, celebrating = false, className }: Props) {
  const s = stageIndex;
  const slots = unlockedSlots;

  return (
    <svg
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full select-none", className)}
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
      aria-label={`Cena do carro — estágio ${s}`}
      role="img"
    >
      {/* ── Layer 1: Sky through garage opening ── */}
      <Sky stage={s} />

      {/* ── Layer 2: Garage exterior ── */}
      <GarageExterior />

      {/* ── Layer 3: Garage opening (sky framing) ── */}
      <GarageDoorOpening stage={s} />

      {/* ── Layer 4: Interior walls + workbench ── */}
      <GarageWalls stage={s} />

      {/* ── Layer 5: Overhead lamp ── */}
      <OverheadLamp stage={s} />

      {/* ── Layer 6: Floor ── */}
      <GarageFloor />

      {/* ── Layer 7: Car (progressive stages) ── */}
      {s === 0 && <CarRusted visible />}
      {s === 1 && <CarCleaned visible />}
      <CarBodyMetal  visible={s >= 2 && s < 5} />
      <CarBodyPainted visible={s >= 5} />
      <CarWheels     visible={s >= 2} />
      <CarGlass      visible={s >= 6} />
      <CarInterior   visible={s >= 7} />
      <CarAccessories visible={s >= 8} sticker={slots.has("sticker")} />
      <ExhaustSmoke  visible={s >= 9} />

      {/* ── Layer 8: Cosmetics ── */}
      <Toolbox  visible={slots.has("tools")} />
      <Mechanic visible={slots.has("mechanic")} />
      <Trophy   visible={slots.has("trophy")} />
      <Equipment visible={slots.has("equipment")} />
      <Flag     visible={slots.has("flag")} />
      <CelebratingCharacter visible={slots.has("character")} />

      {/* ── Layer 9: Celebration ── */}
      <CelebrationOverlay visible={celebrating || s >= 10} />
    </svg>
  );
}
