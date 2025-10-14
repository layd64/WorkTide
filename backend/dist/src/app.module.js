"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const tasks_module_1 = require("./tasks/tasks.module");
const profile_module_1 = require("./profile/profile.module");
const ratings_module_1 = require("./ratings/ratings.module");
const task_applications_module_1 = require("./task-applications/task-applications.module");
const task_requests_module_1 = require("./task-requests/task-requests.module");
const chat_module_1 = require("./chat/chat.module");
const users_module_1 = require("./users/users.module");
const upload_module_1 = require("./upload/upload.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const admin_module_1 = require("./admin/admin.module");
const logging_module_1 = require("./logging/logging.module");
const skills_module_1 = require("./skills/skills.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            chat_module_1.ChatModule,
            tasks_module_1.TasksModule,
            profile_module_1.ProfileModule,
            ratings_module_1.RatingsModule,
            task_applications_module_1.TaskApplicationsModule,
            task_requests_module_1.TaskRequestsModule,
            upload_module_1.UploadModule,
            admin_module_1.AdminModule,
            logging_module_1.LoggingModule,
            skills_module_1.SkillsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map