// Catálogo de ejercicios de calistenia sin material.
// Cada ejercicio incluye su animación (ver src/anim/figure.js para el sistema de ángulos).

// ---- Poses base -------------------------------------------------------------
const STAND = { t: 180, a1: [6, 10], a2: [-6, -3], l1: [2, 0], l2: [-3, 0] };
const STAND_HIPS = { ...STAND, a1: [-20, 50], a2: [-25, 45] }; // manos en la cintura
const STAND_F = { t: 180, a1: [8, 4], a2: [-8, -4], l1: [4, 0], l2: [-4, 0] }; // vista frontal

const SQUAT = { t: 140, a1: [90, 92], a2: [86, 88], l1: [78, -28], l2: [76, -30] };
const PLANK = { t: 116, a1: [0, 0], a2: [3, 3], l1: [-64, -64], l2: [-63, -63] };
const QUAD = { t: 110, a1: [0, 0], a2: [2, 2], l1: [0, -90], l2: [2, -90], f1: -90, f2: -90 };
const BRIDGE_DOWN = { t: -90, a1: [90, 90], a2: [88, 88], l1: [135, 30], l2: [133, 28], f1: 90, f2: 90 };
const BRIDGE_UP = { t: -70, a1: [90, 90], a2: [88, 88], l1: [100, 5], l2: [98, 4], f1: 90, f2: 90 };
const JUMP = { t: 180, a1: [165, 170], a2: [160, 165], l1: [2, 4], l2: [-3, 2], f1: 30, f2: 28, lift: 14 };

export const PATRONES = {
  calentamiento: 'Calentamiento',
  empuje: 'Empuje (pecho, hombros, tríceps)',
  espalda: 'Espalda y postura',
  piernas: 'Piernas',
  gluteos: 'Glúteos y cadena posterior',
  core: 'Core (abdomen y lumbar)',
  cardio: 'Cardio',
  estiramiento: 'Estiramientos',
};

