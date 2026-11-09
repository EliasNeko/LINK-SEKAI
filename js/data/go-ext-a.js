/* Go — 第二卷 · 源核之下（第五章 ~ 第八章）
 * 只新增数据，不修改第一卷的任何结构，仅在载入时把第四章标记为卷一终章。
 * 本文件可能先于 go.js 载入（校验器按字母序 require），因此提供注册钩子。
 */
(function (LS) {
  'use strict';

  function applyGoVolumeTwoA(lang) {
    if (!lang || !Array.isArray(lang.chapters)) return;

    // 把第一卷第四章标记为卷一终章，避免出现两个「终章」
    const vol1 = lang.chapters[3];
    if (vol1 && !vol1.title.includes('卷一终章')) {
      vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
      const last = vol1.nodes[vol1.nodes.length - 1];
      last.title = '卷一终战 · ' + last.title.replace(/^终战\s*·\s*/, '');
    }

    lang.chapters.push(
    {
      id: 'go-5', title: '第五章 · 深空信标', jp: '深空の信標', volume: '第二卷 · 源核之下',
      subtitle: '让每一个字都有自己的位置和长度', summary: 'byte 与 rune、UTF-8、len、range 解码、strings 包与 Builder。',
      nodes: [
        {
          id: 'go-5-1', type: 'story', title: '静默的信标', jp: '静かな標識', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '源核之下第一层是旧信号塔。塔还在发报，可每一条报文的长度都对不上账。' },
            { who: '通讯官·铃', tone: 'guide', text: '我是铃，最后一位值班的通讯官。同一句报文，塔说 18 格，账房说 22 格，从此没人敢签字。' },
            { who: '岚', tone: 'ally', text: '一个是字节，一个是字符。Go 把这两把尺子分得很清楚，混着用就会错位。' },
            { who: '信号蚀影', tone: 'enemy', text: '一个汉字，到底是一格，还是三格？你们自己都说不清，凭什么收我的报。' },
            { who: '岚', tone: 'ally', text: '先让长度有个明确的说法，再谈收报。' }
          ]
        },
        {
          id: 'go-5-2', type: 'lesson', title: '字符、字节与字符串', jp: '文字とバイト', xp: 40, minutes: 22,
          article: {
            lead: '信号塔的账目对不上，根子在于「长度」这个词被当成了两种东西。这一章把 string、byte、rune 的关系讲清楚：字符串怎么存、len 数的是什么、for range 又按什么单位走。',
            sections: [
              {
                h: '1. byte 与 rune：两把不同的尺子',
                p: [
                  'Go 的 string 不是「字符的数组」，而是一段只读的字节序列，内容按 UTF-8 编码存放。byte 是 uint8 的别名，代表一个字节；rune 是 int32 的别名，代表一个 Unicode 码点，也就是人眼看到的「一个字」。',
                  '英文、数字、短横线在 UTF-8 里各占 1 字节；汉字通常占 3 字节。所以「星港」两个字，按字节量是 6，按字符数是 2。写代码前先回答一个问题：我要的到底是字节数，还是字符数？答错这一句，后面全错。'
                ],
                code: { lang: 'go', src: 's := "星港"\nfmt.Println(len(s))                     // 6：按字节\nfmt.Println(utf8.RuneCountInString(s))  // 2：按字符', runnable: false },
                note: '教学终端的 len 按字符计数，与真实 Go 的字节语义不同，因此本示例标记为概念示例。'
              },
              {
                h: '2. range 字符串：按字符解码',
                p: [
                  'for i, ch := range s 遍历字符串时，Go 会按 UTF-8 逐段解码：i 是这一段的起始字节下标，ch 是解码出来的 rune。遇到汉字，下标会从 0 直接跳到 3，再跳到 6，而不是一格一格加。',
                  '只关心字符时用 _ 丢掉下标：for _, ch := range s。如果非要按下标取字符，必须先转成 rune 切片，否则 s[1] 取到的可能只是某个汉字三个字节中的第二个，输出的就是乱码。'
                ],
                code: { lang: 'go', src: 'for i, ch := range "星港-42" {\n    fmt.Printf("字节%d 字符%c\\n", i, ch)\n}\n// 字节0 字符星 / 字节3 字符港 / 字节6 字符- / 字节7 字符4', runnable: false },
                note: 'range 的下标永远按字节算，值永远按 rune 解。这两条同时成立，别把它们混成一条。'
              },
              {
                h: '3. 转义字符与不可变的字符串',
                p: [
                  '双引号字符串会解释转义：\\n 换行、\\t 制表、\\" 引号、\\\\ 反斜杠。报文里的分隔符与换行，都靠这些转义写出来。反引号包裹的原始字符串不解释任何转义，还能跨行，适合写多行报文和正则。',
                  '字符串是不可变的：s[0] = 88 通不过编译。要「改」一个字符，只能生成一个新串再赋值回去。这条限制换来了并发安全，也让编译器敢对字符串做共享和缓存。'
                ],
                code: { lang: 'go', src: 'prefix := "LINK"\ntag := prefix + "-SEKAI"\nfmt.Println(tag)\nfmt.Println(len(tag))\nfmt.Printf("%q\\n", tag)' }
              },
              {
                h: '4. strings 包：拆、查、替、修',
                p: [
                  '日常处理报文几乎都落在 strings 包：Contains 判断包含、HasPrefix 与 HasSuffix 判断前后缀、Split 按分隔符拆成切片、Join 拼回去、TrimSpace 去掉首尾空白、ReplaceAll 全量替换、Index 找位置。',
                  '这些函数都返回新字符串，不会修改原串——字符串本来就不可变。判断「开头是不是 L」用 HasPrefix，别自己写切片比较：既慢，又容易在长度不足时越界。'
                ],
                code: { lang: 'go', src: 'parts := strings.Split("L-INK-SEKAI-042", "-")\nfmt.Println(len(parts), parts[0])\nfmt.Println(strings.HasPrefix(parts[0], "L"))\nfmt.Println(strings.ToUpper(parts[2]))', runnable: false },
                note: 'Split 的结果里可能包含空串，例如按短横线拆「A--B」会得到三个元素。拆分后先检查长度再取下标。'
              },
              {
                h: '5. strings.Builder：循环拼接的正确姿势',
                p: [
                  '在循环里用 + 拼 n 次，每一轮都会分配一个新串并把已有内容复制过去，总代价接近 O(n²)。strings.Builder 内部维护一块可增长的缓冲区，WriteString 追加、String 取出，均摊代价是线性的。',
                  'Builder 零值即可使用，不需要构造函数；但不要复制已经写入内容的 Builder——它内部持有切片，复制会共享底层数组。需要传给别人时传指针。',
                  '教学终端不加载 strings 包，下面的示例是概念示例；战场上我们用 fmt.Printf 直接格式化，效果一样而依赖更少。'
                ],
                code: { lang: 'go', src: 'var b strings.Builder\nfor _, p := range []string{"L", "INK", "SEKAI"} {\n    b.WriteString(p)\n    b.WriteString("-")\n}\nfmt.Println(strings.TrimSuffix(b.String(), "-"))', runnable: false }
              },
              {
                h: '6. 常见错误与检查顺序',
                p: [
                  '第一类错：用 len 数汉字，拿到的是字节数。第二类错：用 s[i] 取「第 i 个字」，取到的可能只是半个汉字。第三类错：按固定字节数切分 UTF-8 串，把一个汉字从中间劈开，后面全成乱码。',
                  '排查顺序固定成三问：我要的是字节还是字符？这个下标是字节偏移还是第几个字符？我切开的位置会不会落在某个字符中间？三问答完，字符串的问题基本就定位了。'
                ],
                note: '练习时先把纯 ASCII 报文跑通，再换成含中文的报文，差异会自己显形。'
              }
            ],
            terms: [
              { t: '字节', en: 'byte', d: 'uint8 的别名，字符串底层就是按字节存放的。' },
              { t: '码点', en: 'rune', d: 'int32 的别名，代表一个 Unicode 字符。' },
              { t: 'UTF-8', d: '把码点编码成 1 到 4 个字节的可变长编码，汉字通常占 3 字节。' },
              { t: '字节长度', en: 'len', d: '对字符串调用 len 得到的是字节数，不是字符数。' },
              { t: '解码遍历', en: 'range', d: 'for range 字符串时按 rune 解码，下标是字节偏移。' },
              { t: '原始字符串', en: 'raw string literal', d: '反引号包裹的字符串，不解释转义，可以跨行。' },
              { t: '构建器', en: 'strings.Builder', d: '用于循环中高效拼接字符串的可增长缓冲区。' }
            ],
            exam: '面试常问：len 对含中文的字符串返回什么、for range 与 for i 遍历字符串的区别、string 为什么不可变、循环拼接为什么用 Builder、s[0] 得到的类型是什么。答之前先说清「字节还是字符」。',
            checklist: [
              '能说清 byte 与 rune 的区别',
              '知道 len 数的是字节，range 解的是字符',
              '会用转义与原始字符串表达报文',
              '能说出 strings 常用函数各自的用途',
              '理解 Builder 为什么比循环 + 快'
            ]
          }
        },
        {
          id: 'go-5-3', type: 'battle', title: '遭遇 · 信号蚀影', jp: '信号の蝕影', xp: 80,
          enemy: {
            name: '信号蚀影', kind: 'glitch', hp: 100,
            title: '旧塔 · 计数错位', taunt: '一格，还是三格？你们连自己数的是什么都不清。',
            lore: '它把塔里每一条报文的长度同时改成了三种答案。只有按字符逐个走一遍，数字才会重新对齐。'
          },
          brief: '信标报文 L-INK-SEKAI-042 里混着三位数字。用 range 逐字符清点，把数字的个数报给铃。',
          tasks: [
            {
              prompt: '给定 signal := "L-INK-SEKAI-042"; 用 for range 逐字符遍历字符串，统计其中数字字符（0 到 9）的个数，输出一行「数字=3」。必须真的逐字符判断，不能直接打印 3。',
              requirement: '预期输出：数字=3',
              expected: '数字=3',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    signal := "L-INK-SEKAI-042"\n    count := 0\n    // 用 for range 逐字符遍历，统计数字\n    fmt.Printf("数字=%d\\n", count)\n}\n',
              hints: [
                '遍历写成 for _, ch := range signal，ch 一次取一个字符，不会取到半个字节。',
                '判断数字：if ch >= \'0\' && ch <= \'9\' { count++ }。',
                '保留最后的 fmt.Printf("数字=%d\\n", count)，不要写成 fmt.Println("数字=3")。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    signal := "L-INK-SEKAI-042"\n    count := 0\n    for _, ch := range signal {\n        if ch >= \'0\' && ch <= \'9\' {\n            count++\n        }\n    }\n    fmt.Printf("数字=%d\\n", count)\n}',
              must: { re: 'range\\s', text: '必须使用 for range 遍历字符串' }
            }
          ],
          outro: '数字停在 3。塔身三层灯依次亮起，铃在账本上写下第一笔对得上的长度：「这一句，十八格，三个数字。」',
          loot: LS.makeLoot('rare', '信标解码环', 'relic', '⌇', '环上刻着两把尺子，一把量字节，一把量字符。用之前先想清楚要哪一把。', 'go')
        }
      ]
    },
    {
      id: 'go-6', title: '第六章 · 陨石货场', jp: '隕石の貨場', volume: '第二卷 · 源核之下',
      subtitle: '货单会变长，货位会搬家，记住名字就不怕', summary: '切片三要素、make/append/copy、切片表达式、map 的增删改查。',
      nodes: [
        {
          id: 'go-6-1', type: 'story', title: '会变长的货单', jp: '伸びる貨物票', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '第二层是陨石货场。货单会变长，货位会搬家，旧账本只能记住固定的格数。' },
            { who: '岚', tone: 'ally', text: 'Go 的切片就是一张能伸缩的货单：指向哪里、有多长、还剩多少容量，三个数字说清它占着哪一段。' },
            { who: '碎星吞口', tone: 'enemy', text: '货位是我的。你借一格，我挪一格；你记错一格，整船货就沉进陨石带。' },
            { who: '通讯官·铃', tone: 'guide', text: '按名字取重量更省心。货名和重量本来就是一张 map，不用去记第几行。' },
            { who: '岚', tone: 'ally', text: '先算出总重，再决定哪一箱可以扔。' }
          ]
        },
        {
          id: 'go-6-2', type: 'lesson', title: '切片与映射', jp: 'スライスと写像', xp: 40, minutes: 24,
          article: {
            lead: '货场的账目有两个问题：数量会变，查找靠名字。Go 用切片解决「会变长的序列」，用 map 解决「按名字查值」。这一章把两者的内部结构和常见坑一次讲完。',
            sections: [
              {
                h: '1. 切片是底层数组上的一扇窗',
                p: [
                  '切片本身只有三个字段：指向底层数组的指针、长度 len、容量 cap。它不拥有数据，只是「从哪开始、能看到多远」的描述。',
                  'len 是当前元素个数，cap 是从起点到底层数组末尾的格数，所以永远 cap 大于等于 len。把切片传给函数时，复制的是这三个字段，底层数组还是同一块——在函数里改 nums[0]，调用方也看得见。'
                ],
                code: { lang: 'go', src: 'nums := []int{4, 8, 15, 16}\nfmt.Println(len(nums))\nfmt.Println(nums[0], nums[3])' }
              },
              {
                h: '2. make、append 与扩容',
                p: [
                  'make([]int, 0, 4) 造一个长度 0、容量 4 的切片，之后连着 append 四次都不会重新分配。append 返回的是一个新切片，必须用 nums = append(nums, x) 接住，只写 append(nums, x) 是无效的。',
                  '容量不够时，运行时会分配一块更大的数组（小切片通常翻倍），把旧元素复制过去，再写入新值。此后新旧切片指向不同数组：看起来相似，改起来互不影响。理解这一点，才能解释「为什么我明明改的是副本」。'
                ],
                code: { lang: 'go', src: 'nums := make([]int, 0, 2)\nnums = append(nums, 1)\nnums = append(nums, 2)\nnums = append(nums, 3)\nfmt.Println(len(nums), nums[2])' },
                note: 'append 的返回值一定要接住；go vet 会对「append 结果未使用」给出提示。'
              },
              {
                h: '3. 切片表达式 s[1:3]',
                p: [
                  's[low:high] 取下标 [low, high) 的一段，长度是 high 减 low，上界本身不包含。省略下界从头开始，省略上界直到末尾，s[:] 得到共享底层数组的新切片。',
                  '切片表达式不复制数据。b := a[1:3] 之后，写 b[0] 改的就是 a[1]。要独立一份，必须 make 之后 copy。三下标形式 a[1:3:4] 还能限制容量，防止后续 append 写坏原数组。'
                ],
                code: { lang: 'go', src: 'a := []int{10, 20, 30, 40, 50}\nb := a[1:3]        // [20 30]，长度 2\nb[0] = 99\nfmt.Println(a[1])  // 99：改的是同一块底层数组', runnable: false },
                note: '切片表达式的上下界是「看到哪」，不是「复制哪些」。共享是默认行为，复制需要显式要求。'
              },
              {
                h: '4. copy：真正的一份拷贝',
                p: [
                  'copy(dst, src) 按两者较短的长度复制，返回复制的元素个数。它不会替你扩容：dst 有多长，就只能装多少。',
                  '典型用法是先 make 一个等长切片再 copy。反过来，往共享底层数组的切片上 append，可能悄悄覆盖原数组后面的元素——这类 bug 不会报错，只会让数据「莫名其妙地变了」。'
                ],
                code: { lang: 'go', src: 'src := []int{1, 2, 3, 4}\ndst := make([]int, len(src))\nn := copy(dst, src)\ndst[0] = 100\nfmt.Println(n, src[0])   // 4 1：互不影响', runnable: false }
              },
              {
                h: '5. map：按名字查，而不是按位置',
                p: [
                  'map[string]int{"合金": 18} 建立「名字到数值」的对应。写入 m[k] = v，读取 v := m[k]，删除 delete(m, k)，元素个数 len(m)。键必须是可比较的类型。',
                  '读取不存在的键不会报错，返回该值类型的零值（int 是 0，string 是空串）。想区分「值恰好是零值」和「键不存在」，就用 v, ok := m[k] 的两个返回值形式。',
                  '遍历 map 的顺序是随机的，每次运行都可能不同，所以只能做与顺序无关的累加或筛选。nil map 可以读、不能写，写入会 panic；用之前必须 make 或用字面量初始化。空 map（map[string]int{}）则可以正常写入。'
                ],
                code: { lang: 'go', src: 'weights := map[string]int{"合金": 18, "燃料": 25}\nweights["药材"] = 9\ndelete(weights, "合金")\nnames := []string{"燃料", "药材"}\ntotal := 0\nfor _, name := range names {\n    total += weights[name]\n}\nfmt.Println(len(weights), total)' },
                note: '这段代码的输出是 2 34：删掉一个键，剩下两个值相加。教学终端只支持 range 遍历切片，所以这里先遍历名字再查表，效果与遍历 map 相同。'
              },
              {
                h: '6. 常见错误：nil map、共享底层数组与遍历顺序',
                p: [
                  'nil map 写入会 panic，错误信息是 assignment to entry in nil map；共享底层数组会导致「改一个，两个都变」；依赖 map 遍历顺序会让输出在两次运行之间不一样；append 之后忘记接返回值，等于什么都没加。',
                  '还有一个隐蔽的：在 range 循环里向同一个切片 append，循环长度在开始时就已经确定，这一轮新加的元素不会被遍历到。需要边遍历边追加时，改用普通下标循环并每轮重新读取 len。'
                ],
                note: '排查切片问题最快的办法：在纸上画底层数组的一排格子，再把每个切片画成「起点 + 长度」的框，改一格就更新一次。'
              }
            ],
            terms: [
              { t: '切片', en: 'slice', d: '描述底层数组中一段窗口的三元组：指针、长度、容量。' },
              { t: '长度', en: 'len', d: '切片当前可访问的元素个数。' },
              { t: '容量', en: 'cap', d: '从切片起点到底层数组末尾还能容纳的元素个数。' },
              { t: '底层数组', en: 'underlying array', d: '切片真正存放数据的连续内存块，可以被多个切片共享。' },
              { t: '切片表达式', en: 'slice expression', d: 's[low:high] 取左闭右开的一段，不复制数据。' },
              { t: '映射', en: 'map', d: '按键查找值的无序集合，读取不存在的键返回零值。' },
              { t: '扩容', en: 'grow', d: '容量不足时分配更大数组并复制旧元素。' }
            ],
            exam: '面试常问：slice 与 array 的区别、append 什么时候扩容、两个切片什么时候互相影响、nil map 与空 map 的区别、为什么遍历 map 无序、v, ok 形式解决什么问题。',
            checklist: [
              '能画出切片的指针、长度、容量三要素',
              '会预分配容量并正确接住 append 的返回值',
              '知道切片表达式共享底层数组',
              '会用 copy 得到独立副本',
              '掌握 map 的增删改查与零值语义'
            ]
          }
        },
        {
          id: 'go-6-3', type: 'battle', title: '遭遇 · 碎星吞口', jp: '砕星の吞口', xp: 80,
          enemy: {
            name: '碎星吞口', kind: 'golem', hp: 100,
            title: '陨石 · 货位吞噬者', taunt: '货位是我的。你记错一格，整船货就沉下去。',
            lore: '它把货单的格数改来改去，只留下货名还能对上。按名字查重量，再把该装的几箱加起来，它就没有借口扣货。'
          },
          brief: '货单按名字记重量，装载清单只有三个货名。遍历清单，把对应重量累加，报出总重。',
          tasks: [
            {
              prompt: '给定 weights := map[string]int{"合金": 18, "燃料": 25, "药材": 9, "零件": 15}; 与 cargo := []string{"燃料", "药材", "零件"}; 用 range 遍历 cargo，按货名从 weights 取出重量累加，输出一行「总重=49」。',
              requirement: '预期输出：总重=49',
              expected: '总重=49',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    weights := map[string]int{"合金": 18, "燃料": 25, "药材": 9, "零件": 15}\n    cargo := []string{"燃料", "药材", "零件"}\n    total := 0\n    // 遍历 cargo，用货名去 weights 里取重量\n    fmt.Printf("总重=%d\\n", total)\n}\n',
              hints: [
                '遍历写成 for _, name := range cargo，name 是货名，不是下标。',
                '循环体里写 total += weights[name]，map 的下标就是查表。',
                '输出用 fmt.Printf("总重=%d\\n", total)，不要手写 49。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    weights := map[string]int{"合金": 18, "燃料": 25, "药材": 9, "零件": 15}\n    cargo := []string{"燃料", "药材", "零件"}\n    total := 0\n    for _, name := range cargo {\n        total += weights[name]\n    }\n    fmt.Printf("总重=%d\\n", total)\n}',
              must: { re: 'range\\s', text: '必须使用 range 遍历装载清单' }
            }
          ],
          outro: '总重 49 落在账面上，吞口缓缓合上。岚拍了拍货单：「名字对得上，格数就不重要了。」',
          loot: LS.makeLoot('rare', '陨石货位牌', 'armor', '◫', '牌上不写第几格，只写货名。货位会搬，名字不会。', 'go')
        }
      ]
    },
    {
      id: 'go-7', title: '第七章 · 幽暗船坞', jp: '幽暗の船渠', volume: '第二卷 · 源核之下',
      subtitle: '一条船的所有属性，应该住在同一个名字底下', summary: 'struct 定义、字段、值与指针接收者、方法、嵌入与组合、New 习惯。',
      nodes: [
        {
          id: 'go-7-1', type: 'story', title: '三条对不齐的名单', jp: '揃わない三列', xp: 20,
          lines: [
            { who: '船坞守·灰', tone: 'guide', text: '这里是幽暗船坞。三百年来我按同一张表登记：船名一列、船体一列、船员一列。表越来越长，手一抖就串行。' },
            { who: '岚', tone: 'ally', text: '三条平行的切片最怕错位。Go 用结构体把一条船的所有属性绑在一起，再用方法说明它能做什么。' },
            { who: '界灵·零', tone: 'guide', text: '方法不是语法装饰，而是把「数据」和「行为」放在同一个名字下面。' },
            { who: '锈蚀船影', tone: 'enemy', text: '名字是名字，船体是船体……它们本来就不该在一起。' },
            { who: '船坞守·灰', tone: 'guide', text: '可它们本来就是一条船。先把同一行的数字对齐，再说别的。' }
          ]
        },
        {
          id: 'go-7-2', type: 'lesson', title: '结构体与方法', jp: '構造体と方法', xp: 40, minutes: 26,
          article: {
            lead: '船坞登记表的问题，本质是「一条船被拆成了三列」。结构体把属性绑成一个类型，方法把行为挂到这个类型上。这一章讲清定义、字面量、接收者，以及什么时候该用嵌入、什么时候该用组合。',
            sections: [
              {
                h: '1. struct：把一条船的所有属性绑在一起',
                p: [
                  'type Ship struct { Name string; Hull int; Crew int } 定义了一种新类型。定义只是图纸，声明变量时才真正分配内存。字段名首字母大写才能在别的包访问，这是 Go 的导出规则。',
                  '字面量有两种写法：按顺序 Ship{"星隼", 80, 12}，和带字段名 Ship{Name: "星隼", Hull: 80}。后者不怕字段增删与顺序调整，没写的字段自动取零值，工程里一律推荐带字段名的写法。'
                ],
                code: { lang: 'go', src: 'type Ship struct {\n    Name string\n    Hull int\n    Crew int\n}\n\ns := Ship{Name: "星隼", Hull: 80, Crew: 12}\nfmt.Println(s.Name, s.Hull)', runnable: false }
              },
              {
                h: '2. 字段访问与值语义',
                p: [
                  's.Name 读字段，s.Hull = 90 写字段，嵌套就一层层点下去：s.Engine.Power。结构体是值类型：赋值、传参、返回都会整体复制，改副本不影响原件。',
                  '零值可用是 Go 的特点：var s Ship 之后 s.Name 是空串、s.Hull 是 0，不初始化也能安全读取。正因为如此，Go 很少需要「构造函数必须调用」这样的约定。'
                ],
                code: { lang: 'go', src: 'var s Ship\nfmt.Println(s.Name == "", s.Hull, s.Crew)\n\ncopyShip := s\ncopyShip.Hull = 100\nfmt.Println(s.Hull, copyShip.Hull)   // 0 100', runnable: false },
                note: '想共享同一份数据，就传 *Ship；想各自独立，就传值。选哪种，取决于你是否希望改动被对方看见。'
              },
              {
                h: '3. 方法：值接收者与指针接收者',
                p: [
                  'func (s Ship) Power() int 的接收者是副本，适合只读计算；func (s *Ship) Repair(n int) 的接收者是地址，能改原对象。调用时 Go 会自动取地址，写 s.Repair(10) 等价于 (&s).Repair(10)。',
                  '一条实用规则：只要有一个方法用了指针接收者，同一类型的方法最好都用指针接收者，避免出现「一部分方法改得到、一部分改不到」的困惑。'
                ],
                code: { lang: 'go', src: 'func (s Ship) Power() int {\n    return s.Hull + s.Crew*2\n}\n\nfunc (s *Ship) Repair(n int) {\n    s.Hull += n\n}\n\ns := Ship{Name: "星隼", Hull: 80, Crew: 12}\ns.Repair(10)\nfmt.Println(s.Power())', runnable: false }
              },
              {
                h: '4. 方法与函数的区别',
                p: [
                  '函数独立存在：func Power(s Ship) int。方法绑定类型：func (s Ship) Power() int。方法的价值在于调用点能写出 s.Power() 这样的语义，也在于它能被接口统一调用。',
                  '方法只能定义在本包的类型上，不能直接给 int、string 这类外部类型加方法（可以先 type 一个自己的新类型再挂方法）。方法名不能与字段名重复，接收者名建议用类型名首字母的小写。'
                ],
                code: { lang: 'go', src: 'type Score int\n\nfunc (s Score) Double() Score {\n    return s * 2\n}\n\nvar v Score = 21\nfmt.Println(v.Double())', runnable: false }
              },
              {
                h: '5. 嵌入与组合',
                p: [
                  '匿名嵌入只写类型名、不写字段名：type Carrier struct { Ship }。外层类型会「提升」内层的字段和方法，carrier.Power() 可以直接调用，也可以写全 carrier.Ship.Power()。',
                  '命名字段则是组合：type Carrier struct { Host Ship }，调用要写 carrier.Host.Power()。嵌入适合表达「它就是某种东西的一部分」，组合适合表达「它拥有某种东西」。多数场景优先组合，歧义和命名冲突都更少。'
                ],
                code: { lang: 'go', src: 'type Carrier struct {\n    Ship\n    Capacity int\n}\n\nc := Carrier{Ship: Ship{Name: "白鲸", Hull: 92, Crew: 20}, Capacity: 400}\nfmt.Println(c.Power())   // 直接用到提升的方法', runnable: false }
              },
              {
                h: '6. 构造函数习惯与传递方式',
                p: [
                  'Go 没有构造函数，惯例是写 NewShip(name string) *Ship：里面校验参数、补默认值，返回指针。名字以 New 开头，调用方一眼就知道这是「造一个」的函数。',
                  '传值还是传指针：小且不需要修改可以传值；需要修改、字段较多、或要与其它方法保持一致，就传指针。重点是同一个类型在项目里保持同一种选择。',
                  '本章的战斗不用 struct——终端不支持。但思路一样：三条平行切片共用同一个下标，一个下标就是一条船，「战力 = 船体 + 船员乘 2」就是它的方法。'
                ],
                code: { lang: 'go', src: 'names := []string{"星隼", "夜鸦"}\nhulls := []int{80, 45}\ncrews := []int{12, 8}\nfor i := 0; i < len(names); i++ {\n    power := hulls[i] + crews[i]*2\n    fmt.Println(names[i], power)\n}' }
              }
            ],
            terms: [
              { t: '结构体', en: 'struct', d: '把多个字段组合成一个命名类型的复合数据类型。' },
              { t: '字段', en: 'field', d: '结构体内部的一个具名数据成员。' },
              { t: '值接收者', en: 'value receiver', d: '方法操作接收者的副本，不会改动原对象。' },
              { t: '指针接收者', en: 'pointer receiver', d: '方法通过地址操作原对象，可以修改字段。' },
              { t: '方法', en: 'method', d: '绑定在某类型上的函数，调用时携带接收者。' },
              { t: '嵌入', en: 'embedding', d: '匿名字段带来的字段与方法提升，用于复用能力。' },
              { t: '组合', en: 'composition', d: '把其它类型作为命名字段持有，关系更显式。' },
              { t: '构造函数习惯', en: 'New function', d: '以 New 开头的普通函数，负责校验、补默认值并返回实例。' }
            ],
            exam: '面试常问：值与指针接收者的区别、什么时候必须用指针接收者、结构体能不能直接比较、嵌入和继承有什么不同、为什么 Go 没有构造函数、方法集与接口的关系。',
            checklist: [
              '会定义 struct 并用带字段名的字面量创建',
              '知道结构体赋值是整体复制',
              '分得清值接收者与指针接收者的效果',
              '能说清方法与函数的差别',
              '会判断该用嵌入还是组合'
            ]
          }
        },
        {
          id: 'go-7-3', type: 'battle', title: '遭遇 · 船坞锈像', jp: '船渠の錆像', xp: 80,
          enemy: {
            name: '船坞锈像', kind: 'construct', hp: 100,
            title: '造物 · 属性错位', taunt: '名字是名字，船体是船体。它们不该在一起。',
            lore: '它把登记表的三列彻底打散。让同一个下标同时读出船名、船体与船员，锈像就无法再把一条船拆开。'
          },
          brief: '三条切片描述同一批船。按同一下标聚合属性，算出战力，挑出能编入护航序列的船。',
          tasks: [
            {
              prompt: '给定 names := []string{"星隼", "夜鸦", "白鲸", "赤鸢"}; hulls := []int{80, 45, 92, 80}; crews := []int{12, 8, 20, 10}; 用同一个下标同时读取三条切片，计算战力（战力 = 船体 + 船员乘 2），输出战力不小于 100 的船名，每行一个。',
              requirement: '预期输出三行：星隼 / 白鲸 / 赤鸢',
              expected: '星隼\n白鲸\n赤鸢',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    names := []string{"星隼", "夜鸦", "白鲸", "赤鸢"}\n    hulls := []int{80, 45, 92, 80}\n    crews := []int{12, 8, 20, 10}\n    // 同一个下标同时读取三条切片，算出战力\n}\n',
              hints: [
                '三条切片共用一个下标：names[i]、hulls[i]、crews[i] 描述的是同一条船。',
                '循环写成 for i := 0; i < len(names); i++，每轮先算 power := hulls[i] + crews[i]*2。',
                '判断用 if power >= 100，满足时 fmt.Println(names[i])；写成大于 100 会漏掉正好 100 的赤鸢。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    names := []string{"星隼", "夜鸦", "白鲸", "赤鸢"}\n    hulls := []int{80, 45, 92, 80}\n    crews := []int{12, 8, 20, 10}\n    for i := 0; i < len(names); i++ {\n        power := hulls[i] + crews[i]*2\n        if power >= 100 {\n            fmt.Println(names[i])\n        }\n    }\n}',
              must: { re: 'for\\s', text: '必须用循环按同一下标聚合属性' }
            }
          ],
          outro: '星隼、白鲸、赤鸢依次亮起。锈像停在原地，三列名单第一次对齐成三条船。灰把登记表翻到新的一页：「下一张表，我按船来写。」',
          loot: LS.makeLoot('rare', '船坞铆钉锤', 'weapon', '⚒', '锤头一侧刻着字段名，一侧刻着方法名。船坞守说，两样都齐了，才算一条船。', 'go')
        }
      ]
    },
    {
      id: 'go-8', title: '第八章 · 镜像星门', jp: '鏡像の星門', volume: '第二卷 · 源核之下',
      subtitle: '门不认你的名字，只认你会做什么', summary: 'interface、隐式实现、接口值、类型断言、策略分派与依赖倒置。',
      nodes: [
        {
          id: 'go-8-1', type: 'story', title: '只认能力的门', jp: '能力だけの門', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '最后一层是镜像星门。门不认你的名字，只认你会做什么。' },
            { who: '岚', tone: 'ally', text: '这就是接口：不问类型，只问方法。谁能攻击、谁能护盾，谁就能通过。' },
            { who: '镜面巡守', tone: 'enemy', text: '报上你的类型。类型不对，门不开。' },
            { who: '岚', tone: 'ally', text: '在 Go 里不用报名号。做到就够了——隐式实现。' },
            { who: '通讯官·铃', tone: 'guide', text: '终端里没有 interface，我们用一张策略表代替：按类型名查倍数，一样是「按能力分派」。' }
          ]
        },
        {
          id: 'go-8-2', type: 'lesson', title: '接口与多态', jp: 'インターフェースと多態', xp: 40, minutes: 25,
          article: {
            lead: '前面几章都在描述「数据长什么样」，这一章换一个问题：调用方只需要知道「能做什么」。接口让不同的类型在同一句调用下各干各的事，也让依赖方向反过来。',
            sections: [
              {
                h: '1. interface：只写「会什么」',
                p: [
                  'type Attacker interface { Hit() int } 定义一组方法签名。接口不关心数据长什么样，只关心能不能做这件事；它不能有字段，也不能带实现（Go 1.18 之后泛型约束里的接口略有扩展，但这里先不展开）。',
                  '一个类型的方法集里包含接口要求的全部方法，就自动满足该接口。没有 implements 关键字，也没有注册步骤，这是 Go 接口最容易被记住、也最容易踩坑的一点。'
                ],
                code: { lang: 'go', src: 'type Attacker interface {\n    Hit() int\n}\n\ntype Drone struct{ Power int }\n\nfunc (d Drone) Hit() int { return d.Power }\n\nvar a Attacker = Drone{Power: 20}\nfmt.Println(a.Hit())', runnable: false }
              },
              {
                h: '2. 隐式实现：好处与代价',
                p: [
                  '好处是解耦：接口可以事后抽出来，甚至定义在调用方的包里；第三方类型不需要为了你而改动。标准库的 io.Reader、io.Writer 就是这样活下来的。',
                  '代价是错误发现得晚：类型少写了一个方法、或者接收者写成了指针，编译器会在「赋值给接口变量」的那一行报 does not implement，而不是在类型定义处。看到这个错误，就去逐个核对方法名、参数、返回值与接收者。'
                ],
                code: { lang: 'go', src: 'func (d *Drone) Hit() int { return d.Power }\n\nvar a Attacker = Drone{Power: 20}   // 编译错误：值类型没有指针方法\nvar b Attacker = &Drone{Power: 20}  // 正确', runnable: false },
                note: '指针类型的方法集包含值方法与指针方法；值类型的方法集只有值方法。这一条解释了上面那行报错。'
              },
              {
                h: '3. 接口值：动态类型加值',
                p: [
                  '接口变量里存着一对信息：动态类型，以及该类型的一个值。赋值时值会被复制；把一个 *Ship 放进接口，接口里存的是指针，通过它改指向的对象仍然影响原对象。',
                  '经典陷阱：函数声明返回 error，实现里却 return (*MyError)(nil)，此时接口本身并不为 nil，调用方写 err != nil 会成立。判断前先想清楚，「接口值是 nil」和「接口里的指针是 nil」是两件事。'
                ],
                code: { lang: 'go', src: 'var err error = (*MyError)(nil)\nfmt.Println(err == nil)   // false：接口有动态类型\n\nvar raw *MyError = nil\nfmt.Println(raw == nil)   // true', runnable: false }
              },
              {
                h: '4. 空接口、类型断言与类型 switch',
                p: [
                  'any（即 interface{}）可以装任何值，代价是用之前必须取回具体类型。v, ok := x.(Ship) 是安全断言：ok 为 false 时 v 是零值；直接写 x.(Ship) 一旦失败就 panic。',
                  '面对多种类型，用类型 switch：switch v := x.(type) { case Ship: ... case int: ... }。它能替代一长串断言，也明确告诉读代码的人：这里确实在做分派。'
                ],
                code: { lang: 'go', src: 'var x any = Ship{Name: "星隼"}\n\nv, ok := x.(Ship)\nif ok {\n    fmt.Println(v.Name)\n}\n\nswitch t := x.(type) {\ncase Ship:\n    fmt.Println("船", t.Name)\ncase int:\n    fmt.Println("数", t)\ndefault:\n    fmt.Println("未知")\n}', runnable: false }
              },
              {
                h: '5. 多态与策略分派',
                p: [
                  '多态的意思是：同一句调用，按实际类型执行不同实现。for _, a := range attackers { total += a.Hit() }，切片里可以混放不同结构体，调用方不需要 switch。',
                  '接口不是唯一做法。按键选算法时，用 map 存函数值或存参数更轻：table[kind] 一次查表就完成分派，没有类型断言，也没有接口开销。终端里的战斗题就是这么解的——倍数表本身就是一张「策略表」。'
                ],
                code: { lang: 'go', src: 'heal := map[string]int{"药草": 8, "绷带": 3, "血清": 20}\norder := []string{"绷带", "血清", "药草"}\nsum := 0\nfor _, name := range order {\n    sum += heal[name]\n}\nfmt.Printf("合计=%d\\n", sum)' },
                note: '查表分派的隐含前提是「缺失的键有安全默认值」。map 读取不存在的键返回零值，这个零值必须对业务有意义，或者像战斗题那样显式补 1 倍。'
              },
              {
                h: '6. 依赖倒置与小接口',
                p: [
                  '接口应该由使用方定义，而不是实现方。想清楚「我需要什么能力」，写出最小接口，任何实现方自然就满足了它。这叫依赖倒置：高层模块不再依赖具体类型。',
                  '接口越小越通用：一个方法的接口几乎人人能满足，十个方法的接口几乎没人能满足。先写具体类型，等到真的出现第二种实现，再抽接口——提前抽象往往抽错。'
                ],
                note: '本章的战斗不用 interface——终端不支持。但「按类型查表分派」与接口多态是同一件事：把「做什么」和「谁来做」分开。'
              }
            ],
            terms: [
              { t: '接口', en: 'interface', d: '一组方法签名的集合，只描述能力，不描述数据。' },
              { t: '方法集', en: 'method set', d: '一个类型可调用的方法集合，值类型与指针类型不同。' },
              { t: '隐式实现', en: 'implicit implementation', d: '只要方法齐全就自动满足接口，无需显式声明。' },
              { t: '动态类型', en: 'dynamic type', d: '接口值在运行期实际持有的具体类型。' },
              { t: '类型断言', en: 'type assertion', d: '把接口值取回具体类型，可带 ok 形式安全判断。' },
              { t: '空接口', en: 'empty interface', d: '不含任何方法的接口，任何类型都满足它。' },
              { t: '多态', en: 'polymorphism', d: '同一调用按实际类型执行不同实现。' },
              { t: '依赖倒置', en: 'dependency inversion', d: '高层模块依赖抽象接口，而不是具体实现。' }
            ],
            exam: '面试常问：Go 的接口如何实现、接口值为 nil 需要满足什么条件、类型断言与类型 switch 的区别、空接口的代价、为什么接口要小、如何用 map 加函数值替代策略模式。',
            checklist: [
              '能定义一个只含必要方法的接口',
              '理解隐式实现以及方法集差异',
              '知道接口值由动态类型和值组成',
              '会用类型断言与类型 switch 安全取值',
              '能说出小接口与依赖倒置的好处'
            ]
          }
        },
        {
          id: 'go-8-3', type: 'battle', title: '遭遇 · 镜面巡守', jp: '鏡面の巡守', xp: 80,
          enemy: {
            name: '镜面巡守', kind: 'drone', hp: 100,
            title: '镜像 · 只认能力', taunt: '报上你的类型。类型不对，门不开。',
            lore: '它把星门的伤害规则藏进一张按类型索引的表里。按名字查表，再乘上基础伤害，门就会承认你的能力。'
          },
          brief: '星门按目标类型给出伤害倍数。遍历来袭目标，查表算出实际伤害，逐个报给巡守。',
          tasks: [
            {
              prompt: '给定 multiplier := map[string]int{"drone": 2, "golem": 1, "wraith": 3}; 与 targets := []string{"drone", "wraith", "golem", "drone"}; 基础伤害为 10。用 range 遍历 targets，按 map 查出的倍数算出伤害，输出「类型:伤害」，每行一个；map 里没有的类型按 1 倍处理。',
              requirement: '预期输出四行：drone:20 / wraith:30 / golem:10 / drone:20',
              expected: 'drone:20\nwraith:30\ngolem:10\ndrone:20',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    multiplier := map[string]int{"drone": 2, "golem": 1, "wraith": 3}\n    targets := []string{"drone", "wraith", "golem", "drone"}\n    base := 10\n    // 遍历目标，查倍数，算伤害\n}\n',
              hints: [
                '遍历写成 for _, t := range targets，每轮先查倍数：m := multiplier[t]。',
                '缺失的键读出零值 0，写 if m == 0 { m = 1 } 把它当成未登记的类型。',
                '输出用 fmt.Printf("%s:%d\\n", t, base*m)，冒号两边不要留空格。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    multiplier := map[string]int{"drone": 2, "golem": 1, "wraith": 3}\n    targets := []string{"drone", "wraith", "golem", "drone"}\n    base := 10\n    for _, t := range targets {\n        m := multiplier[t]\n        if m == 0 {\n            m = 1\n        }\n        fmt.Printf("%s:%d\\n", t, base*m)\n    }\n}',
              must: { re: 'range\\s', text: '必须使用 range 遍历目标列表' }
            }
          ],
          outro: '四行伤害依次刻在镜面上，门从中间裂开一道缝。巡守退到一侧，第一次没有问任何人的名字。',
          loot: LS.makeLoot('rare', '镜像策略钥', 'relic', '⧉', '钥匙上没有齿，只有一张表。表里写的是「什么样的敌人，用几倍的力」。', 'go')
        }
      ]
    }
  );
  }

  const goLang = LS.lang('go');
  if (goLang) {
    applyGoVolumeTwoA(goLang);
  } else if (typeof LS.registerLanguage === 'function') {
    // 本文件可能先于 go.js 载入：等 Go 注册完成后再挂载第二卷
    const register = LS.registerLanguage;
    LS.registerLanguage = function (def) {
      register.call(LS, def);
      if (def && def.id === 'go') applyGoVolumeTwoA(LS.lang('go'));
    };
  }
})(window.LS);
