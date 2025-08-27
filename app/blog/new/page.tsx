"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, Save, Eye, EyeOff, Image as ImageIcon, Tag, Calendar, Clock, Eye as ViewsIcon, Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Code, Minus } from "lucide-react";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminBlogEditorPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [contentHtml, setContentHtml] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!title) return;
    setSlug((prev) => (prev ? prev : slugify(title)));
  }, [title]);

  const tagArray = useMemo(() => tags.split(",").map(t => t.trim()).filter(Boolean), [tags]);

  const updatePreview = () => setContentHtml(editorRef.current?.innerHTML || "");

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const html = editorRef.current?.innerHTML || "";
      if (!title || !slug || !html) {
        setError("Title, slug and content are required");
        setSaving(false);
        return;
      }
      const res = await fetch("/api/admin/blog/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content: html,
          featured_image: featuredImage || null,
          status,
          tags: tagArray,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save article");
      } else {
        setSuccess("Article saved successfully");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const ensureSelection = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
          // If no text is selected, insert a placeholder
          const placeholder = document.createTextNode(' ');
          range.insertNode(placeholder);
          range.setStartAfter(placeholder);
          range.setEndAfter(placeholder);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  const exec = (command: string, value?: string) => {
    ensureSelection();
    document.execCommand(command, false, value);
    updatePreview();
  };

  const formatBlock = (block: string) => {
    ensureSelection();
    document.execCommand("formatBlock", false, block);
    updatePreview();
  };

  const insertHTML = (html: string) => {
    ensureSelection();
    document.execCommand("insertHTML", false, html);
    updatePreview();
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    exec("createLink", url);
  };

  const insertHr = () => {
    insertHTML("<hr />");
  };

  const insertImageContainer = (url: string, alt = "Image") => {
    const html = `<div class="aspect-video bg-zinc-700 rounded-xl my-4 overflow-hidden"><img src="${url}" alt="${alt}" class="w-full h-full object-cover"/></div>`;
    insertHTML(html);
  };

  const insertImageUrl = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    insertImageContainer(url);
  };

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setUploadingImage(true);
    try {
      const res = await fetch("/api/admin/blog/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url as string;
    } finally {
      setUploadingImage(false);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      insertImageContainer(url, file.name);
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      e.currentTarget.value = "";
    }
  };

  const handleToolbarClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Blog", "New"]} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Write a new blog article</h1>
              <p className="text-gray-600 mt-1">Compose, format, preview, and publish directly to AgentDrop.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowPreview(v => !v)} className="border-gray-300">
                {showPreview ? <EyeOff className="w-4 h-4 mr-2"/> : <Eye className="w-4 h-4 mr-2"/>}
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gray-800 hover:bg-gray-700 text-white">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                Save Article
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-700">Title</Label>
                    <Input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 border-gray-300" placeholder="Article title"/>
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-gray-700">Slug</Label>
                    <Input id="slug" value={slug} onChange={(e)=>setSlug(slugify(e.target.value))} className="mt-1 border-gray-300" placeholder="my-article-slug"/>
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-gray-700">Excerpt</Label>
                  <textarea id="excerpt" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} rows={3} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Short summary displayed on listings"/>
                </div>

                <div>
                  <Label htmlFor="featured" className="text-gray-700">Featured Image URL</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="featured" value={featuredImage} onChange={(e)=>setFeaturedImage(e.target.value)} className="mt-1 border-gray-300" placeholder="https://..."/>
                    <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer">
                      {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin"/> : <ImageIcon className="w-5 h-5"/>}
                      <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                    </label>
                  </div>
                </div>

                {/* Formatting toolbar */}
                <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md p-2 bg-white">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => formatBlock("H1"))} 
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => formatBlock("H2"))} 
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => exec("bold"))} 
                    title="Bold"
                  >
                    <Bold className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => exec("italic"))} 
                    title="Italic"
                  >
                    <Italic className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => exec("underline"))} 
                    title="Underline"
                  >
                    <Underline className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => exec("insertUnorderedList"))} 
                    title="Bullet List"
                  >
                    <List className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => exec("insertOrderedList"))} 
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => formatBlock("BLOCKQUOTE"))} 
                    title="Quote"
                  >
                    <Quote className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, insertLink)} 
                    title="Link"
                  >
                    <LinkIcon className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, () => formatBlock("PRE"))} 
                    title="Code Block"
                  >
                    <Code className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, insertHr)} 
                    title="Horizontal Rule"
                  >
                    <Minus className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300" 
                    onClick={(e) => handleToolbarClick(e, insertImageUrl)} 
                    title="Insert Image by URL"
                  >
                    <ImageIcon className="w-4 h-4"/>
                  </Button>
                </div>

                {/* Editable content */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[360px] border border-gray-300 rounded-md p-3 bg-white focus:outline-none"
                  onInput={updatePreview}
                  suppressContentEditableWarning
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags" className="text-gray-700">Tags (comma separated)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="tags" value={tags} onChange={(e)=>setTags(e.target.value)} className="mt-1 border-gray-300" placeholder="ai, agents, automation"/>
                    </div>
                    {/* Debug info */}
                    <div className="mt-1 text-xs text-gray-500">
                      Raw tags: "{tags}" | Parsed: {tagArray.length} tags
                    </div>
                    {/* Tags display with better styling */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagArray.length > 0 ? (
                        tagArray.map((t) => (
                          <span 
                            key={t} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">No tags added yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-gray-700">Status</Label>
                    <select id="status" value={status} onChange={(e)=>setStatus(e.target.value as any)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview cloned from public blog article UI */}
            {showPreview && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-full bg-zinc-900 text-white">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tagArray.map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 px-2.5 py-0.5 text-xs font-semibold">{tag}</span>
                      ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{title || "Untitled"}</h1>
                    {excerpt && (
                      <p className="text-xl text-zinc-300 mb-6 leading-relaxed">{excerpt}</p>
                    )}
                    {featuredImage && (
                      <div className="aspect-video bg-zinc-700 rounded-xl mb-6 overflow-hidden">
                        <img src={featuredImage} alt="Featured" className="w-full h-full object-cover"/>
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-sm text-zinc-500 mb-6">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4"/>Just now</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4"/>~5 min read</div>
                      <div className="flex items-center gap-1"><ViewsIcon className="w-4 h-4"/>0 views</div>
                    </div>
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="text-[#eaeaea] leading-7" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
