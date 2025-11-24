# 测试后端 API 服务器

简单的 Node.js 测试后端，用于模拟真实 API 返回数据，方便测试 Apple ID Guard 应用。

## 快速开始

```bash
# 安装依赖
cd test-server
npm install

# 启动服务器
npm start
```

服务器将在 `http://localhost:3001` 启动。

## 使用测试服务器

启动测试服务器后，在主应用中使用：

```bash
# 在项目根目录
npm start -- -api_url=http://localhost:3001 -api_key=test-key -taskid=test-123
```

## API 端点

### 1. 获取任务配置
- **POST** `/api/get_task_info`
- **Headers**: `key: <api_key>`
- **Body**: `{ "id": "task-id" }`

### 2. 更新账号
- **POST** `/api/update_account`
- **Headers**: `key: <api_key>`
- **Body**: `{ "username": "user@example.com", "password": "newpass", "status": true, "message": "ok" }`

### 3. 获取密码
- **POST** `/api/get_password`
- **Headers**: `key: <api_key>`
- **Body**: `{ "username": "user@example.com" }`

### 4. 报告代理错误
- **POST** `/api/report_proxy_error`
- **Headers**: `key: <api_key>`
- **Body**: `{ "id": 1 }`

### 5. 停用账号
- **POST** `/api/disable_account`
- **Headers**: `key: <api_key>`
- **Body**: `{ "username": "user@example.com" }`

## 配置

编辑 `config.json` 修改模拟数据：

```json
{
  "username": "test@icloud.com",
  "password": "Test123456",
  "dob": "01/01/1990",
  "q1": "母亲",
  "a1": "李华",
  "q2": "宠物",
  "a2": "旺财",
  "q3": "城市",
  "a3": "北京"
}
```

## 测试 API

```bash
# 测试获取配置
curl -X POST http://localhost:3001/api/get_task_info \
  -H "key: test-key" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-123"}'
```
