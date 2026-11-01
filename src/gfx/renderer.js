// Draws one frame: static tiles -> windows/doors/wall decor -> y-sorted objects
// and characters -> lighting -> fade. Everything is in 730x270 view pixels.
import { VIEW_W, VIEW_H, TILE } from '../config.js';
import { lerp, rect as R } from '../core/util.js';
import { renderStatic, drawWindows, drawDoor } from './tiles.js';
import { sheet, DIRS, FW, FH, FRAME_SIT } from './characters.js';
import { icon } from './icons.js';

const MARGIN = 48;
const DARKNESS = { on: 0.1, dim: 0.34, off: 0.62 };

function visible(x, y, w, h) {
  return x + w > -MARGIN && y + h > -MARGIN && x < VIEW_W + MARGIN && y < VIEW_H + MARGIN;
}

function roomBase(room) {
  if (room.light === 'dim') return DARKNESS.dim;
  return room.lightOn ? DARKNESS.on : DARKNESS.off;
}

export class Renderer {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    const lc = document.createElement('canvas');
    lc.width = VIEW_W;
    lc.height = VIEW_H;
    this.lctx = lc.getContext('2d');
    this.lcanvas = lc;
    this.dark = new Map();
  }

  draw(g, t, dt) {
    const ctx = this.ctx;
    const f = g.world.floor;
    const cx = Math.round(g.cam.x);
    const cy = Math.round(g.cam.y);
    ctx.fillStyle = '#0b0a10';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (!f.staticCanvas) f.staticCanvas = renderStatic(f);
    ctx.drawImage(f.staticCanvas, -cx, -cy);
    drawWindows(ctx, f, cx, cy, t);

    for (const o of f.objects) {
      if (o.layer === 'floor' && visible(o.px - cx, o.py - cy, o.pw, o.ph)) o.T.draw(ctx, o.px - cx, o.py - cy, o, t, g);
    }
    for (const d of f.doors) drawDoor(ctx, d.tx * TILE - cx, d.ty * TILE - cy, d);
    for (const o of f.objects) {
      if (o.layer === 'wall' && visible(o.px - cx, o.py - cy, o.pw, o.ph)) o.T.draw(ctx, o.px - cx, o.py - cy, o, t, g);
    }

    const list = [];
    for (const o of f.objects) {
      if (o.layer !== 'y' || !visible(o.px - cx, o.py - cy - 20, o.pw, o.ph + 20)) continue;
      list.push({ y: o.py + o.ph, draw: () => o.T.draw(ctx, o.px - cx, o.py - cy, o, t, g) });
    }
    for (const p of f.pickups) {
      if (p.taken) continue;
      list.push({ y: p.py + 6, draw: () => this.drawPickup(p, cx, cy, t) });
    }
    if (g.state !== 'menu') {
      for (const ch of Object.values(g.party.chars)) {
        list.push({ y: ch.y, draw: () => this.drawCharacter(ch, cx, cy, t) });
      }
    }
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.draw();

    if (g.target && g.state === 'play' && !g.dlg.active) this.drawMarker(g.target, cx, cy, t);
    this.drawLighting(g, f, cx, cy, t, dt);
    if (g.fade) {
      const a = Math.round(g.fade.alpha * 6) / 6;
      ctx.fillStyle = `rgba(6,5,10,${a})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  drawCharacter(ch, cx, cy, t) {
    const ctx = this.ctx;
    const x = Math.round(ch.x) - cx;
    const y = Math.round(ch.y) - cy;
    if (!ch.sitting) {
      ctx.fillStyle = 'rgba(10,6,20,0.35)';
      ctx.fillRect(x - 4, y - 2, 8, 3);
      ctx.fillRect(x - 5, y - 1, 10, 1);
    }
    const frame = ch.sitting ? FRAME_SIT : ch.frame(t);
    const dir = ch.sitting ? 'up' : ch.dir;
    ctx.drawImage(sheet(ch.id), frame * FW, DIRS.indexOf(dir) * FH, FW, FH, x - 8, y - 23, FW, FH);
  }

  drawPickup(p, cx, cy, t) {
    const ctx = this.ctx;
    const x = Math.round(p.px) - cx;
    const y = Math.round(p.py) - cy + Math.round(Math.sin(t * 3 + p.px) * 1);
    ctx.fillStyle = 'rgba(10,6,20,0.3)';
    ctx.fillRect(x - 4, Math.round(p.py) - cy + 5, 8, 2);
    ctx.drawImage(icon(p.item).canvas, x - 8, y - 10);
    if ((t * 1.5) % 2 < 0.35) {
      R(ctx, x + 4, y - 11, 1, 3, '#fff8d0');
      R(ctx, x + 3, y - 10, 3, 1, '#fff8d0');
    }
  }

  drawMarker(target, cx, cy, t) {
    const ctx = this.ctx;
    const x = Math.round(target.mx) - cx;
    const y = Math.round(target.my) - cy - 4 + (Math.floor(t * 4) % 2);
    R(ctx, x - 3, y - 4, 7, 2, '#1a1220');
    R(ctx, x - 2, y - 2, 5, 2, '#1a1220');
    R(ctx, x - 1, y, 3, 2, '#1a1220');
    R(ctx, x - 2, y - 4, 5, 1, '#ffd27a');
    R(ctx, x - 1, y - 3, 3, 1, '#ffd27a');
    R(ctx, x - 1, y - 2, 3, 1, '#ffd27a');
    R(ctx, x, y - 1, 1, 1, '#ffd27a');
  }

  collectLights(g, f, cx, cy, t) {
    const lights = [];
    const add = (l) => {
      if (visible(l.x - cx - l.r, l.y - cy - l.r, l.r * 2, l.r * 2)) lights.push(l);
    };
    for (const o of f.objects) if (o.T.light) o.T.light(o, t).forEach(add);
    for (const lp of f.lamps) add({ x: lp.x, y: lp.y, r: 56, s: 0.5, col: '255,214,150', g: 0.1 });
    for (const r of f.rooms) {
      if (r.lightOn && r.light !== 'dim') {
        add({ x: r.px + r.pw / 2, y: r.py + r.ph / 2, r: Math.max(r.pw, r.ph) * 0.75, s: 0.35, col: '255,210,150', g: 0.07 });
      }
    }
    const cur = g.currentRoom;
    if (g.state !== 'menu' && cur && !cur.lightOn && cur.light !== 'dim') {
      const L = g.party.leader;
      add({ x: L.x, y: L.y - 10, r: 40, s: 0.5, col: '200,220,255', g: 0.05 });
    }
    return lights;
  }

  drawLighting(g, f, cx, cy, t, dt) {
    const L = this.lctx;
    const ctx = this.ctx;
    L.globalCompositeOperation = 'source-over';
    L.clearRect(0, 0, VIEW_W, VIEW_H);
    L.fillStyle = 'rgba(6,6,16,0.82)';
    L.fillRect(0, 0, VIEW_W, VIEW_H);
    const cur = g.currentRoom;
    const k = 1 - Math.exp(-dt * 5);
    const ordered = [...f.rooms].sort((a, b) => (b.corridor ? 1 : 0) - (a.corridor ? 1 : 0));
    for (const room of ordered) {
      const away = g.state === 'play' && cur && room !== cur ? 0.2 : 0;
      const target = Math.min(0.85, roomBase(room) + away);
      const key = f.id + room.id;
      const prev = this.dark.has(key) ? this.dark.get(key) : target;
      const a = lerp(prev, target, k);
      this.dark.set(key, a);
      const x = room.px - TILE - cx;
      const y = room.py - 2 * TILE - cy;
      const w = room.pw + 2 * TILE;
      const h = room.ph + 3 * TILE;
      if (!visible(x, y, w, h)) continue;
      L.clearRect(x, y, w, h);
      L.fillStyle = `rgba(8,10,28,${a.toFixed(3)})`;
      L.fillRect(x, y, w, h);
    }
    const lights = this.collectLights(g, f, cx, cy, t);
    L.globalCompositeOperation = 'destination-out';
    for (const l of lights) {
      const x = l.x - cx;
      const y = l.y - cy;
      const gr = L.createRadialGradient(x, y, 0, x, y, l.r);
      gr.addColorStop(0, `rgba(0,0,0,${l.s})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      L.fillStyle = gr;
      L.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
    }
    ctx.drawImage(this.lcanvas, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      if (!l.g) continue;
      const x = l.x - cx;
      const y = l.y - cy;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, l.r);
      gr.addColorStop(0, `rgba(${l.col},${l.g})`);
      gr.addColorStop(1, `rgba(${l.col},0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
