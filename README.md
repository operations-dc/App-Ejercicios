# Operación 28 · Calistenia en casa

**App:** https://operations-dc.github.io/App-Ejercicios/

App web instalable (PWA) para entrenar todos los días en casa, sin material. Inspirada en la mecánica de los retos de 28 días: una cuadrícula de días que se van desbloqueando, sesiones guiadas con temporizador y seguimiento del progreso.

**Versión de prueba:** interfaz militar con Base, Manual y Parte de servicio; instructor y piloto limitado de 4 vídeos locales (flexión, zancada hacia atrás, marcha y sentadilla). El progreso sigue siendo privado del navegador/dispositivo: **esta versión todavía no tiene login familiar ni sincronización en la nube**. Abrir la URL en otro dispositivo no transfiere los datos.

## Funciones

- **Reto de 28 días** con desbloqueo progresivo (el día N se abre al completar el N-1).
- **Sesión guiada**: calentamiento → circuito → vuelta a la calma, con temporizador, instrucciones de voz en inglés, pitidos 3-2-1 y aviso de cambio de lado. Interfaz en español. La voz y el bloqueo de pantalla dependen del soporte y permisos del navegador.
- **38 ejercicios** con técnica y versión más fácil. **Piloto limitado:** solo flexión, zancada hacia atrás, marcha y sentadilla tienen vídeo (sin audio) y póster; los otros 34 mantienen su guía animada SVG. La plancha queda pendiente (sin vídeo válido). En el Manual hay un filtro Todos / Vídeos (4). Si un vídeo falla se muestra su imagen estática con aviso, nunca otro ejercicio. No es una renovación completa del catálogo ni una certificación profesional de técnica.
- **Música**: generada en la propia app (Web Audio, sin licencias) que sube de intensidad en el circuito y se suaviza en los descansos; o modo *Uso mi música*, que se mezcla con Spotify/Apple Music sin cortarla. La música baja sola cuando habla la voz.
- **Progreso**: racha de días seguidos, historial con sensación (fácil/bien/duro), registro y gráfico de peso.
- **Datos locales** (localStorage) con exportación/importación a JSON.
- Funciona sin conexión después de una primera carga completa, incluidos los 4 vídeos, sus pósteres y las fuentes locales. No borres los datos del sitio para actualizarla: eso también elimina el progreso local.

## Plan de entrenamiento

Ciclo semanal, alternando intensidad y grupos musculares para poder entrenar a diario:

| Día | Sesión | Intensidad |
|---|---|---|
| 1 | Cuerpo completo | Media |
| 2 | Cardio y core | Media-alta |
| 3 | Piernas y glúteos | Media |
| 4 | Movilidad activa | Suave |
| 5 | Tren superior y core | Media |
| 6 | Circuito dinámico | Media-alta |
| 7 | Core y estiramientos | Suave |

Progresión: S1 básico 30s/30s ×2 · S2 básico 40s/20s ×2 · S3 medio 30s/30s ×3 · S4 medio 40s/20s ×3. Al terminar, el nivel 2 repite el reto con ejercicios de nivel medio a 45s/15s ×3.

## Desarrollo

```bash
npm ci
npm run dev      # servidor local
npm run build    # genera dist/
```

Estructura:

- `src/data/exercises.js` — catálogo de ejercicios y sus animaciones
- `src/data/plan.js` — plan de 28 días y progresión
- `src/anim/` — motor de animación (cinemática por ángulos) y render SVG
- `src/lib/storage.js` — capa de datos (aislada para migrar a un backend)
- `src/lib/music.js` — secuenciador de música (batería, bajo, arpegio y pads)
- `src/screens/` — pantallas
- `src/components/ExerciseDemo.jsx` — vídeo local con póster, fallback a imagen estática/texto y liberación de recursos
- `src/data/media.js` — mapa cerrado de los 4 vídeos y pósteres del piloto
- `src/data/speech-en.js` — instrucciones habladas en inglés
- `src/sw.js` — caché offline y peticiones Range de vídeo
- `scripts/gallery.mjs` — galería de poses para revisar animaciones

## Despliegue (GitHub Pages)

1. En GitHub: **Settings → Pages → Source: GitHub Actions**.
2. Haz merge a `main` (o lanza el workflow *Deploy a GitHub Pages* a mano).
3. Abre la URL en Safari del iPhone → Compartir → **Añadir a pantalla de inicio**.

> Aviso: es una herramienta personal, no sustituye el consejo médico. Si tienes alguna lesión o condición, consulta antes con un profesional.

Las pruebas automatizadas en Chrome no sustituyen la validación de audio, instalación y reproducción en Safari/iPhone real. La sonda opcional `?qa=1` expone únicamente contadores de recursos musicales para diagnóstico; no da acceso al progreso ni a datos personales.
