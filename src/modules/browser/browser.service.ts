import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { USER_AGENTS } from '../../common/constants';

export interface BrowserConfig {
  headless: boolean;
  proxy?: string;
  webdriver?: string;
}

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser;
  private context: BrowserContext;
  public page: Page;

  async launch(config: BrowserConfig): Promise<boolean> {
    try {
      const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      const launchOptions: any = {
        headless: config.headless,
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--ignore-certificate-errors',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--window-size=1920,1080',
        ],
      };

      if (config.proxy) {
        const [protocol, address] = config.proxy.split('://');
        const [host, port] = address.split(':');
        launchOptions.proxy = {
          server: `${protocol}://${host}:${port}`,
        };
      }

      this.browser = await chromium.launch(launchOptions);

      this.context = await this.browser.newContext({
        userAgent: randomUserAgent,
        viewport: { width: 1920, height: 1080 },
      });

      // Hide webdriver flag
      await this.context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(30000);

      return true;
    } catch (error) {
      this.logger.error(`Failed to launch browser: ${error.message}`);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      this.logger.error(`Failed to close browser: ${error.message}`);
    }
  }

  async saveErrorInfo(): Promise<void> {
    try {
      if (this.page) {
        await this.page.screenshot({ path: 'error.png', fullPage: true });
        const html = await this.page.content();
        const fs = await import('fs');
        fs.writeFileSync('error.html', html, 'utf-8');
        this.logger.error('Error page saved to error.html and error.png');
      }
    } catch (error) {
      this.logger.error('Failed to save error info');
    }
  }

  async getIP(): Promise<string> {
    try {
      await this.page.goto('https://api.ip.sb/ip');
      const ip = await this.page.locator('pre').textContent();
      this.logger.log(`IP: ${ip}`);
      return ip || '';
    } catch (error) {
      try {
        await this.page.goto('https://myip.ipip.net/s');
        const ip = await this.page.locator('pre').textContent();
        this.logger.log(`IP: ${ip}`);
        return ip || '';
      } catch {
        this.logger.error('Failed to get IP');
        return '';
      }
    }
  }
}
