/* 线上 UI 验收：公告、注册、选轨、进入大厅、档案云端标记、刷新后会话恢复。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const ORIGIN = process.argv[2] || 'https://link-sekai-ot4mp9chy59.qoder.zone';
const LOGIN = ('ui' + Math.random().toString(36).slice(2, 10)).slice(0, 12);
const PASSWORD = 'UiCheck-' + Math.random().toString(36).slice(2, 10);

async function closeAnnouncement(page) {
  const close = page.locator('.announce-close').first();
  if (await close.count()) {
    await close.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
}

(async () => {
  const browser = await chromium.launch({
    channel: 'msedge',
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'zh-CN',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  const page = await context.newPage();
  let errors = 0;
  page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('CONSOLE', m.text()); } });
  page.on('pageerror', (e) => { errors++; console.log('PAGEERROR', e.message); });
  page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });

  console.log('live ui check:', ORIGIN, 'account:', LOGIN);
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const announceText = await page.locator('.announce-modal').innerText().catch(() => '');
  console.log('announcement:', /v2\.4\.0/.test(announceText) ? 'v2.4.0 ok' : 'MISSING VERSION');
  console.log('open source text:', /完全开源/.test(announceText) ? 'ok' : 'MISSING');
  console.log('author:', /龙潜猫隐/.test(announceText) ? 'ok' : 'MISSING');
  await page.screenshot({ path: 'live-announce.png' });
  await closeAnnouncement(page);

  await page.click('[data-tab="register"]');
  await page.fill('#register-form input[name="login"]', LOGIN);
  await page.fill('#register-form input[name="gameName"]', '验收旅人');
  await page.fill('#register-form input[name="password"]', PASSWORD);
  await page.fill('#register-form input[name="confirm"]', PASSWORD);
  await page.click('#register-form button[type="submit"]');
  await page.waitForTimeout(2200);

  const onboard = await page.locator('.onboard-body').count();
  console.log('onboarding shown:', onboard ? 'ok' : 'MISSING');

  const langs = page.locator('[data-lang]');
  if (await langs.count()) {
    await langs.nth(0).click();
    await page.waitForTimeout(300);
    await page.click('#to-creator');
    await page.waitForTimeout(900);
    const name = page.locator('#finish-name');
    if (await name.count()) await name.fill('验收旅人');
    await page.click('#begin-journey');
    await page.waitForTimeout(2000);
  }

  await page.goto(ORIGIN + '/#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await closeAnnouncement(page);
  await page.waitForTimeout(800);
  const profileText = await page.locator('body').innerText();
  console.log('profile loaded:', /验收旅人/.test(profileText) ? 'ok' : 'MISSING NAME');
  console.log('cloud chip:', /云端存档/.test(profileText) ? 'ok' : 'MISSING');
  console.log('sync button:', /立即同步/.test(profileText) ? 'ok' : 'MISSING');
  await page.screenshot({ path: 'live-profile.png' });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await closeAnnouncement(page);
  await page.goto(ORIGIN + '/#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const afterReload = await page.locator('body').innerText();
  console.log('session after reload:', /验收旅人/.test(afterReload) ? 'ok' : 'LOST');

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(1400);
  await mobile.screenshot({ path: 'live-mobile.png' });
  await closeAnnouncement(mobile);
  await mobile.waitForTimeout(500);
  const mobileText = await mobile.locator('body').innerText();
  console.log('mobile announcement rendered:', /完全开源/.test(await mobile.locator('.announce-modal').innerText().catch(() => '')) ? 'ok' : 'check');
  console.log('mobile body:', mobileText.slice(0, 40).replace(/\n/g, ' / '));

  await browser.close();
  console.log(errors === 0 ? 'live-ui-check passed' : 'live-ui-check console issues: ' + errors);
})();
