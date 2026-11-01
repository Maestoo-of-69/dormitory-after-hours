// Typewriter dialogue queue. Lines are { who, text }; who is vlad | angelina | narr | cat.
export const V = (text) => ({ who: 'vlad', text });
export const A = (text) => ({ who: 'angelina', text });
export const N = (text) => ({ who: 'narr', text });
export const C = (text) => ({ who: 'cat', text });

const CHARS_PER_SECOND = 48;

export class Dialogue {
  constructor(onBlip) {
    this.queue = [];
    this.line = null;
    this.shown = 0;
    this.onBlip = onBlip;
    this.callbacks = [];
  }

  get active() {
    return !!this.line;
  }

  get visibleText() {
    return this.line ? this.line.text.slice(0, Math.floor(this.shown)) : '';
  }

  get lineDone() {
    return !!this.line && this.shown >= this.line.text.length;
  }

  // New lines queue up behind the current conversation, so scripts can chain.
  start(lines, onDone) {
    if (!lines || !lines.length) {
      if (onDone) onDone();
      return;
    }
    this.queue.push(...lines);
    if (onDone) this.callbacks.push(onDone);
    if (!this.line) this.next();
  }

  // Callbacks run once the whole queued conversation has been read.
  next() {
    this.line = this.queue.shift() || null;
    this.shown = 0;
    if (!this.line) {
      const cbs = this.callbacks;
      this.callbacks = [];
      cbs.forEach((fn) => fn());
    }
  }

  advance() {
    if (!this.line) return;
    if (!this.lineDone) this.shown = this.line.text.length;
    else this.next();
  }

  update(dt) {
    if (!this.line || this.lineDone) return;
    const before = Math.floor(this.shown);
    this.shown = Math.min(this.line.text.length, this.shown + dt * CHARS_PER_SECOND);
    const now = Math.floor(this.shown);
    if (now !== before && now % 3 === 0 && this.line.text[now - 1] !== ' ') this.onBlip(this.line.who);
  }
}
