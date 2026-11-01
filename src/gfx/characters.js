// Character sprite sheets, generated pixel by pixel at startup.
// Sheet layout: rows = down, left, right, up; columns = idle0, idle1, walk0..3, sit.
import { makeCanvas, shade } from '../core/util.js';

export const FW = 16;
export const FH = 24;
export const DIRS = ['down', 'left', 'right', 'up'];
export const FRAME_SIT = 6;

export const LOOKS = {
  vlad: {
    name: 'Влад', skin: '#f0c39b', skinSh: '#cf9873', hair: '#3b2a20', hairHi: '#5c4231', hairSh: '#2a1d16',
    top: '#2e7477', topSh: '#215759', topHi: '#3f9294', accent: '#ece6d6',
    legs: '#35466a', legsSh: '#28354f', shoe: '#ece8de', shoeSh: '#b5473b', eye: '#1c1520', hoodie: true,
  },
  angelina: {
    name: 'Анжелина', skin: '#f7d2b0', skinSh: '#dfa785', hair: '#a8452c', hairHi: '#d0693f', hairSh: '#7a2e1d',
    top: '#e0a640', topSh: '#b8842b', topHi: '#f2c568', accent: '#f6f0e2',
    legs: '#2e2b3a', legsSh: '#211f2b', shoe: '#f3f0ea', shoeSh: '#c4beb3', eye: '#2a1a22',
    lips: '#cf6a66', blush: '#f0a89a', clip: '#fff07a', longHair: true,
  },
};

function legsFront(P, L, walk, back) {
  const liftL = walk === 0 ? 1 : 0;
  const liftR = walk === 2 ? 1 : 0;
  const shoe = back ? L.shoeSh : L.shoe;
  P(5, 18, 3, 4 - liftL, L.legs);
  P(8, 18, 3, 4 - liftR, L.legs);
  P(8, 18, 1, 4 - liftR, L.legsSh);
  P(4, 22 - liftL, 4, 2, shoe);
  P(4, 23 - liftL, 4, 1, L.shoeSh);
  P(8, 22 - liftR, 4, 2, shoe);
  P(8, 23 - liftR, 4, 1, L.shoeSh);
}

function headFront(P, L, u) {
  P(4, 4 + u, 8, 6, L.skin);
  P(5, 10 + u, 6, 1, L.skin);
  P(4, 9 + u, 1, 1, L.skinSh);
  P(11, 9 + u, 1, 1, L.skinSh);
  P(5, 10 + u, 1, 1, L.skinSh);
  P(10, 10 + u, 1, 1, L.skinSh);
  P(7, 11 + u, 2, 1, L.skinSh);
  P(6, 7 + u, 1, 2, L.eye);
  P(9, 7 + u, 1, 2, L.eye);
  if (L.lips) {
    P(7, 9 + u, 2, 1, L.lips);
    P(5, 8 + u, 1, 1, L.blush);
    P(10, 8 + u, 1, 1, L.blush);
  } else P(7, 9 + u, 2, 1, L.skinSh);
  if (L.longHair) {
    P(5, 1 + u, 6, 1, L.hair);
    P(4, 2 + u, 8, 2, L.hair);
    P(3, 3 + u, 10, 2, L.hair);
    P(4, 5 + u, 3, 1, L.hair);
    P(4, 6 + u, 1, 1, L.hair);
    P(3, 5 + u, 1, 10, L.hair);
    P(12, 5 + u, 1, 10, L.hair);
    P(4, 11 + u, 1, 4, L.hairSh);
    P(11, 11 + u, 1, 4, L.hairSh);
    P(6, 2 + u, 3, 1, L.hairHi);
    P(4, 3 + u, 2, 1, L.hairHi);
    P(10, 3 + u, 2, 1, L.clip);
  } else {
    P(5, 1 + u, 6, 1, L.hair);
    P(4, 2 + u, 8, 3, L.hair);
    P(4, 5 + u, 1, 2, L.hair);
    P(11, 5 + u, 1, 2, L.hair);
    P(5, 5 + u, 3, 1, L.hair);
    P(6, 2 + u, 3, 1, L.hairHi);
    P(9, 3 + u, 2, 1, L.hairHi);
    P(3, 6 + u, 1, 2, L.skinSh);
    P(12, 6 + u, 1, 2, L.skinSh);
  }
}

function headBack(P, L, u) {
  P(6, 10 + u, 4, 2, L.skinSh);
  P(5, 1 + u, 6, 1, L.hair);
  P(4, 2 + u, 8, 8, L.hair);
  P(6, 3 + u, 2, 1, L.hairHi);
  if (L.longHair) {
    P(3, 3 + u, 10, 12, L.hair);
    P(4, 15 + u, 8, 1, L.hair);
    P(5, 5 + u, 1, 9, L.hairSh);
    P(8, 6 + u, 1, 9, L.hairSh);
    P(10, 5 + u, 1, 8, L.hairSh);
    P(6, 2 + u, 3, 1, L.hairHi);
    P(10, 4 + u, 2, 1, L.clip);
  } else {
    P(3, 5 + u, 1, 2, L.skin);
    P(12, 5 + u, 1, 2, L.skin);
    P(5, 9 + u, 6, 1, L.hairSh);
  }
}

