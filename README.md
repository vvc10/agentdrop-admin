# Agentify Admin Panel

A separate, production-grade admin panel for managing the Agentify platform.

## 🏗️ Architecture

This admin panel is built as a separate Next.js application that connects to the same Supabase database as the main application. This provides:

- **Security**: Isolated from main app, reduces attack surface
- **Performance**: Dedicated resources, no interference with user traffic
- **Scalability**: Can scale independently
- **Maintenance**: Updates don't affect main app
- **Access Control**: Different authentication, different domains

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the same environment variables as the main app:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Admin Panel URL (for email tracking)
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Run Development Server

```bash
npm run dev
```

The admin panel will run on `http://localhost:3001`

## 🔐 Admin Setup

### Access Admin Panel

1. Go to `http://localhost:3001` (admin panel)
2. Sign in with your admin account
3. You should now have access to the admin dashboard

**Security Note**: Admin promotion functionality has been disabled. Admin users are managed directly in the database for security purposes.

## 📊 Features

### Dashboard
- Real-time analytics overview
- User statistics
- Waitlist management
- Beta invite tracking
- Conversion rate monitoring

### Email Management
- **First-time sends**: Send approval emails to newly approved users
- **Resend functionality**: Send emails multiple times to the same user
- **Full tracking**: Each send is tracked separately in the database
- **Resend analytics**: Track first-time vs resend email statistics
- **Status tracking**: Monitor delivery, open, and failure rates

### Waitlist Management
- View all waitlist entries
- Send individual beta invites
- Send batch beta invites
- Track invite status
- **Resend emails** - Send approval emails multiple times with full tracking

### Analytics
- User growth metrics
- Conversion tracking
- Source attribution
- Role-based analytics

### System Settings
- Feature flags
- System configuration
- Admin user management

## 🛡️ Security Features

- **Multi-factor Authentication**: Via Clerk
- **IP Whitelisting**: Can be configured
- **Session Management**: Secure session handling
- **Audit Logging**: All admin actions logged
- **Rate Limiting**: API rate limiting
- **CORS Configuration**: Secure cross-origin requests

## 🏭 Production Deployment

### Option 1: Separate Domain
```
Main App: https://agentify.com
Admin Panel: https://admin.agentify.com
```

### Option 2: Subdirectory
```
Main App: https://agentify.com
Admin Panel: https://agentify.com/admin
```

### Environment Variables for Production

```env
# Production URLs
NEXT_PUBLIC_APP_URL=https://agentify.com
NEXT_PUBLIC_ADMIN_URL=https://admin.agentify.com

# Security
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 📁 Project Structure

```
admin-panel/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── admin/         # Admin-specific APIs
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   └── ui/               # UI components
├── lib/                  # Utilities
│   └── utils.ts          # Helper functions
├── package.json          # Dependencies
├── tailwind.config.ts    # Tailwind config
└── tsconfig.json         # TypeScript config
```

## 🔧 Development

### Adding New Features

1. **Create API Routes**: Add new endpoints in `app/api/admin/`
2. **Create Pages**: Add new pages in `app/`
3. **Create Components**: Add reusable components in `components/`
4. **Update Types**: Add TypeScript types as needed

### Database Access

The admin panel uses the same Supabase database as the main app, but with admin privileges through the service role key.

### Authentication

Uses Clerk for authentication, with admin status checked against the `profiles.is_admin` field in the database.

## 🚨 Security Considerations

1. **Admin Access**: Only users with `is_admin: true` can access the admin panel
2. **API Protection**: All admin APIs check for admin privileges
3. **Session Security**: Secure session management via Clerk
4. **Audit Trail**: All admin actions are logged for security
5. **Rate Limiting**: API endpoints are rate-limited to prevent abuse

## 📈 Monitoring

- **Error Tracking**: Integrate with Sentry or similar
- **Performance Monitoring**: Use Vercel Analytics or similar
- **Uptime Monitoring**: Monitor admin panel availability
- **Security Monitoring**: Monitor for suspicious activity

## 🔄 Updates

To update the admin panel:

1. Pull latest changes
2. Install new dependencies: `npm install`
3. Run migrations if needed
4. Deploy to production
5. Test admin functionality

The admin panel can be updated independently of the main application. 