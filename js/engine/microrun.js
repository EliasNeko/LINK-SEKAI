/* MicroRun — 离线多语言子集执行器
 * 将 Python / C / C++ / Java / Go / JavaScript 的核心语法翻译为受控 JavaScript 执行，
 * 捕获标准输出，用于关卡判定。仅支持教学所需的语法子集。
 */
(function (LS) {
  'use strict';

  const MAX_STEPS = 300000;

  /* ---------------- helpers ---------------- */

  function maskStrings(src) {
    const store = [];
    const text = String(src).replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, m => {
      store.push(m);
      return '\u0001' + (store.length - 1) + '\u0001';
    });
    return {
      text,
      restore(s) {
        return String(s).replace(/\u0001(\d+)\u0001/g, (_, i) => store[+i] || '');
      }
    };
  }

  function stripPreprocessor(src) {
    return String(src).split('\n').filter(l => !/^\s*#/.test(l)).join('\n');
  }

  function stripLineComments(src) {
    return String(src).split('\n').map(l => {
      let inS = false, q = '';
      for (let i = 0; i < l.length; i++) {
        const ch = l[i];
        if (inS) {
          if (ch === '\\') { i++; continue; }
          if (ch === q) inS = false;
        } else if (ch === '"' || ch === "'") {
          inS = true; q = ch;
        } else if (ch === '/' && l[i + 1] === '/') {
          return l.slice(0, i);
        }
      }
      return l;
    }).join('\n');
  }

  function cleanCParams(params) {
    return String(params || '')
      .replace(/\bvoid\b/g, '')
      .replace(/\b(?:const\s+)?(?:unsigned\s+)?(?:int|long|short|double|float|char|bool|size_t)\s*\*?/g, '')
      .replace(/\bstd::string\s*\*?/g, '')
      .replace(/\s*&\s*/g, '')
      .replace(/\s*\[\s*\]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .join(', ');
  }

  function cleanGoParams(params) {
    return String(params || '')
      .split(',')
      .map(part => part.trim().replace(/\s+\*?(?:int64|int|float64|float32|string|bool|byte|rune)$/, ''))
      .filter(Boolean)
      .join(', ');
  }

  function splitOutsideQuotes(s, sep) {
    const parts = [];
    let cur = '', inS = false, q = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (inS) {
        cur += ch;
        if (ch === '\\') { cur += s[++i] || ''; continue; }
        if (ch === q) inS = false;
      } else if (ch === '"' || ch === "'") {
        inS = true; q = ch; cur += ch;
      } else if (s.startsWith(sep, i)) {
        parts.push(cur); cur = ''; i += sep.length - 1;
      } else {
        cur += ch;
      }
    }
    parts.push(cur);
    return parts;
  }

  /* ---------------- output formatting ---------------- */

  function pyStr(v) {
    if (v === null || v === undefined) return 'None';
    if (v === true) return 'True';
    if (v === false) return 'False';
    if (Array.isArray(v)) {
      return '[' + v.map(x => (typeof x === 'string' ? "'" + x + "'" : pyStr(x))).join(', ') + ']';
    }
    if (typeof v === 'object') {
      try {
        const keys = Object.keys(v);
        return '{' + keys.map(k => "'" + k + "': " + pyStr(v[k])).join(', ') + '}';
      } catch (e) { return String(v); }
    }
    return String(v);
  }

  function jsStr(v) {
    if (typeof v === 'string') return v;
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'object') {
      try { return JSON.stringify(v); } catch (e) { return String(v); }
    }
    return String(v);
  }

  function goStr(v) {
    if (v === null || v === undefined) return '<nil>';
    if (Array.isArray(v)) return '[' + v.map(goStr).join(' ') + ']';
    if (typeof v === 'object') {
      try { return Object.keys(v).map(k => k + ':' + goStr(v[k])).join(' '); } catch (e) { return String(v); }
    }
    return String(v);
  }

  function pad(v, width, flag) {
    let s = String(v);
    if (!width) return s;
    if (s.length >= width) return s;
    const fill = flag === '0' && /^-?\d/.test(s) ? '0' : ' ';
    if (fill === '0' && s[0] === '-') return '-' + '0'.repeat(width - s.length) + s.slice(1);
    return flag === '-' ? s + ' '.repeat(width - s.length) : fill.repeat(width - s.length) + s;
  }

  function cFormat(fmt, args) {
    let i = 0;
    return String(fmt).replace(/%(?:([-+0 ]))?(\d+)?(?:\.(\d+))?([diufscxX%])/g, (m, flag, width, prec, conv) => {
      if (conv === '%') return '%';
      const v = args[i++];
      let s;
      switch (conv) {
        case 'd':
        case 'i': s = String(Math.trunc(Number(v) || 0)); break;
        case 'u': s = String(Math.max(0, Math.trunc(Number(v) || 0))); break;
        case 'f': {
          const p = prec === undefined ? 6 : +prec;
          s = Number(v || 0).toFixed(p);
          break;
        }
        case 'c': s = typeof v === 'number' ? String.fromCharCode(v) : String(v || '').charAt(0); break;
        case 'x': s = Math.trunc(Number(v) || 0).toString(16); break;
        case 'X': s = Math.trunc(Number(v) || 0).toString(16).toUpperCase(); break;
        default: s = String(v);
      }
      return pad(s, width ? +width : 0, flag);
    });
  }

  function goFormat(fmt, args) {
    let i = 0;
    return String(fmt).replace(/%(?:([-+0 ]))?(\d+)?(?:\.(\d+))?([vTqdsfx%])/g, (m, flag, width, prec, conv) => {
      if (conv === '%') return '%';
      const v = args[i++];
      if (conv === 'T') return Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
      if (conv === 'q') return '"' + String(v) + '"';
      if (conv === 'v') return pad(goStr(v), width ? +width : 0, flag);
      return cFormat('%' + (flag || '') + (width || '') + (prec !== undefined ? '.' + prec : '') + conv, [v]);
    });
  }

  /* ---------------- Python ---------------- */

  function pyExpr(expr) {
    let out = '';
    let inS = false, q = '';
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (inS) {
        out += ch;
        if (ch === '\\') { out += expr[++i] || ''; continue; }
        if (ch === q) inS = false;
        continue;
      }
      if (ch === '"' || ch === "'") { inS = true; q = ch; out += ch; continue; }
      out += ch;
    }
    out = out
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\bnot\s+/g, '!')
      .replace(/\s+and\s+/g, ' && ')
      .replace(/\s+or\s+/g, ' || ')
      .replace(/\blen\s*\(/g, '__len(')
      .replace(/\brange\s*\(/g, '__range(')
      .replace(/\bstr\s*\(/g, '__pystr(')
      .replace(/\bint\s*\(/g, '__int(')
      .replace(/\bfloat\s*\(/g, '__float(')
      .replace(/\bsum\s*\(/g, '__sum(')
      .replace(/\btype\s*\(/g, '__type(')
      .replace(/\b([A-Za-z_]\w*)\.get\s*\(/g, '__dictget($1, ')
      .replace(/\.append\s*\(/g, '.push(')
      .replace(/\.upper\s*\(\s*\)/g, '.toUpperCase()')
      .replace(/\.lower\s*\(\s*\)/g, '.toLowerCase()')
      .replace(/\.strip\s*\(\s*\)/g, '.trim()')
      .replace(/\bprint\s*\(/g, '__pyprint(')
      .replace(/\binput\s*\(/g, '__input(');
    // slices: a[1:3] -> a.slice(1,3)
    out = out.replace(/([A-Za-z_]\w*)\[(\d+)\s*:\s*(\d+)\]/g, '$1.slice($2,$3)');
    out = out.replace(/([A-Za-z_]\w*)\[(-1)\]/g, '$1[$1.length-1]');
    // simple floor division a // b
    out = out.replace(/([A-Za-z0-9_\.\)\]]+)\s*\/\/\s*([A-Za-z0-9_\(]+)/g, 'Math.floor($1 / $2)');
    return out;
  }

  function translatePython(src) {
    const rawLines = String(src).replace(/\r/g, '').split('\n');
    const out = [];
    const stack = [];
    let started = false;

    function closeTo(indent) {
      while (stack.length && indent < stack[stack.length - 1]) {
        out.push('}');
        stack.pop();
      }
    }

    function closeEqual(indent) {
      while (stack.length && indent <= stack[stack.length - 1]) {
        out.push('}');
        stack.pop();
      }
    }

    for (let idx = 0; idx < rawLines.length; idx++) {
      const raw = rawLines[idx];
      if (!raw.trim() || /^\s*#/.test(raw)) continue;
      const indent = raw.match(/^\s*/)[0].length;
      let line = raw.slice(indent);
      // strip python line comment outside strings
      line = stripPyComment(line).trim();
      if (!line) continue;

      const elif = /^elif\s+(.+):$/.exec(line);
      const elseOnly = /^else\s*:$/.test(line);
      const exceptOnly = /^except[^:]*:$/.test(line);
      const finallyOnly = /^finally\s*:$/.test(line);

      if (elif || elseOnly || exceptOnly || finallyOnly) {
        closeTo(indent);
        if (stack.length && stack[stack.length - 1] === indent) stack.pop();
        if (elif) out.push('} else if (' + pyExpr(elif[1]) + ') {');
        else if (elseOnly) out.push('} else {');
        else if (exceptOnly) out.push('} catch (__err) {');
        else out.push('} finally {');
        stack.push(indent);
        started = true;
        continue;
      }

      closeEqual(indent);

      let m;
      if ((m = /^def\s+([A-Za-z_]\w*)\s*\((.*)\)\s*:$/.exec(line))) {
        out.push('function ' + m[1] + '(' + m[2] + ') { __tick();');
        stack.push(indent);
      } else if ((m = /^if\s+(.+):$/.exec(line))) {
        out.push('if (' + pyExpr(m[1]) + ') {');
        stack.push(indent);
      } else if ((m = /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/.exec(line))) {
        out.push('for (const ' + m[1] + ' of __iter(' + pyExpr(m[2]) + ')) { __tick();');
        stack.push(indent);
      } else if ((m = /^while\s+(.+):$/.exec(line))) {
        out.push('while (' + pyExpr(m[1]) + ') { __tick();');
        stack.push(indent);
      } else if (/^try\s*:$/.test(line)) {
        out.push('try {');
        stack.push(indent);
      } else if (/^pass$/.test(line)) {
        out.push(';');
      } else if (/^break$/.test(line)) {
        out.push('break;');
      } else if (/^continue$/.test(line)) {
        out.push('continue;');
      } else if ((m = /^return\b\s*(.*)$/.exec(line))) {
        out.push(m[1] ? 'return ' + pyExpr(m[1]) + ';' : 'return;');
      } else if ((m = /^raise\s+(.+)$/.exec(line))) {
        out.push('throw ' + pyExpr(m[1]) + ';');
      } else if ((m = /^import\s+(.+)$/.exec(line))) {
        out.push('// import ' + m[1]);
      } else if ((m = /^from\s+.+\s+import\s+(.+)$/.exec(line))) {
        out.push('// import ' + m[1]);
      } else if ((m = /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/.exec(line))) {
        out.push(m[1] + ' ' + m[2] + ' ' + pyExpr(m[3]) + ';');
      } else if ((m = /^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(line))) {
        out.push('var ' + m[1] + ' = ' + pyExpr(m[2]) + ';');
      } else {
        out.push(pyExpr(line) + ';');
      }
      started = true;
    }
    while (stack.length) { out.push('}'); stack.pop(); }
    if (!started) out.push(';');
    return out.join('\n');
  }

  function stripPyComment(line) {
    let inS = false, q = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inS) {
        if (ch === '\\') { i++; continue; }
        if (ch === q) inS = false;
      } else if (ch === '"' || ch === "'") {
        inS = true; q = ch;
      } else if (ch === '#') {
        return line.slice(0, i);
      }
    }
    return line;
  }

  /* ---------------- Java ---------------- */

  function extractMainBody(src) {
    const m = /public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/.exec(src);
    if (!m) return null;
    let i = src.indexOf('{', m.index) + 1;
    let depth = 1;
    let inS = false, q = '', esc = false;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (inS) {
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === q) inS = false;
        continue;
      }
      if (ch === '"' || ch === "'") { inS = true; q = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return src.slice(src.indexOf('{', m.index) + 1, i);
      }
    }
    return src.slice(src.indexOf('{', m.index) + 1);
  }

  function translateJava(src) {
    const body = extractMainBody(src);
    const masked = maskStrings(body !== null ? body : src);
    let t = masked.text;
    t = stripLineComments(t);
    t = t.replace(/\bSystem\.out\.println\s*\(/g, '__println(')
      .replace(/\bSystem\.out\.print\s*\(/g, '__print(');
    t = t.replace(/\b(?:new\s+)?(?:int|double|float|long|short|byte|boolean|char|String)\s*\[\]\s*(\w+)\s*=\s*\{([^}]*)\}/g, 'let $1 = [$2]');
    t = t.replace(/\bnew\s+(?:int|double|String)\s*\[\s*\]\s*\{([^}]*)\}/g, '[$1]');
    t = t.replace(/\b(?:final\s+)?(?:int|double|float|long|short|byte|boolean|char|String)\b(?=\s+[A-Za-z_$])/g, 'let');
    t = t.replace(/\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.equals\s*\(([^)]*)\)/g, '($1 === $2)');
    t = t.replace(/\.length\s*\(\s*\)/g, '.length');
    t = t.replace(/\(double\)\s*([A-Za-z_$][\w$.]*|\d+(?:\.\d+)?)/g, 'Number($1)');
    t = t.replace(/\(int\)\s*([A-Za-z_$][\w$.]*|\d+(?:\.\d+)?)/g, 'Math.trunc($1)');
    t = t.replace(/\bInteger\.parseInt\s*\(/g, 'parseInt(')
      .replace(/\bDouble\.parseDouble\s*\(/g, 'parseFloat(');
    return addTicks(masked.restore(t));
  }

  /* ---------------- C / C++ ---------------- */

  function translateC(src, cpp) {
    let raw = stripPreprocessor(src);
    if (cpp) {
      raw = raw.replace(/\busing\s+namespace\s+std\s*;/g, '');
    }
    const masked = maskStrings(raw);
    let t = masked.text;
    t = stripLineComments(t);

    if (cpp) {
      t = t.replace(/\bstd::cout\b|\bcout\b/g, '__cout');
      t = t.replace(/\bstd::endl\b|\bendl\b/g, '"\\n"');
      // vector / map declarations
      t = t.replace(/\bstd::vector\s*<[^>]*>\s*(\w+)\s*=\s*\{([^}]*)\}/g, 'let $1 = [$2]');
      t = t.replace(/\bstd::vector\s*<[^>]*>\s*(\w+)\s*;/g, 'let $1 = [];');
      t = t.replace(/\bstd::map\s*<[^>]*>\s*(\w+)\s*;/g, 'let $1 = {};');
      t = t.replace(/\bstd::string\b/g, 'let');
      t = t.replace(/\bauto\b/g, 'let');
      // cout chains
      t = t.replace(/__cout([^;]*);/g, (m, chain) => {
        const parts = splitOutsideQuotes(chain, '<<').map(x => x.trim()).filter(Boolean);
        return '__cout(' + parts.join(', ') + ');';
      });
      t = t.replace(/\b(\w+)\.push_back\s*\(/g, '$1.push(');
    }

    // 数字字面量后缀：0.75f / 2.0F 在 C/C++ 中合法，JS 不认识
    t = t.replace(/(\d+(?:\.\d+)?)[fF]\b/g, '$1');
    // static 局部变量在教学中按普通变量处理
    t = t.replace(/\bstatic\b/g, '');
    // strip prototypes
    t = t.replace(/^\s*(?:void|int|double|float|char|long|short|bool)\s+\w+\s*\([^;{}]*\)\s*;\s*$/gm, '');
    // function definitions
    t = t.replace(/\b(?:void|int|double|float|char|long|short|bool)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (m, name, params) => {
      return 'function ' + name + '(' + cleanCParams(params) + ') {';
    });
    // const
    t = t.replace(/\bconst\s+(?:unsigned\s+)?(?:int|double|float|char|long|short|bool)\b/g, 'const');
    // array initializers
    t = t.replace(/\b(\w+)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]*)\}/g, '$1 = [$2]');
    // type declarations
    t = t.replace(/\b(?:unsigned\s+|signed\s+)?(?:int|double|float|char|long|short|bool)\b/g, 'let');
    t = t.replace(/\bNULL\b/g, 'null');
    t = t.replace(/\bprintf\s*\(/g, '__printf(');
    // range for (cpp)
    t = t.replace(/for\s*\(\s*let\s+(\w+)\s*:\s*([^)]+)\)\s*\{/g, 'for (const $1 of $2) {');

    let js = masked.restore(t);
    js = addTicks(js);
    if (/\bfunction\s+main\s*\(/.test(js)) js += '\nmain();';
    return js;
  }

  /* ---------------- Go ---------------- */

  function translateGo(src) {
    let raw = String(src).replace(/\r/g, '');
    // strip package / import
    raw = raw.replace(/^\s*package\s+\w+\s*$/gm, '');
    raw = raw.replace(/^\s*import\s*\([\s\S]*?\)\s*$/gm, '');
    raw = raw.replace(/^\s*import\s+[^\n]+$/gm, '');
    const masked = maskStrings(raw);
    let t = masked.text;
    t = stripLineComments(t);

    t = t.replace(/\bfmt\.Println\s*\(/g, '__gprintln(')
      .replace(/\bfmt\.Printf\s*\(/g, '__gprintf(')
      .replace(/\bfmt\.Print\s*\(/g, '__gprint(')
      .replace(/\bfmt\.Errorf\s*\(/g, '__gerror(');

    t = t.replace(/\[\]\s*(?:int|int64|float64|string|bool|byte)\s*\{([^}]*)\}/g, '[$1]');
    t = t.replace(/map\s*\[[^\]]+\]\s*[^\s{]+\s*\{([^}]*)\}/g, '{$1}');
    t = t.replace(/\bmake\s*\(\s*\[\]\s*\w+\s*,\s*[^)]*\)/g, '[]');

    // for init
    t = t.replace(/for\s+([A-Za-z_]\w*)\s*:=\s*([^;]+);\s*([^;]+);\s*([^{]+)\{/g,
      'for (let $1 = $2; $3; $4) {');
    // range with key,value
    t = t.replace(/for\s+([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)\s*:=\s*range\s+([^{]+)\{/g, (m, a, b, expr) => {
      if (a === '_') return 'for (const ' + b + ' of ' + expr.trim() + ') {';
      return 'for (const [' + a + ', ' + b + '] of ' + expr.trim() + '.entries()) {';
    });
    // range single
    t = t.replace(/for\s+([A-Za-z_]\w*)\s*:=\s*range\s+([^{]+)\{/g, 'for (const $1 of $2) {');
    // bare for condition
    t = t.replace(/for\s+(?!\()\s*\{/g, 'while (true) {');
    t = t.replace(/for\s+(?!\()([^{]+)\{/g, 'while ($1) {');

    // if / else if (Go omits parentheses)
    t = t.replace(/\bif\s+(?!\()([^{]+?)\s*\{/g, 'if ($1) {');

    // funcs
    t = t.replace(/\bfunc\s+(\w+)\s*\(([^)]*)\)\s*(?:\([^)]*\)|[A-Za-z_]\w*)?\s*\{/g, (m, name, params) => {
      return 'function ' + name + '(' + cleanGoParams(params) + ') {';
    });

    t = t.replace(/\bvar\s+(\w+)\s+(?:int64|int|float64|float32|string|bool)\s*=\s*/g, 'let $1 = ');
    t = t.replace(/\bvar\s+(\w+)\s+(int64|int|float64|float32|string|bool)\s*;/g, (m, name, type) => {
      const zero = type === 'string' ? '""' : type === 'bool' ? 'false' : '0';
      return 'let ' + name + ' = ' + zero + ';';
    });
    t = t.replace(/([A-Za-z_]\w*)\s*:=\s*/g, 'let $1 = ');

    t = t.replace(/\blen\s*\(/g, '__len(')
      .replace(/\bappend\s*\(/g, '__append(')
      .replace(/\bdelete\s*\(/g, '__del(')
      .replace(/\bnil\b/g, 'null')
      .replace(/\biota\b/g, '0');

    let js = masked.restore(t);
    js = addTicks(js);
    if (/\bfunction\s+main\s*\(/.test(js)) js += '\nmain();';
    return js;
  }

  /* ---------------- JS & shared ---------------- */

  function translateJs(src) {
    let t = String(src);
    t = t.replace(/\bconsole\.log\s*\(/g, '__jslog(')
      .replace(/\bconsole\.error\s*\(/g, '__jserr(')
      .replace(/\bconsole\.warn\s*\(/g, '__jserr(');
    return addTicks(t);
  }

  function addTicks(js) {
    return String(js)
      .replace(/\b(for|while)\s*\(([^)]*)\)\s*\{/g, m => m + ' __tick();')
      .replace(/\bdo\s*\{/g, m => m + ' __tick();');
  }

  /* ---------------- execution ---------------- */

  const HELPER_NAMES = [
    '__write', '__println', '__print', '__printf', '__pyprint', '__pywrite',
    '__jslog', '__jserr', '__gprintln', '__gprint', '__gprintf', '__gerror',
    '__cout', '__tick', '__range', '__iter', '__len', '__pystr', '__int', '__float',
    '__sum', '__type', '__dictget', 'math', 'random', '__append', '__del', '__input'
  ];

  // 把 JS 引擎的英文报错翻译成初学者能直接行动的提示。
  function friendlySyntax(msg) {
    const m = String(msg || '');
    if (/missing \) after argument list/i.test(m)) {
      return '括号没有配平。检查这一行是否漏写右括号 `)`，或把 `)` 误打成了 `}`。';
    }
    if (/Invalid or unexpected token/i.test(m)) {
      return '出现了无法识别的符号。检查是否用了中文引号（“”）或中文括号（），字符串请使用英文双引号 `"`。';
    }
    if (/Unexpected end of input/i.test(m)) {
      return '代码没有写完，可能缺少右括号 `)` 或右花括号 `}`。';
    }
    if (/Unexpected identifier/i.test(m)) {
      return '这里少了一个运算符或分隔符，常见于漏写分号 `;` 或 `+`。';
    }
    if (/Unexpected token/i.test(m)) {
      return '这一行附近有多余或缺失的符号，重点检查 `{}`、`()` 和分号。';
    }
    return m;
  }

  function run(code, langId) {
    const rawLang = String(langId || 'javascript').toLowerCase();
    const lang = rawLang === 'js' ? 'javascript'
      : rawLang === 'py' ? 'python'
        : rawLang === 'c++' ? 'cpp'
          : rawLang === 'golang' ? 'go'
            : rawLang;

    const out = [];
    let steps = 0;
    const startedAt = Date.now();

    const H = {
      __write(s) { out.push(String(s)); },
      __println(...args) { out.push(args.map(pyStr).join(' ') + '\n'); },
      __print(...args) { out.push(args.map(pyStr).join(' ')); },
      __printf(fmt, ...args) { out.push(cFormat(fmt, args)); },
      __pyprint(...args) { out.push(args.map(pyStr).join(' ') + '\n'); },
      __pywrite(...args) { out.push(args.map(pyStr).join('')); },
      __jslog(...args) { out.push(args.map(jsStr).join(' ') + '\n'); },
      __jserr(...args) { out.push('[warn] ' + args.map(jsStr).join(' ') + '\n'); },
      __gprintln(...args) { out.push(args.map(goStr).join(' ') + '\n'); },
      __gprint(...args) { out.push(args.map(goStr).join(' ')); },
      __gprintf(fmt, ...args) { out.push(goFormat(fmt, args)); },
      __gerror(fmt, ...args) { return new Error(goFormat(fmt, args)); },
      __cout(...args) { out.push(args.map(v => v === null || v === undefined ? '' : String(v)).join('')); },
      __tick() {
        steps++;
        if (steps > MAX_STEPS) throw new Error('__LOOP_LIMIT__');
      },
      __range(...a) {
        let start = 0, stop = 0, step = 1;
        if (a.length === 1) { stop = Number(a[0]); }
        else if (a.length === 2) { start = Number(a[0]); stop = Number(a[1]); }
        else { start = Number(a[0]); stop = Number(a[1]); step = Number(a[2]) || 1; }
        const arr = [];
        if (step > 0) { for (let i = start; i < stop; i += step) arr.push(i); }
        else { for (let i = start; i > stop; i += step) arr.push(i); }
        return arr;
      },
      __iter(v) {
        if (v === null || v === undefined) return [];
        if (Array.isArray(v) || typeof v === 'string') return Array.from(v);
        if (typeof v === 'object') return Object.keys(v);
        return [];
      },
      __len(v) {
        if (v === null || v === undefined) return 0;
        if (typeof v === 'string' || Array.isArray(v)) return v.length;
        if (typeof v === 'object') return Object.keys(v).length;
        return 0;
      },
      __pystr(v) { return pyStr(v); },
      __int(v) { return Math.trunc(Number(v) || 0); },
      __float(v) { return Number(v) || 0; },
      __sum(v) { return (v || []).reduce((a, b) => a + Number(b || 0), 0); },
      __type(v) {
        if (v === null || v === undefined) return "<class 'NoneType'>";
        if (typeof v === 'boolean') return "<class 'bool'>";
        if (typeof v === 'number') return Number.isInteger(v) ? "<class 'int'>" : "<class 'float'>";
        if (typeof v === 'string') return "<class 'str'>";
        if (Array.isArray(v)) return "<class 'list'>";
        return "<class 'dict'>";
      },
      __dictget(obj, key, dflt) {
        return obj && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : (dflt === undefined ? null : dflt);
      },
      math: {
        sqrt: Math.sqrt, pow: Math.pow, floor: Math.floor, ceil: Math.ceil,
        abs: Math.abs, round: Math.round, pi: Math.PI, e: Math.E
      },
      random: {
        random: Math.random,
        randint(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
        choice(list) { return list[Math.floor(Math.random() * list.length)]; }
      },
      __append(v, ...items) { return (v || []).concat(items); },
      __del(obj, key) { if (obj && typeof obj === 'object') delete obj[key]; },
      __input() { throw new Error('__NO_INPUT__'); }
    };

    let js;
    try {
      if (lang === 'python') js = translatePython(code);
      else if (lang === 'java') js = translateJava(code);
      else if (lang === 'c') js = translateC(code, false);
      else if (lang === 'cpp') js = translateC(code, true);
      else if (lang === 'go') js = translateGo(code);
      else if (lang === 'javascript') js = translateJs(code);
      else throw new Error('暂不支持的语言：' + lang);
    } catch (e) {
      return { ok: false, output: out.join(''), error: '无法解析代码：' + e.message, ms: Date.now() - startedAt, lang, js: '' };
    }

    try {
      const header = '"use strict";\nconst {' + HELPER_NAMES.join(', ') + '} = __H;\n';
      const fn = new Function('__H', header + js);
      fn(H);
      return { ok: true, output: out.join(''), error: null, ms: Date.now() - startedAt, lang, js };
    } catch (e) {
      let msg = e && e.message ? e.message : String(e);
      if (msg === '__LOOP_LIMIT__') msg = '循环步数超过上限，可能存在死循环。';
      else if (msg === '__NO_INPUT__') msg = '教学终端不支持交互输入，请使用固定数据。';
      else if (e instanceof SyntaxError) msg = '语法错误：' + friendlySyntax(msg);
      else if (e instanceof ReferenceError) msg = '运行错误：使用了未定义的名字（' + msg + '）';
      else if (e instanceof TypeError) msg = '运行错误：类型不匹配（' + msg + '）';
      return { ok: false, output: out.join(''), error: msg, ms: Date.now() - startedAt, lang, js };
    }
  }

  LS.microrun = {
    version: '1.0.0',
    run,
    langs: ['python', 'c', 'cpp', 'java', 'go', 'javascript'],
    help: '支持变量、算术、条件、循环、数组/切片、字典/map、函数与常见输出语句的教学子集。'
  };
})(window.LS);
