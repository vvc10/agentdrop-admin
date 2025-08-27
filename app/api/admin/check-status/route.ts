import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase-client";
import { currentUser } from "@clerk/nextjs/server";

async function isAdmin(): Promise<boolean> {
  try {
    console.log("isAdmin function called");
    
    const user = await currentUser();
    if (!user) {
      console.log("No user in isAdmin function");
      return false;
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    console.log("Checking admin for user:", user.id, "email:", userEmail);

    const supabaseAdmin = createSupabaseClient();

    // First try to find by Clerk user ID
    console.log("Trying to find profile by ID:", user.id);
    let { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    console.log("Profile lookup by ID result:", { profile, error });

    // If not found by ID, try by email
    if (error || !profile) {
      if (userEmail) {
        console.log("Trying to find profile by email:", userEmail);
        const { data: profileByEmail, error: emailError } = await supabaseAdmin
          .from("profiles")
          .select("is_admin")
          .eq("email", userEmail)
          .single();

        console.log("Profile lookup by email result:", { profileByEmail, emailError });

        if (!emailError && profileByEmail) {
          profile = profileByEmail;
          error = null;
        }
      }
    }

    if (error || !profile) {
      console.log("No profile found for user:", user.id, "email:", userEmail);
      return false;
    }

    console.log("Admin check result:", profile.is_admin, "for user:", user.id);
    return profile.is_admin === true;
  } catch (error) {
    console.error("Admin check error:", error);
    throw error; // Re-throw to see the actual error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("Starting admin check...");
    
    const user = await currentUser();
    console.log("User found:", user?.id, user?.emailAddresses?.[0]?.emailAddress);
    
    if (!user) {
      console.log("No user found");
      return NextResponse.json({ 
        success: false, 
        isAdmin: false,
        error: "No authenticated user" 
      }, { status: 401 });
    }

    const adminStatus = await isAdmin();
    console.log("Admin status result:", adminStatus);
    
    return NextResponse.json({
      success: true,
      isAdmin: adminStatus,
      userId: user?.id,
      userEmail: user?.emailAddresses?.[0]?.emailAddress
    });
  } catch (error) {
    console.error("Admin status check error:", error);
    return NextResponse.json({ 
      success: false, 
      isAdmin: false,
      error: error instanceof Error ? error.message : "Failed to check admin status",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 