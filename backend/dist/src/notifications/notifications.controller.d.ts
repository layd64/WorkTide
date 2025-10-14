import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
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
