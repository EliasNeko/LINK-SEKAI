/* Java 第二卷 · 源核之下 —— 字符串、数组、对象、继承、异常、集合、I/O 与实战 */
(function (LS) {
  'use strict';

  // 本文件可能早于 java.js 加载：先等语言注册完成，再挂载第二卷
  function mount(lang) {
    // 把第一卷第四章标记为卷一终章，避免出现两个“终章”
    const vol1 = lang.chapters[3];
    vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
    vol1.nodes[vol1.nodes.length - 1].title = '卷一终战 · ' + vol1.nodes[vol1.nodes.length - 1].title.replace(/^终战\s*·\s*/, '');

    lang.chapters.push(
      {
        id: 'java-5', title: '第五章 · 符文织机', jp: '文字の織機',
        subtitle: '让文字像符文一样被拆开、重新编织', summary: 'String 的不可变性、常用 API、格式化与 equals 比较。',
        nodes: [
          {
            id: 'java-5-1', type: 'story', title: '永不改写的织机', jp: '書き換えられない機', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '源核之下没有新的怪物，只有没写文档的旧模块。第一层是符文织机，它把每个字都复制一份，从不修改原件。' },
              { who: '艾莉丝', tone: 'ally', text: '那就是 String 的不可变性吧。看起来改了，其实是又新建了一份，旧的那份还静静躺在内存里。' },
              { who: '回声字灵', tone: 'enemy', text: '你们把「影」改成「影·二」，我却还在这里念着「影」。重复，重复，多余的我。' },
              { who: '界灵·零', tone: 'guide', text: '想止住回声，先学会拆字：charAt 取一个字符，length 量长度，再用循环把它们重新编好。' },
              { who: '艾莉丝', tone: 'ally', text: '织机不认花哨的咒文，只认顺序。从最后一个字符开始读，它就会安静下来。' }
            ]
          },
          {
            id: 'java-5-2', type: 'lesson', title: 'String、不可变与格式化', jp: '文字列と不変性', xp: 40, minutes: 20,
            article: {
              lead: '只要程序需要和人说话，就离不开字符串。本章解决三件事：String 为什么不可变、常用方法怎么用、两个字符串到底该用 == 还是 equals 比较。这些细节在企业代码里每天都在出现。',
              sections: [
                {
                  h: '1. String 是不可变对象',
                  p: [
                    'String 内部保存的是一个字符序列，一旦创建就不能被修改。所有看似「修改」的方法，包括 + 拼接、replace、toUpperCase，都会返回一个新的 String 对象，原对象保持不变。',
                    '这带来两个好处：字符串可以安全地被多处共享，也可以当作 Map 的键。代价是频繁拼接会产生大量临时对象，这也是后面要学 StringBuilder 的原因。',
                    '理解这一点，才能解释「为什么方法里改了字符串，外面没变」这类面试题。'
                  ],
                  code: { lang: 'java', src: 'String rune = "影";\nString longer = rune + "·二";\nSystem.out.println(rune);\nSystem.out.println(longer);' },
                  note: '变量 rune 始终指向原来那个 "影"。所谓「拼接」，是让新变量指向新对象。'
                },
                {
                  h: '2. 最常用的 String API',
                  p: [
                    '长度用 length()，注意它是方法，要写括号；取单个字符用 charAt(i)，下标从 0 开始，越界会抛 StringIndexOutOfBoundsException。',
                    '截取用 substring(begin, end)，含头不含尾；查找用 indexOf，找不到返回 -1；替换用 replace；大小写转换用 toUpperCase 与 toLowerCase；去空白用 trim 或 strip。'
                  ],
                  code: { lang: 'java', src: 'String sigil = "Link-Sekai";\nSystem.out.println(sigil.length());\nSystem.out.println(sigil.charAt(0));\nSystem.out.println(sigil.substring(0, 4));\nSystem.out.println(sigil.indexOf("-"));\nSystem.out.println(sigil.toUpperCase());\nSystem.out.println(sigil.replace("-", "·"));' },
                  list: [
                    'length()：字符个数；数组用的是 length 属性，没有括号；',
                    'charAt(i)：返回 char，可以和字符字面量直接比较，例如 charAt(0) == \'L\'；',
                    'indexOf / lastIndexOf：查找位置，找不到返回 -1；',
                    'contains、startsWith、endsWith：判断包含与前缀后缀，返回 boolean。'
                  ],
                  note: '中文、日文在 Java 里通常一个字符占一个 char；但表情符号等辅助平面字符会占两个 char，长度会比你看到的多。'
                },
                {
                  h: '3. 循环遍历字符串',
                  p: [
                    '字符串没有下标运算符，不能写 s[i]，必须用 charAt(i)。标准写法是 for (int i = 0; i < s.length(); i++)，循环变量正好可以当作下标。',
                    '如果要反向遍历，把初始化写成 s.length() - 1，条件写成 i >= 0，更新写成 i--。注意不要在循环条件里反复调用 length() 之外的开销大的方法。'
                  ],
                  code: { lang: 'java', src: 'String word = "sekai";\nfor (int i = 0; i < word.length(); i++) {\n    System.out.println(word.charAt(i));\n}\nfor (int i = word.length() - 1; i >= 0; i--) {\n    System.out.print(word.charAt(i));\n}\nSystem.out.println();' },
                  note: 'print 与 println 的区别在这里很明显：print 让字符连成一行，println 每输出一次就换行。'
                },
                {
                  h: '4. StringBuilder：需要反复拼接时用它',
                  p: [
                    '在循环里用 + 拼接字符串，每次都会新建对象，次数一多就会产生大量垃圾对象。StringBuilder 内部维护一个可变的字符数组，append 是原地追加，最后用 toString 一次性取出结果。',
                    'StringBuilder 不是线程安全的；多线程场景用 StringBuffer。日常单线程代码优先 StringBuilder，并用链式 append 让代码更紧凑。'
                  ],
                  code: { lang: 'java', src: 'StringBuilder sb = new StringBuilder();\nfor (int i = 1; i <= 3; i++) {\n    sb.append("咏唱·").append(i).append(" ");\n}\nString text = sb.toString();\nSystem.out.println(text.trim());', runnable: false },
                  note: '概念示例：教学终端不支持 StringBuilder，请在真实 JDK 环境里练习；本章战斗题会用 charAt 与字符串拼接完成等价训练。'
                },
                {
                  h: '5. 格式化输出',
                  p: [
                    '需要把数字、文字按固定宽度排版时，用 printf 或 String.format。格式串里的 %s 对应字符串，%d 对应整数，%f 对应小数，%n 表示换行。',
                    '宽度写在字母前，例如 %6d 右对齐占 6 格，%-6s 左对齐占 6 格，%.2f 保留两位小数。做报表、日志、对齐的终端界面时非常有用。'
                  ],
                  code: { lang: 'java', src: 'String name = "艾莉丝";\nint hp = 87;\ndouble rate = 0.625;\nSystem.out.printf("%s HP=%d%n", name, hp);\nSystem.out.printf("命中率 %.1f%%%n", rate * 100);\nString line = String.format("%-8s|%4d", name, hp);\nSystem.out.println(line);', runnable: false },
                  note: 'printf 不会自动换行，需要自己写 %n 或换行；格式串里的 %% 表示输出一个百分号。'
                },
                {
                  h: '6. equals 与 == 的区别',
                  p: [
                    '== 比较的是引用：两个变量是否指向同一个对象。equals 比较的是内容，String 重写了 equals，所以内容相同就返回 true。',
                    '判断字符串内容一律用 equals，并且把确定不为 null 的字面量写在前面，写成 "影".equals(input)，可以避免空指针。忽略大小写比较用 equalsIgnoreCase。',
                    '常见错误还有：用 == 比较用户输入、在 switch 里混用 ==、把 equals 写成 == 却通过了测试——测试数据恰好来自字符串常量池。'
                  ],
                  code: { lang: 'java', src: 'String a = new String("影");\nString b = new String("影");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));\nString c = "影";\nSystem.out.println(c == "影");', runnable: false },
                  note: '概念示例：前三行输出 false、true，最后一行输出 true——字面量来自常量池，恰好是同一个对象。'
                }
              ],
              terms: [
                { t: '不可变性', en: 'immutability', d: '对象创建后内部状态不能再被修改，String 就是典型。' },
                { t: '字符下标', en: 'char index', d: 'charAt 使用的从 0 开始的位置编号。' },
                { t: '字符串常量池', en: 'string pool', d: 'JVM 复用相同字面量字符串的区域。' },
                { t: 'StringBuilder', en: 'StringBuilder', d: '可变的字符序列，适合循环内反复拼接。' },
                { t: '格式化串', en: 'format string', d: '用 %s、%d 等占位符描述输出排版的模板。' },
                { t: '内容相等', en: 'equals', d: '比较两个对象的内容是否相同，String 已重写。' }
              ],
              exam: '考试与面试高频：String 不可变的后果、== 与 equals 的区别、length() 与数组 length 的区别、substring 的含头不含尾、StringBuilder 与 String 的性能差异。写代码时判断内容一律用 equals。',
              checklist: ['能解释 String 为什么不可变', '会用 charAt 与 length 遍历字符串', '知道 == 与 equals 各自比较什么', '能说出 StringBuilder 的适用场景', '会写简单的 printf 格式串']
            }
          },
          {
            id: 'java-5-3', type: 'battle', title: '遭遇 · 回声字灵', jp: '反響の字霊', xp: 80,
            enemy: {
              name: '回声字灵', kind: 'glitch', hp: 100,
              title: '残响 · 织机层', taunt: '重复。重复。你把同一句话念了两遍。',
              lore: '它由织机里未被回收的旧字符串堆成。它只会倒着念别人说过的话，念完就多出一个自己。'
            },
            brief: '字灵把一句话倒着念给你听。用 charAt 与循环把 "linksekai" 反转输出，并报告它的字符个数。',
            tasks: [
              {
                prompt: '把字符串 "linksekai" 反转后输出为第一行；第二行输出 len=字符个数。必须使用 charAt 逐个取字符，不能直接写反转后的结果。',
                requirement: '预期两行：iakesknil / len=9',
                expected: 'iakesknil\nlen=9',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        String word = "linksekai";\n        String reversed = "";\n        // 从最后一个字符开始，逐个接到 reversed 上\n    }\n}\n',
                hints: [
                  '循环从 i = word.length() - 1 开始，条件 i >= 0，每轮 i--。',
                  '每轮用 word.charAt(i) 取出一个字符，拼到 reversed 后面：reversed = reversed + word.charAt(i);',
                  '循环结束后先用 println 输出 reversed，再输出 "len=" + word.length()。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        String word = "linksekai";\n        String reversed = "";\n        for (int i = word.length() - 1; i >= 0; i--) {\n            reversed = reversed + word.charAt(i);\n        }\n        System.out.println(reversed);\n        System.out.println("len=" + word.length());\n    }\n}',
                must: { re: 'charAt', text: '必须使用 charAt 逐个取字符' }
              }
            ],
            outro: '最后一个字符落地，回声停了。字灵发现自己只是原文的一份副本，笑着散了——这一次，没有留下新的重复。',
            loot: LS.makeLoot('rare', '织字银梭', 'weapon', '⟡', '梭身刻着一行小字：改字先改己。它缝合过的字符串，从不会少一个字符。', 'java')
          }
        ]
      },
      {
        id: 'java-6', title: '第六章 · 阵列回廊', jp: '配列の回廊',
        subtitle: '把散落的数值排成可以被遍历的一列', summary: '数组的声明、遍历、求值、排序、二维数组与 ArrayList 入门。',
        nodes: [
          {
            id: 'java-6-1', type: 'story', title: '编号石槽', jp: '番号の石槽', xp: 20,
            lines: [
              { who: '艾莉丝', tone: 'ally', text: '回廊两侧各有一排编号石槽，每格只能放一枚数值，格数从一开始就定死。' },
              { who: '界灵·零', tone: 'guide', text: '这就是数组：长度固定、下标从 0 开始。要处理一整排，就让循环替你去数，别用手一格一格点。' },
              { who: '阵列守卫', tone: 'enemy', text: '第五格是空的。你数错一次，我就把整排抹平。' },
              { who: '艾莉丝', tone: 'ally', text: '长度用 length，而且不写括号；最后一格是 length - 1。越界一次，回廊就会重新排布。' },
              { who: '界灵·零', tone: 'guide', text: '若石槽早晚会不够用，再学 ArrayList——那是会长大的回廊。' }
            ]
          },
          {
            id: 'java-6-2', type: 'lesson', title: '数组、遍历与集合入门', jp: '配列と走査', xp: 40, minutes: 22,
            article: {
              lead: '当数据从「一个值」变成「一排值」，你需要数组。本章从声明、遍历、求值一路讲到排序与二维数组，最后引出可变长度的 ArrayList。战斗题会要求你只靠 int[] 与循环完成统计。',
              sections: [
                {
                  h: '1. 声明、创建与默认值',
                  p: [
                    '数组的类型写作 int[]，创建时长度就固定。两种常见写法：int[] a = {3, 8, 1}; 直接在创建时给出元素；int[] b = new int[4]; 只给长度，元素取默认值。',
                    '默认值规则：整数为 0，小数为 0.0，boolean 为 false，引用类型为 null。访问元素用 a[0]，下标范围是 0 到 length - 1。'
                  ],
                  code: { lang: 'java', src: 'int[] runes = {3, 8, 1, 9};\nSystem.out.println(runes[0]);\nSystem.out.println(runes.length);\nint[] empty = new int[4];\nSystem.out.println(empty[2]);', runnable: false },
                  note: '概念示例：runes.length 是 4，下标最大是 3；new int[4] 的每一格默认是 0。'
                },
                {
                  h: '2. 用循环遍历',
                  p: [
                    '遍历数组的标准写法：for (int i = 0; i < a.length; i++)，循环变量同时充当下标。条件里写 i < a.length，不能写 i <= a.length，否则最后一次必然越界。',
                    '如果只需要读元素、不需要下标，可以用增强 for：for (int v : a)。它在编译后等价于下标遍历，但拿不到当前位置，也不能修改数组元素。'
                  ],
                  code: { lang: 'java', src: 'int[] runes = {3, 8, 1, 9};\nfor (int i = 0; i < runes.length; i++) {\n    System.out.println("第" + i + "格=" + runes[i]);\n}\nint total = 0;\nfor (int i = 0; i < runes.length; i++) {\n    total = total + runes[i];\n}\nSystem.out.println("合计 " + total);' },
                  list: [
                    '增强 for：for (int v : runes) 只能读，不能定位；',
                    '数组长度是属性 length，字符串长度是方法 length()；',
                    '越界会抛 ArrayIndexOutOfBoundsException，报错信息里带着出错的下标。'
                  ]
                },
                {
                  h: '3. 求和、最值与计数',
                  p: [
                    '这三件事是所有统计需求的骨架：求和用累加器，最值用第一个元素做初始值，计数用条件累加。写之前先想清楚初始化：总和从 0 开始，最大值从 a[0] 开始而不是 0，否则全是负数时会得到错误答案。',
                    '平均值要用 double 运算：(double) total / a.length，否则整数除法会丢掉小数。'
                  ],
                  code: { lang: 'java', src: 'int[] damage = {42, 17, 88, 63, 5};\nint total = 0;\nint max = damage[0];\nfor (int i = 0; i < damage.length; i++) {\n    total = total + damage[i];\n    if (damage[i] > max) {\n        max = damage[i];\n    }\n}\nSystem.out.println("总和 " + total);\nSystem.out.println("最大 " + max);\nSystem.out.println("平均 " + (double) total / damage.length);' }
                },
                {
                  h: '4. 排序：先学会冒泡',
                  p: [
                    '排序是把无序变成有序的基本功。冒泡排序的思路是：相邻两个元素比较，逆序就交换，一轮下来最大的元素被推到末尾；重复 n - 1 轮，整排有序。',
                    '交换必须借助临时变量，写成 a[j] = a[j + 1]; a[j + 1] = a[j]; 会把两格都覆盖掉。实际项目里直接用 Arrays.sort(a)，但面试常考手写排序的边界：内层循环为什么要写 length - 1 - i。'
                  ],
                  code: { lang: 'java', src: 'int[] ids = {5, 2, 9, 1};\nfor (int i = 0; i < ids.length - 1; i++) {\n    for (int j = 0; j < ids.length - 1 - i; j++) {\n        if (ids[j] > ids[j + 1]) {\n            int tmp = ids[j];\n            ids[j] = ids[j + 1];\n            ids[j + 1] = tmp;\n        }\n    }\n}\nfor (int i = 0; i < ids.length; i++) {\n    System.out.print(ids[i] + " ");\n}\nSystem.out.println();' },
                  note: '内层的 length - 1 - i 是为了跳过已经排好的尾部，既减工作量，也避免 j + 1 越界。'
                },
                {
                  h: '5. 二维数组',
                  p: [
                    '二维数组是「数组的数组」。声明写作 int[][] grid，创建 int[][] g = new int[2][3] 得到一个 2 行 3 列的表格；也可以直接写字面量 {{1,2},{3,4}}。',
                    '遍历需要两层循环：外层走行，内层走列，内层条件用 grid[i].length，因为不同行长度可以不同。'
                  ],
                  code: { lang: 'java', src: 'int[][] map = { {1, 2}, {3, 4} };\nfor (int i = 0; i < map.length; i++) {\n    for (int j = 0; j < map[i].length; j++) {\n        System.out.print(map[i][j] + " ");\n    }\n    System.out.println();\n}', runnable: false },
                  note: '概念示例：二维数组常用于地图、矩阵、成绩表。行数用 map.length，列数用 map[i].length。'
                },
                {
                  h: '6. 集合入门：ArrayList',
                  p: [
                    '数组长度固定，元素数量不确定时用 ArrayList。add 追加，get 按下标取，size 取元素个数，remove 删除，contains 判断存在。',
                    '泛型尖括号里写元素类型，例如 ArrayList<String>，编译期就能挡住放错类型的情况。ArrayList 的下标同样从 0 开始，越界抛 IndexOutOfBoundsException。'
                  ],
                  code: { lang: 'java', src: 'import java.util.ArrayList;\n\nArrayList<String> party = new ArrayList<>();\nparty.add("艾莉丝");\nparty.add("界灵·零");\nSystem.out.println(party.size());\nSystem.out.println(party.get(0));\nparty.remove(1);\nSystem.out.println(party.size());', runnable: false },
                  note: '概念示例：ArrayList 需要 import java.util.ArrayList，教学终端不支持集合，本章战斗题请用数组与循环完成。'
                }
              ],
              terms: [
                { t: '数组', en: 'array', d: '长度固定、元素类型相同、按下标访问的容器。' },
                { t: '下标', en: 'index', d: '从 0 开始的位置编号，最大为 length - 1。' },
                { t: '遍历', en: 'traversal', d: '用循环依次访问每个元素。' },
                { t: '越界', en: 'out of bounds', d: '访问了不存在的下标，会抛出运行时异常。' },
                { t: '冒泡排序', en: 'bubble sort', d: '相邻元素比较交换，多轮后整体有序。' },
                { t: 'ArrayList', en: 'ArrayList', d: '长度可变、按下标访问的集合类。' }
              ],
              exam: '考试与面试高频：数组长度 length 与字符串 length() 的区别、下标边界、最大值初始化的陷阱、整数除法求平均、冒泡排序的两层循环边界、ArrayList 与数组的取舍。',
              checklist: ['会声明并初始化一维数组', '能用循环完成求和、最值、计数', '知道数组越界的原因', '能手写冒泡排序并解释边界', '能说清数组与 ArrayList 的区别']
            }
          },
          {
            id: 'java-6-3', type: 'battle', title: '遭遇 · 阵列守卫', jp: '配列の守衛', xp: 80,
            enemy: {
              name: '阵列守卫', kind: 'golem', hp: 100,
              title: '守卫 · 编号回廊', taunt: '一格。一格。别跳过去。',
              lore: '它由五枚刻着伤害数值的石槽驱动。只有当每一格都被正确访问、且统计结果无误时，它才会让开通道。'
            },
            brief: '守卫抛出五枚伤害值：42、17、88、63、5。用 int[] 存下它们，遍历求出最大值与平均值。',
            tasks: [
              {
                prompt: '把 42、17、88、63、5 存入 int 数组，用循环求最大值与总和，输出两行：max=最大值，avg=总和除以元素个数的整数结果。',
                requirement: '预期两行：max=88 / avg=43',
                expected: 'max=88\navg=43',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int[] damage = {42, 17, 88, 63, 5};\n        int total = 0;\n        int max = damage[0];\n        // 遍历数组：累加总和、更新最大值\n    }\n}\n',
                hints: [
                  'for (int i = 0; i < damage.length; i++)，条件不要写 i <= damage.length。',
                  '循环体内 total = total + damage[i]; 再用 if (damage[i] > max) 更新 max。',
                  '平均分用整数除法：total / damage.length，正好得到 43。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int[] damage = {42, 17, 88, 63, 5};\n        int total = 0;\n        int max = damage[0];\n        for (int i = 0; i < damage.length; i++) {\n            total = total + damage[i];\n            if (damage[i] > max) {\n                max = damage[i];\n            }\n        }\n        System.out.println("max=" + max);\n        System.out.println("avg=" + total / damage.length);\n    }\n}',
                must: { re: '(for|while)\\s*\\(', text: '必须使用循环遍历数组' }
              }
            ],
            outro: '五格石槽同时亮起，守卫把总和与最大值刻回墙面，退到一旁。回廊尽头传来熔炉的风声——那里在浇铸新的石像。',
            loot: LS.makeLoot('rare', '阵列护腕', 'armor', '◫', '护腕内侧刻着 0 到 n-1。它不能让你少走一步，只能让你不越界。', 'java')
          }
        ]
      },
      {
        id: 'java-7', title: '第七章 · 铸像工房', jp: 'クラスの工房',
        subtitle: '先有蓝图，才有可以行动的石像', summary: '字段、构造器、this、封装、getter/setter 与 static。',
        nodes: [
          {
            id: 'java-7-1', type: 'story', title: '只有蓝图，没有石像', jp: '図面だけの工房', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '工房里没有石像，只有一卷蓝图。蓝图不是石像，但它规定了石像的一切：几处刻度、哪些动作。' },
              { who: '艾莉丝', tone: 'ally', text: '蓝图是类，浇出来的石像是对象。字段是它的血量，方法是它能做的事。' },
              { who: '空壳人偶', tone: 'enemy', text: '我没有名字，因为从来没有人 new 过我。你们连构造器都写错了。' },
              { who: '艾莉丝', tone: 'ally', text: '构造器与类同名，连 void 都不能写。写错了，它就只是一个普通方法，永远不会被自动调用。' },
              { who: '界灵·零', tone: 'guide', text: '把字段设为 private，只留一扇 getter 的门。这样它才不会被随手改坏。' }
            ]
          },
          {
            id: 'java-7-2', type: 'lesson', title: '类、对象与封装', jp: 'クラスと封蝋', xp: 40, minutes: 24,
            article: {
              lead: '前面所有代码都写在 main 里，这只能应付练习。真实项目的起点是「把数据和操作它的行为放在一起」，这就是类。本章从字段和构造器讲到封装与 static，让你能写出一张完整、可被信任的蓝图。',
              sections: [
                {
                  h: '1. 类、对象与字段',
                  p: [
                    '类是模板，对象是按模板创建出来的实例。类里声明的变量叫字段（成员变量），描述对象的状态；类里的方法描述对象的行为。',
                    '用 new 创建对象：Hero hero = new Hero();。hero 是引用，指向堆上的对象。同一个类可以创建任意多个对象，每个对象有自己独立的一份字段。'
                  ],
                  code: { lang: 'java', src: 'class Hero {\n    String name;\n    int hp;\n}\n\nHero hero = new Hero();\nhero.name = "艾莉丝";\nhero.hp = 90;\nSystem.out.println(hero.name + " " + hero.hp);', runnable: false },
                  note: '概念示例：类定义通常放在单独的文件里，文件名与 public 类名一致。教学终端只执行 main 中的语句，类结构请在真实 JDK 里练习。'
                },
                {
                  h: '2. 构造器与 this',
                  p: [
                    '构造器与类同名、没有返回类型（void 也不写），在 new 的时候自动执行，用来把对象初始化到合法状态。写错返回类型，编译器会把它当成普通方法，于是 new 出来的对象字段全是默认值。',
                    '当参数名与字段名相同时，用 this.name = name 区分：this 指向当前对象。this 也可以用来在一个构造器里调用另一个构造器，但必须写在第一行。'
                  ],
                  code: { lang: 'java', src: 'class Hero {\n    String name;\n    int hp;\n\n    Hero(String name, int hp) {\n        this.name = name;\n        this.hp = hp;\n    }\n}\n\nHero hero = new Hero("艾莉丝", 90);\nSystem.out.println(hero.name);', runnable: false }
                },
                {
                  h: '3. 封装：private 与 getter/setter',
                  p: [
                    '封装的做法是：字段一律 private，外部只能通过公开的方法读写。这样可以在赋值时校验，例如血量不能为负、等级必须在 1 到 99 之间。',
                    'getter 命名 getXxx，boolean 类型习惯用 isXxx。setter 里做校验，非法值直接拒绝或修正。封装不是为了隐藏，而是为了让「非法状态」不可能出现。'
                  ],
                  code: { lang: 'java', src: 'class Player {\n    private int hp;\n\n    public int getHp() {\n        return hp;\n    }\n\n    public void setHp(int hp) {\n        if (hp < 0) {\n            hp = 0;\n        }\n        this.hp = hp;\n    }\n}', runnable: false },
                  note: '常见错误：setter 里忘了 this，写成 hp = hp，字段永远不变；或者把字段写成 public，校验形同虚设。'
                },
                {
                  h: '4. static：属于类，而不是某个对象',
                  p: [
                    'static 成员属于类本身。静态字段在所有对象间共享，静态方法不依赖对象即可调用，main 就是静态方法，所以它不能直接访问实例字段。',
                    '典型用途：计数器、常量（public static final）、工具方法。反例是把每个对象各自的状态写成 static，导致所有对象互相污染。'
                  ],
                  code: { lang: 'java', src: 'class Hero {\n    static int created = 0;\n    String name;\n\n    Hero(String name) {\n        this.name = name;\n        created++;\n    }\n\n    static int createdCount() {\n        return created;\n    }\n}\n\nnew Hero("艾莉丝");\nnew Hero("界灵·零");\nSystem.out.println(Hero.createdCount());', runnable: false }
                },
                {
                  h: '5. 对象数组与 null',
                  p: [
                    '对象数组创建后，每一格都是 null。new Hero[3] 只是准备了三格位置，并没有创建三个对象，必须再逐格 new。',
                    '对 null 调用方法或访问字段会抛 NullPointerException。遍历对象数组时，先判断 != null 再使用，或在设计上保证数组填满。'
                  ],
                  code: { lang: 'java', src: 'Hero[] party = new Hero[3];\nparty[0] = new Hero("艾莉丝", 90);\nfor (int i = 0; i < party.length; i++) {\n    if (party[i] != null) {\n        System.out.println(party[i].name);\n    }\n}', runnable: false }
                },
                {
                  h: '6. 常见错误清单',
                  p: [
                    '构造器写了 void 返回类型；忘记 new 就直接用对象；在静态方法里直接访问实例字段；equals 写成 ==；toString 没重写导致打印出类名加哈希值。',
                    '排查顺序建议：先看编译错误（类型、未声明、缺返回），再看运行错误（空指针、越界），最后才是逻辑错误。'
                  ],
                  list: [
                    '字段建议全部 private，需要暴露时写 getter/setter；',
                    '对象创建后立刻完成初始化，避免出现「半成品对象」；',
                    '给类补一个 toString，调试时打印对象才有意义。'
                  ]
                }
              ],
              terms: [
                { t: '类', en: 'class', d: '描述对象结构与行为的模板。' },
                { t: '对象', en: 'object', d: '按类创建出来的具体实例，存放在堆上。' },
                { t: '字段', en: 'field', d: '类或对象中保存状态的变量。' },
                { t: '构造器', en: 'constructor', d: '创建对象时自动调用的初始化方法，与类同名且无返回类型。' },
                { t: 'this', en: 'this', d: '指向当前对象的引用，用于区分同名参数与字段。' },
                { t: '封装', en: 'encapsulation', d: '隐藏字段，只通过受控方法访问，保证对象状态合法。' }
              ],
              exam: '考试与面试高频：构造器的特征（无返回类型、与类同名）、this 的用途、static 成员与实例成员的区别、private 的可访问范围、new 之后字段的默认值、空指针的产生原因。',
              checklist: ['能写出带字段与构造器的类', '会用 this 区分参数与字段', '能通过 getter/setter 完成封装', '说得清 static 与实例成员的区别', '知道对象数组默认是 null']
            }
          },
          {
            id: 'java-7-3', type: 'battle', title: '遭遇 · 空壳人偶', jp: '空殻の人形', xp: 80,
            enemy: {
              name: '空壳人偶', kind: 'construct', hp: 100,
              title: '残次品 · 工房', taunt: '我没有字段，也没有构造器。你打算怎么统计我？',
              lore: '它是蓝图被写错后浇出来的残次品：字段全是默认值，构造器从未被调用。要让工房恢复，你得先证明自己会整理一批对象的状态。'
            },
            brief: '工房登记了五尊石像的血量：120、85、0、200、45。统计仍能行动的数量（血量大于 0）与总血量。',
            tasks: [
              {
                prompt: '把五尊石像的血量 120、85、0、200、45 存入 int 数组，用循环统计血量大于 0 的数量与总血量，输出两行：alive=数量，totalHp=总血量。',
                requirement: '预期两行：alive=4 / totalHp=450',
                expected: 'alive=4\ntotalHp=450',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int[] hp = {120, 85, 0, 200, 45};\n        int alive = 0;\n        int total = 0;\n        // 遍历：血量大于 0 计入存活，并累加总血量\n    }\n}\n',
                hints: [
                  'for (int i = 0; i < hp.length; i++) 依次拿到五个血量。',
                  'if (hp[i] > 0) 时 alive++; 不论是否存活都要 total = total + hp[i];',
                  '最后输出 "alive=" + alive 和 "totalHp=" + total，注意大小写。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int[] hp = {120, 85, 0, 200, 45};\n        int alive = 0;\n        int total = 0;\n        for (int i = 0; i < hp.length; i++) {\n            if (hp[i] > 0) {\n                alive++;\n            }\n            total = total + hp[i];\n        }\n        System.out.println("alive=" + alive);\n        System.out.println("totalHp=" + total);\n    }\n}',
                must: { re: 'if\\s*\\(', text: '必须用条件判断区分存活与倒下' }
              }
            ],
            outro: '四尊石像重新站起，残次品低头看着自己终于被填上的字段，第一次拥有了姓名。熔炉的火退回蓝图里。',
            loot: LS.makeLoot('rare', '蓝图刻印', 'relic', '◇', '一枚刻着 this 的印模。它不制造石像，只提醒你：先写蓝图，再动手。', 'java')
          }
        ]
      },
      {
        id: 'java-8', title: '第八章 · 继承之枝', jp: '継承の枝',
        subtitle: '让新的术式从旧的术式里长出来', summary: 'extends、super、重写、抽象类、接口与多态。',
        nodes: [
          {
            id: 'java-8-1', type: 'story', title: '同根的双子', jp: '同じ根の双子', xp: 20,
            lines: [
              { who: '艾莉丝', tone: 'ally', text: '这里的双子共用一条根，却长出两种枝叶。左边施术，右边挥剑，动作不同，呼吸却是同一个节奏。' },
              { who: '拟态双子', tone: 'enemy', text: '你以为换了个名字，就不是同一个我了吗？' },
              { who: '界灵·零', tone: 'guide', text: '父类的引用可以指向子类的对象，调用时执行的是子类重写的版本——这就是多态。同一次调用，两种结果。' },
              { who: '艾莉丝', tone: 'ally', text: '但父类引用看不到子类新增的方法。想要更多能力，得先向下转型，并且用 instanceof 确认。' },
              { who: '界灵·零', tone: 'guide', text: '别忘了 super：子类构造之前，父类必须先活过来。' }
            ]
          },
          {
            id: 'java-8-2', type: 'lesson', title: '继承、重写与多态', jp: '継承と多態', xp: 40, minutes: 26,
            article: {
              lead: '继承让公共的部分只写一次，多态让调用方不必知道具体类型。这两个机制撑起了 Java 的框架生态：你写的每一行 Spring 或 Android 代码，背后都是它们。本章把 extends、super、重写、抽象类与接口串成一条完整的线。',
              sections: [
                {
                  h: '1. extends：单继承',
                  p: [
                    '子类用 extends 继承父类，自动获得父类可访问的字段与方法。Java 是单继承：一个类只能直接继承一个父类，但可以多层继承，所有类最终都继承 Object。',
                    '继承表达「是什么」的关系。判断该不该继承，问自己一句：子类真的是父类的一种吗？如果只是复用代码，优先用组合。'
                  ],
                  code: { lang: 'java', src: 'class Character {\n    String name;\n    int hp;\n\n    void move() {\n        System.out.println(name + " 移动");\n    }\n}\n\nclass Mage extends Character {\n    void cast() {\n        System.out.println(name + " 施法");\n    }\n}', runnable: false },
                  note: '子类继承到的是「可访问」成员：父类 private 字段仍然存在，但子类不能直接访问。'
                },
                {
                  h: '2. super 与构造链',
                  p: [
                    '子类构造器的第一行会隐式调用父类的无参构造。如果父类只写了带参构造，编译器就不再提供无参构造，此时子类必须显式写 super(参数)，否则编译失败。',
                    '父类构造总是先执行，再执行子类构造体。字段初始化也遵循这个顺序，这也是「不要在构造器里调用可被重写的方法」的原因。'
                  ],
                  code: { lang: 'java', src: 'class Character {\n    String name;\n\n    Character(String name) {\n        this.name = name;\n    }\n}\n\nclass Mage extends Character {\n    int mana;\n\n    Mage(String name, int mana) {\n        super(name);\n        this.mana = mana;\n    }\n}', runnable: false }
                },
                {
                  h: '3. 重写与 @Override',
                  p: [
                    '重写（override）要求方法名、参数列表、返回类型兼容，访问权限不能比父类更严格。加上 @Override 注解，写错签名时编译器会直接报错，这是最便宜的保险。',
                    '重载（overload）是同一个类里同名不同参数；重写是子类改父类的实现。两者常被混淆。'
                  ],
                  code: { lang: 'java', src: 'class Character {\n    void attack() {\n        System.out.println("普通攻击");\n    }\n}\n\nclass Mage extends Character {\n    @Override\n    void attack() {\n        System.out.println("魔法攻击");\n    }\n}', runnable: false }
                },
                {
                  h: '4. 多态与转型',
                  p: [
                    '父类引用指向子类对象时，调用被重写的方法会执行子类版本，这叫动态绑定。好处是调用方只依赖父类：新增一个子类，不需要改调用代码。',
                    '父类引用不能调用子类特有方法。要调用，需要向下转型 Mage m = (Mage) c;，转型前用 c instanceof Mage 判断，避免 ClassCastException。'
                  ],
                  code: { lang: 'java', src: 'Character c = new Mage("艾莉丝", 40);\nc.attack();\n\nif (c instanceof Mage) {\n    Mage m = (Mage) c;\n    m.cast();\n}', runnable: false },
                  note: '概念示例：同一行 c.attack()，运行时才决定执行哪个版本。这就是「编译看左边，运行看右边」。'
                },
                {
                  h: '5. 抽象类',
                  p: [
                    '抽象类用 abstract 声明，不能 new，可以有构造器、字段和已实现的方法，用来抽出「共同的骨架」。抽象方法只写签名，子类必须实现。',
                    '一个类只要含抽象方法，就必须是抽象类。抽象类适合表达一组强相关的类型，例如所有角色都有 name 与 attack，但 attack 的具体实现各不相同。'
                  ],
                  code: { lang: 'java', src: 'abstract class Character {\n    protected String name;\n\n    Character(String name) {\n        this.name = name;\n    }\n\n    abstract void attack();\n\n    void report() {\n        System.out.println(name + " 待命");\n    }\n}\n\nclass Mage extends Character {\n    Mage(String name) {\n        super(name);\n    }\n\n    @Override\n    void attack() {\n        System.out.println(name + " 咏唱");\n    }\n}', runnable: false }
                },
                {
                  h: '6. 接口与多实现',
                  p: [
                    '接口用 interface 声明，定义一组能力约定，类用 implements 实现。一个类可以实现多个接口，这补上了单继承的不足。',
                    '接口里的方法默认是 public abstract，字段默认 public static final。Java 8 起支持 default 方法，可以在接口里给默认实现。抽象类表达「是什么」，接口表达「能做什么」。'
                  ],
                  code: { lang: 'java', src: 'interface Healable {\n    void heal();\n}\n\ninterface Guardable {\n    void guard();\n}\n\nclass Paladin implements Healable, Guardable {\n    public void heal() {\n        System.out.println("治疗术");\n    }\n\n    public void guard() {\n        System.out.println("举盾");\n    }\n}', runnable: false },
                  note: '实现接口的方法必须是 public，否则编译报错——接口把访问权限默认设为 public，实现时不能缩小。'
                }
              ],
              terms: [
                { t: '继承', en: 'inheritance', d: '子类获得父类可访问成员的关系，Java 只支持单继承。' },
                { t: '重写', en: 'override', d: '子类提供与父类同签名方法的新实现。' },
                { t: '多态', en: 'polymorphism', d: '父类引用在运行时表现出子类的行为。' },
                { t: '向上转型', en: 'upcasting', d: '把子类对象赋给父类引用，自动完成。' },
                { t: '抽象类', en: 'abstract class', d: '不能实例化、用于抽取共同骨架的类。' },
                { t: '接口', en: 'interface', d: '定义能力约定的类型，一个类可实现多个。' }
              ],
              exam: '考试与面试高频：单继承、super 必须写在构造器第一行、重写与重载的区别、@Override 的作用、多态调用规则、抽象类与接口的取舍、向上与向下转型。',
              checklist: ['能写出正确的继承与 super 调用', '能解释重写与重载的区别', '说得清多态在运行时如何决定方法', '知道抽象类与接口各自适合什么', '会用 instanceof 安全转型']
            }
          },
          {
            id: 'java-8-3', type: 'battle', title: '遭遇 · 拟态双子', jp: '擬態の双子', xp: 80,
            enemy: {
              name: '拟态双子', kind: 'wraith', hp: 100,
              title: '影兽 · 同根', taunt: '同一次攻击，为什么我这边是剑，你那边是术？',
              lore: '双子本是同一份父类蓝图的两种实现。它们互相模仿，却始终无法合一。想让它们停下，你得按同一套规则把两边的战绩分别算清。'
            },
            brief: '双子各自留下四次攻击数值。按「不小于 10 为术式、否则为体术」分类求和，让两种形态的战绩同时显形。',
            tasks: [
              {
                prompt: '把 12、7、30、5 存入 int 数组，用循环把大于等于 10 的数值累加为术式、其余累加为体术，输出两行：术式 合计 与 体术 合计。',
                requirement: '预期两行：术式 42 / 体术 12',
                expected: '术式 42\n体术 12',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int[] dmg = {12, 7, 30, 5};\n        int magic = 0;\n        int melee = 0;\n        // 按数值分类累加\n    }\n}\n',
                hints: [
                  'for (int i = 0; i < dmg.length; i++) 依次处理每个数值。',
                  'if (dmg[i] >= 10) 累加到 magic，else 累加到 melee。',
                  '输出顺序是先术式后体术："术式 " + magic 与 "体术 " + melee，注意中间有一个空格。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int[] dmg = {12, 7, 30, 5};\n        int magic = 0;\n        int melee = 0;\n        for (int i = 0; i < dmg.length; i++) {\n            if (dmg[i] >= 10) {\n                magic = magic + dmg[i];\n            } else {\n                melee = melee + dmg[i];\n            }\n        }\n        System.out.println("术式 " + magic);\n        System.out.println("体术 " + melee);\n    }\n}',
                must: { re: '(for|while)\\s*\\(', text: '必须使用循环逐个判断' }
              }
            ],
            outro: '两种战绩并列刻在墙上，双子第一次不再互相模仿。左边收起法杖，右边放下长剑，同根的两枝终于各自生长。',
            loot: LS.makeLoot('rare', '双子剑穗', 'weapon', '⟠', '穗子两端各系一枚结：一枚写着 extends，一枚写着 implements。', 'java')
          }
        ]
      },
      {
        id: 'java-9', title: '第九章 · 断裂回廊', jp: '例外の谷',
        subtitle: '在程序崩坏之前，先接住那一击', summary: 'try/catch/finally、受检异常、自定义异常与断言调试。',
        nodes: [
          {
            id: 'java-9-1', type: 'story', title: '没人接住的那一击', jp: '受け止められない一撃', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '这条回廊的地面有裂缝。旧系统从不检查除数是不是 0，于是它每隔七步就崩一次。' },
              { who: '断点猎犬', tone: 'enemy', text: '崩。崩。我就在你的第三行等着，那里没有人接住我。' },
              { who: '艾莉丝', tone: 'ally', text: '异常不是失败，是信号。try 里做危险的事，catch 里处理，finally 里收尾。' },
              { who: '界灵·零', tone: 'guide', text: '受检异常编译器会提前警告你；运行时异常只在你最自信的时候出现。' },
              { who: '艾莉丝', tone: 'ally', text: '先写 if 把 0 挡在门外，再谈捕获。能预防的错误，不应该交给异常去兜。' }
            ]
          },
          {
            id: 'java-9-2', type: 'lesson', title: '异常、调试与防线', jp: '例外と防線', xp: 40, minutes: 24,
            article: {
              lead: '程序一定会出错：用户输入空值、文件被删、网络断开、数组越界。异常机制让你把「出错之后怎么办」写成明确的代码，而不是让进程直接倒下。本章讲清异常体系、捕获顺序、资源收尾，以及如何用断言和断点定位问题。',
              sections: [
                {
                  h: '1. 异常体系与两类异常',
                  p: [
                    '所有异常都继承 Throwable。它有两个直接子类：Error 表示 JVM 层面的严重问题（如内存耗尽），通常不该捕获；Exception 表示程序可以处理的问题。',
                    'Exception 又分两类：继承 RuntimeException 的是运行时异常（非受检），编译器不强制处理，例如空指针、越界、除零；其余是受检异常，编译器要求你 try/catch 或在方法签名上 throws，例如 IOException。',
                    '选择哪种：调用方能够恢复的意外，用受检异常；程序错误（参数非法、状态不对）用运行时异常。'
                  ],
                  list: [
                    'NullPointerException：对 null 调用方法或访问字段；',
                    'ArrayIndexOutOfBoundsException：下标越界；',
                    'ArithmeticException：整数除以 0；',
                    'NumberFormatException：把非数字字符串转成数字；',
                    'IOException：文件读写失败，属于受检异常。'
                  ]
                },
                {
                  h: '2. try / catch 的结构',
                  p: [
                    'try 块里放可能出错的语句，catch 块负责处理。捕获后程序会从 catch 之后继续执行，而不是终止。catch 的参数类型决定能接住哪些异常。',
                    '多个 catch 必须从子类到父类排列：如果把 Exception 写在最前面，后面的具体异常永远不可达，编译器会直接报错。'
                  ],
                  code: { lang: 'java', src: 'try {\n    int[] arr = new int[3];\n    System.out.println(arr[5]);\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("下标越界：" + e.getMessage());\n} catch (Exception e) {\n    System.out.println("兜底处理");\n}', runnable: false },
                  note: '概念示例：e.getMessage() 给出简要原因，printStackTrace() 打印完整调用栈。生产代码不要用空的 catch 块把异常吞掉。'
                },
                {
                  h: '3. finally 与执行顺序',
                  p: [
                    'finally 块无论是否发生异常、是否 return，都会执行，用来关闭文件、释放连接、还原状态。',
                    '执行顺序是：try 中的 return 先算出返回值 → 执行 finally → 真正返回。如果在 finally 里再写 return，会覆盖前面的返回值，这是常见事故，禁止这样写。'
                  ],
                  code: { lang: 'java', src: 'static int divide(int a, int b) {\n    try {\n        return a / b;\n    } catch (ArithmeticException e) {\n        return -1;\n    } finally {\n        System.out.println("收尾");\n    }\n}\n\nSystem.out.println(divide(10, 0));', runnable: false },
                  note: '概念示例：输出顺序是先「收尾」再 -1。finally 里的代码永远在方法真正返回之前跑完。'
                },
                {
                  h: '4. 受检异常与 throws',
                  p: [
                    '受检异常必须处理：要么就地 try/catch，要么在方法签名上写 throws，把责任交给调用方。main 方法也可以 throws，但那只是把异常抛给 JVM，程序仍然会终止。',
                    '原则是：谁有能力处理，谁就捕获。写在最外层、什么都不做只打印一行日志的 catch，等于没有处理。'
                  ],
                  code: { lang: 'java', src: 'public static void readAll(String path) throws IOException {\n    List<String> lines = Files.readAllLines(Paths.get(path));\n    System.out.println("行数 " + lines.size());\n}\n\npublic static void main(String[] args) {\n    try {\n        readAll("records.txt");\n    } catch (IOException e) {\n        System.out.println("读取失败：" + e.getMessage());\n    }\n}', runnable: false }
                },
                {
                  h: '5. 自定义异常',
                  p: [
                    '业务错误用自定义异常表达最清楚。继承 Exception（受检）或 RuntimeException（非受检），提供带消息的构造器，并用 super(message) 把消息交给父类。',
                    '抛出用 throw，声明用 throws，两者不要混：throw 后面跟一个异常对象，throws 写在方法签名上列出可能抛出的类型。'
                  ],
                  code: { lang: 'java', src: 'class ManaException extends Exception {\n    ManaException(String message) {\n        super(message);\n    }\n}\n\nstatic void cast(int mana) throws ManaException {\n    if (mana < 10) {\n        throw new ManaException("魔力不足：" + mana);\n    }\n    System.out.println("咏唱成功");\n}', runnable: false }
                },
                {
                  h: '6. 断言、日志与断点',
                  p: [
                    '断言 assert 条件 : 消息 用来检查「程序员认为一定成立」的前提，默认关闭，需要用 -ea 开启。它适合开发期自检，不适合校验用户输入。',
                    '真正的排错靠三步：读完整调用栈，找到第一个属于自己代码的行；用日志打印关键变量，缩小范围；在 IDE 里下断点单步执行，看每一步的值是否符合预期。',
                    '最有效的调试技巧是「最小可复现」：把出错的输入缩到最短，把无关代码删掉，问题往往自己就暴露了。'
                  ],
                  code: { lang: 'java', src: 'int total = 42;\nassert total > 0 : "总数不应为负";\nSystem.out.println("检查通过");', runnable: false },
                  note: '概念示例：不开启 -ea 时断言完全不执行，所以它不能代替参数校验和异常处理。'
                }
              ],
              terms: [
                { t: '异常', en: 'exception', d: '表示程序执行中出现的、可被处理的意外情况。' },
                { t: '受检异常', en: 'checked exception', d: '编译器强制要求捕获或声明的异常。' },
                { t: '运行时异常', en: 'runtime exception', d: '继承 RuntimeException、编译器不强制处理的异常。' },
                { t: 'finally', en: 'finally', d: '无论是否异常都会执行的收尾代码块。' },
                { t: '抛出', en: 'throw / throws', d: 'throw 抛出异常对象，throws 在方法签名上声明可能抛出的类型。' },
                { t: '断言', en: 'assertion', d: '开发期自检手段，需 -ea 开启，失败时抛出 AssertionError。' }
              ],
              exam: '考试与面试高频：受检与运行时异常的区别、catch 子类在前的规则、finally 的执行时机与 return 覆盖、throw 与 throws 的区别、常见运行时异常的名称与触发条件。',
              checklist: ['能说出受检异常与运行时异常的区别', '会写多分支 catch 并正确排序', '知道 finally 与 return 的执行顺序', '能自定义并抛出一个业务异常', '会用断点与日志定位问题']
            }
          },
          {
            id: 'java-9-3', type: 'battle', title: '遭遇 · 断点猎犬', jp: 'ブレークポイントの猟犬', xp: 80,
            enemy: {
              name: '断点猎犬', kind: 'wolf', hp: 100,
              title: '影兽 · 崩溃点', taunt: '第三行。这次我一定让你崩在第三行。',
              lore: '它从旧系统未捕获的异常里长出来，专挑除数为 0 的那一行下手。你只需要在它咬下之前，用条件把那一步挡住。'
            },
            brief: '40 点魔力要依次分给 4、0、5、2 四个术式。遇到 0 就跳过并留下记号，其余的算出整除结果。',
            tasks: [
              {
                prompt: '把 4、0、5、2 存入 int 数组，用 40 依次除以每个数。除数为 0 时输出「跳过 0」，否则输出整除结果，每行一个。',
                requirement: '预期四行：10 / 跳过 0 / 8 / 20',
                expected: '10\n跳过 0\n8\n20',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int base = 40;\n        int[] divisors = {4, 0, 5, 2};\n        // 遍历除数，先判断是否为 0\n    }\n}\n',
                hints: [
                  'for (int i = 0; i < divisors.length; i++) 依次取出四个除数。',
                  'if (divisors[i] == 0) 时输出「跳过 0」，否则输出 base / divisors[i]。',
                  '整数除法会自动取整：40 / 4 得 10，40 / 2 得 20。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int base = 40;\n        int[] divisors = {4, 0, 5, 2};\n        for (int i = 0; i < divisors.length; i++) {\n            if (divisors[i] == 0) {\n                System.out.println("跳过 0");\n            } else {\n                System.out.println(base / divisors[i]);\n            }\n        }\n    }\n}',
                must: { re: 'if\\s*\\(', text: '必须用条件判断挡住除数为 0 的情况' }
              }
            ],
            outro: '猎犬在除数为 0 的那一格前刹住脚，撞上一道刚写好的 if 屏障。回廊的裂缝合拢，前方传来书页翻动的声音。',
            loot: LS.makeLoot('epic', '断点护符', 'relic', '⧗', '护符上有一道细细的裂缝，恰好停在 return 之前。它记得每一次被接住的坠落。', 'java')
          }
        ]
      },
      {
        id: 'java-10', title: '第十章 · 泛型圣所', jp: '集合の聖所',
        subtitle: '用容器收纳成千上万枚符文', summary: 'List、Set、Map、泛型、Iterator 与 equals/hashCode 契约。',
        nodes: [
          {
            id: 'java-10-1', type: 'story', title: '数不清的同一枚', jp: '同じ一枚を数える', xp: 20,
            lines: [
              { who: '艾莉丝', tone: 'ally', text: '圣所里堆着上百万枚符文，没有编号，只有内容。靠数组一格一格数，已经来不及了。' },
              { who: '界灵·零', tone: 'guide', text: 'List 保序、Set 去重、Map 按键取值。选错容器，代价是整夜的重构。' },
              { who: '散列蜂群', tone: 'enemy', text: '同一个我，在你们眼里出现了七次。数得清吗？' },
              { who: '艾莉丝', tone: 'ally', text: '那就用 Set。可它要求你正确实现 equals 和 hashCode，否则蜂群永远去不干净。' },
              { who: '界灵·零', tone: 'guide', text: '在学会容器之前，先用数组把去重的道理走一遍——逻辑是一样的，只是慢一点。' }
            ]
          },
          {
            id: 'java-10-2', type: 'lesson', title: '集合框架与泛型', jp: '集合とジェネリクス', xp: 40, minutes: 28,
            article: {
              lead: '数组长度固定、只能按下标访问，真实业务的数据却总是增减不定、需要去重、需要按键查值。集合框架就是为这些需求准备的工具箱。本章讲清 List、Set、Map 的分工，泛型如何保证类型安全，以及为什么 equals 与 hashCode 必须成对实现。',
              sections: [
                {
                  h: '1. 集合体系：三个方向',
                  p: [
                    'Java 集合分两大接口：Collection 与 Map。Collection 下又分 List（有序、可重复、有下标）与 Set（不可重复）。Map 保存键值对，键唯一。',
                    '选容器的顺序是：先问要不要键值对（要就用 Map），再问要不要去重（要就用 Set），最后才在 List 的两种实现之间选。'
                  ],
                  list: [
                    'List：ArrayList（查快、增删慢）、LinkedList（增删快、查慢）；',
                    'Set：HashSet（最快、无序）、LinkedHashSet（保留插入顺序）、TreeSet（自动排序）；',
                    'Map：HashMap、LinkedHashMap、TreeMap，选择逻辑与 Set 相同；',
                    '所有实现都不是线程安全的，多线程场景要用 ConcurrentHashMap 等并发容器。'
                  ]
                },
                {
                  h: '2. List 的常用操作',
                  p: [
                    'ArrayList 用 add 追加、add(index, e) 插入、get 取值、set 替换、remove 删除、size 计数、contains 判断存在。下标同样从 0 开始。',
                    '注意 remove 有重载：remove(int index) 按下标删，remove(Object o) 按内容删。传入 Integer 时容易调错，需要显式拆箱或转型。'
                  ],
                  code: { lang: 'java', src: 'import java.util.ArrayList;\nimport java.util.List;\n\nList<String> party = new ArrayList<>();\nparty.add("艾莉丝");\nparty.add("界灵·零");\nparty.add(1, "维护者·灰");\nSystem.out.println(party.size());\nSystem.out.println(party.get(0));\nSystem.out.println(party.contains("界灵·零"));\nparty.remove("艾莉丝");\nSystem.out.println(party.size());', runnable: false },
                  note: '概念示例：声明用接口 List，创建用具体类 ArrayList，这样以后换实现只改一行。'
                },
                {
                  h: '3. Set 与去重',
                  p: [
                    'Set 不允许重复元素。HashSet 的 add 返回 boolean：加入成功返回 true，元素已存在返回 false，这个返回值常被忽略却很有用。',
                    'HashSet 不保证顺序；需要保留插入顺序用 LinkedHashSet；需要按大小排序用 TreeSet（元素必须可比较）。'
                  ],
                  code: { lang: 'java', src: 'import java.util.HashSet;\nimport java.util.Set;\n\nSet<Integer> ids = new HashSet<>();\nSystem.out.println(ids.add(3));\nSystem.out.println(ids.add(3));\nSystem.out.println(ids.add(7));\nSystem.out.println(ids.size());\nSystem.out.println(ids.contains(7));', runnable: false },
                  note: '概念示例：输出 true、false、true、2、true。第二次 add(3) 失败，正是「去重」在起作用。'
                },
                {
                  h: '4. Map 的取值与遍历',
                  p: [
                    'Map 用 put 存键值对，get 按键取值，getOrDefault 在没有键时给默认值，containsKey 判断键是否存在。重复 put 同一个键会覆盖旧值。',
                    '遍历有三种方式：keySet 拿所有键、values 拿所有值、entrySet 同时拿键和值。需要键值时用 entrySet，避免每轮再 get 一次。'
                  ],
                  code: { lang: 'java', src: 'import java.util.HashMap;\nimport java.util.Map;\n\nMap<String, Integer> bag = new HashMap<>();\nbag.put("苦无", 15);\nbag.put("苦无", 18);\nbag.put("药剂", 3);\nSystem.out.println(bag.get("苦无"));\nSystem.out.println(bag.getOrDefault("符纸", 0));\nfor (Map.Entry<String, Integer> e : bag.entrySet()) {\n    System.out.println(e.getKey() + "=" + e.getValue());\n}', runnable: false },
                  note: '概念示例：HashMap 的遍历顺序不确定，不要依赖它输出固定顺序。需要顺序时用 LinkedHashMap 或 TreeMap。'
                },
                {
                  h: '5. 泛型、包装类与自动装箱',
                  p: [
                    '泛型把类型作为参数写进尖括号，编译期就能阻止放错类型，取出时也不需要强转。泛型参数只能是引用类型，写 List<int> 会编译报错，要写 List<Integer>。',
                    '基本类型与包装类的自动转换叫装箱与拆箱：nums.add(7) 自动装箱成 Integer，int v = nums.get(0) 自动拆箱。频繁装箱有性能成本，超大数量时要注意。',
                    '泛型在运行时会被擦除，所以不能 new T()、不能创建泛型数组。理解类型擦除，才能解释「为什么两个不同泛型的 List 运行时是同一个类」。'
                  ],
                  code: { lang: 'java', src: 'import java.util.ArrayList;\nimport java.util.List;\n\nList<Integer> nums = new ArrayList<>();\nnums.add(7);\nnums.add(9);\nint first = nums.get(0) + nums.get(1);\nSystem.out.println(first);', runnable: false }
                },
                {
                  h: '6. Iterator 与 equals/hashCode 契约',
                  p: [
                    '迭代器是集合的统一遍历方式：hasNext 判断还有没有，next 取出下一个，remove 删除刚刚取出的元素。用 for-each 遍历时如果直接调用集合的 remove，会抛 ConcurrentModificationException。',
                    'HashSet 与 HashMap 靠 hashCode 定位、靠 equals 判等。自定义类如果要放进 Set 或当作 Map 的键，必须同时重写 equals 与 hashCode，并且两者使用同一组字段。',
                    '只重写 equals 不重写 hashCode，会出现「两个相等的对象被放进同一个 Set」这种诡异结果。'
                  ],
                  code: { lang: 'java', src: 'import java.util.ArrayList;\nimport java.util.Iterator;\nimport java.util.List;\n\nList<String> names = new ArrayList<>();\nnames.add("艾莉丝");\nnames.add("");\n\nIterator<String> it = names.iterator();\nwhile (it.hasNext()) {\n    String name = it.next();\n    if (name.isEmpty()) {\n        it.remove();\n    }\n}\nSystem.out.println(names.size());', runnable: false }
                }
              ],
              terms: [
                { t: '集合框架', en: 'collections framework', d: 'List、Set、Map 及其实现的统一体系。' },
                { t: '泛型', en: 'generics', d: '把类型作为参数，编译期检查类型安全。' },
                { t: '自动装箱', en: 'autoboxing', d: '基本类型与包装类之间的自动转换。' },
                { t: '迭代器', en: 'Iterator', d: '统一遍历集合并可安全删除元素的对象。' },
                { t: '哈希码', en: 'hashCode', d: '用于快速定位桶位置的整数，需与 equals 保持一致。' },
                { t: '并发修改异常', en: 'ConcurrentModificationException', d: '遍历集合时被结构性修改而抛出的运行时异常。' }
              ],
              exam: '考试与面试高频：List/Set/Map 的区别、ArrayList 与 LinkedList 的取舍、HashMap 的 put/get 流程、equals 与 hashCode 的契约、泛型擦除、for-each 中删除元素为何出错。',
              checklist: ['能按需求选出 List/Set/Map', '会写泛型集合的声明与遍历', '知道 HashSet 去重的原理', '能解释 equals 与 hashCode 必须成对重写', '清楚遍历时不能直接删集合元素']
            }
          },
          {
            id: 'java-10-3', type: 'battle', title: '遭遇 · 散列蜂群', jp: 'ハッシュの群れ', xp: 80,
            enemy: {
              name: '散列蜂群', kind: 'drone', hp: 100,
              title: '群集 · 圣所入口', taunt: '三。一。三。你数到第几遍了？',
              lore: '同一枚符文被复制了七份，蜂群便有了七个身体。它们靠重复来繁殖，而你要做的只是让每个编号只被承认一次。'
            },
            brief: '登记簿上有七个编号：3、1、3、7、1、9、7。按首次出现的顺序输出去重结果，并统计不同编号的数量。',
            tasks: [
              {
                prompt: '把 3、1、3、7、1、9、7 存入 int 数组，按首次出现顺序输出去重结果（同一行、以单个空格分隔），第二行输出 uniq=不同编号的数量。不能用集合。',
                requirement: '预期两行：3 1 7 9 / uniq=4',
                expected: '3 1 7 9\nuniq=4',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int[] ids = {3, 1, 3, 7, 1, 9, 7};\n        int unique = 0;\n        // 对每个元素，检查它前面是否已经出现过\n    }\n}\n',
                hints: [
                  '外层 for 从左到右遍历每个元素；内层 for (int j = 0; j < i; j++) 只查看它前面已经处理过的部分。',
                  '用 boolean seen = false; 记录是否重复，内层发现 ids[j] == ids[i] 时把 seen 设为 true。',
                  '只有 !seen 时才算新编号：先按需输出空格，再 print(ids[i])，最后 unique++；循环结束后输出 uniq= 与总数。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int[] ids = {3, 1, 3, 7, 1, 9, 7};\n        int unique = 0;\n        for (int i = 0; i < ids.length; i++) {\n            boolean seen = false;\n            for (int j = 0; j < i; j++) {\n                if (ids[j] == ids[i]) {\n                    seen = true;\n                }\n            }\n            if (!seen) {\n                if (unique > 0) {\n                    System.out.print(" ");\n                }\n                System.out.print(ids[i]);\n                unique++;\n            }\n        }\n        System.out.println();\n        System.out.println("uniq=" + unique);\n    }\n}',
                must: { re: 'for\\s*\\([\\s\\S]*for\\s*\\(', text: '必须用嵌套循环判断元素是否重复' }
              }
            ],
            outro: '七份复制体依次熄灯，只剩下四个真正的编号。圣所深处的书架开始自行排列，书页间露出一条窄门。',
            loot: LS.makeLoot('epic', '散列束带', 'armor', '⌘', '束带内侧刻着两个必须同时成立的等式：equals 与 hashCode。缺一个，蜂群就会回来。', 'java')
          }
        ]
      },
      {
        id: 'java-11', title: '第十一章 · 藏书库', jp: '書庫の流れ',
        subtitle: '让数据在磁盘与内存之间往返', summary: '字节流与字符流、Files、try-with-resources 与序列化概念。',
        nodes: [
          {
            id: 'java-11-1', type: 'story', title: '没有关上的门', jp: '閉じられなかった扉', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '书库的记录不在内存里，它们睡在磁盘上，需要一条流把它们唤醒。' },
              { who: '书库蚀虫', tone: 'enemy', text: '你们打开了流，却忘了关。我就在那道没关的门里长大。' },
              { who: '艾莉丝', tone: 'ally', text: 'try-with-resources 会在结束时自动关闭，比在 finally 里手写 close 更稳，也更短。' },
              { who: '界灵·零', tone: 'guide', text: '字节流搬家，字符流读文。编码写错，中文就会变成一串问号。' },
              { who: '艾莉丝', tone: 'ally', text: '先把一批记录在内存里汇总清楚，再去碰真正的文件。顺序不能反。' }
            ]
          },
          {
            id: 'java-11-2', type: 'lesson', title: '文件 I/O 与数据持久化', jp: '入出力と保存', xp: 40, minutes: 28,
            article: {
              lead: '程序一关闭，内存里的数据就消失了。要让记录留下来，必须写进文件或数据库。本章从流的方向讲起，覆盖字节流与字符流、Files 工具类、自动关闭资源，以及序列化与 JSON 的基本概念。',
              sections: [
                {
                  h: '1. 流的方向与类型',
                  p: [
                    'I/O 流按方向分输入流（读，InputStream / Reader）与输出流（写，OutputStream / Writer）；按单位分字节流（一次一个 byte，适合图片、压缩包）与字符流（一次一个 char，适合文本）。',
                    '记住两条：读用 read，写用 write；字节流不关心内容，字符流会做编码转换。文本文件优先字符流，二进制文件必须字节流。'
                  ],
                  list: [
                    'FileInputStream / FileOutputStream：字节流，处理二进制；',
                    'FileReader / FileWriter：字符流，按平台默认编码处理文本；',
                    'BufferedReader / BufferedWriter：加缓冲，按行读写效率高；',
                    'InputStreamReader / OutputStreamWriter：在字节流和字符流之间搭桥，可显式指定编码。'
                  ]
                },
                {
                  h: '2. 按行读取文本',
                  p: [
                    '读文本最常用的组合是 BufferedReader 套 FileReader。readLine 每次返回一行，读到文件末尾返回 null，所以循环条件是 line != null。',
                    '不要用 read 的返回值判断是否读到空行：readLine 返回的是空字符串，只有文件结束才返回 null。'
                  ],
                  code: { lang: 'java', src: 'import java.io.BufferedReader;\nimport java.io.FileReader;\nimport java.io.IOException;\n\ntry (BufferedReader reader = new BufferedReader(new FileReader("records.txt"))) {\n    String line;\n    while ((line = reader.readLine()) != null) {\n        System.out.println(line);\n    }\n} catch (IOException e) {\n    System.out.println("读取失败：" + e.getMessage());\n}', runnable: false },
                  note: '概念示例：try 后面的括号里声明的资源会在代码块结束时自动关闭，即使中途抛异常。'
                },
                {
                  h: '3. Files：更现代的工具类',
                  p: [
                    'java.nio.file.Files 把常见操作封装成一行：readAllLines 一次读成 List，write 一次写入，exists 判断存在，createDirectories 建目录，copy 与 move 复制移动。',
                    'Path 表示路径，用 Paths.get 或 Path.of 构造。用 Paths.get("data", "records.txt") 拼接路径，可以避免手写斜杠带来的跨平台问题。'
                  ],
                  code: { lang: 'java', src: 'import java.nio.charset.StandardCharsets;\nimport java.nio.file.Files;\nimport java.nio.file.Path;\nimport java.nio.file.Paths;\n\nPath path = Paths.get("data", "records.txt");\nif (Files.exists(path)) {\n    List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);\n    System.out.println("行数 " + lines.size());\n    Files.write(path, lines, StandardCharsets.UTF_8);\n}', runnable: false },
                  note: '概念示例：readAllLines 适合小文件；大文件要用流逐行处理，否则会一次性占满内存。'
                },
                {
                  h: '4. try-with-resources',
                  p: [
                    '任何实现了 AutoCloseable 的对象都可以写在 try 的括号里，离开代码块时自动调用 close，多个资源用分号隔开，关闭顺序与声明顺序相反。',
                    '相比手写 finally 里的 close，它不会漏、不会因为 close 抛异常而掩盖原始异常。新代码应当一律使用这种写法。'
                  ],
                  code: { lang: 'java', src: 'import java.io.FileWriter;\nimport java.io.IOException;\n\ntry (FileWriter writer = new FileWriter("out.txt", true)) {\n    writer.write("源核记录\\n");\n} catch (IOException e) {\n    System.out.println("写入失败：" + e.getMessage());\n}', runnable: false },
                  note: 'FileWriter 的第二个参数 true 表示追加；不写或写 false 会覆盖整个文件，这是数据丢失的常见原因。'
                },
                {
                  h: '5. 序列化与 JSON',
                  p: [
                    '序列化把对象转成字节，便于存盘或传输；反序列化则相反。Java 原生方式是让类实现 Serializable 并声明 serialVersionUID，但它的格式与 Java 版本强绑定，跨语言不友好。',
                    '现代项目几乎都用 JSON：{"name":"艾莉丝","hp":90}。手写解析极易出错，实际开发用 Jackson 或 Gson，把对象与 JSON 互相映射。',
                    '无论哪种方式，都要注意版本兼容：新增字段时旧数据能否读取、字段改名后是否会静默丢数据。'
                  ],
                  code: { lang: 'java', src: 'class Save implements Serializable {\n    private static final long serialVersionUID = 1L;\n    String name;\n    int hp;\n\n    Save(String name, int hp) {\n        this.name = name;\n        this.hp = hp;\n    }\n}', runnable: false },
                  note: '概念示例：serialVersionUID 用来判断序列化版本是否兼容，改动类结构后不一致会抛 InvalidClassException。'
                },
                {
                  h: '6. 文件操作的常见错误',
                  p: [
                    '最常见的四类事故：忘记关闭流导致文件被占用；用平台默认编码读写导致中文乱码；路径用反斜杠拼接导致跨平台失败；catch 块空着不处理，出问题时毫无线索。',
                    '还有一个隐蔽问题：相对路径的基准是「启动进程时的工作目录」，不是源码所在目录。找不到文件时先打印绝对路径，再判断是不是基准目录错了。'
                  ],
                  list: [
                    '写文件前先确认目录存在，必要时 Files.createDirectories；',
                    '读写文本统一指定 StandardCharsets.UTF_8；',
                    'catch 里至少记录路径与异常信息，不要静默吞掉；',
                    '重要文件先写临时文件，成功后再替换，避免写一半崩溃。'
                  ]
                }
              ],
              terms: [
                { t: '字节流', en: 'byte stream', d: '以 byte 为单位读写的流，适合二进制数据。' },
                { t: '字符流', en: 'character stream', d: '以 char 为单位读写的流，会做编码转换。' },
                { t: '缓冲', en: 'buffering', d: '先攒一批数据再统一读写，减少系统调用次数。' },
                { t: 'try-with-resources', en: 'try-with-resources', d: '在 try 括号中声明资源并自动关闭的语法。' },
                { t: '序列化', en: 'serialization', d: '把对象转成字节序列以便存储或传输。' },
                { t: '编码', en: 'charset', d: '字符与字节之间的映射规则，如 UTF-8。' }
              ],
              exam: '考试与面试高频：字节流与字符流的区别、readLine 返回 null 的含义、try-with-resources 的好处、finally 中关闭资源的写法与风险、序列化与 serialVersionUID 的作用、乱码的成因。',
              checklist: ['能区分字节流与字符流的适用场景', '会写按行读取文件的循环', '能用 try-with-resources 自动关闭资源', '知道乱码与默认编码的关系', '能说清序列化与 JSON 的取舍']
            }
          },
          {
            id: 'java-11-3', type: 'battle', title: '遭遇 · 书库蚀虫', jp: '書庫の蝕虫', xp: 80,
            enemy: {
              name: '书库蚀虫', kind: 'slime', hp: 100,
              title: '蚀食者 · 书库', taunt: '这一页是空的。那一页也是。你还要算吗？',
              lore: '它吃掉记录里的空行，把有内容的页数搅乱。想让它现形，得先把一整批记录在内存里数清。'
            },
            brief: '书库残留六条记录：12、0、7、30、0、5，其中 0 表示被蚀虫啃空的页。统计有效记录数、合计与最大值。',
            tasks: [
              {
                prompt: '把 12、0、7、30、0、5 存入 int 数组，只统计大于 0 的记录：输出有效条数、合计与最大值，三行依次为「有效 x」「合计 x」「最大 x」。',
                requirement: '预期三行：有效 4 / 合计 54 / 最大 30',
                expected: '有效 4\n合计 54\n最大 30',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int[] records = {12, 0, 7, 30, 0, 5};\n        int valid = 0;\n        int total = 0;\n        int max = 0;\n        // 跳过 0，只统计有效记录\n    }\n}\n',
                hints: [
                  'for (int i = 0; i < records.length; i++) 逐条检查记录。',
                  'if (records[i] > 0) 时才 valid++ 并累加 total，最大值也在同一个分支里更新。',
                  'max 从 0 开始是安全的，因为只统计正数；最后按顺序输出三行，注意「有效」「合计」「最大」的中文与空格。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int[] records = {12, 0, 7, 30, 0, 5};\n        int valid = 0;\n        int total = 0;\n        int max = 0;\n        for (int i = 0; i < records.length; i++) {\n            if (records[i] > 0) {\n                valid++;\n                total = total + records[i];\n                if (records[i] > max) {\n                    max = records[i];\n                }\n            }\n        }\n        System.out.println("有效 " + valid);\n        System.out.println("合计 " + total);\n        System.out.println("最大 " + max);\n    }\n}',
                must: { re: 'if\\s*\\([\\s\\S]*if\\s*\\(', text: '必须用条件判断跳过空页并更新最大值' }
              }
            ],
            outro: '空行被逐条跳过，剩下的四页重新显字。蚀虫缩回没关上的门缝里，门在你身后轻轻合拢。',
            loot: LS.makeLoot('epic', '书库密钥', 'relic', '❖', '钥匙柄上刻着 close。它开不了任何门，只负责把门关好。', 'java')
          }
        ]
      },
      {
        id: 'java-12', title: '第十二章 · 源核之下', jp: '源核の底',
        subtitle: '把整卷所学铸成一件可以交付的东西', summary: '控制台项目结构、成绩统计、质数筛选与多线程入门；终章 Boss。',
        nodes: [
          {
            id: 'java-12-1', type: 'story', title: '源核的门', jp: '源核の扉', xp: 20,
            lines: [
              { who: '界灵·零', tone: 'guide', text: '源核之下没有新的语法，只有把学过的一切按正确顺序组装起来的能力。' },
              { who: '源核守望者', tone: 'enemy', text: '成绩、质数、线程、异常……你们人类总把简单的事叠成一座塔。' },
              { who: '艾莉丝', tone: 'ally', text: '那就一层一层拆。先算及格人数，再筛质数，最后让它在终端里稳定地输出。' },
              { who: '界灵·零', tone: 'guide', text: '终战有两击：第一击是统计，第二击是筛选。两击都稳，源核才会回应你。' },
              { who: '艾莉丝', tone: 'ally', text: '织码者，第二卷到这里就结束了。但你要带走的东西，才刚刚开始。' }
            ]
          },
          {
            id: 'java-12-2', type: 'lesson', title: '控制台项目与多线程入门', jp: '実戦と並行', xp: 40, minutes: 30,
            article: {
              lead: '这一章不再引入大量新语法，而是回答一个问题：怎么把零散的知识组装成一个能交付的小程序。我们会走一遍项目结构、需求拆解、方法抽取，最后碰一下多线程的门槛。',
              sections: [
                {
                  h: '1. 一个控制台项目的骨架',
                  p: [
                    '最小的可交付项目也要分层：入口类负责读参数与调度，service 负责业务计算，model 负责数据结构。全部塞进 main 的代码，三天后自己都读不懂。',
                    '包名用倒置域名（com.sekai.score），类名用大驼峰，方法名用小驼峰，常量全大写。命名规范不是形式，是让别人能读懂你的第一层文档。',
                    '入口类只做三件事：准备数据、调用服务、输出结果。业务算法放进静态方法，方便单独测试与复用。'
                  ],
                  code: { lang: 'java', src: 'public class Main {\n    public static void main(String[] args) {\n        int[] scores = {56, 78, 90, 45, 88, 93};\n        int pass = 0;\n        int total = 0;\n        for (int i = 0; i < scores.length; i++) {\n            total = total + scores[i];\n            if (scores[i] >= 60) {\n                pass++;\n            }\n        }\n        System.out.println("及格 " + pass);\n        System.out.println("平均 " + total / scores.length);\n    }\n}' },
                  note: '这段代码就是终战第一击的答案。先让它跑通，再谈拆分。'
                },
                {
                  h: '2. 需求拆解：从一句话到可执行步骤',
                  p: [
                    '需求「统计成绩」听起来模糊，拆开只有三步：准备数据、逐条判断并累加、按格式输出。把这三步写成中文伪代码，再逐行翻译成 Java，比直接敲代码快得多。',
                    '拆解时要顺手写下边界：数组为空怎么办？全是 0 分怎么办？总分除以 0 会崩。边界写清楚了，代码里的 if 才有依据。',
                    '平均分用整数除法还是保留小数，是需求问题不是技术问题。本题取整数部分，就必须在注释里写明，避免以后被人当成 bug 改掉。'
                  ],
                  list: [
                    '输入：一组分数，长度可能为 0；',
                    '处理：及格人数、总分、平均分；',
                    '输出：固定两行，格式稳定，便于比对；',
                    '边界：空数组时平均分返回 0，不抛异常。'
                  ]
                },
                {
                  h: '3. 方法抽取与参数设计',
                  p: [
                    '当 main 超过二十行，就该抽方法了。抽取的标准是「一件事」：passCount 只数及格人数，average 只算平均分，各自接收必要参数、返回一个结果。',
                    '参数尽量传值或不可变数据，返回值表达结果，避免用静态字段在方法之间传递状态。静态字段一多，方法就不再可单独测试。',
                    '方法签名定好后，main 就变成了三行调用。这也是为什么工程代码看起来「短」——复杂度被分摊到了有名字的方法里。'
                  ],
                  code: { lang: 'java', src: 'static int passCount(int[] scores) {\n    int count = 0;\n    for (int i = 0; i < scores.length; i++) {\n        if (scores[i] >= 60) {\n            count++;\n        }\n    }\n    return count;\n}\n\nstatic int average(int[] scores) {\n    if (scores.length == 0) {\n        return 0;\n    }\n    int total = 0;\n    for (int i = 0; i < scores.length; i++) {\n        total = total + scores[i];\n    }\n    return total / scores.length;\n}', runnable: false },
                  note: '概念示例：教学终端只执行 main 中的语句，方法定义请在真实 JDK 里练习；本章战斗题把等价逻辑写在 main 内。'
                },
                {
                  h: '4. 多线程入门',
                  p: [
                    '线程让多个任务「看起来同时」执行。两种写法：继承 Thread 并重写 run，或实现 Runnable 再交给 Thread。工程上优先 Runnable，因为类还能继承别的父类。',
                    'start 才会开启新线程，直接调用 run 只是在当前线程里普通地执行一遍。线程的执行顺序由调度器决定，不要依赖输出顺序。',
                    '多个线程修改同一个变量会产生竞态：i++ 不是原子操作，可能丢失更新。解决方式是加 synchronized、用原子类，或干脆不共享状态。'
                  ],
                  code: { lang: 'java', src: 'class Ticker implements Runnable {\n    private final String name;\n\n    Ticker(String name) {\n        this.name = name;\n    }\n\n    public void run() {\n        for (int i = 1; i <= 3; i++) {\n            System.out.println(name + " " + i);\n        }\n    }\n}\n\nThread t = new Thread(new Ticker("采集"));\nt.start();\nt.join();', runnable: false },
                  note: '概念示例：join 让主线程等待子线程结束。真实项目更常用线程池，而不是每次 new Thread。'
                },
                {
                  h: '5. 交付前的自检',
                  p: [
                    '能跑通不等于能交付。交付前至少过一遍清单：空输入、单元素、极端值、重复值、输出格式是否稳定。很多线上事故都出在「没想到会是空」。',
                    '把每一次修复都变成一个可重复的用例。今天手动试出来的边界，明天应该由测试自动跑一遍。',
                    '第二卷到这里结束：你已经能把字符串、数组、对象、继承、异常、集合、文件串成一条完整的链路。下一步是构建工具、单元测试与框架，但底层仍然是这些。'
                  ],
                  list: [
                    '空数组、单元素、全相同、全不及格；',
                    '除法与取余前先确认除数不为 0；',
                    '输出格式固定，行尾不留多余空格；',
                    '方法有明确返回值，不靠静态字段传状态；',
                    '关键分支有日志，出问题能定位。'
                  ],
                  note: '终战的两道题正是这套自检的缩影：一道统计，一道筛选，都要在边界上保持稳定。'
                }
              ],
              terms: [
                { t: '控制台应用', en: 'console application', d: '只通过标准输入输出与用户交互的程序。' },
                { t: '包', en: 'package', d: '组织类的命名空间，通常按域名倒置命名。' },
                { t: '方法抽取', en: 'extract method', d: '把一段逻辑移入独立方法并命名，降低主流程复杂度。' },
                { t: '线程', en: 'thread', d: '程序内部独立的执行路径，由调度器安排运行。' },
                { t: '竞态条件', en: 'race condition', d: '多线程访问共享数据时，结果依赖执行顺序的错误。' },
                { t: '边界用例', en: 'edge case', d: '空、单元素、极值等容易出错但常被忽略的输入。' }
              ],
              exam: '考试与面试高频：start 与 run 的区别、Runnable 与 Thread 的取舍、synchronized 的作用、线程不安全的表现、方法抽取与单一职责、整数除法的边界。',
              checklist: ['能规划一个控制台项目的类与方法', '能把需求拆成输入、处理、输出三步', '会抽取静态方法并设计参数与返回值', '说得清 start 与 run 的区别', '交付前会主动检查边界用例']
            }
          },
          {
            id: 'java-12-3', type: 'battle', title: '终战 · 源核守望者', jp: '源核の守護者', xp: 160,
            enemy: {
              name: '源核守望者', kind: 'dragon', hp: 100, boss: true,
              title: '首领 · 源核之底', taunt: '把学过的东西按顺序摆好。摆错一格，整座塔都会倒。',
              lore: '它由整座编译塔的旧日志凝成，鳞片上是无数行没人读过的方法。它不考验新知识，只考验你能不能把已知的东西稳稳组装起来。'
            },
            brief: '终战两击。第一击统计六名学徒的成绩：及格人数与平均分；第二击筛出 2 到 30 之间所有的质数。两击都稳，源核才会回应你。',
            tasks: [
              {
                prompt: '第一击：把 56、78、90、45、88、93 存入 int 数组，统计大于等于 60 的人数与平均分（取整数部分），输出两行：及格 人数 / 平均 分数。',
                requirement: '预期两行：及格 4 / 平均 75',
                expected: '及格 4\n平均 75',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int[] scores = {56, 78, 90, 45, 88, 93};\n        int pass = 0;\n        int total = 0;\n        // 遍历：累加总分，统计及格人数\n    }\n}\n',
                hints: [
                  'for (int i = 0; i < scores.length; i++)，每轮先把分数加进 total。',
                  'if (scores[i] >= 60) 时 pass++，不要用大于 60。',
                  '平均分用 total / scores.length：450 / 6 正好得 75，整数除法不会丢精度。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int[] scores = {56, 78, 90, 45, 88, 93};\n        int pass = 0;\n        int total = 0;\n        for (int i = 0; i < scores.length; i++) {\n            total = total + scores[i];\n            if (scores[i] >= 60) {\n                pass++;\n            }\n        }\n        System.out.println("及格 " + pass);\n        System.out.println("平均 " + total / scores.length);\n    }\n}',
                must: { re: '(for|while)\\s*\\(', text: '必须使用循环统计成绩' }
              },
              {
                prompt: '第二击：用嵌套循环找出 2 到 30 之间所有的质数，输出为一行、以单个空格分隔；第二行输出「共 n 个」。',
                requirement: '预期两行：2 3 5 7 11 13 17 19 23 29 / 共 10 个',
                expected: '2 3 5 7 11 13 17 19 23 29\n共 10 个',
                starter: 'public class Main {\n    public static void main(String[] args) {\n        int count = 0;\n        for (int n = 2; n <= 30; n++) {\n            boolean prime = true;\n            // 内层判断 n 是否只能被 1 和自身整除\n        }\n    }\n}\n',
                hints: [
                  '内层 for (int d = 2; d * d <= n; d++)，只要 d 能整除 n 就说明不是质数。',
                  '发现因子时把 prime 设为 false 并 break，跳出内层。',
                  'prime 为真时输出：第一个数前面不加空格，之后每个数前面补一个空格，最后输出「共 count 个」。'
                ],
                solution: 'public class Main {\n    public static void main(String[] args) {\n        int count = 0;\n        for (int n = 2; n <= 30; n++) {\n            boolean prime = true;\n            for (int d = 2; d * d <= n; d++) {\n                if (n % d == 0) {\n                    prime = false;\n                    break;\n                }\n            }\n            if (prime) {\n                if (count > 0) {\n                    System.out.print(" ");\n                }\n                System.out.print(n);\n                count++;\n            }\n        }\n        System.out.println();\n        System.out.println("共 " + count + " 个");\n    }\n}',
                must: { re: '(for|while)\\s*\\([\\s\\S]*if\\s*\\(', text: '必须用循环加条件判断筛选质数' }
              }
            ],
            outro: '源核的光从塔底一路亮到塔顶。守望者把最后一片鳞甲交给艾莉丝，上面写着一行旧日志：「代码是写给下一个人的信。」第二卷，完成。',
            loot: LS.makeLoot('mythic', '源核之钥', 'relic', '✵', '钥匙没有任何齿，只在柄上刻着 main。它打不开门，但能让每一扇门都知道你从哪里进来。', 'java')
          }
        ]
      }
    );
  }

  if (LS.lang('java')) {
    mount(LS.lang('java'));
  } else {
    const register = LS.registerLanguage;
    LS.registerLanguage = function (def) {
      register.call(LS, def);
      if (def.id === 'java') mount(def);
    };
  }
})(window.LS);
