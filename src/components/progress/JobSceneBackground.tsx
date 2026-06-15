import React from 'react';
import { JobClass } from '../../types';

// 480×680 atmospheric SVG silhouette scenes — one per job class.
// Style: moon/sun orb + layered cloud streaks + character silhouette at bottom.
// Reference: dark background, prominent orb, dark character mass, horizontal streak clouds.

// ─── 1. NOVICE — Farmer harvesting at dusk, setting sun ─────────────────────
function NoviceScene() {
  return (
    <svg viewBox="0 0 480 680" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="nov-glow" cx="50%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#d06018" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#3d1200" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={480} height={680} fill="#1e0800"/>
      <ellipse cx={240} cy={212} rx={225} ry={185} fill="url(#nov-glow)"/>

      {/* Far clouds — behind sun */}
      <rect x={-20} y={110} width={295} height={20} rx={7} fill="#2e1005" transform="rotate(-2, 0, 115)"/>
      <rect x={205} y={98} width={295} height={15} rx={7} fill="#321208" transform="rotate(-1, 310, 103)"/>

      {/* Sun */}
      <circle cx={240} cy={212} r={150} fill="#983e08"/>
      <circle cx={240} cy={212} r={143} fill="#b04e10"/>
      <circle cx={240} cy={212} r={134} fill="#c86018"/>

      {/* Near clouds — in front of sun */}
      <rect x={-20} y={128} width={265} height={23} rx={7} fill="#3a1005" transform="rotate(-1.5, 0, 133)"/>
      <rect x={193} y={116} width={307} height={18} rx={7} fill="#401408" transform="rotate(-0.5, 310, 121)"/>
      <rect x={-20} y={298} width={238} height={19} rx={7} fill="#300e04" transform="rotate(1, 0, 303)"/>
      <rect x={200} y={311} width={300} height={16} rx={7} fill="#381005" transform="rotate(2, 305, 317)"/>
      <rect x={-20} y={352} width={178} height={14} rx={7} fill="#280c04" transform="rotate(1.5, 0, 357)"/>
      <rect x={260} y={343} width={240} height={13} rx={7} fill="#2e0e04" transform="rotate(-1, 365, 348)"/>

      {/* Rice terrace lines */}
      <rect x={0} y={428} width={480} height={9} rx={2} fill="#160600" opacity={0.75}/>
      <rect x={0} y={445} width={480} height={9} rx={2} fill="#160600" opacity={0.7}/>
      <rect x={0} y={463} width={480} height={9} rx={2} fill="#140500" opacity={0.65}/>

      {/* Ground */}
      <rect x={0} y={618} width={480} height={62} fill="#100400"/>

      {/* ── FARMER silhouette ── */}
      <g fill="#0c0400">
        <ellipse cx={232} cy={626} rx={88} ry={10}/> {/* shadow */}

        {/* Straw hat — wide flat brim */}
        <ellipse cx={226} cy={422} rx={74} ry={17}/>
        {/* Hat dome */}
        <ellipse cx={226} cy={406} rx={44} ry={25}/>

        {/* Head */}
        <circle cx={234} cy={452} r={24}/>

        {/* Body bent forward ~45° */}
        <path d="M 246 465 Q 274 472 288 498 Q 300 525 282 546 Q 262 562 235 560 Q 205 558 190 538 Q 174 516 186 488 Q 200 462 228 460 Z"/>

        {/* Right arm extended down — harvesting */}
        <path d="M 192 486 Q 172 512 158 535 Q 148 552 142 565" stroke="#0c0400" strokeWidth={18} strokeLinecap="round" fill="none"/>
        {/* Sickle head */}
        <ellipse cx={136} cy={570} rx={22} ry={9} transform="rotate(-35, 136, 570)"/>

        {/* Left arm (slightly visible behind) */}
        <path d="M 285 475 Q 298 498 300 518" stroke="#0c0400" strokeWidth={14} strokeLinecap="round" fill="none"/>

        {/* Hip */}
        <ellipse cx={232} cy={553} rx={30} ry={18}/>

        {/* Legs */}
        <rect x={218} y={562} width={18} height={62} rx={7} transform="rotate(7, 227, 593)"/>
        <rect x={238} y={562} width={18} height={60} rx={7} transform="rotate(-4, 247, 592)"/>

        {/* Feet */}
        <ellipse cx={220} cy={614} rx={22} ry={10} transform="rotate(12, 220, 614)"/>
        <ellipse cx={252} cy={610} rx={23} ry={10}/>
      </g>
    </svg>
  );
}

