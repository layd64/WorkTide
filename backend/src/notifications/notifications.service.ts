import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private chatGateway: ChatGateway,
    ) { }

    async createNotification(
        userId: string,
        type: string,
        title: string,
        message: string,
        relatedId?: string,
    ) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                relatedId,
            },
        });

        // Send real-time notification
        this.chatGateway.sendNotification(userId, notification);

        return notification;
    }

    async getUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async deleteNotification(id: string) {
        try {
            return await this.prisma.notification.delete({
                where: { id },
            });
        } catch (error) {
            // P2025 is Prisma's "Record to delete does not exist" error
            if (error.code === 'P2025') {
                return null; // Or throw NotFoundException if you prefer 404
            }
            throw error;
        }
    }
}
