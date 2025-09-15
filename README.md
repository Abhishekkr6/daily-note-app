# 📝 DailyNote - Daily Notes & Task Management App

A modern, responsive productivity application built with Next.js that combines daily note-taking with comprehensive task management. DailyNote helps you stay organized with a clean, intuitive interface and powerful features for tracking your daily productivity.

![DailyNote App](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🏠 Today Dashboard
- **Quick Add Input**: Natural language task creation (e.g., "Finish report tomorrow 2pm #work !high")
- **Task Sections**: Organized view of Overdue, Today, and Completed tasks
- **Daily Note Editor**: Rich text/Markdown editor with autosave
- **Pomodoro Timer**: Built-in focus timer with task linking
- **Mood Tracker**: Daily mood logging with emoji scale (-2 to +2)
- **Activity Heatmap**: Visual overview of your productivity patterns

### ✅ Task Management
- **Smart Task Cards**: Priority chips, tags, due dates, and quick actions
- **Advanced Filtering**: Filter by status, priority, tags, and due dates
- **Bulk Operations**: Complete, delete, or move multiple tasks at once
- **Search & Highlight**: Find tasks quickly with highlighted search results
- **Task Templates**: Reusable task templates for common activities
- **Natural Language Processing**: Create tasks with smart date and priority detection

### 📅 Calendar & Date Views
- **Monthly Calendar**: Visual calendar with completion heatmaps
- **Date Navigation**: Click any date to view tasks and notes for that day
- **Completion Tracking**: Color-coded cells showing daily productivity levels
- **Historical Data**: Access all past notes and tasks from any date
- **Activity Visualization**: See your productivity patterns over time

### 📊 Stats & Analytics
- **Key Metrics**: Current streak, completion rate, focus hours, most productive day
- **Interactive Charts**: Weekly progress, priority distribution, monthly trends
- **Focus Analytics**: Track Pomodoro sessions and focus time
- **Tag Performance**: See which categories you're most productive in
- **Achievement System**: Gamified progress tracking with badges and milestones

### ⚙️ Settings & Configuration
- **Theme Management**: Light, dark, and system theme options with live preview
- **Profile Settings**: Avatar, name, email, timezone, and working hours
- **Notification Preferences**: Customizable reminders and alerts
- **Productivity Settings**: Pomodoro timer configuration, default priorities
- **Data Management**: Export/import functionality, backup options
- **Templates Management**: Create and manage reusable templates

### 🎨 Design Features
- **Modern UI**: Clean, minimal design with soft pastel colors
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Micro-interactions and hover states
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Dark Mode**: Seamless theme switching with system preference detection


## �️ User Authentication & Security

### User Model Enhancements
- **Password Hashing:** User passwords are securely hashed using `bcryptjs`.
- **Forgot Password:**  
	- Fields added: `resetPasswordToken`, `resetPasswordExpires` for secure password reset.
- **Email Verification:**  
	- Fields added: `emailVerificationToken`, `emailVerificationExpires` for verifying user email addresses.
- **Account Security:**  
	- Tracks login attempts and account lockout (`loginAttempts`, `lockedUntil`).
- **Soft Delete:**  
	- Users can be soft-deleted with a `deletedAt` timestamp.

### Example User Model Fields
```js
email: String,
passwordHash: String,
username: String,
avatarUrl: String,
emailVerified: Boolean,
resetPasswordToken: String,
resetPasswordExpires: Date,
emailVerificationToken: String,
emailVerificationExpires: Date,
loginAttempts: Number,
lockedUntil: Date,
preferences: { theme: String, timezone: String },
deletedAt: Date,
```

### API Route Example (Signup)
- **Database Connection:** Uses a centralized `connect()` function for MongoDB.
- **User Model Import:**  
	```js
	import User from "../../../../models/userModel.js";
	```
- **Password Hashing:**  
	```js
	import bcryptjs from 'bcryptjs';
	```
- **Signup Logic:**  
	- Checks for existing user by email.
	- Hashes password before saving.
	- Returns error if user exists.

### Example Signup Route Snippet
```js
import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.js";
import bcryptjs from 'bcryptjs';

connect();

export async function POST() {
	// ...parse request, check user, hash password, save user
}
```


### Core Framework
- **Next.js 15** - React framework with App Router
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling with custom design tokens

### UI Components & Libraries
- **shadcn/ui** - Modern, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Responsive chart library for data visualization

### Key Dependencies
- **React Hook Form** - Performant form management
- **Zod** - Schema validation and type safety
- **date-fns** - Modern date utility library
- **next-themes** - Theme switching with system preference
- **Sonner** - Beautiful toast notifications
- **cmdk** - Command palette implementation

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Quick Start
\`\`\`bash
# 1. Clone or download the project
git clone <repository-url>
cd dailynote-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
\`\`\`

### Build for Production
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
dailynote-app/
├── app/                    # Next.js App Router pages
│   ├── calendar/          # Calendar page
│   ├── settings/          # Settings page
│   ├── stats/             # Analytics page
│   ├── tasks/             # All tasks page
│   ├── templates/         # Templates page
│   ├── globals.css        # Global styles and design tokens
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Home page (Today dashboard)
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── calendar-heatmap.tsx
│   ├── calendar-page.tsx
│   ├── settings-page.tsx
│   ├── sidebar.tsx
│   ├── stats-page.tsx
│   ├── task-dialog.tsx
│   ├── tasks-page.tsx
│   ├── templates-page.tsx
│   ├── theme-provider.tsx
│   ├── today-dashboard.tsx
│   └── top-bar.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/              # Static assets
\`\`\`

## 🎯 Usage Guide

### Getting Started
1. **Today Dashboard**: Start your day by reviewing overdue tasks and adding new ones
2. **Quick Add**: Use natural language like "Call client tomorrow 3pm #work !high"
3. **Daily Notes**: Jot down thoughts, meeting notes, or daily reflections
4. **Mood Tracking**: Log your daily mood to track emotional patterns

### Task Management
- **Create Tasks**: Use the quick add input or detailed task dialog
- **Organize**: Add tags, set priorities, and assign due dates
- **Filter & Search**: Find tasks quickly using the advanced filtering system
- **Bulk Actions**: Select multiple tasks for batch operations

### Calendar Navigation
- **Monthly View**: See your productivity patterns at a glance
- **Date Details**: Click any date to view specific tasks and notes
- **Heatmap**: Darker colors indicate higher task completion rates

### Analytics & Insights
- **Track Progress**: Monitor your completion rates and streaks
- **Focus Time**: See how much time you spend in focused work sessions
- **Productivity Patterns**: Identify your most productive days and times

### Customization
- **Themes**: Switch between light, dark, or system themes
- **Templates**: Create reusable templates for recurring tasks
- **Settings**: Customize notifications, working hours, and preferences

## 🎨 Design System

### Color Palette
- **Primary**: Warm orange (#d97706) for call-to-action elements
- **Background**: Clean whites and soft pastels
- **Accent**: Subtle greens and yellows for highlights
- **Text**: High contrast grays for optimal readability

### Typography
- **Headings**: Geist Sans for clean, modern headings
- **Body**: Geist Sans for consistent readability
- **Code**: Geist Mono for technical elements

### Layout Principles
- **Mobile-First**: Responsive design starting from mobile
- **Flexbox Priority**: Using flexbox for most layouts
- **Consistent Spacing**: Tailwind spacing scale for harmony
- **Rounded Corners**: 2xl radius for modern card design

## 🤝 Contributing

### Development Guidelines
1. Follow the existing code style and conventions
2. Use TypeScript for all new components
3. Implement responsive design for all features
4. Add proper accessibility attributes
5. Test on multiple devices and browsers

### Component Development
- Use shadcn/ui components as base
- Follow the established design tokens
- Implement proper error handling
- Add loading states for async operations


This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Fonts from [Geist](https://vercel.com/font)

---

**DailyNote** - Transform your daily productivity with beautiful, intuitive task management and note-taking. ✨
