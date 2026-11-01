// Tiny DOM helper: el('div', 'cls', 'text', [children]). Text goes through textContent.
export function el(tag, cls, text, children) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  if (children) children.forEach((c) => c && n.appendChild(c));
  return n;
}

export function img(src, cls) {
  const n = document.createElement('img');
  n.src = src;
  n.alt = '';
  if (cls) n.className = cls;
  return n;
}

export const $ = (id) => document.getElementById(id);
