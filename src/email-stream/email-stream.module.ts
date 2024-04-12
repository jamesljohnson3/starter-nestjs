import { Module } from '@nestjs/common';
import { EmailStreamController } from './email-stream.controller';
import { EmailStreamService } from './email-stream.service';

@Module({
  controllers: [EmailStreamController],
  providers: [EmailStreamService],
})
export class EmailStreamModule {}
