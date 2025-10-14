import { Module } from '@nestjs/common';
import { TaskApplicationsService } from './task-applications.service';
import { TaskApplicationsController } from './task-applications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PrismaModule, NotificationsModule, ChatModule],
  controllers: [TaskApplicationsController],
  providers: [TaskApplicationsService],
})
export class TaskApplicationsModule { }