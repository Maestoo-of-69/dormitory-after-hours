// Object type registry: footprint (tiles), collision box, render layer, light sources.
// solid: [ox, oy, w, h] in px relative to the footprint; omitted = full footprint; null = walk-through.
// layer: 'floor' (under everything), 'wall' (on a wall face), default = y-sorted with characters.
import * as F from '../gfx/furniture.js';

const warm = '255,200,120';
const L = (x, y, r, s, col, g) => ({ x, y, r, s, col, g });

export const TYPES = {
  bed: { fw: 1, fh: 2, draw: F.bed },
  desk: {
    fw: 2, fh: 1, draw: F.desk, solid: [0, 2, 32, 14],
    light(o, t) {
      const out = [];
      if ((o.v || '').includes('lamp') && o.state.lamp !== false) out.push(L(o.px + o.pw - 5, o.py - 2, 46, 0.6, warm, 0.2));
      if (o.state.on && (o.v || '').includes('pc')) out.push(L(o.px + 16, o.py - 4, 30, 0.4, '150,200,255', 0.14));
      if ((o.v || '').includes('gaming')) {
        const hue = Math.floor(t * 90) % 360;
        out.push(L(o.px + 16, o.py, 34, 0.35, hue < 180 ? '200,120,255' : '120,200,255', 0.14));
      }
      return out;
    },
  },
  chair: { fw: 1, fh: 1, draw: F.chair, solid: null },
  stool: { fw: 1, fh: 1, draw: F.stool, solid: [4, 5, 8, 9] },
  wardrobe: { fw: 1, fh: 1, draw: F.wardrobe },
  bookshelf: { fw: 2, fh: 1, draw: F.bookshelf },
  plant: { fw: 1, fh: 1, draw: F.plant, solid: [3, 6, 10, 10] },
  fridge: { fw: 1, fh: 1, draw: F.fridge, light: (o) => (o.state.open ? [L(o.px + 8, o.py + 2, 38, 0.55, '255,245,210', 0.22)] : []) },
  counter: { fw: 1, fh: 1, draw: F.counter },
  ktable: { fw: 2, fh: 2, draw: F.ktable, solid: [1, 3, 30, 25] },
  sofa: { fw: 3, fh: 1, draw: F.sofa, seats: true },
  armchair: { fw: 1, fh: 1, draw: F.armchair, seats: true },
  tv: {
    fw: 2, fh: 1, draw: F.tv, solid: [2, 3, 28, 13],
    light: (o, t) => (o.state.on ? [L(o.px + 16, o.py + 4, 72, 0.45 + Math.sin(t * 13) * 0.06, '120,170,255', 0.2)] : []),
  },
  ctable: { fw: 2, fh: 1, draw: F.ctable, solid: [1, 4, 30, 10] },
  lamp: { fw: 1, fh: 1, draw: F.lamp, solid: [4, 9, 8, 7], light: (o) => (o.state.on ? [L(o.px + 8, o.py - 8, 70, 0.65, warm, 0.24)] : []) },
  vending: { fw: 1, fh: 1, draw: F.vending, light: (o) => [L(o.px + 8, o.py - 2, 44, 0.5, '150,220,255', 0.16)] },
  cooler: { fw: 1, fh: 1, draw: F.cooler, solid: [2, 2, 12, 14] },
  sinkm: { fw: 1, fh: 1, draw: F.sinkm, solid: [2, 0, 12, 12] },
  shower: { fw: 2, fh: 2, draw: F.shower },
  stall: { fw: 2, fh: 2, draw: F.stall },
  reception: { fw: 5, fh: 2, draw: F.reception, light: (o) => [L(o.px + 68, o.py - 4, 80, 0.6, warm, 0.22)] },
  bench: { fw: 3, fh: 1, draw: F.bench, solid: [1, 4, 46, 10] },
  turnstile: { fw: 1, fh: 1, draw: F.turnstile, solid: [4, 4, 8, 10] },
  washer: { fw: 1, fh: 1, draw: F.washer },
  ironing: { fw: 2, fh: 1, draw: F.ironing, solid: [2, 4, 28, 8] },
  rack: { fw: 2, fh: 1, draw: F.rack, solid: [1, 6, 30, 8] },
  basket: { fw: 1, fh: 1, draw: F.basket, solid: [3, 6, 10, 9] },
  shelfx: { fw: 1, fh: 1, draw: F.shelfx },
  cctv: { fw: 3, fh: 1, draw: F.cctv, solid: [0, 2, 48, 14], light: (o) => [L(o.px + 24, o.py - 2, 44, 0.45, '140,255,190', 0.13)] },
  catbed: { fw: 1, fh: 1, draw: F.catbed, layer: 'floor', solid: null },
  cat: { fw: 1, fh: 1, draw: F.cat, solid: null },
  radio: { fw: 1, fh: 1, draw: F.radio, solid: [2, 4, 12, 11] },
  smalltable: { fw: 1, fh: 1, draw: F.smalltable, solid: [2, 3, 12, 11] },
  rail: { fw: 1, fh: 3, draw: F.rail, solid: [5, 0, 6, 48] },
  boxes: { fw: 1, fh: 1, draw: F.boxes },
  capsule: { fw: 1, fh: 1, draw: F.capsule, solid: [2, 4, 12, 10], light: (o) => (o.state.open ? [L(o.px + 8, o.py + 4, 40, 0.5, '255,220,140', 0.2)] : []) },
  guitar: { fw: 1, fh: 1, draw: F.guitar, solid: [3, 4, 10, 10] },
  easel: { fw: 1, fh: 1, draw: F.easel, solid: [3, 6, 10, 9] },
  piano: { fw: 2, fh: 1, draw: F.piano },
  chess: { fw: 1, fh: 1, draw: F.chess, solid: [1, 3, 14, 12] },
  bin: { fw: 1, fh: 1, draw: F.bin, solid: [3, 4, 10, 11] },
  trophy: { fw: 2, fh: 1, draw: F.trophy },
  backpack: { fw: 1, fh: 1, draw: F.backpack, solid: null },
  zzz: { fw: 1, fh: 1, draw: F.zzz, solid: null },
  // Floor decor
  rug: { fw: 1, fh: 1, draw: F.rug, layer: 'floor', solid: null },
  mat: { fw: 1, fh: 1, draw: F.mat, layer: 'floor', solid: null },
  pizza: { fw: 1, fh: 1, draw: F.pizza, layer: 'floor', solid: null },
  socks: { fw: 1, fh: 1, draw: F.socks, layer: 'floor', solid: null },
  dumbbells: { fw: 1, fh: 1, draw: F.dumbbells, layer: 'floor', solid: null },
  shoes: { fw: 1, fh: 1, draw: F.shoes, layer: 'floor', solid: null },
  // Wall decor
  poster: { fw: 1, fh: 1, draw: F.poster, layer: 'wall' },
  clock: { fw: 1, fh: 1, draw: F.clock, layer: 'wall' },
  switch: { fw: 1, fh: 1, draw: F.lightSwitch, layer: 'wall', label: 'Свет' },
  extinguisher: { fw: 1, fh: 1, draw: F.extinguisher, layer: 'wall' },
  board: { fw: 2, fh: 1, draw: F.board, layer: 'wall', label: 'Читать' },
  keyrack: { fw: 2, fh: 1, draw: F.keyrack, layer: 'wall' },
  mailbox: { fw: 2, fh: 1, draw: F.mailbox, layer: 'wall' },
  payphone: { fw: 1, fh: 1, draw: F.payphone, layer: 'wall' },
  calendar: { fw: 1, fh: 1, draw: F.calendar, layer: 'wall' },
  firehose: { fw: 1, fh: 1, draw: F.firehose, layer: 'wall' },
  cobweb: { fw: 1, fh: 1, draw: F.cobweb, layer: 'wall' },
  banner: { fw: 2, fh: 1, draw: F.banner, layer: 'wall' },
  sign: { fw: 1, fh: 1, draw: F.sign, layer: 'wall' },
  whiteboard: { fw: 2, fh: 1, draw: F.whiteboard, layer: 'wall' },
  fairy: {
    fw: 1, fh: 1, draw: F.fairy, layer: 'wall', label: 'Гирлянда',
    light(o) {
      if (!o.state.on) return [];
      const cols = ['255,210,122', '255,138,138', '138,255,200', '168,184,255'];
      const out = [];
      for (let i = 0, x = 12; x < o.pw; x += 32, i++) out.push(L(o.px + x, o.py + 8, 30, 0.35, cols[i % 4], 0.16));
      return out;
    },
  },
  photowall: { fw: 1, fh: 1, draw: F.photowall, layer: 'wall' },
  sconce: { fw: 1, fh: 1, draw: F.sconce, layer: 'wall', light: (o, t) => (F.sconceLit(o, t) ? [L(o.px + 8, o.py + 10, 56, 0.55, '255,220,160', 0.16)] : []) },
  dreamcatcher: { fw: 1, fh: 1, draw: F.dreamcatcher, layer: 'wall' },
  entrance: { fw: 4, fh: 1, draw: F.entrance, layer: 'wall', irect: [0, -12, 64, 14], light: (o) => [L(o.px + 32, o.py - 4, 56, 0.4, '255,170,90', 0.14)] },
  windowspot: { fw: 2, fh: 1, draw: F.noop, layer: 'wall', label: 'Окно', light: (o) => [L(o.px + 16, o.py + 22, 36, 0.3, '130,160,255', 0.1)] },
};

// Default prompt verbs by action id; anything else falls back to "Осмотреть".
export const ACT_LABELS = {
  sofa: 'Сесть', armchair: 'Сесть', tv: 'Телевизор', lamp: 'Лампа', fridge: 'Холодильник', fridge2: 'Холодильник',
  vending: 'Автомат', piano: 'Сыграть', cat: 'Погладить', radio: 'Радио', kettle: 'Чайник', micro: 'Микроволновка',
  washer: 'Запустить', washer_note: 'Запустить', reception: 'Звонок', cooler: 'Попить', mirror: 'Зеркало', pc: 'Компьютер',
  laptop: 'Ноутбук', capsule: 'Открыть', guitar: 'Гитара', sconce: 'Лампа', bed_vlad: 'Кровать',
};
