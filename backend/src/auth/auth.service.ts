import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoggingService } from '../logging/logging.service';
import { LoginAttemptsGuard } from './guards/login-attempts.guard';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private loggingService: LoggingService,
    private loginAttemptsGuard: LoginAttemptsGuard,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.loginAttemptsGuard.recordFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      this.loginAttemptsGuard.recordFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginAttemptsGuard.recordSuccessfulAttempt(email);

    const { password: _, ...result } = user;
    return result;
  }

  async register(userData: any) {
    const { email, password, fullName, userType } = userData;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        userType: userData.userType,
        isHidden: userData.isHidden,
      },
    });

    await this.loggingService.logAction(newUser.id, 'USER_REGISTER', newUser.id, `User registered: ${newUser.email}`);

    const token = this.jwtService.sign({ email: newUser.email, sub: newUser.id, userType: newUser.userType });

    const { password: _, ...user } = newUser;
    return { user, token };
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, userType: user.userType };

    await this.loggingService.logAction(user.id, 'USER_LOGIN', user.id, `User logged in: ${user.email}`);

    return {
      access_token: this.jwtService.sign(payload),
      token: this.jwtService.sign(payload),
      user: user
    };
  }
}