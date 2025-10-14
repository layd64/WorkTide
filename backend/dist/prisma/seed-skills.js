"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const skills_1 = require("../src/constants/skills");
const prisma = new client_1.PrismaClient();
async function seedSkills() {
    console.log('Starting skills seeding...');
    try {
        for (const skillName of skills_1.PREDETERMINED_SKILLS) {
            await prisma.skill.upsert({
                where: { name: skillName },
                update: {},
                create: { name: skillName },
            });
        }
        const count = await prisma.skill.count();
        console.log(`✓ Skills seeding completed. Total skills in database: ${count}`);
    }
    catch (error) {
        console.error('Error seeding skills:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
seedSkills()
    .catch((error) => {
    console.error('Failed to seed skills:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-skills.js.map