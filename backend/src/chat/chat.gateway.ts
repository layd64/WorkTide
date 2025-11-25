import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token || client.handshake.query?.token as string;

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub || payload.userId; // Handle standard sub or custom userId claim

            if (userId) {
                client.join(userId);
                // Store userId in socket instance for later use if needed
                (client as any).userId = userId;
            } else {
                client.disconnect();
            }
        } catch (error) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() data: { senderId: string; receiverId: string; content: string; attachments?: any[] },
        @ConnectedSocket() client: Socket,
    ) {
        const message = await this.chatService.sendMessage(
            data.senderId,
            data.receiverId,
            data.content,
            data.attachments,
        );

        this.server.to(data.receiverId).emit('newMessage', message);
        this.server.to(data.senderId).emit('newMessage', message);

        return message;
    }

    sendNotification(userId: string, notification: any) {
        this.server.to(userId).emit('notification', notification);
    }
}
