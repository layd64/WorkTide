"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsService = class RatingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRating(params) {
        const { clientId, freelancerId, score, comment } = params;
        if (score < 1 || score > 5) {
            throw new common_1.BadRequestException('Rating score must be between 1 and 5');
        }
        const freelancer = await this.prisma.user.findUnique({
            where: { id: freelancerId },
        });
        if (!freelancer) {
            throw new common_1.BadRequestException('Freelancer not found');
        }
        if (freelancer.userType !== 'freelancer') {
            throw new common_1.BadRequestException('Cannot rate a non-freelancer user');
        }
        const client = await this.prisma.user.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.BadRequestException('Client not found');
        }
        if (client.userType !== 'client') {
            throw new common_1.ForbiddenException('Only clients can rate freelancers');
        }
        const existingRating = await this.prisma.rating.findUnique({
            where: {
                clientId_freelancerId: {
                    clientId,
                    freelancerId,
                },
            },
        });
        let rating;
        if (existingRating) {
            rating = await this.prisma.rating.update({
                where: { id: existingRating.id },
                data: { score, comment },
            });
        }
        else {
            rating = await this.prisma.rating.create({
                data: { clientId, freelancerId, score, comment },
            });
        }
        await this.updateFreelancerRating(freelancerId);
        return rating;
    }
    async getFreelancerRatings(freelancerId) {
        const ratings = await this.prisma.rating.findMany({
            where: { freelancerId },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return ratings;
    }
    async checkRatingExists(clientId, freelancerId) {
        const rating = await this.prisma.rating.findUnique({
            where: {
                clientId_freelancerId: {
                    clientId,
                    freelancerId,
                },
            },
        });
        return { exists: !!rating, rating };
    }
    async updateFreelancerRating(freelancerId) {
        const result = await this.prisma.rating.aggregate({
            where: { freelancerId },
            _avg: { score: true },
            _count: { score: true },
        });
        const avgRating = result._avg.score;
        const ratingCount = result._count.score;
        await this.prisma.user.update({
            where: { id: freelancerId },
            data: {
                rating: avgRating,
                completedJobs: ratingCount,
            },
        });
        return avgRating;
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map