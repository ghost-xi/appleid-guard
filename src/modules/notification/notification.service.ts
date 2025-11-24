import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface NotificationConfig {
  username: string;
  tgBotToken?: string;
  tgChatId?: string;
  wxPusherId?: string;
  webhook?: string;
  proxy?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async send(config: NotificationConfig, content: string): Promise<void> {
    const message = `【${config.username}】${content}`;
    const proxies = config.proxy ? { http: config.proxy, https: config.proxy } : undefined;

    // Send Telegram notification
    if (config.tgBotToken && config.tgChatId) {
      await this.sendTelegram(config.tgBotToken, config.tgChatId, message, proxies);
    }

    // Send WeChat notification
    if (config.wxPusherId) {
      await this.sendWeChat(config.wxPusherId, message, proxies);
    }

    // Send Webhook notification
    if (config.webhook) {
      await this.sendWebhook(config.webhook, config.username, content, proxies);
    }
  }

  private async sendTelegram(
    botToken: string,
    chatId: string,
    message: string,
    proxies?: any,
  ): Promise<void> {
    try {
      await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
        },
        { proxy: proxies ? proxies.http : undefined },
      );
    } catch (error) {
      this.logger.error(`Telegram notification failed: ${error.message}`);
    }
  }

  private async sendWeChat(pusherId: string, message: string, proxies?: any): Promise<void> {
    try {
      await axios.post(
        'http://www.pushplus.plus/send',
        {
          token: pusherId,
          content: message,
        },
        { proxy: proxies ? proxies.http : undefined },
      );
    } catch (error) {
      this.logger.error(`WeChat notification failed: ${error.message}`);
    }
  }

  private async sendWebhook(
    url: string,
    username: string,
    content: string,
    proxies?: any,
  ): Promise<void> {
    try {
      await axios.post(url, { username, content }, { proxy: proxies ? proxies.http : undefined });
    } catch (error) {
      this.logger.error(`Webhook notification failed: ${error.message}`);
    }
  }
}
