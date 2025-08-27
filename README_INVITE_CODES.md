# Invite Codes Management - Admin Panel

This document explains the invite codes management system in the admin panel.

## Overview

The invite codes system allows administrators to create and manage invite codes that grant Pro access to users. This is integrated with the main AgentDrop application.

## Features

### Admin Interface
- **Create Invite Codes**: Generate new codes with custom parameters
- **Edit Codes**: Modify existing codes (usage limits, expiry, etc.)
- **Delete Codes**: Remove codes that are no longer needed
- **View Usage**: See who has redeemed each code and when
- **Copy Codes**: Easy clipboard copying for distribution

### Code Parameters
- **Code**: Unique identifier (auto-generated or custom)
- **Description**: Optional description for organization
- **Max Uses**: How many times the code can be used
- **Plan Type**: free, pro, or enterprise
- **Duration**: How many months of access to grant
- **Expiry Date**: Optional expiration date
- **Active Status**: Enable/disable codes

## Database Schema

### invite_codes table
- `id`: UUID primary key
- `code`: Unique code string
- `description`: Optional description
- `max_uses`: Maximum redemptions allowed
- `used_count`: Current redemption count
- `is_active`: Whether code is active
- `created_by`: Admin user ID who created the code
- `created_at`: Creation timestamp
- `expires_at`: Optional expiry date
- `plan_type`: Type of plan to grant (free/pro/enterprise)
- `duration_months`: Duration of access in months

### invite_code_redemptions table
- `id`: UUID primary key
- `invite_code_id`: Reference to invite code
- `user_id`: User who redeemed the code
- `user_email`: User's email
- `redeemed_at`: Redemption timestamp
- `plan_granted`: Plan that was granted
- `expires_at`: When the granted access expires

## API Endpoints

All endpoints are protected and require admin authentication.

### GET /api/admin/invite-codes
Fetches all invite codes with redemption data.

### POST /api/admin/invite-codes
Creates a new invite code.

**Body:**
```json
{
  "code": "MYCODE2024",
  "description": "Special promo code",
  "max_uses": 50,
  "plan_type": "pro",
  "duration_months": 1,
  "expires_at": "2024-12-31",
  "is_active": true
}
```

### PUT /api/admin/invite-codes
Updates an existing invite code.

**Body:**
```json
{
  "id": "uuid",
  "code": "UPDATED2024",
  "max_uses": 100,
  "is_active": false
}
```

### DELETE /api/admin/invite-codes?id=uuid
Deletes an invite code.

## Integration with Main App

The invite codes created in the admin panel work seamlessly with the main AgentDrop application:

1. Users can redeem codes at `/invite` in the main app
2. Codes are validated against the database
3. Successful redemptions grant Pro access
4. Usage is tracked and displayed in admin panel

## Security

- All admin endpoints require authentication
- Row Level Security (RLS) is enabled on database tables
- Only admins can manage codes
- Users can only view their own redemptions
- Codes have built-in validation (expiry, usage limits)

## Usage Instructions

1. **Access**: Navigate to `/invite-codes` in the admin panel
2. **Create Code**: Click "Create New Code" and fill in details
3. **Distribute**: Copy the code and share with users
4. **Monitor**: View redemptions and usage statistics
5. **Manage**: Edit or deactivate codes as needed

## Sample Codes

The system comes with some pre-created sample codes:
- `23USERFROMINFUZA`: Influencer promo (100 uses, 1 month Pro)
- `WELCOME2024`: Welcome code (50 uses, 1 month Pro)  
- `BETAACCESS`: Beta tester code (25 uses, 3 months Pro)

These can be modified or deleted as needed.

