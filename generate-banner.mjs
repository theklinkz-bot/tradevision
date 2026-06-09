import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const W = 1640, H = 922;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ─── Seeded random ───────────────────────────────────────────────────────────
let seed = 42;
const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
const randRange = (a, b) => a + rand() * (b - a);

// ─── 1. BACKGROUND ───────────────────────────────────────────────────────────
const bgGrad = ctx.createRadialGradient(1050, 420, 60, 1050, 420, 900);
bgGrad.addColorStop(0,   '#1a1008');
bgGrad.addColorStop(0.35,'#0d0804');
bgGrad.addColorStop(0.7, '#060402');
bgGrad.addColorStop(1,   '#020101');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// ─── 2. PAPER GRAIN (composited — no putImageData) ───────────────────────────
ctx.save();
for (let i = 0; i < 80000; i++) {
  const x = rand() * W;
  const y = rand() * H;
  const v = (rand() * 255) | 0;
  ctx.globalAlpha = 0.025 + rand() * 0.04;
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  ctx.fillRect(x, y, 1, 1);
}
ctx.restore();

// ─── 3. SPEED LINES (manga radiating lines) ──────────────────────────────────
const FX = 1060, FY = 380;
ctx.save();
// Bright warm burst behind ninja
const burstGrad = ctx.createRadialGradient(FX, FY, 0, FX, FY, 500);
burstGrad.addColorStop(0,   'rgba(255,200,100,0.18)');
burstGrad.addColorStop(0.3, 'rgba(200,140,60,0.10)');
burstGrad.addColorStop(0.7, 'rgba(120,80,30,0.04)');
burstGrad.addColorStop(1,   'rgba(0,0,0,0)');
ctx.fillStyle = burstGrad;
ctx.fillRect(0, 0, W, H);

for (let i = 0; i < 360; i++) {
  const angle = (i / 360) * Math.PI * 2;
  const len = randRange(250, 1100);
  const isBold = i % 5 === 0;
  const width = randRange(0.4, isBold ? 2.8 : 1.1);
  const alpha = randRange(0.06, isBold ? 0.38 : 0.18);

  ctx.beginPath();
  ctx.moveTo(FX, FY);
  ctx.lineTo(FX + Math.cos(angle) * len, FY + Math.sin(angle) * len);
  ctx.strokeStyle = `rgba(240,210,150,${alpha})`;
  ctx.lineWidth = width;
  ctx.stroke();
}
ctx.restore();

// ─── 4. INK WASH BLOBS ───────────────────────────────────────────────────────
function inkBlob(cx, cy, rx, ry, angle, alpha) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0,   `rgba(0,0,0,${alpha})`);
  grad.addColorStop(0.55,`rgba(0,0,0,${alpha * 0.7})`);
  grad.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

inkBlob(1100, 460, 480, 400, -0.3, 0.85);
inkBlob(950,  300, 320, 260, 0.2,  0.75);
inkBlob(1300, 600, 360, 300, 0.5,  0.70);
inkBlob(800,  700, 280, 220, -0.1, 0.60);
inkBlob(200,  200, 350, 280, 0.1,  0.45);
inkBlob(400,  500, 260, 220, -0.2, 0.40);

// ─── 5. CROSS-HATCH TEXTURE ZONES ────────────────────────────────────────────
function hatchZone(x, y, w, h, angle, spacing, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.lineWidth = 0.6;
  const diag = Math.hypot(w, h) * 2;
  ctx.translate(x + w/2, y + h/2);
  ctx.rotate(angle);
  for (let d = -diag; d < diag; d += spacing) {
    ctx.beginPath();
    ctx.moveTo(-diag, d);
    ctx.lineTo(diag, d);
    ctx.stroke();
  }
  ctx.restore();
}

hatchZone(820, 80,  500, 400, Math.PI/4,  4,  0.55);
hatchZone(1050,350, 400, 450, -Math.PI/4, 3,  0.50);
hatchZone(0,   400, 350, 520, Math.PI/4,  5,  0.35);
hatchZone(600, 600, 500, 320, Math.PI/3,  4,  0.40);
hatchZone(1200,0,   440, 350, -Math.PI/4, 3,  0.45);
hatchZone(900, 200, 460, 500, -Math.PI/4, 5,  0.30);
hatchZone(900, 200, 460, 500, Math.PI/4,  6,  0.25);

