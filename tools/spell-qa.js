/* v2.7.0 战斗语法约束验收：小怪轻题 → 精英/BOSS 必须按咒式出招，捷径被格挡并受减弱反击。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount, closeAnnouncement } = require('./test-account');
const fs = require('fs');

const BASE = 'http://localhost:8123';
const OUT = 'qa-shots';
const shot = n => `${OUT}/${n}.png`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

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
  await sleep(900);
}

async function hp(page) {
  const t = await page.locator('#player-hp-text').innerText();
  const m = t.match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { cur: Number(m[1]), max: Number(m[2]) } : null;
}

async function counter(page) {
  const t = await page.evaluate(() => {
    const el = document.querySelector('.si-facts');
    return el ? el.innerText : '';
  });
  const m = t.match(/反击伤害\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

function literalPrint(text) {
  return String(text).split('\n').map(l => 'print(' + JSON.stringify(l) + ')').join('\n');
}

function loopSum(expected) {
  const offset = Number(expected) - 5050;
  return `total = ${offset}\nfor i in range(1, 101):\n    total = total + i\nprint(total)`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  const errors = [];
  const failed = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => failed.push(r.url()));

  await ensureTestAccount(page, BASE);
  await page.goto(BASE + '/index.html#/battle/python/py-2-3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  await closeAnnouncement(page);

  const report = { steps: [], errors, failed };

  /* ---- 小怪 1：轻题不需要咒式 ---- */
  let exp = await expectedText(page);
  await typeCode(page, literalPrint(exp));
  await attack(page);
  report.steps.push({
    step: 'minion-1',
    expected: exp,
    ok: await page.locator('.term-outcome.ok').count() > 0,
    hasSpellReq: await page.locator('.spell-req').count() > 0
  });

  await page.waitForTimeout(1600);
  await page.waitForTimeout(500);

  /* ---- 小怪 2 ---- */
  exp = await expectedText(page);
  await typeCode(page, literalPrint(exp));
  await attack(page);
  report.steps.push({
    step: 'minion-2',
    expected: exp,
    ok: await page.locator('.term-outcome.ok').count() > 0
  });
  await page.waitForTimeout(2100);

  /* ---- 精英：输出正确但不用循环 -> 格挡 ---- */
  const spell = await page.evaluate(() => ({
    panel: document.querySelector('.spell-req') ? document.querySelector('.spell-req').innerText : null,
    badge: document.querySelector('.task-badge.is-spell') ? document.querySelector('.task-badge.is-spell').innerText : null,
    title: document.querySelector('.mission-title-row h2') ? document.querySelector('.mission-title-row h2').innerText : ''
  }));
  exp = await expectedText(page);
  const c = await counter(page);
  const hp0 = await hp(page);
  await typeCode(page, 'print(' + JSON.stringify(exp) + ')');
  await attack(page);
  const blocked = await page.evaluate(() => ({
    line: document.querySelector('.term-line.is-block') ? document.querySelector('.term-line.is-block').innerText : null,
    spell: document.querySelector('.term-spell') ? document.querySelector('.term-spell').innerText : null,
    warn: document.querySelector('.term-outcome.warn') ? document.querySelector('.term-outcome.warn').innerText : null
  }));
  const hp1 = await hp(page);
  report.steps.push({
    step: 'elite-blocked',
    expected: exp,
    spell,
    blocked,
    counter: c,
    hp0,
    hp1,
    reduced: hp1 ? hp0.cur - hp1.cur : null
  });
  await page.screenshot({ path: shot('v27-spell-desktop-blocked'), fullPage: false });

  /* ---- 手机布局 ---- */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  report.mobile = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: innerWidth,
    spellVisible: !!document.querySelector('.spell-req'),
    spellText: document.querySelector('.spell-req .sr-text') ? document.querySelector('.spell-req .sr-text').innerText : null
  }));
  await page.screenshot({ path: shot('v27-spell-mobile-blocked'), fullPage: false });
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.waitForTimeout(400);

  /* ---- 精英：按咒式循环通过 ---- */
  await typeCode(page, loopSum(exp));
  await attack(page);
  report.steps.push({
    step: 'elite-loop-pass',
    ok: await page.locator('.term-outcome.ok').count() > 0
  });
  await page.waitForTimeout(1600);

  exp = await expectedText(page);
  await typeCode(page, loopSum(exp));
  await attack(page);
  report.steps.push({
    step: 'elite-2-pass',
    ok: await page.locator('.term-outcome.ok').count() > 0
  });
  await page.waitForTimeout(2100);

  /* ---- BOSS 前段：捷径全额反击 ---- */
  exp = await expectedText(page);
  const c2 = await counter(page);
  const hp2 = await hp(page);
  await typeCode(page, 'print(' + JSON.stringify(exp) + ')  # for');
  await attack(page);
  const blocked2 = await page.evaluate(() => ({
    line: document.querySelector('.term-line.is-block') ? document.querySelector('.term-line.is-block').innerText : null,
    warn: document.querySelector('.term-outcome.warn') ? document.querySelector('.term-outcome.warn').innerText : null
  }));
  const hp3 = await hp(page);
  report.steps.push({
    step: 'boss-blocked',
    expected: exp,
    counter: c2,
    hp2,
    hp3,
    reduced: hp3 ? hp2.cur - hp3.cur : null,
    blocked2
  });
  await page.screenshot({ path: shot('v27-spell-boss-blocked'), fullPage: false });
  await page.waitForTimeout(1900);

  /* ---- BOSS 末段：原题循环通过（两击） ---- */
  await typeCode(page, loopSum(exp));
  await attack(page);
  report.steps.push({
    step: 'boss-pre-loop-pass',
    expected: exp,
    ok: await page.locator('.term-outcome.ok').count() > 0
  });
  await page.waitForTimeout(1700);
  exp = await expectedText(page);
  await typeCode(page, loopSum(exp));
  await attack(page);
  report.steps.push({
    step: 'boss-auth-loop-pass',
    expected: exp,
    ok: await page.locator('.term-outcome.ok').count() > 0
  });
  await page.waitForTimeout(2600);
  report.victory = await page.evaluate(() => ({
    modal: !!document.querySelector('.modal'),
    text: document.querySelector('.modal') ? document.querySelector('.modal').innerText.slice(0, 260) : ''
  }));
  await page.screenshot({ path: shot('v27-spell-victory'), fullPage: false });

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
