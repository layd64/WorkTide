import { PrismaService } from '../prisma/prisma.service';
export declare class SkillsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
    }[]>;
    search(query: string): Promise<{
        id: string;
        name: string;
    }[]>;
}
