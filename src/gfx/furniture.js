// Procedural pixel-art furniture. Every function draws one object type.
// Signature: (ctx, x, y, obj, timeSeconds, game) where x,y is the screen
// position of the object's footprint top-left; tall objects draw upwards.
import { rect as R, shade as S, hash2 } from '../core/util.js';

const WOOD = '#7a5236';
const WOOD_D = '#5a3b26';
const WOOD_L = '#9a6b47';
const METAL = '#8c949c';
const METAL_D = '#5f666e';
const METAL_L = '#b7bec4';
const DARK = '#1d1824';
const BOOKC = ['#a8413a', '#3e6a8c', '#d0a144', '#4f7d4e', '#7a4a7e', '#c96d3b', '#e0d6c0', '#2f4a5e'];

function sh(c, x, y, w, h, a = 0.25) {
  c.fillStyle = `rgba(12,8,22,${a})`;
  c.fillRect(x, y, w, h);
}

export function bed(c, x, y, o) {
  const col = o.c || '#4a6fa5';
  const v = o.v;
  sh(c, x + 1, y + 30, 15, 3);
  if (v === 'cot') {
    R(c, x + 1, y + 2, 14, 29, METAL_D);
    R(c, x + 2, y + 3, 12, 27, '#5d6b4a');
    R(c, x + 3, y + 4, 10, 5, '#e8e2d2');
    R(c, x + 2, y + 12, 12, 1, '#4c5a3c');
    R(c, x + 2, y + 29, 12, 1, METAL);
    return;
  }
  R(c, x, y - 4, 16, 7, WOOD_D);
  R(c, x + 1, y - 3, 14, 2, WOOD_L);
  R(c, x + 1, y - 1, 14, 2, WOOD);
  R(c, x + 1, y + 3, 14, 28, WOOD_D);
  if (v === 'bare') {
    R(c, x + 2, y + 4, 12, 25, '#b8a98a');
    for (let i = 0; i < 25; i += 3) R(c, x + 2, y + 4 + i, 12, 1, '#9f9073');
    R(c, x + 1, y + 29, 14, 3, WOOD_D);
    return;
  }
  R(c, x + 2, y + 3, 12, 27, '#ece6d9');
  R(c, x + 3, y + 4, 10, 6, '#faf7f0');
  R(c, x + 3, y + 9, 10, 1, '#d7cfbf');
  if (v === 'sleeper') R(c, x + 5, y + 5, 6, 4, '#2f241c');
  const by = 11;
  R(c, x + 2, y + by, 12, 19, col);
  R(c, x + 2, y + by, 12, 2, S(col, 0.25));
  R(c, x + 12, y + by + 2, 2, 17, S(col, -0.18));
  R(c, x + 2, y + by + 18, 12, 1, S(col, -0.3));
  if (o.p === 'fox') {
    for (let i = 0; i < 3; i++) {
      const fx = x + 4 + (i % 2) * 5;
      const fy = y + by + 5 + i * 5;
      R(c, fx, fy, 3, 2, '#e8873a');
      R(c, fx, fy - 1, 1, 1, '#e8873a');
      R(c, fx + 2, fy - 1, 1, 1, '#e8873a');
      R(c, fx + 1, fy + 1, 1, 1, '#f6e7d4');
    }
  }
  if (v === 'messy') {
    R(c, x + 3, y + by + 3, 6, 4, S(col, 0.12));
    R(c, x + 7, y + by + 9, 6, 5, S(col, -0.12));
    R(c, x + 13, y + by + 5, 3, 11, S(col, -0.05));
    R(c, x + 4, y + 5, 7, 4, '#d8cfbd');
  }
  if (v === 'sleeper') {
    R(c, x + 3, y + by, 10, 9, S(col, 0.1));
    R(c, x + 4, y + by + 8, 8, 2, S(col, -0.15));
  }
  R(c, x + 1, y + 30, 14, 2, WOOD_D);
  R(c, x + 1, y + 30, 14, 1, WOOD);
}

function laptop(c, x, y, on) {
  R(c, x, y + 5, 12, 4, '#2a2b33');
  R(c, x + 1, y + 6, 10, 2, '#3d3f4a');
  R(c, x + 1, y - 3, 10, 8, '#2a2b33');
  R(c, x + 2, y - 2, 8, 6, on ? '#7fb7d6' : '#1f2a33');
  if (on) {
    R(c, x + 3, y - 1, 4, 1, '#d7f0ff');
    R(c, x + 3, y + 1, 6, 1, '#a8d4ea');
    R(c, x + 3, y + 3, 3, 1, '#a8d4ea');
  }
}

function screenArt(c, x, y, scr, t) {
  const f = Math.floor(t * 4);
  if (scr === 'solitaire') {
    R(c, x, y, 14, 8, '#2f7a3f');
    for (let i = 0; i < 4; i++) R(c, x + 1 + i * 3, y + 1, 2, 3 + (i % 2), '#f2f2ea');
    R(c, x + 2, y + 6, 2, 1, '#d03a3a');
  } else if (scr === 'chat') {
    R(c, x, y, 14, 8, '#1e2433');
    R(c, x + 1, y + 1, 7, 1, '#8ab4f8');
    R(c, x + 5, y + 3, 8, 1, '#c9d1d9');
    R(c, x + 1, y + 5, 5, 1, '#8ab4f8');
    if (f % 2) R(c, x + 7, y + 5, 1, 1, '#ffffff');
  } else if (scr === 'toasters') {
    R(c, x, y, 14, 8, '#05060a');
    for (let i = 0; i < 3; i++) {
      const tx = ((Math.floor(t * 6) + i * 5) % 16) - 2;
      const ty = (i * 3 + Math.floor(t * 3)) % 8;
      if (tx >= 0 && tx < 13) R(c, x + tx, y + ty, 2, 1, '#e8c547');
    }
  } else if (scr === 'flash') {
    R(c, x, y, 14, 8, '#2f5a8a');
    R(c, x + 2, y + 2, 3, 2, '#e8c547');
    R(c, x + 6, y + 3, 6, 1, '#d7e8ff');
  } else {
    R(c, x, y, 14, 8, '#2b5a8a');
    R(c, x + 3, y + 2, 8, 4, '#d7e8ff');
    R(c, x + 4, y + 4, 6, 1, '#2b5a8a');
    if (f % 2) R(c, x + 5, y + 4, 1, 1, '#000');
  }
}

function monitor(c, x, y, on, scr, t) {
  R(c, x + 5, y + 9, 6, 2, '#a89f88');
  R(c, x + 3, y + 10, 10, 2, '#b8af98');
  R(c, x, y - 1, 16, 11, '#9e957f');
  R(c, x + 1, y, 14, 9, '#cfc6b0');
  R(c, x + 1, y, 14, 1, '#e2dac6');
  if (on) screenArt(c, x + 1, y + 1, scr, t);
  else R(c, x + 1, y + 1, 14, 8, '#1a2228');
  R(c, x + 12, y + 9, 2, 1, on ? '#6fe07a' : '#5a5a4a');
}

function deskLamp(c, x, y, on) {
  R(c, x, y + 9, 6, 2, '#3b3b44');
  R(c, x + 2, y + 3, 1, 6, '#55555f');
  R(c, x, y, 6, 4, '#c94f3c');
  R(c, x, y, 6, 1, '#e06a55');
  if (on) R(c, x + 1, y + 4, 4, 1, '#ffe9a8');
}

function books(c, x, y, seed) {
  for (let i = 0; i < 3; i++) {
    const col = BOOKC[Math.floor(hash2(i, seed.length, 3) * BOOKC.length)];
    R(c, x + i, y + 6 - i * 2, 9 - i, 2, col);
    R(c, x + i, y + 6 - i * 2, 9 - i, 1, S(col, 0.25));
  }
}

