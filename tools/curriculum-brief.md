# 第二卷课程扩写规范（内部工具文档）

目标：为六门语言各新增 8 章，使每门语言达到 12 章、36 个节点。新章节位于现有第一卷之后，按“第二卷 · 源核之下”组织。每章固定 3 个节点：剧情 → 课程 → 战斗。内容要像一本从零到实战的编程教材目录，而不仅是术语摘要。

## 文件与接入

- 每门语言只新建一个文件：`js/data/<语言id>-ext.js`，不得修改其他文件。
- 文件结构：

```js
(function (LS) {
  'use strict';
  const lang = LS.lang('python'); // 改成对应语言 id

  // 把第一卷第四章标记为卷一终章，避免出现两个“终章”
  const vol1 = lang.chapters[3];
  vol1.title = vol1.title.replace('第四章', '第四章（卷一终章）');
  vol1.nodes[vol1.nodes.length - 1].title = '卷一终战 · ' + vol1.nodes[vol1.nodes.length - 1].title.replace(/^终战\s*·\s*/, '');

  lang.chapters.push(
    // 8 个章节对象
  );
})(window.LS);
```

- 章节 id：`<prefix>-5` 到 `<prefix>-12`；节点 id：`<prefix>-5-1`、`<prefix>-5-2`、`<prefix>-5-3`，依此类推。
- 每章第一个节点 `type:'story'`，第二个 `type:'lesson'`，第三个 `type:'battle'`。
- 数值：story xp 20；lesson xp 40、minutes 18–30；普通 battle xp 80；第 12 章终战 xp 160。
- 第 12 章终战 `enemy.boss = true`，必须有两个 task；其余战斗一个 task 即可。
- 战利品用 `LS.makeLoot(quality, name, slot, icon, lore, langId)`。第 5–8 章 `'rare'`，第 9–11 章 `'epic'`，第 12 章 `'mythic'`；slot 只能是 `'weapon' | 'armor' | 'relic'`。

## 内容深度

每个 lesson 的 `article`：

- `lead`：2–3 句，说明本章解决什么问题、与实战的关系。
- `sections`：5–6 节。每节有 `h`、`p`（1–3 段，讲清概念、语法、执行步骤、常见错误），并至少一半小节带 `code` 示例；可加 `list` 与 `note`。
- `code` 结构：`{ lang:'python', src:'...' }`。若示例包含教学终端不支持的语法（类、文件、网络、async、第三方库等），必须写 `runnable:false`，页面会显示“概念示例”并隐藏运行按钮。
- `terms`：5–8 条，必须包含中文名、英文名和一句解释。
- `exam`：一段考试/面试导向的提醒。
- `checklist`：4–5 条可自测的能力点。
- 课程正文要解释“为什么”和“怎么一步步写”，不能只列语法表。代码示例要能独立说明一个知识点。

story：

- 4–5 句对白，`{ who, tone, text }`，tone 用 `'guide' | 'ally' | 'enemy'`。
- 复用原语言角色与世界观；第二卷的冲突来自“源核之下”的旧系统、失控服务、被遗忘的工程债务等。每章剧情要自然引出本章知识点，不要只是打怪。

battle：

- 敌人 `kind` 只能是：`slime`、`wolf`、`wraith`、`dragon`、`golem`、`construct`、`drone`、`glitch`。
- 每个 task 必须包含：`prompt`、`requirement`、`expected`、`starter`、`hints`（3 条，从思路到接近答案）、`solution`、`must:{re,text}`。
- `expected` 是终端精确输出，多行用 `\n`。`solution` 必须真实运行通过、输出与 expected 完全一致（忽略行尾空格与末尾空行）。
- 战斗题只考该章能用教学终端运行的核心逻辑。高级章节（OOP、文件、并发、工程化）可以考与本章主题相关的数据/算法练习；不要在 solution 中使用终端不支持的语法。
- 敌人、brief、outro 要与本章知识点的隐喻一致。

## MicroRun 战斗题语法白名单

只允许在 `solution` 中使用下列范围内的语法；不确定时先跑 `node tools/verify-curriculum.js`。

### Python
`print`、变量、整数/浮点/字符串/布尔、算术与比较、`if/elif/else`、`for x in range(...)`、`while`、`break/continue`、`def`/`return`、列表字面量/索引/切片/`append`/`len`/`sum`、字典字面量与 `d["键"]`、字符串 `upper/lower/strip`。不支持 f-string、列表推导式、类、`import`、文件、异常捕获、`dict.items()`。

### Java
必须写完整的 `public class Main { public static void main(String[] args) { ... } }`。支持 `System.out.println/print`、变量与类型、算术/比较/逻辑、`if/else`、`for`、`while`、`break/continue`、数组、字符串拼接、`String.length/equals`（`equals` 会转成 `===`）。不支持自定义类、集合框架、文件、异常。

### C
必须写 `#include <stdio.h>` 与 `int main(void) { ... return 0; }`。支持 `printf`、变量、算术、`if/else`、`for`、`while`、数组、字符串字面量。不要用 `scanf`、`malloc`、指针解引用、结构体、文件。

### C++
必须写 `#include <iostream>` 与 `int main() { ... return 0; }`。支持 `std::cout << ... << "\n";`、变量、算术、`if/else`、`for`、范围 for、数组、`std::vector` 字面量、`std::string` 基础。不要用类、模板、智能指针、文件、STL 算法。

### JavaScript
支持 `console.log`、`let/const`、算术、`if/else`、`for`、`while`、数组、字符串、函数、`map/filter/reduce`（若不确定先测试）。不要用 DOM、`fetch`、`async/await`、类、模块导入。

### Go
必须写 `package main`、`import "fmt"`、`func main() { ... }`。支持 `fmt.Println/Printf`、`:=`、变量、算术、`if`、`for`、`range`、切片字面量、`len`、`map` 字面量。不要用 goroutine、channel、struct、interface、文件、error 处理。

## 故事与文风

- 中文正文，日系异世界 + 星海古籍气质；技术解释要清楚、克制，不堆砌辞藻。
- 每章标题用“第X章 · 四字/意象标题”，`jp` 用日文假名/汉字短语，`subtitle` 一句人话，`summary` 一句内容概括。
- 角色沿用原文件：Python 奈芙/界灵·零，Java 艾莉丝/界灵·零，C 等按原文件。第二卷可增加一位“维护者/旧系统人格”，但不要抢主角戏。
- 不抄袭现实教材原文；用自己的话讲。

## 验收

在项目根目录运行：

```bash
node tools/verify-curriculum.js
```

必须输出“全部课程数据与参考答案检查通过”。如果某个战斗题失败，改到通过为止。
