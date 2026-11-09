/* 证书试炼：原创 NCRE 风格题库、监考对话、计时与解析 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  let E = null;           // 当前考试会话
  let timer = null;       // 倒计时句柄
  const briefPlayed = {}; // 每个会话只播一次考前对话

  function totalScore(exam) { return exam.questions.reduce((s, q) => s + (q.score || 0), 0); }
  function recordOf(user, exam) { return (user.exams || {})[exam.id] || null; }

  function draftKey(uid, id) { return 'linksekai.exam.' + uid + '.' + id; }

  function saveDraft(user, exam) {
    if (!E || E.examId !== exam.id || E.submitted) return;
    try {
      localStorage.setItem(draftKey(user.uid, exam.id), JSON.stringify({
        examId: E.examId, startedAt: E.startedAt, answers: E.answers, code: E.code
      }));
    } catch (e) { }
  }
  function clearDraft(user, exam) {
    try { localStorage.removeItem(draftKey(user.uid, exam.id)); } catch (e) { }
  }
  function loadDraft(user, exam) {
    try {
      const raw = localStorage.getItem(draftKey(user.uid, exam.id));
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || d.examId !== exam.id) return null;
      const left = exam.minutes * 60000 - (Date.now() - d.startedAt);
      if (left <= 0) { clearDraft(user, exam); return null; }
      return {
        examId: exam.id, startedAt: d.startedAt,
        answers: d.answers || {}, code: d.code || {},
        submitted: false, result: null
      };
    } catch (e) { return null; }
  }

  /* ---------------- list ---------------- */
  function examCard(user, exam) {
    const lock = LS.examLockReason(user, exam);
    const rec = recordOf(user, exam);
    const passed = !!(rec && rec.passed);
    return `<div class="exam-card ${lock ? 'locked' : ''} ${passed ? 'passed' : ''}" style="--exam-color:${exam.color}">
      <div class="ec-top">
        <span class="ec-level">${LS.esc(exam.level)}</span>
        <span class="ec-sigil">${LS.esc(exam.sigil)}</span>
        ${passed ? '<span class="ec-pass">已通过</span>' : lock ? `<span class="ec-lock">${LS.icon('lock', 12)} 未解锁</span>` : '<span class="ec-open">可挑战</span>'}
      </div>
      <h3>${LS.esc(exam.name)}</h3>
      <div class="ec-jp">${LS.esc(exam.jp)}</div>
      <p>${LS.esc(exam.desc)}</p>
      <div class="ec-meta">
        <span>${LS.icon('clock', 12)} ${exam.minutes} 分钟</span>
        <span>${LS.icon('scroll', 12)} ${exam.questions.length} 题</span>
        <span>${LS.icon('target', 12)} ${exam.passScore} 分及格</span>
      </div>
      <div class="ec-foot">
        <div class="ec-best">${rec ? `最佳 <b>${rec.best}</b> / ${totalScore(exam)} · 已考 ${rec.attempts || 1} 次` : '尚未参加'}</div>
        ${lock
          ? `<button class="btn btn-sm" disabled>${LS.icon('lock', 12)} 未解锁</button>`
          : `<a class="btn btn-sm" href="#/exam/${exam.id}">${passed ? '再次挑战' : '进入试炼'} ${LS.icon('arrow', 12)}</a>`}
      </div>
      ${lock ? `<div class="ec-reason">${LS.esc(lock)}</div>` : ''}
    </div>`;
  }

  function listPage() {
    const u = LS.store.current();
    const passed = LS.EXAMS.filter(e => { const r = recordOf(u, e); return r && r.passed; }).length;
    const open = LS.EXAMS.filter(e => !LS.examLockReason(u, e)).length;
    return {
      html: `<div class="exams-page">
        <section class="exam-hero fade-up">
          <div class="exam-hero-bg"></div>
          <div class="eh-inner">
            <div class="eh-copy">
              <div class="page-ornament">CERTIFICATION · 证书试炼</div>
              <h1>把学到的东西，写成一张证书</h1>
              <p>这里的题目是原创 NCRE 风格，不收录官方真题，但会认真逼近真实考试的提问方式。60 分及格，及格后计入旅人档案，并解锁证书称号。</p>
              <div class="exam-stats">
                <div><b>${passed}<small> / ${LS.EXAMS.length}</small></b><span>已通过</span></div>
                <div><b>${open}</b><span>当前可挑战</span></div>
                <div><b>Lv.${LS.levelFromXp(u.xp || 0).level}</b><span>旅人等级</span></div>
              </div>
            </div>
            <div class="eh-seal">
              <div class="eh-seal-ring"><span>证</span></div>
              <b>EXAMINER</b>
              <i>监考书灵 · 零</i>
              <p>“考试只是把你会的东西，换一种方式再说一遍。”</p>
            </div>
          </div>
        </section>

        <div class="section-head fade-up delay-1" style="margin-top:26px"><div><div class="kicker-jp">EXAM TRACKS · 试炼目录</div><h2>选择一张要挑战的证书</h2></div><span class="tiny faint">题目与解析均为原创</span></div>
        <div class="exam-grid fade-up delay-2">${LS.EXAMS.map(e => examCard(u, e)).join('')}</div>

        <div class="exam-road">
          <div class="er-line"></div>
          ${[['二级', '程序语言基础'], ['三级', '数据库技术'], ['四级', '软件测试']].map((x, i) => `<div class="er-node"><span>${i + 1}</span><b>${x[0]}</b><em>${x[1]}</em></div>`).join('')}
        </div>
        <div class="friends-note"><span>✦</span><p>证书只在本机星网记账。考试的计时、答案与解析都在本地完成，不会上传到任何服务器。题目为原创教学素材，非官方真题。</p></div>
      </div>`,
      title: '证书试炼',
      sub: 'CERTIFICATION'
    };
  }

  /* ---------------- briefing ---------------- */
  function briefPage(exam) {
    const u = LS.store.current();
    const rec = recordOf(u, exam);
    const lock = LS.examLockReason(u, exam);
    const ally = LS.ALLY[exam.langId] || { name: '监考书灵·零', sigil: '零' };
    return {
      html: `<div class="exam-brief-page" style="--exam-color:${exam.color}">
        <div class="breadcrumbs"><a href="#/exams">证书试炼</a><i>/</i><span>${LS.esc(exam.name)}</span></div>
        <section class="eb-banner">
          <div class="eb-glow"></div>
          <div class="eb-sigil">${LS.esc(exam.sigil)}</div>
          <div class="eb-copy">
            <div class="kicker-jp">${LS.esc(exam.level)} · ${LS.esc(exam.jp)}</div>
            <h1>${LS.esc(exam.name)}</h1>
            <p>${LS.esc(exam.desc)}</p>
            <div class="eb-meta">
              <span class="chip chip-gold">${exam.minutes} 分钟</span>
              <span class="chip">${exam.questions.length} 题 · 满分 ${totalScore(exam)}</span>
              <span class="chip">${exam.passScore} 分及格</span>
              ${rec ? `<span class="chip chip-cyan">最佳 ${rec.best} 分</span>` : ''}
            </div>
          </div>
          <div class="eb-examiner">
            ${exam.langId ? `<div class="eb-ex-figure">${LS.npcImg(exam.langId, 150)}</div>` : `<div class="eb-ex-sigil">${LS.esc(ally.sigil)}</div>`}
            <b>${LS.esc(ally.name)}</b>
            <span>${LS.esc(exam.langId ? (LS.lang(exam.langId) || {}).profession + ' · 监考' : '理论试炼 · 监考')}</span>
          </div>
        </section>

        <div class="eb-layout">
          <main class="eb-main">
            <section class="eb-rules leather-block">
              <div class="kicker-jp">RULES · 试炼规则</div>
              <div class="eb-rule"><span>01</span><p>选择题直接点击选项；编程题在编辑器中作答，可随时运行查看输出。</p></div>
              <div class="eb-rule"><span>02</span><p>提交后统一判定。选择题按答案计分，编程题要求输出完全一致且满足题目结构要求。</p></div>
              <div class="eb-rule"><span>03</span><p>总分达到 ${exam.passScore} 分即为通过。时间结束会自动提交，未作答题目按 0 分计。</p></div>
              <div class="eb-rule"><span>04</span><p>中途离开不会丢失草稿；在剩余时间内回到本页，可以继续作答。</p></div>
            </section>
            <section class="eb-rules leather-block" style="margin-top:16px">
              <div class="kicker-jp">COMPOSITION · 题型</div>
              <div class="eb-compose">
                <div><b>${exam.questions.filter(q => q.type === 'choice').length}</b><span>选择题 · 每题 10 分</span></div>
                <div><b>${exam.questions.filter(q => q.type === 'code').length}</b><span>编程题 · 每题 25 分</span></div>
                <div><b>${totalScore(exam)}</b><span>满分</span></div>
              </div>
            </section>
          </main>
          <aside class="eb-side">
            <div class="eb-start paper corner-mark">
              <div class="kicker-jp">READY · 准备</div>
              <h3>${rec && rec.passed ? '你已经通过这张证书' : '准备好就开始'}</h3>
              <p>${rec && rec.passed ? '可以再次挑战刷新最佳分数。每一次重考都不会清空已有成绩。' : '不要在还没想清楚的时候提交。先让输出说话。'}</p>
              ${rec ? `<div class="eb-record"><span>最佳成绩</span><b>${rec.best}</b><span>最近得分</span><b>${rec.lastScore == null ? '—' : rec.lastScore}</b><span>挑战次数</span><b>${rec.attempts || 1}</b></div>` : ''}
              ${lock
                ? `<div class="eb-locked">${LS.icon('lock', 14)} ${LS.esc(lock)}</div>`
                : `<button class="btn btn-lg btn-block" id="start-exam">${LS.icon('play', 14)} 开始计时</button>`}
              <a class="btn btn-ghost btn-block btn-sm" href="#/exams" style="margin-top:8px">返回试炼目录</a>
            </div>
          </aside>
        </div>
      </div>`,
      title: exam.name,
      sub: 'EXAM BRIEFING',
      mount(root) {
        const start = root.querySelector('#start-exam');
        if (start) start.addEventListener('click', () => beginExam(exam));
        if (!briefPlayed[exam.id]) {
          briefPlayed[exam.id] = true;
          setTimeout(() => {
            LS.dialogue({
              title: exam.name, jp: '試験前', langId: exam.langId,
              lines: [
                { who: '监考书灵·零', tone: 'guide', text: '规则只有一条：先读懂题，再写代码。终端不会因为你着急就提前给出答案。' },
                { who: ally.name, tone: 'ally', text: exam.langId ? '把平时在天书里读到的东西拿出来。遇到不会的题，先做会的，别在一道题上耗光时间。' : '理论题更像是在检查你的判断。排除明显错误的选项，再在剩下的里面选最准确的那个。' },
                { who: LS.store.current().gameName, tone: 'player', text: '我准备好了。开始计时吧。' }
              ]
            });
          }, 420);
        }
      }
    };
  }

  function beginExam(exam) {
    const u = LS.store.current();
    if (LS.examLockReason(u, exam)) { LS.toast('试炼尚未解锁', LS.examLockReason(u, exam), 'red', 'lock'); return; }
    let draft = loadDraft(u, exam);
    if (draft) {
      E = draft;
      LS.toast('草稿已恢复', '剩余时间会继续计算。', 'gold', 'scroll');
    } else {
      E = { examId: exam.id, startedAt: Date.now(), answers: {}, code: {}, submitted: false, result: null };
      exam.questions.forEach((q, i) => { if (q.type === 'code') E.code[i] = q.starter || ''; });
    }
    saveDraft(u, exam);
    LS.app.go('#/exam/' + exam.id);
  }

  /* ---------------- session ---------------- */
  function choiceHTML(exam, q, qi, res) {
    const picked = E.answers[qi];
    return `<div class="choice-list">${q.options.map((opt, oi) => {
      let cls = '';
      if (res) {
        if (oi === q.answer) cls = 'correct';
        else if (picked === oi) cls = 'wrong';
      } else if (picked === oi) cls = 'picked';
      return `<button class="choice-opt ${cls}" data-choice="${qi}" data-opt="${oi}" ${res ? 'disabled' : ''}>
        <span class="co-key">${String.fromCharCode(65 + oi)}</span><span>${LS.esc(opt)}</span>
      </button>`;
    }).join('')}</div>`;
  }

  function codeHTML(exam, q, qi, res) {
    const src = E.code[qi] == null ? (q.starter || '') : E.code[qi];
    if (res) {
      return `<div class="exam-code-review">
        <div class="ecr-block"><b>你的作答</b><pre class="code-block"><code>${LS.highlight(src, q.lang || exam.langId)}</code></pre></div>
        <div class="ecr-grid">
          <div><b>期望输出</b><pre>${LS.esc(q.expected)}</pre></div>
          <div><b>实际输出</b><pre>${LS.esc(res.actual || '（空）')}</pre></div>
        </div>
        ${res.error ? `<div class="term-why">✕ ${LS.esc(res.error)}</div>` : ''}
        ${res.ok ? '' : `<div class="ecr-why">${LS.esc(res.why || '')}</div>`}
        <details class="ecr-solution"><summary>查看参考写法</summary><pre class="code-block"><code>${LS.highlight(q.solution || '', q.lang || exam.langId)}</code></pre></details>
      </div>`;
    }
    return `<div class="exam-code">
      <div class="editor-head"><span class="ed-lang"><i></i>${LS.esc((LS.lang(q.lang || exam.langId) || {}).name || 'CODE')} · answer</span><span class="ed-kbd">Ctrl + Enter 运行</span></div>
      <div class="editor-body">
        <div class="editor-gutter" data-gutter="${qi}"></div>
        <textarea class="code-editor" data-code="${qi}" spellcheck="false" autocapitalize="off" autocomplete="off">${LS.esc(src)}</textarea>
      </div>
      <div class="exam-code-foot">
        <button class="btn btn-sm btn-ghost" data-run="${qi}">${LS.icon('play', 12)} 运行这段代码</button>
        <span class="tiny faint">输出必须与期望完全一致</span>
      </div>
      <pre class="exam-output" data-output="${qi}" hidden></pre>
    </div>`;
  }

  function questionCard(exam, q, qi, res) {
    const scoreLine = res ? `<span class="q-got ${res.got > 0 ? 'ok' : 'bad'}">+${res.got} / ${q.score}</span>` : `<span class="q-score">${q.score} 分</span>`;
    return `<article class="question-card ${res ? (res.got > 0 ? 'q-ok' : 'q-bad') : ''}" id="q-${qi}" data-qcard="${qi}">
      <div class="q-head">
        <div class="q-num"><span>${String(qi + 1).padStart(2, '0')}</span><em>${q.type === 'code' ? 'CODE' : 'CHOICE'}</em></div>
        <div class="q-type">${q.type === 'code' ? `编程题 · ${LS.esc((LS.lang(q.lang || exam.langId) || {}).name || '')}` : '单项选择题'}</div>
        ${scoreLine}
      </div>
      <p class="q-prompt">${LS.esc(q.prompt || q.q)}</p>
      ${q.requirement ? `<div class="q-req">${LS.icon('target', 12)} ${LS.esc(q.requirement)}</div>` : ''}
      ${q.type === 'choice' ? choiceHTML(exam, q, qi, res) : codeHTML(exam, q, qi, res)}
      ${res ? `<div class="q-explain"><b>解析</b><p>${LS.esc(q.explain || (res.why || '对照期望输出，再读一遍题目要求。'))}</p>${q.type === 'choice' ? `<span class="tiny">正确答案：${String.fromCharCode(65 + q.answer)} · ${LS.esc(q.options[q.answer])}</span>` : ''}</div>` : ''}
    </article>`;
  }

  function sessionPage(exam) {
    const u = LS.store.current();
    const res = E.result;
    const answered = Object.keys(E.answers || {}).length;
    return {
      html: `<div class="exam-session-page" id="exam-session" style="--exam-color:${exam.color}">
        <div class="es-head">
          <div class="es-head-left">
            <span class="es-sigil">${LS.esc(exam.sigil)}</span>
            <div><div class="kicker-jp">${LS.esc(exam.level)} · ${LS.esc(exam.jp)}</div><b>${LS.esc(exam.name)}</b></div>
          </div>
          <div class="es-head-mid">
            ${res ? `<span class="es-done">已提交 · ${res.score} 分</span>` : `<span class="es-timer" id="exam-timer">--:--</span><div class="exam-timebar"><i id="exam-timebar"></i></div>`}
          </div>
          <div class="es-head-right">
            ${res ? `<a class="btn btn-sm" href="#/exams" id="back-list">返回目录</a><button class="btn btn-sm btn-ghost" id="retake">再考一次</button>`
              : `<span class="es-count">${answered} / ${exam.questions.filter(q => q.type === 'choice').length} 选择题</span><button class="btn btn-sm" id="submit-exam">${LS.icon('check', 12)} 提交试卷</button>`}
          </div>
        </div>

        ${res ? `<div class="exam-result ${res.passed ? 'pass' : 'fail'}">
          <div class="er-seal">${res.passed ? '及第' : '未第'}</div>
          <div class="er-score"><b>${res.score}</b><span>/ ${totalScore(exam)}</span></div>
          <div class="er-copy">
            <div class="kicker-jp">${res.passed ? 'CERTIFIED · 通过' : 'REVIEW · 再试一次'}</div>
            <h2>${res.passed ? '证书已写入旅人档案' : '还差一点，解析已经展开'}</h2>
            <p>${res.passed ? '你通过了这次试炼。新的称号、经验与星辉已经记在档案里，可以继续挑战更高等级。' : '失败只说明这一张试卷还没写好。往下看每道题的解析，再回来。'}</p>
          </div>
          <div class="er-grid">
            <div><span>选择题</span><b>${res.choiceOk} / ${res.choiceTotal}</b></div>
            <div><span>编程题</span><b>${res.codeOk} / ${res.codeTotal}</b></div>
            <div><span>用时</span><b>${res.usedText}</b></div>
          </div>
        </div>` : ''}

        <div class="es-layout">
          <aside class="es-nav">
            <div class="es-nav-title">题目导航</div>
            <div class="es-nav-list">
              ${exam.questions.map((q, i) => {
                const r = res ? res.items[i] : null;
                const done = E.answers[i] != null || (q.type === 'code' && E.code[i] != null);
                return `<button class="es-nav-item ${r ? (r.got > 0 ? 'ok' : 'bad') : done ? 'done' : ''}" data-jump="${i}"><span>${String(i + 1).padStart(2, '0')}</span><em>${q.type === 'code' ? '编程' : '选择'}</em></button>`;
              }).join('')}
            </div>
            <div class="es-nav-legend"><span class="lg done"></span>已作答 <span class="lg ok"></span>正确 <span class="lg bad"></span>错误</div>
            ${res ? `<a class="btn btn-ghost btn-sm btn-block" href="#/exams" style="margin-top:12px">返回试炼目录</a>` : '<button class="btn btn-ghost btn-sm btn-block" id="submit-exam-2" style="margin-top:12px">提前交卷</button>'}
          </aside>

          <main class="es-main">
            ${exam.questions.map((q, i) => questionCard(exam, q, i, res ? res.items[i] : null)).join('')}
          </main>
        </div>
      </div>`,
      title: exam.name + (res ? ' · 成绩' : ' · 考试中'),
      sub: 'CERTIFICATION EXAM',
      mount(root) {
        bindSession(root, exam);
      }
    };
  }

  function bindSession(root, exam) {
    const u = LS.store.current();
    if (timer) { clearInterval(timer); timer = null; }

    if (!E.result) {
      function tick() {
        if (!document.querySelector('#exam-session')) { clearInterval(timer); timer = null; return; }
        const left = exam.minutes * 60000 - (Date.now() - E.startedAt);
        const el = document.getElementById('exam-timer');
        const bar = document.getElementById('exam-timebar');
        if (left <= 0) {
          clearInterval(timer); timer = null;
          if (el) el.textContent = '00:00';
          LS.toast('时间结束', '试卷已自动提交。', 'red', 'clock');
          submitExam(exam, true);
          return;
        }
        const mm = Math.floor(left / 60000), ss = Math.floor(left % 60000 / 1000);
        if (el) el.textContent = String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
        if (bar) bar.style.width = (left / (exam.minutes * 60000) * 100) + '%';
      }
      tick();
      timer = setInterval(tick, 500);
    }

    root.querySelectorAll('.choice-opt[data-choice]').forEach(btn => btn.addEventListener('click', () => {
      if (E.result) return;
      const qi = Number(btn.dataset.choice), oi = Number(btn.dataset.opt);
      E.answers[qi] = oi;
      btn.closest('.question-card').querySelectorAll('.choice-opt').forEach(b => b.classList.toggle('picked', b === btn));
      updateCount(root, exam);
      saveDraft(u, exam);
    }));

    root.querySelectorAll('[data-code]').forEach(ta => {
      const qi = Number(ta.dataset.code);
      const gutter = root.querySelector('[data-gutter="' + qi + '"]');
      const sync = () => {
        const n = ta.value.split('\n').length;
        if (gutter) gutter.innerHTML = Array.from({ length: n }, (_, i) => '<span>' + (i + 1) + '</span>').join('');
      };
      sync();
      ta.addEventListener('input', () => {
        E.code[qi] = ta.value;
        sync();
        updateCount(root, exam);
        saveDraft(u, exam);
      });
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const s = ta.selectionStart, en = ta.selectionEnd;
          ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
          ta.selectionStart = ta.selectionEnd = s + 4;
          E.code[qi] = ta.value;
          sync();
          saveDraft(u, exam);
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          runCode(root, exam, qi);
        }
      });
    });

    root.querySelectorAll('[data-run]').forEach(btn => btn.addEventListener('click', () => {
      runCode(root, exam, Number(btn.dataset.run));
    }));

    root.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => {
      const card = root.querySelector('#q-' + btn.dataset.jump);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    const submit = root.querySelector('#submit-exam');
    if (submit) submit.addEventListener('click', () => confirmSubmit(exam));
    const submit2 = root.querySelector('#submit-exam-2');
    if (submit2) submit2.addEventListener('click', () => confirmSubmit(exam));

    const retake = root.querySelector('#retake');
    if (retake) retake.addEventListener('click', () => {
      clearDraft(u, exam);
      E = null;
      beginExam(exam);
    });
    const backList = root.querySelector('#back-list');
    if (backList) backList.addEventListener('click', () => { E = null; });

    root.querySelectorAll('.choice-opt[data-choice]').forEach(btn => {
      if (E.result) btn.disabled = true;
    });
  }

  function updateCount(root, exam) {
    const el = root.querySelector('.es-count');
    if (!el) return;
    const answered = Object.keys(E.answers || {}).length;
    el.textContent = answered + ' / ' + exam.questions.filter(q => q.type === 'choice').length + ' 选择题';
  }

  function runCode(root, exam, qi) {
    if (E.result) return;
    const q = exam.questions[qi];
    const ta = root.querySelector('[data-code="' + qi + '"]');
    if (ta) E.code[qi] = ta.value;
    const out = root.querySelector('[data-output="' + qi + '"]');
    const res = LS.microrun.run(E.code[qi] || '', q.lang || exam.langId);
    if (out) {
      out.hidden = false;
      out.textContent = res.ok ? (res.output || '（没有输出）') : '✕ ' + res.error;
      out.classList.toggle('is-error', !res.ok);
    }
    saveDraft(LS.store.current(), exam);
  }

  function confirmSubmit(exam) {
    LS.openModal(LS.modalHead('SUBMIT', '现在交卷？', '提交后不能修改答案。未作答的题目按 0 分计。')
      + `<p class="small muted" style="margin-bottom:14px">已作答 ${Object.keys(E.answers || {}).length} 道选择题。编程题会按当前编辑器中的代码判定。</p>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>继续作答</button><button class="btn" id="really-submit">确认交卷 ${LS.icon('check', 13)}</button></div>`, {
      mount(m, ov) {
        m.querySelector('#really-submit').addEventListener('click', () => {
          LS.closeModal(ov);
          submitExam(exam, false);
        });
      }
    });
  }

  function submitExam(exam, auto) {
    const u = LS.store.current();
    if (!E || E.submitted) return;
    if (timer) { clearInterval(timer); timer = null; }
    // 从界面同步最新代码
    document.querySelectorAll('[data-code]').forEach(ta => {
      const qi = Number(ta.dataset.code);
      E.code[qi] = ta.value;
    });

    const items = exam.questions.map((q, i) => {
      if (q.type === 'choice') {
        const picked = E.answers[i];
        const ok = picked === q.answer;
        return { got: ok ? q.score : 0, ok, picked, actual: picked == null ? '' : q.options[picked], why: ok ? '' : '选项与正确答案不一致。' };
      }
      const src = E.code[i] || '';
      const run = LS.microrun.run(src, q.lang || exam.langId);
      const actual = LS.normalizeOut(run.output);
      const expected = LS.normalizeOut(q.expected);
      let mustOk = true;
      if (q.must && q.must.re) {
        try { mustOk = new RegExp(q.must.re, 'm').test(src); } catch (e) { mustOk = true; }
      }
      const ok = run.ok && actual === expected && mustOk;
      let why = '';
      if (!ok) {
        if (!run.ok) why = run.error || '代码无法执行。';
        else if (!mustOk) why = (q.must && q.must.text) || '缺少题目要求的代码结构。';
        else why = '输出与期望不一致。注意空格、换行与大小写。';
      }
      return { got: ok ? q.score : 0, ok, actual: run.output, error: run.error, why };
    });

    const score = items.reduce((s, x) => s + x.got, 0);
    const passed = score >= exam.passScore;
    const used = Math.min(exam.minutes * 60000, Date.now() - E.startedAt);
    let usedText = Math.floor(used / 60000) + ' 分 ' + Math.floor(used % 60000 / 1000) + ' 秒';
    if (auto) usedText += '（超时）';

    const choiceItems = exam.questions.map((q, i) => ({ q, i })).filter(x => x.q.type === 'choice');
    const codeItems = exam.questions.map((q, i) => ({ q, i })).filter(x => x.q.type === 'code');
    const result = {
      score, passed, items, usedText,
      choiceOk: choiceItems.filter(x => items[x.i].ok).length,
      choiceTotal: choiceItems.length,
      codeOk: codeItems.filter(x => items[x.i].ok).length,
      codeTotal: codeItems.length
    };

    if (!u.exams) u.exams = {};
    const old = u.exams[exam.id] || { best: 0, passed: false, attempts: 0 };
    const firstPass = passed && !old.passed;
    u.exams[exam.id] = {
      best: Math.max(old.best || 0, score),
      lastScore: score,
      passed: !!(old.passed || passed),
      attempts: (old.attempts || 0) + 1,
      lastAt: new Date().toISOString()
    };
    u.stats.examsPassed = Object.keys(u.exams).filter(k => u.exams[k] && u.exams[k].passed).length;
    if (firstPass) {
      LS.store.addXp(u, 150);
      LS.store.addCoins(u, 600, 'exam');
      u.inspiration = (u.inspiration || 0) + 1;
    } else {
      LS.store.addXp(u, passed ? 40 : 30);
      LS.store.addCoins(u, passed ? 180 : 30, 'exam');
    }
    LS.store.save();
    const unlocked = LS.syncTitles(u);

    E.submitted = true;
    E.result = result;
    clearDraft(u, exam);

    LS.confetti({ colors: passed ? ['#e6c98d', '#f0e3c8', '#8b3a4a', '#4f8c80', '#c9a45c'] : ['#8b7659', '#c9a45c', '#5d5145'] });
    LS.app.render();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showResult(exam, result, firstPass, unlocked);
    }, 380);
  }

  function showResult(exam, res, firstPass, unlocked) {
    LS.openModal(`<div class="modal-head"><div><div class="kicker-jp">${res.passed ? 'CERTIFIED · 及第' : 'RESULT · 未第'}</div><h2 class="title-lg" style="margin-top:6px">${res.passed ? '证书试炼通过' : '这次还差一点'}</h2><p class="muted small" style="margin-top:6px">${LS.esc(exam.name)} · ${exam.level}</p></div><button class="modal-close" data-close>✕</button></div>
      <div class="result-hero ${res.passed ? 'pass' : 'fail'}">
        <div class="rh-seal">${res.passed ? '及第' : '未第'}</div>
        <div class="rh-score"><b>${res.score}</b><span>/ ${totalScore(exam)}</span></div>
        <div class="rh-copy"><b>${res.passed ? (firstPass ? '第一张证书已写入档案' : '成绩已更新') : '解析已展开在试卷下方'}</b><span>${res.passed ? (firstPass ? '获得 150 经验、600 星辉与 1 点灵感' : '经验与星辉已记入档案') : '再读一遍解析，下一次会更接近。'}</span></div>
      </div>
      <div class="result-grid">
        <div><span>选择题</span><b>${res.choiceOk} / ${res.choiceTotal}</b></div>
        <div><span>编程题</span><b>${res.codeOk} / ${res.codeTotal}</b></div>
        <div><span>用时</span><b>${LS.esc(res.usedText)}</b></div>
      </div>
      ${unlocked && unlocked.length ? `<div class="new-titles">${unlocked.map(t => `<span class="title-chip q-${t.quality}">${t.icon} ${LS.esc(t.name)}</span>`).join('')}</div>` : ''}
      <div class="modal-actions">
        <button class="btn btn-ghost" data-close>查看试卷解析</button>
        <a class="btn" href="#/exams" data-close>返回试炼目录 ${LS.icon('arrow', 13)}</a>
      </div>`, { wide: true });
  }

  /* ---------------- entry ---------------- */
  function html(parts) {
    const u = LS.store.current();
    if (parts && parts[0] === 'exam' && parts[1]) {
      const exam = LS.examById(parts[1]);
      if (!exam) return { html: '<div class="panel" style="padding:32px"><h2>找不到这张证书</h2><a class="btn" href="#/exams">返回试炼目录</a></div>' };
      if (!E || E.examId !== exam.id) E = loadDraft(u, exam);
      if (E && E.examId === exam.id) return sessionPage(exam);
      return briefPage(exam);
    }
    return listPage();
  }

  LS.Views.exams = { html };
})(window.LS);
