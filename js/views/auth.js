/* 登录 / 注册：星门 */
(function (LS) {
  'use strict';

  LS.Views = LS.Views || {};

  function html() {
    return `<div id="view-root" class="auth-shell">
      <section class="auth-visual">
        <div class="auth-brand">
          <div class="brand-mark">L</div>
          <div class="brand-text"><b>LINK-SEKAI</b><span>コード異世界 · 冒険の書</span></div>
        </div>
        <div class="auth-copy">
          <div class="kana">以终端为法杖 · 以逻辑为咒文</div>
          <h1>代码<em>Link-Sekai</em><span class="cn">编程异世界</span></h1>
          <p>在会呼吸的星海图书馆里，每一种编程语言都是一条职业星轨。写下第一行代码，推开属于你的那扇门。</p>
          <div class="auth-meta">
            <span class="chip chip-gold">六种语言 · 六种职业</span>
            <span class="chip">知识天书</span>
            <span class="chip">NCRE 证书支线</span>
            <span class="chip chip-pink">${LS.cloud && LS.cloud.enabled ? '云端星网存档' : '本地星网存档'}</span>
          </div>
        </div>
      </section>
      <section class="auth-side">
        <div class="auth-card paper corner-mark">
          <div class="seal-top wax-seal">L</div>
          <div class="auth-card-head">
            <div class="kicker-jp">星門 · STAR GATE</div>
            <h2>进入 Link-Sekai</h2>
            <p>登录你的旅人档案，或新建一枚星印。</p>
          </div>
          <div class="auth-tabs">
            <button class="active" data-tab="login">登录星门</button>
            <button data-tab="register">新建星印</button>
          </div>
          <div class="auth-error" id="auth-error"></div>
          <form class="auth-form" id="login-form" autocomplete="off">
            <div class="field">
              <label>登录账号 <span class="faint">· 英文 / 数字 / 下划线</span></label>
              <input class="input" name="login" maxlength="16" placeholder="例如 stardust_01" required>
            </div>
            <div class="field">
              <label>通行咒文</label>
              <input class="input" type="password" name="password" maxlength="64" placeholder="至少 6 位" required>
            </div>
            <button class="btn btn-lg btn-block" type="submit">推开星门 ${LS.icon('arrow', 15)}</button>
          </form>
          <form class="auth-form hidden" id="register-form" autocomplete="off">
            <div class="field-row">
              <div class="field">
                <label>登录账号</label>
                <input class="input" name="login" maxlength="16" placeholder="3–16 位" required>
              </div>
              <div class="field">
                <label>游戏昵称</label>
                <input class="input" name="gameName" maxlength="12" placeholder="最多 12 字" required>
              </div>
            </div>
            <div class="field">
              <label>通行咒文</label>
              <input class="input" type="password" name="password" maxlength="64" placeholder="至少 6 位" required>
            </div>
            <div class="field">
              <label>再次确认</label>
              <input class="input" type="password" name="confirm" maxlength="64" placeholder="重复输入咒文" required>
            </div>
            <button class="btn btn-lg btn-block" type="submit">刻下星印 ${LS.icon('spark', 15)}</button>
            <div class="auth-note"><span class="dot"></span><span>${LS.cloud && LS.cloud.enabled
              ? '注册后，账号与进度会实时保存在云端；换一台设备登录也能继续。网络暂时中断时仍可先用本机缓存游玩。'
              : '账号、进度、好友与装备均保存在本机浏览器。清理浏览器数据会同时清除存档，请自行备份。'}</span></div>
          </form>
          <div class="demo-row">或试用演示档案</div>
          <button class="demo-btn" id="demo-login" type="button">${LS.icon('play', 12)} 以「星野·澪」进入演示星海</button>
          <div class="auth-foot">LINK-SEKAI · A LOCAL-FIRST PROGRAMMING ADVENTURE</div>
        </div>
      </section>
    </div>`;
  }

  function mount(root) {
    const tabs = root.querySelectorAll('[data-tab]');
    const loginForm = root.querySelector('#login-form');
    const regForm = root.querySelector('#register-form');
    const err = root.querySelector('#auth-error');

    function setTab(name) {
      tabs.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
      loginForm.classList.toggle('hidden', name !== 'login');
      regForm.classList.toggle('hidden', name !== 'register');
      err.classList.remove('show');
    }
    tabs.forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

    function showErr(msg) {
      err.textContent = msg;
      err.classList.add('show');
    }

    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const btn = loginForm.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        const user = await LS.store.login(fd.get('login'), fd.get('password'));
        LS.toast('星门已开启', '欢迎回来，' + user.gameName, 'gold', 'spark');
        LS.app.go(user.onboardingDone ? '#/' : '#/onboarding');
      } catch (ex) {
        showErr(ex.message || '登录失败。');
        btn.disabled = false;
      }
    });

    regForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(regForm);
      if (fd.get('password') !== fd.get('confirm')) { showErr('两次输入的咒文不一致。'); return; }
      const btn = regForm.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        const user = await LS.store.register({
          login: fd.get('login'), gameName: fd.get('gameName'), password: fd.get('password')
        });
        LS.toast('星印已刻下', '欢迎，' + user.gameName, 'gold', 'spark');
        LS.app.go('#/onboarding');
      } catch (ex) {
        showErr(ex.message || '注册失败。');
        btn.disabled = false;
      }
    });

    root.querySelector('#demo-login').addEventListener('click', () => {
      const user = LS.store.loginDemo();
      LS.toast('演示星门已开启', '你正以「' + user.gameName + '」的身份体验', 'gold', 'play');
      LS.app.go('#/');
    });
  }

  LS.Views.auth = { html, mount };
})(window.LS);
