import { TILE, HITBOX } from '../config.js';
import { T_FLOOR } from '../world/builder.js';

export function tileSolid(floor, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= floor.w || ty >= floor.h) return true;
  const i = ty * floor.w + tx;
  if (floor.tile[i] !== T_FLOOR) return true;
  const door = floor.doorAt[i];
  return !!door && !door.open;
}

export function rectBlocked(floor, x, y, w, h) {
  const x0 = Math.floor(x / TILE);
  const x1 = Math.floor((x + w - 0.01) / TILE);
  const y0 = Math.floor(y / TILE);
  const y1 = Math.floor((y + h - 0.01) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) if (tileSolid(floor, tx, ty)) return true;
  }
  for (const s of floor.solids) {
    if (x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y) return true;
  }
  return false;
}

// A body's position is its feet; the hitbox is a small box around them.
export const blockedAt = (floor, x, y) => rectBlocked(floor, x - HITBOX.w / 2, y - HITBOX.h, HITBOX.w, HITBOX.h);

// When a straight move is blocked, slide sideways a little so doorways and corners feel forgiving.
function nudge(floor, b, dx, dy) {
  const step = Math.max(Math.abs(dx), Math.abs(dy));
  for (let off = 1; off <= 6; off++) {
    for (const s of [1, -1]) {
      const m = s * Math.min(step, off);
      if (dx) {
        if (!blockedAt(floor, b.x + dx, b.y + s * off) && !blockedAt(floor, b.x, b.y + m)) {
          b.y += m;
          return true;
        }
      } else if (!blockedAt(floor, b.x + s * off, b.y + dy) && !blockedAt(floor, b.x + m, b.y)) {
        b.x += m;
        return true;
      }
    }
  }
  return false;
}

// Axis-separated movement: each axis is tried on its own, so walls let you slide along them.
export function moveBody(floor, b, dx, dy) {
  let moved = false;
  if (dx) {
    if (!blockedAt(floor, b.x + dx, b.y)) {
      b.x += dx;
      moved = true;
    } else if (!dy) moved = nudge(floor, b, dx, 0);
  }
  if (dy) {
    if (!blockedAt(floor, b.x, b.y + dy)) {
      b.y += dy;
      moved = true;
    } else if (!dx) moved = nudge(floor, b, 0, dy);
  }
  return moved;
}

// Spiral search for the nearest free spot; guarantees nobody spawns inside a wall.
export function findFree(floor, x, y, maxR = 96) {
  if (!blockedAt(floor, x, y)) return { x, y };
  for (let r = 2; r <= maxR; r += 2) {
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      const nx = Math.round(x + Math.cos(ang) * r);
      const ny = Math.round(y + Math.sin(ang) * r);
      if (!blockedAt(floor, nx, ny)) return { x: nx, y: ny };
    }
  }
  return { x, y };
}
