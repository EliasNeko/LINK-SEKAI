const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.location().url || '')) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  await page.goto('http://localhost:8123/index.html?demo=1#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const u = LS.store.current();
    if (!(u.equipment || []).some(e => e.shopId === 'o1')) LS.store.addEquipment(u, LS.shopLoot(LS.shopItem('o1')));
    const it = (u.equipment || []).find(e => e.shopId === 'o1');
    it.infusion = 2;
    LS.store.save();
  });
  await page.goto('http://localhost:8123/index.html?demo=1#/battle/python/py-1-3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const battleInfo = await page.evaluate(() => {
    const el = document.querySelector('.duel-gear-card .gear-main span[class*="q-infused"], .duel-gear-card .gear-main .q-infused');
    return { text: el ? el.textContent : null, color: el ? getComputedStyle(el).color : null, weight: el ? getComputedStyle(el).fontWeight : null };
  });
  await page.screenshot({ path: 'shot-battle-infused.png', fullPage: false });
  await page.goto('http://localhost:8123/index.html?demo=1#/lesson/python/py-1-2', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const lessonInfo = await page.evaluate(() => {
    const el = document.querySelector('.le-item .q-infused');
    return { text: el ? el.textContent : null, color: el ? getComputedStyle(el).color : null };
  });
  await page.screenshot({ path: 'shot-lesson-infused.png', fullPage: false });
  console.log(JSON.stringify({ battleInfo, lessonInfo, errors }, null, 2));
  await browser.close();
})();