export function desk(c, x, y, o, t) {
  const w = o.pw;
  sh(c, x + 1, y + 15, w, 2);
  R(c, x, y + 2, w, 9, '#6a4b31');
  R(c, x + 1, y + 2, w - 2, 7, '#8d6845');
  R(c, x + 1, y + 2, w - 2, 1, '#a57f58');
  R(c, x, y + 10, w, 6, '#5b3f29');
  R(c, x + 1, y + 11, w - 2, 4, '#6e4d33');
  R(c, x + 2, y + 12, 10, 2, '#5b3f29');
  R(c, x + 6, y + 12, 2, 1, '#c9a65e');
  R(c, x + 1, y + 15, 2, 1, DARK);
  R(c, x + w - 3, y + 15, 2, 1, DARK);
  const v = o.v || '';
  if (v.includes('laptop')) laptop(c, x + 4, y - 2, true);
  if (v.includes('pc')) monitor(c, x + 8, y - 8, !!o.state.on, o.state.screen || o.screen, t);
  if (v.includes('gaming')) {
    R(c, x + 6, y - 9, 18, 12, '#101016');
    R(c, x + 7, y - 8, 16, 9, o.state.on ? '#2a1a4a' : '#0c0c12');
    if (o.state.on) R(c, x + 8, y - 7, 9, 1, '#d7c0ff');
    const hue = Math.floor(t * 90) % 360;
    R(c, x + 6, y + 3, 18, 1, `hsl(${hue},90%,60%)`);
    R(c, x + 25, y - 8, 6, 16, '#15151c');
    R(c, x + 26, y - 6, 4, 1, `hsl(${(hue + 120) % 360},90%,60%)`);
    R(c, x + 26, y - 2, 4, 1, `hsl(${(hue + 240) % 360},90%,60%)`);
  }
  if (v.includes('lamp')) deskLamp(c, x + w - 8, y - 6, o.state.lamp !== false);
  if (v.includes('books')) books(c, x + 3, y - 2, o.id);
  if (v.includes('sketch')) {
    R(c, x + 4, y + 3, 11, 6, '#f4efe2');
    R(c, x + 5, y + 4, 6, 1, '#7a6a5a');
    R(c, x + 6, y + 6, 4, 2, '#c98b6a');
    R(c, x + 16, y + 4, 1, 5, '#3a5fa0');
    R(c, x + 18, y + 4, 1, 5, '#d0584a');
  }
  if (v.includes('papers')) {
    R(c, x + 5, y + 3, 8, 5, '#ece6d6');
    R(c, x + 7, y + 4, 8, 5, '#f6f1e4');
    R(c, x + 8, y + 5, 5, 1, '#8a8070');
    R(c, x + 8, y + 7, 4, 1, '#8a8070');
  }
  if (v.includes('mug')) {
    R(c, x + w - 7, y + 3, 3, 4, '#e6e0d0');
    R(c, x + w - 4, y + 4, 1, 2, '#e6e0d0');
  }
}

export function chair(c, x, y, o) {
  const col = o.c || '#3d4a66';
  const X = x + 3;
  sh(c, X, y + 13, 10, 2);
  R(c, X + 3, y + 11, 4, 3, '#2a2a30');
  R(c, X + 1, y + 14, 8, 1, '#2a2a30');
  R(c, X, y + 7, 10, 5, S(col, -0.35));
  R(c, X + 1, y + 7, 8, 4, col);
  const top = o.v === 'gaming' ? -4 : 0;
  R(c, X + 1, y + top, 8, 8 - top, S(col, -0.35));
  R(c, X + 2, y + top + 1, 6, 6 - top, col);
  R(c, X + 2, y + top + 1, 6, 1, S(col, 0.2));
  if (o.v === 'gaming') R(c, X + 2, y + top + 3, 6, 1, '#c8303a');
}

export function stool(c, x, y) {
  sh(c, x + 4, y + 12, 9, 2);
  R(c, x + 5, y + 8, 1, 5, WOOD_D);
  R(c, x + 10, y + 8, 1, 5, WOOD_D);
  R(c, x + 4, y + 5, 8, 4, WOOD);
  R(c, x + 4, y + 5, 8, 1, WOOD_L);
}

export function wardrobe(c, x, y, o) {
  const col = o.c || '#7a5638';
  sh(c, x + 1, y + 15, 15, 2);
  R(c, x, y - 17, 16, 33, S(col, -0.45));
  R(c, x + 1, y - 16, 14, 31, col);
  R(c, x + 1, y - 16, 14, 2, S(col, 0.2));
  R(c, x + 7, y - 14, 1, 26, S(col, -0.35));
  R(c, x + 5, y - 4, 1, 3, '#d8b46a');
  R(c, x + 9, y - 4, 1, 3, '#d8b46a');
  R(c, x + 1, y + 12, 14, 3, S(col, -0.25));
  R(c, x + 2, y - 13, 4, 1, S(col, 0.1));
}

export function bookshelf(c, x, y, o) {
  const w = o.pw;
  const seed = o.seed || 1;
  sh(c, x + 1, y + 15, w, 2);
  R(c, x, y - 17, w, 33, '#4a3020');
  R(c, x + 1, y - 16, w - 2, 31, '#6b4a30');
  for (let s = 0; s < 3; s++) {
    const sy = y - 15 + s * 10;
    R(c, x + 2, sy, w - 4, 8, '#3a2618');
    let bx = 2;
    while (bx < w - 4) {
      const bw = 2 + Math.floor(hash2(bx, s, seed) * 2);
      if (hash2(bx, s, 9 + seed) > 0.86) {
        bx += 2;
        continue;
      }
      const bh = 5 + Math.floor(hash2(bx, s + 7, seed) * 3);
      const col = BOOKC[Math.floor(hash2(bx + 3, s, seed) * BOOKC.length)];
      const ww = Math.min(bw, w - 2 - bx);
      R(c, x + bx, sy + 8 - bh, ww, bh, col);
      R(c, x + bx, sy + 8 - bh, ww, 1, S(col, 0.25));
      bx += bw;
    }
    R(c, x + 1, sy + 8, w - 2, 2, '#8a6040');
  }
}

export function plant(c, x, y, o, t) {
  sh(c, x + 3, y + 14, 10, 2);
  const sway = Math.round(Math.sin(t * 1.3 + o.x) * 0.6);
  const g1 = '#3f7a45';
  const g2 = '#58994f';
  const g3 = '#2d5a35';
  R(c, x + 7, y - 2, 2, 11, g3);
  R(c, x + 3 + sway, y - 4, 5, 3, g2);
  R(c, x + 9 + sway, y - 6, 5, 3, g1);
  R(c, x + 2, y + 1, 5, 3, g1);
  R(c, x + 10, y, 5, 3, g2);
  R(c, x + 6 + sway, y - 9, 4, 4, g2);
  R(c, x + 4 + sway, y - 4, 2, 1, '#7cbf6a');
  R(c, x + 7 + sway, y - 9, 2, 1, '#7cbf6a');
  R(c, x + 4, y + 9, 8, 6, '#9b4f2f');
  R(c, x + 4, y + 9, 8, 1, '#c06a42');
  R(c, x + 5, y + 14, 6, 1, '#7a3c24');
}

export function fridge(c, x, y, o) {
  sh(c, x + 1, y + 15, 15, 2);
  R(c, x, y - 15, 16, 31, '#9aa0a3');
  R(c, x + 1, y - 14, 14, 29, '#e7e9e5');
  R(c, x + 13, y - 14, 2, 29, '#cfd3cf');
  R(c, x + 1, y - 5, 14, 1, '#a9aeab');
  R(c, x + 2, y - 12, 1, 5, '#8c9294');
  R(c, x + 2, y - 2, 1, 7, '#8c9294');
  R(c, x + 4, y - 12, 3, 3, '#e2c44a');
  R(c, x + 9, y - 10, 3, 3, '#d0584a');
  R(c, x + 5, y - 1, 5, 5, '#f6f1e4');
  R(c, x + 6, y, 3, 1, '#8a8070');
  if (o.state.open) {
    R(c, x + 1, y - 4, 14, 19, '#fff6d8');
    R(c, x + 2, y + 2, 12, 1, '#d8cfb0');
    R(c, x + 2, y + 8, 12, 1, '#d8cfb0');
    if (o.v === 'mustard') {
      R(c, x + 4, y - 1, 3, 3, '#f0e040');
      for (let i = 0; i < 3; i++) R(c, x + 3 + i * 3, y + 4, 2, 4, '#c8a020');
      for (let i = 0; i < 3; i++) R(c, x + 3 + i * 3, y + 10, 2, 4, '#c8a020');
    } else {
      R(c, x + 3, y - 2, 6, 4, '#b0402f');
      R(c, x + 3, y - 2, 6, 1, '#d06050');
      R(c, x + 10, y - 1, 3, 3, '#f6f1e4');
      R(c, x + 4, y + 4, 3, 4, '#e8e2a0');
      R(c, x + 9, y + 3, 2, 5, '#7aa04a');
      R(c, x + 4, y + 10, 7, 3, '#d8a070');
    }
    R(c, x - 3, y - 4, 4, 19, '#e7e9e5');
    R(c, x - 3, y - 4, 1, 19, '#9aa0a3');
  }
}

