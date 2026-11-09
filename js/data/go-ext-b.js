/* Go — 第二卷 · 源核之下（第九章 ~ 第十二章 · 终章）
 * 只新增数据，不修改第一卷结构；仅在载入时把第一卷第四章标记为卷一终章。
 * 本文件可能先于 go.js 载入（校验器按字母序），因此注册采用延迟挂载。
 */
(function (LS) {
  'use strict';

  function applyGoVolumeTwoB(lang) {
    // 把第一卷第四章标记为卷一终章，避免出现两个「终章」
    const vol1 = lang.chapters[3];
    if (vol1 && !vol1.title.includes('卷一终章')) {
      vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
      const last = vol1.nodes[vol1.nodes.length - 1];
      last.title = '卷一终战 · ' + last.title.replace(/^终战\s*·\s*/, '');
    }
    lang.chapters.push(
    {
      id: 'go-9', title: '第九章 · 断链航道', jp: '断たれた航路', volume: '第二卷 · 源核之下',
      subtitle: '失败要留下可追溯的原因', summary: 'error 接口、错误包装、多返回值、defer 与 panic 的边界。',
      nodes: [
        {
          id: 'go-9-1', type: 'story', title: '断口处的日志', jp: '断ち目の記録', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '源核之下有一段旧航道，信号链在三百年前就断了。断口每过一会儿就重复一次同样的失败，没有人知道为什么。' },
            { who: '档案员·环', tone: 'guide', text: '我是这里的档案员，环。链断的那天，日志只写了一行「失败」——没有原因，没有位置。三百年过去，谁也不敢动它。' },
            { who: '岚', tone: 'ally', text: '在 Go 里，失败不是沉默。函数把 error 作为最后一个返回值交出来，调用者必须亲眼看一次。' },
            { who: '断链幽灵', tone: 'enemy', text: '失败……失败……不需要原因。原因只会让人多问一句。' },
            { who: '岚', tone: 'ally', text: '这次我们把原因一层层包起来，让每个断口都说得清自己断在哪里。' }
          ]
        },
        {
          id: 'go-9-2', type: 'lesson', title: '错误是被交出来的数据', jp: '誤りというデータ', xp: 40, minutes: 24,
          article: {
            lead: 'Go 没有异常。失败被当成一个普通的值返回，由调用者显式处理。这一章讲清 error 的形状、怎么创建与包装、怎么判断，以及 defer 与 panic 各自该守的边界。',
            sections: [
              {
                h: '1. error 是一个接口，不是异常',
                p: [
                  'Go 没有 try/catch。可预期的失败被表示成一个值：实现了 Error() string 的 error 接口。函数把 error 作为返回值交出来，由调用者决定怎么处理。',
                  '这样做的好处是失败路径在代码里可见：你很难「顺手」跳过它，评审时也一眼能看见哪里没有检查。错误还可以像普通数据一样被记录、包装、上传、比较。',
                  '约定有三条：nil 表示没有错误；错误文本小写开头、结尾不加标点；文本要说明「发生了什么」，而不是指责调用者。'
                ],
                code: { lang: 'go', src: 'type error interface {\n    Error() string\n}\n\nfunc find(id int) (string, error) {\n    if id <= 0 {\n        return "", fmt.Errorf("id 必须为正数: %d", id)\n    }\n    return "星图", nil\n}', runnable: false },
                note: '不要用错误文本做判断。文本是给人看的，类型和哨兵值才是给程序看的。'
              },
              {
                h: '2. errors.New 与 fmt.Errorf',
                p: [
                  'errors.New 创建一个只带固定文本的错误，适合「总是同一个意思」的失败。fmt.Errorf 支持格式化，把上下文拼进文本。',
                  '把错误声明成包级变量（例如 ErrNotFound = errors.New("档案不存在")），它就成了一个哨兵值：调用方可以用它判断「是不是这一类失败」。',
                  'fmt.Errorf 里的 %w 是包装而不是拼接：它保留原始错误，形成一条错误链。用 %v 只会留下文本，链就断了。'
                ],
                code: { lang: 'go', src: 'var ErrNotFound = errors.New("档案不存在")\n\nfunc open(id int) error {\n    if id != 7 {\n        return fmt.Errorf("打开档案 %d: %w", id, ErrNotFound)\n    }\n    return nil\n}', runnable: false },
                note: '%w 一次只接受一个 error 参数；需要包多个错误时，Go 1.20 之后可以用 errors.Join。'
              },
              {
                h: '3. (value, error)：先检查，再使用',
                p: [
                  '惯例是把 error 放在最后一个返回值。调用方写法几乎是固定的：v, err := f(); if err != nil { ... }。只有 err 为 nil 时，v 才是可信的。',
                  '常见错误是「检查了错误却继续用值」，或者把 err 存起来最后统一打印，导致真正出错的位置丢失。错误要就地处理或就地补充上下文再往上返回。',
                  '函数内部也一样：遇到错误优先提前返回，让主流程保持一条直线。嵌套越少，越容易看出哪个分支忘了写 return。'
                ],
                code: { lang: 'go', src: 'func load(id int) (string, error) {\n    if id <= 0 {\n        return "", ErrNotFound\n    }\n    return "航线图", nil\n}\n\nname, err := load(-1)\nif err != nil {\n    fmt.Println("读取失败:", err)\n    return\n}\nfmt.Println("读到", name)', runnable: false },
                note: '零值 + 错误是标准组合：失败时返回该类型的零值，调用方不需要判断值有没有意义。'
              },
              {
                h: '4. 包装、判断与提取',
                p: [
                  '包装用 fmt.Errorf("...: %w", err)，每一层都能补充上下文，同时保留原始错误。链越长，排障时越接近现场。',
                  '判断用 errors.Is(err, target)：沿错误链查找某个哨兵值。提取用 errors.As(err, &target)：沿链寻找某个具体类型。直接写 == 比较，包装过的错误一定不相等。',
                  '自定义错误类型只要实现 Error() string，就能携带字段（行号、请求 ID、重试次数）。用 errors.As 取出来，比解析文本可靠得多。'
                ],
                code: { lang: 'go', src: 'if err := open(9); err != nil {\n    if errors.Is(err, ErrNotFound) {\n        fmt.Println("按缺档处理")\n    } else {\n        fmt.Println("其他故障:", err)\n    }\n}', runnable: false },
                note: 'errors.Is 判断「是不是这一类」，errors.As 判断「能不能取出这个类型」，两者都不是文本匹配。'
              },
              {
                h: '5. defer：把清理写在申请旁边',
                p: [
                  'defer 把调用推迟到当前函数返回前执行，多个 defer 按后进先出顺序执行。它解决的是「每个分支都要记得释放」的问题：申请与释放写在相邻两行，中间怎么返回都不会漏。',
                  'defer 的参数在写 defer 那一刻就求值，函数后面的修改不会影响它。要延迟到真正执行时才取值，就用闭包包一层。',
                  'defer 属于函数而不是代码块。写在循环里会一直累积到函数结束，长循环应改成显式关闭，或者把循环体拆成一个小函数。'
                ],
                code: { lang: 'go', src: 'func readAll() {\n    f, err := os.Open("voyage.log")\n    if err != nil {\n        return\n    }\n    defer f.Close()\n\n    fmt.Println("读取中")\n    // 无论后面从哪个分支返回，Close 都会执行\n}', runnable: false },
                note: 'defer 不是「延迟到程序结束」，而是「延迟到当前函数返回」。'
              },
              {
                h: '6. panic 的边界与「不要忽略错误」',
                p: [
                  'panic 只用于程序无法继续的情况：配置缺失、初始化失败、不变量被破坏。业务上的「找不到」「余额不足」都应该返回 error。把 panic 当控制流，等于让调用方无法处理。',
                  'recover 只在 defer 中有效，而且只能拦下当前 goroutine 的 panic。它适合放在服务入口或 goroutine 起点做兜底，不适合用来「吞掉」问题。',
                  '最常见的生产事故来源是忽略错误：用 _ 接住 error，或者写了 if err != nil {} 的空分支，都等于把问题藏起来。CI 里加上 errcheck 一类的静态检查，能把这类地方逼出来。'
                ],
                note: '判断标准很简单：调用者有可能合理地处理它，就返回 error；否则才 panic。'
              }
            ],
            terms: [
              { t: '错误接口', en: 'error', d: '只要求 Error() string 的内置接口，nil 表示没有错误。' },
              { t: '哨兵错误', en: 'sentinel error', d: '预先定义、用于判断失败类别的包级 error 变量。' },
              { t: '错误包装', en: 'error wrapping', d: '用 %w 把下层错误嵌进新错误，形成可追溯的错误链。' },
              { t: '错误链判断', en: 'errors.Is', d: '沿错误链查找是否包含某个哨兵错误。' },
              { t: '错误链提取', en: 'errors.As', d: '沿错误链寻找某个具体错误类型并取出。' },
              { t: '延迟调用', en: 'defer', d: '把调用推迟到当前函数返回前执行，多个 defer 后进先出。' },
              { t: '崩溃与恢复', en: 'panic / recover', d: 'panic 中断当前 goroutine，recover 只能在 defer 中拦截它。' }
            ],
            exam: 'Go 面试高频：error 是接口还是类型、%w 与 %v 的区别、errors.Is 与 errors.As 各自解决什么、defer 的执行顺序与参数求值时机、panic 能不能跨 goroutine 被 recover（不能）、为什么不能用错误文本做分支判断。',
            checklist: [
              '能说清 error 是接口、nil 表示成功',
              '会写 (value, error) 并在调用处先检查错误',
              '会用 %w 包装，并用 errors.Is / errors.As 判断',
              '知道多个 defer 的执行顺序与参数求值时机',
              '能区分该返回 error 还是该 panic 的场合'
            ]
          }
        },
        {
          id: 'go-9-3', type: 'battle', title: '遭遇 · 断链幽灵', jp: '断鎖の亡霊', xp: 80,
          enemy: {
            name: '断链幽灵', kind: 'wraith', hp: 100,
            title: '影兽 · 无因之错', taunt: '失败……失败……不需要原因。',
            lore: '它把每一次失败都压成一句没有上下文的「失败」。先校验、再把有效的数据聚合起来，断口才会重新说出话来。'
          },
          brief: '航道口的编号里混着无效值。先校验再聚合：只累加正数，同时数清被跳过了几个。',
          tasks: [
            {
              prompt: '给定 codes := []int{12, -1, 7, -3, 21, 0}; 定义函数 valid(n int) bool，当 n 大于 0 时返回 true。遍历 codes：有效值累加进 total，无效值让 skipped 加一。最后输出两行「合计=…」与「跳过=…」。',
              requirement: '预期输出两行：合计=40 / 跳过=3',
              expected: '合计=40\n跳过=3',
              starter: 'package main\n\nimport "fmt"\n\nfunc valid(n int) bool {\n    // 在这里判断 n 是否有效\n    return false\n}\n\nfunc main() {\n    codes := []int{12, -1, 7, -3, 21, 0}\n    total := 0\n    skipped := 0\n    // 遍历 codes：有效就累加，否则 skipped++\n    fmt.Printf("合计=%d\\n", total)\n    fmt.Printf("跳过=%d\\n", skipped)\n}\n',
              hints: [
                'valid 的函数体只有一行：return n > 0。',
                '遍历写成 for _, v := range codes，循环体里用 if valid(v) 分成两支。',
                '有效分支写 total += v，无效分支写 skipped++，最后保留两条 Printf。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc valid(n int) bool {\n    return n > 0\n}\n\nfunc main() {\n    codes := []int{12, -1, 7, -3, 21, 0}\n    total := 0\n    skipped := 0\n    for _, v := range codes {\n        if valid(v) {\n            total += v\n        } else {\n            skipped++\n        }\n    }\n    fmt.Printf("合计=%d\\n", total)\n    fmt.Printf("跳过=%d\\n", skipped)\n}',
              must: { re: 'func\\s+valid\\s*\\(', text: '必须定义 valid 函数做校验' }
            }
          ],
          outro: '合计停在 40，跳过停在 3。幽灵第一次听见带原因的失败，断口处浮出一行很旧的日志：无效编号 3 个，已记录并跳过。环把那行日志抄进了新的档案。',
          loot: LS.makeLoot('epic', '断链校验符', 'relic', '⟠', '符面刻着一行小字：错误不是噪音，是信号——只有在被读取时才生效。', 'go')
        }
      ]
    },
    {
      id: 'go-10', title: '第十章 · 脉冲引擎', jp: '脈動の機関', volume: '第二卷 · 源核之下',
      subtitle: '让多条航线同时推进，又不互相踩踏', summary: 'goroutine、channel、select、WaitGroup 与数据竞争。',
      nodes: [
        {
          id: 'go-10-1', type: 'story', title: '过载的引擎室', jp: '過負荷の機関室', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '引擎室里有三条脉冲线，本该同时推进。现在它们全挤在一条线上，管线热得发红。' },
            { who: '引擎匠·砾', tone: 'guide', text: '我是砾，这台引擎的匠人。三百年前我教它同时做三件事，它学会了抢同一块记录板——于是每次对账都对不上。' },
            { who: '岚', tone: 'ally', text: '在 Go 里，并发不是把 for 换成 go 就完事。goroutine 之间要靠 channel 传数据，而不是抢同一块内存。' },
            { who: '脉冲涡兽', tone: 'enemy', text: '一起……一起……挤在一起……谁也数不清。' },
            { who: '岚', tone: 'ally', text: '先让每条线有自己的账本，最后再合并。顺序清楚了，同时才有意义。' }
          ]
        },
        {
          id: 'go-10-2', type: 'lesson', title: '并发、通道与同步', jp: '並行と通信', xp: 40, minutes: 26,
          article: {
            lead: 'goroutine 很便宜，但并发从来不是免费的：谁等谁、谁关谁、谁在改同一块内存，都必须想清楚。这一章按「启动、通信、等待、保护、检测」的顺序，把 Go 的并发骨架讲一遍。',
            sections: [
              {
                h: '1. goroutine：最小的并发单位',
                p: [
                  '在函数调用前加 go，就启动一个 goroutine。它由 Go 运行时调度，初始栈很小、按需增长，创建成本远低于系统线程。',
                  '主 goroutine 就是 main。main 返回时整个程序立即结束，其他 goroutine 不会等它——所以并发代码的第一课不是「怎么开」，而是「怎么等」。',
                  '不要用 time.Sleep 当同步手段。它只是碰巧有效：机器一忙，等待时间就不够，问题会在最不该出现的时候出现。'
                ],
                code: { lang: 'go', src: 'go func() {\n    fmt.Println("脉冲 1 就绪")\n}()\n\nfmt.Println("主 goroutine 继续")\n// 主函数一返回，上面的输出可能永远不会发生', runnable: false },
                note: '看到 go 关键字，先问一句：谁负责等它结束？没有答案，就会得到一个「有时生效」的 bug。'
              },
              {
                h: '2. channel：用通信共享内存',
                p: [
                  'ch := make(chan int) 是无缓冲通道：发送和接收必须同时就绪，否则双方都阻塞。make(chan int, 3) 是有缓冲通道，容量未满时发送不阻塞。',
                  '方向要看清：ch <- v 是发送，v := <-ch 是接收。类型写成 chan<- int 只能发送，<-chan int 只能接收，函数签名里用它可以表达意图。',
                  'channel 是引用类型，零值是 nil。对 nil 通道发送或接收会永久阻塞，这是新手最常见的「程序卡住」原因。'
                ],
                code: { lang: 'go', src: 'ch := make(chan int)\ngo func() {\n    ch <- 42\n}()\nfmt.Println(<-ch)', runnable: false },
                note: '无缓冲通道像面对面交接：一方不到，另一方就等。有缓冲通道像快递柜：柜子满了才等。'
              },
              {
                h: '3. close 与 range',
                p: [
                  'close(ch) 表示「不会再有新值」。接收方可以用 v, ok := <-ch 判断，也可以直接 for v := range ch，读到关闭为止。',
                  '只有发送方才有资格关闭，而且只能关一次：向已关闭的通道发送会 panic。接收已关闭的通道不会阻塞，会立刻拿到零值。',
                  '关闭是一种广播：所有正在等待的接收者会同时被唤醒。用它来通知「任务结束」，比给每个 goroutine 单独发消息简单得多。'
                ],
                code: { lang: 'go', src: 'ch := make(chan string, 2)\nch <- "航线 A"\nch <- "航线 B"\nclose(ch)\n\nfor msg := range ch {\n    fmt.Println(msg)\n}', runnable: false },
                note: '多个 goroutine 都想关闭同一个通道时，先让它们把结果送回一个汇总者，由汇总者统一关闭。'
              },
              {
                h: '4. select：同时等多个通道',
                p: [
                  'select 在所有 case 里挑一个现在就能进行的；如果都阻塞就等待，写了 default 则立刻执行 default。',
                  '配合 time.After 做超时，是网络服务的标准写法：拿不到结果就放弃，而不是把调用方无限挂起。',
                  '在 for 里写 select 很常见，但一定要有退出条件（例如 ctx.Done()），否则这个 goroutine 永远不会结束，形成泄漏。'
                ],
                code: { lang: 'go', src: 'select {\ncase msg := <-ch:\n    fmt.Println(msg)\ncase <-time.After(time.Second):\n    fmt.Println("超时，放弃等待")\n}', runnable: false },
                note: '多个 case 同时就绪时，select 是随机选的，不要依赖它的顺序。'
              },
              {
                h: '5. WaitGroup 与 Mutex',
                p: [
                  'sync.WaitGroup 用 Add(n) 记账、Done() 销账、Wait() 等账清零。Add 必须在启动 goroutine 之前调用，否则可能 Wait 已经返回了才开始干活。',
                  '共享变量必须保护：sync.Mutex 的 Lock/Unlock 成对出现，通常紧跟 defer mu.Unlock()；读多写少的场景可以用 sync.RWMutex。',
                  '锁保护的是「所有访问路径」。只要有一条路径没拿锁，保护就等于没有——这类 bug 在测试里几乎看不出来。'
                ],
                code: { lang: 'go', src: 'var wg sync.WaitGroup\nvar mu sync.Mutex\ntotal := 0\n\nfor _, v := range jobs {\n    wg.Add(1)\n    go func(n int) {\n        defer wg.Done()\n        mu.Lock()\n        total += n\n        mu.Unlock()\n    }(v)\n}\nwg.Wait()\nfmt.Println(total)', runnable: false },
                note: '把 v 作为参数传进 goroutine，而不是在闭包里直接引用循环变量——这是最经典的一次坑。'
              },
              {
                h: '6. 数据竞争、竞态检测与并发的边界',
                p: [
                  '数据竞争指两个 goroutine 至少有一个在写、又没有同步地访问同一个变量。它的表现是随机的：本机通过、压测崩溃，而且往往在演示时消失。',
                  '用 go run -race main.go 或 go test -race ./... 让检测器在运行时把竞争点报出来。它只能发现「真跑到的」竞争，所以测试必须覆盖并发路径。',
                  '并发不是免费的。先写出顺序版本、量出瓶颈，再决定哪一段并行化。并行化的第一步通常不是开 goroutine，而是把数据分区，让每一段互不共享。',
                  '下面这段分区求和的顺序版本，就是后续并行版本的「对照组」：结果对了，再谈把它拆开。'
                ],
                code: { lang: 'go', src: 'jobs := []int{12, 7, 19, 4, 23, 8, 15, 6}\nsums := []int{0, 0, 0}\nfor i, v := range jobs {\n    sums[i%3] += v\n}\nfmt.Println(sums)' },
                note: '教学终端是同步执行环境，go / chan / select 的示例只用于理解结构，不参与关卡判定。'
              }
            ],
            terms: [
              { t: '协程', en: 'goroutine', d: '由 Go 运行时调度的轻量执行单元，用 go 关键字启动。' },
              { t: '通道', en: 'channel', d: 'goroutine 之间传递值的管道，可带缓冲。' },
              { t: '阻塞', en: 'blocking', d: '当前操作无法完成时让出执行权，直到条件满足。' },
              { t: '关闭通道', en: 'close', d: '声明不再发送新值，接收方会读到零值并结束 range。' },
              { t: '多路等待', en: 'select', d: '同时等待多个通道操作，执行其中就绪的一个。' },
              { t: '等待组', en: 'WaitGroup', d: '用计数器等待一组 goroutine 全部结束。' },
              { t: '互斥锁', en: 'Mutex', d: '保证同一时刻只有一个 goroutine 进入临界区。' },
              { t: '数据竞争', en: 'data race', d: '并发读写同一变量且缺少同步，结果不可预测。' }
            ],
            exam: '面试高频：goroutine 与线程的区别、无缓冲与有缓冲通道的阻塞时机、关闭通道后接收会得到什么、select 的选择是否有序（不保证）、WaitGroup 的 Add 该写在哪里、如何用 -race 定位竞争、为什么并发写 map 会直接崩溃。',
            checklist: [
              '能说清 main 返回后其他 goroutine 的命运',
              '分得清无缓冲与有缓冲通道的阻塞时机',
              '知道 close 只能由发送方调用且只能一次',
              '会用 WaitGroup 等待一组任务完成',
              '能说出至少两种避免数据竞争的手段'
            ]
          }
        },
        {
          id: 'go-10-3', type: 'battle', title: '遭遇 · 脉冲涡兽', jp: '脈動の渦獣', xp: 80,
          enemy: {
            name: '脉冲涡兽', kind: 'glitch', hp: 100,
            title: '影兽 · 同频塌缩', taunt: '一起……一起……谁也数不清。',
            lore: '它把三条脉冲线拧成一股，数字全糊在一起。先按 i%3 把任务分到三条通道，各自账本清了，涡流才会散开。'
          },
          brief: '八个任务要分给三条脉冲通道。先分区求和，再汇总总数——这就是把并行改写成顺序时的对照组。',
          tasks: [
            {
              prompt: '给定 jobs := []int{12, 7, 19, 4, 23, 8, 15, 6}; 第 i 个任务进入第 i%3 条通道。用长度为 3 的切片 sums 累计各通道小计，同时统计总计 total。依次输出「通道0=…」「通道1=…」「通道2=…」「总计=…」。',
              requirement: '预期输出四行：通道0=31 / 通道1=36 / 通道2=27 / 总计=94',
              expected: '通道0=31\n通道1=36\n通道2=27\n总计=94',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    jobs := []int{12, 7, 19, 4, 23, 8, 15, 6}\n    sums := []int{0, 0, 0}\n    total := 0\n    // 遍历 jobs：按 i%3 累加到 sums，同时累加 total\n    fmt.Printf("通道0=%d\\n", sums[0])\n    fmt.Printf("通道1=%d\\n", sums[1])\n    fmt.Printf("通道2=%d\\n", sums[2])\n    fmt.Printf("总计=%d\\n", total)\n}\n',
              hints: [
                '用 for i, v := range jobs 同时拿到下标和值，下标从 0 开始。',
                '分区下标就是 i % 3，写成 sums[i%3] += v。',
                '每个任务还要同时写 total += v，最后四条 Printf 保持原样。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    jobs := []int{12, 7, 19, 4, 23, 8, 15, 6}\n    sums := []int{0, 0, 0}\n    total := 0\n    for i, v := range jobs {\n        sums[i%3] += v\n        total += v\n    }\n    fmt.Printf("通道0=%d\\n", sums[0])\n    fmt.Printf("通道1=%d\\n", sums[1])\n    fmt.Printf("通道2=%d\\n", sums[2])\n    fmt.Printf("总计=%d\\n", total)\n}',
              must: { re: 'i\\s*%\\s*3', text: '必须按 i%3 分区累加' }
            }
          ],
          outro: '三条通道分别亮起 31、36、27，总计 94 与逐项相加完全一致。涡兽散成三段安静的光，引擎室里第一次听见三种不同的节拍同时运转。砾在记录板上写：先分区，再并行。',
          loot: LS.makeLoot('epic', '脉冲缓冲甲', 'armor', '▤', '甲片之间留着三条互不打扰的间隙，像有缓冲的通道：洪峰来了先接住，再慢慢放行。', 'go')
        }
      ]
    },
    {
      id: 'go-11', title: '第十一章 · 档案卫星', jp: '記録の衛星', volume: '第二卷 · 源核之下',
      subtitle: '能被人验证的代码，才算交付', summary: 'package/import、模块与目录、导出规则、测试与基准。',
      nodes: [
        {
          id: 'go-11-1', type: 'story', title: '卫星上的复核', jp: '衛星の再検査', xp: 20,
          lines: [
            { who: '档案员·环', tone: 'guide', text: '档案卫星绕了三百圈，每圈都在复核同一批记录。它从不相信任何人，包括自己。' },
            { who: '界灵·零', tone: 'guide', text: '这就是测试。代码说「我算对了」不算数，要有一条能重复执行、会自动失败的验证。' },
            { who: '岚', tone: 'ally', text: '环，当年这些记录为什么没人敢用？' },
            { who: '档案员·环', tone: 'guide', text: '因为它们没有留下「怎么检查」的说明。三百年后，谁也不敢改一行。' },
            { who: '复核之雾', tone: 'enemy', text: '通过……通过……全都通过……没有人真正看过。' }
          ]
        },
        {
          id: 'go-11-2', type: 'lesson', title: '包、模块与测试', jp: 'パッケージと試験', xp: 40, minutes: 25,
          article: {
            lead: 'Go 的工程化几乎全压在三个东西上：包划定可见性，模块划定依赖边界，测试划定「改坏了会红」的范围。这一章按从目录到 CI 的顺序，把它们串成一条线。',
            sections: [
              {
                h: '1. package 与 import：可见性的第一道门',
                p: [
                  '一个目录对应一个包，同一包内的文件共享标识符与初始化顺序。包名小写、简短，不用下划线，也不要和目录名差得太远。',
                  'import 写的是模块路径加目录，不是相对路径。导入即使用：未被使用的 import 是编译错误，这是 Go 保持依赖整洁的方式。',
                  '只为副作用导入时写 _，例如注册驱动；解决重名时用别名。两种写法都在告诉读者：这里的导入不是用来直接调用的。'
                ],
                code: { lang: 'go', src: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("档案卫星在线")\n}' },
                note: '包是编译单位，也是访问控制的边界。先从「哪些东西需要被包外看见」开始设计，包自然就分好了。'
              },
              {
                h: '2. 模块与目录：go.mod 决定边界',
                p: [
                  'go mod init example.com/starport 生成 go.mod，第一行是模块路径，所有 import 都以它为前缀。go.sum 记录依赖校验和，必须提交。',
                  '常见布局：cmd/<服务名> 放 main，一个仓库可以有多个可执行程序；internal/ 放不希望对外的实现；pkg/ 放确实要被外部复用的包。',
                  'internal 不是命名习惯，而是编译器强制：只有以 internal 的父目录为根的子树才能导入它。这是 Go 最便宜的一条封装手段。'
                ],
                code: { lang: 'go', src: 'module example.com/starport\n\ngo 1.22\n\nrequire github.com/example/pulse v1.4.0', runnable: false },
                note: '依赖不是越多越好。每加一个 require，就多一份别人升级、你跟着修的义务。'
              },
              {
                h: '3. 导出规则与文档注释',
                p: [
                  '首字母大写才是导出标识符，包外只能使用导出的名字。这就是 Go 没有 private 关键字却依然能封装的原因。',
                  '导出的名字要能被单独读懂：http.Client 比 http.C 好。文档注释写在声明上一行、以名字开头，godoc 会把它变成公开文档。',
                  '封装的常见漏洞：导出函数返回未导出类型、导出结构体里放了可被任意修改的字段、全局可变变量。设计时先想清楚「外部能做什么」。'
                ],
                code: { lang: 'go', src: '// Grade 把百分制分数换算成等级 A/B/C/D。\nfunc Grade(score int) string {\n    // ...\n}\n\ntype archive struct {   // 包外不可见\n    id int\n}', runnable: false },
                note: '注释解释「为什么」和「契约」，而不是把函数名翻译一遍。'
              },
              {
                h: '4. 测试文件与表驱动测试',
                p: [
                  '测试文件以 _test.go 结尾，函数签名固定为 func TestXxx(t *testing.T)，用 go test ./... 运行。测试与实现同包时，可以测试未导出函数。',
                  '表驱动测试是 Go 的主流写法：把用例写成切片，循环里用 t.Run(name, func(t *testing.T){...}) 跑子测试。失败时能直接看到是哪一行数据出的问题。',
                  't.Fatalf 立刻终止当前子测试，t.Errorf 记录后继续。失败信息里一定要打印「期望 / 实际」，否则测试只告诉你红了，不告诉你哪错了。'
                ],
                code: { lang: 'go', src: 'func TestGrade(t *testing.T) {\n    cases := []struct {\n        score int\n        want  string\n    }{\n        {95, "A"},\n        {80, "B"},\n        {61, "C"},\n        {40, "D"},\n    }\n    for _, c := range cases {\n        got := grade(c.score)\n        if got != c.want {\n            t.Errorf("grade(%d) = %s, want %s", c.score, got, c.want)\n        }\n    }\n}', runnable: false },
                note: '子测试的名字用输入值拼出来（例如 score=95），失败时日志一眼能定位。'
              },
              {
                h: '5. 覆盖率、基准与工具链',
                p: [
                  'go test -cover 给出语句覆盖率；加 -coverprofile=cover.out 再配 go tool cover -html 就能看到哪些行没被跑到。覆盖率是下限，不是目标：100% 覆盖也可能全是无效断言。',
                  '基准函数写成 func BenchmarkXxx(b *testing.B)，循环 b.N 次。go test -bench=. -benchmem 会输出 ns/op 与 allocs/op，用来比较两种实现而不是追求绝对数字。',
                  'go vet 检查可疑代码（格式串与参数不匹配、锁被复制等），gofmt 统一格式。CI 里至少跑 go vet ./... 与 go test ./...，让机器替你做这两件重复的事。'
                ],
                code: { lang: 'go', src: 'func BenchmarkGrade(b *testing.B) {\n    for i := 0; i < b.N; i++ {\n        grade(95)\n    }\n}\n\n// go test -bench=. -benchmem', runnable: false },
                note: '写基准前先确认逻辑正确。基准只能告诉你快慢，不能告诉你对不对。'
              },
              {
                h: '6. 把测试当成说明书',
                p: [
                  '测试是最不容易过期的文档：它和代码一起编译，实现改坏了就变红。写测试的顺序是「先固定行为，再重构实现」。',
                  '一个包对外只暴露少量入口，测试覆盖这些入口的边界（空、零、上限、非法输入），内部实现就能自由替换而不惊动调用方。',
                  '实战节奏：先写一个能跑通的小用例，再逐步加数据。不要一次写二十个再一起调试，那样你面对的是一团同时出错的红灯。'
                ],
                code: { lang: 'go', src: 'func pass(score int) bool {\n    return score >= 60\n}\n\nfunc main() {\n    scores := []int{95, 40, 61}\n    for _, s := range scores {\n        fmt.Printf("%d 及格=%v\\n", s, pass(s))\n    }\n}' },
                note: '终端里跑不了 testing 包，所以这里只演示「被测试的函数」与一组手写用例；真正的断言交给 go test。'
              }
            ],
            terms: [
              { t: '包', en: 'package', d: '同一目录下共享作用域的源码集合，也是访问控制的边界。' },
              { t: '模块', en: 'module', d: '由 go.mod 定义的版本化单元，import 路径以模块路径开头。' },
              { t: '导出标识符', en: 'exported identifier', d: '首字母大写的名字，可被其他包引用。' },
              { t: '内部包', en: 'internal', d: '只有父目录子树能导入的包，由编译器强制限制。' },
              { t: '表驱动测试', en: 'table-driven test', d: '把输入与期望写成表，循环执行同一段断言逻辑。' },
              { t: '子测试', en: 'subtest', d: '用 t.Run 创建的可单独运行与筛选的测试用例。' },
              { t: '基准测试', en: 'benchmark', d: '用 b.N 次循环测量函数耗时与内存分配的测试。' },
              { t: '覆盖率', en: 'coverage', d: '测试执行到的语句比例，是下限而不是质量证明。' }
            ],
            exam: '面试高频：包与模块的区别、首字母大小写与导出、internal 的导入限制、_test.go 的命名与 Test 前缀、表驱动测试怎么写、go test 常用参数（-run / -cover / -bench / -race）、覆盖率能不能代表质量（不能）。',
            checklist: [
              '能按职责划分包并写出正确的 import 路径',
              '知道 internal 的可见范围由谁强制',
              '能解释首字母大写与导出的关系',
              '会写表驱动测试与 t.Run 子测试',
              '能用 -cover、-bench、go vet 做基本质量检查'
            ]
          }
        },
        {
          id: 'go-11-3', type: 'battle', title: '遭遇 · 复核之雾', jp: '再検査の霧', xp: 80,
          enemy: {
            name: '复核之雾', kind: 'drone', hp: 100,
            title: '造物 · 全绿假象', taunt: '通过……通过……全都通过。',
            lore: '它把每条用例都标成「通过」，却从不真正比对。给出一张能逐行对账的成绩表，雾才会散。'
          },
          brief: '卫星要复核四个分数。用一张表把分数换算成等级，逐行输出——任何一行对不上，都会被看见。',
          tasks: [
            {
              prompt: '定义函数 grade(score int) string：大于等于 90 返回 "A"，大于等于 75 返回 "B"，大于等于 60 返回 "C"，否则返回 "D"。遍历 scores := []int{95, 80, 61, 40}，每行输出「分数=等级」。',
              requirement: '预期输出四行：95=A / 80=B / 61=C / 40=D',
              expected: '95=A\n80=B\n61=C\n40=D',
              starter: 'package main\n\nimport "fmt"\n\nfunc grade(score int) string {\n    // 从高到低判断，返回对应等级\n    return ""\n}\n\nfunc main() {\n    scores := []int{95, 80, 61, 40}\n    for _, s := range scores {\n        // 每行输出「分数=等级」\n    }\n}\n',
              hints: [
                'grade 里按从高到低判断：先写 if score >= 90，再依次判断 75 与 60。',
                '最后一个 return "D" 放在所有 if 之后，不要写成 else。',
                '输出用 fmt.Printf("%d=%s\\n", s, grade(s))，等号两边不要加空格。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc grade(score int) string {\n    if score >= 90 {\n        return "A"\n    } else if score >= 75 {\n        return "B"\n    } else if score >= 60 {\n        return "C"\n    }\n    return "D"\n}\n\nfunc main() {\n    scores := []int{95, 80, 61, 40}\n    for _, s := range scores {\n        fmt.Printf("%d=%s\\n", s, grade(s))\n    }\n}',
              must: { re: 'func\\s+grade\\s*\\(', text: '必须定义 grade 函数' }
            }
          ],
          outro: '四行结果依次对上：95=A、80=B、61=C、40=D。复核之雾散开，卫星第一次在日志里写下「已逐行比对」。环说：这就是可交付与看起来没问题的区别。',
          loot: LS.makeLoot('epic', '表驱动复核镜', 'relic', '◫', '镜面分成四格，每格对应一条用例。照过去时，它不问你有没有通过，只问你和期望差了多少。', 'go')
        }
      ]
    },
    {
      id: 'go-12', title: '第十二章 · 源核星港', jp: '終章・源核の星港', volume: '第二卷 · 源核之下',
      subtitle: '把学过的零件装成一座能运行的星港', summary: '项目结构、参数与日志读取、聚合流水线、部署监控；挑战终战 Boss。',
      nodes: [
        {
          id: 'go-12-1', type: 'story', title: '最后一班进港', jp: '最後の入港', xp: 20,
          lines: [
            { who: '界灵·零', tone: 'guide', text: '源核之下就是星港的底层。所有被写坏的日志、断掉的链路、错过的复核，最后都汇到这里。' },
            { who: '档案员·环', tone: 'guide', text: '我守了三百年的档案，缺的从来不是数据，是一条能把数据走完的路。' },
            { who: '引擎匠·砾', tone: 'guide', text: '引擎、通道、账本，都还在。只差一个人把它们接起来。' },
            { who: '虚空织网者·终焉', tone: 'enemy', text: '进来吧。你们写的每一行，都会变成我网上的一个结。' },
            { who: '岚', tone: 'ally', text: '那就让它看看，一条从读到算、从算到输出的完整流水线。' }
          ]
        },
        {
          id: 'go-12-2', type: 'lesson', title: '从日志到结论', jp: '記録から結論へ', xp: 40, minutes: 30,
          article: {
            lead: '这一章不再引入新语法，而是把前十一章拼成一条真实可用的流水线：读日志、解析、聚合、输出、退出。它同时是终战的地图——两道题分别对应这里的计数与筛选。',
            sections: [
              {
                h: '1. 目录结构：main 只做装配',
                p: [
                  'cmd/<服务名>/main.go 是入口，一个仓库可以有多个可执行程序；internal/ 放实现，编译器禁止外部模块导入；pkg/ 放确实要被外部复用的包。',
                  'main 的职责只有三件事：读配置与参数、装配依赖、启动并处理退出。业务逻辑放进 internal，才能被测试，也才能被别的命令复用。',
                  '一个包一个职责。目录名就是包名，看到目录大致就知道里面是什么——结构清楚的项目，新人第一天就能找到该改哪一行。'
                ],
                code: { lang: 'go', src: 'starport/\n├── cmd/starport/main.go\n├── internal/logscan/scan.go\n├── internal/report/report.go\n└── go.mod', runnable: false },
                note: '不要在 main 里写业务逻辑。main 一旦承载逻辑，就很难被测试覆盖。'
              },
              {
                h: '2. os.Args 与 flag：入口的两个开关',
                p: [
                  'os.Args 是原始参数切片，第一个元素是程序名。手写解析很快就会失控：短横线、等号、默认值、帮助文本，样样都要照顾。',
                  '标准库 flag 更省事：flag.String 返回指针，flag.Parse 之后用 *name 取值；布尔开关写 -v 即可，其余参数写 -file=x 或 -file x 都行。',
                  '子命令（starport scan / starport report）通常用 flag.NewFlagSet 各建一套解析器；只有需要补全、配置分层时才引入第三方 CLI 库。'
                ],
                code: { lang: 'go', src: 'path := flag.String("file", "app.log", "日志文件路径")\nverbose := flag.Bool("v", false, "输出详细统计")\nflag.Parse()\n\nfmt.Println(*path, *verbose)', runnable: false },
                note: '参数解析失败时 flag 会打印用法并以非零状态退出，这是命令行工具应有的礼貌。'
              },
              {
                h: '3. bufio.Scanner：一行一行读',
                p: [
                  'bufio.Scanner 把输入切成行：Scan 前进一行，Text 取当前行内容。它适合按行处理的日志，内存占用是常数。',
                  '必须检查 scanner.Err()：I/O 错误不会通过 Scan 返回 false 之外的方式告诉你。单行默认上限 64KB，超长行要用 scanner.Buffer 扩容，否则会被静默截断。',
                  '流式处理的原则是读一行、处理一行、丢掉一行。除非确认文件有上限，否则不要把整个文件先读进内存。'
                ],
                code: { lang: 'go', src: 'f, err := os.Open(path)\nif err != nil {\n    return err\n}\ndefer f.Close()\n\nsc := bufio.NewScanner(f)\nfor sc.Scan() {\n    line := sc.Text()\n    // 处理这一行\n}\nreturn sc.Err()', runnable: false },
                note: 'Scanner 也会吞掉最后一行没有换行符的内容——这通常正是你想要的。'
              },
              {
                h: '4. 解析与聚合：一条日志的去向',
                p: [
                  '解析一行通常三步：切字段（strings.Fields / strings.Cut）、取级别、归类计数。切分失败要能跳过并计数，而不是让整批数据失败。',
                  '聚合用 map[string]int 最自然：counts[level]++。需要固定输出顺序时，把键收集到切片再排序——map 的遍历顺序是随机的，这一点很容易在测试里翻车。',
                  '流水线保持单向：读 → 解析 → 聚合 → 输出。每一段只依赖上一段的输出，测试就能一段一段做。'
                ],
                code: { lang: 'go', src: 'logs := []string{"INFO", "ERROR", "WARN", "ERROR"}\ncounts := map[string]int{}\nfor _, l := range logs {\n    counts[l] += 1\n}\nfmt.Println(len(logs), counts["WARN"])' },
                note: '这段示例用切片模拟已经读进来的行，只演示「归类计数」这一段的形状。'
              },
              {
                h: '5. 结构化输出：encoding/json',
                p: [
                  '结果要交给别的系统时，用结构体加 JSON 标签：type Report struct { Errors int `json:"errors"` }。json.Marshal 输出紧凑 JSON，MarshalIndent 便于人读。',
                  '字段顺序按结构体声明顺序，比 map 稳定；数值类型要提前定好，int 与 float64 混用会让下游解析出错。',
                  'Marshal 也会失败（字段里有不支持的类型或 NaN），错误必须处理。写文件时先写临时文件再改名，避免中途失败留下半个文件。'
                ],
                code: { lang: 'go', src: 'type Report struct {\n    File   string `json:"file"`\n    Errors int    `json:"errors"`\n    Slow   int    `json:"slow"`\n}\n\ndata, err := json.MarshalIndent(rep, "", "  ")\nif err != nil {\n    return err\n}\nfmt.Println(string(data))', runnable: false },
                note: 'JSON 输出是对外契约。字段名一旦发布，就别随手改。'
              },
              {
                h: '6. 错误处理、优雅退出与上线之后',
                p: [
                  'main 里最干净的结构是一个 run() error：所有失败往上返回，main 只负责打印并以非零码退出。想立刻结束进程才用 log.Fatal，而且只在 main 里用。',
                  '服务要能被优雅停止：signal.NotifyContext 收到 SIGINT / SIGTERM 后取消 context，让 http.Server.Shutdown 等在途请求结束，再关数据库连接。',
                  '上线不等于结束：结构化日志、健康检查、关键指标（错误率、延迟分位）三件套缺一不可。日志里带上请求 ID，出问题时才能把一条链路串起来。',
                  '到这里，Go 的三件事都齐了：错误让失败可见，并发让吞吐上来，包与测试让改动可控。星港不是一次建成的，它是一班一班航线飞出来的。'
                ],
                code: { lang: 'go', src: 'func run() error {\n    if err := scan(); err != nil {\n        return fmt.Errorf("扫描日志: %w", err)\n    }\n    return nil\n}\n\nfunc main() {\n    if err := run(); err != nil {\n        fmt.Fprintln(os.Stderr, err)\n        os.Exit(1)\n    }\n}', runnable: false },
                note: '终战的两道题就是这条流水线的第一步：先把错误数清，再找出真正慢的那几条。'
              }
            ],
            terms: [
              { t: '入口目录', en: 'cmd', d: '存放各可执行程序 main 包的目录，一服务一子目录。' },
              { t: '内部实现', en: 'internal', d: '只允许父目录子树导入的包，用来放不对外暴露的实现。' },
              { t: '命令行参数', en: 'flag', d: '标准库的参数解析工具，支持默认值、类型与帮助文本。' },
              { t: '行扫描器', en: 'bufio.Scanner', d: '按行读取输入的工具，需检查 Err 并注意单行长度上限。' },
              { t: '聚合', en: 'aggregation', d: '把多行明细压缩成计数、总和、极值等汇总指标。' },
              { t: 'JSON 标签', en: 'struct tag', d: '写在字段后面的元信息，决定序列化后的键名。' },
              { t: '优雅退出', en: 'graceful shutdown', d: '收到信号后停止接收新请求，等待在途任务结束再退出。' },
              { t: '上下文取消', en: 'context', d: '在调用链上传递截止时间与取消信号的机制。' }
            ],
            exam: '面试常问：main 应该有多薄、flag 与 os.Args 的取舍、Scanner 为什么必须检查 Err、map 遍历为什么无序、JSON 字段标签的作用、如何优雅退出一个 HTTP 服务、上线后盯哪些指标、退出码 0/1/2 的区别。',
            checklist: [
              '能按 cmd / internal / pkg 规划目录并说清职责',
              '会用 flag 定义参数并处理默认值',
              '知道 Scanner 的 Err 与单行上限问题',
              '能用 map 聚合并按固定顺序输出',
              '能写出 run() error 式的程序入口与优雅退出'
            ]
          }
        },
        {
          id: 'go-12-3', type: 'battle', title: '终战 · 虚空织网者', jp: '終戦・虚空の織り手', xp: 160,
          enemy: {
            name: '虚空织网者·终焉', kind: 'dragon', hp: 100, boss: true,
            title: '首领 · 源核织网者', taunt: '你们写的每一行，都会变成我网上的一个结。',
            lore: '它把星港三百年来的日志织成一张网，每个结都是一条被忽略的错误、一次没被发现的慢请求。数清它们，网才会松开。'
          },
          brief: '终战分两段。先把六行日志里的错误数清；再从七次请求里找出真正慢的那些。两段完成，源核星港重新开港。',
          tasks: [
            {
              prompt: '第一击：给定 logs := []string{"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"}; 用循环统计字符串 "ERROR" 出现的次数，并输出「错误数=…」。',
              requirement: '预期输出：错误数=3',
              expected: '错误数=3',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    logs := []string{"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"}\n    count := 0\n    // 遍历 logs，数出 ERROR 的条数\n    fmt.Printf("错误数=%d\\n", count)\n}\n',
              hints: [
                '用 for _, l := range logs 逐行遍历。',
                '判断写成 if l == "ERROR"，相等时让 count 加一。',
                '输出用 fmt.Printf("错误数=%d\\n", count)，不要手动改数字。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    logs := []string{"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"}\n    count := 0\n    for _, l := range logs {\n        if l == "ERROR" {\n            count++\n        }\n    }\n    fmt.Printf("错误数=%d\\n", count)\n}',
              must: { re: 'for\\s', text: '必须使用 for 循环统计' }
            },
            {
              prompt: '第二击：给定 latency := []int{120, 340, 80, 510, 220, 90, 410}; 用循环统计大于 200 的请求个数，并输出「慢请求=…」。',
              requirement: '预期输出：慢请求=4',
              expected: '慢请求=4',
              starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    latency := []int{120, 340, 80, 510, 220, 90, 410}\n    slow := 0\n    // 遍历 latency，统计大于 200 的次数\n    fmt.Printf("慢请求=%d\\n", slow)\n}\n',
              hints: [
                '用 for _, v := range latency 遍历每一次请求的耗时。',
                '判断写成 if v > 200，满足时让 slow 加一。',
                '输出用 fmt.Printf("慢请求=%d\\n", slow)，注意是大于 200，不含 200。'
              ],
              solution: 'package main\n\nimport "fmt"\n\nfunc main() {\n    latency := []int{120, 340, 80, 510, 220, 90, 410}\n    slow := 0\n    for _, v := range latency {\n        if v > 200 {\n            slow++\n        }\n    }\n    fmt.Printf("慢请求=%d\\n", slow)\n}',
              must: { re: 'if\\s', text: '必须使用 if 判断阈值' }
            }
          ],
          outro: '错误数停在 3，慢请求停在 4。织网者的结一个接一个松开，源核星港的灯从底层亮到塔顶。零说：「卷一你学会了让灯塔说话，卷二你学会了让系统说得清楚。」岚把短枪背回肩上：「下一卷，换一片海。」',
          loot: LS.makeLoot('mythic', '源核航线图', 'weapon', '✵', '图上的每条航线都标着两样东西：可能失败的地方，以及失败之后该从哪里查起。', 'go')
        }
      ]
    }
    );
  }

  const goLang = LS.lang('go');
  if (goLang) {
    applyGoVolumeTwoB(goLang);
  } else if (typeof LS.registerLanguage === 'function') {
    // 本文件可能先于 go.js 载入：等 Go 注册完成后再挂载第二卷后半
    const register = LS.registerLanguage;
    LS.registerLanguage = function (def) {
      register.call(LS, def);
      if (def && def.id === 'go') applyGoVolumeTwoB(LS.lang('go'));
    };
  }
})(window.LS);
