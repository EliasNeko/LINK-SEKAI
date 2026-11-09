/* 账号门槛验收：无游客/演示入口、必须注册、只能使用自己的账号、NPC 会话被拒绝。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const ORIGIN = process.argv[2] || 'http://localhost:8123';
const LOGIN = ('gate' + Math.random().toString(36).slice(2, 8)).slice(0, 12);
const PASSWORD = 'Gate-' + Math.random().toString(36).slice(2, 10);

async function closeAnnouncement(page) {
  const close = page.locator('.announce-close').first();
  if (await close.count()) {
    await close.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(350);
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();
  let errors = 0;
  page.on('console', (m) => { if (m.type() === 'error') errors++; });
  page.on('pageerror', (e) => { errors++; console.log('PAGEERROR', e.message); });

  /* 1. 带 ?demo=1 也必须停在登录页，且不存在演示入口。 */
  await page.goto(ORIGIN + '/?demo=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await closeAnnouncement(page);
  console.log('auth gate:', await page.locator('.auth-shell').count() ? 'ok' : 'MISSING');
  console.log('demo button:', await page.locator('#demo-login, .demo-btn, .demo-row').count() === 0 ? 'removed' : 'STILL PRESENT');
  console.log('game hidden:', await page.locator('#app .shell, #app .hub-wrap').count() === 0 ? 'ok' : 'LEAKED');

  /* 2. 必须注册后才能进入。 */
  await page.click('[data-tab="register"]');
  await page.fill('#register-form input[name="login"]', LOGIN);
  await page.fill('#register-form input[name="gameName"]', '门槛旅人');
  await page.fill('#register-form input[name="password"]', PASSWORD);
  await page.fill('#register-form input[name="confirm"]', PASSWORD);
  await page.click('#register-form button[type="submit"]');
  await page.waitForSelector('.onboard-body', { timeout: 15000 });
  console.log('register -> onboarding:', 'ok');

  const langs = page.locator('[data-lang]');
  if (await langs.count()) {
    await langs.nth(0).click();
    await page.waitForTimeout(300);
    await page.click('#to-creator');
    await page.waitForTimeout(900);
    const name = page.locator('#finish-name');
    if (await name.count()) await name.fill('门槛旅人');
    await page.click('#begin-journey');
    await page.waitForTimeout(1800);
  }
  const hubText = await page.locator('body').innerText();
  console.log('own account in game:', /门槛旅人/.test(hubText) ? 'ok' : 'MISSING');

  /* 3. 刷新后仍是自己的账号。 */
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await closeAnnouncement(page);
  console.log('session survives reload:', /门槛旅人/.test(await page.locator('body').innerText()) ? 'ok' : 'LOST');

  /* 4. 退出后回到登录页。 */
  await page.locator('[data-logout]').first().click();
  await page.waitForTimeout(900);
  console.log('logout -> auth:', await page.locator('.auth-shell').count() ? 'ok' : 'MISSING');

  /* 5. 把会话强行指向 NPC，刷新后必须被拒绝并清掉。 */
  await page.evaluate(() => {
    LS.store.db.users['LSK-7Q2M'].isNPC = true;
    localStorage.setItem('linksekai.session.v1', 'LSK-7Q2M');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await closeAnnouncement(page);
  console.log('npc session rejected:', await page.locator('.auth-shell').count() ? 'ok' : 'NPC LOGGED IN');
  const npcSession = await page.evaluate(() => localStorage.getItem('linksekai.session.v1'));
  console.log('npc session cleared:', npcSession ? 'STILL SET' : 'ok');

  /* 6. 旧演示档案会被清理，且不会留下好友引用。 */
  const purge = await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('linksekai.db.v1'));
    db.users['LSK-OLD01'] = {
      uid: 'LSK-OLD01', login: 'demo', gameName: '星野·澪', isNPC: true,
      salt: 'demo', passHash: 'demo', gameName2: '', onboardingDone: true,
      activeLangs: ['python'], primaryLang: 'python', equipment: [], friends: []
    };
    db.users['LSK-7Q2M'].friends = (db.users['LSK-7Q2M'].friends || []).concat([{ uid: 'LSK-OLD01', remark: '旧演示' }]);
    localStorage.setItem('linksekai.db.v1', JSON.stringify(db));
    localStorage.setItem('linksekai.session.v1', 'LSK-OLD01');
    return true;
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await closeAnnouncement(page);
  const after = await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('linksekai.db.v1'));
    return {
      demo: !!db.users['LSK-OLD01'],
      ref: (db.users['LSK-7Q2M'].friends || []).some(f => f.uid === 'LSK-OLD01'),
      session: localStorage.getItem('linksekai.session.v1'),
      auth: !!document.querySelector('.auth-shell')
    };
  });
  console.log('old demo purged:', !purge || (!after.demo && !after.ref) ? 'ok' : 'STILL EXISTS');
  console.log('demo session cleared:', after.session ? 'STILL SET' : 'ok');
  console.log('back at auth:', after.auth ? 'ok' : 'MISSING');

  await page.screenshot({ path: 'shot-auth-gate-desktop.png' });

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(ORIGIN + '/?demo=1', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(1200);
  await closeAnnouncement(mobile);
  await mobile.screenshot({ path: 'shot-auth-gate-mobile.png' });
  const m = await mobile.evaluate(() => {
    const shell = document.querySelector('.auth-shell');
    return {
      auth: !!shell,
      demo: document.querySelectorAll('#demo-login, .demo-btn, .demo-row').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    };
  });
  console.log('mobile auth gate:', m.auth ? 'ok' : 'MISSING');
  console.log('mobile demo:', m.demo === 0 ? 'removed' : 'STILL PRESENT');
  console.log('mobile overflow:', m.overflow ? 'HORIZONTAL' : 'none');

  await browser.close();
  console.log(errors === 0 ? 'account-gate-check passed' : 'console errors: ' + errors);
})();
