/* 开屏公告：版本、更新内容与开源声明。
   每次打开页面都会展示一次；不写入存档，不影响登录与本地进度。 */
(function (LS) {
  'use strict';

  LS.ANNOUNCE = {
    version: 'v2.9.4',
    codename: '编译塔的黎明',
    date: '2026.11.11',
    author: '龙潜猫隐',
    tagline: '有人先按下了运行，声音也跟着亮了起来。',
    changes: [
      { title: '序章 CG · 编译塔的黎明', text: '三幕 25 秒的序章映像：黎明六人集结、深渊睁开眼睛、六色复合总攻。六位职业者与游戏里的形象一一对应，画面、运镜、字幕与音效一起推进，官网首页即可全屏观看。' },
      { title: '星河声场 · 大厅与战斗', text: '新的全局主题曲走舒缓、宿命与微光的路线，不再阴森悲凉；战斗曲只在进入关卡时响起，离开后自动淡回大厅。两首曲子在后台切换时会先暂停，回来再接着放。' },
      { title: '声音设置 · 分场景音量', text: '顶栏新增声音入口：大厅主题与战斗音乐可以分别调音量，也能一键关掉背景音乐；设置只影响音乐，不碰战斗音效，并记在这台设备上。' },
      { title: '三端 · 内容自动更新', text: '网页端、Android 与 Windows 客户端都从同一入口加载最新内容，这次更新不需要重装客户端，登录后即可看到新 CG 与新音乐；云端存档照旧。' },
      { title: '官网 · 展映区适配', text: 'CG 展映区在桌面与手机上都能完整播放，手机端收起章节按钮、保留进度与音量；首页排版没有横向溢出，素材缓存升到 V44。' }
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
      siteUrl: 'https://link-sekai-ot4mp9chy59.qoder.zone',
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
