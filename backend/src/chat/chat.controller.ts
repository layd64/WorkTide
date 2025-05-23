import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('history/:userId1/:userId2')
    async getHistory(
        @Param('userId1') userId1: string,
        @Param('userId2') userId2: string,
    ) {
        return this.chatService.getMessages(userId1, userId2);
    }

    @Get('conversations/:userId')
    async getConversations(@Param('userId') userId: string) {
        return this.chatService.getConversations(userId);
    }
}
