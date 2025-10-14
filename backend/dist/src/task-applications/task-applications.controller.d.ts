import { TaskApplicationsService } from './task-applications.service';
export declare class TaskApplicationsController {
    private readonly taskApplicationsService;
    constructor(taskApplicationsService: TaskApplicationsService);
    applyToTask(req: any, taskId: string, data: {
        coverLetter?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
    getTaskApplications(req: any, taskId: string): Promise<({
        freelancer: {
            id: string;
            title: string | null;
            skills: {
                id: string;
                name: string;
            }[];
            imageUrl: string | null;
            fullName: string;
            hourlyRate: number | null;
            rating: number | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        coverLetter: string | null;
    })[]>;
    getFreelancerApplications(req: any): Promise<({
        task: {
            client: {
                id: string;
                imageUrl: string | null;
                fullName: string;
            };
        } & {
            id: string;
            title: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            clientId: string;
            description: string;
            budget: number;
            skills: string[];
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        coverLetter: string | null;
    })[]>;
    updateApplicationStatus(req: any, applicationId: string, data: {
        status: 'accepted' | 'rejected';
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
    assignFreelancer(req: any, applicationId: string): Promise<{
        freelancerId: string;
        application: {
            id: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            taskId: string;
            freelancerId: string;
            coverLetter: string | null;
        };
        task: {
            id: string;
            title: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            clientId: string;
            description: string;
            budget: number;
            skills: string[];
            imageUrl: string | null;
        };
    }>;
}
