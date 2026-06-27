import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — Lumen Journal" }] }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      navigate({ to: "/" });
    } catch (err: unknown) {
      console.error("Full error object:", err);
      console.error("Error type:", typeof err);
      console.error("Error stringified:", JSON.stringify(err, null, 2));
      
      let msg = "Something went wrong. Please try again.";
      if (err instanceof Error && err.message) {
        msg = err.message;
      } else if (typeof err === "string" && err) {
        msg = err;
      } else if (err && typeof err === "object" && "message" in err) {
        const errMsg = (err as { message: unknown }).message;
        if (typeof errMsg === "string" && errMsg && errMsg !== "{}") {
          msg = errMsg;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/30 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-blue-200/30 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative w-full max-w-md rounded-3xl p-8"
      >
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Lumen<span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">.</span>
          </span>
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {mode === "signin" ? "Sign in to your account" : "Join Lumen Journal today"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-600">Full name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-600">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-600">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="text-sky-600 transition-colors hover:text-sky-700"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
