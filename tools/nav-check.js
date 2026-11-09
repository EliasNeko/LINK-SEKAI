const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount } = require('./test-account');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  await ensureTestAccount(page);
  await page.goto('http://localhost:8123/index.html#/forge', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const u = LS.store.current();
    if (!(u.equipment || []).some(e => e.shopId === 'o1')) LS.store.addEquipment(u, LS.shopLoot(LS.shopItem('o1')));
    LS.store.addMaterial(u, 'mana', 4);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const rect = () => page.evaluate(() => {
    const n = document.querySelector('.bottom-nav').getBoundingClientRect();
    return { top: Math.round(n.top), bottom: Math.round(n.bottom), h: Math.round(n.height), vh: innerHeight, scrollY: Math.round(scrollY) };
  });
  const atTop = await rect();
  await page.screenshot({ path: 'shot-m-forge-top.png' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  const atBottom = await rect();
  await page.screenshot({ path: 'shot-m-forge-bottom.png' });
  const layout = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav');
    const main = document.querySelector('.main');
    const last = document.querySelector('.forge-acquire');
    return {
      navItems: [...nav.querySelectorAll('a')].map(a => a.textContent.trim()),
      mainPadBottom: main ? getComputedStyle(main).paddingBottom : null,
      lastBottom: last ? Math.round(last.getBoundingClientRect().bottom + scrollY) : null,
      docHeight: Math.round(document.documentElement.scrollHeight)
    };
  });
  console.log(JSON.stringify({ atTop, atBottom, layout, errors }, null, 2));
  await browser.close();
})();
