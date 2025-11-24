import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'playwright';
import { BrowserService } from '../browser/browser.service';
import { SecurityAnswer } from '../../common/types';
import { URLS, SELECTORS } from '../../common/constants';
import { generatePassword } from '../../common/utils';

@Injectable()
export class AppleIdService {
  private readonly logger = new Logger(AppleIdService.name);
  private page: Page;

  constructor(
    private readonly username: string,
    private password: string,
    private readonly dob: string,
    private readonly answers: SecurityAnswer,
    private readonly browserService: BrowserService,
  ) {}

  async init(): Promise<void> {
    this.page = this.browserService.page;
  }

  private getAnswer(question: string): string {
    for (const key in this.answers) {
      if (question.includes(key)) {
        return this.answers[key];
      }
    }
    return '';
  }

  async refresh(): Promise<boolean> {
    try {
      await this.page.goto(URLS.IFORGOT);
      await this.page.waitForSelector(SELECTORS.APPLEID_INPUT, { timeout: 10000 });
      return true;
    } catch (error) {
      this.logger.error('Failed to refresh page');
      return false;
    }
  }

  async login(): Promise<boolean> {
    if (!(await this.refresh())) {
      return false;
    }

    try {
      await this.page.waitForSelector(SELECTORS.APPLEID_INPUT, { timeout: 7000 });
      await this.page.fill(SELECTORS.APPLEID_INPUT, this.username);
      await this.page.waitForTimeout(1000);

      // Process captcha
      let captchaAttempts = 0;
      while (captchaAttempts < 10) {
        const captchaInput = await this.page.locator(SELECTORS.CAPTCHA_INPUT);
        if (await captchaInput.isVisible()) {
          // For now, we'll need manual intervention for captcha
          // In production, you could integrate with OCR service
          this.logger.warn('Captcha detected - manual intervention required');
          await this.page.waitForTimeout(5000);
        }

        await this.page.click(SELECTORS.BUTTON_PRIMARY);
        await this.page.waitForTimeout(2000);

        // Check if captcha is still present
        const errorVisible = await this.page
          .locator('idms-error')
          .isVisible()
          .catch(() => false);
        if (!errorVisible) {
          this.logger.log('Captcha passed');
          break;
        }
        captchaAttempts++;
      }

      return true;
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      return false;
    }
  }

  async check(): Promise<boolean> {
    try {
      const dateInput = await this.page.locator(SELECTORS.DATE_INPUT).isVisible();
      return !dateInput; // Not locked if no date input required
    } catch {
      return true; // Not locked
    }
  }

  async check2FA(): Promise<boolean> {
    try {
      const phoneNumber = await this.page.locator('#phoneNumber').isVisible();
      return phoneNumber; // 2FA enabled
    } catch {
      return false; // 2FA not enabled
    }
  }

