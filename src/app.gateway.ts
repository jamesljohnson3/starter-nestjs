/* eslint-disable @typescript-eslint/no-empty-function */
// app.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor() {}

  // Initialize gateway
  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');

    // Send "Hello, World!" message every 10 seconds
    setInterval(() => {
      const message = 'Hello, World!';
      this.server.emit('hello', message); // Emit 'hello' event to all connected clients
    }, 10000); // 10 seconds interval
  }
}
