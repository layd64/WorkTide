import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TaskRequestsService {
    private prisma;
    private notificationsService;
    private loggingService;
    private chatGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, loggingService: LoggingService, chatGateway: ChatGateway);
    createRequest(clientId: string, taskId: string, freelancerId: string): Promise<{
        freelancer: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
        client: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
        task: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        clientId: string;
        freelancerId: string;
        taskId: string;
    }>;
    getFreelancerRequests(freelancerId: string): Promise<({
        client: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
        task: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        clientId: string;
        freelancerId: string;
        taskId: string;
    })[]>;
    acceptRequest(requestId: string, freelancerId: string): Promise<{
        request: {
            freelancer: {
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
            };
            client: {
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
            };
            task: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            clientId: string;
            freelancerId: string;
            taskId: string;
        };
        chat: {
            partnerId: string;
            partnerName: string;
        };
    }>;
    rejectRequest(requestId: string, freelancerId: string): Promise<{
        message: string;
    }>;
    cancelRequest(requestId: string, clientId: string): Promise<{
        message: string;
    }>;
}
