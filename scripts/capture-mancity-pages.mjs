// Capture EVERY screen of the Man City legacy prototype into
// docs/screenshots/mancity/. Usage: node scripts/capture-mancity-pages.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173/immersive-panel/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots', 'mancity');
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 440, height: 1800 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('boltos.panels.v1'));
  await page.goto(BASE + '#/p/pnl_mcfc', { waitUntil: 'networkidle' });
  await sleep(2500); // let the legacy load all screens + autopilot start

  const frame = page.frames().find((f) => f.url().includes('legacy/index.html'));
  if (!frame) throw new Error('legacy iframe not found');

  // stop the autopilot so screens hold still, then list every screen id
  await frame.evaluate(() => { try { stopAutopilot(); } catch (e) {} });
  const ids = await frame.evaluate(() =>
    [...document.querySelectorAll('[id^="screen-"]')].map((e) => e.id.replace('screen-', '')),
  );
  console.log(`${ids.length} screens`);

  let i = 0;
  for (const id of ids) {
    i++;
    await frame.evaluate((sid) => navigate(sid, 'none', true), id).catch(() => {});
    await sleep(650);
    const num = String(i).padStart(2, '0');
    await page.screenshot({ path: `${OUT}/${num}-${id}.png` });
    console.log('✓', num, id);
  }

  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
