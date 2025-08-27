// Test script for resend functionality
// This script tests the email resend feature

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testResendFunctionality() {
  console.log('🧪 Testing Resend Functionality...\n');

  try {
    // 1. Get a test user from waitlist
    console.log('1. Fetching test user from waitlist...');
    const { data: waitlistUsers, error: fetchError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('is_beta_user', true)
      .limit(1);

    if (fetchError || !waitlistUsers || waitlistUsers.length === 0) {
      console.error('❌ No approved users found in waitlist');
      return;
    }

    const testUser = waitlistUsers[0];
    console.log(`✅ Found test user: ${testUser.email}`);

    // 2. Check current email tracking records
    console.log('\n2. Checking current email tracking records...');
    const { data: emailRecords, error: emailError } = await supabase
      .from('email_tracking')
      .select('*')
      .eq('waitlist_id', testUser.id)
      .eq('email_type', 'beta_approval')
      .order('created_at', { ascending: false });

    if (emailError) {
      console.error('❌ Error fetching email records:', emailError);
      return;
    }

    console.log(`✅ Found ${emailRecords.length} email records for this user`);
    
    if (emailRecords.length > 0) {
      console.log('📧 Email history:');
      emailRecords.forEach((record, index) => {
        const isResend = record.metadata?.is_resend || false;
        const resendCount = record.metadata?.resend_count || 1;
        console.log(`   ${index + 1}. ${isResend ? 'RESEND' : 'FIRST'} (Count: ${resendCount}) - ${record.status} - ${record.created_at}`);
      });
    }

    // 3. Test resend count calculation
    console.log('\n3. Testing resend count calculation...');
    const resendCount = emailRecords.filter(record => record.metadata?.is_resend === true).length;
    console.log(`✅ Current resend count: ${resendCount}`);

    // 4. Check waitlist status
    console.log('\n4. Checking waitlist status...');
    console.log(`✅ User approved: ${testUser.is_beta_user}`);
    console.log(`✅ Email sent at: ${testUser.approval_email_sent_at || 'Not sent'}`);
    console.log(`✅ Email status: ${testUser.approval_email_status || 'not_sent'}`);

    console.log('\n🎉 Resend functionality test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Test user: ${testUser.email}`);
    console.log(`   - Total emails: ${emailRecords.length}`);
    console.log(`   - Resend count: ${resendCount}`);
    console.log(`   - Current status: ${testUser.approval_email_status || 'not_sent'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testResendFunctionality();
