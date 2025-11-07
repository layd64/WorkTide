"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
const TOTAL_USERS = 100;
const FREELANCER_RATIO = 0.6;
const TASKS_PER_CLIENT = 3;
const RATINGS_PER_FREELANCER = 5;
const APPLICATIONS_PER_TASK = 3;
const jobTitles = [
    'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Web Designer',
    'Content Writer', 'Copywriter', 'Technical Writer', 'SEO Specialist',
    'Digital Marketer', 'Social Media Manager', 'Marketing Analyst',
    'Data Scientist', 'Machine Learning Engineer', 'Data Analyst',
    'Project Manager', 'Business Analyst', 'Product Manager',
    'Mobile App Developer', 'iOS Developer', 'Android Developer',
    'DevOps Engineer', 'Cloud Architect', 'Security Specialist',
    'Video Editor', 'Motion Graphics Designer', 'Photographer',
];
const locations = [
    'New York, USA', 'London, UK', 'San Francisco, USA', 'Toronto, Canada',
    'Sydney, Australia', 'Berlin, Germany', 'Paris, France', 'Tokyo, Japan',
    'Singapore', 'Dubai, UAE', 'Amsterdam, Netherlands', 'Stockholm, Sweden',
    'Melbourne, Australia', 'Vancouver, Canada', 'Austin, USA', 'Seattle, USA',
    'Los Angeles, USA', 'Chicago, USA', 'Boston, USA', 'Miami, USA',
];
const languages = [
    ['English'], ['English', 'Spanish'], ['English', 'French'], ['English', 'German'],
    ['English', 'Japanese'], ['English', 'Chinese'], ['English', 'Portuguese'],
    ['English', 'Italian'], ['English', 'Russian'], ['English', 'Arabic'],
];
const taskTitles = [
    'Build a responsive e-commerce website',
    'Design a mobile app UI/UX',
    'Develop a REST API with Node.js',
    'Create social media marketing campaign',
    'Write technical documentation',
    'Design company logo and branding',
    'Build a React dashboard',
    'Develop a WordPress plugin',
    'Create animated video explainer',
    'Set up AWS infrastructure',
    'Design landing page',
    'Develop mobile app with React Native',
    'Write SEO-optimized blog posts',
    'Create data visualization dashboard',
    'Build authentication system',
    'Design user flow and wireframes',
    'Develop payment integration',
    'Create email marketing templates',
    'Build admin panel',
    'Design product packaging',
];
const taskDescriptions = [
    'I need a professional website built with modern technologies. The site should be responsive and include user authentication.',
    'Looking for a talented designer to create a beautiful and intuitive mobile app interface.',
    'Need an experienced developer to build a robust API with proper error handling and documentation.',
    'Seeking a marketing expert to create and manage a comprehensive social media campaign.',
    'Require a technical writer to document our API and create user guides.',
    'Need a creative designer to develop our brand identity including logo and color scheme.',
    'Looking for a React developer to build a comprehensive dashboard with charts and analytics.',
    'Need a WordPress developer to create a custom plugin with specific functionality.',
    'Seeking a video editor to create an engaging animated explainer video for our product.',
    'Require a cloud architect to set up and configure AWS infrastructure for our application.',
];
const coverLetters = [
    'I have extensive experience in this field and would love to help you with this project.',
    'I am very interested in this opportunity and believe I can deliver excellent results.',
    'I have worked on similar projects before and can provide high-quality work.',
    'I am passionate about this type of work and would be excited to collaborate with you.',
    'I have the skills and experience needed to complete this project successfully.',
    'I can start immediately and deliver the project within your timeline.',
    'I specialize in this area and have a proven track record of success.',
    'I am confident I can exceed your expectations with this project.',
];
const ratingComments = [
    'Excellent work! Very professional and delivered on time.',
    'Great communication throughout the project. Highly recommended!',
    'Outstanding quality and attention to detail.',
    'Very satisfied with the work. Will definitely work together again.',
    'Professional, reliable, and skilled. Great experience!',
    'Exceeded expectations. The final result was perfect.',
    'Good work overall, met all requirements.',
    'Pleasure to work with. Delivered quality work on schedule.',
    'Very talented and easy to communicate with.',
    'Highly skilled professional. Would recommend to others.',
];
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
async function getRandomSkills(count) {
    const allSkills = await prisma.skill.findMany();
    const shuffled = faker_1.faker.helpers.shuffle(allSkills);
    return shuffled.slice(0, count).map(skill => skill.id);
}
function getRandomImageUrl(seed) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}
let thumbnailUrls = null;
function initializeThumbnails() {
    if (thumbnailUrls) {
        return thumbnailUrls;
    }
    const thumbnails = ['thumbnail1.png', 'thumbnail2.png', 'thumbnail3.png'];
    const mockupDataPath = path.join(__dirname, '..', 'mockup_data');
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
    }
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    thumbnailUrls = [];
    for (const thumbnail of thumbnails) {
        const sourcePath = path.join(mockupDataPath, thumbnail);
        if (fs.existsSync(sourcePath)) {
            const uniqueFilename = `${(0, uuid_1.v4)()}.png`;
            const destinationPath = path.join(uploadsPath, uniqueFilename);
            fs.copyFileSync(sourcePath, destinationPath);
            thumbnailUrls.push(`${baseUrl}/uploads/${uniqueFilename}`);
        }
    }
    return thumbnailUrls;
}
function getRandomTaskImageUrl() {
    const urls = initializeThumbnails();
    if (urls.length === 0) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${(0, uuid_1.v4)()}.png`;
    }
    return faker_1.faker.helpers.arrayElement(urls);
}
async function createUsers() {
    console.log('Creating users...');
    const users = [];
    const numFreelancers = Math.floor(TOTAL_USERS * FREELANCER_RATIO);
    const numClients = TOTAL_USERS - numFreelancers;
    for (let i = 0; i < numFreelancers; i++) {
        const firstName = faker_1.faker.person.firstName();
        const lastName = faker_1.faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker_1.faker.internet.email({ firstName, lastName }).toLowerCase();
        const password = await hashPassword('password123');
        const userType = 'freelancer';
        const title = faker_1.faker.helpers.arrayElement(jobTitles);
        const bio = faker_1.faker.lorem.paragraph();
        const hourlyRate = faker_1.faker.number.float({ min: 15, max: 150, fractionDigits: 2 });
        const rating = faker_1.faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 });
        const completedJobs = faker_1.faker.number.int({ min: 0, max: 100 });
        const location = faker_1.faker.helpers.arrayElement(locations);
        const userLanguages = faker_1.faker.helpers.arrayElement(languages);
        const imageUrl = getRandomImageUrl(`${firstName}-${lastName}-${i}`);
        const isHidden = faker_1.faker.datatype.boolean({ probability: 0.1 });
        const isAvatarVisible = faker_1.faker.datatype.boolean({ probability: 0.9 });
        const education = Array.from({ length: faker_1.faker.number.int({ min: 1, max: 3 }) }, () => ({
            degree: faker_1.faker.helpers.arrayElement(['Bachelor', 'Master', 'PhD', 'Certificate']),
            field: faker_1.faker.helpers.arrayElement(['Computer Science', 'Design', 'Business', 'Marketing', 'Engineering']),
            institution: faker_1.faker.company.name() + ' University',
            year: faker_1.faker.date.past({ years: 10 }).getFullYear(),
        }));
        const experience = Array.from({ length: faker_1.faker.number.int({ min: 1, max: 4 }) }, () => ({
            title: faker_1.faker.helpers.arrayElement(jobTitles),
            company: faker_1.faker.company.name(),
            startDate: faker_1.faker.date.past({ years: 5 }).toISOString(),
            endDate: faker_1.faker.datatype.boolean({ probability: 0.7 }) ? faker_1.faker.date.recent({ days: 30 }).toISOString() : null,
            description: faker_1.faker.lorem.paragraph(),
        }));
        const skills = await getRandomSkills(faker_1.faker.number.int({ min: 3, max: 10 }));
        const user = await prisma.user.create({
            data: {
                email,
                password,
                fullName,
                userType,
                title,
                bio,
                hourlyRate,
                rating,
                completedJobs,
                location,
                imageUrl,
                languages: userLanguages,
                education: education,
                experience: experience,
                isHidden,
                isAvatarVisible,
                skills: {
                    connect: skills.map(id => ({ id })),
                },
            },
        });
        users.push(user);
        if ((i + 1) % 10 === 0) {
            console.log(`  Created ${i + 1}/${numFreelancers} freelancers...`);
        }
    }
    console.log(`✓ Created ${numFreelancers} freelancers`);
    for (let i = 0; i < numClients; i++) {
        const firstName = faker_1.faker.person.firstName();
        const lastName = faker_1.faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker_1.faker.internet.email({ firstName, lastName }).toLowerCase();
        const password = await hashPassword('password123');
        const userType = 'client';
        const location = faker_1.faker.helpers.arrayElement(locations);
        const imageUrl = getRandomImageUrl(`client-${firstName}-${lastName}-${i}`);
        const isAvatarVisible = faker_1.faker.datatype.boolean({ probability: 0.9 });
        const user = await prisma.user.create({
            data: {
                email,
                password,
                fullName,
                userType,
                location,
                imageUrl,
                isAvatarVisible,
            },
        });
        users.push(user);
        if ((i + 1) % 10 === 0) {
            console.log(`  Created ${i + 1}/${numClients} clients...`);
        }
    }
    console.log(`✓ Created ${numClients} clients`);
    return users;
}
async function createTasks(users) {
    console.log('Creating tasks...');
    const clients = users.filter(u => u.userType === 'client');
    const tasks = [];
    for (const client of clients) {
        const numTasks = faker_1.faker.number.int({ min: 1, max: TASKS_PER_CLIENT * 2 });
        for (let i = 0; i < numTasks; i++) {
            const title = faker_1.faker.helpers.arrayElement(taskTitles);
            const description = faker_1.faker.helpers.arrayElement(taskDescriptions) + ' ' + faker_1.faker.lorem.paragraph();
            const budget = faker_1.faker.number.float({ min: 100, max: 10000, fractionDigits: 2 });
            const status = faker_1.faker.helpers.arrayElement(['open', 'in_progress', 'completed', 'pending']);
            const allSkills = await prisma.skill.findMany();
            const taskSkills = faker_1.faker.helpers
                .shuffle(allSkills)
                .slice(0, faker_1.faker.number.int({ min: 2, max: 6 }))
                .map(s => s.name);
            const imageUrl = getRandomTaskImageUrl();
            const createdAt = faker_1.faker.date.past({ years: 1 });
            const task = await prisma.task.create({
                data: {
                    title,
                    description,
                    budget,
                    skills: taskSkills,
                    status,
                    imageUrl,
                    clientId: client.id,
                    createdAt,
                    updatedAt: createdAt,
                },
            });
            tasks.push(task);
        }
    }
    console.log(`✓ Created ${tasks.length} tasks`);
    return tasks;
}
async function createRatings(users) {
    console.log('Creating ratings...');
    const freelancers = users.filter(u => u.userType === 'freelancer');
    const clients = users.filter(u => u.userType === 'client');
    const ratings = [];
    for (const freelancer of freelancers) {
        const numRatings = faker_1.faker.number.int({ min: 0, max: RATINGS_PER_FREELANCER * 2 });
        const selectedClients = faker_1.faker.helpers.shuffle(clients).slice(0, numRatings);
        for (const client of selectedClients) {
            const score = faker_1.faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 });
            const comment = faker_1.faker.helpers.arrayElement(ratingComments);
            const createdAt = faker_1.faker.date.past({ years: 1 });
            try {
                const rating = await prisma.rating.create({
                    data: {
                        score,
                        comment,
                        freelancerId: freelancer.id,
                        clientId: client.id,
                        createdAt,
                    },
                });
                ratings.push(rating);
            }
            catch (error) {
            }
        }
        const freelancerRatings = await prisma.rating.findMany({
            where: { freelancerId: freelancer.id },
        });
        if (freelancerRatings.length > 0) {
            const avgRating = freelancerRatings.reduce((sum, r) => sum + r.score, 0) / freelancerRatings.length;
            await prisma.user.update({
                where: { id: freelancer.id },
                data: { rating: Math.round(avgRating * 10) / 10 },
            });
        }
    }
    console.log(`✓ Created ${ratings.length} ratings`);
    return ratings;
}
async function createTaskApplications(users, tasks) {
    console.log('Creating task applications...');
    const freelancers = users.filter(u => u.userType === 'freelancer');
    const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'pending');
    const applications = [];
    for (const task of openTasks) {
        const numApplications = faker_1.faker.number.int({ min: 0, max: APPLICATIONS_PER_TASK * 2 });
        const selectedFreelancers = faker_1.faker.helpers.shuffle(freelancers).slice(0, numApplications);
        for (const freelancer of selectedFreelancers) {
            const coverLetter = faker_1.faker.helpers.arrayElement(coverLetters);
            const status = faker_1.faker.helpers.arrayElement(['pending', 'accepted', 'rejected']);
            const createdAt = faker_1.faker.date.recent({ days: 30 });
            try {
                const application = await prisma.taskApplication.create({
                    data: {
                        coverLetter,
                        status,
                        taskId: task.id,
                        freelancerId: freelancer.id,
                        createdAt,
                        updatedAt: createdAt,
                    },
                });
                applications.push(application);
            }
            catch (error) {
            }
        }
    }
    console.log(`✓ Created ${applications.length} task applications`);
    return applications;
}
async function createTaskRequests(users, tasks) {
    console.log('Creating task requests...');
    const freelancers = users.filter(u => u.userType === 'freelancer');
    const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'pending');
    const requests = [];
    const numRequests = Math.min(20, openTasks.length);
    const selectedTasks = faker_1.faker.helpers.shuffle(openTasks).slice(0, numRequests);
    for (const task of selectedTasks) {
        const freelancer = faker_1.faker.helpers.arrayElement(freelancers);
        const status = faker_1.faker.helpers.arrayElement(['pending', 'accepted', 'rejected']);
        const createdAt = faker_1.faker.date.recent({ days: 20 });
        try {
            const request = await prisma.taskRequest.create({
                data: {
                    status,
                    taskId: task.id,
                    freelancerId: freelancer.id,
                    clientId: task.clientId,
                    createdAt,
                    updatedAt: createdAt,
                },
            });
            requests.push(request);
        }
        catch (error) {
        }
    }
    console.log(`✓ Created ${requests.length} task requests`);
    return requests;
}
async function createMessages(users) {
    console.log('Creating messages...');
    const messages = [];
    const numConversations = 30;
    for (let i = 0; i < numConversations; i++) {
        const [sender, receiver] = faker_1.faker.helpers.arrayElements(users, 2);
        const numMessages = faker_1.faker.number.int({ min: 3, max: 10 });
        for (let j = 0; j < numMessages; j++) {
            const content = j === 0
                ? 'Hello! I\'m interested in discussing this project with you.'
                : faker_1.faker.lorem.sentence();
            const createdAt = faker_1.faker.date.recent({ days: 15 });
            const message = await prisma.message.create({
                data: {
                    content,
                    senderId: j % 2 === 0 ? sender.id : receiver.id,
                    receiverId: j % 2 === 0 ? receiver.id : sender.id,
                    isSystem: false,
                    createdAt,
                },
            });
            messages.push(message);
        }
    }
    console.log(`✓ Created ${messages.length} messages`);
    return messages;
}
async function createNotifications(users, applications, requests) {
    console.log('Creating notifications...');
    const notifications = [];
    for (const application of applications.slice(0, 50)) {
        const task = await prisma.task.findUnique({ where: { id: application.taskId } });
        if (task) {
            const notification = await prisma.notification.create({
                data: {
                    userId: task.clientId,
                    type: 'APPLICATION_RECEIVED',
                    title: 'New Application Received',
                    message: `You have received a new application for "${task.title}"`,
                    relatedId: application.id,
                    isRead: faker_1.faker.datatype.boolean({ probability: 0.3 }),
                    createdAt: faker_1.faker.date.recent({ days: 10 }),
                },
            });
            notifications.push(notification);
        }
    }
    for (const request of requests.slice(0, 20)) {
        const task = await prisma.task.findUnique({ where: { id: request.taskId } });
        if (task) {
            const notification = await prisma.notification.create({
                data: {
                    userId: request.freelancerId,
                    type: 'REQUEST_RECEIVED',
                    title: 'Task Request Received',
                    message: `You have been invited to work on "${task.title}"`,
                    relatedId: request.id,
                    isRead: faker_1.faker.datatype.boolean({ probability: 0.3 }),
                    createdAt: faker_1.faker.date.recent({ days: 10 }),
                },
            });
            notifications.push(notification);
        }
    }
    console.log(`✓ Created ${notifications.length} notifications`);
    return notifications;
}
async function createAdmin() {
    console.log('Creating admin account...');
    const email = 'admin@worktide.com';
    const password = await hashPassword('admin123');
    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            fullName: 'System Admin',
            userType: 'admin',
            isBanned: false,
        },
    });
    console.log(`✓ Admin account created/updated: ${admin.email}`);
    return admin;
}
async function main() {
    console.log('🚀 Starting mock data generation...\n');
    try {
        const skillsCount = await prisma.skill.count();
        if (skillsCount === 0) {
            console.log('⚠️  No skills found. Please run seed-skills.ts first.');
            return;
        }
        await createAdmin();
        console.log('');
        const users = await createUsers();
        console.log('');
        const tasks = await createTasks(users);
        console.log('');
        const ratings = await createRatings(users);
        console.log('');
        const applications = await createTaskApplications(users, tasks);
        console.log('');
        const requests = await createTaskRequests(users, tasks);
        console.log('');
        const messages = await createMessages(users);
        console.log('');
        console.log('📊 Summary:');
        console.log(`  Admin: 1 (email: admin@worktide.com, password: admin123)`);
        console.log(`  Users: ${users.length}`);
        console.log(`  Freelancers: ${users.filter(u => u.userType === 'freelancer').length}`);
        console.log(`  Clients: ${users.filter(u => u.userType === 'client').length}`);
        console.log(`  Tasks: ${tasks.length}`);
        console.log(`  Ratings: ${ratings.length}`);
        console.log(`  Task Applications: ${applications.length}`);
        console.log(`  Task Requests: ${requests.length}`);
        console.log(`  Messages: ${messages.length}`);
        console.log(`  Notifications: 0 (not generated)`);
        console.log('\n✅ Mock data generation completed successfully!');
        console.log('\n💡 All users have the default password: password123');
        console.log('💡 Admin account: admin@worktide.com / admin123');
    }
    catch (error) {
        console.error('❌ Error generating mock data:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((error) => {
    console.error('Failed to generate mock data:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-mock-data.js.map