import { useEffect, useRef } from 'react';

// Piezas de interfaz reutilizables (estilo Operación 28).

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Aislamiento del fondo: todo hermano de cada ancestro del diálogo (hasta <body>) pasa a
// inert + aria-hidden. Nunca toca el propio diálogo ni sus ancestros. Recuento por nodo
// para diálogos anidados/StrictMode; los nodos que ya eran inertes (p. ej. el fondo que
// App marca por props de React) no se tocan, así React sigue siendo su único dueño.
const isolated = new Map(); // el -> { count, aria }
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'LINK', 'META', 'NOSCRIPT']);

function isolate(node) {
  const touched = [];
  for (let el = node; el && el !== document.body && el.parentElement; el = el.parentElement) {
    for (const sib of el.parentElement.children) {
      if (sib === el || SKIP.has(sib.tagName)) continue;
      // Las regiones vivas (toasts) siguen anunciándose.
      if (sib.matches('[aria-live],[role="status"],[role="alert"]')) continue;
      const rec = isolated.get(sib);
      if (rec) rec.count++;
      else if (sib.hasAttribute('inert')) continue;
      else {
        isolated.set(sib, { count: 1, aria: sib.getAttribute('aria-hidden') });
        sib.setAttribute('inert', '');
        sib.setAttribute('aria-hidden', 'true');
      }
      touched.push(sib);
    }
  }
  return () => {
    for (const sib of touched) {
      const rec = isolated.get(sib);
      if (!rec || --rec.count > 0) continue;
      isolated.delete(sib);
      sib.removeAttribute('inert');
      if (rec.aria === null) sib.removeAttribute('aria-hidden');
      else sib.setAttribute('aria-hidden', rec.aria);
    }
  };
}

// Diálogo modal: foco inicial dentro, Tab atrapado, Escape → onEscape, fondo aislado
// (inert/aria-hidden) y, al cerrar, el foco vuelve al elemento que lo abrió (si sigue
// en el documento).
export function useDialog(onEscape) {
  const ref = useRef(null);
  const escRef = useRef(onEscape);
  escRef.current = onEscape;
  useEffect(() => {
    const node = ref.current;
    const opener = document.activeElement;
    // El backdrop del Sheet es el contenedor: se aísla desde él para que no quede inerte.
    const release = node ? isolate(node.parentElement?.hasAttribute('data-dialog-backdrop') ? node.parentElement : node) : () => {};
    const first = node?.querySelector('[data-autofocus]') || node?.querySelector(FOCUSABLE) || node;
    first?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (!node) return;
      if (e.key === 'Escape' && escRef.current) {
        e.preventDefault();
        escRef.current();
      } else if (e.key === 'Tab') {
        const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (!items.length) {
          e.preventDefault();
          return;
        }
        const a = items[0];
        const z = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === a || !node.contains(document.activeElement))) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && (document.activeElement === z || !node.contains(document.activeElement))) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    // Solo el diálogo superior atiende el teclado.
    const top = () => {
      const all = document.querySelectorAll('[data-dialog-layer]');
      return all[all.length - 1] === node;
    };
    const handler = (e) => top() && onKey(e);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      release(); // antes de devolver el foco: un nodo inerte no lo acepta
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}

export function Sheet({ onClose, children, label = 'Detalle' }) {
  const ref = useDialog(onClose);
  return (
    <div data-dialog-backdrop="" className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        ref={ref}
        data-dialog-layer=""
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="sheet o28-sheet safe-bottom max-h-[92vh] w-full max-w-md overflow-y-auto px-5 pt-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="o28-iconbtn" aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Pantalla completa modal (briefing, sesión, parte final).
export function ScreenDialog({ label, onEscape, className = '', children, ...rest }) {
  const ref = useDialog(onEscape);
  return (
    <div ref={ref} data-dialog-layer="" tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={`o28-screen ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Chip({ children, dark = false }) {
  return (
    <span className={`rounded-sm px-2 py-0.5 text-[13px] font-semibold tracking-wide uppercase ring-1 ${dark ? 'bg-olive-800 text-sand-200 ring-olive-500' : 'bg-sand-200 text-ink-soft ring-sand-300'}`}>
      {children}
    </span>
  );
}

// Insignia de rango en SVG (galones latón; estrellas a partir de oficial).
export function RankBadge({ nivel, className = 'h-8 w-8' }) {
  const chevrons = Math.min(nivel, 5);
  const stars = Math.max(0, nivel - 5);
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="4" fill="#2a3120" stroke="#c9a227" strokeWidth="1.5" />
      {stars > 0
        ? Array.from({ length: stars }, (_, i) => {
            const cx = 16 + (i - (stars - 1) / 2) * 8;
            return <path key={i} d={`M${cx} 10l1.8 4.2 4.4.3-3.4 2.9 1.1 4.4-3.9-2.4-3.9 2.4 1.1-4.4-3.4-2.9 4.4-.3z`} fill="#c9a227" />;
          })
        : Array.from({ length: chevrons }, (_, i) => (
            <path key={i} d={`M8 ${9 + i * 3.6}l8 4.5 8-4.5`} fill="none" stroke="#c9a227" strokeWidth="2.2" strokeLinejoin="round" />
          ))}
      {nivel === 0 && <circle cx="16" cy="16" r="3" fill="#c9a227" />}
    </svg>
  );
}

export function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    lock: <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" />,
    pause: <path d="M8 5v14M16 5v14" />,
    next: <path d="M6 5.5v13l9-6.5zM18 5v14" />,
    prev: <path d="M18 5.5v13l-9-6.5zM6 5v14" />,
    sound: <path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />,
    mute: <path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6" />,
    flame: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-.5-3 0-6 1-8.5z" />,
    grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
    list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
    chart: <path d="M4 19h16M6 15l4-4 3 3 5-6" />,
    music: <path d="M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
    'music-off': <path d="M9 18V9M9 6l11-2v8M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM3 3l18 18" />,
    headphones: <path d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z" />,
    edit: <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />,
    target: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