export function counter(c, x, y, o, t) {
  R(c, x, y - 5, 16, 5, '#d9d3c4');
  R(c, x, y - 5, 16, 1, '#bfb8a6');
  for (let i = 0; i < 16; i += 4) R(c, x + i, y - 5, 1, 5, '#c8c1af');
  R(c, x, y, 16, 5, '#b9b1a0');
  R(c, x, y, 16, 1, '#d6cfbe');
  R(c, x, y + 4, 16, 1, '#8d8576');
  R(c, x, y + 5, 16, 11, '#6f5038');
  R(c, x + 1, y + 6, 14, 9, '#82603f');
  R(c, x + 7, y + 6, 1, 9, '#6f5038');
  R(c, x + 5, y + 9, 1, 2, '#d8b46a');
  R(c, x + 9, y + 9, 1, 2, '#d8b46a');
  sh(c, x, y + 15, 16, 1);
  switch (o.v) {
    case 'sink':
      R(c, x + 3, y + 1, 10, 3, '#8b979e');
      R(c, x + 4, y + 2, 8, 1, '#6d787f');
      R(c, x + 7, y - 4, 2, 4, METAL_L);
      R(c, x + 8, y - 4, 3, 1, METAL_L);
      R(c, x + 4, y + 1, 4, 2, '#d8d0c0');
      break;
    case 'stove':
      R(c, x + 1, y, 14, 4, '#2c2c30');
      R(c, x + 2, y + 1, 5, 2, '#55555c');
      R(c, x + 9, y + 1, 5, 2, '#55555c');
      R(c, x, y + 5, 16, 11, '#d8d8d4');
      R(c, x + 2, y + 8, 12, 5, '#2c2c30');
      R(c, x + 3, y + 9, 10, 1, '#4a4a50');
      for (let i = 0; i < 4; i++) R(c, x + 2 + i * 4, y + 6, 2, 1, '#2c2c30');
      break;
    case 'kettle': {
      const boil = o.state.boil > 0;
      R(c, x + 4, y - 4, 7, 5, '#c7c9cc');
      R(c, x + 5, y - 5, 5, 1, '#a9abae');
      R(c, x + 11, y - 3, 2, 2, '#a9abae');
      R(c, x + 4, y - 4, 7, 1, '#e0e2e4');
      R(c, x + 6, y - 2, 3, 1, boil ? '#ff6040' : '#666');
      if (boil) {
        const k = Math.floor(t * 8) % 3;
        R(c, x + 6 + k, y - 9 + k, 1, 2, 'rgba(240,240,255,0.7)');
        R(c, x + 8 - k, y - 12 + k, 1, 2, 'rgba(240,240,255,0.5)');
      }
      break;
    }
    case 'micro':
      R(c, x + 1, y - 7, 14, 8, '#9a9a96');
      R(c, x + 2, y - 6, 12, 6, '#e2e2de');
      R(c, x + 3, y - 5, 7, 4, o.state.beep > 0 ? '#e8c060' : '#2b2f33');
      R(c, x + 11, y - 5, 2, 1, '#55c060');
      R(c, x + 11, y - 3, 2, 1, '#888');
      break;
    case 'cab':
      R(c, x + 2, y + 1, 12, 2, '#cfc7b5');
      break;
    default:
      R(c, x + 3, y + 1, 5, 3, '#e8dcc0');
      R(c, x + 10, y + 1, 3, 3, '#c04a3a');
  }
}

export function ktable(c, x, y) {
  sh(c, x + 2, y + 28, 30, 3);
  R(c, x + 3, y + 26, 2, 5, WOOD_D);
  R(c, x + 27, y + 26, 2, 5, WOOD_D);
  R(c, x + 1, y + 3, 30, 22, WOOD);
  for (let j = 0; j < 20; j += 4) {
    for (let i = 0; i < 28; i += 4) R(c, x + 2 + i, y + 4 + j, 4, 4, (i / 4 + j / 4) % 2 ? '#ece5d8' : '#c8463e');
  }
  R(c, x + 1, y + 24, 30, 3, '#a83a33');
  R(c, x + 1, y + 26, 30, 1, '#7d2a25');
  R(c, x + 8, y + 8, 3, 3, '#f0ece2');
  R(c, x + 11, y + 9, 1, 1, '#f0ece2');
  R(c, x + 20, y + 12, 5, 3, '#6a8fb0');
  R(c, x + 20, y + 12, 5, 1, '#8ab0d0');
}

export function sofa(c, x, y, o) {
  const col = o.c || '#7a4f6e';
  const w = o.pw;
  const fw = o.fw || 1;
  sh(c, x + 1, y + 15, w, 2);
  R(c, x + 2, y + 1, w - 4, 8, S(col, -0.1));
  R(c, x + 2, y + 1, w - 4, 1, S(col, 0.15));
  for (let i = 1; i < fw; i++) R(c, x + i * 16, y + 2, 1, 6, S(col, -0.3));
  R(c, x, y, 4, 14, S(col, -0.3));
  R(c, x + 1, y, 2, 1, S(col, 0.1));
  R(c, x + w - 4, y, 4, 14, S(col, -0.3));
  R(c, x + w - 3, y, 2, 1, S(col, 0.1));
  R(c, x + 1, y + 7, w - 2, 8, S(col, -0.45));
  R(c, x + 2, y + 7, w - 4, 7, col);
  R(c, x + 2, y + 7, w - 4, 1, S(col, 0.22));
  for (let i = 8; i < w - 4; i += 8) R(c, x + i, y + 10, 1, 1, S(col, -0.25));
  R(c, x + 2, y + 13, w - 4, 1, S(col, -0.3));
  R(c, x + 2, y + 15, 2, 1, DARK);
  R(c, x + w - 4, y + 15, 2, 1, DARK);
}

export function armchair(c, x, y, o) {
  sofa(c, x, y, { ...o, pw: 16, fw: 1 });
}

function tvScreen(c, x, y, t) {
  const f = Math.floor(t * 5);
  R(c, x, y, 14, 5, '#7fb2d4');
  R(c, x, y + 5, 14, 5, '#2f6a8a');
  R(c, x + 2 + (f % 3), y + 3, 4, 3, '#4a3a2a');
  R(c, x + 3 + (f % 3), y + 1, 2, 2, '#e0b890');
  R(c, x + 6 + (f % 3), y + 2, 6, 1, '#b8b0a0');
  if (f % 7 === 0) R(c, x + 9, y + 6, 3, 2, '#c0c8d0');
  R(c, x, y + (f % 10), 14, 1, 'rgba(255,255,255,0.22)');
}

export function tv(c, x, y, o, t) {
  sh(c, x + 1, y + 15, 31, 2);
  R(c, x + 2, y + 3, 28, 12, '#4a3426');
  R(c, x + 3, y + 4, 26, 5, '#5d4331');
  R(c, x + 3, y + 10, 12, 4, '#3a281c');
  R(c, x + 17, y + 10, 12, 4, '#3a281c');
  R(c, x + 5, y + 5, 12, 3, '#222226');
  R(c, x + 6, y + 6, 6, 1, '#111');
  R(c, x + 14, y + 6, 2, 1, o.state.on ? '#ff5040' : '#552222');
  R(c, x + 6, y - 12, 20, 17, '#24242a');
  R(c, x + 7, y - 11, 18, 15, '#3b3b44');
  R(c, x + 7, y - 11, 18, 1, '#55555f');
  if (o.state.on) tvScreen(c, x + 9, y - 9, t);
  else {
    R(c, x + 9, y - 9, 14, 10, '#1b2626');
    R(c, x + 10, y - 8, 4, 2, '#2c3a3a');
  }
  R(c, x + 24, y - 8, 1, 2, '#999');
  R(c, x + 24, y - 4, 1, 2, '#999');
  R(c, x + 12, y - 15, 1, 3, '#777');
  R(c, x + 11, y - 18, 1, 3, '#999');
  R(c, x + 19, y - 15, 1, 3, '#777');
  R(c, x + 20, y - 18, 1, 3, '#999');
  R(c, x + 13, y - 13, 6, 1, '#555');
}

export function ctable(c, x, y) {
  sh(c, x + 2, y + 13, 30, 2);
  R(c, x + 2, y + 11, 2, 3, WOOD_D);
  R(c, x + 28, y + 11, 2, 3, WOOD_D);
  R(c, x + 1, y + 4, 30, 8, '#5d4331');
  R(c, x + 2, y + 4, 28, 6, '#7a5a40');
  R(c, x + 2, y + 4, 28, 1, '#946e50');
  R(c, x + 5, y + 5, 8, 4, '#d8d0b8');
  R(c, x + 6, y + 6, 5, 1, '#c04a3a');
  R(c, x + 20, y + 5, 3, 3, '#e6e0d0');
  R(c, x + 24, y + 6, 4, 2, '#3a6a8a');
}

