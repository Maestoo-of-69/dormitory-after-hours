// Finds what the leader is facing: the nearest door, pickup or interactive object.
import { TILE, INTERACT_RANGE } from '../config.js';
import { rectDist } from '../core/util.js';

const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

export function findTarget(floor, ch) {
  const [dx, dy] = DIRV[ch.dir];
  const px = ch.x + dx * 9;
  const py = ch.y - 3 + dy * 9;
  let best = null;
  let bestD = INTERACT_RANGE + 0.001;
  const consider = (d, t) => {
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  };
  for (const p of floor.pickups) {
    if (p.taken) continue;
    const d = rectDist(px, py, { x: p.px - 4, y: p.py - 4, w: 8, h: 8 }) - 2;
    consider(d, { kind: 'pickup', p, mx: p.px, my: p.py - 12, label: 'Подобрать' });
  }
  for (const door of floor.doors) {
    const r = { x: door.tx * TILE, y: door.ty * TILE - 10, w: 16, h: 36 };
    const label = door.locked ? 'Дверь' : door.open ? 'Закрыть' : 'Открыть';
    consider(rectDist(px, py, r), { kind: 'door', door, mx: door.tx * TILE + 8, my: door.ty * TILE - 8, label });
  }
  for (const o of floor.objects) {
    if (!o.act) continue;
    const d = rectDist(px, py, o.irect);
    if (d >= bestD) continue;
    const my = o.layer === 'wall' ? o.py : o.py - (o.T.fh > 1 ? 4 : 10);
    consider(d, { kind: 'object', obj: o, mx: o.irect.x + o.irect.w / 2, my, label: o.label });
  }
  return best;
}
