import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getAllUsers(): Promise<{
        id: string;
        email: string;
        fullName: string;
        userType: string;
        createdAt: Date;
        isBanned: boolean;
    }[]>;
    banUser(userId: string, adminId: string): Promise<{
        id: string;
        email: string;
        password: string;
        fullName: string;
        userType: string;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        bio: string | null;
        legacySkills: string[];
        hourlyRate: number | null;
        rating: number | null;
        completedJobs: number | null;
        location: string | null;
        imageUrl: string | null;
        languages: string[];
        education: import("@prisma/client/runtime/library").JsonValue[];
        experience: import("@prisma/client/runtime/library").JsonValue[];
        isHidden: boolean;
        isAvatarVisible: boolean;
        isBanned: boolean;
    }>;
    unbanUser(userId: string, adminId: string): Promise<{
        id: string;
        email: string;
        password: string;
        fullName: string;
        userType: string;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        bio: string | null;
        legacySkills: string[];
        hourlyRate: number | null;
        rating: number | null;
        completedJobs: number | null;
        location: string | null;
        imageUrl: string | null;
        languages: string[];
        education: import("@prisma/client/runtime/library").JsonValue[];
        experience: import("@prisma/client/runtime/library").JsonValue[];
        isHidden: boolean;
        isAvatarVisible: boolean;
        isBanned: boolean;
    }>;
    sendCustomNotification(adminId: string, userId: string, title: string, message: string): Promise<{
        success: boolean;
    }>;
    getAllTasks(): Promise<({
        client: {
            id: string;
            email: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        skills: string[];
        description: string;
        budget: number;
        status: string;
        clientId: string;
    })[]>;
    deleteTask(taskId: string, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string | null;
        skills: string[];
        description: string;
        budget: number;
        status: string;
        clientId: string;
    }>;
    getAnalytics(): Promise<{
        totalUsers: number;
        totalProjects: number;
        totalTasks: number;
        userBreakdown: {
            freelancers: number;
            clients: number;
        };
        taskStatusData: {
            name: string;
            value: number;
        }[];
        userGrowthData: {
            name: string;
            users: number;
        }[];
    }>;
    getLogs(): Promise<({
        user: {
            email: string;
            fullName: string;
            userType: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        targetId: string | null;
        details: string | null;
    })[]>;
    getAllRatings(): Promise<({
        client: {
            id: string;
            email: string;
            fullName: string;
        };
        freelancer: {
            id: string;
            email: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        clientId: string;
        score: number;
        comment: string | null;
        freelancerId: string;
    })[]>;
    deleteRating(ratingId: string, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        clientId: string;
        score: number;
        comment: string | null;
        freelancerId: string;
    }>;
    private logAction;
}
