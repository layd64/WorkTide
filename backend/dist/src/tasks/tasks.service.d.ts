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
    }): Promise<{
        id: string;
        title: string;
        description: string;
        budget: number;
        skills: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
        title: string;
        description: string;
        budget: number;
        skills: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    })[]>;
    getTaskById(id: string): Promise<{
        client: {
            id: string;
            fullName: string;
            rating: number | null;
            location: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        title: string;
        description: string;
        budget: number;
        skills: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
    getClientTasks(clientId: string): Promise<{
        id: string;
        title: string;
        description: string;
        budget: number;
        skills: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
        title: string;
        description: string;
        budget: number;
        skills: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
    deleteTask(taskId: string, userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        budget: number;
        skills: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
}
