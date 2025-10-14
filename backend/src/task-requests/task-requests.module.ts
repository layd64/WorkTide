import { Module } from '@nestjs/common';
import { TaskRequestsController } from './task-requests.controller';
import { TaskRequestsService } from './task-requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggingModule } from '../logging/logging.module';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, LoggingModule, ChatModule, NotificationsModule],
    controllers: [TaskRequestsController],
    providers: [TaskRequestsService],
    exports: [TaskRequestsService],
})
export class TaskRequestsModule { }
