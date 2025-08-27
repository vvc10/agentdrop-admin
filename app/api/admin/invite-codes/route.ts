import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase-client";

// Helper function to check if user is admin
async function checkAdminAccess() {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  // For admin panel, we can assume all authenticated users are admins
  // or add additional admin check logic here
  return { user };
}

// GET - List all invite codes
export async function GET(req: NextRequest) {
  const adminCheck = await checkAdminAccess();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const supabaseAdmin = createSupabaseClient();

    const { data: inviteCodes, error } = await supabaseAdmin
      .from("invite_codes")
      .select(`
        *,
        invite_code_redemptions (
          id,
          user_email,
          redeemed_at,
          plan_granted,
          expires_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invite codes:", error);
      return NextResponse.json({ error: "Failed to fetch invite codes" }, { status: 500 });
    }

    return NextResponse.json(inviteCodes);
  } catch (error) {
    console.error("Error in GET /api/admin/invite-codes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new invite code
export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminAccess();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const supabaseAdmin = createSupabaseClient();

    const body = await req.json();
    const { code, description, max_uses, plan_type, duration_months, expires_at } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Check if code already exists
    const { data: existingCode } = await supabaseAdmin
      .from("invite_codes")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (existingCode) {
      return NextResponse.json({ error: "Invite code already exists" }, { status: 400 });
    }

    const { data: newCode, error } = await supabaseAdmin
      .from("invite_codes")
      .insert({
        code: code.toUpperCase(),
        description: description || null,
        max_uses: max_uses || 1,
        plan_type: plan_type || 'pro',
        duration_months: duration_months || 1,
        expires_at: expires_at || null,
        created_by: adminCheck.user.id,
        is_active: true,
        used_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invite code:", error);
      return NextResponse.json({ error: "Failed to create invite code" }, { status: 500 });
    }

    return NextResponse.json(newCode);
  } catch (error) {
    console.error("Error in POST /api/admin/invite-codes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update invite code
export async function PUT(req: NextRequest) {
  const adminCheck = await checkAdminAccess();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const supabaseAdmin = createSupabaseClient();

    const body = await req.json();
    const { id, code, description, max_uses, plan_type, duration_months, expires_at, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Code ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (max_uses !== undefined) updateData.max_uses = max_uses;
    if (plan_type !== undefined) updateData.plan_type = plan_type;
    if (duration_months !== undefined) updateData.duration_months = duration_months;
    if (expires_at !== undefined) updateData.expires_at = expires_at;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedCode, error } = await supabaseAdmin
      .from("invite_codes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating invite code:", error);
      return NextResponse.json({ error: "Failed to update invite code" }, { status: 500 });
    }

    return NextResponse.json(updatedCode);
  } catch (error) {
    console.error("Error in PUT /api/admin/invite-codes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete invite code
export async function DELETE(req: NextRequest) {
  const adminCheck = await checkAdminAccess();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const supabaseAdmin = createSupabaseClient();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Code ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("invite_codes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting invite code:", error);
      return NextResponse.json({ error: "Failed to delete invite code" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/invite-codes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

