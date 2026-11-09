/* 轻量 VSCode 风格代码编辑器：高亮、行号、缩进线、自动缩进、关键词补全 */
(function (LS) {
  'use strict';

  const INDENT = '    ';
  const esc = LS.esc;

  const SNIPPETS = {
    python: [
      ['print', 'print("|")', '输出到终端'],
      ['input', 'input("|")', '读取一行输入'],
      ['range', 'range(|)', '生成整数序列'],
      ['len', 'len(|)', '取长度'],
      ['int', 'int(|)', '转为整数'],
      ['float', 'float(|)', '转为浮点数'],
      ['str', 'str(|)', '转为字符串'],
      ['list', 'list(|)', '转为列表'],
      ['def', 'def |():\n    ', '定义函数'],
      ['for', 'for i in range(|):\n    ', 'for 循环'],
      ['while', 'while |:\n    ', 'while 循环'],
      ['if', 'if |:\n    ', '条件分支'],
      ['elif', 'elif |:\n    ', '否则如果'],
      ['else', 'else:\n    ', '否则'],
      ['return', 'return |', '返回']
    ],
    javascript: [
      ['console.log', 'console.log("|");', '输出到控制台'],
      ['function', 'function |() {\n    \n}', '定义函数'],
      ['for', 'for (let i = 0; i < |; i++) {\n    \n}', 'for 循环'],
      ['while', 'while (|) {\n    \n}', 'while 循环'],
      ['if', 'if (|) {\n    \n}', '条件分支'],
      ['else', 'else {\n    \n}', '否则'],
      ['return', 'return |', '返回'],
      ['const', 'const | = ', '常量'],
      ['let', 'let | = ', '变量'],
      ['Math', 'Math.|', '数学函数']
    ],
    java: [
      ['System.out.println', 'System.out.println("|");', '换行输出'],
      ['System.out.print', 'System.out.print("|");', '不换行输出'],
      ['public static void main', 'public static void main(String[] args) {\n    \n}', '主方法'],
      ['for', 'for (int i = 0; i < |; i++) {\n    \n}', 'for 循环'],
      ['while', 'while (|) {\n    \n}', 'while 循环'],
      ['if', 'if (|) {\n    \n}', '条件分支'],
      ['else', 'else {\n    \n}', '否则'],
      ['new', 'new |()', '创建对象'],
      ['return', 'return |', '返回'],
      ['class', 'class | {\n    \n}', '定义类']
    ],
    c: [
      ['printf', 'printf("|");', '格式化输出'],
      ['scanf', 'scanf("|", &x);', '读取输入'],
      ['main', 'int main() {\n    \n    return 0;\n}', '主函数'],
      ['for', 'for (int i = 0; i < |; i++) {\n    \n}', 'for 循环'],
      ['while', 'while (|) {\n    \n}', 'while 循环'],
      ['if', 'if (|) {\n    \n}', '条件分支'],
      ['else', 'else {\n    \n}', '否则'],
      ['return', 'return |;', '返回'],
      ['sizeof', 'sizeof(|)', '取字节大小'],
      ['#include', '#include <stdio.h>', '引入头文件']
    ],
    cpp: [
      ['cout', 'cout << "|" << endl;', '标准输出'],
      ['cin', 'cin >> |;', '标准输入'],
      ['main', 'int main() {\n    \n    return 0;\n}', '主函数'],
      ['for', 'for (int i = 0; i < |; i++) {\n    \n}', 'for 循环'],
      ['while', 'while (|) {\n    \n}', 'while 循环'],
      ['if', 'if (|) {\n    \n}', '条件分支'],
      ['else', 'else {\n    \n}', '否则'],
      ['vector', 'vector<int> |;', '动态数组'],
      ['string', 'string |;', '字符串'],
      ['#include', '#include <iostream>', '引入头文件'],
      ['using namespace', 'using namespace std;', '使用标准命名空间']
    ],
    go: [
      ['fmt.Println', 'fmt.Println("|")', '换行输出'],
      ['fmt.Printf', 'fmt.Printf("|\\n", x)', '格式化输出'],
      ['func', 'func |() {\n    \n}', '定义函数'],
      ['for', 'for i := 0; i < |; i++ {\n    \n}', 'for 循环'],
      ['if', 'if | {\n    \n}', '条件分支'],
      ['else', 'else {\n    \n}', '否则'],
      ['return', 'return |', '返回'],
      ['range', 'range |', '遍历'],
      ['make', 'make(|)', '创建切片/映射'],
      ['package', 'package main', '包声明']
    ]
  };

  const TYPE_WORDS = new Set([
    'int', 'float', 'double', 'char', 'void', 'long', 'short', 'bool', 'boolean',
    'byte', 'string', 'String', 'rune', 'float64', 'unsigned', 'signed', 'size_t',
    'vector', 'map', 'struct', 'class', 'interface', 'auto', 'var', 'let', 'const'
  ]);

  function langKeywords(lang) {
    const set = LS.CODE_KEYWORDS && LS.CODE_KEYWORDS[lang];
    return set || new Set();
  }

  function completionEntries(lang) {
    const out = [];
    const seen = new Set();
    for (const [label, insert, detail] of (SNIPPETS[lang] || [])) {
      out.push({ label, insert, detail, kind: /^[A-Z#]/.test(label) ? 'type' : 'fn' });
      seen.add(label.toLowerCase());
    }
    for (const kw of langKeywords(lang)) {
      if (seen.has(kw.toLowerCase())) continue;
      seen.add(kw.toLowerCase());
      out.push({ label: kw, insert: kw, detail: '关键字', kind: 'kw' });
    }
    return out;
  }

  function tokenClass(word, lang, nextChar) {
    const kws = langKeywords(lang);
    if (kws.has(word)) {
      if (TYPE_WORDS.has(word)) return 'ce-tok-type';
      return 'ce-tok-kw';
    }
    if (nextChar === '(') return 'ce-tok-fn';
    if (TYPE_WORDS.has(word)) return 'ce-tok-type';
    if (/^[A-Z][A-Za-z0-9_$]*$/.test(word)) return 'ce-tok-type';
    return '';
  }

  function highlightLine(line, lang, state) {
    let html = '';
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      const c2 = line.slice(i, i + 2);
      if (state.block) {
        const end = line.indexOf('*/', i);
        if (end < 0) {
          html += '<span class="ce-tok-com">' + esc(line.slice(i)) + '</span>';
          return html;
        }
        html += '<span class="ce-tok-com">' + esc(line.slice(i, end + 2)) + '</span>';
        i = end + 2; state.block = false; continue;
      }
      if (c2 === '/*') {
        const end = line.indexOf('*/', i + 2);
        if (end < 0) {
          html += '<span class="ce-tok-com">' + esc(line.slice(i)) + '</span>';
          state.block = true; return html;
        }
        html += '<span class="ce-tok-com">' + esc(line.slice(i, end + 2)) + '</span>';
        i = end + 2; continue;
      }
      if (c2 === '//' || (c === '#' && (lang === 'python' || lang === 'go'))) {
        html += '<span class="ce-tok-com">' + esc(line.slice(i)) + '</span>';
        return html;
      }
      if (c === '"' || c === "'" || c === '`') {
        const q = c; let j = i + 1;
        while (j < line.length) {
          if (line[j] === '\\') { j += 2; continue; }
          if (line[j] === q) { j++; break; }
          j++;
        }
        html += '<span class="ce-tok-str">' + esc(line.slice(i, j)) + '</span>';
        i = j; continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i + 1;
        while (j < line.length && /[0-9a-fA-FxX._]/.test(line[j])) j++;
        html += '<span class="ce-tok-num">' + esc(line.slice(i, j)) + '</span>';
        i = j; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i + 1;
        while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        const cls = tokenClass(word, lang, line[j]);
        html += cls ? '<span class="' + cls + '">' + esc(word) + '</span>' : esc(word);
        i = j; continue;
      }
      if (/[=+\-*/%<>!&|^~?:]/.test(c)) {
        let j = i + 1;
        while (j < line.length && /[=+\-*/%<>!&|^~?:]/.test(line[j])) j++;
        html += '<span class="ce-tok-op">' + esc(line.slice(i, j)) + '</span>';
        i = j; continue;
      }
      html += esc(c);
      i++;
    }
    return html;
  }

  function indentCols(line) {
    let n = 0;
    for (const ch of line) {
      if (ch === ' ') n++;
      else if (ch === '\t') n += 4;
      else break;
    }
    return n;
  }

  function create(container, opts) {
    opts = opts || {};
    const lang = opts.lang || 'python';
    let value = String(opts.value == null ? '' : opts.value);
    let composing = false;
    let acItems = [];
    let acIndex = 0;
    let acOpen = false;

    container.innerHTML = `
      <div class="ce">
        <div class="ce-top">
          <span class="ce-lang"><i></i>${esc(opts.title || (lang + ' · main'))}</span>
          <span class="ce-keyhint">Tab 补全 · Ctrl+Enter 攻击</span>
        </div>
        <div class="ce-body">
          <div class="ce-gutter" aria-hidden="true"></div>
          <div class="ce-scroll">
            <pre class="ce-layer" aria-hidden="true"><code class="ce-highlight"></code></pre>
            <textarea class="ce-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${esc(opts.aria || '代码编辑器')}"></textarea>
            <div class="ce-ac" hidden></div>
          </div>
        </div>
        <div class="ce-status"><span class="ce-pos">行 1, 列 1</span><span>${esc(LS.lang ? (LS.lang(lang) ? LS.lang(lang).name : lang) : lang)} · UTF-8</span></div>
      </div>`;

    const ta = container.querySelector('.ce-input');
    const layer = container.querySelector('.ce-layer');
    const codeEl = container.querySelector('.ce-highlight');
    const gutter = container.querySelector('.ce-gutter');
    const ac = container.querySelector('.ce-ac');
    const posEl = container.querySelector('.ce-pos');
    const scrollEl = container.querySelector('.ce-scroll');

    const mirror = document.createElement('div');
    mirror.className = 'ce-mirror';
    mirror.setAttribute('aria-hidden', 'true');
    container.appendChild(mirror);

    ta.value = value;

    function countLines() { return value.split('\n').length; }

    function render() {
      const lines = value.split('\n');
      const state = { block: false };
      let html = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indent = indentCols(line);
        const guide = indent > 0
          ? '<span class="ce-ind" style="width:' + indent + 'ch"></span>'
          : '';
        const body = highlightLine(line, lang, state) || '&nbsp;';
        html += '<div class="ce-line">' + guide + body + '</div>';
      }
      codeEl.innerHTML = html;
      gutter.innerHTML = lines.map((_, i) => '<span>' + (i + 1) + '</span>').join('');
      syncScroll();
      updatePos();
      if (typeof opts.onChange === 'function') opts.onChange(value);
    }

    function syncScroll() {
      layer.scrollTop = ta.scrollTop;
      layer.scrollLeft = ta.scrollLeft;
      gutter.scrollTop = ta.scrollTop;
    }

    function updatePos() {
      const start = ta.selectionStart;
      const before = value.slice(0, start);
      const line = before.split('\n').length;
      const col = before.length - before.lastIndexOf('\n');
      posEl.textContent = '行 ' + line + ', 列 ' + col;
    }

    function setValue(v) {
      value = String(v == null ? '' : v);
      ta.value = value;
      render();
    }

    function replaceRange(start, end, text, caret) {
      ta.setRangeText(text, start, end, 'end');
      if (typeof caret === 'number') ta.selectionStart = ta.selectionEnd = caret;
      value = ta.value;
      render();
    }

    /* ---------------- 自动缩进 ---------------- */
    function handleEnter(e) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = value.slice(0, start);
      const lineStart = before.lastIndexOf('\n') + 1;
      const curLine = before.slice(lineStart);
      const indent = curLine.match(/^[ \t]*/)[0].replace(/\t/g, INDENT);
      const trimmed = curLine.replace(/\s+$/, '');
      let extra = '';
      if (lang === 'python') {
        if (/:$/.test(trimmed)) extra = INDENT;
      } else if (/\{$/.test(trimmed)) {
        extra = INDENT;
      }
      // 在 C 系语言里，如果光标后紧跟右花括号，自动多缩进一层后把右括号留在下一行。
      e.preventDefault();
      replaceRange(start, end, '\n' + indent + extra);
    }

    function handleTab(e) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      if (start !== end) {
        const before = value.slice(0, start);
        const after = value.slice(end);
        const sel = value.slice(start, end);
        const firstLineStart = before.lastIndexOf('\n') + 1;
        const lastLineEnd = end + (after.indexOf('\n') < 0 ? after.length : after.indexOf('\n'));
        const block = value.slice(firstLineStart, lastLineEnd);
        const shifted = block.split('\n').map(l => INDENT + l).join('\n');
        e.preventDefault();
        replaceRange(firstLineStart, lastLineEnd, shifted, start + INDENT.length);
        return;
      }
      e.preventDefault();
      replaceRange(start, end, INDENT, start + INDENT.length);
    }

    function handleShiftTab(e) {
      e.preventDefault();
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', start) < 0 ? value.length : value.indexOf('\n', start);
      const line = value.slice(lineStart, lineEnd);
      let n = 0;
      while (n < INDENT.length && line[n] === ' ') n++;
      if (n) replaceRange(lineStart, lineStart + n, '', Math.max(lineStart, start - n));
    }

    /* ---------------- 补全 ---------------- */
    function currentWord() {
      const start = ta.selectionStart;
      const before = value.slice(0, start);
      const m = before.match(/[A-Za-z_$][A-Za-z0-9_$]*$/);
      if (!m) return null;
      return { word: m[0], start: start - m[0].length, end: start };
    }

    function caretCoords() {
      const cs = getComputedStyle(ta);
      mirror.style.font = cs.font;
      mirror.style.lineHeight = cs.lineHeight;
      mirror.style.letterSpacing = cs.letterSpacing;
      mirror.style.tabSize = cs.tabSize;
      mirror.style.padding = cs.padding;
      mirror.style.border = '0';
      mirror.style.width = (ta.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) + 'px';
      mirror.textContent = value.slice(0, ta.selectionStart);
      const span = document.createElement('span');
      span.textContent = '\u200b';
      mirror.appendChild(span);
      const rect = {
        top: span.offsetTop - ta.scrollTop,
        left: span.offsetLeft - ta.scrollLeft
      };
      return rect;
    }

    function renderAc() {
      if (!acItems.length) { closeAc(); return; }
      ac.innerHTML = acItems.map((it, i) =>
        `<button type="button" class="ce-ac-item ${i === acIndex ? 'active' : ''}" data-i="${i}">
          <span class="ce-ac-kind ${it.kind}">${it.kind === 'kw' ? 'K' : it.kind === 'type' ? 'T' : 'ƒ'}</span>
          <b>${esc(it.label)}</b><em>${esc(it.detail || '')}</em>
        </button>`).join('') + '<div class="ce-ac-foot">↑↓ 选择 · Tab / Enter 插入 · Esc 关闭</div>';
      ac.hidden = false;
      acOpen = true;
      const coords = caretCoords();
      const lineH = parseFloat(getComputedStyle(ta).lineHeight) || 21;
      ac.style.left = Math.max(6, Math.min(coords.left, scrollEl.clientWidth - 300)) + 'px';
      let top = coords.top + lineH + 6;
      if (top + 240 > scrollEl.clientHeight) top = Math.max(6, coords.top - 250);
      ac.style.top = top + 'px';
      ac.querySelectorAll('.ce-ac-item').forEach(btn => {
        btn.addEventListener('mousedown', ev => {
          ev.preventDefault();
          acceptAc(Number(btn.dataset.i));
        });
      });
    }

    function closeAc() {
      acOpen = false;
      ac.hidden = true;
      acItems = [];
      acIndex = 0;
    }

    function openAc(force) {
      const info = currentWord();
      if (!info) { closeAc(); return; }
      const prefix = info.word.toLowerCase();
      if (!force && prefix.length < 2) { closeAc(); return; }
      const entries = completionEntries(lang);
      const seen = new Set();
      acItems = entries.filter(it => {
        const l = it.label.toLowerCase();
        if (!l.startsWith(prefix)) return false;
        if (seen.has(l + '|' + it.kind)) return false;
        seen.add(l + '|' + it.kind);
        return true;
      }).slice(0, 12);
      acIndex = 0;
      renderAc();
    }

    function acceptAc(i) {
      const info = currentWord();
      if (!info || !acItems[i]) { closeAc(); return; }
      let insert = acItems[i].insert;
      let caret = insert.indexOf('|');
      if (caret >= 0) {
        insert = insert.slice(0, caret) + insert.slice(caret + 1);
      } else {
        caret = insert.length;
      }
      replaceRange(info.start, ta.selectionStart, insert, info.start + caret);
      closeAc();
      ta.focus();
    }

    /* ---------------- 事件 ---------------- */
    ta.addEventListener('compositionstart', () => { composing = true; });
    ta.addEventListener('compositionend', () => { composing = false; value = ta.value; render(); openAc(false); });
    ta.addEventListener('input', () => {
      const old = value;
      value = ta.value;
      // 输入右花括号时自动减少一级缩进（只在行首空白后生效）。
      if (!composing && value.length === old.length + 1) {
        const pos = ta.selectionStart;
        const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
        const beforeCaret = value.slice(lineStart, pos);
        const trimmed = beforeCaret.trim();
        if (trimmed === '}' || trimmed === '};' || trimmed === '});') {
          const indent = beforeCaret.match(/^[ \t]*/)[0];
          if (indent.length >= INDENT.length) {
            const cut = Math.min(INDENT.length, indent.length);
            value = value.slice(0, lineStart) + indent.slice(cut) + value.slice(lineStart + indent.length);
            ta.value = value;
            ta.selectionStart = ta.selectionEnd = pos - cut;
          }
        }
      }
      render();
      if (!composing) openAc(false);
    });
    ta.addEventListener('keydown', e => {
      if (e.isComposing || composing) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        closeAc();
        if (typeof opts.onSubmit === 'function') opts.onSubmit();
        return;
      }
      if (e.key === ' ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        openAc(true);
        return;
      }
      if (acOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          acIndex = (acIndex + 1) % acItems.length;
          renderAc();
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          acIndex = (acIndex - 1 + acItems.length) % acItems.length;
          renderAc();
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          acceptAc(acIndex);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeAc();
          return;
        }
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) handleShiftTab(e);
        else handleTab(e);
        return;
      }
      if (e.key === 'Enter') {
        handleEnter(e);
        return;
      }
      if (e.key === 'Escape') closeAc();
    });
    ta.addEventListener('blur', () => setTimeout(closeAc, 120));
    ta.addEventListener('click', () => { updatePos(); closeAc(); });
    ta.addEventListener('scroll', syncScroll);
    ta.addEventListener('keyup', e => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) updatePos();
    });
              
    render();

    const api = {
      get value() { return value; },
      setValue,
      focus() { ta.focus({ preventScroll: true }); },
      closeAc,
      insert(text) {
        replaceRange(ta.selectionStart, ta.selectionEnd, text, ta.selectionStart + text.length);
        ta.focus();
      },
      destroy() { container.innerHTML = ''; mirror.remove(); }
    };
    return api;
  }

  LS.CodeEditor = { create };
})(window.LS);
