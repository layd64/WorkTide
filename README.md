# WorkTide

A comprehensive full-stack freelance platform that connects talented freelancers with clients seeking professional services. Built with modern web technologies, WorkTide provides a complete ecosystem for project management, communication, and collaboration.

## 🌟 Features

### User Management
- **Authentication & Authorization**
  - Secure JWT-based authentication
  - Role-based access control (Admin, Freelancer, Client)
  - Login attempt tracking and account protection
  - User registration with email validation
  - Password hashing with bcrypt

- **User Profiles**
  - Comprehensive profile management
  - Skills management with predetermined skill tags
  - Education and work experience tracking
  - Profile visibility controls (hidden/public)
  - Avatar upload and visibility settings
  - Hourly rate configuration
  - Location and language preferences
  - Bio and professional title

### Task Management
- **Task Creation & Management**
  - Create tasks with detailed descriptions
  - Budget setting and skill requirements
  - Task image/thumbnail upload
  - Task status tracking (open, in_progress, completed, pending)
  - Task search and filtering by skills, status, and keywords
  - Task recommendations using collaborative filtering algorithm
  - Task deletion and updates

- **Task Applications**
  - Freelancers can apply to open tasks
  - Cover letter submission
  - Application status tracking (pending, accepted, rejected)
  - Application management for clients
  - Automatic notifications for new applications

- **Task Requests**
  - Direct task assignment from clients to freelancers
  - Request acceptance/rejection workflow
  - Automatic chat creation upon acceptance
  - Request cancellation

### Communication
- **Real-time Chat**
  - WebSocket-based real-time messaging
  - File attachments (images, documents, PDFs)
  - Message history persistence
  - Conversation management
  - System messages for task assignments
  - Emoji picker integration

- **Notifications**
  - Real-time notification system
  - Notification types: applications, requests, messages, system
  - Read/unread status tracking
  - Notification deletion
  - WebSocket-based delivery

### Ratings & Reviews
- **Rating System**
  - 5-star rating system
  - Written reviews and comments
  - Average rating calculation
  - Rating updates and modifications
  - Public review display
  - Rating-based freelancer recommendations

### Admin Panel
- **User Management**
  - View all users
  - Ban/unban users
  - User analytics

- **Task Management**
  - View all tasks
  - Delete tasks
  - Task analytics

- **Rating Management**
  - View all ratings
  - Delete ratings
  - Rating recalculation

- **Analytics Dashboard**
  - User statistics
  - Task status distribution
  - User growth charts (6-month view)
  - User type breakdown

- **Action Logs**
  - Comprehensive audit trail
  - User action tracking
  - Admin activity monitoring

### Accessibility & Internationalization
- **Multi-language Support**
  - English and Ukrainian translations
  - i18next integration
  - Language switching

- **Accessibility Features**
  - Font size adjustment
  - High contrast mode
  - Reduced motion support
  - Link highlighting
  - Big cursor mode
  - Reading guide
  - Color saturation controls
  - Color inversion

### UI/UX Features
- **Theme Support**
  - Dark mode / Light mode
  - Theme persistence
  - Smooth theme transitions

- **Responsive Design**
  - Mobile-friendly interface
  - Responsive layouts
  - Touch-optimized controls

- **File Management**
  - Secure file uploads
  - File type validation
  - File size limits (5MB images, 10MB documents)
  - UTF-8 filename encoding support
  - File download with original names

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL
- **ORM**: Prisma 6.6
- **Authentication**: Passport.js + JWT
- **WebSockets**: Socket.io
- **File Upload**: Multer
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.7
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4
- **Routing**: React Router 7
- **State Management**: React Context API
- **Internationalization**: i18next
- **UI Components**: Headless UI, Heroicons
- **Charts**: Recharts
- **Notifications**: Sonner
- **Animations**: Framer Motion
- **Testing**: Vitest, Playwright, Testing Library

## 📁 Project Structure

```
WorkTide/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── admin/          # Admin panel controllers and services
│   │   ├── auth/           # Authentication module
│   │   ├── chat/           # Real-time chat (WebSocket)
│   │   ├── notifications/  # Notification system
│   │   ├── profile/        # User profile management
│   │   ├── ratings/        # Rating and review system
│   │   ├── skills/         # Skills management
│   │   ├── tasks/          # Task management
│   │   ├── task-applications/  # Task application system
│   │   ├── task-requests/  # Direct task requests
│   │   ├── upload/         # File upload handling
│   │   ├── users/          # User management
│   │   ├── logging/        # Action logging service
│   │   └── utils/          # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── migrations/     # Database migrations
│   │   ├── seed.ts         # Main seed file
│   │   ├── seed-admin.ts   # Admin user seeding
│   │   ├── seed-skills.ts  # Skills seeding
│   │   └── seed-mock-data.ts  # Mock data generation
│   ├── uploads/            # Uploaded files storage
│   └── test/              # E2E tests
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── layout/     # Layout components
│   │   │   └── common/     # Shared components
│   │   ├── contexts/       # React Context providers
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin panel pages
│   │   ├── config/         # Configuration files
│   │   ├── constants/      # Constants and enums
│   │   ├── i18n/           # Internationalization
│   │   ├── utils/          # Utility functions
│   │   └── test/           # Test utilities
│   └── e2e/                # End-to-end tests
│
└── README.md               # This file
```

## 📋 Prerequisites

