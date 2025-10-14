import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    createTask(req: any, data: {
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
    getAllTasks(search?: string, skills?: string, status?: string): Promise<({
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
            taskId: string;
            freelancerId: string;
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
    updateTask(req: any, id: string, data: {
        title?: string;
        description?: string;
        budget?: number;
        skills?: string[];
        status?: string;
        imageUrl?: string;
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
    deleteTask(req: any, id: string): Promise<{
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
