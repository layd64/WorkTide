import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockChatGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