export const EXERCISES = {
  // ---- Calentamiento --------------------------------------------------------
  marcha: {
    nombre: 'Marcha en el sitio',
    patron: 'calentamiento',
    nivel: 'básico',
    musculos: 'Activación general',
    tips: ['Sube las rodillas a la altura de la cadera', 'Mueve los brazos de forma coordinada'],
    anim: {
      anchor: 'hip',
      ms: 450,
      poses: [
        { t: 180, a1: [-30, -15], a2: [30, 60], l1: [75, -5], l2: [0, 0] },
        { t: 180, a1: [30, 60], a2: [-30, -15], l1: [0, 0], l2: [75, -5] },
        { t: 180, a1: [-30, -15], a2: [30, 60], l1: [75, -5], l2: [0, 0] },
      ],
    },
  },
  circulos_brazos: {
    nombre: 'Círculos de brazos',
    patron: 'calentamiento',
    nivel: 'básico',
    musculos: 'Hombros',
    tips: ['Círculos amplios y controlados', 'Cambia de sentido a mitad de tiempo'],
    anim: {
      ms: 280,
      poses: [0, 90, 180, 270, 360].map((k) => ({ ...STAND, a1: [k, k], a2: [k - 15, k - 15] })),
    },
  },
  rotacion_cadera: {
    nombre: 'Rotación de cadera',
    patron: 'calentamiento',
    nivel: 'básico',
    musculos: 'Cadera y zona lumbar',
    tips: ['Manos en la cintura', 'Dibuja círculos amplios con la cadera'],
    anim: {
      view: 'front',
      anchor: 'feet',
      ms: 900,
      poses: [
        { t: 186, a1: [45, -60], a2: [-45, 60], l1: [3, 3], l2: [-13, -13] },
        { t: 174, a1: [45, -60], a2: [-45, 60], l1: [13, 13], l2: [-3, -3] },
        { t: 186, a1: [45, -60], a2: [-45, 60], l1: [3, 3], l2: [-13, -13] },
      ],
    },
  },
  gato_vaca: {
    nombre: 'Gato-vaca',
    patron: 'calentamiento',
    nivel: 'básico',
    musculos: 'Movilidad de columna',
    tips: ['Manos bajo los hombros, rodillas bajo la cadera', 'Redondea la espalda al exhalar, arquéala al inhalar'],
    anim: {
      anchor: 'kn1',
      ms: 1500,
      poses: [
        { ...QUAD, t: 107, h: 40 },
        { ...QUAD, t: 113, h: 150 },
        { ...QUAD, t: 107, h: 40 },
      ],
    },
  },
  buenos_dias: {
    nombre: 'Buenos días',
    patron: 'gluteos',
    nivel: 'básico',
    musculos: 'Isquiotibiales, glúteos, lumbar',
    tips: ['Lleva la cadera atrás con la espalda recta', 'Rodillas ligeramente flexionadas'],
    anim: {
      ms: 1100,
      poses: [
        { ...STAND, a1: [20, 150], a2: [15, 145] },
        { t: 100, a1: [-60, 70], a2: [-65, 65], l1: [14, -4], l2: [12, -6] },
        { ...STAND, a1: [20, 150], a2: [15, 145] },
      ],
    },
  },
  jumping_jacks: {
    nombre: 'Jumping jacks',
    patron: 'cardio',
    nivel: 'básico',
    musculos: 'Cardio, hombros, piernas',
    tips: ['Aterriza suave sobre la parte delantera del pie', 'Versión sin impacto: abre una pierna cada vez'],
    facil: 'Sin salto: separa una pierna cada vez mientras subes los brazos.',
    anim: {
      view: 'front',
      anchor: 'hip',
      ms: 350,
      poses: [STAND_F, { t: 180, a1: [150, 165], a2: [-150, -165], l1: [22, 22], l2: [-22, -22] }, STAND_F],
    },
  },

  // ---- Empuje ---------------------------------------------------------------
  flexion_inclinada: {
    nombre: 'Flexión inclinada',
    patron: 'empuje',
    nivel: 'básico',
    musculos: 'Pecho, hombros, tríceps',
    tips: ['Manos en una silla firme o el sofá', 'Cuerpo en línea recta de cabeza a talones', 'Codos a unos 45° del cuerpo'],
    facil: 'Hazla con las manos en la pared.',
    anim: {
      ms: 1000,
      props: [{ type: 'bench', at: 'ha1', dx: 6, w: 36 }],
      poses: [
        { t: 144, a1: [0, 0], a2: [3, 3], l1: [-36, -36], l2: [-35, -35] },
        { t: 123, a1: [-99, -7], a2: [-97, -8], l1: [-57, -57], l2: [-56, -56] },
        { t: 144, a1: [0, 0], a2: [3, 3], l1: [-36, -36], l2: [-35, -35] },
      ],
    },
  },
  flexion_rodillas: {
    nombre: 'Flexión con rodillas',
    patron: 'empuje',
    nivel: 'básico',
    musculos: 'Pecho, hombros, tríceps',
    tips: ['Rodillas apoyadas, cadera alineada con el tronco', 'Baja el pecho hasta casi tocar el suelo'],
    facil: 'Haz la flexión inclinada.',
    anim: {
      anchor: 'kn1',
      ms: 1000,
      poses: [
        { t: 127, a1: [0, 0], a2: [3, 3], l1: [-53, -115], l2: [-52, -115] },
        { t: 104, a1: [-93, 29], a2: [-91, 28], l1: [-76, -115], l2: [-75, -115] },
        { t: 127, a1: [0, 0], a2: [3, 3], l1: [-53, -115], l2: [-52, -115] },
      ],
    },
  },
  flexion: {
    nombre: 'Flexión',
    patron: 'empuje',
    nivel: 'medio',
    musculos: 'Pecho, hombros, tríceps, core',
    tips: ['Aprieta glúteos y abdomen', 'Baja controlado y empuja fuerte', 'Codos a unos 45° del cuerpo'],
    facil: 'Apoya las rodillas.',
    anim: {
      ms: 1000,
      poses: [
        PLANK,
        { t: 100, a1: [-86, 43], a2: [-84, 41], l1: [-80, -80], l2: [-79, -79] },
        PLANK,
      ],
    },
  },
  flexion_pica: {
    nombre: 'Flexión en pica',
    patron: 'empuje',
    nivel: 'medio',
    musculos: 'Hombros, tríceps',
    tips: ['Cadera alta, forma una V invertida', 'Lleva la cabeza hacia el suelo entre las manos'],
    facil: 'Reduce el recorrido o acerca los pies a las manos.',
    anim: {
      ms: 1100,
      poses: [
        { t: 52, a1: [52, 52], a2: [50, 50], l1: [-20, -20], l2: [-18, -18] },
        { t: 60, a1: [77, -8], a2: [75, -8], l1: [-34, -34], l2: [-32, -32] },
        { t: 52, a1: [52, 52], a2: [50, 50], l1: [-20, -20], l2: [-18, -18] },
      ],
    },
  },
  fondos_silla: {
    nombre: 'Fondos en silla',
    patron: 'empuje',
    nivel: 'medio',
    musculos: 'Tríceps, hombros',
    tips: ['Silla estable y apoyada en la pared', 'Codos hacia atrás, no hacia los lados', 'Baja hasta 90° de codo'],
    facil: 'Acerca los pies a la silla.',
    anim: {
      ms: 1000,
      props: [{ type: 'bench', at: 'ha1', dx: -13, w: 34 }],
      poses: [
        { t: 180, a1: [-3, -3], a2: [-6, -6], l1: [70, 0], l2: [68, 0] },
        { t: 180, a1: [-52, 59], a2: [-55, 57], l1: [109, 0], l2: [107, 0] },
        { t: 180, a1: [-3, -3], a2: [-6, -6], l1: [70, 0], l2: [68, 0] },
      ],
    },
  },

  // ---- Espalda --------------------------------------------------------------
  superman: {
    nombre: 'Superman',
    patron: 'espalda',
    nivel: 'básico',
    musculos: 'Lumbar, glúteos, espalda alta',
    tips: ['Boca abajo, eleva brazos y piernas a la vez', 'Mirada al suelo, cuello neutro', 'Mantén 2 segundos arriba'],
    anim: {
      anchor: 'hip',
      ms: 1100,
      poses: [
        { t: 90, a1: [92, 92], a2: [90, 90], l1: [-90, -90], l2: [-90, -90], f1: -90, f2: -90 },
        { t: 102, h: 106, a1: [112, 112], a2: [110, 110], l1: [-102, -102], l2: [-101, -101], f1: -102, f2: -101 },
        { t: 90, a1: [92, 92], a2: [90, 90], l1: [-90, -90], l2: [-90, -90], f1: -90, f2: -90 },
      ],
    },
  },
  nadador: {
    nombre: 'Nadador',
    patron: 'espalda',
    nivel: 'medio',
    musculos: 'Espalda, glúteos, hombros',
    tips: ['Boca abajo, pecho ligeramente elevado', 'Alterna brazo y pierna contrarios'],
    anim: {
      anchor: 'hip',
      ms: 450,
      poses: [
        { t: 98, a1: [110, 110], a2: [86, 86], l1: [-86, -86], l2: [-104, -104], f1: -86, f2: -104 },
        { t: 98, a1: [86, 86], a2: [110, 110], l1: [-104, -104], l2: [-86, -86], f1: -104, f2: -86 },
        { t: 98, a1: [110, 110], a2: [86, 86], l1: [-86, -86], l2: [-104, -104], f1: -86, f2: -104 },
      ],
    },
  },
  plancha_inversa: {
    nombre: 'Plancha invertida',
    patron: 'espalda',
    nivel: 'medio',
    musculos: 'Espalda alta, hombros, glúteos',
    tips: ['Sentado, manos detrás con dedos hacia los pies', 'Sube la cadera hasta alinear el cuerpo', 'Saca pecho y junta escápulas'],
    facil: 'Hazla con las rodillas flexionadas (puente de mesa).',
    anim: {
      ms: 1100,
      poses: [
        { t: -150, a1: [-42, 10], a2: [-45, 8], l1: [90, 90], l2: [89, 89] },
        { t: -116, a1: [0, 0], a2: [-3, -3], l1: [64, 64], l2: [63, 63] },
        { t: -150, a1: [-42, 10], a2: [-45, 8], l1: [90, 90], l2: [89, 89] },
      ],
    },
  },

  // ---- Piernas --------------------------------------------------------------
  sentadilla: {
    nombre: 'Sentadilla',
    patron: 'piernas',
    nivel: 'básico',
    musculos: 'Cuádriceps, glúteos',
    tips: ['Pies a la anchura de los hombros', 'Lleva la cadera atrás como si te sentaras', 'Talones apoyados, pecho arriba'],
    facil: 'Siéntate y levántate de una silla.',
    anim: { ms: 1100, poses: [STAND, SQUAT, STAND] },
  },
  sentadilla_pared: {
    nombre: 'Sentadilla isométrica en pared',
    patron: 'piernas',
    nivel: 'básico',
    musculos: 'Cuádriceps, glúteos',
    tips: ['Espalda pegada a la pared', 'Rodillas a 90°, encima de los tobillos', 'Respira de forma constante'],
    facil: 'No bajes tanto (rodillas a 120°).',
    anim: {
      ms: 1400,
      props: [{ type: 'wall', at: 'hip', dx: -4 }],
      poses: [
        { t: 180, a1: [15, 130], a2: [10, 125], l1: [90, 0], l2: [88, 0] },
        { t: 180, h: 183, a1: [18, 128], a2: [13, 123], l1: [90, 0], l2: [88, 0] },
        { t: 180, a1: [15, 130], a2: [10, 125], l1: [90, 0], l2: [88, 0] },
      ],
    },
  },
  sentadilla_salto: {
    nombre: 'Sentadilla con salto',
    patron: 'piernas',
    nivel: 'medio',
    musculos: 'Cuádriceps, glúteos, cardio',
    tips: ['Impulsa con los brazos', 'Aterriza suave y baja directo a la siguiente'],
    facil: 'Sentadilla rápida sin salto, de puntillas arriba.',
    anim: {
      ms: [550, 250, 350],
      poses: [
        STAND,
        { t: 135, a1: [-45, -30], a2: [-50, -35], l1: [80, -28], l2: [78, -30] },
        JUMP,
        STAND,
      ],
    },
  },
  sentadilla_bulgara: {
    nombre: 'Sentadilla búlgara',
    patron: 'piernas',
    nivel: 'medio',
    musculos: 'Cuádriceps, glúteos',
    lados: true,
    tips: ['Empeine del pie trasero sobre una silla', 'Baja vertical, rodilla delantera sobre el pie', 'Cambia de pierna a mitad de tiempo'],
    facil: 'Zancada atrás sin silla.',
    anim: {
      ms: 1100,
      props: [{ type: 'bench', at: 'an2', dx: -6, dy: 3, w: 36 }],
      poses: [
        { t: 178, a1: [-20, 50], a2: [-25, 45], l1: [12, -6], l2: [-28, -105], f2: -85 },
        { t: 172, a1: [-20, 50], a2: [-25, 45], l1: [75, -8], l2: [-29, -167], f2: -85 },
        { t: 178, a1: [-20, 50], a2: [-25, 45], l1: [12, -6], l2: [-28, -105], f2: -85 },
      ],
    },
  },
  zancada_atras: {
    nombre: 'Zancada atrás',
    patron: 'piernas',
    nivel: 'básico',
    musculos: 'Cuádriceps, glúteos',
    tips: ['Da un paso largo atrás', 'Baja la rodilla trasera cerca del suelo', 'Alterna piernas'],
    facil: 'Apóyate en una pared o silla para equilibrarte.',
    anim: {
      ms: 1000,
      poses: [STAND_HIPS, { ...STAND_HIPS, l1: [80, 0], l2: [-15, -95] }, STAND_HIPS],
    },
  },
  zancada_lateral: {
    nombre: 'Zancada lateral',
    patron: 'piernas',
    nivel: 'medio',
    musculos: 'Aductores, glúteos, cuádriceps',
    tips: ['Pies separados, flexiona una rodilla y estira la otra', 'Cadera atrás, pecho arriba', 'Alterna lados'],
    anim: {
      view: 'front',
      anchor: 'an2',
      ms: 1000,
      poses: [
        { t: 180, a1: [25, -60], a2: [-25, 60], l1: [35, 35], l2: [-35, -35] },
        { t: 168, a1: [25, -60], a2: [-25, 60], l1: [72, -10], l2: [-49, -49] },
        { t: 180, a1: [25, -60], a2: [-25, 60], l1: [35, 35], l2: [-35, -35] },
      ],
    },
  },
  elevacion_talones: {
    nombre: 'Elevación de talones',
    patron: 'piernas',
    nivel: 'básico',
    musculos: 'Gemelos',
    tips: ['Sube de puntillas lo más alto posible', 'Baja despacio'],
    anim: { anchor: 'to1', ms: 800, poses: [STAND, { ...STAND, f1: 35, f2: 35 }, STAND] },
  },

  // ---- Glúteos --------------------------------------------------------------
  puente_gluteo: {
    nombre: 'Puente de glúteo',
    patron: 'gluteos',
    nivel: 'básico',
    musculos: 'Glúteos, isquiotibiales',
    tips: ['Boca arriba, pies apoyados cerca de la cadera', 'Sube la cadera apretando glúteos', 'No arquees la zona lumbar'],
    anim: { ms: 1100, poses: [BRIDGE_DOWN, BRIDGE_UP, BRIDGE_DOWN] },
  },
  puente_una_pierna: {
    nombre: 'Puente a una pierna',
    patron: 'gluteos',
    nivel: 'medio',
    musculos: 'Glúteos, isquiotibiales',
    lados: true,
    tips: ['Una pierna estirada en el aire', 'Cadera nivelada al subir', 'Cambia de pierna a mitad de tiempo'],
    facil: 'Puente con las dos piernas.',
    anim: {
      ms: 1100,
      poses: [
        { ...BRIDGE_DOWN, l2: [140, 130] },
        { ...BRIDGE_UP, l2: [103, 100] },
        { ...BRIDGE_DOWN, l2: [140, 130] },
      ],
    },
  },

  // ---- Core -----------------------------------------------------------------
  plancha: {
    nombre: 'Plancha',
    patron: 'core',
    nivel: 'básico',
    musculos: 'Abdomen, lumbar, hombros',
    tips: ['Codos bajo los hombros', 'Cuerpo recto: ni cadera arriba ni hundida', 'Aprieta glúteos y abdomen'],
    facil: 'Apoya las rodillas.',
    anim: {
      ms: 1600,
      poses: [
        { t: 103, a1: [0, 90], a2: [3, 90], l1: [-77, -77], l2: [-76, -76] },
        { t: 104, a1: [0, 90], a2: [3, 90], l1: [-76, -76], l2: [-75, -75] },
        { t: 103, a1: [0, 90], a2: [3, 90], l1: [-77, -77], l2: [-76, -76] },
      ],
    },
  },
  plancha_lateral: {
    nombre: 'Plancha lateral',
    patron: 'core',
    nivel: 'medio',
    musculos: 'Oblicuos, glúteo medio',
    lados: true,
    tips: ['Codo bajo el hombro', 'Cadera arriba, cuerpo en línea', 'Cambia de lado a mitad de tiempo'],
    facil: 'Apoya la rodilla de abajo.',
    anim: {
      view: 'front',
      hw: 1.5,
      ms: 1200,
      poses: [
        { t: 103, a1: [0, 90], a2: [180, 180], l1: [-77, -77], l2: [-77, -77] },
        { t: 108, a1: [0, 90], a2: [180, 180], l1: [-82, -82], l2: [-82, -82] },
        { t: 103, a1: [0, 90], a2: [180, 180], l1: [-77, -77], l2: [-77, -77] },
      ],
    },
  },
  dead_bug: {
    nombre: 'Dead bug',
    patron: 'core',
    nivel: 'básico',
    musculos: 'Abdomen profundo',
    tips: ['Lumbar pegada al suelo todo el tiempo', 'Estira brazo y pierna contrarios', 'Movimiento lento'],
    anim: {
      anchor: 'hip',
      ms: 850,
      poses: (() => {
        const base = { t: -90, a1: [180, 180], a2: [178, 178], l1: [180, 90], l2: [178, 88] };
        const A = { ...base, a1: [-100, -100], l2: [95, 95] };
        const B = { ...base, a2: [-100, -100], l1: [95, 95] };
        return [base, A, base, B, base];
      })(),
    },
  },
  bird_dog: {
    nombre: 'Bird dog',
    patron: 'core',
    nivel: 'básico',
    musculos: 'Lumbar, glúteos, estabilidad',
    tips: ['A cuatro apoyos', 'Estira brazo y pierna contrarios', 'Cadera estable, sin girar'],
    anim: {
      anchor: 'hip',
      ms: 900,
      poses: [
        QUAD,
        { ...QUAD, a1: [95, 95], l2: [-95, -95], f2: -95 },
        QUAD,
        { ...QUAD, a2: [95, 95], l1: [-95, -95], f1: -95 },
        QUAD,
      ],
    },
  },
  escaladores: {
    nombre: 'Escaladores',
    patron: 'core',
    nivel: 'medio',
    musculos: 'Core, hombros, cardio',
    tips: ['Posición de plancha alta', 'Lleva las rodillas al pecho alternando', 'Cadera baja'],
    facil: 'Hazlo lento, paso a paso.',
    anim: {
      anchor: 'ha1',
      ms: 230,
      poses: [PLANK, { ...PLANK, l1: [40, -100] }, PLANK, { ...PLANK, l2: [40, -100] }, PLANK],
    },
  },
  hollow: {
    nombre: 'Hollow hold',
    patron: 'core',
    nivel: 'medio',
    musculos: 'Abdomen',
    tips: ['Lumbar pegada al suelo', 'Brazos y piernas estirados, despegados del suelo'],
    facil: 'Flexiona las rodillas.',
    anim: {
      anchor: 'hip',
      ms: 1400,
      poses: [
        { t: -100, a1: [-110, -110], a2: [-112, -112], l1: [100, 100], l2: [98, 98] },
        { t: -97, a1: [-106, -106], a2: [-108, -108], l1: [97, 97], l2: [95, 95] },
        { t: -100, a1: [-110, -110], a2: [-112, -112], l1: [100, 100], l2: [98, 98] },
      ],
    },
  },
  toque_hombros: {
    nombre: 'Plancha con toque de hombros',
    patron: 'core',
    nivel: 'medio',
    musculos: 'Core, hombros',
    tips: ['Plancha alta con pies separados', 'Toca el hombro contrario sin mover la cadera'],
    facil: 'Apoya las rodillas.',
    anim: {
      ms: 500,
      poses: [PLANK, { ...PLANK, a1: [60, -130] }, PLANK, { ...PLANK, a2: [60, -130] }, PLANK],
    },
  },

  // ---- Cardio ---------------------------------------------------------------
  rodillas_altas: {
    nombre: 'Rodillas altas',
    patron: 'cardio',
    nivel: 'medio',
    musculos: 'Cardio, flexores de cadera',
    tips: ['Corre en el sitio subiendo rodillas', 'Brazos activos'],
    facil: 'Marcha rápida en el sitio.',
    anim: {
      anchor: 'hip',
      ms: 220,
      poses: [
        { t: 180, a1: [-40, -10], a2: [40, 110], l1: [95, -10], l2: [0, 0] },
        { t: 180, a1: [40, 110], a2: [-40, -10], l1: [0, 0], l2: [95, -10] },
        { t: 180, a1: [-40, -10], a2: [40, 110], l1: [95, -10], l2: [0, 0] },
      ],
    },
  },
  burpee: {
    nombre: 'Burpee',
    patron: 'cardio',
    nivel: 'medio',
    musculos: 'Cuerpo completo, cardio',
    tips: ['Agáchate, lleva los pies atrás a plancha', 'Vuelve los pies y salta'],
    facil: 'Sin salto y llevando los pies atrás de uno en uno.',
    anim: {
      ms: [380, 280, 280, 320, 300, 280],
      poses: (() => {
        const low = { t: 115, a1: [0, 0], a2: [3, 3], l1: [95, -35], l2: [93, -37] };
        return [STAND, low, PLANK, low, JUMP, STAND, STAND];
      })(),
    },
  },
  patinador: {
    nombre: 'Saltos de patinador',
    patron: 'cardio',
    nivel: 'medio',
    musculos: 'Glúteos, piernas, cardio',
    tips: ['Salta de lado sobre una pierna', 'Cruza la otra por detrás', 'Aterriza suave'],
    facil: 'Paso lateral sin salto.',
    anim: {
      view: 'front',
      anchor: 'hip',
      ms: 300,
      poses: (() => {
        const L1 = { t: 186, x: -28, a1: [-40, -30], a2: [-60, -60], l1: [-35, -30], l2: [10, -10] };
        const R1 = { t: 174, x: 28, a1: [60, 60], a2: [40, 30], l1: [-10, 10], l2: [35, 30] };
        const M = { t: 180, x: 0, lift: 14, a1: [10, 5], a2: [-10, -5], l1: [5, 5], l2: [-5, -5] };
        return [L1, M, R1, M, L1];
      })(),
    },
  },

  // ---- Estiramientos --------------------------------------------------------
  postura_nino: {
    nombre: 'Postura del niño',
    patron: 'estiramiento',
    nivel: 'básico',
    musculos: 'Espalda, cadera',
    tips: ['Siéntate sobre los talones', 'Estira los brazos al frente y relaja', 'Respira profundo'],
    anim: {
      anchor: 'kn1',
      ms: 2000,
      poses: [
        { t: 76, h: 100, a1: [90, 90], a2: [88, 88], l1: [55, -90], l2: [55, -90], f1: -90, f2: -90 },
        { t: 80, h: 103, a1: [92, 92], a2: [90, 90], l1: [55, -90], l2: [55, -90], f1: -90, f2: -90 },
        { t: 76, h: 100, a1: [90, 90], a2: [88, 88], l1: [55, -90], l2: [55, -90], f1: -90, f2: -90 },
      ],
    },
  },
  cobra: {
    nombre: 'Cobra',
    patron: 'estiramiento',
    nivel: 'básico',
    musculos: 'Abdomen, flexores de cadera',
    tips: ['Boca abajo, empuja con las manos', 'Cadera en el suelo, hombros lejos de las orejas'],
    anim: {
      anchor: 'hip',
      ms: 2000,
      poses: [
        { t: 125, h: 145, a1: [-70, 45], a2: [-72, 43], l1: [-90, -90], l2: [-90, -90], f1: -90, f2: -90 },
        { t: 130, h: 150, a1: [-60, 40], a2: [-62, 38], l1: [-90, -90], l2: [-90, -90], f1: -90, f2: -90 },
        { t: 125, h: 145, a1: [-70, 45], a2: [-72, 43], l1: [-90, -90], l2: [-90, -90], f1: -90, f2: -90 },
      ],
    },
  },
  isquios: {
    nombre: 'Estiramiento de isquiotibiales',
    patron: 'estiramiento',
    nivel: 'básico',
    musculos: 'Isquiotibiales, lumbar',
    tips: ['Sentado, piernas estiradas', 'Inclínate desde la cadera hacia los pies', 'Sin rebotes'],
    anim: {
      anchor: 'hip',
      ms: 2000,
      poses: [
        { t: 125, a1: [80, 85], a2: [78, 83], l1: [90, 90], l2: [89, 89], f1: 180, f2: 179 },
        { t: 117, a1: [75, 80], a2: [73, 78], l1: [90, 90], l2: [89, 89], f1: 180, f2: 179 },
        { t: 125, a1: [80, 85], a2: [78, 83], l1: [90, 90], l2: [89, 89], f1: 180, f2: 179 },
      ],
    },
  },
  cuadriceps: {
    nombre: 'Estiramiento de cuádriceps',
    patron: 'estiramiento',
    nivel: 'básico',
    musculos: 'Cuádriceps',
    lados: true,
    tips: ['De pie, lleva el talón al glúteo', 'Rodillas juntas', 'Cambia de pierna a mitad de tiempo'],
    anim: {
      ms: 2000,
      poses: [
        { t: 180, a1: [6, 10], a2: [-14, -9], l1: [2, 0], l2: [-5, -170] },
        { t: 178, a1: [8, 12], a2: [-15, -10], l1: [2, 0], l2: [-7, -170] },
        { t: 180, a1: [6, 10], a2: [-14, -9], l1: [2, 0], l2: [-5, -170] },
      ],
    },
  },
  pecho: {
    nombre: 'Estiramiento de pecho',
    patron: 'estiramiento',
    nivel: 'básico',
    musculos: 'Pecho, hombros',
    tips: ['Entrelaza las manos detrás', 'Saca pecho y eleva los brazos suavemente'],
    anim: {
      ms: 1600,
      poses: [
        { ...STAND, a1: [-35, -35], a2: [-38, -38] },
        { ...STAND, a1: [-50, -50], a2: [-53, -53] },
        { ...STAND, a1: [-35, -35], a2: [-38, -38] },
      ],
    },
  },
};

export const exercise = (id) => EXERCISES[id];
