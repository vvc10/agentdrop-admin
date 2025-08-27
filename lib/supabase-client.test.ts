// Simple test to verify Supabase client configuration
// This file is for development testing only

import { createSupabaseClient, createSupabaseClientAnon } from './supabase-client';

// Test function to verify environment variables are set
export function testSupabaseConfig() {
  try {
    const client = createSupabaseClient();
    console.log('✅ Supabase client created successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase client creation failed:', error);
    return false;
  }
}

// Test function to verify anon client
export function testSupabaseAnonConfig() {
  try {
    const client = createSupabaseClientAnon();
    console.log('✅ Supabase anon client created successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase anon client creation failed:', error);
    return false;
  }
}
