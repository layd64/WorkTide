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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!data.imageUrl) {
      throw new BadRequestException('Task image is required');
    }

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

    where.status = filters?.status || 'open';

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

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

  async getRecommendedFreelancersForTask(taskId: string, limit = 10) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== 'open') {
      throw new BadRequestException('Recommendations are only available for open tasks');
    }

    const taskSkills = task.skills || [];

    const similarTasks = await this.prisma.task.findMany({
      where: {
        id: {
          not: taskId,
        },
        status: {
          in: ['in_progress', 'completed'],
        },
        skills: taskSkills.length
          ? {
            hasSome: taskSkills,
          }
          : undefined,
      },
      select: {
        id: true,
        skills: true,
        createdAt: true,
        applications: {
          where: {
            status: 'accepted',
          },
          select: {
            freelancerId: true,
          },
        },
        taskRequests: {
          where: {
            status: 'accepted',
          },
          select: {
            freelancerId: true,
          },
        },
      },
    });

    // collaborative filtering: score = skill_similarity * recency * interaction_type
    const freelancerScores: Record<string, number> = {};
    const freelancerInteractionCounts: Record<string, number> = {};
    const now = new Date();

    for (const similar of similarTasks) {
      const similarSkills = similar.skills || [];

      // jaccard similarity: overlap / union
      const overlapCount =
        taskSkills.length && similarSkills.length
          ? similarSkills.filter((s) => taskSkills.includes(s)).length
          : 0;
      const unionCount = new Set([...taskSkills, ...similarSkills]).size;
      const skillSimilarity =
        overlapCount > 0 && unionCount > 0 ? overlapCount / unionCount : taskSkills.length === 0 ? 1 : 0.2;

      const ageMs = now.getTime() - similar.createdAt.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const recencyWeight = 1 / (1 + Math.max(ageDays, 0) / 30);

      const applicationWeight = 3;
      const requestWeight = 2;

      for (const app of similar.applications || []) {
        const freelancerId = app.freelancerId;
        const contribution =
          applicationWeight * skillSimilarity * recencyWeight;
        freelancerScores[freelancerId] =
          (freelancerScores[freelancerId] || 0) + contribution;
        freelancerInteractionCounts[freelancerId] =
          (freelancerInteractionCounts[freelancerId] || 0) + 1;
      }

      for (const req of similar.taskRequests || []) {
        const freelancerId = req.freelancerId;
        const contribution = requestWeight * skillSimilarity * recencyWeight;
        freelancerScores[freelancerId] =
          (freelancerScores[freelancerId] || 0) + contribution;
        freelancerInteractionCounts[freelancerId] =
          (freelancerInteractionCounts[freelancerId] || 0) + 1;
      }
    }

    const hasCollaborativeSignal = Object.keys(freelancerScores).length > 0;

    const candidates = await this.prisma.user.findMany({
      where: {
        id: {
          not: task.clientId,
        },
        userType: 'freelancer',
        isHidden: false,
        isBanned: false,
      },
      select: {
        id: true,
        fullName: true,
        imageUrl: true,
        title: true,
        hourlyRate: true,
        rating: true,
        completedJobs: true,
        location: true,
        legacySkills: true,
        skills: {
          select: {
            name: true,
          },
        },
      },
    });

    type EnrichedCandidate = {
      id: string;
      fullName: string;
      imageUrl?: string | null;
      title?: string | null;
      hourlyRate?: number | null;
      rating?: number | null;
      completedJobs?: number | null;
      location?: string | null;
      skills: string[];
      score: number;
    };

    const enriched: EnrichedCandidate[] = candidates.map((c) => {
      const relationalSkills = (c.skills || []).map((s) => s.name);
      const allSkills = Array.from(
        new Set([...(c.legacySkills || []), ...relationalSkills]),
      );

      const skillOverlap =
        taskSkills.length && allSkills.length
          ? allSkills.filter((s) => taskSkills.includes(s)).length
          : 0;

      // normalize by sqrt(interactions) to reduce popularity bias
      const rawCollaborative = freelancerScores[c.id] || 0;
      const interactionCount = freelancerInteractionCounts[c.id] || 0;
      const normalizedCollaborative =
        rawCollaborative && interactionCount > 0
          ? rawCollaborative / Math.sqrt(interactionCount)
          : rawCollaborative;

      const skillScore = skillOverlap * 2;
      const ratingScore = c.rating ? c.rating * 0.4 : 0;

      const totalScore =
        (hasCollaborativeSignal ? normalizedCollaborative : 0) +
        skillScore +
        ratingScore;

      return {
        id: c.id,
        fullName: c.fullName,
        imageUrl: c.imageUrl,
        title: c.title,
        hourlyRate: c.hourlyRate,
        rating: c.rating,
        completedJobs: c.completedJobs,
        location: c.location,
        skills: allSkills,
        score: totalScore,
      };
    });

    enriched.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      const jobsA = a.completedJobs || 0;
      const jobsB = b.completedJobs || 0;
      return jobsB - jobsA;
    });

    const result = enriched.slice(0, limit);

    return result;
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
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.clientId !== userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    if (task.status !== 'open') {
      throw new ForbiddenException('Only tasks with "open" status can be deleted');
    }

    await this.prisma.taskApplication.deleteMany({
      where: { taskId },
    });

    const deletedTask = await this.prisma.task.delete({
      where: { id: taskId },
    });

    await this.loggingService.logAction(userId, 'TASK_DELETE', taskId, `Task deleted: ${task.title} `);

    return deletedTask;
  }
} 