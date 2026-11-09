/* 新手星门：选语言、造像素旅人、刻下名字 */
(function (LS) {
  'use strict';

  LS.Views = LS.Views || {};


  let state = null;

  function initState(user) {
    const preset = (user.activeLangs || []).slice(0, 2);
    const known = JSON.parse(JSON.stringify(user.char || (preset[0] ? LS.defaultChar(preset[0]) : LS.defaultChar('python'))));
    state = {
      step: preset.length ? 2 : 1,
      langs: preset,
      primary: preset[0] || null,
      char: LS.normalizeChar(known),
      gameName: user.gameName || '',
      avatar: user.avatar || null
    };
  }

  function steps() {
    const names = [['01', '选择星轨'], ['02', '刻下名字']];
    return `<div class="steps">${names.map((n, i) => `<div class="step-dot ${state.step === i + 1 ? 'active' : state.step > i + 1 ? 'done' : ''}"><i>${state.step > i + 1 ? '✓' : n[0]}</i><span>${n[1]}</span></div>${i < 1 ? '<div class="step-line"></div>' : ''}`).join('')}</div>`;
  }

  function html() {
    const u = LS.store.current();
    if (!u) return '';
    if (!state || state.__uid !== u.uid) { initState(u); state.__uid = u.uid; }
    return `<div class="onboard-shell">
      <div class="onboard-top">
        <div class="brand"><div class="brand-mark">L</div><div class="brand-text"><b>LINK-SEKAI</b><span>星印铸造 · STAR FORGE</span></div></div>
        ${steps()}
        <div class="chip chip-gold">旅人 ${LS.esc(u.uid)}</div>
      </div>
      <div class="onboard-body" id="onboard-body">${stepHTML()}</div>
      <div class="onboard-foot" id="onboard-foot"></div>
    </div>`;
  }

  function stepHTML() {
    if (state.step === 1) return stepLangs();
    return stepFinish(); /* 自设形象铸造步骤已废弃：职业英雄随语言自动获得 */
  }

  function stepLangs() {
    return `<div class="onboard-head fade-up">
        <div class="kicker-jp">第一幕 · 星軌を選ぶ</div>
        <h1>选择你要走的星轨</h1>
        <p>最多选择两门语言。别急着贪多——先把一门走到 50%，星门才会为你打开下一卷。每一步都算数。</p>
      </div>
      <div class="choose-grid">${LS.LANGS.map(l => {
        const on = state.langs.includes(l.id);
        return `<button class="lang-choice ${on ? 'selected' : ''}" data-lang="${l.id}" style="--lang-color:${l.color}">
          <div class="choice-top">
            <div class="lang-sigil">${LS.esc(l.sigil)}</div>
            <div class="sel-mark">${on ? '✓' : ''}</div>
          </div>
          <h3>${LS.esc(l.name)}</h3>
          <div class="profession">${LS.esc(l.profession)} · ${LS.esc(l.professionJp)}</div>
          <p>${LS.esc(l.tagline)}</p>
          <div class="choice-meta">
            <div class="difficulty">${[1, 2, 3].map(i => `<i class="${i <= l.difficulty ? 'on' : ''}"></i>`).join('')}</div>
            <span class="tiny faint">${['入门', '进阶', '纵深'][l.difficulty - 1] || '入门'}</span>
          </div>
          <div class="pixel-wrap">${LS.charImg(LS.defaultChar(l.id), 86)}</div>
        </button>`;
      }).join('')}</div>
      <div class="onboard-foot">
        <span class="tiny faint">已选择 <b class="gold" id="lang-count">${state.langs.length}</b> / 2</span>
        <button class="btn btn-lg" id="to-creator" ${state.langs.length ? '' : 'disabled'}>进入铸造工坊 ${LS.icon('arrow', 15)}</button>
      </div>`;
  }

function stepFinish() {
    const langs = state.langs.map(id => LS.lang(id)).filter(Boolean);
    return `<div class="onboard-head fade-up">
        <div class="kicker-jp">第三幕 · 名を刻む</div>
        <h1>为旅人刻下名字</h1>
        <p>名字会出现在星网好友、战斗对话与旅人档案中。你也可以跳过头像，之后再上传。</p>
      </div>
      <div class="finish-layout fade-up">
        <div class="finish-card paper corner-mark">
          <div class="finish-avatar">
            <label class="avatar-upload" id="avatar-drop">
              ${state.avatar ? `<img src="${state.avatar}" alt="头像">` : LS.charImg(state.char, 128)}
              <input type="file" id="avatar-file" accept="image/*">
            </label>
            <div class="upload-hint">点击上传头像 · 会自动裁成方形<br>职业形象将随你的主星轨自动授予</div>
            <div class="ornament-divider"><span>STAR FORGE</span></div>
            <div class="center">
              <div class="kicker-jp">${LS.esc(langs[0] ? langs[0].professionJp : '')}</div>
              <div style="font-family:var(--font-serif);font-size:16px;margin-top:5px">${LS.esc(state.gameName || '未命名旅人')}</div>
              <div class="tiny faint" style="margin-top:4px">${LS.esc(langs.map(l => l.name).join(' · '))}</div>
            </div>
          </div>
        </div>
        <div class="finish-card paper corner-mark">
          <div class="auth-card-head" style="text-align:left;margin-bottom:18px">
            <div class="kicker-jp">BEGINNING · 序章</div>
            <h2 style="font-size:24px">星印确认</h2>
          </div>
          <div class="finish-form">
            <div class="field">
              <label>游戏昵称（1–12 字）</label>
              <input class="input" id="finish-name" maxlength="12" value="${LS.esc(state.gameName)}" placeholder="例如 星野·澪">
            </div>
            <div class="summary-list">
              <div class="summary-row"><span>旅人编号</span><b>${LS.esc(LS.store.current().uid)}</b></div>
              <div class="summary-row"><span>初始星轨</span><b>${LS.esc(langs.map(l => l.name).join(' / '))}</b></div>
              <div class="summary-row"><span>职业</span><b>${LS.esc(langs.map(l => l.profession).join(' / '))}</b></div>
              <div class="summary-row"><span>起始灵感</span><b>3 点</b></div>
            </div>
            <div class="auth-note"><span class="dot"></span><span>进入后，你可以在「旅人档案」中更换头像、昵称与称号。职业形象由主星轨对应的守护者固定授予，不可自设。额外语言的解锁条件：任意已学语言达到 50%。</span></div>
            <button class="btn btn-lg btn-block" id="begin-journey">推开第一扇门 ${LS.icon('spark', 15)}</button>
            <button class="btn btn-ghost btn-sm btn-block" id="back-langs">返回重选星轨</button>
          </div>
        </div>
      </div>`;
  }

  function bind(root) {
    const body = root.querySelector('#onboard-body');
    const foot = root.querySelector('#onboard-foot');
    if (!body) return;

    if (state.step === 1) {
      body.querySelectorAll('[data-lang]').forEach(card => card.addEventListener('click', () => {
        const id = card.dataset.lang;
        if (state.langs.includes(id)) {
          state.langs = state.langs.filter(x => x !== id);
        } else {
          if (state.langs.length >= 2) { LS.toast('最多两门语言', '先把两门学起来，星轨才不会互相抢走注意力。', 'gold'); return; }
          state.langs.push(id);
        }
        if (!state.primary && state.langs.length) state.primary = state.langs[0];
        rerender();
      }));
      const toCreator = body.querySelector('#to-creator');
      if (toCreator) toCreator.addEventListener('click', () => {
        if (!state.langs.length) return;
        state.primary = state.langs[0];
        state.char = LS.defaultChar(state.primary, state.char && state.char.gender);
        state.step = 2; /* 直接触达名字确认步（形象编辑已废弃） */
        rerender();
      });
    }

    if (state.step === 2) {
      const nameEl = body.querySelector('#finish-name');
      if (nameEl) {
        nameEl.value = state.gameName;
        nameEl.addEventListener('input', () => { state.gameName = nameEl.value; });
      }
      const file = body.querySelector('#avatar-file');
      if (file) file.addEventListener('change', async e => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        try {
          state.avatar = await LS.readAvatar(f);
          rerender();
          LS.toast('头像已载入', '已裁成方形并压缩保存。', 'gold', 'camera');
        } catch (err) { LS.toast('头像读取失败', err.message, 'red'); }
      });
      const back = root.querySelector('#back-langs');
      if (back) back.addEventListener('click', () => { state.step = 1; rerender(); });
      const begin = root.querySelector('#begin-journey');
      if (begin) begin.addEventListener('click', () => {
        const name = String(state.gameName || '').trim();
        if (!name || name.length > 12) { LS.toast('昵称不合法', '请输入 1–12 个字符。', 'red'); return; }
        const u = LS.store.current();
        u.gameName = name;
        u.avatar = state.avatar;
        u.char = Object.assign({}, state.char, { langId: state.primary });
        u.activeLangs = state.langs.slice();
        u.primaryLang = state.primary;
        u.onboardingDone = true;
        u.tutorialDone = false;
        if (!u.inspiration) u.inspiration = 3;
        LS.store.save();
        LS.syncTitles(u);
        LS.toast('星印已刻下', '欢迎来到 Link-Sekai，' + name, 'gold', 'spark');
        LS.confetti({ colors: ['#e6c98d', '#f0e3c8', '#8b3a4a', '#4f8c80'] });
        LS.app.go('#/tutorial');
      });
    }

    // foot may be re-created; nothing else
    void foot;
  }

  function rerender() {
    const app = document.getElementById('app');
    app.innerHTML = html();
    bind(app);
  }

  /* 自设形象编辑器已废弃（v4 职业英雄架构）：LS.charEditorHTML / LS.bindCharEditor
     空壳保留在 aichar.js，profile.js 的 openChar 仅展示提示文字。 */

  LS.readAvatar = function (file) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) { reject(new Error('请选择图片文件。')); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('文件读取失败。'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('图片无法解码。'));
        img.onload = () => {
          const size = 256;
          const cv = document.createElement('canvas');
          cv.width = size; cv.height = size;
          const ctx = cv.getContext('2d');
          const s = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
          resolve(cv.toDataURL('image/jpeg', .84));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  LS.Views.onboarding = {
    html,
    mount(root) {
      const u = LS.store.current();
      if (!u) return;
      if (!state || state.__uid !== u.uid) { initState(u); state.__uid = u.uid; }
      bind(root);
    }
  };
})(window.LS);
