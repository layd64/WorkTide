import { Controller, Post, Get, Param, Body, UseGuards, Request, Put, ForbiddenException } from '@nestjs/common';
import { TaskApplicationsService } from './task-applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { validateId, validateTextLength, validateEnum } from '../utils/validation';

@Controller('task-applications')
export class TaskApplicationsController {
  constructor(private readonly taskApplicationsService: TaskApplicationsService) {}

  @Post(':taskId/apply')
  @UseGuards(JwtAuthGuard)
  async applyToTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() data: { coverLetter?: string }
  ) {
    // Validate input
    validateId(taskId, 'Task ID');
    if (data.coverLetter !== undefined && data.coverLetter !== null) {
      validateTextLength(data.coverLetter, 'Cover letter', 0, 2000);
    }
    
    return this.taskApplicationsService.applyToTask(
      req.user.sub, 
      taskId, 
      data.coverLetter
    );
  }

  @Get('task/:taskId')
  @UseGuards(JwtAuthGuard)
  async getTaskApplications(
    @Request() req,
    @Param('taskId') taskId: string
  ) {
    return this.taskApplicationsService.getTaskApplications(taskId, req.user.sub);
  }

  @Get('freelancer')
  @UseGuards(JwtAuthGuard)
  async getFreelancerApplications(@Request() req) {
    return this.taskApplicationsService.getFreelancerApplications(req.user.sub);
  }

  @Put(':applicationId/status')
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Request() req,
    @Param('applicationId') applicationId: string,
    @Body() data: { status: 'accepted' | 'rejected' }
  ) {
    // Validate input
    validateId(applicationId, 'Application ID');
    validateEnum(data.status, 'Status', ['accepted', 'rejected']);
    
    return this.taskApplicationsService.updateApplicationStatus(
      applicationId,
      req.user.sub,
      data.status as 'accepted' | 'rejected'
    );
  }

  @Put(':applicationId/assign')
  @UseGuards(JwtAuthGuard)
  async assignFreelancer(
    @Request() req,
    @Param('applicationId') applicationId: string
  ) {
    return this.taskApplicationsService.assignFreelancerToTask(
      applicationId,
      req.user.sub
    );
  }
} 