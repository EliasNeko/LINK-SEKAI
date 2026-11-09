/* 线上验收：v2.5.0 公告、临时 QA 账号、云端存档同步、六职业阶段立绘（档案 / 熟练度 / 战斗三态），
   桌面 + 手机截图，控制台 / 404 / 横向溢出检查。只在正式站点注册临时 QA 账号，不触碰真实玩家存档。 */
const { ensureTestAccount, closeAnnouncement, PLAYWRIGHT } = require('./test-account');
const { chromium } = require(PLAYWRIGHT);

const ORIGIN = (process.argv[2] || 'https://link-sekai-ot4mp9chy59.qoder.zone').replace(/\/$/, '');
const HOST = new URL(ORIGIN).hostname;
const LANGS = ['c', 'cpp', 'java', 'javascript', 'python', 'go'];
/* 正式站点网关会拦截 HeadlessChrome UA（BOT_DETECTED），验收时使用普通 Edge 标识。 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0';

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
    if (m.type() !== 'error' || /Failed to load resource/.test(m.text())) return;
    state.errors.push(m.text());
    console.log('CONSOLE', m.text());
  });
  page.on('pageerror', e => { state.errors.push(e.message); console.log('PAGEERROR', e.message); });
  page.on('response', r => {
    if (r.status() < 400) return;
    /* 未登录时 /me、/state 返回 401 属正常流程；登录会话由 LS.cloud.session 单独校验。 */
    if (r.status() === 401 && r.url().indexOf('/functions/v1/app/api/') >= 0) return;
    state.http.push(r.status() + ' ' + r.url());
    console.log('HTTP', r.status(), r.url());
  });
  page.on('requestfailed', r => {
    const host = new URL(r.url()).hostname;
    if (host === HOST) {
      state.http.push('FAILED ' + r.url());
      console.log('REQFAIL', r.url(), (r.failure() || {}).errorText);
    }
  });
}

async function waitCloud(page) {
  await page.waitForFunction(
    () => window.LS && LS.cloud && LS.cloud.enabled && LS.cloud.online && LS.cloud.session,
    null, { timeout: 25000 }
  );
}

