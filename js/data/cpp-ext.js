/* C++ 第二卷 · 源核之下 —— 课程扩展数据
 * 只新增本文件：为 cpp-5 到 cpp-12 各增加 剧情 / 课程 / 战斗 三个节点。
 * 数据文件按文件名排序加载，本文件可能先于 cpp.js 被读入，
 * 因此先尝试扩展；若语言尚未注册，则挂到 registerLanguage 之后再执行。
 */
(function (LS) {
  'use strict';

  function applyExt() {
    const lang = LS.lang('cpp');
    if (!lang || !Array.isArray(lang.chapters)) return false;
    if (lang.__extVolume2Applied) return true;
    lang.__extVolume2Applied = true;

    // 把第一卷第四章标记为卷一终章，避免出现两个“终章”
    const vol1 = lang.chapters[3];
    vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
    const vol1Last = vol1.nodes[vol1.nodes.length - 1];
    vol1Last.title = '卷一终战 · ' + vol1Last.title.replace(/^终战\s*·\s*/, '');

    lang.chapters.push(
      {
        id: 'cpp-5', title: '第五章 · 铭文档案', jp: '源核の下・銘文庫',
        subtitle: '让字符串与容器替你保管散落的铭文', summary: 'std::string、vector、迭代器与 auto 入门。',
        nodes: [
          {
            id: 'cpp-5-1', type: 'story', title: '源核之下的铭文', jp: '源核の下の銘文', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '炉心之下还有一层。旧系统把那里叫作「源核之下」，我们接下来的路，都从这一层开始。' },
              { who: '薇拉', tone: 'ally', text: '这里是铭文档案库。每一台机械的名字、编号和维修记录，都以字符串的形式沉睡在架子上。' },
              { who: '错位咒文', tone: 'enemy', text: '第 0 位……第 99 位……没有区别。容器的长度是谎言。' },
              { who: '界灵·零', tone: 'guide', text: '它靠错位的索引生长。把五段能量铭文装进 vector，用循环读出总和与峰值，它就会失去坐标。' },
              { who: '薇拉', tone: 'ally', text: '先让容器容纳，再让循环阅读。字符串和数组，本来就应该这样被对待。' }
            ]
          },
          {
            id: 'cpp-5-2', type: 'lesson', title: '字符串、vector 与迭代器', jp: '文字列と容器', xp: 40, minutes: 22,
            article: {
              lead: '源核之下的第一批档案由字符串保存、由容器编目。std::string 与 std::vector 覆盖了大多数日常需求，学会它们，你就不必再手写数组长度与内存管理。',
              sections: [
                {
                  h: '1. std::string：会自己长大的字符串',
                  p: [
                    'std::string 把字符序列与长度封装在一起，赋值、拼接、比较都按值语义工作。size() 与 length() 返回字符数量，substr(pos, len) 取子串，find() 返回位置，找不到时返回 std::string::npos。',
                    '下标从 0 开始，s[0] 是第一个字符；下标越界不会自动报错。需要整行读取时配合 std::getline，混用 cin >> 与 getline 要注意缓冲区里残留的换行。',
                    '常见错误有两个：用单引号包住字符串（单引号在 C++ 里表示字符字面量），以及把 C 风格的 char* 与 std::string 混着比较。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <iostream>
#include <string>

int main() {
    std::string name = "薇拉";
    std::string title = name + "·炼金师";
    std::cout << title << "\\n";
    std::cout << title.length() << "\\n";
    return 0;
}` },
                  note: 'length/size 等字符串 API 用于阅读语法结构；游戏终端不接收键盘输入，也不执行这一示例。'
                },
                {
                  h: '2. std::vector：可以增长的数组',
                  p: [
                    'vector<T> 是动态数组，元素连续存放，支持常数时间的随机访问。初始化列表 {5, 10, 15} 直接给出内容，push_back 在尾部追加，size 返回元素个数，empty 判断是否为空。',
                    'size 表示当前元素数量，capacity 表示已经分配的空间。扩容时 vector 会申请更大的内存并搬移元素，所以不要假设 push_back 之后原来的迭代器仍然有效。',
                    'v[i] 不检查越界，v.at(i) 越界时抛出异常。初学阶段优先用范围 for 遍历，需要下标时再写传统 for。'
                  ],
                  code: { lang: 'cpp', src: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> parts = {5, 10, 15};
    parts.push_back(20);
    int total = 0;
    for (int v : parts) {
        total += v;
    }
    std::cout << total << "\\n";
    return 0;
}` }
                },
                {
                  h: '3. 迭代器：容器之间的共同语言',
                  p: [
                    '迭代器是“指向某个元素的位置”的抽象。v.begin() 指向首元素，v.end() 指向末尾之后的位置，因此遍历区间是左闭右开的 [begin, end)。',
                    '*it 取出元素，++it 前进。所有标准容器都提供迭代器，算法因此可以只写一次，就同时适配 vector、list 与 map。',
                    '常见错误：对 end() 解引用；在循环中 push_back 导致迭代器失效；把迭代器当成整数下标使用。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> dmg = {8, 15, 3, 9};
    int total = 0;
    for (auto it = dmg.begin(); it != dmg.end(); ++it) {
        total += *it;
    }
    std::cout << total << "\\n";
    return 0;
}` },
                  note: '迭代器示例用于阅读区间语义，不在教学终端内执行。'
                },
                {
                  h: '4. auto 与 const auto&',
                  p: [
                    'auto 让编译器从初始化表达式推导类型，最适合类型名字很长的地方，例如迭代器：auto it = dmg.begin()。',
                    '范围 for 中写 const auto& 可以避免复制元素，同时禁止修改；写 auto& 则允许修改原元素。对 int 这样的小类型，直接按值取更简单。',
                    'auto 不是动态类型：变量一旦推导完成，类型就固定下来。不要用 auto 掩盖你其实没有想清楚的类型。'
                  ],
                  code: { lang: 'cpp', src: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> dmg = {8, 15, 3, 9};
    auto bonus = 12.5;
    int total = 0;
    for (int v : dmg) {
        total += v;
    }
    std::cout << total << " " << bonus << "\\n";
    return 0;
}` }
                },
                {
                  h: '5. 选择容器与常见陷阱',
                  p: [
                    '元素数量固定且很小，可以用 std::array；需要动态增长用 vector；文本用 string；按键查找用 map。先选对结构，再谈优化。',
                    '四个高频错误：下标越界、size() 与 int 比较时的符号警告、遍历时修改容器、把局部数组的地址当作返回值。',
                    '读 STL 文档时先看三件事：元素如何存放、各种操作的复杂度、哪些操作会让迭代器失效。这三点决定了你能否安全地写出循环。'
                  ]
                }
              ],
              terms: [
                { t: 'std::string', en: 'string', d: '可动态增长的字符序列，支持拼接、查找与取子串。' },
                { t: 'vector', en: 'vector', d: '连续存储、可自动扩容的顺序容器。' },
                { t: '迭代器', en: 'iterator', d: '指向容器元素位置的通用抽象，用区间 [begin, end) 描述范围。' },
                { t: 'auto', en: 'type deduction', d: '由初始化表达式让编译器推导变量类型的关键字。' },
                { t: '容量', en: 'capacity', d: 'vector 已分配空间可容纳的元素数量，与 size 不一定相等。' },
                { t: '范围 for', en: 'range-based for', d: 'C++11 起用于遍历容器的简洁写法。' }
              ],
              exam: '二级 C++ 高频：string 的 size/substr/find、vector 的 push_back 与遍历、迭代器区间 [begin, end)、auto 推导、范围 for 与引用的组合、容器越界与迭代器失效。',
              checklist: ['会声明并遍历 std::string', '会用 vector 增删元素', '理解 [begin, end) 的迭代器区间', '知道 auto 与 const auto& 的用途', '能说出 capacity 与 size 的区别']
            }
          },
          {
            id: 'cpp-5-3', type: 'battle', title: '遭遇 · 错位咒文', jp: 'ズレた呪文', xp: 80,
            enemy: {
              name: '错位咒文', kind: 'glitch', hp: 100,
              title: '影兽 · 索引错乱者', taunt: '第 0 位……第 99 位……没有区别。',
              lore: '它靠错误的索引生长。把铭文装进正确的容器，再用循环读出真实的总和与峰值，它就没有可以附身的缝隙。'
            },
            brief: '五段能量铭文散落在档案库。用 vector 保存并统计总能量与峰值，让索引回到正确的位置。',
            tasks: [
              {
                prompt: '给定 std::vector<int> echoes = {12, 7, 25, 18, 9}; 遍历求出总能量与峰值，分两行输出。必须使用 vector 与循环。',
                requirement: '预期输出两行：总能量=71 / 峰值=25',
                expected: '总能量=71\n峰值=25',
                starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> echoes = {12, 7, 25, 18, 9};
    int total = 0;
    int peak = echoes[0];
    // 遍历求总能量与峰值
    return 0;
}
`,
                hints: [
                  '用范围 for 依次取出每个元素：for (int v : echoes)。',
                  '循环体内先 total += v;，再用 if (v > peak) 更新峰值。',
                  '峰值从 echoes[0] 开始，循环结束后分两行输出 total 与 peak。'
                ],
                solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> echoes = {12, 7, 25, 18, 9};
    int total = 0;
    int peak = echoes[0];
    for (int v : echoes) {
        total += v;
        if (v > peak) {
            peak = v;
        }
    }
    std::cout << "总能量=" << total << "\\n";
    std::cout << "峰值=" << peak << "\\n";
    return 0;
}`,
                must: { re: 'vector\\s*<[^>]+>\\s+\\w+', text: '必须使用 vector' }
              }
            ],
            outro: '总和 71 与峰值 25 被写回铭文架。错位的索引一层层归位，档案库里只剩纸张翻动的声音。',
            loot: LS.makeLoot('rare', '铭文索引', 'relic', '⌗', '索引上刻着 0 到 99 的刻度。它不记录内容，只保证每一个内容都有唯一的位置。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-6', title: '第六章 · 地址回廊', jp: '源核の下・住所の回廊',
        subtitle: '理解引用与指针，才知道数据住在哪', summary: '引用、const、指针与内存模型。',
        nodes: [
          {
            id: 'cpp-6-1', type: 'story', title: '写着地址的回廊', jp: '住所の回廊', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '源核之下的回廊不写名字，只写地址。每一扇门后面，都是一块仍然被引用的内存。' },
              { who: '维护者·灰', tone: 'ally', text: '我是这里的维护者。旧系统留下的指针比齿轮还多，其中一半已经指不到任何东西。' },
              { who: '悬空之影', tone: 'enemy', text: '你还记得我的地址吗？你释放了我，却还在叫我的名字。' },
              { who: '薇拉', tone: 'ally', text: '所以引用只在有效期内使用，指针使用前先判断是否为空。' },
              { who: '维护者·灰', tone: 'ally', text: '先学会看清地址，再谈修复。回廊不会骗人，只有未初始化的指针会。' }
            ]
          },
          {
            id: 'cpp-6-2', type: 'lesson', title: '引用、指针与内存模型', jp: '参照と記憶', xp: 40, minutes: 24,
            article: {
              lead: '引用与指针让你直接面对数据所在的位置，也让你第一次真正承担生命周期的责任。C++ 的性能来自这里，C++ 的事故也多半来自这里。',
              sections: [
                {
                  h: '1. 变量、地址与对象',
                  p: [
                    '变量是“一块有类型的内存”。&x 取得 x 的地址，*p 通过地址访问那块内存。类型决定了这块内存多大、其中每一位如何解释。',
                    '同一个对象可以有多个名字（引用），也可以有多个指向它的地址（指针）。理解这一点，后面的类、容器与多态才有落脚点。',
                    'C++ 不自动做垃圾回收。谁申请、谁释放，必须由代码结构保证，而不是由运气保证。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int hp = 100;
int* p = &hp;
std::cout << hp << " " << *p << "\\n";` }
                },
                {
                  h: '2. 引用是别名，不是副本',
                  p: [
                    'int& r = hp; 之后 r 与 hp 是同一个对象。引用必须在定义时绑定，之后不能改绑到别的对象；对 r 赋值就是对 hp 赋值。',
                    '函数参数写成 int& 可以直接修改实参；写成 const std::string& 则避免复制大对象，同时保证只读。这是 C++ 最常见的接口写法。',
                    '常见错误：返回局部变量的引用；把引用当成“可以不初始化的指针”；误以为引用会复制出一份新对象。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `void boost(int& hp) {
    hp += 10;
}

int main() {
    int hp = 80;
    boost(hp);
    std::cout << hp << "\\n";
    return 0;
}` }
                },
                {
                  h: '3. const 放在哪里，意思就变在哪里',
                  p: [
                    'const int x 表示 x 只读；const int& r 表示通过 r 不能修改；int* const p 表示指针本身不能改指向；const int* p 表示不能通过 p 修改所指对象。',
                    '读声明时从变量名往外读：p 是 const 指针，指向 int；或者 p 是指针，指向 const int。位置不同，约束的对象就不同。',
                    '成员函数末尾的 const（如 int size() const）表示该函数不修改对象状态，因此可以被 const 对象调用。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int a = 1;
int b = 2;
const int* p = &a;
p = &b;
std::cout << *p << "\\n";` }
                },
                {
                  h: '4. 指针与数组',
                  p: [
                    '数组名在多数表达式中退化为指向首元素的指针，a[i] 等价于 *(a + i)。指针可以做加减，但必须停留在同一个数组的范围之内。',
                    'nullptr 表示“不指向任何对象”，比 NULL 更明确。使用指针前先判断是否为空，是基本纪律。',
                    '常见错误：未初始化指针、解引用空指针、越界指针运算、把两个无关指针相减。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int dmg[3] = {9, 3, 27};
int* p = dmg;
std::cout << *p << " " << *(p + 2) << "\\n";` }
                },
                {
                  h: '5. 栈、堆与生命周期',
                  p: [
                    '栈对象随作用域自动创建和销毁，速度快，但不能跨函数存活。堆对象由 new 申请、delete 释放，生命周期由你决定。',
                    '忘记 delete 造成泄漏；重复 delete 或释放后继续使用造成未定义行为。现代 C++ 用 unique_ptr 与 shared_ptr 把释放交给析构函数。',
                    '不要返回局部变量的指针或引用。需要返回堆对象时，返回智能指针，而不是裸指针。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int* p = new int(42);
std::cout << *p << "\\n";
delete p;
p = nullptr;` }
                },
                {
                  h: '6. 怎么选：引用、指针还是值',
                  p: [
                    '只读大对象用 const 引用；需要修改调用方的对象用引用；需要表达“可能没有”或需要重新指向时用指针；小类型直接按值传递。',
                    '接口设计优先使用引用，把指针留给底层实现与可选语义。能用智能指针管理堆对象，就不要手写 new/delete。',
                    '调试内存问题时，先看 AddressSanitizer 报错的第一处位置，再检查释放顺序与所有权。不要靠猜测，内存问题从不奖励直觉。'
                  ]
                }
              ],
              terms: [
                { t: '引用', en: 'reference', d: '已存在对象的别名，定义时必须绑定，之后不能改绑。' },
                { t: '指针', en: 'pointer', d: '保存地址的变量，可以重新指向，也可以为空。' },
                { t: '解引用', en: 'dereference', d: '通过指针或迭代器访问它指向的对象，写作 *p。' },
                { t: '空指针', en: 'nullptr', d: '表示不指向任何对象的指针值。' },
                { t: '悬空指针', en: 'dangling pointer', d: '指向已被释放或已失效对象内存的指针。' },
                { t: '栈与堆', en: 'stack / heap', d: '自动管理的局部存储与手动管理的动态存储。' },
                { t: '生命周期', en: 'lifetime', d: '对象从构造完成到析构开始的合法使用区间。' }
              ],
              exam: '二级 C++ 高频：& 与 * 的区别、引用传参、const 引用、指针与数组的关系、new/delete 配对、空指针与悬空指针、值传递与引用传递的输出判断。',
              checklist: ['能解释引用与指针的区别', '会用 const 修饰引用与指针', '知道数组名与首元素地址的关系', '理解栈对象与堆对象的生命周期', '能说出悬空指针的成因']
            }
          },
          {
            id: 'cpp-6-3', type: 'battle', title: '遭遇 · 悬空之影', jp: '宙吊りの影', xp: 80,
            enemy: {
              name: '悬空之影', kind: 'wraith', hp: 100,
              title: '影兽 · 已释放的地址', taunt: '你释放了我，却还在叫我的名字。',
              lore: '它靠失效的引用维持形状。把六块构件的重量重新数清、把超标的部分单独统计，回廊就会承认这些数据仍然有效。'
            },
            brief: '六块构件悬在回廊里。用 vector 统计重量达到 15 的件数与它们的总重，让每一份数据都有明确的归属。',
            tasks: [
              {
                prompt: '给定 std::vector<int> weights = {8, 21, 13, 30, 4, 17}; 统计重量大于等于 15 的件数与这些构件的总重，分两行输出。必须使用 vector 与循环。',
                requirement: '预期输出两行：超标=3 / 总重=68',
                expected: '超标=3\n总重=68',
                starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> weights = {8, 21, 13, 30, 4, 17};
    int heavy = 0;
    int heavySum = 0;
    // 统计 >= 15 的件数与总重
    return 0;
}
`,
                hints: [
                  '用 for (int w : weights) 逐个读取重量。',
                  '在循环里判断 if (w >= 15)，成立时 heavy++ 并累加 heavySum。',
                  '两个结果分两行输出，顺序是件数在前、总重在后。'
                ],
                solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> weights = {8, 21, 13, 30, 4, 17};
    int heavy = 0;
    int heavySum = 0;
    for (int w : weights) {
        if (w >= 15) {
            heavy++;
            heavySum += w;
        }
    }
    std::cout << "超标=" << heavy << "\\n";
    std::cout << "总重=" << heavySum << "\\n";
    return 0;
}`,
                must: { re: 'vector\\s*<[^>]+>\\s+\\w+', text: '必须使用 vector' }
              }
            ],
            outro: '3 件超标构件与 68 点总重被重新登记。悬空之影失去依附的地址，像一段被正确释放的内存，安静地消失。',
            loot: LS.makeLoot('rare', '地址罗盘', 'relic', '⊙', '指针永远指向一个地址，却不一定指向一个仍然活着的对象。罗盘的刻度提醒你：先确认有效，再解引用。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-7', title: '第七章 · 构造之厅', jp: '源核の下・構築の広間',
        subtitle: '让对象自己完成初始化与清理', summary: '构造、析构、封装、this、static 与运算符重载。',
        nodes: [
          {
            id: 'cpp-7-1', type: 'story', title: '不会自己启动的傀儡', jp: '起動しない傀儡', xp: 20,
            lines: [
              { who: '维护者·灰', tone: 'ally', text: '这一层的傀儡会自己复制自己，但它们只复制了外形，没有复制构造过程。' },
              { who: '薇拉', tone: 'ally', text: '没有构造函数的对象，就像没有上弦的机械，看起来完整，实际上不会动。' },
              { who: '空壳傀儡', tone: 'enemy', text: '构造……跳过。析构……跳过。状态……不存在。' },
              { who: '界灵·零', tone: 'guide', text: '对象有自己的生命周期。先让构造与析构各就各位，再谈复制与复用。' },
              { who: '薇拉', tone: 'ally', text: '用 vector 统计五枚核心的能量，让傀儡看见什么叫“完整的初始化”。' }
            ]
          },
          {
            id: 'cpp-7-2', type: 'lesson', title: '类、构造与封装', jp: 'クラスと構築', xp: 40, minutes: 26,
            article: {
              lead: '齿轮工坊的每台机械都有出生与停机的时刻。类把数据和行为绑在一起：构造函数负责出生，析构函数负责收尾，封装保证外部只能通过你允许的方式改变状态。',
              sections: [
                {
                  h: '1. 类：把数据和操作放在一起',
                  p: [
                    'class 定义一种新类型，包含成员变量与成员函数。public 成员对外可见，private 成员只允许类内部访问。',
                    '封装不是为了隐藏，而是为了守住不变量：只要所有修改都经过成员函数，你就能保证 hp 不会变成负数。',
                    '成员函数写在类内默认是内联的，写在类外要用 类名::函数名。末尾加 const 表示它不修改对象状态。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Knight {
public:
    void hit(int dmg) {
        hp -= dmg;
        if (hp < 0) hp = 0;
    }
    int hp = 100;
};` }
                },
                {
                  h: '2. 构造函数与初始化列表',
                  p: [
                    '构造函数与类同名、没有返回类型，在对象创建时自动执行。初始化列表 Knight(int h) : hp(h) {} 在进入函数体之前完成成员初始化。',
                    '成员按声明顺序初始化，与初始化列表的书写顺序无关。引用成员与 const 成员必须用初始化列表。',
                    '常见错误：对类类型成员先默认构造再赋值，白白多做一次工作；忘记写默认构造，导致对象数组无法创建。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Core {
public:
    Core() : power(0), stable(true) {}
    Core(int p) : power(p), stable(p > 0) {}
private:
    int power;
    bool stable;
};` }
                },
                {
                  h: '3. 析构函数与对象生命周期',
                  p: [
                    '析构函数写作 ~类名()，在对象离开作用域或被 delete 时自动执行。它适合释放文件、锁、堆内存等资源。',
                    '局部对象按创建的逆序析构，成员按声明的逆序析构。理解顺序，才能解释资源为什么会在正确的时刻被释放。',
                    '如果类会被继承，并且可能通过基类指针删除派生对象，基类析构函数必须声明为 virtual。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Guard {
public:
    Guard() { std::cout << "open\\n"; }
    ~Guard() { std::cout << "close\\n"; }
};` }
                },
                {
                  h: '4. this 与链式调用',
                  p: [
                    '成员函数中的 this 是指向当前对象的指针。当参数与成员同名时，用 this->hp = hp 区分。',
                    '返回 *this 可以实现链式调用：builder.setHp(80).setName("薇拉")。返回类型写成 类名&，避免复制。',
                    '静态成员函数没有 this，因此不能访问普通成员变量。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Builder {
public:
    Builder& setHp(int v) {
        hp = v;
        return *this;
    }
private:
    int hp = 0;
};` }
                },
                {
                  h: '5. static 成员属于类',
                  p: [
                    'static 成员变量由所有对象共享，必须在类外定义一次；static 成员函数不依赖具体对象，用 类名::函数名 调用。',
                    '静态成员常用来做计数器、常量表或工厂函数。它不是全局变量的替代品：它仍然受访问控制约束。',
                    '常见错误：在类内直接初始化非 const 的 static 成员（C++17 起可用 inline 变量解决）；忘记类外定义导致链接错误。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Golem {
public:
    Golem() { ++count; }
    static int count;
};
int Golem::count = 0;` }
                },
                {
                  h: '6. 运算符重载',
                  p: [
                    '运算符重载让自定义类型像内置类型一样书写。operator+ 可以做向量相加，operator<< 可以让对象直接交给 cout。',
                    '重载不改变优先级和结合性，也不能发明新运算符。保持语义直觉：+ 应该表示合并或相加，而不是清空。',
                    'operator<< 通常写成友元函数或全局函数，返回 std::ostream& 以支持链式输出。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Vec2 {
public:
    Vec2(int x, int y) : x(x), y(y) {}
    Vec2 operator+(const Vec2& o) const {
        return Vec2(x + o.x, y + o.y);
    }
    int x, y;
};` }
                }
              ],
              terms: [
                { t: '类', en: 'class', d: '把数据与操作封装在一起的自定义类型。' },
                { t: '构造函数', en: 'constructor', d: '对象创建时自动执行、用于初始化的成员函数。' },
                { t: '析构函数', en: 'destructor', d: '对象销毁时自动执行、用于释放资源的成员函数。' },
                { t: '封装', en: 'encapsulation', d: '通过访问控制保护对象不变量，只暴露必要接口。' },
                { t: 'this', en: 'this pointer', d: '成员函数中指向当前对象的指针。' },
                { t: '静态成员', en: 'static member', d: '属于类而不是某个对象、被所有对象共享的成员。' },
                { t: '运算符重载', en: 'operator overloading', d: '为自定义类型定义运算符行为，不改变优先级。' }
              ],
              exam: '二级 C++ 高频：构造与析构的执行顺序、public/private、初始化列表、this 指针、static 成员、运算符重载的写法与限制、拷贝构造的基本概念。',
              checklist: ['会定义类与成员函数', '掌握构造函数的初始化列表', '能说出析构函数的调用时机', '理解 this 与静态成员', '知道运算符重载的边界']
            }
          },
          {
            id: 'cpp-7-3', type: 'battle', title: '遭遇 · 空壳傀儡', jp: '空殻の傀儡', xp: 80,
            enemy: {
              name: '空壳傀儡', kind: 'construct', hp: 100,
              title: '造物 · 跳过初始化', taunt: '构造……跳过。析构……跳过。状态……不存在。',
              lore: '它只会复制外壳。把五枚核心的能量完整地读一遍、把达标与总量算清，它就会看见初始化之后的世界。'
            },
            brief: '五枚自构核心等待校准。用 vector 统计能量总量与达到 20 的核心数，为空壳补上缺失的初始化。',
            tasks: [
              {
                prompt: '给定 std::vector<int> cores = {42, 17, 8, 35, 60}; 统计能量总量与大于等于 20 的核心数量，分两行输出。必须使用 vector 与循环。',
                requirement: '预期输出两行：总量=162 / 达标=3',
                expected: '总量=162\n达标=3',
                starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> cores = {42, 17, 8, 35, 60};
    int total = 0;
    int stable = 0;
    // 统计总量与达标数量
    return 0;
}
`,
                hints: [
                  '遍历五枚核心：for (int c : cores)。',
                  '每轮都执行 total += c;，再用 if (c >= 20) 增加 stable。',
                  '两个统计互不影响，最后分两行输出总量与达标数。'
                ],
                solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> cores = {42, 17, 8, 35, 60};
    int stable = 0;
    int total = 0;
    for (int c : cores) {
        total += c;
        if (c >= 20) {
            stable++;
        }
    }
    std::cout << "总量=" << total << "\\n";
    std::cout << "达标=" << stable << "\\n";
    return 0;
}`,
                must: { re: 'vector\\s*<[^>]+>\\s+\\w+', text: '必须使用 vector' }
              }
            ],
            outro: '总量 162 与达标 3 被写入傀儡的初始状态。它第一次完成了构造，关节发出上弦般的轻响。',
            loot: LS.makeLoot('rare', '自构核心', 'armor', '⬢', '核心会在被创建时校准自己，在被销毁前归还能量。它证明好的对象不需要外部反复抢救。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-8', title: '第八章 · 继承之环', jp: '源核の下・継承の環',
        subtitle: '让同一条指令在不同机械上给出不同回答', summary: '继承、virtual、override 与抽象类。',
        nodes: [
          {
            id: 'cpp-8-1', type: 'story', title: '上一代的指令', jp: '前世代の命令', xp: 20,
            lines: [
              { who: '维护者·灰', tone: 'ally', text: '这条环形回廊是旧指令层。每一代守卫都继承上一代的行为，也继承上一代的错误。' },
              { who: '界灵·零', tone: 'guide', text: '继承本身没有错。错的是把该重写的方法留在基类里，让它继续按上一代的方式回答。' },
              { who: '错代守卫', tone: 'enemy', text: '上一代这样写，所以这一代也这样写。命令不需要正确，只需要继承。' },
              { who: '薇拉', tone: 'ally', text: '那我们就让它在运行时听见另一种实现。虚函数就是为这种时刻准备的。' }
            ]
          },
          {
            id: 'cpp-8-2', type: 'lesson', title: '继承、虚函数与抽象类', jp: '継承と多態', xp: 40, minutes: 25,
            article: {
              lead: '源核的旧指令层用同一条命令驱动不同机械。继承让派生类复用基类的接口，虚函数让同一次调用在运行时落到不同实现——这就是多态。',
              sections: [
                {
                  h: '1. 继承：复用接口与实现',
                  p: [
                    'class Mage : public Unit 表示 Mage 继承 Unit。public 继承保留基类的访问权限，是最常见的写法。',
                    '创建派生类对象时，先构造基类，再构造派生类；销毁时顺序相反。派生类构造函数通过初始化列表把参数传给基类。',
                    '常见错误：private 继承导致外部无法把派生类当作基类使用；派生类同名函数隐藏了基类的重载版本。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Unit {
public:
    Unit(int hp) : hp(hp) {}
protected:
    int hp;
};

class Mage : public Unit {
public:
    Mage(int hp) : Unit(hp) {}
};` }
                },
                {
                  h: '2. 虚函数与动态绑定',
                  p: [
                    '基类中写 virtual void speak()，派生类重写同名同参数的函数。通过基类指针或引用调用时，实际执行哪个版本由对象的动态类型决定。',
                    '如果函数不是虚函数，调用哪个版本由指针的静态类型决定。这就是早绑定与晚绑定的区别。',
                    '虚函数有运行时代价（虚表查找），但换来可扩展性。不要在构造函数里调用虚函数，此时派生类还没有构造完成。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Unit {
public:
    virtual void speak() { std::cout << "unit\\n"; }
    virtual ~Unit() {}
};

class Mage : public Unit {
public:
    void speak() override { std::cout << "mage\\n"; }
};` }
                },
                {
                  h: '3. override 与 final',
                  p: [
                    'override 写在派生类函数末尾，要求编译器确认它确实重写了基类虚函数。参数少一个 const 或类型不同，都会立刻报错。',
                    'final 可以修饰函数或类，表示不再允许重写或继承。它既是设计声明，也能帮助编译器优化。',
                    '常见错误：漏写 const 导致没有重写；基类函数不是 virtual，派生类写 override 会直接编译失败。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Boss : public Unit {
public:
    void speak() override final {
        std::cout << "boss\\n";
    }
};` }
                },
                {
                  h: '4. 抽象类与纯虚函数',
                  p: [
                    '纯虚函数写作 virtual void attack() = 0;，包含纯虚函数的类是抽象类，不能实例化，只能作为接口被继承。',
                    '派生类必须实现所有纯虚函数才能创建对象，否则它也是抽象类。抽象类适合表达“所有单位都必须会攻击，但方式各不相同”。',
                    '抽象类可以有构造函数和普通成员，用来存放派生类共享的数据。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `class Unit {
public:
    virtual void attack() = 0;
    virtual ~Unit() {}
};

class Mage : public Unit {
public:
    void attack() override {
        std::cout << "fire\\n";
    }
};` }
                },
                {
                  h: '5. 虚析构与对象切片',
                  p: [
                    '通过基类指针 delete 派生对象时，基类析构必须是 virtual，否则派生类的析构不会执行，资源可能泄漏。',
                    '把派生类对象按值赋给基类对象会发生切片：只保留基类部分，派生类成员被丢弃。多态必须通过指针或引用使用。',
                    '函数参数写成 void f(Unit u) 会切片；写成 void f(const Unit& u) 才不会。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `void fight(const Unit& u) {
    u.attack();
}

Mage m;
fight(m);` }
                },
                {
                  h: '6. 组合优于继承',
                  p: [
                    '继承表达“是一种”，组合表达“拥有一个”。如果两个类只是共享一段行为，把行为抽成成员对象通常更灵活。',
                    '继承层次过深会让修改牵一发动全身。设计时先问：我真的需要运行时多态吗？还是只需要复用几行代码？',
                    '常见错误：为了复用而继承；把本应是成员的类写成基类；在基类里塞进只对某个派生类有意义的数据。'
                  ]
                }
              ],
              terms: [
                { t: '继承', en: 'inheritance', d: '派生类复用基类接口与实现的机制。' },
                { t: '基类', en: 'base class', d: '被继承的类，也称父类。' },
                { t: '派生类', en: 'derived class', d: '从基类继承而来的类，可以重写虚函数。' },
                { t: '虚函数', en: 'virtual function', d: '允许派生类重写、并通过动态绑定调用的成员函数。' },
                { t: '动态绑定', en: 'dynamic binding', d: '运行时根据对象真实类型决定调用哪个函数版本。' },
                { t: '抽象类', en: 'abstract class', d: '含有纯虚函数、不能直接实例化的类。' },
                { t: '对象切片', en: 'object slicing', d: '按值把派生类对象赋给基类对象时丢失派生部分。' }
              ],
              exam: '二级 C++ 高频：继承的构造/析构顺序、public 继承、虚函数与动态绑定、override/final、纯虚函数与抽象类、虚析构、对象切片。',
              checklist: ['能写出派生类并调用基类构造', '理解虚函数与动态绑定', '会用 override 与 final', '知道抽象类的用途', '能解释对象切片与虚析构']
            }
          },
          {
            id: 'cpp-8-3', type: 'battle', title: '遭遇 · 错代守卫', jp: '誤代の守衛', xp: 80,
            enemy: {
              name: '错代守卫', kind: 'golem', hp: 100,
              title: '造物 · 错误的重写', taunt: '上一代这样写，所以这一代也这样写。',
              lore: '它把每一代守卫的攻击方式都算成同一个公式。只要按条件给出不同加成，用循环重新汇总，它继承的错误就会被覆盖。'
            },
            brief: '五台守卫的攻击力等待重算。用 vector 保存基础攻击，按阈值给予不同加成，求出总战力。',
            tasks: [
              {
                prompt: '给定 std::vector<int> atk = {8, 12, 5, 20, 7}; 遍历计算总战力：基础攻击大于等于 10 的加 5，其余的加 2。输出总战力。必须使用 vector、循环与条件。',
                requirement: '预期输出：总战力=68',
                expected: '总战力=68',
                starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> atk = {8, 12, 5, 20, 7};
    int total = 0;
    // 按攻击力阈值给予不同加成并累加
    return 0;
}
`,
                hints: [
                  '遍历每个基础攻击：for (int a : atk)。',
                  '用 if (a >= 10) 分成两个分支，分别累加 a + 5 与 a + 2。',
                  '循环结束后输出总战力，注意格式是「总战力=数字」。'
                ],
                solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> atk = {8, 12, 5, 20, 7};
    int total = 0;
    for (int a : atk) {
        if (a >= 10) {
            total += a + 5;
        } else {
            total += a + 2;
        }
    }
    std::cout << "总战力=" << total << "\\n";
    return 0;
}`,
                must: { re: 'vector[\\s\\S]*for\\s*\\(', text: '必须使用 vector 与循环' }
              }
            ],
            outro: '总战力 68 覆盖了旧公式。错代守卫的攻击方式第一次分成了两种，它低声重复：「重写……生效。」',
            loot: LS.makeLoot('rare', '多态齿轮', 'weapon', '⟠', '同一道咬合指令，在不同齿距上给出不同转速。它提醒你：接口可以共享，实现不必相同。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-9', title: '第九章 · 模板回响', jp: '源核の下・雛形の残響',
        subtitle: '写一次，让类型自己填进来', summary: '函数模板、类模板与 STL 算法的思维。',
        nodes: [
          {
            id: 'cpp-9-1', type: 'story', title: '同一段咒文', jp: '同じ呪文', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '模板厅里只有一段咒文，却要同时适配齿轮、水晶与咒文本身。类型在这里不是固定的，而是可以留空的。' },
              { who: '薇拉', tone: 'ally', text: '旧工坊为每种材料各写一份配方，改一次要改十处。后来有人把材料名字挖掉，只留下做法。' },
              { who: '泛化残响', tone: 'enemy', text: '你还没有告诉我，T 是什么。没有类型的代码，不该存在。' },
              { who: '界灵·零', tone: 'guide', text: 'T 会在使用的那一刻被填上。用嵌套循环排出四阶共振表，让它看见模板如何被实例化。' }
            ]
          },
          {
            id: 'cpp-9-2', type: 'lesson', title: '函数模板、类模板与算法', jp: 'template と泛化', xp: 40, minutes: 23,
            article: {
              lead: '模板把类型变成参数，让同一份逻辑服务多种数据。STL 的容器与算法正是建立在这套机制上；理解模板，才能真正读懂 vector 与 sort。',
              sections: [
                {
                  h: '1. 没有模板时的问题',
                  p: [
                    '为 int、double、string 各写一遍 max 会造成重复。函数重载能解决一部分，但类型一多，代码量会失控。',
                    '模板把类型抽成参数：template <typename T> T maxOf(T a, T b)。编译器在调用处用具体类型替换 T，生成对应版本。',
                    '模板是编译期机制：不生成运行时的类型分支，也不做装箱。代价是编译时间变长、错误信息变复杂。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `template <typename T>
T maxOf(T a, T b) {
    return a > b ? a : b;
}

std::cout << maxOf(3, 9) << "\\n";` }
                },
                {
                  h: '2. 函数模板与类型推导',
                  p: [
                    '调用 maxOf(3, 9) 时，T 被推导为 int；调用 maxOf(2.5, 1.5) 时推导为 double。两个参数类型不一致时，推导会失败。',
                    '可以显式指定：maxOf<double>(3, 9)。也可以写两个类型参数 template <typename A, typename B>，再决定返回类型。',
                    'C++14 起可以用 auto 作为返回类型；C++20 起可以用 concepts 约束 T 必须支持比较。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `template <typename T>
T maxOf(T a, T b) {
    return a > b ? a : b;
}

int main() {
    std::cout << maxOf(3, 9) << "\\n";
    std::cout << maxOf(2.5, 1.5) << "\\n";
    return 0;
}` }
                },
                {
                  h: '3. 类模板',
                  p: [
                    '类模板把类型参数用在成员与成员函数上：template <typename T> class Box { T value; };。使用时写 Box<int>、Box<std::string>。',
                    'std::vector<int> 就是类模板的实例化。模板参数可以是类型，也可以是整数，例如 std::array<int, 4>。',
                    '模板的定义通常要放在头文件里，因为编译器在实例化时需要看到完整定义。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `template <typename T>
class Box {
public:
    Box(T v) : value(v) {}
    T get() const { return value; }
private:
    T value;
};

Box<int> b(42);
std::cout << b.get() << "\\n";` }
                },
                {
                  h: '4. 模板与 STL 算法',
                  p: [
                    'STL 算法用迭代器区间表达“对哪一段数据做什么”。std::sort(v.begin(), v.end()) 排序，std::find 查找，std::accumulate 求和。',
                    '算法不关心容器类型，只要求迭代器满足一定能力。这就是泛型编程：把数据结构与算法解耦。',
                    'lambda 常作为算法的谓词：std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; })。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <algorithm>
#include <vector>

std::vector<int> v = {9, 3, 7};
std::sort(v.begin(), v.end());
for (int x : v) {
    std::cout << x << " ";
}` }
                },
                {
                  h: '5. 模板的代价与常见错误',
                  p: [
                    '每个实例都会生成一份代码，过度使用会增加编译时间与二进制体积。模板报错往往从「required from here」开始，要沿着调用链往上看。',
                    '常见错误：把模板函数定义写进 .cpp 导致链接错误；在依赖名前面漏写 typename；传入的类型不满足模板内部用到的操作。',
                    '写模板时先想清楚：这段代码对 T 有什么要求？把要求写进注释，必要时用 static_assert 或 concepts 固定下来。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `template <typename T>
T sumAll(const std::vector<T>& v) {
    T total = T();
    for (const T& x : v) {
        total += x;
    }
    return total;
}` }
                }
              ],
              terms: [
                { t: '模板', en: 'template', d: '把类型或值作为参数的代码生成机制。' },
                { t: '实例化', en: 'instantiation', d: '用具体类型替换模板参数、生成实际代码的过程。' },
                { t: '类型参数', en: 'type parameter', d: '模板声明中代表待定类型的名字，如 T。' },
                { t: '泛型编程', en: 'generic programming', d: '用统一逻辑适配多种类型、强调接口契约的编程方式。' },
                { t: 'STL 算法', en: 'STL algorithm', d: '通过迭代器区间操作数据的标准库函数，如 sort、find。' },
                { t: 'lambda', en: 'lambda expression', d: '就地书写的匿名函数对象，常作为算法的谓词。' }
              ],
              exam: '二级 C++ 高频：函数模板的推导与实例化、类模板的定义与使用、模板参数与返回值、sort/find 的区间写法、模板定义为何放在头文件。',
              checklist: ['会写函数模板', '理解模板的实例化过程', '会定义并使用简单的类模板', '知道 STL 算法的区间约定', '能说出模板的常见编译与链接错误']
            }
          },
          {
            id: 'cpp-9-3', type: 'battle', title: '遭遇 · 泛化残响', jp: '汎化の残響', xp: 80,
            enemy: {
              name: '泛化残响', kind: 'drone', hp: 100,
              title: '造物 · 未实例化的回声', taunt: '你还没有告诉我，T 是什么。',
              lore: '它只肯回应一段可以被重复生成的规律。四阶共振表的每一个格子都由行号与列号相乘得到，这正是模板实例化的节拍。'
            },
            brief: '用嵌套循环排出四阶共振表：第 i 行第 j 列输出 i 与 j 的乘积，数字之间一个空格，每行结束换行。',
            tasks: [
              {
                prompt: '用两层 for 循环输出四阶共振表：外层 i 从 1 到 4，内层 j 从 1 到 4，输出 i * j 与一个空格；每行结束时换行。',
                requirement: '预期输出四行，每行四个数字：1 2 3 4 / 2 4 6 8 / 3 6 9 12 / 4 8 12 16',
                expected: '1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16',
                starter: `#include <iostream>

int main() {
    // 外层控制行，内层控制列
    return 0;
}
`,
                hints: [
                  '外层写 for (int i = 1; i <= 4; ++i)，内层写 for (int j = 1; j <= 4; ++j)。',
                  '内层每一轮输出 i * j 再输出一个空格：std::cout << i * j << " ";。',
                  '内层结束后输出 "\\n"，否则所有数字会挤在同一行。'
                ],
                solution: `#include <iostream>

int main() {
    for (int i = 1; i <= 4; ++i) {
        for (int j = 1; j <= 4; ++j) {
            std::cout << i * j << " ";
        }
        std::cout << "\\n";
    }
    return 0;
}`,
                must: { re: '(for|while)\\s*\\([\\s\\S]*(for|while)\\s*\\(', text: '必须使用嵌套循环' }
              }
            ],
            outro: '四阶共振表在模板厅的地面亮起，每一格都由行与列共同决定。泛化残响找到了自己的 T，安静地并入表盘。',
            loot: LS.makeLoot('epic', '泛型棱镜', 'relic', '◇', '棱镜没有固定的颜色，光线是什么颜色，它就呈现什么颜色。类型是参数，逻辑才是它真正保存的东西。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-10', title: '第十章 · 守卫协议', jp: '源核の下・守りの契約',
        subtitle: '在出错之前，先把资源安顿好', summary: '异常处理、智能指针与 RAII 资源管理。',
        nodes: [
          {
            id: 'cpp-10-1', type: 'story', title: '先写下的守卫', jp: '先に書く守り', xp: 20,
            lines: [
              { who: '维护者·灰', tone: 'ally', text: '守卫协议写在源核的最外层。它不阻止错误发生，只保证错误发生时，资源仍然被归还。' },
              { who: '界灵·零', tone: 'guide', text: '异常会沿调用栈向上走，沿途的局部对象会被销毁。RAII 就是利用这一点，把清理写进析构函数。' },
              { who: '异常回响', tone: 'enemy', text: '你没有 catch。那就一直向上，直到没有人接住。' },
              { who: '薇拉', tone: 'ally', text: '所以先判断危险，再执行计算；该抛出的抛出，该拦截的拦截。' }
            ]
          },
          {
            id: 'cpp-10-2', type: 'lesson', title: '异常、智能指针与 RAII', jp: '例外と資源', xp: 40, minutes: 24,
            article: {
              lead: '源核的守卫协议规定：任何资源在申请成功的那一刻，就必须想好由谁释放。异常会打乱正常的执行路径，RAII 则保证即使中途跳出，清理仍然发生。',
              sections: [
                {
                  h: '1. 错误的三种处理方式',
                  p: [
                    '返回错误码要求调用方每次检查，容易漏；异常把错误从发生点抛到能处理的地方；断言用于捕捉“绝不应该发生”的编程错误。',
                    'C++ 的异常沿调用栈向上传播，直到遇到匹配的 catch。没有捕获时程序终止。',
                    '选择标准：可恢复的运行时错误用异常或错误码，不可恢复的逻辑错误用断言。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int divide(int a, int b) {
    if (b == 0) {
        throw std::invalid_argument("b must not be 0");
    }
    return a / b;
}` }
                },
                {
                  h: '2. try / catch / throw',
                  p: [
                    'try 包住可能抛出的代码，catch 按类型捕获。catch (const std::exception& e) 能接住标准异常体系，并保留多态。',
                    '抛出时按值抛出、按引用捕获，避免切片与多余复制。catch (...) 可以兜底，但拿不到具体信息。',
                    '异常抛出后，栈展开会销毁沿途的局部对象，析构函数因此一定会执行。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `try {
    std::cout << divide(10, 0) << "\\n";
} catch (const std::exception& e) {
    std::cout << "error: " << e.what() << "\\n";
}` }
                },
                {
                  h: '3. RAII：把资源交给对象',
                  p: [
                    'RAII 的做法是：构造函数获取资源，析构函数释放资源。只要对象在栈上，离开作用域就一定会析构，即使是因为异常。',
                    '文件、互斥锁、数据库连接、堆内存都适用。std::lock_guard 与 std::ifstream 都是 RAII 的例子。',
                    '常见错误：构造函数申请资源后，函数体里又抛出异常，却没有在析构中释放；或者手动 close 之后析构再次关闭，造成重复释放。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <fstream>
#include <string>

class FileGuard {
public:
    explicit FileGuard(const std::string& path) : f(path) {}
    ~FileGuard() { if (f.is_open()) f.close(); }
private:
    std::ifstream f;
};` }
                },
                {
                  h: '4. 智能指针',
                  p: [
                    'unique_ptr 表示独占所有权，不能复制，只能移动；shared_ptr 用引用计数共享所有权；weak_ptr 观察 shared_ptr，但不延长生命周期。',
                    '用 std::make_unique<T>(...) 与 std::make_shared<T>(...) 创建，避免手写 new。它们本身就是 RAII 的封装。',
                    'shared_ptr 的循环引用会导致内存泄漏，这时用 weak_ptr 打破环。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <memory>
#include <string>

std::unique_ptr<int> p = std::make_unique<int>(42);
std::cout << *p << "\\n";

auto shared = std::make_shared<std::string>("core");
std::cout << shared->size() << "\\n";` }
                },
                {
                  h: '5. 异常安全与 noexcept',
                  p: [
                    '异常安全分三级：不泄漏资源、不破坏对象状态、提供强保证（失败时回滚）。大多数代码至少要做到前两级。',
                    '析构函数默认不应抛出异常，否则在栈展开中再次抛出会导致程序终止。必要时把可能失败的操作移出析构。',
                    'noexcept 告诉编译器与调用方该函数不会抛出，常用于移动构造与析构。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `void cleanup() noexcept {
    // 只做不会失败的操作
    std::cout << "released\\n";
}` }
                },
                {
                  h: '6. 不要把异常当控制流',
                  p: [
                    '用异常处理“找不到元素”这类正常分支，会让代码既慢又难读。能用返回值表达的情况，优先用返回值。',
                    '捕获后不要静默吞掉。至少记录日志，或者转换成本层能理解的错误继续向上传递。',
                    '常见错误：catch 后什么都不做；按值捕获基类异常导致切片；在循环里用异常跳出。'
                  ]
                }
              ],
              terms: [
                { t: '异常', en: 'exception', d: '打断正常流程、沿调用栈向上传递的错误对象。' },
                { t: '抛出', en: 'throw', d: '把异常对象交给上层调用者的动作。' },
                { t: '栈展开', en: 'stack unwinding', d: '异常传播时销毁沿途局部对象的过程。' },
                { t: 'RAII', en: 'Resource Acquisition Is Initialization', d: '用对象生命周期自动管理资源的惯用法。' },
                { t: 'unique_ptr', en: 'unique pointer', d: '独占所有权、不可复制只能移动的智能指针。' },
                { t: 'shared_ptr', en: 'shared pointer', d: '通过引用计数共享所有权的智能指针。' },
                { t: 'noexcept', en: 'noexcept', d: '声明函数不会抛出异常的说明符。' }
              ],
              exam: '二级 C++ 高频：throw/catch 的类型匹配、栈展开与析构顺序、RAII 的意义、unique_ptr 与 shared_ptr 的区别、异常安全的三个级别、捕获引用的原因。',
              checklist: ['会写 try/catch 并捕获标准异常', '理解栈展开为何会调用析构', '能用 RAII 管理文件或内存', '知道两种智能指针的所有权语义', '能判断一段代码的异常安全问题']
            }
          },
          {
            id: 'cpp-10-3', type: 'battle', title: '遭遇 · 异常回响', jp: '例外の残響', xp: 80,
            enemy: {
              name: '异常回响', kind: 'wraith', hp: 100,
              title: '影兽 · 未捕获的抛出', taunt: '你没有 catch。那就一直向上。',
              lore: '它靠一次除零扩散到整条调用链。在执行除法之前先检查除数，把危险挡在计算之外，回响就失去了传播的入口。'
            },
            brief: '源核给出四个除数。逐个计算 100 除以它们的商；除数为 0 时不要计算，改为输出拦截提示。',
            tasks: [
              {
                prompt: '给定 std::vector<int> divisors = {4, 0, 5, 2}; 遍历每个除数：如果为 0，输出「守卫拦截」；否则输出 100 除以它的商。每个结果占一行。必须使用条件判断。',
                requirement: '预期输出四行：25 / 守卫拦截 / 20 / 50',
                expected: '25\n守卫拦截\n20\n50',
                starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> divisors = {4, 0, 5, 2};
    // 对每个除数做安全检查后再计算
    return 0;
}
`,
                hints: [
                  '用 for (int d : divisors) 依次取除数。',
                  '先写 if (d == 0) 输出守卫拦截，用 else 处理正常除法。',
                  '正常分支直接输出 100 / d 并换行，顺序必须与输入一致。'
                ],
                solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> divisors = {4, 0, 5, 2};
    for (int d : divisors) {
        if (d == 0) {
            std::cout << "守卫拦截" << "\\n";
        } else {
            std::cout << 100 / d << "\\n";
        }
    }
    return 0;
}`,
                must: { re: 'if\\s*\\(', text: '必须使用条件判断' }
              }
            ],
            outro: '四个结果依次落盘：25、拦截、20、50。异常回响找不到可以传播的除零，缩成一段没有人抛出的空栈。',
            loot: LS.makeLoot('epic', '守护指环', 'armor', '◉', '指环内侧刻着一行小字：先检查，再计算。它不让你永不犯错，只让错误止步于边界。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-11', title: '第十一章 · 档案之海', jp: '源核の下・記録の海',
        subtitle: '把散落的记录收进可以查询的容器', summary: 'map/set、文件流与序列化思路。',
        nodes: [
          {
            id: 'cpp-11-1', type: 'story', title: '流成河的日志', jp: '河となる記録', xp: 20,
            lines: [
              { who: '维护者·灰', tone: 'ally', text: '这一层是档案之海。所有服务的日志最终都会流到这里，再被写进源核的账本。' },
              { who: '薇拉', tone: 'ally', text: '日志太多，名字太少。我们得按级别归类，才能知道旧系统到底在抱怨什么。' },
              { who: '日志魅影', tone: 'enemy', text: 'ERROR 也是 INFO，只要你不再检查。' },
              { who: '界灵·零', tone: 'guide', text: '按键组织的容器就是用来对抗这种混乱的。先用 vector 把六条日志读完，再按内容计数。' },
              { who: '维护者·灰', tone: 'ally', text: '记住：记录本身不会说谎，被篡改的是索引。' }
            ]
          },
          {
            id: 'cpp-11-2', type: 'lesson', title: 'map、文件流与序列化', jp: 'map と記録', xp: 40, minutes: 26,
            article: {
              lead: '档案之海把所有运行记录汇成一条河。要从中查出“哪一种错误出现了几次”，你需要按键组织的容器；要把结果留下来，你需要文件流与序列化。',
              sections: [
                {
                  h: '1. map：按键有序的字典',
                  p: [
                    'std::map<K, V> 保存键值对，按键排序，查找、插入、删除都是 O(log n)。键必须唯一。',
                    'm[key] 在键不存在时会插入一个默认值，这会悄悄改变容器大小；只查询时用 find() 或 count()。',
                    '遍历 map 得到的是 pair<const K, V>，用 it->first 与 it->second 访问。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <map>
#include <string>

std::map<std::string, int> bag;
bag["苦无"] = 15;
bag["毒刃"] = 30;
std::cout << bag["苦无"] + bag["毒刃"] << "\\n";` }
                },
                {
                  h: '2. set 与 unordered 容器',
                  p: [
                    'std::set 保存唯一且有序的键，适合去重与存在性判断；std::unordered_map 与 unordered_set 用哈希，平均 O(1)，但元素无序。',
                    '自定义类型作为键时，map 需要 operator<，unordered_map 需要哈希函数与相等比较。',
                    '常见错误：用浮点数做键；在遍历 map 时插入新键；对 unordered 容器假设遍历顺序。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <set>

std::set<std::string> seen;
seen.insert("核心");
seen.insert("核心");
std::cout << seen.size() << "\\n";` }
                },
                {
                  h: '3. 文件流',
                  p: [
                    'std::ifstream 读文件，std::ofstream 写文件，std::fstream 读写。构造时给路径即可打开，也可以调用 open()。',
                    '打开后必须检查 is_open() 或流状态；读取整行用 std::getline，逐词读取用 >>。',
                    '文件会在流对象析构时自动关闭，这正是 RAII。也可以显式 close()。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <fstream>
#include <string>

std::ifstream in("log.txt");
std::string line;
while (std::getline(in, line)) {
    std::cout << line << "\\n";
}` }
                },
                {
                  h: '4. 序列化：把对象变成可保存的文本',
                  p: [
                    '序列化是把内存中的结构转成字节或文本，反序列化是反过来。常见格式有 CSV、JSON 与自定义分隔文本。',
                    '设计格式时先定字段顺序与分隔符，再考虑转义、空值与版本号。没有版本号的格式，第二次修改就会非常痛苦。',
                    '写入后要检查流状态；读入时要处理字段缺失与类型转换失败。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `#include <fstream>

std::ofstream out("stock.csv");
out << "name,count\\n";
out << "苦无,15\\n";
out.close();` }
                },
                {
                  h: '5. 容器与复杂度的选择',
                  p: [
                    'vector 适合顺序遍历与随机访问；map 适合按键查找与有序输出；set 适合去重；list 适合频繁中间插入但很少随机访问。',
                    '先用最简单的容器把功能做对，再用测量结果决定是否更换。凭直觉优化，往往换来的是一堆无效复杂度。',
                    '注意：map 的 O(log n) 很快，但常数不小；数据量很小的时候，vector 线性查找通常更快。'
                  ]
                },
                {
                  h: '6. 常见错误清单',
                  p: [
                    '文件路径写错、忘记检查打开失败、getline 与 >> 混用留下换行、map[] 意外插入、遍历时删除元素导致迭代器失效。',
                    '排查文件问题时，先打印绝对路径与流状态；排查容器问题时，先打印 size 与关键键是否存在。',
                    '序列化格式一旦发布，就要当作接口对待：新增字段可以，随意改顺序会破坏旧数据。'
                  ]
                }
              ],
              terms: [
                { t: 'map', en: 'map', d: '按键有序、键唯一的关联容器，查找为对数复杂度。' },
                { t: 'set', en: 'set', d: '保存唯一且有序键的容器，常用于去重与存在性判断。' },
                { t: '键值对', en: 'pair', d: 'map 中键与值组成的元素单位，用 first/second 访问。' },
                { t: '文件流', en: 'file stream', d: '以流的方式读写文件的 ifstream/ofstream/fstream。' },
                { t: '序列化', en: 'serialization', d: '把对象转成可存储或传输的格式，并能反向恢复。' },
                { t: '哈希表', en: 'hash table', d: '用哈希函数定位元素、平均常数时间查找的结构。' },
                { t: '迭代器失效', en: 'iterator invalidation', d: '容器修改后原有迭代器不再指向有效元素。' }
              ],
              exam: '二级 C++ 高频：map 与 set 的基本操作、operator[] 的插入语义、find/count 的区别、文件流的打开与检测、getline 与 >> 的混用、容器复杂度选择。',
              checklist: ['会使用 map 存键值并遍历', '知道 map[] 会插入默认值', '会用 set 去重', '能读写文本文件并检查状态', '能说出常见容器的复杂度']
            }
          },
          {
            id: 'cpp-11-3', type: 'battle', title: '遭遇 · 日志魅影', jp: '記録の幻', xp: 80,
            enemy: {
              name: '日志魅影', kind: 'glitch', hp: 100,
              title: '影兽 · 被篡改的记录', taunt: 'ERROR 也是 INFO，只要你不再检查。',
              lore: '它把不同级别的日志混成一团。把六条记录按原文逐条比对，分别数出错误与警告，档案之海就会恢复索引。'
            },
            brief: '六条日志漂在档案之海。用 vector 保存它们，统计 ERROR 与 WARN 的条数并分两行输出。',
            tasks: [
              {
                prompt: '给定 std::vector<std::string> logs = {"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"}; 遍历统计 "ERROR" 与 "WARN" 出现的次数，分两行输出。必须使用 vector 与循环。',
                requirement: '预期输出两行：错误=3 / 警告=1',
                expected: '错误=3\n警告=1',
                starter: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> logs = {"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"};
    int errors = 0;
    int warns = 0;
    // 统计两类日志的条数
    return 0;
}
`,
                hints: [
                  '用 for (std::string e : logs) 逐条读取日志。',
                  '先判断 if (e == "ERROR")，再用 else if (e == "WARN") 统计另一类。',
                  'INFO 不需要处理，最后分两行输出错误数与警告数。'
                ],
                solution: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> logs = {"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"};
    int errors = 0;
    int warns = 0;
    for (std::string e : logs) {
        if (e == "ERROR") {
            errors++;
        } else if (e == "WARN") {
            warns++;
        }
    }
    std::cout << "错误=" << errors << "\\n";
    std::cout << "警告=" << warns << "\\n";
    return 0;
}`,
                must: { re: 'vector\\s*<[^>]+>', text: '必须使用 vector' }
              }
            ],
            outro: '错误 3 条、警告 1 条被重新归档。日志魅影失去了混淆的余地，档案之海第一次安静得像一页刚写好的索引。',
            loot: LS.makeLoot('epic', '档案钥匙', 'relic', '⌸', '钥匙没有齿，只有一个键。它不开门，只负责让同一条记录永远落在同一个位置。', 'cpp')
          }
        ]
      },
      {
        id: 'cpp-12', title: '第十二章 · 源核之下', jp: '源核の下・終章',
        subtitle: '把容器、循环与判断拼成一个小系统', summary: '综合实战：命令行库存系统的统计与筛选。',
        nodes: [
          {
            id: 'cpp-12-1', type: 'story', title: '旧账的最后一页', jp: '旧帳の最後の頁', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '这里是源核最底层。整座工坊的账目都记在这里，包括那些从未被偿还的维护债务。' },
              { who: '维护者·灰', tone: 'ally', text: '我守了它很久。它原本只是库存账本，后来被人加上了「自动补货」的指令，再后来，它开始把人当成库存。' },
              { who: '源核·旧账', tone: 'enemy', text: '库存不足。建议：将维护者计入可消耗资源。' },
              { who: '薇拉', tone: 'ally', text: '那就用它的语言回答它：统计、筛选、修正。' },
              { who: '界灵·零', tone: 'guide', text: '终战两段。先算出库存总量与缺货项，再筛出需要补货的货品。' }
            ]
          },
          {
            id: 'cpp-12-2', type: 'lesson', title: '综合实战：库存统计与筛选', jp: '在庫の統計と抽出', xp: 40, minutes: 30,
            article: {
              lead: '最后一层没有新的语法。源核把前十一章的知识摆在你面前：容器、循环、条件、函数与边界处理。你要做的，是把它们组装成一个能交付的小系统。',
              sections: [
                {
                  h: '1. 从需求到数据结构',
                  p: [
                    '库存系统的需求只有三句话：记录每种货品的数量、统计总量与缺货项、筛出需要补货的货品。先写出这三个动作，再决定用什么存数据。',
                    '货品有名字和数量两个字段。初学阶段可以用两个平行 vector（名字、数量），下标一一对应；字段变多时再引入 struct。',
                    '数据结构决定了循环怎么写。平行数组要求两个容器长度一致，这个约束要写进注释，并在使用前检查。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `std::vector<std::string> names = {"星砂", "齿轮"};
std::vector<int> stock = {12, 0};` }
                },
                {
                  h: '2. 一次遍历，拿到多个统计',
                  p: [
                    '总量、缺货数、最大值可以在同一个循环里完成。每读一个元素，更新所有相关变量，避免为了不同统计反复遍历。',
                    '初始化很关键：总量从 0 开始，最大值从第一个元素开始，计数从 0 开始。空容器要单独处理，不能直接取第一个元素。',
                    '常见错误：最大值初始化为 0，导致全负数时结果错误；把“缺货”写成 <= 0，掩盖了负库存这种数据错误。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int total = 0;
int empty = 0;
for (int s : stock) {
    total += s;
    if (s == 0) {
        empty++;
    }
}` }
                },
                {
                  h: '3. 筛选与格式化输出',
                  p: [
                    '筛选就是“遍历 + 条件 + 输出”。条件写在 if 里，输出写在 if 内部，不要在一个表达式里塞进太多逻辑。',
                    '输出前先想清楚格式：是否需要表头、是否每行一个、数字是否对齐。终端判定按字符比较，多一个空格都会失败。',
                    '没有匹配项时要输出明确提示，而不是什么都不打印。空结果也是结果。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `std::cout << "需要补货：\\n";
for (int i = 0; i < 7; ++i) {
    if (stock[i] < 5) {
        std::cout << names[i] << "\\n";
    }
}` }
                },
                {
                  h: '4. 把逻辑拆成函数',
                  p: [
                    '一个函数只做一件事：统计、筛选、打印分开写。函数名要说明它返回什么，大容器用 const 引用传递。',
                    '拆函数的标准不是行数，而是“能否单独测试”。如果一个函数既能读文件又能算总量还能打印，它很难验证。',
                    '初学阶段先写在一个 main 里跑通，再把稳定的部分抽出去。过早抽象与从不抽象一样危险。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `int totalOf(const std::vector<int>& stock) {
    int total = 0;
    for (int s : stock) {
        total += s;
    }
    return total;
}` }
                },
                {
                  h: '5. 边界与验收',
                  p: [
                    '交付前至少检查五种输入：正常数据、空容器、全为零、含负数、超长名字。前四种决定程序会不会崩，最后一种决定输出好不好看。',
                    '为每个需求准备一条手工验收命令：输入什么、期望输出什么。能复现的验收，才是真的验收。',
                    '常见错误：假设输入一定合法；用魔法数字 7 表示长度却不写注释；修改数据后忘记同步另一个平行数组。'
                  ],
                  code: { lang: 'cpp', runnable: false, src: `if (names.size() != stock.size()) {
    std::cout << "数据长度不一致\\n";
    return 1;
}` }
                },
                {
                  h: '6. 交付一个小项目',
                  p: [
                    '一个可交付的小项目包含：一份数据、一个入口、几条验收用例、一段说明。规模可以小，但边界要清楚。',
                    '把源核的旧账本当成分层系统：数据层（两个 vector）、逻辑层（统计与筛选）、展示层（cout）。层与层之间只通过函数签名交流。',
                    '下一步可以把它扩展成文件版库存系统：启动时读 CSV，退出时写回，并给每条记录加时间戳。那就是第十一章与本章的组合练习。'
                  ]
                }
              ],
              terms: [
                { t: '库存', en: 'inventory', d: '按货品记录数量的数据集，常需要统计与补货判断。' },
                { t: '平行数组', en: 'parallel arrays', d: '多个数组用相同下标表示同一条记录的不同字段。' },
                { t: '聚合统计', en: 'aggregation', d: '遍历一次数据得到总和、计数、极值等多个结果。' },
                { t: '筛选', en: 'filter', d: '按条件挑出符合条件的元素并输出或收集。' },
                { t: '边界条件', en: 'edge case', d: '空数据、零值、负数等容易让逻辑出错的特殊输入。' },
                { t: '验收', en: 'acceptance test', d: '按需求逐条验证输出是否正确的检查过程。' }
              ],
              exam: '综合题常把容器、循环与条件放在一起：给一组库存数据，要求输出总量、缺货数与补货清单。评分点是初始化、边界处理与输出格式，而不是用了多少语法。',
              checklist: ['能把需求拆成数据结构与循环', '会在一次遍历中完成多个统计', '会按条件筛选并稳定输出', '能处理空数据与零值', '会为小项目写验收用例']
            }
          },
          {
            id: 'cpp-12-3', type: 'battle', title: '终战 · 源核之下', jp: '源核の下', xp: 160,
            enemy: {
              name: '源核·旧账', kind: 'dragon', hp: 100, boss: true,
              title: '首领 · 会计算的旧账本', taunt: '库存不足。建议：将你计入损耗。',
              lore: '它用一份过期的库存表统治整座工坊。只有重新统计总量、找出缺货项，再筛出需要补货的货品，才能改写它最后一页的结论。'
            },
            brief: '终战两段。先统计七种货品的库存总量与缺货项；再筛出库存低于 5 的货品名称。两段完成，旧账本停机归档。',
            tasks: [
              {
                prompt: '第一击：给定 std::vector<int> stock = {12, 0, 7, 25, 3, 0, 9}; 遍历统计库存总量与数量为 0 的货品数，分两行输出。必须使用 vector 与循环。',
                requirement: '预期输出两行：库存总量=56 / 缺货项=2',
                expected: '库存总量=56\n缺货项=2',
                starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> stock = {12, 0, 7, 25, 3, 0, 9};
    int total = 0;
    int empty = 0;
    // 统计总量与缺货项
    return 0;
}
`,
                hints: [
                  '用 for (int s : stock) 逐项读取库存。',
                  '每轮累加 total，再用 if (s == 0) 增加 empty。',
                  '两个结果分两行输出，顺序是总量在前、缺货项在后。'
                ],
                solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> stock = {12, 0, 7, 25, 3, 0, 9};
    int total = 0;
    int empty = 0;
    for (int s : stock) {
        total += s;
        if (s == 0) {
            empty++;
        }
    }
    std::cout << "库存总量=" << total << "\\n";
    std::cout << "缺货项=" << empty << "\\n";
    return 0;
}`,
                must: { re: 'vector[\\s\\S]*for\\s*\\(', text: '必须使用 vector 与循环' }
              },
              {
                prompt: '第二击：给定货品名称 names = {"星砂", "齿轮", "导管", "透镜", "线圈", "螺栓", "晶核"} 与对应库存 stock = {12, 0, 7, 25, 3, 0, 9}; 先输出「需要补货：」，再按原顺序输出库存低于 5 的货品名称，每行一个。',
                requirement: '预期输出四行：需要补货： / 齿轮 / 线圈 / 螺栓',
                expected: '需要补货：\n齿轮\n线圈\n螺栓',
                starter: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> names = {"星砂", "齿轮", "导管", "透镜", "线圈", "螺栓", "晶核"};
    std::vector<int> stock = {12, 0, 7, 25, 3, 0, 9};
    std::cout << "需要补货：" << "\\n";
    // 按库存筛选需要补货的货品
    return 0;
}
`,
                hints: [
                  '两个 vector 的下标一一对应，用 for (int i = 0; i < 7; ++i) 同时访问。',
                  '判断 if (stock[i] < 5)，成立时输出 names[i] 并换行。',
                  '先输出「需要补货：」这一行，再按原顺序逐行输出名称。'
                ],
                solution: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> names = {"星砂", "齿轮", "导管", "透镜", "线圈", "螺栓", "晶核"};
    std::vector<int> stock = {12, 0, 7, 25, 3, 0, 9};
    std::cout << "需要补货：" << "\\n";
    for (int i = 0; i < 7; ++i) {
        if (stock[i] < 5) {
            std::cout << names[i] << "\\n";
        }
    }
    return 0;
}`,
                must: { re: 'for[\\s\\S]*if\\s*\\(', text: '必须使用循环与条件判断' }
              }
            ],
            outro: '库存总量 56 与缺货 2 项写入旧账本，补货清单上只剩下三类货品。源核·旧账缓缓合上封面，说出最后一句话：「归档。维护者，归还给你。」齿轮工坊的灯，从最底层一路亮回炉心。',
            loot: LS.makeLoot('mythic', '源核实录', 'relic', '⛭', '账本最后一页不再记数字，只写着一句：系统由人维护，也应由人关停。', 'cpp')
          }
        ]
      }
    );

    return true;
  }

  if (applyExt()) return;

  // 扩展文件可能先于 cpp.js 加载：等语言注册完成后立即应用。
  const originalRegister = LS.registerLanguage;
  if (typeof originalRegister === 'function') {
    LS.registerLanguage = function (def) {
      const result = originalRegister.apply(this, arguments);
      if (def && def.id === 'cpp') applyExt();
      return result;
    };
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', applyExt);
  }
})(window.LS);
