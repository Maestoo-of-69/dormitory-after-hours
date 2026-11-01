// Tile rendering: floors, wall faces/tops, stairs (pre-rendered once per floor),
// plus animated windows and doors drawn every frame.
import { TILE } from '../config.js';
import { makeCanvas, rect as R, shade as S, hash2 } from '../core/util.js';
import { T_FLOOR, T_WALL, F_STAIRS } from '../world/builder.js';

const WALLS = {
  corridor: { kind: 'paint', up: '#d9d0b9', low: '#4f7a5c', line: '#2f4a38', base: '#3a2a22' },
  kitchen: { kind: 'tiles', up: '#e6e0cf', low: '#8fb2b0', line: '#c9c2b0', base: '#4a3a2e' },
  common: { kind: 'paper', up: '#8a5a4a', low: '#7a4c3e', line: '#9a6a56', base: '#3a2418' },
  tile: { kind: 'tiles', up: '#dfe7ea', low: '#dfe7ea', line: '#b9c6cc', base: '#7a8a90' },
  lobby: { kind: 'panel', up: '#cfc2a2', low: '#6a4a30', line: '#4a3020', base: '#3a2418' },
  duty: { kind: 'paint', up: '#b8b090', low: '#6a7a8a', line: '#4a5560', base: '#3a2a22' },
  paperBlue: { kind: 'paper', up: '#5d7a9e', low: '#526e90', line: '#6e8ab0', base: '#3a2a22' },
  paperRose: { kind: 'paper', up: '#b07a86', low: '#a06d79', line: '#c48c98', base: '#4a2a2a' },
  paperMint: { kind: 'paper', up: '#7fa08a', low: '#71927c', line: '#90b29a', base: '#3a2a22' },
  study: { kind: 'panel', up: '#a89c84', low: '#5a4a3a', line: '#3a2a20', base: '#2a1e16' },
  storage: { kind: 'paint', up: '#8a7e6a', low: '#6a5e50', line: '#4a4036', base: '#2a2420' },
};

function drawFloorTile(c, px, py, f, tx, ty) {
  const h = hash2(tx, ty);
  switch (f) {
    case ',': // wood planks
    case 'd': { // dusty boards
      const dusty = f === 'd';
      for (let i = 0; i < 4; i++) {
        const v = hash2(tx, ty * 4 + i, 1);
        const col = dusty ? (v > 0.5 ? '#7d6a55' : '#6e5d4a') : v > 0.5 ? '#9a6a43' : '#8a5c39';
        R(c, px, py + i * 4, 16, 4, col);
        R(c, px, py + i * 4 + 3, 16, 1, dusty ? '#5a4a3a' : '#6e4529');
        const seam = Math.floor(hash2(tx, ty * 4 + i, 2) * 16);
        R(c, px + seam, py + i * 4, 1, 3, dusty ? '#5a4a3a' : '#6e4529');
        if (v > 0.8) R(c, px + ((seam + 6) % 14), py + i * 4 + 1, 2, 1, dusty ? '#8a7860' : '#ab7a50');
      }
      if (dusty && h > 0.6) R(c, px + Math.floor(h * 12), py + Math.floor(h * 30) % 14, 2, 1, '#a89880');
      break;
    }
    case ':': // ceramic tiles
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 2; i++) {
          const odd = (tx * 2 + i + ty * 2 + j) % 2;
          R(c, px + i * 8, py + j * 8, 8, 8, odd ? '#c7d1d5' : '#d8e0e3');
          R(c, px + i * 8, py + j * 8, 8, 1, '#e8eef0');
        }
      }
      R(c, px, py + 7, 16, 1, '#9aa8ae');
      R(c, px + 7, py, 1, 16, '#9aa8ae');
      R(c, px, py + 15, 16, 1, '#9aa8ae');
      R(c, px + 15, py, 1, 16, '#9aa8ae');
      break;
    case '~': // carpet
      R(c, px, py, 16, 16, '#6e3434');
      R(c, px, py, 16, 1, '#5e2c2c');
      if ((tx + ty) % 2 === 0) {
        R(c, px + 6, py + 6, 4, 4, '#8a4a3e');
        R(c, px + 7, py + 5, 2, 6, '#8a4a3e');
      }
      if (h > 0.7) R(c, px + Math.floor(h * 13), py + 12, 1, 1, '#844640');
      break;
    case '_': { // lobby stone
      const col = h > 0.5 ? '#b9b2a5' : '#ada597';
      R(c, px, py, 16, 16, col);
      R(c, px, py, 16, 1, '#c9c3b8');
      R(c, px, py, 1, 16, '#c9c3b8');
      R(c, px, py + 15, 16, 1, '#8e877b');
      R(c, px + 15, py, 1, 16, '#8e877b');
      if (h > 0.55) {
        for (let i = 0; i < 6; i++) R(c, px + 3 + i, py + 4 + Math.floor(i * 1.3), 1, 1, '#c8c2b6');
      }
      break;
    }
    case 'g': // study carpet tiles
      R(c, px, py, 16, 16, (tx + ty) % 2 ? '#4c5a6e' : '#45526a');
      for (let i = 0; i < 4; i++) R(c, px + Math.floor(hash2(tx, ty, i) * 15), py + Math.floor(hash2(ty, tx, i) * 15), 1, 1, '#56647a');
      break;
    default: { // linoleum
      const alt = (tx + ty) % 2;
      R(c, px, py, 16, 16, alt ? '#b2a487' : '#bbad90');
      R(c, px, py, 16, 1, '#a39579');
      R(c, px, py, 1, 16, '#a39579');
      if (h > 0.6) R(c, px + Math.floor(h * 14), py + Math.floor(h * 97) % 14, 2, 1, '#a89a7e');
    }
  }
}