async function pushAndConfirm(page) {
  return page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && LS.cloud.pushing; i++) await wait(250);
    await LS.cloud.pushNow();
    for (let i = 0; i < 80 && (LS.cloud.pushing || LS.cloud.dirty); i++) await wait(250);
    const u = LS.store.current();
    return {
      version: u && u.cloudVersion,
      session: LS.cloud.session,
      online: LS.cloud.online,
      dirty: LS.cloud.dirty,
      lastError: LS.cloud.lastError,
      pyDone: u && u.progress && u.progress.python ? u.progress.python.done.length : 0,
      nodes: LS.allNodes('python').length
    };
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-blink-features=AutomationControlled'] });

  /* --- 全新会话：公告 v2.5.0 --- */
  const fresh = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN', userAgent: UA });
  const ap = await fresh.newPage();
  await ap.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await ap.waitForTimeout(1400);
  const ann = await ap.evaluate(() => {
    const m = document.querySelector('.announce-modal');
    return m ? m.innerText.replace(/\s+/g, ' ') : '';
  });
  console.log('announcement:', /v2\.5\.0/.test(ann) && /觉醒之形/.test(ann) ? 'ok' : 'MISSING');
  console.log('announcement awake copy:', /觉醒立绘/.test(ann) ? 'ok' : 'MISSING');
  console.log('announcement open source:', /完全开源/.test(ann) && /EliasNeko/.test(ann) ? 'ok' : 'MISSING');
  await ap.screenshot({ path: 'shot-live-announce-desktop.png' });
  await fresh.close();

  /* --- 临时 QA 账号 + 云端存档 --- */
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'zh-CN', userAgent: UA });
  const page = await desktop.newPage();
  const state = { errors: [], http: [] };
  watch(page, state);

  const acct = await ensureTestAccount(page, ORIGIN);
  console.log('qa account:', acct.login, acct.uid);
  await waitCloud(page);
  const before = await page.evaluate(() => LS.cloud.state());
  console.log('cloud session:', before.session ? 'ok' : 'MISSING', 'version=', before.version);

  await seedAllStages(page);
  const synced = await pushAndConfirm(page);
  console.log('cloud push:', JSON.stringify(synced));

  /* --- 刷新后确认云端存档回读 --- */
  await page.goto(ORIGIN + '/#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await waitCloud(page);
  await closeAnnouncement(page);
  const persisted = await page.evaluate(() => {
    const u = LS.store.current();
    return {
      login: u && u.login,
      version: u && u.cloudVersion,
      pyDone: u && u.progress && u.progress.python ? u.progress.python.done.length : 0,
      nodes: LS.allNodes('python').length,
      session: LS.cloud.session,
      lastSync: LS.cloud.lastSync
    };
  });
  console.log('cloud reload:', JSON.stringify(persisted));
  const cloudOk = persisted.login === acct.login && persisted.version >= synced.version &&
    persisted.pyDone === persisted.nodes && persisted.nodes > 0 && persisted.session && !!persisted.lastSync;
  console.log('cloud save/sync:', cloudOk ? 'ok' : 'FAILED');

  /* --- 36 张阶段立绘 --- */
  const art = await checkAllStageArt(page);
  const bad = art.filter(x => !x.ok);
  console.log('stage art loaded:', art.length - bad.length + '/' + art.length);
  if (bad.length) console.log('MISSING ART', JSON.stringify(bad));

  /* --- 档案页觉醒卡 --- */
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  await closeAnnouncement(page);
  await page.waitForTimeout(400);
  const awaken = await page.evaluate(() => {
    const card = document.querySelector('.pf-awaken');
    const img = document.querySelector('.pf-awaken-img');
    return {
      card: !!card,
      text: card ? card.innerText.replace(/\s+/g, ' ').slice(0, 160) : '',
      stage: img ? img.dataset.stage : null,
      file: img ? img.src.split('?')[0].split('/').pop() : null,
      w: img ? img.naturalWidth : 0,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    };
  });
  console.log('profile awaken:', awaken.card ? 'ok' : 'MISSING', awaken.file, 'stage=' + awaken.stage, 'w=' + awaken.w, 'overflow=' + awaken.overflow);
  console.log('profile awaken text:', awaken.text);
  await page.screenshot({ path: 'shot-live-profile-desktop.png', fullPage: true });

  /* --- 熟练度页六职业三阶 --- */
  await page.evaluate(() => { location.hash = '#/proficiency'; });
  await page.waitForTimeout(1700);
  const prof = await page.evaluate(() => Array.from(document.querySelectorAll('.prof-card .prof-img')).map(i => ({
    lang: i.dataset.lang, stage: i.dataset.stage, file: i.src.split('?')[0].split('/').pop(), w: i.naturalWidth
  })));
  const profOk = prof.length === 6 && prof.every(p => p.stage === '3' && p.w > 0);
  console.log('proficiency heroes:', prof.length, profOk ? 'all s3 ok' : JSON.stringify(prof));
  await page.screenshot({ path: 'shot-live-proficiency-desktop.png', fullPage: true });

  /* --- 战斗三态 --- */
  let duelOk = true;
  let battleHref = null;
  const battleHrefRaw = await page.evaluate(() => {
    const n = (LS.allNodes('python') || []).find(x => x.type === 'battle');
    return n ? '#/battle/python/' + n.id : null;
  });
  if (battleHrefRaw) {
    battleHref = battleHrefRaw;
    await page.goto(ORIGIN + '/' + battleHref, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await closeAnnouncement(page);
    await page.waitForTimeout(500);
    const duel = await page.evaluate(async () => {
      const el = document.querySelector('.player-sprite');
      if (!el) return { missing: true };
      const states = [];
      for (const expr of ['attack', 'hurt', 'idle']) {
        LS.charSetExpression(el, expr);
        const ok = await new Promise(res => {
          if (el.complete && el.naturalWidth > 0) return res(true);
          el.addEventListener('load', () => res(el.naturalWidth > 0), { once: true });
          el.addEventListener('error', () => res(false), { once: true });
          setTimeout(() => res(el.naturalWidth > 0), 5000);
        });
        states.push({ expr, file: el.src.split('?')[0].split('/').pop(), stage: el.dataset.stage, ok });
      }
      return { states };
    });
    console.log('battle sprite:', JSON.stringify(duel));
    duelOk = !duel.missing && duel.states.every(s => s.ok && s.stage === '3');
    await page.screenshot({ path: 'shot-live-battle-desktop.png', fullPage: true });
  } else {
    duelOk = false;
    console.log('battle route: MISSING');
  }

  /* --- 手机视口（沿用桌面 QA 会话） --- */
  const storageState = await desktop.storageState();
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: 'zh-CN', storageState, userAgent: UA
  });
  const mp = await mobile.newPage();
  const mstate = { errors: [], http: [] };
  watch(mp, mstate);
  await mp.goto(ORIGIN + '/index.html', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(1400);
  await closeAnnouncement(mp);
  await waitCloud(mp);

  await mp.evaluate(() => { location.hash = '#/profile'; });
  await mp.waitForTimeout(1600);
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
  await mp.screenshot({ path: 'shot-live-profile-mobile.png', fullPage: true });

  await mp.evaluate(() => { location.hash = '#/proficiency'; });
  await mp.waitForTimeout(1700);
  const mProf = await mp.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    cards: Array.from(document.querySelectorAll('.prof-card .prof-img')).map(i => ({
      lang: i.dataset.lang, stage: i.dataset.stage, w: i.naturalWidth
    }))
  }));
  const mProfOk = mProf.cards.length === 6 && mProf.cards.every(p => p.stage === '3' && p.w > 0);
  console.log('mobile proficiency:', mProf.cards.length, 'overflow=' + mProf.overflow, mProfOk ? 'all s3 ok' : JSON.stringify(mProf.cards));
  await mp.screenshot({ path: 'shot-live-proficiency-mobile.png', fullPage: true });

  let mBattleOk = true;
  if (battleHref) {
    await mp.goto(ORIGIN + '/' + battleHref, { waitUntil: 'networkidle' });
    await mp.waitForTimeout(1800);
    await closeAnnouncement(mp);
    await mp.waitForTimeout(400);
    const md = await mp.evaluate(() => {
      const el = document.querySelector('.player-sprite');
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        stage: el ? el.dataset.stage : null,
        file: el ? el.src.split('?')[0].split('/').pop() : null,
        w: el ? el.naturalWidth : 0
      };
    });
    console.log('mobile battle sprite:', JSON.stringify(md));
    mBattleOk = !!md.stage && md.stage === '3' && md.w > 0;
    await mp.screenshot({ path: 'shot-live-battle-mobile.png', fullPage: true });
  }

  console.log('desktop errors:', state.errors.length, 'http errors:', state.http.length);
  console.log('mobile errors:', mstate.errors.length, 'http errors:', mstate.http.length);
  await browser.close();

  const failed = bad.length || !awaken.card || !awaken.w || !profOk || !duelOk || !mAwake.w || !mProfOk || !mBattleOk ||
    !cloudOk || !synced.pyDone || state.errors.length || state.http.length || mstate.errors.length || mstate.http.length;
  console.log(failed ? 'LIVE CHECK FAILED' : 'LIVE CHECK PASSED');
  if (failed) process.exitCode = 1;
})();
