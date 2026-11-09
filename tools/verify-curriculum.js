/* 课程数据自检：检查节点结构、ID 唯一性，并实际运行每一道战斗题的参考答案。 */
'use strict';

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

const langFiles = fs.readdirSync(path.join(root, 'js/data'))
  .filter(f => /\.js$/.test(f))
  .filter(f => !['languages.js', 'titles.js', 'exams.js'].includes(f))
  .sort();

for (const f of langFiles) {
  require(path.join(root, 'js/data', f));
}

function normalizeOut(s) {
  return String(s == null ? '' : s)
    .replace(/\r\n?/g, '\n')
    .split('\n').map(l => l.replace(/\s+$/g, '')).join('\n')
    .replace(/\n+$/g, '');
}

const errors = [];
let chapters = 0, nodes = 0, battles = 0, tasks = 0;

for (const lang of LS.LANGS) {
  const ids = new Set();
  const nodeIds = new Set();
  (lang.chapters || []).forEach((ch, ci) => {
    chapters++;
    if (!ch.id || !ch.title) errors.push(`${lang.id}: 第 ${ci + 1} 章缺少 id/title`);
    if (ids.has(ch.id)) errors.push(`${lang.id}: 章节 id 重复 ${ch.id}`);
    ids.add(ch.id);
    if (!Array.isArray(ch.nodes) || ch.nodes.length < 2) {
      errors.push(`${lang.id}/${ch.id}: 节点数量过少`);
    }
    (ch.nodes || []).forEach((n, ni) => {
      nodes++;
      if (!n.id || !n.type || !n.title) errors.push(`${lang.id}/${ch.id}: 第 ${ni + 1} 个节点缺少 id/type/title`);
      if (nodeIds.has(n.id)) errors.push(`${lang.id}: 节点 id 重复 ${n.id}`);
      nodeIds.add(n.id);
      if (n.type === 'lesson') {
        const a = n.article || {};
        if (!a.lead || !Array.isArray(a.sections) || a.sections.length < 3) {
          errors.push(`${lang.id}/${n.id}: 课程内容不足`);
        }
        (a.sections || []).forEach((s, si) => {
          if (!s.h || !Array.isArray(s.p) || !s.p.length) {
            errors.push(`${lang.id}/${n.id}: 第 ${si + 1} 节缺少标题或正文`);
          }
          if (s.code && s.code.src && s.code.runnable !== false) {
            const cr = LS.microrun.run(s.code.src, s.code.lang || lang.id);
            if (!cr.ok) {
              errors.push(`${lang.id}/${n.id}: 第 ${si + 1} 节示例无法运行 -> ${cr.error}`);
            }
          }
        });
        if (!Array.isArray(a.terms) || a.terms.length < 4) errors.push(`${lang.id}/${n.id}: 术语少于 4 条`);
        if (!Array.isArray(a.checklist) || a.checklist.length < 3) errors.push(`${lang.id}/${n.id}: 检查清单少于 3 条`);
      }
      if (n.type === 'story' && (!Array.isArray(n.lines) || n.lines.length < 3)) {
        errors.push(`${lang.id}/${n.id}: 剧情对白少于 3 句`);
      }
      if (n.type === 'battle') {
        battles++;
        if (!n.enemy || !n.enemy.name) errors.push(`${lang.id}/${n.id}: 缺少敌人`);
        if (!n.loot || !n.loot.name) errors.push(`${lang.id}/${n.id}: 缺少战利品`);
        if (!Array.isArray(n.tasks) || !n.tasks.length) errors.push(`${lang.id}/${n.id}: 缺少战斗任务`);
        (n.tasks || []).forEach((t, ti) => {
          tasks++;
          const at = `${lang.id}/${n.id} 任务${ti + 1}`;
          if (!t.prompt || !t.expected || !t.solution) errors.push(`${at}: 缺少 prompt/expected/solution`);
          if (!Array.isArray(t.hints) || t.hints.length < 2) errors.push(`${at}: 提示少于 2 条`);
          const res = LS.microrun.run(t.solution || '', lang.id);
          if (!res.ok) {
            errors.push(`${at}: 参考答案无法运行 -> ${res.error}`);
            return;
          }
          if (normalizeOut(res.output) !== normalizeOut(t.expected)) {
            errors.push(`${at}: 输出不符\n  期望: ${JSON.stringify(normalizeOut(t.expected))}\n  实际: ${JSON.stringify(normalizeOut(res.output))}`);
          }
          if (t.must && t.must.re) {
            let ok = true;
            try { ok = new RegExp(t.must.re, 'm').test(t.solution); } catch (e) { ok = false; }
            if (!ok) errors.push(`${at}: 参考答案不满足 must 规则`);
          }
        });
      }
    });
  });
}

