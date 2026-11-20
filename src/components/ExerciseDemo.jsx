import { useEffect, useRef, useState } from 'react';
import Figure from './Figure.jsx';
import { EXERCISES } from '../data/exercises.js';
import { DEMO_VIDEOS } from '../data/media.js';

const RM_QUERY = '(prefers-reduced-motion: reduce)';

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
// - Si el vídeo falla, muestra la guía animada con un aviso legible.
export default function ExerciseDemo(props) {
  const src = DEMO_VIDEOS[props.exId];
  if (!src) return <Figure exId={props.exId} playing={props.playing} dark={props.dark} className={props.className} />;
  return <VideoDemo key={props.exId} src={src} {...props} />;
}

function VideoDemo({ exId, src, playing = true, dark = false, className = '' }) {
  const ref = useRef(null);
  const token = useRef(0); // invalida promesas de play() obsoletas
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  const [userPlay, setUserPlay] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const nombre = EXERCISES[exId].nombre;
  const want = playing && (!reduce || userPlay);

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
      () => {
        if (my === token.current) setBlocked(false);
      },
      (err) => {
        // AbortError = interrumpido por pause()/load() propios: no es un bloqueo.
        if (my !== token.current || err?.name === 'AbortError') return;
        setBlocked(true);
        setIsPlaying(false);
      },
    );
  };

  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    if (want) attempt(v);
    else {
      token.current++;
      v.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want, failed]);

  // Gesto del usuario: reproducir/pausar el vídeo directamente desde el toque.
  const onToggle = () => {
    const v = ref.current;
    if (!v) return;
    if (isPlaying) {
      token.current++;
      v.pause();
      if (reduce) setUserPlay(false);
      return;
    }
    if (reduce) setUserPlay(true);
    attempt(v);
  };

  if (failed) {
    return (
      <div className={`relative ${className}`} data-demo="fallback" data-ex={exId}>
        <Figure exId={exId} playing={playing} dark={dark} className="h-full w-full" />
        <p role="status" className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-1 text-center text-sm font-semibold text-sand-100">
          Vídeo no disponible · guía animada
        </p>
      </div>
    );
  }

  const showButton = playing && (blocked || reduce);
  return (
    <div className={`relative overflow-hidden ${className}`} data-demo="video" data-ex={exId} data-playing={isPlaying ? 'true' : 'false'} data-blocked={blocked ? 'true' : 'false'}>
      <video
        ref={ref}
        muted
        playsInline
        loop
        preload={reduce ? 'metadata' : 'auto'}
        disablePictureInPicture
        className="h-full w-full object-contain"
        aria-label={`Demostración en vídeo: ${nombre}`}
        onPlay={() => setIsPlaying(true)}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          // Solo cuenta como fallo un error de la fuente vigente (no el vaciado al desmontar).
          const v = e.currentTarget;
          if (dead.current || !v.getAttribute('src')) return;
          // El <video> va a salir del DOM sin que se limpie el efecto de fuente: liberarlo ya.
          dead.current = true;
          release(v);
          setBlocked(false);
          setIsPlaying(false);
          setFailed(true);
        }}
      />
      {showButton && (
        <button type="button" onClick={onToggle} className="o28-vidbtn" data-action="video-toggle">
          {isPlaying ? 'Pausar vídeo' : 'Reproducir vídeo'}
        </button>
      )}
    </div>
  );
}
