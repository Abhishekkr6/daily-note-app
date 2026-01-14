# 📝 Daily Note App - Comprehensive Interview Questions

> **Purpose**: This document contains detailed interview questions to help you demonstrate complete knowledge of every aspect of the Daily Note App project.

---

## 🏗️ Architecture & Tech Stack

### **Q1: What is the overall architecture of your Daily Note App?**
**Answer**: 
The app is built using **Next.js 14** with the **App Router** architecture. It's a full-stack application with:
- **Frontend**: React 18 with TypeScript, using Server Components and Client Components
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v4 with OAuth providers (Google & GitHub)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui built on Radix UI primitives
- **State Management**: React hooks (useState, useEffect) with local state
- **Deployment**: Optimized for Vercel with environment variables

### **Q2: Why did you choose Next.js 14 over other frameworks?**
**Answer**:
- **Server-Side Rendering (SSR)**: Better SEO and initial page load performance
- **API Routes**: Built-in backend without needing a separate server
- **File-based Routing**: Automatic routing based on folder structure
- **Image Optimization**: Built-in `next/image` component
- **TypeScript Support**: First-class TypeScript integration
- **App Router**: Modern React Server Components for better performance
- **Vercel Deployment**: Seamless deployment with automatic CI/CD

### **Q3: Explain your folder structure and why you organized it this way.**
**Answer**:
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # Backend API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── tasks/        # Task CRUD operations
│   │   ├── note/         # Daily notes API
│   │   ├── mood/         # Mood tracking
│   │   ├── pomodoro/     # Focus timer
│   │   ├── leaderboard/  # Gamification
│   │   └── users/        # User management
│   ├── home/             # Main dashboard
│   ├── calendar/         # Calendar view
│   ├── tasks/            # All tasks page
│   ├── stats/            # Analytics
│   ├── settings/         # User settings
│   └── layout.tsx        # Root layout with providers
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui base components
│   ├── today-dashboard.tsx
│   ├── calendar-page.tsx
│   └── ...
├── models/               # Mongoose schemas
│   ├── userModel.ts
│   ├── taskModel.ts
│   ├── noteModel.ts
│   └── ...
├── dbConfig/             # Database connection
├── lib/                  # Utility functions
├── middleware.ts         # Route protection
└── types/                # TypeScript type definitions
```

This structure follows Next.js best practices with clear separation of concerns.

---

## 🔐 Authentication & Security

### **Q4: How did you implement authentication in your app?**
**Answer**:
I used **NextAuth.js v4** with OAuth 2.0 providers:

**Configuration** (`src/app/api/auth/[...nextauth]/route.js`):
```javascript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  callbacks: {
    async signIn({ user, account }) {
      // Create or update user in MongoDB
      await dbConnect();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          email: user.email,
          username: generateUsername(user.name),
          avatarUrl: user.image,
          emailVerified: true,
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // Add user ID to JWT token
      if (token.email) {
        const dbUser = await User.findOne({ email: token.email });
        token.id = dbUser._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to session
      session.user.id = token.id;
      return session;
    },
  },
};
```

### **Q5: How do you protect routes from unauthorized access?**
**Answer**:
I implemented **middleware** (`src/middleware.ts`) that runs on every request:

```typescript
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/landing", "/login", "/signup", "/privacy", "/terms"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!sessionToken;

  // Redirect authenticated users away from login/signup
  if (isAuthenticated && ["/login", "/signup", "/landing"].includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Redirect unauthenticated users to landing
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/landing", request.url));
  }

  return NextResponse.next();
}
```

**Key Features**:
- JWT-based session validation
- Automatic redirects based on auth state
- Public route whitelist
- Runs before page renders (edge middleware)

### **Q6: How do you handle user sessions in API routes?**
**Answer**:
I use `getServerSession` from NextAuth to validate requests:

```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  // Use userId for database queries
}
```

---

## 🗄️ Database & Models

### **Q7: Explain your database schema and why you designed it this way.**
**Answer**:
I use **MongoDB** with **Mongoose** for schema validation. Here are the main models:

#### **1. User Model** (`userModel.ts`)
```typescript
{
  email: String,              // Unique, indexed
  username: String,           // Unique, indexed
  name: String,
  avatarUrl: String,
  role: "user" | "admin",
  
  // Security
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  loginAttempts: Number,
  lockedUntil: Date,
  
  // Preferences
  preferences: {
    theme: String,
    timezone: String,
    leaderboardSeen: Boolean,
    workingHours: { start: String, end: String }
  },
  
  // Gamification
  currentStreak: Number,
  longestStreak: Number,
  lastStreakDate: String,
  totalFocusSessions: Number,
  minutesFocused: Number,
  
  // Soft delete
  deletedAt: Date,
  
  timestamps: true
}
```

#### **2. Task Model** (`taskModel.ts`)
```typescript
{
  title: String,              // Required
  description: String,
  dueDate: String,            // YYYY-MM-DD format
  tag: String,                // Category
  priority: "High" | "Medium" | "Low",
  status: "overdue" | "today" | "completed",
  completedDate: String,
  userId: ObjectId,           // Reference to User
  notificationTime: String,
  
  // Focus tracking
  focusSessions: [{
    startedAt: Date,
    duration: Number,         // Minutes
    completed: Boolean,
    completedAt: Date
  }],
  
  timestamps: true
}
```

#### **3. Note Model** (`noteModel.ts`)
```typescript
{
  content: String,            // Markdown content
  date: String,               // YYYY-MM-DD
  userId: ObjectId,
  timestamps: true
}
```

#### **4. Pomodoro Model** (`pomodoroModel.ts`)
```typescript
{
  userId: ObjectId,
  date: String,               // YYYY-MM-DD
  cycles: Number,             // Number of completed cycles
  duration: Number,           // Minutes per cycle (default 25)
  timestamps: true
}
```

#### **5. Mood Model** (`moodModel.ts`)
```typescript
{
  userId: ObjectId,
  date: String,               // YYYY-MM-DD
  mood: Number,               // -2 to +2 scale
  note: String,               // Optional mood note
  timestamps: true
}
```

#### **6. Leaderboard Model** (`leaderboardModel.ts`)
```typescript
{
  userId: ObjectId,
  period: String,             // "weekly", "monthly", "all-time"
  score: Number,
  streak: Number,
  lastUpdated: Date,
  
  // Snapshot for privacy
  optOutSnapshot: Boolean,
  displayNameSnapshot: String,
  avatarSnapshot: String,
  
  timestamps: true
}
```

**Design Decisions**:
- **User-centric**: All data tied to `userId` for multi-tenancy
- **Date strings**: Using YYYY-MM-DD for easy querying and timezone handling
- **Embedded arrays**: `focusSessions` embedded in tasks for atomic updates
- **Indexes**: Email and username indexed for fast lookups
- **Timestamps**: Automatic `createdAt` and `updatedAt` fields

### **Q8: How do you handle database connections in serverless environment?**
**Answer**:
I use a **connection pooling** pattern to reuse connections:

```javascript
// dbConfig/dbConfig.js
let isConnected = false;

