import { TaskRequestsService } from './task-requests.service';
export declare class TaskRequestsController {
    private taskRequestsService;
    constructor(taskRequestsService: TaskRequestsService);
    createRequest(req: any, body: {
        taskId: string;
        freelancerId: string;
    }): Promise<{
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
    acceptRequest(requestId: string, req: any): Promise<{
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
    rejectRequest(requestId: string, req: any): Promise<{
        message: string;
    }>;
    cancelRequest(requestId: string, req: any): Promise<{
        message: string;
    }>;
}
