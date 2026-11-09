/* 新手引导 — 星海引路人蒂娅 */
(function (LS) {
  'use strict';

  const GUIDE_IMG = 'assets/guide/guide_tia.webp?v=20261109V33';
  const GIFT_COINS = 120;
  const GIFT_INSPIRATION = 1;

  const STEPS = [
    {
      key: 'welcome', kicker: 'STEP 01 · 星海之门', jp: 'ようこそ',
      title: '欢迎来到 Link-Sekai',
      speech: '我是蒂娅，星海档案的引路人。每个从星门掉下来的旅人，第一件事都是同一个问题：「我该做什么？」先别急着拔剑，听我把这里的规则讲清楚。',
      cards: [
        { icon: 'map', title: '你在一座星轨世界', desc: '六种编程语言是六条星轨，每条星轨上都有剧情、天书与代码试炼。' },
        { icon: 'user', title: '你是织码者', desc: '用代码当咒文，修复这个世界被错误侵蚀的节点，点亮属于自己的职业。' },
        { icon: 'target', title: '目标是变强', desc: '通关节点、收集装备、提升等级，最后挑战证书试炼，证明你真正掌握了它。' }
      ],
      tip: '右上角随时可以跳过。跳过也会留下启程礼，之后还能从旅人档案重新翻开这段引导。'
    },
    {
      key: 'loop', kicker: 'STEP 02 · 冒险循环', jp: '冒険の輪',
      title: '一场冒险，是这样转起来的',
      speech: '这个游戏没有「先背完一本书再开始」的门槛。你的成长是一个很短的循环：读一点、写一点、打一场、拿奖励，然后再往前走一格。',
      cards: [
        { icon: 'book', title: '① 读天书', desc: '每个章节先读知识天书，弄清这一关会用到的语法与概念。' },
        { icon: 'terminal', title: '② 写代码', desc: '在代码试炼里让终端输出题目要求的内容，输出必须逐字一致。' },
        { icon: 'gem', title: '③ 收战利品', desc: '胜利会得到经验、星辉，偶尔掉落装备与锻造材料。' },
        { icon: 'crown', title: '④ 变更强', desc: '升级、换装备、点亮新语言，再回去挑战更难的星轨。' }
      ],
      tip: '卡住时先去「星海演武场」自由练习，那里不会扣血，也不会消耗任何资源。'
    },
    {
      key: 'battle', kicker: 'STEP 03 · 代码试炼', jp: 'コード試練',
      title: '战斗，就是让输出替你说话',
      speech: '每一场试炼都是多波敌人：小怪、精英、BOSS。每道题都会给出「让终端输出」的目标。你的代码跑出的结果与目标逐字一致，才算命中。',
      bullets: [
        '每一波有命中次数，打满次数才能击破当前敌人。',
        '写错会被反击并扣血；血量归零，这场试炼就失败了。',
        '卡住时可以查看提示，但用提示会少一点奖励，也不丢人。',
        'BOSS 的最后一击通常要用本章学过的写法，别想着蒙混过关。'
      ],
      tip: '先让程序跑起来，再让输出对齐。读报错比反复猜要快得多。'
    },
    {
      key: 'syntax', kicker: 'STEP 04 · 咒式约束', jp: '呪式の縛り',
      title: '不能只交答案，还要用对咒式',
      speech: '这是星海试炼最重要的规则：如果题目要求你用循环、条件或函数，你直接把结果写死打印出来，星轨会判定「咒式未命中」。',
      cards: [
        { icon: 'refresh', title: '未命中会怎样', desc: '攻击被怪物挡下，伤害减半甚至完全 miss，并触发反击。' },
        { icon: 'sword', title: '怎样才算命中', desc: '代码里必须真的出现题目要求的语法结构，比如 for / while 循环、if 条件或函数定义。' },
        { icon: 'target', title: '题目会醒目提示', desc: '战斗界面会用专门的「咒式要求」面板高亮显示必须使用的语法。' }
      ],
      tip: '这不是刁难你，而是在防止「看懂答案」冒充「学会写法」。真正写过一次，才算过关。'
    },
    {
      key: 'gear', kicker: 'STEP 05 · 装备机制', jp: '装備',
      title: '武器、服饰、道具，各管一摊',
      speech: '每个职业语言都有一套独立的装备栏：武器、服饰、道具。换语言不会串装备，也不会丢属性。',
      bullets: [
        '装备分品质：普通、优良、稀有、史诗、传说。品质越高，属性条目越多。',
        '武器偏攻击，服饰偏生存，道具偏灵感与掉落等辅助属性。',
        '重复装备可以在锻造台分解成材料，再注入魔能，定向强化你想要的属性。',
        '通关 BOSS 会稳定给装备；章节全通与职业觉醒还会解锁更好的奖励。',
        '角色达到阶段后可以觉醒，获得永久的属性加成，并解锁新的立绘与头像。'
      ],
      tip: '不要只看品质。与你当前打法契合的稀有装备，往往比不合手的史诗更好用。'
    },
    {
      key: 'growth', kicker: 'STEP 06 · 成长资源', jp: '成長',
      title: '经验、星辉、灵感，各有用途',
      speech: '这里的三种资源不要混着花。经验决定等级；星辉是通用货币；灵感是关键时刻的「再来一次」。',
      cards: [
        { icon: 'star', title: '经验', desc: '通关节点获得，升级会提高等级、解锁等级奖励，并让角色阶段成长。' },
        { icon: 'gem', title: '星辉', desc: '用于商店购买、锻造与部分解锁。每日委托与战斗是稳定来源。' },
        { icon: 'spark', title: '灵感', desc: '升级与特定奖励获得，可以在试炼中换取提示或额外机会。' }
      ],
      tip: '每天的委托值得优先做完。它给的不是一次性奖励，而是让你每天都能往前走一点。'
    },
    {
      key: 'tools', kicker: 'STEP 07 · 学习工具箱', jp: '道具箱',
      title: '三件工具，陪你走完全程',
      speech: '我不希望你靠死记硬背通关。真正好用的，是知道什么时候该翻书、什么时候该动手试。',
      cards: [
        { icon: 'book', title: '知识天书', desc: '按语言与章节整理的概念、术语、示例和考纲。读完之后，相关试炼会更容易。' },
        { icon: 'terminal', title: '星海演武场', desc: '已点亮语言的自由沙盒。写代码、看中英文报错、随时翻开随身天书。' },
        { icon: 'users', title: '星网与委托', desc: '每日委托提供稳定收益；添加同行者后，可以互相比对进度、互相见证。' }
      ],
      tip: '证书试炼只看真实水平。准备好了再去，它不会因为你等级高就放水。'
    },
    {
      key: 'depart', kicker: 'STEP 08 · 启程', jp: '出発',
      title: '星门已经为你打开',
      speech: '该说的都说了。剩下的路，得由你自己一行一行写出来。记住：先读，再写，跑起来，看输出。错了也没关系，星海会接住你。',
      gift: true,
      tip: '这份启程礼包含 ' + GIFT_COINS + ' 星辉与 ' + GIFT_INSPIRATION + ' 点灵感，已经放进你的行囊。'
    }
  ];

  function gift(u) {
    if (u.tutorialReward) return;
    u.tutorialReward = true;
    u.coins = (u.coins || 0) + GIFT_COINS;
    u.inspiration = (u.inspiration || 0) + GIFT_INSPIRATION;
    try {
      u.lifetime = u.lifetime || { coinsEarned: 0, coinsSpent: 0, drops: 0, dailyClaimed: 0 };
      u.lifetime.coinsEarned = (u.lifetime.coinsEarned || 0) + GIFT_COINS;
    } catch (e) { /* ignore */ }
    LS.store.save();
  }

  function bodyHTML(step) {
    let out = '';
    if (step.bullets) {
      out += '<ul class="tut-bullets">' + step.bullets.map(t => '<li><i>' + LS.icon('check', 12) + '</i><span>' + LS.esc(t) + '</span></li>').join('') + '</ul>';
    }
    if (step.cards) {
      out += '<div class="tut-cards">' + step.cards.map(c => `<div class="tut-mini-card">
        <div class="tut-mini-ico">${LS.icon(c.icon, 15)}</div>
        <b>${LS.esc(c.title)}</b><p>${LS.esc(c.desc)}</p>
      </div>`).join('') + '</div>';
    }
    if (step.gift) {
      out += `<div class="tut-gift">
        <div class="tut-gift-ico">${LS.icon('gem', 20)}</div>
        <div><b>启程礼</b><span><i>${GIFT_COINS}</i> 星辉 · <i>${GIFT_INSPIRATION}</i> 灵感</span></div>
      </div>`;
    }
    if (step.tip) out += '<div class="tut-tip">' + LS.icon('spark', 13) + '<span>' + LS.esc(step.tip) + '</span></div>';
    return out;
  }

  function html() {
    const u = LS.store.current();
    const step = STEPS[0];
    return `<div class="tut-page">
      <div class="tut-stars" aria-hidden="true"></div>
      <header class="tut-top">
        <div class="tut-brand"><img src="${GUIDE_IMG}" alt="" class="tut-brand-av"><div><b>LINK-SEKAI</b><span>星海引路 · ORIENTATION</span></div></div>
        <div class="tut-top-right">
          <span class="tut-step-label" id="tut-step-label">01 / ${String(STEPS.length).padStart(2, '0')}</span>
          <button class="tut-skip" data-skip>跳过引导</button>
        </div>
      </header>

      <main class="tut-stage">
        <aside class="tut-portrait">
          <div class="tut-portrait-frame">
            <img src="${GUIDE_IMG}" alt="星海引路人蒂娅" class="tut-portrait-img">
            <div class="tut-portrait-glow" aria-hidden="true"></div>
            <div class="tut-portrait-meta">
              <b>蒂娅 <em>TIA</em></b>
              <span>星海引路人 · 档案管理员</span>
            </div>
          </div>
          <div class="tut-portrait-quote">「代码不是咒语，直到你让它跑起来。」</div>
        </aside>

        <section class="tut-card" aria-live="polite">
          <div class="tut-card-head">
            <div class="tut-kicker" id="tut-kicker">${LS.esc(step.kicker)}</div>
            <div class="tut-jp" id="tut-jp">${LS.esc(step.jp)}</div>
          </div>
          <h1 id="tut-title">${LS.esc(step.title)}</h1>
          <div class="tut-speech" id="tut-speech">
            <span class="tut-quote-mark" aria-hidden="true">「</span>
            <p>${LS.esc(step.speech)}</p>
          </div>
          <div class="tut-body" id="tut-body">${bodyHTML(step)}</div>
          <footer class="tut-foot">
            <button class="tut-back" data-back>${LS.icon('arrow', 13)} 上一步</button>
            <div class="tut-dots" id="tut-dots">${STEPS.map((s, i) => `<button class="tut-dot ${i === 0 ? 'is-on' : ''}" data-dot="${i}" aria-label="第 ${i + 1} 步：${LS.esc(s.title)}"></button>`).join('')}</div>
            <button class="tut-next" data-next>下一步 ${LS.icon('chevron', 13)}</button>
          </footer>
        </section>
      </main>
      <div class="tut-foot-note">星海引路 · 你可以随时停下，也可以随时回来。</div>
    </div>`;
  }

  function mount(root) {
    const page = (root && root.querySelector('.tut-page')) || document.querySelector('.tut-page');
    if (!page) return;
    const u = LS.store.current();
    if (!u) return;
    let index = 0;
    let busy = false;

    const el = {
      kicker: page.querySelector('#tut-kicker'),
      jp: page.querySelector('#tut-jp'),
      title: page.querySelector('#tut-title'),
      speech: page.querySelector('#tut-speech'),
      body: page.querySelector('#tut-body'),
      dots: page.querySelector('#tut-dots'),
      back: page.querySelector('[data-back]'),
      next: page.querySelector('[data-next]'),
      label: page.querySelector('#tut-step-label')
    };

    function render() {
      const step = STEPS[index];
      el.kicker.textContent = step.kicker;
      el.jp.textContent = step.jp;
      el.title.textContent = step.title;
      el.speech.querySelector('p').textContent = step.speech;
      el.body.innerHTML = bodyHTML(step);
      el.dots.querySelectorAll('.tut-dot').forEach((d, i) => d.classList.toggle('is-on', i === index));
      el.back.disabled = index === 0;
      el.next.innerHTML = index === STEPS.length - 1
        ? '接受祝福，出发 ' + LS.icon('arrow', 13)
        : '下一步 ' + LS.icon('chevron', 13);
      el.label.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(STEPS.length).padStart(2, '0');
      page.querySelector('.tut-card').animate(
        [{ opacity: .35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, easing: 'ease-out' }
      );
    }

    function done(skipped) {
      if (busy) return;
      busy = true;
      const first = !u.tutorialDone;
      u.tutorialDone = true;
      gift(u);
      LS.store.save();
      if (skipped) LS.toast('已跳过新手引导', '启程礼仍然留在你的行囊里。', 'gold', 'spark');
      else if (first) LS.toast('启程礼已领取', '+' + GIFT_COINS + ' 星辉 · +' + GIFT_INSPIRATION + ' 灵感', 'gold', 'gem');
      else LS.toast('引导已温习', '星海一直在这里。', 'gold', 'book');
      LS.confetti({ colors: ['#e6c98d', '#f0e3c8', '#8b3a4a', '#4f8c80'] });
      LS.app.go('#/');
    }

    function next() {
      if (index >= STEPS.length - 1) { done(false); return; }
      index++;
      render();
    }
    function back() {
      if (index <= 0) return;
      index--;
      render();
    }

    el.next.addEventListener('click', next);
    el.back.addEventListener('click', back);
    page.querySelector('[data-skip]').addEventListener('click', () => done(true));
    el.dots.querySelectorAll('[data-dot]').forEach(d => d.addEventListener('click', () => {
      const i = Number(d.dataset.dot);
      if (Number.isFinite(i) && i >= 0 && i < STEPS.length) { index = i; render(); }
    }));

    function keys(e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    }
    document.addEventListener('keydown', keys);
    window.addEventListener('hashchange', () => document.removeEventListener('keydown', keys), { once: true });

    render();
  }

  LS.Views.tutorial = { html, mount };
})(window.LS);
