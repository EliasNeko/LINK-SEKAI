/* 公告 GitHub 区块验收：版本、仓库链接、作者介绍、桌面与手机排版。 */
const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const ORIGIN = process.argv[2] || 'http://localhost:8123';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();
  let errors = 0;
  page.on('console', (m) => { if (m.type() === 'error') errors++; });
  page.on('pageerror', (e) => { errors++; console.log('PAGEERROR', e.message); });

  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const modal = page.locator('.announce-modal');
  console.log('announcement visible:', await modal.count() ? 'ok' : 'MISSING');
  const text = await modal.innerText();
  console.log('version v2.4.2:', /v2\.4\.2/.test(text) ? 'ok' : 'MISSING');
  console.log('open source:', /完全开源/.test(text) ? 'ok' : 'MISSING');
  console.log('gitHub section:', /开源地址/.test(text) && /EliasNeko/.test(text) ? 'ok' : 'MISSING');
  console.log('author intro:', /软件技术专业/.test(text) && /个人语言学习/.test(text) ? 'ok' : 'MISSING');
  console.log('credit note:', /Qoder/.test(text) && /DeepSeek V4\.1 Flash/.test(text) && /均由作者本人完成/.test(text) ? 'ok' : 'MISSING');

  const repo = await page.locator('.announce-modal .gh-card').getAttribute('href');
  const target = await page.locator('.announce-modal .gh-card').getAttribute('target');
  const rel = await page.locator('.announce-modal .gh-card').getAttribute('rel');
  console.log('repo link:', repo === 'https://github.com/EliasNeko/LINK-SEKAI' ? 'ok' : repo);
  console.log('link target/rel:', target === '_blank' && /noopener/.test(rel) ? 'ok' : target + ' / ' + rel);
  const links = await page.locator('.announce-modal .gh-links a').count();
  console.log('footer links:', links === 2 ? 'ok' : links);

  await page.locator('.announce-scroll').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await page.waitForTimeout(400);
  await page.locator('.announce-modal').screenshot({ path: 'shot-announce-github-desktop.png' });

  const box = await page.locator('.announce-modal').evaluate((el) => ({
    client: el.clientWidth,
    scroll: el.scrollWidth,
    height: el.getBoundingClientRect().height
  }));
  console.log('desktop overflow:', box.scroll <= box.client + 1 ? 'none' : 'HORIZONTAL ' + box.scroll + '/' + box.client);
  console.log('desktop modal height:', Math.round(box.height));

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(1200);
  await mobile.locator('.announce-scroll').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await mobile.waitForTimeout(400);
  await mobile.locator('.announce-modal').screenshot({ path: 'shot-announce-github-mobile.png' });

  const mbox = await mobile.locator('.announce-modal').evaluate((el) => ({
    client: el.clientWidth,
    scroll: el.scrollWidth,
    height: el.getBoundingClientRect().height,
    bottom: el.getBoundingClientRect().bottom
  }));
  console.log('mobile overflow:', mbox.scroll <= mbox.client + 1 ? 'none' : 'HORIZONTAL ' + mbox.scroll + '/' + mbox.client);
  console.log('mobile modal fits:', mbox.bottom <= 844 + 1 ? 'ok' : 'OVERFLOW ' + Math.round(mbox.bottom));
  const mtext = await mobile.locator('.announce-modal').innerText();
  console.log('mobile github:', /github\.com\/EliasNeko\/LINK-SEKAI/.test(mtext) ? 'ok' : 'MISSING');

  await browser.close();
  console.log(errors === 0 ? 'announce-github-check passed' : 'console errors: ' + errors);
})();
