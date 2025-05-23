import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    sendMessage(senderId: string, receiverId: string, content: string): Promise<{
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
    })[]>;
    getConversations(userId: string): Promise<any[]>;
}
