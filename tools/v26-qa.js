/* v2.6.0 本地视觉验收：档案、觉醒说明、剪影、形象库、头像框、背景裁切、好友申请、头像悬浮卡。
   只写入 Playwright 临时浏览器 localStorage，不触碰真实存档。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const { ensureTestAccount, closeAnnouncement } = require('./test-account');
const fs = require('fs');

const BASE = 'http://localhost:8123';
const OUT = 'qa-shots';

function shotPath(name) { return `${OUT}/${name}.png`; }

async function clearDialogue(page) {
  const skip = page.locator('.dlg-overlay #dlg-skip');
  if (await skip.count()) {
    await skip.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(450);
  }
}

async function seedRich(page) {
  await page.evaluate(() => {
    const u = LS.store.current();
    if (!u) throw new Error('no current user');
    u.onboardingDone = true;
    u.primaryLang = 'python';
    u.activeLangs = ['python', 'java', 'javascript'];
    u.gameName = 'QA·星相';
    u.bio = '把每一行咒文都写成可以回头的路。';
    u.xp = Math.max(Number(u.xp) || 0, 9800);
    u.coins = Math.max(Number(u.coins) || 0, 4200);
    u.stats = u.stats || {};
    u.stats.battlesWon = Math.max(u.stats.battlesWon || 0, 42);
    u.stats.bossNoHint = Math.max(u.stats.bossNoHint || 0, 3);
    u.stats.runs = Math.max(u.stats.runs || 0, 210);
    u.stats.perfect = Math.max(u.stats.perfect || 0, 6);
    const nodes = LS.allNodes('python') || [];
    const p = LS.store.progressOf(u, 'python');
    p.done = nodes.map(n => n.id);
    p.wins = nodes.filter(n => n.type === 'battle').map(n => n.id);
    LS.syncTitles(u);
    u.titleEquipped = 'tri_stage3';
    u.avatarId = 'mastery_python';
    u.frame = 'mastery_python';
    LS.store.save();
  });
}

async function inspect(page, tag) {
  const metrics = await page.evaluate(() => {
    const out = {
      w: innerWidth, h: innerHeight,
      docW: document.documentElement.scrollWidth,
      bodyW: document.body.scrollWidth,
      overflowX: document.documentElement.scrollWidth > innerWidth + 1,
      offenders: []
    };
    if (out.overflowX) {
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.right > innerWidth + 1 || r.left < -1) {
          const st = getComputedStyle(el);
          if (st.visibility === 'hidden' || st.display === 'none') return;
          out.offenders.push((el.tagName + '.' + String(el.className || '').split(' ').slice(0, 3).join('.')).slice(0, 90) + ' @' + Math.round(r.left) + '..' + Math.round(r.right) + ' ' + st.position);
        }
      });
      out.offenders = out.offenders.slice(0, 12);
    }
    return out;
  });
  console.log(tag, JSON.stringify(metrics));
  return metrics;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  const errors = [];
  const failed = [];

  async function newPage(viewport, mobile) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: !!mobile, hasTouch: !!mobile });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGE: ' + e.message));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
    return page;
  }

  /* ---------- Desktop ---------- */
  const page = await newPage({ width: 1440, height: 1100 }, false);
  const acct = await ensureTestAccount(page, BASE, { login: 'qa_v26_view', password: 'QaLocal-8123' });
  await seedRich(page);
  await page.goto(BASE + '/index.html#/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await closeAnnouncement(page);
  await inspect(page, 'desktop-profile');

  await page.screenshot({ path: shotPath('v26-10-desktop-profile-top'), clip: { x: 0, y: 0, width: 1440, height: 1100 } });

  const awaken = page.locator('.pf-awaken');
  await awaken.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await awaken.screenshot({ path: shotPath('v26-11-desktop-awaken') });

  /* 数值说明 */
  await page.locator('[data-awaken-info]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.awk-info').screenshot({ path: shotPath('v26-12-desktop-awaken-info') });
  await page.locator('.modal-overlay [data-close]').last().click();
  await page.waitForTimeout(350);

  /* 阶段剪影 */
  await page.locator('[data-awaken-preview]').first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: shotPath('v26-13-desktop-silhouette') });
  await page.locator('[data-sil-stage="0"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: shotPath('v26-14-desktop-silhouette-stage0') });
  await page.locator('.modal-overlay [data-close]').last().click();
  await page.waitForTimeout(350);

  /* 编辑档案：头像 / 头像框 / 背景 */
  await page.locator('#edit-identity').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath('v26-15a-desktop-editor-basic') });
  await page.locator('[data-id-tab="avatar"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath('v26-15-desktop-avatar-gallery') });

  await page.locator('[data-id-tab="frame"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath('v26-16-desktop-frame-gallery') });

  await page.locator('[data-id-tab="banner"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: shotPath('v26-17-desktop-banner') });

  /* 真图裁切 */
  await page.setInputFiles('#bn-file', 'assets/library.webp');
  await page.waitForTimeout(900);
  const cropBox = page.locator('#bn-crop');
  if (await cropBox.count()) {
    await page.locator('[data-id-pane="banner"]').screenshot({ path: shotPath('v26-18-desktop-banner-crop') });
    await page.locator('#bn-apply').click();
    await page.waitForTimeout(700);
    const applied = await page.locator('.bn-applied').innerText().catch(() => '');
    console.log('banner applied:', applied);
    await page.locator('[data-id-pane="banner"]').screenshot({ path: shotPath('v26-19-desktop-banner-applied') });
  } else {
    console.log('banner crop editor missing');
  }

  /* 保存档案，确认长条背景生效与解锁 */
  await page.locator('#save-identity').click();
  await page.waitForTimeout(1200);
  await inspect(page, 'desktop-after-save');
  const stateInfo = await page.evaluate(() => {
    const u = LS.store.current();
    return JSON.stringify({
      avatar: u.avatarId, frame: u.frame, title: u.titleEquipped,
      bannerBytes: u.banner ? Math.round(u.banner.length * 0.75) : 0,
      stage: LS.proficiency(u, 'python').stage,
      titles: (u.titles || []).length,
      avatarCount: LS.AVATARS.filter(a => LS.cosmetics.avatarUnlocked(u, a.id)).length,
      frameCount: LS.FRAMES.filter(f => LS.cosmetics.frameUnlocked(u, f.id)).length
    });
  });
  console.log('state:', stateInfo);
  await page.screenshot({ path: shotPath('v26-20-desktop-profile-custom'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

  /* 好友页 */
  await page.goto(BASE + '/index.html#/friends', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await clearDialogue(page);
  await page.waitForTimeout(500);
  await inspect(page, 'desktop-friends');
  await page.screenshot({ path: shotPath('v26-21-desktop-friends'), fullPage: true });
  const reqToggle = page.locator('#fr-toggle-req');
  if (await reqToggle.count()) {
    await reqToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: shotPath('v26-21b-desktop-requests') });
  }

  /* 头像悬浮卡（桌面） */
  await page.goto(BASE + '/index.html#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await clearDialogue(page);
  const popWrap = page.locator('.side-user .av-pop-wrap');
  if (await popWrap.count()) {
    await popWrap.hover();
    await page.waitForTimeout(600);
    const vis = await page.locator('.side-user .av-pop-card').isVisible().catch(() => false);
    console.log('desktop hover card visible:', vis);
    await page.screenshot({ path: shotPath('v26-22-desktop-avatar-pop') });
  } else {
    console.log('sidebar avatar popover missing');
  }

  /* 熟练度页 */
  await page.goto(BASE + '/index.html#/proficiency', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await inspect(page, 'desktop-proficiency');
  await page.screenshot({ path: shotPath('v26-23-desktop-proficiency') });

  /* ---------- Mobile ---------- */
  const m = await newPage({ width: 390, height: 844 }, true);
  await ensureTestAccount(m, BASE, { login: 'qa_v26_mobile', password: 'QaLocal-8123' });
  await seedRich(m);
  await m.goto(BASE + '/index.html#/profile', { waitUntil: 'networkidle' });
  await m.waitForTimeout(1000);
  await closeAnnouncement(m);
  await inspect(m, 'mobile-profile');
  await m.screenshot({ path: shotPath('v26-30-mobile-profile') });

  const mAwaken = m.locator('.pf-awaken');
  await mAwaken.scrollIntoViewIfNeeded();
  await m.waitForTimeout(400);
  await mAwaken.screenshot({ path: shotPath('v26-31-mobile-awaken') });

  await m.locator('[data-awaken-preview]').first().click();
  await m.waitForTimeout(600);
  await inspect(m, 'mobile-silhouette');
  await m.screenshot({ path: shotPath('v26-32-mobile-silhouette') });
  await m.locator('.modal-overlay [data-close]').last().click();
  await m.waitForTimeout(350);

  await m.locator('#edit-identity').click();
  await m.waitForTimeout(500);
  await m.locator('[data-id-tab="avatar"]').click();
  await m.waitForTimeout(500);
  await m.screenshot({ path: shotPath('v26-33-mobile-avatar-gallery') });

  await m.locator('[data-id-tab="frame"]').click();
  await m.waitForTimeout(400);
  await m.screenshot({ path: shotPath('v26-34-mobile-frame-gallery') });

  const mPopHidden = await m.evaluate(() => {
    const el = document.querySelector('.side-user .av-pop-card') || document.querySelector('.top-av .av-pop-card') || document.querySelector('.av-pop-card');
    if (!el) return 'no-card';
    return getComputedStyle(el).display;
  });
  console.log('mobile hover card display:', mPopHidden);

  await m.goto(BASE + '/index.html#/friends', { waitUntil: 'networkidle' });
  await m.waitForTimeout(900);
  await clearDialogue(m);
  await m.waitForTimeout(400);
  await inspect(m, 'mobile-friends');
  await m.screenshot({ path: shotPath('v26-35-mobile-friends'), fullPage: true });
  const mReq = m.locator('#fr-toggle-req');
  if (await mReq.count()) {
    await mReq.click();
    await m.waitForTimeout(500);
    await m.screenshot({ path: shotPath('v26-35b-mobile-requests') });
  }

  console.log('ACCOUNT', JSON.stringify(acct));
  console.log('ERRORS', JSON.stringify(errors.slice(0, 20)));
  console.log('FAILED_REQUESTS', JSON.stringify(Array.from(new Set(failed)).slice(0, 20)));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
