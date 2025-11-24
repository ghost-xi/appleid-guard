import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { TaskService } from './modules/task/task.service';
import { ApiService } from './modules/api/api.service';
import { BrowserService } from './modules/browser/browser.service';
import { NotificationService } from './modules/notification/notification.service';
import { SchedulerRegistry } from '@nestjs/schedule';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Get environment variables
  const apiUrl =
    process.env.API_URL || process.argv.find((arg) => arg.startsWith('-api_url='))?.split('=')[1];
  const apiKey =
    process.env.API_KEY || process.argv.find((arg) => arg.startsWith('-api_key='))?.split('=')[1];
  const taskId =
    process.env.TASK_ID || process.argv.find((arg) => arg.startsWith('-taskid='))?.split('=')[1];
  const lang =
    process.env.LANG ||
    process.argv.find((arg) => arg.startsWith('-lang='))?.split('=')[1] ||
    'zh_cn';
  const debug = process.env.DEBUG === 'true' || process.argv.includes('-debug');

  if (!apiUrl || !apiKey || !taskId) {
    logger.error('Missing required parameters: API_URL, API_KEY, TASK_ID');
    logger.error(
      'Usage: npm start -- -api_url=<url> -api_key=<key> -taskid=<id> [-lang=<lang>] [-debug]',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  // Create services manually
  const apiService = new ApiService(apiUrl, apiKey);
  const browserService = new BrowserService();
  const notificationService = new NotificationService();
  const schedulerRegistry = app.get(SchedulerRegistry);

  const taskService = new TaskService(
    apiService,
    browserService,
    notificationService,
    schedulerRegistry,
    taskId,
    lang,
    debug,
  );

  // Execute task immediately
  await taskService.executeTask();

  // Schedule next execution
  const scheduleNextRun = async () => {
    const nextRunMinutes = taskService.getNextRunMinutes();
    setTimeout(
      async () => {
        await taskService.executeTask();
        scheduleNextRun();
      },
      nextRunMinutes * 60 * 1000,
    );
  };

  scheduleNextRun();
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
