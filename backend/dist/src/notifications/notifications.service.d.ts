import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
export declare class NotificationsService {
    private prisma;
    private chatGateway;
    constructor(prisma: PrismaService, chatGateway: ChatGateway);
    createNotification(userId: string, type: string, title: string, message: string, relatedId?: string): Promise<{
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        relatedId: string | null;
        isRead: boolean;
        createdAt: Date;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        relatedId: string | null;
        isRead: boolean;
        createdAt: Date;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        relatedId: string | null;
        isRead: boolean;
        createdAt: Date;
    }>;
    deleteNotification(id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        relatedId: string | null;
        isRead: boolean;
        createdAt: Date;
    } | null>;
}
