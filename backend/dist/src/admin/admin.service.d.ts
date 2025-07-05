import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
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
        skills: string[];
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
        skills: string[];
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
    private logAction;
}
