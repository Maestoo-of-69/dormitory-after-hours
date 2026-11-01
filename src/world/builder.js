// Turns a floor definition (room rectangles, doors, windows) into a tile grid.
// Walls are generated automatically around every floor tile, so layouts stay
// easy to edit: move a room rectangle and its walls follow.
export const T_VOID = 0;
export const T_WALL = 1;
export const T_FLOOR = 2;

export const F_WINDOW = 1;
export const F_STAIRS = 2;
export const F_DOOR = 4;

export function buildLayout(def) {
  const { w, h } = def;
  const n = w * h;
  const tile = new Uint8Array(n);
  const flags = new Uint8Array(n);
  const room = new Int16Array(n).fill(-1);
  const ftype = new Array(n).fill('');
  const at = (x, y) => y * w + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const carve = (x, y, f, ri = -1) => {
    const i = at(x, y);
    tile[i] = T_FLOOR;
    ftype[i] = f;
    room[i] = ri;
  };
  const fill = (r, f, ri) => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, f, ri);
  };

  def.rooms.forEach((r, ri) => fill(r, r.floor, ri));
  (def.openings || []).forEach((o) => fill(o, o.floor, -1));

  // Every empty tile touching a floor tile (8-neighbourhood) becomes wall.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (tile[at(x, y)] !== T_VOID) continue;
      let near = false;
      for (let dy = -1; dy <= 1 && !near; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (inb(x + dx, y + dy) && tile[at(x + dx, y + dy)] === T_FLOOR) near = true;
        }
      }
      if (near) tile[at(x, y)] = T_WALL;
    }
  }
  // North walls get a second row so they read as a wall face with a top (3/4 view).
  for (let y = 1; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      if (tile[at(x, y)] === T_WALL && tile[at(x, y + 1)] === T_FLOOR && tile[at(x, y - 1)] === T_VOID) {
        tile[at(x, y - 1)] = T_WALL;
      }
    }
  }

  const doorAt = new Array(n).fill(null);
  const doors = (def.doors || []).map((d) => {
    const below = inb(d.x, d.y + 1) && tile[at(d.x, d.y + 1)] === T_FLOOR;
    const ft = below ? ftype[at(d.x, d.y + 1)] : ftype[at(d.x, d.y - 1)] || '.';
    carve(d.x, d.y, ft);
    flags[at(d.x, d.y)] |= F_DOOR;
    // Carve a passage through the (up to 2-tile) wall on either side of the door.
    for (const s of [-1, 1]) {
      const path = [];
      let y = d.y + s;
      while (inb(d.x, y) && tile[at(d.x, y)] === T_WALL && path.length < 3) {
        path.push(y);
        y += s;
      }
      if (inb(d.x, y) && tile[at(d.x, y)] === T_FLOOR) {
        const f2 = ftype[at(d.x, y)];
        path.forEach((py) => carve(d.x, py, f2));
      }
    }
    const door = { id: d.id, tx: d.x, ty: d.y, open: !!d.open, locked: !!d.locked, key: d.key || null };
    doorAt[at(d.x, d.y)] = door;
    return door;
  });

  (def.windows || []).forEach((wn) => {
    flags[at(wn.x, wn.y)] |= F_WINDOW;
    flags[at(wn.x + 1, wn.y)] |= F_WINDOW;
  });
  if (def.stairs) {
    const s = def.stairs;
    for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) flags[at(x, y)] |= F_STAIRS;
  }

  return { w, h, tile, flags, room, ftype, doors, doorAt };
}
