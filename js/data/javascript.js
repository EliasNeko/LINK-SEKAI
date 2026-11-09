/* JavaScript — 誓约骑士 · 誓约之门 */
LS.registerLanguage({
  id: 'javascript',
  name: 'JavaScript',
  jp: 'ジャバスクリプト',
  profession: '誓约骑士',
  professionJp: 'ナイト',
  professionStyle: 'knight',
  color: '#c99a4b',
  color2: '#e8d3a2',
  sigil: '誓',
  difficulty: 1,
  tagline: '让世界动起来的那一句誓约。',
  role: '城门守望者',
  weapon: '长剑',
  element: '誓',
  worldIntro: '誓约之门连接着无数会呼吸的页面。骑士不靠蛮力，而靠一条条准确的事件与承诺，让城门在正确的时刻开启。这里的魔法写在浏览器里，也写在服务器、桌面与星空之间。',
  description: '互联网的通用语言。JavaScript 从浏览器脚本成长为全栈语言，语法灵活、生态庞大，是做出「看得见的作品」最快的入口。',
  chapters: [
    {
      id: 'js-1', title: '第一章 · 誓约之门', jp: '誓いの門',
      subtitle: '写下第一句会被世界听见的话', summary: 'console、变量、类型、模板字符串与调试。',
      nodes: [
        {
          id: 'js-1-1', type: 'story', title: '沉默的城门', jp: '沈黙の門', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '誓约之门的铭文灭了。守门骑士团留下的最后一条指令，是一句没有写完的输出。' },
            { who: '赛琳', tone: 'ally', text: '我是城门骑士赛琳。JavaScript 的第一课很简单：让控制台说话。console.log 就是我们的传令官。' },
            { who: '乱码哥布林', tone: 'enemy', text: 'undefined！undefined！你们连自己要输出什么都不知道！' },
            { who: '赛琳', tone: 'ally', text: '别理它。先输出两行：一行是城名 LINK-SEKAI，一行是 7 乘 6 的结果。' }
          ]
        },
        {
          id: 'js-1-2', type: 'lesson', title: '变量、类型与输出', jp: '変数と出力', xp: 30, minutes: 16,
          article: {
            lead: 'JavaScript 是运行在宿主环境中的脚本语言。浏览器给它 DOM 与网络，Node.js 给它文件与进程。语言本身很小，生态很大。学习时先把语言核心打牢，再去认识各种框架。',
            sections: [
              {
                h: '1. console.log 与第一行代码',
                p: [
                  'console.log(...) 会把参数打印到控制台。字符串用单引号、双引号或反引号包裹。多个参数之间用逗号分隔，输出时以空格连接。',
                  '浏览器里按 F12 打开开发者工具，选择 Console 就能看到输出。Node.js 中直接在终端运行 node 文件名.js。'
                ],
                code: { lang: 'javascript', src: 'console.log("Hello, Link-Sekai");\nconsole.log(7 * 6);\nconsole.log("HP", 100);' },
                note: '分号在 JavaScript 中通常可以省略，但团队协作时建议统一保留。'
              },
              {
                h: '2. let、const 与 var',
                p: [
                  '现代 JavaScript 用 let 声明可重新赋值的变量，用 const 声明不再重新赋值的常量。var 是旧写法，存在变量提升与函数作用域问题，新代码应避免。',
                  'const 只限制「不能重新赋值」，并不冻结对象内部。const bag = {}; bag.item = 1; 是合法的。'
                ],
                code: { lang: 'javascript', src: 'let hp = 100;\nconst name = "赛琳";\nhp = hp - 18;\nconsole.log(name, hp);' }
              },
              {
                h: '3. 基本类型',
                p: [
                  '常见基本类型：number（所有数字）、string（字符串）、boolean（true/false）、null（空值）、undefined（未赋值）、bigint、symbol。对象与数组属于引用类型。',
                  'JavaScript 是动态类型语言，变量本身没有类型，值才有类型。typeof 可以查看值的类型，但 typeof null 返回 "object"，这是历史遗留问题。'
                ],
                code: { lang: 'javascript', src: 'console.log(typeof 42);\nconsole.log(typeof "誓约");\nconsole.log(typeof true);\nconsole.log(1 / 0);\nconsole.log(0.1 + 0.2);' },
                note: '0.1 + 0.2 得到 0.30000000000000004，这是二进制浮点数的常见现象，不是 JavaScript 独有的 bug。'
              },
              {
                h: '4. 模板字符串与字符串操作',
                p: [
                  '反引号包裹的模板字符串可以用 ${表达式} 插入值，也可以直接换行。它比用加号拼接更清楚。',
                  '常用方法：length、toUpperCase、includes、slice、split、trim。字符串本身不可变，方法返回新字符串。'
                ],
                code: { lang: 'javascript', src: 'const name = "赛琳";\nconst lv = 3;\nconsole.log(`骑士 ${name} · Lv.${lv}`);\nconsole.log("Link-Sekai".split("-"));' }
              },
              {
                h: '5. 常见错误与调试',
                p: [
                  '拼错变量名会得到 ReferenceError；对 undefined 取属性会得到 TypeError；语法错误会让整段脚本完全不执行。',
                  '调试顺序：先看控制台第一条红色报错，再在可疑位置 console.log 打印中间值。不要一次改十处，一次只验证一个假设。'
                ],
                note: '本游戏终端会执行你写的核心语句，并检查标准输出，不涉及真实浏览器页面。'
              }
            ],
            terms: [
              { t: '控制台', en: 'console', d: '浏览器或 Node.js 中查看日志与错误的工具面板。' },
              { t: '动态类型', en: 'dynamic typing', d: '变量的类型由当前保存的值决定，运行时才确定。' },
              { t: '模板字符串', en: 'template literal', d: '用反引号包裹、支持 ${} 插值的字符串。' },
              { t: 'undefined', d: '变量已声明但尚未赋值时的默认值。' },
              { t: 'TypeError', d: '对不合适的值执行操作时抛出的运行时错误。' }
            ],
            exam: '二级 Web/前端与面试高频：let/const/var 区别、typeof 结果、== 与 ===、模板字符串、浮点数精度、短路运算。',
            checklist: ['会用 console.log 输出', '能区分 let 与 const', '认识常见基本类型', '会用模板字符串']
          }
        },
        {
          id: 'js-1-3', type: 'battle', title: '遭遇 · 乱码哥布林', jp: '文字化けゴブリン', xp: 60,
          enemy: {
            name: '乱码哥布林', kind: 'glitch', hp: 100,
            title: '影兽 · 未定义者', taunt: 'undefined！你的变量根本不存在！',
            lore: '它靠混乱的变量名生存。两句清晰、确定的输出，就能让城门的铭文重新亮起。'
          },
          brief: '城门铭文需要两条信息：城名与守军数量。用 console.log 输出 LINK-SEKAI 和 7 乘 6 的结果。',
          tasks: [
            {
              prompt: '使用 console.log 输出两行：第一行文字 LINK-SEKAI，第二行输出 7 * 6 的计算结果。',
              requirement: '预期输出：LINK-SEKAI / 42',
              expected: 'LINK-SEKAI\n42',
              starter: '// 让控制台说出两行\n',
              hints: [
                '第一行：console.log("LINK-SEKAI");',
                '第二行直接写表达式：console.log(7 * 6);',
                '两行都要有，注意引号只包住文字，不要包住算式。'
              ],
              solution: 'console.log("LINK-SEKAI");\nconsole.log(7 * 6);',
              must: { re: 'console\\.log\\s*\\(', text: '必须使用 console.log 输出' }
            }
          ],
          outro: '铭文重新亮起，哥布林缩成一团乱码散去。赛琳把一枚刻着分号的徽章别在你胸前：「第一句誓约，成立。」',
          loot: LS.makeLoot('uncommon', '初誓短剑', 'weapon', '†', '剑柄上刻着 console.log。它提醒你：再宏大的系统，也要从一句能被看见的话开始。', 'javascript')
        }
      ]
    },
    {
      id: 'js-2', title: '第二章 · 分支回廊', jp: '分岐の回廊',
      subtitle: '在无数条道路中做出选择', summary: '运算符、条件、switch 与循环。',
      nodes: [
        {
          id: 'js-2-1', type: 'story', title: '迷雾中的岔路', jp: '霧の分かれ道', xp: 15,
          lines: [
            { who: '赛琳', tone: 'ally', text: '回廊每隔十步就分出一条岔路。走错不会立刻死，却会离城门越来越远。' },
            { who: '界灵·零', tone: 'guide', text: '用循环把 1 到 100 的石板编号加总，得到回廊的总长度。数字对了，雾就会散。' },
            { who: '迷雾狼', tone: 'enemy', text: '每一条路都通向终点。你凭什么说自己选对了？' },
            { who: '赛琳', tone: 'ally', text: '凭条件。凭每一次判断都有明确的依据。' }
          ]
        },
        {
          id: 'js-2-2', type: 'lesson', title: '条件、循环与真值', jp: '条件と循環', xp: 30, minutes: 17,
          article: {
            lead: 'JavaScript 的流程控制看起来和 C、Java 相似，但真值判断更宽松：很多值会被自动转换成 true 或 false。理解这套规则，能避免大量隐蔽 bug。',
            sections: [
              {
                h: '1. 比较与相等',
                p: [
                  '== 会先做类型转换再比较，=== 要求类型与值都相同。工程上默认使用 ===，除非你非常清楚自己在做什么。',
                  'NaN 不等于任何值，包括它自己。判断 NaN 要用 Number.isNaN(x)。对象比较的是引用，两个内容相同的对象并不 ===。'
                ],
                code: { lang: 'javascript', src: 'console.log(1 == "1");\nconsole.log(1 === "1");\nconsole.log(null == undefined);\nconsole.log(null === undefined);\nconsole.log(Number.isNaN(NaN));' }
              },
              {
                h: '2. if / else 与真值转换',
                p: [
                  'if 会把条件转换成布尔值。假值包括 false、0、-0、0n、""、null、undefined、NaN；其余值（包括空数组和空对象）都是真值。',
                  '这是 JavaScript 的经典陷阱：if ([]) 会进入分支。不要凭直觉判断容器是否为空。'
                ],
                code: { lang: 'javascript', src: 'const hp = 35;\nif (hp <= 0) {\n  console.log("倒下");\n} else if (hp < 40) {\n  console.log("危险");\n} else {\n  console.log("安全");\n}' }
              },
              {
                h: '3. switch 与穿透',
                p: [
                  'switch 用 === 比较。每个 case 后通常要写 break，否则会继续执行下一个 case，这叫穿透。多个 case 共用逻辑时可以故意省略 break。',
                  '现代代码中，对象映射或 if/else 往往比很长的 switch 更清晰。选择可读性最好的写法。'
                ],
                code: { lang: 'javascript', src: 'const rank = "B";\nswitch (rank) {\n  case "S":\n    console.log("传说");\n    break;\n  case "A":\n  case "B":\n    console.log("精锐");\n    break;\n  default:\n    console.log("见习");\n}' }
              },
              {
                h: '4. for、while 与 for...of',
                p: [
                  'for (初始化; 条件; 更新) 适合次数确定的循环。while 先判断后执行。do...while 至少执行一次。',
                  'for...of 用于遍历可迭代对象的值，例如数组与字符串；for...in 遍历对象的键，通常不推荐用来遍历数组。'
                ],
                code: { lang: 'javascript', src: 'let total = 0;\nfor (let i = 1; i <= 100; i++) {\n  total += i;\n}\nconsole.log(total);\n\nfor (const ch of "誓约") {\n  console.log(ch);\n}' }
              },
              {
                h: '5. break、continue 与循环选择',
                p: [
                  'break 结束当前循环，continue 跳过本轮剩余代码。标签（label）可以跳出多层循环，但会降低可读性，实际项目很少使用。',
                  '写循环时优先考虑「能否用数组方法表达」。map、filter、reduce 往往比手写下标更不容易出错，但初学阶段先把 for 写扎实。'
                ],
                note: '考试常考循环执行次数、break/continue 的影响、== 与 === 的结果差异。'
              }
            ],
            terms: [
              { t: '严格相等', en: 'strict equality', d: '===，要求类型和值都相同。' },
              { t: '真值', en: 'truthy', d: '在条件中被转换为 true 的值。' },
              { t: '假值', en: 'falsy', d: 'false、0、""、null、undefined、NaN 等在条件中转为 false 的值。' },
              { t: '穿透', en: 'fallthrough', d: 'switch 中未写 break，继续执行后续 case 的行为。' },
              { t: '可迭代对象', en: 'iterable', d: '可以被 for...of 遍历的对象，如数组、字符串、Map。' }
            ],
            exam: '前端面试高频：== 与 ===、假值列表、switch 穿透、for...of 与 for...in 的区别、循环次数计算。',
            checklist: ['默认使用 ===', '能背出常见假值', '会写 if/switch/循环', '知道 for...of 的用途']
          }
        },
        {
          id: 'js-2-3', type: 'battle', title: '遭遇 · 迷雾狼', jp: '霧狼', xp: 60,
          enemy: {
            name: '迷雾狼', kind: 'wolf', hp: 100,
            title: '影兽 · 岔路猎手', taunt: '选错了。又选错了。你还要走多久？',
            lore: '它把回廊的长度藏进雾里。用循环把 1 到 100 累加，雾就会退到看得见的边界。'
          },
          brief: '回廊共有编号 1 到 100 的石板。用循环计算编号总和并输出。',
          tasks: [
            {
              prompt: '使用 for 或 while 循环计算 1 到 100（含 100）的总和并输出。必须出现循环结构，不能直接输出 5050。',
              requirement: '预期输出：5050',
              expected: '5050',
              starter: 'let total = 0;\n// 用循环累加 1 到 100\n',
              hints: [
                '循环写成 for (let i = 1; i <= 100; i++)。',
                '循环体内执行 total += i; 或 total = total + i;。',
                '循环结束后 console.log(total);。'
              ],
              solution: 'let total = 0;\nfor (let i = 1; i <= 100; i++) {\n  total += i;\n}\nconsole.log(total);',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' }
            }
          ],
          outro: '雾退成一条笔直的长廊，尽头的门缝透出金光。迷雾狼低下头，像在向一个更坚定的选择致意。',
          loot: LS.makeLoot('rare', '岔路护腕', 'armor', '⛨', '护腕内侧刻着 5050。它不告诉你哪条路对，只让你在每次判断前多看一眼条件。', 'javascript')
        }
      ]
    },
    {
      id: 'js-3', title: '第三章 · 函数庭院', jp: '関数の庭',
      subtitle: '把誓言封装成可以托付的契约', summary: '函数、数组、对象、作用域与回调。',
      nodes: [
        {
          id: 'js-3-1', type: 'story', title: '影之侍从', jp: '影の従者', xp: 15,
          lines: [
            { who: '赛琳', tone: 'ally', text: '庭院里有一队影之侍从，它们只认「可以重复调用的命令」。写一条一次性指令，它们不会服从。' },
            { who: '界灵·零', tone: 'guide', text: '函数就是可重复调用的契约。把四份伤害数据求和封装起来，侍从才会承认你的指挥权。' },
            { who: '影之侍从', tone: 'enemy', text: '一次性的命令……不算誓言。' },
            { who: '赛琳', tone: 'ally', text: '那就写一个函数。让同一段逻辑，可以被无数次召唤。' }
          ]
        },
        {
          id: 'js-3-2', type: 'lesson', title: '函数、数组与对象', jp: '関数と配列と対象', xp: 30, minutes: 20,
          article: {
            lead: '函数把逻辑封装成可复用的单元；数组与对象把数据组织成结构。三者组合起来，你就能描述一个真正的小世界。',
            sections: [
              {
                h: '1. 函数声明与箭头函数',
                p: [
                  '函数声明 function add(a, b) { return a + b; } 会提升到作用域顶部。函数表达式与箭头函数不会以同样方式提升。',
                  '箭头函数 (a, b) => a + b 适合短逻辑。它没有自己的 this，这一点在对象方法中要特别注意。'
                ],
                code: { lang: 'javascript', src: 'function add(a, b) {\n  return a + b;\n}\nconst mul = (a, b) => a * b;\nconsole.log(add(3, 5));\nconsole.log(mul(3, 5));' }
              },
              {
                h: '2. 参数与返回值',
                p: [
                  '没有 return 的函数返回 undefined。return 会立即结束函数。参数少于形参时，缺省值为 undefined；可以用默认参数 function f(x = 0) 提供兜底。',
                  '剩余参数 ...nums 把多余实参收集成数组。展开运算符 ...arr 则把数组展开成独立元素。'
                ],
                code: { lang: 'javascript', src: 'function sum(...nums) {\n  let total = 0;\n  for (const n of nums) {\n    total += n;\n  }\n  return total;\n}\nconsole.log(sum(1, 2, 3, 4));' }
              },
              {
                h: '3. 数组与常用方法',
                p: [
                  '数组用 [] 创建，下标从 0 开始。push/pop 在尾部增删，unshift/shift 在头部增删。slice 不修改原数组，splice 会修改。',
                  'map 转换每个元素，filter 筛选，reduce 归并，find 查找第一个匹配项。它们都接收回调函数，是 JavaScript 函数式风格的基础。'
                ],
                code: { lang: 'javascript', src: 'const dmg = [12, 8, 20, 5];\nlet total = 0;\nfor (const v of dmg) {\n  total += v;\n}\nconsole.log(total);\nconsole.log(dmg.map(v => v * 2));' }
              },
              {
                h: '4. 对象与解构',
                p: [
                  '对象用 { key: value } 创建，用点号或方括号访问。方法就是值为函数的属性。对象是引用类型，赋值时复制的是引用。',
                  '解构可以快速取出属性：const { name, hp } = player;。展开对象 { ...a, ...b } 常用于创建副本或合并配置。'
                ],
                code: { lang: 'javascript', src: 'const player = { name: "赛琳", hp: 100, atk: 18 };\nconsole.log(player.name);\nconst { name, hp } = player;\nconsole.log(`${name} HP=${hp}`);' }
              },
              {
                h: '5. 作用域与闭包',
                p: [
                  'let/const 是块级作用域，var 是函数作用域。内层作用域可以访问外层变量，外层不能访问内层。',
                  '闭包是函数与其词法环境的组合。它让函数在离开定义位置后，仍能记住当时的变量。这是回调、模块与许多设计模式的基础。'
                ],
                code: { lang: 'javascript', src: 'function counter() {\n  let n = 0;\n  return () => {\n    n += 1;\n    return n;\n  };\n}\nconst next = counter();\nconsole.log(next());\nconsole.log(next());' }
              }
            ],
            terms: [
              { t: '回调函数', en: 'callback', d: '作为参数传给另一个函数、在适当时机被调用的函数。' },
              { t: '箭头函数', en: 'arrow function', d: '用 => 定义的简洁函数，不绑定自己的 this。' },
              { t: '解构', en: 'destructuring', d: '从数组或对象中按结构提取值。' },
              { t: '闭包', en: 'closure', d: '函数与其定义时词法环境的组合。' },
              { t: '引用类型', en: 'reference type', d: '变量保存的是对象引用，赋值时共享同一份数据。' }
            ],
            exam: '二级 Web/前端高频：函数返回值、数组方法、对象属性访问、let 与 var 的作用域、闭包、浅拷贝与深拷贝。',
            checklist: ['会定义与调用函数', '掌握数组遍历与求和', '能创建并访问对象', '理解块级作用域']
          }
        },
        {
          id: 'js-3-3', type: 'battle', title: '遭遇 · 影之侍从', jp: '影の従者', xp: 60,
          enemy: {
            name: '影之侍从', kind: 'wraith', hp: 100,
            title: '造物 · 契约检验者', taunt: '你的命令，只能用一次。',
            lore: '它只服从可复用的逻辑。用数组保存四份伤害，并用循环求和，证明你的命令值得被反复托付。'
          },
          brief: '四份伤害记录 [8, 15, 3, 9] 被封在影中。用数组与循环求总和，唤醒庭院的契约。',
          tasks: [
            {
              prompt: '给定数组 const dmg = [8, 15, 3, 9]; 用循环遍历并输出总和。必须使用数组与循环。',
              requirement: '预期输出：35',
              expected: '35',
              starter: 'const dmg = [8, 15, 3, 9];\nlet total = 0;\n// 遍历数组并累加\n',
              hints: [
                '可以用 for (const v of dmg)，也可以用带下标的 for。',
                '每轮把当前值加到 total。',
                '最后 console.log(total);。'
              ],
              solution: 'const dmg = [8, 15, 3, 9];\nlet total = 0;\nfor (const v of dmg) {\n  total += v;\n}\nconsole.log(total);',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' }
            }
          ],
          outro: '侍从们同时单膝跪地。庭院中央的契约石亮起一行字：同一段逻辑，可以被无数次召唤。',
          loot: LS.makeLoot('epic', '契约之戒', 'relic', '◇', '戒指内圈刻着 return。它不增加力量，只让你的每一次承诺都有明确的交付。', 'javascript')
        }
      ]
    },
    {
      id: 'js-4', title: '第四章 · 王座之厅', jp: '終章・玉座の間',
      subtitle: '面对会吞掉名字的恶龙', summary: '类、原型、JSON、异常与异步；挑战 Boss。',
      nodes: [
        {
          id: 'js-4-1', type: 'story', title: '被吞掉的名字', jp: '喰われた名', xp: 15,
          lines: [
            { who: '赛琳', tone: 'ally', text: '恶龙吞掉了王座上所有的名字。没有名字，对象就失去身份，誓言也无法被追溯。' },
            { who: '界灵·零', tone: 'guide', text: '终战需要两次精确操作：从五份残响中找出最大值，再用嵌套循环画出三层星阵。' },
            { who: '噬名恶龙', tone: 'enemy', text: '名字只是字符串。字符串可以被覆盖，被清空，被遗忘。' },
            { who: '赛琳', tone: 'ally', text: '但结构不会。对象、类、契约——它们记得每个名字该在的位置。' }
          ]
        },
        {
          id: 'js-4-2', type: 'lesson', title: '类、JSON 与异步', jp: 'クラスと非同期', xp: 30, minutes: 24,
          article: {
            lead: '这一章把 JavaScript 从「会算」推进到「能组织一个应用」：用类描述实体，用 JSON 交换数据，用异常兜住失败，用异步等待未来。',
            sections: [
              {
                h: '1. 对象、原型与 class',
                p: [
                  'JavaScript 的对象通过原型链继承属性。class 是更清晰的语法糖，本质仍然基于原型。constructor 在 new 时执行，方法定义在原型上。',
                  '继承用 extends，子类构造器中必须先调用 super()。方法可以被重写，这就是多态。'
                ],
                code: { lang: 'javascript', src: 'class Knight {\n  constructor(name, hp) {\n    this.name = name;\n    this.hp = hp;\n  }\n  hit(dmg) {\n    this.hp = Math.max(0, this.hp - dmg);\n    return this.hp;\n  }\n}\nconst k = new Knight("赛琳", 100);\nconsole.log(k.hit(25));' }
              },
              {
                h: '2. JSON',
                p: [
                  'JSON 是一种文本数据格式，键必须用双引号。JSON.stringify 把对象转成字符串，JSON.parse 把字符串转回对象。',
                  'JSON 不支持 undefined、函数、循环引用。日期会被转成字符串。跨网络传输时，所有数据最终都要变成这样的文本。'
                ],
                code: { lang: 'javascript', src: 'const player = { name: "赛琳", hp: 100 };\nconst text = JSON.stringify(player);\nconsole.log(text);\nconst back = JSON.parse(text);\nconsole.log(back.name);' }
              },
              {
                h: '3. 异常处理',
                p: [
                  '用 try 包裹可能失败的代码，用 catch 捕获错误，用 finally 执行无论成功失败都要做的清理。throw 可以主动抛出错误。',
                  '不要用异常代替正常分支。可预期的业务结果应该用返回值表达，真正的异常留给「不该发生」的情况。'
                ],
                code: { lang: 'javascript', src: 'function parseHp(text) {\n  const n = Number(text);\n  if (Number.isNaN(n)) {\n    throw new Error("HP 不是数字");\n  }\n  return n;\n}\ntry {\n  console.log(parseHp("88"));\n} catch (err) {\n  console.log(err.message);\n}' }
              },
              {
                h: '4. Promise 与 async/await',
                p: [
                  'Promise 表示一个未来才会完成的操作，有 pending、fulfilled、rejected 三种状态。then 处理成功，catch 处理失败。',
                  'async 函数总是返回 Promise，await 会暂停当前函数直到 Promise 完成。它让异步代码看起来像同步代码，但不会阻塞整个线程。'
                ],
                code: { lang: 'javascript', src: 'function wait(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\nasync function main() {\n  await wait(10);\n  console.log("誓约完成");\n}\nmain();' },
                note: '本游戏终端为同步执行环境，异步示例用于理解结构，不作为关卡判定。'
              },
              {
                h: '5. 模块与工程化',
                p: [
                  '现代 JavaScript 用 import/export 组织模块。每个模块有独立作用域，只暴露明确导出的内容。',
                  '工程化还包括包管理（npm）、打包、类型检查（TypeScript）、测试与 lint。语言只是起点，工具链决定了团队协作的上限。'
                ],
                note: '下一步建议：用原生 DOM 做一个小作品，再学一个框架。不要在没有项目的情况下只背 API。'
              }
            ],
            terms: [
              { t: '原型链', en: 'prototype chain', d: '对象逐级向上查找属性的继承机制。' },
              { t: '构造器', en: 'constructor', d: '用 new 创建对象时执行的初始化方法。' },
              { t: '序列化', en: 'serialization', d: '把内存中的对象转换为可存储或传输的文本。' },
              { t: 'Promise', d: '表示异步操作最终结果的对象。' },
              { t: 'async/await', d: '用同步写法组织异步流程的语法。' }
            ],
            exam: '前端面试高频：原型与 class、this 指向、JSON 方法、try/catch、Promise 状态、事件循环与微任务。',
            checklist: ['会用 class 创建对象', '掌握 JSON.stringify/parse', '会写 try/catch', '理解 async/await 的基本用法']
          }
        },
        {
          id: 'js-4-3', type: 'battle', title: '终战 · 噬名恶龙', jp: '名喰らいの竜', xp: 120,
          enemy: {
            name: '噬名恶龙', kind: 'dragon', hp: 100, boss: true,
            title: '首领 · 无名者', taunt: '把名字交出来。反正你也不会再用到它。',
            lore: '它用遗忘瓦解一切结构。只有精确地找出最大值、稳定地画出星阵，才能让王座重新记住每个名字。'
          },
          brief: '终战分两段。先找出五份残响中的最大值；再用嵌套循环画出三层星阵。两段完成，名字归位。',
          tasks: [
            {
              prompt: '第一击：给定 const dmg = [21, 4, 18, 9, 13]; 用循环找出最大值并输出。',
              requirement: '预期输出：21',
              expected: '21',
              starter: 'const dmg = [21, 4, 18, 9, 13];\nlet max = dmg[0];\n// 遍历剩余元素，更新最大值\n',
              hints: [
                '可以从下标 1 开始，也可以直接从第二个元素遍历。',
                '如果当前值大于 max，就更新 max。',
                '最后 console.log(max);。'
              ],
              solution: 'const dmg = [21, 4, 18, 9, 13];\nlet max = dmg[0];\nfor (let i = 1; i < dmg.length; i++) {\n  if (dmg[i] > max) {\n    max = dmg[i];\n  }\n}\nconsole.log(max);',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' }
            },
            {
              prompt: '第二击：用嵌套循环输出 3 行星阵。第 1 行 1 个星号，第 2 行 2 个，第 3 行 3 个。每行结束后换行。',
              requirement: '预期输出 3 行，逐行增加一个 *',
              expected: '*\n**\n***',
              starter: '// 外层控制行，内层控制星号数量\n',
              hints: [
                '外层 for (let i = 1; i <= 3; i++)。',
                '内层 for (let j = 1; j <= i; j++)，用不换行输出一个星号。',
                '内层结束后输出一个换行。'
              ],
              solution: 'for (let i = 1; i <= 3; i++) {\n  let line = "";\n  for (let j = 1; j <= i; j++) {\n    line += "*";\n  }\n  console.log(line);\n}',
              must: { re: '(for|while)\\s*\\([\\s\\S]*(for|while)\\s*\\(', text: '必须使用嵌套循环' }
            }
          ],
          outro: '恶龙在星阵里松开口，被吞掉的名字像萤火一样飞回王座。赛琳把剑插入地面：「誓约骑士的第一卷，完成了。真正的骑士，不是从不失败，而是每次都把名字写回原处。」',
          loot: LS.makeLoot('mythic', '无名者之誓', 'weapon', '✧', '剑身上没有名字，只有一行细小的 console.log。它等待你亲手写下下一句。', 'javascript')
        }
      ]
    }
  ]
});
