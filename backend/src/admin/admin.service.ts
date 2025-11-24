import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

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
        return users;
    }

    async banUser(userId: string, adminId: string) {
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

    async unbanUser(userId: string, adminId: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: false },
        });

        await this.logAction(adminId, 'UNBAN_USER', userId, `Unbanned user ${user.email}`);
        return user;
    }

    async sendCustomNotification(adminId: string, userId: string, title: string, message: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        await this.notificationsService.createNotification(
            userId,
            'SYSTEM_NOTIFICATION',
            title,
            message,
        );

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

    async deleteTask(taskId: string, adminId: string) {
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

        const userGrowthData: { name: string; users: number }[] = [];
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

    async getAllRatings() {
        return this.prisma.rating.findMany({
            include: {
                freelancer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
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

    async deleteRating(ratingId: string, adminId: string) {
        const rating = await this.prisma.rating.findUnique({
            where: { id: ratingId },
            include: {
                freelancer: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });

        if (!rating) {
            throw new Error('Rating not found');
        }

        const deletedRating = await this.prisma.rating.delete({
            where: { id: ratingId },
        });

        // Recalculate freelancer's average rating
        const freelancerRatings = await this.prisma.rating.findMany({
            where: { freelancerId: rating.freelancerId },
        });

        if (freelancerRatings.length > 0) {
            const avgRating = freelancerRatings.reduce((sum, r) => sum + r.score, 0) / freelancerRatings.length;
            await this.prisma.user.update({
                where: { id: rating.freelancerId },
                data: { rating: Math.round(avgRating * 10) / 10 },
            });
        } else {
            await this.prisma.user.update({
                where: { id: rating.freelancerId },
                data: { rating: null },
            });
        }

        await this.logAction(adminId, 'DELETE_RATING', ratingId, `Deleted rating for ${rating.freelancer.fullName}`);
        return deletedRating;
    }

    private async logAction(userId: string, action: string, targetId?: string, details?: string): Promise<void> {
        await this.prisma.actionLog.create({
            data: {
                userId,
                action,
                targetId,
                details,
            },
        });
    }
}
