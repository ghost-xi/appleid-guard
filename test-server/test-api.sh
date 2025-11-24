#!/bin/bash

# 测试 API 端点脚本

API_URL="http://localhost:3001"
API_KEY="test-key"

echo "=================================="
echo "测试 Apple ID Guard API"
echo "=================================="
echo ""

# 1. 健康检查
echo "1️⃣  测试健康检查..."
curl -s "${API_URL}/health" | json_pp
echo -e "\n"

# 2. 获取配置
echo "2️⃣  测试获取配置..."
curl -s "${API_URL}/config" | json_pp
echo -e "\n"

# 3. 获取任务信息
echo "3️⃣  测试获取任务信息..."
curl -s -X POST "${API_URL}/api/get_task_info" \
  -H "key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-123"}' | json_pp
echo -e "\n"

# 4. 更新账号
echo "4️⃣  测试更新账号..."
curl -s -X POST "${API_URL}/api/update_account" \
  -H "key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@icloud.com","password":"NewPass123","status":true,"message":"测试更新"}' | json_pp
echo -e "\n"

# 5. 获取密码
echo "5️⃣  测试获取密码..."
curl -s -X POST "${API_URL}/api/get_password" \
  -H "key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@icloud.com"}' | json_pp
echo -e "\n"

# 6. 报告代理错误
echo "6️⃣  测试报告代理错误..."
curl -s -X POST "${API_URL}/api/report_proxy_error" \
  -H "key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":1}' | json_pp
echo -e "\n"

# 7. 停用账号
echo "7️⃣  测试停用账号..."
curl -s -X POST "${API_URL}/api/disable_account" \
  -H "key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@icloud.com"}' | json_pp
echo -e "\n"

echo "=================================="
echo "✅ 所有 API 测试完成！"
echo "=================================="
