// Procedural audio via the Web Audio API: lo-fi music, room ambience and SFX.
// Nothing is loaded from disk, so there are no missing assets. If the API is
// unavailable every call becomes a silent no-op.

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];
const BPM = 70;
const EIGHTH = 60 / BPM / 2;
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];

export class AudioSys {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.radioOn = true;
    this.step = 0;
    this.nextTime = 0;
  }

  // Browsers only allow audio after a user gesture; call this from input handlers.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      const c = this.ctx;
      this.master = c.createGain();
      this.master.connect(c.destination);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      lp.connect(this.master);
      this.musicBus = c.createGain();
      this.musicBus.connect(lp);
      this.sfxBus = c.createGain();
      this.sfxBus.connect(this.master);
      this.noise = this.makeNoise();
      this.apply();
      this.startAmbience();
      this.nextTime = c.currentTime + 0.1;
      setInterval(() => this.schedule(), 50);
    } catch (err) {
      console.warn('Audio disabled:', err);
      this.ctx = null;
    }
  }

  apply() {
    if (!this.ctx) return;
    const s = this.settings;
    const t = this.ctx.currentTime;
    const musicLevel = s.musicOn && this.radioOn ? s.music * 0.5 : 0;
    this.musicBus.gain.setTargetAtTime(musicLevel, t, 0.2);
    this.sfxBus.gain.setTargetAtTime(s.sfx * 0.9, t, 0.05);
  }

  makeNoise() {
    const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  startAmbience() {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 240;
    const g = c.createGain();
    g.gain.value = 0.035;
    src.connect(f).connect(g).connect(this.sfxBus);
    src.start();
    const hum = c.createOscillator();
    hum.frequency.value = 50;
    const hg = c.createGain();
    hg.gain.value = 0.006;
    hum.connect(hg).connect(this.sfxBus);
    hum.start();
  }

  schedule() {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    if (this.nextTime < c.currentTime) this.nextTime = c.currentTime + 0.05;
    while (this.nextTime < c.currentTime + 0.25) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += EIGHTH;
      this.step++;
    }
  }

  playStep(step, t) {
    const bar = Math.floor(step / 8) % CHORDS.length;
    const chord = CHORDS[bar];
    const inBar = step % 8;
    const M = this.musicBus;
    if (inBar === 0) {
      chord.forEach((n) => this.tone(midi(n), t, EIGHTH * 8, 'triangle', 0.035, M, 0.6));
      this.tone(midi(chord[0] - 12), t, EIGHTH * 3, 'sine', 0.12, M, 0.02);
    }
    if (inBar === 4) this.tone(midi(chord[0] - 12), t, EIGHTH * 3, 'sine', 0.09, M, 0.02);
    if ((step * 7) % 11 !== 3) {
      const n = chord[ARP[inBar]] + 12 + (step % 32 > 23 ? 12 : 0);
      this.tone(midi(n), t, EIGHTH * 1.6, 'sine', 0.03, M, 0.005);
    }
    if (inBar % 2 === 1) this.noiseHit(t, 0.03, 7000, 0.015, M, 'highpass');
    if (Math.random() < 0.15) this.noiseHit(t + Math.random() * EIGHTH, 0.004, 3000, 0.02, M, 'highpass');
  }

  tone(freq, t, dur, type, vol, bus, attack = 0.005) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  noiseHit(t, dur, freq, vol, bus, type = 'bandpass', q = 1) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  sweep(f0, f1, t, dur, type, vol) {
    const o = this.tone(f0, t, dur, type, vol, this.sfxBus);
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  }

  sfx(name, opts = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const B = this.sfxBus;
    switch (name) {
      case 'step':
        this.noiseHit(t, 0.05, 700 + Math.random() * 600, opts.quiet ? 0.08 : 0.16, B, 'bandpass', 1.5);
        break;
      case 'doorOpen':
        this.sweep(160, 300, t, 0.35, 'sawtooth', 0.025);
        this.noiseHit(t + 0.3, 0.12, 180, 0.3, B, 'lowpass');
        break;
      case 'doorClose':
        this.noiseHit(t, 0.18, 150, 0.45, B, 'lowpass');
        this.tone(70, t, 0.2, 'sine', 0.2, B);
        break;
      case 'blip':
        this.sweep(660, 990, t, 0.07, 'square', 0.03);
        break;
      case 'uiMove':
        this.tone(520, t, 0.05, 'square', 0.025, B);
        break;
      case 'uiSelect':
        this.tone(660, t, 0.06, 'square', 0.03, B);
        this.tone(990, t + 0.06, 0.09, 'square', 0.03, B);
        break;
      case 'pickup':
        [72, 76, 79, 84].forEach((n, i) => this.tone(midi(n), t + i * 0.07, 0.25, 'triangle', 0.08, B));
        break;
      case 'text':
        this.tone(opts.pitch || 380, t, 0.03, 'square', 0.012, B);
        break;
      case 'ding':
        this.tone(1320, t, 1.2, 'sine', 0.12, B);
        this.tone(2640, t, 0.8, 'sine', 0.04, B);
        break;
      case 'tv':
        this.noiseHit(t, 0.35, 4000, 0.12, B, 'highpass');
        break;
      case 'click':
        this.noiseHit(t, 0.02, 3000, 0.25, B, 'highpass');
        this.tone(1800, t, 0.02, 'square', 0.02, B);
        break;
      case 'vend':
        for (let i = 0; i < 3; i++) this.noiseHit(t + i * 0.12, 0.08, 300, 0.35, B, 'lowpass');
        this.tone(midi(84), t + 0.45, 0.2, 'triangle', 0.05, B);
        break;
      case 'fridge':
        this.noiseHit(t, 0.08, 500, 0.2, B, 'bandpass');
        this.tone(110, t, 0.8, 'sine', 0.03, B, 0.2);
        break;
      case 'thump':
        this.noiseHit(t, 0.12, 200, 0.4, B, 'lowpass');
        break;
      case 'meow':
        this.sweep(700, 480, t, 0.45, 'sawtooth', 0.02);
        break;
      case 'purr':
        for (let i = 0; i < 8; i++) this.noiseHit(t + i * 0.09, 0.07, 120, 0.25, B, 'lowpass');
        break;
      case 'piano':
        [65, 69, 72, 69, 65, 72, 74, 72, 70, 67].forEach((n, i) => {
          this.tone(midi(n), t + i * 0.18, 0.6, 'triangle', 0.06, B);
          this.tone(midi(n) * 1.012, t + i * 0.18, 0.6, 'sine', 0.03, B);
        });
        break;
      case 'guitar':
        [52, 57, 62, 67, 71].forEach((n, i) => this.tone(midi(n), t + i * 0.04, 1.2, 'triangle', 0.05, B));
        break;
      case 'boil':
        this.noiseHit(t, 1.8, 900, 0.08, B, 'bandpass', 0.7);
        break;
      case 'beep':
        for (let i = 0; i < 3; i++) this.tone(1000, t + i * 0.25, 0.12, 'square', 0.03, B);
        break;
      case 'washer':
        this.noiseHit(t, 1.5, 120, 0.3, B, 'lowpass');
        this.tone(60, t, 1.4, 'sawtooth', 0.02, B, 0.2);
        break;
      case 'bubble':
        for (let i = 0; i < 3; i++) this.sweep(300 + i * 80, 900 + i * 80, t + i * 0.12, 0.08, 'sine', 0.06);
        break;
      case 'radio':
        this.noiseHit(t, 0.4, 2500, 0.15, B, 'bandpass', 0.5);
        break;
      case 'unlock':
        [0, 0.1, 0.18].forEach((d) => this.noiseHit(t + d, 0.04, 3500, 0.35, B, 'highpass'));
        this.tone(midi(79), t + 0.3, 0.3, 'triangle', 0.05, B);
        break;
      case 'chime':
        [72, 79, 84, 88, 91].forEach((n, i) => this.tone(midi(n), t + i * 0.12, 1.4, 'sine', 0.06, B));
        break;
      case 'squeak':
        this.sweep(900, 1500, t, 0.15, 'square', 0.03);
        break;
      case 'switchChar':
        this.tone(midi(76), t, 0.1, 'triangle', 0.05, B);
        this.tone(midi(81), t + 0.08, 0.14, 'triangle', 0.05, B);
        break;
      case 'stairs':
        for (let i = 0; i < 4; i++) this.noiseHit(t + i * 0.12, 0.05, 900, 0.18, B, 'bandpass', 1.5);
        break;
      default:
        break;
    }
  }
}
