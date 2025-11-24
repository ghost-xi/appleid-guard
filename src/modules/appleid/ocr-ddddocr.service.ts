import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * 通过 Python ddddocr 识别验证码
 * 需要系统安装 Python 3 和 ddddocr 库
 */
@Injectable()
export class OcrDdddocrService {
  private readonly logger = new Logger(OcrDdddocrService.name);
  private readonly pythonScript = `
import ddddocr
import base64
import sys

try:
    ocr = ddddocr.DdddOcr()
    img_base64 = sys.argv[1]
    img_bytes = base64.b64decode(img_base64)
    result = ocr.classification(img_bytes)
    print(result)
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
`;

  async checkDdddocrAvailable(): Promise<boolean> {
    try {
      await execAsync('python3 -c "import ddddocr"');
      return true;
    } catch {
      this.logger.warn('ddddocr not available, please install: pip3 install ddddocr');
      return false;
    }
  }

  /**
   * 使用 ddddocr 识别验证码
   * @param imageBase64 Base64 编码的图片（去除前缀）
   * @returns 识别结果
   */
  async recognizeCaptcha(imageBase64: string): Promise<string> {
    try {
      // 检查 ddddocr 是否可用
      if (!(await this.checkDdddocrAvailable())) {
        return '';
      }

      // 清理 base64 数据
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // 创建临时 Python 脚本
      const tempScript = path.join('/tmp', `ocr_${Date.now()}.py`);
      fs.writeFileSync(tempScript, this.pythonScript);

      try {
        // 执行 Python 脚本
        const { stdout, stderr } = await execAsync(`python3 ${tempScript} "${base64Data}"`, {
          timeout: 10000, // 10 秒超时
        });

        if (stderr && stderr.includes('ERROR')) {
          throw new Error(stderr);
        }

        const result = stdout.trim();
        this.logger.log(`ddddocr recognized: ${result}`);
        return result;
      } finally {
        // 清理临时文件
        if (fs.existsSync(tempScript)) {
          fs.unlinkSync(tempScript);
        }
      }
    } catch (error) {
      this.logger.error(`ddddocr recognition failed: ${error.message}`);
      return '';
    }
  }

  /**
   * 带重试的识别
   */
  async recognizeWithRetry(imageBase64: string, maxAttempts = 3): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.recognizeCaptcha(imageBase64);
      if (result && result.length >= 4) {
        return result;
      }
      this.logger.warn(`ddddocr attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return '';
  }
}
