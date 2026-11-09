/* 一次性维护脚本：
 * 扫描课程数据中的 code 示例，如果教学终端（MicroRun）不支持该子集，
 * 就自动补上 runnable: false，让页面显示“概念示例”而不是一个点了会报错的运行按钮。
 * 只改能通过 MicroRun 检验之外的高级示例，不碰已经可运行的示例。
 */
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

const fileLang = {
  'python': 'python', 'python-ext': 'python',
  'c': 'c', 'c-ext': 'c',
  'cpp': 'cpp', 'cpp-ext': 'cpp',
  'java': 'java', 'java-ext': 'java',
  'javascript': 'javascript', 'javascript-ext': 'javascript',
  'go': 'go', 'go-ext': 'go'
};

function findCodeObjects(text) {
  const found = [];
  const re = /(^|[^\w$])code\s*:\s*\{/g;
  let m;
  while ((m = re.exec(text))) {
    const open = text.indexOf('{', m.index);
    let depth = 0, i = open, inS = false, q = '', esc = false;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (inS) {
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === q) inS = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inS = true; q = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    if (depth === 0) found.push({ body: text.slice(open, i + 1), end: i + 1 });
    re.lastIndex = i + 1;
  }
  return found;
}

let marked = 0;
const files = fs.readdirSync(path.join(root, 'js/data')).filter(f => /\.js$/.test(f) && fileLang[f.replace(/\.js$/, '')]);

for (const file of files) {
  const lang = fileLang[file.replace(/\.js$/, '')];
  const abs = path.join(root, 'js/data', file);
  let text = fs.readFileSync(abs, 'utf8');
  const objs = findCodeObjects(text);
  let changed = false;

  // 从后往前替换，避免偏移变化
  for (let k = objs.length - 1; k >= 0; k--) {
    const o = objs[k];
    let obj;
    try { obj = new Function('return (' + o.body + ');')(); } catch (e) { continue; }
    if (!obj || typeof obj.src !== 'string' || obj.runnable === false) continue;
    const r = LS.microrun.run(obj.src, obj.lang || lang);
    if (r.ok) continue;
    const insertAt = o.body.lastIndexOf('}');
    const body = o.body.slice(0, insertAt).replace(/\s*$/, '') + ', runnable: false\n' + o.body.slice(insertAt);
    const start = o.end - o.body.length;
    text = text.slice(0, start) + body + text.slice(o.end);
    marked++;
    changed = true;
    console.log(`[概念示例] ${file} -> ${r.error}`);
  }

  if (changed) fs.writeFileSync(abs, text, 'utf8');
}

console.log(`\n已标记 ${marked} 个概念示例。`);
