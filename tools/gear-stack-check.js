/* 校验战斗页三装备栏展示与效果叠加（仅 localhost + 本地验收账号） */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount } = require('./test-account');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/401|409/.test(m.text())) errors.push(m.text()); });

  await ensureTestAccount(page);
  await page.goto('http://localhost:8123/#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    const u = LS.store.current();
    if (!u) return { error: 'no test user' };
    ['u2', 'r6'].forEach(id => {
      if (u.equipment.some(e => e.shopId === id)) return;
      const def = LS.shopItem(id);
      if (def) LS.store.addEquipment(u, LS.shopLoot(def));
    });
    const items = LS.store.equippedItems(u, 'python');
    const total = LS.store.gearStats(u, 'python');
    const maxed = {};
    LS.STAT_KEYS.forEach(k => { maxed[k] = 0; });
    items.forEach(e => {
      const s = LS.statsOfItem(e);
      LS.STAT_KEYS.forEach(k => { maxed[k] = Math.max(maxed[k], s[k] || 0); });
    });
    return {
      items: items.map(e => ({ name: e.name, cat: e.cat, stats: LS.statsOfItem(e) })),
      total, maxed
    };
  });

  await page.goto('http://localhost:8123/#/battle/python/py-2-3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  const ui = await page.evaluate(() => ({
    tiles: [...document.querySelectorAll('.gear-three .gear-tile')].map(e => e.innerText.replace(/\s+/g, ' ').trim()),
    chips: [...document.querySelectorAll('.gear-total .gt-chips span')].map(e => e.innerText.replace(/\s+/g, ' ').trim()),
    overflow: document.documentElement.scrollWidth - window.innerWidth
  }));

  await page.screenshot({ path: 'shot-gear-stack-desktop.png', fullPage: true });

  const mobile = await ctx.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto('http://localhost:8123/#/battle/python/py-2-3', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(1600);
  const m = await mobile.evaluate(() => {
    const u = LS.store.current();
    return {
      tiles: document.querySelectorAll('.gear-three .gear-tile').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      uid: u && u.uid,
      equipped: u && u.equipped,
      items: u && (u.equipment || []).map(e => ({ name: e.name, cat: e.cat, iid: e.iid, langs: e.langs })),
      eq: u ? LS.store.equippedItems(u, 'python').map(e => e.name) : []
    };
  });
  await mobile.screenshot({ path: 'shot-gear-stack-mobile.png', fullPage: true });

  /* 魔能注入的增幅展示：源初武器 +3 阶，确认粉色阶位与数值倍率出现在面板上。 */
  const inf = await page.evaluate(() => {
    const u = LS.store.current();
    const def = LS.shopItem('o1');
    const item = LS.store.addEquipment(u, LS.shopLoot(def));
    if (item) {
      item.infusion = 3;
      LS.store.equip(u, item.iid, 'python');
      LS.store.save();
    }
    const cur = LS.store.equippedItems(u, 'python').find(e => e.cat === 'weapon');
    return {
      name: cur && cur.name,
      infusion: cur && cur.infusion,
      stats: cur && LS.statsOfItem(cur),
      total: LS.store.gearStats(u, 'python')
    };
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const ov = document.querySelector('.announce-modal');
    const ok = ov && ov.querySelector('.announce-ok');
    if (ok) ok.click();
  });
  const infTile = await page.evaluate(() => {
    const u = LS.store.current();
    const t = document.querySelector('.gear-three .gear-tile');
    return {
      tile: t ? t.innerText.replace(/\s+/g, ' ').trim() : '',
      uid: u && u.uid,
      loadout: u && u.equipped && u.equipped.python,
      eq: u ? LS.store.equippedItems(u, 'python').map(e => ({ name: e.name, iid: e.iid, inf: e.infusion })) : [],
      owned: u ? (u.equipment || []).filter(e => /源初/.test(e.name)).map(e => ({ name: e.name, iid: e.iid, inf: e.infusion })) : []
    };
  });
  await page.screenshot({ path: 'shot-gear-infusion-desktop.png', fullPage: true });

  await page.goto('http://localhost:8123/#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const ov = document.querySelector('.announce-modal');
    const ok = ov && ov.querySelector('.announce-ok');
    if (ok) ok.click();
  });
  const profile = await page.evaluate(() => ({
    note: (document.querySelector('.armory-note') || {}).innerText || '',
    bar: (document.querySelector('.gear-stat-bar') || {}).innerText || '',
    overflow: document.documentElement.scrollWidth - window.innerWidth
  }));
  await page.screenshot({ path: 'shot-gear-profile.png', fullPage: true });

  console.log(JSON.stringify({ data, ui, mobile: m, inf, infTile, profile, errors }, null, 2));
  await browser.close();
})();
