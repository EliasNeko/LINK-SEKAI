/* 本地验收专用账号。只写入当前 Playwright 浏览器的 localStorage，
   不触碰真实玩家存档，也不提供任何线上可用的游客入口。 */
const PLAYWRIGHT = 'C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright';

function makeLogin() {
  return ('qa' + Math.random().toString(36).slice(2, 8)).slice(0, 10);
}

async function closeAnnouncement(page) {
  const close = page.locator('.announce-modal [data-close], .announce-modal .modal-close').first();
  if (await close.count()) await close.click({ timeout: 3000 }).catch(() => {});
}

async function seedProgress(page) {
  await page.evaluate(() => {
    const u = LS.store.current();
    if (!u) return;
    u.onboardingDone = true;
    u.tutorialDone = true;
    u.tutorialReward = true;
    u.primaryLang = 'python';
    u.activeLangs = Array.from(new Set([].concat(u.activeLangs || [], ['python', 'javascript'])));
    u.char = u.char || {
      skin: '#f6d2b8', hair: '#ff8ecf', hairStyle: 0, outfit: 'ninja',
      outfitColor: '#2fb7a8', accent: '#ffd57e', accessory: 'ribbon', eye: '#4a3a73', langId: 'python'
    };
    u.xp = Math.max(380, Number(u.xp) || 0);
    u.coins = Math.max(980, Number(u.coins) || 0);
    u.inspiration = Math.max(6, Number(u.inspiration) || 0);
    u.titles = Array.from(new Set([].concat(u.titles || [], ['newcomer', 'first_lesson', 'first_win', 'half'])));
    u.titleEquipped = u.titleEquipped || 'half';
    ['python', 'javascript'].forEach((lid, i) => {
      const nodes = (LS.allNodes(lid) || []).slice(0, i === 0 ? 8 : 4);
      const p = LS.store.progressOf(u, lid);
      p.done = Array.from(new Set([].concat(p.done || [], nodes.map(x => x.id))));
      p.wins = Array.from(new Set([].concat(p.wins || [], nodes.filter(x => x.type === 'battle').map(x => x.id))));
    });
    LS.store.save();
  });
}

async function ensureTestAccount(page, origin, opts) {
  opts = opts || {};
  const base = String(origin || 'http://localhost:8123').replace(/\/$/, '');
  const login = opts.login || makeLogin();
  const password = opts.password || 'QaLocal-8123';

  await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await closeAnnouncement(page);

  const state = await page.evaluate(async ({ login, password }) => {
    if (LS.store.current()) return { uid: LS.store.current().uid, reused: true };
    const existing = LS.store.findByLogin(login);
    const u = existing
      ? await LS.store.login(login, password)
      : await LS.store.register({ login, gameName: '测试旅人', password });
    return { uid: u.uid, reused: !!existing };
  }, { login, password });

  await seedProgress(page);
  await page.evaluate(() => { LS.app.go('#/'); });
  await page.waitForTimeout(900);
  await closeAnnouncement(page);
  return { login, password, uid: state.uid, reused: state.reused };
}

module.exports = { ensureTestAccount, closeAnnouncement, seedProgress, PLAYWRIGHT };
