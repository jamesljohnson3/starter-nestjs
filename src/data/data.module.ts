// data.module.ts

import { Module } from '@nestjs/common';
import { DataService } from './data.service';

@Module({
  providers: [DataService],
  exports: [DataService], // Export DataService to make it available in other modules
})
export class DataModule {}
