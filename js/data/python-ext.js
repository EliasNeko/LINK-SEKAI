/* Python 第二卷 · 源核之下（py-5 ~ py-12）
 * 只依赖 LS.lang('python') 已注册的语言对象。
 * 载入顺序说明：浏览器按 index.html 的 script 顺序执行（python.js 在前），
 * 而 tools/verify-curriculum.js 按文件名排序 require，python-ext.js 会先于 python.js 载入。
 * 因此这里用一次性的注册钩子兜底：无论谁先载入，扩展都会在 python 语言对象出现后立即应用。
 */
(function (LS) {
  'use strict';

  let applied = false;

  function extend() {
    if (applied) return;
    const lang = LS.lang('python');
    if (!lang || !Array.isArray(lang.chapters) || lang.chapters.length < 4) return;
    applied = true;
    // 防止同一份脚本被重复引入时把第二卷挂载两次
    if (lang.chapters.some((c) => c.id === 'py-5')) return;

    /* 把第一卷第四章标记为卷一终章，避免出现两个「终章」 */
    const vol1 = lang.chapters[3];
    vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
    vol1.nodes[vol1.nodes.length - 1].title = '卷一终战 · ' + vol1.nodes[vol1.nodes.length - 1].title.replace(/^终战\s*·\s*/, '');

    lang.chapters.push(
      /* ================= 第五章 ================= */
      {
        id: 'py-5', title: '第五章 · 缄默字库', jp: '沈黙の字庫',
        subtitle: '在断句的经卷里，读回每一个字符', summary: '字符串索引与切片、常用方法、f-string、转义与编码基础。',
        nodes: [
          {
            id: 'py-5-1', type: 'story', title: '漏字的经卷', jp: '零れた経巻', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '源核重新点亮的三天后，地底传来翻页声。那是「源核之下」——比源核更古老的字库，正在漏字。' },
              { who: '奈芙', tone: 'ally', text: '漏出来的不是数据，是句子。每一句都被切断在奇怪的位置，像有人照着格子下刀。' },
              { who: '缄默抄写灵', tone: 'enemy', text: '……终端……已……已……（它张着嘴，只吐出半句话）' },
              { who: '奈芙', tone: 'ally', text: '先别拔刀。它只是被截断了。你要学会索引与切片，才能把它缺的那一段接回去。' },
              { who: '界灵·零', tone: 'guide', text: '本章的钥匙是字符串：位置、切片、清洗与格式化。看清结构，比砍得快更重要。' }
            ]
          },
          {
            id: 'py-5-2', type: 'lesson', title: '字符串与格式化', jp: '文字の刃', xp: 40, minutes: 22,
            article: {
              lead: '字符串是终端里出现最多的类型：命令、日志、配置、网页内容，本质都是字符串。本章把「读一段文字」变成可精确操作的动作——定位、切片、清洗、格式化，并解释同一个汉字为什么有时算一个字符、有时算三个字节。',
              sections: [
                {
                  h: '1. 字符串是字符序列，而且不可变',
                  p: [
                    '字符串（str）是一串有序的 Unicode 字符。索引从 0 开始，s[0] 是第一个字符，s[-1] 是最后一个字符（负数从末尾倒数）。len(s) 返回字符个数，不是字节数。',
                    '字符串不可变：写 s[0] = "x" 会抛 TypeError。所有看起来像「修改」的操作，实际都返回一个新字符串，原变量仍指向旧内容。这就是为什么必须写 clean = raw.strip()，只调用 raw.strip() 等于什么都没做。'
                  ],
                  code: { lang: 'python', src: 's = "月影终端"\nprint(s[0])\nprint(s[-1])\nprint(len(s))' }
                },
                {
                  h: '2. 切片：左闭右开的一段',
                  p: [
                    '切片写成 s[start:stop]，包含 start，不包含 stop。s[0:4] 取到第 0、1、2、3 个字符。省略起点表示从头，省略终点表示到尾：s[:4]、s[5:]。',
                    '切片越界不会报错：s[0:100] 会安静地返回整段字符串。但用单个索引越界（s[100]）会抛 IndexError。写切片时先想清楚「我要停在哪个字符之前」，这是最容易错一位的地方。'
                  ],
                  code: { lang: 'python', src: 's = "Link-Sekai"\nprint(s[0:4])\nprint(s[5:10])\nprint(s[0:4] + "-" + s[5:10])' }
                },
                {
                  h: '3. 常用方法：清洗与变形',
                  p: [
                    'strip() 去掉首尾空白（空格、制表、换行），中间的空白不受影响；upper()/lower() 转换大小写；replace(旧, 新) 替换全部匹配；split(分隔符) 把字符串切成列表；"连接符".join(列表) 反向拼回去。',
                    '这些方法都返回新字符串。处理用户输入的标准动作是：先 strip 去空白，再 lower 统一大小写，然后比较。忘记 strip 时，"yes " 永远不等于 "yes"。'
                  ],
                  code: { lang: 'python', src: 'raw = "  Shadow Terminal  "\nclean = raw.strip()\nprint(clean)\nprint(clean.lower())\nprint(clean.upper())\nprint(len(clean))' }
                },
                {
                  h: '4. f-string：让变量进入句子',
                  p: [
                    'f-string 在引号前加 f，花括号里可以放变量甚至表达式：f"{name} 剩余 {hp}"。花括号里还能跟格式说明：{value:.2f} 保留两位小数，{value:>6} 右对齐占六格，{value:.1%} 输出百分比。',
                    '没有 f-string 的旧写法是 "{}".format(x) 或 "%s" % x，读旧代码时会遇到。花括号本身要用 {{ }} 转义。教学终端暂不支持 f-string，下面的示例是概念示例，请在自己的电脑上练习。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'name = "奈芙"\nhp = 87\nprint(f"{name} 剩余 HP：{hp}")\nprint(f"伤害占比 {hp / 100:.1%}")' }
                },
                {
                  h: '5. 转义与原始字符串',
                  p: [
                    '反斜杠开始一个转义序列：\\n 表示换行，\\t 表示制表符，\\\\ 表示一个反斜杠本身，\\" 表示引号。终端里看到「一行变两行」，通常是字符串里真的含有了换行符。',
                    'Windows 路径是转义的经典陷阱："C:\\new\\table.txt" 里的 \\n 与 \\t 会被解释成换行和制表。解决办法是写原始字符串 r"C:\\new\\table.txt"，或改用正斜杠。原始字符串里反斜杠没有特殊含义，但不能以单个反斜杠结尾。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'print("第一行\\n第二行")\nprint("月影\\t终端")\nprint("C:\\\\old\\\\notes.txt")\nprint(r"C:\\old\\notes.txt")' }
                },
                {
                  h: '6. 编码：一个汉字不一定是三个字节',
                  p: [
                    'Python 3 的 str 存的是 Unicode 码点，所以 len("影") 是 1。但写进文件、发到网络前要先编码成字节（bytes）："影".encode("utf-8") 得到 3 个字节；反过来 b"\\xe5\\xbd\\xb1".decode("utf-8") 还原成字符。',
                    '乱码几乎总是「用一种编码写入、用另一种编码读出」。读写文件时显式写 encoding="utf-8"，不要依赖系统默认值。len(s) 数的是字符，len(s.encode("utf-8")) 数的才是字节。'
                  ],
                  code: { lang: 'python', runnable: false, src: 's = "影"\nprint(len(s))\nprint(len(s.encode("utf-8")))\nprint(s.encode("utf-8"))' }
                }
              ],
              terms: [
                { t: '字符串', en: 'str / string', d: '由 Unicode 字符组成的有序序列，创建后不可修改。' },
                { t: '索引', en: 'index', d: '字符在字符串中的位置编号，从 0 开始，负数从末尾倒数。' },
                { t: '切片', en: 'slice', d: '用 start:stop 取子串，包含起点、不包含终点。' },
                { t: '不可变', en: 'immutable', d: '对象创建后内部状态不能修改；所谓修改都会产生新对象。' },
                { t: '转义', en: 'escape', d: '用反斜杠把特殊字符写成普通字符，例如换行、制表符、引号。' },
                { t: '原始字符串', en: 'raw string', d: '前缀 r，反斜杠不再作为转义符，适合路径与正则。' },
                { t: '编码', en: 'encoding', d: '字符与字节之间的映射规则，UTF-8 是常用的一种。' }
              ],
              exam: '字符串题主要考三件事：切片边界（左闭右开、负数索引）、方法是否改变原串（都不改变）、以及格式化输出。看到 s[1:3] 要立刻反应出两个字符；看到 s[::-1] 想到反转。编码题一般只问：len 数的是字符还是字节。',
              checklist: [
                '能用索引与切片取出指定片段',
                '会组合 strip/upper/lower 清洗输入',
                '能读懂 f-string 的格式说明',
                '知道转义序列与原始字符串的区别',
                '能解释「字符数」与「字节数」的差别'
              ]
            }
          },
          {
            id: 'py-5-3', type: 'battle', title: '遭遇 · 缄默抄写灵', jp: '沈黙の写字霊', xp: 80,
            enemy: {
              name: '缄默抄写灵', kind: 'wraith', hp: 100,
              title: '字库 · 残页', taunt: '……终端……已……已……',
              lore: '由被截断的句子聚成。它想说完一句话，却总在同一个位置断掉——那里缺的不是词，是位置。'
            },
            brief: '残页上写着被空格与大小写弄乱的终端铭文。奈芙把纸递给你：先用 strip 把首尾的空白削掉，再把剩下的部分读完整。',
            tasks: [
              {
                prompt: '给定 raw = "  Code-Link-Sekai  "，清洗后输出三行：全大写的铭文、清洗后的字符数、前四个字符的小写形式。',
                requirement: '三行输出：第 1 行全大写铭文，第 2 行字符数 15，第 3 行前四个字符的小写形态。',
                expected: 'CODE-LINK-SEKAI\n15\ncode',
                starter: 'raw = "  Code-Link-Sekai  "\n# 先用 strip 去掉首尾空格，再分别输出\n',
                hints: [
                  '先把清洗结果存进变量，例如 clean = raw.strip()，后面都基于它。',
                  'upper()/lower() 都返回新字符串；len(clean) 得到字符数，去掉空格后是 15。',
                  '三段分别是 print(clean.upper())、print(len(clean))、print(clean[0:4].lower())。'
                ],
                solution: 'raw = "  Code-Link-Sekai  "\nclean = raw.strip()\nprint(clean.upper())\nprint(len(clean))\nprint(clean[0:4].lower())',
                must: { re: '\\.strip\\s*\\(', text: '必须使用 strip 清洗字符串' }
              }
            ],
            outro: '抄写灵吐出最后半句完整的铭文，身形散成墨点。它没有消失，只是终于被读完了。字库深处，另一层档案塔的灯亮了起来。',
            loot: LS.makeLoot('rare', '断句之笔', 'relic', '✎', '笔尖会自动停在正确的位置。它提醒你：切片是左闭右开的。', 'python')
          }
        ]
      },

      /* ================= 第六章 ================= */
      {
        id: 'py-6', title: '第六章 · 重叠回响', jp: '重なり合う残響',
        subtitle: '当一份数据里住着许多份数据', summary: '元组、集合、列表推导式、嵌套列表与排序思维。',
        nodes: [
          {
            id: 'py-6-1', type: 'story', title: '三份战报', jp: '三つの戦報', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '回声档案馆的每一层都在复制上一层。同一份战报出现了三次，数值却各不相同。' },
              { who: '奈芙', tone: 'ally', text: '所以先要问：哪一份是原稿？元组用来固定原稿，集合用来去掉抄本，别把两件事混在一起。' },
              { who: '叠写体', tone: 'enemy', text: '三份、五份、无穷份……你分得清哪一份是你自己吗？' },
              { who: '奈芙', tone: 'ally', text: '列表套列表时更别慌。先算每一层，再横向比较——层层加总，比一眼看穿可靠。' },
              { who: '界灵·零', tone: 'guide', text: '本章练的是「选对容器」：该固定的固定，该去重的去重，该排序的先把比较规则说清楚。' }
            ]
          },
          {
            id: 'py-6-2', type: 'lesson', title: '容器进阶', jp: '容器の深層', xp: 40, minutes: 22,
            article: {
              lead: '列表只是容器的起点。真实数据常常是「一组记录」「一张表」「一堆重复的编号」。元组负责固定、集合负责去重、推导式负责批量生成、嵌套列表负责表达表格。学会按场景选容器，代码会短一半，也更难出错。',
              sections: [
                {
                  h: '1. 元组：写下就不再改的记录',
                  p: [
                    '元组（tuple）用圆括号表示，元素不能增删改，适合表达一条固定记录：坐标 (3, 5)、日期 (2026, 11, 20)、函数返回的多个值。',
                    '单元素元组必须带逗号：(7,)，否则 (7) 只是一个加了括号的数字。元组可以解包：x, y = point。因为不可变，元组能作为字典的键、能放进集合；列表不行。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'point = (3, 5)\nx, y = point\nprint(x + y)\n\nsingle = (7,)\nprint(single[0])' }
                },
                {
                  h: '2. 集合：只关心「有没有」',
                  p: [
                    '集合（set）自动去重且无序。判断存在（in）、求交集并集（&、|）、差集（-）都很快，适合处理标签、ID、白名单。空集合必须写 set()，因为 {} 是空字典。',
                    '集合没有索引，不能写 s[0]，输出顺序也不保证。需要「保持原顺序去重」时，不能直接用 set，常见做法是手动遍历并判断是否已经加入。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'tags = {"python", "data", "python"}\nprint(tags)\nprint(len(tags))\nprint("python" in tags)' }
                },
                {
                  h: '3. 列表推导式：一行生成新列表',
                  p: [
                    '语法是 [表达式 for 变量 in 序列 if 条件]。它等价于「建空列表 → 循环 → 有条件地 append」，但更紧凑：[x * 2 for x in dmg if x >= 10] 表示只把大于等于 10 的伤害翻倍。',
                    '推导式适合一行能读懂的场景；嵌套超过两层、或带副作用时，老老实实写 for 循环更清楚。记住它生成的是新列表，不会修改原列表。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'dmg = [12, 8, 20, 5]\nstrong = [x * 2 for x in dmg if x >= 10]\nprint(strong)' }
                },
                {
                  h: '4. 嵌套列表：表格与矩阵',
                  p: [
                    '嵌套列表就是列表里放列表。访问要用两级索引：grid[行][列]。遍历时外层循环取行，内层循环取该行的元素；各行的长度可以不同，这就是不规则表。',
                    '经典陷阱是 [[0] * 3] * 3：它复制的是同一个内层列表的引用，改一格三行全变。正确写法是 [[0] * 3 for _ in range(3)]，每行都新建。'
                  ],
                  code: { lang: 'python', src: 'grid = [[1, 2, 3], [4, 5, 6]]\nprint(grid[1][0])\nprint(grid[0][2])\nprint(len(grid), len(grid[0]))\nprint(grid[1])' }
                },
                {
                  h: '5. 排序思维：先定义「谁更大」',
                  p: [
                    'sorted(seq) 返回排好序的新列表；seq.sort() 原地排序并返回 None。reverse=True 表示降序。排序是稳定的：相等元素保持原有相对顺序。',
                    '比较对象不是数字时，用 key 指定依据：key=lambda p: p["score"]。多关键字可以返回元组，例如 key=lambda p: (-p["score"], p["name"])——负号用来把「分数高者在前」和「名字升序」拼在一起。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'scores = [88, 62, 95]\nprint(sorted(scores))\nprint(sorted(scores, reverse=True))\n\npeople = [{"name": "奈芙", "score": 95}, {"name": "白川", "score": 62}]\nranked = sorted(people, key=lambda p: p["score"], reverse=True)\nprint(ranked[0]["name"])' }
                },
                {
                  h: '6. 同时取位置与值',
                  p: [
                    'enumerate(seq) 遍历时同时给出索引和值，比 range(len(seq)) 再索引更清楚。zip(a, b) 把两个列表按位置配对，长度不同时以短的为准。',
                    '不要在遍历列表的同时 append 或 remove，索引会错位、元素会被跳过。需要边遍历边筛选时，生成一个新列表，或先复制一份再处理。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'for i, v in enumerate(["a", "b"]):\n    print(i, v)\n\nunit = ("奈芙", 95)\nname, score = unit\nprint(name, score)' }
                }
              ],
              terms: [
                { t: '元组', en: 'tuple', d: '有序且不可变的序列，常用来表示一条固定记录。' },
                { t: '集合', en: 'set', d: '元素唯一且无序的容器，适合去重与存在性判断。' },
                { t: '列表推导式', en: 'list comprehension', d: '用一行表达式从已有序列生成新列表的写法。' },
                { t: '嵌套列表', en: 'nested list', d: '元素本身也是列表的列表，用来表示表格或矩阵。' },
                { t: '键函数', en: 'key function', d: '排序时用来计算比较依据的函数，例如 lambda p: p["score"]。' },
                { t: '解包', en: 'unpacking', d: '把序列元素依次赋给多个变量，如 x, y = point。' },
                { t: '稳定排序', en: 'stable sort', d: '相等元素保持原有相对顺序的排序性质。' }
              ],
              exam: '常考：元组与列表的区别（能否修改）、集合去重后的长度、推导式与等价 for 循环的对照、sorted 与 sort 的返回值差异。读嵌套列表题时先把它画成表格，再逐格填值，比在脑子里套循环可靠。',
              checklist: [
                '能说清什么时候用元组、什么时候用列表',
                '会用集合去重并判断元素是否存在',
                '能把一段 for 循环改写成列表推导式',
                '能正确遍历二维嵌套列表',
                '知道 sorted 与 sort 的返回值不同'
              ]
            }
          },
          {
            id: 'py-6-3', type: 'battle', title: '遭遇 · 叠写体', jp: '重ね書きの体', xp: 80,
            enemy: {
              name: '叠写体', kind: 'construct', hp: 100,
              title: '档案 · 重复者', taunt: '三份、五份、无穷份……哪一份才是原稿？',
              lore: '每次复制都会丢一点精度，于是它靠数量掩盖自己已经不再准确的事实。它最怕有人逐层核对。'
            },
            brief: '三份被叠写的战报锁在石台上，每份战报是一行数字，用嵌套列表表示。奈芙要你逐队求和，再从三队里找出最高总分。',
            tasks: [
              {
                prompt: '给定 rows = [[12, 8], [15, 20], [9, 7]]，用两层循环逐队求和，输出每队总分，最后输出三队中的最高总分。',
                requirement: '四行输出：三行「队伍 N 总分: X」，最后一行为「最高总分: X」。',
                expected: '队伍 1 总分: 20\n队伍 2 总分: 35\n队伍 3 总分: 16\n最高总分: 35',
                starter: 'rows = [[12, 8], [15, 20], [9, 7]]\n# 外层遍历每一队，内层累加该队分数\n',
                hints: [
                  '外层用 for i in range(len(rows)) 取到每一队的下标。',
                  '内层用 for j in range(len(rows[i])) 取到该队的每个分数，累加到 total。',
                  '每队算完后 print("队伍", i + 1, "总分:", total)，再用 if 更新 best。'
                ],
                solution: 'rows = [[12, 8], [15, 20], [9, 7]]\nbest = 0\nfor i in range(len(rows)):\n    total = 0\n    for j in range(len(rows[i])):\n        total = total + rows[i][j]\n    print("队伍", i + 1, "总分:", total)\n    if total > best:\n        best = total\nprint("最高总分:", best)',
                must: { re: 'for\\b[\\s\\S]*for\\b', text: '必须使用两层嵌套循环' }
              }
            ],
            outro: '叠写体把三份战报叠在一起，试图让你看花眼。你逐层加总，把三个数字并排放在它面前——重复的东西一旦被算清，就只剩下一个答案。',
            loot: LS.makeLoot('rare', '叠影护腕', 'armor', '◈', '护腕内侧刻着三层索引。戴上它，嵌套的层数不再让人头晕。', 'python')
          }
        ]
      },

      /* ================= 第七章 ================= */
      {
        id: 'py-7', title: '第七章 · 尘封档案塔', jp: '煤けた档案塔',
        subtitle: '数据不在内存里，它在磁盘上等你', summary: 'open/with、CSV 与 JSON、异常处理与 pathlib。',
        nodes: [
          {
            id: 'py-7-1', type: 'story', title: '打不开的门', jp: '開かざる扉', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '档案塔的门上锁着一句话：数据不在内存里，它在磁盘上等你打开。' },
              { who: '奈芙', tone: 'ally', text: 'open、with、JSON——这些不是魔法，是「把数据搬进搬出」的规矩。搬完一定要关门。' },
              { who: '档案石像', tone: 'enemy', text: '打不开的门，就不必打开。留在这里，和我一起生锈。' },
              { who: '奈芙', tone: 'ally', text: '石头不怕等，但我们怕数据丢失。先把记录读进内存，再用字典和循环去统计。' },
              { who: '界灵·零', tone: 'guide', text: '记住：读文件可能失败，解析可能失败。给失败留一条退路，程序才不会连门带塔一起塌。' }
            ]
          },
          {
            id: 'py-7-2', type: 'lesson', title: '文件、JSON 与路径', jp: '記録の搬送', xp: 40, minutes: 24,
            article: {
              lead: '程序运行时数据在内存里，关机就消失。要让它留下，就得写进文件；要让别的程序读懂，就得用 JSON 或 CSV 这类通用格式。本章讲清 open/with 的正确姿势、JSON 的序列化与反序列化、异常的分层处理，以及用 pathlib 代替手拼路径。',
              sections: [
                {
                  h: '1. open 与文件模式',
                  p: [
                    'open(路径, 模式, encoding=...) 返回文件对象。模式 "r" 读、"w" 覆盖写、"a" 追加、"x" 仅在文件不存在时创建；加 "b" 表示二进制。文本模式要显式写 encoding="utf-8"。',
                    '用 "w" 打开一个已存在的文件会立刻清空它，这是最容易误伤的破坏性操作。文件用完必须 close()，否则缓冲区可能没写回磁盘。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'f = open("battle.log", "r", encoding="utf-8")\ntext = f.read()\nf.close()\nprint(text)' }
                },
                {
                  h: '2. with：让关闭自动发生',
                  p: [
                    'with open(...) as f: 会在代码块结束时自动关闭文件，即使中途抛出异常也一样。这是 Python 资源管理的基本写法，锁、网络连接都适用。',
                    'with 可以一次打开多个文件：with open(a) as fa, open(b) as fb:。文件对象本身可迭代，for line in f 会逐行读取，比 read() 整个读进内存更适合大文件。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'with open("battle.log", "w", encoding="utf-8") as f:\n    f.write("月影 terminal online")\n\nwith open("battle.log", encoding="utf-8") as f:\n    for line in f:\n        print(line.strip())' }
                },
                {
                  h: '3. CSV：一行一条记录',
                  p: [
                    'CSV 是最朴素的表格格式：逗号分隔，第一行通常是表头。csv 模块的 DictReader 把每一行变成字典，字段名来自表头；DictWriter 反向写出。',
                    '读 CSV 时所有值都是字符串，分数要自己 int() 转换，空行和多余空格要 strip。open 时加 newline="" 能避免 Windows 下的空行问题。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import csv\n\nwith open("scores.csv", newline="", encoding="utf-8") as f:\n    for row in csv.DictReader(f):\n        print(row["name"], row["score"])' }
                },
                {
                  h: '4. JSON：把结构变成文本',
                  p: [
                    'JSON 支持对象、数组、字符串、数字、布尔与 null，正好对应字典、列表、字符串、数字、布尔与 None。json.dump/load 处理文件，json.dumps/loads 处理字符串。',
                    '中文默认会被转义成 \\uXXXX，写文件时加 ensure_ascii=False 保留可读中文。JSON 没有元组与集合：元组会被写成数组，集合会直接报错。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import json\n\nwith open("party.json", encoding="utf-8") as f:\n    data = json.load(f)\nprint(data["leader"])\n\ntext = json.dumps({"hp": 100}, ensure_ascii=False)\nprint(text)' }
                },
                {
                  h: '5. 异常：把失败分类处理',
                  p: [
                    '文件相关最常见的异常是 FileNotFoundError（路径不对或文件不存在）、PermissionError（无读写权限）、json.JSONDecodeError（内容不是合法 JSON）。',
                    '处理顺序很重要：先捕获具体异常，最后才考虑宽泛的 Exception。捕获后要给出可执行的处理方式——用空列表继续、跳过该文件并记日志，而不是 print 一句就假装没事。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import json\n\ntry:\n    with open("records.json", encoding="utf-8") as f:\n        data = json.load(f)\nexcept FileNotFoundError:\n    print("档案缺失，改用空列表")\n    data = []\nexcept json.JSONDecodeError:\n    print("档案损坏，跳过该文件")' }
                },
                {
                  h: '6. pathlib：路径也是对象',
                  p: [
                    'pathlib.Path 用 / 拼路径，跨平台且不会漏分隔符：Path("records") / "day1.json"。常用属性有 .name、.suffix、.parent，常用方法有 .exists()、.read_text()、.glob("*.json")。',
                    '不要用字符串加法拼路径，也不要把路径写死成 "C:\\Users\\name"。相对路径是相对于当前工作目录，而不是脚本所在目录；需要精确时用 Path(__file__).parent 定位。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'from pathlib import Path\n\nroot = Path("records")\npath = root / "day1.json"\nprint(path.exists())\nprint(path.suffix)\nfor p in root.glob("*.json"):\n    print(p.name)' }
                }
              ],
              terms: [
                { t: '文件对象', en: 'file object', d: 'open 返回的句柄，负责读取、写入与位置管理。' },
                { t: '上下文管理器', en: 'context manager', d: '配合 with 使用、结束时自动清理资源的对象。' },
                { t: '序列化', en: 'serialization', d: '把内存中的结构转换成可存储或传输的文本/字节格式。' },
                { t: '反序列化', en: 'deserialization', d: '把存储或传输的格式还原成内存中的对象。' },
                { t: 'CSV', en: 'comma-separated values', d: '逗号分隔的表格文本，一行一条记录，首行常为表头。' },
                { t: 'JSON', en: 'JavaScript Object Notation', d: '轻量数据交换格式，对应字典、列表与基础类型。' },
                { t: '路径', en: 'path', d: '文件或目录在文件系统中的位置，pathlib 把它封装成对象。' }
              ],
              exam: '常问：with 的作用（自动关闭）、"w" 与 "a" 的区别、json.dumps 与 json.load 的对应关系、FileNotFoundError 与 JSONDecodeError 的触发条件。注意 json.load 读文件、json.loads 读字符串，多一个 s 就是 string。',
              checklist: [
                '知道 w/a/r 三种模式的行为差异',
                '会用 with open 读写文本文件',
                '能区分 json.load 与 json.loads',
                '会捕获 FileNotFoundError 并降级处理',
                '能用 pathlib 拼路径与取后缀'
              ]
            }
          },
          {
            id: 'py-7-3', type: 'battle', title: '遭遇 · 档案石像', jp: '档案の石像', xp: 80,
            enemy: {
              name: '档案石像', kind: 'golem', hp: 100,
              title: '守卫 · 尘封', taunt: '打不开的门，就不必打开。',
              lore: '它守着一座没人来读的档案塔。石头不会累，也不会自己整理索引——所以它永远在等一个会统计的人。'
            },
            brief: '石像把四份记录散在脚下。它们已经被读进内存，是一列字典。遍历它们，把名字、分数、总分、平均分和及格人数一次算清。',
            tasks: [
              {
                prompt: '给定 records（字典列表，字段为 name 与 score），遍历输出每人的名字与分数，再统计总分、平均分（整数除法）和及格人数（60 分及以上）。',
                requirement: '六行输出：前四行「名字 分数」，第五行「总分: 310 平均: 77」，第六行「及格: 3」。',
                expected: '月影 88\n零式 75\n白川 52\n奈芙 95\n总分: 310 平均: 77\n及格: 3',
                starter: 'records = [{"name": "月影", "score": 88}, {"name": "零式", "score": 75}, {"name": "白川", "score": 52}, {"name": "奈芙", "score": 95}]\ntotal = 0\npass_count = 0\n# 遍历 records，累加分数并统计及格人数\n',
                hints: [
                  'for r in records 依次取出每个字典，r["name"] 与 r["score"] 分别取值。',
                  '把 r["score"] 累加到 total；分数大于等于 60 时让 pass_count 加一。',
                  '平均分用整数除法 total // len(records)；打印时把总分与平均放在同一行。'
                ],
                solution: 'records = [{"name": "月影", "score": 88}, {"name": "零式", "score": 75}, {"name": "白川", "score": 52}, {"name": "奈芙", "score": 95}]\ntotal = 0\npass_count = 0\nfor r in records:\n    print(r["name"], r["score"])\n    total = total + r["score"]\n    if r["score"] >= 60:\n        pass_count = pass_count + 1\nprint("总分:", total, "平均:", total // len(records))\nprint("及格:", pass_count)',
                must: { re: '\\[\\s*["\']', text: '必须使用字典的键读取记录字段' }
              }
            ],
            outro: '石像核对完最后一行数字，缓缓让开通路。它不懂平均分，但它认得「六行都对」这件事。塔内的灯一盏盏亮起，照出下一层工房的轮廓。',
            loot: LS.makeLoot('rare', '档案钥匙', 'relic', '✦', '钥匙上写着一行小字：读完记得关门。', 'python')
          }
        ]
      },

      /* ================= 第八章 ================= */
      {
        id: 'py-8', title: '第八章 · 形骸工房', jp: '形骸の工房',
        subtitle: '给数据一副会行动的身体', summary: '类、对象、__init__、self、属性、方法与封装。',
        nodes: [
          {
            id: 'py-8-1', type: 'story', title: '未初始化的人偶', jp: '未初期化の人形', xp: 20,
            lines: [
              { who: '奈芙', tone: 'ally', text: '工房里排着一列人偶，每个都有名字、HP 和攻击力——但它们的动作全都在同一段代码里。' },
              { who: '界灵·零', tone: 'guide', text: '那是只有数据、没有行为的造物。给它一个 __init__，它才记得自己是谁。' },
              { who: '空壳人偶', tone: 'enemy', text: '我是第几个？我的名字……被写在哪个变量里？' },
              { who: '奈芙', tone: 'ally', text: '类和对象不是玄学。属性是它记住的东西，方法是它能做的事。先把这两件事分开。' },
              { who: '界灵·零', tone: 'guide', text: '然后用字典验证一次：读对键，算对伤害，你就真的理解了「对象」在想什么。' }
            ]
          },
          {
            id: 'py-8-2', type: 'lesson', title: '面向对象', jp: '形骸を与える', xp: 40, minutes: 26,
            article: {
              lead: '数据一多，散落的变量和函数会互相牵制：谁都能改别人的 HP，谁也不知道一条记录该有哪些字段。面向对象把数据和操作打包成对象，用类规定「它有什么」和「它能做什么」。这一章不追求设计模式，只求你能读懂并写出第一个可靠的类。',
              sections: [
                {
                  h: '1. 从散装数据到对象',
                  p: [
                    '没有类的时候，一个角色是 name、hp、atk 三个变量，加上一堆以 hero_ 开头的函数。角色一多，命名就爆炸，参数也越传越长。',
                    '对象把状态和行为放在一起：属性保存状态，方法操作状态。类是创建对象的模板，对象是类的一次实例化。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'hero_name = "奈芙"\nhero_hp = 100\nhero_atk = 12\n\ndef attack(name, hp, atk):\n    print(name, "造成", atk, "点伤害，剩余", hp)' }
                },
                {
                  h: '2. class 与 __init__',
                  p: [
                    'class 定义类；__init__ 是初始化方法，创建对象时自动调用，用来给属性赋初值。它不是「分配内存」的构造函数——对象已经存在，只是还没填好数据。',
                    '第一个参数 self 代表正在被创建的这个对象，由 Python 自动传入，调用时不用写。忘写 self 会得到 TypeError: __init__() takes 1 positional argument but 2 were given。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Hero:\n    def __init__(self, name, hp, atk):\n        self.name = name\n        self.hp = hp\n        self.atk = atk\n\nnaifu = Hero("奈芙", 100, 12)\nprint(naifu.name)' }
                },
                {
                  h: '3. self 与属性',
                  p: [
                    'self.name = name 表示「把这个对象的名字属性设为参数 name」。左侧的 self.x 是实例属性，每个对象各一份；写在方法外、类里的变量是类属性，所有实例共享。',
                    '在方法里读属性必须写 self.hp，直接写 hp 会变成新的局部变量或报 NameError。这是初学者最常犯的错误之一。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Hero:\n    def __init__(self, name, hp):\n        self.name = name\n        self.hp = hp\n\n    def take_damage(self, amount):\n        self.hp = self.hp - amount\n        return self.hp\n\nh = Hero("奈芙", 100)\nprint(h.take_damage(30))\nprint(h.hp)' }
                },
                {
                  h: '4. 方法：对象能做的事',
                  p: [
                    '方法就是定义在类里的函数，第一个参数同样是 self。它可以读取、修改自己的属性，也可以返回计算结果。调用写成 hero.take_damage(30)。',
                    '让方法只做一件事：算伤害的方法不要顺便打印，负责展示的方法不要偷偷改血量。这样对象才能在测试和别的代码里被复用。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Hero:\n    def __init__(self, name, atk):\n        self.name = name\n        self.atk = atk\n\n    def power(self, hits):\n        return self.atk * hits\n\nprint(Hero("奈芙", 12).power(4))' }
                },
                {
                  h: '5. 封装：把规则关在门内',
                  p: [
                    'Python 没有真正的私有成员，但用命名约定表达意图：_gold 表示内部使用，__gold 会触发名称改写（name mangling）。@property 让方法以属性形式访问，可以在里面做校验。',
                    '封装的目的是「不让外部绕过规则」。如果金币只能通过 spend 减少，就不要提供直接改 _gold 的入口；余额校验必须发生在类内部。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Wallet:\n    def __init__(self, gold):\n        self._gold = gold\n\n    @property\n    def gold(self):\n        return self._gold\n\n    def spend(self, n):\n        if n > self._gold:\n            raise ValueError("星屑不足")\n        self._gold -= n\n\nw = Wallet(10)\nprint(w.gold)' }
                },
                {
                  h: '6. __str__ 与常见错误',
                  p: [
                    '__str__ 决定 print(obj) 显示什么。默认输出类似 <__main__.Hero object at 0x...>，对调试没有帮助；给它返回一句人类可读的描述。',
                    '另外两个高频错误：把可变对象（如列表）写成类属性，导致所有实例共享同一个列表；以及在 __init__ 里拼错属性名，直到访问时才报 AttributeError。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Hero:\n    def __init__(self, name):\n        self.name = name\n\n    def __str__(self):\n        return "Hero(" + self.name + ")"\n\nprint(Hero("奈芙"))' }
                }
              ],
              terms: [
                { t: '类', en: 'class', d: '描述对象属性与行为模板的定义。' },
                { t: '对象', en: 'object / instance', d: '由类创建出来的具体实体，拥有自己的属性值。' },
                { t: '方法', en: 'method', d: '定义在类中、第一个参数为 self 的函数。' },
                { t: '属性', en: 'attribute', d: '对象保存的数据，通过 self.xxx 访问。' },
                { t: '初始化方法', en: '__init__', d: '创建对象时自动调用，用于设置初始属性。' },
                { t: '封装', en: 'encapsulation', d: '把数据与校验规则收进类内部，只对外暴露安全接口。' },
                { t: 'self', en: 'self', d: '方法中指向当前对象的引用，由 Python 自动传入。' }
              ],
              exam: '常考：类与对象的区别、__init__ 的调用时机、self 的含义、实例属性与类属性的差别。读代码题时注意：给某个实例的类属性「赋值」会创建它自己的实例属性，不影响其他实例。',
              checklist: [
                '能写出带 __init__ 的类并创建对象',
                '能解释 self 的作用',
                '会定义方法读取与修改属性',
                '能说出实例属性与类属性的区别',
                '知道封装想解决什么问题'
              ]
            }
          },
          {
            id: 'py-8-3', type: 'battle', title: '遭遇 · 空壳人偶', jp: '空ろな人形', xp: 80,
            enemy: {
              name: '空壳人偶', kind: 'construct', hp: 100,
              title: '造物 · 未初始化', taunt: '我是第几个？我的名字写在哪个变量里？',
              lore: '只有属性没有行为的人偶。它能报出自己的数字，却不知道这些数字意味着什么——直到有人替它算一次结果。'
            },
            brief: '人偶照着字典里的数字行动。用字典表示奈芙与人偶的属性：先算单回合伤害，再用回合模拟得出击败它需要几回合。',
            tasks: [
              {
                prompt: '给定 hero = {"name": "奈芙", "atk": 12, "hits": 4} 与 foe = {"name": "空壳人偶", "hp": 150, "def": 6}，计算单回合伤害（atk × hits − def），输出单回合伤害、三回合后剩余 HP、以及击败它需要的回合数。',
                requirement: '三行输出：「奈芙 单回合伤害: 42」「三回合后 HP: 24」「击败需要回合: 4」。',
                expected: '奈芙 单回合伤害: 42\n三回合后 HP: 24\n击败需要回合: 4',
                starter: 'hero = {"name": "奈芙", "atk": 12, "hits": 4}\nfoe = {"name": "空壳人偶", "hp": 150, "def": 6}\n# 先算单回合伤害，再用 while 模拟回合\n',
                hints: [
                  '单回合伤害 = hero["atk"] * hero["hits"] - foe["def"]。',
                  '用一个变量保存当前 HP，while 当前 HP > 0 时每轮减一次伤害，并让回合数加一。',
                  '三回合后的剩余 HP 可以直接算 foe["hp"] - damage * 3；回合数交给 while 循环。'
                ],
                solution: 'hero = {"name": "奈芙", "atk": 12, "hits": 4}\nfoe = {"name": "空壳人偶", "hp": 150, "def": 6}\ndamage = hero["atk"] * hero["hits"] - foe["def"]\nhp = foe["hp"]\nrounds = 0\nwhile hp > 0:\n    hp = hp - damage\n    rounds = rounds + 1\nprint(hero["name"], "单回合伤害:", damage)\nprint("三回合后 HP:", foe["hp"] - damage * 3)\nprint("击败需要回合:", rounds)',
                must: { re: '\\[\\s*["\']', text: '必须用字典键读取角色属性' }
              }
            ],
            outro: '人偶听完自己的回合数，第一次没有立刻挥拳。它低下头，像在消化一个关于自己的事实。工房的地板裂开一道缝，露出向下延伸的血脉回路。',
            loot: LS.makeLoot('rare', '形骸护甲', 'armor', '◈', '甲片按属性分格，每一格都有自己的名字。', 'python')
          }
        ]
      },

      /* ================= 第九章 ================= */
      {
        id: 'py-9', title: '第九章 · 血脉回路', jp: '血脈の回路',
        subtitle: '相似的东西，共享同一条血脉', summary: '继承、super、方法重写、多态、魔术方法与 dataclass。',
        nodes: [
          {
            id: 'py-9-1', type: 'story', title: '共用的飞行回路', jp: '共有の飛翔回路', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '机蜂群共用一条血脉回路：基础型号提供飞行与受击，子型号只改写攻击方式。' },
              { who: '奈芙', tone: 'ally', text: '这就是继承。子类拿走父类的能力，再重写自己需要的部分——但不是把父类整个复制一遍。' },
              { who: '血脉机蜂', tone: 'enemy', text: '我们每一个都一样，也每一个都不同。你分得清现在是谁在攻击吗？' },
              { who: '奈芙', tone: 'ally', text: '不用分清。你只管喊「攻击」，每种单位自己决定怎么打——这就叫多态。' },
              { who: '界灵·零', tone: 'guide', text: '先用数据版的单位列表练一遍：按类型换倍率，比记住 MRO 更能说明你是否真的懂了。' }
            ]
          },
          {
            id: 'py-9-2', type: 'lesson', title: '继承与多态', jp: '血脈の書き換え', xp: 40, minutes: 26,
            article: {
              lead: '继承让「相似但不同」的东西共享代码，多态让调用者不必知道具体类型。它们是阅读框架源码的前提，也是最容易被滥用的两把工具。本章先讲清 super 与重写，再谈魔术方法与 dataclass，最后提醒一句：组合往往比继承更稳。',
              sections: [
                {
                  h: '1. 继承表达的是一种 is-a 关系',
                  p: [
                    'class Wolf(Unit) 表示 Wolf 继承 Unit：Wolf 自动拥有 Unit 的属性与方法。Unit 是父类（基类），Wolf 是子类（派生类）。',
                    '继承只应在「子类确实是父类的一种」时使用。狼是一种单位，可以；账本是一种仓库，通常不行。判断错了，后面会不断出现「这个子类不支持父类的某个方法」。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Unit:\n    def __init__(self, name, hp):\n        self.name = name\n        self.hp = hp\n\n    def describe(self):\n        return self.name + " HP " + str(self.hp)\n\nclass Beast(Unit):\n    pass' }
                },
                {
                  h: '2. super 与初始化链',
                  p: [
                    '子类定义 __init__ 时，要先调用 super().__init__(...) 完成父类初始化，再补充自己的字段。漏掉这一步，父类属性就不存在，调用父类方法时会 AttributeError。',
                    'super() 按方法解析顺序（MRO）寻找下一个类，不是简单「找父类」。单继承时可以先理解为父类；多继承时它保证每个初始化只执行一次。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Beast(Unit):\n    def __init__(self, name, hp, speed):\n        super().__init__(name, hp)\n        self.speed = speed' }
                },
                {
                  h: '3. 方法重写与多态',
                  p: [
                    '子类定义同名方法即重写（override）。调用时看对象的实际类型：同一个 attack()，Unit 返回 5，Wolf 返回 12，这就是多态。',
                    '多态的价值在于调用方只依赖接口：for u in units: print(u.attack())。新增一种单位不需要改这段循环。如果你到处写 isinstance 判断，说明多态没被用起来。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Unit:\n    def attack(self):\n        return 5\n\nclass Wolf(Unit):\n    def attack(self):\n        return 12\n\nfor u in [Unit(), Wolf()]:\n    print(u.attack())' }
                },
                {
                  h: '4. 魔术方法：让对象支持语言特性',
                  p: [
                    '以双下划线包围的方法是魔术方法：__str__ 控制显示，__len__ 支持 len()，__eq__ 支持 ==，__add__ 支持 +，__iter__ 支持 for。它们让自定义对象像内置类型一样自然。',
                    '实现了 __eq__ 通常也要考虑 __hash__（对象要放进集合或做字典键时）。__add__ 应该返回新对象而不是修改 self，否则 a + b 会偷偷改掉 a。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Gold:\n    def __init__(self, n):\n        self.n = n\n\n    def __add__(self, other):\n        return Gold(self.n + other.n)\n\n    def __str__(self):\n        return str(self.n) + "G"\n\nprint(Gold(3) + Gold(4))' }
                },
                {
                  h: '5. dataclass：少写重复代码',
                  p: [
                    '@dataclass 自动生成 __init__、__repr__ 与 __eq__，只需要写出字段和类型标注。默认值直接写在字段后面；可变默认值要用 field(default_factory=list)。',
                    'dataclass 适合「主要是数据、行为很少」的类：配置、传输对象、记录。含复杂行为或需要严格不变量的类，手写 __init__ 更清楚。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'from dataclasses import dataclass\n\n@dataclass\nclass Unit:\n    name: str\n    hp: int = 100\n\nu = Unit("奈芙")\nprint(u)\nprint(u == Unit("奈芙"))' }
                },
                {
                  h: '6. 组合优先于继承',
                  p: [
                    '如果一个对象「拥有」另一个对象，就用组合：把 Logger 作为参数传进 Service，而不是让 Service 继承 Logger。组合的依赖更浅，替换和测试都更容易。',
                    '继承层次超过三层、或子类需要大量重写父类方法时，通常说明模型有问题。先把「是什么」和「有什么」分开，再决定用哪种关系。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'class Logger:\n    def log(self, msg):\n        print("[log]", msg)\n\nclass Service:\n    def __init__(self, logger):\n        self.logger = logger\n\n    def run(self):\n        self.logger.log("run")' }
                }
              ],
              terms: [
                { t: '继承', en: 'inheritance', d: '子类自动获得父类属性与方法的机制。' },
                { t: '父类 / 子类', en: 'base class / subclass', d: '被继承的类与继承它并可能扩展行为的类。' },
                { t: '方法重写', en: 'override', d: '子类定义与父类同名的方法，替换其实现。' },
                { t: '多态', en: 'polymorphism', d: '同一调用在不同对象上产生各自实现的效果。' },
                { t: 'super', en: 'super()', d: '按 MRO 调用父类实现的入口，常用于 __init__。' },
                { t: '魔术方法', en: 'magic method', d: '双下划线包围的特殊方法，让对象支持内置语法。' },
                { t: '数据类', en: 'dataclass', d: '由装饰器自动生成初始化与比较方法的类。' }
              ],
              exam: '常考：super().__init__ 的作用、重写之后调用哪个版本、isinstance 与 type 的区别、__str__ 与 __repr__ 的用途差异。MRO 题一般只考单继承，先写出「子类 → 父类」的顺序即可。',
              checklist: [
                '能写出继承自父类的子类',
                '知道 super().__init__ 为什么必须调用',
                '能解释重写与多态的关系',
                '能说出至少三个魔术方法的用途',
                '知道什么时候该用组合而不是继承'
              ]
            }
          },
          {
            id: 'py-9-3', type: 'battle', title: '遭遇 · 血脉机蜂', jp: '血脈の機蜂', xp: 80,
            enemy: {
              name: '血脉机蜂', kind: 'drone', hp: 100,
              title: '群种 · 派生型', taunt: '我们每一个都一样，也每一个都不同。',
              lore: '同一套基础回路派生出的机群。它们共享飞行，各自改写攻击——想知道谁更强，就得按型号分别计算。'
            },
            brief: '机蜂按型号共享血脉：兽型战力翻倍，机型三倍，石型不加成。遍历单位列表，算出每种单位的有效战力，再汇总总战力与主力数量。',
            tasks: [
              {
                prompt: '给定 units（每项含 name、kind、power），按 kind 决定倍率（beast 为 2、drone 为 3、其余为 1），输出每个单位的有效战力、总战力，以及基础战力不低于 20 的单位数量。',
                requirement: '五行输出：三行「名字 有效战力: X」，然后「总战力: 115」与「主力数量: 2」。',
                expected: '影狼 有效战力: 40\n机蜂 有效战力: 45\n石像 有效战力: 30\n总战力: 115\n主力数量: 2',
                starter: 'units = [{"name": "影狼", "kind": "beast", "power": 20}, {"name": "机蜂", "kind": "drone", "power": 15}, {"name": "石像", "kind": "golem", "power": 30}]\n# 用 if/elif 决定倍率，再累加\n',
                hints: [
                  'for unit in units 遍历，unit["kind"] 决定倍率。',
                  '倍率分别是 2、3、1，有效战力是 unit["power"] * 倍率。',
                  '总战力累加；unit["power"] >= 20 时让主力计数加一。'
                ],
                solution: 'units = [{"name": "影狼", "kind": "beast", "power": 20}, {"name": "机蜂", "kind": "drone", "power": 15}, {"name": "石像", "kind": "golem", "power": 30}]\ntotal = 0\nstrong = 0\nfor unit in units:\n    if unit["kind"] == "beast":\n        rate = 2\n    elif unit["kind"] == "drone":\n        rate = 3\n    else:\n        rate = 1\n    value = unit["power"] * rate\n    total = total + value\n    if unit["power"] >= 20:\n        strong = strong + 1\n    print(unit["name"], "有效战力:", value)\nprint("总战力:", total)\nprint("主力数量:", strong)',
                must: { re: 'for\\b[\\s\\S]*elif\\b', text: '必须用循环配合多分支处理不同型号' }
              }
            ],
            outro: '机蜂群在同一个 attack() 里分裂出三种回声，你按型号逐一核对，把它们拼回一个总数。血脉没有断，只是终于被读懂了。回路尽头，织机的踏板开始自己起伏。',
            loot: LS.makeLoot('epic', '血脉回响刃', 'weapon', '✦', '挥动时只调用一个 attack()，却会响起三种不同的回声。', 'python')
          }
        ]
      },

      /* ================= 第十章 ================= */
      {
        id: 'py-10', title: '第十章 · 潜流织机', jp: '潜流の織機',
        subtitle: '按需生成，而不是一次造完', summary: '可迭代协议、yield、闭包、装饰器与上下文管理器。',
        nodes: [
          {
            id: 'py-10-1', type: 'story', title: '只吐一根线的织机', jp: '一筋だけ織る機', xp: 20,
            lines: [
              { who: '奈芙', tone: 'ally', text: '织机一次只吐一根线。你要多少，它才织多少——这就是生成器。' },
              { who: '界灵·零', tone: 'guide', text: '若一次性把整匹布织完，源核之下的内存会被撑破。惰性求值不是偷懒，是节制。' },
              { who: '溢流织者', tone: 'enemy', text: '无穷的线……你抓得住第一根，抓不住最后一根。' },
              { who: '奈芙', tone: 'ally', text: '用 yield 交出一根线就停住，下次再继续。别急着把所有的东西一次 for 完。' },
              { who: '界灵·零', tone: 'guide', text: '这一关仍用函数与循环验证：把数列交给一个函数生成，再由循环逐项取用。' }
            ]
          },
          {
            id: 'py-10-2', type: 'lesson', title: '迭代器、生成器与装饰器', jp: '潜流の術式', xp: 40, minutes: 28,
            article: {
              lead: '当数据大到不能一次装进内存，或者计算本身是无限的，「一次算完」就不成立了。迭代器与生成器把计算拆成一小步一小步，用到才继续。装饰器则是在不修改原函数的前提下，给它套一层额外行为。这三件事是读懂现代 Python 代码的关键。',
              sections: [
                {
                  h: '1. 可迭代对象与迭代器协议',
                  p: [
                    '能被 for 遍历的对象叫可迭代对象（iterable），它实现 __iter__，返回一个迭代器；迭代器实现 __next__，每次给出下一个值，取完抛 StopIteration。',
                    'iter(obj) 拿到迭代器，next(it) 取下一个值。列表、字符串、字典、文件都是可迭代对象，但它们本身不是迭代器——迭代器会被用尽，列表不会。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'nums = [1, 2, 3]\nit = iter(nums)\nprint(next(it))\nprint(next(it))\nprint(next(it))' }
                },
                {
                  h: '2. 生成器：用 yield 暂停',
                  p: [
                    '函数里出现 yield，它就不再是普通函数，而是生成器函数。调用它不会执行函数体，只返回一个生成器；每次 next() 执行到 yield 就暂停，并记住所有局部变量。',
                    '生成器适合「按需产出」：读大文件、无限序列、分批查询。它只占一份元素的内存，但只能遍历一次；需要重复使用时，要重新创建。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nfor v in countdown(3):\n    print(v)' }
                },
                {
                  h: '3. 生成器表达式与惰性求值',
                  p: [
                    '(x * x for x in data) 是生成器表达式，和列表推导式长得像，但不会立刻算出全部结果。sum(...)、any(...) 可以直接吃生成器，边算边丢。',
                    '惰性求值的代价是「只算一次」和「难调试」：直接打印生成器只会看到 <generator object ...>。需要查看内容时先 list() 出来，但那也就失去了省内存的意义。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'total = sum(x * x for x in range(1000000))\nprint(total)\n\ngen = (x for x in range(3))\nprint(next(gen))' }
                },
                {
                  h: '4. 闭包：函数记住了环境',
                  p: [
                    '内层函数引用外层函数的变量，并且外层函数返回内层函数，就形成闭包。外层变量不会随调用结束而消失，而是被内层函数保存下来。',
                    '在闭包里给外层变量赋值要写 nonlocal，否则会新建一个局部变量，外层值永远不变。闭包常用来做计数器、预配置的函数，也是装饰器的基础。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'def make_counter():\n    count = 0\n\n    def step():\n        nonlocal count\n        count += 1\n        return count\n\n    return step\n\nc = make_counter()\nprint(c(), c())' }
                },
                {
                  h: '5. 装饰器：给函数套一层壳',
                  p: [
                    '装饰器本质是「接收函数、返回新函数」的高阶函数。@decorator 写在 def 上方，等价于 func = decorator(func)。它适合日志、计时、权限校验、重试这类横切逻辑。',
                    '包装函数要用 functools.wraps 保留原函数的名字与文档；需要传参时写成三层结构（装饰器工厂）。不要在装饰器里悄悄改掉返回值，调用方会很难排查。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import functools\n\ndef log_calls(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        print("call", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper\n\n@log_calls\ndef heal(hp, amount=10):\n    return hp + amount\n\nprint(heal(50))' }
                },
                {
                  h: '6. 上下文管理器',
                  p: [
                    'with 语句依赖上下文管理器协议：进入时调用 __enter__，退出时调用 __exit__，即使发生异常也会执行清理。文件、锁、数据库连接都用它。',
                    '写自己的上下文管理器有两种方式：实现 __enter__/__exit__ 的类，或用 contextlib.contextmanager 装饰一个带 yield 的生成器。后者更短，但要保证 yield 之后才是清理逻辑。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'from contextlib import contextmanager\n\n@contextmanager\ndef section(name):\n    print("enter", name)\n    yield\n    print("exit", name)\n\nwith section("battle"):\n    print("fighting")' }
                }
              ],
              terms: [
                { t: '可迭代对象', en: 'iterable', d: '实现 __iter__、可以被 for 遍历的对象。' },
                { t: '迭代器', en: 'iterator', d: '实现 __next__、能被逐个取值并最终耗尽的游标。' },
                { t: '生成器', en: 'generator', d: '由含 yield 的函数或生成器表达式产生的惰性序列。' },
                { t: '闭包', en: 'closure', d: '内层函数连同它捕获的外层变量一起构成的函数对象。' },
                { t: '装饰器', en: 'decorator', d: '接收函数并返回新函数的高阶函数，用于附加通用行为。' },
                { t: '惰性求值', en: 'lazy evaluation', d: '真正需要时才计算下一个值，避免一次性占用内存。' },
                { t: '上下文管理器', en: 'context manager', d: '实现进入/退出协议、配合 with 自动清理资源的对象。' }
              ],
              exam: '常考：iter/next 的行为、生成器与列表推导的区别、yield 的暂停语义、装饰器的等价展开。看到「只遍历一次」「节省内存」这类描述，基本就是在考生成器；看到 @ 符号，先想 func = deco(func)。',
              checklist: [
                '能解释 for 循环背后的 iter/next',
                '会写含 yield 的生成器函数',
                '能说出生成器表达式与列表推导的差别',
                '理解闭包与 nonlocal 的作用',
                '知道装饰器等价于哪一行赋值'
              ]
            }
          },
          {
            id: 'py-10-3', type: 'battle', title: '遭遇 · 溢流织者', jp: '溢れ織り', xp: 80,
            enemy: {
              name: '溢流织者', kind: 'glitch', hp: 100,
              title: '旧系统 · 无节制', taunt: '无穷的线……你抓得住第一根，抓不住最后一根。',
              lore: '它试图一次织完整匹布，于是把源核之下的内存撑出了裂缝。要让它安静，只需证明「按需生成」也能得到正确答案。'
            },
            brief: '织机只肯按需吐线。用一个函数按需生成斐波那契数列，再逐项取用求和——不要试图一次织完整匹布。',
            tasks: [
              {
                prompt: '写一个 fib(n) 函数，返回斐波那契数列的前 n 项（从 1、1 开始）。调用 fib(8)，先输出该列表，再用循环求总和。',
                requirement: '两行输出：第一行是前八项列表，第二行是「总和: 54」。',
                expected: '[1, 1, 2, 3, 5, 8, 13, 21]\n总和: 54',
                starter: 'def fib(n):\n    seq = []\n    # 用 while 生成前 n 项\n\n# 调用并求和\n',
                hints: [
                  '用 a、b 两个变量保存相邻两项，初始都是 1。',
                  'while len(seq) < n 时 append(a)，然后依次更新 a 与 b。',
                  '用 for v in fib(8) 累加；先打印列表，再打印总和。'
                ],
                solution: 'def fib(n):\n    seq = []\n    a = 1\n    b = 1\n    while len(seq) < n:\n        seq.append(a)\n        c = a + b\n        a = b\n        b = c\n    return seq\n\nseq = fib(8)\nprint(seq)\ntotal = 0\nfor v in seq:\n    total = total + v\nprint("总和:", total)',
                must: { re: 'def\\s+fib', text: '必须定义 fib 函数' }
              }
            ],
            outro: '织者等着你一次索取无穷根线，你却只要了八根。它怔住了：原来「不够多」也可以是正确的答案。潜流归于平静，工坊的门在更深处打开。',
            loot: LS.makeLoot('epic', '潜流织梭', 'relic', '◈', '梭子一次只吐一根线，永远不为明天织布。', 'python')
          }
        ]
      },

      /* ================= 第十一章 ================= */
      {
        id: 'py-11', title: '第十一章 · 工坊契约', jp: '工房の契約',
        subtitle: '一个人写得快，一群人写得住', summary: '模块与包、虚拟环境与 pip、datetime、re、日志与单元测试。',
        nodes: [
          {
            id: 'py-11-1', type: 'story', title: '没有签名的工具', jp: '署名なき道具', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '维护者留下的工坊里，工具都包在盒子里，盒子又装进柜子——这就是模块与包。' },
              { who: '奈芙', tone: 'ally', text: '一个人写代码靠灵感，一群人写代码靠契约：依赖锁定、日志、测试。少一条，工坊就会塌。' },
              { who: '契约看守', tone: 'enemy', text: '没有签名的工具，不许带走。' },
              { who: '奈芙', tone: 'ally', text: '那就按规矩来。先 import，再建环境，然后写一条能重复运行的测试。' },
              { who: '界灵·零', tone: 'guide', text: '本章的战斗很朴素：把一段文本的字符、空格与关键字母数清。工具再花哨，也得先算对。' }
            ]
          },
          {
            id: 'py-11-2', type: 'lesson', title: '标准库与工程化', jp: '工房の作法', xp: 40, minutes: 30,
            article: {
              lead: '能跑通一次的叫脚本，能反复交付的叫工具。工程化不是玄学，而是一组很具体的习惯：把代码拆成模块与包、用虚拟环境锁住依赖、用日志代替 print、用测试证明改动没有弄坏旧功能。本章把这些习惯落到一个最小可用的水平。',
              sections: [
                {
                  h: '1. 模块与包',
                  p: [
                    '一个 .py 文件就是一个模块，import 之后用 模块名.函数名 访问。带 __init__.py 的目录是包，可以继续嵌套。from x import y 只取需要的名字，import x as alias 用来避免重名。',
                    'if __name__ == "__main__": 保证「直接运行才执行、被导入时不执行」。把入口逻辑放进去，同一个文件才能既当工具又当库。'
                  ],
                  code: { lang: 'python', runnable: false, src: '# tools/stats.py\ndef average(values):\n    return sum(values) / len(values)\n\n# main.py\nfrom tools.stats import average\nprint(average([80, 90]))' }
                },
                {
                  h: '2. 虚拟环境与依赖',
                  p: [
                    '每个项目一个虚拟环境，避免不同项目的包版本互相污染。python -m venv .venv 创建，激活后 pip install 装的包只属于这个环境。',
                    '把依赖写进 requirements.txt（pip freeze > requirements.txt），别人用 pip install -r 就能复现。不要提交 .venv 目录，也永远不要提交密钥。'
                  ],
                  code: { lang: 'python', runnable: false, src: '# 终端命令\npython -m venv .venv\nsource .venv/Scripts/activate\npip install requests\npip freeze > requirements.txt' }
                },
                {
                  h: '3. datetime：时间不是字符串',
                  p: [
                    'datetime 表示日期时间，date 只有日期，timedelta 表示时间差。now() 取当前时间，strftime 格式化输出，strptime 解析字符串。',
                    '时间加减用 timedelta：now + timedelta(days=7)。跨时区要带时区信息（timezone.utc），否则「昨天」在不同机器上会不一样。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'from datetime import datetime, timedelta\n\nnow = datetime(2026, 11, 20, 9, 30)\nprint(now.strftime("%Y-%m-%d %H:%M"))\nprint((now + timedelta(days=7)).date())' }
                },
                {
                  h: '4. 正则表达式',
                  p: [
                    're 模块用于模式匹配：re.search 找第一个，re.findall 找全部，re.sub 替换，re.match 只从开头匹配。模式里 \\d 是数字，\\w 是字母数字下划线，+ 表示一个或多个。',
                    '正则适合「格式固定」的文本，不适合解析嵌套结构（HTML、JSON 请用专门解析器）。复杂正则要配注释和测试，否则半年后没人敢改。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import re\n\ntext = "hp=87 mp=42"\npairs = re.findall(r"(\\w+)=(\\d+)", text)\nprint(pairs)\nprint(re.sub(r"\\d+", "*", text))' }
                },
                {
                  h: '5. 日志',
                  p: [
                    'logging 比 print 多出级别（DEBUG/INFO/WARNING/ERROR）、时间、模块名和输出目标。basicConfig 做最简配置，getLogger(__name__) 为每个模块建独立日志器。',
                    '库代码不要自己 basicConfig，交给应用入口统一配置；日志里不要拼敏感信息。发布版本用 INFO，排查问题再用 DEBUG。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import logging\n\nlogging.basicConfig(level=logging.INFO)\nlog = logging.getLogger("sekai")\nlog.info("battle start")\nlog.warning("hp low")' }
                },
                {
                  h: '6. 单元测试',
                  p: [
                    '单元测试是「用代码验证代码」：给一个输入，断言输出等于预期。unittest 是标准库，pytest 更简洁。测试要小、独立、可重复运行。',
                    '除了正常路径，一定要测边界：空列表、零、负数、超长字符串、非法输入。测试不能证明没有 bug，但能让改动被放心地做。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import unittest\nfrom tools.stats import average\n\nclass TestAverage(unittest.TestCase):\n    def test_empty(self):\n        with self.assertRaises(ZeroDivisionError):\n            average([])\n\n    def test_basic(self):\n        self.assertEqual(average([80, 90]), 85)\n\nif __name__ == "__main__":\n    unittest.main()' }
                }
              ],
              terms: [
                { t: '模块', en: 'module', d: '一个 .py 文件，可被 import 复用其中的名字。' },
                { t: '包', en: 'package', d: '包含 __init__.py 的目录，用点号分层组织多个模块。' },
                { t: '虚拟环境', en: 'virtual environment', d: '隔离的 Python 运行环境，避免项目间依赖版本冲突。' },
                { t: '依赖', en: 'dependency', d: '项目运行所依赖的第三方包及其版本。' },
                { t: '正则', en: 'regular expression', d: '描述文本模式的表达式，用于查找、匹配与替换。' },
                { t: '日志', en: 'logging', d: '按级别记录运行信息的机制，可输出到文件或多处。' },
                { t: '单元测试', en: 'unit test', d: '针对最小功能单元、可自动重复运行的验证代码。' }
              ],
              exam: '常考：import 的几种写法、__name__ 的作用、datetime 的格式化符号、re.findall 的返回类型、测试断言的基本形式。注意 requirements.txt 记录的是精确版本，不是「大概能用的版本」。',
              checklist: [
                '会用 import 与 from ... import',
                '能说出虚拟环境解决什么问题',
                '会用 datetime 格式化与做时间加减',
                '能写一个基础的 re.findall',
                '知道单元测试至少要覆盖哪些边界'
              ]
            }
          },
          {
            id: 'py-11-3', type: 'battle', title: '遭遇 · 契约看守', jp: '契約の番人', xp: 80,
            enemy: {
              name: '契约看守', kind: 'construct', hp: 100,
              title: '工坊 · 守卫协议', taunt: '没有签名的工具，不许带走。',
              lore: '维护者留下的自动守卫。它不判断工具好坏，只检查契约是否齐全——所以你得交出一份能被复核的结果。'
            },
            brief: '看守要求一份可核对的文本统计。给定一行终端铭文，数清总长度、非空格字符数、空格数，以及字母 L 出现的次数。',
            tasks: [
              {
                prompt: '给定 text = "Link Sekai Link"，用循环逐字符统计：输出总长度、非空格字符数、空格数、字母 L 的出现次数。',
                requirement: '四行输出：「总长: 15」「非空格字符: 13」「空格: 2」「字母 L: 2」。',
                expected: '总长: 15\n非空格字符: 13\n空格: 2\n字母 L: 2',
                starter: 'text = "Link Sekai Link"\n# 用 for 遍历字符，分别计数\n',
                hints: [
                  'for ch in text 可以逐字符遍历字符串。',
                  'ch == " " 时空格计数加一，否则非空格字符数加一。',
                  '再用一个 if ch == "L" 单独统计字母；总长直接用 len(text)。'
                ],
                solution: 'text = "Link Sekai Link"\nchars = 0\nspaces = 0\nletter = 0\nfor ch in text:\n    if ch == " ":\n        spaces = spaces + 1\n    else:\n        chars = chars + 1\n    if ch == "L":\n        letter = letter + 1\nprint("总长:", len(text))\nprint("非空格字符:", chars)\nprint("空格:", spaces)\nprint("字母 L:", letter)',
                must: { re: '(for|while)\\b', text: '必须使用循环逐字符统计' }
              }
            ],
            outro: '看守逐行核对四个数字，最后在你的工具上盖了一个印：可复核。工坊的灯全部亮起，柜子最深处那扇门后，传来编译器低沉的待机声。',
            loot: LS.makeLoot('epic', '契约之印', 'relic', '✦', '印面刻着 requirements.txt 的第一行。', 'python')
          }
        ]
      },

      /* ================= 第十二章 ================= */
      {
        id: 'py-12', title: '第十二章 · 源核之下', jp: '源核の下',
        subtitle: '把学过的一切，拼成一件能交付的作品', summary: '实战：命令行工具与成绩数据分析（终章 Boss）。',
        nodes: [
          {
            id: 'py-12-1', type: 'story', title: '最后一道校验', jp: '最後の検証', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '我们终于站在源核之下。这里没有新的语法，只有把学过的一切拼起来的重量。' },
              { who: '奈芙', tone: 'ally', text: '终末编译器只认一件事：你能不能用数据说话。统计、分类、结论——一步都不能错。' },
              { who: '源核·终末编译器', tone: 'enemy', text: '变量、循环、函数、字典……你都学过了。现在，用它们证明你理解了我。' },
              { who: '奈芙', tone: 'ally', text: '两段咏唱：先算总分与及格人数，再逐人分类输出。写完先手算一遍样例，别急着按运行。' },
              { who: '界灵·零', tone: 'guide', text: '源核之上是星海，源核之下是债务。把这份报表做干净，旧系统才肯真正睡去。' }
            ]
          },
          {
            id: 'py-12-2', type: 'lesson', title: '实战：命令行工具与数据分析', jp: '源核の演算', xp: 40, minutes: 30,
            article: {
              lead: '终章不再引入新语法，而是把列表、字典、函数、循环与条件拼成一件能交付的东西：一个小型成绩分析工具。你会看到需求如何拆成函数、数据如何校验、输出如何稳定，以及为什么「能跑」和「可信」是两件不同的事。',
              sections: [
                {
                  h: '1. 从脚本到工具',
                  p: [
                    '命令行工具的基本结构是：解析参数 → 读数据 → 计算 → 输出。argparse 负责参数、默认值与帮助信息，main() 负责把流程串起来，if __name__ == "__main__" 负责入口。',
                    '先让工具在固定数据上跑通，再接参数与文件。把「读哪里」「算什么」「怎么打印」分成三个函数，任何一部分都能单独测试。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import argparse\n\nparser = argparse.ArgumentParser()\nparser.add_argument("path")\nparser.add_argument("--min", type=int, default=60)\nargs = parser.parse_args()\nprint(args.path, args.min)' }
                },
                {
                  h: '2. 把数据读成结构',
                  p: [
                    '分析的第一步永远是「变成可计算的结构」。CSV 用 DictReader 读成字典列表，JSON 用 json.load 直接得到字典或列表。字段名要统一，类型要显式转换。',
                    '读入后立刻检查一次：条数是否为 0、分数是否在 0 到 100 之间、名字是否为空。坏数据在源头拦下，比在统计结果里发现异常便宜得多。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'import csv\n\ndef load_rows(path):\n    with open(path, newline="", encoding="utf-8") as f:\n        return [{"name": r["name"], "score": int(r["score"])}\n                for r in csv.DictReader(f)]' }
                },
                {
                  h: '3. 统计：一次遍历算完',
                  p: [
                    '总分、最高分、及格人数都可以在一次循环里完成：累加、比较、条件计数。不要为了「清晰」写四遍循环，除非数据量小到无所谓。',
                    '除法前先判空，避免 ZeroDivisionError；整数除法 // 会向下取整，展示平均分时要先想清楚是取整还是保留小数。'
                  ],
                  code: { lang: 'python', src: 'rows = [{"name": "月影", "score": 88}, {"name": "零式", "score": 75}]\ntotal = 0\nbest = 0\nfor r in rows:\n    total = total + r["score"]\n    if r["score"] > best:\n        best = r["score"]\nprint("总分:", total)\nprint("最高分:", best)\nprint("平均分:", total // len(rows))' }
                },
                {
                  h: '4. 分类输出',
                  p: [
                    '分类就是把连续分数映射到离散等级：85 以上 A，60 以上 B，其余 C。判断顺序必须从严格到宽松，否则边界分数会被前面的条件截走。',
                    '输出要稳定：固定列顺序、固定分隔符、固定小数位。给人看的报表用对齐，给机器读的结果用 CSV/JSON——不要在同一个输出里混两种用途。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'def grade(score):\n    if score >= 85:\n        return "A"\n    if score >= 60:\n        return "B"\n    return "C"\n\nfor name, score in [("月影", 88), ("白川", 52)]:\n    print(f"{name}\\t{score}\\t{grade(score)}")' }
                },
                {
                  h: '5. 可维护的结构',
                  p: [
                    '把 main 写成「编排」，不要写成三百行。每个函数只做一件事：load_rows 只负责读，summarize 只负责算，render 只负责打印。',
                    '配置（及格线、等级阈值）放在文件顶部或参数里，不要散落在 if 里。改一个数字要改很多处，是设计在报警。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'def main():\n    rows = load_rows("scores.csv")\n    stats = summarize(rows)\n    print_report(stats)\n\nif __name__ == "__main__":\n    main()' }
                },
                {
                  h: '6. 边界与交付',
                  p: [
                    '交付前问四个问题：空数据会怎样？全是 0 分呢？有重复名字呢？分数是字符串时会不会崩？把答案写成测试，比写在注释里可靠。',
                    '最后检查：异常有处理、路径有默认值、输出可复现。工具的价值不在于一次跑通，而在于别人明天也能跑通。'
                  ],
                  code: { lang: 'python', runnable: false, src: 'def average(values):\n    if not values:\n        return 0\n    return sum(values) / len(values)\n\ntry:\n    print(average([]))\nexcept ZeroDivisionError as e:\n    print("空数据", e)' }
                }
              ],
              terms: [
                { t: '参数解析', en: 'argument parsing', d: '把命令行输入解析成程序可用的参数与选项。' },
                { t: '数据校验', en: 'validation', d: '在进入计算前检查数据范围、类型与完整性。' },
                { t: '汇总统计', en: 'summary', d: '从明细数据中计算总分、均值、极值、计数等指标。' },
                { t: '分类', en: 'classification', d: '按阈值把连续数值映射到离散类别（等级、状态）。' },
                { t: '边界情况', en: 'edge case', d: '空数据、极值、非法输入等容易出错的特殊情形。' },
                { t: '可复现', en: 'reproducible', d: '同样的输入与配置，任何人都能得到同样的输出。' }
              ],
              exam: '综合题常以「读入一批记录并输出统计」出现，考三件事：遍历时同时完成多种统计、条件分支的顺序、除零与空数据的保护。写之前先手算一遍样例输出，能省掉大半调试时间。',
              checklist: [
                '能把需求拆成读入、统计、输出三段',
                '能在一次循环里完成累加与计数',
                '能正确安排 A/B/C 的判断顺序',
                '会处理空数据与除零',
                '能保证输出格式稳定可复核'
              ]
            }
          },
          {
            id: 'py-12-3', type: 'battle', title: '终战 · 源核·终末编译器', jp: '源核・終末の編譯器', xp: 160,
            enemy: {
              name: '源核·终末编译器', kind: 'dragon', hp: 100, boss: true,
              title: '首领 · 最终校验', taunt: '变量、循环、函数、字典……你都学过了。现在证明你理解了我。',
              lore: '源核之下的最后一道校验程序。它不攻击，只逐行核对你交出的结果——错一行，塔就会重新合上。'
            },
            brief: '终战有两段咏唱。第一段在一组成绩上算总分、最高分与及格人数；第二段把每位学生按等级分类输出。两段都通过，源核之下才会真正安静。',
            tasks: [
              {
                prompt: '第一击：给定 scores = [88, 62, 95, 47, 73, 58]，用一次循环算出总分、最高分和及格人数（60 分及以上），分三行输出。',
                requirement: '三行输出：「总分: 423」「最高分: 95」「及格人数: 4」。',
                expected: '总分: 423\n最高分: 95\n及格人数: 4',
                starter: 'scores = [88, 62, 95, 47, 73, 58]\ntotal = 0\nbest = 0\npass_count = 0\n# 一次循环完成三种统计\n',
                hints: [
                  '每取一个分数就累加到 total，同时用 if 更新 best。',
                  '分数大于等于 60 时让 pass_count 加一。',
                  '循环结束后分三行 print，注意标签与冒号要和预期完全一致。'
                ],
                solution: 'scores = [88, 62, 95, 47, 73, 58]\ntotal = 0\nbest = 0\npass_count = 0\nfor s in scores:\n    total = total + s\n    if s > best:\n        best = s\n    if s >= 60:\n        pass_count = pass_count + 1\nprint("总分:", total)\nprint("最高分:", best)\nprint("及格人数:", pass_count)',
                must: { re: 'for\\b[\\s\\S]*if\\b', text: '必须用循环配合条件完成统计' }
              },
              {
                prompt: '第二击：给 students 中的每位学生按分数分类：85 及以上为 A，60 及以上为 B，其余为 C。每人输出一行「名字 等级」。',
                requirement: '四行输出，名字与等级之间用一个空格分隔。',
                expected: '月影 A\n零式 B\n白川 C\n奈芙 A',
                starter: 'students = [{"name": "月影", "score": 88}, {"name": "零式", "score": 62}, {"name": "白川", "score": 47}, {"name": "奈芙", "score": 95}]\n# 遍历并按等级输出\n',
                hints: [
                  '用 for st in students 遍历字典列表，score 从 st["score"] 取。',
                  '先判断 >= 85，再判断 >= 60，最后才是 else——顺序反了边界就会错。',
                  '等级存进变量后，用 print(st["name"], grade) 输出，中间会自动有一个空格。'
                ],
                solution: 'students = [{"name": "月影", "score": 88}, {"name": "零式", "score": 62}, {"name": "白川", "score": 47}, {"name": "奈芙", "score": 95}]\nfor st in students:\n    if st["score"] >= 85:\n        grade = "A"\n    elif st["score"] >= 60:\n        grade = "B"\n    else:\n        grade = "C"\n    print(st["name"], grade)',
                must: { re: 'for\\b[\\s\\S]*elif\\b', text: '必须用循环与多分支完成分类' }
              }
            ],
            outro: '编译器逐行核对你的输出，最后一行写着：结构正确，边界未越界。源核之下的旧系统安静下来，像一台终于被理解的机器。奈芙收起刀：「第二卷，你毕业了。」',
            loot: LS.makeLoot('mythic', '源核·终焉织机', 'weapon', '☾', '它把统计、分类与输出织成同一份报表。源核之下，第一次有了可复核的答案。', 'python')
          }
        ]
      }
    );
  }

  if (LS.lang('python')) {
    extend();
  } else {
    const register = LS.registerLanguage;
    LS.registerLanguage = function (def) {
      register.call(LS, def);
      if (def && def.id === 'python') {
        LS.registerLanguage = register;
        extend();
      }
    };
  }
})(window.LS);
