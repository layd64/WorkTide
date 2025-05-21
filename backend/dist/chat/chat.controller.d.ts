import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getHistory(userId1: string, userId2: string): Promise<({
        sender: {
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
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getConversations(userId: string): Promise<any[]>;
}
