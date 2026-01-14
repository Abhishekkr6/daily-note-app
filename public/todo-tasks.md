# ✅ Daily Note App - Comprehensive TODO Tasks for Interview Preparation

> **Purpose**: This document contains detailed TODO tasks organized by feature area to help you understand and explain every part of the codebase.

---

## 📋 Table of Contents
1. [Project Setup & Configuration](#1-project-setup--configuration)
2. [Authentication System](#2-authentication-system)
3. [Database Models & Schema](#3-database-models--schema)
4. [API Routes & Backend](#4-api-routes--backend)
5. [Frontend Components](#5-frontend-components)
6. [Core Features](#6-core-features)
7. [Advanced Features](#7-advanced-features)
8. [UI/UX & Styling](#8-uiux--styling)
9. [Performance & Optimization](#9-performance--optimization)
10. [Testing & Debugging](#10-testing--debugging)
11. [Deployment & DevOps](#11-deployment--devops)
12. [Documentation & Code Quality](#12-documentation--code-quality)

---

## 1. Project Setup & Configuration

### **Understanding the Tech Stack**
- [ ] **Review `package.json`** - Understand all dependencies and their purposes
  - Next.js 14 (framework)
  - React 18 (UI library)
  - TypeScript (type safety)
  - Tailwind CSS v4 (styling)
  - Mongoose (MongoDB ODM)
  - NextAuth.js (authentication)
  - shadcn/ui (component library)
  - Recharts (data visualization)
  - Framer Motion (animations)

- [ ] **Study `next.config.mjs`** - Understand build configuration
  - Image domains for OAuth providers
  - Environment variable setup
  - Build optimizations

- [ ] **Review `tsconfig.json`** - TypeScript configuration
  - Compiler options
  - Path aliases (`@/components`, `@/lib`)
  - Strict mode settings

- [ ] **Understand `tailwind.config.js`** - Custom design system
  - Color palette
  - Typography
  - Spacing scale
  - Custom animations

### **Environment Variables**
- [ ] **List all required environment variables**
  ```
  MONGO_URI=
  NEXTAUTH_SECRET=
  NEXTAUTH_URL=
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  GITHUB_CLIENT_ID=
  GITHUB_CLIENT_SECRET=
  ```

- [ ] **Understand OAuth setup process**
  - How to create Google OAuth app
  - How to create GitHub OAuth app
  - Callback URL configuration

---

## 2. Authentication System

### **NextAuth.js Configuration**
- [ ] **Study `src/app/api/auth/[...nextauth]/route.js`**
  - Understand OAuth provider configuration
  - Study `signIn` callback (user creation logic)
  - Study `jwt` callback (token enrichment)
  - Study `session` callback (session data)
  - Understand redirect logic

- [ ] **Explain the authentication flow**
  1. User clicks "Login with Google/GitHub"
  2. Redirected to OAuth provider
  3. User grants permission
  4. Callback to `/api/auth/callback/[provider]`
  5. `signIn` callback creates/updates user in DB
  6. `jwt` callback adds user ID to token
  7. `session` callback adds user ID to session
  8. User redirected to `/home`

### **Middleware & Route Protection**
- [ ] **Study `src/middleware.ts`**
  - Understand `getToken` from NextAuth
  - Public routes vs protected routes
  - Redirect logic for authenticated/unauthenticated users
  - Edge middleware execution

- [ ] **Test route protection scenarios**
  - Unauthenticated user tries to access `/home` → redirected to `/landing`
  - Authenticated user tries to access `/login` → redirected to `/home`
  - Public routes accessible to all

### **Session Management**
- [ ] **Understand JWT session strategy**
  - Why JWT over database sessions?
  - Token expiration (30 days)
  - Token refresh mechanism

- [ ] **Study session usage in API routes**
  ```javascript
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```

---

## 3. Database Models & Schema

### **User Model** (`src/models/userModel.ts`)
- [ ] **Understand all user fields**
  - Identity: `email`, `username`, `name`, `avatarUrl`
  - Security: `twoFactorEnabled`, `twoFactorSecret`, `loginAttempts`, `lockedUntil`
  - Preferences: `theme`, `timezone`, `workingHours`, `leaderboardSeen`
  - Gamification: `currentStreak`, `longestStreak`, `totalFocusSessions`, `minutesFocused`
  - Soft delete: `deletedAt`

- [ ] **Explain unique constraints**
  - Partial unique index on `email` (only for non-null values)
  - Why this prevents duplicate key errors

- [ ] **Understand user creation in OAuth flow**
  - Username generation logic
  - Avatar URL from OAuth provider
  - Default preferences

### **Task Model** (`src/models/taskModel.ts`)
- [ ] **Understand task schema**
  - Required fields: `title`, `userId`
  - Optional fields: `description`, `dueDate`, `tag`, `priority`, `notificationTime`
  - Status enum: `"overdue" | "today" | "completed"`
  - Priority enum: `"High" | "Medium" | "Low"`

- [ ] **Understand focus sessions array**
  ```typescript
  focusSessions: [{
    startedAt: Date,
    duration: Number,
    completed: Boolean,
    completedAt: Date
  }]
  ```

- [ ] **Explain task lifecycle**
  1. Created with status "today"
  2. Automatically marked "overdue" if past due date
  3. Marked "completed" when user completes
  4. `completedDate` set on completion

### **Note Model** (`src/models/noteModel.ts`)
- [ ] **Understand note structure**
  - `content`: Markdown text
  - `date`: YYYY-MM-DD format
  - `userId`: Reference to user
  - One note per user per day

### **Pomodoro Model** (`src/models/pomodoroModel.ts`)
- [ ] **Understand pomodoro tracking**
  - `cycles`: Number of completed pomodoros
  - `duration`: Minutes per cycle (default 25)
  - `date`: YYYY-MM-DD format
  - Aggregated per day

### **Mood Model** (`src/models/moodModel.ts`)
- [ ] **Understand mood tracking**
  - `mood`: Number from -2 to +2
    - -2: Very bad
    - -1: Bad
    - 0: Neutral
    - +1: Good
    - +2: Very good
  - `note`: Optional text note
  - One mood entry per day

### **Leaderboard Model** (`src/models/leaderboardModel.ts`)
- [ ] **Understand leaderboard system**
  - `period`: "weekly", "monthly", "all-time"
  - `score`: Calculated points
  - `streak`: Current streak
  - Snapshot fields for privacy (`displayNameSnapshot`, `avatarSnapshot`)

### **Database Connection** (`src/dbConfig/dbConfig.js`)
- [ ] **Understand connection pooling**
  - `isConnected` flag to prevent multiple connections
  - Mongoose connection reuse
  - Error handling

---

## 4. API Routes & Backend

### **Tasks API** (`src/app/api/tasks/route.js`)
- [ ] **Study CRUD operations**
  - `GET`: Fetch all tasks for user
  - `POST`: Create new task
  - `PATCH`: Update task (complete, edit)
  - `DELETE`: Delete task

- [ ] **Understand query filtering**
  ```javascript
  const { status, tag, priority } = searchParams;
  const query = { userId };
  if (status) query.status = status;
  if (tag) query.tag = tag;
  if (priority) query.priority = priority;
  ```

- [ ] **Explain task status update logic**
  - Overdue detection on fetch
  - Completion date setting
  - Status transitions

### **Note API** (`src/app/api/note/route.js`)
- [ ] **Study note operations**
  - `GET`: Fetch note for specific date
  - `POST`: Create/update note (upsert)
  - Auto-save mechanism

### **Mood API** (`src/app/api/mood/route.js`)
- [ ] **Study mood operations**
  - `GET`: Fetch mood for date
  - `POST`: Save mood entry
  - Validation (mood between -2 and +2)

### **Pomodoro API** (`src/app/api/pomodoro/route.js`)
- [ ] **Study pomodoro operations**
  - `GET`: Fetch pomodoro data for date
  - `POST`: Save/update pomodoro cycles

### **Leaderboard API** (`src/app/api/leaderboard/route.js`)
- [ ] **Study leaderboard logic**
  - Score calculation
  - Period filtering (weekly, monthly, all-time)
  - Top 100 users
  - Privacy opt-out handling

### **User Profile API** (`src/app/api/users/profile/route.js`)
- [ ] **Study profile operations**
  - `GET`: Fetch user profile
  - `PATCH`: Update profile (name, timezone, preferences)

### **Avatar Upload API** (`src/app/api/users/avatar/route.js`)
- [ ] **Study avatar upload**
  - Cloudinary integration
  - Image validation
  - URL update in database

---

## 5. Frontend Components

### **Layout Components**
- [ ] **Study `src/app/layout.tsx`** (Root Layout)
  - Font configuration (Inter, Montserrat)
  - Metadata (title, description, favicon)
  - HTML structure

- [ ] **Study `src/app/client-layout.tsx`**
  - Theme provider wrapper
  - Sidebar + TopBar layout
  - Mobile navigation
  - Toast notifications (Sonner)

- [ ] **Study `src/components/sidebar.tsx`**
  - Navigation links
  - Active route highlighting
  - User profile section
  - Logout functionality

- [ ] **Study `src/components/top-bar.tsx`**
  - Search functionality
  - Theme toggle
  - User dropdown menu
  - Notifications

### **Page Components**
- [ ] **Study `src/components/today-dashboard.tsx`** (Main Dashboard)
  - Quick add input with natural language parsing
  - Task sections (Overdue, Today, Completed)
  - Daily note editor
  - Pomodoro timer
  - Mood tracker
  - Activity heatmap

- [ ] **Study `src/components/tasks-page.tsx`** (All Tasks)
  - Task filtering (status, priority, tag)
  - Search functionality
  - Bulk operations
  - Task dialog (create/edit)

- [ ] **Study `src/components/calendar-page.tsx`**
  - Monthly calendar view
  - Date navigation
  - Completion heatmap
  - Task list for selected date

- [ ] **Study `src/components/stats-page.tsx`**
  - Key metrics (streak, completion rate, focus hours)
  - Charts (weekly progress, priority distribution)
  - Achievement badges

- [ ] **Study `src/components/settings-page.tsx`**
  - Profile settings
  - Theme preferences
  - Notification settings
  - Data export/import

### **Shared Components**
- [ ] **Study `src/components/task-dialog.tsx`**
  - Form validation with React Hook Form + Zod
  - Date picker
  - Priority selector
  - Tag input

- [ ] **Study `src/components/calendar-heatmap.tsx`**
  - Activity data calculation
  - Intensity level mapping
  - Color scheme
  - Tooltip on hover

---

## 6. Core Features

### **Task Management**
- [ ] **Understand quick add feature**
  - Natural language parsing
  - Pattern matching for dates, tags, priorities
  - Example: "Call client tomorrow 3pm #work !high"

- [ ] **Understand task filtering**
  - Status filter (all, today, overdue, completed)
  - Priority filter (high, medium, low)
  - Tag filter
  - Search by title/description

- [ ] **Understand task completion**
  - Status update to "completed"
  - Set `completedDate`
  - Move to completed section
  - Undo functionality

- [ ] **Understand task editing**
  - Inline editing vs dialog
  - Optimistic updates
  - Error rollback

### **Daily Notes**
- [ ] **Understand note editor**
  - Markdown support
  - Auto-save (debounced)
  - Date-specific notes
  - Rich text formatting

### **Mood Tracking**
- [ ] **Understand mood scale**
  - -2 to +2 range
  - Emoji representation
  - Optional text note
  - Historical mood data

### **Pomodoro Timer**
- [ ] **Understand timer logic**
  - Countdown from duration (25 min default)
  - Start/pause/reset functionality
  - Task linking
  - Completion notification

- [ ] **Understand focus session tracking**
  - Save to task's `focusSessions` array
  - Track duration and completion
  - Aggregate statistics

---

## 7. Advanced Features

### **Natural Language Processing**
- [ ] **Study parsing algorithm**
  ```typescript
  const parseNaturalLanguage = (input: string) => {
    // Extract priority: !high, !medium, !low
    // Extract tag: #work, #personal
    // Extract date: tomorrow, today, next week
    // Extract time: 3pm, 14:00
    // Remaining text = title
  }
  ```

- [ ] **Test various inputs**
  - "Buy groceries tomorrow"
  - "Meeting at 3pm #work !high"
  - "Call mom next week"

### **Calendar Heatmap**
- [ ] **Understand data aggregation**
  - Count completed tasks per day
  - Calculate intensity level (0-4)
  - Map to color gradient

- [ ] **Understand visualization**
  - Grid layout (7 columns for week)
  - Color coding
  - Tooltip with task count

### **Leaderboard & Gamification**
- [ ] **Understand scoring system**
  ```javascript
  const POINTS = {
    TASK_COMPLETED: 10,
    HIGH_PRIORITY_TASK: 15,
    STREAK_DAY: 5,
    POMODORO_SESSION: 8,
  };
  ```

- [ ] **Understand streak calculation**
  - Check if user completed tasks today
  - Increment streak if yes
  - Reset if missed a day
  - Track longest streak

### **Activity Tracking**
- [ ] **Understand activity data**
  - Tasks completed per day
  - Focus sessions per day
  - Mood entries
  - Notes written

---

## 8. UI/UX & Styling

### **Theme System**
- [ ] **Understand next-themes integration**
  - System preference detection
  - localStorage persistence
  - Class-based theme switching

- [ ] **Study CSS variables** (`src/app/globals.css`)
  - Light mode colors
  - Dark mode colors
  - Semantic color names

### **Responsive Design**
- [ ] **Study breakpoints**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

- [ ] **Study mobile navigation**
  - Bottom tab bar
  - Hamburger menu
  - Touch gestures

### **Animations**
- [ ] **Study Framer Motion usage**
  - Page transitions
  - Task card animations
  - Modal animations

- [ ] **Study CSS animations**
  - Hover effects
  - Loading spinners
  - Toast notifications

---

## 9. Performance & Optimization

### **Frontend Optimization**
- [ ] **Understand Next.js Image optimization**
  - Automatic image resizing
  - Lazy loading
  - WebP format

- [ ] **Understand code splitting**
  - Dynamic imports for heavy components
  - Route-based splitting (automatic)

- [ ] **Understand memoization**
  - `useMemo` for expensive calculations
  - `useCallback` for stable function references

### **Backend Optimization**
- [ ] **Understand database indexing**
  - Index on `userId` for all models
  - Compound index on `userId + status` for tasks
  - Index on `period + score` for leaderboard

- [ ] **Understand query optimization**
  - Use `.select()` to fetch only needed fields
  - Use `.lean()` for read-only queries
  - Avoid N+1 queries

### **Caching Strategy**
- [ ] **Understand client-side caching**
  - React state for current session
  - localStorage for preferences

- [ ] **Understand server-side caching** (future)
  - Redis for session storage
  - CDN for static assets

---

## 10. Testing & Debugging

### **Manual Testing Checklist**
- [ ] **Test authentication flow**
  - Login with Google
  - Login with GitHub
  - Logout
  - Session persistence

- [ ] **Test task operations**
  - Create task
  - Edit task
  - Complete task
  - Delete task
  - Undo delete

- [ ] **Test filters and search**
  - Filter by status
  - Filter by priority
  - Filter by tag
  - Search by title

- [ ] **Test calendar**
  - Navigate months
  - Click on date
  - View tasks for date
  - Heatmap accuracy

- [ ] **Test pomodoro timer**
  - Start timer
  - Pause timer
  - Reset timer
  - Link to task
  - Completion notification

### **Debugging Tools**
- [ ] **Use browser DevTools**
  - Console for errors
  - Network tab for API calls
  - React DevTools for component state

- [ ] **Use Vercel logs**
  - Function logs
  - Error tracking
  - Performance metrics

---

## 11. Deployment & DevOps

### **Vercel Deployment**
- [ ] **Understand deployment process**
  1. Push to GitHub
  2. Vercel auto-builds
  3. Preview deployment created
  4. Merge to main → production deployment

- [ ] **Configure environment variables**
  - Add all required env vars in Vercel dashboard
  - Separate preview and production values

- [ ] **Monitor deployment**
  - Check build logs
  - Verify environment variables
  - Test OAuth callbacks

### **Database Setup**
- [ ] **MongoDB Atlas configuration**
  - Create cluster
  - Set up database user
  - Whitelist IP addresses
  - Get connection string

### **OAuth Provider Setup**
- [ ] **Google OAuth**
  1. Create project in Google Cloud Console
  2. Enable Google+ API
  3. Create OAuth 2.0 credentials
  4. Add authorized redirect URIs
  5. Copy client ID and secret

- [ ] **GitHub OAuth**
  1. Go to Settings → Developer settings → OAuth Apps
  2. Create new OAuth app
  3. Add callback URL
  4. Copy client ID and secret

---

## 12. Documentation & Code Quality

### **Code Documentation**
- [ ] **Add JSDoc comments to functions**
  ```typescript
  /**
   * Parses natural language input into task properties
   * @param input - Raw user input
   * @returns Parsed task object
   */
  ```

- [ ] **Document complex algorithms**
  - Natural language parser
  - Streak calculation
  - Heatmap intensity levels

### **README.md**
- [ ] **Ensure README is comprehensive**
  - Project description
  - Features list
  - Installation instructions
  - Environment variables
  - Deployment guide
  - Screenshots

### **Code Quality**
- [ ] **Follow naming conventions**
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

- [ ] **Keep components small**
  - Single responsibility principle
  - Extract reusable logic into hooks
  - Extract UI into smaller components

---

## 🎯 Interview Preparation Checklist

### **Before the Interview**
- [ ] **Review all code files**
  - Understand every component
  - Understand every API route
  - Understand every database model

- [ ] **Practice explaining features**
  - Walk through task creation flow
  - Explain authentication process
  - Describe database schema

- [ ] **Prepare demo**
  - Have app running locally
  - Prepare test data
  - Know how to show each feature

### **During the Interview**
- [ ] **Be ready to show code**
  - Open project in VS Code
  - Navigate quickly to relevant files
  - Explain code line by line

- [ ] **Be ready to discuss decisions**
  - Why Next.js over other frameworks?
  - Why MongoDB over PostgreSQL?
  - Why OAuth over email/password?

- [ ] **Be ready to discuss improvements**
  - What would you add next?
  - How would you scale this?
  - What are the current limitations?

### **Technical Deep Dives**
- [ ] **Explain the full request lifecycle**
  1. User clicks button
  2. Frontend handler called
  3. API request sent
  4. Middleware validates session
  5. API route authenticates user
  6. Database query executed
  7. Response sent back
  8. Frontend updates UI

- [ ] **Explain the authentication flow**
  1. User clicks "Login with Google"
  2. Redirected to Google OAuth
  3. User grants permission
  4. Callback to NextAuth
  5. User created/updated in database
  6. JWT token generated
  7. Session created
  8. User redirected to home

- [ ] **Explain the database design**
  - User-centric design (all data tied to userId)
  - Date strings for timezone handling
  - Embedded arrays for related data
  - Indexes for performance

---

## 🚀 Next Steps for Enhancement

### **Feature Ideas**
- [ ] Recurring tasks
- [ ] Subtasks
- [ ] File attachments
- [ ] Team collaboration
- [ ] Calendar integration (Google Calendar sync)
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] AI task suggestions

### **Technical Improvements**
- [ ] Real-time updates (WebSockets)
- [ ] Comprehensive testing (Jest, Playwright)
- [ ] Better error handling
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Internationalization (i18n)
- [ ] Performance monitoring (Sentry)

---

**Congratulations!** 🎉 By completing all these TODO tasks, you'll have a deep understanding of every aspect of your Daily Note App and be fully prepared for technical interviews!
