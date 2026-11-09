const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount } = require('./test-account');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], missing = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) missing.push(r.status() + ' ' + r.url()); });

  await ensureTestAccount(page);
  await page.goto('http://localhost:8123/index.html#/hub', { waitUntil: 'networkidle' });
  const planInfo = await page.evaluate(() => {
    const u = LS.store.current();
    const nodes = LS.allNodes('python');
    const ids = nodes.map(n => n.id);
    u.progress.python.done = ids.filter(id => id !== 'py-12-3');
    u.progress.python.wins = (u.progress.python.wins || []).filter(id => id !== 'py-12-3');
    u.forgeClaims = { boss: [], full: [], stage3: [], bought: 0 };
    u.materials = {};
    LS.store.save();
    const lang = LS.lang('python');
    let chapter = null, node = null;
    lang.chapters.forEach(c => (c.nodes || []).forEach(n => { if (n.id === 'py-12-3') { chapter = c; node = n; } }));
    const plan = LS.battlePlan({ lang, chapter, node });
    return {
      beforeMana: LS.store.materialCount(u, 'mana'),
      totalHits: plan.totalHits,
      waves: plan.waves.map(w => w.name),
      questions: plan.questions.map(q => ({ kind: q.kind, solution: q.solution, expected: q.expected }))
    };
  });

  await page.goto('http://localhost:8123/index.html#/battle/python/py-12-3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  if (await page.locator('.dlg-overlay').count()) {
    await page.locator('#dlg-skip').click({ force: true });
    await page.waitForTimeout(600);
  }

  const rounds = [];
  for (let i = 0; i < planInfo.questions.length; i++) {
    const q = planInfo.questions[i];
    if (!q.solution) break;
    const modalOpen = await page.locator('#modal-root .modal').count();
    if (modalOpen) break;
    await page.evaluate(src => {
      const ta = document.querySelector('#battle-editor .ce-input');
      if (!ta) return;
      ta.value = src;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }, q.solution);
    await page.waitForTimeout(600);
    const btn = page.locator('#attack-btn');
    if (await btn.count()) {
      await btn.click({ force: true });
    }
    await page.waitForTimeout(3600);
    rounds.push(await page.evaluate(([n, kind]) => ({
      q: n, kind,
      modal: document.querySelectorAll('#modal-root .modal').length,
      foot: document.querySelector('#duel-foot-info') ? document.querySelector('#duel-foot-info').textContent.trim() : null,
      terminal: document.querySelector('#terminal-body') ? document.querySelector('#terminal-body').textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : null
    }), [i + 1, q.kind]));
    if (rounds[rounds.length - 1].modal) break;
  }

  await page.waitForTimeout(900);
  const win = await page.evaluate(() => {
    const u = LS.store.current();
    const reveal = document.querySelector('.mana-reveal');
    const modalText = document.querySelector('#modal-root .modal') ? document.querySelector('#modal-root .modal').textContent.replace(/\s+/g, ' ').trim().slice(0, 500) : '';
    return {
      mana: LS.store.materialCount(u, 'mana'),
      bossClaims: u.forgeClaims.boss.slice(),
      revealVisible: !!reveal,
      revealText: reveal ? reveal.textContent.replace(/\s+/g, ' ').trim() : null,
      revealImg: reveal && reveal.querySelector('img') ? reveal.querySelector('img').getAttribute('src') : null,
      modalText,
      done: u.progress.python.done.includes('py-12-3')
    };
  });
  await page.screenshot({ path: 'shot-boss-reward.png', fullPage: false });

  await page.goto('http://localhost:8123/index.html#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const forgeAfter = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.acq-lang-row')];
    const py = rows.find(r => /Python/.test(r.textContent));
    return {
      mana: document.querySelector('.forge-stone-chip') ? document.querySelector('.forge-stone-chip').textContent.replace(/\s+/g, ' ').trim() : null,
      pythonRow: py ? py.textContent.replace(/\s+/g, ' ').trim() : null,
      claimedCount: document.querySelectorAll('.acq-lang-row.is-claimed').length
    };
  });
  await page.screenshot({ path: 'shot-forge-claimed.png', fullPage: false });

  console.log(JSON.stringify({ planInfo, rounds, win, forgeAfter, missing: [...new Set(missing)], errors }, null, 2));
  await browser.close();
})();
