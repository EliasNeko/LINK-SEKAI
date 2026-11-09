/* 证书支线：原创 NCRE 风格题库（非官方真题） */
(function (LS) {
  'use strict';

  LS.EXAMS = [
    {
      id: 'ncre2-python',
      level: '二级',
      name: 'Python 程序设计',
      jp: 'パイソン検定',
      langId: 'python',
      sigil: '蟒',
      color: '#4f9f8f',
      desc: '覆盖语法、数据类型、流程控制、函数与文件的基础认证。题目为原创 NCRE 风格，不收录官方真题。',
      unlock: { lang: 'python', pct: 30 },
      passScore: 60,
      minutes: 30,
      questions: [
        {
          type: 'choice', score: 10,
          q: '以下哪个不是 Python 的合法变量名？',
          options: ['_name', 'score2', '2score', 'user_id'], answer: 2,
          explain: '标识符不能以数字开头，因此 2score 非法。'
        },
        {
          type: 'choice', score: 10,
          q: '表达式 7 // 2 的结果是？',
          options: ['3.5', '3', '4', '1'], answer: 1,
          explain: '// 是整除，7 // 2 得到 3，舍去小数部分。'
        },
        {
          type: 'choice', score: 10,
          q: '执行 s = "Link"; s = s + "-Sekai" 后，s 的值是？',
          options: ['Link', 'Link-Sekai', 'LinkSekai', '报错'], answer: 1,
          explain: '字符串可以用 + 拼接，并重新绑定给 s。'
        },
        {
          type: 'choice', score: 10,
          q: '关于列表和元组，下列说法正确的是？',
          options: ['列表用圆括号，元组用方括号', '列表可变，元组不可变', '两者都不允许重复元素', '元组不能进行索引访问'], answer: 1,
          explain: '列表可变，元组创建后不能修改元素；两者都支持索引与重复元素。'
        },
        {
          type: 'choice', score: 10,
          q: 'range(1, 5) 生成的整数序列是？',
          options: ['1,2,3,4,5', '1,2,3,4', '0,1,2,3,4', '2,3,4,5'], answer: 1,
          explain: 'range 的区间是左闭右开，包含 1 到 4。'
        },
        {
          type: 'code', score: 25, lang: 'python',
          prompt: '编程题：用循环计算 1 到 10 中所有偶数的和并输出。必须使用循环与条件判断。',
          expected: '30',
          starter: 'total = 0\n# 遍历 1 到 10，累加偶数\n',
          must: { re: '(for|while)\\s', text: '必须使用循环' },
          hints: ['用 range(1, 11) 覆盖 1 到 10。', '判断 i % 2 == 0。', '满足条件时 total += i，最后 print(total)。'],
          solution: 'total = 0\nfor i in range(1, 11):\n    if i % 2 == 0:\n        total += i\nprint(total)'
        },
        {
          type: 'code', score: 25, lang: 'python',
          prompt: '编程题：给定 words = ["code", "link", "sekai"]，用循环逐行输出每个单词的大写形式。',
          expected: 'CODE\nLINK\nSEKAI',
          starter: 'words = ["code", "link", "sekai"]\n# 逐行输出大写形式\n',
          must: { re: '(for|while)\\s', text: '必须使用循环' },
          hints: ['遍历 words。', '字符串的 upper() 方法返回大写形式。', '每次循环调用 print(word.upper())。'],
          solution: 'words = ["code", "link", "sekai"]\nfor word in words:\n    print(word.upper())'
        }
      ]
    },
    {
      id: 'ncre2-java',
      level: '二级',
      name: 'Java 程序设计',
      jp: 'ジャバ検定',
      langId: 'java',
      sigil: '杯',
      color: '#8a6fb8',
      desc: '覆盖 JVM、类型、流程控制、方法与面向对象基础。原创 NCRE 风格题库。',
      unlock: { lang: 'java', pct: 30 },
      passScore: 60,
      minutes: 30,
      questions: [
        {
          type: 'choice', score: 10,
          q: 'Java 中 main 方法的正确签名是？',
          options: ['public void main(String args)', 'public static void main(String[] args)', 'static main(String[] args)', 'public static main()'], answer: 1,
          explain: '入口方法必须是 public static void，参数为 String 数组。'
        },
        {
          type: 'choice', score: 10,
          q: '以下哪个是 Java 的基本数据类型？',
          options: ['String', 'Integer', 'int', 'ArrayList'], answer: 2,
          explain: 'String、Integer、ArrayList 都是引用类型，int 是基本类型。'
        },
        {
          type: 'choice', score: 10,
          q: '表达式 10 / 3 在 Java 中的结果是？',
          options: ['3.33', '3', '4', '编译错误'], answer: 1,
          explain: '两个 int 相除执行整数除法，结果为 3。'
        },
        {
          type: 'choice', score: 10,
          q: '关于 == 与 equals，下列说法正确的是？',
          options: ['两者完全等价', '== 比较引用，equals 默认比较内容', '== 比较基本类型的值；对于对象通常比较引用', 'equals 只能用于数字'], answer: 2,
          explain: '基本类型用 == 比较值；对象用 == 比较引用，内容比较通常重写 equals。'
        },
        {
          type: 'choice', score: 10,
          q: '子类构造器中调用父类构造器应使用？',
          options: ['this()', 'super()', 'base()', 'parent()'], answer: 1,
          explain: 'super() 调用父类构造器，且必须位于子类构造器的第一行。'
        },
        {
          type: 'code', score: 25, lang: 'java',
          prompt: '编程题：用循环计算 1 到 10 的总和并输出。必须出现循环结构。',
          expected: '55',
          starter: 'public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        // 循环累加 1 到 10\n    }\n}\n',
          must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' },
          hints: ['for (int i = 1; i <= 10; i++)。', '循环体内 total += i;。', '循环结束后 System.out.println(total);。'],
          solution: 'public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        for (int i = 1; i <= 10; i++) {\n            total += i;\n        }\n        System.out.println(total);\n    }\n}'
        },
        {
          type: 'code', score: 25, lang: 'java',
          prompt: '编程题：用循环输出三行，分别是 Level-1、Level-2、Level-3。字符串必须由拼接生成。',
          expected: 'Level-1\nLevel-2\nLevel-3',
          starter: 'public class Main {\n    public static void main(String[] args) {\n        // 用循环生成三行\n    }\n}\n',
          must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' },
          hints: ['循环变量 i 从 1 到 3。', '用 "Level-" + i 拼接。', '每轮 System.out.println(...)。'],
          solution: 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 3; i++) {\n            System.out.println("Level-" + i);\n        }\n    }\n}'
        }
      ]
    },
    {
      id: 'ncre2-c',
      level: '二级',
      name: 'C 语言程序设计',
      jp: 'シー検定',
      langId: 'c',
      sigil: '泉',
      color: '#6f9c78',
      desc: '覆盖编译、printf、类型、流程控制、数组与函数。原创 NCRE 风格题库。',
      unlock: { lang: 'c', pct: 30 },
      passScore: 60,
      minutes: 30,
      questions: [
        {
          type: 'choice', score: 10,
          q: 'C 程序中，执行开始于哪个函数？',
          options: ['start', 'main', 'init', 'run'], answer: 1,
          explain: 'main 是 C 程序的标准入口。'
        },
        {
          type: 'choice', score: 10,
          q: 'printf("%d", 3.9) 的行为是？',
          options: ['输出 3.9', '输出 3', '输出 4', '行为未定义/结果不可靠'], answer: 3,
          explain: '%d 需要 int 类型参数，传入 double 属于类型不匹配，结果不可靠。'
        },
        {
          type: 'choice', score: 10,
          q: 'int a[5]; 的合法下标范围是？',
          options: ['1 到 5', '0 到 5', '0 到 4', '1 到 4'], answer: 2,
          explain: '数组下标从 0 开始，长度 5 的数组最后一个下标是 4。'
        },
        {
          type: 'choice', score: 10,
          q: '以下哪个运算符用于取变量地址？',
          options: ['*', '&', '%', '->'], answer: 1,
          explain: '& 是取地址运算符，* 是解引用运算符。'
        },
        {
          type: 'choice', score: 10,
          q: 'C 语言中，表达式 5 / 2 的结果是？',
          options: ['2.5', '2', '3', '0'], answer: 1,
          explain: '两个整数相除执行整数除法，结果为 2。'
        },
        {
          type: 'code', score: 25, lang: 'c',
          prompt: '编程题：用循环计算 1 到 10 的总和并输出。必须使用循环。',
          expected: '55',
          starter: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    // 循环累加 1 到 10\n    return 0;\n}\n',
          must: { re: '(for|while)\\s*\\(', text: '必须使用循环结构' },
          hints: ['for (int i = 1; i <= 10; i++)。', '循环体 total += i;。', '最后 printf("%d\\n", total);。'],
          solution: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    for (int i = 1; i <= 10; i++) {\n        total += i;\n    }\n    printf("%d\\n", total);\n    return 0;\n}'
        },
        {
          type: 'code', score: 25, lang: 'c',
          prompt: '编程题：用 printf 输出两行：第一行 CERT，第二行 2026。',
          expected: 'CERT\n2026',
          starter: '#include <stdio.h>\n\nint main(void) {\n    // 输出两行\n    return 0;\n}\n',
          must: { re: 'printf\\s*\\(', text: '必须使用 printf 输出' },
          hints: ['用一条 printf 输出两行，字符串中包含 \\n。', '格式字符串可写 "CERT\\n2026\\n"。', '语句以分号结束。'],
          solution: '#include <stdio.h>\n\nint main(void) {\n    printf("CERT\\n2026\\n");\n    return 0;\n}'
        }
      ]
    },
    {
      id: 'ncre3-db',
      level: '三级',
      name: '数据库技术',
      jp: 'データベース技術',
      langId: null,
      sigil: '库',
      color: '#5f83a8',
      desc: '覆盖关系模型、SQL、范式、事务与索引。原创 NCRE 风格理论题库，不涉及真实数据库连接。',
      unlock: { level: 4 },
      passScore: 60,
      minutes: 25,
      questions: [
        {
          type: 'choice', score: 10,
          q: '关系数据库中，用于唯一标识一行记录的是？',
          options: ['外键', '主键', '索引', '视图'], answer: 1,
          explain: '主键唯一标识表中的一行，且不能为 NULL。'
        },
        {
          type: 'choice', score: 10,
          q: 'SQL 中用于筛选分组结果的关键字是？',
          options: ['WHERE', 'HAVING', 'ORDER BY', 'GROUP'], answer: 1,
          explain: 'WHERE 过滤行，HAVING 过滤分组后的结果。'
        },
        {
          type: 'choice', score: 10,
          q: '事务的 ACID 中，A 表示？',
          options: ['原子性', '一致性', '隔离性', '持久性'], answer: 0,
          explain: 'ACID 分别是原子性、一致性、隔离性、持久性。'
        },
        {
          type: 'choice', score: 10,
          q: '第三范式（3NF）主要要求消除？',
          options: ['重复行', '非主属性对主键的传递依赖', '所有外键', '所有索引'], answer: 1,
          explain: '3NF 在 2NF 基础上消除非主属性对主键的传递函数依赖。'
        },
        {
          type: 'choice', score: 10,
          q: '下列哪种连接会返回左表全部行？',
          options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], answer: 1,
          explain: 'LEFT JOIN 保留左表所有行，右表无匹配时以 NULL 填充。'
        },
        {
          type: 'choice', score: 10,
          q: '为经常用于查询条件的列建立索引，主要目的是？',
          options: ['节省磁盘空间', '加快查询速度', '保证数据唯一', '自动备份数据'], answer: 1,
          explain: '索引以额外空间换取更快的检索，但会增加写入维护成本。'
        },
        {
          type: 'choice', score: 10,
          q: 'SQL 中删除表结构及数据的语句是？',
          options: ['DELETE FROM', 'TRUNCATE TABLE', 'DROP TABLE', 'REMOVE TABLE'], answer: 2,
          explain: 'DROP TABLE 删除整张表；DELETE 与 TRUNCATE 只清数据。'
        },
        {
          type: 'choice', score: 10,
          q: '视图（View）的本质是？',
          options: ['一份物理复制的数据', '一条保存的查询定义', '一种索引', '一种事务日志'], answer: 1,
          explain: '视图是虚拟表，保存查询定义，数据仍来自基表。'
        },
        {
          type: 'choice', score: 10,
          q: '以下哪个聚合函数用于求平均值？',
          options: ['SUM', 'COUNT', 'AVG', 'MAX'], answer: 2,
          explain: 'AVG 计算平均值，SUM 求和，COUNT 计数，MAX 求最大值。'
        },
        {
          type: 'choice', score: 10,
          q: '数据库设计中，E-R 图主要用于描述？',
          options: ['程序流程', '实体及其联系', '内存布局', '网络拓扑'], answer: 1,
          explain: 'E-R 图描述实体、属性与实体之间的联系，是概念设计工具。'
        }
      ]
    },
    {
      id: 'ncre4-test',
      level: '四级',
      name: '软件测试工程师',
      jp: 'ソフトウェアテスト',
      langId: null,
      sigil: '证',
      color: '#a06a6a',
      desc: '覆盖测试模型、黑盒白盒、用例设计、缺陷管理与质量度量。原创 NCRE 风格理论题库。',
      unlock: { level: 8 },
      passScore: 60,
      minutes: 25,
      questions: [
        {
          type: 'choice', score: 10,
          q: '白盒测试主要关注？',
          options: ['程序内部逻辑结构', '用户界面美观', '市场需求', '部署成本'], answer: 0,
          explain: '白盒测试基于代码内部结构设计用例，如语句覆盖、分支覆盖。'
        },
        {
          type: 'choice', score: 10,
          q: '边界值分析属于哪类方法？',
          options: ['白盒测试', '黑盒测试', '性能测试', '安全测试'], answer: 1,
          explain: '边界值分析基于输入域边界，不依赖内部代码，属于黑盒方法。'
        },
        {
          type: 'choice', score: 10,
          q: '下列哪项不是软件缺陷的生命周期状态？',
          options: ['新建', '已修复', '已关闭', '已编译'], answer: 3,
          explain: '“已编译”不是缺陷状态，常见状态包括新建、指派、修复、验证、关闭。'
        },
        {
          type: 'choice', score: 10,
          q: '单元测试通常由谁主导？',
          options: ['最终用户', '开发人员', '市场人员', '运维外包'], answer: 1,
          explain: '单元测试针对最小可测单元，通常由开发人员在编码阶段完成。'
        },
        {
          type: 'choice', score: 10,
          q: '等价类划分中，对每个无效等价类通常应？',
          options: ['忽略', '至少设计一个用例', '只测一次有效类', '合并到有效类'], answer: 1,
          explain: '每个无效等价类都应至少有一个用例覆盖，以验证错误处理。'
        },
        {
          type: 'choice', score: 10,
          q: '回归测试的主要目的是？',
          options: ['证明没有缺陷', '确认修改未破坏原有功能', '提升运行速度', '替代验收测试'], answer: 1,
          explain: '回归测试验证修改后既有功能仍然正常。'
        },
        {
          type: 'choice', score: 10,
          q: '语句覆盖要求？',
          options: ['每条语句至少执行一次', '每个分支至少执行一次', '每个条件取真和假', '所有路径都执行'], answer: 0,
          explain: '语句覆盖是最基本的白盒覆盖标准，要求每条可执行语句至少执行一次。'
        },
        {
          type: 'choice', score: 10,
          q: '缺陷严重程度通常不包括下列哪一项？',
          options: ['致命', '严重', '一般', '好看'], answer: 3,
          explain: '严重程度常用致命、严重、一般、轻微等等级；“好看”不是缺陷等级。'
        },
        {
          type: 'choice', score: 10,
          q: '验收测试主要由谁参与？',
          options: ['开发人员单独完成', '用户或客户参与', '仅测试经理', '仅数据库管理员'], answer: 1,
          explain: '验收测试确认系统是否满足业务需求，通常由用户或客户参与。'
        },
        {
          type: 'choice', score: 10,
          q: '性能测试中，TPS 通常表示？',
          options: ['每秒事务数', '每页样式数', '测试通过率', '总进程数'], answer: 0,
          explain: 'TPS 是 Transactions Per Second，每秒处理的事务数。'
        }
      ]
    }
  ];

  LS.EXAM_MAP = {};
  LS.EXAMS.forEach(e => { LS.EXAM_MAP[e.id] = e; });

  LS.examById = function (id) { return LS.EXAM_MAP[id] || null; };

  LS.examLockReason = function (user, exam) {
    if (!user || !exam) return '无法读取旅人档案。';
    const u = exam.unlock || {};
    if (u.lang && u.pct) {
      const pct = LS.progressPct(user, u.lang);
      if (pct < u.pct) {
        const l = LS.lang(u.lang);
        return `需要 ${l ? l.name : u.lang} 学习进度达到 ${u.pct}%（当前 ${pct}%）。`;
      }
    }
    if (u.level) {
      const lv = LS.levelFromXp(user.xp || 0).level;
      if (lv < u.level) return `需要旅人等级达到 Lv.${u.level}（当前 Lv.${lv}）。`;
    }
    return '';
  };
})(window.LS);
