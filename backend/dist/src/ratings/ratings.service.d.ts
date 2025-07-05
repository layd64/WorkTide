import { PrismaService } from '../prisma/prisma.service';
interface CreateRatingParams {
    clientId: string;
    freelancerId: string;
    score: number;
    comment?: string;
}
export declare class RatingsService {
    private prisma;
    constructor(prisma: PrismaService);
    createRating(params: CreateRatingParams): Promise<any>;
    getFreelancerRatings(freelancerId: string): Promise<({
        client: {
            id: string;
            fullName: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        clientId: string;
        freelancerId: string;
        score: number;
        comment: string | null;
    })[]>;
    checkRatingExists(clientId: string, freelancerId: string): Promise<{
        exists: boolean;
        rating: {
            id: string;
            createdAt: Date;
            clientId: string;
            freelancerId: string;
            score: number;
            comment: string | null;
        } | null;
    }>;
    private updateFreelancerRating;
}
export {};