export async function connect() {
  if (isConnected) {
    return; // Reuse existing connection
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
```

**Why this matters**:
- Serverless functions are stateless and spin up/down frequently
- Reusing connections prevents "too many connections" errors
- Mongoose handles connection pooling internally

---

## 🎯 Core Features Implementation

### **Q9: Walk me through how the task creation flow works from frontend to database.**
**Answer**:

**Step 1: Frontend - Quick Add Input** (`today-dashboard.tsx`)
```typescript
const handleQuickAdd = async () => {
  if (!quickAddInput.trim()) return;
  
  // Parse natural language input
  const parsed = parseNaturalLanguage(quickAddInput);
  // Example: "Call client tomorrow 3pm #work !high"
  // Parsed: { title, dueDate, tag, priority, time }
  
  const newTask = {
    title: parsed.title,
    description: "",
    dueDate: parsed.dueDate || new Date().toISOString().split('T')[0],
    tag: parsed.tag || "",
    priority: parsed.priority || "Medium",
    status: "today",
    notificationTime: parsed.time || "",
  };
  
  // API call
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });
  
  if (response.ok) {
    const createdTask = await response.json();
    setTasks([...tasks, createdTask]);
    setQuickAddInput("");
    toast.success("Task created!");
  }
};
```

**Step 2: API Route** (`app/api/tasks/route.js`)
```javascript
export async function POST(request) {
  // 1. Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 2. Parse request body
  const body = await request.json();
  const { title, description, dueDate, tag, priority, status } = body;
  
  // 3. Validate input
  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }
  
  // 4. Connect to database
  await connect();
  
  // 5. Create task
  const task = await Task.create({
    title,
    description,
    dueDate,
    tag,
    priority,
    status: status || "today",
    userId: session.user.id,
  });
  
  // 6. Return created task
  return NextResponse.json(task, { status: 201 });
}
```

**Step 3: Database**
- Mongoose validates against schema
- MongoDB inserts document with auto-generated `_id`
- Timestamps (`createdAt`, `updatedAt`) added automatically

**Step 4: Response**
- Task object returned to frontend
- UI updates optimistically
- Toast notification shows success

### **Q10: How does the Pomodoro timer work and integrate with tasks?**
**Answer**:

**Timer Logic** (`today-dashboard.tsx`):
```typescript
const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
const [isRunning, setIsRunning] = useState(false);
const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

// Timer countdown
useEffect(() => {
  let interval: NodeJS.Timeout;
  
  if (isRunning && pomodoroTime > 0) {
    interval = setInterval(() => {
      setPomodoroTime(prev => prev - 1);
    }, 1000);
  } else if (pomodoroTime === 0) {
    // Timer completed
    handlePomodoroComplete();
  }
  
  return () => clearInterval(interval);
}, [isRunning, pomodoroTime]);

