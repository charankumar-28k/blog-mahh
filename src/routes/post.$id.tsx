import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Trash2, Pencil, ArrowLeft, Loader2, Send, X, Check, Plus } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useTheme } from "@/lib/theme-context";
import { useMounted } from "@/lib/use-mounted";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { fetchArticle, updateArticle, deleteArticle, type Article, type Comment } from "@/lib/articles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/post/$id")({
  head: () => ({ meta: [{ title: "Article — Mahh Blog" }] }),
  component: PostPage,
});

const CATEGORIES = ["Holistic Health", "Mental Health", "Nutrition", "Physical Health", "Self-help", "Wellness"];

const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  "Holistic Health": { light: "bg-emerald-100 text-emerald-700 border-emerald-200", dark: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "Mental Health":   { light: "bg-blue-100 text-blue-700 border-blue-200",           dark: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "Nutrition":       { light: "bg-orange-100 text-orange-700 border-orange-200",     dark: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "Physical Health": { light: "bg-red-100 text-red-700 border-red-200",               dark: "bg-red-500/20 text-red-400 border-red-500/30" },
  "Self-help":       { light: "bg-purple-100 text-purple-700 border-purple-200",     dark: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  "Wellness":        { light: "bg-cyan-100 text-cyan-700 border-cyan-200",           dark: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
};

function PostPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const mounted = useMounted();
  const navigate = useNavigate();
  const dk = mounted && theme === "dark";

  const [article, setArticle] = useState<Article | null>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", excerpt: "", content: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function load() {
      const a = await fetchArticle({ data: { id } });
      setArticle(a);
      setEditForm({ title: a.title, excerpt: a.excerpt, content: a.content ?? "", category: a.category });
      setLikes(a.likes_count ?? 0);
      setLiked((a.liked_by ?? []).includes(String(user?.id ?? "")));
      setComments(a.comments ?? []);
    }
    load();
  }, [id, user?.id]);

  async function handleLike() {
    if (!user) return navigate({ to: "/signin" });
    if (likeLoading || !article) return;
    setLikeLoading(true);

    const uid = String(user.id);
    const wasLiked = liked;
    const currentLikedBy: string[] = article.liked_by ?? [];

    // Optimistic UI update
    const newLikedBy = wasLiked
      ? currentLikedBy.filter((u) => u !== uid)
      : [...currentLikedBy, uid];
    const newCount = newLikedBy.length;

    setLiked(!wasLiked);
    setLikes(newCount);
    setArticle((a) => a ? { ...a, liked_by: newLikedBy, likes_count: newCount } : a);

    // Persist directly to articles row
    const { error } = await supabase
      .from("articles")
      .update({ liked_by: newLikedBy, likes_count: newCount })
      .eq("id", id);

    if (error) {
      // Rollback
      setLiked(wasLiked);
      setLikes(article.likes_count);
      setArticle((a) => a ? { ...a, liked_by: currentLikedBy, likes_count: article.likes_count } : a);
    }

    setLikeLoading(false);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentText.trim() || !article) return;
    const name = (user as any).name || user.email || "Anonymous";
    const text = commentText.trim();

    const newComment: Comment = {
      id: crypto.randomUUID(),
      user_id: String(user.id),
      author_name: name,
      content: text,
      created_at: new Date().toISOString(),
    };

    const newComments = [...(article.comments ?? []), newComment];

    // Optimistic update
    setComments(newComments);
    setCommentText("");
    setArticle((a) => a ? { ...a, comments: newComments } : a);

    // Persist entire comments array to articles row
    const { error } = await supabase
      .from("articles")
      .update({ comments: newComments })
      .eq("id", id);

    if (error) {
      // Rollback
      setComments(article.comments ?? []);
      setArticle((a) => a ? { ...a, comments: article.comments } : a);
      setCommentText(text);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!article) return;
    const newComments = (article.comments ?? []).filter((c) => c.id !== commentId);
    setComments(newComments);
    setArticle((a) => a ? { ...a, comments: newComments } : a);
    await supabase.from("articles").update({ comments: newComments }).eq("id", id);
  }

  async function handleSaveEdit() {
    if (!article) return;
    setSaving(true);
    await updateArticle({ data: { id: article.id, ...editForm } });
    setEditing(false);
    const a = await fetchArticle({ data: { id } });
    setArticle(a);
    setSaving(false);
  }

  async function handleDelete() {
    if (!article || !confirm("Delete this article?")) return;
    setDeleting(true);
    await deleteArticle({ data: { id: article.id } });
    navigate({ to: "/" });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `additional/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("articles").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("articles").getPublicUrl(path);
      setAdditionalImages((prev) => [...prev, publicUrl]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  }

  if (!article) return (
    <div className={`flex min-h-screen items-center justify-center ${dk ? "bg-slate-950" : "bg-gradient-to-br from-sky-50 to-white"}`}>
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  );

  const isOwner = String(user?.id) === String(article.user_id);
  const catColor = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS["Wellness"];

  const inp = `resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${dk ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"}`;

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 ${dk ? "bg-slate-950" : "bg-gradient-to-br from-sky-50 to-white"}`}>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32">
        <Link to="/" className={`inline-flex items-center gap-2 text-sm transition-colors ${dk ? "text-slate-400 hover:text-sky-400" : "text-slate-500 hover:text-sky-600"}`}>
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>

        {/* Hero image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 overflow-hidden rounded-3xl">
          {article.image_url ? (
            <img src={article.image_url} alt={article.title}
              className="h-56 w-full object-cover sm:h-96"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=640&fit=crop&q=80"; }} />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100 sm:h-96">
              <span className="text-6xl font-bold text-sky-600">{article.title[0]}</span>
            </div>
          )}
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] ring-1 ring-inset ${dk ? catColor.dark : catColor.light}`}>
                {article.category}
              </span>
              <span className={`text-xs ${dk ? "text-slate-500" : "text-slate-500"}`}>{article.date}</span>
            </div>
            {isOwner && !editing && (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(true)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-colors ${dk ? "border-white/10 text-slate-400 hover:border-sky-500/30 hover:text-sky-400" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600"}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-100">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className={`mt-4 flex flex-col gap-4 rounded-2xl border p-6 ${dk ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title" className={`${inp} text-xl font-bold`} />
              <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className={inp} style={{ backgroundColor: dk ? "#1e293b" : "white", color: dk ? "#f1f5f9" : "#0f172a" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea value={editForm.excerpt} onChange={(e) => setEditForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2} placeholder="Excerpt" className={inp} />
              <textarea value={editForm.content} onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                rows={10} placeholder="Full article content…" className={inp} />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={saving} className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Save</>}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}
                  className={dk ? "border-white/10 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className={`mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-4xl ${dk ? "text-white" : "text-slate-900"}`}>
                {article.title}
              </h1>
              <p className={`mt-4 text-lg leading-relaxed ${dk ? "text-slate-300" : "text-slate-700"}`}>{article.excerpt}</p>
              {article.content && (
                <div className={`mt-8 text-base leading-relaxed whitespace-pre-wrap ${dk ? "text-slate-400" : "text-slate-600"}`}>
                  {article.content}
                </div>
              )}
              {(additionalImages.length > 0 || isOwner) && (
                <div className="mt-8">
                  <h3 className={`mb-4 text-lg font-semibold ${dk ? "text-white" : "text-slate-900"}`}>Gallery</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {additionalImages.map((img, i) => (
                      <img key={i} src={img} alt={`Gallery ${i + 1}`} className="aspect-video rounded-2xl object-cover" />
                    ))}
                    {isOwner && (
                      <div className="relative">
                        <input type="file" accept="image/*" onChange={handleImageUpload}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                        <div className={`flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${dk ? "border-white/20 bg-slate-800/50 hover:border-sky-500/50" : "border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50"}`}>
                          {uploadingImage ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : <>
                            <Plus className={`h-6 w-6 ${dk ? "text-slate-500" : "text-slate-400"}`} />
                            <span className={`text-xs ${dk ? "text-slate-500" : "text-slate-500"}`}>Add Image</span>
                          </>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Like & comment count bar */}
        <div className={`mt-10 flex items-center gap-6 border-t pt-6 ${dk ? "border-white/10" : "border-slate-200"}`}>
          <button onClick={handleLike} disabled={likeLoading}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              liked
                ? "border-red-300 bg-red-100 text-red-600"
                : dk
                  ? "border-white/10 bg-slate-800 text-slate-400 hover:border-red-400/40 hover:text-red-400"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600"
            }`}>
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            {likes} {likes === 1 ? "Like" : "Likes"}
          </button>
          <span className={`flex items-center gap-2 text-sm ${dk ? "text-slate-500" : "text-slate-500"}`}>
            <MessageCircle className="h-4 w-4" /> {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </span>
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h2 className={`mb-4 text-lg font-semibold ${dk ? "text-white" : "text-slate-900"}`}>Comments</h2>

          {user ? (
            <form onSubmit={handleComment} className="mb-6 flex gap-3">
              <Input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (commentText.trim()) handleComment(e as any); } }}
                className={dk ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"} />
              <Button type="submit" disabled={!commentText.trim()}
                className="shrink-0 bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className={`mb-6 rounded-2xl border p-4 text-center text-sm ${dk ? "border-white/10 bg-slate-800/50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
              <Link to="/signin" className="text-sky-500 hover:text-sky-400">Sign in</Link> to leave a comment
            </div>
          )}

          {comments.length === 0 ? (
            <p className={`text-sm ${dk ? "text-slate-500" : "text-slate-500"}`}>No comments yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className={`rounded-2xl border p-4 ${dk ? "border-white/8 bg-slate-900/60" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-bold text-white">
                        {c.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${dk ? "text-white" : "text-slate-900"}`}>{c.author_name}</p>
                        <p className={`text-[11px] ${dk ? "text-slate-500" : "text-slate-500"}`}>{new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {(String(user?.id) === c.user_id || isOwner) && (
                      <button onClick={() => handleDeleteComment(c.id)}
                        className={`transition-colors ${dk ? "text-slate-600 hover:text-red-400" : "text-slate-300 hover:text-red-500"}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className={`mt-3 text-sm leading-relaxed ${dk ? "text-slate-300" : "text-slate-700"}`}>{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
