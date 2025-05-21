import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    register(userData: any): Promise<{
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
    login(user: any): Promise<{
        token: string;
        user: any;
    }>;
}
