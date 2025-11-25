import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
    exports: [ChatGateway, ChatService], // Export ChatGateway and ChatService for use in other modules
})
export class ChatModule { }
