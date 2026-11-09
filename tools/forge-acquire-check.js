const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  await page.goto('http://localhost:8123/index.html?demo=1#/hub', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const u = LS.store.current();
    u.forgeClaims = { boss: ['python'], full: [], stage3: [], bought: 0 };
    u.materials = { mana: 1 };
    LS.store.save();
  });
  await page.goto('http://localhost:8123/index.html?demo=1#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const el = document.querySelector('.forge-acquire');
    if (el) el.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -40);
  });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const sec = document.querySelector('.forge-acquire');
    const rows = [...document.querySelectorAll('.forge-acquire .fs-row')];
    return {
      section: sec ? sec.textContent.replace(/\s+/g, ' ').trim().slice(0, 600) : null,
      rows: rows.map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 120)),
      done: [...document.querySelectorAll('.fs-state.done')].length
    };
  });
  await page.screenshot({ path: 'shot-forge-acquire.png' });
  console.log(JSON.stringify({ info, errors }, null, 2));
  await browser.close();
})();