function drawStairs(c, px, py, row, dir, edgeL, edgeR) {
  for (let i = 0; i < 4; i++) {
    const step = row * 4 + i;
    const k = dir === 'up' ? 0.06 * (11 - step) : -0.07 * (11 - step);
    const top = S('#a08a6a', Math.max(-0.7, Math.min(0.5, k)));
    R(c, px, py + i * 4, 16, 3, top);
    R(c, px, py + i * 4 + 3, 16, 1, S(top, -0.35));
    R(c, px, py + i * 4, 16, 1, S(top, 0.15));
  }
  if (edgeL) R(c, px, py, 2, 16, '#4a3a2c');
  if (edgeR) R(c, px + 14, py, 2, 16, '#4a3a2c');
}

function drawFace(c, px, py, style, tx, ty) {
  const s = WALLS[style] || WALLS.corridor;
  switch (s.kind) {
    case 'paint':
      R(c, px, py, 16, 7, s.up);
      R(c, px, py + 7, 16, 1, s.line);
      R(c, px, py + 8, 16, 6, s.low);
      R(c, px, py + 8, 16, 1, S(s.low, 0.18));
      if (hash2(tx, ty, 5) > 0.7) R(c, px + Math.floor(hash2(tx, ty, 6) * 14), py + 3, 1, 1, S(s.up, -0.1));
      break;
    case 'tiles':
      R(c, px, py, 16, 14, s.up);
      R(c, px, py + 8, 16, 6, s.low);
      for (let i = 0; i < 16; i += 4) R(c, px + i, py, 1, 14, s.line);
      for (let j = 0; j < 14; j += 4) R(c, px, py + j, 16, 1, s.line);
      break;
    case 'panel':
      R(c, px, py, 16, 7, s.up);
      R(c, px, py + 7, 16, 7, s.low);
      R(c, px, py + 7, 16, 1, S(s.low, 0.3));
      for (let i = 0; i < 16; i += 4) R(c, px + i, py + 8, 1, 6, s.line);
      break;
    default: // wallpaper
      R(c, px, py, 16, 14, s.up);
      for (let i = (tx * 16) % 4; i < 16; i += 4) R(c, px + i, py + 2, 1, 12, s.line);
      for (let i = 2; i < 16; i += 8) R(c, px + i, py + 6 + ((tx + i) % 2) * 3, 1, 1, S(s.up, 0.25));
      R(c, px, py + 10, 16, 4, s.low);
      R(c, px, py + 10, 16, 1, S(s.low, -0.25));
  }
  R(c, px, py, 16, 2, S(s.up, -0.38));
  R(c, px, py + 14, 16, 2, s.base);
  R(c, px, py + 14, 16, 1, S(s.base, 0.3));
}

