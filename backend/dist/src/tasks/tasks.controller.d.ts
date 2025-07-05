import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    createTask(req: any, data: {
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
    getAllTasks(search?: string, skills?: string, status?: string): Promise<({
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
    updateTask(req: any, id: string, data: {
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
    deleteTask(req: any, id: string): Promise<{
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
