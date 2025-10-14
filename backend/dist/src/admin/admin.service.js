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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AdminService = class AdminService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getAllUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                userType: true,
                isBanned: true,
                createdAt: true,
            },
        });
        console.log(`Found ${users.length} users`);
        return users;
    }
    async banUser(userId, adminId) {
        const userToBan = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!userToBan) {
            throw new Error('User not found');
        }
        if (userToBan.userType === 'admin') {
            throw new Error('Cannot ban an admin user');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true },
        });
        await this.logAction(adminId, 'BAN_USER', userId, `Banned user ${user.email}`);
        return user;
    }
    async unbanUser(userId, adminId) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: false },
        });
        await this.logAction(adminId, 'UNBAN_USER', userId, `Unbanned user ${user.email}`);
        return user;
    }
    async sendCustomNotification(adminId, userId, title, message) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        await this.notificationsService.createNotification(userId, 'SYSTEM_NOTIFICATION', title, message);
        await this.logAction(adminId, 'SEND_NOTIFICATION', userId, `Sent notification to ${user.email}: ${title}`);
        return { success: true };
    }
    async getAllTasks() {
        return this.prisma.task.findMany({
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async deleteTask(taskId, adminId) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            throw new Error('Task not found');
        }
        await this.prisma.taskApplication.deleteMany({
            where: { taskId },
        });
        await this.prisma.taskRequest.deleteMany({
            where: { taskId },
        });
        const deletedTask = await this.prisma.task.delete({
            where: { id: taskId },
        });
        await this.logAction(adminId, 'DELETE_TASK', taskId, `Deleted task: ${task.title}`);
        return deletedTask;
    }
    async getAnalytics() {
        const totalUsers = await this.prisma.user.count();
        const totalProjects = await this.prisma.project.count();
        const totalTasks = await this.prisma.task.count();
        const freelancers = await this.prisma.user.count({ where: { userType: 'freelancer' } });
        const clients = await this.prisma.user.count({ where: { userType: 'client' } });
        const tasksByStatus = await this.prisma.task.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });
        const taskStatusData = tasksByStatus.map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
            value: item._count.status,
        }));
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        const users = await this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const userGrowthData = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const count = users.filter(u => {
                const uDate = new Date(u.createdAt);
                return uDate.getMonth() === d.getMonth() && uDate.getFullYear() === d.getFullYear();
            }).length;
            userGrowthData.push({
                name: monthName,
                users: count,
            });
        }
        return {
            totalUsers,
            totalProjects,
            totalTasks,
            userBreakdown: {
                freelancers,
                clients,
            },
            taskStatusData,
            userGrowthData,
        };
    }
    async getLogs() {
        return this.prisma.actionLog.findMany({
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        userType: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async logAction(userId, action, targetId, details) {
        await this.prisma.actionLog.create({
            data: {
                userId,
                action,
                targetId,
                details,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map