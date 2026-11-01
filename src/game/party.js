// The two characters: the leader is player-controlled, the follower walks
// along the leader's breadcrumb trail and teleports out of a dead end if stuck.
import { WALK_SPEED, RUN_SPEED, FOLLOW_DIST } from '../config.js';
import { moveBody, blockedAt, findFree } from '../core/collision.js';
import { dist } from '../core/util.js';

const TRAIL_SPACING = 4;
const TRAIL_MAX = 300;
const STUCK_SECONDS = 1.1;
const TELEPORT_DIST = 220;

export class Character {
  constructor(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.dir = 'down';
    this.moving = false;
    this.speed = 0;
    this.anim = 0;
    this.sitting = null;
    this.lastPhase = -1;
  }

  frame(t) {
    if (this.moving) return 2 + (Math.floor(this.anim) % 4);
    return Math.floor(t * 1.6 + (this.id === 'angelina' ? 0.5 : 0)) % 2;
  }

  // Advances the walk cycle; returns true on the frames where a foot lands.
  step(dt, speed) {
    this.anim += dt * (speed / 60) * 6.5;
    const phase = Math.floor(this.anim) % 4;
    const landed = phase !== this.lastPhase && (phase === 0 || phase === 2);
    this.lastPhase = phase;
    return landed;
  }
}

export function faceToward(ch, dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) ch.dir = dx < 0 ? 'left' : 'right';
  else if (dy) ch.dir = dy < 0 ? 'up' : 'down';
}

export class Party {
  constructor() {
    this.chars = { vlad: new Character('vlad'), angelina: new Character('angelina') };
    this.activeId = 'vlad';
    this.trail = [];
    this.stuckT = 0;
  }

  get leader() {
    return this.chars[this.activeId];
  }

  get follower() {
    return this.chars[this.activeId === 'vlad' ? 'angelina' : 'vlad'];
  }

  resetTrail() {
    this.trail = [{ x: this.leader.x, y: this.leader.y }];
    this.stuckT = 0;
  }

  recordTrail() {
    const L = this.leader;
    const last = this.trail[this.trail.length - 1];
    if (!last || dist(L.x, L.y, last.x, last.y) >= TRAIL_SPACING) {
      this.trail.push({ x: L.x, y: L.y });
      if (this.trail.length > TRAIL_MAX) this.trail.shift();
    }
  }

  // Path length from the follower, through the trail, to the leader.
  pathLength() {
    const F = this.follower;
    const L = this.leader;
    const tr = this.trail;
    let total = dist(F.x, F.y, tr[0].x, tr[0].y);
    for (let i = 1; i < tr.length; i++) total += dist(tr[i - 1].x, tr[i - 1].y, tr[i].x, tr[i].y);
    return total + dist(tr[tr.length - 1].x, tr[tr.length - 1].y, L.x, L.y);
  }

  // Places the follower on the trail roughly FOLLOW_DIST behind the leader.
  teleportFollower(floor) {
    const F = this.follower;
    const L = this.leader;
    const tr = this.trail;
    let acc = 0;
    for (let i = tr.length - 1; i >= 0; i--) {
      const next = i === tr.length - 1 ? L : tr[i + 1];
      acc += dist(tr[i].x, tr[i].y, next.x, next.y);
      if (acc >= FOLLOW_DIST && !blockedAt(floor, tr[i].x, tr[i].y)) {
        F.x = tr[i].x;
        F.y = tr[i].y;
        this.trail = tr.slice(i);
        this.stuckT = 0;
        return;
      }
    }
    const p = findFree(floor, L.x + 14, L.y);
    F.x = p.x;
    F.y = p.y;
    this.resetTrail();
  }

  // Returns true when a footstep should be played for the follower.
  updateFollower(floor, dt, standUp) {
    const F = this.follower;
    const L = this.leader;
    if (F.sitting) {
      if (dist(F.x, F.y, L.x, L.y) > 64) standUp(F);
      else {
        F.moving = false;
        return false;
      }
    }
    if (!this.trail.length) this.resetTrail();
    const tr = this.trail;
    while (tr.length > 1 && dist(tr[0].x, tr[0].y, F.x, F.y) < 3) tr.shift();
    const straight = dist(F.x, F.y, L.x, L.y);
    if (straight > TELEPORT_DIST) {
      this.teleportFollower(floor);
      return false;
    }
    const total = this.pathLength();
    if (total <= FOLLOW_DIST + 2 || straight < 14) {
      F.moving = false;
      this.stuckT = 0;
      if (straight < 9) {
        const ax = F.x - L.x || 1;
        const ay = F.y - L.y;
        const len = Math.hypot(ax, ay) || 1;
        moveBody(floor, F, (ax / len) * 30 * dt, (ay / len) * 30 * dt);
      }
      faceToward(F, L.x - F.x, L.y - F.y);
      return false;
    }
    const target = tr[0];
    const dx = target.x - F.x;
    const dy = target.y - F.y;
    const d = Math.hypot(dx, dy);
    const speed = total > 60 ? RUN_SPEED * 1.05 : Math.max(WALK_SPEED, L.moving ? L.speed : WALK_SPEED);
    const step = Math.min(speed * dt, d);
    const bx = F.x;
    const by = F.y;
    if (d > 0.01) moveBody(floor, F, (dx / d) * step, (dy / d) * step);
    const moved = dist(bx, by, F.x, F.y);
    if (moved < step * 0.3) this.stuckT += dt;
    else this.stuckT = Math.max(0, this.stuckT - dt);
    if (this.stuckT > STUCK_SECONDS) {
      this.teleportFollower(floor);
      return false;
    }
    F.moving = moved > 0.05;
    F.speed = speed;
    faceToward(F, dx, dy);
    return F.moving && F.step(dt, speed);
  }
}
