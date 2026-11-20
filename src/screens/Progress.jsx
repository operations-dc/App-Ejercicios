import { useRef, useState } from 'react';
import { exportJSON, importJSON, racha, today } from '../lib/storage.js';
import { workoutFor } from '../data/plan.js';
import { codigo, rango } from '../data/military.js';
import { pad2 } from './Home.jsx';

const SENS = { facil: 'Fácil', bien: 'Bien', duro: 'Duro' };
const fecha = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

// Parte de servicio (EX-006) con datos reales: misiones del ciclo, estadísticas,
// peso, historial y copia de seguridad (exportar/importar/reiniciar reales).
export default function Progress({ state, setState }) {
  const fileRef = useRef(null);
  const [kg, setKg] = useState('');
  const totalMin = Math.round(state.historial.reduce((s, h) => s + (h.duracionSeg || 0), 0) / 60);
  const hechos = Object.keys(state.completados).length;
  const rg = rango(state.historial.length);
  const ultimo = state.pesos[state.pesos.length - 1];

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
      if (window.confirm('Esto reemplazará los datos actuales. ¿Continuar?')) setState(data);
    } catch {
      window.alert('No se pudo leer el archivo.');
    }
    e.target.value = '';
  };

  const reiniciar = () => {
    if (window.confirm('¿Reiniciar el reto actual? Se mantiene el historial y el peso.')) setState((s) => ({ ...s, completados: {} }));
  };

  return (
    <div className="o28-body safe-top" data-screen="service">
      <div className="svc-head">
        <div className="code">Registro de misiones · Nivel {state.ciclo} · {rg.nombre}</div>
        <h1>Parte de servicio</h1>
        <p>
          {state.historial.length === 0
            ? 'Estado inicial: aún no hay misiones registradas.'
            : rg.siguiente
              ? `Faltan ${rg.siguiente.faltan} misiones para ${rg.siguiente.nombre}.`
              : 'Rango máximo alcanzado.'}
        </p>
      </div>

      <div className="ledger-top">
        <div className="hd"><div className="big tnum">{hechos}<small>/28</small></div><div className="kicker" style={{ paddingBottom: 6 }}>Misiones cumplidas · nivel {state.ciclo}</div></div>
        <div className="cells" role="img" aria-label={`${hechos} de 28 misiones cumplidas en este nivel`}>
          {[0, 1, 2, 3].map((w) => (
            <div className="wk" key={w}>
              {Array.from({ length: 7 }, (_, i) => w * 7 + i + 1).map((d) => <i key={d} className={state.completados[d] ? 'on' : ''} />)}
            </div>
          ))}
        </div>
        <div className="cells lab code" aria-hidden="true"><span>F1</span><span>F2</span><span>F3</span><span>F4</span></div>
      </div>

      <div className="stat-row tnum">
        <div><b>{state.historial.length}</b><span>Sesiones</span></div>
        <div><b>{totalMin}</b><span>Minutos</span></div>
        <div><b>{racha(state.historial)} d</b><span>Racha</span></div>
      </div>

      <section className="svc-block" aria-labelledby="h-peso">
        <div className="block-h"><h2 id="h-peso">Peso (kg)</h2><span className="code">{state.pesos.length} registros</span></div>
        <div className="weight">
          <div className="v tnum">{ultimo ? `${ultimo.kg} kg` : 'Sin registrar'}</div>
          <WeightChart pesos={state.pesos} />
          <form onSubmit={addPeso}>
            <input value={kg} onChange={(e) => setKg(e.target.value)} inputMode="decimal" placeholder="Peso de hoy, p. ej. 78,5" aria-label="Peso de hoy en kg" />
            <button className="btn btn-ghost" style={{ fontSize: 16, minHeight: 48 }}>Registrar</button>
          </form>
        </div>
      </section>

      <section className="svc-block" aria-labelledby="h-hist">
        <div className="block-h"><h2 id="h-hist">Historial</h2><span className="code">{state.historial.length} entradas</span></div>
        <div className="log" role="table" aria-label="Historial de misiones">
          <div className="log-h" role="row">
            <span role="columnheader">Misión</span><span role="columnheader">Fecha</span><span role="columnheader">Durac.</span><span role="columnheader">Sensación</span>
          </div>
          {state.historial.length === 0 ? (
            <div className="log-empty"><div><b>Sin entradas</b><p>La primera entrada aparecerá al completar la Misión 01.</p></div></div>
          ) : (
            [...state.historial].reverse().slice(0, 40).map((h, i) => (
              <div className="log-r tnum" role="row" key={i} title={codigo(workoutFor(h.dia, h.ciclo))}>
                <span role="cell">M{pad2(h.dia)}{h.ciclo > 1 ? ` · N${h.ciclo}` : ''}</span>
                <span role="cell">{fecha(h.fecha)}</span>
                <span role="cell">{Math.max(1, Math.round(h.duracionSeg / 60))} min</span>
                <span role="cell">{SENS[h.sensacion] || '—'}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="svc-block backup" aria-labelledby="h-backup">
        <div className="block-h"><h2 id="h-backup">Copia de seguridad</h2><span className="code">Local</span></div>
        <p>Los datos se guardan solo en este dispositivo. Exporta una copia de vez en cuando.</p>
        <div className="row">
          <button className="btn btn-ghost" onClick={() => exportJSON(state)}>Exportar</button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Importar</button>
          <button className="btn btn-danger wide" onClick={reiniciar}>Reiniciar campaña</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} aria-label="Archivo de copia de seguridad" />
        </div>
      </section>
    </div>
  );
}

// Línea simple de evolución del peso. Tocar un punto muestra su valor.
function WeightChart({ pesos }) {
  const [sel, setSel] = useState(null);
  if (pesos.length < 2) {
    return <p>{pesos.length === 1 ? `Último registro: ${pesos[0].kg} kg. Añade otro para ver la evolución.` : 'Registra tu peso para ver la evolución.'}</p>;
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
    <div style={{ marginTop: 6 }}>
      <p>
        {data[s].kg} kg · {fecha(data[s].fecha)} ({diff > 0 ? '+' : ''}{diff} kg desde {fecha(data[0].fecha)})
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', marginTop: 4 }} role="img" aria-label="Evolución del peso">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#3d4832" strokeWidth="1" />
            <text x={pl - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#bdb397">{Math.round(t * 10) / 10}</text>
          </g>
        ))}
        <text x={pl} y={H - 6} fontSize="10" fill="#bdb397">{fecha(data[0].fecha)}</text>
        <text x={W - pr} y={H - 6} fontSize="10" fill="#bdb397" textAnchor="end">{fecha(data[data.length - 1].fecha)}</text>
        <line x1={x(s)} x2={x(s)} y1={pt} y2={H - pb} stroke="#6f5f2e" strokeWidth="1" strokeDasharray="3 3" />
        <polyline points={data.map((d, i) => `${x(i)},${y(d.kg)}`).join(' ')} fill="none" stroke="#c9a74c" strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.fecha} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)}>
            <circle cx={x(i)} cy={y(d.kg)} r="14" fill="transparent" />
            <circle cx={x(i)} cy={y(d.kg)} r={i === s ? 5 : 4} fill="#c9a74c" stroke="#11140d" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
