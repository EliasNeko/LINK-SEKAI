/* 阶段立绘验收：二阶 / 三阶三态素材加载、档案页觉醒卡、熟练度页、战斗页与移动端。
   只在 localhost:8123 用临时 QA 账号运行，不触碰 file:// 真实存档。 */
const { ensureTestAccount, closeAnnouncement, PLAYWRIGHT } = require('./test-account');
const { chromium } = require(PLAYWRIGHT);

const ORIGIN = process.argv[2] || 'http://localhost:8123';
const LANGS = ['c', 'cpp', 'java', 'javascript', 'python', 'go'];

async function seedAllStages(page) {
  await page.evaluate(() => {
    const u = LS.store.current();
    if (!u) return;
    u.onboardingDone = true;
    const all = LS.heroIds();
    u.activeLangs = all.slice();
    u.primaryLang = 'python';
    all.forEach(lid => {
      const p = LS.store.progressOf(u, lid);
      const nodes = LS.allNodes(lid) || [];
      p.done = Array.from(new Set(nodes.map(n => n.id)));
      p.wins = Array.from(new Set(nodes.filter(n => n.type === 'battle').map(n => n.id)));
    });
    if (!u.stats) u.stats = {};
    u.stats.bossNoHint = 99;
    LS.store.save();
  });
}

async function checkAllStageArt(page) {
  return page.evaluate(async (langs) => {
    const acts = ['idle', 'attack', 'hurt'];
    const out = [];
    for (const l of langs) {
      for (const s of [2, 3]) {
        for (const a of acts) {
          const src = LS.heroStageSrc(l, a, s);
          const r = await new Promise(res => {
            const im = new Image();
            im.onload = () => res({ ok: im.naturalWidth > 0, w: im.naturalWidth });
            im.onerror = () => res({ ok: false, w: 0 });
            im.src = src;
          });
          out.push(Object.assign({ lang: l, stage: s, act: a, file: src.split('?')[0].split('/').pop() }, r));
        }
      }
    }
    return out;
  }, LANGS);
}

