// Menu screens (main, character select, pause, settings, controls, inventory).
// Keyboard: W/S or arrows to move, A/D to change values, Enter/Space/E to pick, Esc to go back.
// Mouse works too: hover selects, click activates.
import { el, img, $ } from './dom.js';
import { Input } from '../core/input.js';
import { ITEMS, ITEM_ORDER } from '../game/items.js';
import { icon } from '../gfx/icons.js';

const CONTROLS = [
  ['WASD / Стрелки', 'Идти'],
  ['SHIFT', 'Быстрее'],
  ['E', 'Взаимодействовать'],
  ['SPACE', 'Дальше (диалог)'],
  ['TAB', 'Сменить героя'],
  ['I', 'Находки'],
  ['ESC', 'Пауза'],
  ['M', 'Музыка вкл/выкл'],
  ['F', 'Полный экран'],
];

const BIOS = {
  vlad: 'Второй курс, прикладная информатика. Уверен, что любую технику можно починить, если правильно стукнуть.',
  angelina: 'Второй курс, дизайн. Замечает детали, которые другие не видят, и находит то, что другие пропускают.',
};

export class Menus {
  constructor(game) {
    this.g = game;
    this.root = $('screens');
    this.stack = [];
  }

  get current() {
    return this.stack[this.stack.length - 1] || null;
  }

  get isOpen() {
    return this.stack.length > 0;
  }

  open(name) {
    const screen = this[`build_${name}`]();
    screen.name = name;
    this.stack.push(screen);
    this.render();
  }

  back() {
    const cur = this.current;
    if (!cur) return;
    if (cur.onBack) {
      cur.onBack();
      return;
    }
    this.stack.pop();
    this.g.audio.sfx('uiMove');
    if (!this.stack.length) this.g.onMenusClosed();
    this.render();
  }

  closeAll() {
    this.stack = [];
    this.render();
  }

  render() {
    this.root.replaceChildren();
    const cur = this.current;
    if (cur) this.root.appendChild(cur.render());
  }

  handle() {
    const cur = this.current;
    if (!cur) return;
    if (Input.back()) {
      this.back();
      return;
    }
    if (cur.handle) cur.handle();
  }

  // Generic vertical list of items.
  list(title, items, opts = {}) {
    const self = this;
    const screen = {
      sel: items.findIndex((i) => !i.disabled),
      items,
      onBack: opts.onBack,
      render() {
        const box = el('div', `menu px-box ${opts.cls || ''}`);
        if (title) box.appendChild(el('h2', null, title));
        items.forEach((it, i) => {
          const row = el('div', `menu-item${i === this.sel ? ' sel' : ''}${it.disabled ? ' disabled' : ''}`);
          row.appendChild(el('span', null, it.label, it.sub ? [el('div', 'sub', it.sub)] : null));
          if (it.kind === 'slider') {
            const bar = el('span', 'bar');
            const v = Math.round(it.get() * 10);
            for (let k = 0; k < 10; k++) bar.appendChild(el('i', k < v ? 'on' : ''));
            row.appendChild(bar);
          } else if (it.kind === 'toggle') row.appendChild(el('span', null, it.text()));
          row.addEventListener('mouseenter', () => {
            if (!it.disabled && this.sel !== i) {
              this.sel = i;
              self.render();
            }
          });
          row.addEventListener('click', (e) => {
            self.g.audio.unlock();
            if (it.disabled) return;
            this.sel = i;
            if (it.kind === 'slider') {
              const r = row.getBoundingClientRect();
              it.set(e.clientX > r.left + r.width * 0.75 ? Math.min(1, it.get() + 0.1) : Math.max(0, it.get() - 0.1));
              self.render();
            } else self.activate(it);
          });
          box.appendChild(row);
        });
        if (opts.foot) box.appendChild(el('div', 'menu-foot', opts.foot));
        if (!opts.wrap) return el('div', `screen ${opts.bg || 'dim'}`, null, [box]);
        return opts.wrap(box);
      },
      handle() {
        const dy = Input.navY();
        if (dy) {
          let n = this.sel;
          do n = (n + dy + items.length) % items.length;
          while (items[n].disabled);
          this.sel = n;
          self.g.audio.sfx('uiMove');
          self.render();
        }
        const it = items[this.sel];
        const dx = Input.navX();
        if (dx && it.kind === 'slider') {
          it.set(Math.max(0, Math.min(1, Math.round((it.get() + dx * 0.1) * 10) / 10)));
          self.g.audio.sfx('uiMove');
          self.render();
        } else if (dx && it.kind === 'toggle') self.activate(it);
        else if (Input.confirm()) self.activate(it);
      },
    };
    return screen;
  }

