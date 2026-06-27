import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { DollarSign, Heart, MessageCircle, Tag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useTheme } from "@/lib/theme-context";
import { useMounted } from "@/lib/use-mounted";
import { fetchPaidArticles, type Article, type Category } from "@/lib/articles";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Premium Articles — Lumen Journal" }] }),
  component: PricingPage,
});

const CATEGORY_COLORS: Record<Category, { light: string; dark: string }> = {
  "Holistic Health": { light: "bg-emerald-100 text-emerald-700 border-emerald-200", dark: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "Mental Health":   { light: "bg-blue-100 text-blue-700 border-blue-200",           dark: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "Nutrition":       { light: "bg-orange-100 text-orange-700 border-orange-200",     dark: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "Physical Health": { light: "bg-red-100 text-red-700 border-red-200",               dark: "bg-red-500/20 text-red-400 border-red-500/30" },
  "Self-help":       { light: "bg-purple-100 text-purple-700 border-purple-200",     dark: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  "Wellness":        { light: "bg-cyan-100 text-cyan-700 border-cyan-200",           dark: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
};

function PricingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const { theme } = useTheme();
  const mounted = useMounted();
  const dk = mounted && theme === "dark";

  useEffect(() => {
    fetchPaidArticles().then(setArticles);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${dk ? "bg-slate-950" : "bg-gradient-to-br from-amber-50 via-white to-sky-50"}`}>
      <Navbar />
      <main className="relative pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-amber-500"
          >
            <Tag className="h-3.5 w-3.5" />
            Premium
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className={`mt-4 font-semibold leading-[0.95] tracking-tight ${dk ? "text-white" : "text-slate-900"}`}
            style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
          >
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">Premium</span>{" "}
            <span className={dk ? "text-white" : "text-slate-900"}>Articles</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className={`mt-4 max-w-2xl ${dk ? "text-slate-400" : "text-slate-600"}`}
          >
            Exclusive in-depth content available for purchase. Invest in your knowledge.
          </motion.p>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-6">
          {articles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`rounded-3xl border p-20 text-center ${dk ? "border-white/10 bg-slate-900/60" : "border-amber-100 bg-white/80"}`}
            >
              <Tag className={`mx-auto h-12 w-12 mb-4 ${dk ? "text-amber-400" : "text-amber-400"}`} />
              <p className={`text-lg font-semibold ${dk ? "text-white" : "text-slate-900"}`}>No premium articles yet</p>
              <p className={`mt-2 text-sm ${dk ? "text-slate-400" : "text-slate-600"}`}>Check back soon — premium content is coming.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <PremiumCard key={a.id} article={a} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function PremiumCard({ article, index }: { article: Article; index: number }) {
  const { theme } = useTheme();
  const mounted = useMounted();
  const dk = mounted && theme === "dark";
  const catColors = CATEGORY_COLORS[article.category];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 ${
        dk
          ? "bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-900/20"
          : "bg-white border border-amber-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100"
      }`}
    >
      {/* Premium ribbon */}
      <div className="absolute top-3 left-3 z-10">
        <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
          <DollarSign className="h-3 w-3" /> ${article.price}
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=640&fit=crop&q=80"; }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <span className="text-amber-600 text-4xl font-bold">{article.title[0]}</span>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-y-10 -left-1/2 h-[200%] w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
        />
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
            className="bg-[length:0%_1px] bg-gradient-to-r from-amber-500 to-orange-500 bg-no-repeat bg-bottom transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]"
          >
            {article.title}
          </Link>
        </h3>
        <p className={`text-sm leading-relaxed ${dk ? "text-slate-400" : "text-slate-600"}`}>{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <Link
            to="/post/$id"
            params={{ id: article.id }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600"
          >
            Get Access →
          </Link>
          <div className={`flex items-center gap-3 text-xs ${dk ? "text-slate-500" : "text-slate-400"}`}>
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{article.likes_count ?? 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{article.comments_count ?? 0}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
