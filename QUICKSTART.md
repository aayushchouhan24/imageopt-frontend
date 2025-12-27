# ImageOpt Frontend - Quick Start Guide

## ✅ What's Built

A complete ImageKit-style admin dashboard with:

### Pages
1. **Login/Register** - JWT authentication
2. **Dashboard** - Stats, bandwidth charts, recent uploads
3. **Media Library** - Grid/list view, upload, search, delete, restore
4. **Analytics** - Bandwidth tracking with charts
5. **Settings** - User profile
6. **Coming Soon Pages** - Transformations, URL Builder, Usage

### Features
- ✅ JWT Authentication with localStorage
- ✅ Protected routes with auth guard
- ✅ Presigned S3 upload flow
- ✅ Grid and list view toggle
- ✅ Bulk delete functionality
- ✅ Copy CDN URL to clipboard
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Dark theme matching ImageKit
- ✅ Recharts analytics visualization

## 🚀 Running the Frontend

### 1. Start Backend First
```powershell
cd imageopt-backend
npm run dev
# Backend runs on http://localhost:5000
```

### 2. Start Frontend
```powershell
cd imageopt-frontend
pnpm dev
# Frontend runs on http://localhost:5173 (or 5174)
```

### 3. Test the App
1. Go to `http://localhost:5174`
2. Click "Sign up" to create account
3. Enter email and password
4. Explore the dashboard!

## 📸 Key Features to Test

### Upload Assets
1. Go to **Media Library**
2. Click **"Upload Assets"** button
3. Drag & drop images or browse
4. Optionally add folder name
5. Click **"Upload"**

### View Analytics
1. Go to **Analytics** page
2. See bandwidth usage charts
3. View daily breakdown

### Delete & Restore
1. Select assets in Media Library
2. Click delete button
3. Go back to restore within 90 hours

## 🎨 Design Highlights

### Dark Theme
- Background: `bg-zinc-950` (near black)
- Cards: `bg-zinc-900` with `border-zinc-800`
- Text: White primary, zinc-400 secondary
- Accents: Blue-600 primary, green-500 success, red-500 error

### Layout
- **Sidebar**: Collapsible, ImageKit-style navigation
- **Topbar**: Search bar, notifications, user dropdown
- **Main Content**: Responsive grid/list layouts

### Components Used (shadcn/ui only)
- Button, Card, Input, Label, Select
- Table, Dialog, Dropdown Menu
- Avatar, Badge, Skeleton, Toast
- Progress, Separator, Tabs

## 🔧 Customization

### Change API URL
Edit `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url:5000';
```

### Add New Page
1. Create page in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation in `src/components/layout/Sidebar.tsx`

### Install More shadcn Components
```powershell
cd imageopt-frontend
pnpm dlx shadcn@latest add <component-name>
```

## 📦 Dependencies

### Core
- react@19.2.0
- react-router-dom@7.x
- @tanstack/react-query@5.x
- recharts@2.x

### UI
- @radix-ui/* (via shadcn/ui)
- lucide-react (icons)
- sonner (toasts)
- tailwindcss@4.x

### Dev
- vite@7.x
- typescript@5.9.x
- eslint@9.x

## 🎯 What's Missing (Future Work)

1. **Transformations Playground**
   - Image resize, crop, format controls
   - Live preview with generated URL

2. **URL Builder**
   - Manual transformation chain builder
   - Parameter toggles
   - Copy URL functionality

3. **Advanced Features**
   - Folder management (create/rename/delete)
   - Asset details modal
   - Advanced search filters
   - API key management UI
   - Bulk edit metadata

4. **Performance**
   - Image lazy loading (partially done)
   - Virtual scrolling for large lists
   - Optimistic updates

## 🐛 Known Issues

1. TypeScript strict mode has some `any` types (non-blocking)
2. Some unused imports from development
3. Gradient classes show warnings (Tailwind v4 compatibility)

## 📝 Notes

- Backend must be running on port 5000
- JWT token stored in localStorage
- All API calls use fetch (no axios)
- React Query handles caching/refetching
- Dark theme only (no light mode toggle)

## 🎉 Success!

You now have a fully functional ImageKit-style frontend! The UI matches professional SaaS standards with:
- Clean dark theme
- Intuitive navigation
- Smooth animations
- Real-time updates
- Professional data visualizations

Start uploading assets and explore the platform!