// ─── 2. APPRENTICE — Beast leaping under blood moon, dark forest ─────────────
function ApprenticeScene() {
  return (
    <svg viewBox="0 0 480 680" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="app-glow" cx="50%" cy="32%" r="52%">
          <stop offset="0%" stopColor="#8B1a00" stopOpacity="0.50"/>
          <stop offset="100%" stopColor="#040c04" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={480} height={680} fill="#030c03"/>
      <ellipse cx={240} cy={212} rx={205} ry={168} fill="url(#app-glow)"/>

      {/* Tree silhouettes — left */}
      <rect x={22} y={310} width={26} height={308} rx={4} fill="#020902"/>
      <ellipse cx={35} cy={295} rx={38} ry={62} fill="#020902"/>
      <rect x={55} y={350} width={20} height={268} rx={3} fill="#030a03"/>
      <ellipse cx={65} cy={338} rx={28} ry={50} fill="#030a03"/>
      <rect x={0} y={370} width={18} height={248} rx={3} fill="#020802"/>
      <ellipse cx={9} cy={358} rx={24} ry={45} fill="#020802"/>

      {/* Tree silhouettes — right */}
      <rect x={432} y={318} width={26} height={300} rx={4} fill="#020902"/>
      <ellipse cx={445} cy={302} rx={36} ry={60} fill="#020902"/>
      <rect x={455} y={355} width={20} height={263} rx={3} fill="#030a03"/>
      <ellipse cx={465} cy={342} rx={26} ry={50} fill="#030a03"/>
      <rect x={410} y={365} width={18} height={253} rx={3} fill="#020802"/>
      <ellipse cx={419} cy={352} rx={26} ry={48} fill="#020802"/>

      {/* Far clouds */}
      <rect x={-20} y={116} width={252} height={20} rx={7} fill="#081508" transform="rotate(-2, 0, 121)"/>
      <rect x={218} y={104} width={282} height={15} rx={7} fill="#0a1a0a" transform="rotate(-1, 325, 110)"/>

      {/* Blood moon */}
      <circle cx={240} cy={212} r={150} fill="#520800"/>
      <circle cx={240} cy={212} r={143} fill="#641000"/>
      <circle cx={240} cy={212} r={134} fill="#761800"/>
      {/* Moon texture */}
      <circle cx={262} cy={183} r={22} fill="#5e0e00" opacity={0.55}/>
      <circle cx={208} cy={250} r={15} fill="#5e0e00" opacity={0.45}/>

      {/* Near clouds */}
      <rect x={-20} y={133} width={256} height={23} rx={7} fill="#0c1e0c" transform="rotate(-1.5, 0, 139)"/>
      <rect x={210} y={121} width={290} height={18} rx={7} fill="#0e2210" transform="rotate(-0.5, 320, 127)"/>
      <rect x={-20} y={300} width={228} height={19} rx={7} fill="#081508" transform="rotate(1, 0, 306)"/>
      <rect x={198} y={314} width={302} height={16} rx={7} fill="#0a1a0a" transform="rotate(2, 308, 320)"/>
      <rect x={-20} y={358} width={182} height={14} rx={7} fill="#061208" transform="rotate(1.5, 0, 362)"/>
      <rect x={258} y={348} width={242} height={13} rx={7} fill="#081508" transform="rotate(-1, 364, 353)"/>

      {/* Ground */}
      <rect x={0} y={618} width={480} height={62} fill="#020902"/>

      {/* ── BEAST silhouette (leaping, mid-air) ── */}
      <g fill="#030a03">
        {/* Left horn */}
        <polygon points="198,392 204,438 186,440"/>
        <polygon points="190,389 197,436 178,436"/>
        {/* Right horn */}
        <polygon points="282,392 276,438 294,440"/>
        <polygon points="290,389 283,436 302,436"/>

        {/* Head */}
        <circle cx={240} cy={446} r={38}/>

        {/* Body — powerful wide mass */}
        <path d="M 152 496 Q 136 472 152 448 Q 164 432 195 432 Q 218 430 240 430 Q 262 430 285 432 Q 316 432 328 450 Q 346 474 328 500 Q 316 520 292 534 Q 266 545 240 545 Q 214 545 188 534 Q 164 520 152 496 Z"/>

        {/* Left arm — far left */}
        <path d="M 158 478 Q 118 466 86 454 Q 60 445 42 440" stroke="#030a03" strokeWidth={30} strokeLinecap="round" fill="none"/>
        {/* Left claws */}
        <polygon points="42,438 30,430 34,444 25,450 40,446 44,458 48,443"/>

        {/* Right arm — far right */}
        <path d="M 324 478 Q 364 466 396 456 Q 422 448 442 444" stroke="#030a03" strokeWidth={26} strokeLinecap="round" fill="none"/>
        {/* Right claws */}
        <polygon points="440,442 454,434 449,447 460,452 445,447 442,459 437,444"/>

        {/* Left leg — extending forward/down */}
        <path d="M 192 534 Q 180 562 170 585 Q 162 602 158 616" stroke="#030a03" strokeWidth={26} strokeLinecap="round" fill="none"/>
        <polygon points="148,618 140,608 144,622 134,626 150,624 154,636 158,621"/>

        {/* Right leg — extending back/down */}
        <path d="M 288 534 Q 302 560 314 580 Q 323 598 330 614" stroke="#030a03" strokeWidth={24} strokeLinecap="round" fill="none"/>
        <polygon points="332,616 340,606 336,620 347,624 330,622 327,634 323,618"/>
      </g>
    </svg>
  );
}

