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
    const user = await this.prisma.user.findUnique({
      where: { id: freelancerId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== 'open') {
      throw new ForbiddenException('Cannot apply to a task that is not open');
    }

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

    const data: any = {
      task: { connect: { id: taskId } },
      freelancer: { connect: { id: freelancerId } },
    };

    if (coverLetter) {
      data.coverLetter = coverLetter;
    }

    const application = await this.prisma.taskApplication.create({ data });

    await this.notificationsService.createNotification(
      task.clientId,
      'APPLICATION_RECEIVED',
      'NOTIFICATION_APPLICATION_RECEIVED_TITLE',
      JSON.stringify({
        key: 'NOTIFICATION_APPLICATION_RECEIVED_MSG',
        params: { taskTitle: task.title }
      }),
      application.id,
    );

    return application;
  }

  async getTaskApplications(taskId: string, clientId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.clientId !== clientId) {
      throw new ForbiddenException('You can only view applications for your own tasks');
    }

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

    if (application) {
      const title = status === 'accepted' ? 'Application Accepted' : 'Application Declined';
      const notificationType = status === 'accepted' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_DECLINED';
      const notificationTitleKey = status === 'accepted' ? 'NOTIFICATION_APPLICATION_ACCEPTED_TITLE' : 'NOTIFICATION_APPLICATION_DECLINED_TITLE';
      const notificationMessageKey = status === 'accepted' ? 'NOTIFICATION_APPLICATION_ACCEPTED_MSG' : 'NOTIFICATION_APPLICATION_DECLINED_MSG';

      await this.notificationsService.createNotification(
        application.freelancerId,
        notificationType,
        notificationTitleKey,
        JSON.stringify({
          key: notificationMessageKey,
          params: { taskTitle: application.task.title }
        }),
        application.id,
      );
    }

    return this.prisma.taskApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  async assignFreelancerToTask(
    applicationId: string,
    clientId: string
  ) {
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

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedApplication = await prisma.taskApplication.update({
        where: { id: applicationId },
        data: { status: 'accepted' },
      });

      const updatedTask = await prisma.task.update({
        where: { id: application.taskId },
        data: { status: 'in_progress' },
      });

      return {
        application: updatedApplication,
        task: updatedTask
      };
    });

    await this.chatService.createInitialChatMessage(
      application.freelancerId,
      clientId
    );

    // Notify the freelancer
    await this.notificationsService.createNotification(
      application.freelancerId,
      'APPLICATION_ACCEPTED',
      'NOTIFICATION_APPLICATION_ACCEPTED_TITLE',
      JSON.stringify({
        key: 'NOTIFICATION_APPLICATION_ACCEPTED_MSG',
        params: { taskTitle: application.task.title }
      }),
      application.id,
    );

    return {
      ...result,
      freelancerId: application.freelancerId,
    };
  }
} 