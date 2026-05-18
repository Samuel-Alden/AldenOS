// icons.jsx — Frutiger Aero glossy SVG icons
// Each icon is a translucent, 3D-feeling sphere/object with white highlights.
// Designed to fill its parent container — size is controlled by CSS.

const AeroSVG = ({ children, viewBox = '0 0 64 64' }) => (
  <svg className="aero-svg"
       viewBox={viewBox}
       xmlns="http://www.w3.org/2000/svg"
       preserveAspectRatio="xMidYMid meet"
       style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
    {children}
  </svg>
);

/* ===================================================================
   Shared gradient definitions — defined once, referenced by id.
   Putting them in a single <svg> at the root means every icon
   uses the same compiled defs (smaller DOM, consistent style).
   =================================================================== */
function AeroDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        {/* generic glossy sphere — used by many icons */}
        <radialGradient id="ao_blue" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="32%" stopColor="#9fe2ff" />
          <stop offset="78%" stopColor="#1a6fc8" />
          <stop offset="100%" stopColor="#062a5e" />
        </radialGradient>
        <radialGradient id="ao_cyan" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="35%" stopColor="#a8eaff" />
          <stop offset="75%" stopColor="#2bb6d6" />
          <stop offset="100%" stopColor="#0c5a78" />
        </radialGradient>
        <radialGradient id="ao_green" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="35%" stopColor="#c4f08e" />
          <stop offset="75%" stopColor="#5cb04a" />
          <stop offset="100%" stopColor="#1a5e1a" />
        </radialGradient>
        <radialGradient id="ao_orange" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ffd9a8" />
          <stop offset="75%" stopColor="#ff8c2a" />
          <stop offset="100%" stopColor="#a04510" />
        </radialGradient>
        <radialGradient id="ao_yellow" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fff6c0" />
          <stop offset="75%" stopColor="#ffce4a" />
          <stop offset="100%" stopColor="#b07c00" />
        </radialGradient>
        <radialGradient id="ao_red" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ffc4be" />
          <stop offset="75%" stopColor="#e64646" />
          <stop offset="100%" stopColor="#7a0a0a" />
        </radialGradient>
        <radialGradient id="ao_pink" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ffd6ea" />
          <stop offset="75%" stopColor="#ff7ab8" />
          <stop offset="100%" stopColor="#a01e6e" />
        </radialGradient>
        <radialGradient id="ao_purple" cx="35%" cy="28%" r="85%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="35%" stopColor="#d8c4ff" />
          <stop offset="75%" stopColor="#7a4ad8" />
          <stop offset="100%" stopColor="#2a0a78" />
        </radialGradient>
        {/* folder face — slightly darker than back */}
        <linearGradient id="ao_fold_back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#a5e0ff" />
          <stop offset="50%" stopColor="#5cb6ee" />
          <stop offset="100%" stopColor="#1a6fc8" />
        </linearGradient>
        <linearGradient id="ao_fold_front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#6cc4ff" />
          <stop offset="50%" stopColor="#2389e8" />
          <stop offset="100%" stopColor="#0a4a8c" />
        </linearGradient>
        {/* sticky paper */}
        <linearGradient id="ao_sticky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#fffce0" />
          <stop offset="100%" stopColor="#ffd44a" />
        </linearGradient>
        {/* earth seas */}
        <radialGradient id="ao_earth_sea" cx="35%" cy="28%" r="90%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="22%" stopColor="#a5e5ff" />
          <stop offset="65%" stopColor="#1a8cff" />
          <stop offset="100%" stopColor="#082a78" />
        </radialGradient>
        {/* gloss highlight gradient */}
        <linearGradient id="ao_gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.85)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* snake body — vertical green */}
        <linearGradient id="ao_snake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#c4f08e" />
          <stop offset="45%" stopColor="#5cb04a" />
          <stop offset="100%" stopColor="#1a5e1a" />
        </linearGradient>
        {/* small drop-shadow filter that we don't actually use here
            (parent .glyph already applies drop-shadow) */}
      </defs>
    </svg>
  );
}

/* ===================================================================
   Shared bits
   =================================================================== */
const Gloss = ({ cx, cy, rx, ry, rotate = 0, opacity = 0.55 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
           fill="#ffffff" opacity={opacity}
           transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined} />
);

/* ===================================================================
   1.  Person  — for Bio
   =================================================================== */
