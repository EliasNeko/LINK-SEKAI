/* 星轨地图 + 知识天书 */
(function (LS) {
  'use strict';
  LS.Views = LS.Views || {};

  function nodeHref(langId, node) {
    if (node.type === 'battle') return '#/battle/' + langId + '/' + node.id;
    if (node.type === 'story') return '#/story/' + langId + '/' + node.id;
    return '#/lesson/' + langId + '/' + node.id;
  }

  /* 壁纸曝光补偿：六张 wp_*.png 原图明暗差异极大（python 平均亮度 10.6、go 31.8、
     cpp 48.6，而 c 205、java 166、javascript 144）。统一叠深色蒙版时暗图完全看不见，
     所以按图给 brightness / opacity / saturation。改图后要重新量一遍亮度再调这里。 */
  const WP_EXPO = {
    python:     { boost: 3.3,  op: .95, sat: 1.2 },
    go:         { boost: 1.3,  op: .75, sat: 1.1 },
    cpp:        { boost: 1.35, op: .78, sat: 1.1 },
    c:          { boost: .45,  op: .75, sat: 1.1 },
    java:       { boost: .6,   op: .75, sat: 1.1 },
    javascript: { boost: .55,  op: .72, sat: 1.1 }
  };
  function wpStyle(langId) {
    const e = WP_EXPO[langId] || WP_EXPO.python;
    return `--lang-bg:url('../assets/heroes/wp_${langId}.webp?v=${LS.ASSET_V}');` +
      `--lang-bg-boost:${e.boost};--lang-bg-op:${e.op};--lang-bg-sat:${e.sat}`;
  }

  function nextNode(user, langId) {
    return LS.allNodes(langId).find(n => !LS.store.progressOf(user, langId).done.includes(n.id)) || null;
  }

  function overview() {
    const u = LS.store.current();
    const active = LS.activeLangDefs(u);
    const inactive = LS.LANGS.filter(l => !(u.activeLangs || []).includes(l.id));
    const canAdd = LS.canAddLanguage(u);
    const totalDone = (u.activeLangs || []).reduce((s, id) => s + LS.doneCount(u, id), 0);

    return `<div class="world-page">
      <div class="page-head">
        <div><div class="page-ornament">WORLD MAP · 星轨地图</div><h1>选择一条要继续走的路</h1><p>每一种语言都是一条独立星轨。已修星轨会保留全部进度与装备；额外星轨需任意一门达到 50% 才能开启。</p></div>
        <div class="head-actions"><a class="btn btn-ghost btn-sm" href="#/codex">${LS.icon('book', 13)} 知识天书</a><a class="btn btn-ghost btn-sm" href="#/exams">${LS.icon('trophy', 13)} 证书试炼</a></div>
      </div>

      <div class="world-summary">
        <div class="ws-item"><span>已修星轨</span><b>${active.length}</b></div>
        <div class="ws-item"><span>完成节点</span><b>${totalDone}</b></div>
        <div class="ws-item"><span>旅人等级</span><b>Lv.${LS.levelFromXp(u.xp || 0).level}</b></div>
        <div class="ws-item"><span>星辉</span><b>${LS.formatNum(u.coins || 0)}</b></div>
      </div>

      <section class="atlas-scene" id="atlas-scene">
        <canvas id="atlas-canvas" aria-label="可点击的三维星轨浮岛地图"></canvas>
        <div class="atlas-caption">
          <span class="kicker-jp">ASTRA ARCHIPELAGO</span>
          <b>源核浮岛 · 六条星轨</b>
          <p>点击浮岛，展开该语言地区的章节与关卡。</p>
        </div>
        <div class="atlas-tip">${LS.icon('spark', 12)} 悬停高亮 · 点击进入地区</div>
        <aside class="atlas-drawer" id="atlas-drawer" aria-hidden="true">
          <button class="ad-close" data-ad-close aria-label="收起地区面板">×</button>
          <div class="ad-content" id="ad-content"></div>
        </aside>
      </section>

      <div class="atlas-index">
        ${LS.LANGS.map(l => {
          const on = (u.activeLangs || []).includes(l.id);
          const pct = on ? LS.progressPct(u, l.id) : 0;
          return `<button class="atlas-chip ${on ? 'on' : 'off'}" data-region="${l.id}" style="--lang-color:${l.color}">
            <i>${LS.esc(l.sigil)}</i>
            <span>${LS.esc(l.name)}</span>
            <em>${on ? pct + '%' : '未点亮'}</em>
          </button>`;
        }).join('')}
      </div>

      <div class="world-note"><span>✦</span><p>规则写在这里：初始最多两门；此后每增加一门，都需要已有星轨中任意一门达到 50%。这不是限制，而是让你真的走到能看见风景的地方。</p></div>
    </div>`;
  }

  /* ---------------- 3D star atlas ---------------- */
  function hexToRgb(hex) {
    hex = String(hex || '#7aa').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }
  function tint(hex, target, t) {
    const a = hexToRgb(hex), b = hexToRgb(target);
    const to = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + to(a.r + (b.r - a.r) * t) + to(a.g + (b.g - a.g) * t) + to(a.b + (b.b - a.b) * t);
  }
  function rgbaOf(hex, a) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  const shadeHex = (hex, amt) => tint(hex, amt < 0 ? '#05070f' : '#ffffff', Math.abs(amt) / 100);
  const REGION_NAMES = {
    python: '月影终端', java: '暮钟学院', c: '雾港疗养院',
    javascript: '流光商城', cpp: '齿轮工坊', go: '星港灯塔'
  };

  function regionDrawerHTML(l, u, canAdd) {
    const on = (u.activeLangs || []).includes(l.id);
    const pct = on ? LS.progressPct(u, l.id) : 0;
    const doneSet = LS.store.progressOf(u, l.id).done;
    const nodes = LS.allNodes(l.id);
    const next = nextNode(u, l.id);
    const chapters = l.chapters.map((ch, ci) => {
      const d = ch.nodes.filter(n => doneSet.includes(n.id)).length;
      const p = Math.round(d / ch.nodes.length * 100);
      return `<div class="ad-chapter">
        <span class="ad-ch-index">${String(ci + 1).padStart(2, '0')}</span>
        <div class="ad-ch-copy"><b>${LS.esc(ch.title)}</b><em>${LS.esc(ch.jp)}</em></div>
        <div class="ad-ch-meta"><i style="width:${p}%"></i><span>${d}/${ch.nodes.length}</span></div>
      </div>`;
    }).join('');
    return `<div class="ad-head" style="--lang-color:${l.color};${wpStyle(l.id)}">
        <div class="ad-sigil">${LS.esc(l.sigil)}</div>
        <div><span class="kicker-jp">${LS.esc(l.name)} · ${LS.esc(l.jp)} · ${LS.esc(l.professionJp)}</span>
        <h2>${LS.esc(REGION_NAMES[l.id] || l.name)}</h2>
        <p>${LS.esc(l.profession)} · ${LS.esc(l.element)}属性 · 武器 ${LS.esc(l.weapon)}</p></div>
      </div>
      <p class="ad-intro">${LS.esc(l.worldIntro)}</p>
      ${on ? `<div class="ad-stats"><span class="chip chip-gold">${pct}% 完成</span><span class="chip">${doneSet.length} / ${nodes.length} 节点</span></div>
        <div class="ad-chapters">${chapters}</div>
        <div class="ad-foot">
          <a class="btn" href="#/world/${l.id}">进入地区 ${LS.icon('chevron', 13)}</a>
          ${next ? `<a class="btn btn-ghost" href="${nodeHref(l.id, next)}">继续 · ${LS.esc(next.title)}</a>` : '<span class="chip chip-gold">本卷已完成</span>'}
        </div>`
      : `<div class="ad-locked">
          <p>${canAdd.ok ? '这条星轨还在雾里若隐若现。点亮它，把新的职业与章节收进你的地图。' : LS.esc(canAdd.reason) + '，之后才能点亮新的浮岛。'}</p>
          ${canAdd.ok ? `<button class="btn" data-add-lang="${l.id}">开启星轨 ${LS.icon('plus', 12)}</button>` : `<span class="chip">${LS.icon('lock', 12)} 尚未解锁</span>`}
        </div>`}`;
  }

  function bindAtlas(root) {
    const scene = root.querySelector('#atlas-scene');
    const canvas = root.querySelector('#atlas-canvas');
    if (!scene || !canvas) return;
    const ctx = canvas.getContext('2d');
    const drawer = root.querySelector('#atlas-drawer');
    const adContent = root.querySelector('#ad-content');
    let W = 0, H = 0, dpr = 1, raf = 0, hover = -1, selected = null;
    const user = LS.store.current();
    const activeSet = new Set(user.activeLangs || []);
    const islands = LS.LANGS.map((l, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 3;
      return { l, x: Math.cos(a), y: Math.sin(a), phase: i * 1.9, i };
    });
    const stars = Array.from({ length: 120 }, (_, i) => ({
      x: (Math.sin(i * 127.1) * 0.5 + 0.5),
      y: (Math.sin(i * 311.7) * 0.5 + 0.5),
      r: (Math.sin(i * 74.3) * 0.5 + 0.5) * 1.3 + 0.3,
      p: i * 0.7
    }));

    function resize() {
      const rect = scene.getBoundingClientRect();
      W = Math.max(320, Math.round(rect.width));
      H = Math.max(360, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(scene); }

    function geo() {
      const s = Math.max(0.52, Math.min(W / 1180, H / 640));
      return { cx: W / 2, cy: H * 0.53, s, rx: 355 * s, ry: 145 * s, rw: 84 * s, rh: 33 * s };
    }
    function islandPos(isl, g, t, boost) {
      const bob = Math.sin(t / 1500 + isl.phase) * 3 * g.s;
      let sx = g.cx + isl.x * g.rx;
      const sy = g.cy + isl.y * g.ry;
      const half = g.rw * (boost ? 1.06 : 1) + 14;
      sx = Math.max(half, Math.min(W - half, sx));
      return { sx, sy, topY: sy - 82 * g.s + bob, bob };
    }

    function ellipse(x, y, rx, ry, fill, stroke, lw) {
      ctx.beginPath();
      ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }

    function drawCore(t, g) {
      const cx = g.cx, cy = g.cy - 22 * g.s;
      const pulse = 0.75 + Math.sin(t / 900) * 0.18;
      const gr = ctx.createRadialGradient(cx, cy, 4, cx, cy, 92 * g.s);
      gr.addColorStop(0, 'rgba(255,232,168,' + (0.42 * pulse) + ')');
      gr.addColorStop(0.45, 'rgba(120,214,255,' + (0.14 * pulse) + ')');
      gr.addColorStop(1, 'rgba(120,214,255,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(cx - 100 * g.s, cy - 100 * g.s, 200 * g.s, 200 * g.s);
      // orbit rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t / 7000);
      ctx.strokeStyle = 'rgba(216,179,107,.28)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, 58 * g.s, 20 * g.s, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(-t / 4700);
      ctx.strokeStyle = 'rgba(140,220,255,.24)';
      ctx.beginPath(); ctx.ellipse(0, 0, 40 * g.s, 13 * g.s, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // crystal
      const h = 38 * g.s;
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + 13 * g.s, cy - h * 0.24);
      ctx.lineTo(cx + 9 * g.s, cy + h * 0.75);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx - 9 * g.s, cy + h * 0.75);
      ctx.lineTo(cx - 13 * g.s, cy - h * 0.24);
      ctx.closePath();
      const cg = ctx.createLinearGradient(cx, cy - h, cx, cy + h);
      cg.addColorStop(0, '#fff4d0');
      cg.addColorStop(0.4, '#9fe6ff');
      cg.addColorStop(1, '#4b7bd6');
      ctx.fillStyle = cg;
      ctx.shadowColor = 'rgba(140,230,255,.9)';
      ctx.shadowBlur = 26;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(214,228,250,.55)';
      ctx.font = '600 ' + Math.max(9, 10 * g.s) + 'px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SOURCE CORE · 源核', cx, cy - h - 16 * g.s);
    }

    function drawIsland(isl, t, g, boost) {
      const l = isl.l;
      const on = activeSet.has(l.id);
      const { sx, sy, topY } = islandPos(isl, g, t, boost);
      const rw = g.rw * (boost ? 1.06 : 1), rh = g.rh * (boost ? 1.06 : 1);
      const depth = 92 * g.s;
      const pct = on ? LS.progressPct(user, l.id) : 0;
      const col = on ? l.color : tint(l.color, '#5c6880', 0.55);
      // ground shadow
      const sg = ctx.createRadialGradient(sx, sy + 18 * g.s, 4, sx, sy + 18 * g.s, rw * 1.25);
      sg.addColorStop(0, 'rgba(0,0,0,.5)');
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(sx - rw * 1.4, sy - 6 * g.s, rw * 2.8, 54 * g.s);
      // glow halo
      if (on) {
        const gg = ctx.createRadialGradient(sx, topY + 18 * g.s, rw * 0.3, sx, topY + 18 * g.s, rw * 1.55);
        gg.addColorStop(0, rgbaOf(l.color, boost ? 0.3 : 0.16));
        gg.addColorStop(1, rgbaOf(l.color, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(sx - rw * 1.7, topY - rw, rw * 3.4, rw * 2.4);
      }
      // rock underside — irregular floating-island silhouette
      const bw = rw * 0.68;
      ctx.beginPath();
      ctx.moveTo(sx - rw * 0.94, topY);
      ctx.lineTo(sx - rw * 0.79, topY + depth * 0.26);
      ctx.lineTo(sx - rw * 0.6, topY + depth * 0.52);
      ctx.lineTo(sx - bw * 0.62, topY + depth * 0.78);
      ctx.lineTo(sx - bw * 0.26, topY + depth * 1.04);
      ctx.lineTo(sx + bw * 0.06, topY + depth * 0.88);
      ctx.lineTo(sx + bw * 0.34, topY + depth * 1.1);
      ctx.lineTo(sx + bw * 0.66, topY + depth * 0.84);
      ctx.lineTo(sx + rw * 0.58, topY + depth * 0.56);
      ctx.lineTo(sx + rw * 0.79, topY + depth * 0.3);
      ctx.lineTo(sx + rw * 0.94, topY);
      ctx.closePath();
      const rg = ctx.createLinearGradient(sx, topY, sx, topY + depth);
      rg.addColorStop(0, shadeHex(col, -38));
      rg.addColorStop(0.55, shadeHex(col, -66));
      rg.addColorStop(1, '#05070f');
      ctx.fillStyle = rg;
      ctx.fill();
      // rock facets
      ctx.beginPath();
      ctx.moveTo(sx + 2, topY + 2);
      ctx.lineTo(sx + bw * 0.62, topY + depth * 0.84);
      ctx.lineTo(sx + rw * 0.78, topY + depth * 0.34);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx - 4, topY + 3);
      ctx.lineTo(sx - bw * 0.6, topY + depth * 0.76);
      ctx.lineTo(sx - rw * 0.7, topY + depth * 0.3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fill();
      // strata
      ctx.strokeStyle = 'rgba(255,255,255,.09)';
      ctx.lineWidth = 1;
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.ellipse(sx, topY + k * 13 * g.s, rw * (0.9 - k * 0.08), rh * 0.5, 0, 0.18, Math.PI - 0.18);
        ctx.stroke();
      }
      // cliff rim under the top plate
      ellipse(sx, topY + 4 * g.s, rw * 0.97, rh * 0.95, shadeHex(col, -54));
      // floating debris
      for (let k = 0; k < 3; k++) {
        const ox = (k - 1) * rw * 0.52 + Math.sin(t / 1200 + isl.phase + k) * 3 * g.s;
        const oy = topY + depth * (0.82 + k * 0.12) + Math.cos(t / 1400 + k) * 2 * g.s;
        ellipse(sx + ox, oy, (5 - k) * g.s, (3 - k * 0.6) * g.s, shadeHex(col, -62));
      }
      // top plate
      const tg = ctx.createLinearGradient(sx, topY - rh, sx, topY + rh);
      tg.addColorStop(0, tint(col, '#ffffff', 0.34));
      tg.addColorStop(0.5, col);
      tg.addColorStop(1, shadeHex(col, -30));
      ellipse(sx, topY, rw, rh, tg);
      ellipse(sx, topY, rw - 1, rh - 1, null, rgbaOf(l.color, on ? 0.85 : 0.3), 1.5);
      ellipse(sx, topY, rw * 0.64, rh * 0.64, null, 'rgba(255,255,255,.22)', 1);
      // rune ring
      ctx.save();
      ctx.translate(sx, topY);
      ctx.rotate(t / 9000 + isl.phase);
      ctx.strokeStyle = 'rgba(255,255,255,.28)';
      ctx.setLineDash([3, 7]);
      ctx.beginPath(); ctx.ellipse(0, 0, rw * 0.8, rh * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // sigil
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 ' + Math.round(22 * g.s) + 'px "Noto Serif SC", serif';
      ctx.fillStyle = on ? 'rgba(9,14,26,.82)' : 'rgba(9,14,26,.55)';
      ctx.fillText(l.sigil, sx, topY + 1);
      // label plaque
      const labelW = Math.min(168 * g.s + 40, 186);
      const labelH = 38 * g.s;
      // outer islands use a side callout, center islands use a plaque beneath
      const side = Math.abs(isl.x) > 0.3;
      const topCenter = isl.y < -0.8;
      const lx = side ? (isl.x < 0 ? sx - rw - 12 * g.s - labelW : sx + rw + 12 * g.s) : sx - labelW / 2;
      const ly = side ? topY - labelH / 2 : topCenter ? topY - rh - labelH - 13 * g.s : sy + 30 * g.s;
      if (W >= 860) {
        if (side) {
          const mid = ly + labelH / 2;
          const edge = isl.x < 0 ? lx + labelW : lx;
          const from = isl.x < 0 ? sx - rw : sx + rw;
          ctx.strokeStyle = rgbaOf(l.color, 0.3);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(from, mid);
          ctx.lineTo(edge, mid);
          ctx.stroke();
          ctx.fillStyle = rgbaOf(l.color, 0.7);
          ctx.fillRect(edge - 1.5, mid - 1.5, 3, 3);
        }
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(lx, ly, labelW, labelH, 8 * g.s) : ctx.rect(lx, ly, labelW, labelH);
        ctx.fillStyle = on ? 'rgba(7,11,22,.72)' : 'rgba(7,11,22,.55)';
        ctx.fill();
        ctx.strokeStyle = on ? rgbaOf(l.color, boost ? 0.9 : 0.5) : 'rgba(140,152,180,.24)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = on ? '#f7f2e6' : 'rgba(220,226,240,.55)';
        ctx.font = '600 ' + Math.max(11, 14 * g.s) + 'px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(l.name, lx + 10 * g.s, ly + 16 * g.s);
        ctx.textAlign = 'right';
        ctx.font = '600 ' + Math.max(9, 10 * g.s) + 'px "Noto Sans SC", sans-serif';
        ctx.fillStyle = on ? rgbaOf(l.color, 0.95) : 'rgba(160,170,195,.5)';
        ctx.fillText(on ? pct + '%' : '未点亮', lx + labelW - 10 * g.s, ly + 16 * g.s);
        ctx.textAlign = 'left';
        ctx.font = Math.max(8, 9.5 * g.s) + 'px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(190,200,220,.55)';
        ctx.fillText((REGION_NAMES[l.id] || l.jp) + ' · ' + l.profession, lx + 10 * g.s, ly + 29 * g.s);
        // progress line
        if (on) {
          ctx.fillStyle = 'rgba(255,255,255,.12)';
          ctx.fillRect(lx + 8 * g.s, ly + labelH - 4 * g.s, labelW - 16 * g.s, 2);
          ctx.fillStyle = rgbaOf(l.color, 0.9);
          ctx.fillRect(lx + 8 * g.s, ly + labelH - 4 * g.s, (labelW - 16 * g.s) * pct / 100, 2);
        }
      }
      if (boost) {
        ellipse(sx, topY, rw + 6 * g.s, rh + 6 * g.s, null, rgbaOf(l.color, 0.55), 1.5);
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.font = '600 ' + Math.max(9, 10 * g.s) + 'px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('点击查看', sx, topCenter ? topY + rh + 20 * g.s : topY - rh - 12 * g.s);
      }
      return { sx, sy, topY, rw, rh };
    }

    function draw(t) {
      if (!canvas.isConnected) { cancelAnimationFrame(raf); return; }
      const g = geo();
      ctx.clearRect(0, 0, W, H);
      // nebula wash
      const bg = ctx.createRadialGradient(g.cx, g.cy * 0.9, 40, g.cx, g.cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, 'rgba(44,62,110,.38)');
      bg.addColorStop(0.55, 'rgba(16,23,46,.26)');
      bg.addColorStop(1, 'rgba(4,6,14,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // stars
      for (const st of stars) {
        const a = 0.18 + (Math.sin(t / 1300 + st.p) * 0.5 + 0.5) * 0.5;
        ctx.fillStyle = 'rgba(210,230,255,' + a.toFixed(3) + ')';
        ctx.fillRect(st.x * W, st.y * H, st.r, st.r);
      }
      // orbit rail
      ctx.save();
      ctx.strokeStyle = 'rgba(168,196,240,.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(216,179,107,.12)';
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, g.rx * 0.72, g.ry * 0.72, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // distant islets for depth
      [[.15, .27, 15], [.85, .31, 11], [.21, .74, 9], [.8, .77, 13], [.48, .12, 7], [.52, .88, 8]].forEach((sp, i) => {
        const x = sp[0] * W, y = sp[1] * H + Math.sin(t / 2200 + i * 1.3) * 3;
        const r = sp[2] * g.s;
        ellipse(x, y, r, r * 0.38, 'rgba(28,42,78,.6)');
        ctx.beginPath();
        ctx.moveTo(x - r, y);
        ctx.lineTo(x - r * 0.35, y + r * 1.05);
        ctx.lineTo(x + r * 0.25, y + r * 0.86);
        ctx.lineTo(x + r, y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15,23,44,.62)';
        ctx.fill();
        ellipse(x, y, r * 0.62, r * 0.22, 'rgba(150,190,235,.14)');
      });
      // compass rose at the base of the chart
      const cxm = g.cx, cym = H - 34 * g.s;
      ctx.strokeStyle = 'rgba(216,179,107,.18)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cxm, cym, 22 * g.s, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cxm, cym, 14 * g.s, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.translate(cxm, cym);
      ctx.rotate(t / 14000);
      ctx.fillStyle = 'rgba(216,179,107,.3)';
      ctx.beginPath();
      ctx.moveTo(0, -13 * g.s); ctx.lineTo(3 * g.s, 0); ctx.lineTo(0, 13 * g.s); ctx.lineTo(-3 * g.s, 0);
      ctx.closePath(); ctx.fill();
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(160,200,240,.2)';
      ctx.beginPath();
      ctx.moveTo(0, -8 * g.s); ctx.lineTo(2 * g.s, 0); ctx.lineTo(0, 8 * g.s); ctx.lineTo(-2 * g.s, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      // painter order: core then islands by depth
      drawCore(t, g);
      const order = islands.slice().sort((a, b) => a.y - b.y);
      for (const isl of order) drawIsland(isl, t, g, hover === isl.i);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function hitTest(ev) {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      const g = geo();
      let found = -1;
      islands.forEach(isl => {
        const { sx, sy, topY } = islandPos(isl, g, performance.now(), false);
        const pad = 12;
        let hit = x > sx - g.rw - pad && x < sx + g.rw + pad && y > topY - g.rh - 18 && y < sy + 74 * g.s;
        if (W >= 860) {
          const lw = Math.min(168 * g.s + 40, 186), lh = 38 * g.s;
          const side = Math.abs(isl.x) > 0.3;
          const topCenter = isl.y < -0.8;
          const lx = side ? (isl.x < 0 ? sx - g.rw - 12 * g.s - lw : sx + g.rw + 12 * g.s) : sx - lw / 2;
          const ly = side ? topY - lh / 2 : topCenter ? topY - g.rh - lh - 13 * g.s : sy + 30 * g.s;
          if (x >= lx && x <= lx + lw && y >= ly && y <= ly + lh) hit = true;
        }
        if (hit) found = isl.i;
      });
      return found;
    }
    canvas.addEventListener('mousemove', ev => {
      const idx = hitTest(ev);
      hover = idx;
      canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
    });
    canvas.addEventListener('mouseleave', () => { hover = -1; });
    canvas.addEventListener('click', ev => {
      const idx = hitTest(ev);
      if (idx >= 0) openRegion(islands[idx].l.id);
    });

    function openRegion(langId) {
      const l = LS.lang(langId);
      if (!l) return;
      selected = langId;
      const u = LS.store.current();
      adContent.innerHTML = regionDrawerHTML(l, u, LS.canAddLanguage(u));
      scene.classList.add('drawer-open');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      adContent.querySelectorAll('[data-add-lang]').forEach(btn => {
        btn.addEventListener('click', () => openAddLanguage(btn.dataset.addLang));
      });
    }
    function closeRegion() {
      selected = null;
      scene.classList.remove('drawer-open');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    drawer.querySelector('[data-ad-close]').addEventListener('click', closeRegion);
    root.querySelectorAll('[data-region]').forEach(btn => {
      btn.addEventListener('click', () => openRegion(btn.dataset.region));
    });
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') closeRegion();
    });
    scene.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeRegion(); });
  }

  function openAddLanguage(id) {
    const l = LS.lang(id);
    if (!l) return;
    const can = LS.canAddLanguage(LS.store.current());
    if (!can.ok) { LS.toast('星轨尚未解锁', can.reason, 'red', 'lock'); return; }
    LS.openModal(LS.modalHead('NEW TRACK', '开启新星轨 · ' + LS.esc(l.name),
      '确认后，<b>' + LS.esc(l.profession) + '</b> 会成为你的新职业，对应的守护者立绘与专属头像将自动授予你。已有进度不会受影响。')
      + `<div class="add-lang-preview"><div class="als-sigil" style="--lang-color:${l.color}">${LS.esc(l.sigil)}</div><div><b>${LS.esc(l.name)}</b><p>${LS.esc(l.description)}</p></div></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>再想想</button><button class="btn" id="confirm-add-lang">开启星轨 ${LS.icon('spark', 13)}</button></div>`, {
      mount(m, overlay) {
        m.querySelector('#confirm-add-lang').addEventListener('click', () => {
          const u2 = LS.store.current();
          if (!LS.canAddLanguage(u2).ok) { LS.toast('条件已变化', LS.canAddLanguage(u2).reason, 'red'); return; }
          if (!u2.activeLangs.includes(id)) u2.activeLangs.push(id);
          if (!u2.primaryLang) u2.primaryLang = id;
          if (!u2.char) u2.char = LS.defaultChar(id);
          LS.store.save();
          LS.closeModal(overlay);
          LS.toast('星轨已点亮', LS.lang(id).profession + ' 的职业故事已为你打开。', 'gold', 'spark');
          LS.app.go('#/world/' + id);
        });
      }
    });
  }

  function detail(langId) {
    const u = LS.store.current();
    const l = LS.lang(langId);
    if (!l) return '<div class="panel" style="padding:30px">星轨不存在。</div>';
    if (!(u.activeLangs || []).includes(l.id) && !LS.languageUnlocked(u, l.id)) {
      return `<div class="panel" style="padding:36px;text-align:center"><h2>这条星轨尚未点亮</h2><p class="muted" style="margin:10px 0 18px">${LS.esc(LS.canAddLanguage(u).reason || '需要先完成前置条件。')}</p><a class="btn" href="#/world">返回星轨地图</a></div>`;
    }
    const pct = LS.progressPct(u, l.id);
    const next = nextNode(u, l.id);
    const doneSet = LS.store.progressOf(u, l.id).done;

    return `<div class="world-detail-page" style="--lang-color:${l.color};${wpStyle(l.id)}">
      <div class="breadcrumbs"><a href="#/world">星轨地图</a><i>/</i><span>${LS.esc(l.name)}</span></div>
      <section class="world-banner">
        <div class="wb-glow"></div>
        <div class="wb-sigil">${LS.esc(l.sigil)}</div>
        <div class="wb-copy">
          <div class="kicker-jp">${LS.esc(l.jp)} · ${LS.esc(l.professionJp)}</div>
          <h1>${LS.esc(l.name)} <span>${LS.esc(l.profession)}</span></h1>
          <p>${LS.esc(l.worldIntro)}</p>
          <div class="wb-meta"><span class="chip chip-gold">${pct}% 完成</span><span class="chip">${LS.doneCount(u, l.id)} / ${LS.allNodes(l.id).length} 节点</span><span class="chip">${LS.esc(l.element)} · ${LS.esc(l.role)}</span></div>
          <div class="progress" style="margin-top:16px;max-width:460px"><i style="width:${pct}%"></i></div>
          <div class="wb-actions">${next ? `<a class="btn" href="${nodeHref(l.id, next)}">继续 · ${LS.esc(next.title)} ${LS.icon('play', 13)}</a>` : `<span class="chip chip-gold">本卷已完成</span>`}<a class="btn btn-ghost" href="#/codex">查阅天书</a></div>
        </div>
        <div class="wb-char">${LS.charImg(Object.assign({}, u.char || LS.defaultChar(l.id), { outfit: l.professionStyle, outfitColor: l.color, accent: l.color2, langId: l.id }), 220)}</div>
      </section>

      <div class="chapter-path">
        ${l.chapters.map((ch, ci) => {
          const chNodes = ch.nodes;
          const chDone = chNodes.filter(n => doneSet.includes(n.id)).length;
          const chPct = Math.round(chDone / chNodes.length * 100);
          return `<section class="chapter-block ${chDone === chNodes.length ? 'done' : ''}">
            <div class="chapter-head">
              <div class="ch-index"><span>${String(ci + 1).padStart(2, '0')}</span><i></i></div>
              <div class="ch-copy"><div class="ch-jp">${LS.esc(ch.jp)}</div><h2>${LS.esc(ch.title)}</h2><p>${LS.esc(ch.subtitle)} · ${LS.esc(ch.summary)}</p></div>
              <div class="ch-progress"><b>${chPct}%</b><span>${chDone}/${chNodes.length}</span></div>
            </div>
            <div class="node-path">
              ${chNodes.map((n, ni) => {
                const done = doneSet.includes(n.id);
                const unlocked = LS.nodeUnlocked(u, l.id, n.id);
                const type = n.type === 'battle' ? '试炼' : n.type === 'story' ? '剧情' : '天书';
                const icon = n.type === 'battle' ? (n.enemy && n.enemy.boss ? 'crown' : 'sword') : n.type === 'story' ? 'scroll' : 'book';
                return `<div class="node-row ${done ? 'done' : unlocked ? 'current' : 'locked'}">
                  <div class="node-line"></div>
                  <div class="node-dot">${done ? '✓' : unlocked ? LS.icon(icon, 14) : LS.icon('lock', 12)}</div>
                  <a class="node-card" ${unlocked || done ? `href="${nodeHref(l.id, n)}"` : 'role="button" tabindex="0" data-locked="1"'}>
                    <div class="node-main">
                      <div class="node-type">${type}${n.type === 'battle' && n.enemy && n.enemy.boss ? ' · BOSS' : ''}</div>
                      <b>${LS.esc(n.title)}</b>
                      <span>${LS.esc(n.jp)}</span>
                    </div>
                    <div class="node-side">${done ? '<span class="chip chip-gold">已完成</span>' : unlocked ? `<span class="chip chip-cyan">+${n.xp} 经验</span>` : '<span class="chip">未解锁</span>'}${LS.icon('chevron', 13)}</div>
                  </a>
                  ${n.type === 'battle' && n.enemy ? `<div class="node-enemy">${LS.enemyImg(n.enemy.kind, { boss: !!n.enemy.boss }, n.enemy.boss ? 62 : 50)}</div>` : ''}
                </div>`;
              }).join('')}
            </div>
          </section>`;
        }).join('')}
      </div>
    </div>`;
  }

  function bindOverview(root) {
    root.querySelectorAll('[data-add-lang]').forEach(btn => btn.addEventListener('click', () => openAddLanguage(btn.dataset.addLang)));

    root.querySelectorAll('[data-locked]').forEach(a => {
      const warn = e => {
        e.preventDefault();
        LS.toast('节点尚未解锁', '先完成前一个节点。', 'gold', 'lock');
      };
      a.addEventListener('click', warn);
      a.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') warn(e); });
    });
  }

  /* ---------------- codex ---------------- */
  function codex() {
    const u = LS.store.current();
    const active = LS.activeLangDefs(u);
    const lessons = [];
    const terms = [];
    active.forEach(l => {
      l.chapters.forEach(ch => ch.nodes.forEach(n => {
        if (n.type === 'lesson' && n.article) {
          lessons.push({ lang: l, ch, node: n });
          (n.article.terms || []).forEach(t => terms.push({ t, lang: l }));
        }
      }));
    });
    const uniqTerms = [];
    const seen = new Set();
    terms.forEach(x => { const k = x.t.t; if (!seen.has(k)) { seen.add(k); uniqTerms.push(x); } });

    return `<div class="codex-page">
      <div class="page-head">
        <div><div class="page-ornament">CODEX ARCANUM · 知识天书</div><h1>把术语读成自己的咒文</h1><p>六种语言的知识点、术语、考纲与示例都收在这里。读完之后，回到星轨上让输出替你说话。</p></div>
        <div class="head-actions"><span class="chip chip-gold">${lessons.length} 篇天书</span><span class="chip">${uniqTerms.length} 条术语</span></div>
      </div>
      <div class="codex-toolbar">
        <div class="codex-search">${LS.icon('search', 15)}<input class="input" id="codex-search" placeholder="搜索术语、章节或知识点…"></div>
        <div class="chip">按星轨归档</div>
      </div>
      <div class="codex-grid">
        ${active.map(l => `<section class="codex-lang" style="--lang-color:${l.color}">
          <div class="codex-lang-head"><div class="wc-sigil">${LS.esc(l.sigil)}</div><div><b>${LS.esc(l.name)}</b><span>${LS.esc(l.profession)} · ${LS.progressPct(u, l.id)}%</span></div><a class="tiny gold" href="#/world/${l.id}">星轨 →</a></div>
          <div class="codex-chapters">
            ${l.chapters.map(ch => `<div class="codex-chapter">
              <div class="cc-title">${LS.esc(ch.title)}<span>${LS.esc(ch.jp)}</span></div>
              ${ch.nodes.filter(n => n.type === 'lesson').map(n => `<a class="codex-lesson" href="#/lesson/${l.id}/${n.id}" data-search="${LS.esc((n.title + ' ' + n.article.lead + ' ' + (n.article.terms || []).map(t => t.t).join(' ')).toLowerCase())}">
                <span>${LS.icon('book', 13)}</span><div><b>${LS.esc(n.title)}</b><em>${LS.esc(n.article.lead.slice(0, 42))}…</em></div>${LS.store.progressOf(u, l.id).done.includes(n.id) ? '<i class="read">已读</i>' : '<i>未读</i>'}
              </a>`).join('')}
            </div>`).join('')}
          </div>
        </section>`).join('')}
      </div>
      <section class="glossary">
        <div class="section-head"><div><div class="kicker-jp">GLOSSARY · 术语索引</div><h2>天书词条</h2></div><span class="tiny faint">点击查看释义</span></div>
        <div class="glossary-grid">${uniqTerms.map(({ t, lang }) => `<button class="glossary-item" data-term="${LS.esc(t.t)}" data-en="${LS.esc(t.en || '')}" data-def="${LS.esc(t.d)}" data-lang="${LS.esc(lang.name)}"><b>${LS.esc(t.t)}</b>${t.en ? `<span>${LS.esc(t.en)}</span>` : ''}<em>${LS.esc(lang.name)}</em></button>`).join('')}</div>
      </section>
      <section class="exam-tips">
        <div class="section-head"><div><div class="kicker-jp">EXAM NOTES · 考纲摘记</div><h2>考试会怎么问</h2></div></div>
        <div class="exam-tip-grid">
          ${active.map(l => {
            const tips = [];
            l.chapters.forEach(ch => ch.nodes.forEach(n => { if (n.type === 'lesson' && n.article.exam) tips.push({ ch, n, text: n.article.exam }); }));
            return `<div class="exam-tip-card" style="--lang-color:${l.color}"><div class="et-lang">${LS.esc(l.sigil)} ${LS.esc(l.name)}</div>${tips.map(x => `<div class="et-row"><b>${LS.esc(x.n.title)}</b><p>${LS.esc(x.text)}</p></div>`).join('')}</div>`;
          }).join('')}
        </div>
      </section>
    </div>`;
  }

  function bindCodex(root) {
    const input = root.querySelector('#codex-search');
    if (input) input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      root.querySelectorAll('.codex-lesson').forEach(el => {
        el.style.display = !q || (el.dataset.search || '').includes(q) || el.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
      root.querySelectorAll('.glossary-item').forEach(el => {
        el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    root.querySelectorAll('[data-term]').forEach(btn => btn.addEventListener('click', () => {
      LS.openModal(LS.modalHead('GLOSSARY · ' + (btn.dataset.lang || ''), LS.esc(btn.dataset.term), btn.dataset.en ? '<span class="mono small">' + LS.esc(btn.dataset.en) + '</span>' : '')
        + `<p style="line-height:1.9;font-size:13.5px">${LS.esc(btn.dataset.def)}</p>
        <div class="modal-actions"><button class="btn btn-ghost" data-close>合上天书</button></div>`);
    }));
  }

  LS.Views.world = {
    html(parts) {
      if (parts && parts[1]) return { html: detail(parts[1]), title: (LS.lang(parts[1]) || {}).name || '星轨', sub: 'TRACK' };
      return { html: overview(), title: '星轨地图', sub: 'WORLD MAP' };
    },
    mount(root, app) {
      const scope = app.querySelector('#view') || root;
      bindOverview(scope);
      bindAtlas(scope);
    }
  };

  LS.Views.codex = {
    html() { return { html: codex(), title: '知识天书', sub: 'CODEX ARCANUM' }; },
    mount(root) { bindCodex(root); }
  };
})(window.LS);
