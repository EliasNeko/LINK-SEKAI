/* 战斗规划：把每个试炼编排成 小怪 → 精英 → 阶段 BOSS 的多波次战斗。
   题目来自：本章原题、原题数值变体、天书可运行示例、开局暗号、前章复习。
   纯数据模块，不依赖 DOM，便于 Node 校验。 */
(function (LS) {
  'use strict';

  const cache = LS.battlePlanCache = LS.battlePlanCache || {};

  const MINION_NAMES = {
    slime: ['错字史莱姆', '缩进史莱姆', '断句史莱姆', '括号史莱姆'],
    wolf: ['回声狼崽', '巡夜狼', '缓存狼', '未声明狼'],
    wraith: ['异常幽魂', '空指针幽魂', '越界幽魂', '断链幽魂'],
    golem: ['编译石偶', '栈帧石像', '断言石像', '死锁石偶'],
    construct: ['巡检机偶', '缓存守卫', '索引机偶', '日志机偶'],
    drone: ['浮游校验机', '日志蜂', '探针蜂', '信标蜂'],
    glitch: ['乱码残影', '空值幻影', '错位残影', '噪点幻影'],
    dragon: ['幼年语法龙', '嵌套幼龙', '缓存幼龙', '递归幼龙']
  };
  const ELITE_NAMES = {
    slime: ['异常聚合体', '报错母体'],
    wolf: ['回廊头狼', '追踪者'],
    wraith: ['未捕获异常·精英', '断链行者'],
    golem: ['编译重装像', '栈墙守卫'],
    construct: ['主控校验机', '缓存执政官'],
    drone: ['蜂群指挥机', '深空探针'],
    glitch: ['语法裂缝', '乱码执政官'],
    dragon: ['语法亚龙', '缓存飞龙']
  };
  const MINION_TAUNTS = [
    '一段没写完的咒文，也敢闯进来？',
    '先过我这一关。别急着见首领。',
    '你的输出，最好比你的脚步更稳。',
    '错误、警告、未定义……都归我管。'
  ];
  const ELITE_TAUNTS = [
    '小怪只是开胃菜。现在，让我看看你的结构。',
    '我不怕你写对一行，我怕你写对一整段。',
    '到这里，运气已经不够用了。',
    '把逻辑拿出来。我要检查每一层缩进。'
  ];

  function commentStarter(langId) {
    if (langId === 'python') return '# 在这里写出你的代码\n';
    if (langId === 'go') return '// 在这里写出你的代码\n';
    return '// 在这里写出你的代码\n';
  }

  function norm(s) { return LS.normalizeOut ? LS.normalizeOut(s) : String(s == null ? '' : s); }

  /* 把字符串与注释替换成等长占位，避免把文字里的数字当成可替换变量。 */
  function maskCode(code) {
    let out = '';
    let i = 0;
    while (i < code.length) {
      const c = code[i];
      if (c === '"' || c === "'" || c === '`') {
        const q = c; out += q; i++;
        while (i < code.length) {
          if (code[i] === '\\') { out += 'xx'; i += 2; continue; }
          out += code[i];
          if (code[i] === q) { i++; break; }
          i++;
        }
      } else if (c === '#' || (c === '/' && code[i + 1] === '/')) {
        let j = code.indexOf('\n', i); if (j < 0) j = code.length;
        out += '#'.repeat(j - i); i = j;
      } else if (c === '/' && code[i + 1] === '*') {
        let j = code.indexOf('*/', i + 2); j = j < 0 ? code.length : j + 2;
        out += ' '.repeat(j - i); i = j;
      } else { out += c; i++; }
    }
    return out;
  }

  function numericPositions(code) {
    const masked = maskCode(code);
    const out = [];
    const re = /(?<![\w.])(\d+)(?![\w.])/g;
    let m;
    while ((m = re.exec(masked))) {
      out.push({ index: m.index, len: m[0].length, value: parseInt(m[1], 10) });
      if (out.length > 18) break;
    }
    return out;
  }

  function replaceAt(code, edits) {
    const sorted = edits.slice().sort((a, b) => b.index - a.index);
    let out = code;
    for (const e of sorted) out = out.slice(0, e.index) + e.text + out.slice(e.index + e.len);
    return out;
  }

  function runnableSource(src) {
    return !/\binput\s*\(|\bscanf\s*\(|\bcin\s*>>|\bScanner\b|\bMath\.random\b|\brandom\.|\brand\s*\(|\bDate\b|\btime\s*\(/i.test(src);
  }

  function cloneTask(t) {
    return Object.assign({}, t, { hints: (t.hints || []).slice() });
  }

  function normalizeExpected(t) {
    return norm(t.expected);
  }

  /* 把原题的数值改掉，重新运行得到新答案。答案仍由教学终端实际执行产生。 */
  function variantTasks(task, langId, limit, seen) {
    const out = [];
    const solution = String(task.solution || '');
    if (!solution || !runnableSource(solution)) return out;
    const base = LS.microrun.run(solution, langId);
    if (!base.ok) return out;
    const baseOut = norm(base.output);
    const positions = numericPositions(solution);
    if (!positions.length) return out;

    const candidates = [];
    const deltas = [1, 2, 3, 5, 7, -1, -2, -3];
    for (const p of positions) {
      for (const d of deltas) {
        if (p.value + d < -99) continue;
        candidates.push([{ index: p.index, len: p.len, text: String(p.value + d) }]);
      }
    }
    // 同时改两个数值，能多制造一些稳定变体；数量有限，避免规划时卡顿。
    for (let i = 0; i < positions.length && candidates.length < limit * 8; i++) {
      for (let j = i + 1; j < positions.length && candidates.length < limit * 8; j++) {
        for (const pair of [[1, 1], [2, 1], [1, 3], [3, 2], [-1, 2]]) {
          const a = positions[i], b = positions[j];
          if (a.value + pair[0] < -99 || b.value + pair[1] < -99) continue;
          candidates.push([
            { index: a.index, len: a.len, text: String(a.value + pair[0]) },
            { index: b.index, len: b.len, text: String(b.value + pair[1]) }
          ]);
        }
      }
    }

    const max = Math.min(limit || 8, candidates.length);
    for (const edits of candidates) {
      if (out.length >= max) break;
      const code = replaceAt(solution, edits);
      if (!runnableSource(code)) continue;
      const res = LS.microrun.run(code, langId);
      if (!res.ok || !res.output || !res.output.trim()) continue;
      const expected = norm(res.output);
      if (!expected || expected === baseOut || expected.length > 260) continue;
      let mustOk = true;
      if (task.must && task.must.re) {
        try { mustOk = new RegExp(task.must.re, 'm').test(code); } catch (e) { mustOk = false; }
      }
      if (!mustOk) continue;
      const key = langId + '|' + norm(code) + '|' + expected;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        kind: 'variant',
        prompt: '变式试炼：用同一套写法，让终端输出下面这组结果。数值已经改变，别照抄上一题的答案。',
        requirement: '预期输出：\n' + expected,
        expected,
        starter: commentStarter(langId),
        hints: [
          '这题的结构和本章原题一样，只是数字变了。先算清新结果，再写代码。',
          '写完先在脑子里走一遍：每一个 print / 输出语句会打印什么？'
        ],
        solution: code,
        must: task.must || null
      });
    }
    return out;
  }

  /* 天书里可运行的示例，直接变成“重现示例输出”的实战题。 */
  function exampleTasks(chapter, langId, seen, limit) {
    const out = [];
    const lesson = (chapter.nodes || []).find(n => n.type === 'lesson');
    if (!lesson || !lesson.article || !Array.isArray(lesson.article.sections)) return out;
    lesson.article.sections.forEach((sec, si) => {
      if (out.length >= (limit || 6)) return;
      if (!sec.code || !sec.code.src || sec.code.runnable === false) return;
      const src = sec.code.src;
      if (!runnableSource(src)) return;
      const res = LS.microrun.run(src, langId);
      if (!res.ok || !res.output || !res.output.trim()) return;
      const expected = norm(res.output);
      if (!expected || expected.length > 260) return;
      const key = langId + '|' + norm(src) + '|' + expected;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        kind: 'example',
        prompt: '天书重现：让终端输出下面这组结果。写法就藏在《' + chapter.title + '》第 ' + (si + 1) + ' 节「' + sec.h + '」里。',
        requirement: '预期输出：\n' + expected,
        expected,
        starter: commentStarter(langId),
        hints: [
          '回到天书《' + chapter.title + '》第 ' + (si + 1) + ' 节「' + sec.h + '」看一眼示例。',
          '输出必须逐字一致，注意空格、换行和中文标点。'
        ],
        solution: src
      });
    });
    return out;
  }

  /* 每章固定生成一个“开局暗号”，保证任何章节都有足够的小怪题。 */
  function warmupTasks(chapter, langId, node, seen) {
    const out = [];
    const lines = [
      chapter.title,
      '目标：' + node.enemy.name
    ];
    const builders = {
      python: s => 'print("' + s + '")',
      javascript: s => 'console.log("' + s + '");',
      java: s => 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("' + s + '");\n    }\n}',
      c: s => '#include <stdio.h>\n\nint main() {\n    printf("' + s + '\\n");\n    return 0;\n}',
      cpp: s => '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "' + s + '" << endl;\n    return 0;\n}',
      go: s => 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("' + s + '")\n}'
    };
    const build = builders[langId];
    if (!build) return out;
    for (const line of lines) {
      const code = build(line);
      const res = LS.microrun.run(code, langId);
      if (!res.ok || norm(res.output) !== line) continue;
      const key = langId + '|' + norm(code) + '|' + line;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        kind: 'warmup',
        prompt: '开局暗号：让终端输出这句话。小怪只考最基本的输出格式，别在它身上浪费生命值。',
        requirement: '预期输出：\n' + line,
        expected: line,
        starter: commentStarter(langId),
        hints: [
          '注意输出语句的拼写、引号和结尾符号。',
          '只要输出这一行文字，不需要额外的计算。'
        ],
        solution: code
      });
    }
    return out;
  }

  function reviewTasks(lang, chapterIndex, seen, needed) {
    const out = [];
    if (needed <= 0) return out;
    for (let ci = chapterIndex - 1; ci >= 0 && out.length < needed; ci--) {
      const ch = lang.chapters[ci];
      const battle = (ch.nodes || []).find(n => n.type === 'battle');
      if (!battle || !Array.isArray(battle.tasks)) continue;
      for (const task of battle.tasks) {
        if (out.length >= needed) break;
        const expected = normalizeExpected(task);
        const key = lang.id + '|' + norm(task.solution) + '|' + expected;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          kind: 'review',
          reviewChapter: ch.title,
          prompt: '复习 · ' + ch.title + '：' + task.prompt,
          requirement: task.requirement || ('预期输出：\n' + expected),
          expected: task.expected,
          starter: task.starter || commentStarter(lang.id),
          hints: (task.hints || []).slice(),
          solution: task.solution,
          must: task.must || null
        });
      }
      for (const task of battle.tasks) {
        if (out.length >= needed) break;
        const vars = variantTasks(task, lang.id, 3, seen);
        for (const v of vars) {
          if (out.length >= needed) break;
          v.kind = 'review';
          v.reviewChapter = ch.title;
          v.prompt = '复习变式 · ' + ch.title + '：' + v.prompt;
          out.push(v);
        }
      }
    }
    return out;
  }

  function waveSpec(chapterIndex, bigBoss, chapter) {
    // 敌人数量跟着本章天书的知识量走：章节越长，拦路的小怪越多。
    const lesson = (chapter.nodes || []).find(n => n.type === 'lesson');
    const sections = lesson && lesson.article && Array.isArray(lesson.article.sections)
      ? lesson.article.sections.length : 5;
    const minions = sections >= 6 ? 3 : 2;
    const elites = 1;
    let bossHits = bigBoss ? 3 : chapterIndex >= 5 ? 3 : 2;
    return { minions, elites, eliteHits: 2, bossHits };
  }

  function specTotal(spec) {
    return spec.minions + spec.elites * spec.eliteHits + spec.bossHits;
  }

  function trimSpec(spec, requiredBoss, available) {
    while (specTotal(spec) > available) {
      if (spec.minions > 1) { spec.minions--; continue; }
      if (spec.eliteHits > 1) { spec.eliteHits--; continue; }
      if (spec.bossHits > Math.max(1, requiredBoss) && spec.bossHits > 1) { spec.bossHits--; continue; }
      break;
    }
    return spec;
  }

  function minionName(kind, i) {
    const pool = MINION_NAMES[kind] || MINION_NAMES.slime;
    return pool[i % pool.length];
  }
  function eliteName(kind, i) {
    const pool = ELITE_NAMES[kind] || ELITE_NAMES.slime;
    return pool[i % pool.length];
  }

  function buildPlan(hit) {
    const lang = hit.lang;
    const chapter = hit.chapter;
    const node = hit.node;
    const langId = lang.id;
    const chapterIndex = Math.max(0, lang.chapters.indexOf(chapter));
    const bigBoss = !!(node.boss || (node.enemy && node.enemy.boss));
    const seen = new Set();
    const authored = (node.tasks || []).map(t => Object.assign(cloneTask(t), { kind: 'authored' }));

    // 已通关的旧关卡允许重复挑战，但题目仍按同一套规划生成。
    const variantGroups = (node.tasks || []).map(t => variantTasks(t, langId, 4, seen));
    const examples = exampleTasks(chapter, langId, seen, 6);
    const warmups = warmupTasks(chapter, langId, node, seen);
    const poolCount = {
      variants: variantGroups.reduce((s, g) => s + g.length, 0),
      examples: examples.length,
      warmups: warmups.length
    };

    // 交错编排：先开局暗号，再天书示例，然后按原题轮换变式，避免整场只问同一道题。
    let filler = [];
    const take = arr => { const v = arr.shift(); if (v) filler.push(v); };
    take(warmups);
    take(examples);
    let turn = 0;
    while (variantGroups.some(g => g.length) || examples.length) {
      if (turn % 3 === 1 && examples.length) {
        take(examples);
      } else {
        const g = variantGroups.find(x => x.length);
        if (g) filler.push(g.shift());
        else take(examples);
      }
      turn++;
    }

    const spec = waveSpec(chapterIndex, bigBoss, chapter);
    const requiredBoss = Math.max(1, Math.min(3, authored.length));
    const hasMust = q => !!(q && q.must && q.must.re);
    // 带「咒式要求」的题留给精英与 BOSS；小怪只用暗号、示例这类轻题。
    const strong = [];
    filler = filler.filter(q => {
      if (hasMust(q)) { strong.push(q); return false; }
      return true;
    });

    let available = filler.length + strong.length + authored.length;
    // 池子不够时先从前面章节借复习题，再决定要不要压缩波次，避免明明能借到题却只剩一只小怪。
    if (specTotal(spec) > available) {
      const need = specTotal(spec) - available;
      reviewTasks(lang, chapterIndex, seen, need + 2).forEach(q => {
        if (hasMust(q)) strong.push(q); else filler.push(q);
      });
      available = filler.length + strong.length + authored.length;
    }
    trimSpec(spec, requiredBoss, available);

    // 最后一层保险：允许极少数早期章节减少到 1 小怪 + 1 精英 + BOSS。
    while (specTotal(spec) > available && (spec.minions > 1 || spec.eliteHits > 1)) {
      if (spec.minions > 1) spec.minions--;
      else if (spec.eliteHits > 1) spec.eliteHits--;
    }

    const kinds = node.enemy.kind || 'slime';
    const waves = [];
    for (let i = 0; i < spec.minions; i++) {
      waves.push({
        type: 'minion', label: '小怪', name: minionName(kinds, i), kind: kinds,
        hits: 1, damage: 7, scale: .82, boss: false, bigBoss: false,
        taunt: MINION_TAUNTS[i % MINION_TAUNTS.length],
        lore: '被未处理的错误吸引来的小型影兽。它挡不住真正的逻辑，只会消耗你的耐心。'
      });
    }
    for (let i = 0; i < spec.elites; i++) {
      waves.push({
        type: 'elite', label: '精英怪', name: eliteName(kinds, i), kind: kinds,
        hits: spec.eliteHits, damage: 12, scale: 1.02, boss: false, bigBoss: false,
        taunt: ELITE_TAUNTS[i % ELITE_TAUNTS.length],
        lore: '由多次失败尝试堆叠而成的守关者。它需要连续、稳定的正确输出才能击破。'
      });
    }
    waves.push({
      type: 'boss', label: bigBoss ? '大 BOSS' : '阶段 BOSS', name: node.enemy.name, kind: kinds,
      hits: spec.bossHits, damage: bigBoss ? 20 : 16, scale: bigBoss ? 1.2 : 1.1,
      boss: true, bigBoss,
      taunt: node.enemy.taunt || '让终端替你说话。',
      lore: node.enemy.lore || ''
    });

    // 分题：小怪只出暗号/示例这类轻题；精英与 BOSS 必须出带「咒式要求」的题，逼玩家用本章语法。
    const reservedBoss = authored.slice(0, Math.max(1, Math.min(authored.length, waves[waves.length - 1].hits)));
    const flat = [];
    const fillerPool = filler.slice();
    const strongPool = strong.slice();
    const takeFrom = (pool, count) => pool.splice(0, Math.max(0, count));
    waves.forEach((w, wi) => {
      const count = w.hits;
      let questions = [];
      if (w.type === 'boss') {
        const pre = Math.max(0, count - reservedBoss.length);
        questions = takeFrom(strongPool, pre);
        if (questions.length < pre) questions = questions.concat(takeFrom(fillerPool, pre - questions.length));
        questions = questions.concat(reservedBoss.slice(0, count));
      } else if (w.type === 'elite') {
        questions = takeFrom(strongPool, count);
        if (questions.length < count) questions = questions.concat(takeFrom(fillerPool, count - questions.length));
      } else {
        questions = takeFrom(fillerPool, count);
        if (questions.length < count) {
          // 小怪宁可重复暗号，也不塞「咒式要求」题，保持前期轻量。
          const reuse = filler.length ? filler : strong;
          while (questions.length < count && reuse.length) {
            questions.push(reuse[questions.length % reuse.length]);
          }
        }
      }
      while (questions.length < count) {
        // 极端情况下复用一道题，保证波次完整；正常数据不会走到这里。
        questions.push(authored[0]);
      }
      questions.forEach((q, qi) => {
        flat.push(Object.assign({}, q, {
          waveIndex: wi,
          waveType: w.type,
          waveLabel: w.label,
          waveName: w.name,
          waveHit: qi + 1,
          waveHits: count,
          qIndex: flat.length
        }));
      });
    });

    const sectionCount = (() => {
      const lesson = (chapter.nodes || []).find(n => n.type === 'lesson');
      return lesson && lesson.article && Array.isArray(lesson.article.sections) ? lesson.article.sections.length : 0;
    })();

    return {
      langId, chapterId: chapter.id, chapterIndex, nodeId: node.id,
      bigBoss, sectionCount,
      waves, questions: flat,
      totalHits: flat.length,
      pool: { authored: authored.length, variants: poolCount.variants, examples: poolCount.examples, warmups: poolCount.warmups, filler: filler.length }
    };
  }

  LS.battlePlan = function (hit) {
    if (!hit || !hit.node || hit.node.type !== 'battle') return null;
    const key = hit.lang.id + ':' + hit.node.id;
    if (!cache[key]) cache[key] = buildPlan(hit);
    return cache[key];
  };

  LS.battlePlan.clear = function () { Object.keys(cache).forEach(k => delete cache[k]); };
})(window.LS);
