import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('../logging/logging.service');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let loggingService: LoggingService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    userType: 'freelancer',
    isBanned: false,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockLoggingService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    loggingService = module.get<LoggingService>(LoggingService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        userType: mockUser.userType,
        isBanned: mockUser.isBanned,
        createdAt: mockUser.createdAt,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is banned', async () => {
      const bannedUser = { ...mockUser, isBanned: true };
      mockPrismaService.user.findUnique.mockResolvedValue(bannedUser);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'New User',
      userType: 'client',
      isHidden: false,
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        ...registerData,
        password: 'hashedPassword',
      });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('jwt-token');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockLoggingService.logAction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return access token and user', async () => {
      const user = { ...mockUser, password: undefined };
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'jwt-token',
        token: 'jwt-token',
        user,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        userType: user.userType,
      });
      expect(mockLoggingService.logAction).toHaveBeenCalled();
    });
  });
});

