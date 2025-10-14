import { Controller, Get, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(@Request() req) {
        return this.notificationsService.getUserNotifications(req.user.userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    async deleteNotification(@Param('id') id: string) {
        console.log('Received delete request for notification:', id);
        // Trigger reload
        return this.notificationsService.deleteNotification(id);
    }
}
