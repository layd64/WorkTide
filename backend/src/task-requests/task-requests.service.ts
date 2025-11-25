import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
import { ChatGateway } from '../chat/chat.gateway';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TaskRequestsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private loggingService: LoggingService,
        private chatGateway: ChatGateway,
    ) { }

    async createRequest(clientId: string, taskId: string, freelancerId: string) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.clientId !== clientId) {
            throw new ForbiddenException('You can only assign your own tasks');
        }

        if (task.status !== 'open') {
            throw new BadRequestException('Only open tasks can be assigned to freelancers');
        }

        if (clientId === freelancerId) {
            throw new BadRequestException('You cannot send a task request to yourself');
        }

        const existingRequest = await this.prisma.taskRequest.findFirst({
            where: {
                taskId,
                freelancerId,
                status: 'pending',
            },
        });

        if (existingRequest) {
            throw new BadRequestException('You have already sent a request to this person for this task');
        }

        const freelancer = await this.prisma.user.findUnique({
            where: { id: freelancerId },
        });

        if (!freelancer) {
            throw new NotFoundException('User not found');
        }

        const request = await this.prisma.$transaction(async (prisma) => {
            const newRequest = await prisma.taskRequest.create({
                data: {
                    taskId,
                    freelancerId,
                    clientId,
                },
                include: {
                    task: true,
                    freelancer: {
                        select: {
                            id: true,
                            fullName: true,
                            imageUrl: true,
                        },
                    },
                    client: {
                        select: {
                            id: true,
                            fullName: true,
                            imageUrl: true,
                        },
                    },
                },
            });

            await prisma.task.update({
                where: { id: taskId },
                data: { status: 'pending' },
            });

            return newRequest;
        });

        await this.loggingService.logAction(
            clientId,
            'TASK_REQUEST_CREATE',
            request.id,
            `Task request sent to ${freelancer.fullName} for task: ${task.title}`,
        );

        await this.notificationsService.createNotification(
            freelancerId,
            'REQUEST_RECEIVED',
            'NOTIFICATION_REQUEST_RECEIVED_TITLE',
            JSON.stringify({
                key: 'NOTIFICATION_REQUEST_RECEIVED_MSG',
                params: { taskTitle: task.title }
            }),
            request.id,
        );

        return request;
    }

    async getFreelancerRequests(freelancerId: string) {
        return this.prisma.taskRequest.findMany({
            where: {
                freelancerId,
                status: 'pending',
            },
            include: {
                task: true,
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async acceptRequest(requestId: string, freelancerId: string) {
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
                client: true,
                freelancer: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Request not found');
        }

        // Verify the freelancer owns this request
        if (request.freelancerId !== freelancerId) {
            throw new ForbiddenException('You can only accept your own requests');
        }

        // Request must be pending
        if (request.status !== 'pending') {
            throw new BadRequestException('This request has already been processed');
        }

        const result = await this.prisma.$transaction(async (prisma) => {
            const updatedRequest = await prisma.taskRequest.update({
                where: { id: requestId },
                data: { status: 'accepted' },
            });

            await prisma.task.update({
                where: { id: request.taskId },
                data: { status: 'in_progress' },
            });

            const systemMessage = await prisma.message.create({
                data: {
                    senderId: request.clientId,
                    receiverId: freelancerId,
                    content: `This chat has been started since both participants decided to work together on ${request.task.title}`,
                    isSystem: true,
                },
            });

            return { updatedRequest, systemMessage };
        });

        const { systemMessage } = result;

        this.chatGateway.server.to(request.clientId).emit('newMessage', systemMessage);
        this.chatGateway.server.to(freelancerId).emit('newMessage', systemMessage);

        await this.loggingService.logAction(
            freelancerId,
            'TASK_REQUEST_ACCEPT',
            requestId,
            `Accepted task request for: ${request.task.title}`,
        );

        await this.notificationsService.createNotification(
            request.clientId,
            'REQUEST_ACCEPTED',
            'NOTIFICATION_REQUEST_ACCEPTED_TITLE',
            JSON.stringify({
                key: 'NOTIFICATION_REQUEST_ACCEPTED_MSG',
                params: {
                    freelancerName: request.freelancer.fullName,
                    taskTitle: request.task.title
                }
            }),
            request.id,
        );

        return {
            request,
            chat: {
                partnerId: request.clientId,
                partnerName: request.client.fullName,
            },
        };
    }

    async rejectRequest(requestId: string, freelancerId: string) {
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Request not found');
        }

        // Verify the freelancer owns this request
        if (request.freelancerId !== freelancerId) {
            throw new ForbiddenException('You can only reject your own requests');
        }

        // Request must be pending
        if (request.status !== 'pending') {
            throw new BadRequestException('This request has already been processed');
        }

        await this.prisma.$transaction(async (prisma) => {
            await prisma.taskRequest.update({
                where: { id: requestId },
                data: { status: 'rejected' },
            });

            await prisma.task.update({
                where: { id: request.taskId },
                data: { status: 'open' },
            });
        });

        await this.loggingService.logAction(
            freelancerId,
            'TASK_REQUEST_REJECT',
            requestId,
            `Rejected task request for: ${request.task.title}`,
        );

        return { message: 'Request rejected successfully' };
    }

    async cancelRequest(requestId: string, clientId: string) {
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Request not found');
        }

        if (request.clientId !== clientId) {
            throw new ForbiddenException('You can only cancel your own requests');
        }

        // Request must be pending
        if (request.status !== 'pending') {
            throw new BadRequestException('This request has already been processed');
        }

        await this.prisma.$transaction(async (prisma) => {
            await prisma.taskRequest.delete({
                where: { id: requestId },
            });

            await prisma.task.update({
                where: { id: request.taskId },
                data: { status: 'open' },
            });
        });

        await this.loggingService.logAction(
            clientId,
            'TASK_REQUEST_CANCEL',
            requestId,
            `Cancelled task request for: ${request.task.title}`,
        );

        return { message: 'Request cancelled successfully' };
    }
}
