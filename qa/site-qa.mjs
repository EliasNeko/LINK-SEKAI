// CDP smoke QA: official site header/ticker + game boot
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.CDP_PORT || '9222';
const OUT = process.env.OUT_DIR || 'qa/shots/site';
const BASE = 'http://127.0.0.1:8124/index.html';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const j = async (p, o) => (await fetch(`http://127.0.0.1:${PORT}${p}`, o)).json();

async function main() {
  const target = await j('/json/new?about:blank', { method: 'PUT' });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const mid = ++id; pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method, params, sessionId })); });
  const { targetId } = await send('Target.getTargets').then(r => ({ targetId: r.targetInfos.find(t => t.type === 'page').targetId }));
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S('Runtime.enable'); await S('Log.enable'); await S('Network.enable'); await S('Page.enable');
  const logs = [], fails = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push(m.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    if (m.method === 'Runtime.exceptionThrown') logs.push(m.params.exceptionDetails.text);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) fails.push(m.params.response.status + ' ' + m.params.response.url);
  });
  const setView = async (w, h, mobile, dpr) => { await S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile }); await S('Emulation.setTouchEmulationEnabled', { enabled: mobile }); };
  const shot = async (n) => { const { data } = await S('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.writeFileSync(path.join(OUT, n + '.jpg'), Buffer.from(data, 'base64')); console.log('shot', n); };
  const go = async (url) => { await S('Page.navigate', { url }); await S('Page.bringToFront'); await sleep(2600); };

  await setView(1440, 900, false, 1);
  await go(BASE);
  await sleep(3200);
  await shot('d-top');
  const top = await S('Runtime.evaluate', { expression: `(() => { const t = document.querySelector('.hero-title'); const cs = getComputedStyle(t); const r = t.getBoundingClientRect(); return { meta: [...document.querySelectorAll('.hero-meta b')].map(x=>x.textContent), ticker: document.querySelector('.ticker-track')?.innerText.slice(0,80), title: document.title, overflow: document.documentElement.scrollWidth > innerWidth, heroClass: t.className, opacity: cs.opacity, visibility: cs.visibility, transform: cs.transform, rect: [r.x,r.y,r.width,r.height], color: cs.color, bg: cs.backgroundImage.slice(0,60) }; })()`, returnByValue: true });
  console.log('desktop', JSON.stringify(top.result.value));

  await go(BASE.replace('index.html', 'play/index.html'));
  await sleep(2200);
  await shot('d-game');
  const game = await S('Runtime.evaluate', { expression: `(() => ({ title: document.title, hasView: !!document.getElementById('view'), hash: location.hash, body: (document.body.innerText||'').slice(0,120), overflow: document.documentElement.scrollWidth > innerWidth }))()`, returnByValue: true });
  console.log('game', JSON.stringify(game.result.value));

  await setView(390, 844, true, 2);
  await go(BASE);
  await shot('m-top');
  const m = await S('Runtime.evaluate', { expression: `(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, heroH: document.querySelector('.hero')?.clientHeight }))()`, returnByValue: true });
  console.log('mobile', JSON.stringify(m.result.value));

  console.log('CONSOLE', JSON.stringify(logs.slice(0, 20)));
  console.log('FAILS', JSON.stringify(fails.slice(0, 20)));
  await send('Target.closeTarget', { targetId }); ws.close(); process.exit(0);
}
main().catch(e => { console.error('ERR', e); process.exit(1); });
