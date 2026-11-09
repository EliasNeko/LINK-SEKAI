/* Go — 星港游侠 · 灯塔航线 */
LS.registerLanguage({
  id: 'go',
  name: 'Go',
  jp: 'ゴー',
  profession: '星港游侠',
  professionJp: 'レンジャー',
  professionStyle: 'ranger',
  color: '#4f8fa8',
  color2: '#d8c48a',
  sigil: '航',
  difficulty: 2,
  tagline: '简单、并发、可靠——把船安全送到下一个港口。',
  role: '航线守望者',
  weapon: '星轨短枪',
  element: '航',
  worldIntro: '星港建在一条会移动的航线上。游侠不追逐复杂的技巧，只保证每一次出发都能抵达。Go 用极少的语法、明确的错误处理和天然的并发，守住了这条航线的秩序。',
  description: 'Google 设计的现代工程语言。语法精简、编译迅速、并发模型清晰，广泛用于云服务、网络服务与命令行工具。',
  chapters: [
    {
      id: 'go-1', title: '第一章 · 星港灯塔', jp: '星港の灯台',
      subtitle: '让第一束信号准确抵达', summary: 'package、main、fmt 与变量声明。',
      nodes: [
        {
          id: 'go-1-1', type: 'story', title: '熄灭的航标', jp: '消えた航標', xp: 15,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '星港的航标灭了。没有信号，返航的船会错过唯一的入口。' },
            { who: '岚', tone: 'ally', text: '我是航线游侠岚。Go 的第一件事很朴素：让灯塔说出坐标。fmt.Println 就是我们的信号灯。' },
            { who: '虚空水母', tone: 'enemy', text: '没有坐标……没有港口……你们就在原地漂着吧。' },
            { who: '岚', tone: 'ally', text: '先输出港口名 LINK-SEKAI 和灯塔编号 42。两行，干净利落。' }
          ]
        },
        {
          id: 'go-1-2', type: 'lesson', title: 'Go 的程序结构与输出', jp: '構造と出力', xp: 30, minutes: 15,
          article: {
            lead: 'Go 的程序由包组成。每个可执行程序都必须有一个 main 包和一个 main 函数。它刻意减少了语法糖，让团队读代码时不需要猜测。',
            sections: [
              {
                h: '1. package、import 与 main',
                p: [
                  '每个 Go 文件以 package 声明开头。可执行程序使用 package main。import 引入其他包，入口函数是 func main()。',
                  'Go 的格式化工具 gofmt 是官方标准，几乎所有项目都会在保存时自动格式化。缩进用制表符或空格由 gofmt 统一。'
                ],
                code: { lang: 'go', src: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Link-Sekai")\n}' }
              },
              {
                h: '2. fmt 输出',
                p: [
                  'fmt.Println 输出参数并在末尾自动换行，多个参数之间加空格。fmt.Print 不自动换行。fmt.Printf 使用格式动词，如 %d、%s、%v。',
                  'Go 的 fmt 包非常常用。%v 按默认格式输出任意值，%+v 会带上字段名，%T 输出类型。'
                ],
                code: { lang: 'go', src: 'name := "岚"\nlevel := 3\nfmt.Println("港口", name)\nfmt.Printf("Lv.%d\\n", level)' }
              },
              {
                h: '3. 变量与短声明',
                p: [
                  '用 var 声明变量：var hp int = 100。在函数内部可以用 := 短声明：hp := 100，类型由右侧推导。',
                  'Go 是静态类型语言，变量类型一旦确定就不能改变。未使用的局部变量会导致编译错误，这是 Go 强制保持代码整洁的方式。'
                ],
                code: { lang: 'go', src: 'var port string = "星港"\nhp := 100\natk := 8.5\nfmt.Println(port, hp, atk)' }
              },
              {
                h: '4. 基本类型与零值',
                p: [
                  '常用类型：int、int64、float64、string、bool、byte、rune。声明但未赋值的变量会有零值：数值为 0，字符串为空串，布尔为 false。',
                  'Go 没有隐式类型转换。int 与 int64 不能直接相加，必须显式转换：int64(n)。这避免了大量隐蔽错误。'
                ],
                code: { lang: 'go', src: 'var count int\nvar name string\nfmt.Println(count, name == "")\nvar a int = 3\nvar b int64 = int64(a)\nfmt.Println(b)', runnable: false
}
              },
              {
                h: '5. 常量与 iota',
                p: [
                  'const 声明常量，值必须在编译期确定。iota 在 const 块中从 0 开始递增，适合定义一组状态。',
                  'Go 的命名习惯：包名小写、简短；导出名首字母大写；变量名尽量短但有意义。'
                ],
                code: { lang: 'go', src: 'const Port = "LINK-SEKAI"\nconst (\n    Idle = iota\n    Sailing\n    Docked\n)\nfmt.Println(Idle, Sailing, Docked)', runnable: false
}
              }
            ],
            terms: [
              { t: '包', en: 'package', d: 'Go 中组织代码的基本单位，一个目录通常对应一个包。' },
              { t: '短声明', en: 'short variable declaration', d: '用 := 在函数内声明并初始化变量。' },
              { t: '零值', en: 'zero value', d: '变量声明后未赋值时的默认值。' },
              { t: '显式转换', en: 'explicit conversion', d: 'Go 要求不同类型之间必须写明转换。' },
              { t: 'iota', d: 'const 块中自动递增的常量计数器。' }
            ],
            exam: 'Go 基础与云原生面试高频：package/import、:= 与 var、零值、显式类型转换、fmt 格式动词、未使用变量为何报错。',
            checklist: ['能写最小 Go 程序', '会用 fmt.Println', '理解 := 与 var', '知道零值和显式转换']
          }
        },
        {
          id: 'go-1-3', type: 'battle', title: '遭遇 · 虚空水母', jp: 'ヴォイドクラゲ', xp: 60,
          enemy: {
            name: '虚空水母', kind: 'wraith', hp: 100,
            title: '影兽 · 信号吞噬者', taunt: '没有坐标，就没有港口。',
            lore: '它吞掉了灯塔的两行信号。用 fmt 准确输出港口名与编号，航线就能重新被看见。'
          },
          brief: '灯塔需要两行信号：港口名 LINK-SEKAI，以及灯塔编号 42。',
          tasks: [
            {
              prompt: '使用 fmt.Println 或 fmt.Printf 输出两行：第一行 LINK-SEKAI，第二行 42。',
              requirement: '预期输出：LINK-SEKAI / 42',
              expected: 'LINK-SEKAI\n42',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // 输出两行信号\n}\n',
              hints: [
                '第一行 fmt.Println("LINK-SEKAI")。',
                '第二行可以写 fmt.Println(42)。',
                '注意两行顺序，不要加多余文字。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("LINK-SEKAI")\n    fmt.Println(42)\n}',
              must: { re: 'fmt\\.(Println|Printf|Print)\\s*\\(', text: '必须使用 fmt 输出' }
            }
          ],
          outro: '两行信号穿过虚空，水母的触须松开。远处第一艘返航船的灯，在黑暗里回应了一下。',
          loot: LS.makeLoot('uncommon', '信号短枪', 'weapon', '⌁', '枪膛里装着一行不会褪色的 fmt.Println。它发射的不是子弹，是坐标。', 'go')
        }
      ]
    },
    {
      id: 'go-2', title: '第二章 · 轨道回廊', jp: '軌道の回廊',
      subtitle: '在变化的航线上保持判断', summary: 'if、for、switch 与流程控制。',
      nodes: [
        {
          id: 'go-2-1', type: 'story', title: '偏移的轨道', jp: 'ずれた軌道', xp: 15,
          lines: [
            { who: '岚', tone: 'ally', text: '轨道每偏移一次，就需要重新计算 100 个航段的总长度。数字不对，船会撞上碎片带。' },
            { who: '界灵·零', tone: 'guide', text: 'Go 只有一种循环关键字：for。它同时承担了 for、while 和无限循环。' },
            { who: '轨道鲨', tone: 'enemy', text: '绕圈吧。绕到忘记出口。' },
            { who: '岚', tone: 'ally', text: '只要条件写对，绕多少圈都能回家。' }
          ]
        },
        {
          id: 'go-2-2', type: 'lesson', title: 'Go 的条件与唯一循环', jp: '条件と唯一の循環', xp: 30, minutes: 16,
          article: {
            lead: 'Go 的流程控制刻意精简：if、for、switch，没有 while、do-while，也没有三元运算符。少一种写法，就少一种分歧。',
            sections: [
              {
                h: '1. if 与初始化语句',
                p: [
                  'if 的条件不需要括号，但花括号必须与条件同行。if 可以在条件前写一条初始化语句：if n := len(s); n > 0 { ... }。',
                  '初始化语句声明的变量只在该 if/else 块内有效，适合把「取值 + 判断」写在一起，减少变量泄漏。'
                ],
                code: { lang: 'go', src: 'hp := 35\nif hp <= 0 {\n    fmt.Println("倒下")\n} else if hp < 40 {\n    fmt.Println("危险")\n} else {\n    fmt.Println("安全")\n}' }
              },
              {
                h: '2. 只有 for',
                p: [
                  'for 的三种形态：for i := 0; i < n; i++（计数循环）、for 条件（相当于 while）、for（无限循环）。',
                  '循环变量在 Go 1.22 之后每次迭代都有新的绑定，闭包捕获时更安全。旧版本中需要显式复制变量。'
                ],
                code: { lang: 'go', src: 'total := 0\nfor i := 1; i <= 100; i++ {\n    total += i\n}\nfmt.Println(total)\n\nn := 3\nfor n > 0 {\n    fmt.Println(n)\n    n--\n}' }
              },
              {
                h: '3. range 遍历',
                p: [
                  'range 可以遍历数组、切片、字符串、map 和 channel。遍历切片时返回下标和值：for i, v := range nums。',
                  '如果只需要值，用 _ 忽略下标。遍历 map 的顺序是随机的，不能依赖顺序做逻辑判断。'
                ],
                code: { lang: 'go', src: 'dmg := []int{4, 8, 15, 16, 23, 42}\ntotal := 0\nfor _, v := range dmg {\n    total += v\n}\nfmt.Println(total)' }
              },
              {
                h: '4. switch',
                p: [
                  'Go 的 switch 默认不会穿透，每个 case 执行完自动结束，不需要 break。需要继续执行下一个 case 时写 fallthrough。',
                  'switch 可以不带表达式，写成 switch { case x > 10: ... }，相当于更清晰的多条件判断。'
                ],
                code: { lang: 'go', src: 'rank := "B"\nswitch rank {\ncase "S":\n    fmt.Println("传说")\ncase "A", "B":\n    fmt.Println("精锐")\ndefault:\n    fmt.Println("见习")\n}', runnable: false
}
              },
              {
                h: '5. break、continue 与标签',
                p: [
                  'break 结束当前循环或 switch，continue 跳过本轮。Go 支持标签，可以跳出多层循环，但应谨慎使用。',
                  '写循环时优先考虑提前返回（guard clause），减少嵌套层级，让主流程更清楚。'
                ],
                code: { lang: 'go', src: 'outer:\nfor i := 1; i <= 3; i++ {\n    for j := 1; j <= 3; j++ {\n        if i*j == 4 {\n            break outer\n        }\n        fmt.Println(i, j)\n    }\n}' }
              }
            ],
            terms: [
              { t: 'range', d: 'Go 中遍历容器元素的关键字。' },
              { t: 'fallthrough', d: 'switch 中显式继续执行下一个 case 的关键字。' },
              { t: '标签', en: 'label', d: '给循环命名，配合 break/continue 控制多层循环。' },
              { t: 'guard clause', d: '提前返回、减少嵌套的写法。' },
              { t: '迭代绑定', d: '每次循环迭代为循环变量创建独立变量。' }
            ],
            exam: 'Go 高频：for 的三种写法、range 的下标与值、switch 默认不穿透、if 初始化语句、break/continue 与标签。',
            checklist: ['会写三种 for', '掌握 range 遍历', '理解 switch 不穿透', '知道 if 初始化语句的作用域']
          }
        },
        {
          id: 'go-2-3', type: 'battle', title: '遭遇 · 轨道鲨', jp: '軌道鮫', xp: 60,
          enemy: {
            name: '轨道鲨', kind: 'wolf', hp: 100,
            title: '影兽 · 循环猎手', taunt: '绕圈吧。绕到忘记出口。',
            lore: '它沿着偏移的轨道无限巡游。一个边界正确的累加循环，能重新标定 100 个航段的总长度。'
          },
          brief: '计算 1 到 100 个航段的总长度并输出，校准轨道。',
          tasks: [
            {
              prompt: '使用 for 循环计算 1 到 100（含 100）的总和并输出。必须出现循环结构。',
              requirement: '预期输出：5050',
              expected: '5050',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    total := 0\n    // 用循环累加 1 到 100\n    fmt.Println(total)\n}\n',
              hints: [
                '循环写成 for i := 1; i <= 100; i++。',
                '循环体内 total += i。',
                '保留最后的 fmt.Println(total)。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    total := 0\n    for i := 1; i <= 100; i++ {\n        total += i\n    }\n    fmt.Println(total)\n}',
              must: { re: 'for\\s', text: '必须使用 for 循环' }
            }
          ],
          outro: '轨道在 5050 处发出清脆的锁定声。鲨鱼失去绕圈的借口，转身游进了碎片带的阴影。',
          loot: LS.makeLoot('rare', '航段罗盘', 'relic', '◎', '罗盘没有指针，只有一枚不断累加的计数器。它告诉你：方向来自持续而正确的重复。', 'go')
        }
      ]
    },
    {
      id: 'go-3', title: '第三章 · 货运甲板', jp: '貨物甲板',
      subtitle: '让每一件货物都有明确的归属', summary: '切片、函数、多返回值与 map。',
      nodes: [
        {
          id: 'go-3-1', type: 'story', title: '超载的货舱', jp: '過積載の船倉', xp: 15,
          lines: [
            { who: '岚', tone: 'ally', text: '六箱货物挤在甲板上，重量记录是 [4, 8, 15, 16, 23, 42]。我们需要总重量来决定是否卸载。' },
            { who: '界灵·零', tone: 'guide', text: '切片是 Go 中最常用的序列类型。用 range 遍历，把六箱货物加起来。' },
            { who: '载重傀儡', tone: 'enemy', text: '超载。超载。拒绝起飞。' },
            { who: '岚', tone: 'ally', text: '先算清楚，再决定丢什么。别凭感觉。' }
          ]
        },
        {
          id: 'go-3-2', type: 'lesson', title: '切片、函数与 map', jp: 'スライスと関数', xp: 30, minutes: 20,
          article: {
            lead: 'Go 用切片代替大多数动态数组场景，用多返回值表达「结果 + 错误」，用 map 保存键值关系。三者构成了日常业务代码的骨架。',
            sections: [
              {
                h: '1. 数组与切片',
                p: [
                  '数组长度固定：var a [3]int。切片长度可变：nums := []int{4, 8, 15}。切片底层指向一个数组，包含指针、长度和容量。',
                  'append 在容量不足时会分配新底层数组。多个切片共享底层数组时，修改可能互相影响，这是常见陷阱。'
                ],
                code: { lang: 'go', src: 'nums := []int{4, 8, 15}\nnums = append(nums, 16)\nfmt.Println(len(nums), nums[3])\nfor i, v := range nums {\n    fmt.Println(i, v)\n}' }
              },
              {
                h: '2. 函数与多返回值',
                p: [
                  '函数用 func 声明。Go 支持多返回值，最常见的组合是 (结果, error)。调用方必须显式处理错误，这是 Go 的重要设计。',
                  '命名返回值可以在函数开头声明，并在 return 时省略变量名。少量使用可以提高可读性，复杂函数建议显式返回。'
                ],
                code: { lang: 'go', src: 'func divide(a, b int) (int, error) {\n    if b == 0 {\n        return 0, fmt.Errorf("除数不能为 0")\n    }\n    return a / b, nil\n}\n\nq, err := divide(10, 2)\nif err != nil {\n    fmt.Println(err)\n} else {\n    fmt.Println(q)\n}', runnable: false
}
              },
              {
                h: '3. defer 与资源清理',
                p: [
                  'defer 会把函数调用推迟到当前函数返回前执行，常用于关闭文件、释放锁。多个 defer 按后进先出顺序执行。',
                  'defer 的参数在 defer 语句执行时就会求值，而不是在真正调用时。理解这一点可以避免闭包陷阱。'
                ],
                code: { lang: 'go', src: 'func readLog() {\n    fmt.Println("open")\n    defer fmt.Println("close")\n    fmt.Println("read")\n}\nreadLog()', runnable: false
}
              },
              {
                h: '4. map',
                p: [
                  'map 是键值集合：bag := map[string]int{"苦无": 15}。读取不存在的键会得到零值，用 v, ok := m[key] 判断键是否存在。',
                  'delete 删除键，len 返回键值对数量。map 不是并发安全的，多 goroutine 同时写需要加锁或使用 sync.Map。'
                ],
                code: { lang: 'go', src: 'bag := map[string]int{"苦无": 15, "毒刃": 30}\nfmt.Println(bag["苦无"] + bag["毒刃"])\nv, ok := bag["毒刃"]\nfmt.Println(v, ok)\ndelete(bag, "苦无")', runnable: false
}
              },
              {
                h: '5. 方法与接口',
                p: [
                  '给类型定义方法：func (k Knight) Hit(dmg int) int。接收者可以是值或指针，指针接收者可以修改原对象。',
                  '接口定义一组方法签名。任何实现了这些方法的类型都自动满足接口，不需要显式声明 implements。这就是 Go 的隐式接口。'
                ],
                code: { lang: 'go', src: 'type Unit interface {\n    Speak() string\n}\n\ntype Mage struct{ Name string }\n\nfunc (m Mage) Speak() string {\n    return m.Name + " 咏唱"\n}\n\nvar u Unit = Mage{Name: "薇拉"}\nfmt.Println(u.Speak())', runnable: false
}
              }
            ],
            terms: [
              { t: '切片', en: 'slice', d: '长度可变、底层共享数组的序列类型。' },
              { t: '多返回值', d: 'Go 函数可以同时返回多个值，常用于结果与错误。' },
              { t: 'defer', d: '将调用推迟到函数返回前执行的语句。' },
              { t: '接口', en: 'interface', d: '一组方法签名，类型隐式满足。' },
              { t: '零值可用', d: 'Go 的许多类型零值即可直接使用，如 map 需 make 初始化。' }
            ],
            exam: 'Go 高频：slice 与 array 区别、append 扩容、多返回值与 error、defer 执行顺序、map 的 ok 判断、接口的隐式实现。',
            checklist: ['会创建与遍历切片', '会写多返回值函数', '理解 defer 的顺序', '掌握 map 的读写与存在性判断']
          }
        },
        {
          id: 'go-3-3', type: 'battle', title: '遭遇 · 载重傀儡', jp: '積載傀儡', xp: 60,
          enemy: {
            name: '载重傀儡', kind: 'construct', hp: 100,
            title: '造物 · 超载判定者', taunt: '超载。超载。拒绝起飞。',
            lore: '它只会重复超载警告。用切片与 range 算出六箱货物的总重量，它才能重新判断。'
          },
          brief: '六箱货物重量为 [4, 8, 15, 16, 23, 42]。用切片与 range 求总重量。',
          tasks: [
            {
              prompt: '给定 weights := []int{4, 8, 15, 16, 23, 42}; 使用 range 遍历并输出总重量。必须使用循环。',
              requirement: '预期输出：108',
              expected: '108',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    weights := []int{4, 8, 15, 16, 23, 42}\n    total := 0\n    // 遍历切片并累加\n    fmt.Println(total)\n}\n',
              hints: [
                '遍历写成 for _, w := range weights。',
                '循环体内 total += w。',
                '保留最后的 fmt.Println(total)。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    weights := []int{4, 8, 15, 16, 23, 42}\n    total := 0\n    for _, w := range weights {\n        total += w\n    }\n    fmt.Println(total)\n}',
              must: { re: 'range\\s', text: '必须使用 range 遍历' }
            }
          ],
          outro: '总重量 108 出现在甲板屏幕上。傀儡安静下来，货舱门缓缓打开，星港的起重臂开始重新分配负载。',
          loot: LS.makeLoot('epic', '载重核心', 'relic', '◈', '核心只记录重量，不记录价值。它提醒你：先让系统知道真实负担，再谈起飞。', 'go')
        }
      ]
    },
    {
      id: 'go-4', title: '第四章 · 虚空的尽头', jp: '終章・虚空の果て',
      subtitle: '在失序的星海里守住最后一班航线', summary: '结构体、方法、接口、并发与错误；挑战 Boss。',
      nodes: [
        {
          id: 'go-4-1', type: 'story', title: '虚空巨兽', jp: '虚空の巨獣', xp: 15,
          lines: [
            { who: '岚', tone: 'ally', text: '虚空巨兽堵住了最后一条航线。它不攻击船，只是让所有信号同时失序。' },
            { who: '界灵·零', tone: 'guide', text: '终战需要两次精确操作：从六份残响中找出最大值，再用嵌套循环画出四层航标。' },
            { who: '虚空巨兽', tone: 'enemy', text: '所有航线都通向同一个尽头。你们只是还没承认。' },
            { who: '岚', tone: 'ally', text: '尽头不是终点。只要我们还能算出下一步，就还有航线。' }
          ]
        },
        {
          id: 'go-4-2', type: 'lesson', title: '结构体、并发与错误', jp: '構造体と並行', xp: 30, minutes: 25,
          article: {
            lead: 'Go 把并发做成了语言的一部分：goroutine 很轻，channel 负责通信。但真正的工程能力，仍然建立在清楚的数据结构与错误处理之上。',
            sections: [
              {
                h: '1. 结构体与方法',
                p: [
                  '结构体把多个字段组合成一个类型：type Ship struct { Name string; HP int }。用字面量创建：Ship{Name: "星隼", HP: 100}。',
                  '方法定义在类型上：func (s *Ship) Damage(n int) { s.HP -= n }。指针接收者可以修改原对象，值接收者操作副本。'
                ],
                code: { lang: 'go', src: 'type Ship struct {\n    Name string\n    HP   int\n}\n\nfunc (s *Ship) Damage(n int) {\n    s.HP -= n\n    if s.HP < 0 {\n        s.HP = 0\n    }\n}\n\ns := &Ship{Name: "星隼", HP: 100}\ns.Damage(25)\nfmt.Println(s.HP)', runnable: false
}
              },
              {
                h: '2. 错误处理',
                p: [
                  'Go 用 error 接口表示可预期的失败。函数通常把 error 作为最后一个返回值。调用方必须显式检查 err != nil。',
                  'fmt.Errorf 配合 %w 可以包装错误，errors.Is/As 用于判断和提取。不要用 panic 处理普通业务错误。'
                ],
                code: { lang: 'go', src: 'func dock(ship string) error {\n    if ship == "" {\n        return fmt.Errorf("船名不能为空")\n    }\n    return nil\n}\n\nif err := dock("星隼"); err != nil {\n    fmt.Println(err)\n} else {\n    fmt.Println("已靠港")\n}', runnable: false
}
              },
              {
                h: '3. goroutine 与 channel',
                p: [
                  '在函数调用前加 go 就能启动一个 goroutine。它由 Go 运行时调度，创建成本远低于系统线程。',
                  'channel 用于 goroutine 之间通信：ch := make(chan int)。发送 ch <- 1，接收 <-ch。无缓冲 channel 的发送与接收会互相阻塞。'
                ],
                code: { lang: 'go', src: 'ch := make(chan string)\ngo func() {\n    ch <- "航线已确认"\n}()\nmsg := <-ch\nfmt.Println(msg)', runnable: false
},
                note: '游戏终端为同步执行环境，并发示例用于理解结构，不作为关卡判定。'
              },
              {
                h: '4. select 与同步',
                p: [
                  'select 同时等待多个 channel 操作，哪个先准备好就执行哪个。配合 time.After 可以实现超时控制。',
                  '共享内存仍然需要 sync.Mutex 或原子操作保护。Go 的格言是：不要通过共享内存来通信，而要通过通信来共享内存。'
                ],
                code: { lang: 'go', src: 'select {\ncase msg := <-ch:\n    fmt.Println(msg)\ncase <-time.After(time.Second):\n    fmt.Println("超时")\n}', runnable: false
}
              },
              {
                h: '5. 工程化与收束',
                p: [
                  'Go 项目通常用 go mod init 初始化模块，用 go test 运行测试，用 go build 生成可执行文件。标准库覆盖网络、JSON、文件、加密等常见需求。',
                  '学到这，你已经具备继续深入云原生、网络服务与 CLI 工具的基础。下一步建议写一个真正能被别人运行的小服务。'
                ],
                note: '真实项目中的并发、网络与文件操作需要完整运行环境；本游戏只验证核心逻辑与输出。'
              }
            ],
            terms: [
              { t: '结构体', en: 'struct', d: '把多个字段组合成一个命名的复合类型。' },
              { t: '方法接收者', en: 'receiver', d: '方法绑定的类型，可分为值接收者与指针接收者。' },
              { t: 'goroutine', d: 'Go 运行时管理的轻量级并发执行单元。' },
              { t: 'channel', d: '用于 goroutine 之间传递数据的管道。' },
              { t: '错误包装', en: 'error wrapping', d: '用 %w 保留原始错误链，便于判断与追踪。' }
            ],
            exam: 'Go 面试高频：值与指针接收者、error 处理、goroutine 与 channel、select、defer、接口隐式实现、map 并发安全。',
            checklist: ['会定义结构体与方法', '能正确处理 error', '理解 goroutine 与 channel', '知道并发写 map 的风险']
          }
        },
        {
          id: 'go-4-3', type: 'battle', title: '终战 · 虚空巨兽', jp: '虚空の巨獣', xp: 120,
          enemy: {
            name: '虚空巨兽', kind: 'dragon', hp: 100, boss: true,
            title: '首领 · 航线终焉者', taunt: '所有航线，都通向同一个尽头。',
            lore: '它让信号同时失序。只有精确地找出最大值、稳定地画出航标，才能重新确认下一步的方向。'
          },
          brief: '终战分两段。先找出六份残响中的最大值；再用嵌套循环画出四层航标。两段完成，航线重开。',
          tasks: [
            {
              prompt: '第一击：给定 nums := []int{4, 8, 15, 16, 23, 42}; 用循环找出最大值并输出。',
              requirement: '预期输出：42',
              expected: '42',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    nums := []int{4, 8, 15, 16, 23, 42}\n    max := nums[0]\n    // 遍历剩余元素，更新最大值\n    fmt.Println(max)\n}\n',
              hints: [
                '可以从下标 1 开始：for i := 1; i < len(nums); i++。',
                '如果 nums[i] > max，就更新 max。',
                '保留最后的 fmt.Println(max)。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    nums := []int{4, 8, 15, 16, 23, 42}\n    max := nums[0]\n    for i := 1; i < len(nums); i++ {\n        if nums[i] > max {\n            max = nums[i]\n        }\n    }\n    fmt.Println(max)\n}',
              must: { re: 'for\\s', text: '必须使用 for 循环' }
            },
            {
              prompt: '第二击：用嵌套循环输出 4 行航标。第 1 行 1 个星号，第 2 行 2 个，依此类推，第 4 行 4 个。每行结束后换行。',
              requirement: '预期输出 4 行，逐行增加一个 *',
              expected: '*\n**\n***\n****',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // 外层控制行，内层控制星号数量\n}\n',
              hints: [
                '外层 for i := 1; i <= 4; i++。',
                '内层 for j := 1; j <= i; j++，用 fmt.Print("*") 不换行输出。',
                '内层结束后用 fmt.Println() 换行。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    for i := 1; i <= 4; i++ {\n        for j := 1; j <= i; j++ {\n            fmt.Print("*")\n        }\n        fmt.Println()\n    }\n}',
              must: { re: 'for[\\s\\S]*for', text: '必须使用嵌套循环' }
            }
          ],
          outro: '最大值 42 穿过失序的信号，四层航标在虚空里依次点亮。巨兽缓缓后退，让出了那条它声称不存在的航线。岚望向远处：「下一站，还在前面。」',
          loot: LS.makeLoot('mythic', '星轨终章', 'weapon', '✧', '枪身上刻着一条没有终点的航线。它不承诺抵达，只承诺继续计算下一步。', 'go')
        }
      ]
    }
  ]
});
