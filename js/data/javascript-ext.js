/* JavaScript 第二卷 · 源核之下
 * 8 章 × 3 节点：剧情 → 课程 → 战斗。
 * 只通过 window.LS 扩展，不修改第一卷数据文件。
 */
(function (LS) {
  'use strict';

  function apply(lang) {
    if (!lang || !Array.isArray(lang.chapters) || lang.chapters.length < 4) return;
    if (lang.__vol2JavaScript) return;
    lang.__vol2JavaScript = true;

    // 把第一卷第四章标记为卷一终章，避免出现两个“终章”
    const vol1 = lang.chapters[3];
    if (vol1.title.indexOf('卷一终章') < 0) {
      vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
    }
    const last = vol1.nodes[vol1.nodes.length - 1];
    if (last && last.title.indexOf('卷一终战') !== 0) {
      last.title = '卷一终战 · ' + last.title.replace(/^终战\s*·\s*/, '');
    }

    lang.chapters.push(
      /* ============================== 第五章 ============================== */
      {
        id: 'js-5', title: '第五章 · 织字回廊', jp: '文字の織廊',
        subtitle: '让一条数据流过三道工序', summary: '模板字符串、解构、展开，以及 map/filter/reduce 的数据流水线。',
        nodes: [
          {
            id: 'js-5-1', type: 'story', title: '锈色织机', jp: '錆の織機', xp: 20,
            lines: [
              { who: '赛琳', tone: 'ally', text: '源核之下第一层是织字回廊。旧织机还在转，但它只肯处理「一批」数据，不认孤零零的一个数字。' },
              { who: '界灵·零', tone: 'guide', text: '把每一批货想成三道工序：filter 选线，map 染色，reduce 收束。顺序错了，布就会打结。' },
              { who: '锈字魔像', tone: 'enemy', text: '一条一条来。手工循环才是诚实的。你们那些链式咒文，只是把错误藏得更深。' },
              { who: '赛琳', tone: 'ally', text: '那就让每一步都看得见。先筛掉无意义的残页，再把伤害翻倍，最后求和。' },
              { who: '维护者·缄', tone: 'guide', text: '织机原本属于旧系统。它不恨你，只是还没被正确地调用过。' }
            ]
          },
          {
            id: 'js-5-2', type: 'lesson', title: '字符串、解构与数据流水线', jp: '文字列と配列の流れ', xp: 40, minutes: 22,
            article: {
              lead: '真实的数据很少以单个数字出现，它们是一批订单、一列伤害、一页日志。本章学会用模板字符串描述数据，用解构与展开搬运结构，再用 map、filter、reduce 把一整条流水线写清楚。战斗里三件工具会同时出现。',
              sections: [
                {
                  h: '1. 模板字符串：把值嵌进句子',
                  p: [
                    '反引号包裹的字符串可以用 ${表达式} 插值，也可以直接换行。插值里放一个简单的表达式就够了，复杂逻辑先算好再放进去，句子会更好读。',
                    '常见错误：用单引号写 ${} 不会生效，它只是普通字符；忘记闭合反引号会让后面整段代码变成字符串；把对象直接插值会得到 [object Object]，应先取属性，或先做序列化。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const knight = "赛琳";\nconst hp = 82;\nconst line = `${knight} 的 HP 是 ${hp}，状态：${hp > 50 ? "稳定" : "危险"}`;\nconsole.log(line);\nconsole.log(`第一行\n第二行`);'
                  },
                  note: '模板字符串里的换行是真实换行，不是转义出来的两个字符。排版长文本时很方便。'
                },
                {
                  h: '2. 解构：从结构里取值',
                  p: [
                    '数组解构按位置取值：const [first, second] = list。对象解构按属性名取值：const { name, hp } = player。可以给默认值，也可以重命名，例如 { hp: life }。',
                    '解构还可以直接写在函数参数里，调用时传入对象即可。常见错误：对 null 或 undefined 解构会抛错；数组解构按位置而不是按名字，顺序一换结果就变；嵌套解构的层级要和数据结构完全对应。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const [first, second = 10, ...rest] = [3];\nconsole.log(first, second, rest.length);\n\nconst hero = { name: "赛琳", hp: 90, atk: 18 };\nconst { name, hp: life, mp = 30 } = hero;\nconsole.log(name, life, mp);'
                  }
                },
                {
                  h: '3. 展开与剩余：复制、合并、传参',
                  p: [
                    '展开数组写 [...a, ...b]，展开对象写 { ...a, ...b }，后面的同名属性会覆盖前面的。函数调用时可以用 f(...args) 把数组摊成实参。',
                    '展开只做一层浅拷贝。嵌套的对象仍与原数据共享引用，改内层会同时影响两份。常见错误：把 { ...obj } 当成深拷贝；在对象字面量里展开字符串，得到的是按字符编号的键。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const base = { atk: 10, hp: 100 };\nconst buff = { ...base, atk: 16 };\nconsole.log(base.atk, buff.atk);\nconst a = [1, 2];\nconst b = [3, 4];\nconsole.log([...a, ...b].length);\nconsole.log(Math.max(...b));'
                  }
                },
                {
                  h: '4. map：一对一变换',
                  p: [
                    'map 对每个元素调用一次回调，把返回值放进新数组，长度与原数组相同。回调可以接收 (value, index, array)，但通常只用第一个参数。map 不会修改原数组。',
                    '常见错误：在回调里只写 console.log 而忘记 return，结果得到一列 undefined；把 map 当成 forEach 用来做副作用；以为 map 会就地修改原数组。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const names = ["赛琳", "零", "缄"];\nconst tags = names.map((n, i) => `${i + 1}-${n}`);\nconsole.log(tags.join(" / "));'
                  }
                },
                {
                  h: '5. filter 与 reduce：筛选与归并',
                  p: [
                    'filter 的回调返回布尔值，true 的元素进入新数组。reduce 把数组折叠成一个值：第一个参数是累计器，第二个参数是当前元素，最后传入初始值。',
                    '初始值非常重要：不传时首元素会被当作初始值，空数组调用 reduce 会直接抛错。常见错误：filter 回调写成赋值表达式；reduce 回调忘记 return；把只需要遍历的场景硬写成 reduce。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const dmg = [12, 7, 20, 5, 18];\nconst strong = dmg.filter(v => v >= 10);\nconst total = strong.reduce((sum, v) => sum + v, 0);\nconsole.log(strong.length, total);'
                  }
                },
                {
                  h: '6. 流水线与常见错误',
                  p: [
                    '把 filter、map、reduce 串起来时，每一步只做一件事：先筛数据，再变形，最后汇总。每一环都返回新数组或新值，原数据保持不变，这让调试和回滚都更容易。',
                    '排查时在每一步后面打印中间结果，确认上一步的输出是不是下一步想要的输入。常见错误：先 map 改了值，再用 filter 判断，条件与直觉错位；在 reduce 里修改外部数组；回调缺少 return。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const orders = [3, 0, 7, 12, 5];\nconst revenue = orders\n  .filter(n => n > 0)\n  .map(n => n * 8)\n  .reduce((sum, n) => sum + n, 0);\nconsole.log(revenue);'
                  },
                  note: '链式调用不是越短越好。给中间结果起名字，往往比一条很长的链更容易维护。'
                }
              ],
              terms: [
                { t: '模板字符串', en: 'template literal', d: '用反引号包裹、支持 ${} 插值与换行的字符串。' },
                { t: '解构', en: 'destructuring', d: '按数组位置或对象属性名，把结构中的值一次取出。' },
                { t: '展开运算符', en: 'spread operator', d: '用 ... 把数组或对象摊开，用于复制、合并与传参。' },
                { t: '高阶函数', en: 'higher-order function', d: '接收函数作为参数，或把函数作为返回值的函数。' },
                { t: '归并', en: 'reduce', d: '把一组值折叠成单个结果的数组方法。' },
                { t: '浅拷贝', en: 'shallow copy', d: '只复制第一层结构，嵌套对象仍共享引用。' }
              ],
              exam: '前端笔试高频：map/filter/reduce 的输出与手写实现、reduce 初始值、解构默认值与重命名、展开是浅拷贝、模板字符串插值。答题时先写清楚回调是否 return。',
              checklist: [
                '会用模板字符串拼多行文本',
                '能解构数组与对象并设置默认值',
                '能用展开复制、合并与传参',
                '能链式使用 filter/map/reduce',
                '知道 map 与 filter 不修改原数组'
              ]
            }
          },
          {
            id: 'js-5-3', type: 'battle', title: '遭遇 · 锈字魔像', jp: '錆文字のゴーレム', xp: 80,
            enemy: {
              name: '锈字魔像', kind: 'golem', hp: 100,
              title: '造物 · 旧织机守卫', taunt: '一条一条来。你们的捷径会断线。',
              lore: '它守着回廊的旧织机，只接受最笨拙的逐条处理。让它看见一条清晰、可复核的数据流水线，锁死的梭子才会重新滑动。'
            },
            brief: '五份残页上的伤害是 [12, 7, 20, 5, 18]。筛出不低于 10 的残页，把伤害翻倍，再求和。三道工序都要留下痕迹。',
            tasks: [
              {
                prompt: '给定数组 const dmg = [12, 7, 20, 5, 18]; 用 filter 保留大于等于 10 的值，用 map 把每个值翻倍，再用 reduce 求和并输出。',
                requirement: '预期输出：100',
                expected: '100',
                starter: 'const dmg = [12, 7, 20, 5, 18];\n// filter 筛选，map 翻倍，reduce 求和\n',
                hints: [
                  '第一道工序：dmg.filter(v => v >= 10)。',
                  '第二道工序：接上 .map(v => v * 2)。',
                  '第三道工序：接上 .reduce((sum, v) => sum + v, 0)，最后 console.log 结果。'
                ],
                solution: 'const dmg = [12, 7, 20, 5, 18];\nconst total = dmg.filter(v => v >= 10).map(v => v * 2).reduce((sum, v) => sum + v, 0);\nconsole.log(total);',
                must: { re: 'filter\\s*\\([\\s\\S]*map\\s*\\([\\s\\S]*reduce\\s*\\(', text: '必须依次使用 filter、map、reduce' }
              }
            ],
            outro: '织机吐出最后一匹布，锈字一块块脱落。梭子上留下三道浅浅的刻痕：选线、染色、收束。赛琳把布披在肩上：「数据不是越多越好，是流过之后还能说清楚。」',
            loot: LS.makeLoot('rare', '流织腕带', 'armor', '≋', '腕带由三段细线编成，分别对应 filter、map 与 reduce。拉紧任何一段，另外两段都会提醒你顺序。', 'javascript')
          }
        ]
      },

      /* ============================== 第六章 ============================== */
      {
        id: 'js-6', title: '第六章 · 铭文档案', jp: '銘文の書庫',
        subtitle: '把名字与数值写进可传递的记录', summary: '对象字面量、属性访问、引用与浅拷贝、JSON、可选链。',
        nodes: [
          {
            id: 'js-6-1', type: 'story', title: '无键的档案', jp: '鍵のない書庫', xp: 20,
            lines: [
              { who: '维护者·缄', tone: 'guide', text: '档案库的门开着，但每份记录都丢了键。没有键，值只是一串孤立的铭文，谁也说不清它属于谁。' },
              { who: '赛琳', tone: 'ally', text: '先把名字写回去。对象字面量就是给数据刻名字的仪式：name、qty、price，一个都不能少。' },
              { who: '空键幽影', tone: 'enemy', text: '名字可以被省略。省略之后，你们连自己读的是什么都无法证明。' },
              { who: '界灵·零', tone: 'guide', text: '用 JSON 让记录穿过系统边界，用可选链在字段缺失时保命。但外部数据永远不可信，先校验，再使用。' },
              { who: '赛琳', tone: 'ally', text: '从三件补给开始。把它们写成对象，装进数组，再一笔一笔把总价算清。' }
            ]
          },
          {
            id: 'js-6-2', type: 'lesson', title: '对象、JSON 与安全读取', jp: '対象とJSON', xp: 40, minutes: 24,
            article: {
              lead: '数据一旦离开当前函数，就必须有名字和结构。对象给字段命名，JSON 让它在系统之间旅行，可选链让你在字段缺失时仍能安全读取。本章从对象字面量一路写到线上接口的返回体。',
              sections: [
                {
                  h: '1. 对象字面量：给数据刻名字',
                  p: [
                    '对象由键值对组成：{ key: value }。键通常是标识符，含连字符或空格时要加引号。值可以是任意类型，包括函数，这时它叫方法。变量名与键名相同时可以简写，例如 { name }。',
                    '访问属性有两种方式：点号用于固定的键，方括号用于动态的键。计算属性 [key] 可以在创建时用变量当键。常见错误：用变量当键却忘了方括号；键名拼写错误得到 undefined；把方法里的 this 当成定义位置的 this（下一章细讲）。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const key = "hp";\nconst hero = {\n  name: "赛琳",\n  [key]: 90,\n  greet() {\n    return `骑士 ${this.name}`;\n  }\n};\nconsole.log(hero.hp);\nconsole.log(hero["name"]);\nconsole.log(hero.greet());'
                  }
                },
                {
                  h: '2. 引用、增删改查与浅拷贝',
                  p: [
                    '对象是引用类型。const b = a 只是让两个变量指向同一个对象，改 b 就是改 a。要得到独立的第一层副本，可以用展开 { ...a } 或 Object.assign({}, a)。',
                    '读取键列表用 Object.keys，值列表用 Object.values，键值对用 Object.entries。删除属性用 delete，判断键是否存在用 in。常见错误：用 === 比较两个内容相同的对象；把对象当 Map 用数字键；忘记浅拷贝只保护第一层。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const a = { hp: 100 };\nconst b = a;\nb.hp = 40;\nconsole.log(a.hp);\nconst c = { ...a, hp: 70 };\nconsole.log(a.hp, c.hp);\nconsole.log(Object.keys(c).join(","));'
                  }
                },
                {
                  h: '3. JSON：跨系统的共同语言',
                  p: [
                    'JSON 是一种文本格式，不是对象本身。键必须用双引号，值只能是对象、数组、字符串、数字、布尔或 null。JSON.stringify 把内存中的值序列化成文本，JSON.parse 把文本还原成对象。',
                    '它不支持 undefined、函数、Symbol 和循环引用；Date 会被转成字符串，还原时不会自动变回 Date。常见错误：用单引号手写 JSON；字符串里出现未转义的双引号；以为 parse 出来的对象还保留原来的方法。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const hero = { name: "赛琳", hp: 90, skills: ["誓约斩", "星盾"] };\nconst text = JSON.stringify(hero);\nconsole.log(text);\nconst back = JSON.parse(text);\nconsole.log(back.skills[0]);'
                  },
                  note: '教学终端不保证支持 JSON 全局对象，这一节作为概念示例阅读。浏览器与 Node.js 中都可以正常使用。'
                },
                {
                  h: '4. 解析外部数据时的防线',
                  p: [
                    '来自接口、存档或用户输入的 JSON 都不可信：字段可能缺失，类型可能不对，甚至整段文本都不是合法 JSON。先 parse，再逐字段校验，最后才进入业务逻辑。',
                    '数字字段用 Number 转换后配合 Number.isFinite 判断；数组用 Array.isArray；必填字段缺失时给出明确错误。常见错误：parse 不放在 try/catch 里；把字符串 "90" 直接当数字相加；忽略 null 与空字符串。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const raw = \'{"name":"赛琳","hp":"90"}\';\nconst data = JSON.parse(raw);\nconst hp = Number(data.hp);\nif (!Number.isFinite(hp)) {\n  console.log("HP 字段无效");\n} else {\n  console.log(`${data.name} HP=${hp}`);\n}'
                  }
                },
                {
                  h: '5. 可选链与空值合并',
                  p: [
                    '可选链 ?. 在遇到 null 或 undefined 时立刻返回 undefined，不再继续往下取属性。它适用于数组下标 arr?.[0] 和函数调用 fn?.()。',
                    '空值合并 ?? 只在左侧是 null 或 undefined 时取右侧；逻辑或 || 会把 0、空字符串、false 也当成假值，容易把合法数据替换掉。常见错误：用 ?. 掩盖本该暴露的数据结构问题；把 ?? 与 || 混用却不加括号；以为 ?. 能保护未声明的变量。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const cfg = { ui: { theme: "night" } };\nconsole.log(cfg.ui?.theme);\nconsole.log(cfg.audio?.volume ?? 0.5);\nconsole.log(0 || 0.5);\nconsole.log(0 ?? 0.5);'
                  },
                  note: '这一示例依赖较新的语法，终端只作概念展示。重点记住：?. 防的是中间层缺失，?? 防的是 null/undefined 覆盖默认值。'
                },
                {
                  h: '6. 对象建模的常见错误',
                  p: [
                    '深层嵌套会让访问路径越来越长，也让局部更新变得危险。能用平坦结构加 id 关联，就不要堆成五六层。能由其他字段算出来的派生值，不要重复存进对象，否则迟早不同步。',
                    '序列化之前先想清楚接收方需要什么字段。把整个内部对象直接扔给接口，往往会泄露不该出现的字段。对象是工具，不是把所有东西都塞进去的仓库。'
                  ],
                  note: '设计对象时先问三个问题：它的身份是什么、它拥有哪些事实、哪些只是临时计算结果。'
                }
              ],
              terms: [
                { t: '对象字面量', en: 'object literal', d: '用花括号直接写出的键值对集合。' },
                { t: '属性访问', en: 'property access', d: '用点号或方括号读取与写入对象成员。' },
                { t: '序列化', en: 'serialization', d: '把内存中的值转换成可存储或传输的文本。' },
                { t: '反序列化', en: 'deserialization', d: '把文本还原成程序可以操作的对象。' },
                { t: '可选链', en: 'optional chaining', d: '用 ?. 在中间层为空时安全地停止取属性。' },
                { t: '空值合并', en: 'nullish coalescing', d: '用 ?? 只在 null/undefined 时使用默认值。' }
              ],
              exam: '面试常考：JSON.stringify/parse 的边界、对象引用与浅拷贝、Object.keys、?. 与 ?? 的区别、|| 把 0 当假值的坑。手写题常要求深拷贝或安全取值。',
              checklist: [
                '能创建对象并用两种方式访问属性',
                '理解对象赋值共享引用',
                '会用展开做第一层复制',
                '知道 JSON 支持与不支持的类型',
                '能用可选链与空值合并安全取值'
              ]
            }
          },
          {
            id: 'js-6-3', type: 'battle', title: '遭遇 · 空键幽影', jp: '空鍵の影', xp: 80,
            enemy: {
              name: '空键幽影', kind: 'wraith', hp: 100,
              title: '影兽 · 无名记录', taunt: '没有键的值，和不存在有什么区别？',
              lore: '它靠缺失的字段藏身。把三件补给写成有名字、有数量的对象，再用循环逐件结算，空键就会显形。'
            },
            brief: '补给库有三件物品：药草 3 件单价 12，铁箭 10 支单价 2，火油 2 桶单价 25。把它们写成对象数组，用循环逐件输出小计，最后输出合计。',
            tasks: [
              {
                prompt: '创建包含三件补给的对象数组（字段为 name、qty、price），用循环逐件输出「名称 小计」，格式如「药草 36」，最后输出「合计 106」。',
                requirement: '预期四行：药草 36 / 铁箭 20 / 火油 50 / 合计 106',
                expected: '药草 36\n铁箭 20\n火油 50\n合计 106',
                starter: 'const stock = [\n  { name: "药草", qty: 3, price: 12 },\n  { name: "铁箭", qty: 10, price: 2 },\n  { name: "火油", qty: 2, price: 25 }\n];\nlet total = 0;\n// 遍历对象数组，输出每件小计与最后合计\n',
                hints: [
                  '用 for (const item of stock) 逐个取出对象。',
                  '每件小计是 item.qty * item.price，先加到 total，再输出。',
                  '用模板字符串输出 `${item.name} ${value}`，循环结束后输出 `合计 ${total}`。'
                ],
                solution: 'const stock = [\n  { name: "药草", qty: 3, price: 12 },\n  { name: "铁箭", qty: 10, price: 2 },\n  { name: "火油", qty: 2, price: 25 }\n];\nlet total = 0;\nfor (const item of stock) {\n  const value = item.qty * item.price;\n  console.log(`${item.name} ${value}`);\n  total += value;\n}\nconsole.log(`合计 ${total}`);',
                must: { re: 'for\\s*\\(', text: '必须使用循环遍历对象数组' }
              }
            ],
            outro: '三件补给在光下显出各自的铭牌，幽影失去了藏身的缝隙。缄把一枚旧钥匙放进匣子：「名字不是装饰。它是系统之间互相相信的最低成本。」',
            loot: LS.makeLoot('rare', '铭文匣', 'relic', '▤', '匣盖内侧刻着一行小字：先写键，再写值，最后才写接口。匣子不装宝物，只装说得清来历的记录。', 'javascript')
          }
        ]
      },

      /* ============================== 第七章 ============================== */
      {
        id: 'js-7', title: '第七章 · 影契工房', jp: '影契の工房',
        subtitle: '让一段逻辑记住它诞生时的世界', summary: '作用域、闭包、箭头函数、this 与高阶函数。',
        nodes: [
          {
            id: 'js-7-1', type: 'story', title: '忘记起点的侍从', jp: '起点を忘れた従者', xp: 20,
            lines: [
              { who: '赛琳', tone: 'ally', text: '工房里的影契侍从又忘了自己是谁。它们只记得被写下时，身边放着什么。' },
              { who: '界灵·零', tone: 'guide', text: '这就是闭包。函数会带走它出生时的环境，而不是带走整个工房。记住边界，才不会把整座城拖进内存。' },
              { who: '失忆侍从', tone: 'enemy', text: '我记得一把剑……可我不记得剑在谁手里。this 到底是什么？' },
              { who: '赛琳', tone: 'ally', text: 'this 不看你写在哪，只看你怎么被调用。先写下会记住起点的契约，再让它们各自数数。' },
              { who: '维护者·缄', tone: 'guide', text: '这些侍从是旧系统留下的。它们不坏，只是被调用得太随意。' }
            ]
          },
          {
            id: 'js-7-2', type: 'lesson', title: '作用域、闭包与 this', jp: 'スコープとクロージャ', xp: 40, minutes: 24,
            article: {
              lead: '函数不只是把代码包起来，它还会记住自己诞生时周围有什么。作用域决定谁能看见谁，闭包让记忆穿过调用，this 则取决于调用方式而不是定义位置。这一章把这些容易混淆的边界一次讲清。',
              sections: [
                {
                  h: '1. 作用域链与变量可见性',
                  p: [
                    '每个函数在创建时都会记录自己所在的词法环境。内层可以读外层，外层读不到内层；查找变量时沿作用域链逐级向上，直到全局。',
                    'let 与 const 是块级作用域，if、for 的花括号都能形成新块；var 是函数作用域，会泄漏到整个函数。常见错误：在声明前访问 let 触发暂时性死区；用 var 在循环里捕获同一个变量；以为块内声明的变量在外面还能用。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'let outer = "城门";\nfunction show() {\n  let inner = "庭院";\n  console.log(outer, inner);\n}\nshow();\nconsole.log(typeof inner);'
                  },
                  note: 'typeof 一个从未声明过的名字不会抛错，会返回 "undefined"。这是少数可以安全探测变量的场景。'
                },
                {
                  h: '2. 闭包：函数记住出生地',
                  p: [
                    '闭包是函数与它创建时词法环境的组合。内部函数引用了外部函数的变量，即使外部函数已经返回，这些变量仍然被保留。',
                    '闭包适合做私有状态、计数器、配置固化与柯里化。常见错误：循环里用 var 创建多个函数，结果都拿到最后一个值；误以为每次调用都产生新的闭包变量；闭包长期持有一个很大的对象，导致无法回收。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'function makeCounter(start) {\n  let n = start;\n  return function () {\n    n += 1;\n    return n;\n  };\n}\nconst next = makeCounter(10);\nconsole.log(next());\nconsole.log(next());'
                  },
                  note: '两次调用 next() 共享同一个 n，这就是「状态被关在函数里」的含义。'
                },
                {
                  h: '3. 箭头函数：更短的写法与不同的 this',
                  p: [
                    '箭头函数用 => 定义。单个表达式可以省略 return 与花括号；返回对象字面量时要包一层括号，否则花括号会被当成函数体。',
                    '箭头函数没有自己的 arguments，不能用 new 调用，也没有自己的 this。它的 this 在定义时就确定，继承外层。常见错误：在对象方法里用箭头函数，导致 this 不是对象；把箭头函数当构造函数；返回对象时忘记加括号。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const double = n => n * 2;\nconst wrap = n => ({ value: n });\nconsole.log(double(21));\nconsole.log(wrap(7).value);'
                  }
                },
                {
                  h: '4. this：由调用方式决定',
                  p: [
                    '普通函数直接调用时，严格模式下 this 是 undefined；作为对象方法调用时，this 是调用它的对象；用 call、apply、bind 可以显式指定；箭头函数没有自己的 this。',
                    '常见错误：把方法赋值给变量再调用，this 丢失；把方法作为回调传给别的函数，调用者变了；在箭头函数里期待 this 指向调用者。判断 this 的口诀是：看调用点左边是谁。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const hero = {\n  name: "赛琳",\n  say() {\n    console.log(this.name);\n  }\n};\nhero.say();\nconst fn = hero.say;\nfn();'
                  },
                  note: '这一示例演示 this 丢失，终端不执行。严格模式下第二行会报错，因为 this 是 undefined，读取 name 失败。'
                },
                {
                  h: '5. 高阶函数：把行为当参数',
                  p: [
                    '接收函数作为参数、或返回函数的函数，叫高阶函数。map、filter、reduce 都是高阶函数；闭包让「返回函数」有了意义，因为返回的函数还能记住当时的配置。',
                    '用高阶函数可以把重复的循环骨架抽出来，只把变化的部分作为回调传进去。常见错误：回调参数顺序记错；在回调里写了花括号却忘记 return；为了抽象而抽象，最后比原来的循环更难读。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'function repeat(times, action) {\n  for (let i = 0; i < times; i++) {\n    action(i);\n  }\n}\nrepeat(3, i => console.log(`第 ${i + 1} 次誓约`));'
                  }
                },
                {
                  h: '6. 回调、组合与常见陷阱',
                  p: [
                    '回调把「接下来做什么」交给调用者决定。同步回调会立即执行，异步回调要等到未来某一刻，这一点下一章会展开。组合则是把两个小函数接成一条管道：先 g 再 f。',
                    '常见错误：回调地狱，层层嵌套难以阅读；错误处理散落在每个回调里；在循环中创建大量闭包却没有必要。写之前先问：这段逻辑是一次性的，还是会被反复托付？'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'function compose(f, g) {\n  return x => f(g(x));\n}\nconst inc = n => n + 1;\nconst double = n => n * 2;\nconsole.log(compose(inc, double)(5));'
                  }
                }
              ],
              terms: [
                { t: '作用域', en: 'scope', d: '变量能够被访问的代码范围。' },
                { t: '词法环境', en: 'lexical environment', d: '函数创建时记录的变量与作用域关系。' },
                { t: '闭包', en: 'closure', d: '函数与其定义时词法环境的组合，让状态得以保留。' },
                { t: 'this', d: '函数调用时自动绑定的接收者，取决于调用方式。' },
                { t: '高阶函数', en: 'higher-order function', d: '接收函数参数或返回函数的函数。' },
                { t: '回调', en: 'callback', d: '传给另一个函数、在适当时机被调用的函数。' }
              ],
              exam: '面试高频：闭包输出题、循环中 var 与 let 的差异、箭头函数的 this、call/apply/bind、函数柯里化与组合。作答时先说清调用点，再判断 this。',
              checklist: [
                '能画出作用域链的查找方向',
                '能用闭包保存私有状态',
                '会写箭头函数并返回对象',
                '能判断 this 指向谁',
                '能用高阶函数消除重复循环'
              ]
            }
          },
          {
            id: 'js-7-3', type: 'battle', title: '遭遇 · 失忆侍从', jp: '記憶喪失の従者', xp: 80,
            enemy: {
              name: '失忆侍从', kind: 'construct', hp: 100,
              title: '造物 · 丢失调用者', taunt: '你写下了我，却没告诉我该听谁的。',
              lore: '它记得每一次攻击的数值，却不记得该把它们交给谁。写一个能接收数组与阈值的函数，把判断和累加都封装进去。'
            },
            brief: '庭院的五份伤害 [8, 19, 4, 23, 11] 被封在影中。写一个函数，接收数组与阈值，返回所有大于阈值的数据之和，并输出 10 以上的总和。',
            tasks: [
              {
                prompt: '写一个函数（例如 sumAbove(list, limit)），用循环累加数组中大于 limit 的值并返回，然后调用它计算 [8, 19, 4, 23, 11] 中大于 10 的总和并输出。',
                requirement: '预期输出：53',
                expected: '53',
                starter: 'const dmg = [8, 19, 4, 23, 11];\n\nfunction sumAbove(list, limit) {\n  // 遍历 list，累加大于 limit 的值并 return\n}\n',
                hints: [
                  '函数内部先 let total = 0;，再用 for (const v of list) 遍历。',
                  'if (v > limit) 时执行 total += v;，循环结束后 return total;。',
                  '最后调用 console.log(sumAbove(dmg, 10));，不要直接在函数外写死 53。'
                ],
                solution: 'const dmg = [8, 19, 4, 23, 11];\n\nfunction sumAbove(list, limit) {\n  let total = 0;\n  for (const v of list) {\n    if (v > limit) {\n      total += v;\n    }\n  }\n  return total;\n}\n\nconsole.log(sumAbove(dmg, 10));',
                must: { re: 'function\\s+\\w+\\s*\\(', text: '必须定义并调用函数' }
              }
            ],
            outro: '侍从第一次没有问「该听谁的」。它把五份伤害交给你写的函数，然后安静地退到墙边。赛琳说：「它记住的不是你，是你留下的调用方式。」',
            loot: LS.makeLoot('rare', '影契手套', 'armor', '⌘', '手套掌心缝着一圈细线，像作用域链一样层层向内。握住它时，你会先想起自己是从哪里被调用的。', 'javascript')
          }
        ]
      },

      /* ============================== 第八章 ============================== */
      {
        id: 'js-8', title: '第八章 · 界面剧场', jp: '界面の劇場',
        subtitle: '让页面听见你的命令并回应', summary: 'DOM 选择器、事件、表单、渲染与最小交互闭环。',
        nodes: [
          {
            id: 'js-8-1', type: 'story', title: '不会回应的剧场', jp: '応えない劇場', xp: 20,
            lines: [
              { who: '赛琳', tone: 'ally', text: '剧场里的幕布升不起来。不是没有观众，是没有人把「点击」这件事接上。' },
              { who: '界灵·零', tone: 'guide', text: '先找到元素，再挂事件，最后把数据渲染回去。三步，少一步都不算闭环。' },
              { who: '失焦幻影', tone: 'enemy', text: '你们的按钮只是一个空壳。点它，什么也不会发生。' },
              { who: '赛琳', tone: 'ally', text: '那就让它发生。用一个数组生成整排任务，再一次挂上监听。' },
              { who: '维护者·缄', tone: 'guide', text: '剧场的旧脚本还在，但它绑定的是早已不存在的节点。别继承这份债。' }
            ]
          },
          {
            id: 'js-8-2', type: 'lesson', title: 'DOM、事件与渲染', jp: 'DOMとイベント', xp: 40, minutes: 26,
            article: {
              lead: '到目前为止，输出都停在终端里。真正的 JavaScript 作品要走到页面上：找到元素、监听事件、读取表单、把数据渲染成可见的结构。本章不追求炫技，只要求你能把一个最小交互闭环写完整。',
              sections: [
                {
                  h: '1. DOM 是一棵可以修改的树',
                  p: [
                    '浏览器把 HTML 解析成一棵文档对象模型树。document 是入口，元素、文本、属性都是节点。JavaScript 通过这套对象读取页面，也通过它修改页面。',
                    '脚本执行时如果目标元素还没解析出来，查询会得到 null。常见做法是把脚本放在页面底部，或等 DOMContentLoaded 之后再执行。常见错误：在 head 里直接查询 body 内的元素；把 NodeList 当成数组调用 map；频繁读取布局属性造成卡顿。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'document.addEventListener("DOMContentLoaded", () => {\n  const title = document.querySelector("#title");\n  console.log(title.textContent);\n});'
                  },
                  note: '这一章所有示例都涉及浏览器环境，教学终端只展示结构，不执行。'
                },
                {
                  h: '2. 选择器与查询',
                  p: [
                    'querySelector 返回第一个匹配元素，querySelectorAll 返回静态 NodeList。参数是 CSS 选择器，所以 #id、.class、[data-id="1"] 都可以用。getElementById 更直接，但只支持 id。',
                    '常见错误：选择器拼写错误却得到 null；在某个容器上查询时忘了它是查找根；把动态新增的元素当成旧引用还能自动更新。NodeList 需要 Array.from 或展开后才能用部分数组方法。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const items = document.querySelectorAll(".quest-item");\nArray.from(items).forEach(el => {\n  console.log(el.dataset.id, el.textContent);\n});'
                  }
                },
                {
                  h: '3. 修改内容、属性与样式',
                  p: [
                    'textContent 只处理文本，innerHTML 会解析 HTML。插入用户输入时优先用 textContent，避免脚本注入。属性用 setAttribute 或直接赋值，类名用 classList，样式用 style。',
                    '创建新元素用 document.createElement，设置内容后再 append 到文档。常见错误：用 innerHTML 拼接用户输入导致 XSS；直接改大量内联样式难以维护；创建了元素却忘记插入。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const card = document.createElement("div");\ncard.className = "card";\ncard.textContent = "新任务";\ndocument.querySelector("#list").append(card);'
                  }
                },
                {
                  h: '4. 事件监听与事件对象',
                  p: [
                    'addEventListener(type, handler) 为元素注册处理函数。事件对象里有 target（真正触发的元素）与 currentTarget（绑定监听的元素）。preventDefault 阻止默认行为，stopPropagation 阻止继续冒泡。',
                    '事件默认从目标向外冒泡，可以利用这一点做事件委托：把监听挂在父容器上，根据 target 判断具体元素。常见错误：重复绑定导致一次点击触发多次；在循环里绑定却共享同一个变量；用 onclick 覆盖之前注册的处理函数。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const list = document.querySelector("#quests");\nlist.addEventListener("click", event => {\n  const btn = event.target.closest("button");\n  if (!btn) return;\n  console.log("处理任务", btn.dataset.id);\n});'
                  }
                },
                {
                  h: '5. 表单与输入',
                  p: [
                    '表单提交要监听 submit，并调用 preventDefault 阻止页面刷新。文本框读 value，复选框读 checked，下拉框读 value。input 事件在每次输入时触发，change 在值确认后触发。',
                    '常见错误：提交时忘记阻止默认行为；在值还没更新时读取；复选框用 value 判断选中；把密码或敏感信息写进页面日志。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const form = document.querySelector("#quest-form");\nform.addEventListener("submit", event => {\n  event.preventDefault();\n  const input = form.querySelector("input[name=title]");\n  console.log(input.value.trim());\n});'
                  }
                },
                {
                  h: '6. 渲染列表与最小闭环',
                  p: [
                    '一个最小闭环是：数据变化 → 重新计算要显示的内容 → 更新 DOM。把状态放在一处，渲染函数只读状态，事件处理只改状态，然后再调用渲染。这样页面与数据不会各说各话。',
                    '列表可以用 map 生成 HTML 字符串再 join 插入，也可以用 createElement 逐个创建。前者简洁但要小心转义，后者更安全但代码更长。常见错误：每改一项就整页重绘；用数组下标当 key；忘记空状态。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const quests = ["修复城门", "校准星图"];\nconst html = quests.map(q => `<li>${q}</li>`).join("");\ndocument.querySelector("#quests").innerHTML = html;'
                  },
                  note: '真正的项目里还要处理加载、错误、空列表与无障碍。先把闭环跑通，再逐项加固。'
                }
              ],
              terms: [
                { t: 'DOM', en: 'Document Object Model', d: '浏览器把页面表示为可编程节点树的接口。' },
                { t: '选择器', en: 'selector', d: '用 CSS 语法定位页面元素的表达式。' },
                { t: '事件监听', en: 'event listener', d: '在元素上注册、事件发生时被调用的函数。' },
                { t: '事件冒泡', en: 'event bubbling', d: '事件从目标元素逐级向父元素传播的过程。' },
                { t: '事件委托', en: 'event delegation', d: '把监听挂在父元素上，统一处理子元素事件。' },
                { t: '表单', en: 'form', d: '收集用户输入并提交的一组控件。' }
              ],
              exam: '前端基础高频：querySelector 与 querySelectorAll 的差异、事件冒泡与委托、preventDefault 与 stopPropagation、textContent 与 innerHTML、表单取值、DOM 操作性能。',
              checklist: [
                '能用选择器找到页面元素',
                '会给元素注册并移除事件',
                '能阻止表单默认提交',
                '能用数组生成列表结构',
                '知道 textContent 与 innerHTML 的安全差异'
              ]
            }
          },
          {
            id: 'js-8-3', type: 'battle', title: '遭遇 · 失焦幻影', jp: '失焦の幻影', xp: 80,
            enemy: {
              name: '失焦幻影', kind: 'glitch', hp: 100,
              title: '影兽 · 空壳按钮', taunt: '点我。再点我。什么都不会发生。',
              lore: '它把剧场的按钮变成空壳，只留下无法渲染的数据。用数组 map 与 join 生成整齐的任务行，让空壳重新有内容。'
            },
            brief: '剧场要显示三项任务：修复城门、校准星图、补写誓约。用数组的 map 生成带序号的列表行，再用 join 拼成一个字符串输出。',
            tasks: [
              {
                prompt: '把三项任务放入数组，用 map 生成「序号. <li>任务</li>」格式的字符串，再用 join 以换行连接并输出。',
                requirement: '预期三行：1. <li>修复城门</li> / 2. <li>校准星图</li> / 3. <li>补写誓约</li>',
                expected: '1. <li>修复城门</li>\n2. <li>校准星图</li>\n3. <li>补写誓约</li>',
                starter: 'const quests = ["修复城门", "校准星图", "补写誓约"];\n// map 生成带序号的行，join 用换行连接\n',
                hints: [
                  'map 的回调接收 (item, index)，序号从 0 开始，所以显示时要 index + 1。',
                  '每行模板：`${index + 1}. <li>${item}</li>`。',
                  '最后 console.log(quests.map(...).join("\\n"));。'
                ],
                solution: 'const quests = ["修复城门", "校准星图", "补写誓约"];\nconst html = quests.map((item, index) => `${index + 1}. <li>${item}</li>`).join("\\n");\nconsole.log(html);',
                must: { re: 'map\\s*\\([\\s\\S]*join\\s*\\(', text: '必须使用 map 与 join 生成字符串' }
              }
            ],
            outro: '三行字依次亮起，剧场的幕布终于升起。幻影在光里散成细小的像素，赛琳抬手接住一片：「页面不是画出来的，是一层层数据被正确地放上去的。」',
            loot: LS.makeLoot('rare', '界面透镜', 'relic', '◎', '透镜边缘刻着 data 与 view 两个词，中间隔着一道细线。它提醒你：数据与视图可以相邻，但不要长在一起。', 'javascript')
          }
        ]
      },

      /* ============================== 第九章 ============================== */
      {
        id: 'js-9', title: '第九章 · 迟响之塔', jp: '遅響の塔',
        subtitle: '在答案到来之前，先安排好顺序', summary: '回调、Promise、async/await、fetch 与任务队列。',
        nodes: [
          {
            id: 'js-9-1', type: 'story', title: '迟到的回音', jp: '遅れて届く響き', xp: 20,
            lines: [
              { who: '维护者·缄', tone: 'guide', text: '迟响之塔的钟每敲一次，回音要很久才回来。旧系统把「等待」写成了阻塞，于是整座塔停摆。' },
              { who: '赛琳', tone: 'ally', text: '我们不能站在钟下等。先把任务放进队列，再按顺序清空。' },
              { who: '界灵·零', tone: 'guide', text: '同步的先做，微任务随后，宏任务最后。先写一条能看得见的队列，再去理解 Promise。' },
              { who: '回响无人', tone: 'enemy', text: '你们连答案什么时候到都不知道，凭什么前进？' },
              { who: '赛琳', tone: 'ally', text: '凭顺序。等待不是静止，是把该发生的排好队。' }
            ]
          },
          {
            id: 'js-9-2', type: 'lesson', title: '回调、Promise 与 async/await', jp: '非同期の順序', xp: 40, minutes: 28,
            article: {
              lead: '网络请求不会立刻回来。JavaScript 用回调、Promise 与 async/await 组织「未来才发生的事」。本章的目标不是背 API，而是建立顺序感：什么先执行，什么排队，失败如何被接住。战斗里我们用数组模拟一条任务队列。',
              sections: [
                {
                  h: '1. 同步与异步：时间线上的两件事',
                  p: [
                    '同步代码按书写顺序立即执行，调用栈空了事件循环才会去处理队列里的回调。定时器、网络请求、用户事件都会把回调推迟到未来。',
                    '这意味着 setTimeout(fn, 0) 也不是立刻执行，它要等当前同步代码全部跑完。常见错误：以为 0 毫秒就是马上；在循环里发起大量请求却不限制并发；用忙等待等结果，把主线程卡死。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");'
                  },
                  note: '输出顺序是 A、C、B。先跑完同步代码，再看任务队列。'
                },
                {
                  h: '2. 回调：把后续交出去',
                  p: [
                    '回调就是「完成之后请调用我」。Node.js 风格常用错误优先回调 (err, data)，先判断 err 再使用 data。回调能解决问题，但层层嵌套后可读性会迅速下降。',
                    '常见错误：回调被调用两次；吞掉错误不处理；在回调外面读取还没拿到的结果；忘记 return，导致后续逻辑继续执行。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'function load(onDone) {\n  setTimeout(() => onDone("星图已读取"), 10);\n}\nload(data => console.log(data));'
                  }
                },
                {
                  h: '3. Promise 三态与 then/catch',
                  p: [
                    'Promise 有 pending、fulfilled、rejected 三种状态，一旦落定就不再改变。executor 里的 resolve 与 reject 决定结果，then 处理成功，catch 处理失败，finally 做清理。',
                    'then 返回一个新的 Promise，所以可以链式调用。链上任何一环抛错都会跳到最近的 catch。常见错误：忘记 return 导致下一个 then 拿到 undefined；在 executor 里同步抛错却没有 reject；只在最后 catch，丢失中间上下文。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const p = new Promise((resolve, reject) => {\n  setTimeout(() => resolve(42), 10);\n});\np.then(v => v + 1)\n  .then(v => console.log(v))\n  .catch(err => console.log(err.message));'
                  }
                },
                {
                  h: '4. async/await：用同步的样子写异步',
                  p: [
                    'async 函数总是返回 Promise；await 等待一个 Promise 并取出结果。成功路径像同步代码，失败路径用 try/catch 接住。',
                    '并行任务不要一个接一个 await，否则总耗时变成相加；用 Promise.all 一起等待。常见错误：在非 async 函数里使用 await；为了省事串行等待；忘记 catch 导致未处理的 rejection。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'async function main() {\n  const value = await Promise.resolve(7);\n  console.log(value * 6);\n}\nmain();'
                  }
                },
                {
                  h: '5. fetch 与响应处理',
                  p: [
                    'fetch 返回 Promise<Response>。HTTP 404、500 不会自动 reject，必须检查 response.ok；真正的网络失败才会 reject。response.json() 也是异步的，要再 await 一次。',
                    '需要超时或取消时用 AbortController。常见错误：忘记 await response.json()；把 404 当成功；不区分网络错误与业务错误；把敏感 token 写在 URL 里。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'async function loadQuest() {\n  const res = await fetch("/api/quest");\n  if (!res.ok) {\n    throw new Error("HTTP " + res.status);\n  }\n  return res.json();\n}'
                  }
                },
                {
                  h: '6. 并发、顺序与任务队列',
                  p: [
                    'Promise.all 等待全部成功，任何一个失败就整体失败；Promise.allSettled 收集每个结果，适合批量任务；需要严格顺序时才逐个 await。微任务在当前宏任务结束后立即清空，宏任务则排在下一轮。',
                    '用数组模拟队列有助于建立直觉：入队、出队、按优先级处理。常见错误：在 map 里写 async 得到一列 Promise 却忘了 await；无上限并发压垮服务；忽略失败分支。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const jobs = [1, 2, 3];\nPromise.all(jobs.map(n => Promise.resolve(n * 2)))\n  .then(values => console.log(values));'
                  }
                }
              ],
              terms: [
                { t: '回调', en: 'callback', d: '在操作完成后被调用的函数。' },
                { t: 'Promise', d: '表示异步操作最终结果与状态的对象。' },
                { t: '事件循环', en: 'event loop', d: '在调用栈清空后从队列取任务执行的机制。' },
                { t: '微任务', en: 'microtask', d: '在当前宏任务结束后立即清空的高优先级任务。' },
                { t: 'async/await', d: '用同步写法组织异步流程的语法。' },
                { t: 'fetch', d: '浏览器提供的网络请求 API，返回 Promise。' }
              ],
              exam: '面试高频：事件循环输出顺序、Promise 状态、then 链的返回值、async 函数返回值、Promise.all 与 allSettled、fetch 对 404 的处理。先写执行顺序，再解释原因。',
              checklist: [
                '能说出同步与异步的执行顺序',
                '会写 then/catch 链并正确 return',
                '会用 async/await 与 try/catch',
                '知道 fetch 需要检查 response.ok',
                '能区分并行等待与串行等待'
              ]
            }
          },
          {
            id: 'js-9-3', type: 'battle', title: '遭遇 · 回响无人', jp: '響きなき者', xp: 80,
            enemy: {
              name: '回响无人', kind: 'drone', hp: 100,
              title: '造物 · 空转队列', taunt: '任务发出去了。然后呢？你们根本不知道谁先回来。',
              lore: '它让所有任务同时涌入，却没有人负责顺序。用两条队列模拟微任务与宏任务的清空过程，回响就会重新有先后。'
            },
            brief: '塔里积压了五个任务。先执行同步的「开门」，再依次清空微任务队列，最后清空宏任务队列，逐行输出处理记录。',
            tasks: [
              {
                prompt: '用两个数组模拟队列：微任务 ["结算誓约", "更新星图"]，宏任务 ["渲染城门", "写入日志"]。先输出「同步 开门」，再用 while 逐个出队并输出「微任务 名称」，最后输出「宏任务 名称」。',
                requirement: '预期五行：同步 开门 / 微任务 结算誓约 / 微任务 更新星图 / 宏任务 渲染城门 / 宏任务 写入日志',
                expected: '同步 开门\n微任务 结算誓约\n微任务 更新星图\n宏任务 渲染城门\n宏任务 写入日志',
                starter: 'const micro = ["结算誓约", "更新星图"];\nconst macro = ["渲染城门", "写入日志"];\n// 先同步，再清空 micro，最后清空 macro\n',
                hints: [
                  '先直接输出同步那一条，不需要队列。',
                  '用 while (micro.length > 0) 配合 micro.shift() 逐个取出。',
                  'macro 用同样的 while 写法，注意先 micro 后 macro。'
                ],
                solution: 'const micro = ["结算誓约", "更新星图"];\nconst macro = ["渲染城门", "写入日志"];\nconsole.log("同步 开门");\nwhile (micro.length > 0) {\n  console.log(`微任务 ${micro.shift()}`);\n}\nwhile (macro.length > 0) {\n  console.log(`宏任务 ${macro.shift()}`);\n}',
                must: { re: 'while\\s*\\(', text: '必须使用 while 逐个清空队列' }
              }
            ],
            outro: '钟声落下，回音第一次按顺序返回。无人机悬在半空，像在重新学习等待。赛琳收起剑：「异步不是让事情同时发生，是让每件事在该发生的时候发生。」',
            loot: LS.makeLoot('epic', '迟响怀表', 'relic', '◷', '表盘上没有秒针，只有两圈刻度：内圈微任务，外圈宏任务。它走得不准，但顺序从不出错。', 'javascript')
          }
        ]
      },

      /* ============================== 第十章 ============================== */
      {
        id: 'js-10', title: '第十章 · 铸链工坊', jp: '鎖環の工房',
        subtitle: '把散落的文件锻成一条可维护的链', summary: 'ES Modules、npm、打包、调试与工程约束。',
        nodes: [
          {
            id: 'js-10-1', type: 'story', title: '断开的锁链', jp: '切れた鎖', xp: 20,
            lines: [
              { who: '维护者·缄', tone: 'guide', text: '工坊的锁链断了。每一环都在，但顺序错了，于是整条链拖在地上。' },
              { who: '赛琳', tone: 'ally', text: '先把每段铁环分开锻造。一个模块只做一件事，只导出该导出的。' },
              { who: '铸链监工', tone: 'enemy', text: '依赖越多越强。你们却想削减？削弱自己？' },
              { who: '界灵·零', tone: 'guide', text: '依赖不是力量，可复现才是。版本、脚本、入口，都要写进契约。' },
              { who: '赛琳', tone: 'ally', text: '先把重复引入的模块账算清，再谈重铸。' }
            ]
          },
          {
            id: 'js-10-2', type: 'lesson', title: '模块、npm 与构建', jp: 'モジュールと工程', xp: 40, minutes: 24,
            article: {
              lead: '一个人的脚本可以靠记忆维护，一个团队的工程不行。模块把作用域切开，npm 把依赖钉住版本，打包把许多文件变成一个可交付的产物。本章讲清这条链，也讲清它在哪里断。',
              sections: [
                {
                  h: '1. 模块：把作用域切开',
                  p: [
                    '每个 ES Module 都有独立作用域。只有 export 出去的内容才能被别的文件 import，未导出的变量留在模块内部。这让文件之间靠明确的接口协作，而不是靠全局变量互相污染。',
                    '常见错误：用全局变量串联模块；在模块顶层执行有副作用的代码；循环依赖导致某一方拿到未初始化值；默认导出与命名导出混用却记不清。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: '// math.js\nexport function add(a, b) {\n  return a + b;\n}\n\nexport const VERSION = "2.0";'
                  }
                },
                {
                  h: '2. export / import 的几种写法',
                  p: [
                    '命名导出可以一次导出多个，导入时用花括号，并且可以重命名。默认导出每个模块只能有一个，导入时名字由使用方决定。也可以整体导入：import * as math。',
                    '浏览器里要用 <script type="module">，并且路径通常需要写扩展名。常见错误：把默认导入写成花括号；忘记写 ./ 前缀；在 CommonJS 项目里直接写 import；同一个模块里默认与命名混用导致导入名字对不上。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'import { add as plus, VERSION } from "./math.js";\nimport total from "./total.js";\nconsole.log(plus(2, 3), VERSION, total);'
                  }
                },
                {
                  h: '3. npm 与 package.json',
                  p: [
                    'npm init 生成 package.json，dependencies 是运行时依赖，devDependencies 是构建、测试、格式化等开发期依赖。scripts 把常用命令固化成入口，lock 文件锁定整棵依赖树的精确版本。',
                    '语义化版本 major.minor.patch 中，^ 允许升级 minor 与 patch，~ 只允许 patch。常见错误：把 node_modules 提交进仓库；依赖写 latest 导致构建不可复现；把构建工具装进 dependencies；忽略 lock 文件的变更。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: '{\n  "name": "link-sekai",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0"\n  }\n}'
                  }
                },
                {
                  h: '4. 打包与构建',
                  p: [
                    '打包器从入口出发，沿着 import 构建依赖图，把许多模块合并、压缩，输出浏览器可以直接加载的产物。tree shaking 去掉没有用到的导出，代码分割把大包拆成按需加载的块。',
                    '常见错误：把密钥打进前端包；生产环境保留完整 sourcemap 导致源码泄露；包体过大却从不分析；开发环境与生产环境配置混在一起。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'export default {\n  build: {\n    outDir: "dist",\n    sourcemap: true\n  }\n};'
                  }
                },
                {
                  h: '5. 调试：从报错到根因',
                  p: [
                    '先读第一条错误和堆栈最上面的一行，那通常离真正的问题最近。用断点或日志缩小范围，再二分定位。sourcemap 能把压缩后的位置映射回源码，是生产排错的必需品。',
                    '常见错误：只看最后一行报错；在生产环境留下大量 console；一次改十处却不逐步验证；把「能运行」当成「已修好」。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'function parseLevel(text) {\n  const n = Number(text);\n  if (Number.isNaN(n)) {\n    throw new Error("等级不是数字: " + text);\n  }\n  return n;\n}'
                  }
                },
                {
                  h: '6. 工程约束与交付清单',
                  p: [
                    '格式化、lint、类型检查、测试、持续集成，这些约束不是为了限制人，而是为了让错误在合并之前暴露。版本与变更记录让回滚有依据，依赖审计让供应链风险可见。',
                    '交付前至少确认：依赖能重新安装、构建能从零跑通、关键路径有测试、错误有日志、配置与密钥分离、产物可以回滚。工程化不是工具的堆叠，是一组可重复的保证。'
                  ],
                  note: '判断一个项目是否健康，不看它用了多少工具，而看一个新成员能否在半小时内把项目跑起来。'
                }
              ],
              terms: [
                { t: '模块', en: 'module', d: '拥有独立作用域、通过导入导出协作的文件单元。' },
                { t: '命名导出', en: 'named export', d: '用 export 声明、导入时需要对应名字的导出。' },
                { t: '依赖', en: 'dependency', d: '项目运行或构建时需要的外部包。' },
                { t: '语义化版本', en: 'semantic versioning', d: '用 major.minor.patch 表达兼容性的版本规则。' },
                { t: '打包', en: 'bundling', d: '沿依赖图合并模块并生成可部署产物的过程。' },
                { t: 'sourcemap', d: '把构建产物位置映射回原始源码的调试文件。' }
              ],
              exam: '工程向面试常问：ESM 与 CommonJS 区别、tree shaking 的条件、dependencies 与 devDependencies、lock 文件的作用、sourcemap 的取舍、如何定位生产问题。',
              checklist: [
                '能拆分模块并写出清晰的导出',
                '分得清默认导出与命名导出',
                '知道 dependencies 与 devDependencies 的区别',
                '理解 lock 文件与语义化版本',
                '能沿着报错与堆栈定位问题'
              ]
            }
          },
          {
            id: 'js-10-3', type: 'battle', title: '遭遇 · 铸链监工', jp: '鎖の監督者', xp: 80,
            enemy: {
              name: '铸链监工', kind: 'construct', hp: 100,
              title: '造物 · 重复依赖', taunt: '同一个模块引入三次，不是更稳，是更重。',
              lore: '它把同一段依赖反复焊进锁链，直到整条链无法抬起。把重复的模块名统计清楚，按首次出现的顺序输出次数，链条才会恢复。'
            },
            brief: '构建日志里依次出现模块 core、ui、core、net、ui、core。统计每个模块出现的次数，按首次出现的顺序输出「模块 次数」。',
            tasks: [
              {
                prompt: '给定数组 const modules = ["core", "ui", "core", "net", "ui", "core"]; 用循环统计每个模块出现次数，并按首次出现顺序输出 core、ui、net 的次数。',
                requirement: '预期三行：core 3 / ui 2 / net 1',
                expected: 'core 3\nui 2\nnet 1',
                starter: 'const modules = ["core", "ui", "core", "net", "ui", "core"];\nconst counts = {};\n// 统计次数，再按首次出现顺序输出\n',
                hints: [
                  '遍历 modules，用 counts[name] = (counts[name] || 0) + 1 累计。',
                  '可以再建一个 order 数组，第一次见到某个名字时 push 进去。',
                  '最后遍历 order，输出 `${name} ${counts[name]}`。'
                ],
                solution: 'const modules = ["core", "ui", "core", "net", "ui", "core"];\nconst counts = {};\nconst order = [];\nfor (const name of modules) {\n  if (!counts[name]) {\n    order.push(name);\n  }\n  counts[name] = (counts[name] || 0) + 1;\n}\nfor (const name of order) {\n  console.log(`${name} ${counts[name]}`);\n}',
                must: { re: 'for\\s*\\(', text: '必须使用循环统计模块次数' }
              }
            ],
            outro: '监工放下焊枪。锁链第一次显出自己的真实长度：不是由多少环决定，而是由每一环是否必要决定。缄在账本上写下：可复现，胜过可炫耀。',
            loot: LS.makeLoot('epic', '铸链锤', 'weapon', '⚒', '锤头一面刻着 import，一面刻着 export。它不锻造更多依赖，只把多余的环敲掉。', 'javascript')
          }
        ]
      },

      /* ============================== 第十一章 ============================== */
      {
        id: 'js-11', title: '第十一章 · 造物之厅', jp: '造物の広間',
        subtitle: '用模板造出会继承、会保护自己的存在', summary: 'class、继承、私有字段、Mixin 与组合。',
        nodes: [
          {
            id: 'js-11-1', type: 'story', title: '无名的铠甲', jp: '名もなき鎧', xp: 20,
            lines: [
              { who: '赛琳', tone: 'ally', text: '造物之厅里躺着一排没有名字的铠甲。它们会动，却不知道自己属于谁。' },
              { who: '界灵·零', tone: 'guide', text: '给它们 class。构造器写下身份，方法写下行为，私有字段守住不该外泄的核心。' },
              { who: '原型守卫', tone: 'enemy', text: '复制，复制，再复制。你们所谓的继承，不过是把同一段错误传下去。' },
              { who: '赛琳', tone: 'ally', text: '那就只继承真正共享的部分。其余用组合、用 Mixin、用明确的接口。' },
              { who: '维护者·缄', tone: 'guide', text: '这些造物是旧核的卫兵。修好它们的账本，比修好它们的剑更重要。' }
            ]
          },
          {
            id: 'js-11-2', type: 'lesson', title: '类、继承与 Mixin', jp: 'クラスと継承', xp: 40, minutes: 24,
            article: {
              lead: '当对象开始有行为、有继承、有不想公开的内部状态时，class 提供了更清晰的表达。它不是银弹，但在建模实体、约束接口、复用逻辑时非常有效。本章从构造器写到私有字段与 Mixin，并讨论什么时候不该用类。',
              sections: [
                {
                  h: '1. class 与 constructor',
                  p: [
                    'class 是原型继承的语法糖。constructor 在 new 时执行，用来初始化实例；方法定义在原型上，被所有实例共享。typeof 一个类仍然是 function。',
                    '常见错误：调用类时忘记 new；在 constructor 里 return 一个对象，导致 new 得到别的东西；方法之间调用忘记 this；把每次实例都不同的状态写到原型上。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'class Knight {\n  constructor(name, hp) {\n    this.name = name;\n    this.hp = hp;\n  }\n  hit(dmg) {\n    this.hp = Math.max(0, this.hp - dmg);\n    return this.hp;\n  }\n}\nconst k = new Knight("赛琳", 100);\nconsole.log(k.hit(30));'
                  },
                  note: '本章示例涉及类与私有字段，教学终端只作概念展示，不执行。'
                },
                {
                  h: '2. 实例、静态成员与 getter',
                  p: [
                    '实例属性每个对象一份，方法在原型上共享。static 成员属于类本身，通过类名调用。getter 与 setter 可以把读写包装成属性访问，在内部做校验或派生计算。',
                    '常见错误：把共享状态放到实例上；getter 里再次访问同名属性造成无限递归；在静态方法里用 this 期待实例。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'class Quest {\n  constructor(title) {\n    this.title = title;\n    this.done = false;\n  }\n  get status() {\n    return this.done ? "完成" : "进行中";\n  }\n  static create(title) {\n    return new Quest(title);\n  }\n}'
                  }
                },
                {
                  h: '3. 继承与 super',
                  p: [
                    'extends 建立继承关系，子类构造器必须先调用 super() 才能使用 this。子类可以重写父类方法，也可以通过 super.method() 复用父类实现。instanceof 可以判断实例是否属于某条继承链。',
                    '常见错误：在 super 之前访问 this；继承层次过深，改一处影响一片；用继承表达「有一个」而不是「是一个」；忘记子类构造器参数要传给 super。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'class Guard extends Knight {\n  constructor(name, hp, post) {\n    super(name, hp);\n    this.post = post;\n  }\n  report() {\n    return `${this.name} 驻守 ${this.post}`;\n  }\n}'
                  }
                },
                {
                  h: '4. 私有字段与封装',
                  p: [
                    '以 # 开头的字段是真正的私有字段，只能在类内部访问。外部读取会直接报语法错误，而不是得到 undefined。这比用下划线约定更可靠。',
                    '私有字段适合保存不该被随意改写的内部状态，再通过方法或 getter 暴露受控视图。常见错误：把 _ 约定当成私有；在类外访问 #field；为了私有而私有，导致测试和扩展都变难。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'class Vault {\n  #code;\n  constructor(code) {\n    this.#code = code;\n  }\n  verify(input) {\n    return input === this.#code;\n  }\n}\nconst v = new Vault("link");\nconsole.log(v.verify("link"));'
                  }
                },
                {
                  h: '5. Mixin 与组合',
                  p: [
                    'JavaScript 只支持单继承。当多组能力需要复用，可以用 Mixin：写一个接收类、返回新类的函数，把方法混入原型；或者直接用对象组合，把能力作为属性注入。',
                    '组合通常比深层继承更灵活：对象拥有一个 strategy，而不是成为某个子类。常见错误：Mixin 之间命名冲突；Mixin 依赖宿主类里未声明的属性；把 Mixin 当成继承链继续 extends。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'const canFly = Base => class extends Base {\n  fly() {\n    return `${this.name} 起飞`;\n  }\n};\nclass Bird extends canFly(Knight) {}\nconst b = new Bird("风隼", 40);\nconsole.log(b.fly());'
                  }
                },
                {
                  h: '6. 何时用类，何时不用',
                  p: [
                    '有身份、有生命周期、需要封装内部状态时，类很合适。纯数据转换用函数；配置用普通对象；一次性逻辑不需要为了形式造一个类。',
                    '判断标准不是「像不像面向对象」，而是「这段代码会不会被复用、需不需要保护不变量、有没有明确的责任边界」。如果答案是否定的，函数往往更轻。'
                  ],
                  note: '先写函数，等到状态与行为确实需要绑在一起时，再引入类。重构比过度设计便宜。'
                }
              ],
              terms: [
                { t: '类', en: 'class', d: '定义实例结构与行为的模板，本质基于原型。' },
                { t: '构造器', en: 'constructor', d: '用 new 创建实例时执行的初始化方法。' },
                { t: '实例', en: 'instance', d: '由类创建出来、拥有独立状态的对象。' },
                { t: '继承', en: 'inheritance', d: '子类复用并扩展父类结构与行为的机制。' },
                { t: '私有字段', en: 'private field', d: '以 # 声明、只能在类内部访问的字段。' },
                { t: 'Mixin', d: '把一组方法混入类的复用方式，弥补单继承限制。' }
              ],
              exam: '面试高频：class 与原型的关系、super 的调用顺序、this 在继承中的指向、私有字段、组合优于继承的场景、instanceof 的原理。',
              checklist: [
                '能写构造器与方法',
                '理解实例属性与原型方法的区别',
                '会使用 extends 与 super',
                '知道 # 私有字段的边界',
                '能用组合或 Mixin 替代过深继承'
              ]
            }
          },
          {
            id: 'js-11-3', type: 'battle', title: '遭遇 · 原型守卫', jp: '原型の守護者', xp: 80,
            enemy: {
              name: '原型守卫', kind: 'golem', hp: 100,
              title: '造物 · 复制之铠', taunt: '同一段错误，被你们继承了多少代？',
              lore: '它把每件装备都复制成相同的空壳，只剩攻击与等级还能辨认。逐件计算真实战力，找出最强的一件，铠甲才会重新有主人。'
            },
            brief: '三件装备：初誓短剑 atk 12 / level 3，岔路护腕 atk 6 / level 5，契约之戒 atk 5 / level 7。真实战力 = atk + level * 2。输出总战力与最强装备名。',
            tasks: [
              {
                prompt: '把三件装备写成对象数组（字段 name、atk、level），用循环计算每件战力 atk + level * 2，累加总战力，并找出战力最高的一件，输出「总战力 53」与「最强 契约之戒」。',
                requirement: '预期两行：总战力 53 / 最强 契约之戒',
                expected: '总战力 53\n最强 契约之戒',
                starter: 'const gear = [\n  { name: "初誓短剑", atk: 12, level: 3 },\n  { name: "岔路护腕", atk: 6, level: 5 },\n  { name: "契约之戒", atk: 5, level: 7 }\n];\nlet total = 0;\n// 逐件计算战力，累加并记录最高\n',
                hints: [
                  '用 for (const item of gear) 逐件处理，战力写成 item.atk + item.level * 2。',
                  '累加 total；用一个变量记录当前最高战力与对应的装备名。',
                  '比较时用「大于」更新，最后输出两行模板字符串。'
                ],
                solution: 'const gear = [\n  { name: "初誓短剑", atk: 12, level: 3 },\n  { name: "岔路护腕", atk: 6, level: 5 },\n  { name: "契约之戒", atk: 5, level: 7 }\n];\nlet total = 0;\nlet bestPower = 0;\nlet bestName = "";\nfor (const item of gear) {\n  const power = item.atk + item.level * 2;\n  total += power;\n  if (power > bestPower) {\n    bestPower = power;\n    bestName = item.name;\n  }\n}\nconsole.log(`总战力 ${total}`);\nconsole.log(`最强 ${bestName}`);',
                must: { re: 'for\\s*\\(', text: '必须使用循环逐件计算' }
              }
            ],
            outro: '三件装备第一次以真实战力排列。契约之戒没有最高的攻击，却因为等级带来的成长成为最强。守卫低声说：「继承不是复制数值，是继承成长的方式。」',
            loot: LS.makeLoot('epic', '造物胸甲', 'armor', '⛨', '胸甲内侧刻着 extends，外侧刻着 compose。它允许你继承，但更希望你学会组合。', 'javascript')
          }
        ]
      },

      /* ============================== 第十二章 ============================== */
      {
        id: 'js-12', title: '第十二章 · 源核之下', jp: '源核の下',
        subtitle: '把学过的每一件事，交给一个真正能用的作品', summary: '待办应用与数据看板：数据模型、统计、筛选、渲染与终战。',
        nodes: [
          {
            id: 'js-12-1', type: 'story', title: '源核之下的总账', jp: '源核の総帳', xp: 20,
            lines: [
              { who: '维护者·缄', tone: 'guide', text: '这里就是源核之下。整座世界的待办清单都挂在这面墙上，有些已经完成，有些被遗忘了十年。' },
              { who: '赛琳', tone: 'ally', text: '那就不急着拔剑。先读出数据：完成了几件，还有几件高优先级的没有做。' },
              { who: '源核守望者', tone: 'enemy', text: '你们修好了一个又一个房间，却从没看过总账。看清楚了，还敢继续吗？' },
              { who: '界灵·零', tone: 'guide', text: '敢。统计不是为了自责，是为了知道下一步该落在哪里。' },
              { who: '赛琳', tone: 'ally', text: '两道指令：先算出未完成与权重，再筛出真正紧急的任务。做完，源核就交给你。' }
            ]
          },
          {
            id: 'js-12-2', type: 'lesson', title: '待办应用与数据看板', jp: '実戦・任務板', xp: 40, minutes: 30,
            article: {
              lead: '最后一章不再引入新语法，而是把前七章装进一个能用的东西：一个待办清单，也是一块数据看板。你需要定义数据模型、计算派生统计、筛选出真正该做的事，并把结果稳定地输出。终战的两道指令，就是这套作品的核心。',
              sections: [
                {
                  h: '1. 从需求到数据模型',
                  p: [
                    '先列出界面要显示什么：标题、完成状态、优先级、编号。再反推需要哪些字段：id、title、done、priority。id 必须稳定，不要用数组下标，因为排序和筛选后下标会变。',
                    '常见错误：字段含义模糊，priority 既表示紧急又表示重要；把展示文本直接存进数据；没有空状态；同一条任务出现两个 id。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const tasks = [\n  { id: 1, title: "修复城门", done: true, priority: 2 },\n  { id: 2, title: "校准星图", done: false, priority: 3 }\n];\nconsole.log(tasks.length);\nconsole.log(tasks[1].title);'
                  }
                },
                {
                  h: '2. 派生状态：能算的不要存',
                  p: [
                    '未完成数量、完成率、已完成权重，都应该由原始任务数组算出来。每次渲染前重新计算，避免「列表改了但统计没改」的状态不同步。',
                    '常见错误：同时保存 total 和 list；更新任务时只改一处；用浮点数存百分比造成精度问题；把筛选结果再存一份却忘记同步。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const tasks = [\n  { id: 1, done: true, priority: 2 },\n  { id: 2, done: false, priority: 3 },\n  { id: 3, done: false, priority: 1 }\n];\nconst open = tasks.filter(t => !t.done).length;\nconst doneWeight = tasks.filter(t => t.done).reduce((s, t) => s + t.priority, 0);\nconsole.log(open, doneWeight);'
                  }
                },
                {
                  h: '3. 统计：用 reduce 做看板',
                  p: [
                    'reduce 可以同时累计多个指标：把累加器做成对象，每次返回同一个对象。初始值必须把每个字段都写全，否则第一次累加会出现 undefined。',
                    '常见错误：回调里忘记 return；在累加器里直接修改原任务对象；初始值给成数字却想累加对象；把统计逻辑散落在多个循环里，难以核对。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const tasks = [\n  { done: true, priority: 2 },\n  { done: false, priority: 3 },\n  { done: true, priority: 1 }\n];\nconst stats = tasks.reduce((acc, t) => {\n  if (t.done) {\n    acc.done += 1;\n    acc.weight += t.priority;\n  } else {\n    acc.open += 1;\n  }\n  return acc;\n}, { done: 0, open: 0, weight: 0 });\nconsole.log(stats.done, stats.open, stats.weight);'
                  }
                },
                {
                  h: '4. 筛选与排序：把注意力留给重要的事',
                  p: [
                    '先 filter 再 sort：filter 返回新数组，再排序不会动到原数据。sort 默认把元素转成字符串比较，数字排序一定要传比较函数。比较函数返回负数表示 a 在前，正数表示 b 在前。',
                    '常见错误：直接对原数组 sort，导致别处依赖的顺序被破坏；比较函数返回布尔值；在渲染过程中顺手修改原数组；优先级相同却期待稳定顺序却不检查运行时。'
                  ],
                  code: {
                    lang: 'javascript',
                    src: 'const tasks = [\n  { title: "巡夜", priority: 3 },\n  { title: "清理日志", priority: 1 },\n  { title: "校准星图", priority: 2 }\n];\nconst ordered = tasks\n  .filter(t => t.priority >= 2)\n  .sort((a, b) => b.priority - a.priority)\n  .map(t => t.title)\n  .join(" > ");\nconsole.log(ordered);'
                  }
                },
                {
                  h: '5. 渲染与状态同步',
                  p: [
                    '保持单一数据源：事件只负责修改数据，渲染函数只负责读数据并更新视图。每次修改后统一重绘，不要把同一份状态同时写在 DOM 和变量里。',
                    '列表渲染时用 id 作为 key 或 data-id，不要用下标。常见错误：直接改 DOM 又改数据；局部更新遗漏导致视图与数据不一致；在渲染函数里发起请求；空列表没有提示。'
                  ],
                  code: {
                    lang: 'javascript',
                    runnable: false,
                    src: 'function render(tasks) {\n  const open = tasks.filter(t => !t.done);\n  const html = open.map(t => `<li data-id="${t.id}">${t.title}</li>`).join("");\n  document.querySelector("#list").innerHTML = html;\n}'
                  }
                },
                {
                  h: '6. 交付前自检',
                  p: [
                    '至少测五种情况：空列表、全部完成、超长标题、重复优先级、任务数量很多。检查统计与列表是否一致，筛选条件变化后是否仍然正确，失败路径有没有提示。',
                    '真正的作品不是「功能写完了」，而是「别人能放心使用」。把一个待办清单做稳，比同时开十个半成品更接近工程师的工作。'
                  ],
                  note: '终战的两道指令就来自这块看板：先统计，再筛选。它们看起来简单，但每一步都在检查你是否真的理解了数据流。'
                }
              ],
              terms: [
                { t: '数据模型', en: 'data model', d: '描述业务对象有哪些字段、字段含义与约束的结构。' },
                { t: '派生状态', en: 'derived state', d: '由原始数据计算得出、不需要单独保存的状态。' },
                { t: '单一数据源', en: 'single source of truth', d: '同一份状态只保存在一个地方，避免多处不同步。' },
                { t: '纯函数', en: 'pure function', d: '相同输入总得到相同输出、且不修改外部状态的函数。' },
                { t: '空状态', en: 'empty state', d: '数据为空时给用户的明确提示与下一步入口。' },
                { t: '稳定排序', en: 'stable sort', d: '相等元素保持原有相对顺序的排序行为。' }
              ],
              exam: '项目与面试综合题：如何设计待办应用的数据结构、统计与列表如何保持一致、filter/sort 是否修改原数组、reduce 累加对象、空状态与错误状态如何处理。',
              checklist: [
                '能为待办设计稳定 id 与字段',
                '能用 filter 计算派生统计',
                '能用 reduce 同时累计多个指标',
                '知道 sort 会修改原数组',
                '能描述数据到视图的更新闭环'
              ]
            }
          },
          {
            id: 'js-12-3', type: 'battle', title: '终战 · 源核守望者', jp: '源核の守護者', xp: 160,
            enemy: {
              name: '源核守望者', kind: 'construct', hp: 100, boss: true,
              title: '首领 · 旧核总账', taunt: '你们修好了房间，却不敢看账。',
              lore: '它由无数未完成的任务与过期承诺堆成。只有把总账算清、把真正紧急的事筛出来，源核才会承认新的维护者。'
            },
            brief: '终战分两段。第一段统计五条任务的未完成数量与已完成权重；第二段筛出未完成且优先级不低于 3 的任务并逐行输出。两段完成，总账归位。',
            tasks: [
              {
                prompt: '第一击：给定五条任务的对象数组，用 filter 统计未完成数量，用 reduce 计算已完成任务的 priority 之和，输出「未完成 3 · 已完成权重 4」。',
                requirement: '预期输出：未完成 3 · 已完成权重 4',
                expected: '未完成 3 · 已完成权重 4',
                starter: 'const tasks = [\n  { id: 1, title: "修复城门", done: true, priority: 2 },\n  { id: 2, title: "校准星图", done: false, priority: 3 },\n  { id: 3, title: "清理日志", done: false, priority: 1 },\n  { id: 4, title: "补写誓约", done: true, priority: 2 },\n  { id: 5, title: "巡夜", done: false, priority: 3 }\n];\n// 统计未完成数量与已完成权重\n',
                hints: [
                  '未完成数量：tasks.filter(t => !t.done).length。',
                  '已完成权重：先 filter 出 done 为 true 的任务，再用 reduce 累加 priority。',
                  'reduce 的初始值写 0，最后用模板字符串输出两个结果。'
                ],
                solution: 'const tasks = [\n  { id: 1, title: "修复城门", done: true, priority: 2 },\n  { id: 2, title: "校准星图", done: false, priority: 3 },\n  { id: 3, title: "清理日志", done: false, priority: 1 },\n  { id: 4, title: "补写誓约", done: true, priority: 2 },\n  { id: 5, title: "巡夜", done: false, priority: 3 }\n];\nconst open = tasks.filter(t => !t.done).length;\nconst weight = tasks.filter(t => t.done).reduce((sum, t) => sum + t.priority, 0);\nconsole.log(`未完成 ${open} · 已完成权重 ${weight}`);',
                must: { re: 'filter\\s*\\([\\s\\S]*reduce\\s*\\(', text: '必须使用 filter 与 reduce 完成统计' }
              },
              {
                prompt: '第二击：筛出所有未完成且 priority 大于等于 3 的任务，用 map 生成「[id] title」格式的行，再用 join 以换行连接并输出。',
                requirement: '预期两行：[2] 校准星图 / [5] 巡夜',
                expected: '[2] 校准星图\n[5] 巡夜',
                starter: 'const tasks = [\n  { id: 1, title: "修复城门", done: true, priority: 2 },\n  { id: 2, title: "校准星图", done: false, priority: 3 },\n  { id: 3, title: "清理日志", done: false, priority: 1 },\n  { id: 4, title: "补写誓约", done: true, priority: 2 },\n  { id: 5, title: "巡夜", done: false, priority: 3 }\n];\n// 筛选未完成且高优的任务，生成文本行\n',
                hints: [
                  '筛选条件写成 t => !t.done && t.priority >= 3。',
                  'map 生成模板字符串 `[${t.id}] ${t.title}`。',
                  '最后 join("\\n") 并 console.log 输出。'
                ],
                solution: 'const tasks = [\n  { id: 1, title: "修复城门", done: true, priority: 2 },\n  { id: 2, title: "校准星图", done: false, priority: 3 },\n  { id: 3, title: "清理日志", done: false, priority: 1 },\n  { id: 4, title: "补写誓约", done: true, priority: 2 },\n  { id: 5, title: "巡夜", done: false, priority: 3 }\n];\nconst lines = tasks\n  .filter(t => !t.done && t.priority >= 3)\n  .map(t => `[${t.id}] ${t.title}`)\n  .join("\\n");\nconsole.log(lines);',
                must: { re: 'filter\\s*\\([\\s\\S]*map\\s*\\([\\s\\S]*join\\s*\\(', text: '必须依次使用 filter、map、join' }
              }
            ],
            outro: '总账上的数字一行行归位。源核守望者没有倒下，它只是把位置让了出来。整面墙的任务重新排序，最上面两行亮着微光：校准星图，巡夜。赛琳把剑收回鞘里：「第二卷，完成。你已经能让数据替你说话了。」',
            loot: LS.makeLoot('mythic', '源核之钥', 'weapon', '✧', '钥匙上没有齿，只有一条数据流。它开不了任何一扇门，却能让你看清门后还有多少件事没有做。', 'javascript')
          }
        ]
      }
    );
  }

  const current = LS.lang('javascript');
  if (current) {
    apply(current);
  } else {
    // 校验脚本按文件名排序加载，扩展文件可能先于语言文件执行。
    // 包一层注册钩子，等 javascript 注册完成后再接入，避免依赖加载顺序。
    const base = LS.registerLanguage;
    LS.registerLanguage = function (def) {
      base.call(LS, def);
      if (def && def.id === 'javascript') apply(def);
    };
  }
})(window.LS);
