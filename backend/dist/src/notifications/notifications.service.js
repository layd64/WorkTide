"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_gateway_1 = require("../chat/chat.gateway");
let NotificationsService = class NotificationsService {
    prisma;
    chatGateway;
    constructor(prisma, chatGateway) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
    }
    async createNotification(userId, type, title, message, relatedId) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                relatedId,
            },
        });
        this.chatGateway.sendNotification(userId, notification);
        return notification;
    }
    async getUserNotifications(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(id) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async deleteNotification(id) {
        try {
            return await this.prisma.notification.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                return null;
            }
            throw error;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map