const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text(), JSON.stringify(m.location())); });
  page.on('requestfailed', r => console.log('FAILED', r.url(), r.failure() && r.failure().errorText));
  page.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
  await page.goto('http://localhost:8123/index.html?demo=1#/forge', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await browser.close();
})();
