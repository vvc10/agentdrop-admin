# Admin Panel Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
cd admin-panel
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file in the admin-panel directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### 3. Run Development Server
```bash
pnpm dev
```

The admin panel will run on `http://localhost:3001`

## Admin Access

### Access Admin Panel
1. Go to `http://localhost:3001` (admin panel)
2. Sign in with your admin account
3. You should now have access to the admin dashboard

**Note**: Admin promotion functionality has been disabled for security. Admin users are managed directly in the database.

## Troubleshooting

### Package Installation Issues
If you encounter package installation issues:

1. Clear cache: `pnpm store prune`
2. Delete node_modules: `rm -rf node_modules`
3. Delete pnpm-lock.yaml: `rm pnpm-lock.yaml`
4. Reinstall: `pnpm install`

### Environment Variables
Make sure all environment variables are properly set. You can copy them from your main app's `.env.local` file.

### Database Migration
Ensure the admin field has been added to the profiles table:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
```

## Features Available

- **Dashboard**: Real-time analytics overview
- **User Management**: View and manage users
- **Waitlist Management**: Send beta invites
- **Analytics**: Conversion tracking and metrics
- **System Settings**: Configuration management

## Security

- Admin access is controlled by the `is_admin` field in the profiles table
- All API endpoints verify admin privileges
- Uses Clerk for secure authentication
- Separate from main app for security isolation 