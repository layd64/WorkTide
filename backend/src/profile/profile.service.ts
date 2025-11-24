import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                skills: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userWithSkills = {
            ...user,
            skills: user.skills.map(s => s.name),
        };

        return userWithSkills;
    }

    async getPublicProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                skills: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isAvatarVisible) {
            user.imageUrl = null;
        }

        const userWithSkills = {
            ...user,
            skills: user.skills.map(s => s.name),
        };

        return userWithSkills;
    }

    async getAllFreelancers(search?: string, skills: string[] = []) {
        const freelancers = await this.prisma.user.findMany({
            where: {
                isHidden: false,
                AND: [
                    search ? {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { title: { contains: search, mode: 'insensitive' } },
                        ],
                    } : {},
                    skills.length > 0 ? {
                        skills: {
                            some: {
                                name: {
                                    in: skills,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    } : {},
                ],
            },
            include: {
                skills: true,
            },
            orderBy: {
                rating: 'desc',
            },
        });

        return freelancers.map(f => {
            if (!f.isAvatarVisible) {
                f.imageUrl = null;
            }
            return {
                ...f,
                skills: f.skills.map(s => s.name),
            };
        });
    }

    async updateProfile(userId: string, profileData: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isHiddenUpdate = profileData.isHidden !== undefined
            ? { isHidden: profileData.isHidden }
            : {};

        let skillsUpdate = {};
        if (profileData.skills) {
            const skillNames = profileData.skills as string[];

            const skills = await this.prisma.skill.findMany({
                where: {
                    name: {
                        in: skillNames,
                        mode: 'insensitive',
                    },
                },
            });

            skillsUpdate = {
                skills: {
                    set: skills.map(s => ({ id: s.id })),
                },
            };
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                title: profileData.title,
                bio: profileData.bio,
                hourlyRate: profileData.hourlyRate,
                location: profileData.location,
                languages: profileData.languages || [],
                education: profileData.education || [],
                experience: profileData.experience || [],
                isAvatarVisible: profileData.isAvatarVisible,
                ...isHiddenUpdate,
                ...skillsUpdate,
            },
            include: {
                skills: true,
            },
        });

        return {
            ...updatedUser,
            skills: updatedUser.skills.map(s => s.name),
        };
    }

    async updateAvatar(userId: string, imageUrl: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { imageUrl },
            select: {
                id: true,
                imageUrl: true,
            }
        });
        return user;
    }
}