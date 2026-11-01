import { SAVE_KEY, SETTINGS_KEY } from '../config.js';

// localStorage can throw (private mode, quota, disabled storage); the game must keep running.
function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadSave() {
  const s = read(SAVE_KEY);
  if (!s || s.v !== 1 || typeof s.floor !== 'string' || !s.chars) return null;
  return s;
}

export const writeSave = (state) => write(SAVE_KEY, state);

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

export const DEFAULT_SETTINGS = Object.freeze({ music: 0.6, sfx: 0.8, musicOn: true, scale: 'fit' });

export function loadSettings() {
  const s = read(SETTINGS_KEY) || {};
  const num = (v, d) => (typeof v === 'number' && v >= 0 && v <= 1 ? v : d);
  return {
    music: num(s.music, DEFAULT_SETTINGS.music),
    sfx: num(s.sfx, DEFAULT_SETTINGS.sfx),
    musicOn: typeof s.musicOn === 'boolean' ? s.musicOn : DEFAULT_SETTINGS.musicOn,
    scale: s.scale === 'pixel' ? 'pixel' : 'fit',
  };
}

export const saveSettings = (s) => write(SETTINGS_KEY, s);
