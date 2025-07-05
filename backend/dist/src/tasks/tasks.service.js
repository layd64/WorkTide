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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logging_service_1 = require("../logging/logging.service");
let TasksService = class TasksService {
    prisma;
    loggingService;
    constructor(prisma, loggingService) {
        this.prisma = prisma;
        this.loggingService = loggingService;
    }
    async createTask(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.userType !== 'client') {
            throw new common_1.ForbiddenException('Only clients can create tasks');
        }
        const task = await this.prisma.task.create({
            data: {
                ...data,
                clientId: userId,
            },
        });
        await this.loggingService.logAction(userId, 'TASK_CREATE', task.id, `Task created: ${task.title}`);
        return task;
    }
    async getAllTasks(filters) {
        const where = {};
        where.status = filters?.status || 'open';
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.skills && filters.skills.length > 0) {
            where.skills = {
                hasSome: filters.skills,
            };
        }
        return this.prisma.task.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
            },
        });
    }
    async getTaskById(id) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                        location: true,
                        rating: true,
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async getClientTasks(clientId) {
        return this.prisma.task.findMany({
            where: {
                clientId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateTask(taskId, userId, data) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.clientId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own tasks');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data,
        });
        if (data.status) {
            await this.loggingService.logAction(updatedTask.clientId, 'TASK_STATUS_UPDATE', updatedTask.id, `Task status updated to ${data.status}: ${updatedTask.title}`);
        }
        return updatedTask;
    }
    async deleteTask(taskId, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.clientId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own tasks');
        }
        return this.prisma.task.delete({
            where: { id: taskId },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logging_service_1.LoggingService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map