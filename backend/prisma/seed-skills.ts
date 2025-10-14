import { PrismaClient } from '@prisma/client';
import { PREDETERMINED_SKILLS } from '../src/constants/skills';

const prisma = new PrismaClient();

async function seedSkills() {
    console.log('Starting skills seeding...');

    try {
        // Insert skills only if they don't exist
        for (const skillName of PREDETERMINED_SKILLS) {
            await prisma.skill.upsert({
                where: { name: skillName },
                update: {},
                create: { name: skillName },
            });
        }

        const count = await prisma.skill.count();
        console.log(`✓ Skills seeding completed. Total skills in database: ${count}`);
    } catch (error) {
        console.error('Error seeding skills:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedSkills()
    .catch((error) => {
        console.error('Failed to seed skills:', error);
        process.exit(1);
    });