export function lamp(c, x, y, o) {
  const on = !!o.state.on;
  sh(c, x + 4, y + 13, 8, 2);
  R(c, x + 5, y + 12, 6, 2, '#3b3b44');
  R(c, x + 7, y - 10, 2, 22, '#55555f');
  R(c, x + 3, y - 18, 10, 8, on ? '#f2d48a' : '#a8906a');
  R(c, x + 4, y - 18, 8, 1, on ? '#fff0c0' : '#bca47a');
  R(c, x + 2, y - 11, 12, 1, on ? '#e0b860' : '#8a7452');
  if (on) R(c, x + 5, y - 10, 6, 1, '#fff3c8');
}

export function vending(c, x, y, o, t) {
  sh(c, x, y + 15, 16, 2);
  R(c, x, y - 17, 16, 33, '#5e1f22');
  R(c, x + 1, y - 16, 14, 31, '#b23b3b');
  R(c, x + 1, y - 16, 14, 2, '#d45a4a');
  R(c, x + 2, y - 13, 8, 21, '#1d2a36');
  const cols = ['#e8c547', '#4fb0d8', '#e86a5a', '#7fd17a', '#c27ad8'];
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 3; i++) R(c, x + 3 + i * 2 + i, y - 12 + r * 5, 1, 3, cols[(r * 3 + i) % 5]);
    R(c, x + 3, y - 9 + r * 5, 7, 1, '#3a4a5a');
  }
  R(c, x + 2, y - 13, 1, 21, 'rgba(255,255,255,0.18)');
  R(c, x + 11, y - 13, 3, 10, '#2a2a30');
  R(c, x + 12, y - 12, 1, 2, Math.floor(t * 2) % 2 ? '#7fe08a' : '#2a5a30');
  R(c, x + 12, y - 8, 1, 2, '#888');
  R(c, x + 2, y + 10, 8, 4, '#1a1a1f');
  if (o.state.drop > 0) R(c, x + 4, y + 11, 4, 2, '#5a3a8a');
}

export function cooler(c, x, y, o) {
  sh(c, x + 3, y + 14, 10, 2);
  R(c, x + 3, y + 2, 10, 13, '#cfcfcb');
  R(c, x + 4, y + 3, 8, 11, '#e8e8e4');
  R(c, x + 5, y + 5, 2, 2, '#d04040');
  R(c, x + 9, y + 5, 2, 2, '#4060d0');
  R(c, x + 4, y - 10, 8, 12, '#7ab0dc');
  R(c, x + 5, y - 11, 6, 1, '#7ab0dc');
  R(c, x + 5, y - 9, 1, 10, '#b8daf2');
  if (o.state.bubble > 0) R(c, x + 8, y - 4 - Math.floor((1 - o.state.bubble) * 6), 2, 2, '#d8f0ff');
}

export function sinkm(c, x, y) {
  R(c, x + 3, y - 14, 10, 10, '#8c949c');
  R(c, x + 4, y - 13, 8, 8, '#bcd3dc');
  R(c, x + 5, y - 12, 2, 4, '#e8f4f8');
  R(c, x + 2, y - 1, 12, 6, '#e8ecee');
  R(c, x + 3, y, 10, 3, '#b8c4ca');
  R(c, x + 7, y - 3, 2, 3, METAL);
  R(c, x + 5, y + 5, 6, 8, '#d8dcdd');
  sh(c, x + 4, y + 13, 8, 2);
}

export function shower(c, x, y, o, t) {
  R(c, x, y, 32, 32, '#9fb4bd');
  R(c, x + 1, y + 1, 30, 30, '#c2d3d9');
  for (let i = 4; i < 30; i += 6) {
    R(c, x + 1, y + i, 30, 1, '#aec2c9');
    R(c, x + i, y + 1, 1, 22, '#aec2c9');
  }
  R(c, x + 14, y + 14, 4, 2, '#7d8f96');
  R(c, x + 15, y - 10, 2, 6, METAL_D);
  R(c, x + 13, y - 5, 6, 2, METAL);
  if (o.state.duck) {
    R(c, x + 21, y + 17, 5, 4, '#f2d030');
    R(c, x + 24, y + 15, 3, 3, '#f2d030');
    R(c, x + 27, y + 16, 2, 1, '#e87020');
    R(c, x + 25, y + 16, 1, 1, '#222');
  }
  const cc = o.c || '#7fb0c8';
  const wave = Math.round(Math.sin(t * 1.5 + o.x) * 0.6);
  R(c, x, y + 21, 32, 1, METAL);
  R(c, x + 1, y + 22, 30, 10, cc);
  for (let i = 3 + wave; i < 31; i += 4) R(c, x + i, y + 22, 1, 10, S(cc, -0.2));
  R(c, x + 1, y + 31, 30, 1, S(cc, -0.35));
  R(c, x, y, 2, 32, '#dfe7ea');
  R(c, x + 30, y, 2, 32, '#dfe7ea');
}

export function stall(c, x, y) {
  R(c, x, y, 32, 32, '#b9c6ca');
  R(c, x + 11, y + 1, 10, 4, '#f0f0ec');
  R(c, x + 12, y + 5, 8, 7, '#e2e2de');
  R(c, x + 13, y + 6, 6, 5, '#f6f6f2');
  R(c, x, y, 2, 30, '#6f8a7a');
  R(c, x + 30, y, 2, 30, '#6f8a7a');
  R(c, x + 2, y + 15, 28, 15, '#7f9a8a');
  R(c, x + 3, y + 16, 26, 13, '#8fae9c');
  R(c, x + 3, y + 16, 26, 1, '#a8c6b4');
  R(c, x + 25, y + 21, 2, 2, '#5fd06a');
  R(c, x + 6, y + 20, 12, 1, '#36463c');
  R(c, x + 2, y + 30, 28, 2, 'rgba(0,0,0,0.3)');
}

export function reception(c, x, y) {
  R(c, x + 50, y + 1, 12, 10, '#2e2e38');
  R(c, x + 51, y + 2, 10, 6, '#3d3d48');
  R(c, x + 20, y - 3, 16, 11, '#9e957f');
  R(c, x + 21, y - 2, 14, 8, '#2b5a7a');
  R(c, x + 22, y - 1, 6, 1, '#a8d4ea');
  R(c, x + 22, y + 1, 9, 1, '#6a9aba');
  R(c, x + 25, y + 8, 6, 3, '#9e957f');
  R(c, x + 66, y - 2, 6, 2, '#3b3b44');
  R(c, x + 68, y - 8, 1, 6, '#55555f');
  R(c, x + 65, y - 11, 7, 4, '#3f7a4a');
  R(c, x + 66, y - 7, 5, 1, '#ffe9a8');
  R(c, x + 5, y + 2, 10, 6, '#e8e2d0');
  R(c, x + 6, y + 3, 7, 1, '#8a8070');
  R(c, x - 1, y + 11, 82, 4, '#a07a52');
  R(c, x - 1, y + 11, 82, 1, '#c49a6a');
  R(c, x, y + 15, 80, 17, '#5a3b26');
  R(c, x + 1, y + 15, 78, 16, '#7a5236');
  for (let i = 0; i < 4; i++) {
    R(c, x + 4 + i * 19, y + 18, 15, 10, '#6a4630');
    R(c, x + 4 + i * 19, y + 18, 15, 1, '#5a3b26');
  }
  sh(c, x, y + 31, 80, 2);
  R(c, x + 40, y + 8, 6, 3, '#c8a040');
  R(c, x + 41, y + 7, 4, 1, '#e8c050');
  R(c, x + 42, y + 6, 2, 1, '#fff2a0');
  R(c, x + 10, y + 6, 14, 5, '#f2ecd8');
  R(c, x + 11, y + 7, 10, 1, '#5a5040');
  R(c, x + 11, y + 9, 7, 1, '#5a5040');
  R(c, x + 72, y + 4, 5, 7, '#9b4f2f');
  R(c, x + 71, y + 1, 7, 4, '#4f8a4a');
}

export function bench(c, x, y, o) {
  const w = o.pw;
  sh(c, x + 2, y + 13, w - 2, 2);
  R(c, x + 3, y + 10, 2, 4, WOOD_D);
  R(c, x + w - 5, y + 10, 2, 4, WOOD_D);
  R(c, x + 1, y + 4, w - 2, 7, WOOD_D);
  for (let i = 0; i < 3; i++) R(c, x + 2, y + 5 + i * 2, w - 4, 1, i % 2 ? WOOD : WOOD_L);
}

export function turnstile(c, x, y, o, t) {
  sh(c, x + 3, y + 13, 10, 2);
  R(c, x + 5, y, 6, 14, METAL_D);
  R(c, x + 6, y + 1, 4, 12, METAL);
  R(c, x + 6, y + 1, 4, 1, METAL_L);
  R(c, x + 6, y + 3, 2, 1, Math.floor(t) % 2 ? '#e04040' : '#601818');
  R(c, x + 10, y + 6, 6, 1, METAL_L);
  R(c, x + 10, y + 9, 5, 1, METAL);
}