const IconPerson = () => (
  <AeroSVG>
    {/* shoulders/torso */}
    <path d="M8 58 Q8 36 32 36 Q56 36 56 58 Z" fill="url(#ao_blue)" />
    {/* head */}
    <circle cx="32" cy="20" r="11.5" fill="url(#ao_blue)" />
    {/* highlights */}
    <Gloss cx={28} cy={14} rx={3.5} ry={1.8} opacity={0.8} />
    <Gloss cx={22} cy={44} rx={6} ry={2} opacity={0.45} />
    {/* tiny chin-shadow split between head + body */}
    <rect x="0" y="30.5" width="64" height="1" fill="rgba(0,30,80,0.05)" />
  </AeroSVG>
);

/* ===================================================================
   2.  Sticky note  — for Notepad
   =================================================================== */
const IconNote = () => (
  <AeroSVG>
    <g transform="rotate(-4 32 32)">
      {/* shadow under paper */}
      <path d="M10 54 L54 54 L54 56 L10 56 Z" fill="rgba(0,30,80,0.18)" />
      {/* paper */}
      <path d="M10 8 L48 8 L54 14 L54 54 L10 54 Z"
            fill="url(#ao_sticky)"
            stroke="rgba(180,140,0,0.45)" strokeWidth="0.8" />
      {/* folded corner */}
      <path d="M48 8 L54 14 L48 14 Z" fill="rgba(140,100,0,0.35)" />
      {/* faint blue rule lines */}
      <line x1="14" y1="24" x2="50" y2="24" stroke="#2389e8" strokeWidth="0.9" opacity="0.4"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="#2389e8" strokeWidth="0.9" opacity="0.4"/>
      <line x1="14" y1="40" x2="44" y2="40" stroke="#2389e8" strokeWidth="0.9" opacity="0.4"/>
      <line x1="14" y1="48" x2="40" y2="48" stroke="#2389e8" strokeWidth="0.9" opacity="0.4"/>
      {/* pencil */}
      <g transform="rotate(35 38 30) translate(20 -2)">
        <rect x="0" y="32" width="22" height="3.5" rx="0.6" fill="#ffce4a" stroke="rgba(120,80,0,0.4)" strokeWidth="0.3"/>
        <path d="M22 32 L26 33.75 L22 35.5 Z" fill="#f8efe0" stroke="rgba(120,80,0,0.4)" strokeWidth="0.3"/>
        <path d="M24 33 L26 33.75 L24 34.5 Z" fill="#1a2a44"/>
        <rect x="-3" y="32" width="3" height="3.5" rx="0.4" fill="#e64646" stroke="rgba(80,0,0,0.4)" strokeWidth="0.3"/>
      </g>
      {/* highlight */}
      <Gloss cx={22} cy={13} rx={11} ry={2} opacity={0.7} />
    </g>
  </AeroSVG>
);

/* ===================================================================
   3.  Palette  — for Paint
   =================================================================== */
const IconPalette = () => (
  <AeroSVG>
    {/* palette body — irregular blob */}
    <path
      d="M10 28 Q8 8 30 6 Q56 6 58 26 Q60 44 42 50 Q34 52 30 48 Q24 42 30 36 Q34 32 28 30 Q14 32 10 28 Z"
      fill="url(#ao_orange)"
      stroke="rgba(120,60,10,0.35)" strokeWidth="0.5" />
    {/* thumb hole */}
    <ellipse cx="28" cy="40" rx="4" ry="3.5" fill="#1a2a44" opacity="0.18"/>
    <ellipse cx="28" cy="40" rx="3" ry="2.5" fill="#fff" opacity="0.4"/>
    {/* paint dots */}
    <circle cx="22" cy="18" r="4.2" fill="url(#ao_red)" />
    <circle cx="36" cy="14" r="4.2" fill="url(#ao_yellow)" />
    <circle cx="48" cy="22" r="4.2" fill="url(#ao_blue)" />
    <circle cx="46" cy="36" r="3.6" fill="url(#ao_green)" />
    {/* highlights */}
    <Gloss cx={18} cy={12} rx={9} ry={2} opacity={0.7} />
    <Gloss cx={20} cy={16} rx={1.4} ry={0.6} opacity={0.95} />
    <Gloss cx={34} cy={12} rx={1.4} ry={0.6} opacity={0.95} />
    <Gloss cx={46} cy={20} rx={1.4} ry={0.6} opacity={0.95} />
  </AeroSVG>
);

