const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));

  await page.goto('http://localhost:8123/index.html?demo=1#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const seeded = await page.evaluate(() => {
    const u = LS.store.current();
    if (!(u.equipment || []).some(e => e.shopId === 'o1')) {
      LS.store.addEquipment(u, LS.shopLoot(LS.shopItem('o1')));
    }
    LS.store.addMaterial(u, 'mana', 4);
    return {
      mana: LS.store.materialCount(u, 'mana'),
      origin: (u.equipment || []).filter(e => e.quality === 'origin').map(e => e.iid)
    };
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shot-forge-filled.png', fullPage: true });

  const before = await page.evaluate(() => {
    const u = LS.store.current();
    const it = (u.equipment || []).find(e => e.quality === 'origin');
    return { iid: it.iid, stats: LS.statsOfItem(it), mana: LS.store.materialCount(u, 'mana'), html: document.querySelector('.fd-title h2').textContent };
  });

  await page.locator('[data-forge-infuse]').click();
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => {
    const u = LS.store.current();
    const it = (u.equipment || []).find(e => e.quality === 'origin');
    return {
      infusion: it.infusion, stats: LS.statsOfItem(it), mana: LS.store.materialCount(u, 'mana'),
      title: document.querySelector('.fd-title h2').textContent,
      chip: document.querySelector('.fd-title .chip').textContent,
      chipColor: getComputedStyle(document.querySelector('.fd-title .chip')).color,
      chipWeight: getComputedStyle(document.querySelector('.fd-title .chip')).fontWeight,
      detailVisible: !!document.querySelector('.forge-detail')
    };
  });
  await page.screenshot({ path: 'shot-forge-infused.png', fullPage: true });

  // Full-clear claim test
  const claim = await page.evaluate(() => {
    const u = LS.store.current();
    const nodes = LS.allNodes('python');
    u.progress.python = u.progress.python || { done: [], wins: [] };
    u.progress.python.done = nodes.map(n => n.id);
    LS.store.save();
    const r = LS.store.claimForgeStone(u, 'full', 'python');
    return { r, mana: LS.store.materialCount(u, 'mana') };
  });

  // Mobile screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shot-forge-mobile.png', fullPage: true });

  console.log(JSON.stringify({ seeded, before, after, claim, errors }, null, 2));
  await browser.close();
})();