  async processDOB(): Promise<boolean> {
    try {
      const dateInput = await this.page.locator(SELECTORS.DATE_INPUT);
      if (await dateInput.isVisible({ timeout: 5000 })) {
        await this.page.waitForTimeout(3000);
        await dateInput.fill(this.dob);
        await this.page.waitForTimeout(100);
        await this.page.keyboard.press('Enter');

        // Check for errors
        const errorMsg = await this.page
          .locator('.form-message')
          .isVisible()
          .catch(() => false);
        if (errorMsg) {
          this.logger.error('Wrong date of birth');
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async processSecurityQuestions(): Promise<boolean> {
    try {
      const questions = await this.page.locator(SELECTORS.QUESTION).all();
      if (questions.length < 2) {
        this.logger.error('Failed to get security questions');
        return false;
      }

      const question1 = await questions[0].textContent();
      const question2 = await questions[1].textContent();

      const answer1 = this.getAnswer(question1 || '');
      const answer2 = this.getAnswer(question2 || '');

      if (!answer1 || !answer2) {
        this.logger.error('Security answers not found');
        return false;
      }

      const answerInputs = await this.page.locator(SELECTORS.ANSWER_INPUT).all();
      await answerInputs[0].fill(answer1);
      await this.page.waitForTimeout(1000);
      await answerInputs[1].fill(answer2);
      await this.page.waitForTimeout(1000);
      await this.page.keyboard.press('Enter');

      // Check for errors
      const errorMsg = await this.page
        .locator('.form-message')
        .isVisible()
        .catch(() => false);
      if (errorMsg) {
        this.logger.error('Wrong security answers');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to process security questions: ${error.message}`);
      return false;
    }
  }

  async processPassword(): Promise<boolean> {
    try {
      const passwordInputs = await this.page.locator(SELECTORS.PASSWORD_INPUT).all();
      if (passwordInputs.length === 0) {
        this.logger.error('Password input not found');
        return false;
      }

      const newPassword = generatePassword();
      for (const input of passwordInputs) {
        await input.fill(newPassword);
      }

      await this.page.waitForTimeout(1000);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(3000);

      // Check for errors
      const errorMsg = await this.page
        .locator(SELECTORS.ERROR_MESSAGE)
        .isVisible()
        .catch(() => false);
      if (errorMsg) {
        this.logger.error('Password change rejected by Apple');
        return false;
      }

      this.password = newPassword;
      this.logger.log(`Password updated: ${newPassword}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to process password: ${error.message}`);
      return false;
    }
  }

  async unlock(): Promise<boolean> {
    if (await this.check()) {
      return true; // Already unlocked
    }

    try {
      if (!(await this.processDOB())) {
        return false;
      }

      if (!(await this.processSecurityQuestions())) {
        return false;
      }

      await this.page.waitForTimeout(2000);

      // Click password change if available
      const pwdChange = await this.page
        .locator('.pwdChange')
        .isVisible()
        .catch(() => false);
      if (pwdChange) {
        await this.page.click('.pwdChange');
      }

      return await this.processPassword();
    } catch (error) {
      this.logger.error(`Unlock failed: ${error.message}`);
      return false;
    }
  }

  async loginAppleId(): Promise<boolean> {
    this.logger.log('Start logging in Apple ID');
    try {
      await this.page.goto(URLS.APPLEID_SIGNIN);
      await this.page.waitForTimeout(2000);

      const iframe = await this.page.frameLocator('iframe').first();
      await iframe.locator('#account_name_text_field').fill(this.username);
      await this.page.keyboard.press('Enter');

      await this.page.waitForTimeout(1000);
      await iframe.locator('#password_text_field').fill(this.password);
      await this.page.keyboard.press('Enter');

      await this.page.waitForTimeout(5000);

      // Check for error
      const errMsg = await iframe
        .locator('#errMsg')
        .isVisible()
        .catch(() => false);
      if (errMsg) {
        this.logger.error('Login failed');
        return false;
      }

      this.logger.log('Login successful');
      return true;
    } catch (error) {
      this.logger.error(`Login Apple ID failed: ${error.message}`);
      return false;
    }
  }

  async deleteDevices(): Promise<boolean> {
    this.logger.log('Start removing devices');
    try {
      await this.page.goto(URLS.APPLEID_DEVICES);
      await this.page.waitForTimeout(3000);

      const devices = await this.page.locator('.button-expand').all();
      if (devices.length === 0) {
        this.logger.log('No devices to remove');
        return true;
      }

      this.logger.log(`Total devices: ${devices.length}`);

      for (let i = 0; i < devices.length; i++) {
        await devices[i].click();
        await this.page.waitForTimeout(1000);
        await this.page.click('.button-secondary');
        await this.page.waitForTimeout(1000);
        await this.page.click('button:has-text("Remove")');
        await this.page.waitForTimeout(2000);
      }

      this.logger.log('Device removal complete');
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete devices: ${error.message}`);
      return false;
    }
  }

  getPassword(): string {
    return this.password;
  }
}
