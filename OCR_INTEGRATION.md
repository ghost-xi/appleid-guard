# OCR 验证码识别集成文档

## 概述

项目已集成 **Tesseract.js** 用于自动识别 Apple ID 登录时的验证码。支持多种 OCR 方案可选。

## 当前实现：Tesseract.js

### 特点

- ✅ 纯 JavaScript 实现，无需外部依赖
- ✅ 自动识别验证码图片
- ✅ 支持失败重试
- ✅ 识别失败时自动降级为手动输入
- ✅ 实时日志输出识别进度

### 使用方法

验证码识别已自动集成到登录流程中，无需额外配置。

```bash
# 正常启动即可
npm start -- -api_url=<url> -api_key=<key> -taskid=<id>
```

### 工作流程

1. 检测到验证码图片时自动触发 OCR
2. Tesseract.js 识别验证码文本
3. 自动填入验证码输入框
4. 识别失败时等待手动输入（5秒）
5. 最多重试 10 次

### 日志示例

```
[AppleIdService] Captcha detected, attempting OCR recognition...
[OcrService] OCR Progress: 50.00%
[OcrService] OCR Progress: 100.00%
[OcrService] Captcha recognized: ABCD1234
[AppleIdService] Captcha passed
```

## 可选方案

项目还提供了其他 OCR 方案的接口实现：

### 方案 1: Tesseract.js（当前使用）

**文件**: `src/modules/appleid/ocr.service.ts`

**优点**:
- 无需外部服务
- 免费
- 易于部署

**缺点**:
- 识别率可能不如专业服务
- 依赖图片质量

### 方案 2: 第三方 OCR API

**文件**: `src/modules/appleid/ocr-api.service.ts`

支持的服务：
- **2Captcha** - 付费验证码识别服务
- **阿里云 OCR** - 企业级 OCR 服务
- **自定义 API** - 支持任意 OCR API

**优点**:
- 识别率高
- 专业服务
- 支持复杂验证码

**缺点**:
- 需要付费
- 需要网络连接
- 响应时间较长

### 方案 3: Python ddddocr

**文件**: `src/modules/appleid/ocr-ddddocr.service.ts`

**优点**:
- 与原 Python 版本保持一致
- 识别率较好

**缺点**:
- 需要安装 Python 和 ddddocr
- 增加部署复杂度
- 跨进程调用有性能损耗

## 切换 OCR 方案

### 使用第三方 API

1. 修改 `src/main.ts`:

```typescript
import { OcrApiService } from './modules/appleid/ocr-api.service';

// 替换
const ocrService = new OcrService();
// 为
const ocrService = new OcrApiService();
```

2. 在 AppleIdService 中调用相应方法:

```typescript
// 使用 2Captcha
const captchaCode = await this.ocrService.recognize2Captcha(
  imageSrc,
  'your-2captcha-api-key'
);

// 或使用自定义 API
const captchaCode = await this.ocrService.recognizeCustomApi(
  imageSrc,
  'https://your-ocr-api.com/recognize'
);
```

### 使用 ddddocr

1. 安装 Python 依赖:

```bash
pip3 install ddddocr
```

2. 修改 `src/main.ts`:

```typescript
import { OcrDdddocrService } from './modules/appleid/ocr-ddddocr.service';

const ocrService = new OcrDdddocrService();
```

3. 更新模块:

```typescript
// src/modules/appleid/appleid.module.ts
import { OcrDdddocrService } from './ocr-ddddocr.service';

providers: [AppleIdService, OcrDdddocrService],
```

## 性能优化建议

### 1. 预处理图片

在识别前可以对图片进行预处理以提高识别率：

```typescript
// 灰度化、二值化、降噪等
```

### 2. 缓存 Tesseract 模型

首次加载 Tesseract 模型较慢，可以预加载：

```typescript
// 在应用启动时预加载
await ocrService.preloadModel();
```

### 3. 并行识别

对于多个验证码可以并行处理：

```typescript
const results = await Promise.all([
  ocrService.recognizeCaptcha(image1),
  ocrService.recognizeCaptcha(image2),
]);
```

## 识别率提升技巧

1. **调整 Tesseract 参数**
   - 修改识别语言
   - 调整 PSM 模式
   - 设置白名单字符

2. **图片预处理**
   - 增强对比度
   - 去除噪点
   - 统一尺寸

3. **使用专业服务**
   - 对于重要场景使用付费 API
   - 提供更好的用户体验

## 故障排查

### OCR 失败

```
[OcrService] OCR recognition failed: ...
[AppleIdService] OCR failed, waiting for manual input...
```

**解决方法**:
1. 检查图片质量
2. 尝试手动输入
3. 切换到付费 OCR 服务

### Tesseract 加载慢

```
[OcrService] OCR Progress: 0.00%
```

**解决方法**:
1. 等待模型加载完成
2. 首次运行较慢是正常现象
3. 后续运行会更快

### 识别率低

**解决方法**:
1. 使用第三方 OCR API
2. 调整 Tesseract 参数
3. 对图片进行预处理

## Docker 部署注意事项

Tesseract.js 在 Docker 中可以正常工作，无需额外配置。

如果使用 ddddocr，需要在 Dockerfile 中添加：

```dockerfile
RUN apk add --no-cache python3 py3-pip
RUN pip3 install ddddocr
```

## 总结

| 方案 | 识别率 | 成本 | 部署难度 | 推荐场景 |
|------|--------|------|----------|---------|
| Tesseract.js | ⭐⭐⭐ | 免费 | 简单 | 一般场景 |
| 2Captcha | ⭐⭐⭐⭐⭐ | 付费 | 简单 | 重要场景 |
| ddddocr | ⭐⭐⭐⭐ | 免费 | 中等 | 兼容性需求 |
| 阿里云 OCR | ⭐⭐⭐⭐⭐ | 付费 | 中等 | 企业场景 |

**推荐使用**: Tesseract.js（当前默认），简单易用且免费。如需更高识别率，可切换到付费 API。
