import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
export declare class TasksService {
    private prisma;
    private loggingService;
    constructor(prisma: PrismaService, loggingService: LoggingService);
    createTask(userId: string, data: {
        title: string;
        description: string;
        budget: number;
        skills: string[];
        imageUrl: string;
    }): Promise<{
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
    }>;
    getAllTasks(filters?: {
        search?: string;
        skills?: string[];
        status?: string;
    }): Promise<({
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
        imageUrl: string | null;
        skills: string[];
        description: string;
        budget: number;
        status: string;
        clientId: string;
    })[]>;
    getRecommendedFreelancersForTask(taskId: string, limit?: number): Promise<{
        id: string;
        fullName: string;
        imageUrl?: string | null;
        title?: string | null;
        hourlyRate?: number | null;
        rating?: number | null;
        completedJobs?: number | null;
        location?: string | null;
        skills: string[];
        score: number;
    }[]>;
    getTaskById(id: string): Promise<{
        client: {
            id: string;
            fullName: string;
            rating: number | null;
            location: string | null;
            imageUrl: string | null;
        };
        taskRequests: ({
            freelancer: {
                id: string;
                fullName: string;
                title: string | null;
                imageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            clientId: string;
            freelancerId: string;
            taskId: string;
        })[];
    } & {
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
    }>;
    getClientTasks(clientId: string): Promise<{
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
    }[]>;
    updateTask(taskId: string, userId: string, data: {
        title?: string;
        description?: string;
        budget?: number;
        skills?: string[];
        status?: string;
    }): Promise<{
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
    }>;
    deleteTask(taskId: string, userId: string): Promise<{
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
    }>;
}