const handlePomodoroComplete = async () => {
  setIsRunning(false);
  
  // 1. Save pomodoro session
  await savePomodoro(1, pomodoroDuration);
  
  // 2. If linked to a task, add focus session
  if (selectedTaskId) {
    await fetch(`/api/tasks/${selectedTaskId}/focus-session`, {
      method: "POST",
      body: JSON.stringify({
        duration: pomodoroDuration,
        completed: true,
      }),
    });
  }
  
  // 3. Show completion notification
  toast.success("🎉 Pomodoro completed!");
  
  // 4. Reset timer
  setPomodoroTime(pomodoroDuration * 60);
};
```

**Backend Integration**:
```javascript
// Save pomodoro to database
const savePomodoro = async (cycles, duration) => {
  const today = new Date().toISOString().split('T')[0];
  
  await fetch("/api/pomodoro", {
    method: "POST",
    body: JSON.stringify({ date: today, cycles, duration }),
  });
};
```

**Features**:
- Customizable duration (15, 25, 45 minutes)
- Task linking for focus tracking
- Persistent across page refreshes
- Audio notification on completion
- Statistics tracking (total sessions, minutes focused)

### **Q11: Explain the calendar heatmap feature and how it visualizes productivity.**
**Answer**:

**Data Structure**:
```typescript
interface ActivityData {
  date: string;        // YYYY-MM-DD
  count: number;       // Number of completed tasks
  level: 0 | 1 | 2 | 3 | 4;  // Intensity level
}
```

**Calculation Logic** (`calendar-heatmap.tsx`):
```typescript
const calculateHeatmapData = (tasks: Task[]) => {
  const dataMap = new Map<string, number>();
  
  // Count completed tasks per day
  tasks
    .filter(t => t.status === "completed" && t.completedDate)
    .forEach(task => {
      const date = task.completedDate;
      dataMap.set(date, (dataMap.get(date) || 0) + 1);
    });
  
  // Convert to array with intensity levels
  return Array.from(dataMap.entries()).map(([date, count]) => ({
    date,
    count,
    level: getIntensityLevel(count),
  }));
};

const getIntensityLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
};
```

**Rendering**:
```typescript
<div className="grid grid-cols-7 gap-1">
  {heatmapData.map(({ date, level }) => (
    <div
      key={date}
      className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
      title={`${date}: ${count} tasks`}
    />
  ))}
</div>
```

**Color Scheme**:
- Level 0: `bg-gray-100` (no activity)
- Level 1: `bg-green-200` (1-2 tasks)
- Level 2: `bg-green-400` (3-4 tasks)
- Level 3: `bg-green-600` (5-6 tasks)
- Level 4: `bg-green-800` (7+ tasks)

---

## 🎨 Frontend & UI

### **Q12: How did you implement the theme switching (light/dark mode)?**
**Answer**:

**Setup** (`theme-provider.tsx`):
```typescript
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

**Usage in Components**:
```typescript
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
};
```

**CSS Variables** (`globals.css`):
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 25 95% 53%;
    /* ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 25 95% 53%;
    /* ... */
  }
}
```

**Features**:
- System preference detection
- Persistent across sessions (localStorage)
- No flash on page load (`suppressHydrationWarning`)
- Smooth transitions

### **Q13: How do you handle mobile responsiveness?**
**Answer**:

**Tailwind Responsive Classes**:
```typescript
<div className="
  grid 
  grid-cols-1        // Mobile: 1 column
  md:grid-cols-2     // Tablet: 2 columns
  lg:grid-cols-3     // Desktop: 3 columns
  gap-4
">
  {/* Cards */}
</div>
```

**Mobile Navigation**:
```typescript
// Show sidebar on desktop, mobile nav on mobile
<div className="hidden lg:block">
  <Sidebar />
</div>

<div className="lg:hidden">
  <MobileNav />
</div>
```

---

## 🚀 Performance & Optimization

### **Q14: What performance optimizations did you implement?**
**Answer**:

**1. Image Optimization**:
```typescript
import Image from "next/image";

<Image
  src={user.avatarUrl}
  alt="Avatar"
  width={40}
  height={40}
  priority={false}
  loading="lazy"
/>
```

**2. Database Indexing**:
```javascript
// In models
UserSchema.index({ email: 1 }, { unique: true });
TaskSchema.index({ userId: 1, status: 1 });
LeaderboardSchema.index({ period: 1, score: -1 });
```

**3. API Response Optimization**:
```javascript
// Only select needed fields
const tasks = await Task.find({ userId })
  .select("title status dueDate priority")
  .lean(); // Convert to plain objects (faster)
```

---

## 🔧 DevOps & Deployment

### **Q15: How did you deploy this application?**
**Answer**:

**Platform**: Vercel (optimized for Next.js)

**Deployment Steps**:
1. Connect GitHub repository to Vercel
2. Configure environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://dailynote.vercel.app
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```
3. Automatic deployments on `git push`
4. Preview deployments for pull requests

**Benefits**:
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Edge middleware

---

This comprehensive set of 15 key questions covers the most important aspects of your Daily Note App. Practice explaining each feature with confidence! 🚀
