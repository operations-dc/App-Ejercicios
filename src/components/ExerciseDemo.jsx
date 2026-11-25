import { useEffect, useRef, useState } from 'react';
import Figure from './Figure.jsx';
import { EXERCISES } from '../data/exercises.js';
import { DEMO_VIDEOS, hasVideo, posterFor } from '../data/media.js';

const RM_QUERY = '(prefers-reduced-motion: reduce)';
const STALL_MS = 2000; // sin progreso observado durante este plazo => ofrecer botón (+1 reintento)
const HEALTHY_MS = 1000; // progreso sostenido que cierra un episodio de bloqueo
const GAP_MS = 600; // hueco entre muestras de progreso que rompe la racha
const TICK_MS = 250; // watchdog único por demo

// Preferencia de movimiento reducido, siguiendo sus cambios en vivo.
function useReducedMotion() {
  const [reduce, setReduce] = useState(() => !!window.matchMedia?.(RM_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(RM_QUERY);
    if (!mq) return;
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduce;
}

// Demostración de un ejercicio: vídeo local (SOLO ids con MP4) o la guía animada SVG.
// - muted + playsInline + loop; nunca lleva audio.
// - Se pausa con `playing=false`, al desmontar y al cambiar de ejercicio (key por id).
// - Con prefers-reduced-motion no arranca solo; si el navegador rechaza play(), ofrece
//   un botón accesible que reproduce desde el gesto del usuario.
// - Reproducción "sana" = progreso observado (fotogramas vía requestVideoFrameCallback o,
//   sin él, avance de currentTime), nunca eventos play/playing ni la promesa de play().
//   2 s sin progreso (o una pausa inesperada) muestran «Reproducir vídeo» y hacen como
//   máximo UN reintento automático por episodio; solo ~1 s de progreso sostenido lo cierra.
// - Si el vídeo falla, muestra el póster estático de ESE ejercicio con aviso legible; si el
//   póster también falla, solo texto con el nombre. Nunca la guía SVG ni otro ejercicio.
export default function ExerciseDemo(props) {
  const src = hasVideo(props.exId) ? DEMO_VIDEOS[props.exId] : null;
  if (!src) return <Figure exId={props.exId} playing={props.playing} dark={props.dark} className={props.className} />;
  return <VideoDemo key={props.exId} src={src} poster={posterFor(props.exId)} {...props} />;
}

// Póster estático de un ejercicio con vídeo. Si la imagen falla: texto explícito, sin SVG.
export function ExercisePoster({ exId, className = '', note = null }) {
  const poster = posterFor(exId);
  const [broken, setBroken] = useState(false);
  const nombre = EXERCISES[exId]?.nombre ?? exId;
  if (!poster || broken) {
    return (
      <div className={`flex flex-col items-center justify-center bg-black/60 p-2 text-center ${className}`} data-poster="missing" data-ex={exId} role="img" aria-label={`${nombre}: imagen no disponible`}>
        <span className="text-sm font-bold text-sand-100">{nombre}</span>
        <span className="text-[13px] font-semibold text-sand-300">{note ?? 'Imagen no disponible'}</span>
      </div>
    );
  }
  return (
    <img
      src={poster}
      alt={`${nombre}: fotograma del vídeo`}
      className={`object-contain ${className}`}
      data-poster="ok"
      data-ex={exId}
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

function VideoDemo({ exId, src, poster, playing = true, dark = false, className = '' }) {
  const ref = useRef(null);
  const token = useRef(0); // invalida promesas de play() obsoletas
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  const [userPlay, setUserPlay] = useState(false);
  const [blocked, setBlocked] = useState(false); // play() rechazado (no AbortError) vigente
  const [stalled, setStalled] = useState(null); // null | 'loading' | 'stopped'
  const [progressing, setProgressing] = useState(false); // progreso real observado
  const nombre = EXERCISES[exId].nombre;
  const want = playing && (!reduce || userPlay); // intención (no implica reproducción)

  // Espejos en ref para cambiar estado solo en transiciones (nunca por fotograma).
  const stalledRef = useRef(null);
  const blockedRef = useRef(false);
  const progRef = useRef(false);
  const lastProgress = useRef(0); // instante del último progreso observado (o inicio de plazo)
  const runStart = useRef(0); // inicio de la racha actual de progreso (0 = sin racha)
  const episode = useRef(null); // { retried } mientras dure un episodio de bloqueo
  const manualKick = useRef(false); // el gesto ya llamó a play(): el efecto no repite
  const setStall = (val) => {
    if (stalledRef.current === val) return;
    stalledRef.current = val;
    setStalled(val);
  };
  const setBlock = (val) => {
    if (blockedRef.current === val) return;
    blockedRef.current = val;
    setBlocked(val);
  };
  const setProg = (val) => {
    if (progRef.current === val) return;
    progRef.current = val;
    setProgressing(val);
  };

  // Fuente: se (re)asigna en cada montaje y se libera al desmontar. En StrictMode el
  // ciclo montaje→limpieza→montaje restaura la fuente que la limpieza quitó.
  const dead = useRef(false); // el elemento ya se liberó por error: nada más lo reanima
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    dead.current = false;
    if (v.getAttribute('src') !== src) {
      v.setAttribute('src', src);
      v.load();
    }
    return () => release(v);
  }, [src]);

  // Liberación explícita e idempotente: invalida promesas pendientes, pausa y vacía la fuente.
  const release = (v) => {
    token.current++;
    if (!v) return;
    v.pause();
    if (v.hasAttribute('src')) {
      v.removeAttribute('src');
      v.load();
    }
  };

  // Un intento de play(). Resolver NO acredita reproducción sana: eso lo decide el watchdog.
  const attempt = (v) => {
    if (dead.current) return;
    const my = ++token.current;
    let p;
    try {
      p = v.play();
    } catch {
      p = Promise.reject(new Error('play'));
    }
    Promise.resolve(p).then(
      // Resolver no retira el control ni cierra el episodio: solo lo hace markProgress
      // tras HEALTHY_MS de progreso sostenido (o la cancelación explícita de la intención).
      () => {},
      (err) => {
        // Obsoleta o AbortError: no es bloqueo; si no hay progreso, el plazo lo detecta.
        if (my !== token.current || err?.name === 'AbortError') return;
        if (!episode.current) episode.current = { retried: false }; // abre/conserva episodio
        setBlock(true);
        setProg(false);
        runStart.current = 0;
      },
    );
  };

  // Intención + vigilancia: un único watchdog (intervalo + rVFC) por demo mientras se quiera
  // reproducir. Se suspende en segundo plano y revalida al volver, sin remontar ni load().
  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    if (!want) {
      token.current++;
      v.pause();
      episode.current = null;
      setStall(null);
      setBlock(false); // cancelación explícita de la intención
      setProg(false);
      return;
    }

    let alive = true;
    let iv = 0;
    let fcb = 0;
    let suspended = false;
    let lastT = v.currentTime;
    let lastMedia = -1;
    const hasRVFC = typeof v.requestVideoFrameCallback === 'function';
    lastProgress.current = performance.now();
    runStart.current = 0;
    episode.current = null;

    const markProgress = () => {
      const now = performance.now();
      if (!runStart.current || now - lastProgress.current > GAP_MS) runStart.current = now;
      lastProgress.current = now;
      setProg(true);
      if (now - runStart.current >= HEALTHY_MS) {
        episode.current = null; // solo el progreso sostenido cierra el episodio
        setStall(null);
        setBlock(false);
      }
    };

    const autoRetry = () => {
      if (!episode.current) episode.current = { retried: false };
      if (episode.current.retried) return false;
      episode.current.retried = true;
      attempt(v);
      return true;
    };

    const tick = () => {
      if (!alive || suspended || document.hidden) return;
      if (!hasRVFC) {
        // Alternativa: avance de currentTime (incluye vuelta del loop); búsqueda no cuenta.
        const t = v.currentTime;
        if (!v.paused && !v.seeking && t !== lastT) markProgress();
        lastT = t;
      }
      if (performance.now() - lastProgress.current >= STALL_MS) {
        setProg(false);
        runStart.current = 0;
        setStall(v.readyState < 3 ? 'loading' : 'stopped');
        autoRetry();
      }
    };

    const onFrame = (_now, meta) => {
      fcb = 0;
      if (!alive || suspended) return;
      if (!v.paused && !v.seeking && meta.mediaTime !== lastMedia) markProgress();
      lastMedia = meta.mediaTime;
      fcb = v.requestVideoFrameCallback(onFrame);
    };

    const startWatch = () => {
      if (!iv) iv = window.setInterval(tick, TICK_MS);
      if (hasRVFC && !fcb) fcb = v.requestVideoFrameCallback(onFrame);
    };
    const stopWatch = () => {
      if (iv) window.clearInterval(iv);
      iv = 0;
      if (fcb) v.cancelVideoFrameCallback?.(fcb);
      fcb = 0;
    };

    // Instante de ocultación: el plazo STALL_MS cuenta solo tiempo VISIBLE sin progreso.
    let hiddenAt = 0;
    const onHide = () => {
      if (suspended) return; // pagehide/visibilitychange duplicados: idempotente
      suspended = true;
      hiddenAt = performance.now();
      stopWatch();
      setProg(false); // en segundo plano no se acredita reproducción
      runStart.current = 0; // la racha sana no cruza el segundo plano
    };
    const onShow = () => {
      if (!suspended || document.hidden) return;
      suspended = false;
      // Pausa (no reinicio) del plazo: se desplaza por el tiempo oculto, de modo que el
      // tiempo visible acumulado sin progreso se conserva entre alternancias cortas.
      // SIN renovar el presupuesto de reintentos.
      if (hiddenAt) lastProgress.current += performance.now() - hiddenAt;
      hiddenAt = 0;
      runStart.current = 0;
      lastT = v.currentTime;
      startWatch();
      if (v.paused) {
        // Pausa ya comprobada: control inmediato y, después, como mucho el reintento único.
        setProg(false);
        setStall('stopped');
        autoRetry();
      }
      tick();
    };
    const onVis = () => (document.hidden ? onHide() : onShow());
    // Pausa no pedida por nosotros (con intención y visible): botón inmediato.
    const onPause = () => {
      if (!alive || suspended || document.hidden) return;
      setProg(false);
      runStart.current = 0;
      setStall('stopped');
      if (!episode.current) episode.current = { retried: false };
    };
    // waiting/stalled no son errores irreversibles: solo provocan una comprobación.
    const onCheck = () => tick();

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onShow);
    window.addEventListener('pagehide', onHide);
    v.addEventListener('pause', onPause);
    v.addEventListener('waiting', onCheck);
    v.addEventListener('stalled', onCheck);

    if (manualKick.current) manualKick.current = false; // el gesto ya llamó a play()
    else attempt(v);
    if (document.hidden) {
      suspended = true; // oculta al montar: el plazo empieza a contar al hacerse visible
      hiddenAt = performance.now();
    } else startWatch();

    return () => {
      alive = false;
      stopWatch();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('pagehide', onHide);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('waiting', onCheck);
      v.removeEventListener('stalled', onCheck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want, failed]);

  const showPause = reduce && userPlay && progressing && !stalled && !blocked;

  // Gesto del usuario: play()/pause() síncronos desde el toque (sin await previo).
  const onToggle = () => {
    const v = ref.current;
    if (!v || dead.current) return;
    if (showPause) {
      setUserPlay(false); // pausa voluntaria: el efecto pausa y no se reanuda solo
      return;
    }
    if (reduce && !userPlay) {
      manualKick.current = true; // evita el doble intento gesto+efecto
      setUserPlay(true);
    }
    attempt(v);
  };

  if (failed) {
    return (
      <div className={`relative ${className}`} data-demo="fallback" data-ex={exId}>
        <ExercisePoster exId={exId} className="h-full w-full" note="Vídeo e imagen no disponibles" />
        <p role="status" className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-1 text-center text-sm font-semibold text-sand-100">
          Vídeo no disponible · imagen estática del ejercicio
        </p>
      </div>
    );
  }

  const healthy = progressing && !stalled && !blocked;
  const showButton = playing && (blocked || !!stalled || reduce);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      data-demo="video"
      data-ex={exId}
      data-playing={healthy ? 'true' : 'false'}
      data-blocked={blocked ? 'true' : 'false'}
      data-stalled={stalled ?? 'false'}
    >
      <video
        ref={ref}
        muted
        playsInline
        loop
        preload={reduce ? 'metadata' : 'auto'}
        poster={poster || undefined}
        disablePictureInPicture
        className="h-full w-full object-contain"
        aria-label={`Demostración en vídeo: ${nombre}`}
        onError={(e) => {
          // Solo cuenta como fallo un error de la fuente vigente (no el vaciado al desmontar).
          const v = e.currentTarget;
          if (dead.current || !v.getAttribute('src')) return;
          // El <video> va a salir del DOM sin que se limpie el efecto de fuente: liberarlo ya.
          dead.current = true;
          release(v);
          setBlock(false);
          setStall(null);
          setProg(false);
          setFailed(true);
        }}
      />
      {playing && stalled && (
        <p role="status" className="absolute inset-x-0 top-0 bg-black/75 px-2 py-1 text-center text-sm font-semibold text-sand-100" data-video-status={stalled}>
          {stalled === 'loading' ? 'Cargando vídeo…' : 'Vídeo detenido'} · toca «Reproducir vídeo»
        </p>
      )}
      {showButton && (
        <button type="button" onClick={onToggle} className="o28-vidbtn" data-action="video-toggle">
          {showPause ? 'Pausar vídeo' : 'Reproducir vídeo'}
        </button>
      )}
    </div>
  );
}
