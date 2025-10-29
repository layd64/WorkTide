import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
export declare class NotificationsService {
    private prisma;
    private chatGateway;
    constructor(prisma: PrismaService, chatGateway: ChatGateway);
    createNotification(userId: string, type: string, title: string, message: string, relatedId?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        userId: string;
        type: string;
        relatedId: string | null;
        isRead: boolean;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        userId: string;
        type: string;
        relatedId: string | null;
        isRead: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        userId: string;
        type: string;
        relatedId: string | null;
        isRead: boolean;
    }>;
    deleteNotification(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        userId: string;
        type: string;
        relatedId: string | null;
        isRead: boolean;
    } | null>;
}
