/* 开屏公告：版本、更新内容与开源声明。
   每次打开页面都会展示一次；不写入存档，不影响登录与本地进度。 */
(function (LS) {
  'use strict';

  LS.ANNOUNCE = {
    version: 'v2.9.2',
    codename: '星港启程',
    date: '2026.11.10',
    author: '龙潜猫隐',
    tagline: '从浏览器出发，去往每一块屏幕。',
    changes: [
      { title: '看板娘启动图标 · 星冕大头照', text: '为 Java 龙娘重新绘制启动图标：紫晶龙角、银白长发与金色星弧收进一枚深色方印，按二游启动图标的规格处理，脸与瞳光都完整露出。网页、安卓与桌面端共用同一枚图标。' },
      { title: '官方站点 · 星港门户', text: '新官网把世界、六大职业、系统与档案收进同一页暗金版式，可以直接在网页游玩，也可以下载安卓 APK 与 Windows 安装包；三端账号与存档共用同一套云端。' },
      { title: '安卓客户端 · 随身星轨', text: '新增 Android 客户端，支持文件上传、返回键回退与断网重连；安装后可直接进入游戏，与网页端实时同步进度。' },
      { title: 'Windows 客户端 · 桌面星港', text: '新增 Windows 安装包，桌面快捷方式、开始菜单与卸载入口齐全；窗口内直接载入线上游戏，更新无需重装客户端。' },
      { title: '浏览器安装 · 把游戏留在桌面', text: '补齐 PWA 清单、favicon 与主屏图标：手机浏览器可把游戏添加到主屏，以独立窗口运行，不再显示地址栏。' }
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
      siteUrl: 'https://link-sekai-official-ot4mp9chy59.qoder.zone',
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
            <a href="${esc(a.github.siteUrl)}" target="_blank" rel="noopener noreferrer">官方站点 · 星港门户 ↗</a>
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