/* ===================================================================
   4.  Folder  — for My Computer (Files)
   =================================================================== */
const IconFolder = () => (
  <AeroSVG>
    {/* back panel (with tab) */}
    <path d="M6 16 L22 16 L28 12 L58 12 L58 50 L6 50 Z"
          fill="url(#ao_fold_back)"
          stroke="rgba(0,30,80,0.4)" strokeWidth="0.6"/>
    {/* front panel */}
    <path d="M6 22 L58 22 L54 50 L10 50 Z"
          fill="url(#ao_fold_front)"
          stroke="rgba(0,30,80,0.5)" strokeWidth="0.6"/>
    {/* glossy top of front */}
    <path d="M6 22 L58 22 L57 26 L8 26 Z" fill="rgba(255,255,255,0.4)" />
    {/* base shadow under folder */}
    <ellipse cx="32" cy="52" rx="22" ry="2" fill="rgba(0,30,80,0.25)"/>
    {/* highlights */}
    <Gloss cx={20} cy={19} rx={12} ry={1.5} opacity={0.7} />
    <Gloss cx={20} cy={36} rx={14} ry={2} opacity={0.25} />
  </AeroSVG>
);

/* ===================================================================
   5.  Music note  — for Music
   =================================================================== */
const IconMusic = () => (
  <AeroSVG>
    {/* note head — tilted oval */}
    <g transform="rotate(-22 22 46)">
      <ellipse cx="22" cy="46" rx="10" ry="7" fill="url(#ao_cyan)" />
      <Gloss cx={17} cy={42} rx={4} ry={1.5} opacity={0.7} />
    </g>
    {/* stem */}
    <rect x="29" y="14" width="4" height="34" rx="1" fill="url(#ao_cyan)" />
    {/* flag */}
    <path d="M33 14 Q52 18 50 36 Q46 26 33 28 Z" fill="url(#ao_cyan)" />
    {/* flag inner highlight */}
    <path d="M34 17 Q46 20 48 30" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    {/* stem highlight */}
    <rect x="29.5" y="15" width="1" height="32" fill="rgba(255,255,255,0.55)" rx="0.5"/>
  </AeroSVG>
);

/* ===================================================================
   6.  Globe  — for Internet
   =================================================================== */
const IconGlobe = () => (
  <AeroSVG>
    <circle cx="32" cy="32" r="26" fill="url(#ao_earth_sea)" />
    {/* continents — abstract green shapes */}
    <g fill="#2a8a2a" opacity="0.8">
      <path d="M16 22 Q22 18 28 22 Q34 28 30 32 Q22 34 16 30 Z"/>
      <path d="M36 16 Q46 16 48 22 Q46 28 40 28 Q34 24 36 16 Z"/>
      <path d="M22 38 Q32 36 38 42 Q36 50 28 50 Q18 48 22 38 Z"/>
      <path d="M44 38 Q52 38 52 44 Q48 48 44 44 Z"/>
    </g>
    {/* equator (subtle, latitude) */}
    <ellipse cx="32" cy="32" rx="26" ry="8" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6"/>
    <ellipse cx="32" cy="32" rx="8" ry="26" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
    {/* highlights */}
    <Gloss cx={22} cy={20} rx={9} ry={4} opacity={0.55} />
    <Gloss cx={42} cy={48} rx={6} ry={1.5} opacity={0.35} />
  </AeroSVG>
);

/* ===================================================================
   7.  Chat (MSN-style two figures)  — for Messenger
   =================================================================== */
const IconChat = () => (
  <AeroSVG>
    {/* blue (left) */}
    <g>
      <path d="M4 58 Q4 40 22 40 Q38 40 38 58 Z" fill="url(#ao_blue)" />
      <circle cx="22" cy="22" r="9.5" fill="url(#ao_blue)" />
      <Gloss cx={18} cy={17} rx={2.5} ry={1.1} opacity={0.85} />
    </g>
    {/* green (right, in front) */}
    <g>
      <path d="M26 60 Q26 42 44 42 Q60 42 60 60 Z" fill="url(#ao_green)" />
      <circle cx="44" cy="24" r="9.5" fill="url(#ao_green)" />
      <Gloss cx={40} cy={19} rx={2.5} ry={1.1} opacity={0.85} />
    </g>
    {/* tiny speech bubble in the corner */}
    <g>
      <ellipse cx="54" cy="14" rx="8" ry="6" fill="#fff" stroke="rgba(0,30,80,0.35)" strokeWidth="0.5"/>
      <path d="M48 18 L46 22 L50 19 Z" fill="#fff" stroke="rgba(0,30,80,0.35)" strokeWidth="0.5"/>
      <circle cx="51" cy="14" r="1" fill="#1a3055"/>
      <circle cx="54" cy="14" r="1" fill="#1a3055"/>
      <circle cx="57" cy="14" r="1" fill="#1a3055"/>
    </g>
  </AeroSVG>
);

