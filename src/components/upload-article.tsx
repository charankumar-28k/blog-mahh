import { useState, useRef } from "react";
import { format } from "date-fns";
import { Upload, Loader2, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createArticle, type Category } from "@/lib/articles";
import { useTheme } from "@/lib/theme-context";
import { useMounted } from "@/lib/use-mounted";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES: { name: Category; color: string }[] = [
  { name: "Holistic Health", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { name: "Mental Health",   color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Nutrition",       color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Physical Health", color: "bg-red-100 text-red-700 border-red-200" },
  { name: "Self-help",       color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Wellness",        color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

interface Props { onUploaded: () => void; userId: string; }

export function UploadArticle({ onUploaded, userId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const mounted = useMounted();
  const dk = mounted && theme === "dark";

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "",
    category: CATEGORIES[0].name, iso: "",
    is_free: true, price: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("Please select an image.");
    if (!form.title || !form.excerpt || !form.iso) return setError("All fields are required.");
    if (!form.is_free && (!form.price || isNaN(Number(form.price)))) return setError("Enter a valid price.");

    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("articles").upload(path, file, { upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const { data: { publicUrl } } = supabase.storage.from("articles").getPublicUrl(path);

      await createArticle({
        data: {
          title: form.title, excerpt: form.excerpt, content: form.content,
          category: form.category,
          date: format(new Date(form.iso), "MMM d, yyyy"), iso: form.iso,
          image_url: publicUrl, user_id: userId,
          is_free: form.is_free,
          price: form.is_free ? null : Number(form.price),
        },
      });

      setOpen(false);
      setForm({ title: "", excerpt: "", content: "", category: CATEGORIES[0].name, iso: "", is_free: true, price: "" });
      setPreview(null);
      onUploaded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inp = `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${dk ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"}`;
  const lbl = `text-xs font-medium ${dk ? "text-slate-400" : "text-slate-600"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:from-sky-600 hover:to-blue-700">
          <Upload className="h-3.5 w-3.5" />
          Upload Article
        </button>
      </DialogTrigger>

      <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-y-auto ${dk ? "border-white/10 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
        <DialogHeader>
          <DialogTitle className={dk ? "text-white" : "text-slate-900"}>Upload Article</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Title</label>
            <input value={form.title} onChange={set("title")} placeholder="Article title" className={inp} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Excerpt</label>
            <textarea value={form.excerpt} onChange={set("excerpt")} rows={2} placeholder="Short description…" className={`${inp} resize-none`} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Full Content</label>
            <textarea value={form.content} onChange={set("content")} rows={6} placeholder="Write the full article content here…" className={`${inp} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Category</label>
              <select
                value={form.category}
                onChange={set("category")}
                className={`${inp} appearance-none`}
                style={{ backgroundColor: dk ? "#1e293b" : "white", color: dk ? "#f1f5f9" : "#0f172a" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name} style={{ backgroundColor: dk ? "#1e293b" : "white", color: dk ? "#f1f5f9" : "#0f172a" }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Date</label>
              <input type="date" value={form.iso} onChange={set("iso")} className={inp} />
            </div>
          </div>

          {/* Pricing toggle */}
          <div className={`rounded-xl border p-4 ${dk ? "border-white/10 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
            <p className={`text-xs font-semibold mb-3 ${dk ? "text-slate-300" : "text-slate-700"}`}>Article Pricing</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_free: true, price: "" }))}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  form.is_free
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : dk ? "border-white/10 text-slate-400 hover:border-emerald-500/40" : "border-slate-200 text-slate-600 hover:border-emerald-400"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_free: false }))}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  !form.is_free
                    ? "border-amber-500 bg-amber-500 text-white"
                    : dk ? "border-white/10 text-slate-400 hover:border-amber-500/40" : "border-slate-200 text-slate-600 hover:border-amber-400"
                }`}
              >
                Paid
              </button>
            </div>
            {!form.is_free && (
              <div className="mt-3 flex items-center gap-2">
                <DollarSign className={`h-4 w-4 shrink-0 ${dk ? "text-amber-400" : "text-amber-500"}`} />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                  placeholder="Set price (e.g. 4.99)"
                  className={inp}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Cover Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 transition-colors ${
                dk ? "border-white/20 bg-slate-800/30 hover:border-sky-500/50 hover:bg-slate-800/60" : "border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50"
              }`}
            >
              {preview ? (
                <img src={preview} className="h-32 w-full rounded-lg object-cover" alt="Preview" />
              ) : (
                <>
                  <Upload className={`h-6 w-6 ${dk ? "text-slate-500" : "text-slate-400"}`} />
                  <span className={`text-xs ${dk ? "text-slate-500" : "text-slate-500"}`}>Click to select cover image</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
          </div>

          {error && (
            <p className={`rounded-xl border px-3 py-2 text-xs ${dk ? "border-red-500/30 bg-red-900/20 text-red-400" : "border-red-200 bg-red-50 text-red-600"}`}>
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-1 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Article"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
