import { useEffect, useRef, useState } from 'react';
import Home from './screens/Home.jsx';
import DaySheet from './screens/DaySheet.jsx';
import Session from './screens/Session.jsx';
import Done from './screens/Done.jsx';
import Library from './screens/Library.jsx';
import Progress from './screens/Progress.jsx';
import { load, save, today } from './lib/storage.js';
import { unlockAudio } from './lib/audio.js';

// Navegación numerada EX-006: 01 Base · 02 Manual (ejercicios) · 03 Parte (progreso).
const TABS = [
  { id: 'reto', label: 'Base' },
  { id: 'ejercicios', label: 'Manual' },
  { id: 'progreso', label: 'Parte' },
];

export default function App() {
  const [state, setState] = useState(load);
  const [tab, setTab] = useState('reto');
  const [diaAbierto, setDiaAbierto] = useState(null);
  const [toast, setToast] = useState(null);
  const [sesion, setSesion] = useState(null); // workout en curso
  const [fin, setFin] = useState(null); // { workout, duracionSeg }

  useEffect(() => save(state), [state]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const abrirDia = (dia) => {
    // Un día se desbloquea al completar el anterior.
    if (dia > 1 && !state.completados[dia - 1] && !state.completados[dia]) {
      setToast(`Complete la misión ${dia - 1} para desbloquear esta`);
      return;
    }
    setDiaAbierto(dia);
  };

  const cambiarAjustes = (cambios) => setState((s) => ({ ...s, ajustes: { ...s.ajustes, ...cambios } }));

  const guardarSesion = (sensacion) => {
    const { workout, duracionSeg } = fin;
    const registro = { fecha: today(), duracionSeg, sensacion };
    setState((s) => ({
      ...s,
      completados: { ...s.completados, [workout.dia]: s.completados[workout.dia] || registro },
      historial: [...s.historial, { ...registro, ciclo: workout.ciclo, dia: workout.dia }],
    }));
    setFin(null);
    setTab('reto');
  };

  // Con un diálogo de pantalla completa abierto, el fondo queda inerte (sin foco ni clic)
  // y oculto a lectores de pantalla. Al cerrarse todos, el foco vuelve a la sección activa.
  const overlay = !!(diaAbierto || sesion || fin);
  const baseRef = useRef(null);
  const hadOverlay = useRef(false);
  useEffect(() => {
    if (overlay) hadOverlay.current = true;
    else if (hadOverlay.current) {
      hadOverlay.current = false;
      const a = document.activeElement;
      if (!a || a === document.body || !baseRef.current?.contains(a)) {
        const el = baseRef.current?.querySelector('[data-action="open-briefing"]') || baseRef.current?.querySelector('nav [aria-current="page"]');
        el?.focus({ preventScroll: true });
      }
    }
  }, [overlay]);
  const inertProps = overlay ? { inert: '', 'aria-hidden': 'true' } : {};

  return (
    <div className="o28-app">
      <div ref={baseRef} className="flex min-h-0 flex-1 flex-col" {...inertProps}>
        <main className="o28-main">
          {tab === 'reto' && <Home state={state} setState={setState} onOpenDay={abrirDia} />}
          {tab === 'ejercicios' && <Library />}
          {tab === 'progreso' && <Progress state={state} setState={setState} />}
        </main>

        <nav className="o28-nav" aria-label="Navegación principal">
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined} data-tab={t.id}>
              <span className="code" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {toast && (
        <div role="status" className="o28-toast">{toast}</div>
      )}

      {diaAbierto && (
        <DaySheet
          dia={diaAbierto}
          ciclo={state.ciclo}
          hecho={!!state.completados[diaAbierto]}
          ajustes={state.ajustes}
          onAjustes={cambiarAjustes}
          onClose={() => setDiaAbierto(null)}
          onStart={(w) => {
            unlockAudio(); // dentro del toque: iOS lo exige para sonar
            setDiaAbierto(null);
            setSesion(w);
          }}
        />
      )}
      {sesion && (
        <Session
          workout={sesion}
          ajustes={state.ajustes}
          onAjustes={cambiarAjustes}
          onExit={() => setSesion(null)}
          onFinish={(duracionSeg) => {
            setFin({ workout: sesion, duracionSeg });
            setSesion(null);
          }}
        />
      )}
      {fin && <Done workout={fin.workout} duracionSeg={fin.duracionSeg} onSave={guardarSesion} />}
    </div>
  );
}
