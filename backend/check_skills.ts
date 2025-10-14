import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.skill.count();
    console.log(`Total skills: ${count}`);

    const react = await prisma.skill.findFirst({
        where: { name: { contains: 'React', mode: 'insensitive' } }
    });
    console.log('React skill:', react);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
