// Pitidos (Web Audio), voz (speechSynthesis), vibración y pantalla siempre encendida.
let ctx;
export function unlockAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    /* sin audio */
  }
}

export function beep(freq = 880, dur = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.25, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur);
}

let voice;
function pickVoice() {
  const vs = window.speechSynthesis?.getVoices() || [];
  voice = vs.find((v) => v.lang === 'es-ES') || vs.find((v) => v.lang?.startsWith('es')) || null;
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

export function say(text, enabled = true) {
  if (!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  if (voice) u.voice = voice;
  u.rate = 1.05;
  window.speechSynthesis.speak(u);
}

export const vibrate = (p) => navigator.vibrate?.(p);

let lock;
export async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen');
    else if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch {
    /* no soportado */
  }
}
