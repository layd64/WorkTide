import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function createTestUser(data?: {
  email?: string;
  password?: string;
  fullName?: string;
  userType?: 'client' | 'freelancer' | 'admin';
}) {
  const hashedPassword = await bcrypt.hash(data?.password || 'password123', 10);
  const email = data?.email || `test-${Date.now()}@example.com`;
  
  // Use upsert to handle cases where user already exists (from previous test runs)
  return prisma.user.upsert({
    where: {
      email: email,
    },
    update: {
      password: hashedPassword,
      fullName: data?.fullName || 'Test User',
      userType: data?.userType || 'client',
      isBanned: false,
      isHidden: false,
    },
    create: {
      email: email,
      password: hashedPassword,
      fullName: data?.fullName || 'Test User',
      userType: data?.userType || 'client',
      isBanned: false,
      isHidden: false,
    },
  });
}

export async function createTestTask(data: {
  clientId: string;
  title?: string;
  description?: string;
  budget?: number;
  skills?: string[];
  imageUrl?: string;
}) {
  return prisma.task.create({
    data: {
      clientId: data.clientId,
      title: data.title || 'Test Task',
      description: data.description || 'Test Description',
      budget: data.budget || 1000,
      skills: data.skills || ['React'],
      imageUrl: data.imageUrl || 'http://example.com/image.jpg',
      status: 'open',
    },
  });
}

export async function createTestRating(data: {
  clientId: string;
  freelancerId: string;
  score: number;
  comment?: string;
}) {
  return prisma.rating.create({
    data: {
      clientId: data.clientId,
      freelancerId: data.freelancerId,
      score: data.score,
      comment: data.comment,
    },
  });
}

export async function cleanupTestData() {
  // Delete in order to respect foreign key constraints
  await prisma.rating.deleteMany({});
  await prisma.taskApplication.deleteMany({});
  await prisma.taskRequest.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.actionLog.deleteMany({});
  
  // Delete all test users (emails starting with 'test-' or containing '@test.com')
  // Preserve admin users and other non-test users
  // Use a more aggressive cleanup for E2E tests
  const testEmails = [
    'client@test.com',
    'freelancer@test.com',
    'newuser@test.com',
  ];
  
  // Delete specific test emails
  for (const email of testEmails) {
    await prisma.user.deleteMany({
      where: { email },
    });
  }
  
  // Also delete any users with test- prefix or @test.com domain
  await prisma.user.deleteMany({
    where: {
      AND: [
        {
          userType: {
            not: 'admin',
          },
        },
        {
          OR: [
            {
              email: {
                startsWith: 'test-',
              },
            },
            {
              email: {
                contains: '@test.com',
              },
            },
          ],
        },
      ],
    },
  });
}

export { prisma };

