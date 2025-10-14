import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    sendMessage(senderId: string, receiverId: string, content: string, attachments?: any[], isSystem?: boolean): Promise<{
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
    getMessages(userId1: string, userId2: string): Promise<({
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
        isSystem: boolean;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getConversations(userId: string): Promise<any[]>;
    createInitialChatMessage(freelancerId: string, clientId: string): Promise<{
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
}