  activate(it) {
    if (it.kind === 'slider') return;
    this.g.audio.sfx('uiSelect');
    it.action();
    this.render();
  }

  build_main() {
    const g = this.g;
    const has = g.hasSave();
    return this.list(null, [
      { label: 'Продолжить', sub: has ? g.saveSummary() : 'сохранения нет', disabled: !has, action: () => g.continueGame() },
      { label: 'Новая игра', sub: has ? 'сохранение будет перезаписано' : null, action: () => this.open('select') },
      { label: 'Настройки', action: () => this.open('settings') },
      { label: 'Управление', action: () => this.open('controls') },
    ], {
      onBack: () => {},
      bg: 'title-bg',
      cls: 'main-menu',
      wrap: (box) => el('div', 'screen title-bg', null, [
        el('div', 'title-block', null, [
          el('div', 'title-main', 'DORMITORY'),
          el('div', 'title-sub', 'AFTER HOURS'),
          el('div', 'title-tag', 'Общежитие №4 · ночь · два студента · много секретов'),
        ]),
        box,
      ]),
    });
  }

  build_select() {
    const self = this;
    const ids = ['vlad', 'angelina'];
    return {
      sel: 0,
      render() {
        const cards = ids.map((id, i) => {
          const card = el('div', `card px-box${i === this.sel ? ' sel' : ''}`, null, [
            img(self.g.portraitURL(id)),
            el('div', null, null, [el('div', 'cname', id === 'vlad' ? 'Влад' : 'Анжелина'), el('div', 'cdesc', BIOS[id])]),
          ]);
          card.querySelector('.cname').style.color = id === 'vlad' ? 'var(--vlad)' : 'var(--angelina)';
          card.addEventListener('mouseenter', () => {
            if (this.sel !== i) {
              this.sel = i;
              self.render();
            }
          });
          card.addEventListener('click', () => {
            self.g.audio.unlock();
            self.g.newGame(id);
          });
          return card;
        });
        return el('div', 'screen dim', null, [
          el('div', 'select-wrap', null, [
            el('div', 'title-sub', 'КЕМ НАЧНЁМ?'),
            el('div', 'cards', null, cards),
            el('div', 'menu-foot', 'A / D — выбор · ENTER — начать · ESC — назад. Второй герой пойдёт следом, TAB меняет управление.'),
          ]),
        ]);
      },
      handle() {
        const dx = Input.navX();
        if (dx) {
          this.sel = (this.sel + dx + 2) % 2;
          self.g.audio.sfx('uiMove');
          self.render();
        }
        if (Input.confirm()) {
          self.g.audio.sfx('uiSelect');
          self.g.newGame(ids[this.sel]);
        }
      },
    };
  }

  build_pause() {
    const g = this.g;
    return this.list('ПАУЗА', [
      { label: 'Продолжить', action: () => this.back() },
      { label: 'Находки', action: () => this.open('inventory') },
      { label: 'Настройки', action: () => this.open('settings') },
      { label: 'Управление', action: () => this.open('controls') },
      { label: 'Сохранить игру', action: () => g.save(true) },
      { label: 'В главное меню', action: () => g.toMainMenu() },
    ]);
  }

