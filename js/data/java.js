/* Java — 魔法使 · 编译塔 */
LS.registerLanguage({
  id: 'java',
  name: 'Java',
  jp: 'ジャヴァ',
  profession: '魔法使',
  professionJp: 'メイジ',
  professionStyle: 'mage',
  color: '#8a6fb8',
  color2: '#d8b36b',
  sigil: '魔',
  difficulty: 2,
  tagline: '把世界抽象成一座可以反复构筑的塔。',
  role: '咒式构筑师',
  weapon: '法杖',
  element: '咒',
  worldIntro: '编译塔悬浮在 Link-Sekai 的云海之上。每一块砖都由一个类构成，每一道楼梯都是一次方法调用。魔法使相信：真正稳固的魔法，来自严谨的结构。',
  description: '企业级开发的常青语言，类型严谨、生态庞大。学会 Java，你会理解「类、对象、接口」这些现代软件工程的骨架。',
  chapters: [
    {
      id: 'java-1', title: '第一章 · 编译塔', jp: 'コンパイルの塔',
      subtitle: '让第一句咒文通过编译', summary: 'JDK、JVM、类与主方法，输出、变量和基础类型。',
      nodes: [
        {
          id: 'java-1-1', type: 'story', title: '塔门前的语法幽灵', jp: '文法の亡霊', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '编译塔只放行结构完整的咒文。少一个分号，塔门都不会为你打开。' },
            { who: '艾莉丝', tone: 'ally', text: '我是驻塔魔法使艾莉丝。别被「企业级」三个字吓到，第一课你只需要让一句文字出现在终端上。' },
            { who: '语法幽灵', tone: 'enemy', text: '缺分号……大小写错误……未闭合的字符串……你身上全是破绽。' },
            { who: '艾莉丝', tone: 'ally', text: '那就从最稳的一句开始。记住：Java 的每一句，都以分号结束。' }
          ]
        },
        {
          id: 'java-1-2', type: 'lesson', title: 'Java 的骨架与输出', jp: '骨組みと出力', xp: 30, minutes: 15,
          article: {
            lead: 'Java 程序不是从第一行直接开始跑的。它需要一个入口：main 方法。理解这个骨架，后面的所有语法才有地方安放。',
            sections: [
              {
                h: '1. JDK、JRE、JVM',
                p: [
                  'JVM（Java Virtual Machine）是运行 Java 字节码的虚拟机；JRE 是运行环境，包含 JVM 和类库；JDK 是开发工具包，包含 JRE 以及编译器 javac。开发时要装 JDK，只运行程序可以只装 JRE。',
                  'Java 源代码 .java 先由 javac 编译成字节码 .class，再由 JVM 执行。这种设计让同一份字节码可以在不同操作系统上运行，也就是「一次编写，到处运行」。'
                ],
                code: { lang: 'java', src: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Link-Sekai");\n    }\n}' },
                note: '文件名通常与 public class 的名字一致：public class Main 放在 Main.java 中。'
              },
              {
                h: '2. 类、主方法与语句',
                p: [
                  'class 定义类，类是对象的蓝图。main 是程序入口，签名固定为 public static void main(String[] args)。public 表示公开，static 表示不依赖对象即可调用，void 表示没有返回值。',
                  'Java 用花括号 {} 划分代码块，用分号 ; 结束语句。语句可以跨行书写，但字符串和标识符不能随便断开。'
                ],
                list: [
                  'System.out.println(x)：输出 x 并换行；',
                  'System.out.print(x)：输出 x 但不换行；',
                  '// 单行注释，/* ... */ 多行注释；',
                  'Java 对大小写敏感，String 的首字母必须大写。'
                ]
              },
              {
                h: '3. 变量与基本类型',
                p: [
                  'Java 是静态类型语言：变量必须先声明类型，再使用。基本类型有 8 种，初学最常用的是 int（整数）、double（小数）、char（单个字符）、boolean（真假）。',
                  '字符串 String 是引用类型，用双引号。声明格式：类型 变量名 = 值;。变量名使用小驼峰，例如 heroHp。'
                ],
                code: { lang: 'java', src: 'int hp = 100;\ndouble atk = 7.5;\nboolean alive = true;\nString name = "艾莉丝";\nSystem.out.println(name + " HP=" + hp);' },
                note: 'Java 的 + 在遇到字符串时会做拼接；数字与字符串混合时，后面的内容会转成文本。'
              },
              {
                h: '4. 类型转换与运算细节',
                p: [
                  '小范围类型可以自动转成大范围类型（int → double），反过来需要强制转换 (int) 7.9，小数部分会被截断。整数相除会丢弃小数：7 / 2 得 3；如果要有小数，至少一边是 double。',
                  'int 有范围限制，超出范围会溢出回绕。实际项目里金额通常不用 double，而用 BigDecimal，避免精度误差。'
                ],
                code: { lang: 'java', src: 'int a = 7;\nint b = 2;\nSystem.out.println(a / b);\nSystem.out.println((double) a / b);\nSystem.out.println((int) 7.9);' }
              },
              {
                h: '5. 常见编译错误',
                p: [
                  '常见错误包括：缺少分号、花括号不匹配、变量未声明、类型不兼容、类名与文件名不一致、main 方法签名写错。',
                  '编译器报错会给出行号。先修最上面的错误，因为一个语法错误往往会引起后面一连串误报。'
                ],
                note: '本游戏终端会简化运行环境，只执行 main 方法中的语句，但保留类与主方法的书写训练。'
              }
            ],
            terms: [
              { t: 'JVM', en: 'Java Virtual Machine', d: '执行 Java 字节码的虚拟机。' },
              { t: 'JDK', en: 'Java Development Kit', d: '包含编译器与运行环境的 Java 开发工具包。' },
              { t: '字节码', en: 'bytecode', d: 'Java 源码编译后的中间指令，由 JVM 执行。' },
              { t: '主方法', en: 'main method', d: 'Java 程序的固定入口。' },
              { t: '静态类型', en: 'static typing', d: '变量在编译期就必须确定类型。' },
              { t: '强制转换', en: 'casting', d: '用 (类型) 把值转换成另一种类型，可能丢失精度。' }
            ],
            exam: '二级 Java 高频：main 方法签名、System.out.println 输出、整数除法、类型转换、String 拼接。注意 "1" + 2 得 "12"，而 1 + 2 + "" 得 "3"。',
            checklist: ['能解释 JDK/JRE/JVM 的区别', '能写出完整的主方法与输出', '会声明基本类型变量', '理解整数除法与强制转换']
          }
        },
        {
          id: 'java-1-3', type: 'battle', title: '遭遇 · 语法幽灵', jp: '文法の亡霊', xp: 60,
          enemy: {
            name: '语法幽灵', kind: 'wraith', hp: 100,
            title: '影兽 · 编译期', taunt: '分号。分号。你第 3 行又漏了。',
            lore: '它潜伏在编译器的报错信息里，专吃初学者的自信。结构完整的咒文会让它无处附着。'
          },
          brief: '幽灵挡住了塔门。写出两句完整的 Java 输出：第一行显示 LINK-SEKAI，第二行显示 7 × 6 的计算结果。',
          tasks: [
            {
              prompt: '在 main 方法中输出两行：第一行是文字 LINK-SEKAI，第二行是 7 * 6 的计算结果。输出必须使用 System.out.println。',
              requirement: '预期输出两行：LINK-SEKAI / 42',
              expected: 'LINK-SEKAI\n42',
              starter: 'public class Main {\n    public static void main(String[] args) {\n        // 在这里写下两句咏唱\n    }\n}\n',
              hints: [
                '第一行：System.out.println("LINK-SEKAI");注意字符串要用英文双引号。',
                '第二行：System.out.println(7 * 6);不要给 42 加引号，否则只会输出文字。',
                '每句结尾都要有英文分号。'
              ],
              solution: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("LINK-SEKAI");\n        System.out.println(7 * 6);\n    }\n}',
              must: { re: 'println', text: '必须使用 System.out.println 输出' }
            }
          ],
          outro: '塔门上的符文依次亮起。语法幽灵被编译器的蓝光推回阴影里，只留下一句不甘心的「missing semicolon」。',
          loot: LS.makeLoot('uncommon', '咏唱法杖', 'weapon', '✦', '杖身由一支不会漏分的分号雕成。传说这是每个魔法使的第一件法器。', 'java')
        }
      ]
    },
    {
      id: 'java-2', title: '第二章 · 符文回廊', jp: 'ルーンの回廊',
      subtitle: '让逻辑在分支与循环中成形', summary: '运算符、条件语句、switch 与循环。',
      nodes: [
        {
          id: 'java-2-1', type: 'story', title: '逻辑石像', jp: '論理の石像', xp: 15,
          lines: [
            { who: '艾莉丝', tone: 'ally', text: '回廊里的石像只认可一种咒文：能让它重复行动、又能在关键时刻停下的咒文。' },
            { who: '界灵·零', tone: 'guide', text: '它要求你计算 6 的阶乘。1×2×3×4×5×6，用循环完成，而不是直接写答案。' },
            { who: '逻辑石像', tone: 'enemy', text: '重复，是人类最不擅长的事。证明你能让机器替你重复。' },
            { who: '艾莉丝', tone: 'ally', text: 'for 循环是你的节拍器。记得循环变量的起点、终点和每次的变化。' }
          ]
        },
        {
          id: 'java-2-2', type: 'lesson', title: '运算符、分支与循环', jp: '演算と分岐と循環', xp: 30, minutes: 17,
          article: {
            lead: 'Java 的流程控制与大多数 C 家族语言相似，但类型更严格：条件必须是 boolean，不能用 1 代表真。',
            sections: [
              {
                h: '1. 算术与比较',
                p: [
                  '算术运算符：+ - * / %，其中 % 是取余。自增 ++ 让变量加 1，自减 -- 让变量减 1。a++ 是先用后加，++a 是先加后用，在简单语句里结果相同，在表达式中可能不同。',
                  '比较运算返回 boolean：== != > < >= <=。判断两个字符串内容是否相等要用 equals，而不是 ==；== 比较的是引用地址。'
                ],
                code: { lang: 'java', src: 'int a = 7, b = 3;\nSystem.out.println(a / b);\nSystem.out.println(a % b);\nSystem.out.println(a > b && b > 0);\nString s = "影";\nSystem.out.println(s.equals("影"));' }
              },
              {
                h: '2. if / else if / else',
                p: [
                  'if 的条件必须是 boolean 表达式。else if 按顺序判断，只有一个分支会执行。条件后面可以跟单条语句，也可以跟花括号代码块；建议始终写花括号，减少错误。'
                ],
                code: { lang: 'java', src: 'int hp = 35;\nif (hp <= 0) {\n    System.out.println("倒下");\n} else if (hp < 40) {\n    System.out.println("危险");\n} else {\n    System.out.println("继续战斗");\n}' }
              },
              {
                h: '3. switch',
                p: [
                  'switch 适合对一个值进行多分支精确匹配。每个 case 后通常写 break，否则会继续执行后面的 case（穿透）。现代 Java 也支持更安全的 switch 表达式写法。',
                  'switch 能匹配 byte、short、int、char、String、枚举等，不能直接匹配浮点数。'
                ],
                code: { lang: 'java', src: 'int rank = 2;\nswitch (rank) {\n    case 1:\n        System.out.println("见习");\n        break;\n    case 2:\n        System.out.println("正式");\n        break;\n    default:\n        System.out.println("未知");\n}' }
              },
              {
                h: '4. for 与 while',
                p: [
                  'for 的括号里由三部分组成：初始化; 条件; 更新。执行顺序是：初始化一次 → 判断条件 → 执行循环体 → 更新 → 再判断。',
                  'while 先判断再执行；do-while 先执行一次再判断。for 适合次数明确的循环，while 适合「直到条件改变」的循环。'
                ],
                code: { lang: 'java', src: 'int total = 0;\nfor (int i = 1; i <= 5; i++) {\n    total += i;\n}\nSystem.out.println(total);\n\nint n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n--;\n}' }
              },
              {
                h: '5. break、continue 与嵌套',
                p: [
                  'break 退出当前循环或 switch；continue 结束本次循环，进入下一次。嵌套循环中，break 只退出最内层。',
                  '考试常考循环执行次数与最终变量值。把每轮的值写在纸上，能避免大多数陷阱。'
                ],
                code: { lang: 'java', src: 'for (int i = 1; i <= 5; i++) {\n    if (i == 3) continue;\n    if (i == 5) break;\n    System.out.println(i);\n}' }
              }
            ],
            terms: [
              { t: '表达式', en: 'expression', d: '能计算出一个值的代码片段。' },
              { t: '条件', en: 'condition', d: '结果为 boolean 的表达式。' },
              { t: 'switch', d: '基于一个值进行多分支匹配的结构。' },
              { t: '循环变量', en: 'loop variable', d: '控制循环次数的变量，通常叫 i。' },
              { t: '穿透', en: 'fall-through', d: 'switch 中缺少 break 导致继续执行后续 case。' },
              { t: '嵌套循环', en: 'nested loop', d: '循环体里再包含一个循环。' }
            ],
            exam: '二级 Java 常考：for 三段的执行顺序、break/continue 对输出的影响、switch 的穿透、字符串内容比较必须用 equals。',
            checklist: ['会写 for 与 while 循环', '能解释 break 和 continue', '知道 == 与 equals 的区别', '理解 switch 的 break']
          }
        },
        {
          id: 'java-2-3', type: 'battle', title: '遭遇 · 逻辑石像', jp: '論理の石像', xp: 60,
          enemy: {
            name: '逻辑石像', kind: 'golem', hp: 100,
            title: '守卫 · 回廊', taunt: '重复。重复。让我看见你的节拍。',
            lore: '它由一段古老的循环咒文驱动。只要你能正确计算 6 的阶乘，它就会承认你懂得「重复」的力量。'
          },
          brief: '石像要求你用循环计算 6 的阶乘（1×2×3×4×5×6），并输出结果。不要直接打印 720。',
          tasks: [
            {
              prompt: '使用 for 或 while 循环计算 6 的阶乘并输出。代码中必须出现循环结构，不能直接输出 720。',
              requirement: '预期输出：720',
              expected: '720',
              starter: 'public class Main {\n    public static void main(String[] args) {\n        int result = 1;\n        // 用循环从 1 乘到 6\n    }\n}\n',
              hints: [
                '阶乘从 1 开始乘：result = 1。',
                '循环 for (int i = 1; i <= 6; i++)，每轮执行 result = result * i。',
                '循环结束后输出 System.out.println(result);。'
              ],
              solution: 'public class Main {\n    public static void main(String[] args) {\n        int result = 1;\n        for (int i = 1; i <= 6; i++) {\n            result = result * i;\n        }\n        System.out.println(result);\n    }\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用 for 或 while 循环' }
            }
          ],
          outro: '石像的内部传出六次沉稳的齿轮声，随后向侧面退开。回廊尽头，方法圣堂的门缓缓打开。',
          loot: LS.makeLoot('rare', '回廊魔导书', 'relic', '◈', '书页每翻一次，循环变量就前进一格。封皮上刻着「不要忘记更新」。', 'java')
        }
      ]
    },
    {
      id: 'java-3', title: '第三章 · 方法圣堂', jp: 'メソッドの聖堂',
      subtitle: '把咏唱封装成可复用的术式', summary: '方法、参数、返回值、类与对象。',
      nodes: [
        {
          id: 'java-3-1', type: 'story', title: '空指针的低语', jp: 'ヌルの囁き', xp: 15,
          lines: [
            { who: '艾莉丝', tone: 'ally', text: '方法圣堂里有一座会说话的空白石像。它说自己「没有对象」，所以什么也做不了。' },
            { who: '界灵·零', tone: 'guide', text: '那是空指针异常留下的影子。要修复它，你得先理解：方法与对象，是如何互相找到对方的。' },
            { who: '空指针幽灵', tone: 'enemy', text: 'null……null……你没有 new 我，却想调用我？' },
            { who: '艾莉丝', tone: 'ally', text: '先完成一次简单的循环咏唱。等你的节奏稳了，我们再谈对象。' }
          ]
        },
        {
          id: 'java-3-2', type: 'lesson', title: '方法与对象', jp: 'メソッドとオブジェクト', xp: 30, minutes: 20,
          article: {
            lead: '方法是类中的一段行为，对象是类的具体实例。Java 的工程感，来自它把数据与行为组织成清晰的结构。',
            sections: [
              {
                h: '1. 方法的结构',
                p: [
                  '方法由修饰符、返回类型、方法名、参数列表和方法体组成。void 表示不返回结果；有返回类型时，必须用 return 返回同类型的值。',
                  '参数是方法对外的接口。调用时传入实参，方法内部通过形参名使用它们。方法可以重载（overload）：同名但参数列表不同。'
                ],
                code: { lang: 'java', src: 'public static int add(int a, int b) {\n    return a + b;\n}\n\npublic static void main(String[] args) {\n    System.out.println(add(3, 5));\n}', runnable: false
},
                note: '本游戏终端专注于主方法中的语句运行，方法定义语法请结合真实 JDK 环境练习；课程中的关卡会用循环完成等价练习。'
              },
              {
                h: '2. 类与对象',
                p: [
                  '类（class）是模板，对象（object）是按模板创建出来的实例。用 new 关键字创建对象。字段（field）保存对象的状态，方法定义对象的行为。',
                  '构造方法（constructor）与类同名、没有返回类型，在 new 时自动调用，用来初始化字段。'
                ],
                code: { lang: 'java', src: 'class Hero {\n    String name;\n    int hp;\n\n    Hero(String name, int hp) {\n        this.name = name;\n        this.hp = hp;\n    }\n\n    void attack() {\n        System.out.println(name + " 发动攻击");\n    }\n}', runnable: false
}
              },
              {
                h: '3. this、static 与作用域',
                p: [
                  'this 指当前对象，用来区分字段与同名参数。static 成员属于类而不是对象，可以直接通过类名访问。main 就是 static 的，所以它不依赖某个对象。',
                  '局部变量在方法或代码块内有效；字段属于对象；静态字段属于类。理解作用域能避免「变量找不到」和意外覆盖。'
                ],
                code: { lang: 'java', src: 'class Counter {\n    static int total = 0;\n    int count = 0;\n\n    void add() {\n        count++;\n        total++;\n    }\n}', runnable: false
}
              },
              {
                h: '4. 封装与访问控制',
                p: [
                  'private 限制成员只能在本类访问，public 对外公开，protected 允许子类与同包访问，默认（不写）为同包可见。',
                  '封装的做法是：字段设为 private，通过 getter/setter 暴露受控访问。这样可以在赋值时做校验，而不是让外部随便改。'
                ],
                code: { lang: 'java', src: 'class Player {\n    private int hp;\n\n    public int getHp() {\n        return hp;\n    }\n\n    public void setHp(int hp) {\n        if (hp < 0) hp = 0;\n        this.hp = hp;\n    }\n}', runnable: false
}
              },
              {
                h: '5. 值传递',
                p: [
                  'Java 只有值传递：基本类型传的是值的副本，引用类型传的是引用的副本。方法内部修改基本类型参数，不影响外部；修改引用指向的对象内容，外部能看到。',
                  '这也是考试与面试的经典题：swap 两个 int 为什么没有效果。'
                ],
                code: { lang: 'java', src: 'static void change(int x) {\n    x = 99;\n}\n\nint a = 1;\nchange(a);\nSystem.out.println(a);', runnable: false
}
              }
            ],
            terms: [
              { t: '方法', en: 'method', d: '定义在类中的一段可调用行为。' },
              { t: '重载', en: 'overload', d: '同类中方法名相同、参数列表不同的多个方法。' },
              { t: '构造方法', en: 'constructor', d: '创建对象时自动调用的初始化方法，与类同名。' },
              { t: '字段', en: 'field', d: '类或对象中保存状态的变量。' },
              { t: '封装', en: 'encapsulation', d: '隐藏内部细节，只通过受控接口访问数据。' },
              { t: '值传递', en: 'pass-by-value', d: '调用方法时传递的是值的副本。' }
            ],
            exam: '二级 Java 高频：方法返回值、重载判断、构造方法特征、static 成员、private/public 访问权限。构造方法没有返回类型，连 void 也不写。',
            checklist: ['能解释方法的参数与返回值', '知道类与对象的关系', '理解构造方法与 this', '能区分静态成员与实例成员']
          }
        },
        {
          id: 'java-3-3', type: 'battle', title: '遭遇 · 空指针幽灵', jp: 'ヌルの亡霊', xp: 60,
          enemy: {
            name: '空指针幽灵', kind: 'wraith', hp: 100,
            title: '影兽 · 引用错误', taunt: 'null。你什么也没有创建，却想让我回应。',
            lore: '它诞生于一次忘记 new 的调用。要驱散它，你需要让自己的流程稳稳地跑完每一次循环。'
          },
          brief: '幽灵设下三道咏唱回响。用循环输出「咏唱·1」到「咏唱·3」，每一行一次。',
          tasks: [
            {
              prompt: '用 for 循环输出三行：咏唱·1、咏唱·2、咏唱·3。每行使用字符串拼接生成，不能手写三句输出。',
              requirement: '预期输出：咏唱·1 / 咏唱·2 / 咏唱·3（各占一行）',
              expected: '咏唱·1\n咏唱·2\n咏唱·3',
              starter: 'public class Main {\n    public static void main(String[] args) {\n        // 用循环生成三行咏唱\n    }\n}\n',
              hints: [
                'for (int i = 1; i <= 3; i++) 会依次得到 1、2、3。',
                '用字符串拼接："咏唱·" + i。',
                '完整语句：System.out.println("咏唱·" + i); 放进循环体。'
              ],
              solution: 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 3; i++) {\n            System.out.println("咏唱·" + i);\n        }\n    }\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环生成三行输出' }
            }
          ],
          outro: '三次咏唱在圣堂穹顶重叠。幽灵终于想起自己也曾是一个被 new 出来的对象，安静地散成了光。',
          loot: LS.makeLoot('epic', '圣堂指环', 'relic', '◇', '指环内侧刻着 this。它不会让你变得更强，只会让你更清楚自己是谁。', 'java')
        }
      ]
    },
    {
      id: 'java-4', title: '第四章 · 空指针恶龙', jp: '終章・ヌルの竜',
      subtitle: '在继承与集合之上重建编译之心', summary: '继承、接口、多态、集合与异常；挑战 Boss。',
      nodes: [
        {
          id: 'java-4-1', type: 'story', title: '编译之心停跳', jp: '止まった心臓', xp: 15,
          lines: [
            { who: '艾莉丝', tone: 'ally', text: '编译之心停跳了。恶龙用空指针把整座塔的对象图切断，所有引用都指向了虚无。' },
            { who: '界灵·零', tone: 'guide', text: '终战有两层。第一层，你要从集合里把仍然有效的数值找回来；第二层，用嵌套循环重新点亮塔顶的星阵。' },
            { who: '空指针恶龙', tone: 'enemy', text: '继承、接口、多态……你们人类总想给虚无套上结构。' },
            { who: '艾莉丝', tone: 'ally', text: '结构不是牢笼，是让彼此能找到对方的路径。来吧，织码者。' }
          ]
        },
        {
          id: 'java-4-2', type: 'lesson', title: '继承、接口与集合', jp: '継承と集合', xp: 30, minutes: 22,
          article: {
            lead: '面向对象的三大支柱是封装、继承、多态。Java 用类、接口和集合把这些概念落到了工程实践里。',
            sections: [
              {
                h: '1. 继承与 super',
                p: [
                  '子类用 extends 继承父类，获得父类可访问的字段与方法。Java 是单继承：一个类只能直接继承一个父类。',
                  'super 用来调用父类构造方法或成员。子类构造方法的第一行会隐式调用父类无参构造，若父类没有无参构造，必须显式写 super(...)。'
                ],
                code: { lang: 'java', src: 'class Character {\n    String name;\n    Character(String name) { this.name = name; }\n}\n\nclass Mage extends Character {\n    Mage(String name) { super(name); }\n}', runnable: false
}
              },
              {
                h: '2. 重写与多态',
                p: [
                  '子类可以重写（override）父类的方法，方法名、参数列表、返回类型需匹配。加上 @Override 注解能让编译器帮你检查。',
                  '多态指父类引用指向子类对象，调用的是子类重写后的方法。这让代码可以面向抽象编程，而不必为每种具体类型写一套逻辑。'
                ],
                code: { lang: 'java', src: 'class Hero {\n    void attack() { System.out.println("普通攻击"); }\n}\nclass Mage extends Hero {\n    @Override\n    void attack() { System.out.println("魔法攻击"); }\n}\n\nHero h = new Mage();\nh.attack();', runnable: false
}
              },
              {
                h: '3. 抽象类与接口',
                p: [
                  '抽象类用 abstract 声明，不能实例化，可以有构造方法和具体方法。接口用 interface 声明，定义一组能力约定；类用 implements 实现接口。',
                  '一个类可以实现多个接口。接口适合表达「能做什么」，继承适合表达「是什么」。'
                ],
                code: { lang: 'java', src: 'interface Healable {\n    void heal();\n}\n\nclass Healer implements Healable {\n    public void heal() {\n        System.out.println("治疗术");\n    }\n}', runnable: false
}
              },
              {
                h: '4. ArrayList 与 HashMap',
                p: [
                  'ArrayList 是可变长度列表，常用 add、get、size、remove。HashMap 保存键值对，用 put、get、containsKey。集合比数组更灵活，是实际开发的主力。',
                  '泛型 <String> 指定元素类型，能在编译期发现类型错误，避免运行时强转。'
                ],
                code: { lang: 'java', src: 'import java.util.ArrayList;\nimport java.util.HashMap;\n\nArrayList<String> names = new ArrayList<>();\nnames.add("艾莉丝");\nSystem.out.println(names.get(0));\n\nHashMap<String, Integer> bag = new HashMap<>();\nbag.put("苦无", 15);\nSystem.out.println(bag.get("苦无"));', runnable: false
}
              },
              {
                h: '5. 异常处理',
                p: [
                  '异常分为受检异常（checked）与非受检异常（unchecked）。try 中放可能出错的代码，catch 捕获并处理，finally 通常用于释放资源。',
                  'NullPointerException 是最常见的运行时异常：对 null 调用方法或访问字段就会触发。先判断是否为 null，或从设计上保证对象已初始化。',
                  '真实项目中还会使用 try-with-resources 自动关闭文件、流等资源。'
                ],
                code: { lang: 'java', src: 'try {\n    int[] arr = new int[3];\n    System.out.println(arr[5]);\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("索引越界");\n} finally {\n    System.out.println("检查结束");\n}', runnable: false
}
              }
            ],
            terms: [
              { t: '继承', en: 'inheritance', d: '子类获得父类可访问成员的关系。' },
              { t: '重写', en: 'override', d: '子类提供与父类同签名方法的新实现。' },
              { t: '多态', en: 'polymorphism', d: '同一父类引用在运行时表现出不同子类行为。' },
              { t: '接口', en: 'interface', d: '定义一组能力约定的类型。' },
              { t: '集合', en: 'collection', d: 'ArrayList、HashMap 等用于组织多个元素的数据结构。' },
              { t: '受检异常', en: 'checked exception', d: '编译器要求必须处理或声明的异常。' }
            ],
            exam: '二级 Java 高频：extends/implements、方法重写规则、多态调用、ArrayList 常用方法、异常捕获顺序（子类异常在前）。',
            checklist: ['能解释继承与接口的区别', '知道多态如何发生', '会使用 ArrayList 基本操作', '能读懂 try/catch/finally']
          }
        },
        {
          id: 'java-4-3', type: 'battle', title: '终战 · 空指针恶龙', jp: 'ヌルの竜', xp: 120,
          enemy: {
            name: '空指针恶龙', kind: 'dragon', hp: 100, boss: true,
            title: '首领 · 对象吞噬者', taunt: 'null reference……你连我是否存在都无法证明。',
            lore: '它盘踞在编译之心上方，用断裂的引用织成翅膀。每修复一段逻辑，就有一片鳞甲脱落。'
          },
          brief: '终战分两段。先计算 1 到 20 中所有偶数的和，再用嵌套循环点亮五层星阵。两段都完成，编译之心才会重新跳动。',
          tasks: [
            {
              prompt: '第一击：用循环计算 1 到 20 中所有偶数的和并输出。必须使用循环和条件判断。',
              requirement: '预期输出：110',
              expected: '110',
              starter: 'public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        // 遍历 1 到 20，累加偶数\n    }\n}\n',
              hints: [
                '循环 for (int i = 1; i <= 20; i++)。',
                '用 if (i % 2 == 0) 判断偶数，或者让 i 从 2 开始每次加 2。',
                '循环结束后输出 total。'
              ],
              solution: 'public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        for (int i = 1; i <= 20; i++) {\n            if (i % 2 == 0) {\n                total = total + i;\n            }\n        }\n        System.out.println(total);\n    }\n}',
              must: { re: '(for|while)\\s*\\(', text: '必须使用循环' }
            },
            {
              prompt: '第二击：用嵌套循环输出 5 行星阵。第 1 行 1 个星号，第 2 行 2 个，依此类推，第 5 行 5 个。每行结束后换行。',
              requirement: '预期输出 5 行，逐行增加一个 *',
              expected: '*\n**\n***\n****\n*****',
              starter: 'public class Main {\n    public static void main(String[] args) {\n        // 外层控制行，内层控制每行的星号数量\n    }\n}\n',
              hints: [
                '外层循环 for (int i = 1; i <= 5; i++) 控制行数。',
                '内层循环 for (int j = 1; j <= i; j++) 输出星号，用 System.out.print("*") 不换行。',
                '内层结束后执行 System.out.println(); 换行。'
              ],
              solution: 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print("*");\n            }\n            System.out.println();\n        }\n    }\n}',
              must: { re: '(for|while)\\s*\\([\\s\\S]*(for|while)\\s*\\(', text: '必须使用嵌套循环' }
            }
          ],
          outro: '最后一片鳞甲落下，编译之心重新跳动。塔顶的星阵依次亮起，艾莉丝把一枚温热的指环按进你的掌心：「魔法使的第一卷，完成了。」',
          loot: LS.makeLoot('mythic', '源核咏唱杖', 'weapon', '✧', '杖心封存着一颗从未抛出过的异常。它安静、完整，像一句终于闭合的咒文。', 'java')
        }
      ]
    }
  ]
});
