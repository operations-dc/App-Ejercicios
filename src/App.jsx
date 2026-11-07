import { useEffect, useState } from 'react';
import Home from './screens/Home.jsx';
import DaySheet from './screens/DaySheet.jsx';
import Session from './screens/Session.jsx';
import Done from './screens/Done.jsx';
import Library from './screens/Library.jsx';
import Progress from './screens/Progress.jsx';
import { Icon } from './components/ui.jsx';
import { load, save, today } from './lib/storage.js';

const TABS = [
  { id: 'reto', label: 'Reto', icon: 'grid' },
  { id: 'ejercicios', label: 'Ejercicios', icon: 'list' },
  { id: 'progreso', label: 'Progreso', icon: 'chart' },
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
      setToast(`Completa el día ${dia - 1} para desbloquear este`);
      return;
    }
    setDiaAbierto(dia);
  };

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

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <main className="flex-1 overflow-y-auto">
        {tab === 'reto' && <Home state={state} setState={setState} onOpenDay={abrirDia} />}
        {tab === 'ejercicios' && <Library />}
        {tab === 'progreso' && <Progress state={state} setState={setState} />}
      </main>

      <nav className="safe-bottom grid grid-cols-3 border-t border-line bg-card/95 pt-2 backdrop-blur">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${tab === t.id ? 'text-accent' : 'text-muted'}`}>
            <Icon name={t.icon} />
            {t.label}
          </button>
        ))}
      </nav>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      )}

      {diaAbierto && (
        <DaySheet
          dia={diaAbierto}
          ciclo={state.ciclo}
          hecho={!!state.completados[diaAbierto]}
          onClose={() => setDiaAbierto(null)}
          onStart={(w) => {
            setDiaAbierto(null);
            setSesion(w);
          }}
        />
      )}
      {sesion && (
        <Session
          workout={sesion}
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
