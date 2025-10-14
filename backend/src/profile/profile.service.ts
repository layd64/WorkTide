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

        // Map skills relation to string array for frontend compatibility
        const userWithSkills = {
            ...user,
            skills: user.skills.map(s => s.name),
        };

        return userWithSkills;
    }

    async getPublicProfile(userId: string) {
        // This is for retrieving profiles of other users - same info but no email
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                skills: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Hide avatar if isAvatarVisible is false
        if (!user.isAvatarVisible) {
            user.imageUrl = null;
        }

        // Map skills relation to string array for frontend compatibility
        const userWithSkills = {
            ...user,
            skills: user.skills.map(s => s.name),
        };

        return userWithSkills;
    }

    async getAllFreelancers(search?: string, skills: string[] = []) {
        const freelancers = await this.prisma.user.findMany({
            where: {
                userType: 'freelancer',
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

        // Filter avatars and map skills
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
        // Find the user first to check if it exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Determine if isHidden should be updated
        const isHiddenUpdate = user.userType === 'freelancer' && profileData.isHidden !== undefined
            ? { isHidden: profileData.isHidden }
            : {};

        // Handle skills update
        let skillsUpdate = {};
        if (profileData.skills) {
            // Disconnect all existing skills and connect new ones
            // We need to find the Skill entities first
            const skillNames = profileData.skills as string[];

            // Upsert skills to ensure they exist (optional, but requested "predetermined tags", 
            // so maybe we should only connect existing ones? 
            // The requirement says "predetermined tags that user chooses instead of typing them out".
            // But if we want to allow new skills to be added by admin only, we should just connect.
            // If we want to allow users to add new skills to the "huge list", we should upsert.
            // Given "huge list for all kinds of skills", it implies a fixed set.
            // However, for robustness, I will just connect to existing skills.
            // But wait, if the user sends a skill that doesn't exist, it will fail.
            // So I should probably find the skills first.

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

        // Update the user profile fields
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

        // Log the updated user data for debugging
        console.log('Profile updated:', {
            userId,
            isHidden: updatedUser.isHidden,
            userType: updatedUser.userType
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