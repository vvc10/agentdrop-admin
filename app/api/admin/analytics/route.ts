import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (with subscription)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('subscription_expires_at', 'is', null)
      .gt('subscription_expires_at', new Date().toISOString());

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Get waitlist stats
    const { count: totalWaitlist } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const { count: approvedUsers } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('is_beta_user', true);

    const { count: pendingUsers } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('is_beta_user', false);

    // Calculate conversion rate
    const conversionRate = (totalWaitlist || 0) > 0 ? (((approvedUsers || 0) / (totalWaitlist || 0)) * 100).toFixed(2) : '0';

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Get top referrers from waitlist
    const { data: referrers } = await supabase
      .from('waitlist')
      .select('source')
      .not('source', 'is', null);

    const referrerStats = referrers?.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topReferrers = Object.entries(referrerStats)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Session analytics (mock data for now)
    const sessionData = {
      totalSessions: 1250,
      avgSessionDuration: '8m 32s',
      bounceRate: '23.4%',
      pageViews: 4560
    };

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      conversionRate,
      totalWaitlist: totalWaitlist || 0,
      approvedUsers: approvedUsers || 0,
      pendingUsers: pendingUsers || 0,
      recentActivity: recentUsers?.length || 0,
      topReferrers,
      sessionData
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 