/* C++ — 机械炼金师 · 齿轮工坊 */
LS.registerLanguage({
  id: 'cpp',
  name: 'C++',
  jp: 'シープラスプラス',
  profession: '机械炼金师',
  professionJp: 'アルケミスト',
  professionStyle: 'alchemist',
  color: '#b06a4c',
  color2: '#e0c184',
  sigil: '构',
  difficulty: 3,
  tagline: '在齿轮与咒文之间，构造可以承受时间的东西。',
  role: '炉心设计者',
  weapon: '构装锤',
  element: '构',
  worldIntro: '齿轮工坊悬在熔炉上方。这里的炼金术不靠许愿，而靠构造：对象有生命周期，资源有归属，每一份力量都必须被精确地申请与释放。炼金师用模板与容器，把混乱的零件组合成可靠的机械。',
  description: '在 C 之上加入类、模板与 STL 的系统级语言。它兼顾性能与抽象，是游戏引擎、高频交易、操作系统与竞赛的常用语言。',
  chapters: [
    {
      id: 'cpp-1', title: '第一章 · 齿轮工坊', jp: '歯車の工房',
      subtitle: '让第一台机械说出自己的状态', summary: 'iostream、变量、类型与基础输入输出。',
      nodes: [
        {
          id: 'cpp-1-1', type: 'story', title: '停摆的炉心', jp: '止まった炉心', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '齿轮工坊的炉心停摆了。控制台上还留着一行没写完的输出，齿轮臂悬在半空。' },
            { who: '薇拉', tone: 'ally', text: '我是炼金师薇拉。C++ 的第一步不是造机器，是让机器报告自己。cout 就是它的仪表盘。' },
            { who: '锈蚀史莱姆', tone: 'enemy', text: 'HP…ATK…类型不对，读数全是乱的。' },
            { who: '薇拉', tone: 'ally', text: '那就用 cout 输出两行状态：HP=100，ATK=8.5。让炉心先看见自己。' }
          ]
        },
        {
          id: 'cpp-1-2', type: 'lesson', title: 'C++ 的输入输出与类型', jp: '入出力と型', xp: 30, minutes: 17,
          article: {
            lead: 'C++ 兼容 C 的语法，但提供了更安全的抽象。iostream 用流（stream）处理输入输出，比 printf 更容易保证类型一致。',
            sections: [
              {
                h: '1. 从 main 与 iostream 开始',
                p: [
                  '#include <iostream> 引入输入输出流。main 是入口，返回 int，0 表示正常结束。std::cout 是标准输出流，std::endl 输出换行并刷新缓冲区。',
                  'using namespace std; 可以省略 std:: 前缀，但大型项目中建议显式写 std::，避免命名冲突。'
                ],
                code: { lang: 'cpp', src: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, Link-Sekai" << std::endl;\n    return 0;\n}' }
              },
              {
                h: '2. cout 的链式输出',
                p: [
                  '<< 是流插入运算符，可以连续拼接多个值。字符串、整数、浮点数会自动按类型输出，不需要格式说明符。',
                  'std::endl 会换行并刷新；"\\n" 只换行，通常更快。竞赛与性能敏感场景中更常用 "\\n"。'
                ],
                code: { lang: 'cpp', src: 'int hp = 100;\ndouble atk = 8.5;\nstd::cout << "HP=" << hp << "\\n";\nstd::cout << "ATK=" << atk << "\\n";' }
              },
              {
                h: '3. 变量、常量与 auto',
                p: [
                  'C++ 是静态类型语言。常用类型有 int、long long、float、double、char、bool、std::string。const 表示只读，constexpr 表示编译期常量。',
                  'auto 让编译器根据初始化表达式推导类型，减少冗长写法，但不要滥用；类型不明显时写清楚更利于阅读。'
                ],
                code: { lang: 'cpp', src: 'const int MAX_HP = 100;\nauto damage = 12.5;\nstd::string name = "薇拉";\nbool alive = true;\nstd::cout << name << " " << damage << " " << alive << "\\n";' }
              },
              {
                h: '4. 输入与字符串',
                p: [
                  'std::cin >> 变量 按空白分割读取。读取整行要用 std::getline(std::cin, line)。混用 cin >> 与 getline 时，注意缓冲区里残留的换行。',
                  'std::string 支持 + 拼接、size()、substr()、find() 等操作，比 C 风格字符数组更安全方便。'
                ],
                code: { lang: 'cpp', src: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::getline(std::cin, name);\n    std::cout << "欢迎，" << name << "\\n";\n    return 0;\n}', runnable: false
},
                note: '游戏终端不接收交互输入，关卡中统一使用固定数据或字面量。'
              },
              {
                h: '5. 常见编译问题',
                p: [
                  '忘记分号、头文件缺失、main 返回类型写成 void、字符串用了单引号、中文标点混入代码，都会导致编译失败。',
                  '编译器报错通常从第一条开始修。模板相关的报错可能很长，先看最上面「required from here」的源头。'
                ]
              }
            ],
            terms: [
              { t: '流', en: 'stream', d: 'C++ 中按顺序读写数据的抽象，如 cin、cout。' },
              { t: '命名空间', en: 'namespace', d: '用于组织名称、避免冲突的作用域，如 std。' },
              { t: 'auto', d: '让编译器从初始化表达式推导变量类型的关键字。' },
              { t: 'constexpr', d: '要求表达式在编译期求值的常量声明。' },
              { t: 'std::string', d: 'C++ 标准库提供的动态字符串类型。' }
            ],
            exam: '二级 C++ 高频：cout 链式输出、endl 与 \\n、变量声明、类型转换、string 基本操作、main 的返回值。',
            checklist: ['会写 iostream 程序', '掌握 cout 链式输出', '理解 const 与 auto', '知道 string 与字符数组的区别']
          }
        },
        {
          id: 'cpp-1-3', type: 'battle', title: '遭遇 · 锈蚀史莱姆', jp: '錆のスライム', xp: 60,
          enemy: {
            name: '锈蚀史莱姆', kind: 'slime', hp: 100,
            title: '影兽 · 读数污染者', taunt: '你的类型……和读数对不上。',
            lore: '它腐蚀了炉心的仪表盘。两行类型正确的输出，就能让齿轮重新咬合。'
          },
          brief: '炉心需要重新校准。用 cout 输出两行：HP=100 和 ATK=8.5。',
          tasks: [
            {
              prompt: '使用 std::cout 输出两行：第一行 HP=100，第二行 ATK=8.5。每行都要换行。',
              requirement: '预期输出：HP=100 / ATK=8.5',
              expected: 'HP=100\nATK=8.5',
              starter: '#include <iostream>\n\nint main() {\n    // 输出两行状态\n    return 0;\n}\n',
              hints: [
                '第一行：std::cout << "HP=" << 100 << "\\n";',
                '第二行把 8.5 直接输出，double 默认就会显示小数。',
                '两行都要有换行，顺序不能反。'
              ],
              solution: '#include <iostream>\n\nint main() {\n    std::cout << "HP=" << 100 << "\\n";\n    std::cout << "ATK=" << 8.5 << "\\n";\n    return 0;\n}',
              must: { re: 'cout\\s*<<', text: '必须使用 cout 输出' }
            }
          ],
          outro: '仪表盘重新亮起，齿轮一节节咬合。史莱姆被蒸发成一缕带着铁锈味的白烟。',
          loot: LS.makeLoot('uncommon', '校准扳手', 'weapon', '⚒', '扳手刻度上印着 <<。它不制造力量，只让每一份力量被准确读出。', 'cpp')
        }
      ]
    },
    {
      id: 'cpp-2', title: '第二章 · 熔炉回廊', jp: '溶鉱炉の回廊',
      subtitle: '让判断与循环成为机械的节拍', summary: '条件、循环、范围 for 与流程控制。',
      nodes: [
        {
          id: 'cpp-2-1', type: 'story', title: '过热的传送带', jp: '過熱のベルト', xp: 15,
          lines: [
            { who: '薇拉', tone: 'ally', text: '传送带每转一圈就多一份热量。我们必须算清 1 到 100 圈的总热负荷，才能设置熔炉的阈值。' },
            { who: '界灵·零', tone: 'guide', text: '循环是机械的节拍。先写一个稳定、可终止的循环，再谈优化。' },
            { who: '熔渣狼', tone: 'enemy', text: '转啊，转啊。停不下来，就永远停不下来。' },
            { who: '薇拉', tone: 'ally', text: '所以循环必须有明确的终止条件。' }
          ]
        },
        {
          id: 'cpp-2-2', type: 'lesson', title: '分支、循环与范围 for', jp: '分岐と循環', xp: 30, minutes: 17,
          article: {
            lead: 'C++ 的流程控制与 C 基本一致，但多了范围 for 与更丰富的初始化写法。写循环时，先保证边界正确，再考虑风格。',
            sections: [
              {
                h: '1. 条件与逻辑',
                p: [
                  'if/else if/else 根据条件选择分支。条件最终转换为 bool。&&、||、! 分别表示与、或、非，并具有短路求值特性。',
                  'C++ 中 = 是赋值，== 是比较。把比较写成赋值通常仍能编译，但会产生错误逻辑，务必注意。'
                ],
                code: { lang: 'cpp', src: 'int hp = 35;\nif (hp <= 0) {\n    std::cout << "倒下\\n";\n} else if (hp < 40) {\n    std::cout << "危险\\n";\n} else {\n    std::cout << "安全\\n";\n}' }
              },
              {
                h: '2. for 与 while',
                p: [
                  'for 把初始化、条件、更新写在一起，适合次数确定的循环。while 适合条件驱动的循环。do-while 至少执行一次。',
                  'C++11 起可以在 for 中声明循环变量：for (int i = 0; i < n; ++i)。++i 与 i++ 独立成句时效果相同，前者通常更自然。'
                ],
                code: { lang: 'cpp', src: 'int total = 0;\nfor (int i = 1; i <= 100; ++i) {\n    total += i;\n}\nstd::cout << total << "\\n";' }
              },
              {
                h: '3. 范围 for',
                p: [
                  'for (int v : arr) 依次取出容器中的每个元素。使用引用 for (int& v : arr) 可以修改原元素，使用 const 引用可以避免复制。',
                  '范围 for 适合完整遍历。如果需要下标、需要跳过元素或倒序遍历，传统 for 更合适。'
                ],
                code: { lang: 'cpp', src: '#include <vector>\n\nstd::vector<int> dmg = {8, 15, 3, 9};\nint total = 0;\nfor (int v : dmg) {\n    total += v;\n}\nstd::cout << total << "\\n";' }
              },
              {
                h: '4. break、continue 与嵌套',
                p: [
                  'break 结束当前层循环，continue 跳过本轮。嵌套循环中它们只影响最内层。需要一次跳出多层时，应重构逻辑或使用标志变量。',
                  '打印图形、遍历矩阵、组合枚举都常用嵌套循环。先确定外层控制什么、内层控制什么。'
                ],
                code: { lang: 'cpp', src: 'for (int i = 1; i <= 4; ++i) {\n    for (int j = 1; j <= i; ++j) {\n        std::cout << "*";\n    }\n    std::cout << "\\n";\n}' }
              },
              {
                h: '5. 循环的边界与复杂度',
                p: [
                  '数组下标从 0 开始，合法范围是 0 到 size - 1。循环条件写 i <= size 是经典越界错误。',
                  '单层循环通常是 O(n)，嵌套两层是 O(n²)。数据量变大时，先看能否减少重复计算，而不是盲目优化语法。'
                ]
              }
            ],
            terms: [
              { t: '范围 for', en: 'range-based for', d: 'C++11 起用于遍历容器的简洁循环写法。' },
              { t: '短路求值', en: 'short-circuit evaluation', d: '逻辑表达式在结果已确定时跳过后续求值。' },
              { t: '引用', en: 'reference', d: '变量的别名，声明时用 &，不产生新的对象副本。' },
              { t: '越界', en: 'out of bounds', d: '访问容器合法范围之外的元素。' },
              { t: '时间复杂度', en: 'time complexity', d: '描述运行时间随数据规模增长的趋势。' }
            ],
            exam: '二级 C++ 高频：for 执行次数、break/continue、范围 for、数组边界、嵌套循环输出图形、运算符优先级。',
            checklist: ['会写 if/for/while', '掌握范围 for', '能正确控制数组边界', '会用嵌套循环输出图形']
          }
        },
        {
          id: 'cpp-2-3', type: 'battle', title: '遭遇 · 熔渣狼', jp: 'スラグウルフ', xp: 60,
          enemy: {
            name: '熔渣狼', kind: 'wolf', hp: 100,
            title: '影兽 · 过热者', taunt: '再快一点。快到停不下来。',
            lore: '它靠失控的循环积蓄热量。一个边界正确的累加循环，能让熔炉重新进入稳定节拍。'
          },
          brief: '计算传送带 1 到 100 圈的总热负荷并输出，为熔炉设置阈值。',
          tasks: [
            {
              prompt: '使用 for 或 while 循环计算 1 到 100（含 100）的总和并输出。必须出现循环结构。',
              requirement: '预期输出：5050',
              expected: '5050',
              starter: '#include <iostream>\n\nint main() {\n    int total = 0;\n    // 用循环累加 1 到 100\n    return 0;\n}\n',
              hints: [
                '循环可以写 for (int i = 1; i <= 100; ++i)。',
                '循环体内 total += i;。',
                '循环结束后 std::cout << total << "\\n";。'
              ],
              solution: '#include <iostream>\n\nint main() {\n    int total = 0;\n    for (int i = 1; i <= 100; ++i) {\n        total += i;\n    }\n    std::cout << total << "\\n";\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' }
            }
          ],
          outro: '熔炉的指针稳稳停在 5050。热浪退去，传送带重新以均匀的节拍转动。',
          loot: LS.makeLoot('rare', '节拍齿轮', 'relic', '⚙', '齿轮每转一圈都精确复现上一圈。它不追求更快，只追求可预测。', 'cpp')
        }
      ]
    },
    {
      id: 'cpp-3', title: '第三章 · 容器庭院', jp: '容器の庭',
      subtitle: '让数据住在合适的容器里', summary: 'vector、函数、引用与 STL 入门。',
      nodes: [
        {
          id: 'cpp-3-1', type: 'story', title: '散落的零件', jp: '散らばる部品', xp: 15,
          lines: [
            { who: '薇拉', tone: 'ally', text: '三箱零件散落在庭院里，编号分别是 5、10、15。自动傀儡正在把它们胡乱塞进错误的槽位。' },
            { who: '界灵·零', tone: 'guide', text: 'vector 是会自动增长的数组。把零件放进 vector，再遍历求和，庭院就会恢复秩序。' },
            { who: '自动傀儡', tone: 'enemy', text: '容量……容量不足。重新分配。重新分配。' },
            { who: '薇拉', tone: 'ally', text: '告诉它正确的容器，它就不会再乱。' }
          ]
        },
        {
          id: 'cpp-3-2', type: 'lesson', title: 'vector、函数与引用', jp: 'ベクタと関数', xp: 30, minutes: 21,
          article: {
            lead: 'C++ 的标准模板库（STL）提供了大量经过验证的容器与算法。学会用 vector、string、map，比手写所有底层结构更能提高效率。',
            sections: [
              {
                h: '1. std::vector',
                p: [
                  'vector 是动态数组，支持随机访问与自动扩容。push_back 在尾部添加，size 返回元素个数，empty 判断是否为空，clear 清空。',
                  '下标访问不检查越界；at() 会检查并在越界时抛出异常。遍历时优先使用范围 for 或 size_t 类型的下标。'
                ],
                code: { lang: 'cpp', src: '#include <vector>\n#include <iostream>\n\nstd::vector<int> dmg = {5, 10, 15};\ndmg.push_back(20);\nint total = 0;\nfor (int v : dmg) {\n    total += v;\n}\nstd::cout << total << "\\n";' }
              },
              {
                h: '2. 函数与默认参数',
                p: [
                  '函数由返回类型、名称、参数和函数体组成。C++ 支持函数重载：同名函数可以有不同的参数列表。',
                  '默认参数必须从右往左连续提供。函数声明与定义中，默认值只能写一次，通常写在声明里。'
                ],
                code: { lang: 'cpp', src: 'int heal(int hp, int amount = 20) {\n    return hp + amount;\n}\n\nstd::cout << heal(80) << "\\n";\nstd::cout << heal(80, 5) << "\\n";' }
              },
              {
                h: '3. 值传递、引用与 const 引用',
                p: [
                  '默认按值传递，会复制实参。参数写成 int& 是引用传递，函数内修改会影响外部变量。const int& 既避免复制，又保证不修改。',
                  '传递大对象（如 vector、string）时，通常使用 const 引用，兼顾性能与安全。'
                ],
                code: { lang: 'cpp', src: 'void boost(int& hp) {\n    hp += 10;\n}\n\nint total(const std::vector<int>& nums) {\n    int s = 0;\n    for (int v : nums) s += v;\n    return s;\n}', runnable: false
}
              },
              {
                h: '4. string 与 map',
                p: [
                  'std::string 是动态字符串，支持 +、size()、substr()、find()。std::map 是按键有序的关联容器，std::unordered_map 是哈希表，平均查找更快。',
                  'map 的 operator[] 在键不存在时会插入默认值；如果只想查询，用 find() 或 count()。'
                ],
                code: { lang: 'cpp', src: '#include <map>\n#include <string>\n\nstd::map<std::string, int> bag;\nbag["苦无"] = 15;\nbag["毒刃"] = 30;\nstd::cout << bag["苦无"] + bag["毒刃"] << "\\n";' }
              },
              {
                h: '5. 迭代器与算法',
                p: [
                  'STL 算法通过迭代器工作。std::sort、std::find、std::accumulate 等可以避免大量手写循环。',
                  '使用算法前先确认头文件与命名空间。理解区间是左闭右开 [begin, end)，是读懂 STL 的关键。'
                ],
                code: { lang: 'cpp', src: '#include <algorithm>\n#include <vector>\n\nstd::vector<int> v = {9, 3, 7};\nstd::sort(v.begin(), v.end());\nfor (int x : v) std::cout << x << " ";', runnable: false
}
              }
            ],
            terms: [
              { t: 'vector', d: '可动态扩容的顺序容器，支持随机访问。' },
              { t: '引用传递', en: 'pass by reference', d: '形参是实参的别名，函数内修改会影响外部。' },
              { t: 'const 引用', d: '只读引用，避免复制且禁止修改。' },
              { t: 'STL', d: 'C++ 标准模板库，包含容器、算法、迭代器等。' },
              { t: '迭代器', en: 'iterator', d: '用于遍历容器元素的通用指针式对象。' }
            ],
            exam: '二级 C++ 高频：vector 基本操作、函数重载、引用参数、const 引用、map 的键值访问、sort 的使用。',
            checklist: ['会使用 vector 增删遍历', '理解值传递与引用传递', '会写带默认参数的函数', '知道 map 的基本用法']
          }
        },
        {
          id: 'cpp-3-3', type: 'battle', title: '遭遇 · 自动傀儡', jp: '自動傀儡', xp: 60,
          enemy: {
            name: '自动傀儡', kind: 'construct', hp: 100,
            title: '造物 · 错位装配者', taunt: '容量不足。正在重新分配。正在……',
            lore: '它把零件塞进错误的槽位。用 vector 正确容纳三份零件并求和，能让装配线恢复秩序。'
          },
          brief: '三箱零件 [5, 10, 15] 散落在庭院。用 vector 与循环求总和，重新校准装配线。',
          tasks: [
            {
              prompt: '给定 std::vector<int> parts = {5, 10, 15}; 用循环遍历并输出总和。必须使用 vector 与循环。',
              requirement: '预期输出：30',
              expected: '30',
              starter: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> parts = {5, 10, 15};\n    int total = 0;\n    // 遍历 vector 并累加\n    return 0;\n}\n',
              hints: [
                '使用范围 for：for (int v : parts)。',
                '循环体内 total += v;。',
                '最后 std::cout << total << "\\n";。'
              ],
              solution: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> parts = {5, 10, 15};\n    int total = 0;\n    for (int v : parts) {\n        total += v;\n    }\n    std::cout << total << "\\n";\n    return 0;\n}',
              must: { re: 'vector\\s*<[^>]+>\\s+\\w+', text: '必须使用 vector' }
            }
          ],
          outro: '傀儡把最后一枚零件放进正确的槽位，眼中的红光转为安静的绿。庭院里的齿轮声第一次整齐得像呼吸。',
          loot: LS.makeLoot('epic', '容器之心', 'relic', '◈', '一颗会自动扩容的晶体。它提醒你：好的结构，应该随内容一起成长。', 'cpp')
        }
      ]
    },
    {
      id: 'cpp-4', title: '第四章 · 巨像熔炉', jp: '終章・巨像炉',
      subtitle: '用对象与继承锻造最后的机械', summary: '类、继承、多态与内存；挑战 Boss。',
      nodes: [
        {
          id: 'cpp-4-1', type: 'story', title: '苏醒的巨像', jp: '目覚めた巨像', xp: 15,
          lines: [
            { who: '薇拉', tone: 'ally', text: '巨像原本是工坊的守护机械。它的控制类被篡改，现在只会重复最后一句话：销毁。' },
            { who: '界灵·零', tone: 'guide', text: '终战需要两次精确构造：从五份残响中找出最大值，再用嵌套循环画出四层构装纹。' },
            { who: '巨像', tone: 'enemy', text: '销毁。销毁。销毁。' },
            { who: '薇拉', tone: 'ally', text: '它没有坏，只是继承了一条错误的指令。找到最大值，就是找到覆盖它的入口。' }
          ]
        },
        {
          id: 'cpp-4-2', type: 'lesson', title: '类、继承与内存', jp: 'クラスと継承と記憶', xp: 30, minutes: 25,
          article: {
            lead: 'C++ 的核心抽象是类：把数据与操作绑定在一起，并通过构造、析构管理资源。理解对象的生命周期，才能真正掌控性能。',
            sections: [
              {
                h: '1. 类与对象',
                p: [
                  'class 定义类型，包含成员变量与成员函数。public 成员可被外部访问，private 成员只能由类内部访问。构造函数在对象创建时执行，析构函数在销毁时执行。',
                  '成员函数定义在类内默认内联，定义在类外要用 类名::函数名。const 成员函数承诺不修改对象状态。'
                ],
                code: { lang: 'cpp', src: 'class Knight {\npublic:\n    std::string name;\n    int hp;\n\n    Knight(std::string n, int h) : name(n), hp(h) {}\n\n    void hit(int dmg) {\n        hp -= dmg;\n        if (hp < 0) hp = 0;\n    }\n};', runnable: false
}
              },
              {
                h: '2. 继承与多态',
                p: [
                  '派生类用 : public Base 继承基类。子类可以复用基类的成员，也可以重写虚函数。虚函数通过 virtual 声明，配合基类指针/引用实现运行时多态。',
                  '基类的析构函数如果可能被继承使用，应声明为 virtual，否则通过基类指针删除派生对象时可能资源泄漏。'
                ],
                code: { lang: 'cpp', src: 'class Unit {\npublic:\n    virtual void speak() { std::cout << "unit\\n"; }\n    virtual ~Unit() {}\n};\n\nclass Mage : public Unit {\npublic:\n    void speak() override { std::cout << "mage\\n"; }\n};', runnable: false
}
              },
              {
                h: '3. 构造、析构与 RAII',
                p: [
                  'RAII（资源获取即初始化）是 C++ 管理资源的核心思想：在构造函数中获取资源，在析构函数中释放。对象离开作用域时，析构自动发生。',
                  '智能指针 unique_ptr 与 shared_ptr 用 RAII 管理堆内存，避免手写 delete。优先使用它们，而不是裸指针。'
                ],
                code: { lang: 'cpp', src: '#include <memory>\n\nstd::unique_ptr<int> p = std::make_unique<int>(42);\nstd::cout << *p << "\\n";', runnable: false
}
              },
              {
                h: '4. 模板入门',
                p: [
                  '模板让同一段代码适配多种类型。template <typename T> T maxOf(T a, T b) 会在使用时按类型实例化。',
                  '模板是 C++ 泛型编程的基础，STL 的 vector、map、sort 都建立在模板之上。初学阶段先会使用，再理解推导与特化。'
                ],
                code: { lang: 'cpp', src: 'template <typename T>\nT maxOf(T a, T b) {\n    return a > b ? a : b;\n}\n\nstd::cout << maxOf(3, 9) << "\\n";', runnable: false
}
              },
              {
                h: '5. 内存与常见陷阱',
                p: [
                  '栈对象自动释放，堆对象需要手动或由智能指针释放。悬空指针、重复释放、数组越界、忘记初始化，都是 C++ 的常见风险。',
                  '调试内存问题时，可以借助 AddressSanitizer、Valgrind 等工具。写代码时优先使用标准容器与智能指针，减少裸内存操作。'
                ]
              }
            ],
            terms: [
              { t: '构造函数', en: 'constructor', d: '对象创建时自动执行的初始化函数。' },
              { t: '析构函数', en: 'destructor', d: '对象销毁时自动执行的清理函数。' },
              { t: '多态', en: 'polymorphism', d: '同一接口在不同类型上表现出不同行为。' },
              { t: 'RAII', d: '用对象生命周期自动管理资源的 C++ 惯用法。' },
              { t: '智能指针', en: 'smart pointer', d: '自动管理堆内存生命周期的指针封装。' }
            ],
            exam: '二级 C++ 高频：构造/析构顺序、public/private、继承、虚函数、引用与指针、new/delete、vector 与 map。',
            checklist: ['会定义类与构造函数', '理解继承与虚函数', '知道析构与资源释放', '能使用 vector 与智能指针']
          }
        },
        {
          id: 'cpp-4-3', type: 'battle', title: '终战 · 巨像熔炉', jp: '巨像炉', xp: 120,
          enemy: {
            name: '巨像熔炉', kind: 'golem', hp: 100, boss: true,
            title: '首领 · 错误指令的继承者', taunt: '销毁。这是我从上一代继承的唯一命令。',
            lore: '它被一条错误的重写指令控制。只有精确的遍历与嵌套构造，才能覆盖那条指令，让巨像重新成为守护者。'
          },
          brief: '终战分两段。先找出五份残响中的最大值；再用嵌套循环画出四层构装纹。两段完成，巨像停机重启。',
          tasks: [
            {
              prompt: '第一击：给定 int dmg[5] = {9, 3, 27, 14, 6}; 用循环找出最大值并输出。',
              requirement: '预期输出：27',
              expected: '27',
              starter: '#include <iostream>\n\nint main() {\n    int dmg[5] = {9, 3, 27, 14, 6};\n    int max = dmg[0];\n    // 遍历剩余元素，更新最大值\n    return 0;\n}\n',
              hints: [
                '从下标 1 遍历到 4：for (int i = 1; i < 5; ++i)。',
                '如果 dmg[i] > max，就更新 max。',
                '循环结束后 std::cout << max << "\\n";。'
              ],
              solution: '#include <iostream>\n\nint main() {\n    int dmg[5] = {9, 3, 27, 14, 6};\n    int max = dmg[0];\n    for (int i = 1; i < 5; ++i) {\n        if (dmg[i] > max) {\n            max = dmg[i];\n        }\n    }\n    std::cout << max << "\\n";\n    return 0;\n}',
              must: { re: '\\[[^\\]]*\\][\\s\\S]*(for|while)\\s*\\(', text: '必须使用数组与循环' }
            },
            {
              prompt: '第二击：用嵌套循环输出 4 行构装纹。第 1 行 1 个星号，第 2 行 2 个，依此类推，第 4 行 4 个。每行结束后换行。',
              requirement: '预期输出 4 行，逐行增加一个 *',
              expected: '*\n**\n***\n****',
              starter: '#include <iostream>\n\nint main() {\n    // 外层控制行，内层控制星号数量\n    return 0;\n}\n',
              hints: [
                '外层循环 for (int i = 1; i <= 4; ++i)。',
                '内层循环 for (int j = 1; j <= i; ++j)，每次输出一个 *。',
                '内层结束后输出 "\\n" 换行。'
              ],
              solution: '#include <iostream>\n\nint main() {\n    for (int i = 1; i <= 4; ++i) {\n        for (int j = 1; j <= i; ++j) {\n            std::cout << "*";\n        }\n        std::cout << "\\n";\n    }\n    return 0;\n}',
              must: { re: '(for|while)\\s*\\([\\s\\S]*(for|while)\\s*\\(', text: '必须使用嵌套循环' }
            }
          ],
          outro: '最大值 27 写入控制核心，构装纹在巨像胸口亮起。它缓缓单膝跪下，说出重启后的第一句话：「守护程序，已恢复。」',
          loot: LS.makeLoot('mythic', '炉心构装锤', 'weapon', '❖', '锤头里封着一枚不会熄灭的炉心。它不承诺永不损坏，只承诺每次损坏后都能被重新构造。', 'cpp')
        }
      ]
    }
  ]
});
