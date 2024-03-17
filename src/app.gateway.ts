import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendRealTimeUpdate(data: any) {
    this.server.emit('realTimeUpdate', data);
  }
}
