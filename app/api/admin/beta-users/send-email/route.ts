import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import EmailService from '@/lib/email-service';

// Helper function to get resend count for a waitlist entry
async function getResendCount(supabase: any, waitlistId: string): Promise<number> {
  const { count, error } = await supabase
    .from('email_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('waitlist_id', waitlistId)
    .eq('email_type', 'beta_approval')
    .eq('metadata->is_resend', true);

  if (error) {
    console.error('Error getting resend count:', error);
    return 0;
  }

  return count || 0;
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

    const { waitlistId, isResend = false } = await request.json();

    if (!waitlistId) {
      return NextResponse.json({ error: 'Waitlist ID is required' }, { status: 400 });
    }

    // Get waitlist user data
    const { data: waitlistUser, error: fetchError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('id', waitlistId)
      .single();

    if (fetchError || !waitlistUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is approved
    if (!waitlistUser.is_beta_user) {
      return NextResponse.json({ error: 'User is not approved for beta access' }, { status: 400 });
    }

    // For first-time sends, check if email was already sent
    if (!isResend && waitlistUser.approval_email_sent_at) {
      return NextResponse.json({ 
        error: 'Approval email already sent. Use resend option.',
        sentAt: waitlistUser.approval_email_sent_at 
      }, { status: 409 });
    }

    // Send email
    const emailService = EmailService.getInstance();
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://agentify.io'}/sign-up`;
    
    const emailData = {
      name: waitlistUser.name || 'there',
      email: waitlistUser.email,
      signupUrl: signupUrl
    };

    const emailResult = await emailService.sendBetaApprovalEmail(emailData, request.url);

    // Update waitlist entry with email tracking
    const updateData = {
      approval_email_status: 'sent'
    };

    // Only update sent_at timestamp for first-time sends
    if (!isResend) {
      updateData.approval_email_sent_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('waitlist')
      .update(updateData)
      .eq('id', waitlistId);

    if (updateError) {
      console.error('Error updating waitlist email status:', updateError);
      // Don't fail the request, just log the error
    }

    // Record email tracking (always insert new record for resends)
    const { error: trackingError } = await supabase
      .from('email_tracking')
      .insert([{
        waitlist_id: waitlistId,
        email_type: 'beta_approval',
        recipient_email: waitlistUser.email,
        subject: emailResult.subject,
        resend_message_id: emailResult.resend_message_id,
        metadata: {
          ...emailResult.metadata,
          is_resend: isResend,
          original_sent_at: isResend ? waitlistUser.approval_email_sent_at : null,
          resend_count: isResend ? (await getResendCount(supabase, waitlistId)) + 1 : 1
        },
        status: 'sent'
      }]);

    if (trackingError) {
      console.error('Error recording email tracking:', trackingError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true,
      message: isResend ? 'Approval email resent successfully' : 'Approval email sent successfully',
      emailId: emailResult.resend_message_id,
      sentAt: new Date().toISOString(),
      isResend: isResend
    });

  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json({ error: 'Failed to send approval email' }, { status: 500 });
  }
}
