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

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            client.join(userId);
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
