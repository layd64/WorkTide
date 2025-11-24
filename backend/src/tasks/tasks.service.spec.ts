import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;
  let loggingService: LoggingService;

  const mockUser = {
    id: '1',
    email: 'client@example.com',
    fullName: 'Client User',
    userType: 'client',
  };

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    budget: 1000,
    skills: ['React', 'TypeScript'],
    imageUrl: 'http://example.com/image.jpg',
    clientId: '1',
    status: 'open',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    taskApplication: {
      deleteMany: jest.fn(),
    },
  };

  const mockLoggingService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
    loggingService = module.get<LoggingService>(LoggingService);

    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const taskData = {
      title: 'New Task',
      description: 'Task Description',
      budget: 500,
      skills: ['JavaScript'],
      imageUrl: 'http://example.com/image.jpg',
    };

    it('should create a task successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.task.create.mockResolvedValue({
        ...mockTask,
        ...taskData,
      });

      const result = await service.createTask('1', taskData);

      expect(result).toHaveProperty('id');
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          ...taskData,
          clientId: '1',
        },
      });
      expect(mockLoggingService.logAction).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createTask('1', taskData)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when imageUrl is missing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.createTask('1', { ...taskData, imageUrl: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.getTaskById('task-1');

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.getTaskById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTask', () => {
    const updateData = {
      title: 'Updated Task',
      budget: 1500,
    };

    it('should update task successfully', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue({
        ...mockTask,
        ...updateData,
      });

      const result = await service.updateTask('task-1', '1', updateData);

      expect(result).toMatchObject(updateData);
      expect(mockPrismaService.task.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTask('non-existent', '1', updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      await expect(
        service.updateTask('task-1', 'different-user-id', updateData),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.taskApplication.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await service.deleteTask('task-1', '1');

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.delete).toHaveBeenCalled();
      expect(mockLoggingService.logAction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.deleteTask('non-existent', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when task status is not open', async () => {
      const closedTask = { ...mockTask, status: 'completed' };
      mockPrismaService.task.findUnique.mockResolvedValue(closedTask);

      await expect(service.deleteTask('task-1', '1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks with default filters', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.getAllTasks();

      expect(result).toEqual([mockTask]);
      expect(mockPrismaService.task.findMany).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);

      await service.getAllTasks({ search: 'Test' });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: { contains: 'Test', mode: 'insensitive' } },
            { description: { contains: 'Test', mode: 'insensitive' } },
          ]),
        }),
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should filter by skills', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);

      await service.getAllTasks({ skills: ['React'] });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          skills: { hasSome: ['React'] },
        }),
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });
});

