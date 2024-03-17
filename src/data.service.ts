// data.service.ts
import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Injectable()
export class DataService {
  constructor(private readonly appGateway: AppGateway) {}

  // Method to update data and trigger real-time update
  updateDataAndNotifyClients(newData: any) {
    // Update data here...

    // Notify clients about the update
    this.appGateway.sendRealTimeUpdate(newData);
  }

  // Method to send "Hello, World!" message every 10 seconds
  sendHelloWorldPeriodically() {
    setInterval(() => {
      const message = 'Hello, World!';
      this.appGateway.sendRealTimeUpdate(message);
    }, 10000); // 10 seconds interval
  }
}