/* ---------- 多波次战斗规划校验 ---------- */
let plans = 0, planQuestions = 0, bigBosses = 0;
const waveTypeCount = { minion: 0, elite: 0, boss: 0 };
const kindCount = { authored: 0, variant: 0, example: 0, warmup: 0, review: 0 };

for (const lang of LS.LANGS) {
  let langBigBoss = 0;
  let langBossFlags = 0;
  (lang.chapters || []).forEach(ch => {
    (ch.nodes || []).filter(n => n.type === 'battle').forEach(node => {
      if (node.boss || (node.enemy && node.enemy.boss)) langBossFlags++;
      plans++;
      const plan = LS.battlePlan({ lang, chapter: ch, node });
      const at = `${lang.id}/${node.id}`;
      if (!plan) { errors.push(`${at}: 战斗规划为空`); return; }
      if (!Array.isArray(plan.waves) || plan.waves.length < 3) errors.push(`${at}: 波次少于 3 层`);
      if (plan.waves[0].type !== 'minion') errors.push(`${at}: 第一波不是小怪`);
      if (plan.waves[plan.waves.length - 1].type !== 'boss') errors.push(`${at}: 最后一波不是 BOSS`);
      if (plan.bigBoss !== !!(node.boss || (node.enemy && node.enemy.boss))) errors.push(`${at}: 大 BOSS 标记与节点不一致`);
      if (plan.bigBoss) { bigBosses++; langBigBoss++; }
      if (plan.totalHits < 6 || plan.totalHits > 8) errors.push(`${at}: 题量 ${plan.totalHits} 不在 6~8 之间`);
      if (plan.questions.length !== plan.waves.reduce((s, w) => s + w.hits, 0)) {
        errors.push(`${at}: 题量与波次血量不一致`);
      }
      plan.waves.forEach(w => { waveTypeCount[w.type] = (waveTypeCount[w.type] || 0) + 1; });
      plan.questions.forEach((q, qi) => {
        planQuestions++;
        kindCount[q.kind] = (kindCount[q.kind] || 0) + 1;
        const qat = `${at} 题${qi + 1}(${q.kind}/${q.waveName})`;
        if (!q.prompt || !q.expected || !q.solution) { errors.push(`${qat}: 缺少 prompt/expected/solution`); return; }
        if (!Array.isArray(q.hints) || !q.hints.length) errors.push(`${qat}: 缺少提示`);
        if (q.waveHits < 1 || q.waveHit < 1 || q.waveHit > q.waveHits) errors.push(`${qat}: 波次命中序号异常`);
        if (q.qIndex !== qi) errors.push(`${qat}: qIndex 不连续`);
        const res = LS.microrun.run(q.solution, lang.id);
        if (!res.ok) { errors.push(`${qat}: 参考答案无法运行 -> ${res.error}`); return; }
        if (normalizeOut(res.output) !== normalizeOut(q.expected)) {
          errors.push(`${qat}: 输出不符\n  期望: ${JSON.stringify(normalizeOut(q.expected))}\n  实际: ${JSON.stringify(normalizeOut(res.output))}`);
        }
        if (q.must && q.must.re) {
          let ok = true;
          try { ok = new RegExp(q.must.re, 'm').test(q.solution); } catch (e) { ok = false; }
          if (!ok) errors.push(`${qat}: 参考答案不满足 must 规则`);
        }
      });
    });
  });
  if (langBigBoss !== langBossFlags) errors.push(`${lang.id}: 大 BOSS 数量 ${langBigBoss} 与标记数 ${langBossFlags} 不一致`);
  if (langBigBoss < 1) errors.push(`${lang.id}: 缺少大 BOSS`);
}

console.log(`语言 ${LS.LANGS.length} · 章节 ${chapters} · 节点 ${nodes} · 战斗 ${battles} · 任务 ${tasks}`);
console.log(`战斗规划 ${plans} · 规划题 ${planQuestions} · 大 BOSS ${bigBosses} · 波次 ${JSON.stringify(waveTypeCount)} · 题源 ${JSON.stringify(kindCount)}`);
if (errors.length) {
  console.log(`\n发现 ${errors.length} 个问题：`);
  errors.slice(0, 80).forEach(e => console.log(' - ' + e));
  if (errors.length > 80) console.log(` ... 其余 ${errors.length - 80} 条省略`);
  process.exit(1);
}
console.log('全部课程数据与参考答案检查通过。');
