import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, RotateCcw, Heart, MessageCircle, DollarSign } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTheme } from "@/lib/theme-context";
import { useMounted } from "@/lib/use-mounted";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { fetchArticles, type Article, type Category } from "@/lib/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Articles — Lumen Journal" },
      { name: "description", content: "Essays on mindfulness, nutrition, movement, and integrative wellbeing." },
    ],
  }),
  component: Articles,
});

const CATEGORY_COLORS: Record<Category, { light: string; dark: string }> = {
  "Holistic Health": { light: "bg-emerald-100 text-emerald-700 border-emerald-200", dark: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "Mental Health":   { light: "bg-blue-100 text-blue-700 border-blue-200",           dark: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "Nutrition":       { light: "bg-orange-100 text-orange-700 border-orange-200",     dark: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "Physical Health": { light: "bg-red-100 text-red-700 border-red-200",               dark: "bg-red-500/20 text-red-400 border-red-500/30" },
  "Self-help":       { light: "bg-purple-100 text-purple-700 border-purple-200",     dark: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  "Wellness":        { light: "bg-cyan-100 text-cyan-700 border-cyan-200",           dark: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
};

const CATEGORIES: Category[] = ["Holistic Health", "Mental Health", "Nutrition", "Physical Health", "Self-help", "Wellness"];
type Sort = "Newest" | "Oldest" | "A → Z";
const SORTS: Sort[] = ["Newest", "Oldest", "A → Z"];

function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [sort, setSort] = useState<Sort>("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const { theme } = useTheme();
  const mounted = useMounted();
  const dk = mounted && theme === "dark";

  const load = useCallback(async () => {
    const data = await fetchArticles();
    setArticles(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const filtered = active.size === 0 ? articles : articles.filter((a) => active.has(a.category));
    const sorted = [...filtered];
    if (sort === "Newest") sorted.sort((a, b) => b.iso.localeCompare(a.iso));
    if (sort === "Oldest") sorted.sort((a, b) => a.iso.localeCompare(b.iso));
    if (sort === "A → Z") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [articles, active, sort]);

  const toggle = (c: Category) => {
    const next = new Set(active);
    next.has(c) ? next.delete(c) : next.add(c);
    setActive(next);
  };

  return (
    <div className={`flex min-h-screen flex-col overflow-x-hidden transition-colors duration-300 ${dk ? "bg-slate-950" : "bg-gradient-to-br from-sky-50 to-white"}`}>
      <Navbar />
      <main className="relative flex-1 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] ${dk ? "text-sky-400" : "text-sky-600"}`}
          >
            <span className={`h-px w-8 ${dk ? "bg-sky-500" : "bg-sky-400"}`} />
            Journal
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className={`mt-4 font-semibold leading-[0.95] tracking-tight ${dk ? "text-white" : "text-slate-900"}`}
            style={{ fontSize: "clamp(3.5rem, 11vw, 9rem)" }}
          >
            <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 bg-clip-text text-transparent">Articles</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className={`mt-4 max-w-2xl ${dk ? "text-slate-400" : "text-slate-600"}`}
          >
            Long-form essays and field notes on living well — mind, body, and everything in between.
          </motion.p>
        </section>

        {/* Toolbar */}
        <section className="sticky top-16 z-30 mt-8 sm:mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-3"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActive(new Set())}
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-all duration-300 hover:rotate-[-30deg] ${dk ? "text-slate-400 hover:text-sky-400" : "text-slate-500 hover:text-sky-600"}`}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                {CATEGORIES.map((c) => {
                  const on = active.has(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggle(c)}
                      className={[
                        "relative rounded-xl px-3.5 py-1.5 text-xs font-medium tracking-tight transition-all duration-300",
                        on
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                          : dk
                            ? "text-slate-400 ring-1 ring-inset ring-white/10 hover:text-sky-400 hover:ring-sky-500/30"
                            : "text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-sky-600 hover:ring-sky-300",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setSortOpen(false), 120)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs transition-colors ${dk ? "border-white/10 bg-slate-800/60 text-slate-400 hover:text-sky-400" : "border-slate-200 bg-white/80 text-slate-600 hover:text-sky-600"}`}
                >
                  Sort: <span className={dk ? "text-white" : "text-slate-900"}>{sort}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className={`absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border p-1 text-xs backdrop-blur-xl shadow-lg ${dk ? "border-white/10 bg-slate-800/95" : "border-slate-200 bg-white/95"}`}
                  >
                    {SORTS.map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => { setSort(s); setSortOpen(false); }}
                        className={`block w-full rounded-lg px-3 py-2 text-left transition-colors ${
                          s === sort
                            ? dk ? "bg-sky-500/20 text-sky-400" : "bg-sky-100 text-sky-700"
                            : dk ? "text-slate-400 hover:bg-slate-700 hover:text-white" : "text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Grid — ALL articles */}
        <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 sm:mt-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
          {visible.length === 0 && (
            <div className={`glass mt-12 rounded-3xl p-16 text-center ${dk ? "text-slate-400" : "text-slate-600"}`}>
              No articles match the selected filters.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { theme } = useTheme();
  const mounted = useMounted();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dk = mounted && theme === "dark";
  const catColors = CATEGORY_COLORS[article.category];
  const isPaid = article.is_free === false && article.price;

  const [likes, setLikes] = useState(article.likes_count ?? 0);
  const [liked, setLiked] = useState((article.liked_by ?? []).includes(String(user?.id ?? "")));
  const [showHeart, setShowHeart] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCount = useRef(0);

  // Sync if article prop changes
  useEffect(() => {
    setLikes(article.likes_count ?? 0);
    setLiked((article.liked_by ?? []).includes(String(user?.id ?? "")));
  }, [article.likes_count, article.liked_by, user?.id]);

  async function doLike() {
    if (!user) return navigate({ to: "/signin" });
    const uid = String(user.id);
    const currentLikedBy: string[] = article.liked_by ?? [];
    const wasLiked = currentLikedBy.includes(uid);
    if (wasLiked) return; // double-tap only adds likes, not toggles

    const newLikedBy = [...currentLikedBy, uid];
    const newCount = newLikedBy.length;
    setLiked(true);
    setLikes(newCount);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);

    await supabase
      .from("articles")
      .update({ liked_by: newLikedBy, likes_count: newCount })
      .eq("id", article.id);
  }

  function handleImageTap() {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      if (tapCount.current >= 2) doLike();
      tapCount.current = 0;
    }, 300);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 ${
        dk
          ? "bg-slate-900/80 border border-white/[0.06] hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-900/30"
          : "glass hover:shadow-lg hover:shadow-sky-200/50"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={handleImageTap}>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop&q=80";
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
            <span className="text-sky-600 text-4xl font-bold">{article.title[0]}</span>
          </div>
        )}
        {/* Double-tap heart animation */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <Heart className="h-20 w-20 fill-red-500 text-red-500 drop-shadow-xl" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          {isPaid ? (
            <span className="flex items-center gap-0.5 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
              <DollarSign className="h-3 w-3" />{article.price}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">Free</span>
          )}
        </div>
        <div aria-hidden className="pointer-events-none absolute -inset-y-10 -left-1/2 h-[200%] w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3">
          <span className={`rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] ring-1 ring-inset ${dk ? catColors.dark : catColors.light}`}>
            {article.category}
          </span>
          <span className={`text-[11px] ${dk ? "text-slate-500" : "text-slate-500"}`}>{article.date}</span>
        </div>
        <h3 className={`text-lg font-semibold leading-snug tracking-tight ${dk ? "text-white" : "text-slate-900"}`}>
          <Link
            to="/post/$id"
            params={{ id: article.id }}
            className="bg-[length:0%_1px] bg-gradient-to-r from-sky-500 to-blue-500 bg-no-repeat bg-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]"
          >
            {article.title}
          </Link>
        </h3>
        <p className={`text-sm leading-relaxed ${dk ? "text-slate-400" : "text-slate-600"}`}>{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <Link
            to="/post/$id"
            params={{ id: article.id }}
            className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${dk ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-800"}`}
          >
            Read article <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <div className={`flex items-center gap-3 text-xs ${dk ? "text-slate-500" : "text-slate-400"}`}>
            <span className="flex items-center gap-1">
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`} />{likes}
            </span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{(article.comments ?? []).length}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
