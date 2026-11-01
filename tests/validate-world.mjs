// World sanity checks, runnable without a browser:  node tests/validate-world.mjs
// - spawn / stair-arrival points are not inside walls or furniture
// - every room is reachable (doors treated as open)
// - every interactive object, pickup and door can actually be reached and used
import { World } from '../src/world/world.js';
import { blockedAt } from '../src/core/collision.js';
import { TILE, INTERACT_RANGE } from '../src/config.js';
import { rectDist } from '../src/core/util.js';
import { FLOOR2 } from '../src/world/floor2.js';

const world = new World();
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error('FAIL', msg);
};

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

// Flood fill over feet positions on a 4px grid.
function reachable(floor, sx, sy) {
  const seen = new Set([`${sx},${sy}`]);
  const q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of DIRS) {
      const nx = x + dx * 4;
      const ny = y + dy * 4;
      const k = `${nx},${ny}`;
      if (seen.has(k) || blockedAt(floor, nx, ny)) continue;
      seen.add(k);
      q.push([nx, ny]);
    }
  }
  return [...seen].map((s) => s.split(',').map(Number));
}

const origins = { f2: FLOOR2.start.vlad, f1: world.floors.f2.def.stairs.arrive };

for (const floor of Object.values(world.floors)) {
  floor.doors.forEach((d) => (d.open = true));
  const o = origins[floor.id];
  const sx = Math.round(o.x / 4) * 4;
  const sy = Math.round(o.y / 4) * 4;
  if (blockedAt(floor, sx, sy)) fail(`${floor.id}: origin ${sx},${sy} is blocked`);
  const cells = reachable(floor, sx, sy);
  console.log(`${floor.id}: ${cells.length} reachable sample points`);

  for (const r of floor.rooms) {
    if (r.id === 'r204') continue; // locked for good
    const inside = cells.some(([x, y]) => x > r.px && x < r.px + r.pw && y > r.py && y < r.py + r.ph);
    if (!inside) fail(`${floor.id}: room ${r.id} unreachable`);
  }
  const s = floor.def.stairs;
  const onStairs = cells.some(([x, y]) => x >= s.x * TILE && x < (s.x + s.w) * TILE && y >= s.y * TILE && y < (s.y + s.h) * TILE);
  if (!onStairs) fail(`${floor.id}: stairs unreachable`);

  const canInteract = (rect) =>
    cells.some(([x, y]) => DIRS.some(([dx, dy]) => rectDist(x + dx * 9, y - 3 + dy * 9, rect) <= INTERACT_RANGE));
  for (const ob of floor.objects) {
    if (!ob.act || (ob.room && ob.room.id === 'r204')) continue;
    if (!canInteract(ob.irect)) fail(`${floor.id}: cannot interact with ${ob.id} (${ob.act})`);
  }
  for (const p of floor.pickups) {
    if (!canInteract({ x: p.px - 4, y: p.py - 4, w: 8, h: 8 })) fail(`${floor.id}: pickup ${p.item} unreachable`);
  }
  for (const d of floor.doors) {
    if (!canInteract({ x: d.tx * TILE, y: d.ty * TILE - 10, w: 16, h: 36 })) fail(`${floor.id}: door ${d.id} unreachable`);
  }
}

// Arrival points must be free and not on the destination's stairs trigger.
for (const floor of Object.values(world.floors)) {
  const s = floor.def.stairs;
  const dest = world.floors[s.to];
  const a = s.arrive;
  if (blockedAt(dest, a.x, a.y)) fail(`arrival on ${dest.id} at ${a.x},${a.y} blocked`);
  const ds = dest.def.stairs;
  const tx = Math.floor(a.x / TILE);
  const ty = Math.floor(a.y / TILE);
  if (tx >= ds.x && tx < ds.x + ds.w && ty >= ds.y && ty < ds.y + ds.h) fail(`arrival on ${dest.id} is on the stairs`);
}
for (const who of ['vlad', 'angelina']) {
  const p = FLOOR2.start[who];
  if (blockedAt(world.floors.f2, p.x, p.y)) fail(`start position of ${who} blocked`);
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll world checks passed');
