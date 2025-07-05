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
let TaskApplicationsService = class TaskApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async applyToTask(freelancerId, taskId, coverLetter) {
        const user = await this.prisma.user.findUnique({
            where: { id: freelancerId },
        });
        if (!user || user.userType !== 'freelancer') {
            throw new common_1.ForbiddenException('Only freelancers can apply to tasks');
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
        return this.prisma.taskApplication.create({ data });
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
        return this.prisma.$transaction(async (prisma) => {
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
    }
};
exports.TaskApplicationsService = TaskApplicationsService;
exports.TaskApplicationsService = TaskApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskApplicationsService);
//# sourceMappingURL=task-applications.service.js.map