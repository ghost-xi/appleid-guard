import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ApiService } from '../api/api.service';
import { BrowserService } from '../browser/browser.service';
import { AppleIdService } from '../appleid/appleid.service';
import { OcrService } from '../appleid/ocr.service';
import { NotificationService } from '../notification/notification.service';
import { TaskConfig, SecurityAnswer } from '../../common/types';
import { getLocale } from '../../locales';
import axios from 'axios';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private nextRunMinutes: number = 10;
  private taskConfig: TaskConfig;
  private locale: any;

  constructor(
    private readonly apiService: ApiService,
    private readonly browserService: BrowserService,
    private readonly notificationService: NotificationService,
    private readonly ocrService: OcrService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly taskId: string,
    private readonly lang: string,
    private readonly debug: boolean,
  ) {
    this.locale = getLocale(this.lang as any);
  }

  async executeTask(): Promise<void> {
    this.logger.log('='.repeat(80));
    this.logger.log(this.locale.launch);
    this.logger.log(`${this.locale.version}: v3.0-20241124`);

    // Get task configuration
    const config = await this.apiService.getTaskConfig(this.taskId);
    if (!config) {
      this.logger.error(this.locale.getAPIFail);
      this.nextRunMinutes = 10;
      return;
    }

    this.taskConfig = config;

    if (!config.enable && !this.debug) {
      this.logger.log(this.locale.taskDisabled);
      this.nextRunMinutes = 10;
      return;
    }

    // Setup proxy if configured
    let proxy = '';
    if (!this.debug && config.proxy_content && config.proxy_protocol) {
      if (config.proxy_protocol.includes('url')) {
        try {
          const protocol = config.proxy_protocol.split('+')[0];
          const content = (await axios.get(config.proxy_content)).data;
          proxy = `${protocol}://${content}`;
          this.logger.log(`${this.locale.retrievedProxyFromAPI}: ${proxy}`);
        } catch (error) {
          this.logger.error(this.locale.failOnRetrievingProxyFromAPI);
        }
      } else {
        proxy = `${config.proxy_protocol}://${config.proxy_content}`;
      }
    }

    // Launch browser
    const browserConfig = {
      headless: this.debug ? false : config.task_headless || false,
      proxy: proxy,
      webdriver: this.debug ? 'local' : config.webdriver,
    };

    if (!(await this.browserService.launch(browserConfig))) {
      this.logger.error(this.locale.failOnCallingWD);
      await this.apiService.updateMessage(config.username, this.locale.failOnCallingWD);
      await this.sendNotification(this.locale.failOnCallingWD);
      return;
    }

    // Get IP
    await this.browserService.getIP();

    // Create Apple ID service
    const answers: SecurityAnswer = {
      [config.q1]: config.a1,
      [config.q2]: config.a2,
      [config.q3]: config.a3,
    };

    const appleIdService = new AppleIdService(
      config.username,
      config.password,
      config.dob,
      answers,
      this.browserService,
      this.ocrService,
    );

    await appleIdService.init();

    let jobSuccess = true;

    try {
      this.logger.log(`${this.locale.CurrentAccount}${config.username}`);

      // Login
      if (!(await appleIdService.login())) {
        this.logger.error(this.locale.missionFailed);
        jobSuccess = false;
        return;
      }

      const originalPassword = config.password;

      // Check account status
      if (await appleIdService.check2FA()) {
        this.logger.log(this.locale.twoStepDetected);
        // 2FA unlock logic would go here
      } else if (!(await appleIdService.check())) {
        this.logger.log(this.locale.accountLocked);
        if (!(await appleIdService.unlock())) {
          this.logger.error(this.locale.UnlockFail);
          await this.sendNotification(this.locale.UnlockFail);
          jobSuccess = false;
          return;
        }
      }

      this.logger.log(this.locale.checkComplete);

      const newPassword = appleIdService.getPassword();
      const passwordChanged = originalPassword !== newPassword;

      // Update account if password changed
      if (passwordChanged) {
        await this.updateAccount(config.username, newPassword);
        await this.sendNotification(
          `${this.locale.updateSuccess}\n${this.locale.newPassword}${newPassword}`,
        );
      } else {
        await this.updateAccount(config.username, '');
      }

      // Delete devices if enabled
      if (config.enable_delete_devices || config.check_password_correct) {
        if (await appleIdService.loginAppleId()) {
          if (config.enable_delete_devices) {
            await appleIdService.deleteDevices();
          }
        } else {
          this.logger.error(this.locale.LoginFail);
          jobSuccess = false;
        }
      }
    } catch (error) {
      this.logger.error(`${this.locale.unknownError}: ${error.message}`);
      await this.browserService.saveErrorInfo();
      await this.apiService.updateMessage(config.username, this.locale.unknownError);
      await this.sendNotification(this.locale.unknownError);
      jobSuccess = false;
    } finally {
      await this.browserService.close();
    }

    // Schedule next run
    if (config.fail_retry) {
      this.nextRunMinutes = jobSuccess ? config.check_interval : 5;
    } else {
      this.nextRunMinutes = config.check_interval;
    }

    this.logger.log(this.locale.nextRun(this.nextRunMinutes));
  }

  private async updateAccount(username: string, password: string): Promise<void> {
    if (await this.apiService.updateAccount(username, password, true, this.locale.normal)) {
      this.logger.log(this.locale.updateSuccess);
    } else {
      this.logger.error(this.locale.updateFail);
    }
  }

  private async sendNotification(content: string): Promise<void> {
    if (!this.taskConfig) return;

    await this.notificationService.send(
      {
        username: this.taskConfig.username,
        tgBotToken: this.taskConfig.tg_bot_token,
        tgChatId: this.taskConfig.tg_chat_id,
        wxPusherId: this.taskConfig.wx_pusher_id,
        webhook: this.taskConfig.webhook,
      },
      content,
    );
  }

  getNextRunMinutes(): number {
    return this.nextRunMinutes;
  }
}
