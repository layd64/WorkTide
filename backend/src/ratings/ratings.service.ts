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

    // Validate score is between 1 and 5
    if (score < 1 || score > 5) {
      throw new BadRequestException('Rating score must be between 1 and 5');
    }

    // Check if the person being rated exists
    const freelancer = await this.prisma.user.findUnique({
      where: { id: freelancerId },
    });

    if (!freelancer) {
      throw new BadRequestException('User not found');
    }

    // Check if the person giving the rating exists
    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new BadRequestException('User not found');
    }

    // Check if rating already exists
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        clientId_freelancerId: {
          clientId,
          freelancerId,
        },
      },
    });

    // If rating exists, update it, otherwise create it
    let rating;
    if (existingRating) {
      rating = await this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { score, comment },
      });
    } else {
      rating = await this.prisma.rating.create({
        data: { clientId, freelancerId, score, comment },
      });
    }

    // Update freelancer's average rating
    await this.updateFreelancerRating(freelancerId);

    return rating;
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
    // Calculate average rating
    const result = await this.prisma.rating.aggregate({
      where: { freelancerId },
      _avg: { score: true },
      _count: { score: true },
    });

    const avgRating = result._avg.score;
    const ratingCount = result._count.score;

    // Update freelancer's rating
    await this.prisma.user.update({
      where: { id: freelancerId },
      data: {
        rating: avgRating,
        completedJobs: ratingCount, // Assuming each rating corresponds to a completed job
      },
    });

    return avgRating;
  }
} 