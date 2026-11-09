const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount } = require('./test-account');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await ensureTestAccount(page);
  await page.goto('http://localhost:8123/index.html#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const out = await page.evaluate(() => {
    const u = LS.store.current();
    u.materials = {}; u.forgeClaims = { boss: [], full: [], stage3: [], bought: 0 }; u.coins = 100000;
    const nodes = LS.allNodes('c');
    u.progress.c = u.progress.c || { done: [], wins: [] };
    u.progress.c.done = nodes.map(n => n.id);
    u.progress.c.wins = nodes.filter(n => n.type === 'battle').map(n => n.id);
    LS.store.save();
    const stage = LS.proficiency(u, 'c');
    const s3 = LS.store.claimForgeStone(u, 'stage3', 'c');
    const bought = [LS.store.claimForgeStone(u, 'bought'), LS.store.claimForgeStone(u, 'bought'), LS.store.claimForgeStone(u, 'bought'), LS.store.claimForgeStone(u, 'bought')];
    return { stage: stage.stage, score: stage.score, s3, bought: bought.map(b => b.ok), mana: LS.store.materialCount(u, 'mana'), coins: u.coins };
  });
  console.log(JSON.stringify({ out, errors }, null, 2));
  await browser.close();
})();
