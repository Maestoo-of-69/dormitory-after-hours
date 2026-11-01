// Entry point: owns the game state and wires world, party, rendering, UI, audio and saves.
import {
  VIEW_W, VIEW_H, STAGE_W, STAGE_H, PIXEL_SCALE, TILE, WALK_SPEED, RUN_SPEED,
  AUTOSAVE_SECONDS, START_MINUTES, REAL_SECONDS_PER_GAME_MINUTE,
} from './config.js';
import { initInput, Input } from './core/input.js';
import { Camera } from './core/camera.js';
import { moveBody, findFree } from './core/collision.js';
import { loadSave, writeSave, loadSettings, saveSettings } from './core/save.js';
import { World } from './world/world.js';
import { F_STAIRS } from './world/builder.js';
import { FLOOR2 } from './world/floor2.js';
import { Party } from './game/party.js';
import { findTarget } from './game/interact.js';
import { Dialogue, N } from './game/dialogue.js';
import { ACTIONS, LOCKED, INTRO, SOFA_TALK, ALL_FOUND } from './game/actions.js';
import { ITEMS, ITEM_ORDER } from './game/items.js';
import { Renderer } from './gfx/renderer.js';
import { buildCharacterSheets, portraitURL } from './gfx/characters.js';
import { icon } from './gfx/icons.js';
import { AudioSys } from './audio/audio.js';
import { HUD } from './ui/hud.js';
import { Menus } from './ui/menus.js';

const BLIP_PITCH = { vlad: 300, angelina: 440, narr: 520, cat: 720 };
const PICKUP_LINES = {
  student_id: 'На полу студенческий билет. Какой-то Костя К. Надо бы отнести на вахту.',
  headphones: 'На парте забытые наушники. Кто-то «слушал» здесь лекции.',
};
const TIMED_STATES = ['spin', 'boil', 'beep', 'drop', 'bubble'];

class Game {
  constructor() {
    this.settings = loadSettings();
    this.audio = new AudioSys(this.settings);
    this.world = new World();
    this.party = new Party();
    this.cam = new Camera();
    this.renderer = new Renderer(document.getElementById('game'));
    this.dlg = new Dialogue((who) => this.audio.sfx('text', { pitch: BLIP_PITCH[who] }));
    this.hud = new HUD(portraitURL);
    this.menus = new Menus(this);
    this.portraitURL = portraitURL;
    this.state = 'menu';
    this.time = START_MINUTES;
    this.fade = null;
    this.target = null;
    this.currentRoom = null;
    this.saveTimer = 0;
    this.t = 0;
    this.resetProgress();
  }

  resetProgress() {
    this.inv = [];
    this.found = new Set();
    this.foundBy = {};
    this.flags = {};
    this.counters = {};
  }

  // ---------- API used by actions ----------
  get who() {
    return this.party.activeId;
  }

  inc(key) {
    this.counters[key] = (this.counters[key] || 0) + 1;
    return this.counters[key];
  }

  say(lines, onDone) {
    this.dlg.start(lines, onDone);
  }

  sfx(name) {
    this.audio.sfx(name);
  }

  has(id) {
    return this.inv.includes(id);
  }

  take(id) {
    this.inv = this.inv.filter((i) => i !== id);
  }

  give(id) {
    if (this.found.has(id) || !ITEMS[id]) return false;
    this.found.add(id);
    this.foundBy[id] = this.who;
    this.inv = [...this.inv, id];
    this.hud.toast(icon(id).url, 'Новая находка!', ITEMS[id].name);
    this.audio.sfx('pickup');
    if (this.found.size === ITEM_ORDER.length && !this.flags.allFound) {
      this.flags.allFound = true;
      setTimeout(() => this.hud.banner('Все находки собраны!'), 600);
      this.say(ALL_FOUND);
    }
    this.save();
    return true;
  }

  toggleLight(room) {
    room.lightOn = !room.lightOn;
    this.audio.sfx('click');
  }

