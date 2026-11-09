/* C — 治疗术士 · 军营泉源 */
LS.registerLanguage({
  id: 'c',
  name: 'C',
  jp: 'シー',
  profession: '治疗术士',
  professionJp: 'ヒーラー',
  professionStyle: 'healer',
  color: '#6f9c78',
  color2: '#d8b36b',
  sigil: '愈',
  difficulty: 2,
  tagline: '离机器最近的地方，也最需要温柔。',
  role: '泉源守夜人',
  weapon: '短杖',
  element: '生',
  worldIntro: '军营建在「泉源」之上，伤员的呼吸与机器的内存共用同一条河流。治疗术士不只会包扎：他们理解每一块内存的来处与归处，所以能让倒下的生命重新站起来。',
  description: '现代计算机的基石语言。C 让你直面内存、指针与底层结构，学完之后，很多语言的「黑盒」都会变得透明。',
  chapters: [
    {
      id: 'c-1', title: '第一章 · 军营泉源', jp: '泉の野営地',
      subtitle: '让第一束治疗之光被看见', summary: '编译流程、main、printf、变量与格式说明符。',
      nodes: [
        {
          id: 'c-1-1', type: 'story', title: '污染的水源', jp: '汚れた泉', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: 'Link-Sekai 的西侧军营失去了泉源。伤员的恢复阵列正在报错，屏幕上全是看不懂的格式符。' },
            { who: '莉安', tone: 'ally', text: '我是驻营治疗术士莉安。放心，C 没有魔法那么玄。它只是把你写的指令，非常诚实地交给机器。' },
            { who: '污染史莱姆', tone: 'enemy', text: '%d…%f…你的类型对不上，伤势就无法被记录。' },
            { who: '莉安', tone: 'ally', text: '先用一条 printf 把伤员的状态写出来。记住，C 的每一句都要以分号结束。' }
          ]
        },
        {
          id: 'c-1-2', type: 'lesson', title: 'C 的编译与输出', jp: 'コンパイルと出力', xp: 30, minutes: 15,
          article: {
            lead: 'C 是一门编译型语言。你写下的代码不会直接被运行，而是先经过编译器变成机器可以执行的程序。理解这条链路，能帮你读懂大多数「为什么我的代码没反应」。',
            sections: [
              {
                h: '1. 从 .c 到可执行文件',
                p: [
                  'C 的构建通常分为四步：预处理（处理 #include、#define）、编译（C 源码 → 汇编/目标代码）、汇编（目标文件）、链接（把多个目标文件和库连接成可执行文件）。',
                  '常见编译器有 GCC、Clang、MSVC。命令行 gcc main.c -o main 会生成可执行程序。图形 IDE 只是把这些步骤包装成了按钮。'
                ],
                code: { lang: 'c', src: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, Link-Sekai\\n");\n    return 0;\n}' },
                note: 'return 0 表示程序正常结束。main 是 C 程序的入口函数。'
              },
              {
                h: '2. printf 与格式说明符',
                p: [
                  'printf 按「格式字符串」输出内容。格式字符串里的 %d 会被后面的整数替换，%f 对应浮点数，%c 对应字符，%s 对应字符串。参数顺序必须与占位符一致。',
                  '\\n 表示换行，\\t 表示制表符，%% 输出一个百分号。这些叫转义字符，必须写在字符串内部。',
                  '类型不匹配是 C 的常见坑：用 %d 输出 double，结果会不可预测。'
                ],
                code: { lang: 'c', src: 'int hp = 100;\ndouble atk = 7.5;\nprintf("HP=%d\\n", hp);\nprintf("ATK=%.1f\\n", atk);\nprintf("暴击率=100%%\\n");' },
                note: '%.1f 表示保留一位小数。%5d 表示至少占 5 个字符宽度，常用于对齐输出。'
              },
              {
                h: '3. 变量与基本类型',
                p: [
                  'C 是静态类型语言，变量必须先声明类型。常用的基本类型：int（整数）、float（单精度小数）、double（双精度小数）、char（单个字符）、long（更大整数）。',
                  '类型决定了变量占多少字节以及如何解释这段内存。sizeof(类型) 可以查看字节数，但不同平台可能不同。'
                ],
                code: { lang: 'c', src: 'int level = 3;\nfloat ratio = 0.75f;\ndouble damage = 12.5;\nchar grade = \'A\';\nprintf("%d %.2f %c\\n", level, damage, grade);' }
              },
              {
                h: '4. 声明、初始化与常量',
                p: [
                  '变量可以在声明时初始化，例如 int hp = 100;。未初始化的局部变量值不确定，直接使用是危险的。const 用来声明只读常量，例如 const double PI = 3.14159。',
                  '标识符区分大小写，不能以数字开头，不能使用关键字。推荐用小写加下划线命名变量。'
                ],
                code: { lang: 'c', src: 'const int MAX_HP = 100;\nint hp = MAX_HP;\nint damage = 18;\nhp = hp - damage;\nprintf("剩余 HP: %d\\n", hp);' }
              },
              {
                h: '5. 常见编译错误',
                p: [
                  '缺少分号、括号不匹配、变量未声明、格式说明符与参数类型不符、忘记 #include <stdio.h>，都会导致编译失败或运行异常。',
                  '编译器报错的第一行通常最关键。养成从第一个错误开始修的习惯，不要被后续的连锁报错吓到。'
                ],
                note: '本游戏终端会提取 main 中的语句执行，帮助你把注意力放在语法与逻辑上。'
              }
            ],
            terms: [
              { t: '编译器', en: 'compiler', d: '把源代码翻译成目标代码或可执行文件的程序。' },
              { t: '预处理', en: 'preprocessing', d: '编译前处理 #include、#define 等指令的阶段。' },
              { t: '链接', en: 'linking', d: '把目标文件与库组合成可执行文件的过程。' },
              { t: '主函数', en: 'main', d: 'C 程序执行的入口。' },
              { t: '格式说明符', en: 'format specifier', d: 'printf 中用于指定输出类型的占位符，如 %d、%s。' },
              { t: 'sizeof', d: 'C 运算符，返回类型或变量占用的字节数。' }
            ],
            exam: '二级 C 高频：printf 的输出、%d/%f/%c/%s 的匹配、整数除法、转义字符。注意 printf 没有自动换行，必须显式写 \\n。',
            checklist: ['能说出 C 的编译流程', '会写 main 与 printf', '能正确使用格式说明符', '知道变量必须先声明']
          }
        },
        {
          id: 'c-1-3', type: 'battle', title: '遭遇 · 污染史莱姆', jp: '汚染スライム', xp: 60,
          enemy: {
            name: '污染史莱姆', kind: 'slime', hp: 100,
            title: '影兽 · 数据污染', taunt: '你的类型……对不上。',
            lore: '它把军营的伤员记录搅成了乱码。一条格式正确的 printf，就能把第一份记录恢复出来。'
          },
          brief: '伤员记录被污染了。用一条 printf 输出两行状态：HP=100 和 ATK=7.5。',
          tasks: [
            {
              prompt: '使用 printf 输出两行：第一行 HP=100，第二行 ATK=7.5。整数用 %d，浮点数用 %.1f，并用 \\n 换行。',
              requirement: '预期输出：HP=100 / ATK=7.5',
              expected: 'HP=100\nATK=7.5',
              starter: '#include <stdio.h>\n\nint main(void) {\n    // 用一条 printf 输出两行\n    return 0;\n}\n',
              hints: [
                '格式字符串："HP=%d\\nATK=%.1f\\n"，其中 \\n 要写成反斜杠加 n。',
                '后面的参数依次给 100 和 7.5，类型要与占位符对应。',
                '完整语句：printf("HP=%d\\nATK=%.1f\\n", 100, 7.5);'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    printf("HP=%d\\nATK=%.1f\\n", 100, 7.5);\n    return 0;\n}',
              must: { re: 'printf\\s*\\(', text: '必须使用 printf 输出' }
            }
          ],
          outro: '乱码散去，第一份伤员记录重新变得清晰。史莱姆缩成一滴干净的水，军营的灯依次亮起。',
          loot: LS.makeLoot('uncommon', '泉源短杖', 'weapon', '✚', '木纹里流动着尚未分配的地址。握着它时，你会更小心地对待每一段内存。', 'c')
        }
      ]
    },
    {
      id: 'c-2', title: '第二章 · 分流战壕', jp: '分岐の塹壕',
      subtitle: '在混乱的战线上做正确的判断', summary: '运算符、条件分支、循环与流程控制。',
      nodes: [
        {
          id: 'c-2-1', type: 'story', title: '瘟疫狼的包围', jp: '疫病の狼', xp: 15,
          lines: [
            { who: '莉安', tone: 'ally', text: '战壕里的伤员越来越多，药草却只够一条路线。你需要用条件判断，把有限的资源送到最需要的地方。' },
            { who: '界灵·零', tone: 'guide', text: '先完成一次最基础的分流计算：把 1 到 50 的伤员编号加起来，确认补给队列的长度。' },
            { who: '瘟疫狼', tone: 'enemy', text: '人类总想同时救所有人。可你只有一双眼睛、一段代码。' },
            { who: '莉安', tone: 'ally', text: '所以我们才需要循环和判断。先算清楚，再救人。' }
          ]
        },
        {
          id: 'c-2-2', type: 'lesson', title: '运算符、分支与循环', jp: '演算と分岐と循環', xp: 30, minutes: 16,
          article: {
            lead: 'C 的流程控制和 Java、JavaScript 很像，但更接近机器：布尔值本质上用 0 表示假、非 0 表示真。',
            sections: [
              {
                h: '1. 算术与关系运算',
                p: [
                  '算术运算符包括 + - * / %，整数相除仍得整数。关系运算 == != > < >= <= 返回 0 或 1。逻辑运算 &&（与）、||（或）、!（非）用于组合条件。',
                  'C 中 = 是赋值，== 是比较。把 if (x == 3) 误写成 if (x = 3) 往往不会报错，却会改变 x 的值，是经典陷阱。'
                ],
                code: { lang: 'c', src: 'int a = 7, b = 3;\nprintf("%d %d\\n", a / b, a % b);\nprintf("%d\\n", a > b);\nprintf("%d\\n", a > b && b > 0);' }
              },
              {
                h: '2. if / else 与三目运算',
                p: [
                  'if 的条件为真（非 0）时执行。else 可以省略。三目运算符 条件 ? 值1 : 值2 适合简短二选一。',
                  'if 后面如果只有一条语句，花括号可以省略，但强烈建议永远保留花括号，防止后续添加代码时出现归属错误。'
                ],
                code: { lang: 'c', src: 'int hp = 35;\nif (hp <= 0) {\n    printf("倒下\\n");\n} else if (hp < 40) {\n    printf("危险\\n");\n} else {\n    printf("安全\\n");\n}\nprintf("%s\\n", hp > 0 ? "存活" : "阵亡");' }
              },
              {
                h: '3. for、while、do-while',
                p: [
                  'for 适合次数确定的循环，括号内是初始化、条件、更新。while 先判断后执行。do-while 先执行一次再判断，至少执行一次。',
                  '循环变量通常在 for 中声明。C99 之后可以在 for 的初始化部分声明 int i，现代编译器都支持。'
                ],
                code: { lang: 'c', src: 'int total = 0;\nfor (int i = 1; i <= 10; i++) {\n    total = total + i;\n}\nprintf("%d\\n", total);\n\nint n = 3;\nwhile (n > 0) {\n    printf("%d ", n);\n    n--;\n}' }
              },
              {
                h: '4. break 与 continue',
                p: [
                  'break 立即结束当前循环；continue 跳过本次剩余部分，直接进入下一次。它们只影响所在的那一层循环。',
                  '写循环前先想清楚三件事：从哪里开始、什么时候结束、每轮如何变化。三者缺一，容易死循环。'
                ],
                code: { lang: 'c', src: 'for (int i = 1; i <= 8; i++) {\n    if (i == 3) continue;\n    if (i == 6) break;\n    printf("%d\\n", i);\n}' }
              },
              {
                h: '5. 运算符优先级',
                p: [
                  '优先级大致是：括号 → 单目 → 乘除取余 → 加减 → 比较 → 逻辑与 → 逻辑或 → 赋值。拿不准就加括号，代码可读性比炫技重要。',
                  '自增自减 a++ 与 ++a 在独立语句中效果相同，但混在表达式里时顺序不同，考试常考。'
                ],
                note: 'C 的表达式求值顺序在复杂表达式中可能依赖实现，实际开发中避免在同一表达式里多次修改同一变量。'
              }
            ],
            terms: [
              { t: '关系运算', en: 'relational operator', d: '比较两个值大小或是否相等，结果为 0 或 1。' },
              { t: '逻辑运算', en: 'logical operator', d: '&&、||、!，用于组合条件。' },
              { t: '三目运算', en: 'ternary operator', d: '条件 ? 值1 : 值2 的简写分支。' },
              { t: '循环变量', en: 'loop variable', d: '控制循环次数、通常命名为 i 的变量。' },
              { t: '死循环', en: 'infinite loop', d: '终止条件永远不成立、导致程序无法退出的循环。' }
            ],
            exam: '二级 C 高频：for 循环执行次数、break/continue、= 与 ==、整数除法、逻辑表达式真假值、运算符优先级。',
            checklist: ['能写 if/else 分支', '掌握 for 与 while', '知道 break 和 continue 的区别', '理解 0 为假、非 0 为真']
          }
        },
        {
          id: 'c-2-3', type: 'battle', title: '遭遇 · 瘟疫狼', jp: '疫病の狼', xp: 60,
          enemy: {
            name: '瘟疫狼', kind: 'wolf', hp: 100,
            title: '影兽 · 扩散者', taunt: '你救得过来吗？一个，又一个，又一个……',
            lore: '它沿着战壕传播污染。用循环稳定地清点伤员编号，可以让治疗阵列重新建立秩序。'
          },
          brief: '补给队列需要精确的长度。用循环计算 1 到 50 的所有整数之和并输出。',
          tasks: [
            {
              prompt: '使用 for 或 while 循环计算 1 到 50（包含 50）的总和并输出。必须使用循环，不能直接输出答案。',
              requirement: '预期输出：1275',
              expected: '1275',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    // 用循环累加 1 到 50\n    return 0;\n}\n',
              hints: [
                '循环 for (int i = 1; i <= 50; i++)。',
                '每轮执行 total = total + i;。',
                '循环结束后 printf("%d\\n", total);。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    for (int i = 1; i <= 50; i++) {\n        total = total + i;\n    }\n    printf("%d\\n", total);\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' }
            }
          ],
          outro: '补给队列的数字停在 1275。治疗阵列重新排列成整齐的光带，瘟疫狼退入了雾里。',
          loot: LS.makeLoot('rare', '战地绷带', 'relic', '✚', '每一圈都写着一段循环条件。它提醒你：救人也要有终止条件，否则会把自己耗空。', 'c')
        }
      ]
    },
    {
      id: 'c-3', title: '第三章 · 伤员阵列', jp: '傷者の配列',
      subtitle: '用数组与函数承载更多的生命', summary: '数组、函数、作用域与传值。',
      nodes: [
        {
          id: 'c-3-1', type: 'story', title: '失控的傀儡', jp: '制御を失った傀儡', xp: 15,
          lines: [
            { who: '莉安', tone: 'ally', text: '营地里有四名伤员的治疗数据散落在阵列里。一个失控的傀儡正在胡乱读取它们。' },
            { who: '界灵·零', tone: 'guide', text: '数组让同类数据排成一列，函数让处理逻辑可以被反复调用。把四份伤害数据加起来，重建阵列的基准值。' },
            { who: '失控傀儡', tone: 'enemy', text: '索引……索引……越界了。越界了。' },
            { who: '莉安', tone: 'ally', text: 'C 不会替你检查数组边界。小心，从 0 开始数。' }
          ]
        },
        {
          id: 'c-3-2', type: 'lesson', title: '数组与函数', jp: '配列と関数', xp: 30, minutes: 19,
          article: {
            lead: '数组把所有元素连续放在内存里，函数把一段逻辑封装成可调用的单元。它们是 C 从「能算」走向「能组织」的第一步。',
            sections: [
              {
                h: '1. 数组的声明与访问',
                p: [
                  '数组用「类型 名称[长度]」声明。索引从 0 开始，最后一个元素的下标是长度减 1。例如 int a[4] 的合法下标是 0、1、2、3。',
                  'C 不会自动检查越界。访问 a[4] 不会立刻报错，却可能读到垃圾值或破坏其他内存，这是 C 危险也强大的原因。'
                ],
                code: { lang: 'c', src: 'int dmg[4] = {3, 9, 4, 7};\nprintf("%d\\n", dmg[0]);\nprintf("%d\\n", dmg[3]);\nfor (int i = 0; i < 4; i++) {\n    printf("%d ", dmg[i]);\n}' }
              },
              {
                h: '2. 遍历与常见操作',
                p: [
                  '遍历数组时，循环条件通常写 i < 长度，而不是 i <= 长度。求和、求最大值、查找元素都依赖一次完整的遍历。',
                  '数组长度在 C 中不会随数据自动变化。若需要动态长度，要使用指针与 malloc，或使用更高级的容器。'
                ],
                code: { lang: 'c', src: 'int dmg[4] = {3, 9, 4, 7};\nint total = 0;\nfor (int i = 0; i < 4; i++) {\n    total += dmg[i];\n}\nprintf("总和=%d\\n", total);' }
              },
              {
                h: '3. 函数的定义与调用',
                p: [
                  '函数由返回类型、函数名、参数列表和函数体组成。return 返回结果并结束函数。调用函数时，实参的值会复制给形参。',
                  '函数要先声明后使用。可以写函数原型（prototype）放在前面，再在下面实现，便于组织较大的程序。'
                ],
                code: { lang: 'c', src: 'int add(int a, int b);\n\nint main(void) {\n    printf("%d\\n", add(3, 5));\n    return 0;\n}\n\nint add(int a, int b) {\n    return a + b;\n}' }
              },
              {
                h: '4. 作用域与生命周期',
                p: [
                  '局部变量定义在函数或代码块内，只在其中有效；全局变量在文件范围内可见。局部变量通常存放在栈上，函数结束后失效。',
                  'static 局部变量只初始化一次，并在程序运行期间保留值。它适合保存跨调用的状态，但滥用会让代码难以测试。'
                ],
                code: { lang: 'c', src: 'void heal(void) {\n    static int count = 0;\n    count++;\n    printf("第 %d 次治疗\\n", count);\n}' }
              },
              {
                h: '5. 传值与数组参数',
                p: [
                  'C 的函数参数默认按值传递，函数内修改形参不会影响外部变量。数组作为参数时会退化为指向首元素的指针，函数内可以通过指针修改原数组内容。',
                  '这是 C 与许多高级语言的重要差异，也是后面学习指针的入口。'
                ],
                code: { lang: 'c', src: 'void addHp(int hp) {\n    hp = hp + 10;\n}\n\nvoid boost(int arr[], int n) {\n    arr[0] = arr[0] + 10;\n}' }
              }
            ],
            terms: [
              { t: '数组', en: 'array', d: '一组连续存放、类型相同的元素。' },
              { t: '下标', en: 'index', d: '数组中元素的位置编号，从 0 开始。' },
              { t: '越界', en: 'out of bounds', d: '访问了数组范围之外的内存位置。' },
              { t: '函数原型', en: 'prototype', d: '在使用前声明函数名称、参数与返回类型。' },
              { t: '局部变量', en: 'local variable', d: '定义在函数或代码块内部、只在该范围有效的变量。' },
              { t: '按值传递', en: 'pass by value', d: '调用函数时复制实参的值给形参。' }
            ],
            exam: '二级 C 高频：数组下标从 0 开始、循环边界、函数返回值、局部/全局变量作用域、数组作为参数时的退化。',
            checklist: ['会声明和遍历数组', '能避免数组越界', '会定义与调用函数', '理解按值传递']
          }
        },
        {
          id: 'c-3-3', type: 'battle', title: '遭遇 · 失控傀儡', jp: '暴走の傀儡', xp: 60,
          enemy: {
            name: '失控傀儡', kind: 'glitch', hp: 100,
            title: '造物 · 越界者', taunt: 'a[4]……a[4]……那里有什么？',
            lore: '它读到了数组边界之外的数据，逻辑开始崩坏。正确遍历四份伤害数据，能让它重新对齐。'
          },
          brief: '傀儡把四份治疗数据打乱成数组 [3, 9, 4, 7]。用数组和循环计算总和，输出基准值。',
          tasks: [
            {
              prompt: '给定数组 int dmg[4] = {3, 9, 4, 7}; 使用循环遍历并输出四个数的总和。代码中必须使用数组与循环。',
              requirement: '预期输出：23',
              expected: '23',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int dmg[4] = {3, 9, 4, 7};\n    int total = 0;\n    // 遍历数组并累加\n    return 0;\n}\n',
              hints: [
                '循环下标从 0 开始，条件是 i < 4，不能写 i <= 4。',
                '每轮把 dmg[i] 加到 total。',
                '循环结束后输出 printf("%d\\n", total);。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int dmg[4] = {3, 9, 4, 7};\n    int total = 0;\n    for (int i = 0; i < 4; i++) {\n        total = total + dmg[i];\n    }\n    printf("%d\\n", total);\n    return 0;\n}',
              must: { re: '\\[[^\\]]*\\][\\s\\S]*(for|while)\\s*\\(', text: '必须使用数组与循环' }
            }
          ],
          outro: '傀儡的索引停在 3，第一次没有越界。治疗阵列恢复成四道整齐的光柱，伤员的呼吸渐渐平稳。',
          loot: LS.makeLoot('epic', '阵列护符', 'relic', '◇', '护符由四枚下标 0 至 3 的银片串成。它不阻止越界，只提醒你边界在哪里。', 'c')
        }
      ]
    },
    {
      id: 'c-4', title: '第四章 · 腐化石像', jp: '終章・腐食の石像',
      subtitle: '越过指针，抵达生命泉源', summary: '指针、结构体、内存与文件；挑战 Boss。',
      nodes: [
        {
          id: 'c-4-1', type: 'story', title: '泉源的伤口', jp: '泉の傷', xp: 15,
          lines: [
            { who: '莉安', tone: 'ally', text: '泉源的核心被一尊腐化石像压住了。它吞掉了所有指针，让营地找不到自己的数据。' },
            { who: '界灵·零', tone: 'guide', text: '终战需要两次精准操作：先从五份伤害残响中找出最大值，再用嵌套循环画出治疗符文。' },
            { who: '腐化石像', tone: 'enemy', text: '地址……地址……你们连自己站在哪里都不知道。' },
            { who: '莉安', tone: 'ally', text: '所以我们才需要指针。它不神秘，只是一个保存地址的变量。' }
          ]
        },
        {
          id: 'c-4-2', type: 'lesson', title: '指针、结构体与内存', jp: 'ポインタと記憶', xp: 30, minutes: 24,
          article: {
            lead: '指针是 C 的灵魂，也是许多人的第一道坎。它并不玄：变量有地址，指针就是保存地址的变量。理解地址与生命周期，你就能看清程序真正占用了什么。',
            sections: [
              {
                h: '1. 取地址与解引用',
                p: [
                  '& 是取地址运算符，* 是解引用运算符。int x = 10; int *p = &x; 之后，p 保存 x 的地址，*p 表示访问该地址上的值。',
                  '指针的类型很重要：int* 表示指向整数，移动时按整数大小前进。未初始化的指针是野指针，解引用它可能导致崩溃。'
                ],
                code: { lang: 'c', src: 'int x = 10;\nint *p = &x;\nprintf("x=%d\\n", x);\nprintf("地址=%p\\n", (void*)p);\n*p = 20;\nprintf("x=%d\\n", x);', runnable: false
}
              },
              {
                h: '2. 指针与数组',
                p: [
                  '数组名在大多数表达式中会退化为指向首元素的指针。a[i] 等价于 *(a + i)。这也是为什么 C 的数组参数实际上传递的是指针。',
                  '指针可以做加减运算，但必须保证仍指向同一数组范围内，否则行为未定义。'
                ],
                code: { lang: 'c', src: 'int dmg[3] = {5, 8, 12};\nint *p = dmg;\nprintf("%d\\n", *p);\nprintf("%d\\n", *(p + 2));', runnable: false
}
              },
              {
                h: '3. 结构体',
                p: [
                  '结构体（struct）把不同类型的数据组合成一个整体，适合描述一个有多个属性的实体，例如伤员、装备、坐标。用 . 访问成员，用 -> 通过指针访问成员。',
                  'typedef 可以为结构体起一个更简洁的别名。'
                ],
                code: { lang: 'c', src: 'struct Patient {\n    int id;\n    int hp;\n};\n\nstruct Patient p = {101, 80};\nprintf("ID=%d HP=%d\\n", p.id, p.hp);', runnable: false
}
              },
              {
                h: '4. 栈与堆',
                p: [
                  '局部变量通常分配在栈上，函数返回后自动释放；malloc 分配的内存在堆上，需要手动 free 释放。忘记释放会造成内存泄漏，重复释放会造成未定义行为。',
                  '使用 malloc 后要检查是否返回 NULL。释放后把指针置为 NULL，可以减少误用。'
                ],
                code: { lang: 'c', src: 'int *arr = malloc(4 * sizeof(int));\nif (arr == NULL) {\n    printf("分配失败\\n");\n    return 1;\n}\narr[0] = 10;\nprintf("%d\\n", arr[0]);\nfree(arr);\narr = NULL;', runnable: false
}
              },
              {
                h: '5. 文件与收束',
                p: [
                  'fopen 打开文件，fclose 关闭文件。模式 "r" 读取，"w" 覆盖写入，"a" 追加。fprintf/fscanf 可以按格式读写。',
                  '学到这里，你已经触碰到 C 的底层力量：类型、数组、函数、指针、结构体、内存与文件。下一步可以学习数据结构、操作系统与嵌入式开发。'
                ],
                code: { lang: 'c', src: 'FILE *f = fopen("log.txt", "w");\nif (f != NULL) {\n    fprintf(f, "camp online\\n");\n    fclose(f);\n}', runnable: false
},
                note: '教学终端不会真的读写你的文件系统；这里只演示结构与错误检查。'
              }
            ],
            terms: [
              { t: '指针', en: 'pointer', d: '保存内存地址的变量。' },
              { t: '解引用', en: 'dereference', d: '通过指针访问其指向地址上的值，写作 *p。' },
              { t: '野指针', en: 'wild pointer', d: '未初始化或指向已释放内存的指针。' },
              { t: '结构体', en: 'struct', d: '把多个不同类型成员组合在一起的复合类型。' },
              { t: '堆', en: 'heap', d: '由程序员手动申请与释放的动态内存区域。' },
              { t: '内存泄漏', en: 'memory leak', d: '申请的内存不再使用却没有释放，导致占用持续增长。' }
            ],
            exam: '二级 C 高频：& 与 *、指针与数组的关系、结构体成员访问、malloc/free 的配对、NULL 判断。指针题先把地址画出来，再追踪每一步修改。',
            checklist: ['能解释取地址与解引用', '知道数组名与指针的关系', '会定义结构体并访问成员', '理解 malloc/free 的配对']
          }
        },
        {
          id: 'c-4-3', type: 'battle', title: '终战 · 腐化石像', jp: '腐食の石像', xp: 120,
          enemy: {
            name: '腐化石像', kind: 'golem', hp: 100, boss: true,
            title: '首领 · 记忆吞噬者', taunt: '地址失了，名字也失了。你们还剩下什么？',
            lore: '它压在泉源之上，用混乱的地址把营地切成碎片。只有精准的遍历与嵌套循环，才能重新缝合数据的路径。'
          },
          brief: '终战分两段。先找出五份伤害残响中的最大值；再用嵌套循环画出四层治疗符文。两段完成，泉源重新流动。',
          tasks: [
            {
              prompt: '第一击：给定数组 int dmg[5] = {12, 7, 19, 4, 15}; 用循环找出最大值并输出。',
              requirement: '预期输出：19',
              expected: '19',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int dmg[5] = {12, 7, 19, 4, 15};\n    int max = dmg[0];\n    // 遍历剩余元素，更新最大值\n    return 0;\n}\n',
              hints: [
                '从下标 1 开始遍历到 4：for (int i = 1; i < 5; i++)。',
                '如果 dmg[i] > max，就把 max 更新为 dmg[i]。',
                '循环结束后 printf("%d\\n", max);。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int dmg[5] = {12, 7, 19, 4, 15};\n    int max = dmg[0];\n    for (int i = 1; i < 5; i++) {\n        if (dmg[i] > max) {\n            max = dmg[i];\n        }\n    }\n    printf("%d\\n", max);\n    return 0;\n}',
              must: { re: '\\[[^\\]]*\\][\\s\\S]*(for|while)\\s*\\(', text: '必须使用数组与循环' }
            },
            {
              prompt: '第二击：用嵌套循环输出 4 行治疗符文。第 1 行 1 个加号，第 2 行 2 个，依此类推，第 4 行 4 个。每行结束后换行。',
              requirement: '预期输出 4 行，逐行增加一个 +',
              expected: '+\n++\n+++\n++++',
              starter: '#include <stdio.h>\n\nint main(void) {\n    // 外层控制行，内层控制加号数量\n    return 0;\n}\n',
              hints: [
                '外层循环 for (int i = 1; i <= 4; i++)。',
                '内层循环 for (int j = 1; j <= i; j++)，每次 printf("+");。',
                '内层结束后 printf("\\n"); 换行。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    for (int i = 1; i <= 4; i++) {\n        for (int j = 1; j <= i; j++) {\n            printf("+");\n        }\n        printf("\\n");\n    }\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\([\\s\\S]*(for|while)\\s*\\(', text: '必须使用嵌套循环' }
            }
          ],
          outro: '石像在符文的光里裂开，泉源重新涌出。莉安捧起一捧清水，递给你一枚温润的护符：「治疗术士的第一卷，完成了。记住，力量越接近底层，越要温柔。」',
          loot: LS.makeLoot('mythic', '永生泉心', 'weapon', '❖', '一枚装着微型泉眼的护符。它不增加伤害，却让你在每次失败后仍愿意再试一次。', 'c')
        }
      ]
    }
  ]
});
