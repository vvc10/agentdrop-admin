-- Migration: Add email tracking functionality
-- This enables tracking of beta approval emails sent to users

-- Add email tracking columns to waitlist table
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS approval_email_sent_at TIMESTAMPTZ;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS approval_email_status TEXT DEFAULT 'not_sent';

-- Create email_tracking table for detailed tracking
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'beta_approval', 'beta_rejection', etc.
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
  resend_message_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_waitlist_id ON email_tracking(waitlist_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_email_type ON email_tracking(email_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_sent_at ON email_tracking(sent_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_approval_email_status ON waitlist(approval_email_status);

-- Enable RLS on email_tracking table
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_tracking
CREATE POLICY "Service role can manage email tracking" ON email_tracking
  FOR ALL USING (true);

-- Create trigger for email_tracking updated_at
CREATE TRIGGER update_email_tracking_updated_at BEFORE UPDATE ON email_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for clarity
COMMENT ON COLUMN waitlist.approval_email_sent_at IS 'Timestamp when approval email was sent';
COMMENT ON COLUMN waitlist.approval_email_status IS 'Status of approval email: not_sent, sent, delivered, opened, failed';
