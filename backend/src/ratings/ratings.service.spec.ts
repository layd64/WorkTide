import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let prismaService: PrismaService;

  const mockClient = {
    id: 'client-1',
    email: 'client@example.com',
    fullName: 'Client User',
  };

  const mockFreelancer = {
    id: 'freelancer-1',
    email: 'freelancer@example.com',
    fullName: 'Freelancer User',
  };

  const mockRating = {
    id: 'rating-1',
    clientId: 'client-1',
    freelancerId: 'freelancer-1',
    score: 5,
    comment: 'Great work!',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    rating: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createRating', () => {
    const ratingParams = {
      clientId: 'client-1',
      freelancerId: 'freelancer-1',
      score: 5,
      comment: 'Excellent work!',
    };

    it('should create a new rating successfully', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockFreelancer)
        .mockResolvedValueOnce(mockClient);
      mockPrismaService.rating.findUnique.mockResolvedValue(null);
      mockPrismaService.rating.create.mockResolvedValue(mockRating);
      mockPrismaService.rating.aggregate.mockResolvedValue({
        _avg: { score: 5 },
        _count: { score: 1 },
      });
      mockPrismaService.user.update = jest.fn().mockResolvedValue({});

      const result = await service.createRating(ratingParams);

      expect(result).toEqual(mockRating);
      expect(mockPrismaService.rating.create).toHaveBeenCalled();
    });

    it('should update existing rating', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockFreelancer)
        .mockResolvedValueOnce(mockClient);
      mockPrismaService.rating.findUnique.mockResolvedValue(mockRating);
      mockPrismaService.rating.update.mockResolvedValue({
        ...mockRating,
        score: 4,
      });
      mockPrismaService.rating.aggregate.mockResolvedValue({
        _avg: { score: 4 },
        _count: { score: 1 },
      });
      mockPrismaService.user.update = jest.fn().mockResolvedValue({});

      const result = await service.createRating({
        ...ratingParams,
        score: 4,
      });

      expect(result.score).toBe(4);
      expect(mockPrismaService.rating.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException when score is invalid', async () => {
      await expect(
        service.createRating({ ...ratingParams, score: 6 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createRating({ ...ratingParams, score: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when freelancer does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createRating(ratingParams)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when client does not exist', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockFreelancer)
        .mockResolvedValueOnce(null);

      await expect(service.createRating(ratingParams)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getFreelancerRatings', () => {
    it('should return all ratings for a freelancer', async () => {
      mockPrismaService.rating.findMany.mockResolvedValue([mockRating]);

      const result = await service.getFreelancerRatings('freelancer-1');

      expect(result).toEqual([mockRating]);
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { freelancerId: 'freelancer-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('checkRatingExists', () => {
    it('should return true when rating exists', async () => {
      mockPrismaService.rating.findUnique.mockResolvedValue(mockRating);

      const result = await service.checkRatingExists('client-1', 'freelancer-1');

      expect(result.exists).toBe(true);
      expect(result.rating).toEqual(mockRating);
    });

    it('should return false when rating does not exist', async () => {
      mockPrismaService.rating.findUnique.mockResolvedValue(null);

      const result = await service.checkRatingExists('client-1', 'freelancer-1');

      expect(result.exists).toBe(false);
      expect(result.rating).toBeNull();
    });
  });
});

