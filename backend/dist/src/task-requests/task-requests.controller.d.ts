import { TaskRequestsService } from './task-requests.service';
export declare class TaskRequestsController {
    private taskRequestsService;
    constructor(taskRequestsService: TaskRequestsService);
    createRequest(req: any, body: {
        taskId: string;
        freelancerId: string;
    }): Promise<{
        task: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            title: string;
            description: string;
            budget: number;
            skills: string[];
            imageUrl: string | null;
        };
        freelancer: {
            id: string;
            imageUrl: string | null;
            fullName: string;
        };
        client: {
            id: string;
            imageUrl: string | null;
            fullName: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        clientId: string;
    }>;
    getFreelancerRequests(freelancerId: string): Promise<({
        task: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            title: string;
            description: string;
            budget: number;
            skills: string[];
            imageUrl: string | null;
        };
        client: {
            id: string;
            imageUrl: string | null;
            fullName: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        clientId: string;
    })[]>;
    acceptRequest(requestId: string, req: any): Promise<{
        request: {
            task: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                clientId: string;
                title: string;
                description: string;
                budget: number;
                skills: string[];
                imageUrl: string | null;
            };
            freelancer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string | null;
                imageUrl: string | null;
                email: string;
                password: string;
                fullName: string;
                userType: string;
                bio: string | null;
                legacySkills: string[];
                hourlyRate: number | null;
                rating: number | null;
                completedJobs: number | null;
                location: string | null;
                languages: string[];
                education: import("@prisma/client/runtime/library").JsonValue[];
                experience: import("@prisma/client/runtime/library").JsonValue[];
                isHidden: boolean;
                isAvatarVisible: boolean;
                isBanned: boolean;
            };
            client: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string | null;
                imageUrl: string | null;
                email: string;
                password: string;
                fullName: string;
                userType: string;
                bio: string | null;
                legacySkills: string[];
                hourlyRate: number | null;
                rating: number | null;
                completedJobs: number | null;
                location: string | null;
                languages: string[];
                education: import("@prisma/client/runtime/library").JsonValue[];
                experience: import("@prisma/client/runtime/library").JsonValue[];
                isHidden: boolean;
                isAvatarVisible: boolean;
                isBanned: boolean;
            };
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            freelancerId: string;
            clientId: string;
        };
        chat: {
            partnerId: string;
            partnerName: string;
        };
    }>;
    rejectRequest(requestId: string, req: any): Promise<{
        message: string;
    }>;
    cancelRequest(requestId: string, req: any): Promise<{
        message: string;
    }>;
}