/* ===================================================================
   8.  Four-leaf clover  — for Minesweeper
   =================================================================== */
const IconClover = () => (
  <AeroSVG>
    {/* 4 leaves */}
    <g transform="translate(32 30)">
      {/* top */}
      <path d="M0 0 Q-2 -16 -10 -16 Q-16 -14 -14 -6 Q-10 2 0 0 Z" fill="url(#ao_green)" />
      <path d="M0 0 Q2 -16 10 -16 Q16 -14 14 -6 Q10 2 0 0 Z" fill="url(#ao_green)" />
      <path d="M0 0 Q-2 16 -10 16 Q-16 14 -14 6 Q-10 -2 0 0 Z" fill="url(#ao_green)" />
      <path d="M0 0 Q2 16 10 16 Q16 14 14 6 Q10 -2 0 0 Z" fill="url(#ao_green)" />
    </g>
    {/* stem */}
    <path d="M32 38 Q34 50 36 60" stroke="#1a6a1a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M32 38 Q34 50 36 60" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    {/* leaf highlights */}
    <Gloss cx={24} cy={22} rx={3} ry={1.2} opacity={0.75} />
    <Gloss cx={40} cy={22} rx={3} ry={1.2} opacity={0.75} />
    <Gloss cx={24} cy={38} rx={3} ry={1.2} opacity={0.5} />
    <Gloss cx={40} cy={38} rx={3} ry={1.2} opacity={0.5} />
    {/* center dot */}
    <circle cx="32" cy="30" r="1.6" fill="#0a3a0a"/>
  </AeroSVG>
);

/* ===================================================================
   9.  Snake  — for Snake game
   =================================================================== */
const IconSnake = () => (
  <AeroSVG>
    {/* S-curve body */}
    <path d="M12 52 Q12 32 32 32 Q52 32 52 14"
          stroke="url(#ao_snake)" strokeWidth="11" fill="none" strokeLinecap="round"/>
    {/* highlight along body */}
    <path d="M14 48 Q16 34 32 30 Q48 26 50 16"
          stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* head */}
    <circle cx="52" cy="14" r="7" fill="url(#ao_snake)" />
    <Gloss cx={49} cy={10} rx={2.2} ry={0.9} opacity={0.85} />
    {/* eye */}
    <circle cx="54" cy="12" r="1.6" fill="#0a1a0a"/>
    <circle cx="54.5" cy="11.5" r="0.5" fill="#fff"/>
    {/* forked tongue */}
    <path d="M54 20 L55 24 M54 20 L53 24" stroke="#e64646" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    {/* tail tip */}
    <circle cx="12" cy="52" r="1.5" fill="#1a5e1a"/>
  </AeroSVG>
);

/* ===================================================================
   10.  Gear  — for Settings
   =================================================================== */
const IconGear = () => {
  const teeth = Array.from({length: 8}, (_, i) => i * 45);
  return (
    <AeroSVG>
      {/* 8 teeth — rectangles rotated around center */}
      {teeth.map(deg => (
        <rect key={deg} x="29" y="2" width="6" height="12" rx="1.2"
              fill="url(#ao_cyan)"
              transform={`rotate(${deg} 32 32)`} />
      ))}
      {/* main disc */}
      <circle cx="32" cy="32" r="20" fill="url(#ao_cyan)" />
      {/* center hole */}
      <circle cx="32" cy="32" r="7" fill="#1a3055" opacity="0.22"/>
      <circle cx="32" cy="32" r="7" fill="none" stroke="rgba(0,30,80,0.55)" strokeWidth="0.8"/>
      <circle cx="32" cy="32" r="5" fill="#fff" opacity="0.35"/>
      {/* highlights */}
      <Gloss cx={24} cy={22} rx={10} ry={3} opacity={0.6} />
      <Gloss cx={20} cy={18} rx={4} ry={1.2} opacity={0.9} />
    </AeroSVG>
  );
};

