import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    signup(data: {
        email: string;
        password: string;
        fullName: string;
        userType: 'freelancer' | 'client';
    }): Promise<{
        user: {
            rating: number | null;
            id: string;
            email: string;
            fullName: string;
            userType: string;
            createdAt: Date;
            updatedAt: Date;
            title: string | null;
            bio: string | null;
            skills: string[];
            hourlyRate: number | null;
            completedJobs: number | null;
            location: string | null;
            imageUrl: string | null;
            languages: string[];
            education: import("@prisma/client/runtime/library").JsonValue[];
            experience: import("@prisma/client/runtime/library").JsonValue[];
            isHidden: boolean;
            isAvatarVisible: boolean;
        };
        token: string;
    }>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    getProfile(req: any): Promise<{
        rating: number | null;
        id: string;
        email: string;
        fullName: string;
        userType: string;
        createdAt: Date;
        title: string | null;
        bio: string | null;
        skills: string[];
        hourlyRate: number | null;
        completedJobs: number | null;
        location: string | null;
        languages: string[];
        education: import("@prisma/client/runtime/library").JsonValue[];
        experience: import("@prisma/client/runtime/library").JsonValue[];
    } | null>;
}
