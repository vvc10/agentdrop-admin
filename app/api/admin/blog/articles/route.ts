import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase-client";

// Ensure user is authenticated (optionally check admin in future)
async function requireAuth() {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized", status: 401 } as const;
  return { user } as const;
}

// GET: list recent blog articles
export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("blog_articles")
      .select("id, title, slug, excerpt, status, published_at, created_at, tags")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching articles:", error);
      return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
    }

    return NextResponse.json({ articles: data || [] });
  } catch (err) {
    console.error("GET /api/admin/blog/articles error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: create a new article
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const supabase = createSupabaseClient();

    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status = "draft",
      tags = [],
      categoryIds = [] as string[]
    } = body || {};

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "title, slug and content are required" }, { status: 400 });
    }

    // ensure unique slug
    const { data: existing } = await supabase
      .from("blog_articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const published_at = status === "published" ? new Date().toISOString() : null;

    const author_id = auth.user.id;
    const author_name = [auth.user.firstName, auth.user.lastName].filter(Boolean).join(" ") || auth.user.username || "Admin";
    const author_avatar = auth.user.imageUrl || null;

    const { data: article, error } = await supabase
      .from("blog_articles")
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featured_image: featured_image || null,
        author_id,
        author_name,
        author_avatar,
        status,
        published_at,
        tags
      })
      .select("id")
      .single();

    if (error || !article) {
      console.error("Error creating article:", error);
      return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
    }

    // Optional: link categories if provided and junction table exists
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const links = categoryIds.map((category_id: string) => ({ article_id: article.id, category_id }));
      const { error: linkErr } = await supabase.from("blog_article_categories").insert(links);
      if (linkErr) {
        // log but don't fail creation
        console.warn("Failed to link categories:", linkErr);
      }
    }

    return NextResponse.json({ id: article.id, message: "Article created" });
  } catch (err) {
    console.error("POST /api/admin/blog/articles error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
