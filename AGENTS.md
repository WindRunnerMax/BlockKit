# ResumeBuilder Agents

## 项目结构

### 编辑器组

- packages/core: 控制器层，管理选区同步、历史记录、增量更新、半受控输入、剪贴板等模块
- packages/delta: 数据模型层，实现内容与属性的 compose/invert/diff/transform 等操作
- packages/react: React 视图层，联结控制器层，提供单元组件、幂等渲染、插件扩展机制等
- packages/plugin: 内置插件的实现，提供常用预设插件、各类型组件示例等
- packages/vue: Vue 视图层，与 React 视图层结构功能一致
- packages/utils: 通用工具模块，涵盖 DOM、集合操作、类型判断、事件管理、链接处理等

### 块编辑器组

- blocks/x-core: 编辑器控制器层，管理块状态、焦点、选区、历史、输入、增量更新等模块
- packages/ot-json: OT-JSON 协同算法，支持 Object/Array/Text 等及自定义子类型
- blocks/x-json: 数据模型层，以扁平结构存储块及其层级关系，基于 ot-json 管理数据类型
- blocks/x-react: React 视图层，提供块渲染组件、组件预设、插件扩展机制等
- blocks/x-plugin: 块级编辑器的内置插件实现，提供常用预设插件、各类型组件示例等

### 编辑器示例组

- examples/website: 主示例站，演示 React/Vue 的编辑器与块结构编辑器效果
- packages/tools: 示例工具，提供 Word、PDF、Markdown 等导出依赖
- examples/common: 独立的 HTML/TS 脚本调试示例
- examples/variable: 轻量级富文本输入框，支持变量插值、下拉选择框、类型标签等
- examples/stream: Markdown 流式增量渲染算法，顶层块归档 + 尾部块 diff 压缩

## 项目架构

- 项目间类型，依赖根目录的 tsconfig path alias
- 项目编译，依赖 rspack 的 resolve.alias 实现，无需提前编译包
- 编辑器是完全非受控管理的，任意变更都应该由控制器层构造 ops 实现变更
- 编辑器 schema 定义了数据类型的表现，开发插件需要参考同类型插件实现
- 控制器层模块，可基于继承扩展其行为，Bind 的方法同样可以通过装饰器在子类重写

## 依赖管理

- 避免使用 ^/~ 版本范围，需要具体指定绝对版本号
- 尽可能复用已有的依赖及其版本号，避免引入新的依赖
- 修改项目依赖后，需要重新执行 `pnpm install` 来更新 lock 文件

## 代码规范

- plan 文件放在 .plans 目录下，且变更要同步回写到 plan 文件
- 函数、重要变量、类等符号要加入注释，以 `/** */` 块注释形式表示

## 注意事项

- 踩坑记录可参考 NOTE.md，注意其内容较多，架构调整前考虑阅读相关章节
- 不要开启子 agent（Agent/Task 工具），所有任务由主 agent 直接完成
- 使用浏览器 CDP 通信时，优先复用系统已安装的 Chrome 浏览器，以 headless 模式运行
  - 若是创建了调试脚本，放在 /tmp 目录下，不需要主动删除
- 不要随意 commit / push 到远程仓库，只有在明确指令下才执行
