# Rediseño militar · brief de implementación

Documento de traspaso para la sesión que implemente el rediseño con el conector de Higgsfield.
Todo lo de aquí está **decidido por el usuario**; no hace falta volver a preguntarlo.

## Decisiones
- **Nivel:** inmersivo (estética + ambientación militar).
- **Instructor:** tono **sargento duro** (exigente y directo, sin insultos ni lenguaje ofensivo).
- **Imágenes:** **fotorrealistas**, generadas con Higgsfield (conector MCP oficial).
- **Portada:** **vídeo vertical en bucle**.
- Mantener las animaciones SVG para la técnica de cada ejercicio (no generar vídeos por ejercicio): solo cambiarles el uniforme.
- Idioma: español neutro. Unidades: kg.

## 1. Sistema visual
| Token | Valor | Uso |
|---|---|---|
| `--olive-900` | `#1f2418` | fondo de sesión / modo oscuro |
| `--olive-700` | `#3d4a2a` | tarjetas oscuras, cabeceras |
| `--olive-500` | `#5b6b3c` | acentos secundarios |
| `--sand-100` | `#efe9dc` | fondo claro (papel) |
| `--sand-300` | `#c8b98f` | bordes, chips |
| `--ink` | `#16180f` | texto |
| `--signal` | `#e4572e` | acento de acción (botones, temporizador) |
| `--brass` | `#c9a227` | rangos, medallas |

- **Tipografía:** títulos en *Black Ops One* (stencil); texto y números en *Barlow Condensed* (600/700). Empaquetar con `@fontsource/black-ops-one` y `@fontsource/barlow-condensed` para que funcione sin conexión.
- **Textura:** camuflaje sutil (SVG generado, opacidad 6–8 %) en cabeceras y tarjeta "Hoy toca"; rejilla táctica fina en el fondo de la sesión.
- **Detalles:** esquinas poco redondeadas (6–8 px), etiquetas tipo cinta adhesiva/estarcido, números de misión grandes en stencil.
- **Figuras SVG** (`src/anim/fig.css`): camiseta verde oliva `#556b2f`, pantalón de camuflaje (base `#6b6b47` con manchas), botas marrón oscuro `#3a2a1a`, gorra o pelo rapado.

## 2. Ambientación
- **Nombre:** "Operación 28" (subtítulo: Calistenia en casa).
- **Días → Misiones:** "Misión 1…28". Semanas → "Fase 1: Instrucción básica", "Fase 2: Endurecimiento", "Fase 3: Combate", "Fase 4: Élite".
- **Tipos de sesión:** Cuerpo completo → *Asalto total*; Cardio y core → *Marcha forzada*; Piernas y glúteos → *Tren de aterrizaje*; Movilidad → *Mantenimiento de equipo*; Tren superior → *Carga de mochila*; Circuito → *Pista de obstáculos*; Core y estiramientos → *Núcleo de acero*.
- **Pantalla final:** "Parte de misión" (misión, duración, sensación) + "Misión cumplida".
- **Rangos** por misiones completadas (total histórico):

| Misiones | Rango |
|---|---|
| 0 | Recluta |
| 3 | Soldado |
| 7 | Cabo |
| 10 | Cabo primero |
| 14 | Sargento |
| 18 | Sargento primero |
| 21 | Teniente |
| 25 | Capitán |
| 28 | Comandante |

  Insignias de rango en **SVG** (galones/estrellas en latón), nítidas a tamaño pequeño. Mostrar el rango en la cabecera y un aviso de "¡Ascenso!" al subir.
- **Medallas:** una al completar cada fase (semana) → imagen fotorrealista (ver assets).

### Voz del sargento (aleatoria por categoría)
- **Empezar ejercicio:** "¡{ejercicio}! ¡{segundos} segundos, recluta, ya!", "¡En posición! ¡{ejercicio}, adelante!", "¡{ejercicio}! ¡Quiero ver ese esfuerzo!"
- **Mitad:** "¡Mitad! ¡No afloje!", "¡Siga, siga, siga!"
- **Cambio de lado:** "¡Cambie de lado, ya!"
- **Descanso:** "¡Descanso! Respire. Siguiente: {ejercicio}.", "¡Alto! Recupere. Viene {ejercicio}."
- **Últimos segundos:** "¡Tres, dos, uno!" (además de los pitidos)
- **Fin:** "¡Misión cumplida, soldado! Mañana, más.", "¡Buen trabajo! Así se forja un soldado."
- Tratamiento de usted (estilo militar), español neutro, sin insultos.

