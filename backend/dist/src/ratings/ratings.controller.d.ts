import { RatingsService } from './ratings.service';
declare class CreateRatingDto {
    freelancerId: string;
    score: number;
    comment?: string;
}
export declare class RatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    createRating(req: any, createRatingDto: CreateRatingDto): Promise<any>;
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
    checkRatingExists(req: any, freelancerId: string): Promise<{
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
}
export {};