// ─── 6. NINJA SILHOUETTE ─────────────────────────────────────────────────────
function fillShape(points, color) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const NX = 1060;
const NY = 190;

// SHADOW AURA
const aurGrad = ctx.createRadialGradient(NX, NY-20, 20, NX, NY-20, 380);
aurGrad.addColorStop(0,   'rgba(0,0,0,0.95)');
aurGrad.addColorStop(0.4, 'rgba(0,0,0,0.80)');
aurGrad.addColorStop(0.75,'rgba(0,0,0,0.40)');
aurGrad.addColorStop(1,   'rgba(0,0,0,0)');
ctx.beginPath();
ctx.ellipse(NX, NY, 370, 430, -0.1, 0, Math.PI*2);
ctx.fillStyle = aurGrad;
ctx.fill();

// CLOAK
fillShape([
  [NX-50, NY-200],[NX+90, NY-180],[NX+140,NY-120],[NX+200, NY+20],
  [NX+260, NY+180],[NX+300, NY+380],[NX+240, NY+440],[NX+160, NY+460],
  [NX+60,  NY+420],[NX-20,  NY+380],[NX-100, NY+440],[NX-180, NY+420],
  [NX-260, NY+360],[NX-300, NY+200],[NX-220, NY+40],[NX-180, NY-60],[NX-120, NY-160],
], 'rgba(0,0,0,0.96)');

// HOOD
fillShape([
  [NX-40,  NY-200],[NX+10,  NY-320],[NX+50,  NY-280],
  [NX+100, NY-220],[NX+95,  NY-170],[NX+60,  NY-145],[NX-10,  NY-148],[NX-50,  NY-170],
], 'rgba(0,0,0,0.98)');

// HOOD inner shadow
fillShape([
  [NX-15,  NY-200],[NX+15,  NY-300],[NX+40,  NY-270],
  [NX+75,  NY-210],[NX+65,  NY-165],[NX+30,  NY-148],[NX-5,   NY-150],
], 'rgba(10,5,0,0.99)');

// MASK / face wrap
fillShape([
  [NX-45, NY-165],[NX-20, NY-175],[NX+25, NY-170],[NX+65, NY-155],
  [NX+60, NY-138],[NX+20, NY-130],[NX-20, NY-132],[NX-48, NY-145],
], '#0a0805');

// LEFT ARM
fillShape([
  [NX-90,  NY-80],[NX-160, NY-10],[NX-260, NY+80],[NX-380, NY+130],
  [NX-440, NY+120],[NX-460, NY+90],[NX-420, NY+70],[NX-350, NY+110],
  [NX-240, NY+55],[NX-130, NY-30],[NX-60,  NY-100],
], 'rgba(0,0,0,0.97)');

// HAND / FIST
fillShape([
  [NX-440, NY+80],[NX-480, NY+60],[NX-500, NY+90],
  [NX-490, NY+125],[NX-455, NY+140],[NX-420, NY+130],
], '#030200');

// RIGHT ARM
fillShape([
  [NX+90,  NY-80],[NX+160, NY-30],[NX+230, NY+60],[NX+280, NY+140],
  [NX+270, NY+180],[NX+230, NY+170],[NX+180, NY+100],[NX+110, NY+20],[NX+55,  NY-60],
], 'rgba(0,0,0,0.95)');

// LEFT LEG
fillShape([
  [NX-30,  NY+300],[NX-80,  NY+340],[NX-140, NY+420],[NX-180, NY+500],
  [NX-200, NY+600],[NX-210, NY+680],[NX-190, NY+720],[NX-150, NY+720],
  [NX-100, NY+680],[NX-100, NY+580],[NX-70,  NY+500],[NX-20,  NY+420],
  [NX+20,  NY+350],[NX+20,  NY+300],
], 'rgba(0,0,0,0.97)');

// RIGHT LEG
fillShape([
  [NX+30,  NY+300],[NX+80,  NY+360],[NX+140, NY+440],[NX+180, NY+520],
  [NX+170, NY+620],[NX+160, NY+700],[NX+185, NY+720],[NX+225, NY+720],
  [NX+240, NY+680],[NX+230, NY+580],[NX+220, NY+480],[NX+180, NY+400],
  [NX+110, NY+330],[NX+55,  NY+300],
], 'rgba(0,0,0,0.96)');

