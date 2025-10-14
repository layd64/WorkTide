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
        status: string;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
    getTaskApplications(taskId: string, clientId: string): Promise<({
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
    getFreelancerApplications(freelancerId: string): Promise<({
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
    updateApplicationStatus(applicationId: string, clientId: string, status: 'accepted' | 'rejected'): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        taskId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
    assignFreelancerToTask(applicationId: string, clientId: string): Promise<{
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
