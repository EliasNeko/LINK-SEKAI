/* 星海演武场 — 已点亮语言的自由练习沙盒 */
(function (LS) {
  'use strict';

  const DRAFT_PREFIX = 'lsk-train-draft-v1:';

  const STARTERS = {
    python: 'print("Hello, Link-Sekai")\n\nfor i in range(3):\n    print("咏唱", i + 1)\n',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Link-Sekai");\n    }\n}',
    c: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, Link-Sekai\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, Link-Sekai" << std::endl;\n    return 0;\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Link-Sekai")\n}',
    javascript: 'console.log("Hello, Link-Sekai");\n\nfor (let i = 1; i <= 3; i++) {\n    console.log("咏唱", i);\n}'
  };
  const FILE_NAMES = { python: 'sandbox.py', c: 'sandbox.c', cpp: 'sandbox.cpp', java: 'Main.java', go: 'main.go', javascript: 'sandbox.js' };

  function litLangs(u) {
    const ids = [];
    (u.activeLangs || []).forEach(id => { if (LS.lang(id) && !ids.includes(id)) ids.push(id); });
    if (!ids.length && u.primaryLang && LS.lang(u.primaryLang)) ids.push(u.primaryLang);
    return ids;
  }

  function draftKey(u, langId) { return DRAFT_PREFIX + (u.uid || 'anon') + ':' + langId; }

  function readDraft(u, langId) {
    try {
      const v = localStorage.getItem(draftKey(u, langId));
      if (v != null) return v;
    } catch (e) { /* ignore */ }
    return STARTERS[langId] || '';
  }

  function writeDraft(u, langId, code) {
    try { localStorage.setItem(draftKey(u, langId), code); } catch (e) { /* ignore */ }
  }

  /* 从本章天书里抽出可运行的示例代码，作为练习素材。 */
  function samplesOf(lang) {
    const out = [];
    (lang.chapters || []).forEach(ch => (ch.nodes || []).forEach(n => {
      if (n.type !== 'lesson' || !n.article) return;
      (n.article.sections || []).forEach(sec => {
        if (!sec.code || !sec.code.src) return;
        out.push({ chapter: ch.title, title: sec.h, src: sec.code.src });
      });
    }));
    return out;
  }

  function langTabs(u, current) {
    return LS.LANGS.map(l => {
      const lit = litLangs(u).includes(l.id);
      return `<button class="tr-lang ${l.id === current ? 'is-on' : ''} ${lit ? '' : 'is-locked'}" data-lang="${l.id}" style="--lang-color:${l.color}" ${lit ? '' : 'aria-disabled="true"'}>
        <span class="tr-lang-sigil">${LS.esc(l.sigil)}</span>
        <span class="tr-lang-txt"><b>${LS.esc(l.name)}</b><em>${LS.esc(l.profession)}</em></span>
        ${lit ? '<i class="tr-lang-dot" aria-hidden="true"></i>' : '<i class="tr-lang-lock" aria-hidden="true">' + LS.icon('lock', 10) + '</i>'}
      </button>`;
    }).join('');
  }

  function html() {
    const u = LS.store.current();
    const lit = litLangs(u);
    const current = lit[0] || 'python';
    const lang = LS.lang(current) || LS.LANGS[0];
    const samples = samplesOf(lang);
    return `<div class="train-page">
      <div class="page-head tr-head">
        <div>
          <div class="page-ornament">ARCANE SANDBOX · 自由练习</div>
          <h1>星海演武场</h1>
          <p>这里不是试炼，没有怪物，也不会扣血。挑一门已经点亮的语言，把想法写成能运行的程序。运行时先读英文报错，再看中文译注。</p>
        </div>
        <div class="head-actions">
          <span class="chip chip-gold">${lit.length} 门语言已点亮</span>
          <span class="chip">离线沙盒 · 不计失败</span>
        </div>
      </div>

      <div class="tr-langs" role="tablist" aria-label="练习语言">${langTabs(u, current)}</div>

      <div class="tr-grid">
        <section class="tr-editor-card" aria-label="代码编辑器">
          <div class="tr-card-top">
            <div class="tr-file"><i></i><b id="tr-file-name">${FILE_NAMES[current] || 'sandbox'}</b><span>星海演武场 · UTF-8</span></div>
            <div class="tr-tools">
              <button class="tr-icon-btn" data-font="-1" title="缩小字号" aria-label="缩小字号">A−</button>
              <button class="tr-icon-btn" data-font="1" title="放大字号" aria-label="放大字号">A+</button>
              <button class="tr-icon-btn" data-copy title="复制代码" aria-label="复制代码">${LS.icon('scroll', 13)}</button>
              <button class="tr-ghost-btn" data-reset title="恢复该语言的初始模板">模板</button>
              <button class="tr-run-btn" data-run>${LS.icon('play', 13)} 运行 <kbd>Ctrl+Enter</kbd></button>
            </div>
          </div>
          <div class="tr-editor-host" id="tr-editor" style="--lang-color:${lang.color}"></div>
          <div class="tr-samples">
            <span class="tr-samples-label">天书示例</span>
            ${samples.length ? samples.map((s, i) => `<button class="tr-sample" data-sample="${i}" title="${LS.esc(s.chapter + ' · ' + s.title)}">${LS.esc(s.title)}</button>`).join('') : '<span class="tiny faint">本章暂无示例</span>'}
          </div>
        </section>

        <section class="tr-term-card" aria-label="终端输出">
          <div class="terminal-card">
            <div class="terminal-head">
              <span class="term-dots"><i></i><i></i><i></i></span>
              <b>${LS.esc(FILE_NAMES[current] || 'sandbox')} — terminal</b>
              <span class="term-status" id="tr-term-status">待运行</span>
            </div>
            <div class="tr-term-body" id="tr-term">
              <div class="tr-hint-line"><b>Link-Sekai Sandbox</b><span>${LS.esc(lang.name)} 教学子集 · Ctrl+Enter 运行 · 输出会逐字显示</span></div>
            </div>
            <div class="tr-term-foot">
              <span>${LS.icon('terminal', 12)} stdout / stderr</span>
              <button class="tr-ghost-btn" data-clear>清空终端</button>
            </div>
          </div>
          <div class="tr-tip-card">
            <b>${LS.icon('spark', 13)} 读报错的顺序</b>
            <p>先看英文的第一行，它给出错误类型（SyntaxError / NameError / TypeError）。再看下面的中文译注，最后回到代码里找行号附近缺了什么符号。</p>
          </div>
        </section>
      </div>

      <button class="tr-fab" id="tr-fab" aria-expanded="false" aria-controls="tr-drawer" title="翻开随身天书">
        <span class="tr-fab-book" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5H15v21H7.5A2.5 2.5 0 0 0 5 28.5z"/>
            <path d="M27 7.5A2.5 2.5 0 0 0 24.5 5H17v21h7.5a2.5 2.5 0 0 1 2.5 2.5z"/>
            <path d="M9 10h3M9 14h4M20 10h3M20 14h3"/>
            <path d="M25 2.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="currentColor" stroke="none"/>
          </svg>
          <i class="tr-fab-spark"></i>
        </span>
        <span class="tr-fab-txt">天书</span>
      </button>

      <div class="tr-drawer-mask" id="tr-drawer-mask" hidden></div>
      <aside class="tr-drawer" id="tr-drawer" aria-hidden="true" aria-label="随身知识天书">
        <div class="tr-drawer-head">
          <div><div class="kicker-jp">POCKET GRIMOIRE</div><b>随身天书 · ${LS.esc(lang.name)}</b></div>
          <button class="tr-icon-btn" data-drawer-close aria-label="合上天书">${LS.icon('x', 15)}</button>
        </div>
        <div class="tr-drawer-search">${LS.icon('search', 14)}<input class="input" id="tr-book-search" placeholder="搜索知识点或术语…"></div>
        <div class="tr-drawer-langs">${litLangs(u).map(id => {
          const l = LS.lang(id);
          if (!l) return '';
          return `<button class="tr-book-lang ${id === current ? 'is-on' : ''}" data-book-lang="${id}" style="--lang-color:${l.color}">${LS.esc(l.sigil)} ${LS.esc(l.name)}</button>`;
        }).join('')}</div>
        <div class="tr-drawer-body" id="tr-book-body">${bookBody(lang, u)}</div>
      </aside>
    </div>`;
  }

  function bookBody(lang, u) {
    const chapters = (lang.chapters || []).map((ch, ci) => {
      const lessons = (ch.nodes || []).filter(n => n.type === 'lesson' && n.article);
      if (!lessons.length) return '';
      return `<section class="tr-book-chapter">
        <div class="tr-book-ch-title">${LS.esc(ch.title)}<span>${LS.esc(ch.jp)}</span></div>
        ${lessons.map(n => {
          const sections = (n.article.sections || []).map((sec, si) => {
            const code = sec.code && sec.code.src ? `<pre class="tr-book-code">${LS.esc(sec.code.src)}</pre>` : '';
            const paras = (sec.p || []).slice(0, 2).map(p => `<p>${LS.esc(p)}</p>`).join('');
            return `<details class="tr-book-sec" data-search="${LS.esc((ch.title + ' ' + n.title + ' ' + sec.h + ' ' + (sec.p || []).join(' ')).toLowerCase())}">
              <summary><span>${LS.esc(sec.h)}</span><i>${LS.esc(lang.name)}</i></summary>
              <div class="tr-book-sec-body">
                ${paras}
                ${code ? `<div class="tr-book-code-wrap">${code}<div class="tr-book-code-btns"><button class="tr-mini-btn" data-insert="${lang.id}:${n.id}:${si}">插入到光标</button><button class="tr-mini-btn" data-run-snippet="${lang.id}:${n.id}:${si}">直接运行</button></div></div>` : ''}
                ${sec.note ? `<p class="tr-book-note">${LS.esc(sec.note)}</p>` : ''}
              </div>
            </details>`;
          }).join('');
          return `<div class="tr-book-lesson">
            <div class="tr-book-lesson-head">${LS.icon('book', 13)}<b>${LS.esc(n.title)}</b><a href="#/lesson/${lang.id}/${n.id}" data-close-drawer>全文 →</a></div>
            ${sections}
          </div>`;
        }).join('')}
      </section>`;
    }).join('');
    return chapters || '<p class="tiny faint" style="padding:16px">这一门语言的天书还没有誊写章节。</p>';
  }

  function mount(root) {
    const scope = root.querySelector('.train-page') || document.getElementById('view');
    if (!scope) return;
    const u = LS.store.current();
    if (!u) return;
    const lit = litLangs(u);
    let current = lit[0] || 'python';
    let editor = null;
    let fontScale = 0;
    const host = scope.querySelector('#tr-editor');
    const term = scope.querySelector('#tr-term');
    const status = scope.querySelector('#tr-term-status');
    const fileName = scope.querySelector('#tr-file-name');
    const drawer = scope.querySelector('#tr-drawer');
    const mask = scope.querySelector('#tr-drawer-mask');
    const fab = scope.querySelector('#tr-fab');

    function starterFor(id) { return STARTERS[id] || ''; }

    function boot(id) {
      const lang = LS.lang(id) || LS.LANGS[0];
      if (editor) editor.destroy();
      host.innerHTML = '';
      editor = LS.CodeEditor.create(host, {
        lang: id,
        value: readDraft(u, id),
        title: (FILE_NAMES[id] || 'sandbox') + ' · ' + lang.name,
        keyHint: 'Tab 补全 · Ctrl+Enter 运行',
        aria: lang.name + ' 自由练习代码',
        onSubmit: submit,
        onChange(v) { writeDraft(u, id, v); }
      });
      host.style.setProperty('--lang-color', lang.color);
      applyFont();
      if (fileName) fileName.textContent = FILE_NAMES[id] || 'sandbox';
      const statusLang = scope.querySelector('.terminal-head b');
      if (statusLang) statusLang.textContent = (FILE_NAMES[id] || 'sandbox') + ' — terminal';
      status.textContent = '待运行';
    }

    function applyFont() {
      host.style.setProperty('--ce-font', (12.5 + fontScale).toFixed(1) + 'px');
      const input = host.querySelector('.ce-input');
      const layer = host.querySelector('.ce-layer');
      if (input) input.style.fontSize = (12.5 + fontScale) + 'px';
      if (layer) layer.style.fontSize = (12.5 + fontScale) + 'px';
    }

    function scrollTerm() { term.scrollTop = term.scrollHeight; }

    function entryHead(label, metaClass, meta) {
      return `<div class="tr-entry-head"><span class="tr-prompt">$</span><b>${LS.esc(label)}</b><span class="tr-meta ${metaClass || ''}">${LS.esc(meta)}</span></div>`;
    }

    function runCode(codeOverride) {
      const code = codeOverride != null ? codeOverride : editor.value;
      const lang = LS.lang(current) || LS.LANGS[0];
      const name = FILE_NAMES[current] || 'sandbox';
      status.textContent = '运行中…';
      const res = LS.microrun.run(code, current);
      try {
        u.stats = u.stats || {};
        u.stats.codeRuns = (u.stats.codeRuns || 0) + 1;
        LS.store.save();
      } catch (e) { /* ignore */ }
      let html = entryHead((lang.name + ' ' + name).trim(), res.ok ? 'ok' : 'err', res.ok ? 'exit 0 · ' + res.ms + 'ms' : 'exit 1 · ' + res.ms + 'ms');
      const out = String(res.output == null ? '' : res.output);
      if (out) html += '<pre class="term-output tr-stdout">' + LS.esc(out) + '</pre>';
      if (res.ok) {
        html += out
          ? '<div class="tr-out-ok">程序正常结束，没有写入 stderr。</div>'
          : '<pre class="term-output is-muted">（没有输出）</pre><div class="tr-out-ok">程序正常结束，只是没有 print / println。</div>';
      } else {
        const en = res.errorEn || res.error || 'RuntimeError: code failed to execute.';
        const cn = res.error || '运行失败。';
        html += '<div class="tr-error-card"><div class="tr-error-en"><span>EN</span><code>' + LS.esc(en) + '</code></div>'
          + '<div class="tr-error-cn"><span>译注</span><p>' + LS.esc(cn) + '</p></div></div>';
        html += '<div class="tr-out-hint">' + LS.icon('spark', 12) + ' 修改后再次运行。演武场不会扣血，可以放心试错。</div>';
      }
      term.insertAdjacentHTML('beforeend', html);
      status.textContent = res.ok ? '运行成功' : '运行失败';
      status.className = 'term-status ' + (res.ok ? 'is-ok' : 'is-err');
      scrollTerm();
    }

    /* 运行：同时支持 Ctrl+Enter 与按钮。 */
    let lastRun = 0;
    function submit() {
      const now = Date.now();
      if (now - lastRun < 220) return;
      lastRun = now;
      const code = editor ? editor.value : '';
      if (!String(code).trim()) {
        term.insertAdjacentHTML('beforeend', '<div class="tr-error-card"><div class="tr-error-en"><span>EN</span><code>ValueError: source code is empty.</code></div><div class="tr-error-cn"><span>译注</span><p>编辑器是空的，先写一行输出咒文。</p></div></div>');
        status.textContent = '没有代码';
        scrollTerm();
        return;
      }
      runCode(code);
    }

    scope.querySelector('[data-run]').addEventListener('click', submit);

    scope.querySelector('[data-clear]').addEventListener('click', () => {
      term.innerHTML = '<div class="tr-hint-line"><b>终端已清空</b><span>代码还在编辑器里，随时可以再次运行。</span></div>';
      status.textContent = '待运行';
      status.className = 'term-status';
    });

    scope.querySelector('[data-reset]').addEventListener('click', () => {
      if (!editor) return;
      editor.setValue(starterFor(current));
      writeDraft(u, current, starterFor(current));
      editor.focus();
      LS.toast('模板已恢复', (LS.lang(current) || {}).name + ' 的初始示例已放回编辑器。', 'gold', 'refresh');
    });

    scope.querySelector('[data-copy]').addEventListener('click', async () => {
      const text = editor ? editor.value : '';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
        else throw new Error('no clipboard');
        LS.toast('代码已复制', '可以直接粘贴到别处。', 'gold', 'scroll');
      } catch (e) {
        LS.toast('复制失败', '当前浏览器不允许自动复制，请手动选中。', 'red', 'x');
      }
    });

    scope.querySelectorAll('[data-font]').forEach(btn => btn.addEventListener('click', () => {
      fontScale = Math.max(-2, Math.min(5, fontScale + Number(btn.dataset.font || 1)));
      applyFont();
    }));

    /* 语言切换：只允许已点亮的语言。 */
    let sampleList = samplesOf(LS.lang(current) || LS.LANGS[0]);
    scope.querySelectorAll('.tr-lang').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.lang;
      if (!lit.includes(id)) {
        LS.toast('这门星轨还没有点亮', '先在星轨地图里推进该语言，或等任意语言达到 50% 后点亮新职业。', 'gold', 'lock');
        return;
      }
      if (id === current) return;
      current = id;
      scope.querySelectorAll('.tr-lang').forEach(b => b.classList.toggle('is-on', b.dataset.lang === id));
      const lang = LS.lang(id);
      sampleList = samplesOf(lang);
      const wrap = scope.querySelector('.tr-samples');
      wrap.innerHTML = '<span class="tr-samples-label">天书示例</span>' + (sampleList.length
        ? sampleList.map((s, i) => `<button class="tr-sample" data-sample="${i}" title="${LS.esc(s.chapter + ' · ' + s.title)}">${LS.esc(s.title)}</button>`).join('')
        : '<span class="tiny faint">本章暂无示例</span>');
      bindSamples();
      boot(id);
      /* 随身天书同步切换语言 */
      scope.querySelectorAll('[data-book-lang]').forEach(b => b.classList.toggle('is-on', b.dataset.bookLang === id));
      scope.querySelector('#tr-book-body').innerHTML = bookBody(lang, u);
      bindBookBody();
      term.innerHTML = '<div class="tr-hint-line"><b>' + LS.esc(lang.name) + ' 沙盒已就绪</b><span>这份草稿会自动保存到本机。</span></div>';
      status.textContent = '待运行';
      status.className = 'term-status';
      scope.querySelector('#tr-book-search').value = '';
    }));

    function bindSamples() {
      scope.querySelectorAll('[data-sample]').forEach(btn => btn.addEventListener('click', () => {
        const s = sampleList[Number(btn.dataset.sample)];
        if (!s || !editor) return;
        editor.setValue(s.src);
        writeDraft(u, current, s.src);
        editor.focus();
        LS.toast('示例已载入', s.chapter + ' · ' + s.title, 'gold', 'book');
      }));
    }
    bindSamples();

    /* ---------------- 随身天书 ---------------- */
    function openDrawer(open) {
      drawer.classList.toggle('is-open', open);
      mask.hidden = !open;
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('tr-drawer-open', open);
      if (open) {
        const input = drawer.querySelector('#tr-book-search');
        if (input && window.innerWidth > 720) setTimeout(() => input.focus({ preventScroll: true }), 160);
      }
    }
    fab.addEventListener('click', () => openDrawer(!drawer.classList.contains('is-open')));
    mask.addEventListener('click', () => openDrawer(false));
    drawer.querySelector('[data-drawer-close]').addEventListener('click', () => openDrawer(false));
    document.addEventListener('keydown', escClose);
    function escClose(e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) openDrawer(false); }

    function sectionByRef(ref) {
      const parts = String(ref || '').split(':');
      const found = LS.findNode(parts[0], parts[1]);
      if (!found || !found.node.article) return null;
      return (found.node.article.sections || [])[Number(parts[2])] || null;
    }

    function bindBookBody() {
      scope.querySelectorAll('[data-close-drawer]').forEach(a => a.addEventListener('click', () => openDrawer(false)));
      scope.querySelectorAll('[data-insert]').forEach(btn => btn.addEventListener('click', () => {
        const sec = sectionByRef(btn.dataset.insert);
        if (!sec || !sec.code || !editor) return;
        editor.insert(sec.code.src);
        LS.toast('已插入到光标处', sec.h, 'gold', 'wand');
      }));
      scope.querySelectorAll('[data-run-snippet]').forEach(btn => btn.addEventListener('click', () => {
        const sec = sectionByRef(btn.dataset.runSnippet);
        if (!sec || !sec.code) return;
        editor.setValue(sec.code.src);
        writeDraft(u, current, sec.code.src);
        runCode(sec.code.src);
        openDrawer(false);
      }));
    }
    bindBookBody();

    drawer.querySelector('#tr-book-search').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      scope.querySelectorAll('.tr-book-sec').forEach(el => {
        el.style.display = !q || (el.dataset.search || '').includes(q) || el.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    drawer.querySelectorAll('[data-book-lang]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.bookLang;
      if (id === current) return;
      if (!lit.includes(id)) return;
      current = id;
      const lang = LS.lang(id);
      sampleList = samplesOf(lang);
      boot(id);
      scope.querySelectorAll('.tr-lang').forEach(b => b.classList.toggle('is-on', b.dataset.lang === id));
      scope.querySelectorAll('[data-book-lang]').forEach(b => b.classList.toggle('is-on', b.dataset.bookLang === id));
      drawer.querySelector('.tr-drawer-head b').textContent = '随身天书 · ' + lang.name;
      scope.querySelector('#tr-book-body').innerHTML = bookBody(lang, u);
      bindBookBody();
    }));

    boot(current);
    const cleanup = () => {
      document.removeEventListener('keydown', escClose);
      document.body.classList.remove('tr-drawer-open');
    };
    window.addEventListener('hashchange', cleanup, { once: true });

    return { destroy() { cleanup(); if (editor) editor.destroy(); } };
  }

  LS.Views.training = {
    html() { return { html: html(), title: '星海演武场', sub: 'ARCANE SANDBOX' }; },
    mount(root) { return mount(root); }
  };
})(window.LS);