  setMusic(on) {
    this.audio.radioOn = on;
    this.audio.apply();
  }

  timeStr() {
    const m = Math.floor(this.time) % (24 * 60);
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }

  seatsOf(o) {
    const n = o.fw >= 3 ? 2 : 1;
    return Array.from({ length: n }, (_, i) => ({ x: o.px + (n === 1 ? 8 : 12 + i * 24), y: o.py + 9 }));
  }

  sit(o, ch = this.party.leader) {
    const seats = this.seatsOf(o);
    const others = Object.values(this.party.chars).filter((c) => c !== ch && c.sitting && c.sitting.obj === o);
    const free = seats.map((s, i) => ({ ...s, i })).filter((s) => !others.some((c) => c.sitting.seat === s.i));
    if (!free.length) {
      this.say([N('Тут уже занято.')]);
      return;
    }
    free.sort((a, b) => Math.abs(a.x - ch.x) - Math.abs(b.x - ch.x));
    const seat = free[0];
    ch.sitting = { obj: o, seat: seat.i };
    ch.x = seat.x;
    ch.y = seat.y;
    ch.dir = 'up';
    ch.moving = false;
    const both = Object.values(this.party.chars).every((c) => c.sitting);
    if (both && !this.flags.sofaTalk) {
      this.flags.sofaTalk = true;
      const tv = this.world.object('tv');
      this.say(tv && tv.state.on ? [...SOFA_TALK, this.who === 'vlad' ? N('По телевизору мужик всё ещё плачет над щукой.') : N('По телевизору всё ещё идёт сериал из детства.')] : SOFA_TALK);
    }
  }

  standUp(ch) {
    if (!ch.sitting) return;
    const o = ch.sitting.obj;
    ch.sitting = null;
    const p = findFree(this.world.floor, ch.x, o.py - 3);
    ch.x = p.x;
    ch.y = p.y;
    ch.dir = 'down';
    if (ch === this.party.leader) this.party.resetTrail();
  }

  // ---------- Game flow ----------
  hasSave() {
    return !!loadSave();
  }

  saveSummary() {
    const s = loadSave();
    if (!s) return '';
    const n = Array.isArray(s.found) ? s.found.length : 0;
    return `${s.active === 'angelina' ? 'Анжелина' : 'Влад'} · находки ${n}/${ITEM_ORDER.length}`;
  }

  startPlay() {
    this.state = 'play';
    this.menus.closeAll();
    this.hud.show(true);
    const L = this.party.leader;
    this.cam.follow(L.x, L.y, this.world.floor.w * TILE, this.world.floor.h * TILE, 0, true);
    this.currentRoom = this.world.roomAt(this.world.floor, L.x, L.y - 2);
    if (this.currentRoom) this.hud.banner(this.currentRoom.name);
  }

  newGame(who) {
    this.world = new World();
    this.party = new Party();
    this.resetProgress();
    this.time = START_MINUTES;
    this.dlg = new Dialogue((w) => this.audio.sfx('text', { pitch: BLIP_PITCH[w] }));
    this.party.activeId = who;
    for (const id of ['vlad', 'angelina']) Object.assign(this.party.chars[id], FLOOR2.start[id]);
    this.party.resetTrail();
    this.startPlay();
    setTimeout(() => this.say(INTRO), 400);
    this.save();
  }

  continueGame() {
    const s = loadSave();
    if (!s || !this.applySave(s)) {
      this.hud.toast(icon('note').url, 'Ошибка', 'Сохранение повреждено');
      return;
    }
    this.startPlay();
    this.hud.toast(portraitURL(this.who), 'С возвращением!', `Сейчас ${this.timeStr()}`);
  }