function watch(page, state) {
  page.on('console', m => {
    /* 外部字体在 CI/离线环境会连接重置，排除资源加载噪音；真实 404 由 response 监听捕获。 */
    if (m.type() !== 'error' || /Failed to load resource/.test(m.text())) return;
    state.errors.push(m.text());
    console.log('CONSOLE', m.text());
  });
  page.on('pageerror', e => { state.errors.push(e.message); console.log('PAGEERROR', e.message); });
  page.on('response', r => { if (r.status() >= 400) { state.http.push(r.status() + ' ' + r.url()); console.log('HTTP', r.status(), r.url()); } });
  page.on('requestfailed', r => {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(r.url())) {
      state.http.push('FAILED ' + r.url());
      console.log('REQFAIL', r.url(), (r.failure() || {}).errorText);
    }
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-blink-features=AutomationControlled'] });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'zh-CN' });
  const page = await desktop.newPage();
  const state = { errors: [], http: [] };
  watch(page, state);

  const acct = await ensureTestAccount(page, ORIGIN);
  console.log('qa account:', acct.login);
  await seedAllStages(page);
  await page.waitForTimeout(400);

  /* --- 36 张阶段立绘直接预载 --- */
  const art = await checkAllStageArt(page);
  const bad = art.filter(x => !x.ok);
  console.log('stage art loaded:', art.length - bad.length + '/' + art.length);
  if (bad.length) console.log('MISSING ART', JSON.stringify(bad));

  /* --- 档案页觉醒形象卡 --- */
  await page.goto(ORIGIN + '/#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await closeAnnouncement(page);
  await page.waitForTimeout(600);
  const awaken = await page.evaluate(() => {
    const card = document.querySelector('.pf-awaken');
    const img = document.querySelector('.pf-awaken-img');
    return {
      card: !!card,
      text: card ? card.innerText.replace(/\s+/g, ' ').slice(0, 160) : '',
      stage: img ? img.dataset.stage : null,
      file: img ? img.src.split('?')[0].split('/').pop() : null,
      w: img ? img.naturalWidth : 0
    };
  });
  console.log('profile awaken card:', awaken.card ? 'ok' : 'MISSING');
  console.log('profile awaken img:', awaken.file, 'stage=' + awaken.stage, 'w=' + awaken.w);
  console.log('profile awaken text:', awaken.text);
  await page.screenshot({ path: 'shot-stage-profile-desktop.png', fullPage: true });

  /* --- 熟练度页六职业三阶立绘 --- */
  await page.goto(ORIGIN + '/#/proficiency', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const prof = await page.evaluate(() => Array.from(document.querySelectorAll('.prof-card .prof-img')).map(i => ({
    lang: i.dataset.lang, stage: i.dataset.stage, file: i.src.split('?')[0].split('/').pop(), w: i.naturalWidth
  })));
  console.log('proficiency heroes:', prof.length);
  console.log(prof.map(p => `${p.lang}:s${p.stage}:${p.w}`).join(' '));
  await page.screenshot({ path: 'shot-stage-proficiency-desktop.png', fullPage: true });

  /* --- 战斗页三态切换 --- */
  let duelOk = true;
  const battleHref = await page.evaluate(() => {
    const n = (LS.allNodes('python') || []).find(x => x.type === 'battle');
    return n ? '#/battle/python/' + n.id : null;
  });
  if (battleHref) {
    await page.goto(ORIGIN + '/' + battleHref, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600);
    await closeAnnouncement(page);
    await page.waitForTimeout(500);
    const duel = await page.evaluate(async () => {
      const el = document.querySelector('.player-sprite');
      if (!el) return { missing: true };
      const before = { act: el.dataset.act, stage: el.dataset.stage, file: el.src.split('?')[0].split('/').pop(), w: el.naturalWidth };
      const states = [];
      for (const expr of ['attack', 'hurt', 'idle']) {
        LS.charSetExpression(el, expr);
        const ok = await new Promise(res => {
          if (el.complete && el.naturalWidth > 0) return res(true);
          el.addEventListener('load', () => res(el.naturalWidth > 0), { once: true });
          el.addEventListener('error', () => res(false), { once: true });
          setTimeout(() => res(el.naturalWidth > 0), 4000);
        });
        states.push({ expr, file: el.src.split('?')[0].split('/').pop(), stage: el.dataset.stage, ok });
      }
      return { before, states };
    });
    console.log('battle sprite:', JSON.stringify(duel));
    duelOk = !duel.missing && duel.states.every(s => s.ok);
    await page.screenshot({ path: 'shot-stage-battle-desktop.png', fullPage: true });
  }

  /* --- 移动端（沿用桌面 QA 会话的 localStorage） --- */
  const storageState = await desktop.storageState();
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN', storageState });
  const mp = await mobile.newPage();
  const mstate = { errors: [], http: [] };
  watch(mp, mstate);
  await mp.goto(ORIGIN + '/index.html', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(1200);
  await closeAnnouncement(mp);
  await seedAllStages(mp);

  await mp.goto(ORIGIN + '/#/profile', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(1500);
  await closeAnnouncement(mp);
  await mp.waitForTimeout(500);
  const mAwake = await mp.evaluate(() => {
    const img = document.querySelector('.pf-awaken-img');
    return {
      stage: img ? img.dataset.stage : null,
      file: img ? img.src.split('?')[0].split('/').pop() : null,
      w: img ? img.naturalWidth : 0,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    };
  });
  console.log('mobile profile awaken:', JSON.stringify(mAwake));
  await mp.screenshot({ path: 'shot-stage-profile-mobile.png', fullPage: true });

  await mp.goto(ORIGIN + '/#/proficiency', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(1600);
  const mOverflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log('mobile proficiency overflow:', mOverflow);
  await mp.screenshot({ path: 'shot-stage-proficiency-mobile.png', fullPage: true });

  console.log('desktop errors:', state.errors.length, 'http errors:', state.http.length);
  console.log('mobile errors:', mstate.errors.length, 'http errors:', mstate.http.length);
  await browser.close();
  const failed = bad.length || !awaken.card || !duelOk || state.errors.length || state.http.length || mstate.errors.length || mstate.http.length;
  if (failed) process.exitCode = 1;
})();