export function washer(c, x, y, o, t) {
  const spin = o.state.spin > 0;
  const jx = spin ? Math.round(Math.sin(t * 40)) : 0;
  const X = x + jx + (o.state.shift || 0);
  sh(c, x, y + 15, 16, 2);
  const body = o.v === 'dryer' ? '#d8d4ca' : '#eceeec';
  R(c, X, y - 5, 16, 21, '#a7acae');
  R(c, X + 1, y - 4, 14, 19, body);
  R(c, X + 1, y - 4, 14, 4, S(body, -0.08));
  R(c, X + 2, y - 3, 4, 2, '#6a7a8a');
  R(c, X + 10, y - 3, 3, 2, '#c0c4c4');
  R(c, X + 13, y - 3, 1, 1, spin ? '#6fe07a' : '#5a5a5a');
  R(c, X + 3, y + 2, 10, 10, '#9aa2a6');
  R(c, X + 4, y + 1, 8, 12, '#9aa2a6');
  const glass = o.v === 'dryer' ? (spin ? '#c89050' : '#4a4038') : spin ? '#4f86b8' : '#3b4650';
  R(c, X + 4, y + 3, 8, 8, glass);
  R(c, X + 5, y + 2, 6, 10, glass);
  if (spin) {
    const a = t * 12;
    for (let i = 0; i < 3; i++) {
      const px = Math.round(X + 8 + Math.cos(a + i * 2.1) * 2.5);
      const py = Math.round(y + 7 + Math.sin(a + i * 2.1) * 2.5);
      R(c, px - 1, py - 1, 2, 2, ['#e8e0d0', '#d05050', '#f0d060'][i]);
    }
  }
  R(c, X + 5, y + 3, 2, 2, 'rgba(255,255,255,0.35)');
}

export function ironing(c, x, y) {
  sh(c, x + 3, y + 12, 26, 2);
  R(c, x + 8, y + 9, 1, 5, METAL_D);
  R(c, x + 22, y + 9, 1, 5, METAL_D);
  R(c, x + 3, y + 5, 24, 5, '#7a9ab8');
  R(c, x + 27, y + 6, 3, 3, '#7a9ab8');
  R(c, x + 3, y + 5, 24, 1, '#9ab8d4');
  R(c, x + 18, y + 3, 6, 3, '#d8d8d4');
  R(c, x + 23, y + 4, 2, 1, '#888');
}

export function rack(c, x, y) {
  sh(c, x + 2, y + 13, 28, 2);
  R(c, x + 2, y + 2, 1, 12, METAL);
  R(c, x + 29, y + 2, 1, 12, METAL);
  R(c, x + 2, y + 2, 28, 1, METAL_L);
  R(c, x + 2, y + 6, 28, 1, METAL);
  const cols = ['#5a9a5a', '#d8c060', '#5a7ad0', '#d07a8a', '#e8e8e0'];
  for (let i = 0; i < 5; i++) R(c, x + 4 + i * 5, y + 3, 4, 6 + (i % 2) * 2, cols[i]);
  R(c, x + 10, y + 5, 1, 1, '#2a5a2a');
}

export function basket(c, x, y) {
  sh(c, x + 3, y + 14, 10, 2);
  R(c, x + 3, y + 6, 10, 9, '#c8a870');
  for (let i = 0; i < 10; i += 2) R(c, x + 3 + i, y + 7, 1, 8, '#a88850');
  R(c, x + 4, y + 3, 4, 4, '#7a5a9a');
  R(c, x + 7, y + 4, 4, 3, '#e8e0d0');
}

export function shelfx(c, x, y) {
  sh(c, x + 1, y + 15, 15, 2);
  R(c, x + 1, y - 12, 14, 27, '#8a7a62');
  R(c, x + 2, y - 11, 12, 25, '#6a5a46');
  for (let s = 0; s < 3; s++) {
    R(c, x + 2, y - 4 + s * 8, 12, 1, '#9a8a72');
    R(c, x + 3, y - 9 + s * 8, 4, 5, ['#e86a3a', '#3a8ad0', '#e8d040'][s]);
    R(c, x + 8, y - 8 + s * 8, 4, 4, ['#f0f0e8', '#d04a8a', '#60b060'][s]);
  }
}

export function cctv(c, x, y, o, t) {
  desk(c, x, y, { pw: 48, v: '', state: {}, id: 'cctv' }, t);
  for (let i = 0; i < 3; i++) {
    const mx = x + 4 + i * 14;
    R(c, mx, y - 8, 12, 10, '#2a2a30');
    R(c, mx + 1, y - 7, 10, 7, '#2e4a3e');
    R(c, mx + 1, y - 7 + (Math.floor(t * 8 + i * 3) % 7), 10, 1, 'rgba(180,255,200,0.25)');
    if (i === 2) {
      R(c, mx + 3, y - 4, 2, 3, '#4fb0b0');
      R(c, mx + 6, y - 4, 2, 3, '#e0a040');
    } else R(c, mx + 2 + i * 3, y - 3, 6, 1, '#4a6a5a');
  }
}

export function catbed(c, x, y) {
  R(c, x + 1, y + 5, 14, 9, '#6a3a6a');
  R(c, x + 2, y + 6, 12, 7, '#8a5a8a');
  R(c, x + 3, y + 7, 10, 5, '#a070a0');
}

export function cat(c, x, y, o, t) {
  const X = x + (o.state.moved ? 16 : 0);
  const b = Math.sin(t * 2) > 0 ? 1 : 0;
  const fur = '#d4843a';
  const stripe = '#a8602a';
  sh(c, X + 2, y + 12, 12, 2);
  if (!o.state.awake) {
    R(c, X + 2, y + 9, 9, 2, '#c07030');
    R(c, X + 3, y + 6 - b, 10, 6 + b, fur);
    R(c, X + 5, y + 6 - b, 1, 3, stripe);
    R(c, X + 8, y + 6 - b, 1, 3, stripe);
    R(c, X + 10, y + 5, 5, 6, fur);
    R(c, X + 10, y + 4, 1, 1, fur);
    R(c, X + 14, y + 4, 1, 1, fur);
    R(c, X + 11, y + 7, 1, 1, '#5a3018');
    R(c, X + 13, y + 7, 1, 1, '#5a3018');
    R(c, X + 12, y + 9, 1, 1, '#e88a8a');
    R(c, X + 9, y + 11, 2, 1, '#f2e6d6');
    const z = (t * 0.7) % 1;
    if (z < 0.7) {
      const zx = X + 14 + Math.round(z * 4);
      const zy = y - 2 - Math.round(z * 8);
      R(c, zx, zy, 3, 1, '#e8e0ff');
      R(c, zx + 1, zy + 1, 1, 1, '#e8e0ff');
      R(c, zx, zy + 2, 3, 1, '#e8e0ff');
    }
    return;
  }
  const tail = Math.round(Math.sin(t * 3) * 1.5);
  R(c, X + 12, y + 8 + tail, 3, 2, stripe);
  R(c, X + 5, y + 3, 7, 9, fur);
  R(c, X + 7, y + 6, 3, 4, '#f2e6d6');
  R(c, X + 4, y - 2, 9, 6, fur);
  R(c, X + 4, y - 4, 2, 2, fur);
  R(c, X + 11, y - 4, 2, 2, fur);
  R(c, X + 6, y, 1, 1, '#7ad04a');
  R(c, X + 10, y, 1, 1, '#7ad04a');
  R(c, X + 8, y + 2, 1, 1, '#e88a8a');
  R(c, X + 6, y - 2, 1, 1, stripe);
  R(c, X + 10, y - 2, 1, 1, stripe);
}

export function smalltable(c, x, y, o) {
  sh(c, x + 2, y + 13, 13, 2);
  R(c, x + 3, y + 8, 1, 6, WOOD_D);
  R(c, x + 12, y + 8, 1, 6, WOOD_D);
  R(c, x + 2, y + 3, 12, 6, WOOD);
  R(c, x + 2, y + 3, 12, 1, WOOD_L);
  if (o && o.act === 'kettle_duty') {
    R(c, x + 3, y - 2, 5, 5, '#d0d0d4');
    R(c, x + 9, y, 3, 3, '#e8e0d0');
    R(c, x + 9, y + 1, 3, 1, '#d04040');
  }
}