// FEET
fillShape([[NX-210,NY+680],[NX-240,NY+700],[NX-260,NY+710],[NX-250,NY+730],[NX-180,NY+740],[NX-140,NY+730],[NX-120,NY+715],[NX-150,NY+695]],'#050302');
fillShape([[NX+150,NY+700],[NX+130,NY+715],[NX+140,NY+740],[NX+200,NY+745],[NX+260,NY+730],[NX+270,NY+710],[NX+250,NY+695],[NX+215,NY+690]],'#050302');

// KUNAI WEAPON
fillShape([[NX-460,NY+85],[NX-550,NY+40],[NX-580,NY+60],[NX-540,NY+78],[NX-470,NY+115]],'#1a1210');
fillShape([[NX-465,NY+87],[NX-550,NY+43],[NX-556,NY+55],[NX-470,NY+108]],'#2a2018');

// ENERGY LINES around fist
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const r1 = 30 + rand() * 20;
  const r2 = 60 + rand() * 50;
  ctx.beginPath();
  ctx.moveTo(NX-440 + Math.cos(angle)*r1, NY+100 + Math.sin(angle)*r1);
  ctx.lineTo(NX-440 + Math.cos(angle)*r2, NY+100 + Math.sin(angle)*r2);
  ctx.strokeStyle = `rgba(255,180,60,${0.15 + rand()*0.20})`;
  ctx.lineWidth = 0.8 + rand();
  ctx.stroke();
}

// ─── 7. CLOAK DETAIL LINES ───────────────────────────────────────────────────
const cloakLines = [
  [[NX-120,NY-140],[NX-200,NY+60],[NX-280,NY+260],[NX-300,NY+450]],
  [[NX+95, NY-160],[NX+180,NY+40],[NX+250,NY+280],[NX+290,NY+470]],
  [[NX-60, NY+300],[NX-80, NY+440],[NX-100,NY+560]],
  [[NX+50, NY+320],[NX+80, NY+460],[NX+100,NY+580]],
];
cloakLines.forEach(pts => {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.strokeStyle = 'rgba(80,55,30,0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
});

// ─── 7b. NINJA EDGE HIGHLIGHTS ───────────────────────────────────────────────
// Bright edge on cloak silhouette — creates manga "ink outline" contrast
ctx.save();
ctx.strokeStyle = 'rgba(220,190,120,0.45)';
ctx.lineWidth = 1.8;
// Right cloak edge
ctx.beginPath();
ctx.moveTo(NX+90,  NY-180);
ctx.lineTo(NX+145, NY-115);
ctx.lineTo(NX+205, NY+25);
ctx.lineTo(NX+265, NY+185);
ctx.lineTo(NX+305, NY+385);
ctx.lineTo(NX+245, NY+445);
ctx.lineTo(NX+165, NY+465);
ctx.stroke();
// Right cloak lower + leg
ctx.strokeStyle = 'rgba(180,150,80,0.30)';
ctx.beginPath();
ctx.moveTo(NX+165, NY+465);
ctx.lineTo(NX+90,  NY+430);
ctx.lineTo(NX+180, NY+520);
ctx.lineTo(NX+170, NY+620);
ctx.lineTo(NX+160, NY+700);
ctx.lineTo(NX+190, NY+720);
ctx.stroke();
// Left cloak edge
ctx.strokeStyle = 'rgba(200,170,100,0.38)';
ctx.lineWidth = 1.8;
ctx.beginPath();
ctx.moveTo(NX-50,  NY-200);
ctx.lineTo(NX-125, NY-160);
ctx.lineTo(NX-185, NY-60);
ctx.lineTo(NX-225, NY+45);
ctx.lineTo(NX-305, NY+205);
ctx.lineTo(NX-265, NY+365);
ctx.lineTo(NX-185, NY+425);
ctx.stroke();
// Left cloak lower + leg
ctx.strokeStyle = 'rgba(180,150,80,0.28)';
ctx.beginPath();
ctx.moveTo(NX-185, NY+425);
ctx.lineTo(NX-105, NY+445);
ctx.lineTo(NX-200, NY+600);
ctx.lineTo(NX-210, NY+680);
ctx.lineTo(NX-150, NY+720);
ctx.stroke();
// Hood edge
ctx.strokeStyle = 'rgba(240,210,140,0.60)';
ctx.lineWidth = 2.0;
ctx.beginPath();
ctx.moveTo(NX-40, NY-200);
ctx.lineTo(NX+12, NY-325);
ctx.lineTo(NX+55, NY-282);
ctx.lineTo(NX+102, NY-222);
ctx.stroke();
// Left arm edge
ctx.strokeStyle = 'rgba(210,180,110,0.42)';
ctx.lineWidth = 1.4;
ctx.beginPath();
ctx.moveTo(NX-90, NY-80);
ctx.lineTo(NX-165, NY-10);
ctx.lineTo(NX-265, NY+82);
ctx.lineTo(NX-385, NY+133);
ctx.lineTo(NX-445, NY+122);
ctx.stroke();
// Kunai gleam edge
ctx.strokeStyle = 'rgba(220,200,140,0.50)';
ctx.lineWidth = 1.0;
ctx.beginPath();
ctx.moveTo(NX-460, NY+85);
ctx.lineTo(NX-552, NY+42);
ctx.stroke();
ctx.restore();

