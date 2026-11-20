import { useState } from 'react';
import { workoutFor } from '../data/plan.js';
import { FASES, codigo } from '../data/military.js';
import { INSTRUCTOR_IMG } from '../data/media.js';
import { OBJETIVOS, today } from '../lib/storage.js';

export const pad2 = (n) => String(n).padStart(2, '0');

const Chevron = () => (
  <span className="chev" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
  </span>
);

// Base / puesto de mando (EX-006) con el estado real del reto: ciclo, misiones, objetivo y peso.
export default function Home({ state, setState, onOpenDay }) {
  const { completados, ciclo, perfil } = state;
  const hechos = Object.keys(completados).length;
  const siguiente = Array.from({ length: 28 }, (_, i) => i + 1).find((d) => !completados[d]);
  const hoyHecho = state.historial.some((h) => h.fecha === today());
  const [editPeso, setEditPeso] = useState(false);
  const semanaActual = siguiente ? Math.ceil(siguiente / 7) : 4;

  const guardarPeso = (v) => {
    const kg = parseFloat(String(v).replace(',', '.'));
    setEditPeso(false);
    if (!kg || kg < 20 || kg > 300) return;
    setState((s) => ({
      ...s,
      perfil: { ...s.perfil, pesoKg: kg },
      pesos: [...s.pesos.filter((p) => p.fecha !== today()), { fecha: today(), kg }],
    }));
  };

  const nuevoCiclo = () => setState((s) => ({ ...s, ciclo: s.ciclo + 1, completados: {} }));

  return (
    <div data-screen="base">
      <header className="cmdbar safe-top">
        <div>
          <div className="code">Puesto de mando</div>
          <div className="wordmark">OPERACIÓN<b>28</b></div>
        </div>
        <div className="meta">
          <div className="kicker">Campaña 28 d</div>
          <div className="kicker b">Nivel {ciclo}</div>
        </div>
      </header>

      <div className="o28-body">
        <div className="order-head">
          <span className="kicker b">{hoyHecho && siguiente ? 'Hoy cumplida · siguiente' : 'Orden del día'}</span>
          <span className="code">Fase {pad2(semanaActual)} · Semana {semanaActual}</span>
        </div>

        {siguiente ? (
          <Dossier dia={siguiente} ciclo={ciclo} hechos={hechos} onOpen={() => onOpenDay(siguiente)} />
        ) : (
          <>
            <article className="dossier ticks" aria-labelledby="m-title">
              <div className="dossier-main">
                <div className="mnum"><span className="n tnum" aria-hidden="true">28</span><div className="lbl"><span className="kicker">Campaña</span><strong>Completada</strong></div></div>
                <h1 className="mtitle" id="m-title">Operación completada</h1>
                <p className="msub">28 de 28. El nivel {ciclo + 1} usa ejercicios de nivel medio con más volumen.</p>
                <div className="status"><i aria-hidden="true"></i>Cumplida <span>· 28/28</span></div>
              </div>
              <Portrait caption="Campaña cerrada" />
            </article>
            <button className="btn btn-primary brief-cta" onClick={nuevoCiclo}>
              <span>Empezar nivel {ciclo + 1}</span>
              <Chevron />
            </button>
          </>
        )}

        <div className="sect-head">
          <h2>Campaña · 4 fases</h2>
          <span className="tnum">{hechos} / 28 misiones</span>
        </div>

        {[1, 2, 3, 4].map((sem) => (
          <section key={sem} className={`phase ${sem === semanaActual ? 'cur' : ''}`} aria-label={`Fase ${sem}: ${FASES[sem - 1]}`}>
            <h3 className="pname"><span className="pcode">F{sem}</span>{FASES[sem - 1]} <em>Sem. {sem} · {workoutFor(sem * 7, ciclo).nivel}</em></h3>
            <div className="track">
              {Array.from({ length: 7 }, (_, i) => (sem - 1) * 7 + i + 1).map((dia) => {
                const estado = completados[dia] ? 'done' : dia === siguiente ? 'next' : 'locked';
                const txt = estado === 'done' ? 'cumplida, repetir' : estado === 'next' ? 'siguiente' : 'bloqueada';
                return (
                  <button
                    key={dia}
                    className={`seg ${estado}`}
                    aria-label={`Misión ${dia} · ${txt}`}
                    aria-disabled={estado === 'locked' ? 'true' : undefined}
                    data-dia={dia}
                    onClick={() => onOpenDay(dia)}
                  >
                    <span className="d tnum">{pad2(dia)}</span>
                    <span className="bar" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="sect-head"><h2>Ficha</h2><span className="code">Este dispositivo</span></div>
        <div className="file">
          <div>
            <label className="kicker" htmlFor="objetivo">Objetivo</label>
            <select
              id="objetivo"
              className="v"
              value={perfil.objetivo}
              onChange={(e) => setState((s) => ({ ...s, perfil: { ...s.perfil, objetivo: e.target.value } }))}
            >
              {Object.entries(OBJETIVOS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="kicker" htmlFor="peso-home">Peso</label>
            {editPeso ? (
              <input
                id="peso-home"
                autoFocus
                inputMode="decimal"
                aria-label="Peso actual en kg"
                defaultValue={perfil.pesoKg ?? ''}
                className="v"
                onBlur={(e) => guardarPeso(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                  if (e.key === 'Escape') setEditPeso(false);
                }}
              />
            ) : (
              <button id="peso-home" className="v" onClick={() => setEditPeso(true)} aria-label={perfil.pesoKg ? `Peso actual ${perfil.pesoKg} kg, editar` : 'Añadir peso'}>
                {perfil.pesoKg ? `${perfil.pesoKg} kg` : 'Sin registrar'} <small>{perfil.pesoKg ? 'Editar' : 'Añadir'}</small>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Portrait({ caption }) {
  return (
    <figure className="portrait">
      <img src={INSTRUCTOR_IMG} width="1080" height="1446" alt="Instructor de Operación 28: camiseta oliva, barba y brazos tatuados" />
      <figcaption>
        <div className="kicker">Instructor</div>
        <div>{caption}</div>
      </figcaption>
    </figure>
  );
}

function Dossier({ dia, ciclo, hechos, onOpen }) {
  const w = workoutFor(dia, ciclo);
  return (
    <>
      <article className="dossier ticks" aria-labelledby="m-title">
        <div className="dossier-main">
          <div className="mnum">
            <span className="n tnum" aria-hidden="true">{pad2(dia)}</span>
            <div className="lbl">
              <span className="kicker">Misión</span>
              <strong>Fase {pad2(w.semana)}<br />{FASES[w.semana - 1].split(' ')[0]}</strong>
            </div>
          </div>
          <h1 className="mtitle" id="m-title"><span className="sr-only">Misión {dia}: </span>{codigo(w)}</h1>
          <p className="msub">{w.titulo}</p>
          <div className="specs tnum">
            <div>{w.minutos} min</div>
            <div>Sin material</div>
            {w.suave && <div>Suave</div>}
          </div>
          <div className="status"><i aria-hidden="true"></i>Listo <span>· {hechos}/28</span></div>
        </div>
        <Portrait caption={`Asignado a M${pad2(dia)}`} />
      </article>

      <button className="btn btn-primary brief-cta" onClick={onOpen} data-action="open-briefing">
        <span>Abrir briefing · M{pad2(dia)}</span>
        <Chevron />
      </button>
    </>
  );
}
