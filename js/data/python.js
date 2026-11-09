/* Python — 影忍 · 月影终端 */
LS.registerLanguage({
  id: 'python',
  name: 'Python',
  jp: 'パイソン',
  profession: '影忍',
  professionJp: 'シノビ',
  professionStyle: 'ninja',
  color: '#4f9f8f',
  color2: '#d8b36b',
  sigil: '忍',
  difficulty: 1,
  tagline: '用一行咒文，让机器替你潜行。',
  role: '无声的织网者',
  weapon: '苦无',
  element: '影',
  worldIntro: '月影终端藏在数据神社的地底。这里没有喧嚣，只有一行行正在呼吸的代码。影忍相信：最锋利的武器，是让重复劳动悄无声息地消失。',
  description: '语法干净、上手最快，自动化与数据领域的通用语言。适合第一次接触编程的人，也适合把想法快速做成作品的人。',
  chapters: [
    {
      id: 'py-1', title: '第一章 · 月影终端', jp: '月影の端末',
      subtitle: '让世界听见你的第一句咒文', summary: '连接终端，学会输出、变量与最基本的类型。',
      nodes: [
        {
          id: 'py-1-1', type: 'story', title: '雨夜的委托', jp: '雨夜の依頼', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '欢迎来到 Link-Sekai。这里每一门编程语言，都是一条通往源核的星轨。' },
            { who: '奈芙', tone: 'ally', text: '新来的织码者？别紧张。终端就像一只胆小的影猫，先用一句咒文让它听见你。' },
            { who: '界灵·零', tone: 'guide', text: '终端只接受「程序」。程序不是念给神听的祷词，而是能被机器一步步执行的指令。' },
            { who: '奈芙', tone: 'ally', text: '今晚的委托很简单：把「1+1 的结果」送到终端。做到这一点，你就算正式踏进影忍的门槛了。' }
          ]
        },
        {
          id: 'py-1-2', type: 'lesson', title: '终端、字符串与变量', jp: '最初の呪文', xp: 30, minutes: 12,
          article: {
            lead: '你不需要先懂计算机原理。把编程想成写一份极其精确的指令清单：机器不会猜你的意思，但只要你写清楚，它就会不厌其烦地执行。',
            sections: [
              {
                h: '1. 程序与解释器',
                p: [
                  'Python 是一门「解释型语言」。你写下的 .py 文件先交给解释器（interpreter）阅读，再由解释器逐行翻译给计算机执行。你可以把它想象成一位随行翻译：你写人类可读的咒文，它翻译成机器能做的动作。',
                  '终端（terminal）是你和程序对话的窗口。屏幕上的文字叫「输出」，从键盘输入给程序的内容叫「输入」。本章先学输出。'
                ],
                code: { lang: 'python', src: 'print("Hello, Link-Sekai")' },
                note: '本游戏的终端是一个教学沙盒，支持课程范围内的 Python 子集；报错会提示行号，先学会读错误，比背语法更重要。'
              },
              {
                h: '2. 用 print 输出',
                p: [
                  'print 是 Python 自带的函数（function），作用是把它括号里的内容送到终端。括号里的内容叫「参数」。双引号包住的文字叫「字符串」（string），表示这是一段文本，而不是要计算的公式。',
                  'Python 对大小写敏感：print 不是 Print。括号、引号都必须是英文半角符号，中文引号“”会让程序报语法错误。'
                ],
                code: { lang: 'python', src: 'print("影忍已上线")\nprint(1 + 1)\nprint("1 + 1 =", 1 + 1)' },
                list: [
                  '字符串要用一对英文单引号或双引号包住；',
                  'print("1 + 1") 输出文字 1 + 1；print(1 + 1) 先计算，再输出 2；',
                  '逗号可以连接多个输出内容，Python 默认用空格隔开。'
                ]
              },
              {
                h: '3. 变量：给记忆起名字',
                p: [
                  '变量（variable）是一块有名字的记忆空间。等号 = 不是数学里的「相等」，而是「赋值」：把右边的值放进左边的名字里。变量名最好使用有意义的英文，例如 name、hp、total。',
                  'Python 是动态类型语言：变量不需要提前声明类型，同一个名字可以先存数字，再存字符串。但类型仍然存在，运算时会检查。'
                ],
                code: { lang: 'python', src: 'hero = "奈芙"\nhp = 100\nprint(hero, "HP:", hp)\nhp = hp - 30\nprint("受到攻击后 HP:", hp)' },
                note: '变量名不能以数字开头，不能包含空格。推荐用下划线连接单词，例如 shadow_damage。'
              },
              {
                h: '4. 四种基础类型',
                p: [
                  '整数 int：1、42、-7；浮点数 float：3.14、0.5；字符串 str："影"；布尔值 bool：True / False。类型决定了一个值能做什么运算。',
                  'type(x) 可以查看类型。int("42") 会把字符串转成整数，str(42) 会把数字转成文本；转换失败（例如 int("影")）会抛出错误。'
                ],
                code: { lang: 'python', src: 'print(type(42))\nprint(type(3.14))\nprint(type("42"))\nprint(int("42") + 8)\nprint(str(42) + "8")' }
              },
              {
                h: '5. 注释与第一类错误',
                p: [
                  '以 # 开头的内容是注释（comment），解释器会忽略它。注释是写给未来的自己和队友看的，不是写给机器的。',
                  'SyntaxError 是「语法错误」，说明句子结构不对；NameError 是「名字错误」，说明你用了没有定义的变量。看到报错别慌，从最后一行往前读，通常会直接告诉你原因。'
                ],
                code: { lang: 'python', src: '# 这是一条注释\nlevel = 1  # 行尾注释\nprint(level)' },
                note: '考试中常见的读程序题，往往考的就是：变量被赋值了几次、print 到底打印了什么。'
              }
            ],
            terms: [
              { t: '程序', en: 'program', d: '一组按顺序交给计算机执行的指令。' },
              { t: '解释器', en: 'interpreter', d: '逐行读取并执行源代码的软件。Python 的官方解释器叫 CPython。' },
              { t: '字符串', en: 'string', d: '由引号包住的一段文本，可以包含中文、空格和符号。' },
              { t: '变量', en: 'variable', d: '有名字的数据容器；赋值后可以通过名字反复使用。' },
              { t: '赋值', en: 'assignment', d: '用 = 把右边的值保存到左边的变量中，不是数学等式。' },
              { t: '语法错误', en: 'SyntaxError', d: '代码结构不符合语言规则，程序在执行前就无法通过解析。' }
            ],
            exam: '计算机二级 Python 常考 print 的输出结果、变量类型转换与基本算术。注意 // 是整除（向下取整），% 是取余，** 是幂运算；print 多参数默认用空格连接。',
            checklist: ['能解释 print 和字符串的关系', '会创建并修改变量', '能区分 int、float、str、bool', '知道注释的写法']
          }
        },
        {
          id: 'py-1-3', type: 'battle', title: '遭遇 · 报错史莱姆', jp: 'エラースライム', xp: 60,
          enemy: {
            name: '报错史莱姆', kind: 'slime', hp: 100,
            title: '影兽 · 低级', taunt: 'Syntax… Error… 你的咒文，不完整。',
            lore: '由无数未处理的异常凝聚而成。它不会主动攻击，只会把你的错误原样吐回给你。'
          },
          brief: '史莱姆堵住了神社的终端。奈芙把一枚空白符咒递给你：只要让终端输出 1+1 的结果，符咒就会完成蓄能。',
          tasks: [
            {
              prompt: '让终端输出 1 + 1 的计算结果。要求真的执行加法，而不是只打印文字「1+1」。',
              requirement: '预期输出：2',
              expected: '2',
              starter: '# 终端已连接。\n# 写下你的第一句 Python 咒文：\n',
              hints: [
                '输出要用 print()，括号里的内容才会被送到终端。',
                '把表达式 1 + 1 放进 print 的括号里。',
                '完整写法：print(1 + 1)'
              ],
              solution: 'print(1 + 1)',
              must: { re: 'print\\s*\\(', text: '必须使用 print 函数' }
            }
          ],
          outro: '符咒亮起，史莱姆吐出一声轻微的 SyntaxError，缩成了一枚小小的光点。终端第一次记住了你的声音。',
          loot: LS.makeLoot('uncommon', '初鸣苦无', 'weapon', '⌁', '刃身上刻着你的第一行 print，遇到强敌时会轻轻发亮。', 'python')
        }
      ]
    },
    {
      id: 'py-2', title: '第二章 · 循环回廊', jp: '循環の回廊',
      subtitle: '让判断与重复成为本能', summary: '布尔值、条件分支、while 与 for 循环。',
      nodes: [
        {
          id: 'py-2-1', type: 'story', title: '回声狼的巡逻', jp: '木霊の狼', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '循环回廊会记录每一个进入者的脚步。若你的逻辑重复得足够漂亮，守卫会把你当成自己人。' },
            { who: '奈芙', tone: 'ally', text: '问题来了：回廊里有一头回声狼，它只听「重复」的节奏。你得用循环把 1 到 100 的数全部加完。' },
            { who: '回声狼', tone: 'enemy', text: '人类，别一个一个地数。那太慢了。让我听听你的节奏。' },
            { who: '奈芙', tone: 'ally', text: '记住：循环不是让代码变长，而是让一段代码替你走很多步。' }
          ]
        },
        {
          id: 'py-2-2', type: 'lesson', title: '条件与循环', jp: '分岐と循環', xp: 30, minutes: 16,
          article: {
            lead: '程序真正开始像「智能」的地方，是它能根据情况做选择，并且能重复做事。这两个能力就是条件与循环。',
            sections: [
              {
                h: '1. 布尔值与比较运算',
                p: [
                  '布尔值只有两个：True 和 False。比较运算会产出布尔值：== 判断相等，!= 判断不等，>、<、>=、<= 比较大小。注意 = 是赋值，== 才是比较。',
                  'and（并且）、or（或者）、not（取反）用来组合条件。现实中的「如果下雨并且没带伞」就是两个条件的逻辑组合。'
                ],
                code: { lang: 'python', src: 'hp = 80\nprint(hp > 50)      # True\nprint(hp == 80)     # True\nprint(hp < 30 or hp == 80)  # True\nprint(not hp > 50)  # False' }
              },
              {
                h: '2. if / elif / else',
                p: [
                  'if 的括号与冒号是语法的一部分。条件成立时执行缩进块，不成立时跳过。elif 是 else if 的缩写，只有前面的条件不成立才会继续判断。',
                  'Python 用缩进表示代码块，不需要花括号。同一代码块必须保持相同的缩进（通常 4 个空格）。缩进错误会让程序直接报错。'
                ],
                code: { lang: 'python', src: 'hp = 35\nif hp <= 0:\n    print("倒下")\nelif hp < 40:\n    print("危险")\nelse:\n    print("还能战斗")' }
              },
              {
                h: '3. while：条件为真就一直做',
                p: [
                  'while 会在条件为 True 时反复执行代码块。使用 while 最怕忘记改变条件，造成无限循环（infinite loop）。循环体里一定要让条件有机会变成 False。'
                ],
                code: { lang: 'python', src: 'hp = 3\nwhile hp > 0:\n    print("剩余生命:", hp)\n    hp = hp - 1\nprint("撤退")' },
                note: '死循环会让程序卡住。在真实开发里可以用 Ctrl+C 中断；在游戏终端里，我们会用执行步数上限保护你。'
              },
              {
                h: '4. for 与 range：按次数重复',
                p: [
                  'for 适合遍历一组确定的值。range(start, stop) 生成从 start 开始、到 stop 之前结束的整数序列：range(1, 5) 是 1、2、3、4，不包含 5。省略 start 时默认从 0 开始。',
                  'range(start, stop, step) 还能指定步长。例如 range(10, 0, -2) 会得到 10、8、6、4、2。'
                ],
                code: { lang: 'python', src: 'total = 0\nfor i in range(1, 6):\n    total = total + i\n    print("第", i, "次:", total)\nprint("总和:", total)' }
              },
              {
                h: '5. break 与 continue',
                p: [
                  'break 立即结束整个循环；continue 跳过本次剩余代码，直接进入下一次循环。它们常用于「找到目标就停止」或「跳过不合格项」。',
                  '循环嵌套时，break 只跳出当前这一层循环，不会一次跳出所有层。'
                ],
                code: { lang: 'python', src: 'for i in range(1, 10):\n    if i == 4:\n        continue\n    if i == 7:\n        break\n    print(i)' }
              }
            ],
            terms: [
              { t: '布尔值', en: 'boolean', d: '表示真或假的类型，只有 True 与 False。' },
              { t: '条件', en: 'condition', d: '一个能得出 True / False 的表达式，决定是否执行分支。' },
              { t: '循环', en: 'loop', d: '重复执行一段代码的结构。' },
              { t: '迭代', en: 'iteration', d: '循环中完成的一次重复过程。' },
              { t: '无限循环', en: 'infinite loop', d: '终止条件永远不成立的循环，会让程序卡住。' },
              { t: '缩进', en: 'indentation', d: 'Python 用行首空格表示代码归属层级，通常每层 4 个空格。' }
            ],
            exam: '二级 Python 高频考点：range 的边界、循环次数、break/continue 对输出的影响、if/elif 的匹配顺序。读题时把每一轮变量值写下来，比心算可靠。',
            checklist: ['能写出比较表达式', '会使用 if/elif/else', '能解释 range(1, 6) 的范围', '知道 break 和 continue 的区别']
          }
        },
        {
          id: 'py-2-3', type: 'battle', title: '遭遇 · 回声狼', jp: '木霊の狼', xp: 60,
          enemy: {
            name: '回声狼', kind: 'wolf', hp: 100,
            title: '影兽 · 巡逻者', taunt: '一下、两下、三下……你的节奏太乱了。',
            lore: '它靠重复的脚步声定位猎物。若你能用循环稳定地输出节奏，它就会把你误认成回廊的一部分。'
          },
          brief: '回声狼封锁了回廊。用循环计算 1 到 100 的所有整数之和，把结果输出。不要手写 100 个加法。',
          tasks: [
            {
              prompt: '使用 for 或 while 循环，计算 1 到 100（包含 100）的总和并输出。代码中必须出现循环结构。',
              requirement: '预期输出：5050',
              expected: '5050',
              starter: 'total = 0\n# 用循环累加 1 到 100\n',
              hints: [
                '用一个变量 total 保存累加结果，初始值是 0。',
                'for i in range(1, 101) 会依次取出 1 到 100。每一轮把 i 加到 total 上。',
                '循环结束后再 print(total)。注意 print 不要写进循环体里，否则会输出 100 行。'
              ],
              solution: 'total = 0\nfor i in range(1, 101):\n    total = total + i\nprint(total)',
              must: { re: '(for|while)\\b', text: '必须使用 for 或 while 循环' }
            }
          ],
          outro: '你的脚步与回廊的回声重叠。狼低下头，让开了道路。回廊深处，一段被尘封的「函数庭院」坐标浮现在终端上。',
          loot: LS.makeLoot('rare', '回廊足甲', 'relic', '◈', '鞋底刻着 range(1, 101)，每一步都精确落在节拍上。', 'python')
        }
      ]
    },
    {
      id: 'py-3', title: '第三章 · 函数庭院', jp: '関数の庭',
      subtitle: '把咒文封进可重复的术式', summary: '函数、参数、返回值、列表与遍历。',
      nodes: [
        {
          id: 'py-3-1', type: 'story', title: '被囚的织网师', jp: '囚われの織り手', xp: 15,
          lines: [
            { who: '奈芙', tone: 'ally', text: '函数庭院原本是影忍修补术式的地方。现在，一个「镜影傀儡」把织网师困在了里面。' },
            { who: '织网师·白', tone: 'ally', text: '它复制了我所有的术式，却只学会了表面形状。真正的术式，要能接收参数、返回结果。' },
            { who: '镜影傀儡', tone: 'enemy', text: '函数？不过是把同一段代码写了第二次。' },
            { who: '界灵·零', tone: 'guide', text: '用列表整理四枚毒刃的伤害，再让循环替你完成累加。别和一个只会模仿影子的傀儡比手势。' }
          ]
        },
        {
          id: 'py-3-2', type: 'lesson', title: '函数与列表', jp: '関数と配列', xp: 30, minutes: 18,
          article: {
            lead: '当同一段逻辑需要反复使用时，把它封进函数；当一组数据需要排成一列时，把它们放进列表。函数让代码可复用，列表让代码能处理「一批」数据。',
            sections: [
              {
                h: '1. 定义函数',
                p: [
                  'def 用来定义函数。函数名后面是参数列表，冒号后是缩进的函数体。调用函数时写 name()，传入的实参会按位置赋给形参。',
                  '函数不会自己执行，必须被调用。定义函数只是「准备术式」，调用才是「施放术式」。'
                ],
                code: { lang: 'python', src: 'def greet(name):\n    print("你好，", name)\n\ngreet("奈芙")\ngreet("织网师")' }
              },
              {
                h: '2. return：把结果交回来',
                p: [
                  'return 会把一个值返回给调用者，并立即结束函数。只 print 不 return 的函数，调用结果其实是 None。做计算时，通常让函数返回结果，再由外部决定怎么展示。'
                ],
                code: { lang: 'python', src: 'def damage(atk, times):\n    return atk * times\n\nprint(damage(12, 3))  # 36' },
                note: 'return 与 print 的区别是考试高频点：print 只是显示，return 才能把结果交给下一段代码继续使用。'
              },
              {
                h: '3. 作用域与参数',
                p: [
                  '函数内部定义的变量属于局部作用域（local scope），函数外通常访问不到。参数是函数对外的接口，调用者只需要知道「传什么、拿回什么」，不必关心内部细节。',
                  'Python 支持默认参数、关键字参数等写法。初学阶段先掌握：位置参数、默认值、返回值。'
                ],
                code: { lang: 'python', src: 'def heal(hp, amount=20):\n    return hp + amount\n\nprint(heal(50))\nprint(heal(50, 35))' }
              },
              {
                h: '4. 列表：一行里的多个值',
                p: [
                  '列表（list）用方括号表示，元素之间用逗号分隔。索引从 0 开始：第一个元素是 dmg[0]，最后一个是 dmg[-1]。len(list) 返回元素个数。',
                  'append(x) 在末尾追加元素，pop() 删除并返回末尾元素。列表可以存放不同类型，但实际项目里通常存放同类数据。'
                ],
                code: { lang: 'python', src: 'dmg = [12, 8, 20, 5]\nprint(len(dmg))\nprint(dmg[0], dmg[-1])\ndmg.append(15)\nprint(dmg)' }
              },
              {
                h: '5. 遍历列表',
                p: [
                  'for x in list 会依次把列表中的每个元素赋给 x。若需要索引，可以使用 range(len(list))，再通过 list[i] 访问。索引越界（index out of range）是最常见的列表错误。',
                  '切片 list[start:stop] 可以取子列表，stop 位置不包含在内。'
                ],
                code: { lang: 'python', src: 'dmg = [12, 8, 20, 5]\ntotal = 0\nfor v in dmg:\n    total = total + v\nprint("总伤害:", total)\nprint(dmg[1:3])' }
              }
            ],
            terms: [
              { t: '函数', en: 'function', d: '封装一段可重复调用逻辑的代码单元。' },
              { t: '参数', en: 'parameter', d: '函数定义中接收外部数据的变量。调用时传入的具体值叫实参。' },
              { t: '返回值', en: 'return value', d: '函数执行后用 return 交回给调用者的结果。' },
              { t: '作用域', en: 'scope', d: '变量能够被访问的范围。' },
              { t: '列表', en: 'list', d: '按顺序保存多个元素的可变容器。' },
              { t: '索引', en: 'index', d: '元素在列表中的位置编号，从 0 开始。' },
              { t: '越界', en: 'out of range', d: '访问了不存在的索引位置导致的错误。' }
            ],
            exam: '列表索引从 0 开始、切片不包含右端点、append 原地修改而不会返回新列表；函数中 return 会立即结束函数。这些都是二级 Python 读程序题的高频陷阱。',
            checklist: ['会定义并调用函数', '能解释参数与返回值', '会创建、索引、遍历列表', '能看懂索引越界错误']
          }
        },
        {
          id: 'py-3-3', type: 'battle', title: '遭遇 · 镜影傀儡', jp: '鏡影の傀儡', xp: 60,
          enemy: {
            name: '镜影傀儡', kind: 'glitch', hp: 100,
            title: '造物 · 模仿者', taunt: '你的招式，我全都见过。',
            lore: '它能复制动作，却无法理解参数为什么变化。只要你的计算依赖真实数据，它的模仿就会崩溃。'
          },
          brief: '傀儡把四枚毒刃的伤害数据散落在地上。用列表收集它们，再用循环算出总伤害。',
          tasks: [
            {
              prompt: '给定伤害列表 [12, 8, 20, 5]，使用循环累加并输出总伤害。代码中必须出现循环。',
              requirement: '预期输出：45',
              expected: '45',
              starter: 'dmg = [12, 8, 20, 5]\ntotal = 0\n# 遍历列表并累加\n',
              hints: [
                'for v in dmg 可以依次取出列表中的每个伤害值。',
                '每取出一个 v，就执行 total = total + v。',
                '循环结束后 print(total)。或者使用内置函数 sum(dmg)，但本关建议练习循环。'
              ],
              solution: 'dmg = [12, 8, 20, 5]\ntotal = 0\nfor v in dmg:\n    total = total + v\nprint(total)',
              must: { re: '(for|while)\\b', text: '必须使用循环结构' }
            }
          ],
          outro: '傀儡复制了你的循环，却把数据源弄丢了。它的镜面裂开，织网师从碎片中走出，把一枚小小的织网手里剑放在你掌心。',
          loot: LS.makeLoot('epic', '织网手里剑', 'weapon', '✦', '每次命中都会记录一行参数。它提醒你：可复用的不是动作，而是逻辑。', 'python')
        }
      ]
    },
    {
      id: 'py-4', title: '第四章 · 吞码恶龙', jp: '終章・碼喰いの竜',
      subtitle: '在字典与异常之间，写下终章', summary: '字典、异常、模块与文件；挑战本章 Boss。',
      nodes: [
        {
          id: 'py-4-1', type: 'story', title: '龙翼下的源核', jp: '源核の竜', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '源核就在前方。但吞码恶龙已经吞下了太多未处理的异常，连自己的名字都开始重复。' },
            { who: '奈芙', tone: 'ally', text: '这一战不能只靠一条咒文。你要学会把数据按「键」整理，也要学会在错误发生时不让程序崩溃。' },
            { who: '吞码恶龙', tone: 'enemy', text: '字典、异常、模块……人类给恐惧起的名字，真多。' },
            { who: '界灵·零', tone: 'guide', text: '第一击，用字典取出忍具的伤害；第二击，用循环与取余破解它的影阵。' }
          ]
        },
        {
          id: 'py-4-2', type: 'lesson', title: '字典、异常与模块', jp: '辞書と例外と書庫', xp: 30, minutes: 20,
          article: {
            lead: '字典用来按「名字」查数据；异常处理让程序遇到意外时不至于整个倒下；模块则让你借用别人已经写好的术式。这三件事，是从练习代码走向真实项目的门槛。',
            sections: [
              {
                h: '1. 字典：用键查值',
                p: [
                  '字典（dict）保存「键 → 值」的映射。键通常是字符串或数字，值可以是任意类型。用 d["键"] 读取，用 d["新键"] = 值 写入。键必须唯一，后写入的同名键会覆盖旧值。',
                  '查询不存在的键会抛出 KeyError。get(key, default) 可以安全读取：键不存在时返回默认值，而不是报错。'
                ],
                code: { lang: 'python', src: 'bag = {"苦无": 15, "毒刃": 30}\nprint(bag["苦无"])\nprint(bag.get("烟丸", 0))\nbag["烟丸"] = 8\nprint(bag)' },
                note: '字典的键必须可哈希（hashable）。列表不能当键，但数字、字符串、元组可以。'
              },
              {
                h: '2. 元组与集合',
                p: [
                  '元组（tuple）用圆括号表示，创建后不能修改，适合保存固定的一组值。集合（set）用花括号表示，元素不重复且无序，适合去重和集合运算。',
                  '空字典是 {}，空集合必须写 set()，因为 {} 默认表示字典。'
                ],
                code: { lang: 'python', src: 'point = (3, 5)\nprint(point[0])\n\nids = {101, 102, 102, 103}\nprint(ids)  # 重复的 102 只保留一次', runnable: false
}
              },
              {
                h: '3. 异常：给失败留一条退路',
                p: [
                  '程序运行中出现的错误叫异常（exception）。try 块放可能出错的代码，except 捕获指定类型的异常并处理，finally 无论成功失败都会执行。',
                  '不要用裸 except 吞掉所有错误，也不要让异常处理掩盖真正的逻辑问题。捕获你预期的错误，给出清晰的处理方式。'
                ],
                code: { lang: 'python', src: 'text = "影"\ntry:\n    n = int(text)\n    print(n)\nexcept ValueError:\n    print("这不是一个整数，改用默认值 0")\n    n = 0\nfinally:\n    print("读取结束")' }
              },
              {
                h: '4. 模块与导入',
                p: [
                  '模块（module）就是一个 .py 文件或标准库包。import math 导入数学模块，之后用 math.sqrt(16) 调用。from random import randint 可以只导入某个函数。',
                  'Python 自带大量标准库：math、random、datetime、json、os、re 等。真实项目还会使用第三方包，例如 requests、pandas。'
                ],
                code: { lang: 'python', src: 'import math\nprint(math.sqrt(81))\n\nimport random\nprint(random.randint(1, 6))' }
              },
              {
                h: '5. 文件与下一步',
                p: [
                  'open(路径, 模式) 打开文件，with 语句会在代码块结束后自动关闭文件，避免资源泄漏。模式 "r" 读取，"w" 覆盖写入，"a" 追加。',
                  '学到这一步，你已经具备继续自学的骨架：变量与类型 → 流程控制 → 函数与容器 → 异常与模块。下一步可以挑战面向对象、文件处理、爬虫或数据分析。'
                ],
                code: { lang: 'python', src: 'with open("notes.txt", "w", encoding="utf-8") as f:\n    f.write("Link-Sekai\\n")\n\nwith open("notes.txt", "r", encoding="utf-8") as f:\n    print(f.read())', runnable: false
},
                note: '本关卡的教学终端只模拟课程范围内的子集，不会真的读写你电脑上的文件；示例用于理解语法结构。'
              }
            ],
            terms: [
              { t: '字典', en: 'dict', d: '保存键值对的数据结构，按键快速查找值。' },
              { t: '键 / 值', en: 'key / value', d: '字典中的名字与对应数据；键必须唯一。' },
              { t: '异常', en: 'exception', d: '程序运行时出现的错误事件，可被捕获并处理。' },
              { t: '模块', en: 'module', d: '封装了变量、函数和类的可导入文件。' },
              { t: '导入', en: 'import', d: '把模块或其中的名字引入当前程序。' },
              { t: '上下文管理器', en: 'context manager', d: '配合 with 使用、能自动完成清理工作的对象，例如文件。' }
            ],
            exam: '二级 Python 会考字典的创建与访问、异常捕获的基本结构、random/math 常用函数的调用。记住：KeyError 是字典键不存在，ValueError 是类型正确但值不合适。',
            checklist: ['会创建并访问字典', '知道 try/except 的作用', '能说出 import 的用途', '理解 with open 的基本结构']
          }
        },
        {
          id: 'py-4-3', type: 'battle', title: '终战 · 吞码恶龙', jp: '碼喰いの竜', xp: 120,
          enemy: {
            name: '吞码恶龙 · 迭代之影', kind: 'dragon', hp: 100, boss: true,
            title: '首领 · 异常聚合体', taunt: '把你的循环、你的字典、你的返回值……全部吞掉。',
            lore: '它由上千个未捕获的异常堆叠而成。每正确执行一段逻辑，就会有一层错误被剥落。'
          },
          brief: '终战有两段咏唱。第一段用字典取出忍具伤害；第二段用循环与取余击碎恶龙的影阵。两段都完成，源核才会重新点亮。',
          tasks: [
            {
              prompt: '第一击：给定字典 bag = {"苦无": 15, "毒刃": 30}，取出两个键对应的值并输出它们的和。代码中必须使用字典的键访问。',
              requirement: '预期输出：45',
              expected: '45',
              starter: 'bag = {"苦无": 15, "毒刃": 30}\n# 取出两个键的值并相加\n',
              hints: [
                '字典用方括号和键来取值：bag["苦无"]。',
                '分别取出两个值，再相加。',
                '写法：print(bag["苦无"] + bag["毒刃"])。'
              ],
              solution: 'bag = {"苦无": 15, "毒刃": 30}\nprint(bag["苦无"] + bag["毒刃"])',
              must: { re: '\\[\\s*["\']', text: '必须使用字典的键访问（方括号 + 键）' }
            },
            {
              prompt: '第二击：输出 1 到 15。遇到 3 的倍数输出「影」，遇到 5 的倍数输出「刃」，同时是 3 和 5 的倍数输出「影刃」。每项占一行。必须使用循环和条件判断。',
              requirement: '共 15 行；15 同时满足 3 和 5 的倍数，输出「影刃」',
              expected: '1\n2\n影\n4\n刃\n影\n7\n8\n影\n刃\n11\n影\n13\n14\n影刃',
              starter: 'for i in range(1, 16):\n    # 先判断同时是 3 和 5 的倍数，再分别判断\n    pass\n',
              hints: [
                '取余 % 可以判断整除：i % 3 == 0 表示 i 是 3 的倍数。',
                '先判断 i % 3 == 0 and i % 5 == 0，否则 15 会提前被「影」截走。',
                '结构：if i % 15 == 0: ... elif i % 3 == 0: ... elif i % 5 == 0: ... else: print(i)。'
              ],
              solution: 'for i in range(1, 16):\n    if i % 15 == 0:\n        print("影刃")\n    elif i % 3 == 0:\n        print("影")\n    elif i % 5 == 0:\n        print("刃")\n    else:\n        print(i)',
              must: { re: '(for|while)\\b[\\s\\S]*(if|elif)\\b', text: '必须同时使用循环与条件判断' }
            }
          ],
          outro: '恶龙的最后一层异常碎裂，源核像一枚安静的月亮重新升起。奈芙把刀收回鞘里，对你点了点头：「影忍的第一课，你毕业了。」',
          loot: LS.makeLoot('mythic', '终焉·无声之刃', 'weapon', '☾', '刀身没有光，却能让整座终端安静下来。传说它由第一行 print 铸成。', 'python')
        }
      ]
    }
  ]
});