export function radio(c, x, y, o, t) {
  smalltable(c, x, y, null);
  R(c, x + 3, y - 3, 10, 7, '#6a4a30');
  R(c, x + 4, y - 2, 5, 5, '#3a2a1e');
  for (let i = 0; i < 5; i += 2) R(c, x + 4, y - 2 + i, 5, 1, '#5a4a3a');
  R(c, x + 10, y - 2, 2, 2, '#d8c070');
  R(c, x + 12, y - 9, 1, 6, '#999');
  if (o.state.on) {
    const k = (t * 0.8) % 1;
    R(c, x + 1 + Math.round(k * 3), y - 6 - Math.round(k * 7), 2, 2, '#ffd27a');
    R(c, x + 2 + Math.round(k * 3), y - 9 - Math.round(k * 7), 1, 3, '#ffd27a');
  }
}

export function rail(c, x, y) {
  sh(c, x + 9, y, 3, 48, 0.2);
  R(c, x + 6, y, 4, 48, '#5a3b26');
  R(c, x + 7, y, 2, 48, '#8a6040');
  R(c, x + 7, y, 1, 48, '#a87a50');
  for (let i = 4; i < 48; i += 8) R(c, x + 5, y + i, 6, 2, '#4a3020');
}

export function boxes(c, x, y, o) {
  sh(c, x + 1, y + 14, 15, 2);
  R(c, x + 1, y + 2, 14, 13, '#9a7448');
  R(c, x + 2, y + 3, 12, 11, '#b08a5a');
  R(c, x + 2, y + 8, 12, 1, '#c8b080');
  R(c, x + 7, y + 3, 2, 11, '#c8b080');
  if (hash2(o.x, o.y) > 0.4) {
    R(c, x + 3, y - 6, 10, 9, '#a07a4c');
    R(c, x + 4, y - 5, 8, 7, '#bc9666');
    R(c, x + 4, y - 2, 8, 1, '#d0b888');
  }
  R(c, x + 3, y + 10, 4, 2, '#e8e0d0');
}

export function capsule(c, x, y, o, t) {
  sh(c, x + 2, y + 13, 13, 2);
  R(c, x + 2, y + 5, 12, 9, '#4a5056');
  R(c, x + 3, y + 6, 10, 7, '#6d7378');
  R(c, x + 3, y + 9, 10, 1, '#8a9096');
  R(c, x + 7, y + 8, 2, 3, '#c8a840');
  if (o.state.open) {
    R(c, x + 2, y + 1, 12, 4, '#5a6066');
    R(c, x + 4, y + 6, 8, 2, '#f2e8c8');
  } else {
    R(c, x + 2, y + 4, 12, 2, '#5a6066');
    if ((t * 1.2) % 2 < 0.3) {
      R(c, x + 12, y + 2, 1, 3, '#fff8d0');
      R(c, x + 11, y + 3, 3, 1, '#fff8d0');
    }
  }
}

export function guitar(c, x, y) {
  sh(c, x + 3, y + 14, 11, 2);
  R(c, x + 7, y - 10, 2, 14, '#5a3b26');
  R(c, x + 6, y - 13, 4, 4, '#3a2414');
  R(c, x + 4, y + 2, 9, 12, '#a85a28');
  R(c, x + 5, y + 1, 7, 14, '#c07a3a');
  R(c, x + 5, y + 6, 7, 1, '#a85a28');
  R(c, x + 7, y + 8, 3, 3, '#2a1a10');
  R(c, x + 6, y + 12, 5, 1, '#3a2414');
}

export function easel(c, x, y) {
  sh(c, x + 3, y + 14, 11, 2);
  R(c, x + 4, y + 2, 1, 13, WOOD_D);
  R(c, x + 11, y + 2, 1, 13, WOOD_D);
  R(c, x + 7, y - 12, 2, 24, WOOD);
  R(c, x + 2, y - 10, 12, 11, '#f4efe2');
  R(c, x + 3, y - 9, 10, 9, '#1e2a5a');
  R(c, x + 3, y - 4, 10, 4, '#0d1430');
  R(c, x + 4, y - 6, 2, 4, '#0a0f24');
  R(c, x + 8, y - 7, 3, 5, '#0a0f24');
  R(c, x + 5, y - 5, 1, 1, '#ffd27a');
  R(c, x + 9, y - 6, 1, 1, '#ffd27a');
  R(c, x + 10, y - 8, 1, 1, '#f4eccd');
  R(c, x + 2, y + 1, 12, 2, WOOD_D);
}

export function piano(c, x, y) {
  sh(c, x + 1, y + 15, 31, 2);
  R(c, x, y - 12, 32, 26, '#2a1810');
  R(c, x + 1, y - 11, 30, 18, '#3e2418');
  R(c, x + 1, y - 11, 30, 1, '#5a3a28');
  R(c, x + 6, y - 8, 20, 6, '#33201a');
  R(c, x + 1, y + 6, 30, 5, '#efe9da');
  for (let i = 0; i < 30; i += 3) R(c, x + 1 + i, y + 6, 1, 5, '#b8b0a0');
  for (let i = 0; i < 28; i += 6) {
    R(c, x + 3 + i, y + 6, 2, 3, '#1a1010');
    R(c, x + 6 + i, y + 6, 2, 3, '#1a1010');
  }
  R(c, x + 1, y + 11, 30, 3, '#2a1810');
  R(c, x + 3, y - 14, 4, 2, '#e8e0d0');
}

export function chess(c, x, y) {
  sh(c, x + 2, y + 13, 13, 2);
  R(c, x + 6, y + 9, 4, 5, WOOD_D);
  R(c, x + 1, y + 2, 14, 8, WOOD);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) R(c, x + 2 + i * 2, y + 3 + j * 2, 2, 2, (i + j) % 2 ? '#e8dcc0' : '#4a3020');
  R(c, x + 3, y + 2, 1, 2, '#f8f4ea');
  R(c, x + 9, y + 4, 1, 2, '#1a1010');
  R(c, x + 11, y + 2, 1, 2, '#1a1010');
}

export function bin(c, x, y) {
  sh(c, x + 4, y + 14, 9, 2);
  R(c, x + 4, y + 5, 8, 10, '#4a5a4a');
  R(c, x + 5, y + 6, 6, 8, '#5a6e5a');
  R(c, x + 3, y + 4, 10, 2, '#3a4a3a');
  R(c, x + 5, y + 2, 3, 2, '#e8e0d0');
  R(c, x + 8, y + 1, 3, 3, '#d8b47a');
}

export function trophy(c, x, y) {
  sh(c, x + 1, y + 15, 31, 2);
  R(c, x, y - 17, 32, 33, '#4a3020');
  R(c, x + 2, y - 15, 28, 29, '#3a4a58');
  for (let s = 0; s < 3; s++) {
    R(c, x + 2, y - 6 + s * 9, 28, 1, '#6a4a30');
    for (let i = 0; i < 3; i++) {
      const tx = x + 5 + i * 9;
      const ty = y - 12 + s * 9;
      R(c, tx, ty, 4, 3, s === 2 && i === 2 ? '#d8d8d0' : '#e0b040');
      R(c, tx + 1, ty + 3, 2, 2, '#b08020');
      R(c, tx + 1, ty, 1, 1, '#fff0a0');
    }
  }
  R(c, x + 2, y - 15, 1, 29, 'rgba(255,255,255,0.3)');
}

// ---------- floor decor ----------
export function rug(c, x, y, o) {
  const w = o.pw;
  const h = o.ph;
  const col = o.c || '#8a3d3a';
  if (o.v === 'round') {
    R(c, x + 3, y, w - 6, h, col);
    R(c, x, y + 3, w, h - 6, col);
    R(c, x + 1, y + 1, w - 2, h - 2, col);
    R(c, x + 5, y + 4, w - 10, h - 8, S(col, 0.15));
    return;
  }
  R(c, x, y, w, h, S(col, -0.25));
  R(c, x + 2, y + 2, w - 4, h - 4, col);
  R(c, x + 4, y + 4, w - 8, h - 8, S(col, -0.12));
  if (o.v !== 'runner') {
    for (let j = 8; j < h - 6; j += 8) for (let i = 8; i < w - 6; i += 8) R(c, x + i, y + j, 2, 2, S(col, 0.25));
  }
  for (let i = 1; i < w; i += 3) {
    R(c, x + i, y - 1, 1, 1, S(col, 0.2));
    R(c, x + i, y + h, 1, 1, S(col, 0.2));
  }
}

export function mat(c, x, y, o) {
  const col = o.c || '#4a3f36';
  R(c, x + 1, y + 2, o.pw - 2, o.ph - 4, S(col, -0.3));
  R(c, x + 2, y + 3, o.pw - 4, o.ph - 6, col);
  for (let i = 4; i < o.pw - 3; i += 3) R(c, x + i, y + 4, 1, o.ph - 8, S(col, 0.15));
}

export function pizza(c, x, y) {
  sh(c, x + 1, y + 12, 15, 2);
  R(c, x + 1, y + 5, 14, 8, '#c8a06a');
  R(c, x + 1, y + 5, 14, 1, '#dcb880');
  R(c, x + 3, y + 1, 12, 5, '#d8b47a');
  R(c, x + 3, y + 1, 12, 1, '#ecc890');
  R(c, x + 7, y + 2, 3, 3, '#c83a30');
}