  build_settings() {
    const g = this.g;
    const s = g.settings;
    return this.list('НАСТРОЙКИ', [
      { label: 'Музыка', kind: 'slider', get: () => s.music, set: (v) => g.setSetting('music', v) },
      { label: 'Звуки', kind: 'slider', get: () => s.sfx, set: (v) => g.setSetting('sfx', v) },
      { label: 'Музыка', kind: 'toggle', text: () => (s.musicOn ? 'ВКЛ' : 'ВЫКЛ'), action: () => g.setSetting('musicOn', !s.musicOn) },
      { label: 'Масштаб', kind: 'toggle', text: () => (s.scale === 'pixel' ? 'ПИКСЕЛЬ-В-ПИКСЕЛЬ' : 'ВПИСАТЬ'), action: () => g.setSetting('scale', s.scale === 'pixel' ? 'fit' : 'pixel') },
      { label: 'Назад', action: () => this.back() },
    ], { foot: 'A / D — изменить значение' });
  }

  build_controls() {
    const grid = el('div', 'controls-grid');
    CONTROLS.forEach(([k, v]) => {
      grid.appendChild(el('div', 'k', k));
      grid.appendChild(el('div', null, v));
    });
    return {
      render: () =>
        el('div', 'screen dim', null, [
          el('div', 'menu px-box', null, [el('h2', null, 'УПРАВЛЕНИЕ'), grid, el('div', 'menu-foot', 'ESC — назад')]),
        ]),
      handle: () => {
        if (Input.confirm()) this.back();
      },
    };
  }

  build_inventory() {
    const self = this;
    const g = this.g;
    return {
      sel: 0,
      render() {
        const grid = el('div', 'inv-grid');
        ITEM_ORDER.forEach((id, i) => {
          const found = g.found.has(id);
          const slot = el('div', `slot${i === this.sel ? ' sel' : ''}${found && !g.inv.includes(id) ? ' used' : ''}`);
          if (found) {
            slot.appendChild(img(icon(id).url));
            const who = g.foundBy[id];
            if (who) slot.appendChild(el('div', `who ${who}`));
          } else slot.appendChild(el('div', 'q', '?'));
          slot.addEventListener('mouseenter', () => {
            if (this.sel !== i) {
              this.sel = i;
              self.render();
            }
          });
          grid.appendChild(slot);
        });
        const id = ITEM_ORDER[this.sel];
        const it = ITEMS[id];
        const found = g.found.has(id);
        const detail = el('div', 'inv-detail');
        if (found) {
          detail.appendChild(img(icon(id).url));
          detail.appendChild(el('div', 'dname', it.name));
          detail.appendChild(el('div', 'ddesc', it.desc));
          const who = g.foundBy[id] === 'vlad' ? 'Нашёл Влад' : 'Нашла Анжелина';
          detail.appendChild(el('div', 'dwho', who + (g.inv.includes(id) ? '' : ' · уже использовано')));
        } else {
          detail.appendChild(el('div', 'dname', '???'));
          const hint = it.who === 'vlad' ? 'Эту находку может сделать только Влад.' : it.who === 'angelina' ? 'Эту находку может сделать только Анжелина.' : 'Пока не найдено.';
          detail.appendChild(el('div', 'ddesc', hint));
        }
        return el('div', 'screen dim', null, [
          el('div', 'menu px-box', null, [
            el('h2', null, `НАХОДКИ ${g.found.size}/${ITEM_ORDER.length}`),
            el('div', 'inv', null, [grid, detail]),
            el('div', 'menu-foot', 'Стрелки — выбор · I / ESC — закрыть'),
          ]),
        ]);
      },
      handle() {
        const dx = Input.navX();
        const dy = Input.navY();
        if (dx || dy) {
          this.sel = (this.sel + dx + dy * 5 + ITEM_ORDER.length) % ITEM_ORDER.length;
          g.audio.sfx('uiMove');
          self.render();
        }
        if (Input.hit('KeyI')) self.back();
      },
    };
  }
}
