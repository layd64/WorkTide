import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginAttemptsGuard } from './guards/login-attempts.guard';
import { PrismaService } from '../prisma/prisma.service';
import { validateEmail, validatePassword, validateFullName, validateEnum } from '../utils/validation';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) { }

  @Post('signup')
  async signup(
    @Body()
    data: {
      email: string;
      password: string;
      fullName: string;
      userType: 'freelancer' | 'client';
      isHidden?: boolean;
    },
  ) {
    validateEmail(data.email);
    validatePassword(data.password);
    validateFullName(data.fullName);
    validateEnum(data.userType, 'User type', ['freelancer', 'client']);
    
    return this.authService.register(data);
  }

  @Post('login')
  @UseGuards(LoginAttemptsGuard)
  async login(
    @Body() data: { email: string; password: string },
  ) {
    validateEmail(data.email);
    if (!data.password || typeof data.password !== 'string' || data.password.trim().length === 0) {
      throw new BadRequestException('Password is required');
    }
    
    const user = await this.authService.validateUser(data.email, data.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    // Get user details from database using the user ID
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        createdAt: true,
        title: true,
        bio: true,
        skills: true,
        hourlyRate: true,
        rating: true,
        completedJobs: true,
        location: true,
        languages: true,
        education: true,
        experience: true,
        imageUrl: true,
        isHidden: true,
        isAvatarVisible: true,
      },
    });

    if (!user) {
      return null;
    }

    const userWithSkills = {
      ...user,
      skills: (user.skills as any[]).map(s => s.name),
    };

    return userWithSkills;
  }
} 