export function socks(c, x, y) {
  R(c, x + 3, y + 8, 5, 2, '#e8e8e0');
  R(c, x + 6, y + 9, 2, 4, '#e8e8e0');
  R(c, x + 9, y + 5, 2, 5, '#5a7ad0');
  R(c, x + 9, y + 9, 4, 2, '#5a7ad0');
  R(c, x + 4, y + 8, 1, 1, '#c0a060');
}

export function dumbbells(c, x, y) {
  sh(c, x + 2, y + 11, 12, 2);
  R(c, x + 3, y + 8, 10, 1, '#666');
  R(c, x + 2, y + 6, 2, 5, '#2a2a30');
  R(c, x + 12, y + 6, 2, 5, '#2a2a30');
  R(c, x + 4, y + 11, 8, 1, '#666');
  R(c, x + 3, y + 10, 1, 3, '#2a2a30');
  R(c, x + 12, y + 10, 1, 3, '#2a2a30');
}

export function shoes(c, x, y) {
  R(c, x + 3, y + 8, 4, 6, '#e8a0b8');
  R(c, x + 8, y + 7, 4, 6, '#e8a0b8');
  R(c, x + 3, y + 7, 1, 2, '#f0c0d0');
  R(c, x + 6, y + 7, 1, 2, '#f0c0d0');
  R(c, x + 8, y + 6, 1, 2, '#f0c0d0');
  R(c, x + 11, y + 6, 1, 2, '#f0c0d0');
}

export function backpack(c, x, y) {
  sh(c, x + 3, y + 14, 11, 2);
  R(c, x + 3, y + 3, 10, 12, '#2a4a6a');
  R(c, x + 4, y + 4, 8, 10, '#3a5a7a');
  R(c, x + 5, y + 9, 6, 4, '#2a4a6a');
  R(c, x + 6, y + 1, 4, 3, '#2a4a6a');
  R(c, x + 7, y + 10, 2, 1, '#e8c050');
}

export function zzz(c, x, y, o, t) {
  for (let i = 0; i < 2; i++) {
    const k = (t * 0.5 + i * 0.5) % 1;
    const zx = x + 4 + Math.round(k * 6);
    const zy = y - 4 - Math.round(k * 14);
    const col = `rgba(232,224,255,${(1 - k).toFixed(2)})`;
    R(c, zx, zy, 3, 1, col);
    R(c, zx + 1, zy + 1, 1, 1, col);
    R(c, zx, zy + 2, 3, 1, col);
  }
}

// ---------- wall decor (drawn onto a wall face tile) ----------
const POSTERS = {
  kino: ['#141414', (c, x, y) => {
    R(c, x + 4, y + 3, 8, 2, '#d03030');
    R(c, x + 5, y + 7, 2, 4, '#e8e0d0');
    R(c, x + 9, y + 7, 2, 4, '#e8e0d0');
  }],
  wash: ['#f2ece0', (c, x, y) => {
    R(c, x + 4, y + 3, 8, 2, '#c83030');
    R(c, x + 4, y + 6, 8, 1, '#c83030');
    R(c, x + 4, y + 8, 6, 1, '#c83030');
    R(c, x + 6, y + 10, 4, 2, '#7ab0d0');
  }],
  schedule: ['#f6f2e6', (c, x, y) => {
    for (let i = 0; i < 4; i++) R(c, x + 4, y + 3 + i * 2, 8, 1, '#8a8070');
    R(c, x + 10, y + 9, 2, 1, '#3a6ad0');
  }],
  metal: ['#2a1a3a', (c, x, y) => {
    R(c, x + 4, y + 3, 8, 1, '#c0c0d0');
    R(c, x + 5, y + 4, 1, 2, '#c0c0d0');
    R(c, x + 10, y + 4, 1, 2, '#c0c0d0');
    R(c, x + 6, y + 7, 4, 4, '#a02020');
  }],
  movie: ['#1e2a4a', (c, x, y) => {
    R(c, x + 4, y + 3, 8, 6, '#e8c547');
    R(c, x + 5, y + 4, 6, 4, '#1e2a4a');
    R(c, x + 4, y + 10, 8, 1, '#e8e0d0');
  }],
  council: ['#3a6a4a', (c, x, y) => {
    R(c, x + 4, y + 3, 8, 1, '#f0e8d0');
    R(c, x + 4, y + 5, 6, 1, '#f0e8d0');
    R(c, x + 5, y + 8, 6, 3, '#e8c547');
  }],
  smoke: ['#f2ece0', (c, x, y) => {
    R(c, x + 5, y + 4, 6, 6, '#c83030');
    R(c, x + 6, y + 5, 4, 4, '#f2ece0');
    R(c, x + 6, y + 7, 4, 1, '#555');
  }],
  sneakers: ['#e8c547', (c, x, y) => {
    R(c, x + 4, y + 6, 7, 3, '#f2f2ea');
    R(c, x + 4, y + 9, 8, 1, '#c83030');
    R(c, x + 4, y + 3, 8, 1, '#c83030');
  }],
  photo06: ['#e8e0cc', (c, x, y) => {
    R(c, x + 4, y + 3, 8, 7, '#6a7a8a');
    for (let i = 0; i < 4; i++) R(c, x + 4 + i * 2, y + 6, 1, 2, '#e0b890');
    R(c, x + 6, y + 8, 3, 2, '#9aa0a6');
  }],
};

export function poster(c, x, y, o) {
  const [bg, art] = POSTERS[o.v] || POSTERS.kino;
  sh(c, x + 4, y + 3, 10, 12, 0.3);
  R(c, x + 3, y + 1, 10, 12, o.v === 'photo06' ? '#4a3020' : bg);
  if (o.v === 'photo06') R(c, x + 4, y + 2, 8, 10, bg);
  art(c, x, y);
  R(c, x + 7, y + 1, 2, 1, '#c8c0b0');
}

export function clock(c, x, y, o, t, g) {
  const mins = g ? g.time : 133;
  R(c, x + 5, y + 1, 6, 10, '#3a2a20');
  R(c, x + 4, y + 2, 8, 8, '#3a2a20');
  R(c, x + 5, y + 3, 6, 6, '#f0ead8');
  R(c, x + 6, y + 2, 4, 8, '#f0ead8');
  const cx = x + 8;
  const cy = y + 6;
  const hA = (((mins / 60) % 12) / 12) * Math.PI * 2;
  const mA = ((mins % 60) / 60) * Math.PI * 2;
  for (let i = 1; i <= 3; i++) R(c, Math.round(cx + Math.sin(mA) * i) - 1, Math.round(cy - Math.cos(mA) * i), 1, 1, '#2a2020');
  for (let i = 1; i <= 2; i++) R(c, Math.round(cx + Math.sin(hA) * i) - 1, Math.round(cy - Math.cos(hA) * i), 1, 1, '#a03030');
}

export function lightSwitch(c, x, y, o) {
  const on = o.room ? o.room.lightOn : false;
  sh(c, x + 7, y + 6, 5, 7, 0.3);
  R(c, x + 6, y + 5, 5, 7, '#d8d2c2');
  R(c, x + 7, y + 6, 3, 5, '#f0ead8');
  R(c, x + 8, y + (on ? 6 : 8), 1, 3, on ? '#e8b030' : '#8a8a8a');
}

export function extinguisher(c, x, y) {
  sh(c, x + 7, y + 6, 5, 10, 0.3);
  R(c, x + 6, y + 6, 5, 9, '#c8302a');
  R(c, x + 6, y + 6, 1, 9, '#e85a4a');
  R(c, x + 7, y + 4, 3, 2, '#2a2a30');
  R(c, x + 10, y + 5, 2, 1, '#2a2a30');
  R(c, x + 7, y + 9, 3, 2, '#f0e8d0');
}

export function board(c, x, y, o) {
  const w = o.pw;
  sh(c, x + 3, y + 2, w - 4, 12, 0.3);
  R(c, x + 2, y + 1, w - 4, 12, '#6a4a30');
  R(c, x + 3, y + 2, w - 6, 10, '#b98a54');
  const cols = ['#f2ecd8', '#e8d070', '#a8d0e8', '#f0b0b0', '#c8e8a8'];
  for (let i = 0; i < 6; i++) {
    const px = x + 4 + Math.floor(hash2(i, o.x) * (w - 12));
    const py = y + 3 + Math.floor(hash2(o.y, i) * 5);
    R(c, px, py, 5, 4, cols[i % cols.length]);
    R(c, px + 2, py, 1, 1, '#c83030');
  }
  if (o.v === 'lobby' && o.state.pol) {
    R(c, x + w - 11, y + 3, 6, 7, '#f8f8f4');
    R(c, x + w - 10, y + 4, 4, 4, '#d88a5a');
  }
}

