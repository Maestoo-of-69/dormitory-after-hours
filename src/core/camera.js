import { VIEW_W, VIEW_H } from '../config.js';
import { clamp } from './util.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  // Smoothly follows a point; clamps to the map, or centres maps smaller than the view.
  follow(tx, ty, mapW, mapH, dt, snap = false) {
    let gx = tx - VIEW_W / 2;
    let gy = ty - VIEW_H / 2 - 8;
    gx = mapW > VIEW_W ? clamp(gx, 0, mapW - VIEW_W) : (mapW - VIEW_W) / 2;
    gy = mapH > VIEW_H ? clamp(gy, 0, mapH - VIEW_H) : (mapH - VIEW_H) / 2;
    if (snap) {
      this.x = gx;
      this.y = gy;
      return;
    }
    const k = 1 - Math.exp(-dt * 7);
    this.x += (gx - this.x) * k;
    this.y += (gy - this.y) * k;
  }
}
