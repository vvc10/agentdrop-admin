import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get total users count
    const { count: totalUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get waitlist stats
    const { count: totalWaitlist } = await supabaseAdmin
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    const { count: betaInvited } = await supabaseAdmin
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .not("beta_invited_at", "is", null);

    const { count: betaActivated } = await supabaseAdmin
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .not("beta_activated_at", "is", null);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // Calculate conversion rate
    const conversionRate = (betaInvited || 0) > 0 
      ? (((betaActivated || 0) / (betaInvited || 0)) * 100).toFixed(2) 
      : "0";

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalWaitlist: totalWaitlist || 0,
        betaInvited: betaInvited || 0,
        betaActivated: betaActivated || 0,
        conversionRate,
        recentSignups: recentSignups || 0
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 