/* v2.7.0 星海演武场验收：编辑器、运行、英文+中文报错、随身天书、桌面与手机布局。 */
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
  await ensureTestAccount(page, BASE);
  await page.evaluate(() => {
    const u = LS.store.current();
    u.activeLangs = ['python', 'javascript'];
    u.primaryLang = 'python';
    u.onboardingDone = true;
    LS.store.save();
  });
  await page.goto(BASE + '/index.html#/training', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await closeAnnouncement(page);

  const state = await page.evaluate(() => ({
    hasPage: !!document.querySelector('.train-page'),
    tabs: document.querySelectorAll('.tr-lang').length,
    lit: document.querySelectorAll('.tr-lang:not(.is-locked)').length,
    editor: !!document.querySelector('.ce-input'),
    value: document.querySelector('.ce-input') ? document.querySelector('.ce-input').value.slice(0, 60) : null,
    fab: !!document.querySelector('#tr-fab'),
    docW: document.documentElement.scrollWidth,
    winW: innerWidth
  }));
  console.log('TRAIN STATE', JSON.stringify(state));

  /* 运行正常代码 */
  await page.evaluate(() => {
    const ta = document.querySelector('.ce-input');
    ta.focus();
    ta.value = 'for i in range(3):\n    print("咏唱", i + 1)';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-run]').click();
  await page.waitForTimeout(400);
  const okOut = await page.evaluate(() => ({
    text: document.querySelector('#tr-term').innerText,
    status: document.querySelector('#tr-term-status').textContent
  }));
  console.log('RUN OK', JSON.stringify(okOut));

  /* 运行报错代码（未定义名字） */
  await page.evaluate(() => {
    const ta = document.querySelector('.ce-input');
    ta.focus();
    ta.value = 'print(hero_name)';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-run]').click();
  await page.waitForTimeout(400);
  const errOut = await page.evaluate(() => {
    const card = document.querySelectorAll('.tr-error-card');
    const last = card[card.length - 1];
    return {
      hasEn: !!last && !!last.querySelector('.tr-error-en code'),
      en: last ? last.querySelector('.tr-error-en code').textContent : null,
      cn: last ? last.querySelector('.tr-error-cn p').textContent : null,
      status: document.querySelector('#tr-term-status').textContent
    };
  });
  console.log('RUN ERR', JSON.stringify(errOut));
  await page.screenshot({ path: shot('v27-training-desktop'), fullPage: true });

  /* 语法错误 */
  await page.evaluate(() => {
    const ta = document.querySelector('.ce-input');
    ta.value = 'print("未闭合)';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-run]').click();
  await page.waitForTimeout(300);
  console.log('SYNTAX', await page.evaluate(() => document.querySelector('#tr-term').innerText.split('\n').slice(-6).join(' | ')));

  /* 随身天书 */
  await page.locator('#tr-fab').click();
  await page.waitForTimeout(400);
  const book = await page.evaluate(() => ({
    open: document.querySelector('#tr-drawer').classList.contains('is-open'),
    sections: document.querySelectorAll('.tr-book-sec').length,
    langs: document.querySelectorAll('[data-book-lang]').length
  }));
  console.log('BOOK', JSON.stringify(book));
  await page.locator('#tr-book-search').fill('变量');
  await page.waitForTimeout(200);
  const filtered = await page.evaluate(() => Array.from(document.querySelectorAll('.tr-book-sec')).filter(e => e.style.display !== 'none').length);
  console.log('BOOK FILTER', filtered);
  await page.locator('#tr-book-search').fill('');
  /* 直接运行示例 */
  const firstSummary = page.locator('.tr-book-sec summary').first();
  if (await firstSummary.count()) await firstSummary.click();
  await page.waitForTimeout(250);
  const runSnippet = page.locator('[data-run-snippet]').first();
  if (await runSnippet.count()) {
    await page.evaluate(() => document.querySelector('[data-run-snippet]').click());
    await page.waitForTimeout(500);
    console.log('SNIPPET RUN', await page.evaluate(() => document.querySelector('#tr-term-status').textContent));
  }
  await page.locator('#tr-fab').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: shot('v27-training-book'), fullPage: false });

  /* 锁定语言不可切换 */
  await page.evaluate(() => { document.querySelector('.tr-lang.is-locked').click(); });
  await page.waitForTimeout(300);
  console.log('LOCK TOAST', await page.evaluate(() => (document.querySelector('.toast b') || {}).textContent || null));

  /* 手机 */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html#/training', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const fab = document.querySelector('#tr-fab');
    if (fab && fab.getAttribute('aria-expanded') === 'true') fab.click();
  });
  await page.waitForTimeout(300);
  const mobile = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    gridCols: getComputedStyle(document.querySelector('.tr-grid')).gridTemplateColumns,
    fab: (() => { const r = document.querySelector('#tr-fab').getBoundingClientRect(); return { right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom) }; })()
  }));
  console.log('MOBILE', JSON.stringify(mobile));
  await page.screenshot({ path: shot('v27-training-mobile'), fullPage: true });
  await page.evaluate(() => document.querySelector('#tr-fab').click());
  await page.waitForTimeout(400);
  await page.screenshot({ path: shot('v27-training-mobile-book'), fullPage: false });

  console.log('ERRORS', JSON.stringify(errors));
  console.log('FAILED_REQUESTS', JSON.stringify(failed));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
