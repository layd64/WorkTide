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
exports.TaskRequestsController = void 0;
const common_1 = require("@nestjs/common");
const task_requests_service_1 = require("./task-requests.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TaskRequestsController = class TaskRequestsController {
    taskRequestsService;
    constructor(taskRequestsService) {
        this.taskRequestsService = taskRequestsService;
    }
    async createRequest(req, body) {
        return this.taskRequestsService.createRequest(req.user.sub, body.taskId, body.freelancerId);
    }
    async getFreelancerRequests(freelancerId) {
        return this.taskRequestsService.getFreelancerRequests(freelancerId);
    }
    async acceptRequest(requestId, req) {
        return this.taskRequestsService.acceptRequest(requestId, req.user.sub);
    }
    async rejectRequest(requestId, req) {
        return this.taskRequestsService.rejectRequest(requestId, req.user.sub);
    }
    async cancelRequest(requestId, req) {
        return this.taskRequestsService.cancelRequest(requestId, req.user.sub);
    }
};
exports.TaskRequestsController = TaskRequestsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TaskRequestsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('freelancer/:freelancerId'),
    __param(0, (0, common_1.Param)('freelancerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskRequestsController.prototype, "getFreelancerRequests", null);
__decorate([
    (0, common_1.Put)(':requestId/accept'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskRequestsController.prototype, "acceptRequest", null);
__decorate([
    (0, common_1.Put)(':requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskRequestsController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Put)(':requestId/cancel'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskRequestsController.prototype, "cancelRequest", null);
exports.TaskRequestsController = TaskRequestsController = __decorate([
    (0, common_1.Controller)('task-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [task_requests_service_1.TaskRequestsService])
], TaskRequestsController);
//# sourceMappingURL=task-requests.controller.js.map