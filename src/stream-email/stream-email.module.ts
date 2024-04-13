// stream-stream.module.ts
import { Module } from '@nestjs/common';
import { StreamEmailController } from './stream-email.controller';

@Module({
  controllers: [StreamEmailController],
})
export class StreamEmailModule {}