// ─── 3. SCALPER — Ronin at dusk, ink-wash grey, katana horizontal ────────────
function ScalperScene() {
  return (
    <svg viewBox="0 0 480 680" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="sca-glow" cx="50%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#c8c4bc" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#686460" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Ink wash — light grey bg */}
      <rect width={480} height={680} fill="#c0bbb5"/>
      <ellipse cx={240} cy={212} rx={222} ry={186} fill="url(#sca-glow)"/>

      {/* Far clouds — barely visible against grey */}
      <rect x={-20} y={108} width={265} height={21} rx={7} fill="#908c86" transform="rotate(-2, 0, 113)"/>
      <rect x={206} y={97} width={294} height={16} rx={7} fill="#9a9690" transform="rotate(-1, 315, 102)"/>

      {/* Moon — bright white circle (ink wash style) */}
      <circle cx={240} cy={212} r={150} fill="#dedad5"/>
      <circle cx={240} cy={212} r={143} fill="#e8e3de"/>
      <circle cx={240} cy={212} r={134} fill="#f2eee8"/>

      {/* Near clouds — darker grey */}
      <rect x={-20} y={126} width={255} height={24} rx={8} fill="#787370" transform="rotate(-1.5, 0, 132)"/>
      <rect x={193} y={114} width={307} height={19} rx={8} fill="#8a8682" transform="rotate(-0.5, 315, 120)"/>
      <rect x={-20} y={295} width={232} height={19} rx={8} fill="#686460" transform="rotate(1, 0, 300)"/>
      <rect x={198} y={308} width={302} height={16} rx={8} fill="#706c68" transform="rotate(2, 308, 314)"/>
      <rect x={-20} y={352} width={182} height={14} rx={8} fill="#606060" transform="rotate(1.5, 0, 357)"/>
      <rect x={258} y={343} width={242} height={13} rx={8} fill="#686462" transform="rotate(-1, 364, 348)"/>

      {/* Ground — dark earth */}
      <rect x={0} y={618} width={480} height={62} fill="#181410"/>
      <rect x={0} y={605} width={480} height={24} fill="#201c18" opacity={0.85}/>

      {/* ── RONIN silhouette (standing, sword horizontal right) ── */}
      <g fill="#121010">
        <ellipse cx={240} cy={625} rx={102} ry={11}/>

        {/* Topknot */}
        <ellipse cx={243} cy={416} rx={11} ry={18} transform="rotate(8, 243, 416)"/>
        <ellipse cx={248} cy={408} rx={8} ry={12}/>

        {/* Head */}
        <circle cx={243} cy={448} r={28}/>

        {/* Collar / neckline */}
        <polygon points="225,462 262,462 268,480 220,480"/>

        {/* Coat body (tall, kimono-like) */}
        <path d="M 198 475 Q 188 484 186 510 Q 182 540 190 565 Q 198 585 220 594 Q 230 598 243 597 Q 256 597 266 593 Q 287 582 294 562 Q 302 537 300 508 Q 298 482 288 474 Q 272 464 243 462 Q 214 464 198 475 Z"/>

        {/* Sword arm — right, extending far */}
        <path d="M 288 480 Q 310 474 334 470 Q 356 467 376 465" stroke="#121010" strokeWidth={24} strokeLinecap="round" fill="none"/>

        {/* Katana blade — very long horizontal */}
        <rect x={348} y={459} width={148} height={7} rx={2}/>
        {/* Tsuba (sword guard) */}
        <rect x={332} y={453} width={12} height={22} rx={2}/>
        {/* Tsuka (hilt) */}
        <rect x={284} y={456} width={52} height={12} rx={3}/>

        {/* Left sleeve / arm */}
        <path d="M 198 480 Q 182 496 180 518 Q 178 538 184 556" stroke="#121010" strokeWidth={20} strokeLinecap="round" fill="none"/>

        {/* Hakama (wide trousers) - left leg */}
        <path d="M 195 568 L 192 618 L 232 618 L 234 562 Z"/>
        {/* Hakama right leg */}
        <path d="M 292 568 L 294 618 L 254 618 L 252 562 Z"/>

        {/* Gap between legs (bg colour shows through) */}
        <rect x={232} y={562} width={22} height={56} fill="#c0bbb5"/>

        {/* Feet */}
        <ellipse cx={212} cy={618} rx={26} ry={10}/>
        <ellipse cx={274} cy={618} rx={26} ry={10}/>
      </g>
    </svg>
  );
}

