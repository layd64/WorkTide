import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
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
