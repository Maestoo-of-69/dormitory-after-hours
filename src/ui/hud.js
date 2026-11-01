// In-game overlay: character indicator, room/time, find counter, prompt, toasts, banner, dialogue box.
import { el, img, $ } from './dom.js';
import { PIXEL_SCALE } from '../config.js';

const NAMES = { vlad: 'Влад', angelina: 'Анжелина', cat: 'Пельмень', narr: '' };

export class HUD {
  constructor(portraitURL) {
    this.portraitURL = portraitURL;
    this.root = $('hud');
    this.promptEl = $('prompt');
    this.promptText = $('prompt-text');
    this.dlg = $('dialogue');
    this.cache = {};
  }

  set(key, node, value, prop = 'textContent') {
    if (this.cache[key] === value) return;
    this.cache[key] = value;
    node[prop] = value;
  }

  show(v) {
    this.root.classList.toggle('hidden', !v);
    if (!v) this.hidePrompt();
  }

  update({ active, other, room, sub, found, total }) {
    this.set('portrait', $('hud-portrait'), this.portraitURL(active), 'src');
    this.set('portrait2', $('hud-portrait2'), this.portraitURL(other), 'src');
    this.set('name', $('hud-name'), NAMES[active]);
    $('hud-name').style.color = active === 'vlad' ? 'var(--vlad)' : 'var(--angelina)';
    this.set('room', $('hud-room-name'), room);
    this.set('sub', $('hud-room-sub'), sub);
    this.set('found', $('hud-found-n'), `Находки ${found}/${total}`);
  }

  prompt(label, vx, vy) {
    this.promptEl.classList.remove('hidden');
    this.set('prompt', this.promptText, label);
    this.promptEl.style.left = `${Math.round(vx * PIXEL_SCALE)}px`;
    this.promptEl.style.top = `${Math.round(vy * PIXEL_SCALE) - 24}px`;
  }

  hidePrompt() {
    this.promptEl.classList.add('hidden');
  }

  toast(iconUrl, title, text) {
    const t = el('div', 'toast px-box', null, [img(iconUrl), el('div', null, null, [el('div', 't1', title), el('div', 't2', text)])]);
    $('toasts').appendChild(t);
    setTimeout(() => t.remove(), 3700);
  }

  banner(text) {
    const b = $('banner');
    b.classList.add('hidden');
    b.textContent = text;
    void b.offsetWidth; // restart the CSS animation
    b.classList.remove('hidden');
  }

  dialogue(line, text, done) {
    this.dlg.classList.remove('hidden');
    const narr = line.who === 'narr';
    this.dlg.classList.toggle('narr', narr);
    if (!narr && line.who !== 'cat') this.set('dlgP', $('dlg-portrait'), this.portraitURL(line.who), 'src');
    $('dlg-portrait').style.visibility = line.who === 'cat' ? 'hidden' : 'visible';
    const name = $('dlg-name');
    name.className = line.who;
    this.set('dlgName', name, NAMES[line.who]);
    this.set('dlgText', $('dlg-text'), text);
    $('dlg-next').style.visibility = done ? 'visible' : 'hidden';
  }

  hideDialogue() {
    this.dlg.classList.add('hidden');
    this.cache.dlgText = null;
  }
}
