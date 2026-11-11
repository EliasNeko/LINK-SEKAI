// CDP QA for the new PV section (desktop + mobile)
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.CDP_PORT || '9222';
const OUT = process.env.OUT_DIR || 'qa/shots/pv';
const BASE = 'http://127.0.0.1:8124/index.html';
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const j = async (p, o) => (await fetch(`http://127.0.0.1:${PORT}${p}`, o)).json();

async function main() {
  const version = await j('/json/version');
  const target = await j('/json/new?about:blank', { method: 'PUT' });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    }
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });

  const { targetId } = await send('Target.getTargets').then(r => ({ targetId: r.targetInfos.find(t => t.type === 'page').targetId }));
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);

  await S('Runtime.enable');
  await S('Log.enable');
  await S('Network.enable');
  await S('Page.enable');

  const logs = [], fails = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled') logs.push(`[${msg.params.type}] ` + msg.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    if (msg.method === 'Runtime.exceptionThrown') logs.push('[exception] ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') logs.push('[log-error] ' + msg.params.entry.text);
    if (msg.method === 'Network.loadingFailed') fails.push(msg.params.errorText + ' ' + (msg.params.type || ''));
    if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) fails.push(msg.params.response.status + ' ' + msg.params.response.url);
  });

  const setView = async (width, height, mobile, dpr) => {
    await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
    await S('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  };
  const shot = async (name) => {
    const { data } = await S('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    const file = path.join(OUT, name + '.jpg');
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('shot', file);
  };
  const evaluate = async (expr) => {
    const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) console.log('EVAL-ERR', expr.slice(0, 60), r.exceptionDetails.text, r.exceptionDetails.exception?.description);
    return r.result?.value;
  };
  const scrollToCg = () => evaluate(`(() => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.getElementById('cgFrame'); const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top - 90); return Math.round(window.scrollY); })()`);
  const goto = async () => { await S('Page.navigate', { url: BASE }); await sleep(2600); };

  // ---------- desktop ----------
  await setView(1440, 900, false, 1);
  await goto();
  console.log('scroll', await scrollToCg());
  await sleep(800);
  await shot('d-cover');
  await sleep(900);
  await shot('d-cover-stable');

  const before = await evaluate(`(() => { const v = document.getElementById('cgVideo'); return {duration: v.duration, w: v.videoWidth, h: v.videoHeight, paused: v.paused, ready: v.readyState}; })()`);
  console.log('video meta', JSON.stringify(before));

  await evaluate(`document.getElementById('cgPlay').click()`);
  await sleep(2600);
  await shot('d-playing');

  await evaluate(`document.querySelector('[data-cg-at="11.1"]').click()`);
  await sleep(2600);
  await shot('d-battle');

  await evaluate(`document.querySelector('[data-cg-at="39.3"]').click()`);
  await sleep(2600);
  await shot('d-final');

  const state = await evaluate(`(() => ({
    hudHidden: document.getElementById('cgHud').hidden,
    now: document.getElementById('cgNow').textContent,
    time: document.getElementById('cgTime').textContent,
    paused: document.getElementById('cgVideo').paused,
    chaptersOn: [...document.querySelectorAll('[data-cg-at]')].map(b => b.classList.contains('is-on')),
    marks: [...document.querySelectorAll('[data-cg-mark]')].map(m => m.style.left),
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    coverHidden: document.getElementById('cgCover').classList.contains('is-hidden')
  }))()`);
  console.log('desktop state', JSON.stringify(state));

  const seek = await evaluate(`(() => { const s = document.getElementById('cgSeek'); s.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true})); return document.getElementById('cgTime').textContent; })()`);
  console.log('seek-right', seek);

  // pause + mute
  await evaluate(`document.getElementById('cgToggle').click()`);
  console.log('after-toggle paused', await evaluate(`document.getElementById('cgVideo').paused`));
  await evaluate(`document.getElementById('cgToggle').click()`);
  await evaluate(`document.getElementById('cgSound').click()`);
  console.log('muted', await evaluate(`document.getElementById('cgVideo').muted`));

  // ---------- mobile ----------
  await setView(390, 844, true, 2);
  await goto();
  console.log('scroll', await scrollToCg());
  await sleep(1900);
  await shot('m-cover');

  await evaluate(`document.getElementById('cgPlay').click()`);
  await sleep(2400);
  await shot('m-playing');

  const mstate = await evaluate(`(() => ({
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    frameW: document.getElementById('cgFrame').clientWidth,
    frameH: document.getElementById('cgFrame').clientHeight,
    hudH: document.getElementById('cgHud').clientHeight,
    notesCols: getComputedStyle(document.querySelector('.cg-notes')).gridTemplateColumns,
    metaShown: getComputedStyle(document.querySelector('.cg-meta')).display
  }))()`);
  console.log('mobile state', JSON.stringify(mstate));

  console.log('CONSOLE:', JSON.stringify(logs.slice(0, 40)));
  console.log('FAILS:', JSON.stringify(fails.slice(0, 40)));

  await send('Target.closeTarget', { targetId });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e); process.exit(1); });
