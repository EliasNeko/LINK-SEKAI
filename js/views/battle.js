/* 代码试炼：多波次战斗、武器攻击、沉默与反击 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  const introPlayed = {};
  let S = null;

  const BATTLE_VERSION = 2;
  const KIND_LABEL = {
    authored: '本章原题',
    variant: '数值变式',
    example: '天书重现',
    warmup: '开局暗号',
    review: '复习题'
  };
  const SLOT_LABEL = { weapon: '武器', apparel: '服饰', item: '道具', armor: '服饰', relic: '道具', charm: '道具' };
  const WEAPON_NAME = { staff: '法杖', sword: '长剑', wrench: '机巧扳手', bow: '长弓', kunai: '苦无' };
  const WEAPON_SKILL = {
    staff: ['星辉咏唱', 'STELLAR CHANT'],
    sword: ['月牙斩', 'LUNAR CLEAVE'],
    wrench: ['过载重击', 'OVERLOAD SMASH'],
    bow: ['流星贯矢', 'METEOR ARROW'],
    kunai: ['影缝', 'SHADOW STITCH']
  };
  const MC_WORD = { staff: '詠', sword: '斬', wrench: '撃', bow: '貫', kunai: '影' };
  const ENEMY_SKILL = {
    slime: ['黏液拍击', 'SLIME SLAM'],
    wolf: ['裂爪突袭', 'RENDING CLAW'],
    wraith: ['咒蚀之矢', 'CURSE BOLT'],
    dragon: ['灼热龙息', 'DRAGON BREATH'],
    golem: ['崩岩铁拳', 'STONE FIST'],
    construct: ['编译射线', 'COMPILE BEAM'],
    drone: ['追踪光束', 'TRACKER BEAM'],
    glitch: ['乱码冲击', 'GLITCH WAVE']
  };

  function keyOf(u, langId, nodeId) { return u.uid + ':' + langId + ':' + nodeId; }

  function editorKey(u, langId, nodeId, qi) {
    return 'linksekai.editor.' + u.uid + '.' + langId + '.' + nodeId + '.' + qi;
  }

  function loadCode(u, langId, nodeId, qi, starter) {
    try {
      const v = localStorage.getItem(editorKey(u, langId, nodeId, qi));
      if (v != null) return v;
    } catch (e) { }
    return starter || '';
  }

  function saveCode(u, langId, nodeId, qi, code) {
    try { localStorage.setItem(editorKey(u, langId, nodeId, qi), code); } catch (e) { }
  }

  function clearNodeCodes(u, langId, nodeId, count) {
    const n = Math.max(1, Number(count) || 1);
    for (let i = 0; i < n; i++) {
      try { localStorage.removeItem(editorKey(u, langId, nodeId, i)); } catch (e) { }
    }
  }

  function battleKey(u, langId, nodeId) {
    return 'linksekai.battle.' + u.uid + '.' + langId + '.' + nodeId;
  }

  function introSeen(key) {
    try { return sessionStorage.getItem('linksekai.intro.' + key) === '1'; } catch (e) { return false; }
  }

  function markIntroSeen(key) {
    try { sessionStorage.setItem('linksekai.intro.' + key, '1'); } catch (e) { }
  }

  function loadBattle(u, langId, nodeId) {
    try {
      const raw = localStorage.getItem(battleKey(u, langId, nodeId));
      if (!raw) return null;
      const st = JSON.parse(raw);
      if (!st || st.v !== BATTLE_VERSION) return null;
      return st;
    } catch (e) { return null; }
  }

  function saveBattle(u, langId, nodeId, st) {
    if (!st) return;
    try {
      localStorage.setItem(battleKey(u, langId, nodeId), JSON.stringify({
        v: BATTLE_VERSION,
        playerHp: st.playerHp,
        waveHp: st.waveHp || {},
        qIndex: st.qIndex,
        failCount: st.failCount || 0,
        failByQ: st.failByQ || {},
        hintsShown: st.hintsShown || 0,
        hintQ: st.hintQ || 0,
        hintsUsed: !!st.hintsUsed,
        dead: !!st.dead,
        defeatRecorded: !!st.defeatRecorded,
        savedAt: Date.now()
      }));
    } catch (e) { }
  }

  function clearBattle(u, langId, nodeId) {
    try { localStorage.removeItem(battleKey(u, langId, nodeId)); } catch (e) { }
  }

  function ensureState(u, langId, hit, force) {
    const nodeId = hit.node.id;
    const key = keyOf(u, langId, nodeId);
    if (!force && S && S.key === key) return S;

    const plan = LS.battlePlan ? LS.battlePlan(hit) : null;
    if (!plan || !plan.questions || !plan.questions.length) return null;

    const done = LS.store.progressOf(u, langId).done.includes(nodeId);
    const pmax = playerMaxOf(u, langId);
    const fresh = {
      key, langId, nodeId, plan,
      playerMax: pmax, playerHp: pmax,
      waveHp: {},
      qIndex: 0, failCount: 0, failByQ: {},
      hintsShown: 0, hintQ: 0, hintsUsed: false,
      guardLeft: (gearStatsOf(u, langId).guard || 0),
      dead: false, defeatRecorded: false, defeatModalOpen: false,
      won: false, clearedNow: false, victoryRecorded: false, victoryInfo: null,
      replay: false, resumed: false,
      term: { kind: 'idle' },
      attackLock: false,
      silenced: false,
      playerExpr: 'normal',
      code: '',
      fx: ''
    };
    S = fresh;

    // 已通关节点允许重战，不恢复上一次的残局。
    if (done) {
      clearBattle(u, langId, nodeId);
      clearNodeCodes(u, langId, nodeId, plan.questions.length);
      fresh.replay = true;
      fresh.code = plan.questions[0].starter || '';
      return S;
    }

    const saved = force ? null : loadBattle(u, langId, nodeId);
    if (saved) {
      const hp = Number(saved.playerHp);
      fresh.playerHp = Number.isFinite(hp) ? Math.max(0, Math.min(fresh.playerMax, hp)) : fresh.playerMax;
      fresh.waveHp = saved.waveHp && typeof saved.waveHp === 'object' ? saved.waveHp : {};
      fresh.qIndex = Math.max(0, Math.min(plan.questions.length - 1, Number(saved.qIndex) || 0));
      fresh.failCount = Math.max(0, Number(saved.failCount) || 0);
      fresh.failByQ = saved.failByQ && typeof saved.failByQ === 'object' ? saved.failByQ : {};
      fresh.hintQ = Number(saved.hintQ) || 0;
      fresh.hintsShown = fresh.hintQ === fresh.qIndex ? Math.max(0, Number(saved.hintsShown) || 0) : 0;
      fresh.hintsUsed = !!saved.hintsUsed;
      fresh.guardLeft = saved.guardLeft != null ? Math.max(0, Number(saved.guardLeft) || 0) : fresh.guardLeft;
      fresh.dead = !!saved.dead || fresh.playerHp <= 0;
      fresh.defeatRecorded = !!saved.defeatRecorded;
      fresh.resumed = !fresh.dead;
    }
    fresh.code = loadCode(u, langId, nodeId, fresh.qIndex, plan.questions[fresh.qIndex].starter);
    return S;
  }

  function qAt(st, i) { return st.plan.questions[Math.max(0, Math.min(st.plan.questions.length - 1, i))]; }
  function qNow(st) { return qAt(st, st.qIndex); }
  function waveNow(st) { return st.plan.waves[qNow(st).waveIndex]; }
  function gearStatsOf(u, langId) { return LS.store.gearStats ? LS.store.gearStats(u, langId) : (LS.emptyStats ? LS.emptyStats() : {}); }
  function playerMaxOf(u, langId) { return 100 + Math.round((gearStatsOf(u, langId).def || 0) * .9); }
  function counterOf(u, w, langId) {
    const def = gearStatsOf(u, langId).def || 0;
    return Math.max(2, Math.round((Number(w.damage) || 12) * 100 / (100 + def)));
  }
  function waveMax(st, wi) { return (st.plan.waves[wi].hits || 1) * 100; }
  function waveHpOf(st, wi) {
    if (!st.waveHp) st.waveHp = {};
    if (st.waveHp[wi] == null) st.waveHp[wi] = waveMax(st, wi);
    return st.waveHp[wi];
  }
  function enemyMaxOf(st) { return waveMax(st, qNow(st).waveIndex); }
  function enemyHpOf(st) { return waveHpOf(st, qNow(st).waveIndex); }
  function hitsLeft(st) { return Math.max(0, Math.ceil(enemyHpOf(st) / 100)); }

  function nextHref(langId, nodeId) {
    const nx = LS.nextNodeId(langId, nodeId);
    if (!nx) return '#/world/' + langId;
    const target = LS.findNode(langId, nx);
    if (!target) return '#/world/' + langId;
    if (target.node.type === 'battle') return '#/battle/' + langId + '/' + nx;
    if (target.node.type === 'story') return '#/story/' + langId + '/' + nx;
    return '#/lesson/' + langId + '/' + nx;
  }

  function slotItemOf(u, cat, langId) {
    if (!u || !LS.store.equippedItems) return null;
    const list = LS.store.equippedItems(u, langId);
    return (list || []).find(e => (e.cat || e.slot) === cat) || null;
  }

  function playerCfg(u, lang) {
    const qOf = cat => {
      const it = slotItemOf(u, cat, lang.id);
      return it ? it.quality : 'common';
    };
    return Object.assign({}, u.char || LS.defaultChar(lang.id), {
      langId: lang.id,
      outfit: lang.professionStyle,
      outfitColor: lang.color,
      accent: lang.color2,
      weaponStyle: LS.weaponStyleFor(lang.id, lang.professionStyle),
      weaponQuality: qOf('weapon'),
      armorQuality: qOf('apparel'),
      relicQuality: qOf('item'),
      charmQuality: qOf('item'),
      stage: LS.stageOf ? LS.stageOf(u, lang.id) : 0,
      pose: 'battle'
    });
  }

  function gearInfo(u, lang) {
    const weapon = slotItemOf(u, 'weapon', lang.id);
    const apparel = slotItemOf(u, 'apparel', lang.id);
    const trinket = slotItemOf(u, 'item', lang.id);
    const weaponStyle = LS.weaponStyleFor(lang.id, lang.professionStyle);
    const stats = gearStatsOf(u, lang.id);
    return {
      weapon, armor: apparel, relic: trinket, charm: null, stats,
      weaponStyle,
      weaponQuality: weapon ? weapon.quality : 'common',
      weaponInfusion: weapon ? (weapon.infusion || 0) : 0,
      weaponLabel: weapon ? weapon.name : (WEAPON_NAME[weaponStyle] || '初始武器'),
      armorLabel: apparel ? apparel.name : '旅装',
      relicLabel: trinket ? trinket.name : '无道具',
      charmLabel: '',
      hintMax: LS.store.hintCount ? LS.store.hintCount(u, lang.id) : 1,
      atk: stats.atk || 0,
      def: stats.def || 0
    };
  }

  function pipsHTML(n, filled, current) {
    return Array.from({ length: n }, (_, i) => {
      const cls = i < filled ? 'done' : i === current ? 'now' : '';
      return `<i class="${cls}"></i>`;
    }).join('');
  }

  function waveChipHTML(w, wi, state) {
    const q = qNow(state);
    const cur = q.waveIndex === wi;
    const done = wi < q.waveIndex;
    const filled = done ? w.hits : cur ? q.waveHit - 1 : 0;
    return `<div class="wave-chip ${done ? 'done' : ''} ${cur ? 'now' : ''} ${w.boss ? 'boss' : ''}">
      <span class="wc-type">${LS.esc(w.label)}</span>
      <b>${LS.esc(w.name)}</b>
      <span class="wc-pips">${pipsHTML(w.hits, filled, cur ? q.waveHit - 1 : -1)}</span>
    </div>`;
  }

  function arenaInner(state, u, lang, node) {
    const q = qNow(state);
    const w = waveNow(state);
    const plan = state.plan;
    const remain = hitsLeft(state);
    const emax = enemyMaxOf(state);
    const ehp = enemyHpOf(state);
    const gear = gearInfo(u, lang);
    const size = w.bigBoss ? 238 : w.boss ? 218 : w.type === 'elite' ? 202 : 186;
    const cfg = Object.assign(playerCfg(u, lang), { expression: LS.exprId(state.playerExpr || 'normal') });
    const lv = LS.levelFromXp(u.xp || 0).level;
    const skill = WEAPON_SKILL[gear.weaponStyle] || WEAPON_SKILL.kunai;
    const eskill = ENEMY_SKILL[w.kind] || ENEMY_SKILL.slime;
    const dmg = counterOf(u, w, lang.id);
    const embers = Array.from({ length: 16 }, (_, i) =>
      `<i style="--x:${(i * 37 + 9) % 96}%;--delay:-${(i * 1.37).toFixed(2)}s;--dur:${(7 + (i % 5) * 1.8).toFixed(1)}s;--sz:${2 + (i % 3)}px"></i>`
    ).join('');
    const sparks = Array.from({ length: 12 }, (_, i) =>
      `<i style="--a:${i * 30}deg;--r:${24 + (i % 4) * 13}px;--d:${(i * 0.012).toFixed(3)}s"></i>`
    ).join('');

    return `<div class="duel-bg" aria-hidden="true"></div>
      <div class="duel-shade" aria-hidden="true"></div>
      <div class="duel-atmos" aria-hidden="true">${embers}</div>
      <div class="duel-rail">${plan.waves.map((x, i) => waveChipHTML(x, i, state)).join('')}</div>
      <div class="duel-stage">
        <div class="fx-projectile" aria-hidden="true"><i></i></div>
        <div class="fx-enemy-bolt" aria-hidden="true"><i></i></div>
        <div class="fx-impact" aria-hidden="true"></div>
        <div class="fx-sparks" aria-hidden="true">${sparks}</div>
        <div class="fx-flash" aria-hidden="true"></div>
        <div class="duel-callout player-callout" aria-hidden="true"><b>${LS.esc(skill[0])}</b><span>${LS.esc(skill[1])}</span></div>
        <div class="duel-callout enemy-callout" aria-hidden="true"><b>${LS.esc(eskill[0])}</b><span>${LS.esc(eskill[1])}</span></div>
        <div class="duel-fighter player-side">
          <div class="duel-plate player-plate">
            <div class="dp-top"><span class="dp-role">YOU</span><b>${LS.esc(u.gameName)}</b><span class="dp-lv">Lv.${lv}</span></div>
            <div class="duel-hp player"><i id="player-hp-bar" style="width:${Math.max(0, state.playerHp / state.playerMax * 100)}%"></i></div>
            <div class="dp-num" id="player-hp-text">${Math.max(0, state.playerHp)} / ${state.playerMax} · 攻 +${gear.atk} / 防 +${gear.def}</div>
          </div>
          <div class="duel-figure">
            <div class="fighter-shadow"></div>
            <div class="player-aura" aria-hidden="true"></div>
            <div class="cast-ring" aria-hidden="true"></div>
            <div class="weapon-trail" aria-hidden="true"></div>
            ${LS.charImg(cfg, 180, 'duel-sprite player-sprite', u.gameName)}
            ${LS.weaponImg(lang.id, gear.weaponQuality, 118, 'weapon-ghost', WEAPON_NAME[gear.weaponStyle] || '武器')}
            <div class="slash-arc" aria-hidden="true"></div>
            <div class="enemy-hit-marks" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="damage-pop player-damage">−${dmg}</div>
          </div>
          <div class="duel-sub"><span>${LS.esc(gear.weaponLabel)}</span><span>${LS.esc(gear.armorLabel)}</span></div>
        </div>

        <div class="duel-center">
          <div class="duel-vs">VS</div>
          <div class="duel-round">ROUND <b>${state.qIndex + 1}</b><span>/ ${plan.totalHits}</span></div>
          <div class="silence-banner" id="silence-banner">敌人准备反击</div>
          <div class="duel-rule">输出一致 = 命中</div>
        </div>

        <div class="duel-fighter enemy-side ${w.bigBoss ? 'is-bigboss' : ''}">
          <div class="duel-plate enemy-plate">
            <div class="dp-top"><span class="dp-role">${LS.esc(w.label)}</span><b>${LS.esc(w.name)}</b></div>
            <div class="duel-hp enemy"><i id="enemy-hp-bar" style="width:${Math.max(0, ehp / emax * 100)}%"></i></div>
            <div class="dp-num" id="enemy-hp-text">${ehp} / ${emax}</div>
          </div>
          <div class="duel-figure">
            <div class="fighter-shadow"></div>
            <div class="enemy-aura" aria-hidden="true"></div>
            <div class="enemy-cast" aria-hidden="true"></div>
            <div class="claw-fx" aria-hidden="true"><i></i><i></i><i></i></div>
            ${LS.enemyImg(w.kind, { boss: !!w.boss }, size, 'duel-sprite enemy-sprite', w.name)}
            <div class="hit-burst" aria-hidden="true"></div>
            <div class="damage-pop enemy-damage">−${100 + gear.atk}</div>
          </div>
          <div class="duel-sub"><span class="enemy-taunt-line">「${LS.esc(w.taunt || '让输出说话。')}」</span><span>剩 ${remain} 击</span></div>
        </div>
        <div class="manga-cut" id="manga-cut" aria-hidden="true">
          <div class="mc-lines"></div>
          <div class="mc-slash"></div>
          <div class="mc-word">${MC_WORD[gear.weaponStyle] || '斬'}</div>
        </div>
      </div>
      <div class="duel-watermark-cover" aria-hidden="true"></div>`;
  }

  function taskCardInner(state, node, compact) {
    const q = qNow(state);
    const w = waveNow(state);
    const fails = Number(state.failByQ[q.qIndex]) || 0;
    const kind = KIND_LABEL[q.kind] || '试炼';
    const filled = q.waveHit - 1;
    if (compact) {
      return `<div class="task-card paper duel-mission corner-mark">
        <div class="mission-left">
          <div class="mission-kicker"><span class="kicker-jp">WAVE ${q.waveIndex + 1} · ${LS.esc(w.label)} · 第 ${q.waveHit}/${q.waveHits} 击</span><span class="task-pips" title="本波命中进度">${pipsHTML(q.waveHits, filled, q.waveHit - 1)}</span></div>
          <div class="mission-title-row">
            <h2>攻击指令 · ${LS.esc(w.name)}</h2>
            <div class="task-badges">
              <span class="task-badge">${LS.esc(kind)}</span>
              ${q.reviewChapter ? `<span class="task-badge">复习 · ${LS.esc(q.reviewChapter)}</span>` : ''}
              ${fails ? `<span class="task-badge is-fail">本题失误 ${fails}</span>` : ''}
            </div>
          </div>
          <p class="task-prompt">${LS.esc(q.prompt)}</p>
        </div>
        <div class="mission-target">
          <b>让终端输出</b>
          <pre class="task-expected">${LS.esc(q.expected)}</pre>
          <span class="mission-hint">${LS.icon('sword', 10)} 输出逐字一致才算命中 · 还需 ${hitsLeft(state)} 次正确攻击</span>
        </div>
      </div>`;
    }
    return `<div class="task-card paper corner-mark">
      <div class="task-top">
        <div class="task-title">
          <div class="kicker-jp">WAVE ${q.waveIndex + 1} · ${LS.esc(w.label)} · 第 ${q.waveHit}/${q.waveHits} 击</div>
          <h2>攻击指令 · ${LS.esc(w.name)}</h2>
          <div class="task-badges">
            <span class="task-badge">${LS.esc(kind)}</span>
            ${q.reviewChapter ? `<span class="task-badge">复习 · ${LS.esc(q.reviewChapter)}</span>` : ''}
            ${fails ? `<span class="task-badge is-fail">本题失误 ${fails}</span>` : ''}
          </div>
        </div>
        <div class="task-pips" title="本波命中进度">${pipsHTML(q.waveHits, filled, q.waveHit - 1)}</div>
      </div>
      <p class="task-prompt">${LS.esc(q.prompt)}</p>
      <div class="task-req">
        <span>${LS.icon('target', 13)}</span>
        <div class="task-req-body">
          <b>让终端输出</b>
          <pre class="task-expected">${LS.esc(q.expected)}</pre>
        </div>
      </div>
      <div class="task-foot">${LS.icon('sword', 11)} 输出必须逐字一致；写错会被反击。击破这一只还需要 ${hitsLeft(state)} 次正确攻击。</div>
    </div>`;
  }

  function outputHTML(text) {
    const lines = String(text == null ? '' : text).split('\n');
    if (!lines.length || (lines.length === 1 && !lines[0])) return '<pre class="term-output is-muted">（没有输出）</pre>';
    return '<pre class="term-output duel-output">' + lines.map((l, i) =>
      `<span class="term-out-line" style="--i:${i}">${LS.esc(l) || ' '}</span>`
    ).join('\n') + '</pre>';
  }

  function englishError(raw) {
    const s = String(raw || '');
    if (/循环步数|step limit|too many/i.test(s)) return 'RuntimeError: loop step limit exceeded.';
    if (/交互输入|input is not supported|__NO_INPUT__/i.test(s)) return 'RuntimeError: interactive input is not supported.';
    if (/缩进|indent/i.test(s)) return 'IndentationError: invalid indentation.';
    if (/除零|division by zero|ZeroDivision/i.test(s)) return 'ZeroDivisionError: division by zero.';
    if (/越界|IndexError|out of range/i.test(s)) return 'IndexError: index out of range.';
    if (/键|KeyError/i.test(s)) return 'KeyError: key not found.';
    if (/引号|未闭合|unterminated|quote/i.test(s)) return 'SyntaxError: unterminated string literal.';
    if (/未定义|not defined|NameError|ReferenceError/i.test(s)) return 'NameError: name is not defined.';
    if (/类型|TypeError|not a function|Cannot read/i.test(s)) return 'TypeError: unsupported operation or call.';
    if (/语法|无法解析|syntax|unexpected|invalid token/i.test(s)) return 'SyntaxError: invalid or unexpected token.';
    return 'RuntimeError: code failed to execute.';
  }

  function chineseError(langId, raw, code) {
    const s = String(raw || '');
    if (/缩进|indent/i.test(s)) return '缩进错误：同一层的语句必须对齐；冒号或左花括号后面要缩进一层。';
    if (/引号|未闭合|unterminated|quote/i.test(s)) return '引号或括号没有闭合。检查字符串结尾是不是少了一个引号。';
    if (/除零|division by zero|ZeroDivision/i.test(s)) return '除零错误：除数不能是 0。先判断除数，再做除法。';
    if (/越界|IndexError|out of range/i.test(s)) return '下标越界：这个位置不存在。下标从 0 开始，最大只能到长度减一。';
    if (/键|KeyError/i.test(s)) return '键不存在：字典 / 映射里没有这个键。先判断键是否存在。';
    if (/循环步数|step limit|too many/i.test(s)) return '循环没有停下来：检查 while / for 的终止条件，别让条件永远为真。';
    if (/交互输入|input is not supported|__NO_INPUT__/i.test(s)) return '教学终端不支持 input / scanf / cin 这类交互输入。把测试数据直接写进代码。';
    if (/未定义|not defined|NameError|ReferenceError/i.test(s)) return '名称错误：用到了还没定义的变量，或者变量名拼错了。先赋值，再使用。';
    if (/类型|TypeError|not a function|Cannot read/i.test(s)) return '类型错误：当前的值不能做这种运算或调用。打印出来确认它到底是什么类型。';
    if (/语法|无法解析|syntax|unexpected|invalid/i.test(s)) return '语法错误：句子结构不完整。检查括号、引号、冒号、分号是否成对，关键字有没有拼错。';
    return LS.explainError ? LS.explainError(langId, raw, code).zh : '代码没有通过执行。从出错的位置开始检查括号、引号、缩进和变量名。';
  }

  function failureInfo(langId, q, res, mustOk, code) {
    if (!res.ok) {
      const raw = res.error || '代码无法执行。';
      return { en: englishError(raw), zh: chineseError(langId, raw, code), raw: String(raw) };
    }
    if (!mustOk) {
      return {
        en: 'StructureRequirement: the required code structure is missing.',
        zh: (q.must && q.must.text) ? q.must.text : '代码能运行，但缺少题目要求的写法（循环、函数或指定语法）。',
        raw: ''
      };
    }
    return {
      en: 'OutputMismatch: actual output does not match the expected output.',
      zh: '输出不一致：程序运行成功，但打印的内容、顺序、空格或标点与预期不同。逐行比对。',
      raw: ''
    };
  }

  function firstDiff(expected, actual) {
    const e = String(expected || '').split('\n');
    const a = String(actual || '').split('\n');
    for (let i = 0; i < Math.max(e.length, a.length); i++) {
      if ((e[i] || '') !== (a[i] || '')) {
        return '第 ' + (i + 1) + ' 行：期望「' + (e[i] == null ? '（无）' : e[i]) + '」，实际「' + (a[i] == null ? '（无）' : a[i]) + '」';
      }
    }
    return '';
  }

  function terminalHTML(state, langId) {
    const t = state.term || { kind: 'idle' };
    if (t.kind === 'idle') {
      return `<div class="term-idle">终端待命。写下代码，按「用这串代码攻击」——没有预运行，第一次输出就是你的攻击。<span class="term-cursor"></span></div>`;
    }
    if (t.kind === 'ok') {
      const killed = !!t.killed;
      return `<div class="term-line is-ok"><span class="tl-prompt">$ attack</span> 命中 · 输出与预期完全一致</div>
        ${outputHTML(t.output)}
        <div class="term-outcome ok">
          <b>${killed ? '击破确认' : '命中确认'}</b>
          <span>−${t.damage || 100} HP${killed ? ' · 这一只倒下了' : ''} · 敌人被沉默，本回合无法反击</span>
        </div>`;
    }
    if (t.kind === 'fail') {
      let html = `<div class="term-line is-err"><span class="tl-prompt">$ attack</span> 攻击落空 · 敌人开始反击</div>
        <div class="term-errbox">
          <div class="te-row"><span class="te-tag">EN</span><code>${LS.esc(t.en || 'RuntimeError: code failed to execute.')}</code></div>
          <div class="te-row zh"><span class="te-tag">中文</span><p>${LS.esc(t.zh || '代码没有通过。')}</p></div>
          ${t.raw ? `<div class="te-row raw"><span class="te-tag">终端</span><code>${LS.esc(t.raw)}</code></div>` : ''}
        </div>`;
      if (t.actual !== t.expected || t.raw) {
        html += `<div class="term-diff">
          <div><b>期望输出</b><pre>${LS.esc(t.expected || '')}</pre></div>
          <div><b>实际输出</b><pre>${t.actual ? LS.esc(t.actual) : '（空）'}</pre></div>
        </div>`;
      }
      if (t.diff) html += `<div class="term-why">第一个差异：${LS.esc(t.diff)}</div>`;
      html += t.guarded
        ? `<div class="term-outcome good"><b>护盾抵消</b><span>本次失误不受到反击伤害 · 剩余护盾 ${state.guardLeft || 0} 次</span></div>`
        : `<div class="term-outcome bad"><b>反击命中</b><span>−${t.damage} HP · 玩家剩余 ${Math.max(0, state.playerHp)} / ${state.playerMax}</span></div>`;
      return html;
    }
    return '';
  }

  function hintsHTML(state, u, langId) {
    const q = qNow(state);
    const hints = q.hints || [];
    const max = Math.min(LS.store.hintCount ? LS.store.hintCount(u, langId) : 1, hints.length);
    const fails = Number(state.failByQ[q.qIndex]) || 0;
    return `<div class="hints-card" id="hints-card">
      <div class="hints-head">
        <div><div class="kicker-jp">HINT · 思路</div><h3>提示 <span class="tiny faint">${Math.min(state.hintsShown, max)} / ${max}</span></h3></div>
        <button class="btn btn-sm btn-ghost" id="hint-btn" ${state.hintsShown >= max || state.won || state.dead ? 'disabled' : ''}>${LS.icon('spark', 12)} 查看提示</button>
      </div>
      ${state.hintsShown ? `<div class="hint-list">${hints.slice(0, state.hintsShown).map((h, i) => `<div class="hint-item"><span>${i + 1}</span><p>${LS.esc(h)}</p></div>`).join('')}</div>` : `<p class="tiny faint hint-empty">装备品质决定可查看的提示数量。当前最多 ${max} 条。</p>`}
      ${fails >= 2 ? `<button class="btn btn-ghost btn-sm solution-btn" id="solution-btn">我卡住了，查看参考答案</button>` : ''}
    </div>`;
  }

  function ghostHTML(state, u, langId) {
    const q = qNow(state);
    const gs = LS.store.gearStats ? LS.store.gearStats(u, langId) : {};
    const n = Math.min(3, Math.max(0, gs.ghost || 0));
    if (!n) return '';
    const lines = String(q.solution || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, n);
    if (!lines.length) return '';
    return `<div class="ghost-code" title="道具残影：隐隐浮现的记忆碎片"><span class="gc-label">GHOST · 记忆残影 ${n} 行</span><pre>${lines.map(l => LS.esc(l)).join('\n')}</pre></div>`;
  }

  function sideInner(state, u, lang, node) {
    const q = qNow(state);
    const w = waveNow(state);
    const gear = gearInfo(u, lang);
    const loot = node.loot;
    const lq = loot ? LS.qualityOf(loot.quality, loot.infusion) : LS.QUALITY.common;
    const lv = LS.levelFromXp(u.xp || 0).level;
    return `<div class="side-card enemy-intel">
      <div class="kicker-jp">ENCOUNTER · 当前敌人</div>
      <div class="si-head">
        <span class="si-mark ${w.boss ? 'boss' : ''}">${w.bigBoss ? '大' : w.boss ? '階' : w.type === 'elite' ? '精' : '小'}</span>
        <div><b>${LS.esc(w.name)}</b><span>${LS.esc(w.label)} · ${w.hits} 击</span></div>
      </div>
      <p class="si-taunt">「${LS.esc(w.taunt || '')}」</p>
      <p class="si-lore">${LS.esc(w.lore || '')}</p>
      <div class="si-facts">
        <span>反击伤害 <b>${counterOf(u, w, lang.id)}</b></span>
        <span>剩余 <b>${hitsLeft(state)}</b> 击</span>
        <span>答案类型 <b>${LS.esc(KIND_LABEL[q.kind] || '试炼')}</b></span>
      </div>
    </div>

    <div class="side-card duel-gear-card">
      <div class="kicker-jp">EQUIPMENT · 当前装备</div>
      <div class="gear-three">
        ${[['weapon', gear.weapon], ['apparel', gear.armor], ['item', gear.relic]].map(([cat, it]) => {
          const q = it ? LS.qualityOf(it.quality, it.infusion) : null;
          const inf = it ? LS.infusionOf(it) : 0;
          const lines = it ? LS.statsLine(LS.statsOfItem(it), true) : '空栏 · 暂无加成';
          const infText = inf ? `魔能 ${LS.ROMAN[inf]} · 装备数值 +${Math.round((Math.pow(LS.INFUSION_MULT, inf) - 1) * 100)}%` : '';
          return `<div class="gear-tile ${it ? 'on' : 'empty'}" style="${q ? `--q-color:${q.color};--q-glow:${q.glow}` : ''}">
            ${it ? LS.itemArtHTML(it, 'gt-art', it.name) : `<span class="item-art gt-art is-text"><em>${LS.CAT_ICONS[cat]}</em></span>`}
            <div class="gt-copy">
              <em>${SLOT_LABEL[cat]}栏</em>
              <b>${it ? LS.esc(it.name) : '未装备'}</b>
              <span class="${q && q.infused ? 'q-infused' : ''}">${q ? LS.esc(q.name) : '空栏'}</span>
              <i>${LS.esc(lines)}</i>
              ${infText ? `<i class="gt-inf">${LS.esc(infText)}</i>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="gear-total">
        <div class="gt-head"><span>三件合计 · STACKED</span><em>效果叠加生效</em></div>
        <div class="gt-chips">
          ${['atk', 'def', 'luck', 'xp', 'coin'].map(k => `<span><em>${LS.STAT_LABEL[k]}</em><b>+${gear.stats[k] || 0}${LS.STAT_UNIT[k] || ''}</b></span>`).join('')}
          ${['hint', 'ghost', 'guard'].filter(k => gear.stats[k]).map(k => `<span><em>${LS.STAT_LABEL[k]}</em><b>+${gear.stats[k]}${LS.STAT_UNIT[k] || ''}</b></span>`).join('')}
        </div>
      </div>
      <div class="gear-battle">
        <div><span>剩余护盾</span><b>${state.guardLeft || 0} 次失误</b></div>
        <div><span>本题提示</span><b>${state.hintsShown || 0} / ${Math.min(gear.hintMax, (q.hints || []).length)} 条</b></div>
      </div>
      <div class="gear-foot"><span>${LS.esc(u.gameName)} · Lv.${lv}</span><span>${LS.esc(lang.profession)}</span></div>
    </div>

    <div class="side-card loot-card" style="--q-color:${lq.color}">
      <div class="kicker-jp">DROP · 战利品</div>
      <div class="side-loot"><span class="sl-icon">${LS.esc(loot ? loot.icon : '？')}</span><div><b>${LS.esc(loot ? loot.name : '未配置')}</b><span class="${lq.infused ? 'q-infused' : ''}">${lq.name} · ${SLOT_LABEL[loot && loot.slot] || '装备'}</span></div></div>
      <p>${LS.esc(loot ? loot.lore : '')}</p>
      ${state.replay ? '<p class="tiny faint">重战不再重复发放奖励。</p>' : ''}
    </div>

    <div class="side-card wave-list-card">
      <div class="kicker-jp">ROUTE · 本关波次</div>
      <div class="wave-list">
        ${state.plan.waves.map((x, wi) => {
          const done = wi < q.waveIndex;
          const cur = wi === q.waveIndex;
          return `<div class="wave-row ${done ? 'done' : ''} ${cur ? 'now' : ''} ${x.boss ? 'boss' : ''}">
            <span class="wr-index">${String(wi + 1).padStart(2, '0')}</span>
            <div><b>${LS.esc(x.name)}</b><span>${LS.esc(x.label)} · ${x.hits} 击</span></div>
            <span class="wr-state">${done ? '已击破' : cur ? '交战中' : '待机'}</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="side-card side-tip">
      <div class="kicker-jp">RULE · 战斗规则</div>
      <p>· 没有运行 / 检查按钮，写错也会直接承受反击。</p>
      <p>· 输出完全一致才算命中；命中后敌人沉默一回合。</p>
      <p>· 生命归零则本关失败，离开页面不会回满生命。</p>
    </div>`;
  }

  function topChipsHTML(state) {
    const q = qNow(state);
    const w = waveNow(state);
    return `<span class="chip ${w.bigBoss ? 'chip-red' : w.boss ? 'chip-gold' : 'chip-cyan'}">${LS.esc(w.bigBoss ? '大 BOSS 战' : w.boss ? '阶段 BOSS' : w.type === 'elite' ? '精英战' : '小怪战')}</span>
      <span class="chip">第 ${state.qIndex + 1} / ${state.plan.totalHits} 问</span>
      <span class="chip">第 ${q.waveIndex + 1} / ${state.plan.waves.length} 波</span>
      ${state.replay ? '<span class="chip chip-cyan">已通关 · 重战中</span>' : state.resumed ? '<span class="chip chip-cyan">战斗记录已恢复</span>' : ''}
      ${state.won ? '<span class="chip chip-gold">试炼已通过</span>' : state.dead ? '<span class="chip chip-red">生命耗尽</span>' : ''}`;
  }

  function html(parts) {
    const u = LS.store.current();
    const langId = parts[1], nodeId = parts[2];
    const hit = LS.findNode(langId, nodeId);
    if (!hit || hit.node.type !== 'battle') return { html: '<div class="panel" style="padding:30px">这不是一个试炼节点。</div>' };
    if (!LS.nodeUnlocked(u, langId, nodeId) && !LS.store.progressOf(u, langId).done.includes(nodeId)) {
      return { html: `<div class="panel" style="padding:36px;text-align:center"><h2>试炼尚未开启</h2><p class="muted" style="margin:10px 0 18px">先完成前一个节点。</p><a class="btn" href="#/world/${langId}">返回星轨</a></div>` };
    }
    const lang = hit.lang;
    const node = hit.node;
    const state = ensureState(u, langId, hit);
    if (!state) return { html: `<div class="panel" style="padding:30px"><h2>战斗数据未能编排</h2><p class="muted" style="margin-top:8px">这一关的题目池为空。</p><a class="btn" href="#/world/${langId}" style="margin-top:16px">返回星轨</a></div>` };
    state.attackLock = false;

    return {
      html: `<div class="battle-page duel-page" style="--lang-color:${lang.color};--lang-accent:${lang.color2}">
        <div class="battle-top">
          <div class="breadcrumbs"><a href="#/world">星轨地图</a><i>/</i><a href="#/world/${langId}">${LS.esc(lang.name)}</a><i>/</i><span>${LS.esc(node.title)}</span></div>
          <div class="battle-status" id="duel-top-chips">${topChipsHTML(state)}</div>
        </div>

        <div id="task-card">${taskCardInner(state, node, true)}</div>

        <div class="duel-cockpit">
          <section class="duel-arena" id="arena" data-weapon="${LS.weaponStyleFor(langId, lang.professionStyle)}" data-kind="${waveNow(state).kind}" data-boss="${waveNow(state).bigBoss ? 'big' : waveNow(state).boss ? 'stage' : 'normal'}">${arenaInner(state, u, lang, node)}</section>

          <section class="duel-console-col">
            <div class="battle-editor" id="battle-editor"></div>
            <div id="ghost-mount">${ghostHTML(state, u, langId)}</div>
            <div class="editor-foot duel-editor-foot">
              <div class="ed-round" id="duel-foot-info">本战 ${state.qIndex + 1} / ${state.plan.totalHits} 问 · 失误 ${state.failCount}</div>
              <div class="ed-actions">
                <button class="btn btn-ghost btn-sm" id="clear-btn" ${state.won || state.dead ? 'disabled' : ''}>清空</button>
                <button class="btn duel-attack" id="attack-btn" ${state.won || state.dead ? 'disabled' : ''}>${LS.icon('sword', 15)} 用这串代码攻击</button>
                <button class="btn btn-ghost btn-sm" id="rematch-btn" style="display:${state.won ? 'inline-flex' : 'none'}">再次挑战</button>
              </div>
            </div>
            <div class="terminal-card duel-term">
              <div class="terminal-head"><span class="term-dots"><i></i><i></i><i></i></span><b>terminal · ${LS.esc(lang.name.toLowerCase().replace(/\s+/g, ''))}</b><span class="term-status" id="term-status">READY</span></div>
              <div class="terminal-body" id="terminal-body">${terminalHTML(state, langId)}</div>
            </div>
            <div id="hints-mount">${hintsHTML(state, u, langId)}</div>
          </section>
        </div>

        <aside class="battle-side duel-side-strip" id="battle-side">${sideInner(state, u, lang, node)}</aside>

        <div class="battle-foot">
          <a class="btn btn-ghost btn-sm" href="#/world/${langId}" title="离开不会重置战斗，回来会从当前生命值继续">撤退回星轨</a>
          <span class="tiny faint">战斗状态锁定在本机存档：离开或刷新都不会回满生命。当前敌人反击伤害 ${waveNow(state).damage}。</span>
        </div>
      </div>`,
      title: node.title,
      sub: lang.name + ' · CODE DUEL',
      mount(root) {
        const u2 = LS.store.current();
        const st = S;
        if (!st) return;
        const plan = st.plan;
        const node2 = hit.node;
        let api = null;

        const arenaEl = root.querySelector('#arena');
        const editorMount = root.querySelector('#battle-editor');
        if (!arenaEl || !editorMount) return;

        st.defeatModalOpen = false;
        st.fx = '';

        function isLive() { return root.isConnected && S === st; }

        function updateTop(r) {
          const el = r.querySelector('#duel-top-chips');
          if (el) el.innerHTML = topChipsHTML(st);
        }

        function updateArena(r) {
          const el = r.querySelector('#arena');
          if (!el) return;
          const wv = waveNow(st);
          el.className = 'duel-arena';
          el.dataset.weapon = gearInfo(u2, lang).weaponStyle;
          el.dataset.kind = wv.kind;
          el.dataset.boss = wv.bigBoss ? 'big' : wv.boss ? 'stage' : 'normal';
          el.innerHTML = arenaInner(st, u2, lang, node2);
          paintSilence(r);
        }

        function updateTaskCard(r) {
          const el = r.querySelector('#task-card');
          if (el) el.innerHTML = taskCardInner(st, node2, true);
        }

        function updateSide(r) {
          const el = r.querySelector('#battle-side');
          if (el) el.innerHTML = sideInner(st, u2, lang, node2);
        }

        function updateHints(r) {
          const el = r.querySelector('#hints-mount');
          if (el) el.innerHTML = hintsHTML(st, u2, langId);
        }

        function updateGhosts(r) {
          const el = r.querySelector('#ghost-mount');
          if (el) el.innerHTML = ghostHTML(st, u2, langId);
        }

        function updateTerminal(r) {
          const el = r.querySelector('#terminal-body');
          if (el) el.innerHTML = terminalHTML(st, langId);
          const status = r.querySelector('#term-status');
          if (status) status.textContent = st.term.kind === 'ok' ? 'HIT' : st.term.kind === 'fail' ? 'COUNTER' : 'READY';
        }

        function updateFooter(r) {
          const info = r.querySelector('#duel-foot-info');
          if (info) info.textContent = `本战 ${st.qIndex + 1} / ${plan.totalHits} 问 · 失误 ${st.failCount}`;
          const btn = r.querySelector('#attack-btn');
          if (btn) {
            btn.disabled = st.attackLock || st.dead || st.won;
            btn.innerHTML = st.won ? '试炼已通过' : st.dead ? '生命耗尽' : `${LS.icon('sword', 15)} 用这串代码攻击`;
          }
          const clear = r.querySelector('#clear-btn');
          if (clear) clear.disabled = st.won || st.dead;
          const rematch = r.querySelector('#rematch-btn');
          if (rematch) rematch.style.display = st.won ? 'inline-flex' : 'none';
        }

        function paintSilence(r) {
          const arena = r.querySelector('#arena');
          if (!arena) return;
          arena.classList.toggle('is-silenced', !!st.silenced);
          const banner = r.querySelector('#silence-banner');
          if (banner) banner.textContent = st.silenced ? '◆ 敌人沉默 · 无法反击' : '敌人准备反击';
        }

        function paintPlayerHp(r) {
          const bar = r.querySelector('#player-hp-bar');
          const text = r.querySelector('#player-hp-text');
          if (bar) bar.style.width = Math.max(0, st.playerHp / st.playerMax * 100) + '%';
          if (text) text.textContent = Math.max(0, st.playerHp) + ' / ' + st.playerMax;
        }

        function paintEnemyHp(r) {
          const emax = enemyMaxOf(st);
          const val = Math.max(0, Math.min(emax, enemyHpOf(st)));
          const bar = r.querySelector('#enemy-hp-bar');
          const text = r.querySelector('#enemy-hp-text');
          if (bar) bar.style.width = (emax ? val / emax * 100 : 0) + '%';
          if (text) text.textContent = val + ' / ' + emax;
        }

        function setFx(name) {
          const el = root.querySelector('#arena');
          if (!el) return;
          el.classList.remove('fx-attack', 'fx-hit', 'fx-hurt', 'fx-kill', 'fx-enter', 'fx-charge', 'fx-enemy-charge');
          if (!name) return;
          void el.offsetWidth;
          el.classList.add('fx-' + name);
        }

        /* 命中/击破粒子爆散：颜色取各语言职业主题色，粒子为一次性 DOM span。 */
        const FX_COLORS = {
          python: ['#7fe7e0', '#59c9c2', '#b7fff4'],
          java: ['#c9a6ff', '#a67dff', '#e8d9ff'],
          c: ['#aee6ff', '#7cc8f0', '#e6f6ff'],
          javascript: ['#ffe28a', '#ffc95c', '#fff3c9'],
          cpp: ['#ff7a6e', '#e85c50', '#ffc9b8'],
          go: ['#9bb8ff', '#7a94e8', '#d6e2ff']
        };
        function burstParticles(rootEl, lang, kind) {
          const arena = rootEl.querySelector('#arena');
          const foe = rootEl.querySelector('.duel-side-right .enemy-sprite') || rootEl.querySelector('.enemy-sprite');
          if (!arena) return;
          let layer = arena.querySelector('.fx-particles');
          if (!layer) {
            layer = document.createElement('div');
            layer.className = 'fx-particles';
            arena.appendChild(layer);
          }
          const ar = arena.getBoundingClientRect();
          const fr = foe ? foe.getBoundingClientRect() : null;
          const cx = fr ? fr.left - ar.left + fr.width * 0.5 : ar.width * 0.68;
          const cy = fr ? fr.top - ar.top + fr.height * 0.45 : ar.height * 0.5;
          const cols = FX_COLORS[lang] || FX_COLORS.python;
          const n = kind === 'kill' ? 38 : 18;
          layer.dataset.lang = lang;
          /* 命中闪光 */
          const flash = document.createElement('i');
          flash.className = 'fx-flash';
          flash.style.background = 'radial-gradient(circle 240px at ' + cx + 'px ' + cy + 'px, '
            + cols[0] + ', rgba(255,255,255,.18) 28%, transparent 68%)';
          layer.appendChild(flash);
          /* 冲击环 */
          const ring = document.createElement('i');
          ring.className = 'fx-ring';
          ring.style.left = cx + 'px';
          ring.style.top = cy + 'px';
          ring.style.setProperty('--c', cols[0]);
          layer.appendChild(ring);
          /* 斜向斩击线 */
          const streak = document.createElement('i');
          streak.className = 'fx-streak';
          streak.style.left = (cx - 90) + 'px';
          streak.style.top = (cy - 30) + 'px';
          streak.style.setProperty('--c', cols[0]);
          streak.style.setProperty('--rot', (kind === 'kill' ? -38 : -18) + 'deg');
          layer.appendChild(streak);
          const SHAPE = { python: 'flame', java: 'shard', c: 'glow', javascript: 'bolt', cpp: 'gear', go: 'streak' };
          for (let i = 0; i < n; i++) {
            const p = document.createElement('i');
            p.className = 'fx-p p-' + (SHAPE[lang] || 'glow');
            const ang = Math.random() * Math.PI * 2;
            const dist = (kind === 'kill' ? 52 : 28) + Math.random() * (kind === 'kill' ? 86 : 48);
            const s = 5 + Math.random() * (kind === 'kill' ? 13 : 8);
            p.style.setProperty('--x', (cx + (Math.random() * 24 - 12)) + 'px');
            p.style.setProperty('--y', (cy + (Math.random() * 24 - 12)) + 'px');
            p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
            p.style.setProperty('--dy', (Math.sin(ang) * dist + (kind === 'kill' ? 30 : 12)) + 'px');
            p.style.setProperty('--c', cols[(Math.random() * cols.length) | 0]);
            p.style.setProperty('--s', s + 'px');
            p.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
            p.style.animationDuration = (0.7 + Math.random() * 0.5) + 's';
            layer.appendChild(p);
          }
          setTimeout(() => { layer.innerHTML = ''; }, 1300);
        }

        let mcTimer = 0;
        function mangaCut(strong) {
          const el = root.querySelector('#manga-cut');
          if (!el) return;
          const word = el.querySelector('.mc-word');
          const style = LS.weaponStyleFor(langId, lang.professionStyle);
          if (word) word.textContent = strong ? '撃破' : (MC_WORD[style] || '斬');
          el.classList.remove('is-on', 'is-strong');
          void el.offsetWidth;
          el.classList.add('is-on');
          if (strong) el.classList.add('is-strong');
          clearTimeout(mcTimer);
          mcTimer = setTimeout(() => el.classList.remove('is-on', 'is-strong'), 720);
        }

        function setPlayerExpr(expr) {
          st.playerExpr = expr;
          const el = root.querySelector('.player-sprite');
          if (!el) return;
          /* v5：expr 直接映射静态战斗图 —— attack→攻击图、hurt→受击图、其余→站姿立绘。
             charSetExpression 会原地换 img 的 src（data-act 去重）。 */
          if (LS.charSetExpression) {
            LS.charSetExpression(el, expr);
            return;
          }
          if (el.tagName === 'IMG' && LS.charDataURL) {
            el.src = LS.charDataURL(Object.assign(playerCfg(u2, lang), { expression: LS.exprId(expr) }));
          }
        }

        function syncAll(r) {
          updateTop(r); updateArena(r); updateTaskCard(r); updateSide(r);
          updateHints(r); updateGhosts(r); updateTerminal(r); updateFooter(r);
        }

        function advanceQuestion(r, nextIndex, newWave) {
          st.qIndex = Math.max(0, Math.min(plan.questions.length - 1, nextIndex));
          st.hintsShown = 0;
          st.hintQ = st.qIndex;
          st.term = { kind: 'idle' };
          st.attackLock = false;
          st.playerExpr = 'normal';
          if (newWave) st.silenced = false;
          const q = qNow(st);
          st.code = loadCode(u2, langId, node2.id, st.qIndex, q.starter);
          saveBattle(u2, langId, node2.id, st);
          if (api) api.setValue(st.code);
          syncAll(r);
          if (newWave) {
            setFx('enter');
            setTimeout(() => { if (isLive()) setFx(''); }, 700);
          }
          if (window.innerWidth >= 900) setTimeout(() => { if (isLive() && api) api.focus(); }, 70);
        }

        function showHint() {
          const q = qNow(st);
          const hints = q.hints || [];
          const max = Math.min(LS.store.hintCount ? LS.store.hintCount(u2, langId) : 1, hints.length);
          if (st.hintsShown >= max || st.won || st.dead) return;
          st.hintsShown++;
          st.hintsUsed = true;
          u2.stats.hintsUsed = (u2.stats.hintsUsed || 0) + 1;
          saveBattle(u2, langId, node2.id, st);
          LS.store.save();
          updateHints(root);
        }

        function showSolution() {
          const q = qNow(st);
          if ((Number(st.failByQ[q.qIndex]) || 0) < 2) return;
          st.hintsUsed = true;
          saveBattle(u2, langId, node2.id, st);
          LS.store.save();
          LS.openModal(LS.modalHead('SOLUTION', '参考答案 · ' + LS.esc(node2.title), '看完之后，请亲手把它改写一遍。') +
            `<div class="solution-box"><pre class="code-block"><code>${LS.highlight(q.solution || '', langId)}</code></pre></div>
             <div class="modal-actions"><button class="btn btn-ghost" data-close>自己再试</button><button class="btn" id="use-solution">填入编辑器</button></div>`, {
            wide: true,
            mount(m, overlay) {
              const b = m.querySelector('#use-solution');
              if (b) b.addEventListener('click', () => {
                if (api) { api.setValue(q.solution || ''); api.focus(); }
                st.code = q.solution || '';
                saveCode(u2, langId, node2.id, st.qIndex, st.code);
                LS.closeModal(overlay);
                updateFooter(root);
              });
            }
          });
        }

        function clearCode() {
          if (!api || st.won || st.dead) return;
          api.setValue('');
          api.focus();
          st.code = '';
          saveCode(u2, langId, node2.id, st.qIndex, '');
        }

        function rematch() {
          clearBattle(u2, langId, node2.id);
          clearNodeCodes(u2, langId, node2.id, st.plan.questions.length);
          if (S === st) S = null;
          st.defeatModalOpen = false;
          LS.app.render();
        }

        function recordDefeatStats() {
          if (st.defeatRecorded) return;
          st.defeatRecorded = true;
          st.dead = true;
          u2.stats.battlesLost = (u2.stats.battlesLost || 0) + 1;
          LS.store.save();
          saveBattle(u2, langId, node2.id, st);
        }

        function openDefeat() {
          if (!isLive() || st.defeatModalOpen) return;
          recordDefeatStats();
          st.defeatModalOpen = true;

          function leaveBattle() {
            st.defeatModalOpen = false;
            clearBattle(u2, langId, node2.id);
            if (S === st) S = null;
          }
          function retreat() {
            leaveBattle();
            if (location.hash.indexOf('#/battle/') === 0) LS.app.go('#/world/' + langId);
          }

          LS.openModal(`<div class="modal-head"><div><div class="kicker-jp">DEFEAT · 败北</div><h2 class="title-lg" style="margin-top:6px">你在终端前失去了意识</h2><p class="muted small" style="margin-top:6px">失败不是终点。星轨会记住你倒下的位置，也会记住你重新站起来的那一次。</p></div><button class="modal-close" data-close>✕</button></div>
            <div class="defeat-art">${LS.enemyImg(waveNow(st).kind, { boss: !!waveNow(st).boss }, 130)}</div>
            <div class="victory-stats"><span>倒下于第 ${st.qIndex + 1} 问</span><span>本关失误 ${st.failCount} 次</span><span>波次 ${qNow(st).waveIndex + 1} / ${plan.waves.length}</span></div>
            <p class="center small muted" style="margin-top:10px">本次试炼失败。已获得的装备与课程进度不会丢失。</p>
            <div class="modal-actions"><button class="btn btn-ghost" id="retreat">先撤退</button><button class="btn" id="retry">重新挑战 ${LS.icon('refresh', 13)}</button></div>`, {
            mount(m, overlay) {
              const retry = m.querySelector('#retry');
              if (retry) retry.addEventListener('click', () => {
                st.defeatModalOpen = false;
                LS.closeModal(overlay);
                clearNodeCodes(u2, langId, node2.id, st.plan.questions.length);
                leaveBattle();
                LS.app.render();
              });
              const retreatBtn = m.querySelector('#retreat');
              if (retreatBtn) retreatBtn.addEventListener('click', () => { LS.closeModal(overlay); retreat(); });
              m.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => { LS.closeModal(overlay); retreat(); }));
            }
          });
        }

        function recordVictory() {
          if (st.won) return;
          st.won = true;
          st.clearedNow = true;
          st.victoryRecorded = true;
          const chapterIndex = Math.max(0, (lang.chapters || []).indexOf(hit.chapter));
          const wv = waveNow(st);
          const first = !LS.store.progressOf(u2, langId).done.includes(node2.id);
          const gs = gearStatsOf(u2, langId);
          const reward = LS.battleReward ? LS.battleReward(u2, node2, chapterIndex) : { xp: node2.xp || 0, coins: 0 };
          let lootItem = null;
          let unlocked = [];
          let xpGain = 0, coinGain = 0;
          const bossFight = !!node2.boss || !!(node2.enemy && node2.enemy.boss);
          if (first) {
            xpGain = Math.round(reward.xp * (1 + (gs.xp || 0) / 100));
            coinGain = Math.round(reward.coins * (1 + (gs.coin || 0) / 100));
            LS.store.markDone(u2, langId, node2.id);
            LS.store.addXp(u2, xpGain);
            LS.store.addCoins(u2, coinGain, 'battle');
            u2.stats.battlesWon = (u2.stats.battlesWon || 0) + 1;
            if (!st.failCount && !st.hintsUsed) u2.stats.perfectWins = (u2.stats.perfectWins || 0) + 1;
            const p = LS.store.progressOf(u2, langId);
            if (!p.wins.includes(node2.id)) p.wins.push(node2.id);
            if (bossFight && !st.hintsUsed) u2.stats.bossNoHint = (u2.stats.bossNoHint || 0) + 1;
            const loot = LS.rebalanceLoot
              ? LS.rebalanceLoot(node2, langId, chapterIndex, {
                first: true, boss: bossFight,
                bigBoss: !!wv.bigBoss, fortune: gs.luck || 0
              })
              : node2.loot;
            lootItem = loot ? LS.store.addEquipment(u2, loot) : null;
            if (!lootItem && loot) lootItem = loot;
            if (LS.daily) {
              LS.daily.record(u2, 'battle_win', 1, { hintsUsed: st.hintsUsed, failCount: st.failCount });
              LS.daily.record(u2, 'node', 1);
              if (bossFight) LS.daily.record(u2, 'boss', 1);
            }
            LS.store.save();
            unlocked = LS.syncTitles(u2);
          } else {
            // 重战：给少量经验与星辉，但不再掉落首通装备。
            xpGain = Math.max(10, Math.round(reward.xp * .35 * (1 + (gs.xp || 0) / 100)));
            coinGain = Math.max(8, Math.round(reward.coins * .4 * (1 + (gs.coin || 0) / 100)));
            LS.store.addXp(u2, xpGain);
            LS.store.addCoins(u2, coinGain, 'replay');
            if (LS.daily) LS.daily.record(u2, 'battle_win', 1, { hintsUsed: st.hintsUsed, failCount: st.failCount });
            LS.store.save();
          }
          st.victoryInfo = { first, lootItem, unlocked, xp: xpGain, coins: coinGain, chapterIndex, mana: 0 };
          if (first && LS.isFinalBossNode(node2, langId)) {
            if (!u2.forgeClaims || typeof u2.forgeClaims !== 'object') u2.forgeClaims = { boss: [], full: [], stage3: [], bought: 0 };
            if (!Array.isArray(u2.forgeClaims.boss)) u2.forgeClaims.boss = [];
            if (!u2.forgeClaims.boss.includes(langId)) u2.forgeClaims.boss.push(langId);
            LS.store.addMaterial(u2, 'mana', 1);
            st.victoryInfo.mana = 1;
          }
          clearBattle(u2, langId, node2.id);
        }

        function openVictory() {
          if (!isLive()) return;
          const info = st.victoryInfo || { first: false, lootItem: null, unlocked: [] };
          const lootItem = info.lootItem;
          const lq = lootItem ? LS.itemQuality(lootItem) : null;
          const nx = nextHref(langId, node2.id);
          const nextNodeId = LS.nextNodeId(langId, node2.id);
          const nxHit = nextNodeId ? LS.findNode(langId, nextNodeId) : null;

          LS.confetti({ colors: ['#e6c98d', '#f0e3c8', '#8b3a4a', '#4f8c80', '#c9a45c'] });
          LS.openModal(`<div class="modal-head"><div><div class="kicker-jp">VICTORY · 試煉突破</div><h2 class="title-lg" style="margin-top:6px">${info.first ? '试炼通过' : '再次通过'} · ${LS.esc(waveNow(st).name)}</h2><p class="muted small" style="margin-top:6px">${waveNow(st).bigBoss ? '大 BOSS 倒下了。这一章的知识已经被你真正使用过。' : '最后一只敌人倒下，终端记下了这次完整的攻防。'}</p></div><button class="modal-close" data-close>✕</button></div>
            <div class="victory-art">${LS.enemyImg(waveNow(st).kind, { boss: !!waveNow(st).boss }, 110)}</div>
            ${lootItem ? `<div class="loot-reveal" style="--q-color:${lq.color}"><div class="lr-glow"></div><span class="lr-icon">${LS.esc(lootItem.icon)}</span><div><div class="kicker-jp">LOOT · ${lq.jp}</div><b>${LS.esc(lootItem.name)}</b><p>${LS.esc(lootItem.lore)}</p></div><span class="chip ${lq.infused ? 'q-infused' : ''}" style="color:${lq.color};border-color:${lq.color}">${lq.name}</span></div>` : `<p class="small muted">${info.first ? '首领没有留下新的装备。' : '（重战不重复发放奖励）'}</p>`}
            ${info.mana ? `<div class="loot-reveal mana-reveal" style="--q-color:#ff6ec7"><div class="lr-glow"></div><span class="lr-icon lr-mana"><img src="${LS.material('mana').icon}?v=20261109Z" alt="魔能石"></span><div><div class="kicker-jp">RARE · 終焉結晶</div><b>魔能石 × 1</b><p>终焉首领消散后留下的源初结晶。可前往锻造台，为源初装备注入魔能。</p></div><span class="chip" style="color:#ff6ec7;border-color:#ff6ec7">极稀有</span></div>` : ''}
            <div class="victory-outro paper"><p>${LS.esc(node2.outro || '终端安静下来。下一段星轨已经在远处亮起。')}</p></div>
            <div class="victory-stats"><span>击破 ${plan.waves.length} 波</span><span>本战 ${plan.totalHits} 问</span><span>失误 ${st.failCount} 次</span><span>剩余 HP ${Math.max(0, st.playerHp)}</span><span class="vs-xp">+${info.xp || 0} 经验</span><span class="vs-coin">+${info.coins || 0} 星辉</span></div>
            ${info.unlocked && info.unlocked.length ? `<div class="new-titles">${info.unlocked.map(t => `<span class="title-chip q-${t.quality}">${t.icon} ${LS.esc(t.name)}</span>`).join('')}</div>` : ''}
            <div class="modal-actions">
              <button class="btn btn-ghost" id="v-rematch">再次挑战</button>
              ${nxHit ? `<a class="btn" href="${nx}" data-close>前往下一节点 ${LS.icon('arrow', 13)}</a>` : `<a class="btn" href="#/world/${langId}" data-close>返回星轨 ${LS.icon('arrow', 13)}</a>`}
            </div>`, {
            wide: true,
            mount(m, overlay) {
              const b = m.querySelector('#v-rematch');
              if (b) b.addEventListener('click', () => { LS.closeModal(overlay); rematch(); });
            }
          });
        }

        function attack() {
          if (!api) return;
          if (st.attackLock || st.dead) return;
          if (st.won) { LS.toast('试炼已经通过', '可以点「再次挑战」重新打一遍。', 'gold', 'check'); return; }
          api.closeAc();
          st.code = api.value;
          saveCode(u2, langId, node2.id, st.qIndex, st.code);
          const q = qNow(st);
          const w = waveNow(st);
          const res = LS.microrun.run(st.code, langId);
          const actual = LS.normalizeOut(res.output);
          const expected = LS.normalizeOut(q.expected);
          let mustOk = true;
          if (q.must && q.must.re) {
            try { mustOk = new RegExp(q.must.re, 'm').test(st.code); } catch (e) { mustOk = true; }
          }
          u2.stats.codeRuns = (u2.stats.codeRuns || 0) + 1;
          if (LS.daily) LS.daily.record(u2, 'run', 1);
          LS.store.save();

          if (!res.ok || actual !== expected || !mustOk) {
            const info = failureInfo(langId, q, res, mustOk, st.code);
            const rawDmg = counterOf(u2, w, langId);
            const guarded = (st.guardLeft || 0) > 0;
            const dmg = guarded ? 0 : rawDmg;
            if (guarded) st.guardLeft = Math.max(0, (st.guardLeft || 0) - 1);
            st.failCount++;
            st.failByQ[q.qIndex] = (Number(st.failByQ[q.qIndex]) || 0) + 1;
            st.playerHp = Math.max(0, st.playerHp - dmg);
            st.dead = st.playerHp <= 0;
            st.silenced = false;
            st.attackLock = true;
            st.term = {
              kind: 'fail',
              output: res.output,
              error: res.error,
              en: info.en,
              zh: info.zh,
              raw: info.raw,
              expected: q.expected,
              actual: res.output,
              diff: firstDiff(expected, actual),
              damage: dmg,
              guarded,
              qIndex: st.qIndex
            };
            saveBattle(u2, langId, node2.id, st);
            updateTerminal(root);
            updateTaskCard(root);
            updateHints(root);
            updateFooter(root);
            paintSilence(root);
            setPlayerExpr('hurt');
            setFx('enemy-charge');
            setTimeout(() => {
              if (!isLive()) return;
              setFx('hurt');
              paintPlayerHp(root);
            }, 520);
            setTimeout(() => {
              if (!isLive()) return;
              st.attackLock = false;
              setPlayerExpr('normal');
              setFx('');
              updateFooter(root);
              if (st.dead) openDefeat();
              else if (api) api.focus();
            }, 1960);
            return;
          }

          // 命中：输出与预期一致。攻击力提升单次伤害，强装可以提前击破。
          const atk = gearStatsOf(u2, langId).atk || 0;
          const dealt = 100 + atk;
          const wi = q.waveIndex;
          st.waveHp[wi] = Math.max(0, waveHpOf(st, wi) - dealt);
          const killed = st.waveHp[wi] <= 0;
          const isFinalWave = wi >= plan.waves.length - 1;
          st.silenced = true;
          st.attackLock = true;
          st.term = { kind: 'ok', output: res.output, damage: dealt, killed, qIndex: st.qIndex };
          if (LS.daily) LS.daily.record(u2, 'correct', 1);
          saveBattle(u2, langId, node2.id, st);
          updateTerminal(root);
          updateHints(root);
          updateFooter(root);
          paintSilence(root);
          setPlayerExpr('attack');
          setFx('charge');

          setTimeout(() => {
            if (!isLive()) return;
            setFx('attack');
          }, 150);

          setTimeout(() => {
            if (!isLive()) return;
            setFx('hit');
            mangaCut(false);
            burstParticles(root, langId, 'hit');
            paintEnemyHp(root);
            setPlayerExpr('smile');
          }, 620);

          if (killed && isFinalWave) {
            setTimeout(() => {
              if (!isLive()) return;
              setFx('kill');
              mangaCut(true);
              burstParticles(root, langId, 'kill');
              setPlayerExpr('win');
              paintEnemyHp(root);
              recordVictory();
              updateTop(root);
              updateFooter(root);
              updateTaskCard(root);
              setTimeout(() => { if (isLive()) openVictory(); }, 1150);
            }, 1150);
          } else if (killed) {
            const nextIdx = plan.questions.findIndex(x => x.waveIndex === wi + 1);
            setTimeout(() => {
              if (!isLive()) return;
              setFx('kill');
              mangaCut(true);
              burstParticles(root, langId, 'kill');
              setPlayerExpr('win');
              paintEnemyHp(root);
              setTimeout(() => {
                if (!isLive()) return;
                advanceQuestion(root, nextIdx < 0 ? st.qIndex + 1 : nextIdx, true);
                LS.toast('敌人倒下', '下一只影兽挡住了去路。', 'gold', 'sword');
              }, 950);
            }, 1150);
          } else {
            setTimeout(() => {
              if (!isLive()) return;
              advanceQuestion(root, st.qIndex + 1, false);
              const left = hitsLeft(st);
              LS.toast('敌人被沉默', left > 0
                ? '继续进攻：这只还剩 ' + left + ' 击。'
                : '这一只已经倒下，下一只正在靠近。', 'gold', 'shield');
            }, 1550);
          }
        }

        // 编辑器：高亮、缩进线、自动缩进、补全，Ctrl+Enter 直接攻击。
        if (LS.CodeEditor) {
          api = LS.CodeEditor.create(editorMount, {
            lang: langId,
            value: st.code,
            title: lang.name + ' · main',
            aria: '战斗代码编辑器',
            onChange(code) {
              st.code = code;
              saveCode(u2, langId, node2.id, st.qIndex, code);
            },
            onSubmit() { attack(); }
          });
        } else {
          editorMount.innerHTML = '<textarea class="code-editor" id="fallback-editor" spellcheck="false"></textarea>';
          const ta = editorMount.querySelector('#fallback-editor');
          ta.value = st.code;
          ta.addEventListener('input', () => {
            st.code = ta.value;
            saveCode(u2, langId, node2.id, st.qIndex, st.code);
          });
          api = {
            get value() { return ta.value; },
            setValue(v) { ta.value = v; },
            focus() { ta.focus(); },
            closeAc() { },
            insert(t) { ta.setRangeText(t, ta.selectionStart, ta.selectionEnd, 'end'); }
          };
        }

        root.addEventListener('click', ev => {
          const btn = ev.target.closest('button');
          if (!btn) return;
          if (btn.id === 'attack-btn') { ev.preventDefault(); attack(); }
          else if (btn.id === 'clear-btn') { ev.preventDefault(); clearCode(); }
          else if (btn.id === 'hint-btn') { ev.preventDefault(); showHint(); }
          else if (btn.id === 'solution-btn') { ev.preventDefault(); showSolution(); }
          else if (btn.id === 'rematch-btn') { ev.preventDefault(); rematch(); }
        });

        updateFooter(root);
        paintSilence(root);

        if (st.resumed && !st.dead) {
          LS.toast('战斗记录已恢复', '生命值、失误次数与题目进度都从本机存档继续，不能靠离开页面重置。', 'gold', 'shield');
          st.resumed = false;
        }

        if (st.dead) {
          setTimeout(() => { if (isLive()) openDefeat(); }, 180);
        } else if (window.innerWidth >= 900) {
          setTimeout(() => { if (isLive() && api) api.focus(); }, 80);
        }

        // 战前对话：只在全新战斗、第一题、没有失误时播放一次。
        const untouched = !st.replay && st.qIndex === 0 && st.failCount === 0 &&
          st.playerHp === st.playerMax && !st.dead && !st.won;
        const k = keyOf(u2, langId, node2.id);
        if (!introPlayed[k] && !introSeen(k) && untouched) {
          introPlayed[k] = true;
          markIntroSeen(k);
          setTimeout(() => {
            if (!isLive()) return;
            LS.dialogue({
              title: node2.title,
              jp: node2.boss ? '決戦前' : '遭遇',
              langId,
              enemy: node2.enemy,
              lines: LS.battleBanter(u2, langId, node2)
            });
          }, 260);
        }
      }
    };
  }

  LS.Views.battle = { html };
})(window.LS);
