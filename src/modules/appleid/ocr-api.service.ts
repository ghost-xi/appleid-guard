import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * 第三方 OCR API 服务
 * 支持多个验证码识别平台
 */
@Injectable()
export class OcrApiService {
  private readonly logger = new Logger(OcrApiService.name);

  /**
   * 使用 2Captcha 识别验证码
   */
  async recognize2Captcha(imageBase64: string, apiKey: string): Promise<string> {
    try {
      // 提交验证码
      const submitResponse = await axios.post('https://2captcha.com/in.php', {
        key: apiKey,
        method: 'base64',
        body: imageBase64,
        json: 1,
      });

      if (submitResponse.data.status !== 1) {
        throw new Error(submitResponse.data.request);
      }

      const captchaId = submitResponse.data.request;

      // 轮询获取结果
      for (let i = 0; i < 20; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const resultResponse = await axios.get('https://2captcha.com/res.php', {
          params: {
            key: apiKey,
            action: 'get',
            id: captchaId,
            json: 1,
          },
        });

        if (resultResponse.data.status === 1) {
          this.logger.log(`2Captcha solved: ${resultResponse.data.request}`);
          return resultResponse.data.request;
        }
      }

      throw new Error('2Captcha timeout');
    } catch (error) {
      this.logger.error(`2Captcha failed: ${error.message}`);
      return '';
    }
  }

  /**
   * 使用阿里云 OCR 识别验证码
   */
  async recognizeAliyunOcr(
    _imageBase64: string,
    _accessKeyId: string,
    _accessKeySecret: string,
  ): Promise<string> {
    try {
      // 这里需要集成阿里云 SDK
      // 示例代码，实际使用时需要安装 @alicloud/ocr20191230
      this.logger.warn('Aliyun OCR not implemented yet');
      return '';
    } catch (error) {
      this.logger.error(`Aliyun OCR failed: ${error.message}`);
      return '';
    }
  }

  /**
   * 使用自定义 OCR 服务
   */
  async recognizeCustomApi(imageBase64: string, apiUrl: string): Promise<string> {
    try {
      const response = await axios.post(apiUrl, {
        image: imageBase64,
      });

      return response.data.text || response.data.result || '';
    } catch (error) {
      this.logger.error(`Custom OCR API failed: ${error.message}`);
      return '';
    }
  }
}
