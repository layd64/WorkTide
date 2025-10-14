"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_service_1 = require("../chat/chat.service");
const notifications_service_1 = require("../notifications/notifications.service");
let TaskApplicationsService = class TaskApplicationsService {
    prisma;
    chatService;
    notificationsService;
    constructor(prisma, chatService, notificationsService) {
        this.prisma = prisma;
        this.chatService = chatService;
        this.notificationsService = notificationsService;
    }
    async applyToTask(freelancerId, taskId, coverLetter) {
        const user = await this.prisma.user.findUnique({
            where: { id: freelancerId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.status !== 'open') {
            throw new common_1.ForbiddenException('Cannot apply to a task that is not open');
        }
        const existingApplication = await this.prisma.taskApplication.findUnique({
            where: {
                taskId_freelancerId: {
                    taskId,
                    freelancerId,
                },
            },
        });
        if (existingApplication) {
            throw new common_1.ConflictException('You have already applied to this task');
        }
        const data = {
            task: { connect: { id: taskId } },
            freelancer: { connect: { id: freelancerId } },
        };
        if (coverLetter) {
            data.coverLetter = coverLetter;
        }
        const application = await this.prisma.taskApplication.create({ data });
        await this.notificationsService.createNotification(task.clientId, 'APPLICATION_RECEIVED', 'New Application', `You have received a new application for your task: ${task.title}`, application.id);
        return application;
    }
    async getTaskApplications(taskId, clientId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only view applications for your own tasks');
        }
        return this.prisma.taskApplication.findMany({
            where: { taskId },
            include: {
                freelancer: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                        skills: true,
                        hourlyRate: true,
                        rating: true,
                        title: true,
                        location: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getFreelancerApplications(freelancerId) {
        return this.prisma.taskApplication.findMany({
            where: { freelancerId },
            include: {
                task: {
                    include: {
                        client: {
                            select: {
                                id: true,
                                fullName: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateApplicationStatus(applicationId, clientId, status) {
        const application = await this.prisma.taskApplication.findUnique({
            where: { id: applicationId },
            include: { task: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.task.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only update applications for your own tasks');
        }
        if (application) {
            const title = status === 'accepted' ? 'Application Accepted' : 'Application Declined';
            const message = status === 'accepted'
                ? `Your application for "${application.task.title}" has been accepted!`
                : `Your application for "${application.task.title}" has been declined.`;
            await this.notificationsService.createNotification(application.freelancerId, status === 'accepted' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_DECLINED', title, message, application.id);
        }
        return this.prisma.taskApplication.update({
            where: { id: applicationId },
            data: { status },
        });
    }
    async assignFreelancerToTask(applicationId, clientId) {
        const application = await this.prisma.taskApplication.findUnique({
            where: { id: applicationId },
            include: { task: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.task.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only assign freelancers to your own tasks');
        }
        const result = await this.prisma.$transaction(async (prisma) => {
            const updatedApplication = await prisma.taskApplication.update({
                where: { id: applicationId },
                data: { status: 'accepted' },
            });
            const updatedTask = await prisma.task.update({
                where: { id: application.taskId },
                data: { status: 'in_progress' },
            });
            return {
                application: updatedApplication,
                task: updatedTask
            };
        });
        await this.chatService.createInitialChatMessage(application.freelancerId, clientId);
        await this.notificationsService.createNotification(application.freelancerId, 'APPLICATION_ACCEPTED', 'Application Accepted', `You have been assigned to the task: ${application.task.title}`, application.id);
        return {
            ...result,
            freelancerId: application.freelancerId,
        };
    }
};
exports.TaskApplicationsService = TaskApplicationsService;
exports.TaskApplicationsService = TaskApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_service_1.ChatService,
        notifications_service_1.NotificationsService])
], TaskApplicationsService);
//# sourceMappingURL=task-applications.service.js.map