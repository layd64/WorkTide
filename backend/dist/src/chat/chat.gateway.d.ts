import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSendMessage(data: {
        senderId: string;
        receiverId: string;
        content: string;
        attachments?: any[];
    }, client: Socket): Promise<{
        sender: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
        receiver: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        senderId: string;
        receiverId: string;
        isSystem: boolean;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    sendNotification(userId: string, notification: any): void;
}
