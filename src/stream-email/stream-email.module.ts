// stream-stream.module.ts
import { Module } from '@nestjs/common';
import { StreamEmailController } from './stream-email.controller';
import { StreamEmailController2 } from './stream-email.controller';
import { StreamEmailController3 } from './stream-email.controller';
import { StreamEmailController4 } from './stream-email.controller';

@Module({
  controllers: [
    StreamEmailController,
    StreamEmailController2,
    StreamEmailController3,
    StreamEmailController4,
  ],
})
export class StreamEmailModule {}
