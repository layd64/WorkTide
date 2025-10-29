import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TaskApplicationsService {
    private prisma;
    private chatService;
    private notificationsService;
    constructor(prisma: PrismaService, chatService: ChatService, notificationsService: NotificationsService);
    applyToTask(freelancerId: string, taskId: string, coverLetter?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        coverLetter: string | null;
        taskId: string;
        freelancerId: string;
    }>;
    getTaskApplications(taskId: string, clientId: string): Promise<({
        freelancer: {
            id: string;
            fullName: string;
            title: string | null;
            hourlyRate: number | null;
            rating: number | null;
            location: string | null;
            imageUrl: string | null;
            skills: {
                id: string;
                name: string;
            }[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        coverLetter: string | null;
        taskId: string;
        freelancerId: string;
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
        coverLetter: string | null;
        taskId: string;
        freelancerId: string;
    })[]>;
    updateApplicationStatus(applicationId: string, clientId: string, status: 'accepted' | 'rejected'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        coverLetter: string | null;
        taskId: string;
        freelancerId: string;
    }>;
    assignFreelancerToTask(applicationId: string, clientId: string): Promise<{
        freelancerId: string;
        application: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            coverLetter: string | null;
            taskId: string;
            freelancerId: string;
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
    }>;
}