// ─── 8. RED ACCENT SLASHES ───────────────────────────────────────────────────
ctx.save();
const slashGrad = ctx.createLinearGradient(200, 680, 1300, 120);
slashGrad.addColorStop(0,   'rgba(180,0,0,0)');
slashGrad.addColorStop(0.1, 'rgba(200,0,0,0.90)');
slashGrad.addColorStop(0.5, 'rgba(220,0,0,0.95)');
slashGrad.addColorStop(0.9, 'rgba(200,0,0,0.80)');
slashGrad.addColorStop(1,   'rgba(180,0,0,0)');
ctx.beginPath();
ctx.moveTo(180, 720);
ctx.lineTo(1340, 80);
ctx.strokeStyle = slashGrad;
ctx.lineWidth = 4.5;
ctx.lineCap = 'round';
ctx.stroke();

ctx.beginPath();
ctx.moveTo(220, 740);
ctx.lineTo(1390, 95);
ctx.strokeStyle = 'rgba(160,0,0,0.50)';
ctx.lineWidth = 1.5;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(600, 50);
ctx.lineTo(1200, 380);
ctx.strokeStyle = 'rgba(180,0,0,0.45)';
ctx.lineWidth = 2.5;
ctx.stroke();
ctx.restore();

// ─── 9. SPLATTERS ────────────────────────────────────────────────────────────
function splatter(cx, cy, count, maxR, color) {
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * maxR;
    const r = randRange(1, 6);
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * (0.5 + rand()), r * (0.3 + rand()*0.7), rand()*Math.PI, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    if (rand() > 0.7) {
      const tailLen = randRange(8, 40);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle)*tailLen, sy + Math.sin(angle)*tailLen);
      ctx.strokeStyle = color;
      ctx.lineWidth = randRange(0.5, 2);
      ctx.stroke();
    }
  }
}

splatter(400, 620, 30, 80, 'rgba(200,0,0,0.80)');
splatter(750, 180, 20, 60, 'rgba(180,0,0,0.70)');
splatter(1350,440, 18, 50, 'rgba(160,0,0,0.65)');
splatter(260, 320, 12, 45, 'rgba(200,0,0,0.55)');
splatter(900, 720, 15, 55, 'rgba(180,0,0,0.60)');
splatter(650, 200, 25, 70, 'rgba(0,0,0,0.90)');
splatter(1100,720, 20, 65, 'rgba(0,0,0,0.85)');
splatter(300, 780, 18, 50, 'rgba(0,0,0,0.85)');

