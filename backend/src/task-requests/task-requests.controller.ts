import { Controller, Post, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TaskRequestsService } from './task-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task-requests')
@UseGuards(JwtAuthGuard)
export class TaskRequestsController {
    constructor(private taskRequestsService: TaskRequestsService) { }

    @Post()
    async createRequest(
        @Request() req,
        @Body() body: { taskId: string; freelancerId: string },
    ) {
        return this.taskRequestsService.createRequest(
            req.user.sub,
            body.taskId,
            body.freelancerId,
        );
    }

    @Get('freelancer/:freelancerId')
    async getFreelancerRequests(@Param('freelancerId') freelancerId: string) {
        return this.taskRequestsService.getFreelancerRequests(freelancerId);
    }

    @Put(':requestId/accept')
    async acceptRequest(@Param('requestId') requestId: string, @Request() req) {
        return this.taskRequestsService.acceptRequest(requestId, req.user.sub);
    }

    @Put(':requestId/reject')
    async rejectRequest(@Param('requestId') requestId: string, @Request() req) {
        return this.taskRequestsService.rejectRequest(requestId, req.user.sub);
    }

    @Put(':requestId/cancel')
    async cancelRequest(@Param('requestId') requestId: string, @Request() req) {
        return this.taskRequestsService.cancelRequest(requestId, req.user.sub);
    }
}
