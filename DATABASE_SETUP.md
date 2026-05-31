# 智盈AI数据库配置指南

## 1. 数据库要求

- **数据库类型**: PostgreSQL
- **版本**: PostgreSQL 12.0 或更高版本
- **依赖**: pg库 (PostgreSQL客户端)

## 2. 安装PostgreSQL

### Windows系统
1. 下载PostgreSQL安装包: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. 运行安装程序，按照向导完成安装
3. 记住设置的密码（后续配置需要）

### macOS系统
```bash
# 使用Homebrew安装
brew install postgresql
brew services start postgresql
```

### Linux系统
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 3. 创建数据库

### 使用psql命令行
```bash
# 登录PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE zhiying_ai;

# 创建用户（可选）
CREATE USER zhiying_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zhiying_ai TO zhiying_user;

# 退出
\q
```

### 使用pgAdmin（图形界面）
1. 打开pgAdmin
2. 连接到PostgreSQL服务器
3. 右键点击"Databases" -> "Create" -> "Database..."
4. 输入数据库名称：`zhiying_ai`
5. 设置所有者和其他选项

## 4. 配置环境变量

复制`.env`文件并修改数据库连接信息：

```bash
cp .env .env.local
```

编辑`.env.local`文件：

```env
# 数据库配置
VITE_DATABASE_URL="postgresql://username:password@localhost:5432/zhiying_ai"
VITE_DATABASE_POOL_MIN=2
VITE_DATABASE_POOL_MAX=10
VITE_DATABASE_POOL_IDLE_TIMEOUT=30000
VITE_DATABASE_CONNECTION_TIMEOUT=5000
```

**配置说明**:
- `username`: PostgreSQL用户名（通常是`postgres`或您创建的用户）
- `password`: PostgreSQL密码
- `localhost`: 数据库服务器地址（本地开发使用localhost）
- `5432`: PostgreSQL默认端口
- `zhiying_ai`: 数据库名称

## 5. 初始化数据库

运行数据库初始化脚本创建表结构：

```bash
npm run init-db
```

或

```bash
npm run db:init
```

成功输出示例：
```
=== 开始初始化数据库 ===
数据库连接成功
数据库表创建成功
数据库断开连接
=== 数据库初始化完成 ===
```

## 6. 数据库表结构

初始化后会创建以下表：

### signals表（交易信号）
- `id`: 信号ID（主键）
- `stock_code`: 股票代码
- `stock_name`: 股票名称
- `type`: 信号类型（buy/sell）
- `score`: 信号评分
- `confidence`: 置信度
- `reason`: 信号原因
- `timestamp`: 时间戳
- `is_read`: 是否已读
- `is_auction_period`: 是否在集合竞价期间
- `main_force_flow`: 主力资金流向
- `main_force_ratio`: 主力资金占比
- `volume_amplification`: 成交量放大倍数
- `turnover_rate`: 换手率
- `price`: 当前价格
- `target_price`: 目标价格

### positions表（持仓）
- `stock_code`: 股票代码（主键）
- `stock_name`: 股票名称
- `entry_price`: 买入价格
- `volume`: 持仓数量
- `entry_time`: 买入时间

### stock_data_history表（股票历史数据）
- `id`: 记录ID（主键）
- `stock_code`: 股票代码
- `stock_name`: 股票名称
- `current_price`: 当前价格
- `main_force_net_flow`: 主力资金净流入
- `total_net_flow`: 总资金净流入
- `super_large_order_flow`: 超大单资金流向
- `large_order_flow`: 大单资金流向
- `medium_order_flow`: 中单资金流向
- `small_order_flow`: 小单资金流向
- `volume_amplification`: 成交量放大倍数
- `turnover_rate`: 换手率
- `timestamp`: 时间戳

## 7. 数据库连接测试

启动应用后，数据库会自动连接并创建表（如果不存在）。可以通过以下方式验证：

1. 查看应用启动日志，应该有"数据库连接成功"的消息
2. 使用pgAdmin查看数据库中是否创建了相应的表
3. 运行交易信号生成功能，检查数据是否正确写入数据库

## 8. 常见问题

### 连接失败
- 检查PostgreSQL服务是否启动
- 验证用户名和密码是否正确
- 确认数据库名称是否正确
- 检查防火墙设置是否允许连接

### 权限问题
- 确保用户有足够的权限创建表和插入数据
- 使用`GRANT ALL PRIVILEGES`命令授予权限

### 端口占用
- 默认端口5432可能被占用，修改PostgreSQL配置或使用其他端口

## 9. 数据库维护

### 备份数据库
```bash
pg_dump -U postgres zhiying_ai > zhiying_ai_backup.sql
```

### 恢复数据库
```bash
psql -U postgres -d zhiying_ai < zhiying_ai_backup.sql
```

### 查看数据库状态
```bash
psql -U postgres -c "\l"  # 列出所有数据库
psql -U postgres -d zhiying_ai -c "\dt"  # 列出所有表
```

## 10. 生产环境配置

在生产环境中，建议：
1. 使用专用的数据库用户，避免使用postgres用户
2. 设置强密码
3. 配置数据库连接池参数
4. 定期备份数据库
5. 设置数据库监控

---

如有其他问题，请查看项目的README.md文件或联系开发团队。
