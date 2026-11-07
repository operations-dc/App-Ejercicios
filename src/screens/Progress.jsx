import { useRef, useState } from 'react';
import { exportJSON, importJSON, racha, today } from '../lib/storage.js';
import { workoutFor } from '../data/plan.js';

const SENS = { facil: '😌 Fácil', bien: '💪 Bien', duro: '🥵 Duro' };
const fecha = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

export default function Progress({ state, setState }) {
  const fileRef = useRef(null);
  const [kg, setKg] = useState('');
  const totalMin = Math.round(state.historial.reduce((s, h) => s + (h.duracionSeg || 0), 0) / 60);

  const addPeso = (e) => {
    e.preventDefault();
    const v = parseFloat(kg.replace(',', '.'));
    if (!v || v < 20 || v > 300) return;
    setState((s) => ({
      ...s,
      perfil: { ...s.perfil, pesoKg: v },
      pesos: [...s.pesos.filter((p) => p.fecha !== today()), { fecha: today(), kg: v }].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    }));
    setKg('');
  };

  const onImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await importJSON(f);
      if (confirm('Esto reemplazará los datos actuales. ¿Continuar?')) setState(data);
    } catch {
      alert('No se pudo leer el archivo.');
    }
    e.target.value = '';
  };

  const reiniciar = () => {
    if (confirm('¿Reiniciar el reto actual? Se mantiene el historial y el peso.')) setState((s) => ({ ...s, completados: {} }));
  };

  return (
    <div className="safe-top px-4 pb-6">
      <h1 className="pb-3 text-2xl font-black">Progreso</h1>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Sesiones" value={state.historial.length} />
        <Stat label="Minutos" value={totalMin} />
        <Stat label="Racha" value={`${racha(state.historial)} d`} />
      </div>

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <h2 className="text-sm font-semibold">Peso (kg)</h2>
        <WeightChart pesos={state.pesos} />
        <form onSubmit={addPeso} className="mt-3 flex gap-2">
          <input
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            inputMode="decimal"
            placeholder="Peso de hoy, p. ej. 78,5"
            className="min-w-0 flex-1 rounded-full bg-paper px-4 py-2 text-sm ring-1 ring-line outline-none focus:ring-accent"
          />
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Añadir</button>
        </form>
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <h2 className="text-sm font-semibold">Historial</h2>
        {state.historial.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Aún no hay sesiones. ¡Empieza hoy con el día 1!</p>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {[...state.historial].reverse().slice(0, 40).map((h, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <b>Día {h.dia}</b> · {workoutFor(h.dia, h.ciclo).titulo}
                  <span className="block text-xs text-muted">
                    {fecha(h.fecha)} · {Math.max(1, Math.round(h.duracionSeg / 60))} min · Nivel {h.ciclo}
                  </span>
                </span>
                <span className="text-xs">{SENS[h.sensacion] || ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line">
        <h2 className="text-sm font-semibold">Copia de seguridad</h2>
        <p className="mt-1 text-xs text-muted">Los datos se guardan solo en este dispositivo. Exporta una copia de vez en cuando.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => exportJSON(state)} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Exportar</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line">Importar</button>
          <button onClick={reiniciar} className="rounded-full px-4 py-2 text-sm font-semibold text-accent ring-1 ring-line">Reiniciar reto</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center ring-1 ring-line">
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

// Línea simple de evolución del peso. Tocar un punto muestra su valor.
function WeightChart({ pesos }) {
  const [sel, setSel] = useState(null);
  if (pesos.length < 2) {
    return <p className="mt-2 text-sm text-muted">{pesos.length === 1 ? `Último registro: ${pesos[0].kg} kg. Añade otro para ver la evolución.` : 'Registra tu peso para ver la evolución.'}</p>;
  }
  const data = pesos.slice(-30);
  const W = 320, H = 140, pl = 34, pr = 12, pt = 12, pb = 22;
  const vals = data.map((d) => d.kg);
  const lo = Math.floor(Math.min(...vals) - 1);
  const hi = Math.ceil(Math.max(...vals) + 1);
  const x = (i) => pl + (i * (W - pl - pr)) / (data.length - 1);
  const y = (v) => pt + ((hi - v) * (H - pt - pb)) / (hi - lo);
  const ticks = [lo, (lo + hi) / 2, hi];
  const s = sel ?? data.length - 1;
  const d0 = data[0].kg, d1 = data[data.length - 1].kg;
  const diff = Math.round((d1 - d0) * 10) / 10;
  return (
    <div className="mt-2">
      <p className="text-xs text-muted">
        {data[s].kg} kg · {fecha(data[s].fecha)}
        <span className="ml-2">({diff > 0 ? '+' : ''}{diff} kg desde {fecha(data[0].fecha)})</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img" aria-label="Evolución del peso">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#e7e5e4" strokeWidth="1" />
            <text x={pl - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#78716c">{Math.round(t * 10) / 10}</text>
          </g>
        ))}
        <text x={pl} y={H - 6} fontSize="10" fill="#78716c">{fecha(data[0].fecha)}</text>
        <text x={W - pr} y={H - 6} fontSize="10" fill="#78716c" textAnchor="end">{fecha(data[data.length - 1].fecha)}</text>
        <line x1={x(s)} x2={x(s)} y1={pt} y2={H - pb} stroke="#d6d3d1" strokeWidth="1" strokeDasharray="3 3" />
        <polyline points={data.map((d, i) => `${x(i)},${y(d.kg)}`).join(' ')} fill="none" stroke="#e4572e" strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.fecha} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)}>
            <circle cx={x(i)} cy={y(d.kg)} r="14" fill="transparent" />
            <circle cx={x(i)} cy={y(d.kg)} r={i === s ? 5 : 4} fill="#e4572e" stroke="#fff" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
