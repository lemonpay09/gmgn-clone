# 个人账户系统 - 快速参考

## 核心需求实现清单

### ✅ 初始资金管理
```
需求：每个注册的钱包用户初始金额就是10w美金，无法充值也无法修改
实现：
  • AuthContext 在用户首次登录时创建 UserAccount
  • balance 初始化为 100000 USDT
  • 未提供充值/修改接口（满足"无法修改"需求）
```

### ✅ 初始账户状态
```
需求：一开始进入账户时，没有资产总值，就是他是没有买任何币种的
      交易记录也是空的
实现：
  • 新账户 holdings = {} （空对象）
  • 新账户 tradeHistory = [] （空数组）
  • AssetOverview 初始只显示 10w USDT
  • TransactionHistory 初始显示"暂无交易记录"
```

### ✅ 登录要求
```
需求：只有登录账户后才能去执行交易功能
实现：
  • TradePanel 检查 isAuthenticated，未登录显示提示
  • /trade 页面顶部检查登录状态，未登录显示登录按钮
  • 所有交易操作被 isAuthenticated 保护
```

### ✅ 模拟账户
```
需求：买入卖出后是模拟账户资金增减少，就类似一个模拟账户
      如果不登陆是交易不了的
实现：
  • 所有交易都在内存和 localStorage 中进行
  • 市价单立即执行：
    - 买入：balance -= price * amount，holdings[symbol] += amount
    - 卖出：balance += price * amount，holdings[symbol] -= amount
  • 限价单等待成交，不立即更新账户
```

### ✅ 数据持久化
```
需求：运行后记录账户信息，就是这个账户的交易记录以及交易的金额都保留记录
      例如用一个账户交易10w都亏完了，那么这帐户不管什么时候上线都没钱了
      如果钱变多了那就保持变多
实现：
  • 使用 localStorage 存储：
    - user: 用户信息
    - account_{userId}: 账户余额、持仓、交易历史
  • 每次账户变化自动保存
  • 应用启动时自动恢复 localStorage 数据
  • 支持多账户（不同用户独立存储）
  • 账户余额历史可追溯（tradeHistory 记录所有交易）
```

### ✅ 初始资产配置
```
需求：在资产总览中10w一开始都是usdt
实现：
  • 初始账户 balance = 100000
  • 初始 holdings = {}
  • AssetOverview 显示：
    - USDT 余额（初始 100,000）
    - 其他持仓币种（初始为空）
    - 总资产估值 = USDT 余额 + 其他币种美元价值
```

## 核心功能流程

### 用户注册/登录流程
```
1. 用户访问 /trade
2. 点击"前往登录"
3. 输入邮箱密码
4. 点击"登录"
5. AuthContext.login() 执行：
   a. 检查 localStorage 中是否存在 account_{userId}
   b. 如果不存在，创建新账户：{balance: 100000, holdings: {}, ...}
   c. 保存 user 和 account 到 localStorage
   d. 设置 isAuthenticated = true
6. 页面自动刷新，显示交易界面
7. 页面头部显示"余额: $100,000.00 USDT"
```

### 市价交易流程
```
1. 用户在 TradePanel 输入：side (买/卖), amount, orderType=market
2. handleSubmit() 执行：
   a. 检查 isAuthenticated ✓
   b. 获取当前市价（带点差）
   c. 计算交易金额：tradeCost = price * amount
   d. 检查余额/持仓是否充足 ✓
3. 如果是买入：
   a. updateBalance(balance - tradeCost)
   b. updateHoldings({...holdings, BTC: current + amount})
   c. addTradeHistory({pair, side, price, amount, timestamp})
4. addOrder() 添加订单到 OrderContext
5. localStorage 自动保存账户变化
6. 页面更新：
   - 头部余额实时显示
   - 资产总览更新
   - 成交历史显示新交易
```

### 限价交易流程
```
1. 用户切换到"限价"，输入 price, amount
2. addOrder() 将订单保存为 PENDING 状态
3. OrderBookPanel 监听 currentPrice 变化
4. 当 (side=buy && price <= order.price) 或 (side=sell && price >= order.price)
   a. updateOrderStatus(id, FILLED)
   b. processOrder() 执行账户更新（与市价相同）
   c. 订单显示在"成交历史"
5. localStorage 自动保存
```

