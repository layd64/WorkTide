import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

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
    },
  ) {
    return this.authService.register(data);
  }

  @Post('login')
  async login(
    @Body() data: { email: string; password: string },
  ) {
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

    // Map skills relation to string array for frontend compatibility
    // We need to cast to any because the type inference from select doesn't automatically pick up the relation structure perfectly here
    const userWithSkills = {
      ...user,
      skills: (user.skills as any[]).map(s => s.name),
    };

    return userWithSkills;
  }
} 