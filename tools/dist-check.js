/* dist 静态包巡检：桌面 + 手机两种视口，遍历主要页面，记录 404 与脚本错误。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount } = require('./test-account');

const ROUTES = ['#/', '#/world', '#/friends', '#/shop', '#/forge', '#/levels', '#/daily', '#/profile', '#/exams', '#/codex', '#/settings'];
const ORIGIN = 'http://127.0.0.1:8124';
const BASE = ORIGIN + '/index.html';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  let bad = 0;
  for (const [label, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.on('console', m => { if (m.type() === 'error') { bad++; console.log(label, 'CONSOLE', m.text()); } });
    page.on('pageerror', e => { bad++; console.log(label, 'PAGEERROR', e.message); });
    page.on('response', r => { if (r.status() >= 400) { bad++; console.log(label, 'HTTP', r.status(), r.url()); } });
    await ensureTestAccount(page, ORIGIN);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1400);
    const modal = await page.$('.announce-modal [data-close], .announce-modal .modal-close');
    if (modal) await modal.click().catch(() => {});
    for (const route of ROUTES) {
      await page.evaluate(h => { location.hash = h; }, route);
      await page.waitForTimeout(700);
      const text = await page.evaluate(() => document.body.innerText.slice(0, 120));
      if (!text || text.length < 10) { bad++; console.log(label, 'EMPTY', route); }
    }
    await page.screenshot({ path: `dist-check-${label}.png`, fullPage: false });
    await page.close();
  }
  await browser.close();
  console.log(bad === 0 ? 'dist-check passed' : `dist-check issues: ${bad}`);
  process.exit(bad === 0 ? 0 : 1);
})();