/* ===================================================================
   Extras — used in file listings / icons.
   =================================================================== */
const IconFile = () => (
  <AeroSVG>
    {/* page with corner fold */}
    <path d="M14 6 L42 6 L54 18 L54 58 L14 58 Z"
          fill="#ffffff"
          stroke="rgba(0,30,80,0.45)" strokeWidth="0.8"/>
    <path d="M42 6 L54 18 L42 18 Z" fill="#dde7f1" stroke="rgba(0,30,80,0.45)" strokeWidth="0.8"/>
    {/* text lines */}
    <line x1="20" y1="26" x2="48" y2="26" stroke="#5a7895" strokeWidth="1.2"/>
    <line x1="20" y1="34" x2="48" y2="34" stroke="#5a7895" strokeWidth="1.2"/>
    <line x1="20" y1="42" x2="48" y2="42" stroke="#5a7895" strokeWidth="1.2"/>
    <line x1="20" y1="50" x2="38" y2="50" stroke="#5a7895" strokeWidth="1.2"/>
    {/* glossy top */}
    <path d="M14 6 L42 6 L40 12 L14 12 Z" fill="rgba(140,180,220,0.18)"/>
    <Gloss cx={22} cy={9} rx={6} ry={1} opacity={0.85}/>
  </AeroSVG>
);

const IconImage = () => (
  <AeroSVG>
    {/* photo frame */}
    <rect x="6" y="10" width="52" height="44" rx="3" fill="url(#ao_blue)" />
    {/* photo area */}
    <rect x="10" y="14" width="44" height="36" rx="1" fill="#a5e5ff"/>
    {/* "image" — little mountains + sun */}
    <circle cx="20" cy="22" r="3" fill="#ffce4a"/>
    <path d="M10 50 L22 32 L34 42 L44 28 L54 50 Z" fill="#5cb04a" />
    {/* frame highlight */}
    <Gloss cx={20} cy={13} rx={12} ry={1.2} opacity={0.6}/>
  </AeroSVG>
);

const IconBell = () => (
  <AeroSVG>
    {/* bell body */}
    <path d="M16 44 Q16 18 32 16 Q48 18 48 44 Z" fill="url(#ao_yellow)" />
    {/* base */}
    <rect x="12" y="44" width="40" height="5" rx="1" fill="url(#ao_yellow)" />
    {/* clapper */}
    <circle cx="32" cy="52" r="4" fill="url(#ao_yellow)" />
    {/* top knob */}
    <rect x="29" y="10" width="6" height="6" rx="1.5" fill="url(#ao_yellow)" />
    {/* highlight */}
    <Gloss cx={22} cy={22} rx={5} ry={2} opacity={0.75}/>
  </AeroSVG>
);

const IconAntenna = () => (
  <AeroSVG>
    {/* dish */}
    <path d="M14 38 Q32 26 50 38 L46 44 Q32 36 18 44 Z" fill="url(#ao_blue)" />
    {/* arm + emitter */}
    <rect x="30" y="20" width="3" height="20" fill="url(#ao_blue)"/>
    <circle cx="31.5" cy="22" r="3" fill="url(#ao_yellow)"/>
    {/* signal waves */}
    <path d="M40 14 Q46 14 46 20" stroke="#1a8cff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M40 8 Q52 8 52 20" stroke="#1a8cff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M40 2 Q58 2 58 20" stroke="#1a8cff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
    {/* base */}
    <rect x="22" y="48" width="20" height="4" rx="1" fill="url(#ao_blue)"/>
    <Gloss cx={24} cy={32} rx={5} ry={1.2} opacity={0.6}/>
  </AeroSVG>
);

const IconDoc = () => (
  <AeroSVG>
    <path d="M14 6 L42 6 L54 18 L54 58 L14 58 Z" fill="#ffffff" stroke="rgba(0,30,80,0.45)" strokeWidth="0.8"/>
    <path d="M42 6 L54 18 L42 18 Z" fill="#dde7f1" stroke="rgba(0,30,80,0.45)" strokeWidth="0.8"/>
    {/* doc 'W' badge */}
    <rect x="20" y="28" width="24" height="14" rx="2" fill="url(#ao_blue)"/>
    <text x="32" y="39" textAnchor="middle" fontFamily="Verdana, sans-serif" fontWeight="700" fontSize="10" fill="#fff">DOC</text>
    <line x1="20" y1="48" x2="48" y2="48" stroke="#5a7895" strokeWidth="1.2"/>
    <Gloss cx={22} cy={9} rx={6} ry={1} opacity={0.85}/>
  </AeroSVG>
);