### 数据恢复流程
```
1. 用户关闭浏览器
2. 重新访问网站
3. AuthContext useEffect 执行：
   a. 读取 localStorage.getItem("user")
   b. 读取 localStorage.getItem("account_{userId}")
   c. 设置 user 和 account 状态
   d. 设置 isAuthenticated = true
4. 页面自动显示登录状态
5. 所有数据恢复（余额、持仓、交易历史）
```

## 数据结构

### User
```typescript
{
  id: string;           // 用户唯一ID
  email: string;        // 邮箱
  name: string;         // 用户名
  avatarUrl?: string;   // 头像URL
}
```

### UserAccount
```typescript
{
  userId: string;                    // 关联的用户ID
  balance: number;                   // USDT 余额，初始100000
  holdings: {[symbol]: amount};      // 持仓，例如 {BTC: 0.5, ETH: 2}
  tradeHistory: TradeHistory[];      // 交易历史
  createdAt: string;                 // 创建时间
  updatedAt: string;                 // 最后更新时间
}
```

### TradeHistory
```typescript
{
  id: string;          // 交易ID
  pair: string;        // 交易对，例如 "BTC/USDT"
  side: 'BUY' | 'SELL';// 买/卖方向
  price: number;       // 成交价格
  amount: number;      // 成交数量
  timestamp: string;   // 成交时间
}
```

### Order
```typescript
{
  id: string;                              // 订单ID
  pair: string;                            // 交易对
  side: 'buy' | 'sell';                   // 方向
  orderType: 'market' | 'limit';          // 订单类型
  price: number;                           // 价格
  amount: number;                          // 数量
  status: 'PENDING' | 'FILLED' | 'CANCELLED'; // 状态
  timestamp: string;                       // 创建时间
}
```

## localStorage 存储格式

```javascript
// 用户信息
localStorage.user = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: "..."
}

// 账户信息（每个用户独立存储）
localStorage["account_user-123"] = {
  userId: "user-123",
  balance: 99000,           // 如果买入了1w的币
  holdings: {
    BTC: 0.238,
    ETH: 4,
    SOL: 100
  },
  tradeHistory: [
    {
      id: "trade-1",
      pair: "BTC/USDT",
      side: "BUY",
      price: 42000,
      amount: 0.238,
      timestamp: "2026-01-18T12:00:00Z"
    },
    ...
  ],
  createdAt: "2026-01-18T10:00:00Z",
  updatedAt: "2026-01-18T12:05:00Z"
}
```

## API 端点（现有）

```
POST /api/auth/login
  请求：{email, password}
  响应：{id, email, name, avatarUrl}
  作用：用户认证（演示中不验证密码）

GET /api/kline?symbol=btcusdt&interval=1m
  作用：获取 K 线数据

GET /api/wallet
  作用：获取钱包资产（现已改用本地 AuthContext）

GET /api/trade-history
  作用：获取交易历史（现已改用本地 AuthContext）
```

## 关键 Hook 使用

```typescript
// 获取认证信息和账户数据
const { user, account, isAuthenticated, updateBalance, updateHoldings, addTradeHistory } = useAuth();

// 获取订单列表
const { orders, addOrder, updateOrderStatus } = useOrders();
```

## 生产环境建议

现在的实现适合演示/学习，生产环境建议：

1. **后端数据存储**
   ```
   POST /api/accounts/create - 创建账户
   GET /api/accounts/{userId} - 获取账户
   PUT /api/accounts/{userId}/balance - 更新余额
   PUT /api/accounts/{userId}/holdings - 更新持仓
   POST /api/accounts/{userId}/trades - 记录交易
   ```

2. **交易验证**
   - 后端验证余额充足
   - 后端验证持仓足够
   - 后端原子性执行交易

3. **数据加密**
   - HTTPS 传输
   - 加密敏感信息
   - 使用 JWT Token 认证

4. **审计日志**
   - 记录所有交易
   - 记录余额变化
   - 支持交易回滚

---

**快速起始**：
1. `npm run dev` 启动应用
2. 访问 http://localhost:3000/trade
3. 点击"前往登录"
4. 输入任意邮箱密码登录
5. 开始模拟交易
