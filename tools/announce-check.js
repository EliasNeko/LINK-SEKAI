const { chromium } = require('C:/Users/hyyzj/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const errors = [];
  for (const [name, vp] of [['desktop', {width:1440,height:900}], ['mobile', {width:390,height:844}]]) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
    page.on('console', m => { if (m.type() === 'error') errors.push(name + ': ' + m.text()); });
    page.on('pageerror', e => errors.push(name + ' pageerror: ' + e.message));
    await page.goto('http://localhost:8123/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const info = await page.evaluate(() => {
      const m = document.querySelector('.announce-modal');
      const s = m && m.querySelector('.announce-scroll');
      return {
        exists: !!m,
        version: m && m.querySelector('.announce-verline b')?.textContent,
        sections: [...document.querySelectorAll('.announce-sec h3')].map(x => x.textContent),
        scrollable: s ? s.scrollHeight > s.clientHeight + 2 : null,
        modalH: m ? m.getBoundingClientRect().height : 0,
        viewportH: innerHeight,
        closeVisible: !!document.querySelector('.announce-ok'),
        hasCloudNote: document.body.innerText.includes('云端')
      };
    });
    console.log(name, JSON.stringify(info));
    await page.screenshot({ path: `shot-announce-${name}.png`, fullPage: false });
    await page.click('.announce-ok');
    await page.waitForTimeout(400);
    console.log(name, 'closed:', await page.evaluate(() => !document.querySelector('.announce-modal')));
    if (name === 'mobile') {
      await page.evaluate(() => { document.documentElement.scrollTop = 99999; window.scrollTo(0, 99999); });
      await page.waitForTimeout(200);
      await page.screenshot({ path: 'shot-announce-mobile-bottom.png', fullPage: false });
    }
    await page.close();
  }
  console.log('errors', JSON.stringify(errors, null, 2));
  await browser.close();
})();