function drawSide(P, L, walk, sit, u) {
  if (L.longHair) P(8, 4 + u, 5, 11, L.hairSh);
  if (!sit) {
    if (walk === 0 || walk === 2) {
      P(8, 18, 3, 4, L.legsSh);
      P(9, 22, 3, 2, L.shoeSh);
      P(4, 18, 3, 4, L.legs);
      P(3, 22, 4, 2, L.shoe);
      P(3, 23, 4, 1, L.shoeSh);
    } else {
      P(6, 18, 4, 4, L.legs);
      P(6, 18, 1, 4, L.legsSh);
      P(5, 22, 5, 2, L.shoe);
      P(5, 23, 5, 1, L.shoeSh);
    }
  }
  P(5, 12 + u, 6, 7, L.top);
  P(10, 12 + u, 1, 7, L.topSh);
  P(5, 18 + u, 6, 1, L.topSh);
  P(5, 12 + u, 1, 6, L.topHi);
  if (L.hoodie) {
    P(9, 11 + u, 3, 3, L.topSh);
    P(6, 13 + u, 1, 2, L.accent);
  } else {
    P(5, 15 + u, 5, 1, L.topHi);
    P(5, 12 + u, 2, 1, L.accent);
  }
  const ax = walk === 0 ? 5 : walk === 2 ? 9 : 7;
  P(ax, 13 + u, 2, 5, L.topSh);
  P(ax, 18 + u, 2, 1, L.skin);
  P(4, 4 + u, 7, 6, L.skin);
  P(5, 10 + u, 5, 1, L.skin);
  P(3, 7 + u, 1, 2, L.skin);
  P(7, 11 + u, 2, 1, L.skinSh);
  P(5, 7 + u, 1, 2, L.eye);
  P(4, 9 + u, 2, 1, L.lips || L.skinSh);
  P(5, 1 + u, 6, 1, L.hair);
  P(4, 2 + u, 8, 2, L.hair);
  P(6, 2 + u, 3, 1, L.hairHi);
  if (L.longHair) {
    P(4, 4 + u, 3, 1, L.hair);
    P(8, 4 + u, 4, 10, L.hair);
    P(9, 14 + u, 3, 1, L.hair);
    P(9, 5 + u, 1, 6, L.hairSh);
    P(8, 3 + u, 2, 1, L.clip);
  } else {
    P(4, 4 + u, 2, 1, L.hair);
    P(9, 4 + u, 3, 4, L.hair);
    P(8, 6 + u, 1, 2, L.skinSh);
  }
}

function drawChar(ctx, ox, oy, L, dir, f) {
  const P = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(ox + x, oy + y, w, h);
  };
  const walk = f >= 2 && f <= 5 ? f - 2 : -1;
  const sit = f === FRAME_SIT;
  const u = (sit ? 3 : 0) + (walk === 1 || walk === 3 ? -1 : 0) + (f === 1 ? 1 : 0);
  if (dir === 'left') {
    drawSide(P, L, walk, sit, u);
    return;
  }
  const back = dir === 'up';
  const sw = walk === 0 ? 1 : walk === 2 ? -1 : 0;
  if (L.longHair && !back) P(3, 5 + u, 10, 10, L.hairSh);
  if (!sit) legsFront(P, L, walk, back);
  P(4, 12 + u, 8, 7, L.top);
  P(4, 12 + u, 1, 7, L.topSh);
  P(11, 12 + u, 1, 7, L.topSh);
  P(4, 18 + u, 8, 1, L.topSh);
  if (!back) {
    if (L.hoodie) {
      P(5, 12 + u, 6, 1, L.topSh);
      P(6, 13 + u, 1, 2, L.accent);
      P(9, 13 + u, 1, 2, L.accent);
      P(5, 16 + u, 6, 1, L.topSh);
    } else {
      P(6, 12 + u, 4, 1, L.accent);
      P(5, 15 + u, 6, 1, L.topHi);
    }
  } else if (L.hoodie) {
    P(5, 11 + u, 6, 3, L.topSh);
    P(6, 12 + u, 4, 1, shade(L.top, -0.4));
  }
  P(3, 12 + u + sw, 1, 6, L.topSh);
  P(3, 18 + u + sw, 1, 1, L.skin);
  P(12, 12 + u - sw, 1, 6, L.topSh);
  P(12, 18 + u - sw, 1, 1, L.skin);
  if (back) headBack(P, L, u);
  else headFront(P, L, u);
}

// 1px dark outline around every opaque pixel, kept inside each frame cell.
function outline(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const src = new Uint8ClampedArray(d);
  const opaque = (x, y) => src[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (opaque(x, y)) continue;
      const cx0 = Math.floor(x / FW) * FW;
      const cy0 = Math.floor(y / FH) * FH;
      const near =
        (x > cx0 && opaque(x - 1, y)) || (x < cx0 + FW - 1 && opaque(x + 1, y)) ||
        (y > cy0 && opaque(x, y - 1)) || (y < cy0 + FH - 1 && opaque(x, y + 1));
      if (near) {
        const i = (y * w + x) * 4;
        d[i] = 26;
        d[i + 1] = 18;
        d[i + 2] = 32;
        d[i + 3] = 230;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

const sheets = {};

export function buildCharacterSheets() {
  for (const id of Object.keys(LOOKS)) {
    const L = LOOKS[id];
    const { c, ctx } = makeCanvas(FW * 7, FH * 4);
    for (const d of [0, 1, 3]) for (let f = 0; f < 7; f++) drawChar(ctx, f * FW, d * FH, L, DIRS[d], f);
    for (let f = 0; f < 7; f++) {
      ctx.save();
      ctx.translate(f * FW + FW, 2 * FH);
      ctx.scale(-1, 1);
      ctx.drawImage(c, f * FW, FH, FW, FH, 0, 0, FW, FH);
      ctx.restore();
    }
    outline(ctx, c.width, c.height);
    const p = makeCanvas(FW, 16);
    p.ctx.drawImage(c, 0, 0, FW, 16, 0, 0, FW, 16);
    sheets[id] = { canvas: c, portrait: p.c.toDataURL() };
  }
}

export const sheet = (id) => sheets[id].canvas;
export const portraitURL = (id) => sheets[id].portrait;
