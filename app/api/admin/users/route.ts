import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseClient();

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all users with their profiles
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        created_at,
        is_admin,
        subscription_plan,
        subscription_expires_at,
        subscribed,
        credits
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.email.split('@')[0], // Use email prefix as name since we don't have first/last name
      role: user.is_admin ? 'Admin' : 'User',
      status: user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date() ? 'Pro' : 'Free',
      joinedDate: user.created_at,
      lastActive: user.created_at, // We don't have updated_at, so use created_at
      subscriptionPlan: user.subscription_plan || 'free',
      isAdmin: user.is_admin || false,
      subscribed: user.subscribed || false,
      credits: user.credits || 0
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 