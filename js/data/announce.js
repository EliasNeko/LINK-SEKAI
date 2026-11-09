/* 开屏公告：版本、更新内容与开源声明。
   每次打开页面都会展示一次；不写入存档，不影响登录与本地进度。 */
(function (LS) {
  'use strict';

  LS.ANNOUNCE = {
    version: 'v2.4.0',
    codename: '魔能铸造',
    date: '2026.11.09',
    author: '龙潜猫隐',
    tagline: '赤红的源初，终于等来了它的第二次心跳。',
    changes: [
      { title: '锻造台开放', text: '源初品质的武器、服饰与道具可以注入魔能。每次消耗 1 枚魔能石，最高五阶。' },
      { title: '源初 · 魔能注入', text: '注入后的品阶名与颜色改为亮粉色，并以 I–V 的罗马数字标记阶位；数值按复利提升。' },
      { title: '新的极稀有材料', text: '魔能石加入星海。每条星轨的最终首领首通、全卷通关、第三阶段熟练度，以及星辉熔炉兑换，都是它的来处。' },
      { title: '账号接入云端', text: '在线上版本注册后，账号与进度会保存到云端。换一台设备登录，星轨仍会停在原处。' },
      { title: '细节修正', text: '修复阶段立绘的无效请求，补全移动端导航，并统一了战斗、档案与天书中的注入显示。' }
    ],
    openSource: [
      '《代码 Link-Sekai》由龙潜猫隐独立制作，从今天起完全开源。源代码、剧情、关卡数据与美术资源都会公开，任何人都可以免费游玩、阅读、修改，也可以把它带进课堂、社团，或者某个只想写点东西的深夜。',
      '它公开供社会语言学习者娱乐、练习与二次创作使用。你可以拿它学语言、学编程，做自己的分支版本，也可以只是单纯地玩。',
      '我只有一个请求：不要把它包装成付费课程去贩卖，也不要用它做伤害别人的事。除此之外，去玩吧，去改吧，去把它变成你自己的星海。'
    ],
    signature: '—— 龙潜猫隐 · 《代码 Link-Sekai》作者'
  };

  function esc(v) { return LS.esc ? LS.esc(v) : String(v == null ? '' : v); }

  LS.showAnnouncement = function () {
    if (!LS.openModal || document.querySelector('.announce-modal')) return null;
    const a = LS.ANNOUNCE;
    const html = `
      <div class="announce-glow" aria-hidden="true"></div>
      <div class="announce-head">
        <div class="announce-mark">L</div>
        <div class="announce-headtext">
          <div class="announce-kicker">STARLIGHT BULLETIN · 星门公告</div>
          <div class="announce-verline"><b>${esc(a.version)}</b><span>${esc(a.codename)}</span></div>
        </div>
        <button class="modal-close announce-close" data-close aria-label="关闭公告">✕</button>
      </div>
      <p class="announce-tagline">${esc(a.tagline)}</p>
      <div class="announce-scroll">
        <section class="announce-sec">
          <div class="announce-sec-head"><span class="jp">UPDATE</span><h3>本次更新</h3><em>${esc(a.date)}</em></div>
          <ul class="announce-list">
            ${a.changes.map((c, i) => `<li><i>${String(i + 1).padStart(2, '0')}</i><div><b>${esc(c.title)}</b><p>${esc(c.text)}</p></div></li>`).join('')}
          </ul>
        </section>
        <section class="announce-sec announce-open">
          <div class="announce-sec-head"><span class="jp">OPEN SOURCE</span><h3>开源声明</h3><em>完全公开</em></div>
          ${a.openSource.map(p => `<p>${esc(p)}</p>`).join('')}
          <div class="announce-sign">${esc(a.signature)}</div>
        </section>
      </div>
      <div class="announce-foot">
        <button class="btn btn-lg announce-ok" data-close>收下公告，继续冒险 ${LS.icon ? LS.icon('arrow', 15) : ''}</button>
      </div>`;

    const overlay = LS.openModal(html, { wide: true, className: 'announce-modal' });
    if (!overlay) return null;
    const ok = overlay.querySelector('.announce-ok');
    const focusTarget = overlay.querySelector('[data-close]');
    setTimeout(() => { try { focusTarget && focusTarget.focus({ preventScroll: true }); } catch (e) { } }, 40);
    const onKey = (e) => {
      if (e.code === 'Escape') { e.preventDefault(); LS.closeModal(overlay); document.removeEventListener('keydown', onKey); }
    };
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.removeEventListener('keydown', onKey);
    });
    if (ok) ok.addEventListener('click', () => document.removeEventListener('keydown', onKey));
    return overlay;
  };
})(window.LS);
