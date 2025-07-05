import { PrismaService } from '../prisma/prisma.service';
export declare class TaskApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    applyToTask(freelancerId: string, taskId: string, coverLetter?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        freelancerId: string;
        coverLetter: string | null;
        taskId: string;
    }>;
    getTaskApplications(taskId: string, clientId: string): Promise<({
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
    getFreelancerApplications(freelancerId: string): Promise<({
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
    updateApplicationStatus(applicationId: string, clientId: string, status: 'accepted' | 'rejected'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        freelancerId: string;
        coverLetter: string | null;
        taskId: string;
    }>;
    assignFreelancerToTask(applicationId: string, clientId: string): Promise<{
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
