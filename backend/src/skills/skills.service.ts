import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.skill.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async search(query: string) {
        if (!query) {
            return this.findAll();
        }
        return this.prisma.skill.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                name: 'asc',
            },
            take: 20,
        });
    }
}