const IconHTM = () => (
  <AeroSVG>
    <path d="M14 6 L42 6 L54 18 L54 58 L14 58 Z" fill="#ffffff" stroke="rgba(0,30,80,0.45)" strokeWidth="0.8"/>
    <path d="M42 6 L54 18 L42 18 Z" fill="#dde7f1" stroke="rgba(0,30,80,0.45)" strokeWidth="0.8"/>
    <rect x="18" y="28" width="28" height="14" rx="2" fill="url(#ao_orange)"/>
    <text x="32" y="39" textAnchor="middle" fontFamily="Verdana, sans-serif" fontWeight="700" fontSize="9" fill="#fff">HTM</text>
    <Gloss cx={22} cy={9} rx={6} ry={1} opacity={0.85}/>
  </AeroSVG>
);

const IconTrash = () => (
  <AeroSVG>
    {/* lid */}
    <rect x="10" y="14" width="44" height="6" rx="1.5" fill="url(#ao_blue)"/>
    <rect x="26" y="9" width="12" height="6" rx="1" fill="url(#ao_blue)"/>
    {/* body */}
    <path d="M14 22 L50 22 L46 58 L18 58 Z" fill="url(#ao_blue)" stroke="rgba(0,30,80,0.4)" strokeWidth="0.6"/>
    {/* vertical lines */}
    <line x1="24" y1="26" x2="22" y2="56" stroke="#062a5e" strokeWidth="1" opacity="0.4"/>
    <line x1="32" y1="26" x2="32" y2="56" stroke="#062a5e" strokeWidth="1" opacity="0.4"/>
    <line x1="40" y1="26" x2="42" y2="56" stroke="#062a5e" strokeWidth="1" opacity="0.4"/>
    <Gloss cx={22} cy={17} rx={8} ry={1.2} opacity={0.7}/>
    <Gloss cx={20} cy={32} rx={4} ry={10} opacity={0.25}/>
  </AeroSVG>
);

/* ===================================================================
   Helper / Sprocket character — for the floating mascot.
   Drawn as a glossy translucent bubble with a friendly face.
   =================================================================== */
const IconSprocket = () => (
  <AeroSVG>
    {/* big bubble */}
    <circle cx="32" cy="32" r="28" fill="url(#ao_cyan)" />
    {/* face — happy eyes + smile */}
    <ellipse cx="24" cy="28" rx="2" ry="3" fill="#0a2a3a" />
    <ellipse cx="40" cy="28" rx="2" ry="3" fill="#0a2a3a" />
    <path d="M24 40 Q32 46 40 40" stroke="#0a2a3a" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="22" cy="26" rx="0.6" ry="0.9" fill="#fff" />
    <ellipse cx="38" cy="26" rx="0.6" ry="0.9" fill="#fff" />
    {/* big highlight */}
    <Gloss cx={24} cy={20} rx={10} ry={4} opacity={0.7}/>
    <Gloss cx={20} cy={16} rx={3} ry={1.2} opacity={0.95}/>
  </AeroSVG>
);

/* ===================================================================
   Export — JSX instances so they can be used as `app.icon`
   =================================================================== */
const Icons = {
  // app icons
  Person:  <IconPerson />,
  Note:    <IconNote />,
  Palette: <IconPalette />,
  Folder:  <IconFolder />,
  Music:   <IconMusic />,
  Globe:   <IconGlobe />,
  Chat:    <IconChat />,
  Clover:  <IconClover />,
  Snake:   <IconSnake />,
  Gear:    <IconGear />,
  // file icons
  File:    <IconFile />,
  Image:   <IconImage />,
  Bell:    <IconBell />,
  Antenna: <IconAntenna />,
  Doc:     <IconDoc />,
  HTM:     <IconHTM />,
  Trash:   <IconTrash />,
  // misc
  Sprocket: <IconSprocket />,
  Defs:    <AeroDefs />,
};

window.AldenOS.Icons = Icons;
