# Private Asset Display Fix

## Problem
When assets are marked as private, their CloudFront URLs require signed URLs to access them. The frontend was using regular CloudFront URLs for all assets, causing private assets to fail to load (403 Forbidden error).

## Solution
Created an automatic signed URL system that:
1. Detects when an asset is private
2. Automatically fetches signed URLs for private assets
3. Uses regular CloudFront URLs for public assets
4. Handles loading states and errors gracefully

## Files Created

### 1. `src/hooks/useAssetUrl.ts`
Custom React hook that handles the logic of determining whether to use a signed URL or regular URL:
- For **public assets**: Returns CloudFront URL directly
- For **private assets**: Fetches signed URL from backend API (`/api/assets/:id/signed-url`)
- Includes loading and error states
- Configurable expiry time (default: 1 hour)

### 2. `src/components/assets/AssetImage.tsx`
Reusable component that automatically displays both public and private assets:
- Uses `useAssetUrl` hook internally
- Shows skeleton loader while fetching signed URL
- Handles errors with fallback UI
- Supports all standard img props (className, style, loading, etc.)
- Works with non-image file types

## Files Modified

### Updated to use `AssetImage` component:
1. **src/pages/MediaLibraryPage.tsx**
   - List view thumbnails
   - Grid view thumbnails
   
2. **src/components/assets/AssetDetailModal.tsx**
   - Preview tab image display
   
3. **src/pages/DashboardPage.tsx**
   - Recent assets list thumbnails
   
4. **src/pages/AnalyticsPage.tsx**
   - Top assets list thumbnails

## How It Works

### Before (Broken for Private Assets):
```tsx
<img src={asset.cloudfrontUrl} alt={asset.name} />
// ❌ Fails with 403 for private assets
```

### After (Works for All Assets):
```tsx
<AssetImage asset={asset} alt={asset.name} />
// ✅ Automatically uses signed URL for private assets
// ✅ Uses regular URL for public assets
```

### Behind the Scenes:
1. Component receives asset object
2. `useAssetUrl` hook checks `asset.isPrivate` flag
3. **If public**: Returns `asset.cloudfrontUrl` immediately
4. **If private**: 
   - Fetches signed URL from: `GET /api/assets/:id/signed-url?expirySeconds=3600`
   - Caches the signed URL
   - Returns signed URL for image display
5. Component displays image with appropriate URL

## Benefits
- **Zero code changes needed** in most places - just replace `<img>` with `<AssetImage>`
- **Automatic handling** - developers don't need to think about signed URLs
- **Performance** - public assets load instantly, no unnecessary API calls
- **Error handling** - graceful fallbacks if signed URL fetch fails
- **Loading states** - shows skeleton while fetching for better UX
- **Reusable** - one component for all asset display needs

## Testing
To test the fix:
1. Mark an asset as private using the toggle in Media Library or Asset Detail Modal
2. The asset should still display correctly in:
   - Media Library grid/list view
   - Asset detail modal preview
   - Dashboard recent assets
   - Analytics top assets
3. The image should load with a signed URL (check Network tab to verify)

## API Endpoint Used
- `GET /api/assets/:id/signed-url?expirySeconds=3600`
  - Returns: `{ signedUrl, expiresAt, expiresInSeconds }`
  - Requires: Authentication (Bearer token)
  - Default expiry: 3600 seconds (1 hour)
