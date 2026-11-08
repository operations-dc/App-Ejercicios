// Música generada en tiempo real con Web Audio (sin archivos ni licencias).
// Secuenciador de 16 pasos por compás con batería, bajo, arpegio y pads.
// La intensidad cambia según la fase: 'work' (circuito), 'warm' (calentamiento),
// 'rest' (descanso) y 'calm' (vuelta a la calma / movilidad).

import { getCtx } from './audio.js';

// Progresiones de 4 acordes (notas MIDI). Se elige una según el día.
const PRESETS = [
  { name: 'La menor', chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]] }, // Am F C G
  { name: 'Mi menor', chords: [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]] }, // Em C G D
  { name: 'Re menor', chords: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]] }, // Dm Bb F C
  { name: 'Fa# menor', chords: [[54, 57, 61], [50, 54, 57], [57, 61, 64], [52, 56, 59]] }, // F#m D A E
];

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

class Music {
  constructor() {
    this.level = 'warm';
    this.playing = false;
    this.step = 0;
    this.timer = null;
  }

  start({ dia = 1, bpm = 124 } = {}) {
    const ctx = getCtx();
    if (!ctx || this.playing) return;
    this.ctx = ctx;
    this.preset = PRESETS[(dia - 1) % PRESETS.length];
    this.bpm = bpm;
    this.stepDur = 60 / bpm / 4;

    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -16;
    this.comp.ratio.value = 4;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.comp).connect(ctx.destination);
    this.base = 0.55;
    this.master.gain.setTargetAtTime(this.base, ctx.currentTime, 0.4);

    if (!this.noise) {
      const len = ctx.sampleRate;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }

    this.step = 0;
    this.next = ctx.currentTime + 0.1;
    this.playing = true;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop(fade = 0.3) {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
    const { ctx, master, comp } = this;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
    setTimeout(() => {
      master.disconnect();
      comp.disconnect();
    }, fade * 1000 + 300);
  }

  setLevel(level) {
    this.level = level;
  }

  // Baja la música mientras habla la voz.
  duck(on) {
    if (!this.playing) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? this.base * 0.3 : this.base, t, on ? 0.05 : 0.3);
  }

  schedule() {
    while (this.next < this.ctx.currentTime + 0.12) {
      this.playStep(this.step, this.next);
      this.step = (this.step + 1) % 64;
      this.next += this.stepDur;
    }
  }

  playStep(step, t) {
    const L = this.level;
    const s = step % 16;
    const chord = this.preset.chords[Math.floor(step / 16) % 4];
    const full = L === 'work';
    const groove = full || L === 'warm';

    if (groove && s % 4 === 0) this.kick(t, full ? 0.9 : 0.7);
    if (full && (s === 4 || s === 12)) this.clap(t);
    if (full) this.hat(t, s % 4 === 2 ? 0.16 : 0.06, s % 4 === 2 ? 0.12 : 0.035);
    else if (groove) s % 2 === 0 && this.hat(t, s % 4 === 2 ? 0.12 : 0.05, 0.04);
    else if (s % 4 === 2) this.hat(t, 0.035, 0.04);

    if (groove && s % 4 === 2) this.bass(t, chord[0] - 24, full ? 0.32 : 0.24);
    if (full && s % 4 === 3) this.bass(t, chord[0] - 12, 0.12);
    if (full && s % 2 === 0) this.pluck(t, chord[(s / 2) % 3] + 12, 0.07);
    if (!full && s === 0) this.pad(t, chord, L === 'warm' ? 0.035 : 0.055);
  }

  out(gain) {
    const g = this.ctx.createGain();
    g.gain.value = gain;
    g.connect(this.master);
    return g;
  }

  kick(t, vol) {
    const o = this.ctx.createOscillator();
    const g = this.out(0);
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.4);
  }

  noiseHit(t, vol, dur, type, f) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = f;
    const g = this.out(0);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filt).connect(g);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  clap(t) {
    this.noiseHit(t, 0.35, 0.16, 'bandpass', 1600);
  }

  hat(t, vol, dur) {
    this.noiseHit(t, vol, dur, 'highpass', 7500);
  }

  bass(t, note, vol) {
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq(note);
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(900, t);
    filt.frequency.exponentialRampToValueAtTime(180, t + 0.18);
    const g = this.out(0);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(filt).connect(g);
    o.start(t);
    o.stop(t + 0.25);
  }

  pluck(t, note, vol) {
    const o = this.ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = freq(note);
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(2600, t);
    filt.frequency.exponentialRampToValueAtTime(500, t + 0.12);
    const g = this.out(0);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(filt).connect(g);
    o.start(t);
    o.stop(t + 0.16);
  }

  pad(t, chord, vol) {
    const dur = this.stepDur * 16;
    for (const n of chord) {
      for (const det of [-6, 6]) {
        const o = this.ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = freq(n);
        o.detune.value = det;
        const g = this.out(0);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.6);
        g.gain.setValueAtTime(vol, t + dur - 0.5);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.2);
        o.connect(g);
        o.start(t);
        o.stop(t + dur + 0.3);
      }
    }
  }
}

export const music = new Music();
