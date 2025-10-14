"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=check_skills.js.map