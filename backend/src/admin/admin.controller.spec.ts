import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
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
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
