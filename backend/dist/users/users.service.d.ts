import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        id: string;
        fullName: string;
        userType: string;
        imageUrl: string | null;
    } | null>;
}
