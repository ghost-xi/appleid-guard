import { Injectable, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * 识别验证码图片
   * @param imageBase64 Base64 编码的图片
   * @returns 识别出的验证码文本
   */
  async recognizeCaptcha(imageBase64: string): Promise<string> {
    try {
      // 移除 data:image/jpeg;base64, 前缀
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // 使用 Tesseract.js 识别
      const {
        data: { text },
      } = await Tesseract.recognize(Buffer.from(base64Data, 'base64'), 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            this.logger.debug(`OCR Progress: ${(info.progress * 100).toFixed(2)}%`);
          }
        },
      });

      // 清理识别结果：只保留字母和数字
      const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').trim();
      this.logger.log(`Captcha recognized: ${cleanedText}`);

      return cleanedText;
    } catch (error) {
      this.logger.error(`OCR recognition failed: ${error.message}`);
      return '';
    }
  }

  /**
   * 批量识别（用于重试）
   * @param imageBase64 Base64 编码的图片
   * @param maxAttempts 最大尝试次数
   * @returns 识别结果
   */
  async recognizeWithRetry(imageBase64: string, maxAttempts = 3): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.recognizeCaptcha(imageBase64);
      if (result && result.length >= 4) {
        // 假设验证码至少 4 位
        return result;
      }
      this.logger.warn(`OCR attempt ${i + 1} failed, retrying...`);
    }
    return '';
  }
}
