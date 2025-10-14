import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private loggingService;
    constructor(prisma: PrismaService, jwtService: JwtService, loggingService: LoggingService);
    validateUser(email: string, password: string): Promise<any>;
    register(userData: any): Promise<{
        user: {
            id: string;
            email: string;
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
        };
        token: string;
    }>;
    login(user: any): Promise<{
        access_token: string;
        token: string;
        user: any;
    }>;
}