// ─── 10. DEBRIS SHARDS ───────────────────────────────────────────────────────
function shard(cx, cy, size, angle, alpha) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size*0.6, size*0.3);
  ctx.lineTo(0, size*0.2);
  ctx.lineTo(-size*0.7, size*0.5);
  ctx.closePath();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(60,40,20,${alpha * 0.6})`;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

[[350,120,28,0.8],[480,280,18,1.2],[290,460,22,2.1],[600,140,14,0.4],[720,300,20,1.8],
 [580,700,25,0.6],[1380,200,18,2.4],[1450,350,22,1.1],[1300,650,16,1.9],[900,820,20,0.3],
 [140,580,18,1.6],[1580,520,14,2.2],[820,100,12,0.9],[1100,820,16,1.4],[440,800,20,0.7]]
.forEach(([x,y,s,a]) => shard(x, y, s, a, 0.65 + rand()*0.25));

// ─── 11. SMOKE WISPS ─────────────────────────────────────────────────────────
function smokeWisp(x, y, w, h, rotation, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w,h));
  g.addColorStop(0,   `rgba(20,12,5,${alpha})`);
  g.addColorStop(0.4, `rgba(15,8,3,${alpha*0.6})`);
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}
smokeWisp(200, 750, 300, 140, -0.2, 0.75);
smokeWisp(650, 820, 380, 120, 0.1,  0.70);
smokeWisp(1200,780, 320, 130, -0.1, 0.65);
smokeWisp(80,  500, 220, 180, 0.3,  0.60);
smokeWisp(1550,300, 200, 250, -0.4, 0.55);

// ─── 12. VIGNETTE ────────────────────────────────────────────────────────────
const vig = ctx.createRadialGradient(W/2, H/2, H*0.28, W/2, H/2, H*0.85);
vig.addColorStop(0,   'rgba(0,0,0,0)');
vig.addColorStop(0.6, 'rgba(0,0,0,0.20)');
vig.addColorStop(1,   'rgba(0,0,0,0.88)');
ctx.fillStyle = vig;
ctx.fillRect(0, 0, W, H);

const edgeGrad = ctx.createLinearGradient(0, 0, W, 0);
edgeGrad.addColorStop(0,    'rgba(0,0,0,0.65)');
edgeGrad.addColorStop(0.18, 'rgba(0,0,0,0)');
edgeGrad.addColorStop(0.82, 'rgba(0,0,0,0)');
edgeGrad.addColorStop(1,    'rgba(0,0,0,0.50)');
ctx.fillStyle = edgeGrad;
ctx.fillRect(0, 0, W, H);

const topGrad = ctx.createLinearGradient(0, 0, 0, H);
topGrad.addColorStop(0,    'rgba(0,0,0,0.70)');
topGrad.addColorStop(0.12, 'rgba(0,0,0,0)');
topGrad.addColorStop(0.85, 'rgba(0,0,0,0)');
topGrad.addColorStop(1,    'rgba(0,0,0,0.80)');
ctx.fillStyle = topGrad;
ctx.fillRect(0, 0, W, H);

// ─── 13. RED GLOWS ───────────────────────────────────────────────────────────
const glow1 = ctx.createRadialGradient(NX-460, NY+100, 0, NX-460, NY+100, 160);
glow1.addColorStop(0,   'rgba(200,0,0,0.35)');
glow1.addColorStop(0.5, 'rgba(140,0,0,0.12)');
glow1.addColorStop(1,   'rgba(100,0,0,0)');
ctx.fillStyle = glow1;
ctx.fillRect(0, 0, W, H);

const glow2 = ctx.createLinearGradient(0, 0, 0, H);
glow2.addColorStop(0.55,'rgba(100,0,0,0)');
glow2.addColorStop(0.72,'rgba(100,0,0,0.08)');
glow2.addColorStop(0.82,'rgba(80,0,0,0)');
ctx.fillStyle = glow2;
ctx.fillRect(0, 0, W, H);

// ─── 14. FINAL GRAIN PASS (composited) ────────────────────────────────────────
ctx.save();
for (let i = 0; i < 50000; i++) {
  const x = rand() * W;
  const y = rand() * H;
  const v = (rand() * 255) | 0;
  ctx.globalAlpha = 0.015 + rand() * 0.025;
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  ctx.fillRect(x, y, 1, 1);
}
ctx.restore();

// ─── OUTPUT ───────────────────────────────────────────────────────────────────
const outPath = 'public/assets/ninja-banner.png';
const buf = canvas.toBuffer('image/png');
writeFileSync(outPath, buf);
console.log(`Banner saved → ${outPath}  (${(buf.length/1024).toFixed(1)} KB)`);