// ─── 4. ELITE — Samurai under golden moon, deep navy night ──────────────────
function EliteScene() {
  return (
    <svg viewBox="0 0 480 680" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="eli-glow" cx="50%" cy="32%" r="52%">
          <stop offset="0%" stopColor="#c8a000" stopOpacity="0.48"/>
          <stop offset="100%" stopColor="#010408" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={480} height={680} fill="#02040c"/>
      <ellipse cx={240} cy={212} rx={212} ry={176} fill="url(#eli-glow)"/>

      {/* Far clouds */}
      <rect x={-20} y={108} width={268} height={20} rx={7} fill="#060e20" transform="rotate(-2, 0, 113)"/>
      <rect x={208} y={96} width={292} height={15} rx={7} fill="#081020" transform="rotate(-1, 318, 102)"/>

      {/* Gold moon */}
      <circle cx={240} cy={212} r={150} fill="#806200"/>
      <circle cx={240} cy={212} r={143} fill="#9a7800"/>
      <circle cx={240} cy={212} r={134} fill="#b08c00"/>
      <circle cx={240} cy={212} r={126} fill="#c09a00" opacity={0.8}/>

      {/* Near clouds */}
      <rect x={-20} y={126} width={255} height={23} rx={7} fill="#08121e" transform="rotate(-1.5, 0, 132)"/>
      <rect x={193} y={114} width={307} height={18} rx={7} fill="#0a1422" transform="rotate(-0.5, 315, 120)"/>
      <rect x={-20} y={298} width={232} height={18} rx={7} fill="#060e1e" transform="rotate(1, 0, 304)"/>
      <rect x={198} y={310} width={302} height={16} rx={7} fill="#081020" transform="rotate(2, 308, 316)"/>
      <rect x={-20} y={352} width={180} height={14} rx={7} fill="#04081c" transform="rotate(1.5, 0, 357)"/>
      <rect x={260} y={343} width={240} height={13} rx={7} fill="#060e1e" transform="rotate(-1, 362, 348)"/>

      {/* Ground */}
      <rect x={0} y={618} width={480} height={62} fill="#010308"/>

      {/* ── SAMURAI silhouette (upright, armored) ── */}
      <g fill="#030610">
        <ellipse cx={240} cy={626} rx={96} ry={11}/>

        {/* Kabuto helmet — tate-mono (crest at top) */}
        <rect x={234} y={385} width={12} height={32} rx={4}/>
        {/* Helmet dome */}
        <ellipse cx={240} cy={420} rx={42} ry={28}/>
        {/* Helmet brim */}
        <ellipse cx={240} cy={440} rx={54} ry={12}/>
        {/* Shikoro (neck guard flaps) */}
        <ellipse cx={193} cy={447} rx={19} ry={30} transform="rotate(-12, 193, 447)"/>
        <ellipse cx={287} cy={447} rx={19} ry={30} transform="rotate(12, 287, 447)"/>

        {/* Mengu (face mask) */}
        <rect x={221} y={440} width={38} height={24} rx={5}/>

        {/* Neck */}
        <rect x={229} y={460} width={22} height={14} rx={3}/>

        {/* Ō-sode (large shoulder armor plates) */}
        <ellipse cx={193} cy={474} rx={30} ry={20} transform="rotate(-10, 193, 474)"/>
        <ellipse cx={287} cy={474} rx={30} ry={20} transform="rotate(10, 287, 474)"/>

        {/* Dō (chest armor) */}
        <path d="M 196 472 Q 190 486 192 516 Q 194 546 198 564 Q 210 576 240 578 Q 270 576 282 564 Q 286 546 288 516 Q 290 486 284 472 Q 268 462 240 460 Q 212 462 196 472 Z"/>

        {/* Kote (arm armor) - both sides */}
        <rect x={188} y={474} width={14} height={82} rx={6}/>
        <rect x={278} y={474} width={14} height={82} rx={6}/>

        {/* Katana at right hip */}
        <rect x={274} y={534} width={8} height={88} rx={3} transform="rotate(-6, 278, 578)"/>
        <rect x={266} y={526} width={20} height={14} rx={3}/>

        {/* Kusazuri (hanging thigh armor) */}
        <rect x={206} y={566} width={68} height={26} rx={4}/>

        {/* Haidate / leg armor */}
        <rect x={213} y={582} width={22} height={44} rx={6}/>
        <rect x={245} y={582} width={22} height={42} rx={6}/>

        {/* Boots */}
        <ellipse cx={224} cy={618} rx={25} ry={11}/>
        <ellipse cx={256} cy={617} rx={25} ry={11}/>
      </g>
    </svg>
  );
}

