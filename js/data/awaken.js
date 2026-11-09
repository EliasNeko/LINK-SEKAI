/* 职业觉醒：基础数值 + 三个阶段加成（低 → 高，逐阶累计）。
   数值直接进入战斗公式：
     伤害 = 100 + 攻击
     生命上限 = 100 + 防御×0.9 + 生命
     反击伤害 = 敌方伤害 × 100 / (100 + 防御)
   提示 / 残影 / 护盾为功能次数，与装备叠加后仍有总上限。 */
(function (LS) {
  'use strict';

  const KEYS = ['atk', 'def', 'hp', 'hint', 'ghost', 'guard'];
  const LABEL = { atk: '攻击', def: '防御', hp: '生命', hint: '提示', ghost: '残影', guard: '护盾' };
  const UNIT = { hint: ' 条', ghost: ' 行', guard: ' 次' };
  const DESC = {
    atk: '每次答对造成的伤害为 100 + 攻击。攻击越高，击破一波敌人所需答对的次数越少。',
    def: '降低答错时敌人的反击伤害，同时提高生命上限。防御是长线作战最重要的属性。',
    hp: '直接增加生命上限。生命归零会判负，高生命可以多承受几次失误。',
    hint: '战斗中每道题可额外查看的提示条数。提示会直接指出解题方向。',
    ghost: '在编辑器上方浮现下一段参考代码的残影，适合卡住时寻找思路。',
    guard: '每场战斗开局获得 N 次失误护盾：护盾未耗尽时，答错不受到反击伤害。'
  };

  /* 职业基础数值：六职业的定位差异从这里开始。 */
  const BASE = {
    python:     { atk: 5, def: 2, hp: 0,  hint: 0, ghost: 1, guard: 0 },
    java:       { atk: 4, def: 4, hp: 4,  hint: 1, ghost: 0, guard: 0 },
    c:          { atk: 2, def: 6, hp: 12, hint: 1, ghost: 0, guard: 0 },
    javascript: { atk: 3, def: 5, hp: 8,  hint: 0, ghost: 0, guard: 0 },
    cpp:        { atk: 5, def: 4, hp: 6,  hint: 0, ghost: 0, guard: 0 },
    go:         { atk: 4, def: 3, hp: 4,  hint: 0, ghost: 1, guard: 0 }
  };

  /* 阶段加成（累计值，不是增量）：索引 0 永远为空，阶段 1–3 逐级抬升。 */
  const BONUS = {
    python: [
      null,
      { atk: 8,  def: 2,  hp: 4,  hint: 1, ghost: 1, guard: 0 },
      { atk: 17, def: 5,  hp: 11, hint: 1, ghost: 2, guard: 1 },
      { atk: 29, def: 9,  hp: 21, hint: 2, ghost: 3, guard: 1 }
    ],
    java: [
      null,
      { atk: 6,  def: 4,  hp: 8,  hint: 1, ghost: 0, guard: 0 },
      { atk: 12, def: 8,  hp: 18, hint: 2, ghost: 1, guard: 1 },
      { atk: 20, def: 14, hp: 31, hint: 3, ghost: 1, guard: 1 }
    ],
    c: [
      null,
      { atk: 3,  def: 5,  hp: 18, hint: 1, ghost: 0, guard: 0 },
      { atk: 8,  def: 10, hp: 32, hint: 2, ghost: 0, guard: 1 },
      { atk: 14, def: 17, hp: 51, hint: 3, ghost: 1, guard: 2 }
    ],
    javascript: [
      null,
      { atk: 5,  def: 5,  hp: 12, hint: 0, ghost: 0, guard: 1 },
      { atk: 11, def: 10, hp: 24, hint: 1, ghost: 1, guard: 2 },
      { atk: 19, def: 17, hp: 39, hint: 2, ghost: 1, guard: 3 }
    ],
    cpp: [
      null,
      { atk: 7,  def: 4,  hp: 8,  hint: 0, ghost: 0, guard: 0 },
      { atk: 14, def: 9,  hp: 19, hint: 1, ghost: 1, guard: 1 },
      { atk: 23, def: 15, hp: 32, hint: 2, ghost: 1, guard: 2 }
    ],
    go: [
      null,
      { atk: 6,  def: 3,  hp: 6,  hint: 0, ghost: 1, guard: 0 },
      { atk: 13, def: 7,  hp: 15, hint: 1, ghost: 2, guard: 1 },
      { atk: 22, def: 11, hp: 27, hint: 2, ghost: 3, guard: 1 }
    ]
  };

  function zero() {
    const z = {};
    KEYS.forEach(k => { z[k] = 0; });
    return z;
  }
  function clampStage(stage) { return Math.max(0, Math.min(3, Math.round(Number(stage) || 0))); }
  function langIdOf(v) {
    if (v && typeof v === 'object') return v.langId || v.primaryLang || 'python';
    return BASE[v] ? v : 'python';
  }
  function stageOfUser(user, langId) {
    if (!user) return 0;
    if (LS.stageOf) return clampStage(LS.stageOf(user, langId));
    if (LS.proficiency) return clampStage(LS.proficiency(user, langId).stage);
    return 0;
  }

  const awaken = LS.awaken = {
    KEYS, LABEL, UNIT, DESC, BASE, BONUS,
    stageOf: stageOfUser,
    baseOf(langId) {
      const b = BASE[langIdOf(langId)] || BASE.python;
      return Object.assign(zero(), b);
    },
    bonusOf(langId, stage) {
      const s = clampStage(stage);
      const list = BONUS[langIdOf(langId)] || BONUS.python;
      return Object.assign(zero(), s > 0 ? list[s] : null);
    },
    totalOf(langId, stage) {
      const b = this.baseOf(langId);
      const s = this.bonusOf(langId, stage);
      KEYS.forEach(k => { b[k] = (b[k] || 0) + (s[k] || 0); });
      return b;
    },
    forUser(user, langId) {
      const stage = stageOfUser(user, langId);
      return {
        langId: langIdOf(langId),
        stage,
        base: this.baseOf(langId),
        bonus: this.bonusOf(langId, stage),
        total: this.totalOf(langId, stage)
      };
    },
    hintOf(user, langId) {
      return Math.max(0, this.forUser(user, langId).total.hint || 0);
    },
    combatOf(user, langId) {
      const out = this.totalOf(langId, stageOfUser(user, langId));
      const gear = LS.store && LS.store.gearStats ? LS.store.gearStats(user, langId) : zero();
      KEYS.forEach(k => { out[k] = (out[k] || 0) + (Number(gear[k]) || 0); });
      /* 功能次数与装备总上限保持一致。 */
      out.hint = Math.min(8, out.hint || 0);
      out.ghost = Math.min(6, out.ghost || 0);
      out.guard = Math.min(8, out.guard || 0);
      return out;
    },
    /* 档案 / 熟练度里的一行数值摘要。 */
    line(stats, keys, opts) {
      opts = opts || {};
      const list = keys || ['atk', 'def', 'hp', 'hint', 'ghost', 'guard'];
      const parts = list.filter(k => (stats[k] || 0) > 0).map(k =>
        `<span class="awk-stat"><em>${LABEL[k]}</em><b>+${stats[k] || 0}${UNIT[k] || ''}</b></span>`);
      if (!parts.length) return '<span class="awk-stat off"><em>基础</em><b>无额外加成</b></span>';
      return parts.join('');
    },
    infoHTML(user, langId) {
      const lang = (LS.lang && LS.lang(langId)) || { name: '职业', profession: '旅人', color: '#c9a45c' };
      const meta = LS.heroMeta ? LS.heroMeta(langId) : { name: '守护者', title: '旅人' };
      const cur = this.forUser(user, langId);
      const gear = LS.store && LS.store.gearStats ? LS.store.gearStats(user, langId) : zero();
      const combat = this.combatOf(user, langId);
      const stageDef = (LS.PROF_STAGES && LS.PROF_STAGES[cur.stage]) || { name: '默认形象', jp: '初期' };
      const rows = KEYS.map(k => {
        const total = (cur.total[k] || 0) + (gear[k] || 0);
        return `<div class="awk-desc-row">
          <div class="awk-desc-head"><span>${LABEL[k]}</span><b>${total}${UNIT[k] || ''}</b></div>
          <p>${DESC[k]}</p>
          <div class="awk-desc-num">职业基础 ${cur.base[k] || 0} ＋ 觉醒 ${cur.bonus[k] || 0} ＋ 装备 ${gear[k] || 0}</div>
        </div>`;
      }).join('');
      return `<div class="awk-info" style="--lang-color:${lang.color}">
        <div class="awk-info-hero">
          <div class="awk-info-art">${LS.heroImg ? LS.heroImg(langId, 190, 'awk-info-img', meta.title, 'idle', cur.stage) : ''}</div>
          <div class="awk-info-copy">
            <span class="kicker-jp">${LS.esc(lang.professionJp || '覚醒')} · ${LS.esc(lang.name)}</span>
            <h3>${LS.esc(meta.name)} <em>${LS.esc(lang.profession)}</em></h3>
            <div class="awk-info-chips">
              <span class="chip" style="color:${lang.color};border-color:${lang.color}">${LS.esc(stageDef.name)}</span>
              <span class="chip">熟练度 ${LS.proficiency ? LS.proficiency(user, langId).score : 0} / 1000</span>
            </div>
            <p>当前阶段的总加成为“职业基础 + 觉醒阶段 + 装备”三者相加。敌方波次按 100 生命一格计算，伤害越高，越少答错就能击破。</p>
            <div class="awk-total-line">${this.line(combat)}</div>
          </div>
        </div>
        <div class="awk-formula">
          <div><span>攻击伤害</span><b>100 + ${combat.atk || 0} = ${100 + (combat.atk || 0)}</b></div>
          <div><span>生命上限</span><b>100 + ${Math.round((combat.def || 0) * .9)} + ${cur.total.hp || 0} = ${100 + Math.round((combat.def || 0) * .9) + (cur.total.hp || 0)}</b></div>
          <div><span>每场提示</span><b>1 + ${combat.hint || 0} 条</b></div>
          <div><span>失误护盾</span><b>${combat.guard || 0} 次</b></div>
        </div>
        <div class="awk-desc-list">${rows}</div>
        <p class="awk-foot-note">阶段加成在熟练度达到 300 / 600 / 850 时自动生效，不需要手动领取；战斗、档案与熟练度页显示的是同一套数值。</p>
      </div>`;
    },
    openInfo(user, langId) {
      const lang = (LS.lang && LS.lang(langId)) || { name: '职业' };
      LS.openModal(LS.modalHead('AWAKENED · ' + (LS.esc(lang.name) || ''), '觉醒数值说明', '从职业基础到第三阶段，所有加成如何影响战斗。') + this.infoHTML(user, langId)
        + '<div class="modal-actions"><button class="btn btn-ghost" data-close>明白了</button></div>', { wide: true, className: 'awk-modal dark' });
    },
    /* 黑色剪影预览：四张阶段立绘统一压成纯黑，浅色月面背景保证轮廓清楚。 */
    previewHTML(user, langId) {
      const lang = (LS.lang && LS.lang(langId)) || { name: '职业', color: '#c9a45c' };
      const meta = LS.heroMeta ? LS.heroMeta(langId) : { name: '守护者', title: '旅人' };
      const curStage = stageOfUser(user, langId);
      const prof = LS.proficiency ? LS.proficiency(user, langId) : { score: 0 };
      const cards = [0, 1, 2, 3].map(s => {
        const def = (LS.PROF_STAGES && LS.PROF_STAGES[s]) || { name: '阶段 ' + s, jp: '覚醒', min: 0, note: '' };
        const on = curStage >= s;
        return `<button class="sil-card ${s === curStage ? 'now' : ''} ${on ? 'on' : 'locked'}" data-sil-stage="${s}">
          <span class="sil-art">${LS.heroImg ? LS.heroImg(langId, 168, 'sil-img', meta.title, 'idle', s) : ''}<i class="sil-shade"></i></span>
          <span class="sil-copy"><b>${LS.esc(def.name)}</b><em>${LS.esc(def.jp)} · ${s === 0 ? '0' : def.min} 熟练度</em></span>
          <span class="sil-state">${on ? (s === curStage ? '当前阶段' : '已解锁') : '未解锁 · 剪影预览'}</span>
        </button>`;
      }).join('');
      const big = (s) => {
        const def = (LS.PROF_STAGES && LS.PROF_STAGES[s]) || { name: '阶段 ' + s, jp: '覚醒', min: 0, note: '' };
        return `<div class="sil-big-art">${LS.heroImg ? LS.heroImg(langId, 430, 'sil-big-img', meta.title, 'idle', s) : ''}<i class="sil-shade"></i><span class="sil-big-moon"></span></div>
          <div class="sil-big-copy"><span class="kicker-jp">SILHOUETTE · ${LS.esc(def.jp)}</span><h3>${LS.esc(def.name)}</h3><p>${LS.esc(def.note || '')}</p><div class="sil-big-stage">${s === 0 ? '初始' : '阶段 ' + s} · ${s === 0 ? 0 : def.min} 熟练度</div></div>`;
      };
      return `<div class="sil-preview" style="--lang-color:${lang.color}" data-sil-current="${curStage}">
        <p class="sil-intro">所有阶段都以纯黑剪影呈现，只保留轮廓与光边。达到对应熟练度后，阶段立绘会在档案与战斗中真正点亮。</p>
        <div class="sil-layout">
          <div class="sil-big" data-sil-big>${big(curStage)}</div>
          <div class="sil-list">${cards}</div>
        </div>
        <div class="sil-meta"><span>当前熟练度 <b>${prof.score}</b> / 1000</span><span>${LS.esc(meta.title)} · ${LS.esc(lang.profession || '')}</span></div>
        <p class="awk-foot-note">一阶沿用初始轮廓；二阶、三阶为专属觉醒立绘。剪影仅用于预览，不会替换当前形象。</p>
      </div>`;
    },
    openPreview(user, langId) {
      const lang = (LS.lang && LS.lang(langId)) || { name: '职业' };
      const ov = LS.openModal(LS.modalHead('SILHOUETTE · ' + (LS.esc(lang.name) || ''), '阶段剪影预览', '点击左侧阶段卡，查看该阶段的全黑剪影。') + this.previewHTML(user, langId)
        + '<div class="modal-actions"><button class="btn btn-ghost" data-close>关闭预览</button></div>', {
        wide: true,
        className: 'sil-modal dark',
        mount(m) {
          const cur = Number(m.querySelector('.sil-preview').dataset.silCurrent) || 0;
          let shown = cur;
          function paint(s) {
            shown = s;
            m.querySelectorAll('[data-sil-stage]').forEach(b => b.classList.toggle('viewing', Number(b.dataset.silStage) === s));
            const big = m.querySelector('[data-sil-big]');
            const lang = (LS.lang && LS.lang(langId)) || { name: '职业' };
            const meta = LS.heroMeta ? LS.heroMeta(langId) : { name: '守护者', title: '旅人' };
            const def = (LS.PROF_STAGES && LS.PROF_STAGES[s]) || { name: '阶段 ' + s, jp: '覚醒', min: 0, note: '' };
            big.innerHTML = `<div class="sil-big-art">${LS.heroImg ? LS.heroImg(langId, 430, 'sil-big-img', meta.title, 'idle', s) : ''}<i class="sil-shade"></i><span class="sil-big-moon"></span></div>
              <div class="sil-big-copy"><span class="kicker-jp">SILHOUETTE · ${LS.esc(def.jp)}</span><h3>${LS.esc(def.name)}</h3><p>${LS.esc(def.note || '')}</p><div class="sil-big-stage">${s === 0 ? '初始' : '阶段 ' + s} · ${s === 0 ? 0 : def.min} 熟练度</div></div>`;
          }
          m.querySelectorAll('[data-sil-stage]').forEach(b => b.addEventListener('click', () => paint(Number(b.dataset.silStage))));
          paint(cur);
        }
      });
      return ov;
    }
  };

  LS.awakenStatKeys = KEYS;
})(window.LS);
