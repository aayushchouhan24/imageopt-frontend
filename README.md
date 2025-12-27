# ImageOpt Frontend

Production-ready MVP frontend for an ImageKit-like image optimization SaaS platform.

## 🚀 Tech Stack

- **React 19** - Latest React with modern hooks
- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Type-safe code
- **React Router** - Client-side routing
- **React Query** - Server state management
- **shadcn/ui** - Beautiful UI components (ONLY library used)
- **Tailwind CSS v4** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components (Sidebar, Topbar, etc.)
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── AssetsPage.tsx
│   ├── TransformationsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── UsagePage.tsx
│   └── SettingsPage.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
│   ├── api.ts          # API client with auth
│   └── utils.ts        # Helper functions
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## 🎨 Features

### ✅ Completed Features

1. **Authentication** - Login/Register, JWT tokens, protected routes
2. **Dashboard Layout** - Sidebar navigation, topbar with notifications
3. **Dashboard Overview** - Stats cards, bandwidth chart, recent assets
4. **Assets Management** - Grid view, S3 upload, search, delete
5. **Transformations** - URL builder with live preview
6. **Analytics** - Bandwidth and cost charts
7. **Usage & Billing** - Usage tracking, cost breakdown
8. **Settings** - Profile, API tokens, logout

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server (runs on http://localhost:5173)
pnpm dev

# Build for production
pnpm build
```

### Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

## 📡 API Integration

Backend must be running on `http://localhost:5000`. Uses JWT authentication with automatic header injection.

**Upload Flow:**
1. Request presigned URL: `POST /api/assets/upload-url`
2. Upload to S3 using presigned URL
3. Create asset record: `POST /api/assets`

## 🎨 Design System

**Dark Theme Only** - Premium SaaS aesthetic with gradients

- Background: `bg-zinc-950`
- Cards: `bg-zinc-900` with `border-zinc-800`
- **Only shadcn/ui components** - no other UI libraries

## 📝 Code Conventions

- TypeScript for all files
- Functional components with hooks
- Tailwind utilities only (no custom CSS)
- shadcn/ui components only

## 🔮 Future Enhancements

- Asset details page
- Bulk actions
- Real-time notifications
- Team collaboration
- Billing integration
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
