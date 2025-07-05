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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const task_applications_service_1 = require("./task-applications.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TaskApplicationsController = class TaskApplicationsController {
    taskApplicationsService;
    constructor(taskApplicationsService) {
        this.taskApplicationsService = taskApplicationsService;
    }
    async applyToTask(req, taskId, data) {
        return this.taskApplicationsService.applyToTask(req.user.sub, taskId, data.coverLetter);
    }
    async getTaskApplications(req, taskId) {
        return this.taskApplicationsService.getTaskApplications(taskId, req.user.sub);
    }
    async getFreelancerApplications(req) {
        return this.taskApplicationsService.getFreelancerApplications(req.user.sub);
    }
    async updateApplicationStatus(req, applicationId, data) {
        if (!data.status || !['accepted', 'rejected'].includes(data.status)) {
            throw new common_1.ForbiddenException('Invalid status');
        }
        return this.taskApplicationsService.updateApplicationStatus(applicationId, req.user.sub, data.status);
    }
    async assignFreelancer(req, applicationId) {
        return this.taskApplicationsService.assignFreelancerToTask(applicationId, req.user.sub);
    }
};
exports.TaskApplicationsController = TaskApplicationsController;
__decorate([
    (0, common_1.Post)(':taskId/apply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TaskApplicationsController.prototype, "applyToTask", null);
__decorate([
    (0, common_1.Get)('task/:taskId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskApplicationsController.prototype, "getTaskApplications", null);
__decorate([
    (0, common_1.Get)('freelancer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskApplicationsController.prototype, "getFreelancerApplications", null);
__decorate([
    (0, common_1.Put)(':applicationId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('applicationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TaskApplicationsController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Put)(':applicationId/assign'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TaskApplicationsController.prototype, "assignFreelancer", null);
exports.TaskApplicationsController = TaskApplicationsController = __decorate([
    (0, common_1.Controller)('task-applications'),
    __metadata("design:paramtypes", [task_applications_service_1.TaskApplicationsService])
], TaskApplicationsController);
//# sourceMappingURL=task-applications.controller.js.map