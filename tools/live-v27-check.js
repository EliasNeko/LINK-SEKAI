/* v2.7.0 线上验收：新手引导 → 演武场 → 咒式战斗 → 双账号好友申请。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

const ORIGIN = process.argv[2] || 'https://link-sekai-ot4mp9chy59.qoder.zone';
const OUT = 'qa-shots';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = n => Math.random().toString(36).slice(2, 2 + n);

async function closeAnnouncement(page) {
  const close = page.locator('.announce-close').first();
  if (await close.count()) {
    await close.click({ timeout: 5000 }).catch(() => {});
    await sleep(400);
  }
}

async function clearDialogue(page) {
  const ov = page.locator('.dlg-overlay');
  for (let i = 0; i < 5; i++) {
    if (!(await ov.count())) {
      await page.waitForTimeout(500);
      if (!(await ov.count())) return;
    }
    await page.locator('#dlg-skip').click({ force: true, timeout: 3000 }).catch(() => {});
    await ov.first().waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
}

async function register(page, account, gameName) {
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await sleep(1000);
  await closeAnnouncement(page);
  await page.click('[data-tab="register"]');
  await page.fill('#register-form input[name="login"]', account);
  await page.fill('#register-form input[name="gameName"]', gameName);
  await page.fill('#register-form input[name="password"]', account + '!Pass');
  await page.fill('#register-form input[name="confirm"]', account + '!Pass');
  await page.click('#register-form button[type="submit"]');
  await page.waitForSelector('.onboard-body', { timeout: 25000 });
}

async function onboarding(page, name) {
  const langs = page.locator('[data-lang]');
  await langs.nth(0).click();
  await sleep(300);
  await page.click('#to-creator');
  await sleep(900);
  const field = page.locator('#finish-name');
  if (await field.count()) await field.fill(name);
  await page.click('#begin-journey');
  await page.waitForTimeout(2200);
}

async function typeCode(page, code) {
  await page.evaluate(src => {
    const ta = document.querySelector('.ce-input');
    ta.focus();
    ta.value = src;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }, code);
}

async function expectedText(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.task-expected');
    return el ? el.innerText : '';
  });
}

async function attack(page) {
  await page.locator('#attack-btn').click();
  await sleep(1000);
}

async function hp(page) {
  const t = await page.locator('#player-hp-text').innerText();
  const m = t.match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { cur: Number(m[1]), max: Number(m[2]) } : null;
}

function literalPrint(text) {
  return String(text).split('\n').map(l => 'print(' + JSON.stringify(l) + ')').join('\n');
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    channel: 'msedge',
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const stealth = {
    locale: 'zh-CN',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  };
  const contextA = await browser.newContext({ viewport: { width: 1440, height: 980 }, ...stealth });
  const contextB = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...stealth });
  await contextA.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
  await contextB.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
  const page = await contextA.newPage();
  const pageB = await contextB.newPage();
  const errors = [];
  const consoleNoise = [];
  const failed = [];
  const watch = (p, tag) => {
    p.on('console', m => { if (m.type() === 'error') consoleNoise.push(tag + ': ' + m.text()); });
    p.on('pageerror', e => errors.push(tag + ' PAGEERROR: ' + e.message));
    p.on('requestfailed', r => failed.push(tag + ': ' + r.url()));
    p.on('response', r => { if (r.status() >= 400) console.log('HTTP', tag, r.status(), r.request().method(), r.url().replace(ORIGIN, '')); });
  };
  watch(page, 'A');
  watch(pageB, 'B');

  const report = [];
  const log = (key, ok, detail) => { report.push({ key, ok, detail }); console.log((ok ? 'ok   ' : 'FAIL ') + key + (detail ? ' — ' + detail : '')); };

  const accA = ('lvA' + rand(6)).slice(0, 11);
  const accB = ('lvB' + rand(6)).slice(0, 11);
  const nameA = '线上验收甲';
  const nameB = '线上验收乙';

  /* ---- 1. 注册 A → 新手引导 ---- */
  await register(page, accA, nameA);
  await onboarding(page, nameA);
  log('register -> tutorial', await page.locator('.tut-page').count() === 1, page.url());
  const tutText = await page.locator('.tut-page').innerText();
  const dotCount = await page.locator('.tut-dot').count();
  log('tutorial 8 steps', dotCount === 8 && /规则|星海/.test(tutText), dotCount + ' dots');
  await page.screenshot({ path: OUT + '/live-v27-tutorial.png' });
  let gearText = '';
  for (let i = 0; i < 7; i++) {
    await page.locator('.tut-page [data-next]').click();
    await sleep(300);
    if (i === 3) {
      gearText = await page.locator('.tut-page').innerText();
      await page.screenshot({ path: OUT + '/live-v27-tutorial-gear.png' });
    }
  }
  log('tutorial gear step', /装备/.test(gearText) && /武器/.test(gearText));
  const lastText = await page.locator('.tut-page').innerText();
  log('tutorial step 8 gift', /启程礼/.test(lastText));
  await page.locator('.tut-page [data-next]').click();
  await page.waitForTimeout(2200);
  log('tutorial done -> hub', await page.locator('.tut-page').count() === 0);

  const uidA = await page.evaluate(() => (LS.store.current() || {}).uid || '');
  log('uid A', /^LSK-/.test(uidA), uidA);

  /* ---- 2. 演武场：运行、双语报错、随身天书 ---- */
  await page.goto(ORIGIN + '/#/training', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await closeAnnouncement(page);
  const tabs = await page.evaluate(() => ({
    total: document.querySelectorAll('.tr-lang').length,
    locked: document.querySelectorAll('.tr-lang.is-locked').length,
    on: document.querySelectorAll('.tr-lang.is-on').length
  }));
  log('training lang tabs', tabs.total >= 6 && tabs.locked >= 5 && tabs.on === 1, JSON.stringify(tabs));
  await typeCode(page, 'print(missing_name)');
  await page.locator('.tr-page [data-run], [data-run]').first().click();
  await page.waitForTimeout(1400);
  const termErr = await page.locator('#tr-term').innerText();
  log('bilingual runtime error', /NameError|is not defined|Traceback/.test(termErr) && /[\u4e00-\u9fa5]/.test(termErr), termErr.replace(/\n/g, ' | ').slice(0, 120));
  await page.evaluate(() => {
    const ta = document.querySelector('.ce-input');
    ta.focus();
    ta.value = 'for i in range(1, 4):\n    print(i)';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-run]').first().click();
  await page.waitForTimeout(1200);
  const termOk = await page.locator('#tr-term').innerText();
  log('training run ok', /1[\s\S]*2[\s\S]*3/.test(termOk), termOk.replace(/\n/g, ' | ').slice(0, 80));
  await page.locator('#tr-fab').click();
  await sleep(600);
  const drawerOpen = await page.evaluate(() => {
    const d = document.querySelector('#tr-drawer');
    return d ? d.getAttribute('aria-hidden') === 'false' && d.getBoundingClientRect().width > 200 : false;
  });
  const bookText = await page.locator('#tr-drawer').innerText();
  log('book mini opens', drawerOpen && /天书|知识|术语/.test(bookText));
  await page.screenshot({ path: OUT + '/live-v27-training-book.png' });
  await page.locator('[data-drawer-close]').first().click();
  await sleep(400);
  await page.screenshot({ path: OUT + '/live-v27-training.png' });

  /* ---- 3. 咒式约束：精英题捷径被格挡 ---- */
  await page.evaluate(() => {
    const u = LS.store.current();
    u.onboardingDone = true;
    u.tutorialDone = true;
    u.primaryLang = 'python';
    const p = LS.store.progressOf(u, 'python');
    p.done = Array.from(new Set([].concat(p.done || [], ['py-2-1', 'py-2-2'])));
    LS.store.save();
  });
  await page.goto(ORIGIN + '/#/battle/python/py-2-3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await closeAnnouncement(page);
  await clearDialogue(page);
  log('battle spell panel', await page.locator('.spell-req').count() > 0 || /咒式/.test(await page.locator('body').innerText()));

  let blockedSeen = '';
  for (let i = 0; i < 6; i++) {
    await clearDialogue(page);
    const exp = await expectedText(page);
    const before = await hp(page);
    await typeCode(page, literalPrint(exp));
    await attack(page);
    const blockLines = await page.locator('.term-line.is-block').count();
    const warn = await page.locator('.term-outcome.warn').count();
    const term = await page.locator('#terminal-body').innerText().catch(() => '');
    console.log('  attack', i + 1, 'block=' + blockLines, 'warn=' + warn, term.replace(/\n/g, ' | ').slice(0, 110));
    if (blockLines || warn) {
      const after = await hp(page);
      blockedSeen = 'hp ' + JSON.stringify(before) + ' -> ' + JSON.stringify(after);
      await page.screenshot({ path: OUT + '/live-v27-battle-block.png' });
      break;
    }
    if (await page.locator('.win-modal, .victory-modal').count()) break;
  }
  log('battle shortcut blocked live', !!blockedSeen, blockedSeen);

  /* ---- 4. 双账号好友申请 ---- */
  await register(pageB, accB, nameB);
  await onboarding(pageB, nameB);
  await pageB.locator('.tut-page [data-skip]').click();
  await pageB.waitForTimeout(1800);
  const uidB = await pageB.evaluate(() => (LS.store.current() || {}).uid || '');
  log('uid B', /^LSK-/.test(uidB), uidB);

  await pageB.goto(ORIGIN + '/#/friends', { waitUntil: 'networkidle' });
  await pageB.waitForTimeout(2200);
  await closeAnnouncement(pageB);
  await clearDialogue(pageB);
  await pageB.fill('#friend-uid', uidA);
  await pageB.fill('#friend-remark', '验收同行');
  await pageB.locator('#add-friend-form button[type="submit"]').click();
  await pageB.waitForTimeout(2200);
  const sentText = await pageB.locator('body').innerText();
  log('request sent', /申请已送出|等待对方|已发出/.test(sentText) || (await pageB.locator('.freq-row').count()) > 0);

  await page.goto(ORIGIN + '/#/friends', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await closeAnnouncement(page);
  await clearDialogue(page);
  let acceptCount = 0;
  for (let i = 0; i < 10; i++) {
    const btn = page.locator('[data-req-accept]').first();
    if (await btn.count() && await btn.isVisible()) { acceptCount = 1; break; }
    if (i === 4 && await page.locator('#fr-refresh').count()) await page.locator('#fr-refresh').click().catch(() => {});
    await sleep(1000);
  }
  if (!acceptCount) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await closeAnnouncement(page);
    await clearDialogue(page);
    const btn = page.locator('[data-req-accept]').first();
    acceptCount = (await btn.count() && await btn.isVisible()) ? 1 : 0;
  }
  log('incoming request visible', acceptCount > 0, await page.locator('#friend-req-panel').innerText().catch(() => ''));
  if (acceptCount) {
    await page.locator('[data-req-accept]').first().click();
    await page.waitForTimeout(2400);
    const friendText = await page.locator('#friend-grid').innerText().catch(() => '');
    log('friend accepted on A', friendText.includes(nameB), friendText.replace(/\n/g, ' | ').slice(0, 80));
    await page.screenshot({ path: OUT + '/live-v27-friends.png' });

    await pageB.reload({ waitUntil: 'networkidle' });
    await pageB.waitForTimeout(2400);
    await closeAnnouncement(pageB);
    await clearDialogue(pageB);
    const friendTextB = await pageB.locator('#friend-grid').innerText().catch(() => '');
    log('friend on B', friendTextB.includes(nameA), friendTextB.replace(/\n/g, ' | ').slice(0, 80));
  }

  /* ---- 5. 手机端演武场 ---- */
  const mobile = await contextA.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(ORIGIN + '/#/training', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(1800);
  await closeAnnouncement(mobile);
  const m = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    fab: !!document.querySelector('#tr-fab')
  }));
  log('mobile training', !m.overflow && m.fab, JSON.stringify(m));
  await mobile.screenshot({ path: OUT + '/live-v27-training-mobile.png' });

  console.log('\naccounts:', accA, uidA, '/', accB, uidB);
  console.log('page errors:', errors.length, errors.slice(0, 6).join(' || '));
  console.log('console noise:', consoleNoise.length, consoleNoise.slice(0, 4).join(' || '));
  console.log('failed requests:', failed.length, failed.slice(0, 6).join(' || '));
  await browser.close();
  if (report.some(r => !r.ok) || errors.length) process.exitCode = 1;
})();
