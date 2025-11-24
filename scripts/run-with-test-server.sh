#!/bin/bash

# 启动测试服务器并运行主应用

echo "🚀 启动测试环境..."
echo ""

# 检查是否已有测试服务器在运行
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  测试服务器已在运行 (端口 3001)"
else
    echo "📦 启动测试服务器..."
    cd test-server && npm start &
    TEST_SERVER_PID=$!
    echo "   PID: $TEST_SERVER_PID"

    # 等待服务器启动
    echo "⏳ 等待服务器启动..."
    sleep 3
fi

echo ""
echo "🎯 启动主应用..."
echo ""

# 启动主应用
cd ..
npm start -- \
  -api_url=http://localhost:3001 \
  -api_key=test-key \
  -taskid=test-123 \
  -lang=zh_cn \
  -debug

# 清理
if [ ! -z "$TEST_SERVER_PID" ]; then
    echo ""
    echo "🛑 停止测试服务器..."
    kill $TEST_SERVER_PID 2>/dev/null
fi
