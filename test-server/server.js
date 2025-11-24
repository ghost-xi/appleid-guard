const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 加载配置
let config = {};
const configPath = path.join(__dirname, 'config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(data);
    console.log('✅ 配置加载成功');
  } catch (error) {
    console.error('❌ 配置加载失败:', error.message);
    config = {
      username: 'test@icloud.com',
      password: 'Test123456',
      dob: '01/01/1990',
      q1: '母亲的名字',
      a1: '李华',
      q2: '第一只宠物的名字',
      a2: '旺财',
      q3: '出生的城市',
      a3: '北京',
      check_interval: 60,
      webdriver: 'local',
      fail_retry: true,
      enable: true,
    };
  }
}

loadConfig();

// API Key 验证中间件
function verifyApiKey(req, res, next) {
  const apiKey = req.headers.key;
  if (!apiKey) {
    return res.json({ code: 401, status: false, msg: 'Missing API key' });
  }
  // 简单验证，测试环境接受任何 key
  console.log(`🔑 API Key: ${apiKey}`);
  next();
}

// 日志中间件
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 1. 获取任务配置
app.post('/api/get_task_info', verifyApiKey, (req, res) => {
  const { id } = req.body;
  console.log(`📋 获取任务配置: ${id}`);

  res.json({
    code: 200,
    status: true,
    msg: 'Success',
    data: {
      ...config,
      task_id: id,
    },
  });
});

// 2. 更新账号
app.post('/api/update_account', verifyApiKey, (req, res) => {
  const { username, password, status, message } = req.body;
  console.log(`🔄 更新账号: ${username}`);
  console.log(`   状态: ${status}`);
  console.log(`   消息: ${message}`);
  if (password) {
    console.log(`   新密码: ${password}`);
    // 更新配置中的密码
    config.password = password;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  res.json({
    code: 200,
    status: true,
    msg: 'Account updated successfully',
  });
});

// 3. 获取密码
app.post('/api/get_password', verifyApiKey, (req, res) => {
  const { username } = req.body;
  console.log(`🔐 获取密码: ${username}`);

  res.json({
    code: 200,
    status: true,
    msg: 'Success',
    data: {
      password: config.password,
    },
  });
});

// 4. 报告代理错误
app.post('/api/report_proxy_error', verifyApiKey, (req, res) => {
  const { id } = req.body;
  console.log(`⚠️  报告代理错误: ${id}`);

  res.json({
    code: 200,
    status: true,
    msg: 'Proxy error reported',
  });
});

// 5. 停用账号
app.post('/api/disable_account', verifyApiKey, (req, res) => {
  const { username } = req.body;
  console.log(`🚫 停用账号: ${username}`);

  res.json({
    code: 200,
    status: true,
    msg: 'Account disabled',
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      username: config.username,
      enabled: config.enable,
    },
  });
});

// 获取当前配置
app.get('/config', (req, res) => {
  res.json(config);
});

// 更新配置
app.post('/config', (req, res) => {
  config = { ...config, ...req.body };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ 配置已更新');
  res.json({ status: true, msg: 'Config updated', data: config });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    status: false,
    msg: 'Endpoint not found',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Apple ID Guard - 测试服务器启动成功！');
  console.log('='.repeat(60));
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📋 健康检查: http://localhost:${PORT}/health`);
  console.log(`⚙️  配置查看: http://localhost:${PORT}/config`);
  console.log('='.repeat(60));
  console.log('\n💡 使用方法:');
  console.log(`   npm start -- -api_url=http://localhost:${PORT} -api_key=test-key -taskid=test-123\n`);
  console.log('📝 可用端点:');
  console.log('   POST /api/get_task_info');
  console.log('   POST /api/update_account');
  console.log('   POST /api/get_password');
  console.log('   POST /api/report_proxy_error');
  console.log('   POST /api/disable_account');
  console.log('='.repeat(60) + '\n');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 服务器正在关闭...');
  process.exit(0);
});
