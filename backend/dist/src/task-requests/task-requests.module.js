"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const task_requests_controller_1 = require("./task-requests.controller");
const task_requests_service_1 = require("./task-requests.service");
const prisma_module_1 = require("../prisma/prisma.module");
const logging_module_1 = require("../logging/logging.module");
const chat_module_1 = require("../chat/chat.module");
const notifications_module_1 = require("../notifications/notifications.module");
let TaskRequestsModule = class TaskRequestsModule {
};
exports.TaskRequestsModule = TaskRequestsModule;
exports.TaskRequestsModule = TaskRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logging_module_1.LoggingModule, chat_module_1.ChatModule, notifications_module_1.NotificationsModule],
        controllers: [task_requests_controller_1.TaskRequestsController],
        providers: [task_requests_service_1.TaskRequestsService],
        exports: [task_requests_service_1.TaskRequestsService],
    })
], TaskRequestsModule);
//# sourceMappingURL=task-requests.module.js.map