---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502200b45c2c23c4fd8f54b2b843fc03c4422bb16d459fdb9adbda366d48d7fe80043022100f2d007da47caeb774bd73bdac89cea5e3739eedc9c5726554a9dcfb4fc2a07ef
    ReservedCode2: 304402202c2cae1933f64025f9b4ef7117eb96fdf64c9427bd5b637d26e5d03aa467d0ad022031aa59b989bb381e8622ab7e2236e20de14afdc779270a4275cac0a3e302c61b
---

# 自动化测试管理平台

基于 Next.js + React + TypeScript + Ant Design 构建的企业级自动化测试管理平台。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI 组件**: Ant Design 5.x
- **图表库**: ECharts
- **语言**: TypeScript
- **样式**: TailwindCSS + Ant Design 样式系统
- **状态管理**: React Hooks
- **包管理**: pnpm

## 功能模块

### 已实现的核心模块

1. **首页仪表板** (`/`)
   - 统计数据概览（用例数、需求数、执行数、通过率）
   - 测试执行趋势图（折线图）
   - 用例模块分布（环形图）
   - 需求状态分布（饼图）
   - 进行中的测试计划
   - 最近更新的测试用例

2. **测试用例管理** (`/test-cases`)
   - 用例列表展示（支持分页）
   - 搜索和筛选功能
   - 新增/编辑/删除用例
   - 批量删除功能
   - 导入/导出功能（界面已实现）

3. **测试需求管理** (`/test-requirements`)
   - 需求列表展示
   - 优先级和状态标签
   - CRUD 操作

4. **测试计划管理** (`/test-plans`)
   - 计划列表展示
   - 进度可视化
   - 状态管理
   - 日期范围选择

### 待开发模块

- 测试执行管理
- 测试报告管理
- Web自动化测试
- 性能测试
- 接口测试
- 测试任务管理

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页仪表板（含图表）
│   ├── test-cases/        # 测试用例管理
│   ├── test-requirements/ # 测试需求管理
│   ├── test-plans/        # 测试计划管理
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 可复用组件
│   └── layout/           # 布局组件
│       └── MainLayout.tsx # 主布局（侧边栏+头部）
├── lib/                   # 工具库
│   └── api.ts            # API请求封装（已预置）
├── mock/                  # Mock 数据
│   └── data.ts           # 模拟数据
├── types/                 # TypeScript 类型定义
│   └── index.ts          # 类型声明
└── api/                   # API 规划文档
    └── README.ts         # API 设计说明

docs/
└── API_INTEGRATION_GUIDE.md  # 后端对接指南
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

### 生产构建

```bash
pnpm build
```

构建产物在 `out/` 目录。

## 后端对接

详细的后端对接说明请参考 [API对接指南](docs/API_INTEGRATION_GUIDE.md)，包含：

- API接口规范（RESTful设计）
- Mock数据切换到真实API的步骤
- 错误处理规范
- 状态管理升级方案
- 数据库表设计参考

### 快速切换到真实API

1. 配置环境变量 `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-server.com
   ```

2. 使用 `src/lib/api.ts` 中已封装好的API方法

3. 将页面中的 `mockData` 替换为API调用

## 响应式设计

- 桌面端: 完整侧边栏导航 + 多列布局
- 平板端: 可折叠侧边栏
- 移动端: 自适应单列布局

## 开发规范

1. 组件采用函数式组件 + Hooks
2. 使用 TypeScript 严格类型检查
3. 遵循 Ant Design 设计规范
4. 统一的代码风格和命名规范

## 部署说明

项目配置为静态导出模式，可部署到任何静态文件服务器。

```bash
# 构建静态文件
pnpm build

# 构建产物在 out/ 目录，可直接部署到Nginx/Apache/CDN等
```

## 许可证

MIT
