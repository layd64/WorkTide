import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateRatingParams {
  clientId: string;
  freelancerId: string;
  score: number;
  comment?: string;
}

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) { }

  async createRating(params: CreateRatingParams) {
    const { clientId, freelancerId, score, comment } = params;

    if (score < 1 || score > 5) {
      throw new BadRequestException('Rating score must be between 1 and 5');
    }

    const freelancer = await this.prisma.user.findUnique({
      where: { id: freelancerId },
    });

    if (!freelancer) {
      throw new BadRequestException('User not found');
    }

    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new BadRequestException('User not found');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const existingRating = await prisma.rating.findUnique({
        where: {
          clientId_freelancerId: {
            clientId,
            freelancerId,
          },
        },
      });

      let rating;
      if (existingRating) {
        rating = await prisma.rating.update({
          where: { id: existingRating.id },
          data: { score, comment },
        });
      } else {
        rating = await prisma.rating.create({
          data: { clientId, freelancerId, score, comment },
        });
      }

      const ratingResult = await prisma.rating.aggregate({
        where: { freelancerId },
        _avg: { score: true },
        _count: { score: true },
      });

      const avgRating = ratingResult._avg.score;
      const ratingCount = ratingResult._count.score;

      await prisma.user.update({
        where: { id: freelancerId },
        data: {
          rating: avgRating,
          completedJobs: ratingCount,
        },
      });

      return rating;
    });

    return result;
  }

  async getFreelancerRatings(freelancerId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { freelancerId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ratings;
  }

  async checkRatingExists(clientId: string, freelancerId: string) {
    const rating = await this.prisma.rating.findUnique({
      where: {
        clientId_freelancerId: {
          clientId,
          freelancerId,
        },
      },
    });

    return { exists: !!rating, rating };
  }

  private async updateFreelancerRating(freelancerId: string) {
    const result = await this.prisma.rating.aggregate({
      where: { freelancerId },
      _avg: { score: true },
      _count: { score: true },
    });

    const avgRating = result._avg.score;
    const ratingCount = result._count.score;

    await this.prisma.user.update({
      where: { id: freelancerId },
      data: {
        rating: avgRating,
        completedJobs: ratingCount,
      },
    });

    return avgRating;
  }
} 