# 个人账户系统修改说明

## 修改概述

实现了完整的个人账户系统，包括初始资金管理、交易权限控制、账户数据持久化等功能。

## 主要修改内容

### 1. **数据模型扩展** (`lib/types.ts`)

新增 `UserAccount` 接口，用于管理用户账户信息：

```typescript
export interface UserAccount {
  userId: string;
  balance: number; // 账户余额（USDT），初始10w
  holdings: { [symbol: string]: number }; // 持仓信息
  tradeHistory: TradeHistory[];
  createdAt: string;
  updatedAt: string;
}
```

### 2. **认证上下文增强** (`context/AuthContext.tsx`)

#### 功能：
- **初始资金**：新用户注册时自动创建初始余额为 **100,000 USDT** 的账户
- **账户数据持久化**：使用 `localStorage` 存储账户数据，格式为 `account_{userId}`
- **数据恢复**：应用启动时自动从 localStorage 恢复上次会话的账户数据
- **账户更新方法**：
  - `updateBalance(newBalance)` - 更新余额
  - `updateHoldings(holdings)` - 更新持仓
  - `addTradeHistory(trade)` - 添加交易记录

#### localStorage 结构：
```
user: { id, email, name, avatarUrl }
account_{userId}: { userId, balance, holdings, tradeHistory, createdAt, updatedAt }
```

### 3. **交易面板权限控制** (`components/trade/TradePanel.tsx`)

#### 修改点：
- **登录检查**：未登录用户显示"请先登录账户"提示，无法进行任何交易操作
- **余额验证**：买入前检查 USDT 余额是否充足
- **持仓验证**：卖出前检查目标币种持仓是否充足
- **市价单立即执行**：
  - 买入：扣除 USDT 余额，增加相应币种持仓
  - 卖出：增加 USDT 余额，减少相应币种持仓
  - 同时记录交易历史
- **限价单处理**：仅保存订单状态，不立即更新账户

### 4. **资产概览更新** (`components/wallet/AssetOverview.tsx`)

#### 显示内容：
- 初始状态：仅显示 **10w USDT**（初始资金，全部为 USDT）
- 交易后：显示 USDT 剩余余额 + 所有持仓币种及其美元价值
- 总资产估值：所有持仓的美元总价值

#### 持仓币种信息：
```typescript
const COIN_INFO: { [symbol: string]: { name: string; imageUrl: string } } = {
  'BTC': { name: 'Bitcoin', imageUrl: '/tokens/btc.png' },
  'ETH': { name: 'Ethereum', imageUrl: '/tokens/eth.png' },
  'SOL': { name: 'Solana', imageUrl: '/tokens/sol.png' },
  'USDT': { name: 'Tether', imageUrl: '/tokens/usdt.png' },
};
```

### 5. **交易历史显示** (`components/wallet/TransactionHistory.tsx`)

#### 功能：
- 初始状态：暂无交易记录
- 交易后：显示所有成交订单（包括市价单和成交的限价单）
- 显示信息：交易对、买/卖方向、成交价格、数量、成交时间

### 6. **订单上下文重构** (`context/OrderContext.tsx`)

#### 职责调整：
- 仅管理订单列表状态
- 账户更新由使用订单的组件负责

#### 方法签名更新：
```typescript
addOrder: (order: Omit<Order, 'id' | 'status'>, accountUpdateFn: ...) => void
```

### 7. **交易页面订单撮合** (`app/trade/page.tsx`)

#### 登录要求：
- 未登录用户显示"请先登录账户才能进行交易"提示
- 点击"前往登录"按钮打开认证对话框

#### 限价单成交处理：
- 监听实时价格变化
- 当市场价格触达挂单价格时自动成交
- 成交时立即更新账户余额、持仓和交易历史
- 显示成交通知

### 8. **页面头部显示** (`components/layout/Header.tsx`)

#### 显示内容：
- 登录后显示当前账户余额（格式：`余额: $100,000.00 USDT`）
- 下拉菜单显示用户名和邮箱
- 添加"登出"选项

### 9. **认证对话框改进** (`components/auth/AuthDialog.tsx`)

