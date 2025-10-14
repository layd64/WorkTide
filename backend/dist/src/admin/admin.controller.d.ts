import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllUsers(): Promise<{
        id: string;
        email: string;
        fullName: string;
        userType: string;
        createdAt: Date;
        isBanned: boolean;
    }[]>;
    banUser(id: string, req: any): Promise<{
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
    unbanUser(id: string, req: any): Promise<{
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
    sendNotification(body: {
        userId: string;
        title: string;
        message: string;
    }, req: any): Promise<{
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
    deleteTask(id: string, req: any): Promise<{
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
}
