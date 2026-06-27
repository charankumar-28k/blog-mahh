import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { LogOut, ExternalLink, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { fetchArticles, deleteArticle, type Article } from "@/lib/articles";
import { UploadArticle } from "@/components/upload-article";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Lumen Journal" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);

  const load = useCallback(async () => {
    const data = await fetchArticles();
    setArticles(data);
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/signin" });
  }, [user, loading, navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading || !user) return null;

  const name = (user.user_metadata?.full_name as string) || user.email || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const myArticles = articles.filter((a) => a.user_id === user.id);

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await deleteArticle({ data: { id } });
    load();
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-50 to-white">
      <div className="absolute inset-0 bg-white/50" />
      <Navbar />

      <main className="relative mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass flex items-center justify-between gap-6 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-xl font-bold text-white shadow-lg">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
              <p className="mt-1 text-xs text-slate-500">{myArticles.length} article{myArticles.length !== 1 ? "s" : ""} published</p>
            </div>
          </div>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 transition-colors hover:border-red-300 hover:bg-red-100">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </motion.div>

        {/* Publish section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-6 glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Publish an Article</h2>
              <p className="mt-0.5 text-sm text-slate-600">Add a new article to the journal</p>
            </div>
            <UploadArticle onUploaded={load} userId={user.id} />
          </div>
        </motion.div>

        {/* My articles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-6 glass rounded-3xl p-6">
          <h2 className="mb-4 font-semibold text-slate-900">My Articles ({myArticles.length})</h2>
          {myArticles.length === 0 ? (
            <p className="text-sm text-slate-500">You haven't published any articles yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myArticles.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-sky-200 transition-colors">
                  {a.image_url ? (
                    <img 
                      src={a.image_url} 
                      alt={a.title} 
                      className="h-14 w-20 shrink-0 rounded-xl object-cover" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=56&fit=crop&q=80`;
                      }}
                    />
                  ) : (
                    <div className="h-14 w-20 shrink-0 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                      <span className="text-sky-600 font-semibold text-sm">{a.title[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-sky-600">{a.category}</span>
                      <span className="text-[10px] text-slate-400">{a.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to="/post/$id" params={{ id: a.id }}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-sky-300 hover:text-sky-600">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => handleDelete(a.id)}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-300 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-sky-600 transition-colors hover:text-sky-800">← Back to articles</Link>
        </div>
      </main>
    </div>
  );
}
