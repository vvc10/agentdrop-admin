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

    // Fetch all waitlist entries
    const { data: waitlistUsers, error } = await supabase
      .from('waitlist')
      .select(`
        id,
        email,
        name,
        created_at,
        is_beta_user,
        source,
        approval_email_sent_at,
        approval_email_status
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beta users:', error);
      return NextResponse.json({ error: 'Failed to fetch beta users' }, { status: 500 });
    }

    // Transform data for frontend
    const transformedUsers = waitlistUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.is_beta_user ? 'approved' : 'pending',
      joinedDate: user.created_at,
      source: user.source || 'Website',
      approvalEmailSentAt: user.approval_email_sent_at,
      approvalEmailStatus: user.approval_email_status || 'not_sent'
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error in beta users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { action, userId: targetUserId } = await request.json();

    if (action === 'approve') {
      const { error } = await supabase
        .from('waitlist')
        .update({ is_beta_user: true })
        .eq('id', targetUserId);

      if (error) {
        console.error('Error approving user:', error);
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
      }
    } else if (action === 'reject') {
      const { error } = await supabase
        .from('waitlist')
        .update({ is_beta_user: false })
        .eq('id', targetUserId);

      if (error) {
        console.error('Error rejecting user:', error);
        return NextResponse.json({ error: 'Failed to reject user' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in beta users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 