/* 开屏公告：版本、更新内容与开源声明。
   每次打开页面都会展示一次；不写入存档，不影响登录与本地进度。 */
(function (LS) {
  'use strict';

  LS.ANNOUNCE = {
    version: 'v2.4.2',
    codename: '开源坐标',
    date: '2026.11.09',
    author: '龙潜猫隐',
    tagline: '星海的源代码，也一并交给你。',
    changes: [
      { title: 'GitHub 开源入口', text: '公告底部新增仓库入口与作者介绍：EliasNeko，软件技术专业学生，平日写 Java、Python、C++、NodeJS 和 Go。' },
      { title: '取消演示身份', text: '移除以 NPC 身份直接进入的演示入口。现在每位玩家都必须注册账号，并且只能登录自己的账号游玩。' },
      { title: '三装备叠加', text: '武器、服饰、道具三栏的属性现在全部叠加生效。战斗页会逐一列出三件装备与三件合计，提示 / 残影 / 护盾设有总上限。' },
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
    github: {
      handle: 'EliasNeko',
      accountUrl: 'https://github.com/EliasNeko',
      repoUrl: 'https://github.com/EliasNeko/LINK-SEKAI',
      repoName: 'LINK-SEKAI',
      intro: [
        '我是龙潜猫隐，GitHub 账号是 EliasNeko。湖南人，软件技术专业 26 级学生，平时主要写 Java、Python、C++、NodeJS 和 Go。',
        '这个账号只用来做个人语言学习与技术练习，不会用于任何商业用途。LINK-SEKAI 的源码、关卡数据、成品美术资源与更新记录都会放在这里，后续版本也会继续在仓库里更新。',
        '想改剧情、加关卡、换一套立绘，或者只是发现了一个 bug，都欢迎来仓库提 Issue 或直接开 PR。觉得有意思的话，点一颗 Star 就是对我最大的鼓励。'
      ]
    },
    signature: '—— 龙潜猫隐 · 《代码 Link-Sekai》作者',
    /* 制作备注：低调放在声明末尾，不抢正文。 */
    credit: '制作备注：剧情与教材部分由 Qoder 搭载 DeepSeek V4.1 Flash 辅助完成；故事、总体构造，以及代码的编写、编译、检查与修复，均由作者本人完成。'
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
          <p class="announce-credit">${esc(a.credit)}</p>
        </section>
        <section class="announce-sec announce-github">
          <div class="announce-sec-head"><span class="jp">GITHUB</span><h3>开源地址</h3><em>@${esc(a.github.handle)}</em></div>
          <a class="gh-card" href="${esc(a.github.repoUrl)}" target="_blank" rel="noopener noreferrer">
            <span class="gh-mark" aria-hidden="true"><svg viewBox="0 0 16 16" width="22" height="22" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg></span>
            <span class="gh-copy">
              <em>GITHUB REPOSITORY</em>
              <b>${esc(a.github.repoName)} · 代码游戏</b>
              <i>github.com/${esc(a.github.handle)}/${esc(a.github.repoName)}</i>
            </span>
            <span class="gh-go">前往仓库 ↗</span>
          </a>
          <div class="gh-intro">${a.github.intro.map(p => `<p>${esc(p)}</p>`).join('')}</div>
          <div class="gh-links">
            <a href="${esc(a.github.accountUrl)}" target="_blank" rel="noopener noreferrer">作者主页 · @${esc(a.github.handle)} ↗</a>
            <a href="${esc(a.github.repoUrl)}" target="_blank" rel="noopener noreferrer">LINK-SEKAI 仓库 ↗</a>
          </div>
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