- 使用 `await` 确保登录函数完成后再关闭对话框
- 确保账户数据完全初始化后再返回

## 使用流程

### 1. **新用户注册/登录**

```
访问 /trade → 点击"前往登录" → 输入邮箱密码 → 登录成功
→ 自动创建初始资金 100,000 USDT 的账户
```

### 2. **进行交易**

#### 市价单：
```
1. 选择交易对（BTC/USDT）
2. 选择买入/卖出
3. 输入数量
4. 点击"买入/卖出"
5. 订单立即成交，账户余额/持仓实时更新
6. 交易记录保存到账户历史
```

#### 限价单：
```
1. 切换到"限价"模式
2. 输入限价价格
3. 输入数量
4. 点击"买入/卖出"
5. 订单挂起等待成交
6. 当市场价格触达挂单价格时自动成交
7. 成交后账户更新、记录保存
```

### 3. **查看账户**

```
登录后访问 /wallet
→ 显示资产总览（总价值 + 各持仓详情）
→ 显示交易历史（所有已成交的订单）
```

### 4. **离线恢复**

```
关闭浏览器 → 重新访问网站
→ 从 localStorage 恢复账户数据
→ 无需重新登录（若未清除 localStorage）
```

## 数据持久化机制

### localStorage 保存的数据：

```javascript
// 用户信息
localStorage.setItem("user", JSON.stringify(user));

// 账户数据
localStorage.setItem(`account_${userId}`, JSON.stringify(userAccount));
// 示例：account_user-123
```

### 应用启动时恢复流程：

1. 检查 localStorage 中是否存在 "user" 和 "account_{userId}"
2. 如果存在，恢复到 Auth Context
3. 自动设置 `isAuthenticated = true`
4. 页面组件可立即访问账户数据

## 安全考虑

⚠️ **注意**：当前实现仅用于演示/学习目的

- 使用 localStorage 存储密钥数据（生产环境应使用服务器/数据库）
- 无加密处理（生产环境应加密敏感数据）
- 余额/持仓由前端管理（生产环境应由后端验证）
- 建议在生产环境迁移到真实的后端 API 和数据库

## API 集成建议

如果要升级到生产环境，建议：

1. **后端账户管理**：
   ```
   POST /api/accounts/create - 创建账户
   GET /api/accounts/profile - 获取账户信息
   PUT /api/accounts/update - 更新账户余额/持仓
   ```

2. **交易验证**：
   ```
   POST /api/orders/submit - 提交并验证订单
   返回：{ success, newBalance, newHoldings, tradeRecord }
   ```

3. **数据库存储**：
   - 用户表：user_id, email, password_hash, created_at
   - 账户表：user_id, balance, updated_at
   - 持仓表：user_id, symbol, amount, updated_at
   - 交易表：user_id, pair, side, price, amount, status, created_at

## 测试清单

- [ ] 未登录状态无法交易
- [ ] 新用户初始余额为 100,000 USDT
- [ ] 市价单立即成交，账户更新
- [ ] 限价单挂起，价格触达自动成交
- [ ] 账户数据保存到 localStorage
- [ ] 页面刷新后数据保留
- [ ] 余额不足时无法买入
- [ ] 持仓不足时无法卖出
- [ ] 交易历史正确显示
- [ ] 资产总览计算正确
- [ ] 登出后清除数据

## 相关文件变更

| 文件 | 变更 |
|------|------|
| `lib/types.ts` | 添加 UserAccount 接口 |
| `context/AuthContext.tsx` | 完全重写，添加账户管理 |
| `components/trade/TradePanel.tsx` | 添加登录检查、余额验证、交易执行 |
| `components/wallet/AssetOverview.tsx` | 改用 AuthContext 账户数据 |
| `components/wallet/TransactionHistory.tsx` | 改用 AuthContext 交易历史 |
| `context/OrderContext.tsx` | 简化，去除账户更新逻辑 |
| `app/trade/page.tsx` | 添加登录检查、限价单成交处理 |
| `components/layout/Header.tsx` | 显示账户余额信息 |
| `components/auth/AuthDialog.tsx` | 改进登录流程 |
