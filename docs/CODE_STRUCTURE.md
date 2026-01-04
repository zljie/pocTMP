# 代码结构与模块放置规范

## 目标
- 明确各目录的职责与适用场景
- 统一新增页面、组件、类型、接口封装的放置位置
- 保持与现有技术栈和约定一致，降低维护成本

## 技术栈与约定
- 框架: Next.js 15（App Router）
- 语言: TypeScript
- UI: Ant Design 5，结合 @ant-design/nextjs-registry
- 样式: TailwindCSS 4（PostCSS 插件）
- 图表: ECharts（echarts-for-react）
- 路径别名: `@/* -> ./src/*`（见 tsconfig paths）
- 构建: `output: 'export'`（静态导出）

## 顶层目录
- `src/app`: 页面与布局（App Router）
  - 每个一级路由一个目录，例如：
    - `/` -> `src/app/page.tsx`
    - `/test-cases` -> `src/app/test-cases/page.tsx`
    - `/test-requirements` -> `src/app/test-requirements/page.tsx`
    - `/test-plans` -> `src/app/test-plans/page.tsx`
    - 新增菜单对应的页面，按上述规则建目录与 `page.tsx`
  - 根布局与全局样式：
    - `src/app/layout.tsx` 放置 Antd 的 ConfigProvider、语言、主题等
    - `src/app/globals.css` 放置全局样式（含 Tailwind @utility）

- `src/components`: 可复用的 UI 组件
  - `src/components/layout/MainLayout.tsx` 主布局（侧边栏导航、头部、内容区）
  - 新增通用组件按功能分子目录（如 `form`, `table`, `charts`），组件命名以功能为主
  - 页面专属的小组件建议放在页面目录的 `components/*` 下，避免污染全局

- `src/types`: 领域模型与通用类型
  - 现有类型：`TestCase`, `TestRequirement`, `TestPlan`, `Pagination`
  - 新增领域对象（如 `TestExecution`, `TestReport`）在此定义，按文件拆分或集中导出

- `src/lib`: 工具库与接口封装
  - `src/lib/api.ts` 已封装 `request` 与三类资源 API
  - 新增模块的 API（如执行、报告、任务）在此扩展对象，保持统一风格
  - 其他通用工具（如日期、格式化、校验）按需新增 `lib/*`

- `src/mock`: 本地演示数据
  - `src/mock/data.ts` 存放演示数据与菜单配置
  - 页面在接入真实后端后，逐步替换为 `src/lib/api.ts` 的方法

- `public`: 静态资源
  - 图标、静态图片、JSON 静态文件等

- `docs`: 项目文档
  - 对接后端指南：`docs/API_INTEGRATION_GUIDE.md`
  - 代码结构规范：`docs/CODE_STRUCTURE.md`（本文件）

## 模块放置指南
- 页面（路由）
  - 在 `src/app/<route>/page.tsx` 创建
  - 页面标题与导航文案保持一致
  - 页面内部优先使用可复用组件，减少重复

- 组件
  - 全局可复用组件 -> `src/components/*`
  - 页面局部组件 -> `src/app/<route>/components/*`

- 类型与模型
  - 在 `src/types/*` 定义并集中导出
  - 字段命名与后端返回结构保持一致，必要时在 `lib` 中做转换

- 接口与工具
  - 统一使用 `src/lib/api.ts` 的 `request` 方法
  - 各资源的 CRUD 方法按对象分组（如 `testCaseApi`, `testPlanApi`）
  - 环境变量：在 `.env.local` 设置 `NEXT_PUBLIC_API_URL`

- 演示数据
  - 在 `src/mock/data.ts` 管理
  - 接入真实接口后逐步移除或保留为开发示例

## 命名与风格
- 文件命名：`PascalCase` 用于组件，路由目录使用短横线分隔小写（如 `test-cases`）
- 组件命名：以职责为主，如 `CaseTable`, `PlanStatusTag`
- 类型命名：领域名 + 类型，如 `TestCase`, `TestPlan`
- API 方法：语义化动词，如 `getList`, `getById`, `create`, `update`, `delete`

## 新增菜单对应的页面示例
以“测试执行管理”为例：
- 路由与页面：`src/app/test-execution/page.tsx`
- 局部组件：`src/app/test-execution/components/ExecutionTable.tsx`
- 类型：`src/types/test-execution.ts`（定义执行记录、状态枚举等）
- API：在 `src/lib/api.ts` 扩展 `testExecutionApi`（列表、详情、触发执行、停止等）

## 开发与运行
- 安装依赖：`pnpm install`
- 开发启动：`pnpm dev`，访问 `http://localhost:3000`
- 生产构建：`pnpm build`（静态导出到 `out/`）
- 接入后端：
  - `.env.local` 配置 `NEXT_PUBLIC_API_URL=http://your-api`
  - 页面替换 `src/mock/data.ts` 为 `src/lib/api.ts` 的方法

## 参考文件
- 配置: [`next.config.js`](file:///Users/johnson_mac/code/test-management-platform/next.config.js)、[`tsconfig.json`](file:///Users/johnson_mac/code/test-management-platform/tsconfig.json)
- 布局: [`layout.tsx`](file:///Users/johnson_mac/code/test-management-platform/src/app/layout.tsx)、[`MainLayout.tsx`](file:///Users/johnson_mac/code/test-management-platform/src/components/layout/MainLayout.tsx)
- 页面示例: [`page.tsx`](file:///Users/johnson_mac/code/test-management-platform/src/app/page.tsx)
- 类型: [`src/types/index.ts`](file:///Users/johnson_mac/code/test-management-platform/src/types/index.ts)
- 接口封装: [`src/lib/api.ts`](file:///Users/johnson_mac/code/test-management-platform/src/lib/api.ts)
- 演示数据: [`src/mock/data.ts`](file:///Users/johnson_mac/code/test-management-platform/src/mock/data.ts)

