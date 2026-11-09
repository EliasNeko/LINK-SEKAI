/* C — 第二卷 · 源核之下（第五章 ~ 第十二章）
 * 只新增数据，不修改第一卷的任何结构，仅在载入时把第四章标记为卷一终章。
 */
(function (LS) {
  'use strict';

  function applyCVolumeTwo(lang) {
    // 把第一卷第四章标记为卷一终章，避免出现两个「终章」
    const vol1 = lang.chapters[3];
    vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
    const vol1Last = vol1.nodes[vol1.nodes.length - 1];
    vol1Last.title = '卷一终战 · ' + vol1Last.title.replace(/^终战\s*·\s*/, '');

    lang.chapters.push(
    {
      id: 'c-5', title: '第五章 · 字符长河', jp: '文字の長河', volume: '第二卷 · 源核之下',
      subtitle: '让每一句记录都学会结尾', summary: 'char、字符串字面量、strlen/strcpy/strcmp、缓冲区与安全输入。',
      nodes: [
        {
          id: 'c-5-1', type: 'story', title: '潮声栈桥', jp: '潮鳴りの桟橋', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '泉源底下有一道向下的石阶。源核之下，旧档案库还在运转，只是所有记录都被泡进了字符潮。' },
            { who: '维护者·澪', tone: 'guide', text: '我是这里的维护者，澪。栈桥上的名字、剂量、时辰，都曾是我一格一格抄下来的。' },
            { who: '莉安', tone: 'ally', text: '潮水把记录冲成了没有结尾的句子。零说，C 的字符串需要一个看不见的终止符。' },
            { who: '字符潮灵', tone: 'enemy', text: '读到哪里……才算完……没有尽头……没有尽头……' },
            { who: '莉安', tone: 'ally', text: '先给每个字一个边界。有了终止符，潮水才知道在哪儿停下。' }
          ]
        },
        {
          id: 'c-5-2', type: 'lesson', title: '字符串与字符数组', jp: '文字列と文字配列', xp: 40, minutes: 20,
          article: {
            lead: '档案库的每一条记录都是一串字符。C 没有现成的字符串类型，它用「字符数组 + 终止符」来表示一句话。这一章把这件事讲透：怎么存、怎么量、怎么比、怎么保证不越界。',
            sections: [
              {
                h: '1. char 与字符编码',
                p: [
                  'char 是最小的整数类型，通常占 1 个字节，里面存的是字符的编码（ASCII 或扩展编码），不是字形。字符常量用单引号，字符 A 的编码是 65；字符串常量用双引号，而 “A” 实际占 2 个字节：一个 A，一个终止符。',
                  'printf 用 %c 打印字符本身，用 %d 打印它的编码。反过来，把整数赋给 char，输出的就是该编码对应的字符。这样正反两条路是理解字符类型最快的办法。'
                ],
                code: { lang: 'c', src: "char grade = 'A';\nchar mark = 65;\nprintf(\"%c %c\\n\", grade, mark);   /* A A */" },
                note: '字符用单引号，字符串用双引号。这条规则在 C 里没有例外，写错时类型会从整数变成指针。'
              },
              {
                h: '2. 字符串就是带终止符的字符数组',
                p: [
                  'C 的字符串是「以 ‘\\0’ 结尾的 char 数组」。char name[8] = "Rian"; 会把 R、i、a、n 和终止符共 5 个字节写进数组，剩下 3 个字节闲置。',
                  '所以容量必须比可见字符数多 1。忘记终止符，printf("%s") 就会一路往后读，直到在别处碰上一个 0 才停——那时它已经读进了不属于这条记录的内存。'
                ],
                code: { lang: 'c', src: 'char name[8] = "Rian";\nprintf("%s\\n", name);\nprintf("%d\\n", (int)sizeof(name));   /* 8：容量，不是字符数 */', runnable: false },
                note: 'sizeof 是编译期算出的字节数；字符数要用 strlen 在运行期数。两者不能互相替代。'
              },
              {
                h: '3. strlen、strcpy、strcmp',
                p: [
                  'string.h 提供了一组字符串函数。strlen(s) 从首地址数到第一个终止符，结果不含终止符本身；strcpy(dst, src) 连同终止符一起复制；strcmp(a, b) 逐字节比较，返回 0 表示完全相同，负数表示 a 在字典序上更小。',
                  '比较字符串不能用 ==：数组名会退化为地址，== 比的是两段内存的位置，不是内容。strcpy 不检查目标容量，目标不够就会写穿；更稳妥的写法是 snprintf，或者 strncpy 配合手动补终止符。'
                ],
                code: { lang: 'c', src: "char a[16] = \"heal\";\nchar b[16] = \"heal\";\nprintf(\"%d\\n\", (int)strlen(a));    /* 4 */\nprintf(\"%d\\n\", strcmp(a, b));      /* 0：相等 */\nstrcpy(b, \"guard\");\nprintf(\"%s\\n\", b);", runnable: false },
                note: 'strcmp 返回的是差值，不是布尔值。判断相等要写 strcmp(a, b) == 0。'
              },
              {
                h: '4. 缓冲区与越界写入',
                p: [
                  '缓冲区就是一块固定大小的数组。写入之前先算一道小学算术：可见字符数 + 1，是否不超过容量。C 不会替你检查，多写一个字节就会覆盖相邻变量。',
                  '越界写最麻烦的地方是「不立刻出错」：程序照常跑，直到某个无关变量突然变成奇怪的值。用 snprintf(dst, size, ...) 让函数自己截断，是更省心的习惯。'
                ],
                code: { lang: 'c', src: "char buf[4];\nstrcpy(buf, \"ward\");        /* 错误：4 字节放不下 w a r d 加终止符 */\n\nchar safe[8];\nsnprintf(safe, sizeof(safe), \"%s\", \"ward\");\nprintf(\"%s\\n\", safe);", runnable: false },
                note: '写字符串前先问一句：这块内存里，终止符睡在哪个格子里？'
              },
              {
                h: '5. 安全输入：fgets 与宽度限制',
                p: [
                  '交互输入是最容易出事故的地方。scanf("%s", buf) 没有长度上限，输入多长就写多长；scanf("%7s", buf) 加了宽度限制，至少不会写穿一块 8 字节的缓冲区。',
                  'fgets(buf, size, stdin) 最多读 size - 1 个字符，自动补终止符，并保留行尾换行。标准处理步骤：先检查返回值是否为 NULL，再用 strcspn 找换行位置并改成终止符，最后才使用。'
                ],
                code: { lang: 'c', src: "char line[32];\nif (fgets(line, sizeof(line), stdin) != NULL) {\n    line[strcspn(line, \"\\n\")] = '\\0';\n    printf(\"读入:%s\\n\", line);\n}", runnable: false },
                note: '返回 NULL 表示读到文件末尾或出错，此时缓冲区内容不可用，不要继续读它。'
              },
              {
                h: '6. 常见错误与检查顺序',
                p: [
                  '这一章的错误几乎都能归成三类：终止符丢了、长度算错了、把地址当成内容比较了。排查时按顺序问自己三个问题。',
                  '第一，缓冲区容量够不够放下内容加终止符？第二，这个字符串一定以终止符结尾吗？第三，库函数的返回值检查了吗？三个问题都答完，绝大多数字符串 bug 会自己浮出来。'
                ],
                note: '把「容量、长度、终止符」三个词写在便签上，写字符串代码前看一眼，能省掉大半调试时间。'
              }
            ],
            terms: [
              { t: '字符类型', en: 'char', d: '占 1 字节的整数类型，存放字符的编码而不是字形。' },
              { t: '字符串字面量', en: 'string literal', d: '双引号包住的一串字符，末尾自动带一个终止符。' },
              { t: '终止符', en: 'null terminator', d: '编码为 0 的字符，标志字符串在这里结束。' },
              { t: '字符串长度', en: 'strlen', d: '从首地址数到终止符之前的字符个数，不含终止符。' },
              { t: '字符串比较', en: 'strcmp', d: '逐字节比较两个字符串，返回 0 表示相等。' },
              { t: '缓冲区溢出', en: 'buffer overflow', d: '写入超过缓冲区容量的数据，覆盖相邻内存。' },
              { t: '安全读取', en: 'fgets', d: '带容量上限的输入函数，最多读取 size - 1 个字符。' }
            ],
            exam: '二级 C 与面试常考：strlen 与 sizeof 的区别、终止符的位置、strcmp 返回值的含义、字符数组容量是否够、为什么不能用 == 比较字符串。做题时先把数组画成一排格子，把终止符那一格标出来。',
            checklist: [
              '能说清 char、字符常量与字符串常量的区别',
              '知道字符串为什么必须有一个终止符',
              '会用 strlen / strcpy / strcmp 并看懂返回值',
              '能给缓冲区留出终止符的位置',
              '会用 fgets 安全读取一行并去掉换行'
            ]
          }
        },
        {
          id: 'c-5-3', type: 'battle', title: '遭遇 · 字符潮灵', jp: '文字の潮霊', xp: 80,
          enemy: {
            name: '字符潮灵', kind: 'wraith', hp: 100,
            title: '影兽 · 无终之句', taunt: '再读一点……再读一点……哪里才算完？',
            lore: '它由没有结尾的句子聚成，读到哪里都不肯停。给出明确的边界与计数，潮水才会退回河道。'
          },
          brief: '档案库的八条记录长度被字符潮打乱。用数组与循环统计：一共多少条，其中长度不小于 10 的有几条。',
          tasks: [
            {
              prompt: '给定 int len[8] = {3, 12, 7, 20, 5, 18, 9, 14}; 用循环统计总条目数并输出「总条目=8」，再统计长度大于等于 10 的记录数并输出「长记录=4」。必须使用数组与循环，不能直接打印数字。',
              requirement: '预期输出两行：总条目=8 / 长记录=4',
              expected: '总条目=8\n长记录=4',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int len[8] = {3, 12, 7, 20, 5, 18, 9, 14};\n    int total = 0;\n    int over = 0;\n    // 遍历数组：total 累计条目数，over 统计长度 >= 10 的记录\n    return 0;\n}\n',
              hints: [
                '循环写成 for (int i = 0; i < 8; i++)，下标只能到 7，不能写 i <= 8。',
                '每轮先 total = total + 1;，再用 if (len[i] >= 10) 判断是否让 over 加一。',
                '最后 printf("总条目=%d\\n", total); 与 printf("长记录=%d\\n", over); 各输出一行。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int len[8] = {3, 12, 7, 20, 5, 18, 9, 14};\n    int total = 0;\n    int over = 0;\n    for (int i = 0; i < 8; i++) {\n        total = total + 1;\n        if (len[i] >= 10) {\n            over = over + 1;\n        }\n    }\n    printf("总条目=%d\\n", total);\n    printf("长记录=%d\\n", over);\n    return 0;\n}',
              must: { re: '\\[[^\\]]*\\][\\s\\S]*(for|while)\\s*\\(', text: '必须使用数组与循环' }
            }
          ],
          outro: '数字停在 8 与 4。字符潮退下去，露出一排整齐的格子，每一格末尾都有一枚安静的终止符。澪把第一本档案放回架上，很轻地说了声谢谢。',
          loot: LS.makeLoot('rare', '潮声字符匣', 'relic', '≈', '匣底刻着一枚看不见的终止符。每当你写下一串字符，它都会提醒：该收尾了。', 'c')
        }
      ]
    },
    {
      id: 'c-6', title: '第六章 · 地址回廊', jp: 'アドレスの回廊', volume: '第二卷 · 源核之下',
      subtitle: '顺着门牌走到记忆的门口', summary: '地址与解引用、指针运算、指针与数组、const 与悬垂指针。',
      nodes: [
        {
          id: 'c-6-1', type: 'story', title: '没有门牌的走廊', jp: '番地のない廊下', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '档案库的走廊没有门牌，只有地址。走错一格，就走进别人的记忆里去了。' },
            { who: '维护者·澪', tone: 'guide', text: '我在这儿走了三百年。指针不过是把门牌号记在手里的纸条——可纸条也会写错，写错了就再也找不回来。' },
            { who: '莉安', tone: 'ally', text: '那就先学会读门牌，再学着走过去。' },
            { who: '回廊守卫', tone: 'enemy', text: '你手里的纸条……指向谁的记忆？说清楚，否则不许通过。' },
            { who: '澪', tone: 'guide', text: '先用下标看清位置，再做交换。知道东西在哪儿，比会背咒语重要。' }
          ]
        },
        {
          id: 'c-6-2', type: 'lesson', title: '指针深入', jp: 'ポインタの深み', xp: 40, minutes: 24,
          article: {
            lead: '上一章我们说「数组名会退化为地址」，这一章把地址本身讲清楚。指针不是魔法，它只是一个保存地址的变量；难点在于你要在脑子里同时维护「值」和「值在哪里」。',
            sections: [
              {
                h: '1. 地址、指针与解引用',
                p: [
                  '每个变量都占一块内存，&x 取出它的地址。指针变量用来保存地址，int *p = &x; 读作「p 指向 x」。*p 是解引用，表示访问该地址上的值，既可以读也可以写。',
                  '指针有类型，因为它要决定两件事：一次移动多少字节，以及如何解释这块内存。打印地址用 %p，并转成 void * 更规范，因为不同平台的地址宽度不一样。'
                ],
                code: { lang: 'c', src: 'int x = 10;\nint *p = &x;\nprintf("%d\\n", x);      /* 10 */\n*p = 20;\nprintf("%d\\n", x);      /* 20：通过指针改了原变量 */', runnable: false },
                note: '未初始化的指针保存的是随机地址，叫野指针。声明时就该给它 NULL 或一个真实地址。'
              },
              {
                h: '2. 指针运算以元素为单位',
                p: [
                  '指针加减以「所指类型的大小」为单位。int *p 指向 a[0]，p + 1 就前进一个 int，而不是一个字节。两个指向同一数组的指针相减，得到的是它们之间隔着几个元素。',
                  '指针运算只在同一数组（或末尾后一位）范围内有意义。越过边界再解引用是未定义行为：可能读到别的变量，也可能当场崩溃。'
                ],
                code: { lang: 'c', src: 'int a[5] = {10, 20, 30, 40, 50};\nint *p = a;\nprintf("%d\\n", *(p + 2));         /* 30 */\nprintf("%d\\n", (int)(p + 4 - p));  /* 4，元素个数 */', runnable: false },
                note: '*(p + i) 与 p[i] 完全等价。前者说明指针的本质，后者更适合日常阅读。'
              },
              {
                h: '3. 指针与数组的分界',
                p: [
                  '数组名在大多数表达式里会退化为指向首元素的指针，所以 a[i] 等价于 *(a + i)。但数组名本身不是变量，不能对它赋值，sizeof(a) 得到的仍是整个数组的字节数。',
                  '把数组传给函数时，传的其实是首地址。函数里 sizeof(a) 得到的是指针大小，不是数组大小——所以数组参数必须额外传一个长度。'
                ],
                code: { lang: 'c', src: 'void zero(int a[], int n) {\n    for (int i = 0; i < n; i++) {\n        a[i] = 0;\n    }\n}\n\nint dmg[3] = {5, 8, 12};\nzero(dmg, 3);   /* 原数组被清零，因为传进去的是首地址 */', runnable: false },
                note: '参数写成 int a[] 只是写法上的方便，它和 int *a 是同一个意思。'
              },
              {
                h: '4. const 与指针的四种组合',
                p: [
                  'const 放在 * 左边，锁的是「指向的值」；放在 * 右边，锁的是「指针本身」。const int *p：不能通过 p 改值，但 p 可以改指向；int * const p：p 不能再指向别处，但可以改值；两个位置都写 const，则两者都锁。',
                  '函数参数里写 const int *arr，是在向调用者承诺「我只读」。这是一条很便宜、也很有效的接口约定。'
                ],
                code: { lang: 'c', src: 'int hp = 100;\nconst int *readOnly = &hp;   /* *readOnly = 1; 编译错误 */\nint * const fixed = &hp;     /* fixed = &other; 编译错误 */\n*fixed = 80;                 /* 合法：改的是值 */\nprintf("%d\\n", hp);', runnable: false },
                note: '看 const 的位置时，从右往左读：先看它是 const 指针，还是指向 const 的指针。'
              },
              {
                h: '5. 空指针、野指针与悬垂指针',
                p: [
                  'NULL 表示「不指向任何地方」，解引用它一定出错。悬垂指针指向已经释放的内存，看起来像个有效地址，用起来却是未定义行为。野指针则是从未初始化的指针。',
                  '两条纪律：使用前检查 NULL；free 之后立刻把指针置为 NULL。另外不要返回局部变量的地址——函数一返回，那块栈内存就失效了。'
                ],
                code: { lang: 'c', src: 'int *p = NULL;\nif (p != NULL) {\n    printf("%d\\n", *p);\n}\n\nint *q = malloc(sizeof(int) * 4);\nfree(q);\nq = NULL;    /* 防止悬垂 */', runnable: false },
                note: 'free(NULL) 是安全的，什么也不会发生；不必为它加判断。'
              },
              {
                h: '6. 常见错误与画图法',
                p: [
                  '指针题出错，多半是心里没有图。养成习惯：在纸上画一排格子，格子里写值，指针画成箭头；每次赋值或解引用之后，立刻更新箭头指向谁。',
                  '四个高频错误：忘记写 & 或 *、类型不匹配、越界做指针运算、释放之后继续使用。写代码时把每一步「箭头指向谁」念出来，错误会明显变少。'
                ],
                note: '指针本身也是一个变量，它自己也有地址（那就是二级指针）。但在学会用它之前，不必急着学二级指针。'
              }
            ],
            terms: [
              { t: '指针', en: 'pointer', d: '保存内存地址的变量，类型决定如何解释那块内存。' },
              { t: '取地址', en: 'address-of', d: '一元运算符 &，得到变量的内存地址。' },
              { t: '解引用', en: 'dereference', d: '通过指针访问其指向地址上的值，写作 *p。' },
              { t: '指针运算', en: 'pointer arithmetic', d: '指针加减以所指类型的大小为单位，只在同一数组内可靠。' },
              { t: '空指针', en: 'null pointer', d: '值为 NULL、不指向任何对象的指针，解引用即错误。' },
              { t: '悬垂指针', en: 'dangling pointer', d: '指向已释放内存的指针，使用它是未定义行为。' },
              { t: '常量指针', en: 'pointer to const', d: 'const 修饰指向的值，指针本身仍可改变指向。' }
            ],
            exam: '二级 C 高频：*p++ 与 (*p)++ 的区别、数组名与指针的关系、数组做参数后 sizeof 的结果、const 修饰位置的含义、free 之后指针的状态。做选择题时先确定「这个 * 是在解引用还是在声明指针」。',
            checklist: [
              '能解释 & 与 * 的含义与配对使用',
              '能画出指针指向图并追踪每一步修改',
              '知道 a[i] 与 *(a + i) 等价',
              '分得清 const 放在 * 左边和右边的区别',
              '会避免野指针、悬垂指针与越界指针运算'
            ]
          }
        },
        {
          id: 'c-6-3', type: 'battle', title: '遭遇 · 回廊守卫', jp: '回廊の番人', xp: 80,
          enemy: {
            name: '回廊守卫', kind: 'golem', hp: 100,
            title: '造物 · 门牌错位', taunt: '你手里的纸条，指向谁的记忆？',
            lore: '它把五份生命值登记成了错位的门牌，首尾互换了位置。把这两块记忆换回去，回廊才会放行。'
          },
          brief: '守卫把五份生命值登记成 [40, 90, 15, 70, 25]，首尾的门牌被对调。用下标交换首尾两个元素，再按顺序输出整行。',
          tasks: [
            {
              prompt: '给定 int hp[5] = {40, 90, 15, 70, 25}; 借助一个临时变量交换 hp[0] 与 hp[4]，然后用循环按顺序输出这五个数，数字之间一个空格，最后换行。',
              requirement: '预期输出：25 90 15 70 40',
              expected: '25 90 15 70 40',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int hp[5] = {40, 90, 15, 70, 25};\n    // 1. 用临时变量交换 hp[0] 与 hp[4]\n    // 2. 用循环依次输出五个数，数字之间一个空格\n    return 0;\n}\n',
              hints: [
                '交换需要三步，顺序不能乱：tmp = hp[0]; hp[0] = hp[4]; hp[4] = tmp;',
                '遍历用 for (int i = 0; i < 5; i++)，循环体里 printf("%d ", hp[i]);',
                '循环结束后单独写 printf("\\n"); 换行，不要漏掉这一句。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int hp[5] = {40, 90, 15, 70, 25};\n    int tmp = hp[0];\n    hp[0] = hp[4];\n    hp[4] = tmp;\n    for (int i = 0; i < 5; i++) {\n        printf("%d ", hp[i]);\n    }\n    printf("\\n");\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环遍历数组' }
            }
          ],
          outro: '首尾的门牌归位，回廊的灯一盏接一盏亮起。澪说：交换看着简单，可只要少写一步，两边的记忆就都丢了。',
          loot: LS.makeLoot('rare', '回廊指针', 'weapon', '→', '杖身刻满地址，握久了会明白：方向比力气更重要，位置比速度更可靠。', 'c')
        }
      ]
    },
    {
      id: 'c-7', title: '第七章 · 堆心苗圃', jp: '堆の苗床', volume: '第二卷 · 源核之下',
      subtitle: '借来的土地，也要归还', summary: 'malloc/calloc/realloc/free、内存泄漏与常见错误。',
      nodes: [
        {
          id: 'c-7-1', type: 'story', title: '不够用的架子', jp: '足りない棚', xp: 20,
          lines: [
            { who: '维护者·澪', tone: 'guide', text: '苗圃里的架子是固定的，可伤员每天都在变多。昨天还有三个空格，今天已经塞满了。' },
            { who: '界灵·零', tone: 'guide', text: '这就是动态内存：需要时向系统借一块地，用完必须还。借与还都记在你名下。' },
            { who: '莉安', tone: 'ally', text: '借了不还，泉源会被慢慢堵死。我在军营见过那种病人——不是伤重，是被自己的记录压垮的。' },
            { who: '漏囊之影', tone: 'enemy', text: '你们借的……都还了吗……我记得每一笔……每一笔……' },
            { who: '莉安', tone: 'ally', text: '先用定长的格子把「什么时候扩容」演练一遍，再去碰真正的堆。' }
          ]
        },
        {
          id: 'c-7-2', type: 'lesson', title: '动态内存与所有权', jp: '動的記憶と所有', xp: 40, minutes: 22,
          article: {
            lead: '栈上的内存由编译器管理，函数一走就没了。要让数据活得更久、大小随时可变，就得向堆借内存。借与还都由你负责，这也是 C 最容易出事的地方。',
            sections: [
              {
                h: '1. 栈与堆的分工',
                p: [
                  '局部变量在栈上，随函数调用自动分配、自动释放，速度快、容量小。malloc 系列函数在堆上申请内存，大小可以在运行时决定，但必须手动 free。',
                  '要记住归属关系：谁 malloc，谁负责 free。函数如果把指针交出去，就要在注释或文档里写清楚「调用者负责释放」，否则两边都会以为对方会管。'
                ],
                code: { lang: 'c', src: 'void demo(void) {\n    int local = 10;                       /* 栈：函数返回即失效 */\n    int *heap = malloc(sizeof(int) * 4);  /* 堆：需要 free */\n    if (heap != NULL) {\n        heap[0] = local;\n        free(heap);\n    }\n}', runnable: false },
                note: '栈内存的地址通常在高位、向低增长，堆在低位、向高增长；这个方向感能帮你理解「两块内存为什么不会撞上」。'
              },
              {
                h: '2. malloc：申请、检查、使用',
                p: [
                  'malloc(n) 申请 n 个字节，返回 void *，失败时返回 NULL。标准三步：申请、检查、赋给同类型指针。',
                  '申请到的内容是不确定的垃圾值，不要假设它是 0。大小用 sizeof(类型) * 个数 计算，比手写数字安全得多。'
                ],
                code: { lang: 'c', src: 'int *arr = malloc(8 * sizeof(int));\nif (arr == NULL) {\n    printf("分配失败\\n");\n    return 1;\n}\narr[0] = 42;\nprintf("%d\\n", arr[0]);\nfree(arr);', runnable: false },
                note: 'C 不要求对 malloc 的返回值做强转，但检查 NULL 一定要做。'
              },
              {
                h: '3. calloc 与 realloc',
                p: [
                  'calloc(n, size) 会把整块内存清零，适合计数数组和字符串缓冲区。realloc(p, newSize) 把原来的块调整大小：能原地扩就原地扩，不能就搬到新地址，并可能复制旧内容。',
                  'realloc 的返回值必须先用临时指针接住。如果直接写 p = realloc(p, ...) 而它返回 NULL，原来的 p 就丢了，那块内存再也 free 不掉。'
                ],
                code: { lang: 'c', src: 'int *a = calloc(4, sizeof(int));          /* 全部为 0 */\nint *bigger = realloc(a, 8 * sizeof(int));\nif (bigger == NULL) {\n    free(a);      /* 扩容失败时，原块仍然有效 */\n    return 1;\n}\na = bigger;', runnable: false },
                note: 'realloc(p, 0) 的行为在旧标准里不确定，需要「清空」时直接 free 更清楚。'
              },
              {
                h: '4. free：配对、重复释放与释放后使用',
                p: [
                  'free(p) 归还整块内存，参数必须是 malloc/calloc/realloc 返回的原始地址，不能加偏移。释放之后指针变成悬垂指针，再解引用或再 free 都是未定义行为。',
                  '结构体里的指针成员要单独释放，否则外层释放了、里层却泄漏了。释放顺序与被包含关系相反：先释放内部，再释放外层。'
                ],
                code: { lang: 'c', src: 'int *p = malloc(sizeof(int));\nif (p == NULL) return 1;\n*p = 7;\nfree(p);\nfree(p);      /* 错误：重复释放 */\np = NULL;', runnable: false },
                note: 'free 只归还内存，不会改写你的指针，也不会把它自动置空。置空这一步必须自己写。'
              },
              {
                h: '5. 内存泄漏与容量策略',
                p: [
                  '内存泄漏指申请了却再也找不到、也没有归还的块。表现是程序越跑越胖，最后被系统杀掉。常见原因：中途 return 没释放、错误分支漏了 free、指针被覆盖后原地址丢失。',
                  '动态容器通常维护两个数字：size（已用）与 capacity（容量）。容量不够时按倍数扩容：新容量 = 旧容量 × 2，再 realloc。倍增让插入的均摊代价保持在常数级别。'
                ],
                code: { lang: 'c', src: 'if (v->size == v->cap) {\n    int next = v->cap == 0 ? 1 : v->cap * 2;\n    int *tmp = realloc(v->data, next * sizeof(int));\n    if (tmp == NULL) return 0;\n    v->data = tmp;\n    v->cap = next;\n}', runnable: false },
                note: '扩容前先算清楚新容量，别在 realloc 的参数里临时写表达式——失败时你连原容量都算不回来。'
              },
              {
                h: '6. 常见错误清单',
                p: [
                  '按顺序自查：每个 malloc 是否都有对应的 free？每个错误分支是否释放了已经申请的内存？realloc 是否用临时指针接住？free 之后是否置 NULL？有没有释放栈上的地址？',
                  '调试工具能帮大忙：Valgrind、AddressSanitizer 会在越界或泄漏发生时直接指出行号。养成在 -fsanitize=address 下跑一遍的习惯，比靠眼睛找快得多。'
                ],
                note: '本游戏的终端不执行 malloc。练习时先用定长数组模拟 size/capacity，把逻辑写对，再换成真实的堆操作。'
              }
            ],
            terms: [
              { t: '堆', en: 'heap', d: '由程序员手动申请与释放的动态内存区域。' },
              { t: 'malloc', en: 'memory allocate', d: '申请指定字节数、内容未初始化的内存块。' },
              { t: 'calloc', en: 'contiguous allocate', d: '申请内存并全部清零，参数是元素个数与单个大小。' },
              { t: 'realloc', en: 'reallocate', d: '调整已申请内存块的大小，可能搬移并复制旧内容。' },
              { t: 'free', en: 'free', d: '归还整块堆内存，必须传入原始地址且只能调用一次。' },
              { t: '内存泄漏', en: 'memory leak', d: '申请的内存不再使用却没有释放，占用持续增长。' },
              { t: '容量', en: 'capacity', d: '容器当前能容纳的元素个数，与已用数量 size 不同。' }
            ],
            exam: '二级 C 高频：malloc 的参数与返回值、calloc 与 malloc 的区别、realloc 失败时原指针是否仍有效（有效）、free(NULL) 是否安全（安全）、如何判断存在内存泄漏。答题时按「申请—检查—使用—释放」四步写。',
            checklist: [
              '能说清栈与堆的分配与释放责任',
              '会写 malloc + NULL 检查 + free 的标准流程',
              '知道 calloc 与 realloc 的区别与陷阱',
              '理解 size 与 capacity 的关系',
              '能列出至少四种内存错误并说明后果'
            ]
          }
        },
        {
          id: 'c-7-3', type: 'battle', title: '遭遇 · 漏囊之影', jp: '漏れ袋の影', xp: 80,
          enemy: {
            name: '漏囊之影', kind: 'slime', hp: 100,
            title: '影兽 · 只借不还', taunt: '你们借的……都还了吗？我记得每一笔。',
            lore: '它把苗圃的架子撑大又忘了收回，内存一块块漏下去。用定长数组演练一次「什么时候扩容」，就能看清借与还的节奏。'
          },
          brief: '苗圃的架子是定长的。用一块容量为 8 的数组模拟动态容器：起点容量 2，装不下就把容量翻倍，依次装入六份样本。',
          tasks: [
            {
              prompt: '给定 int data[6] = {4, 8, 15, 16, 23, 42}; 用定长数组 buf[8] 模拟动态容器：size 从 0 开始、cap 从 2 开始；每装入一个元素之前，若 size 等于 cap 就把 cap 翻倍。最后输出 size=6 与 cap=8 两行。',
              requirement: '预期输出：size=6 / cap=8',
              expected: 'size=6\ncap=8',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int buf[8] = {0};\n    int size = 0;\n    int cap = 2;\n    int data[6] = {4, 8, 15, 16, 23, 42};\n    // 逐个装入：容量不够就先翻倍\n    return 0;\n}\n',
              hints: [
                '外层循环 for (int i = 0; i < 6; i++) 遍历 data。',
                '每轮先判断 if (size == cap) { cap = cap * 2; }，再把 data[i] 写进 buf[size]，最后 size++。',
                '循环结束后输出 printf("size=%d\\n", size); 与 printf("cap=%d\\n", cap);。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int buf[8] = {0};\n    int size = 0;\n    int cap = 2;\n    int data[6] = {4, 8, 15, 16, 23, 42};\n    for (int i = 0; i < 6; i++) {\n        if (size == cap) {\n            cap = cap * 2;\n        }\n        buf[size] = data[i];\n        size++;\n    }\n    printf("size=%d\\n", size);\n    printf("cap=%d\\n", cap);\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\([\\s\\S]*if\\s*\\(', text: '必须使用循环与容量判断' }
            }
          ],
          outro: '容量从 2 撑到 8，一格也没漏。漏囊之影缩成一小袋清水，被澪收进架子最下层——她说，借来的东西，总要放回原位。',
          loot: LS.makeLoot('rare', '苗圃容量袋', 'armor', '▤', '袋口缝着 size 与 capacity 两个数字。装得下，也放得回，才算真正拥有。', 'c')
        }
      ]
    },
    {
      id: 'c-8', title: '第八章 · 名录之匣', jp: '名簿の匣', volume: '第二卷 · 源核之下',
      subtitle: '把散落的字段绑成一个整体', summary: 'struct、typedef、嵌套、位域、联合体与枚举。',
      nodes: [
        {
          id: 'c-8-1', type: 'story', title: '散开的名册', jp: 'ほどけた名簿', xp: 20,
          lines: [
            { who: '维护者·澪', tone: 'guide', text: '每个伤员都有名字、编号、血型、剂量。这些东西必须被绑在一起，否则记录会走散。' },
            { who: '界灵·零', tone: 'guide', text: 'C 用结构体把不同字段合成一个整体；用联合体让几种解释共享同一块内存。' },
            { who: '莉安', tone: 'ally', text: '可在终端里，我们先用几条平行的数组把关系理清——同一份名单，同一个下标。' },
            { who: '名录魇', tone: 'enemy', text: '分开的……永远分开的……编号是编号，名字是名字……' },
            { who: '莉安', tone: 'ally', text: '那就让下标把它们重新对齐。对齐了，名册就还是一本名册。' }
          ]
        },
        {
          id: 'c-8-2', type: 'lesson', title: '结构体、联合体与枚举', jp: '構造体と共用体', xp: 40, minutes: 22,
          article: {
            lead: '伤员有编号、姓名、血型、剂量——这些字段必须绑在一起才有意义。结构体是 C 用来描述「一个东西」的工具；联合体让多个字段共享同一块内存；枚举则给一组数字起名字。',
            sections: [
              {
                h: '1. struct：把字段绑在一起',
                p: [
                  'struct 定义一种新类型，成员可以是任意类型。定义只是画图纸，声明变量才会真正分配内存。',
                  '访问成员用 . ，通过指针访问用 -> 。成员在内存里按声明顺序排列，中间可能插入对齐填充，所以结构体的大小通常不等于成员大小之和。'
                ],
                code: { lang: 'c', src: 'struct Patient {\n    int id;\n    int hp;\n    char name[16];\n};\n\nstruct Patient p = {101, 80, "Rian"};\nprintf("%d %s\\n", p.id, p.name);\nstruct Patient *pp = &p;\nprintf("%d\\n", pp->hp);', runnable: false },
                note: 'pp->hp 只是 (*pp).hp 的简写。看到 -> 就应该想到「左边是一个指针」。'
              },
              {
                h: '2. typedef 与初始化',
                p: [
                  'typedef 给类型起别名，省掉每次写 struct 关键字。惯用写法是 typedef struct { ... } Name; ，此后 Name 就是类型名。',
                  '初始化可以按声明顺序给，也可以用 C99 的指定初始化器 .成员 = 值。后者不怕字段顺序变化，可读性更好，也更适合只初始化部分字段的场合。'
                ],
                code: { lang: 'c', src: 'typedef struct {\n    int id;\n    double dose;\n} Record;\n\nRecord r = { .id = 7, .dose = 2.5 };\nprintf("%d %.1f\\n", r.id, r.dose);', runnable: false },
                note: 'typedef 只是别名，不会产生新的类型检查规则；它服务的是可读性。'
              },
              {
                h: '3. 结构体数组与嵌套',
                p: [
                  '结构体可以嵌套，也可以组成数组。ward[1].bed.x 从左往右读：第二个伤员、他的床位、横坐标。读法清楚，代码就不容易写错。',
                  '结构体数组在内存里是连续的一整块，所以可以整体 fwrite 到文件；前提是里面没有指针成员，否则写进去的只是地址，读回来毫无意义。'
                ],
                code: { lang: 'c', src: 'typedef struct { int x; int y; } Pos;\ntypedef struct {\n    int id;\n    Pos bed;\n} Patient;\n\nPatient ward[3] = { {1, {2, 3}}, {2, {4, 1}}, {3, {1, 5}} };\nprintf("%d\\n", ward[1].bed.x);   /* 4 */', runnable: false },
                note: '嵌套层次超过三层时，考虑拆出中间变量，可读性比炫技重要。'
              },
              {
                h: '4. 值语义、指针与内存对齐',
                p: [
                  '结构体赋值是逐字节复制。函数参数按值传递时会复制整个结构体，字段多时开销明显；想修改原对象就传指针，只读就传 const 指针。',
                  '编译器会在成员之间插入填充字节，让每个成员落在合适对齐的地址上。因此 sizeof(struct) 往往大于成员大小之和，不要拿它当字段字节数硬算。'
                ],
                code: { lang: 'c', src: 'void healCopy(Patient p) { p.hp = 100; }     /* 只改副本，无效 */\nvoid healReal(Patient *p) { p->hp = 100; }   /* 改原对象，有效 */', runnable: false },
                note: '把大的结构体成员排在前面，通常能减少填充；但除非真的缺内存，不必为此牺牲字段顺序的可读性。'
              },
              {
                h: '5. union：共享同一块内存',
                p: [
                  'union 的所有成员共享同一块内存，大小等于最大的那个成员。同一时刻只有一个成员的值有意义，写一个就会覆盖另一个。',
                  'union 常用于「同一个位置可能是整数也可能是浮点」的协议解析。但用 A 成员写、用 B 成员读属于类型双关，结果依赖平台；工程里更推荐 memcpy 或显式数值转换。'
                ],
                code: { lang: 'c', src: 'union Value {\n    int i;\n    float f;\n    unsigned char bytes[4];\n};\n\nunion Value v;\nv.i = 0x41424344;\nprintf("%d\\n", (int)sizeof(v));   /* 通常为 4 */', runnable: false },
                note: 'union 省内存，但不省心。用它之前先确认：这几个成员真的不会同时需要。'
              },
              {
                h: '6. 位域与枚举',
                p: [
                  '位域用 unsigned int dirty : 1; 这样的写法，让一个字段只占若干二进制位，适合保存开关和状态码。但位的排列顺序依赖编译器，不适合直接写进跨平台的文件格式。',
                  'enum 定义一组有名字的整数常量，比裸数字可读得多。枚举值默认从 0 开始递增，也可以显式指定，常用于表示槽位、状态和错误码。'
                ],
                code: { lang: 'c', src: 'enum Slot { WEAPON = 1, ARMOR = 2, RELIC = 4 };\n\nstruct Flags {\n    unsigned int dirty : 1;\n    unsigned int kind : 3;\n};', runnable: false },
                note: '位域与枚举都属于「让代码自己解释自己」的技巧。可读性的收益，通常比省几个字节更大。'
              }
            ],
            terms: [
              { t: '结构体', en: 'struct', d: '把多个不同类型成员组合在一起的复合类型。' },
              { t: '成员', en: 'member', d: '结构体或联合体内部的一个字段。' },
              { t: '类型别名', en: 'typedef', d: '为已有类型起一个新名字，简化声明。' },
              { t: '联合体', en: 'union', d: '所有成员共享同一块内存，同一时刻只有一个成员有效。' },
              { t: '位域', en: 'bit-field', d: '指定成员只占若干二进制位，布局依赖编译器实现。' },
              { t: '枚举', en: 'enum', d: '一组具名整数常量，用来代替裸数字。' },
              { t: '内存对齐', en: 'alignment', d: '成员被放在满足对齐要求的地址上，中间可能插入填充字节。' }
            ],
            exam: '二级 C 高频：结构体成员访问、. 与 -> 的使用场合、sizeof(struct) 与对齐、typedef 的作用、union 的大小。算结构体大小时按对齐单位逐字段排布，别把成员大小直接相加。',
            checklist: [
              '会定义结构体并访问成员',
              '会用 typedef 简化类型名',
              '知道结构体数组与嵌套的读法',
              '能解释 union 的大小与覆盖行为',
              '理解位域、枚举的用途与限制'
            ]
          }
        },
        {
          id: 'c-8-3', type: 'battle', title: '遭遇 · 名录魇', jp: '名簿の魘', xp: 80,
          enemy: {
            name: '名录魇', kind: 'wraith', hp: 100,
            title: '旧档 · 断裂的名册', taunt: '分开的……永远分开的……编号不认识名字。',
            lore: '它把名册拆成两列互不相认的数组。只要让同一个下标同时读出编号与等级，名册就会重新连起来。'
          },
          brief: '名册被拆成两列平行的数组：编号与等级。用下标把它们重新对齐，挑出等级不小于 10 的编号。',
          tasks: [
            {
              prompt: '给定 int id[4] = {101, 102, 103, 104}; 与 int level[4] = {12, 5, 20, 8}; 用同一个下标同时访问两个数组，输出所有等级大于等于 10 的编号，每个编号占一行。',
              requirement: '预期输出两行：101 / 103',
              expected: '101\n103',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int id[4] = {101, 102, 103, 104};\n    int level[4] = {12, 5, 20, 8};\n    // 同一个下标 i，同时读 level[i] 与 id[i]\n    return 0;\n}\n',
              hints: [
                '循环 for (int i = 0; i < 4; i++)，两个数组共用这一个下标。',
                '判断条件写 if (level[i] >= 10)，满足时才处理 id[i]。',
                '输出用 printf("%d\\n", id[i]);，每行一个编号。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int id[4] = {101, 102, 103, 104};\n    int level[4] = {12, 5, 20, 8};\n    for (int i = 0; i < 4; i++) {\n        if (level[i] >= 10) {\n            printf("%d\\n", id[i]);\n        }\n    }\n    return 0;\n}',
              must: { re: '\\[[^\\]]*\\][\\s\\S]*(for|while)\\s*\\(', text: '必须使用数组与循环' }
            }
          ],
          outro: '101 与 103 先后亮起，名册的两列重新对齐。魇影散成纸屑，澪把它们一一拾起，放回匣子的正确格位里。',
          loot: LS.makeLoot('rare', '名录之匣', 'relic', '▣', '匣内格栅分明，每一格都刻着字段名。合上时不会串味，打开时不会走散。', 'c')
        }
      ]
    },
    {
      id: 'c-9', title: '第九章 · 递归深井', jp: '再帰の井戸', volume: '第二卷 · 源核之下',
      subtitle: '回声要走得下去，也要回得来', summary: '递归、函数指针、回调、作用域与存储期。',
      nodes: [
        {
          id: 'c-9-1', type: 'story', title: '井底的回声', jp: '井底のこだま', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '井壁上有回声。每喊一声，井就把它交给下一层，一直交到最深处。' },
            { who: '维护者·澪', tone: 'guide', text: '递归需要一个能停下来的地方。没有基准情形，回声就永远不回来，最后把整口井撑破。' },
            { who: '莉安', tone: 'ally', text: '那张写着「该由谁回答」的纸，就是函数指针？' },
            { who: '回声之影', tone: 'enemy', text: '再深一层……再深一层……你们不知道底在哪里。' },
            { who: '澪', tone: 'guide', text: '先写清什么时候停，再往下走。停得住的人，才走得深。' }
          ]
        },
        {
          id: 'c-9-2', type: 'lesson', title: '递归、函数指针与存储期', jp: '再帰と関数ポインタ', xp: 40, minutes: 24,
          article: {
            lead: '函数不只是「把代码装进盒子」。它可以调用自己（递归），可以被当成值传来传去（函数指针），还可以用 static 保留跨调用的状态。这一章把函数真正用起来。',
            sections: [
              {
                h: '1. 函数原型与调用约定',
                p: [
                  'C 要求先声明后使用。函数原型只写签名，让编译器提前知道参数个数与返回类型；实现可以放在后面，也可以放在别的源文件里。',
                  '调用时实参按值复制给形参，返回时把结果复制回调用处。返回类型写 void 表示不返回结果，此时 return; 可省略。'
                ],
                code: { lang: 'c', src: '#include <stdio.h>\n\nint sum(int a, int b);\n\nint main(void) {\n    printf("%d\\n", sum(3, 4));\n    return 0;\n}\n\nint sum(int a, int b) {\n    return a + b;\n}' },
                note: '原型里的参数名可以省略：int sum(int, int); 也是合法的，头文件里常这么写。'
              },
              {
                h: '2. 递归：基准情形与递归步骤',
                p: [
                  '递归函数有两个必备部分：基准情形（什么时候停）和递归步骤（把问题缩小一点再交给自己）。缺了基准情形，调用栈会一直增长，直到栈溢出。',
                  '以阶乘为例：n 小等于 1 时返回 1；否则返回 n 乘以 fact(n - 1)。每一步都让 n 变小，最终一定碰到基准情形，然后逐层把结果乘回来。'
                ],
                code: { lang: 'c', src: '#include <stdio.h>\n\nint fact(int n) {\n    if (n <= 1) {\n        return 1;\n    }\n    return n * fact(n - 1);\n}\n\nint main(void) {\n    printf("%d\\n", fact(5));\n    return 0;\n}' },
                note: '递归深度受调用栈限制。几千层以上就要考虑改成循环，或者用显式的栈来模拟。'
              },
              {
                h: '3. 递归的代价与改写',
                p: [
                  '每次递归调用都会压入一帧栈：参数、局部变量、返回地址。层数一深，既慢又可能栈溢出。这也是为什么「能用循环就别用递归」在 C 里是常见建议。',
                  '能一眼看出循环写法的递归，优先写循环。阶乘、累加、计数都可以直接改成 for。真正适合递归的是树、分治、回溯这类结构本身递归的问题。'
                ],
                code: { lang: 'c', src: 'int factLoop(int n) {\n    int result = 1;\n    for (int i = 2; i <= n; i++) {\n        result = result * i;\n    }\n    return result;\n}', runnable: false },
                note: '递归写出来更短，不代表更好。读代码的人要同时在脑子里展开整棵调用树。'
              },
              {
                h: '4. 函数指针',
                p: [
                  '函数也有地址。int (*op)(int, int) 表示「指向一个接受两个 int、返回 int 的函数」的指针。括号不能省：int *op(int, int) 是返回指针的函数，意思完全不同。',
                  '赋值时直接写函数名即可，不加 & 也可以；调用时写 op(2, 3) 或 (*op)(2, 3) 都行。函数指针让「同一段流程换不同策略」成为可能。'
                ],
                code: { lang: 'c', src: 'int add(int a, int b) { return a + b; }\nint mul(int a, int b) { return a * b; }\n\nint (*op)(int, int) = add;\nprintf("%d\\n", op(2, 3));   /* 5 */\nop = mul;\nprintf("%d\\n", op(2, 3));   /* 6 */', runnable: false },
                note: '函数指针的声明是 C 里最像「天书」的语法之一。记住：先看括号，再看返回类型。'
              },
              {
                h: '5. 回调与通用流程',
                p: [
                  '把函数指针作为参数传进去，就是回调。调用者决定「做什么」，被调用的函数决定「什么时候做」。排序、遍历、事件分发都靠它解耦。',
                  '标准库的 qsort 就是典型：它负责排序流程，你只需要提供一个比较函数。比较函数返回负数表示 a 应排在 b 前面，返回 0 表示相等。'
                ],
                code: { lang: 'c', src: 'int byHp(const void *a, const void *b) {\n    const Patient *pa = a;\n    const Patient *pb = b;\n    return pa->hp - pb->hp;\n}\n\nqsort(ward, 3, sizeof(Patient), byHp);', runnable: false },
                note: '比较函数里不要用减法处理可能溢出的值；安全写法是分别比较再返回 -1、0、1。'
              },
              {
                h: '6. 作用域与存储期',
                p: [
                  '作用域决定「名字在哪里可见」，存储期决定「变量活多久」。局部变量默认是自动存储期，代码块结束就失效。',
                  'static 修饰局部变量时，只初始化一次，值在多次调用之间保留；修饰全局变量或函数时，把可见范围限制在本文件。extern 表示「定义在别处」，只做声明。'
                ],
                code: { lang: 'c', src: 'int counter(void) {\n    static int n = 0;   /* 只初始化一次，跨调用保留 */\n    n++;\n    return n;\n}', runnable: false },
                note: 'static 局部变量不是线程安全的。多线程环境下，跨调用共享状态需要额外的同步手段。'
              }
            ],
            terms: [
              { t: '递归', en: 'recursion', d: '函数直接或间接调用自身，把问题缩小后重复处理。' },
              { t: '基准情形', en: 'base case', d: '递归中不再继续调用、直接返回结果的分支。' },
              { t: '调用栈', en: 'call stack', d: '保存每层函数调用现场的内存区域，深度有限。' },
              { t: '函数指针', en: 'function pointer', d: '保存函数入口地址的变量，可以像函数一样调用。' },
              { t: '回调', en: 'callback', d: '把函数指针传给别的函数，由对方在合适时机调用。' },
              { t: '存储期', en: 'storage duration', d: '变量从创建到销毁的时间长度，如自动、静态、动态。' },
              { t: '静态变量', en: 'static variable', d: '只初始化一次并在程序运行期间保留值的变量。' }
            ],
            exam: '二级 C 高频：递归的终止条件与执行次数、函数指针的声明形式、static 局部变量的值、作用域与生存期的区别。看到 int (*p)(int) 先确认括号位置，再看返回类型。',
            checklist: [
              '能为递归写出正确的基准情形',
              '能用画调用栈的方式追踪递归',
              '知道递归的代价并会改写成循环',
              '会声明和使用函数指针',
              '能说清 static 与 extern 的作用'
            ]
          }
        },
        {
          id: 'c-9-3', type: 'battle', title: '遭遇 · 回声之影', jp: 'こだまの影', xp: 80,
          enemy: {
            name: '回声之影', kind: 'glitch', hp: 100,
            title: '造物 · 无尽的回声', taunt: '再深一层……再深一层……你们不知道底在哪里。',
            lore: '它把井底的回声叠了一层又一层，却从不返回结果。写清基准情形，声音才会沿着原路回来。'
          },
          brief: '深井的回声会把数字一层层交下去。写一个递归函数，算出第六层回声的值。',
          tasks: [
            {
              prompt: '定义递归函数 int fact(int n) 计算阶乘：n 小于等于 1 时返回 1，否则返回 n * fact(n - 1)。在 main 中输出 fact(6) 的结果。',
              requirement: '预期输出：720',
              expected: '720',
              starter: '#include <stdio.h>\n\n// 在这里定义 fact\n\nint main(void) {\n    printf("%d\\n", fact(6));\n    return 0;\n}\n',
              hints: [
                '先在 main 上方写 int fact(int n) { ... }，函数体第一件事就是处理基准情形。',
                '基准情形：if (n <= 1) { return 1; }。少了它，调用会一直往下钻。',
                '最后一行 return n * fact(n - 1);，让每一层把结果乘回来。'
              ],
              solution: '#include <stdio.h>\n\nint fact(int n) {\n    if (n <= 1) {\n        return 1;\n    }\n    return n * fact(n - 1);\n}\n\nint main(void) {\n    printf("%d\\n", fact(6));\n    return 0;\n}',
              must: { re: 'int\\s+\\w+\\s*\\([^)]*\\)\\s*\\{', text: '必须自己定义函数' }
            }
          ],
          outro: '回声一层层退回来，最后落在 720 上。井水静止，能看见自己的影子。澪说：会停的循环，才叫回声。',
          loot: LS.makeLoot('epic', '回声签筒', 'weapon', '⟳', '摇动时能听见层层回落的声音。最里面那一声很轻，是基准情形。', 'c')
        }
      ]
    },
    {
      id: 'c-10', title: '第十章 · 封蜡卷宗', jp: '封蝋の書庫', volume: '第二卷 · 源核之下',
      subtitle: '打开的东西，要记得关上', summary: 'fopen/fread/fwrite、文本与二进制、宏、条件编译与多文件。',
      nodes: [
        {
          id: 'c-10-1', type: 'story', title: '最深的书库', jp: '最奥の書庫', xp: 20,
          lines: [
            { who: '维护者·澪', tone: 'guide', text: '档案库最深处是封蜡的卷宗。要读它，得先打开，再关上。顺序错了，蜡就化了。' },
            { who: '界灵·零', tone: 'guide', text: '文件是程序之外的记忆；宏是编译之前先被替换的便签。两件事都在你写下代码之前就已经发生。' },
            { who: '莉安', tone: 'ally', text: '不过教学终端不碰真实文件。我们只演练结构与统计，把顺序刻进习惯里。' },
            { who: '卷宗守卫', tone: 'enemy', text: '打开……不关……打开……不关……它已经不记得自己开过多少卷了。' },
            { who: '莉安', tone: 'ally', text: '每一次 fopen，都要有对应的 fclose。这不是礼貌，是纪律。' }
          ]
        },
        {
          id: 'c-10-2', type: 'lesson', title: '文件、宏与多文件工程', jp: 'ファイルと前処理', xp: 40, minutes: 26,
          article: {
            lead: '程序的数据不该只活在内存里。文件把数据留在磁盘上，预处理器则在编译之前先改写你的源码。这两件事共同决定了「程序从哪里来、到哪里去」。',
            sections: [
              {
                h: '1. 文件指针与打开模式',
                p: [
                  'fopen 返回 FILE *，失败时返回 NULL。模式决定行为：只读、覆盖写、追加，各有各的脾气。',
                  '打开后一定要 fclose。未关闭的文件会占用句柄，写入的内容也可能还留在缓冲区里没有落盘。'
                ],
                code: { lang: 'c', src: 'FILE *fp = fopen("roster.txt", "r");\nif (fp == NULL) {\n    perror("roster.txt");\n    return 1;\n}\n/* ... 读写 ... */\nfclose(fp);', runnable: false },
                note: '“r” 要求文件已存在，“w” 会清空原文件，“a” 追加在末尾；加 b 表示二进制模式。'
              },
              {
                h: '2. 文本读写',
                p: [
                  '文本模式把数据当字符流。fprintf / fscanf 按格式读写，fgets / fputs 按行读写。fgets 会保留行尾换行，读到之后通常要处理掉。',
                  'fscanf 的返回值是成功赋值的项数，返回 EOF 表示到达末尾或出错。不要用 while (!feof(fp)) 当循环条件——它会在最后一次多读一轮。'
                ],
                code: { lang: 'c', src: 'FILE *fp = fopen("roster.txt", "a");\nif (fp == NULL) return 1;\nfprintf(fp, "%d %s %d\\n", 101, "Rian", 80);\nfclose(fp);', runnable: false },
                note: '正确的读循环是「先读、再判断返回值」：while (fgets(line, sizeof(line), fp) != NULL) { ... }'
              },
              {
                h: '3. 二进制读写',
                p: [
                  '二进制模式按字节原样搬运。fwrite(ptr, size, count, fp) 写入 count 个 size 字节的对象，返回实际写入的个数；fread 与它对称，参数顺序完全一样。',
                  '结构体数组可以整块写，前提是没有指针成员，而且读写双方的编译器对齐规则一致。跨平台交换数据时，还要考虑字节序和字段宽度。'
                ],
                code: { lang: 'c', src: 'size_t n = fwrite(ward, sizeof(Patient), 3, fp);\nif (n != 3) {\n    printf("写入不完整\\n");\n}\n\nrewind(fp);\nfread(ward, sizeof(Patient), 3, fp);', runnable: false },
                note: '二进制文件的优点是快和精确，缺点是不可读、不可移植。给人看的日志用文本，存档用二进制。'
              },
              {
                h: '4. 错误处理与关闭',
                p: [
                  '每个可能失败的调用都要检查：fopen 是否 NULL、fread / fwrite 返回个数是否符合预期、fclose 是否返回 0。',
                  'perror 会打印你的提示加系统错误原因；ferror 查询流是否出错；feof 只表示「已经读到末尾」，并不代表最后一次读取成功。'
                ],
                code: { lang: 'c', src: 'if (fclose(fp) != 0) {\n    perror("fclose");\n}\nif (ferror(fp)) {\n    printf("流发生错误\\n");\n}', runnable: false },
                note: '多个资源要一起释放时，按申请的反序关闭，并保证每个错误分支都能走到关闭这一步。'
              },
              {
                h: '5. 宏：替换发生在编译之前',
                p: [
                  '#define 在预处理阶段做纯文本替换。对象宏用来给常量起名，函数宏看起来像函数，但没有类型检查、没有作用域，也不会出现在调试器的符号表里。',
                  '函数宏的每个参数都要加括号，整体也要加括号：#define SQUARE(x) ((x) * (x))。写成 x * x 时，SQUARE(a + 1) 会展开成 a + 1 * a + 1，结果完全错。',
                  '现代 C 更推荐 const 常量与 static inline 函数：有类型、能调试、能参与优化。宏真正不可替代的场合是头文件保护、条件编译和编译期开关。'
                ],
                code: { lang: 'c', src: '#define MAX_WARD 32\n#define SQUARE(x) ((x) * (x))\n\nconst int LIMIT = 32;            /* 更安全：有类型 */\nprintf("%d\\n", SQUARE(3 + 1));   /* 16 */', runnable: false },
                note: '宏不是函数，它只是文字替换。看到宏，先在纸上展开一遍，再判断结果。'
              },
              {
                h: '6. 条件编译与多文件工程',
                p: [
                  '#if / #ifdef / #ifndef / #endif 让同一份源码在不同平台或不同构建配置下编译出不同结果。头文件用 #ifndef 包裹，避免被重复包含导致的重复定义。',
                  '多文件工程把声明放 .h、定义放 .c。编译时把所有 .c 一起交给编译器，例如 gcc main.c roster.c -o roster。函数默认外部链接，加 static 则只在本文件可见。'
                ],
                code: { lang: 'c', src: '#ifndef ROSTER_H\n#define ROSTER_H\n\nint roster_count(void);\n\n#endif\n\n/* gcc main.c roster.c -o roster */', runnable: false },
                note: '头文件只放声明与宏，不要放函数定义（inline 除外），否则多个源文件包含时会重复定义。'
              }
            ],
            terms: [
              { t: '文件指针', en: 'FILE *', d: '代表一个打开的文件流，读写函数都要用它。' },
              { t: '打开模式', en: 'fopen mode', d: 'r 只读、w 覆盖写、a 追加，加 b 表示二进制。' },
              { t: '二进制模式', en: 'binary mode', d: '按字节原样读写，不做换行转换。' },
              { t: '缓冲区', en: 'buffer', d: '读写时暂存数据的内存区域，关闭文件时会被刷新。' },
              { t: '宏', en: 'macro', d: '预处理阶段的文本替换规则，没有类型检查。' },
              { t: '条件编译', en: 'conditional compilation', d: '根据宏是否定义决定哪些代码参与编译。' },
              { t: '头文件保护', en: 'include guard', d: '用 #ifndef 包裹头文件内容，防止重复包含。' }
            ],
            exam: '二级 C 高频：fopen 各模式的含义、fclose 的必要性、fread / fwrite 的参数与返回值、带参宏的展开、#ifndef 的作用。宏题一定要手动展开一遍再判断，别凭感觉。',
            checklist: [
              '能按需选择文件的打开模式',
              '会写「打开—检查—读写—关闭」的完整流程',
              '知道文本与二进制读写的差别',
              '能手动展开带参数的宏',
              '会用 include guard 组织多文件工程'
            ]
          }
        },
        {
          id: 'c-10-3', type: 'battle', title: '遭遇 · 卷宗守卫', jp: '書庫の番人', xp: 80,
          enemy: {
            name: '卷宗守卫', kind: 'construct', hp: 100,
            title: '造物 · 从不关门', taunt: '打开……不关……打开……不关……',
            lore: '它把每一卷都打开却不关上，句柄堆成了塔。用常量立一条规矩，再逐行清点，塔就会散开。'
          },
          brief: '卷宗按行记录字节数。用常量设定单行上限，统计总字节数与超限行数。',
          tasks: [
            {
              prompt: '给定 int bytes[5] = {12, 30, 18, 44, 9}; 用 const int LIMIT = 20; 作为单行上限。用循环统计总字节数，以及超过上限的行数，输出 total=113 与 over=2 两行。',
              requirement: '预期输出：total=113 / over=2',
              expected: 'total=113\nover=2',
              starter: '#include <stdio.h>\n\nint main(void) {\n    const int LIMIT = 20;\n    int bytes[5] = {12, 30, 18, 44, 9};\n    int total = 0;\n    int over = 0;\n    // 累加总字节数，并统计超过 LIMIT 的行\n    return 0;\n}\n',
              hints: [
                '遍历 for (int i = 0; i < 5; i++)，注意下标 0 到 4。',
                '每轮 total = total + bytes[i];，再用 if (bytes[i] > LIMIT) over++; 判断超限。',
                '输出 printf("total=%d\\nover=%d\\n", total, over);，两条信息各占一行。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    const int LIMIT = 20;\n    int bytes[5] = {12, 30, 18, 44, 9};\n    int total = 0;\n    int over = 0;\n    for (int i = 0; i < 5; i++) {\n        total = total + bytes[i];\n        if (bytes[i] > LIMIT) {\n            over++;\n        }\n    }\n    printf("total=%d\\nover=%d\\n", total, over);\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环统计' }
            }
          ],
          outro: 'total 停在 113，over 停在 2。守卫把所有卷宗依次合上，最后自己也安静下来。澪说：会关门的守卫，才守得住书库。',
          loot: LS.makeLoot('epic', '封蜡档案夹', 'armor', '▦', '每打开一次都会留下蜡痕。老档案员说，痕迹就是责任，不是损耗。', 'c')
        }
      ]
    },
    {
      id: 'c-11', title: '第十一章 · 队列之桥', jp: '連なりの橋', volume: '第二卷 · 源核之下',
      subtitle: '先来的先过桥', summary: '链表、栈、队列与复杂度直觉。',
      nodes: [
        {
          id: 'c-11-1', type: 'story', title: '上桥的顺序', jp: '橋の順番', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '栈桥的名字不是随便起的。伤员按顺序上桥，先来的先过。' },
            { who: '维护者·澪', tone: 'guide', text: '队列是先进先出，栈是后进先出。选错了，药就会发到已经离开的人手里。' },
            { who: '莉安', tone: 'ally', text: '先用数组模拟一下就好。栈顶不过是一个下标，数得清就错不了。' },
            { who: '桥影', tone: 'enemy', text: '顺序……顺序……你们连谁先来都记不住。' },
            { who: '澪', tone: 'guide', text: '先看清谁先进、谁后出。结构选对了，代码自然短。' }
          ]
        },
        {
          id: 'c-11-2', type: 'lesson', title: '链表、栈与队列', jp: 'リストと積みと列', xp: 40, minutes: 26,
          article: {
            lead: '同样是装一批数据，用不同的结构装，代价可以差一个数量级。这一章只讲三个最基础的结构：链表、栈、队列，以及判断「该用哪个」的复杂度直觉。',
            sections: [
              {
                h: '1. 复杂度：先看增长',
                p: [
                  '复杂度描述「数据量变大时，代价怎么涨」。O(1) 是常数时间，O(n) 随数量线性增长，O(log n) 每步砍掉一半，O(n²) 是嵌套遍历。',
                  '顺序查找是 O(n)，有序数组上的二分查找是 O(log n)，但插入要搬移元素。选结构就是选「哪种操作最常做」，没有全能冠军。'
                ],
                code: { lang: 'c', src: 'int find(int a[], int n, int key) {\n    for (int i = 0; i < n; i++) {\n        if (a[i] == key) return i;\n    }\n    return -1;\n}', runnable: false },
                note: '找到就 return 的循环，最好情况是 O(1)，最坏情况才是 O(n)。复杂度通常指最坏情况。'
              },
              {
                h: '2. 链表：节点与指针',
                p: [
                  '链表由节点串成，每个节点保存数据和指向下一个节点的指针。最后一个节点的 next 是 NULL，表示结束。',
                  '链表不需要连续内存，插入删除只改指针；代价是不能随机访问，找第 k 个必须从头走 k 步，而且每个节点都多一个指针的开销。'
                ],
                code: { lang: 'c', src: 'typedef struct Node {\n    int value;\n    struct Node *next;\n} Node;\n\nNode *head = NULL;\nNode *n = malloc(sizeof(Node));\nn->value = 7;\nn->next = head;\nhead = n;', runnable: false },
                note: '结构体里引用自己，必须写成 struct Node *next，不能只写 Node *next（此时别名还没生效）。'
              },
              {
                h: '3. 链表操作：头插、遍历、删除',
                p: [
                  '遍历：用一个 cur 指针从头走到 NULL。头插：新节点 next 指向原 head，再让 head 指向新节点。顺序反了，整条链就断了。',
                  '删除要处理两种情况：删的是头节点（改 head），删的是中间节点（改前一个节点的 next）。改完指针再 free，顺序不能反。'
                ],
                code: { lang: 'c', src: 'Node *prev = NULL;\nNode *cur = head;\nwhile (cur != NULL) {\n    if (cur->value == key) {\n        if (prev == NULL) head = cur->next;\n        else prev->next = cur->next;\n        free(cur);\n        break;\n    }\n    prev = cur;\n    cur = cur->next;\n}', runnable: false },
                note: '删除时要先保存 cur->next，再 free(cur)，否则释放后就再也找不到后面的节点了。'
              },
              {
                h: '4. 栈：后进先出',
                p: [
                  '栈是后进先出（LIFO）：最后放进去的最先拿出来。只有两个核心操作：push 压入、pop 弹出，加上判空判满。',
                  '数组实现只需要一个 top 下标，初始为 -1。push 时先 top++ 再写入；pop 时先取值再 top--。空栈 pop 是错误，必须判空。'
                ],
                code: { lang: 'c', src: 'int stack[16];\nint top = -1;\n\nvoid push(int v) {\n    if (top < 15) stack[++top] = v;\n}\n\nint pop(void) {\n    if (top < 0) return -1;\n    return stack[top--];\n}', runnable: false },
                note: '把 top 想成「最后一张纸的位置」，push 是往上叠，pop 是揭走最上面那张。'
              },
              {
                h: '5. 队列与环形缓冲区',
                p: [
                  '队列是先进先出（FIFO）：先来的先处理。入队放在 tail，出队取 head，两个下标一起往右走。',
                  '普通数组队列会「假满」：前面空出位置却用不了。环形缓冲区用取模解决：tail = (tail + 1) % 容量，头尾绕圈复用同一块数组。'
                ],
                code: { lang: 'c', src: 'int q[8];\nint head = 0, tail = 0;\n\nq[tail] = 3;\ntail = (tail + 1) % 8;\n\nint front = q[head];\nhead = (head + 1) % 8;', runnable: false },
                note: '环形队列要单独用一个 count 记录元素个数，否则「空」和「满」都是 head == tail，无法区分。'
              },
              {
                h: '6. 如何选择与常见错误',
                p: [
                  '常按下标随机访问，用数组；频繁在中间插入删除，用链表；需要「撤销」或「回退」，用栈；需要按到达顺序处理，用队列。',
                  '常见错误：链表丢头指针、删除后忘记 free、栈顶越界、队列判空判满条件写反、环形队列忘记取模。每一个都能让程序安静地出错。'
                ],
                note: '先写出能跑通的最简单版本，再谈优化。数据结构的第一目标是正确，第二目标才是快。'
              }
            ],
            terms: [
              { t: '时间复杂度', en: 'time complexity', d: '描述运行时间随数据量增长的趋势。' },
              { t: '链表', en: 'linked list', d: '由节点通过指针串起来的结构，不要求连续内存。' },
              { t: '节点', en: 'node', d: '链表的基本单位，保存数据与指向下一个节点的指针。' },
              { t: '栈', en: 'stack', d: '后进先出的结构，只在同一端压入与弹出。' },
              { t: '队列', en: 'queue', d: '先进先出的结构，一端入队、另一端出队。' },
              { t: '环形缓冲区', en: 'circular buffer', d: '用取模让头尾下标绕圈复用同一块数组。' }
            ],
            exam: '二级 C 高频：链表插入删除的指针顺序、栈与队列的进出规则、循环队列的判空判满、常见操作的时间复杂度。画图跟踪指针，比背结论可靠得多。',
            checklist: [
              '能说出常见操作的时间复杂度',
              '会定义链表节点并完成头插与遍历',
              '知道删除链表节点时指针的改动顺序',
              '会用数组实现栈并判断边界',
              '能解释环形队列为什么需要取模'
            ]
          }
        },
        {
          id: 'c-11-3', type: 'battle', title: '遭遇 · 桥影', jp: '橋の影', xp: 80,
          enemy: {
            name: '桥影', kind: 'drone', hp: 100,
            title: '造物 · 顺序错乱', taunt: '顺序……顺序……你们连谁先来都记不住。',
            lore: '它把上桥的药材顺序搅乱了。用数组模拟一个栈，按后进先出的规矩收放，桥面就会重新安静。'
          },
          brief: '栈桥只认后进先出。用数组模拟一个栈，压入四份药材，再弹出两份，看剩下什么。',
          tasks: [
            {
              prompt: '用一个容量为 10 的数组模拟栈（top 初始为 -1），依次压入 3、8、12、5，然后弹出两次。输出栈顶元素 top=8 与剩余元素个数 size=2 两行。',
              requirement: '预期输出：top=8 / size=2',
              expected: 'top=8\nsize=2',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int stack[10] = {0};\n    int top = -1;\n    int data[4] = {3, 8, 12, 5};\n    // 依次压入，再弹出两次\n    return 0;\n}\n',
              hints: [
                '压入要先让 top 加一：top++; stack[top] = data[i];，用 for 循环走完四个数。',
                '弹出两次就是 top-- 两次，弹出的值不需要保存。',
                '输出 printf("top=%d\\n", stack[top]); 与 printf("size=%d\\n", top + 1);。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int stack[10] = {0};\n    int top = -1;\n    int data[4] = {3, 8, 12, 5};\n    for (int i = 0; i < 4; i++) {\n        top++;\n        stack[top] = data[i];\n    }\n    top--;\n    top--;\n    printf("top=%d\\n", stack[top]);\n    printf("size=%d\\n", top + 1);\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环压入数据' }
            }
          ],
          outro: '栈顶是 8，还剩两份。桥影顺着桥面退走，像水退下石阶。澪说：顺序是桥的骨头，别嫌它慢。',
          loot: LS.makeLoot('epic', '队列之桥钥', 'relic', '⇥', '钥匙上刻着 head 与 tail，只能按顺序转动。逆着拧，会卡住。', 'c')
        }
      ]
    },
    {
      id: 'c-12', title: '第十二章 · 源核之下（终章）', jp: '終章・源核の下', volume: '第二卷 · 源核之下',
      subtitle: '把学过的一切拼成一件能用的东西', summary: '综合实战：小型通讯录的统计、筛选与函数拆分。',
      nodes: [
        {
          id: 'c-12-1', type: 'story', title: '名册的最后一页', jp: '名簿の最後の頁', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '源核之下就是这里了。旧系统的核心仍在运行，它用一份通讯录记住所有被救过的人。' },
            { who: '维护者·澪', tone: 'guide', text: '三百年里我只会维护，从不敢写下新的名字。这一页，请你替我写。' },
            { who: '源核残响', tone: 'enemy', text: '名册已满……不需要新的名字……不需要……' },
            { who: '莉安', tone: 'ally', text: '把你学过的都用上：数组、循环、函数。做一份能统计、也能筛选的通讯录。' },
            { who: '澪', tone: 'guide', text: '写完之后把终端关掉，像合上一本旧书那样。' }
          ]
        },
        {
          id: 'c-12-2', type: 'lesson', title: '小型通讯录实战', jp: '小さな名簿の実装', xp: 40, minutes: 30,
          article: {
            lead: '这一章不再介绍新语法，而是把数组、循环、函数与边界检查拼成一件能用的东西：一份小型通讯录。它同时是终战的地图——两道题分别对应这里的统计与筛选。',
            sections: [
              {
                h: '1. 需求拆解：先定数据模型',
                p: [
                  '通讯录要解决四件事：存下联系人、按编号找、按条件筛、统计整体情况。先把需求写成四句话，再决定数据结构，比直接敲代码快得多。',
                  '真实工程里会用结构体数组；在只能用数组的场合，几条平行的数组也能表达同一份名单——只要它们共用同一个下标。',
                  '平行数组的纪律是：任何插入或删除，都必须对所有数组做同样的操作，否则下标一错位，编号就会配上别人的年龄。'
                ],
                code: { lang: 'c', src: '/* 平行数组：id[i] 与 age[i] 描述同一个人 */\nint id[32];\nint age[32];\nint count = 0;', runnable: false },
                note: '字段越多，平行数组越容易出错。超过三个字段就该换成结构体数组。'
              },
              {
                h: '2. 定长容器：count 与上限',
                p: [
                  '实战第一步是先给一个上限。int id[32]; 加上 int count; 就是最简单的容器：count 表示已用格数，0 到 count - 1 是有效数据。',
                  '每次写入前检查 count < 32，写完后 count++。上线之后如果发现不够，再考虑动态扩容——先把边界写对，比先追求灵活更重要。'
                ],
                code: { lang: 'c', src: 'if (count < 32) {\n    id[count] = 101;\n    age[count] = 24;\n    count++;\n}', runnable: false },
                note: 'count 既表示数量，也表示「下一个空位的下标」，一个变量两种读法，用久了要小心。'
              },
              {
                h: '3. 增删改查：删除要搬移',
                p: [
                  '查找是线性遍历：从 0 到 count - 1，找到就返回下标，找不到返回 -1。',
                  '删除要「搬移」：把目标位置之后的每个元素往前挪一位，然后 count--。漏掉搬移，名单里就会出现空洞；忘记 count--，最后一条会被重复处理。'
                ],
                code: { lang: 'c', src: 'for (int i = pos; i < count - 1; i++) {\n    id[i] = id[i + 1];\n    age[i] = age[i + 1];\n}\ncount--;', runnable: false },
                note: '搬移的边界是 i < count - 1，写成 i < count 会读到数组末尾之外。'
              },
              {
                h: '4. 统计与筛选：一次遍历',
                p: [
                  '统计通常一次遍历就能同时算出多个指标：总和、数量、最大最小。把几个 if 放进同一个循环里，比写四遍循环更清楚，也更省。',
                  '整数除法会截断。求平均值时先想清楚要不要保留小数：要保留就用 double 并用 %.1f 输出，不要保留就明说「取整」。'
                ],
                code: { lang: 'c', src: '#include <stdio.h>\n\nint main(void) {\n    int ages[6] = {24, 31, 19, 45, 28, 33};\n    int sum = 0;\n    int count = 0;\n    for (int i = 0; i < 6; i++) {\n        sum = sum + ages[i];\n        if (ages[i] >= 30) {\n            count++;\n        }\n    }\n    printf("sum=%d count=%d\\n", sum, count);\n    return 0;\n}' },
                note: '这段代码的预期输出是 sum=180 count=3：一个循环同时完成了总和与筛选计数。'
              },
              {
                h: '5. 函数拆分与主循环',
                p: [
                  '把「统计」和「筛选」各自写成一个函数，main 只负责流程。函数名要说清做什么，参数带上数组与长度——数组参数一定要传长度，因为函数里拿不到数组的实际大小。',
                  '命令行工具通常是一个 while 主循环：读命令、分发处理、打印结果，直到收到退出指令。真实输入用 fgets 读取，再判断第一个字符，而不是用 scanf 猜格式。'
                ],
                code: { lang: 'c', src: 'int countAdult(const int age[], int n) {\n    int c = 0;\n    for (int i = 0; i < n; i++) {\n        if (age[i] >= 30) c++;\n    }\n    return c;\n}\n\nint main(void) {\n    int age[6] = {24, 31, 19, 45, 28, 33};\n    printf("count=%d\\n", countAdult(age, 6));\n    return 0;\n}', runnable: false },
                note: '参数写成 const int age[] 是在承诺「只读」。承诺兑现不了时，编译器会先替你拦住。'
              },
              {
                h: '6. 交付前的检查清单',
                p: [
                  '交付前过一遍清单：空表时每个函数是否安全？count 是否可能超过容量？删除后 count 是否正确？所有分支是否都打印了结果？',
                  '再问一句：这段代码三个月后自己还看得懂吗？变量名、函数名、注释都在替你回答。能被人接手的代码，才算真的写完。'
                ],
                note: '终战的两道题就是这份通讯录的统计与筛选部分。先让它们跑通，再谈扩展。'
              }
            ],
            terms: [
              { t: '平行数组', en: 'parallel arrays', d: '用同一个下标关联的多条数组，分别保存同一实体的不同字段。' },
              { t: '容量', en: 'capacity', d: '容器最多能放多少个元素，与已用数量不同。' },
              { t: '线性查找', en: 'linear search', d: '从第一个元素开始逐个比较，最坏需要遍历全部。' },
              { t: '搬移', en: 'shift', d: '删除或插入时把一段元素整体前移或后移。' },
              { t: '聚合统计', en: 'aggregation', d: '一次遍历中同时计算总和、数量、极值等指标。' },
              { t: '重构', en: 'refactor', d: '在不改变外部行为的前提下改善代码结构。' }
            ],
            exam: '考试与面试常以「写一个小系统」的形式考：数组 + 循环 + 函数 + 边界检查。评分点通常在边界（空、满、越界）和输出格式，而不是技巧。写完先手算一组数据对答案。',
            checklist: [
              '能把需求拆成数据模型与操作清单',
              '会用 count 管理定长容器且不忘上限检查',
              '能正确完成删除时的元素搬移',
              '能用一次遍历完成多项统计',
              '会按功能拆分函数并传数组长度'
            ]
          }
        },
        {
          id: 'c-12-3', type: 'battle', title: '终战 · 源核残响', jp: '源核の残響', xp: 160,
          enemy: {
            name: '源核残响', kind: 'construct', hp: 100, boss: true,
            title: '首领 · 旧系统的守册人', taunt: '名册已满……不需要新的名字。',
            lore: '它守着源核底下最后一份名册，只肯接受已经写好的统计。先用两条汇总数字证明你读得懂这份名册，再按条件筛出需要巡诊的人。'
          },
          brief: '终战分两段。先为六位联系人做一次整体统计；再按年龄筛出需要重点巡诊的人。两段完成，名册才会翻到新的一页。',
          tasks: [
            {
              prompt: '第一击：给定 int age[6] = {24, 31, 19, 45, 28, 33}; 用循环求年龄总和，再用整数除法求平均值。输出 sum=180 与 avg=30 两行。',
              requirement: '预期输出：sum=180 / avg=30',
              expected: 'sum=180\navg=30',
              starter: '#include <stdio.h>\n\nint main(void) {\n    int age[6] = {24, 31, 19, 45, 28, 33};\n    int sum = 0;\n    int avg = 0;\n    // 循环累加总和，再求平均值\n    return 0;\n}\n',
              hints: [
                '用 for (int i = 0; i < 6; i++) 遍历，每轮 sum = sum + age[i];。',
                '循环结束后写 avg = sum / 6;，整数除以整数会截断小数部分。',
                '输出 printf("sum=%d\\n", sum); 与 printf("avg=%d\\n", avg);，各占一行。'
              ],
              solution: '#include <stdio.h>\n\nint main(void) {\n    int age[6] = {24, 31, 19, 45, 28, 33};\n    int sum = 0;\n    int avg = 0;\n    for (int i = 0; i < 6; i++) {\n        sum = sum + age[i];\n    }\n    avg = sum / 6;\n    printf("sum=%d\\n", sum);\n    printf("avg=%d\\n", avg);\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环统计' }
            },
            {
              prompt: '第二击：先定义函数 int isSenior(int age)，年龄大于等于 30 返回 1，否则返回 0。再在 main 中遍历同一份年龄数组，输出所有符合条件的联系人编号（编号从 1 开始，即下标加 1），每行一个。',
              requirement: '预期输出三行：2 / 4 / 6',
              expected: '2\n4\n6',
              starter: '#include <stdio.h>\n\n// 在这里定义 isSenior\n\nint main(void) {\n    int age[6] = {24, 31, 19, 45, 28, 33};\n    for (int i = 0; i < 6; i++) {\n        // 调用 isSenior，符合条件的输出编号\n    }\n    return 0;\n}\n',
              hints: [
                '函数签名写成 int isSenior(int age) { return age >= 30; }，返回 1 或 0。',
                '循环里用 if (isSenior(age[i])) { ... } 判断是否满足条件。',
                '输出编号要写 printf("%d\\n", i + 1);，直接用 i 会从 0 开始。'
              ],
              solution: '#include <stdio.h>\n\nint isSenior(int age) {\n    return age >= 30;\n}\n\nint main(void) {\n    int age[6] = {24, 31, 19, 45, 28, 33};\n    for (int i = 0; i < 6; i++) {\n        if (isSenior(age[i])) {\n            printf("%d\\n", i + 1);\n        }\n    }\n    return 0;\n}',
              must: { re: 'int\\s+\\w+\\s*\\([^)]*\\)\\s*\\{', text: '必须自己定义筛选函数' }
            }
          ],
          outro: '名册第一次自己翻开了新的一页。源核的残响安静下来，旧系统把「维护」两个字交到了你手里。澪合上册子：「第二卷到此为止。真正的工程，从你下次打开编辑器开始。」',
          loot: LS.makeLoot('mythic', '源核名册', 'weapon', '❖', '一本会自己添页的名册。写下名字的人，从此不会被系统遗忘。', 'c')
        }
      ]
    }
  );
  }

  const cLang = LS.lang('c');
  if (cLang) {
    applyCVolumeTwo(cLang);
  } else if (typeof LS.registerLanguage === 'function') {
    // 本文件可能先于 c.js 载入：等 C 注册完成后再挂载第二卷
    const register = LS.registerLanguage;
    LS.registerLanguage = function (def) {
      register.call(LS, def);
      if (def && def.id === 'c') applyCVolumeTwo(LS.lang('c'));
    };
  }
})(window.LS);