- **Node.js**: v18 or higher (LTS recommended)
- **npm**: v9 or higher (comes with Node.js)
- **PostgreSQL**: v12 or higher
- **Git**: For version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd WorkTide
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # If exists, or create manually
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/worktide"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
API_URL="http://localhost:3000"
```

```bash
# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed the database (optional)
npm run seed:skills      # Seed skills
npm run seed:admin       # Create admin user
npm run seed:mock        # Generate mock data (optional)

# Start development server
npm run start:dev
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📜 Available Commands

### Backend Commands

```bash
# Development
npm run start:dev        # Start development server with hot reload
npm run start:debug      # Start with debugging enabled
npm run start            # Start production server
npm run start:prod       # Build and start production server

# Building
npm run build            # Build for production

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage
npm run test:e2e        # Run end-to-end tests
npm run test:debug      # Run tests with debugging

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Database
npx prisma migrate dev  # Create and apply migrations
npx prisma generate     # Generate Prisma Client
npx prisma studio       # Open Prisma Studio (database GUI)
npx prisma migrate reset # Reset database (WARNING: deletes all data)

# Seeding
npm run seed:skills     # Seed skills into database
npm run seed:admin      # Create admin user
npm run seed:mock       # Generate mock data for testing
npm run delete:mock     # Delete all mock data
```

### Frontend Commands

```bash
# Development
npm run dev             # Start development server
npm run preview         # Preview production build

# Building
npm run build           # Build for production

# Testing
npm run test            # Run unit tests with Vitest
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with UI

# Code Quality
npm run lint            # Run ESLint
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/worktide"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Server
PORT=3000
API_URL="http://localhost:3000"

# CORS (optional)
CORS_ORIGIN="http://localhost:5173"
```

### Frontend

The frontend uses a configuration file (`src/config/api.ts`) for API endpoints. Update `API_BASE_URL` if your backend runs on a different port or domain.

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Freelancers, clients, and admins
- **Task**: Projects posted by clients
- **TaskApplication**: Applications from freelancers
- **TaskRequest**: Direct task assignment requests
- **Rating**: Reviews and ratings
- **Message**: Chat messages
- **Notification**: User notifications
- **Skill**: Predetermined skills
- **ActionLog**: Admin audit trail

Run `npx prisma studio` to explore the database schema visually.

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

See `TESTING.md` and `TEST_SUMMARY.md` for detailed test documentation.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/:id/recommendations` - Get recommended freelancers
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Task Applications
- `POST /api/task-applications/:taskId/apply` - Apply to task
- `GET /api/task-applications/task/:taskId` - Get applications for task
- `GET /api/task-applications/freelancer` - Get freelancer's applications
- `PATCH /api/task-applications/:id/status` - Update application status
- `POST /api/task-applications/:id/assign` - Assign freelancer to task

### Task Requests
- `POST /api/task-requests` - Create task request
- `GET /api/task-requests/freelancer/:id` - Get freelancer's requests
- `POST /api/task-requests/:id/accept` - Accept request
- `POST /api/task-requests/:id/reject` - Reject request
- `POST /api/task-requests/:id/cancel` - Cancel request

### Profile
- `GET /api/profile` - Get current user profile
- `GET /api/profile/:id` - Get public profile
- `GET /api/profile/freelancers` - Search freelancers
- `PATCH /api/profile/update` - Update profile
- `POST /api/profile/upload-avatar` - Upload avatar

### Ratings
- `POST /api/ratings` - Create/update rating
- `GET /api/ratings/freelancer/:id` - Get freelancer ratings
- `GET /api/ratings/check/:id` - Check if rating exists

### Chat
- `GET /api/chat/conversations/:userId` - Get conversations
- `GET /api/chat/history/:userId1/:userId2` - Get message history
- WebSocket: `sendMessage` event - Send message

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/download/:filename` - Download file

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/users/:id/unban` - Unban user
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/logs` - Get action logs
- `GET /api/admin/tasks` - Get all tasks
- `DELETE /api/admin/tasks/:id` - Delete task
- `GET /api/admin/ratings` - Get all ratings
- `DELETE /api/admin/ratings/:id` - Delete rating

## 🎨 Default Admin Account

After running `npm run seed:admin`, you can log in with:

- **Email**: `admin@worktide.com`
- **Password**: `admin123`

**⚠️ Important**: Change the admin password immediately in production!

## 🚢 Deployment

### Backend Deployment

1. Set environment variables in your hosting platform
2. Build the application: `npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Start the server: `npm run start:prod`

### Frontend Deployment

1. Update `API_BASE_URL` in `src/config/api.ts` to your backend URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

### Database

Ensure your PostgreSQL database is accessible from your backend server. Use connection pooling for production.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Login attempt tracking and rate limiting
- Role-based access control
- File upload validation (type and size)
- SQL injection protection (Prisma ORM)
- XSS protection
- CORS configuration
- Input validation and sanitization

## 🌍 Internationalization

The application supports multiple languages:
- English (en)
- Ukrainian (uk)

To add a new language, create a translation file in `frontend/src/i18n/locales/` and update the language configuration.

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For contributions, please contact the project maintainers.

## 📞 Support

For issues, questions, or support, please open an issue in the repository or contact the development team.

## 🎯 Roadmap

Potential future features:
- Payment integration
- Advanced search and filtering
- Project milestones
- Time tracking
- Invoicing system
- Mobile applications
- Advanced analytics
- Email notifications
- Two-factor authentication

---

**Built with ❤️ using NestJS and React**
