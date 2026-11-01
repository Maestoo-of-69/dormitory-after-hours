// Runtime world: both floors with their objects, plus serialisable state
// (doors, room lights, object states). Pure data — no DOM access here.
import { TILE } from '../config.js';
import { buildLayout } from './builder.js';
import { TYPES, ACT_LABELS } from './types.js';
import { FLOOR1 } from './floor1.js';
import { FLOOR2 } from './floor2.js';

const FLOOR_DEFS = [FLOOR1, FLOOR2];

function makeObject(d, floorId, rooms, layout) {
  const T = TYPES[d.t];
  if (!T) throw new Error(`Unknown object type "${d.t}"`);
  const fw = d.w ?? T.fw;
  const fh = d.h ?? T.fh;
  const px = d.x * TILE + (d.ox || 0);
  const py = d.y * TILE + (d.oy || 0);
  const o = {
    ...d,
    id: d.id || `${floorId}_${d.t}_${d.x}_${d.y}`,
    T, fw, fh, px, py, pw: fw * TILE, ph: fh * TILE,
    state: { ...(d.state || {}) },
    label: d.label || T.label || ACT_LABELS[d.act] || 'Осмотреть',
  };
  const layer = T.layer || 'y';
  o.layer = layer;
  if (layer === 'y' && T.solid !== null) {
    const s = T.solid || [0, 0, o.pw, o.ph];
    o.solid = { x: px + s[0], y: py + s[1], w: s[2], h: s[3] };
  }
  const ir = T.irect || (layer === 'wall' ? [0, 6, o.pw, 16] : [0, 0, o.pw, o.ph]);
  o.irect = { x: px + ir[0], y: py + ir[1], w: ir[2], h: ir[3] };
  if (d.act === 'switch' || layer === 'wall') {
    const ri = layout.room[(d.y + 1) * layout.w + d.x];
    o.room = ri >= 0 ? rooms[ri] : null;
  }
  return o;
}

function createFloor(def) {
  const layout = buildLayout(def);
  const rooms = def.rooms.map((r, i) => ({
    ...r, index: i, px: r.x * TILE, py: r.y * TILE, pw: r.w * TILE, ph: r.h * TILE, lightOn: r.light === true,
  }));
  const defs = [...def.objects, ...(def.windows || []).map((w) => ({ t: 'windowspot', x: w.x, y: w.y, act: 'window' }))];
  const objects = defs.map((d) => makeObject(d, def.id, rooms, layout));
  return {
    ...layout,
    id: def.id,
    name: def.name,
    def,
    rooms,
    objects,
    solids: objects.filter((o) => o.solid).map((o) => o.solid),
    pickups: (def.pickups || []).map((p) => ({ ...p, px: p.x * TILE, py: p.y * TILE, taken: false })),
    stairs: def.stairs || null,
    lamps: def.lamps || [],
    staticCanvas: null,
  };
}

export class World {
  constructor() {
    this.floors = {};
    for (const def of FLOOR_DEFS) this.floors[def.id] = createFloor(def);
    this.currentId = 'f2';
  }

  get floor() {
    return this.floors[this.currentId];
  }

  *allObjects() {
    for (const f of Object.values(this.floors)) yield* f.objects;
  }

  object(id) {
    for (const o of this.allObjects()) if (o.id === id) return o;
    return null;
  }

  door(id) {
    for (const f of Object.values(this.floors)) for (const d of f.doors) if (d.id === id) return d;
    return null;
  }

  room(id) {
    for (const f of Object.values(this.floors)) for (const r of f.rooms) if (r.id === id) return r;
    return null;
  }

  roomAt(floor, x, y) {
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= floor.w || ty >= floor.h) return null;
    const ri = floor.room[ty * floor.w + tx];
    return ri >= 0 ? floor.rooms[ri] : null;
  }

  serialize() {
    const doors = {};
    const lights = {};
    const objs = {};
    const pickups = [];
    for (const f of Object.values(this.floors)) {
      f.doors.forEach((d) => (doors[d.id] = { open: d.open, locked: d.locked }));
      f.rooms.forEach((r) => (lights[r.id] = r.lightOn));
      f.pickups.forEach((p) => p.taken && pickups.push(p.item));
      f.objects.forEach((o) => {
        if (Object.keys(o.state).length) objs[o.id] = { ...o.state };
      });
    }
    return { doors, lights, objs, pickups };
  }

  restore(s) {
    if (!s) return;
    for (const f of Object.values(this.floors)) {
      f.doors.forEach((d) => {
        const v = s.doors && s.doors[d.id];
        if (v) {
          d.open = !!v.open;
          d.locked = !!v.locked;
        }
      });
      f.rooms.forEach((r) => {
        if (s.lights && typeof s.lights[r.id] === 'boolean') r.lightOn = s.lights[r.id];
      });
      f.pickups.forEach((p) => (p.taken = !!(s.pickups && s.pickups.includes(p.item))));
      f.objects.forEach((o) => {
        const v = s.objs && s.objs[o.id];
        if (v && typeof v === 'object') o.state = { ...o.state, ...v };
        // Timed animations never resume mid-way after a reload.
        ['spin', 'boil', 'beep', 'drop', 'bubble'].forEach((k) => delete o.state[k]);
      });
    }
  }
}
