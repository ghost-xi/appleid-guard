import { Module } from '@nestjs/common';
import { AppleIdService } from './appleid.service';
import { BrowserModule } from '../browser/browser.module';

@Module({
  imports: [BrowserModule],
  providers: [AppleIdService],
  exports: [AppleIdService],
})
export class AppleIdModule {}
