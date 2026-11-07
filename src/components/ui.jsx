// Piezas de interfaz reutilizables.
export function Sheet({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="sheet safe-bottom max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card px-5 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}

export function Chip({ children }) {
  return <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line">{children}</span>;
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
    edit: <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
