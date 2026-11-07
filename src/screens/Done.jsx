import { useState } from 'react';

const SENSACIONES = [
  { id: 'facil', label: 'Fácil', emoji: '😌' },
  { id: 'bien', label: 'Bien', emoji: '💪' },
  { id: 'duro', label: 'Duro', emoji: '🥵' },
];

export default function Done({ workout, duracionSeg, onSave }) {
  const [sens, setSens] = useState(null);
  return (
    <div className="safe-top safe-bottom fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <p className="text-5xl">🎉</p>
      <p className="mt-3 text-xs font-semibold tracking-[0.2em] text-accent uppercase">Día {workout.dia} completado</p>
      <h2 className="mt-1 text-2xl font-black">{workout.titulo}</h2>
      <p className="mt-1 text-white/60">{Math.max(1, Math.round(duracionSeg / 60))} min de entrenamiento</p>

      <p className="mt-8 text-sm text-white/80">¿Cómo te ha resultado?</p>
      <div className="mt-3 flex gap-3">
        {SENSACIONES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSens(s.id)}
            className={`w-20 rounded-2xl py-3 ring-1 ${sens === s.id ? 'bg-accent ring-accent' : 'bg-white/5 ring-white/15'}`}
          >
            <span className="block text-2xl">{s.emoji}</span>
            <span className="text-xs font-semibold">{s.label}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onSave(sens)} className="mt-10 w-full max-w-xs rounded-full bg-white py-3.5 font-bold text-ink">
        Guardar
      </button>
    </div>
  );
}