export function keyrack(c, x, y) {
  sh(c, x + 4, y + 3, 26, 10, 0.3);
  R(c, x + 3, y + 2, 26, 10, '#7a5236');
  R(c, x + 4, y + 3, 24, 8, '#9a6b47');
  const tags = ['#c83030', '#3a8ad0', '#e8d040', '#60b060', '#e8e8e0', '#d07a2a'];
  for (let i = 0; i < 6; i++) {
    R(c, x + 5 + i * 4, y + 4, 1, 1, METAL_L);
    if (i !== 3) {
      R(c, x + 5 + i * 4, y + 5, 1, 3, '#d8b45a');
      R(c, x + 4 + i * 4, y + 8, 3, 2, tags[i]);
    } else R(c, x + 4 + i * 4, y + 6, 3, 2, '#f2ecd8');
  }
}

export function mailbox(c, x, y) {
  R(c, x + 3, y + 1, 26, 13, METAL_D);
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 6; i++) {
      R(c, x + 4 + i * 4, y + 2 + j * 4, 3, 3, METAL);
      R(c, x + 4 + i * 4, y + 3 + j * 4, 3, 1, '#3a3f44');
    }
  }
  R(c, x + 12, y + 3, 2, 1, '#f2ecd8');
}

export function payphone(c, x, y) {
  sh(c, x + 4, y + 1, 10, 14, 0.3);
  R(c, x + 3, y, 10, 14, '#3a5a8a');
  R(c, x + 4, y + 1, 8, 12, '#4a6a9a');
  R(c, x + 4, y + 2, 2, 8, '#1a1a20');
  R(c, x + 7, y + 3, 4, 4, '#c0c8d0');
  for (let i = 0; i < 3; i++) R(c, x + 7 + i, y + 8, 1, 1, '#1a1a20');
  R(c, x + 5, y + 10, 1, 4, '#1a1a20');
}

export function calendar(c, x, y) {
  sh(c, x + 5, y + 2, 9, 11, 0.3);
  R(c, x + 4, y + 1, 9, 11, '#f2ece0');
  R(c, x + 4, y + 1, 9, 3, '#c83030');
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) R(c, x + 5 + i * 2, y + 5 + j * 2, 1, 1, '#8a8070');
}

export function firehose(c, x, y) {
  sh(c, x + 3, y + 2, 13, 12, 0.3);
  R(c, x + 2, y + 1, 13, 12, '#a8201a');
  R(c, x + 3, y + 2, 11, 10, '#c8302a');
  R(c, x + 5, y + 4, 7, 6, '#e8e0d0');
  R(c, x + 6, y + 5, 5, 4, '#c8302a');
}

export function cobweb(c, x, y) {
  const col = 'rgba(220,220,230,0.55)';
  R(c, x, y + 1, 9, 1, col);
  R(c, x + 1, y + 2, 1, 7, col);
  R(c, x + 2, y + 3, 1, 1, col);
  R(c, x + 3, y + 4, 1, 1, col);
  R(c, x + 4, y + 5, 1, 1, col);
  R(c, x + 2, y + 6, 4, 1, col);
  R(c, x + 5, y + 2, 1, 3, col);
}

export function banner(c, x, y) {
  R(c, x + 2, y + 1, 28, 1, '#5a4a3a');
  R(c, x + 3, y + 2, 26, 8, '#8a4a44');
  for (let i = 0; i < 26; i += 2) R(c, x + 3 + i, y + 10, 1, 1 + (i % 4 ? 0 : 1), '#8a4a44');
  R(c, x + 6, y + 4, 8, 1, '#c8b890');
  R(c, x + 16, y + 4, 9, 1, '#c8b890');
  R(c, x + 8, y + 6, 14, 1, '#b8a880');
}

export function sign(c, x, y, o) {
  R(c, x + 3, y + 2, 10, 7, '#2a7a4a');
  R(c, x + 4, y + 3, 8, 5, '#3a9a5a');
  R(c, x + 7, y + 4, 2, 3, '#f0f0e8');
  R(c, x + 6, o.v === 'up' ? y + 4 : y + 6, 4, 1, '#f0f0e8');
}

export function whiteboard(c, x, y, o) {
  sh(c, x + 3, y + 2, o.pw - 4, 12, 0.3);
  R(c, x + 2, y + 1, o.pw - 4, 12, METAL);
  R(c, x + 3, y + 2, o.pw - 6, 10, '#f2f4f2');
  R(c, x + 5, y + 4, 10, 1, '#3a5ad0');
  R(c, x + 5, y + 6, 6, 1, '#3a5ad0');
  R(c, x + 17, y + 4, 2, 4, '#d03030');
  R(c, x + 20, y + 5, 5, 1, '#2a2a2a');
  R(c, x + 21, y + 7, 4, 3, '#2a2a2a');
  R(c, x + 22, y + 8, 2, 1, '#f2f4f2');
  R(c, x + 3, y + 12, o.pw - 6, 1, '#a0a8b0');
}

export function fairy(c, x, y, o, t) {
  const w = o.pw;
  const cols = ['#ffd27a', '#ff8a8a', '#8affc8', '#a8b8ff'];
  for (let i = 0; i < w; i++) R(c, x + i, y + 2 + Math.round(Math.sin(i / 5) * 1.5), 1, 1, '#4a3a30');
  for (let i = 2, k = 0; i < w; i += 5, k++) {
    const yy = y + 3 + Math.round(Math.sin(i / 5) * 1.5);
    const lit = o.state.on && Math.floor(t * 2 + k) % 4 !== 0;
    R(c, x + i, yy, 2, 2, lit ? cols[k % 4] : '#5a5050');
  }
}

export function photowall(c, x, y) {
  R(c, x + 1, y + 2, 14, 1, '#7a6a5a');
  const cols = ['#d88a5a', '#6a9ac8', '#c8a8d8'];
  for (let i = 0; i < 3; i++) {
    const px = x + 1 + i * 5;
    const py = y + 3 + (i % 2);
    R(c, px, py, 4, 5, '#f8f8f4');
    R(c, px + 1, py + 1, 2, 2, cols[i]);
  }
}

export const sconceLit = (o, t) => !!o.state.fixed || Math.sin(t * 23) + Math.sin(t * 7.3) > -0.6;

export function sconce(c, x, y, o, t) {
  const lit = sconceLit(o, t);
  R(c, x + 6, y + 6, 4, 2, METAL_D);
  R(c, x + 5, y + 2, 6, 5, lit ? '#fff0c0' : '#8a8070');
  R(c, x + 5, y + 2, 6, 1, lit ? '#ffffff' : '#9a9080');
}

export function dreamcatcher(c, x, y, o, t) {
  if (!o.state.hanging) return;
  const sw = Math.round(Math.sin(t * 1.4));
  R(c, x + 8, y, 1, 3, '#8a7a6a');
  R(c, x + 5 + sw, y + 3, 7, 1, '#c8a870');
  R(c, x + 5 + sw, y + 9, 7, 1, '#c8a870');
  R(c, x + 4 + sw, y + 4, 1, 5, '#c8a870');
  R(c, x + 12 + sw, y + 4, 1, 5, '#c8a870');
  R(c, x + 7 + sw, y + 5, 3, 3, 'rgba(240,240,240,0.6)');
  R(c, x + 5 + sw, y + 10, 1, 4, '#e8e8e8');
  R(c, x + 8 + sw, y + 10, 1, 5, '#a8c8e8');
  R(c, x + 11 + sw, y + 10, 1, 4, '#e8e8e8');
}

export function entrance(c, x, y, o, t) {
  R(c, x, y, 64, 16, '#2a2a33');
  R(c, x + 2, y + 2, 29, 12, '#14203a');
  R(c, x + 33, y + 2, 29, 12, '#14203a');
  const glow = Math.sin(t * 3) > -0.9 ? '#ffb060' : '#a07040';
  R(c, x + 14, y + 6, 3, 3, glow);
  R(c, x + 13, y + 9, 5, 1, 'rgba(255,176,96,0.4)');
  R(c, x + 4, y + 3, 1, 9, 'rgba(255,255,255,0.18)');
  R(c, x + 35, y + 3, 1, 9, 'rgba(255,255,255,0.18)');
  R(c, x + 29, y + 7, 2, 3, METAL_L);
  R(c, x + 33, y + 7, 2, 3, METAL_L);
  R(c, x + 26, y, 12, 3, '#2fae5a');
  R(c, x + 28, y + 1, 8, 1, '#c8ffd8');
}

export function noop() {}
