# Vercel Deployment Guide

This guide will help you deploy the admin panel to Vercel successfully.

## 🚀 Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `admin-panel` directory as the root directory

### 2. Environment Variables Setup

In your Vercel project settings, add these environment variables:

#### Required Variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Email Service
RESEND_API_KEY=your_resend_api_key

# Admin Panel URL (for production)
NEXT_PUBLIC_ADMIN_URL=https://your-admin-domain.vercel.app
```

### 3. Build Configuration

Vercel should automatically detect Next.js. The build command should be:
```bash
npm run build
```

### 4. Deploy

1. Commit and push your changes to GitHub
2. Vercel will automatically deploy
3. Check the build logs for any errors

## 🔧 Troubleshooting

### Common Issues:

#### 1. "supabaseUrl is required" Error
- **Cause**: Environment variables not set in Vercel
- **Solution**: Add all required environment variables in Vercel project settings

#### 2. Build Failures
- **Cause**: Missing dependencies or environment variables
- **Solution**: 
  - Check that all environment variables are set
  - Ensure `package.json` has all required dependencies
  - Check build logs for specific error messages

#### 3. Runtime Errors
- **Cause**: Environment variables not accessible at runtime
- **Solution**: 
  - Ensure all `NEXT_PUBLIC_*` variables are set for client-side access
  - Check that server-side variables are properly configured

### 4. Email Tracking Issues
- **Cause**: Incorrect `NEXT_PUBLIC_ADMIN_URL`
- **Solution**: Set `NEXT_PUBLIC_ADMIN_URL` to your actual Vercel deployment URL

## 📋 Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Supabase project is properly configured
- [ ] Clerk authentication is set up
- [ ] Resend API key is configured
- [ ] Database migrations are applied
- [ ] Admin users are created in the database

## 🔒 Security Notes

1. **Environment Variables**: Never commit sensitive keys to your repository
2. **Service Role Key**: Keep the Supabase service role key secure
3. **Clerk Keys**: Ensure Clerk is properly configured for your domain
4. **CORS**: Configure CORS settings if needed

## 📞 Support

If you encounter issues:
1. Check the Vercel build logs
2. Verify all environment variables are set
3. Test locally with the same environment variables
4. Check the browser console for client-side errors
