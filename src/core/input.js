// Keyboard state. `e.code` is the physical key, so WASD works on a Russian layout too.
const PREVENT = new Set(['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const held = new Set();
const hits = new Set();

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (PREVENT.has(e.code)) e.preventDefault();
    if (!e.repeat) hits.add(e.code);
    held.add(e.code);
  });
  window.addEventListener('keyup', (e) => held.delete(e.code));
  window.addEventListener('blur', () => held.clear());
}

export const Input = {
  held: (code) => held.has(code),
  hit: (...codes) => codes.some((c) => hits.has(c)),
  endFrame: () => hits.clear(),
  run: () => held.has('ShiftLeft') || held.has('ShiftRight'),
  axis() {
    let x = 0;
    let y = 0;
    if (held.has('KeyA') || held.has('ArrowLeft')) x -= 1;
    if (held.has('KeyD') || held.has('ArrowRight')) x += 1;
    if (held.has('KeyW') || held.has('ArrowUp')) y -= 1;
    if (held.has('KeyS') || held.has('ArrowDown')) y += 1;
    return { x, y };
  },
  // One-shot menu navigation.
  navY: () => (hits.has('KeyW') || hits.has('ArrowUp') ? -1 : hits.has('KeyS') || hits.has('ArrowDown') ? 1 : 0),
  navX: () => (hits.has('KeyA') || hits.has('ArrowLeft') ? -1 : hits.has('KeyD') || hits.has('ArrowRight') ? 1 : 0),
  confirm: () => hits.has('Enter') || hits.has('Space') || hits.has('KeyE'),
  back: () => hits.has('Escape'),
};
