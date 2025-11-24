import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Test User',
    userType: 'freelancer',
    title: 'Developer',
    bio: 'Test bio',
    hourlyRate: 50,
    rating: 4.5,
    completedJobs: 10,
    location: 'New York',
    imageUrl: 'http://example.com/avatar.jpg',
    isAvatarVisible: true,
    skills: [
      { id: '1', name: 'React' },
      { id: '2', name: 'TypeScript' },
    ],
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile with skills as array', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toMatchObject({
        id: mockUser.id,
        fullName: mockUser.fullName,
        skills: ['React', 'TypeScript'],
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPublicProfile', () => {
    it('should return public profile with visible avatar', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getPublicProfile('user-1');

      expect(result.imageUrl).toBe('http://example.com/avatar.jpg');
      expect(result.skills).toEqual(['React', 'TypeScript']);
    });

    it('should hide avatar when isAvatarVisible is false', async () => {
      const userWithHiddenAvatar = { ...mockUser, isAvatarVisible: false };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithHiddenAvatar);

      const result = await service.getPublicProfile('user-1');

      expect(result.imageUrl).toBeNull();
    });
  });

  describe('getAllFreelancers', () => {
    it('should return all freelancers', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getAllFreelancers();

      expect(result).toHaveLength(1);
      expect(result[0].skills).toEqual(['React', 'TypeScript']);
    });

    it('should filter by search term', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.getAllFreelancers('Developer');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                { fullName: { contains: 'Developer', mode: 'insensitive' } },
                { title: { contains: 'Developer', mode: 'insensitive' } },
              ]),
            }),
          ]),
        }),
        include: { skills: true },
        orderBy: { rating: 'desc' },
      });
    });

    it('should filter by skills', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.getAllFreelancers(undefined, ['React']);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              skills: {
                some: {
                  name: { in: ['React'], mode: 'insensitive' },
                },
              },
            }),
          ]),
        }),
        include: { skills: true },
        orderBy: { rating: 'desc' },
      });
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      title: 'Senior Developer',
      bio: 'Updated bio',
      hourlyRate: 75,
      skills: ['React', 'TypeScript', 'Node.js'],
    };

    it('should update profile successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.skill.findMany.mockResolvedValue([
        { id: '1', name: 'React' },
        { id: '2', name: 'TypeScript' },
        { id: '3', name: 'Node.js' },
      ]);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
        skills: [
          { id: '1', name: 'React' },
          { id: '2', name: 'TypeScript' },
          { id: '3', name: 'Node.js' },
        ],
      });

      const result = await service.updateProfile('user-1', updateData);

      expect(result.title).toBe(updateData.title);
      expect(result.skills).toEqual(['React', 'TypeScript', 'Node.js']);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', updateData),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar successfully', async () => {
      const newImageUrl = 'http://example.com/new-avatar.jpg';
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-1',
        imageUrl: newImageUrl,
      });

      const result = await service.updateAvatar('user-1', newImageUrl);

      expect(result.imageUrl).toBe(newImageUrl);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { imageUrl: newImageUrl },
        select: { id: true, imageUrl: true },
      });
    });
  });
});

