// Headless-Chrome screenshot capture for the docs.
// Usage: node scripts/capture-screenshots.mjs
// Requires the dev server running at http://localhost:5173/immersive-panel/
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const BASE = 'http://localhost:5173/immersive-panel/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// desktop (admin) and phone (fan) presets
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };
const PHONE = { width: 440, height: 1600, deviceScaleFactor: 2 };

const shots = [
  { name: '01-studio-dashboard', url: '#/studio', vp: DESKTOP, wait: 1200 },
  { name: '02-create-experience', url: '#/studio/new', vp: DESKTOP, wait: 1000 },
  { name: '03-panel-editor', url: '#/studio/pnl_haas/edit', vp: DESKTOP, wait: 1000 },
  { name: '04-control-room', url: '#/control/pnl_haas', vp: { ...DESKTOP, height: 1500 }, wait: 1800 },
  { name: '05-stats', url: '#/studio/pnl_haas/stats', vp: DESKTOP, wait: 1000 },
  { name: '06-fan-engine-prematch', url: '#/p/pnl_haas', vp: PHONE, wait: 2200 },
  {
    name: '07-fan-engine-store',
    url: '#/p/pnl_haas',
    vp: PHONE,
    wait: 1800,
    click: 'text=Affiliate Store',
  },
  { name: '08-fan-legacy-mancity', url: '#/p/pnl_mcfc', vp: PHONE, wait: 2200, legacyState: 'inactive' },
  { name: '09-fan-legacy-manutd', url: '#/p/pnl_manutd', vp: PHONE, wait: 2200, legacyState: 'inactive' },
];

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // fresh seed data
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('boltos.panels.v1'));

  for (const s of shots) {
    await page.setViewportSize({ width: s.vp.width, height: s.vp.height });
    await page.goto(BASE + s.url, { waitUntil: 'networkidle' }).catch(() => {});
    await sleep(s.wait);
    if (s.legacyState) {
      // drive the legacy prototype to a deterministic screen (matchday home)
      const frame = page.frames().find((f) => f.url().includes('legacy/index.html'));
      if (frame) {
        await frame
          .evaluate((st) => window.dispatchEvent(new MessageEvent('message', { data: { type: 'jumpState', stateId: st } })), s.legacyState)
          .catch(() => {});
        await sleep(1400);
      }
    }
    if (s.click) {
      await page.click(s.click, { timeout: 3000 }).catch(() => {});
      await sleep(900);
    }
    const path = `${OUT}/${s.name}.png`;
    await page.screenshot({ path });
    console.log('✓', s.name);
  }

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
