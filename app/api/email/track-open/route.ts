import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const type = searchParams.get('type');

    console.log('Email tracking hit:', { email, type, url: request.url });

    if (!email || !type) {
      // Return a 1x1 transparent pixel even if tracking fails
      return new Response(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    const supabase = createSupabaseClient();

    // Update email tracking record
    const { error: trackingError } = await supabase
      .from('email_tracking')
      .update({
        opened_at: new Date().toISOString(),
        status: 'opened'
      })
      .eq('recipient_email', email)
      .eq('email_type', type)
      .is('opened_at', null); // Only update if not already opened

    if (trackingError) {
      console.error('Error updating email open tracking:', trackingError);
    }

    // Also update the waitlist table for beta approval emails
    if (type === 'beta_approval') {
      const { error: waitlistError } = await supabase
        .from('waitlist')
        .update({
          approval_email_status: 'opened'
        })
        .eq('email', email)
        .eq('approval_email_status', 'sent'); // Only update if status is 'sent'

      if (waitlistError) {
        console.error('Error updating waitlist email status:', waitlistError);
      }
    }

    // Return a 1x1 transparent pixel
    return new Response(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error) {
    console.error('Error in email tracking:', error);
    
    // Return a 1x1 transparent pixel even if tracking fails
    return new Response(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}
