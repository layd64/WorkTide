"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function deleteMockData() {
    console.log('🗑️  Starting deletion of mock data...\n');
    try {
        console.log('Deleting notifications...');
        const deletedNotifications = await prisma.notification.deleteMany({
            where: {},
        });
        console.log(`  ✓ Deleted ${deletedNotifications.count} notifications`);
        console.log('Deleting messages...');
        const deletedMessages = await prisma.message.deleteMany({});
        console.log(`  ✓ Deleted ${deletedMessages.count} messages`);
        console.log('Deleting task requests...');
        const deletedTaskRequests = await prisma.taskRequest.deleteMany({});
        console.log(`  ✓ Deleted ${deletedTaskRequests.count} task requests`);
        console.log('Deleting task applications...');
        const deletedApplications = await prisma.taskApplication.deleteMany({});
        console.log(`  ✓ Deleted ${deletedApplications.count} task applications`);
        console.log('Deleting ratings...');
        const deletedRatings = await prisma.rating.deleteMany({});
        console.log(`  ✓ Deleted ${deletedRatings.count} ratings`);
        console.log('Deleting tasks...');
        const deletedTasks = await prisma.task.deleteMany({});
        console.log(`  ✓ Deleted ${deletedTasks.count} tasks`);
        console.log('Deleting action logs...');
        const deletedLogs = await prisma.actionLog.deleteMany({});
        console.log(`  ✓ Deleted ${deletedLogs.count} action logs`);
        console.log('Deleting users (excluding admin)...');
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                userType: {
                    not: 'admin',
                },
            },
        });
        console.log(`  ✓ Deleted ${deletedUsers.count} users`);
        console.log('\n✅ Mock data deletion completed successfully!');
        console.log('ℹ️  Admin accounts and skills were preserved.');
    }
    catch (error) {
        console.error('❌ Error deleting mock data:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
deleteMockData()
    .catch((error) => {
    console.error('Failed to delete mock data:', error);
    process.exit(1);
});
//# sourceMappingURL=delete-mock-data.js.map