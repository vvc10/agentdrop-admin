import { TemplateUtils, TemplateVariables } from './template-utils';

export interface EmailTrackingData {
  waitlist_id: string;
  email_type: 'beta_approval' | 'beta_rejection';
  recipient_email: string;
  subject: string;
  resend_message_id?: string;
  metadata?: Record<string, any>;
}

export interface BetaApprovalEmailData {
  name: string;
  email: string;
  signupUrl: string;
}

// Pure function approach - no class instantiation
export async function sendBetaApprovalEmail(data: BetaApprovalEmailData, requestUrl?: string): Promise<EmailTrackingData> {
  // Dynamically import Resend only when this function is called
  const { Resend } = await import('resend');
  
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = "🎉 You're Approved for Agentdrop Beta Access!";
  const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://agentdrop.io'}/sign-up`;

  const htmlContent = generateBetaApprovalEmailHTML(data, signupUrl, requestUrl);

  try {
    const result = await resend.emails.send({
      from: 'Agentdrop <noreply@mail.agentdrop.io>',
      to: [data.email],
      subject: subject,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': data.email,
      },
    });

    if (result.error) {
      console.error('Resend API Error Details:', {
        error: result.error,
        message: result.error.message,
        name: result.error.name
      });
      throw new Error(`Resend error: ${result.error.message || 'Unknown error'}`);
    }

    return {
      waitlist_id: '',
      email_type: 'beta_approval',
      recipient_email: data.email,
      subject: subject,
      resend_message_id: result.data?.id,
      metadata: {
        name: data.name,
        signup_url: signupUrl,
      }
    };
  } catch (error) {
    console.error('Failed to send beta approval email:', error);
    throw error;
  }
}

function generateBetaApprovalEmailHTML(data: BetaApprovalEmailData, signupUrl: string, requestUrl?: string): string {
  let baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
  
  if (requestUrl) {
    try {
      const url = new URL(requestUrl);
      baseUrl = `${url.protocol}//${url.host}`;
    } catch (error) {
      console.warn('Invalid request URL, using fallback:', requestUrl);
    }
  }
  
  const trackingUrl = `${baseUrl}/api/email/track-open?email=${encodeURIComponent(data.email)}&type=beta_approval`;
  
  const variables: TemplateVariables = {
    USER_NAME: data.name,
    SIGNUP_URL: signupUrl,
    TRACKING_URL: trackingUrl
  };
  
  return TemplateUtils.loadAndProcessTemplate('beta-approval-email.html', variables);
}
