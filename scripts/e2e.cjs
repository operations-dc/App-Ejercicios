// Recorrido rápido de la app en un iPhone emulado, con capturas.
const { chromium, devices } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto('http://localhost:4173/');
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/s1-home.png` });
  await p.getByLabel('Día 3', { exact: true }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/s2-locked.png` });
  await p.getByLabel('Día 1', { exact: true }).click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/s3-sheet.png` });
  await p.getByText('Empezar entrenamiento').click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/s4-prep.png` });
  // Salta pasos hasta un ejercicio del circuito
  for (let i = 0; i < 8; i++) await p.getByLabel('Siguiente').click();
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/s5-work.png` });
  await p.getByLabel('Siguiente').click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/s6-rest.png` });
  // Avanza hasta el final
  for (let i = 0; i < 60; i++) {
    const done = await p.getByText('¿Cómo te ha resultado?').count();
    if (done) break;
    await p.getByLabel('Siguiente').click().catch(() => {});
  }
  // último paso: esperar a que termine el temporizador
  await p.getByText('¿Cómo te ha resultado?').waitFor({ timeout: 60000 });
  await p.screenshot({ path: `${out}/s7-done.png` });
  await p.getByText('Bien').click();
  await p.getByText('Guardar').click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/s8-home-after.png` });
  await p.getByRole('button', { name: 'Ejercicios' }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/s9-library.png` });
  await p.getByText('Flexión en pica').click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/s10-exercise.png` });
  await p.getByText('Cerrar').click();
  await p.getByRole('button', { name: 'Progreso' }).click();
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('reto28.v1'));
    s.pesos = [['2026-10-20', 80.2], ['2026-10-25', 79.6], ['2026-10-30', 79.9], ['2026-11-03', 79.1], ['2026-11-06', 78.7]].map(([fecha, kg]) => ({ fecha, kg }));
    localStorage.setItem('reto28.v1', JSON.stringify(s));
  });
  await p.reload();
  await p.getByRole('button', { name: 'Progreso' }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/s11-progress.png` });
  console.log('errores:', errors.length ? errors : 'ninguno');
  await b.close();
})();
