import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private loggingService: LoggingService
  ) { }

  async createTask(
    userId: string,
    data: {
      title: string;
      description: string;
      budget: number;
      skills: string[];
      imageUrl: string;
    },
  ) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Validate imageUrl is provided
    if (!data.imageUrl) {
      throw new BadRequestException('Task image is required');
    }

    // Create the task
    const task = await this.prisma.task.create({
      data: {
        ...data,
        clientId: userId,
      },
    });

    await this.loggingService.logAction(userId, 'TASK_CREATE', task.id, `Task created: ${task.title} `);

    return task;
  }

  async getAllTasks(filters?: {
    search?: string;
    skills?: string[];
    status?: string;
  }) {
    const where: Prisma.TaskWhereInput = {};

    // Add status filter if provided, default to 'open' if not provided
    where.status = filters?.status || 'open';

    // Add search filter if provided
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Add skills filter if provided
    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills,
      };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async getTaskById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
            location: true,
            rating: true,
          },
        },
        taskRequests: {
          where: {
            status: 'pending',
          },
          include: {
            freelancer: {
              select: {
                id: true,
                fullName: true,
                imageUrl: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getClientTasks(clientId: string) {
    return this.prisma.task.findMany({
      where: {
        clientId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      budget?: number;
      skills?: string[];
      status?: string;
    },
  ) {
    // Verify task exists and belongs to user
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.clientId !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    // Update the task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data,
    });

    if (data.status) {
      await this.loggingService.logAction(updatedTask.clientId, 'TASK_STATUS_UPDATE', updatedTask.id, `Task status updated to ${data.status}: ${updatedTask.title} `);
    }

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    // Verify task exists and belongs to user
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.clientId !== userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    // Only allow deletion of tasks with 'open' status
    if (task.status !== 'open') {
      throw new ForbiddenException('Only tasks with "open" status can be deleted');
    }

    // Delete all related TaskApplications first to avoid foreign key constraint violation
    await this.prisma.taskApplication.deleteMany({
      where: { taskId },
    });

    // Now delete the task
    const deletedTask = await this.prisma.task.delete({
      where: { id: taskId },
    });

    await this.loggingService.logAction(userId, 'TASK_DELETE', taskId, `Task deleted: ${task.title} `);

    return deletedTask;
  }
} 