function drawTop(c, px, py, f, tx, ty) {
  R(c, px, py, 16, 16, '#3a3245');
  const h = hash2(tx, ty, 3);
  if (h > 0.5) R(c, px + Math.floor(h * 13), py + Math.floor(h * 71) % 13, 2, 1, '#433a50');
  const t = (x, y) => (x < 0 || y < 0 || x >= f.w || y >= f.h ? 0 : f.tile[y * f.w + x]);
  const hi = '#5a4f6c';
  if (t(tx - 1, ty) === T_FLOOR) R(c, px, py, 1, 16, hi);
  if (t(tx + 1, ty) === T_FLOOR) R(c, px + 15, py, 1, 16, hi);
  if (t(tx, ty - 1) === T_FLOOR) R(c, px, py, 16, 1, hi);
  if (t(tx, ty + 1) === T_WALL && t(tx, ty + 2) === T_FLOOR) R(c, px, py + 15, 16, 1, hi);
}

function styleBelow(f, tx, ty) {
  for (let y = ty + 1; y < Math.min(f.h, ty + 3); y++) {
    const ri = f.room[y * f.w + tx];
    if (ri >= 0) return f.rooms[ri].wall;
  }
  return 'corridor';
}

export function renderStatic(f) {
  const { c, ctx } = makeCanvas(f.w * TILE, f.h * TILE);
  const s = f.stairs;
  for (let ty = 0; ty < f.h; ty++) {
    for (let tx = 0; tx < f.w; tx++) {
      const i = ty * f.w + tx;
      const px = tx * TILE;
      const py = ty * TILE;
      const tt = f.tile[i];
      if (tt === T_FLOOR) {
        if (f.flags[i] & F_STAIRS) {
          const edgeL = !(f.flags[i - 1] & F_STAIRS);
          const edgeR = !(f.flags[i + 1] & F_STAIRS);
          drawStairs(ctx, px, py, ty - s.y, s.dir, edgeL, edgeR);
        } else drawFloorTile(ctx, px, py, f.ftype[i], tx, ty);
      } else if (tt === T_WALL) {
        const below = ty + 1 < f.h ? f.tile[i + f.w] : 0;
        if (below === T_FLOOR) drawFace(ctx, px, py, styleBelow(f, tx, ty), tx, ty);
        else drawTop(ctx, px, py, f, tx, ty);
      } else {
        R(ctx, px, py, 16, 16, '#0d0b13');
      }
    }
  }
  // Soft contact shadows where floor meets walls.
  for (let ty = 1; ty < f.h; ty++) {
    for (let tx = 1; tx < f.w - 1; tx++) {
      const i = ty * f.w + tx;
      if (f.tile[i] !== T_FLOOR || f.flags[i] & F_STAIRS) continue;
      const px = tx * TILE;
      const py = ty * TILE;
      if (f.tile[i - f.w] === T_WALL) {
        ctx.fillStyle = 'rgba(10,6,20,0.28)';
        ctx.fillRect(px, py, 16, 2);
        ctx.fillStyle = 'rgba(10,6,20,0.14)';
        ctx.fillRect(px, py + 2, 16, 2);
      }
      if (f.tile[i - 1] === T_WALL) {
        ctx.fillStyle = 'rgba(10,6,20,0.18)';
        ctx.fillRect(px, py, 2, 16);
      }
      if (f.tile[i + 1] === T_WALL) {
        ctx.fillStyle = 'rgba(10,6,20,0.12)';
        ctx.fillRect(px + 14, py, 2, 16);
      }
    }
  }
  return c;
}

