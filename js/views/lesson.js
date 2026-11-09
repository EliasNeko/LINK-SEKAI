/* 天书阅览 / 剧情节点 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  const storyPlayed = {};

  function find(langId, nodeId) {
    const hit = LS.findNode(langId, nodeId);
    if (!hit) return null;
    return hit;
  }

  function nextHref(langId, node) {
    if (!node) return '#/world/' + langId;
    if (node.type === 'battle') return '#/battle/' + langId + '/' + node.id;
    if (node.type === 'story') return '#/story/' + langId + '/' + node.id;
    return '#/lesson/' + langId + '/' + node.id;
  }

  function complete(user, langId, node) {
    const first = !LS.store.progressOf(user, langId).done.includes(node.id);
    if (first) {
      const gs = LS.store.gearStats ? LS.store.gearStats(user, langId) : {};
      const xp = Math.round((node.xp || 0) * (1 + (gs.xp || 0) / 100));
      const coins = Math.round((node.coins != null ? node.coins : Math.round(14 + (node.xp || 0) * .55)) * (1 + (gs.coin || 0) / 100));
      LS.store.markDone(user, langId, node.id);
      if (node.type === 'lesson') user.stats.lessonsRead = (user.stats.lessonsRead || 0) + 1;
      LS.store.addXp(user, xp);
      LS.store.addCoins(user, coins, 'node');
      user.stats.codeRuns = user.stats.codeRuns || 0;
      if (LS.daily) {
        LS.daily.record(user, 'node', 1);
        if (node.type === 'lesson') LS.daily.record(user, 'lesson', 1);
      }
      LS.store.save();
      const unlocked = LS.syncTitles(user);
      LS.toast('天书进度 +1', node.title + ' · +' + xp + ' 经验 · +' + coins + ' 星辉', 'gold', 'book');
      if (unlocked.length) setTimeout(() => LS.toast('新称号解锁', unlocked.map(t => t.name).join(' / '), 'gold', 'spark'), 500);
    }
    return first;
  }

  /* ---------------- story ---------------- */
  function storyPage(langId, nodeId) {
    const u = LS.store.current();
    const hit = find(langId, nodeId);
    if (!hit || hit.node.type !== 'story') return { html: '<div class="panel" style="padding:30px">这不是一个剧情节点。</div>' };
    const { node, chapter, lang } = hit;
    const next = LS.nextNodeId(langId, nodeId);
    const nextNode = next ? LS.findNode(langId, next).node : null;
    const done = LS.store.progressOf(u, langId).done.includes(nodeId);

    return {
      html: `<div class="story-page" style="--lang-color:${lang.color}">
        <div class="story-bg"></div>
        <div class="breadcrumbs"><a href="#/world">星轨地图</a><i>/</i><a href="#/world/${langId}">${LS.esc(lang.name)}</a><i>/</i><span>${LS.esc(node.title)}</span></div>
        <div class="story-scene">
          <div class="story-scene-head">
            <div class="kicker-jp">${LS.esc(chapter.jp)} · STORY</div>
            <h1>${LS.esc(node.title)}</h1>
            <p>${LS.esc(chapter.title)} · ${LS.esc(chapter.subtitle)}</p>
          </div>
          <div class="story-cast">
            <div class="story-cast-player">${LS.charImg(Object.assign({ langId: langId }, u.char || LS.defaultChar(langId)), 180)}</div>
            <div class="story-cast-sigil">${LS.esc(lang.sigil)}</div>
            <div class="story-cast-ally"><span class="sca-img">${LS.npcImg(langId, 150)}</span><b>${LS.esc((LS.ALLY[langId] || {}).name || '界灵·零')}</b><span>${LS.esc(lang.profession)}同席</span></div>
          </div>
          <div class="story-scroll paper corner-mark">
            <div class="ss-top"><span class="kicker-jp">対話記録 · DIALOGUE</span><span class="chip chip-gold">+${node.xp} 经验</span></div>
            ${(node.lines || []).map(l => `<div class="story-line tone-${l.tone || 'guide'}">
              <div class="sl-who">${LS.esc(l.who)}</div>
              <p>${LS.esc(l.text)}</p>
            </div>`).join('')}
          </div>
          <div class="story-actions">
            ${done ? '' : '<button class="btn btn-ghost" id="replay-story">重播对话</button>'}
            <button class="btn" id="story-next">${done ? '继续' : '读完这段，继续'} ${LS.icon('arrow', 14)}</button>
          </div>
        </div>
      </div>`,
      mount(root) {
        const replay = root.querySelector('#replay-story');
        const startDialogue = () => LS.dialogue({
          title: node.title, jp: chapter.jp, langId, lines: node.lines || []
        });
        if (replay) replay.addEventListener('click', startDialogue);
        root.querySelector('#story-next').addEventListener('click', () => {
          complete(u, langId, node);
          if (nextNode) LS.app.go(nextHref(langId, nextNode));
          else LS.app.go('#/world/' + langId);
        });

        const key = u.uid + ':' + nodeId;
        if (!done && !storyPlayed[key]) {
          storyPlayed[key] = true;
          startDialogue().then(() => {
            complete(u, langId, node);
            LS.app.render();
          });
        }
      }
    };
  }

  /* ---------------- lesson ---------------- */
  function codeBlock(code, index, langId) {
    const src = code.src || '';
    const encoded = encodeURIComponent(src);
    const lang = code.lang || langId;
    const canRun = code.runnable !== false;
    return `<div class="code-block-wrap">
      <div class="code-block-head">
        <span class="cb-lang">${LS.esc((LS.lang(lang) || {}).name || lang)}</span>
        <span class="cb-dots"><i></i><i></i><i></i></span>
        <div class="cb-actions">
          ${canRun ? `<button class="cb-btn" data-run-code="${encoded}" data-lang="${LS.esc(lang)}">${LS.icon('play', 11)} 运行</button>` : '<span class="cb-btn is-static" title="这一示例用于阅读语法结构，不在教学终端内执行">概念示例</span>'}
          <button class="cb-btn" data-copy-code="${encoded}">${LS.icon('scroll', 11)} 复制</button>
        </div>
      </div>
      <pre class="code-block"><code>${LS.highlight(src, lang)}</code></pre>
      <div class="code-output" hidden><div class="co-head"><span>终端输出</span><button class="co-close">✕</button></div><pre></pre></div>
    </div>`;
  }

  function lessonPage(langId, nodeId) {
    const u = LS.store.current();
    const hit = find(langId, nodeId);
    if (!hit || hit.node.type !== 'lesson') return { html: '<div class="panel" style="padding:30px">这不是一个天书节点。</div>' };
    const { node, chapter, lang } = hit;
    const a = node.article || {};
    const done = LS.store.progressOf(u, langId).done.includes(nodeId);
    const next = LS.nextNodeId(langId, nodeId);
    const nextNode = next ? LS.findNode(langId, next).node : null;
    const nodes = LS.allNodes(langId);
    const doneSet = LS.store.progressOf(u, langId).done;
    const chNodes = chapter.nodes;

    return {
      html: `<div class="lesson-page" style="--lang-color:${lang.color}">
        <div class="breadcrumbs"><a href="#/world">星轨地图</a><i>/</i><a href="#/world/${langId}">${LS.esc(lang.name)}</a><i>/</i><span>${LS.esc(node.title)}</span></div>
        <div class="lesson-layout">
          <main class="lesson-main">
            <header class="lesson-head">
              <div class="kicker-jp">${LS.esc(chapter.jp)} · CODEX</div>
              <h1>${LS.esc(node.title)}</h1>
              <p>${LS.esc(node.jp)} · ${LS.esc(chapter.title)}</p>
              <div class="lesson-meta">
                <span class="chip chip-gold">${LS.esc(lang.profession)}</span>
                <span class="chip">${node.minutes || 15} 分钟</span>
                <span class="chip">+${node.xp} 经验</span>
                ${done ? '<span class="chip chip-cyan">已读</span>' : '<span class="chip">未读</span>'}
                <button class="btn btn-ghost btn-sm" id="ask-guide">${LS.icon('spark', 11)} 书灵引读</button>
              </div>
            </header>

            <article class="grimoire paper corner-mark">
              <div class="grimoire-top"><span class="kicker-jp">知識の書 · GRIMOIRE</span><span class="vertical-jp">${LS.esc(lang.sigil)}</span></div>
              <p class="article-lead">${LS.esc(a.lead || '')}</p>
              ${(a.sections || []).map((s, si) => `<section class="article-section">
                <h2>${LS.esc(s.h)}</h2>
                ${(s.p || []).map(p => `<p>${LS.esc(p)}</p>`).join('')}
                ${s.code ? codeBlock(s.code, si, langId) : ''}
                ${s.note ? `<div class="article-note"><span>✦</span><p>${LS.esc(s.note)}</p></div>` : ''}
              </section>`).join('')}
              ${a.exam ? `<div class="exam-callout"><div class="ec-icon">${LS.icon('trophy', 18)}</div><div><b>考纲摘记 · EXAM NOTE</b><p>${LS.esc(a.exam)}</p></div></div>` : ''}
              ${(a.checklist || []).length ? `<div class="checklist"><div class="kicker-jp">READY CHECK · 自查</div>${a.checklist.map(c => `<div class="check-row"><i>✓</i><span>${LS.esc(c)}</span></div>`).join('')}</div>` : ''}
            </article>

            ${(a.terms || []).length ? `<section class="terms-section">
              <div class="section-head"><div><div class="kicker-jp">GLOSSARY · 术语</div><h2>这一页的词</h2></div></div>
              <div class="term-grid">${a.terms.map(t => `<div class="term-card"><b>${LS.esc(t.t)}</b>${t.en ? `<span class="mono">${LS.esc(t.en)}</span>` : ''}<p>${LS.esc(t.d)}</p></div>`).join('')}</div>
            </section>` : ''}

            <div class="lesson-actions">
              <a class="btn btn-ghost" href="#/world/${langId}">返回章节</a>
              <button class="btn btn-lg" id="finish-lesson">${done ? '继续下一节点' : '读完了，前往下一节点'} ${LS.icon('arrow', 14)}</button>
            </div>
          </main>

          <aside class="lesson-aside">
            <div class="lesson-progress paper">
              <div class="kicker-jp">${LS.esc(lang.name)} · PROGRESS</div>
              <div class="lp-number">${LS.progressPct(u, langId)}<small>%</small></div>
              <div class="progress"><i style="width:${LS.progressPct(u, langId)}%"></i></div>
              <div class="lp-copy">${LS.doneCount(u, langId)} / ${nodes.length} 节点完成</div>
              <div class="lp-nodes">
                ${chNodes.map(n => `<a class="lp-node ${doneSet.includes(n.id) ? 'done' : n.id === nodeId ? 'current' : ''}" href="${nextHref(langId, n)}">
                  <i>${doneSet.includes(n.id) ? '✓' : n.type === 'battle' ? '⚔' : n.type === 'story' ? '☾' : '✎'}</i><span>${LS.esc(n.title)}</span>
                </a>`).join('')}
              </div>
            </div>
            <div class="lesson-tip">
              <b>读法建议</b>
              <p>先看懂示例，再亲手改动一处，然后运行。看懂不等于会写，改一次比读三遍有效。</p>
            </div>
            <div class="lesson-equip">
              <div class="kicker-jp">当前装备 · HINTS</div>
              ${(() => { const it = LS.store.equippedItem(u, langId); const n = LS.store.hintCount(u, langId); return it ? `<div class="le-item">${LS.itemArtHTML(it, 'le-art', it.name)}<div><b>${LS.esc(it.name)}</b><span class="${it.infusion ? 'q-infused' : ''}">${LS.itemQuality(it).name} · 可查看 ${n} 条提示</span></div></div>` : `<p class="small muted">这件职业还没有装备武器。战斗胜利后会获得第一件装备。</p>`; })()}
            </div>
          </aside>
        </div>
      </div>`,
      mount(root) {
        const u2 = LS.store.current();
        root.querySelectorAll('[data-run-code]').forEach(btn => btn.addEventListener('click', () => {
          const src = decodeURIComponent(btn.dataset.runCode || '');
          const lang = btn.dataset.lang || langId;
          const wrap = btn.closest('.code-block-wrap');
          const out = wrap.querySelector('.code-output');
          const pre = out.querySelector('pre');
          const res = LS.microrun.run(src, lang);
          out.hidden = false;
          pre.textContent = res.ok ? (res.output || '（没有输出）') : '✕ ' + res.error;
          pre.classList.toggle('is-error', !res.ok);
          u2.stats.codeRuns = (u2.stats.codeRuns || 0) + 1;
          LS.store.save();
          out.querySelector('.co-close').onclick = () => { out.hidden = true; };
        }));
        root.querySelectorAll('[data-copy-code]').forEach(btn => btn.addEventListener('click', () => {
          LS.copy(decodeURIComponent(btn.dataset.copyCode || ''));
        }));
        root.querySelector('#ask-guide').addEventListener('click', () => {
          const ally = LS.ALLY[langId] || { name: '界灵·零' };
          LS.dialogue({
            title: node.title, jp: '書霊の引読', langId,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '这一页不是要你背下来。先找一个你能改的数字，运行一次，看看输出怎么变。' },
              { who: ally.name, tone: 'ally', text: '看不懂的术语先跳过，等它在代码里出现第二次时，你自然会懂。阅读也是这样。' },
              { who: u2.gameName, tone: 'player', text: '那我先跑一遍示例，再改一处。' }
            ]
          });
        });
        root.querySelector('#finish-lesson').addEventListener('click', () => {
          complete(u2, langId, node);
          if (nextNode) LS.app.go(nextHref(langId, nextNode));
          else LS.app.go('#/world/' + langId);
        });
      }
    };
  }

  LS.Views.lesson = {
    html(parts) {
      const langId = parts[1], nodeId = parts[2];
      if (!langId || !nodeId) return { html: '<div class="panel" style="padding:30px">缺少节点参数。</div>' };
      const hit = find(langId, nodeId);
      if (!hit) return { html: '<div class="panel" style="padding:30px">节点不存在。</div>' };
      return hit.node.type === 'story' ? storyPage(langId, nodeId) : lessonPage(langId, nodeId);
    }
  };
})(window.LS);