### Música marcial (`src/lib/music.js`)
- Añadir caja redoblante (ruido filtrado + tono corto) con patrón de marcha en `warm`, redoble (roll de 16avos con crescendo) en el último compás antes de cada cambio a `work`, y bombo más seco. Mantener el resto de capas y la lógica de intensidad.

## 3. Assets con Higgsfield
Generar con el conector MCP de Higgsfield. Estilo común para **todas** las imágenes (añadir al final de cada prompt):

> photorealistic, cinematic, natural film grain, muted olive and sand color grading, golden hour light, shallow depth of field, no text, no logos, no watermarks

Personaje recurrente: *a fit man in his mid-30s, short dark hair, olive-green military t-shirt, desert camouflage trousers, tan combat boots*. Usar el mismo `seed` (o referencia de personaje si el modelo lo permite) para que sea consistente.

| Archivo (en `public/media/`) | Formato | Prompt (antes del estilo común) |
|---|---|---|
| `portada.jpg` → `portada.mp4` | 9:16, 1080p → vídeo 6 s en bucle | Personaje haciendo flexiones en la pista de una base militar al amanecer, hangares y polvo en el aire, cámara baja y estable. Vídeo: *slow steady push-up repetitions, subtle dust, gentle camera push-in, seamless loop* |
| `mision-asalto.jpg` | 3:4 | Personaje en sentadilla profunda en un patio de entrenamiento de tierra, bandera al fondo desenfocada |
| `mision-marcha.jpg` | 3:4 | Personaje corriendo en el sitio con rodillas altas en una pista de arena, sol bajo detrás |
| `mision-piernas.jpg` | 3:4 | Personaje en zancada en una explanada militar, sacos terreros al fondo |
| `mision-mantenimiento.jpg` | 3:4 | Personaje estirando sobre una esterilla junto a un camión militar, ambiente tranquilo |
| `mision-mochila.jpg` | 3:4 | Personaje haciendo fondos en un banco de madera de un cuartel |
| `mision-obstaculos.jpg` | 3:4 | Personaje haciendo burpees junto a una pista de obstáculos con neumáticos y cuerdas |
| `mision-nucleo.jpg` | 3:4 | Personaje en plancha sobre arena compacta, primer plano lateral |
| `medalla-fase-1..4.jpg` | 1:1 | Medalla militar de latón con cinta (verde/arena; 1 estrella, 2, 3 y laurel para la 4), sobre tela verde oliva, plano cenital, iluminación de estudio |
| `cumplida.jpg` | 9:16 | Personaje de pie, sudado, mirando al horizonte al atardecer en la pista de la base, sensación de logro |

### Procesado e integración
- Descargar los resultados (las URLs de Higgsfield caducan a los ~7 días).
- Imágenes → WebP con `ffmpeg` (ancho 1080 portada/fondos, 512 medallas; calidad ~78). Objetivo < 200 KB cada una.
- Vídeo → `portada.mp4` H.264, 720×1280, sin audio, 6 s, `-crf 28`, objetivo < 2,5 MB, más `portada-poster.webp` (primer fotograma). Reproducir con `autoplay muted loop playsinline` y `prefers-reduced-motion` → mostrar solo el póster.
- Añadir `public/media/**` a `includeAssets`/`globPatterns` del PWA para que funcione sin conexión (subir `maximumFileSizeToCacheInBytes` si hace falta).
- Usos: portada en el inicio (cabecera de altura ~45 vh con degradado a `--olive-900`), fondo de la tarjeta "Hoy toca" y cabecera del detalle de misión según tipo, medallas en Progreso, `cumplida` de fondo en "Parte de misión".

## 4. Criterios de aceptación
- `npm run build` sin errores; recorrido con Playwright (iPhone) sin errores de consola: inicio → misión 1 → sesión → parte de misión → progreso.
- Revisar capturas de todas las pantallas en claro/oscuro y la galería de figuras (`scripts/gallery.mjs`).
- Peso total del precache del PWA < 8 MB.
- Desplegar: PR a `main` y merge (el workflow publica en GitHub Pages) y verificar la URL publicada.
