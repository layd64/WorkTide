import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoggingService {
    constructor(private prisma: PrismaService) { }

    async logAction(userId: string, action: string, targetId?: string, details?: string) {
        try {
            await this.prisma.actionLog.create({
                data: {
                    userId,
                    action,
                    targetId,
                    details,
                },
            });
        } catch (error) {
            console.error('Failed to create action log:', error);
            // Don't throw error to prevent blocking the main action
        }
    }
}
