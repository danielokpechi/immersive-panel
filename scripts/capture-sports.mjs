// Capture the engine fan panels for the other sports into
// docs/screenshots/sports/. Usage: node scripts/capture-sports.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173/immersive-panel/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots', 'sports');
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const panels = [
  ['ufc-apex', 'pnl_ufc'],
  ['boxing-mayweather', 'pnl_mayweather'],
  ['boxing-mcgregor', 'pnl_mcgregor'],
  ['rugby', 'pnl_rugby'],
  ['conference', 'pnl_conf'],
  ['f1-mclaren', 'pnl_mclaren'],
  ['f1-ferrari', 'pnl_ferrari'],
  ['f1-mercedes', 'pnl_mercedes'],
];

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 440, height: 1600 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('boltos.panels.v1'));

  for (const [name, id] of panels) {
    await page.goto(`${BASE}#/p/${id}`, { waitUntil: 'networkidle' }).catch(() => {});
    await sleep(2200);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('✓', name);
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
