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
        // Verify task exists and belongs to client
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.clientId !== clientId) {
            throw new ForbiddenException('You can only assign your own tasks');
        }

        // Task must be open to send a request
        if (task.status !== 'open') {
            throw new BadRequestException('Only open tasks can be assigned to freelancers');
        }

        // Prevent self-assignment
        if (clientId === freelancerId) {
            throw new BadRequestException('You cannot send a task request to yourself');
        }

        // Check if there's already a pending request for this freelancer on this task
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

        // Verify freelancer exists
        const freelancer = await this.prisma.user.findUnique({
            where: { id: freelancerId },
        });

        if (!freelancer) {
            throw new NotFoundException('User not found');
        }

        // Create the request and update task status to pending
        const request = await this.prisma.taskRequest.create({
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

        // Update task status to pending
        await this.prisma.task.update({
            where: { id: taskId },
            data: { status: 'pending' },
        });

        await this.loggingService.logAction(
            clientId,
            'TASK_REQUEST_CREATE',
            request.id,
            `Task request sent to ${freelancer.fullName} for task: ${task.title}`,
        );

        // Notify the freelancer
        await this.notificationsService.createNotification(
            freelancerId,
            'REQUEST_RECEIVED',
            'New Task Request',
            `You have received a new request for task: ${task.title}`,
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
        // Find the request
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

        // Update request status to accepted
        await this.prisma.taskRequest.update({
            where: { id: requestId },
            data: { status: 'accepted' },
        });

        // Update task status to in_progress
        await this.prisma.task.update({
            where: { id: request.taskId },
            data: { status: 'in_progress' },
        });

        // Create system message in chat
        const systemMessage = await this.prisma.message.create({
            data: {
                senderId: request.clientId,
                receiverId: freelancerId,
                content: `This chat has been started since both participants decided to work together on ${request.task.title}`,
                isSystem: true,
            },
        });

        // Emit the system message to both users via WebSocket
        this.chatGateway.server.to(request.clientId).emit('newMessage', systemMessage);
        this.chatGateway.server.to(freelancerId).emit('newMessage', systemMessage);

        await this.loggingService.logAction(
            freelancerId,
            'TASK_REQUEST_ACCEPT',
            requestId,
            `Accepted task request for: ${request.task.title}`,
        );

        // Notify the client
        await this.notificationsService.createNotification(
            request.clientId,
            'REQUEST_ACCEPTED',
            'Request Accepted',
            `${request.freelancer.fullName} has accepted your request for task: ${request.task.title}`,
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
        // Find the request
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

        // Update request status to rejected
        await this.prisma.taskRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' },
        });

        // Update task status back to open
        await this.prisma.task.update({
            where: { id: request.taskId },
            data: { status: 'open' },
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
        // Find the request
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Request not found');
        }

        // Verify the client owns this request
        if (request.clientId !== clientId) {
            throw new ForbiddenException('You can only cancel your own requests');
        }

        // Request must be pending
        if (request.status !== 'pending') {
            throw new BadRequestException('This request has already been processed');
        }

        // Delete the request
        await this.prisma.taskRequest.delete({
            where: { id: requestId },
        });

        // Update task status back to open
        await this.prisma.task.update({
            where: { id: request.taskId },
            data: { status: 'open' },
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
