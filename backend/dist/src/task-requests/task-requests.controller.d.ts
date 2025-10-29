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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        clientId: string;
        taskId: string;
        freelancerId: string;
    }>;
    getFreelancerRequests(freelancerId: string): Promise<({
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
        client: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        clientId: string;
        taskId: string;
        freelancerId: string;
    })[]>;
    acceptRequest(requestId: string, req: any): Promise<{
        request: {
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            clientId: string;
            taskId: string;
            freelancerId: string;
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
