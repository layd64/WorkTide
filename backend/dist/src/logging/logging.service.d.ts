import { PrismaService } from '../prisma/prisma.service';
export declare class LoggingService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(userId: string, action: string, targetId?: string, details?: string): Promise<void>;
}
