// Pitidos (Web Audio), voz (speechSynthesis), vibración y pantalla siempre encendida.
let ctx;
let duckHandler = null;

export const getCtx = () => ctx;

// Debe llamarse dentro de un toque del usuario (iOS solo permite audio tras un gesto).
export function unlockAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    /* sin audio */
  }
  // Activa la voz en iOS con una frase vacía dentro del gesto.
  try {
    if (window.speechSynthesis && !unlockAudio.spoken) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
      unlockAudio.spoken = true;
    }
  } catch {
    /* sin voz */
  }
}

// 'playback': la app suena aunque el iPhone esté en silencio (y pausa otras apps).
// 'ambient': se mezcla con Spotify/Apple Music sin cortarlos.
export function setAudioSession(type) {
  try {
    if (navigator.audioSession) navigator.audioSession.type = type;
  } catch {
    /* no soportado */
  }
}

export function onDuck(fn) {
  duckHandler = fn;
}

export function beep(freq = 880, dur = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.3, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur);
}

// Toda la voz hablada es en INGLÉS (voz del dispositivo, sin TTS externo).
export const SPEECH_LANG = 'en-US';
let voice;
function pickVoice() {
  try {
    const vs = window.speechSynthesis?.getVoices() || [];
    const norm = (l) => (l || '').replace('_', '-').toLowerCase();
    voice =
      vs.find((v) => norm(v.lang) === 'en-us') ||
      vs.find((v) => norm(v.lang) === 'en-gb') ||
      vs.find((v) => norm(v.lang).startsWith('en')) ||
      null; // sin voz inglesa: se usa lang en-US y el motor elige; nunca una voz española
  } catch {
    voice = null;
  }
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  pickVoice();
  try {
    window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  } catch {
    /* navegador antiguo */
  }
}

export function say(text, enabled = true) {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG;
    if (voice) u.voice = voice;
    u.rate = 1.05;
    u.onstart = () => duckHandler?.(true);
    u.onend = u.onerror = () => duckHandler?.(false);
    window.speechSynthesis.speak(u);
  } catch {
    duckHandler?.(false); // la voz nunca debe romper el entrenamiento
  }
}

// Corta la locución vigente (pausa, voz apagada, salida). Nunca lanza.
export function cancelSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* sin voz */
  }
  duckHandler?.(false);
}

export const vibrate = (p) => navigator.vibrate?.(p);

// Pantalla encendida. Cada llamada invalida las anteriores (generación): una petición
// que se resuelve tarde, tras salir o tras otra petición, se libera en el acto.
let lock = null;
let wantLock = false;
let lockGen = 0;
export async function keepAwake(on) {
  wantLock = on;
  const gen = ++lockGen;
  if (!on) {
    const l = lock;
    lock = null;
    try {
      await l?.release();
    } catch {
      /* ya liberado */
    }
    return;
  }
  if (!('wakeLock' in navigator) || (lock && !lock.released)) return;
  try {
    const l = await navigator.wakeLock.request('screen');
    if (!wantLock || gen !== lockGen || (lock && !lock.released)) {
      l.release().catch(() => {});
      return;
    }
    lock = l;
    l.addEventListener?.('release', () => {
      if (lock === l) lock = null;
    });
  } catch {
    /* no soportado o denegado */
  }
}
