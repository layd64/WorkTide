import { TaskApplicationsService } from './task-applications.service';
export declare class TaskApplicationsController {
    private readonly taskApplicationsService;
    constructor(taskApplicationsService: TaskApplicationsService);
    applyToTask(req: any, taskId: string, data: {
        coverLetter?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        freelancerId: string;
        coverLetter: string | null;
        taskId: string;
    }>;
    getTaskApplications(req: any, taskId: string): Promise<({
        freelancer: {
            id: string;
            fullName: string;
            title: string | null;
            skills: string[];
            hourlyRate: number | null;
            rating: number | null;
            location: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        freelancerId: string;
        coverLetter: string | null;
        taskId: string;
    })[]>;
    getFreelancerApplications(req: any): Promise<({
        task: {
            client: {
                id: string;
                fullName: string;
                imageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
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
        freelancerId: string;
        coverLetter: string | null;
        taskId: string;
    })[]>;
    updateApplicationStatus(req: any, applicationId: string, data: {
        status: 'accepted' | 'rejected';
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        freelancerId: string;
        coverLetter: string | null;
        taskId: string;
    }>;
    assignFreelancer(req: any, applicationId: string): Promise<{
        application: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            freelancerId: string;
            coverLetter: string | null;
            taskId: string;
        };
        task: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            skills: string[];
            description: string;
            budget: number;
            status: string;
            clientId: string;
        };
    }>;
}
