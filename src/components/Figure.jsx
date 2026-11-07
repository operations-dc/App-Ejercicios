import { useEffect, useMemo, useRef } from 'react';
import { EXERCISES } from '../data/exercises.js';
import { frameAt, stillFrame } from '../anim/figure.js';
import { svgMarkup } from '../anim/render.js';

// Figura animada (o estática) de un ejercicio.
export default function Figure({ exId, playing = true, still = 1, dark = false, className = '' }) {
  const ex = EXERCISES[exId];
  const ref = useRef(null);
  const initial = useMemo(() => svgMarkup(stillFrame(ex.anim, still)), [ex, still]);

  useEffect(() => {
    if (!playing || !ref.current) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const m = svgMarkup(frameAt(ex.anim, now - start));
      ref.current.setAttribute('viewBox', m.viewBox);
      ref.current.innerHTML = m.inner;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ex, playing]);

  return (
    <svg
      ref={ref}
      key={exId + String(playing)}
      viewBox={initial.viewBox}
      className={`fig ${dark ? 'fig-dark' : ''} ${className}`}
      role="img"
      aria-label={ex.nombre}
      dangerouslySetInnerHTML={{ __html: initial.inner }}
    />
  );
}
