import { Module } from '@nestjs/common';
import { AppleIdService } from './appleid.service';
import { OcrService } from './ocr.service';
import { BrowserModule } from '../browser/browser.module';

@Module({
  imports: [BrowserModule],
  providers: [AppleIdService, OcrService],
  exports: [AppleIdService, OcrService],
})
export class AppleIdModule {}
