import { Module } from '@nestjs/common';
import { VideoStreamingController } from './videostreaming.controller';
import { VideoStreamingService } from './videostreaming.service';

@Module({
  controllers: [VideoStreamingController],
  providers: [VideoStreamingService],
})
export class VideoStreamingModule {}