  applySave(s) {
    try {
      const world = new World();
      if (!world.floors[s.floor]) return false;
      world.currentId = s.floor;
      world.restore(s.world);
      const party = new Party();
      party.activeId = s.active === 'angelina' ? 'angelina' : 'vlad';
      for (const id of ['vlad', 'angelina']) {
        const c = s.chars[id] || {};
        const ch = party.chars[id];
        const p = findFree(world.floor, Number(c.x) || FLOOR2.start[id].x, Number(c.y) || FLOOR2.start[id].y);
        ch.x = p.x;
        ch.y = p.y;
        ch.dir = ['up', 'down', 'left', 'right'].includes(c.dir) ? c.dir : 'down';
      }
      this.world = world;
      this.party = party;
      this.party.resetTrail();
      const known = (arr) => (Array.isArray(arr) ? arr.filter((i) => ITEMS[i]) : []);
      this.inv = known(s.inv);
      this.found = new Set(known(s.found));
      this.foundBy = s.foundBy && typeof s.foundBy === 'object' ? { ...s.foundBy } : {};
      this.flags = s.flags && typeof s.flags === 'object' ? { ...s.flags } : {};
      this.counters = s.counters && typeof s.counters === 'object' ? { ...s.counters } : {};
      this.time = Number.isFinite(s.time) ? s.time : START_MINUTES;
      this.dlg = new Dialogue((w) => this.audio.sfx('text', { pitch: BLIP_PITCH[w] }));
      return true;
    } catch (err) {
      console.warn('Could not load save:', err);
      return false;
    }
  }

  serialize() {
    const ch = (c) => ({ x: Math.round(c.x), y: Math.round(c.y), dir: c.dir });
    return {
      v: 1,
      floor: this.world.currentId,
      active: this.party.activeId,
      chars: { vlad: ch(this.party.chars.vlad), angelina: ch(this.party.chars.angelina) },
      inv: this.inv,
      found: [...this.found],
      foundBy: this.foundBy,
      flags: this.flags,
      counters: this.counters,
      time: this.time,
      world: this.world.serialize(),
    };
  }

  save(manual = false) {
    if (this.state !== 'play') return;
    const ok = writeSave(this.serialize());
    this.saveTimer = 0;
    if (manual) this.hud.toast(portraitURL(this.who), ok ? 'Игра сохранена' : 'Не удалось сохранить', ok ? this.timeStr() : 'localStorage недоступен');
  }

  toMainMenu() {
    this.save();
    this.state = 'menu';
    this.menus.closeAll();
    this.hud.show(false);
    this.hud.hideDialogue();
    this.dlg = new Dialogue((w) => this.audio.sfx('text', { pitch: BLIP_PITCH[w] }));
    this.world.currentId = 'f1';
    this.menus.open('main');
  }

  onMenusClosed() {
    this.save();
  }

  setSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.audio.apply();
    if (key === 'scale') resize(this.settings);
  }

  // ---------- Per-frame update ----------
  update(dt) {
    this.t += dt;
    if (Input.hit('KeyF')) toggleFullscreen();
    if (Input.hit('KeyM')) {
      this.setSetting('musicOn', !this.settings.musicOn);
      if (this.state === 'play') this.hud.toast(portraitURL(this.who), 'Музыка', this.settings.musicOn ? 'включена' : 'выключена');
      this.menus.render();
    }
    for (const o of this.world.allObjects()) {
      for (const k of TIMED_STATES) if (o.state[k] > 0) o.state[k] = Math.max(0, o.state[k] - dt);
      if (o.state.shift && !(o.state.spin > 0)) o.state.shift = 0;
    }
    if (this.state === 'menu') {
      this.menus.handle();
      const f = this.world.floor;
      const span = f.w * TILE - VIEW_W;
      this.cam.x = (Math.sin(this.t * 0.04) * 0.5 + 0.5) * span;
      this.cam.y = 15 * TILE - VIEW_H / 2;
      return;
    }
    if (this.menus.isOpen) {
      this.hud.hidePrompt();
      this.menus.handle();
      return;
    }
    this.updatePlay(dt);
  }

  updatePlay(dt) {
    const floor = this.world.floor;
    const party = this.party;
    const L = party.leader;

    if (this.fade) {
      const fd = this.fade;
      fd.t += dt;
      const half = fd.dur / 2;
      if (!fd.fired && fd.t >= half) {
        fd.fired = true;
        fd.mid();
      }
      fd.alpha = fd.t < half ? fd.t / half : Math.max(0, 1 - (fd.t - half) / half);
      if (fd.t >= fd.dur) this.fade = null;
      this.hud.hidePrompt();
      this.followCamera(dt);
      return;
    }

    if (this.dlg.active) {
      this.dlg.update(dt);
      if (Input.hit('Space', 'Enter', 'KeyE')) this.dlg.advance();
      if (this.dlg.active) this.hud.dialogue(this.dlg.line, this.dlg.visibleText, this.dlg.lineDone);
      else this.hud.hideDialogue();
      this.hud.hidePrompt();
      L.moving = false;
      party.follower.moving = false;
      this.followCamera(dt);
      return;
    }
    this.hud.hideDialogue();

    if (Input.hit('Escape')) {
      this.menus.open('pause');
      return;
    }
    if (Input.hit('KeyI')) {
      this.menus.open('inventory');
      return;
    }
    if (Input.hit('Tab')) this.switchCharacter();

    this.time += dt / REAL_SECONDS_PER_GAME_MINUTE;
    this.moveLeader(dt);
    if (party.updateFollower(floor, dt, (c) => this.standUp(c))) this.audio.sfx('step', { quiet: true });

    const ti = Math.floor(L.y / TILE) * floor.w + Math.floor(L.x / TILE);
    if (floor.stairs && floor.flags[ti] & F_STAIRS && !L.sitting) {
      const s = floor.stairs;
      this.audio.sfx('stairs');
      this.fade = { t: 0, dur: 0.8, alpha: 0, fired: false, mid: () => this.changeFloor(s.to, s.arrive) };
    }

    const room = this.world.roomAt(floor, L.x, L.y - 2);
    if (room && room !== this.currentRoom) {
      this.currentRoom = room;
      this.hud.banner(room.name);
    }

    this.target = L.sitting ? null : findTarget(floor, L);
    if (Input.hit('KeyE')) {
      if (L.sitting) this.standUp(L);
      else if (this.target) this.interact(this.target);
    }
    this.followCamera(dt);

    if (this.target && !this.dlg.active) {
      this.hud.prompt(this.target.label, this.target.mx - this.cam.x, this.target.my - this.cam.y - 6);
    } else this.hud.hidePrompt();

    this.hud.update({
      active: this.who,
      other: party.follower.id,
      room: this.currentRoom ? this.currentRoom.name : floor.name,
      sub: `${floor.name} · ${this.timeStr()}`,
      found: this.found.size,
      total: ITEM_ORDER.length,
    });

    this.saveTimer += dt;
    if (this.saveTimer > AUTOSAVE_SECONDS) this.save();
  }

  moveLeader(dt) {
    const L = this.party.leader;
    const ax = Input.axis();
    const len = Math.hypot(ax.x, ax.y);
    if (!len) {
      L.moving = false;
      return;
    }
    if (L.sitting) this.standUp(L);
    const sp = Input.run() ? RUN_SPEED : WALK_SPEED;
    // Normalising the input vector keeps diagonal speed equal to straight speed.
    moveBody(this.world.floor, L, (ax.x / len) * sp * dt, (ax.y / len) * sp * dt);
    if (ax.x && !ax.y) L.dir = ax.x < 0 ? 'left' : 'right';
    else if (ax.y && !ax.x) L.dir = ax.y < 0 ? 'up' : 'down';
    else if (!((L.dir === 'left' && ax.x < 0) || (L.dir === 'right' && ax.x > 0) || (L.dir === 'up' && ax.y < 0) || (L.dir === 'down' && ax.y > 0))) {
      L.dir = ax.x < 0 ? 'left' : 'right';
    }
    L.moving = true;
    L.speed = sp;
    if (L.step(dt, sp)) this.audio.sfx('step');
    this.party.recordTrail();
  }

  followCamera(dt) {
    const L = this.party.leader;
    const f = this.world.floor;
    this.cam.follow(L.x, L.y, f.w * TILE, f.h * TILE, dt);
  }

  switchCharacter() {
    const p = this.party;
    p.leader.moving = false;
    p.activeId = p.follower.id;
    p.resetTrail();
    this.audio.sfx('switchChar');
    this.hud.toast(portraitURL(this.who), 'Управление', this.who === 'vlad' ? 'Теперь играем за Влада' : 'Теперь играем за Анжелину');
  }

  changeFloor(to, pos) {
    this.world.currentId = to;
    const floor = this.world.floor;
    const L = this.party.leader;
    const F = this.party.follower;
    L.sitting = null;
    F.sitting = null;
    const a = findFree(floor, pos.x, pos.y);
    L.x = a.x;
    L.y = a.y;
    L.dir = 'down';
    const b = findFree(floor, pos.x + 16, pos.y + 4);
    F.x = b.x;
    F.y = b.y;
    F.dir = 'down';
    this.party.resetTrail();
    this.cam.follow(L.x, L.y, floor.w * TILE, floor.h * TILE, 0, true);
    this.currentRoom = this.world.roomAt(floor, L.x, L.y - 2);
    this.hud.banner(floor.name);
    this.save();
  }

  interact(t) {
    this.audio.sfx('blip');
    if (t.kind === 'pickup') {
      t.p.taken = true;
      this.say([N(PICKUP_LINES[t.p.item] || 'Что-то нашлось!')], () => this.give(t.p.item));
      return;
    }
    if (t.kind === 'door') {
      this.useDoor(t.door);
      return;
    }
    const fn = ACTIONS[t.obj.act];
    if (fn) fn(this, t.obj);
  }

  useDoor(d) {
    if (d.locked) {
      const fn = LOCKED[d.id];
      if (fn) fn(this, d);
      else this.say([N('Заперто.')]);
      return;
    }
    if (d.open) {
      const r = { x: d.tx * TILE, y: d.ty * TILE, w: TILE, h: TILE };
      const inDoorway = Object.values(this.party.chars).some((c) => c.x + 5 > r.x && c.x - 5 < r.x + r.w && c.y > r.y && c.y - 6 < r.y + r.h);
      if (inDoorway) {
        this.hud.toast(portraitURL(this.who), 'Дверь', 'Кто-то стоит в проёме');
        return;
      }
    }
    d.open = !d.open;
    this.audio.sfx(d.open ? 'doorOpen' : 'doorClose');
  }

  render(dt) {
    this.renderer.draw(this, this.t, dt);
  }
}

// ---------- Scaling & fullscreen ----------
function resize(settings) {
  const stage = document.getElementById('stage');
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  let s = Math.min(ww / STAGE_W, wh / STAGE_H);
  if (settings.scale === 'pixel') {
    const k = Math.floor(Math.min(ww / VIEW_W, wh / VIEW_H));
    if (k >= 1) s = k / PIXEL_SCALE;
  }
  const x = Math.round((ww - STAGE_W * s) / 2);
  const y = Math.round((wh - STAGE_H * s) / 2);
  stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
}

// ---------- Boot ----------
function boot() {
  initInput();
  buildCharacterSheets();
  const game = new Game();
  window.addEventListener('resize', () => resize(game.settings));
  resize(game.settings);
  const unlock = () => game.audio.unlock();
  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);
  game.world.currentId = 'f1';
  game.menus.open('main');

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    try {
      game.update(dt);
      game.render(dt);
    } catch (err) {
      console.error(err);
    }
    Input.endFrame();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  window.__game = game; // handy for debugging and automated tests
}

boot();
