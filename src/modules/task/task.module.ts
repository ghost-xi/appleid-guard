import { Module, DynamicModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { ApiModule } from '../api/api.module';
import { BrowserModule } from '../browser/browser.module';
import { AppleIdModule } from '../appleid/appleid.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ScheduleModule.forRoot()],
})
export class TaskModule {
  static forRoot(
    apiUrl: string,
    apiKey: string,
    taskId: string,
    lang: string,
    debug: boolean,
  ): DynamicModule {
    return {
      module: TaskModule,
      imports: [
        ScheduleModule.forRoot(),
        ApiModule.forRoot(apiUrl, apiKey),
        BrowserModule,
        AppleIdModule,
        NotificationModule,
      ],
      providers: [
        {
          provide: TaskService,
          useFactory: (apiService, browserService, notificationService, schedulerRegistry) => {
            return new TaskService(
              apiService,
              browserService,
              notificationService,
              schedulerRegistry,
              taskId,
              lang,
              debug,
            );
          },
          inject: ['ApiService', 'BrowserService', 'NotificationService', 'SchedulerRegistry'],
        },
      ],
      exports: [TaskService],
    };
  }
}
