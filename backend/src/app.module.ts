import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProfileModule } from './profile/profile.module';
import { RatingsModule } from './ratings/ratings.module';
import { TaskApplicationsModule } from './task-applications/task-applications.module';
import { TaskRequestsModule } from './task-requests/task-requests.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { LoggingModule } from './logging/logging.module';
import { SkillsModule } from './skills/skills.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ChatModule,
    TasksModule,
    ProfileModule,
    RatingsModule,
    TaskApplicationsModule,
    TaskRequestsModule,
    UploadModule,
    AdminModule,
    LoggingModule,
    SkillsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
