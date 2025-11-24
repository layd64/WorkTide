import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';

interface LoginAttempt {
  count: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

@Injectable()
export class LoginAttemptsGuard implements CanActivate {
  // In-memory store for login attempts
  // In production, consider using Redis or a database for distributed systems
  private readonly loginAttempts = new Map<string, LoginAttempt>();
  
  // Configuration
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes window for attempts

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const email = request.body?.email;

    if (!email) {
      return true; // Let other guards handle missing email
    }

    const normalizedEmail = email.toLowerCase().trim();
    const attempt = this.loginAttempts.get(normalizedEmail);

    // Check if account is locked
    if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (attempt.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      throw new UnauthorizedException(
        `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`
      );
    }

    // Reset if lockout period has passed
    if (attempt?.lockedUntil && attempt.lockedUntil <= new Date()) {
      this.loginAttempts.delete(normalizedEmail);
    }

    return true;
  }

  recordFailedAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const attempt = this.loginAttempts.get(normalizedEmail) || {
      count: 0,
      lastAttempt: now,
    };

    // Reset count if window has passed
    if (now.getTime() - attempt.lastAttempt.getTime() > this.WINDOW_MS) {
      attempt.count = 0;
    }

    attempt.count++;
    attempt.lastAttempt = now;

    // Lock account if max attempts reached
    if (attempt.count >= this.MAX_ATTEMPTS) {
      attempt.lockedUntil = new Date(now.getTime() + this.LOCKOUT_DURATION_MS);
    }

    this.loginAttempts.set(normalizedEmail, attempt);
  }

  recordSuccessfulAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    this.loginAttempts.delete(normalizedEmail);
  }

  getRemainingAttempts(email: string): number {
    const normalizedEmail = email.toLowerCase().trim();
    const attempt = this.loginAttempts.get(normalizedEmail);
    
    if (!attempt) {
      return this.MAX_ATTEMPTS;
    }

    // Reset if window has passed
    const now = new Date();
    if (now.getTime() - attempt.lastAttempt.getTime() > this.WINDOW_MS) {
      return this.MAX_ATTEMPTS;
    }

    return Math.max(0, this.MAX_ATTEMPTS - attempt.count);
  }
}

