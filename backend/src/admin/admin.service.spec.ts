import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Test User',
    userType: 'client',
    isBanned: false,
    createdAt: new Date(),
  };

  const mockAdmin = {
    id: 'admin-1',
    email: 'admin@example.com',
    fullName: 'Admin User',
    userType: 'admin',
    isBanned: false,
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    project: {
      count: jest.fn(),
    },
    rating: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    actionLog: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    taskApplication: {
      deleteMany: jest.fn(),
    },
    taskRequest: {
      deleteMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getAllUsers();

      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('banUser', () => {
    it('should ban a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        isBanned: true,
      });
      mockPrismaService.actionLog.create.mockResolvedValue({});

      const result = await service.banUser('user-1', 'admin-1');

      expect(result.isBanned).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isBanned: true },
      });
      expect(mockPrismaService.actionLog.create).toHaveBeenCalled();
    });

    it('should throw error when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.banUser('non-existent', 'admin-1')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error when trying to ban admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);

      await expect(service.banUser('admin-1', 'admin-2')).rejects.toThrow(
        'Cannot ban an admin user',
      );
    });
  });

  describe('unbanUser', () => {
    it('should unban a user successfully', async () => {
      const bannedUser = { ...mockUser, isBanned: true };
      mockPrismaService.user.update.mockResolvedValue({
        ...bannedUser,
        isBanned: false,
      });
      mockPrismaService.actionLog.create.mockResolvedValue({});

      const result = await service.unbanUser('user-1', 'admin-1');

      expect(result.isBanned).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isBanned: false },
      });
      expect(mockPrismaService.actionLog.create).toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      mockPrismaService.user.count.mockResolvedValue(10);
      mockPrismaService.project.count.mockResolvedValue(5);
      mockPrismaService.task.count.mockResolvedValue(20);
      mockPrismaService.task.groupBy.mockResolvedValue([
        { status: 'open', _count: { status: 10 } },
        { status: 'in_progress', _count: { status: 5 } },
        { status: 'completed', _count: { status: 5 } },
      ]);

      const result = await service.getAnalytics();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('totalTasks');
      expect(result).toHaveProperty('userBreakdown');
      expect(result).toHaveProperty('taskStatusData');
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        clientId: 'user-1',
      };
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.getAllTasks();

      expect(result).toEqual([mockTask]);
      expect(mockPrismaService.task.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        clientId: 'user-1',
      };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.taskApplication.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.taskRequest.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.task.delete.mockResolvedValue(mockTask);
      mockPrismaService.actionLog.create.mockResolvedValue({});

      const result = await service.deleteTask('task-1', 'admin-1');

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.delete).toHaveBeenCalled();
      expect(mockPrismaService.actionLog.create).toHaveBeenCalled();
    });
  });

  describe('getAllRatings', () => {
    it('should return all ratings', async () => {
      const mockRating = {
        id: 'rating-1',
        clientId: 'user-1',
        freelancerId: 'user-2',
        score: 5,
      };
      mockPrismaService.rating.findMany.mockResolvedValue([mockRating]);

      const result = await service.getAllRatings();

      expect(result).toEqual([mockRating]);
      expect(mockPrismaService.rating.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteRating', () => {
    it('should delete a rating and recalculate freelancer rating', async () => {
      const mockRating = {
        id: 'rating-1',
        clientId: 'user-1',
        freelancerId: 'user-2',
        score: 5,
        freelancer: {
          fullName: 'Test Freelancer',
        },
      };
      mockPrismaService.rating.findUnique.mockResolvedValue(mockRating);
      mockPrismaService.rating.delete.mockResolvedValue(mockRating);
      mockPrismaService.rating.findMany.mockResolvedValue([
        { score: 4 },
        { score: 5 },
      ]);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.actionLog.create.mockResolvedValue({});

      const result = await service.deleteRating('rating-1', 'admin-1');

      expect(result).toEqual(mockRating);
      expect(mockPrismaService.rating.delete).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.actionLog.create).toHaveBeenCalled();
    });
  });
});
