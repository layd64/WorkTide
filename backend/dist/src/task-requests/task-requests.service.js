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
exports.TaskRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logging_service_1 = require("../logging/logging.service");
const chat_gateway_1 = require("../chat/chat.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let TaskRequestsService = class TaskRequestsService {
    prisma;
    notificationsService;
    loggingService;
    chatGateway;
    constructor(prisma, notificationsService, loggingService, chatGateway) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.loggingService = loggingService;
        this.chatGateway = chatGateway;
    }
    async createRequest(clientId, taskId, freelancerId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only assign your own tasks');
        }
        if (task.status !== 'open') {
            throw new common_1.BadRequestException('Only open tasks can be assigned to freelancers');
        }
        if (clientId === freelancerId) {
            throw new common_1.BadRequestException('You cannot send a task request to yourself');
        }
        const existingRequest = await this.prisma.taskRequest.findFirst({
            where: {
                taskId,
                freelancerId,
                status: 'pending',
            },
        });
        if (existingRequest) {
            throw new common_1.BadRequestException('You have already sent a request to this person for this task');
        }
        const freelancer = await this.prisma.user.findUnique({
            where: { id: freelancerId },
        });
        if (!freelancer) {
            throw new common_1.NotFoundException('User not found');
        }
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
        await this.prisma.task.update({
            where: { id: taskId },
            data: { status: 'pending' },
        });
        await this.loggingService.logAction(clientId, 'TASK_REQUEST_CREATE', request.id, `Task request sent to ${freelancer.fullName} for task: ${task.title}`);
        await this.notificationsService.createNotification(freelancerId, 'REQUEST_RECEIVED', 'New Task Request', `You have received a new request for task: ${task.title}`, request.id);
        return request;
    }
    async getFreelancerRequests(freelancerId) {
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
    async acceptRequest(requestId, freelancerId) {
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
                client: true,
                freelancer: true,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        if (request.freelancerId !== freelancerId) {
            throw new common_1.ForbiddenException('You can only accept your own requests');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('This request has already been processed');
        }
        await this.prisma.taskRequest.update({
            where: { id: requestId },
            data: { status: 'accepted' },
        });
        await this.prisma.task.update({
            where: { id: request.taskId },
            data: { status: 'in_progress' },
        });
        const systemMessage = await this.prisma.message.create({
            data: {
                senderId: request.clientId,
                receiverId: freelancerId,
                content: `This chat has been started since both participants decided to work together on ${request.task.title}`,
                isSystem: true,
            },
        });
        this.chatGateway.server.to(request.clientId).emit('newMessage', systemMessage);
        this.chatGateway.server.to(freelancerId).emit('newMessage', systemMessage);
        await this.loggingService.logAction(freelancerId, 'TASK_REQUEST_ACCEPT', requestId, `Accepted task request for: ${request.task.title}`);
        await this.notificationsService.createNotification(request.clientId, 'REQUEST_ACCEPTED', 'Request Accepted', `${request.freelancer.fullName} has accepted your request for task: ${request.task.title}`, request.id);
        return {
            request,
            chat: {
                partnerId: request.clientId,
                partnerName: request.client.fullName,
            },
        };
    }
    async rejectRequest(requestId, freelancerId) {
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        if (request.freelancerId !== freelancerId) {
            throw new common_1.ForbiddenException('You can only reject your own requests');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('This request has already been processed');
        }
        await this.prisma.taskRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' },
        });
        await this.prisma.task.update({
            where: { id: request.taskId },
            data: { status: 'open' },
        });
        await this.loggingService.logAction(freelancerId, 'TASK_REQUEST_REJECT', requestId, `Rejected task request for: ${request.task.title}`);
        return { message: 'Request rejected successfully' };
    }
    async cancelRequest(requestId, clientId) {
        const request = await this.prisma.taskRequest.findUnique({
            where: { id: requestId },
            include: {
                task: true,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        if (request.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only cancel your own requests');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('This request has already been processed');
        }
        await this.prisma.taskRequest.delete({
            where: { id: requestId },
        });
        await this.prisma.task.update({
            where: { id: request.taskId },
            data: { status: 'open' },
        });
        await this.loggingService.logAction(clientId, 'TASK_REQUEST_CANCEL', requestId, `Cancelled task request for: ${request.task.title}`);
        return { message: 'Request cancelled successfully' };
    }
};
exports.TaskRequestsService = TaskRequestsService;
exports.TaskRequestsService = TaskRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        logging_service_1.LoggingService,
        chat_gateway_1.ChatGateway])
], TaskRequestsService);
//# sourceMappingURL=task-requests.service.js.map