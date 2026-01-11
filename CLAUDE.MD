# Hongik Community Project

## Project Overview

This is a community platform for Hongik University's club federation (총동아리연합회). The platform provides a centralized way to introduce all university clubs and effectively promote club activities.

## Tech Stack

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.3.1
- **Language**: TypeScript 5.8.3
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.30.1
- **State Management**: TanStack Query 5.83.0
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76
- **Theme**: next-themes 0.3.0
- **Icons**: lucide-react 0.462.0
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

### Backend
- **BaaS**: Supabase 2.90.1
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with Row Level Security

## Project Structure

```
hongik-community/
├── fe/                          # Frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx      # Login page
│   │   │   ├── Register.tsx   # Registration page
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx # Authentication context
│   │   ├── services/          # API service layers
│   │   │   └── auth.service.ts # Authentication service
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   │   └── supabase.ts    # Supabase client
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── database.types.ts # Database types
│   │   ├── data/              # Static data and constants
│   │   ├── assets/            # Images and static assets
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Application entry point
│   ├── supabase/              # Supabase configuration
│   │   └── schema.sql         # Database schema
│   ├── public/                # Public static files
│   ├── .env.example           # Environment variables example
│   ├── SUPABASE_SETUP.md      # Supabase setup guide
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docs/                       # Documentation
└── README.md
```

## Key Features

### 1. User Management (3-tier Permission System)
- **Site Administrator**: Full system management
- **Club Manager**: Manage club information
- **General User**: View club information

### 2. Club Information
- Basic club information management:
  - President information
  - Contact details
  - Club room location
  - Recruitment period
  - Regular meeting schedule
- **Markdown-based** detailed introduction pages

### 3. Activity Feed
- Instagram account integration for automatic feeds
- Direct image upload functionality
- Club-specific activity galleries

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Git Information

- **Main Branch**: main
- **Current Worktree**: sleepy-williams
- **Worktree Path**: /Users/jeongjin/.claude-worktrees/fe/sleepy-williams
- **Main Repository**: /Users/jeongjin/Documents/홍익대_프로젝트/hongik-community/fe

## Development Notes

### UI Components
The project uses shadcn/ui, which provides a collection of re-usable components built on top of Radix UI. Components are located in `fe/src/components/ui/`.

### Styling
- Tailwind CSS with custom configuration
- Typography plugin enabled (@tailwindcss/typography)
- Custom animations via tailwindcss-animate
- Theme support with next-themes

### Code Quality
- ESLint configured with TypeScript support
- React Hooks linting enabled
- React Refresh plugin for HMR

## Important Conventions

1. **Component Organization**: UI components in `components/ui/`, page components in `pages/`
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Form Validation**: Use React Hook Form + Zod for forms
4. **Styling**: Tailwind utility classes with shadcn/ui components
5. **State Management**: TanStack Query for server state
6. **Authentication**: Use `useAuth()` hook from AuthContext
7. **Database Types**: Import types from `types/database.types.ts`

## Authentication & Database

### Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `fe/supabase/schema.sql` in the Supabase SQL Editor
3. Copy `fe/.env.example` to `fe/.env` and add your Supabase credentials
4. See `fe/SUPABASE_SETUP.md` for detailed setup instructions

### Authentication Flow
- **Sign Up**: `fe/src/pages/Register.tsx` - Creates user in both Supabase Auth and users table
- **Sign In**: `fe/src/pages/Login.tsx` - Authenticates using email/password
- **Auth Context**: `fe/src/contexts/AuthContext.tsx` - Manages auth state globally
- **Auth Service**: `fe/src/services/auth.service.ts` - Wraps Supabase auth methods

### Using Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Database Schema

**users table:**
- `id`: UUID (references auth.users.id)
- `email`: TEXT (unique)
- `name`: TEXT
- `role`: 'user' | 'club_admin' | 'admin'
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Row Level Security (RLS)
- Users can view/update their own profile
- Admins can view all users
- Policies are defined in `fe/supabase/schema.sql`

## Environment Variables

Create a `fe/.env` file with:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Contact

Project inquiries: TBD
