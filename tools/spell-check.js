'use strict';
/* v2.7.0 咒式约束数据检查：所有精英 / BOSS 题都必须带 must，小怪不带；
   且每道题的参考答案在去掉注释、清空字符串后仍能通过 must 正则。 */
const fs = require('fs');
const path = require('path');
global.window = { LS: {} };
const LS = global.window.LS;
global.LS = LS;
const root = path.join(__dirname, '..');
require(path.join(root, 'js/core/utils.js'));
require(path.join(root, 'js/data/languages.js'));
require(path.join(root, 'js/engine/microrun.js'));
require(path.join(root, 'js/core/battleplan.js'));
for (const f of fs.readdirSync(path.join(root, 'js/data')).filter(f => /\.js$/.test(f)).filter(f => !['languages.js', 'titles.js', 'exams.js'].includes(f)).sort()) {
  require(path.join(root, 'js/data', f));
}

function scan(src, langId) {
  let out = '';
  let i = 0, q = null, line = false, block = false;
  while (i < src.length) {
    const ch = src[i], nx = src[i + 1];
    if (line) { if (ch === '\n') { line = false; out += ch; } i++; continue; }
    if (block) { if (ch === '*' && nx === '/') { block = false; i += 2; } else i++; continue; }
    if (q) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === q) { q = null; out += ch; }
      i++; continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { q = ch; out += ch; i++; continue; }
    if (ch === '/' && nx === '/') { line = true; i += 2; continue; }
    if (ch === '/' && nx === '*') { block = true; i += 2; continue; }
    if (ch === '#' && langId === 'python') { line = true; i++; continue; }
    out += ch; i++;
  }
  return out;
}

const issues = [];
let plans = 0, questions = 0, guarded = 0;
for (const lang of LS.LANGS) {
  (lang.chapters || []).forEach((ch, ci) => {
    (ch.nodes || []).filter(n => n.type === 'battle').forEach(node => {
      const plan = LS.battlePlan({ lang, chapter: ch, node });
      if (!plan) { issues.push(`${lang.id} ch${ci + 1} ${node.id}: 无法编排`); return; }
      plans++;
      plan.questions.forEach(q => {
        questions++;
        const hasMust = !!(q.must && q.must.re);
        if (q.waveType === 'elite' || q.waveType === 'boss') {
          guarded++;
          if (!hasMust) issues.push(`${lang.id} ch${ci + 1} ${node.id} ${q.waveType} ${q.waveHit}/${q.waveHits} (${q.kind}) 缺少咒式要求`);
        }
        if (q.waveType === 'minion' && hasMust) {
          issues.push(`${lang.id} ch${ci + 1} ${node.id} 小怪 ${q.waveHit}/${q.waveHits} (${q.kind}) 不应带咒式要求`);
        }
        if (hasMust && q.solution) {
          let ok = false;
          try { ok = new RegExp(q.must.re, 'm').test(scan(q.solution, lang.id)); } catch (e) { ok = false; }
          if (!ok) issues.push(`${lang.id} ch${ci + 1} ${node.id} ${q.waveType} (${q.kind}) 参考答案不满足咒式：${q.must.text}`);
        }
      });
    });
  });
}
console.log(`battle plans=${plans} questions=${questions} guarded=${guarded} issues=${issues.length}`);
issues.slice(0, 40).forEach(x => console.log('  ! ' + x));
if (issues.length) process.exit(1);
