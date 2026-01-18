# ZYZS

简要说明：本仓库为一个基于 Next.js 的模拟交易界面。下面为精简且完整的 README，涵盖技术选型、本地启动/部署方式与核心功能说明。

**项目要点**
- **项目名**：ZYZS
- **目标**：提供一个前端模拟交易/钱包演示，包含登录、限价/市价下单、K 线图、资产总览、订单与交易历史、本地持久化与跟单示例功能。

**技术选型**
- 框架：Next.js (App Router) + React 19 + TypeScript
- 样式：Tailwind CSS
- 图表：lightweight-charts（K 线）
- 网络/HTTP：axios
- 通知：sonner
- 图标：lucide-react
- 状态管理：React Context（AuthContext、OrderContext、PriceContext、CopyTradingContext）

**AI 工具**
- 本项目使用到Claude Haiku 4.5和Google AI Studio工具配合项目开发。

**本地启动与部署**

开发模式：
`ash
npm install
npm run dev
# 访问 http://localhost:3000
`

生产构建：
`ash
npm run build
npm run start
`

说明：项目使用 package.json 中的 dev/uild/start 脚本，依赖见 package.json。

**核心功能说明**
- 认证与账户：简化登录（演示环境不验证密码），AuthContext 管理 user 与 ccount，账户初始余额为 100,000 USDT，使用 localStorage 持久化（键名示例：ccount_{userId}）。
- 交易：支持市价与限价单；市价单即时成交并更新余额/持仓；限价单挂起并在价格触达时自动撮合成交。
- 订单与历史：OrderContext 管理订单列表，成交的订单会写入账户 radeHistory 并持久化。
- 市场/行情：包含 MarketTable（轮询 & API 获取行情）与 KLineChart（WebSocket & K 线流）用于图表展示。
- 跟单（Copy Trading）：支持开始/停止跟单并持久化每用户的跟单列表。
- 钱包与资产：AssetOverview 根据 prices 计算持仓美元估值并展示资产总览与交易记录。

**本地数据与持久化**
- localStorage 常用键：
  - user（用户信息；注意：项目已改为在打开时不自动恢复 user，增加隐私保护）
  - ccount_{userId}（账户数据：余额/持仓/tradeHistory）
  - orders_{userId}（订单列表）
  - ollowing_{userId}（跟单列表）

**文件与代码位置**
- 认证/账户：context/AuthContext.tsx
- 订单：context/OrderContext.tsx
- 行情/价格：context/PriceContext.tsx
- 跟单：context/CopyTradingContext.tsx
- 交易页面：pp/trade/page.tsx、components/trade/TradePanel.tsx、components/trade/KLineChart.tsx
- 市场页：components/market/MarketTable.tsx、pp/market/page.tsx
- 钱包：components/wallet/AssetOverview.tsx、components/wallet/TransactionHistory.tsx
- 页面布局：components/layout/Header.tsx、pp/layout.tsx

