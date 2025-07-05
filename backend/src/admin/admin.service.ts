import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

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

    async getAnalytics() {
        const totalUsers = await this.prisma.user.count();
        const totalProjects = await this.prisma.project.count();
        const totalTasks = await this.prisma.task.count();

        // Users by type
        const freelancers = await this.prisma.user.count({ where: { userType: 'freelancer' } });
        const clients = await this.prisma.user.count({ where: { userType: 'client' } });

        // Task Status Distribution
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

        // User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of the month

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

    private async logAction(userId: string, action: string, targetId?: string, details?: string) {
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
