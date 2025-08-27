"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  tags: string[] | null;
}

export default function AdminBlogListPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/blog/articles");
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Blog", "Articles"]} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Blog Articles</h1>
            <Link href="/blog/new">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Card key={a.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-gray-900 line-clamp-2">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{a.excerpt || "No excerpt"}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-wrap gap-2">
                      {a.tags?.slice(0,3).map((t) => (
                        <Badge key={t} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">{t}</Badge>
                      ))}
                    </div>
                    <span className="text-gray-500">{a.status}</span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {a.published_at ? `Published ${new Date(a.published_at).toLocaleDateString()}` : `Created ${new Date(a.created_at).toLocaleDateString()}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && articles.length === 0 && (
            <Card className="mt-10">
              <CardContent className="p-10 text-center text-gray-600">
                No articles yet. Click "New Article" to create your first post.
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