export function drawWindows(c, f, cx, cy, t) {
  for (const w of f.def.windows || []) {
    const x = w.x * TILE - cx;
    const y = w.y * TILE - cy;
    if (x < -40 || x > c.canvas.width + 8 || y < -40 || y > c.canvas.height + 30) continue;
    const seed = w.x * 7 + w.y * 13 + (f.id === 'f2' ? 101 : 0);
    R(c, x + 1, y - 9, 30, 22, '#e8e0cc');
    R(c, x + 1, y - 9, 30, 1, '#f6f0e0');
    R(c, x + 3, y - 7, 26, 18, '#0f1636');
    R(c, x + 3, y - 1, 26, 6, '#17204a');
    R(c, x + 3, y + 5, 26, 6, '#222c5a');
    for (let i = 0; i < 5; i++) {
      const sx = x + 4 + Math.floor(hash2(seed, i) * 24);
      const sy = y - 6 + Math.floor(hash2(i, seed) * 6);
      if ((Math.floor(t * 1.5 + i * 1.7) + seed) % 5) R(c, sx, sy, 1, 1, '#c8d0ff');
    }
    if (hash2(seed, 99) > 0.55) {
      const mx = x + 6 + Math.floor(hash2(seed, 98) * 14);
      R(c, mx, y - 6, 4, 4, '#f4eccd');
      R(c, mx + 1, y - 7, 2, 1, '#f4eccd');
      R(c, mx + 2, y - 5, 2, 2, '#d8d0b0');
    }
    let bx = 0;
    let k = 0;
    while (bx < 26) {
      const bw = 3 + Math.floor(hash2(seed, k, 1) * 4);
      const bh = 4 + Math.floor(hash2(seed, k, 2) * 9);
      const ww = Math.min(bw, 26 - bx);
      R(c, x + 3 + bx, y + 11 - bh, ww, bh, '#0a0e22');
      for (let wy = y + 12 - bh; wy < y + 10; wy += 2) {
        for (let wx = 1; wx < ww - 1; wx += 2) {
          if (hash2(wx + bx * 3, wy - y, seed + Math.floor(t / 4 + k)) > 0.72) R(c, x + 3 + bx + wx, wy, 1, 1, '#ffd27a');
        }
      }
      bx += bw;
      k++;
    }
    R(c, x + 15, y - 7, 2, 18, '#e8e0cc');
    R(c, x + 3, y + 1, 26, 1, '#d8d0bc');
    R(c, x, y + 11, 32, 3, '#d8d0bc');
    R(c, x, y + 13, 32, 1, '#a89f88');
    const room = f.rooms[f.room[(w.y + 1) * f.w + w.x]];
    if (room && room.bedroom) {
      R(c, x - 1, y - 10, 4, 24, room.bedroom);
      R(c, x + 29, y - 10, 4, 24, room.bedroom);
      R(c, x - 1, y - 10, 34, 2, S(room.bedroom, -0.3));
    }
  }
}

export function drawDoor(c, x, y, d) {
  R(c, x - 1, y - 7, 18, 23, '#3e2a1c');
  R(c, x - 1, y - 7, 18, 1, '#5a3d28');
  if (!d.open) {
    R(c, x + 1, y - 5, 14, 21, '#6a4529');
    R(c, x + 2, y - 4, 12, 19, '#8a5c38');
    R(c, x + 3, y - 2, 10, 6, '#7a5030');
    R(c, x + 3, y + 6, 10, 7, '#7a5030');
    R(c, x + 3, y - 2, 10, 1, '#9b6c45');
    R(c, x + 3, y + 6, 10, 1, '#9b6c45');
    R(c, x + 11, y + 4, 2, 2, '#e2c46a');
    R(c, x + 6, y - 4, 4, 2, '#d8b45a');
    if (d.locked) R(c, x + 12, y + 7, 1, 2, '#1a1210');
  } else {
    c.fillStyle = 'rgba(12,8,16,0.45)';
    c.fillRect(x + 1, y - 5, 14, 21);
    R(c, x + 1, y - 5, 3, 21, '#8a5c38');
    R(c, x + 1, y - 5, 1, 21, '#6a4529');
  }
}