// ─── 5. MASTER — Ninja crouching under full moon, pure black (ref-matched) ──
function MasterScene() {
  return (
    <svg viewBox="0 0 480 680" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="mas-glow" cx="50%" cy="32%" r="52%">
          <stop offset="0%" stopColor="#a8a8b8" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={480} height={680} fill="#020208"/>
      <ellipse cx={240} cy={212} rx={212} ry={176} fill="url(#mas-glow)"/>

      {/* Far clouds */}
      <rect x={-20} y={110} width={275} height={21} rx={8} fill="#0d0d18" transform="rotate(-2, 0, 116)"/>
      <rect x={202} y={98} width={298} height={16} rx={8} fill="#0f0f1e" transform="rotate(-1, 315, 104)"/>

      {/* Moon — grey-white, like reference */}
      <circle cx={240} cy={212} r={150} fill="#a8a8b5"/>
      <circle cx={240} cy={212} r={144} fill="#b8b8c5"/>
      <circle cx={240} cy={212} r={138} fill="#c4c4d0"/>
      {/* Subtle craters */}
      <circle cx={260} cy={183} r={24} fill="#b2b2bf" opacity={0.55}/>
      <circle cx={206} cy={250} r={16} fill="#b2b2bf" opacity={0.4}/>
      <circle cx={270} cy={258} r={10} fill="#b0b0bc" opacity={0.35}/>

      {/* Near clouds — dark grey against moon (like reference) */}
      <rect x={-20} y={126} width={268} height={25} rx={8} fill="#1a1a26" transform="rotate(-1.5, 0, 133)"/>
      <rect x={192} y={114} width={308} height={20} rx={8} fill="#1e1e2e" transform="rotate(-0.5, 315, 120)"/>
      <rect x={-20} y={295} width={248} height={20} rx={8} fill="#141420" transform="rotate(1, 0, 301)"/>
      <rect x={196} y={308} width={304} height={17} rx={8} fill="#181828" transform="rotate(2, 308, 315)"/>
      <rect x={-20} y={355} width={188} height={15} rx={8} fill="#101020" transform="rotate(1.5, 0, 360)"/>
      <rect x={260} y={346} width={240} height={14} rx={8} fill="#141424" transform="rotate(-1, 365, 351)"/>

      {/* Ground */}
      <rect x={0} y={618} width={480} height={62} fill="#020208"/>

      {/* ── NINJA silhouette (crouching, like reference image) ── */}
      <g fill="#040408">
        <ellipse cx={243} cy={627} rx={118} ry={13}/>

        {/* Main body mass — large crouched hump */}
        <path d="
          M 162 620
          Q 142 596 144 560
          Q 138 518 158 480
          Q 175 448 208 428
          Q 228 416 258 418
          Q 296 420 318 445
          Q 342 474 340 518
          Q 342 560 326 592
          Q 312 614 290 622
          Z
        "/>

        {/* Head (visible above the back hump) */}
        <circle cx={260} cy={432} r={34}/>

        {/* Mask-to-body blend */}
        <polygon points="230,452 292,452 280,484 222,480"/>

        {/* Sword on back — diagonal sticking up behind shoulder */}
        <rect x={218} y={330} width={9} height={142} rx={3} transform="rotate(-17, 222, 401)"/>
        {/* Cross-guard */}
        <rect x={198} y={348} width={50} height={9} rx={3}/>

        {/* Lower mass — tucked legs + ground connection */}
        <ellipse cx={240} cy={602} rx={108} ry={26}/>

        {/* Feet visible at bottom */}
        <ellipse cx={178} cy={612} rx={36} ry={14} transform="rotate(-8, 178, 612)"/>
        <ellipse cx={308} cy={614} rx={34} ry={14} transform="rotate(8, 308, 614)"/>

        {/* Forward hand barely extending */}
        <ellipse cx={148} cy={548} rx={30} ry={20} transform="rotate(-22, 148, 548)"/>
      </g>
    </svg>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

const SCENES: Record<JobClass, React.FC> = {
  novice: NoviceScene,
  apprentice: ApprenticeScene,
  scalper: ScalperScene,
  elite: EliteScene,
  master: MasterScene,
};

interface JobSceneBackgroundProps {
  job: JobClass;
}

export function JobSceneBackground({ job }: JobSceneBackgroundProps) {
  const Scene = SCENES[job];
  return <Scene />;
}
