const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount } = require('./test-account');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [], missing = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) missing.push(r.status() + ' ' + r.url()); });

  await ensureTestAccount(page);
  await page.goto('http://localhost:8123/index.html#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const u = LS.store.current();
    if (!(u.equipment || []).some(e => e.shopId === 'o1')) LS.store.addEquipment(u, LS.shopLoot(LS.shopItem('o1')));
    LS.store.addMaterial(u, 'mana', 6);
  });

  const langBoss = await page.evaluate(() => LS.LANGS.map(l => {
    const nodes = LS.allNodes(l.id);
    const last = nodes[nodes.length - 1];
    return { lang: l.id, last: last.id, boss: !!last.boss, final: LS.isFinalBossNode(last, l.id), name: last.enemy && last.enemy.name };
  }));

  const checks = await page.evaluate(() => {
    const u = LS.store.current();
    const out = {};
    // boss claiming for a fully cleared python track
    const nodes = LS.allNodes('python');
    u.progress.python.done = nodes.map(n => n.id);
    LS.store.save();
    out.bossClaim = LS.store.claimForgeStone(u, 'boss', 'python');
    out.bossClaimAgain = LS.store.claimForgeStone(u, 'boss', 'python');
    // max infusion guard
    const it = (u.equipment || []).find(e => e.quality === 'origin');
    it.infusion = 5;
    LS.store.save();
    out.infuseAtMax = LS.store.infuse(u, it.iid);
    it.infusion = 0;
    LS.store.save();
    return out;
  });

  // shop origin color
  await page.goto('http://localhost:8123/index.html#/shop', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const shopInfo = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.shop-card')].filter(c => c.style.getPropertyValue('--q-color').trim() === '#ff3d55');
    const chip = cards[0] && cards[0].querySelector('.chip');
    const filter = document.querySelector('.filter-chip.q-origin');
    return {
      originCards: cards.length,
      firstCard: cards[0] ? cards[0].querySelector('h3').textContent : null,
      colorVar: cards[0] ? cards[0].style.getPropertyValue('--q-color').trim() : null,
      chipColor: chip ? getComputedStyle(chip).color : null,
      filterColor: filter ? getComputedStyle(filter).color : null,
      filterBg: filter ? getComputedStyle(filter).backgroundColor : null
    };
  });
  await page.locator('.filter-chip.q-origin').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shot-shop-origin.png', fullPage: false });

  // profile infused view
  await page.evaluate(() => {
    const u = LS.store.current();
    const it = (u.equipment || []).find(e => e.quality === 'origin');
    it.infusion = 3;
    LS.store.save();
  });
  await page.goto('http://localhost:8123/index.html#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const profileInfo = await page.evaluate(() => {
    const el = document.querySelector('.ls-q');
    return {
      loadoutText: el ? el.textContent : null,
      color: el ? getComputedStyle(el).color : null,
      weight: el ? getComputedStyle(el).fontWeight : null,
      forgeBar: document.querySelector('.armory-forge-bar') ? document.querySelector('.armory-forge-bar').textContent.trim() : null
    };
  });
  await page.screenshot({ path: 'shot-profile-infused.png', fullPage: false });

  // desktop forge, freshly rendered after final CSS edits
  await page.goto('http://localhost:8123/index.html#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shot-forge-desktop.png', fullPage: false });

  // mobile forge after scrim + six-column nav
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:8123/index.html#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shot-forge-mobile2.png', fullPage: true });
  const mobileInfo = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav');
    const head = document.querySelector('.forge-page .page-head');
    const link = nav && nav.querySelector('a');
    return {
      navItems: nav ? nav.querySelectorAll('a').length : 0,
      navCols: nav ? getComputedStyle(nav).gridTemplateColumns.split(' ').length : 0,
      navWidth: nav ? Math.round(nav.getBoundingClientRect().width) : 0,
      navLinkWidth: link ? Math.round(link.getBoundingClientRect().width) : 0,
      forgeActive: !!(nav && nav.querySelector('a.active[href="#/forge"]')),
      headBg: head ? getComputedStyle(head).backgroundImage : null,
      favicon: (document.querySelector('link[rel="icon"]') || {}).href || null,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });

  console.log(JSON.stringify({ langBoss, checks, shopInfo, profileInfo, mobileInfo, missing: [...new Set(missing)], errors }, null, 2));
  await browser.close();
})();
