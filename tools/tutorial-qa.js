/* v2.7.0 新手引导验收：新账号跳转、8 步内容、指南 NPC 图、跳过、启程礼、回来重看。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount, closeAnnouncement } = require('./test-account');
const fs = require('fs');

const BASE = 'http://localhost:8123';
const OUT = 'qa-shots';
const shot = n => `${OUT}/${n}.png`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  const errors = [];
  const failed = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => failed.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
  await ensureTestAccount(page, BASE);

  /* 模拟一个刚完成注册、尚未看引导的新账号 */
  const base = await page.evaluate(() => {
    const u = LS.store.current();
    u.tutorialDone = false;
    u.tutorialReward = false;
    u.coins = 160;
    u.inspiration = 3;
    LS.store.save();
    return { coins: u.coins, inspiration: u.inspiration };
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await closeAnnouncement(page);
  const redirected = await page.evaluate(() => location.hash);
  const first = await page.evaluate(() => ({
    guide: (() => { const i = document.querySelector('.tut-portrait-img'); return i ? { w: i.naturalWidth, h: i.naturalHeight, loaded: i.complete && i.naturalWidth > 0 } : null; })(),
    title: (document.querySelector('#tut-title') || {}).textContent,
    steps: document.querySelectorAll('.tut-dot').length,
    hasShell: !!document.querySelector('.shell'),
    docW: document.documentElement.scrollWidth,
    winW: innerWidth
  }));
  console.log('TUTORIAL ENTRY', JSON.stringify({ redirected, base, first }));
  await page.screenshot({ path: shot('v27-tutorial-desktop-1'), fullPage: true });

  /* 逐步翻页，记录关键步骤文案 */
  const seen = [];
  for (let i = 0; i < 7; i++) {
    await page.locator('[data-next]').click();
    await page.waitForTimeout(220);
    seen.push(await page.evaluate(() => ({
      i: document.querySelector('#tut-step-label').textContent,
      title: document.querySelector('#tut-title').textContent,
      hasCards: document.querySelectorAll('.tut-mini-card').length,
      hasBullets: document.querySelectorAll('.tut-bullets li').length
    })));
    if (i === 2) await page.screenshot({ path: shot('v27-tutorial-desktop-battle'), fullPage: true });
    if (i === 4) await page.screenshot({ path: shot('v27-tutorial-desktop-gear'), fullPage: true });
  }
  console.log('TUTORIAL STEPS', JSON.stringify(seen));
  const last = await page.evaluate(() => ({
    label: document.querySelector('#tut-step-label').textContent,
    next: document.querySelector('[data-next]').textContent.trim(),
    gift: !!document.querySelector('.tut-gift')
  }));
  console.log('TUTORIAL LAST', JSON.stringify(last));
  await page.screenshot({ path: shot('v27-tutorial-desktop-last'), fullPage: true });

  /* 完成并领取启程礼 */
  await page.locator('[data-next]').click();
  await page.waitForTimeout(1000);
  const after = await page.evaluate(() => {
    const u = LS.store.current();
    return {
      hash: location.hash,
      tutorialDone: u.tutorialDone,
      reward: u.tutorialReward,
      coins: u.coins,
      inspiration: u.inspiration,
      hasHub: !!document.querySelector('.hub-page, .shell')
    };
  });
  console.log('TUTORIAL DONE', JSON.stringify(after));

  /* 刷新后不应再次被拉回 */
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await closeAnnouncement(page);
  console.log('RELOAD HASH', await page.evaluate(() => location.hash));

  /* 从档案重看 */
  await page.evaluate(() => { location.hash = '#/profile'; });
  await page.waitForTimeout(900);
  const replayLink = await page.locator('a[href="#/tutorial"]').count();
  if (replayLink) {
    await page.locator('a[href="#/tutorial"]').first().click();
    await page.waitForTimeout(800);
  }
  console.log('REPLAY', JSON.stringify({ links: replayLink, hash: await page.evaluate(() => location.hash), hasPage: await page.locator('.tut-page').count() }));

  /* 跳过 */
  await page.evaluate(() => {
    const u = LS.store.current();
    u.tutorialDone = false;
    u.tutorialReward = true;
    LS.store.save();
    location.hash = '#/tutorial';
  });
  await page.waitForTimeout(600);
  await page.locator('[data-skip]').click();
  await page.waitForTimeout(700);
  console.log('SKIP', await page.evaluate(() => ({ hash: location.hash, done: LS.store.current().tutorialDone })));

  /* 手机 */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const u = LS.store.current();
    u.tutorialDone = false;
    u.tutorialReward = true;
    LS.store.save();
    location.hash = '#/tutorial';
  });
  await page.waitForTimeout(800);
  const mobile = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    portraitH: Math.round(document.querySelector('.tut-portrait-frame').getBoundingClientRect().height),
    cols: getComputedStyle(document.querySelector('.tut-stage')).gridTemplateColumns
  }));
  console.log('TUTORIAL MOBILE', JSON.stringify(mobile));
  await page.screenshot({ path: shot('v27-tutorial-mobile-1'), fullPage: true });
  for (let i = 0; i < 4; i++) { await page.locator('[data-next]').click(); await page.waitForTimeout(180); }
  await page.screenshot({ path: shot('v27-tutorial-mobile-5'), fullPage: true });

  console.log('ERRORS', JSON.stringify(errors));
  console.log('FAILED_REQUESTS', JSON.stringify(failed));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
