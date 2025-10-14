import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TaskApplicationsService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
    private notificationsService: NotificationsService,
  ) { }

  async applyToTask(freelancerId: string, taskId: string, coverLetter?: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: freelancerId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Verify task exists and is open
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== 'open') {
      throw new ForbiddenException('Cannot apply to a task that is not open');
    }

    // Check if the freelancer has already applied to this task
    const existingApplication = await this.prisma.taskApplication.findUnique({
      where: {
        taskId_freelancerId: {
          taskId,
          freelancerId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this task');
    }

    // Create the application
    const data: any = {
      task: { connect: { id: taskId } },
      freelancer: { connect: { id: freelancerId } },
    };

    // Only add coverLetter if it's provided
    if (coverLetter) {
      data.coverLetter = coverLetter;
    }

    const application = await this.prisma.taskApplication.create({ data });

    // Notify the client
    await this.notificationsService.createNotification(
      task.clientId,
      'APPLICATION_RECEIVED',
      'New Application',
      `You have received a new application for your task: ${task.title}`,
      application.id,
    );

    return application;
  }

  async getTaskApplications(taskId: string, clientId: string) {
    // Verify task exists and belongs to the client
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.clientId !== clientId) {
      throw new ForbiddenException('You can only view applications for your own tasks');
    }

    // Get the applications with freelancer information
    return this.prisma.taskApplication.findMany({
      where: { taskId },
      include: {
        freelancer: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
            skills: true,
            hourlyRate: true,
            rating: true,
            title: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFreelancerApplications(freelancerId: string) {
    return this.prisma.taskApplication.findMany({
      where: { freelancerId },
      include: {
        task: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    clientId: string,
    status: 'accepted' | 'rejected'
  ) {
    // Find the application
    const application = await this.prisma.taskApplication.findUnique({
      where: { id: applicationId },
      include: { task: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify the task belongs to the client
    if (application.task.clientId !== clientId) {
      throw new ForbiddenException('You can only update applications for your own tasks');
    }

    // Notify the freelancer
    if (application) {
      const title = status === 'accepted' ? 'Application Accepted' : 'Application Declined';
      const message = status === 'accepted'
        ? `Your application for "${application.task.title}" has been accepted!`
        : `Your application for "${application.task.title}" has been declined.`;

      await this.notificationsService.createNotification(
        application.freelancerId,
        status === 'accepted' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_DECLINED',
        title,
        message,
        application.id,
      );
    }

    // Update the application status
    return this.prisma.taskApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  async assignFreelancerToTask(
    applicationId: string,
    clientId: string
  ) {
    // Find the application
    const application = await this.prisma.taskApplication.findUnique({
      where: { id: applicationId },
      include: { task: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify the task belongs to the client
    if (application.task.clientId !== clientId) {
      throw new ForbiddenException('You can only assign freelancers to your own tasks');
    }

    // Update the application status to 'accepted' and the task status to 'in_progress'
    // Use a transaction to ensure both updates succeed or fail together
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update the application status
      const updatedApplication = await prisma.taskApplication.update({
        where: { id: applicationId },
        data: { status: 'accepted' },
      });

      // Update the task status
      const updatedTask = await prisma.task.update({
        where: { id: application.taskId },
        data: { status: 'in_progress' },
      });

      return {
        application: updatedApplication,
        task: updatedTask
      };
    });

    // Create initial chat message between client and freelancer
    await this.chatService.createInitialChatMessage(
      application.freelancerId,
      clientId
    );

    // Notify the freelancer
    await this.notificationsService.createNotification(
      application.freelancerId,
      'APPLICATION_ACCEPTED',
      'Application Accepted',
      `You have been assigned to the task: ${application.task.title}`,
      application.id,
    );

    // Return result with freelancer ID for frontend navigation
    return {
      ...result,
      freelancerId: application.freelancerId,
    };
  }
} 