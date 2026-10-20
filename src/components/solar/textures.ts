import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace, Texture } from "three";

export type TextureSet = {
  mercury: CanvasTexture;
  venus: CanvasTexture;
  earthDay: CanvasTexture;
  earthNight: CanvasTexture;
  earthCloud: CanvasTexture;
  mars: CanvasTexture;
  jupiter: CanvasTexture;
  saturn: CanvasTexture;
  uranus: CanvasTexture;
  neptune: CanvasTexture;
  saturnRing: CanvasTexture;
  uranusRing: CanvasTexture;
  sunGlow: CanvasTexture;
};

function clamp255(n: number) {
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

function hash2(ix: number, iy: number) {
  const s = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function vnoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 5; i++) {
    v += a * vnoise(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

function smooth(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function makeTex(canvas: HTMLCanvasElement, srgb: boolean) {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function surface(w: number, h: number, paint: (x: number, y: number, ny: number, nx: number) => [number, number, number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  if (!g) return makeTex(canvas, true);
  const img = g.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const ny = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const nx = x / (w - 1);
      const [r, gv, b, a] = paint(x, y, ny, nx);
      const i = (y * w + x) * 4;
      d[i] = clamp255(r);
      d[i + 1] = clamp255(gv);
      d[i + 2] = clamp255(b);
      d[i + 3] = clamp255(a);
    }
  }
  g.putImageData(img, 0, 0);
  return makeTex(canvas, true);
}

type Ellipse = { lon: number; lat: number; rx: number; ry: number };

function ellipseScore(lon: number, lat: number, e: Ellipse) {
  let dlon = lon - e.lon;
  if (dlon > 180) dlon -= 360;
  if (dlon < -180) dlon += 360;
  const dx = dlon / e.rx;
  const dy = (lat - e.lat) / e.ry;
  return dx * dx + dy * dy;
}

const LAND: Ellipse[] = [
  { lon: 20, lat: 5, rx: 26, ry: 36 },
  { lon: 10, lat: 22, rx: 18, ry: 12 },
  { lon: 32, lat: -22, rx: 14, ry: 16 },
  { lon: 78, lat: 48, rx: 68, ry: 22 },
  { lon: 95, lat: 28, rx: 28, ry: 16 },
  { lon: 78, lat: 20, rx: 14, ry: 12 },
  { lon: -100, lat: 46, rx: 32, ry: 18 },
  { lon: -105, lat: 28, rx: 16, ry: 12 },
  { lon: -62, lat: -15, rx: 18, ry: 30 },
  { lon: 134, lat: -24, rx: 18, ry: 12 },
  { lon: -42, lat: 72, rx: 14, ry: 8 },
  { lon: 0, lat: -78, rx: 160, ry: 10 },
];

const DESERT: Ellipse[] = [
  { lon: 8, lat: 24, rx: 22, ry: 12 },
  { lon: 45, lat: 24, rx: 14, ry: 10 },
  { lon: 135, lat: -25, rx: 12, ry: 8 },
];

function earthSample(x: number, y: number, w: number, h: number, night: boolean): [number, number, number, number] {
  const ny = y / (h - 1);
  const nx = x / (w - 1);
  const lat = 90 - ny * 180;
  const lon = nx * 360 - 180;
  const warp = (fbm(nx * 6 + 2, ny * 6) - 0.5) * 14;
  const latW = lat + warp * 0.35;
  const lonW = lon + warp;
  let landScore = 8;
  for (const e of LAND) landScore = Math.min(landScore, ellipseScore(lonW, latW, e));
  const coast = fbm(nx * 10, ny * 10);
  const land = landScore < 0.92 + (coast - 0.5) * 0.28;
  const ice = lat > 72 || lat < -66 || (land && Math.abs(lat) > 58 && fbm(nx * 8, ny * 4) > 0.62);
  let desert = false;
  if (land) {
    for (const e of DESERT) {
      if (ellipseScore(lon, lat, e) < 1) desert = true;
    }
  }
  if (night) {
    if (!land || ice || Math.abs(lat) > 62) return [4, 8, 18, 255];
    const city =
      ellipseScore(lon, lat, { lon: 10, lat: 48, rx: 28, ry: 14 }) < 1 ||
      ellipseScore(lon, lat, { lon: -82, lat: 40, rx: 22, ry: 12 }) < 1 ||
      ellipseScore(lon, lat, { lon: 118, lat: 32, rx: 24, ry: 14 }) < 1 ||
      ellipseScore(lon, lat, { lon: 78, lat: 22, rx: 16, ry: 12 }) < 1;
    const spark = hash2(x, y);
    if (spark > (city ? 0.82 : 0.975)) {
      const warm = spark > 0.96 ? 230 : 180;
      return [warm, city ? 196 : 160, city ? 120 : 90, 255];
    }
    return [6, 12, 26, 255];
  }
  const depth = fbm(nx * 4, ny * 5);
  if (!land) {
    const shallow = landScore < 1.15;
    if (ice && Math.abs(lat) > 70) return [226, 236, 242, 0];
    if (shallow) return [46 + depth * 20, 140, 156, 0];
    return [14 + depth * 18, 58 + depth * 36, 118 + depth * 30, 0];
  }
  if (ice) return [232, 238, 242, 255];
  if (desert) return [198 + coast * 20, 164, 92, 255];
  const forest = fbm(nx * 8 + 4, ny * 8);
  if (forest > 0.58) return [36, 92 + forest * 30, 48, 255];
  return [62 + coast * 30, 118, 58, 255];
}

function gas(
  w: number,
  h: number,
  stops: Array<[number, number, number]>,
  spot?: { u: number; v: number; rx: number; ry: number; color: [number, number, number] },
) {
  return surface(w, h, (x, _y, ny, nx) => {
    const band = Math.sin(ny * 36 + Math.sin(ny * 80) * 0.4) * 0.5 + Math.sin(ny * 12 + 0.7) * 0.32 + 0.5;
    const pole = Math.abs(ny - 0.5) * 2;
    const t = Math.min(0.999, Math.max(0, band * (1 - pole * 0.18)));
    const scaled = t * (stops.length - 1);
    const i0 = Math.floor(scaled);
    const i1 = Math.min(stops.length - 1, i0 + 1);
    const f = scaled - i0;
    const ang = nx * Math.PI * 2;
    const wob = Math.sin(ang * 3 + ny * 18) * 8 + Math.sin(ang * 7 - ny * 11) * 5;
    const shade = 1 + wob * 0.006 - pole * pole * 0.08;
    let r = (stops[i0][0] + (stops[i1][0] - stops[i0][0]) * f) * shade;
    let g = (stops[i0][1] + (stops[i1][1] - stops[i0][1]) * f) * shade;
    let b = (stops[i0][2] + (stops[i1][2] - stops[i0][2]) * f) * shade;
    if (spot) {
      let dx = nx - spot.u;
      if (dx > 0.5) dx -= 1;
      if (dx < -0.5) dx += 1;
      const dy = ny - spot.v;
      const e = (dx * dx) / (spot.rx * spot.rx) + (dy * dy) / (spot.ry * spot.ry);
      if (e < 1) {
        const k = (1 - e) * (1 - e);
        r = r * (1 - k) + spot.color[0] * k;
        g = g * (1 - k) + spot.color[1] * k;
        b = b * (1 - k) + spot.color[2] * k;
      }
    }
    return [r, g, b, 255];
  });
}

function ringTexture(
  bands: Array<{ t0: number; t1: number; color: string }>,
  innerFrac: number,
) {
  const s = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const g = canvas.getContext("2d");
  if (!g) return makeTex(canvas, true);
  g.clearRect(0, 0, s, s);
  const cx = s / 2;
  const maxR = s / 2 - 1;
  for (const band of bands) {
    const r0 = maxR * (innerFrac + (1 - innerFrac) * band.t0);
    const r1 = maxR * (innerFrac + (1 - innerFrac) * band.t1);
    g.beginPath();
    g.arc(cx, cx, (r0 + r1) / 2, 0, Math.PI * 2);
    g.strokeStyle = band.color;
    g.lineWidth = Math.max(1, r1 - r0);
    g.stroke();
  }
  return makeTex(canvas, true);
}

function mercuryTexture() {
  const w = 768;
  const h = 384;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) return makeTex(canvas, true);
  g.fillStyle = "#8a847c";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 3 + Math.random() * (i < 12 ? 36 : 16);
    const grd = g.createRadialGradient(x, y, r * 0.15, x, y, r);
    grd.addColorStop(0, "rgba(70,66,62,0.55)");
    grd.addColorStop(0.72, "rgba(70,66,62,0)");
    grd.addColorStop(0.84, "rgba(40,38,36,0.55)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  return makeTex(canvas, true);
}

function glowTexture() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const g = canvas.getContext("2d");
  if (!g) return makeTex(canvas, false);
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(255,248,236,0.95)");
  grd.addColorStop(0.18, "rgba(255,214,160,0.38)");
  grd.addColorStop(0.42, "rgba(255,176,90,0.12)");
  grd.addColorStop(1, "rgba(255,160,70,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const tex = makeTex(canvas, false);
  tex.wrapS = RepeatWrapping;
  return tex;
}

export function buildTextures(): TextureSet {
  const w = 768;
  const h = 384;
  return {
    mercury: mercuryTexture(),
    venus: surface(w, h, (x, y) => {
      const n = fbm(x / 70, y / 48);
      const n2 = fbm(x / 26 + 3, y / 32);
      return [206 + n * 34, 168 + n2 * 36, 86 + n * 22, 255];
    }),
    earthDay: surface(1024, 512, (x, y) => earthSample(x, y, 1024, 512, false)),
    earthNight: surface(1024, 512, (x, y) => earthSample(x, y, 1024, 512, true)),
    earthCloud: surface(768, 384, (x, y, ny, nx) => {
      const n = fbm(nx * 5, ny * 7);
      const n2 = fbm(nx * 12 + 4, ny * 10);
      const d = smooth(0.52, 0.72, n * 0.65 + n2 * 0.45);
      const a = d * (1 - Math.abs(ny - 0.5) * 0.25) * 220;
      return [245, 248, 252, a];
    }),
    mars: surface(w, h, (x, y, ny, nx) => {
      const lat = 90 - ny * 180;
      const lon = nx * 360 - 180;
      const n = fbm(x / 64, y / 64);
      let r = 168 + n * 46;
      let g = 74 + n * 24;
      let b = 46 + n * 14;
      const dx = (lon - 18) / 42;
      const dy = (lat + 8) / 26;
      if (dx * dx + dy * dy < 1) {
        r *= 0.7;
        g *= 0.68;
        b *= 0.66;
      }
      const ice = smooth(68, 82, Math.abs(lat));
      return [r * (1 - ice) + 232 * ice, g * (1 - ice) + 228 * ice, b * (1 - ice) + 220 * ice, 255];
    }),
    jupiter: gas(
      1024,
      512,
      [
        [236, 214, 176],
        [214, 164, 112],
        [176, 112, 74],
        [232, 196, 150],
        [140, 78, 58],
        [244, 228, 200],
      ],
      { u: 0.64, v: 0.58, rx: 0.055, ry: 0.038, color: [176, 62, 46] },
    ),
    saturn: gas(1024, 512, [
      [242, 226, 190],
      [214, 186, 140],
      [236, 214, 176],
      [196, 168, 124],
      [248, 236, 210],
    ]),
    uranus: gas(768, 384, [
      [214, 242, 240],
      [170, 214, 210],
      [230, 248, 246],
      [186, 224, 220],
    ]),
    neptune: gas(
      768,
      384,
      [
        [28, 58, 168],
        [18, 36, 120],
        [64, 104, 206],
        [22, 44, 150],
        [12, 24, 80],
      ],
      { u: 0.42, v: 0.46, rx: 0.04, ry: 0.03, color: [16, 28, 90] },
    ),
    saturnRing: ringTexture(
      [
        { t0: 0.02, t1: 0.18, color: "rgba(186, 164, 126, 0.45)" },
        { t0: 0.18, t1: 0.52, color: "rgba(236, 220, 186, 0.92)" },
        { t0: 0.56, t1: 0.78, color: "rgba(214, 196, 160, 0.78)" },
        { t0: 0.8, t1: 0.9, color: "rgba(244, 232, 206, 0.7)" },
        { t0: 0.93, t1: 0.98, color: "rgba(220, 200, 160, 0.4)" },
      ],
      1.28 / 2.2,
    ),
    uranusRing: ringTexture(
      [
        { t0: 0.2, t1: 0.48, color: "rgba(198, 226, 224, 0.45)" },
        { t0: 0.62, t1: 0.8, color: "rgba(210, 232, 230, 0.28)" },
      ],
      1.45 / 1.9,
    ),
    sunGlow: glowTexture(),
  };
}

export function disposeTextures(set: TextureSet) {
  for (const tex of Object.values(set)) {
    if (tex instanceof Texture) tex.dispose();
  }
}
