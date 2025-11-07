# Mock Data Generator

This script generates comprehensive mock data for your WorkTide platform, including users, tasks, ratings, applications, and more.

## Features

- **Admin Account**: Creates/updates admin account (admin@worktide.com / admin123)
- **100 Users**: Mix of freelancers (60%) and clients (40%)
- **Fake Profile Pictures**: Generated using DiceBear API (consistent avatars)
- **Tasks**: Multiple tasks per client with realistic descriptions
- **Task Thumbnails**: Uses thumbnails from `mockup_data` folder (thumbnail1.png, thumbnail2.png, thumbnail3.png)
- **Ratings & Reviews**: Ratings between clients and freelancers with comments
- **Task Applications**: Freelancers applying to open tasks
- **Task Requests**: Direct task assignment requests
- **Messages**: Sample conversations between users
- **Notifications**: Notifications for applications and requests

## Prerequisites

1. Make sure you have run the skills seed first:
   ```bash
   npm run seed:skills
   # or
   ts-node prisma/seed-skills.ts
   ```

2. Ensure your database is set up and migrations are applied:
   ```bash
   npx prisma migrate dev
   ```

## Usage

Run the mock data generator:

```bash
npm run seed:mock
```

Or directly:

```bash
ts-node prisma/seed-mock-data.ts
```

## Delete Mock Data

To delete all generated mock data (preserves admin accounts and skills):

```bash
npm run delete:mock
```

Or directly:

```bash
ts-node prisma/delete-mock-data.ts
```

## Generated Data

- **Admin Account**: 
  - Email: `admin@worktide.com`
  - Password: `admin123`
  - User type: `admin`

- **Users**: 100 users total
  - 60 freelancers with complete profiles (skills, education, experience, hourly rates)
  - 40 clients
  - All users have profile pictures
  - Default password for all users: `password123`

- **Tasks**: ~3 tasks per client on average
  - Various statuses (open, in_progress, completed, pending)
  - Realistic budgets ($100 - $10,000)
  - Task thumbnails randomly selected from `backend/mockup_data/` folder (thumbnail1.png, thumbnail2.png, thumbnail3.png)
  - Thumbnails are copied to the `uploads` folder with unique UUID names

- **Ratings**: ~5 ratings per freelancer on average
  - Scores between 3.0 and 5.0
  - Realistic review comments

- **Task Applications**: ~3 applications per open task
  - Various statuses (pending, accepted, rejected)

- **Task Requests**: Direct assignment requests from clients to freelancers

- **Messages**: Sample conversations between users

- **Notifications**: Notifications for applications and requests

## Configuration

You can modify the constants at the top of `seed-mock-data.ts` to adjust the amount of data:

```typescript
const TOTAL_USERS = 100;
const FREELANCER_RATIO = 0.6; // 60% freelancers
const TASKS_PER_CLIENT = 3;
const RATINGS_PER_FREELANCER = 5;
const APPLICATIONS_PER_TASK = 3;
```

## Notes

- Admin account is created/updated with email `admin@worktide.com` and password `admin123`
- All users have the same default password: `password123`
- Profile pictures are generated using DiceBear API (consistent based on name)
- Task thumbnails are copied from `backend/mockup_data/` folder to `backend/uploads/` folder
- The script handles unique constraints and will skip duplicates
- Freelancer ratings are automatically calculated and updated
- The delete script preserves admin accounts and skills

## Troubleshooting

If you encounter errors:

1. Make sure skills are seeded first
2. Check that your database connection is working
3. Ensure all migrations are applied
4. If you want to start fresh, you can reset the database:
   ```bash
   npx prisma migrate reset
   ```

