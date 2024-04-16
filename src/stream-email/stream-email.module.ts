// stream-stream.module.ts
import { Module } from '@nestjs/common';
import { StreamEmailController } from './stream-email.controller';
import { StreamEmailController2 } from './stream-email.controller';
import { StreamEmailController3 } from './stream-email.controller';
import { StreamEmailController4 } from './stream-email.controller';
import { StreamEmailController5 } from './stream-email.controller';
import { StreamEmailController6 } from './stream-email.controller';
import { StreamEmailController7 } from './stream-email.controller';

@Module({
  controllers: [
    StreamEmailController,
    StreamEmailController2,
    StreamEmailController3,
    StreamEmailController4,
    StreamEmailController5,
    StreamEmailController6,
    StreamEmailController7,
  ],
})
export class StreamEmailModule {}
