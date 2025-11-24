import { Module, DynamicModule } from '@nestjs/common';
import { ApiService } from './api.service';

@Module({})
export class ApiModule {
  static forRoot(apiUrl: string, apiKey: string): DynamicModule {
    return {
      module: ApiModule,
      providers: [
        {
          provide: ApiService,
          useFactory: () => new ApiService(apiUrl, apiKey),
        },
      ],
      exports: [ApiService],
    };
  }
}
