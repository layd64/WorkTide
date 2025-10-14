import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
    // Development
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust',
    'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring Boot',
    'HTML', 'CSS', 'Sass', 'Less', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'Prisma', 'TypeORM',
    'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Firebase', 'Heroku', 'Vercel', 'Netlify',
    'Android', 'iOS', 'React Native', 'Flutter', 'Ionic',
    'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch',

    // Design
    'UI Design', 'UX Design', 'Web Design', 'Mobile App Design', 'Graphic Design', 'Logo Design', 'Branding', 'Illustration',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere Pro',
    'Prototyping', 'Wireframing', 'User Research', 'Usability Testing',

    // Marketing
    'Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Affiliate Marketing',
    'Copywriting', 'Content Writing', 'Technical Writing', 'Blogging', 'Ghostwriting',
    'Google Analytics', 'Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads',

    // Business
    'Project Management', 'Product Management', 'Business Analysis', 'Virtual Assistant', 'Data Entry', 'Transcription',
    'Translation', 'Proofreading', 'Editing', 'Research', 'Market Research',
    'Accounting', 'Bookkeeping', 'Financial Analysis', 'Consulting', 'Legal Consulting',

    // Other
    'Photography', 'Videography', 'Video Editing', 'Audio Editing', 'Voice Over', 'Music Production',
    'Animation', '3D Modeling', 'Game Development', 'Unity', 'Unreal Engine',
];

async function main() {
    console.log('Seeding skills...');

    for (const skillName of skills) {
        await prisma.skill.upsert({
            where: { name: skillName },
            update: {},
            create: {
                name: skillName,
            },
        });
    }

    console.log('Skills seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
