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

    // Get email tracking statistics
    const { data: emailStats, error: emailError } = await supabase
      .from('email_tracking')
      .select('status, created_at, metadata')
      .eq('email_type', 'beta_approval');

    if (emailError) {
      console.error('Error fetching email stats:', emailError);
      return NextResponse.json({ error: 'Failed to fetch email statistics' }, { status: 500 });
    }

    // Calculate statistics
    const totalEmails = emailStats?.length || 0;
    const sentEmails = emailStats?.filter(e => e.status === 'sent').length || 0;
    const deliveredEmails = emailStats?.filter(e => e.status === 'delivered').length || 0;
    const openedEmails = emailStats?.filter(e => e.status === 'opened').length || 0;
    const failedEmails = emailStats?.filter(e => e.status === 'failed').length || 0;
    
    // Calculate resend statistics
    const resendEmails = emailStats?.filter(e => e.metadata?.is_resend === true).length || 0;
    const firstTimeEmails = totalEmails - resendEmails;

    // Calculate rates
    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0;
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const failureRate = totalEmails > 0 ? (failedEmails / totalEmails) * 100 : 0;

    // Get recent email activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentEmails, error: recentError } = await supabase
      .from('email_tracking')
      .select('status, created_at')
      .eq('email_type', 'beta_approval')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('Error fetching recent emails:', recentError);
    }

    // Get daily email counts for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEmails = recentEmails?.filter(e => 
        e.created_at.startsWith(dateStr)
      ).length || 0;
      
      dailyStats.push({
        date: dateStr,
        count: dayEmails
      });
    }

    return NextResponse.json({
      statistics: {
        total: totalEmails,
        sent: sentEmails,
        delivered: deliveredEmails,
        opened: openedEmails,
        failed: failedEmails,
        firstTimeEmails: firstTimeEmails,
        resendEmails: resendEmails,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100
      },
      recentActivity: {
        last7Days: recentEmails?.length || 0,
        dailyStats: dailyStats
      }
    });

  } catch (error) {
    console.error('Error in email analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
