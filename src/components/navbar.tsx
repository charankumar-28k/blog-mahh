import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, LogOut, User, BookOpen, Moon, Sun, Tag, Menu, X as XIcon } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { signOut } from "@/lib/auth";
import logoImg from "@/assets/logo.png.png";

const navLinks = [
  { label: "Articles", to: "/", icon: BookOpen },
  { label: "Profile", to: "/profile", icon: User },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  // Only use theme after client mount to prevent hydration mismatch
  const dk = mounted && theme === "dark";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) setFeaturesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    setUserOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate({ to: "/" });
  }

  const name = user ? ((user.user_metadata?.full_name as string) || user.email || "User") : "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const navBg = scrolled
    ? dk ? "bg-slate-900/95 backdrop-blur-xl shadow-sm border-b border-white/10"
         : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-sky-100"
    : dk ? "bg-slate-900/70 backdrop-blur-md"
         : "bg-white/80 backdrop-blur-md";

  const navText = dk
    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
    : "text-slate-600 hover:bg-sky-50 hover:text-sky-700";

  const dropdownBg = dk ? "border-white/10 bg-slate-800/95" : "border-sky-100 bg-white/95";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5 shrink-0">
          <img
            src={logoImg}
            alt="Mahh Blog logo"
            className="h-9 w-9 object-contain transition-opacity group-hover:opacity-70"
          />
          <span
            className={`font-bold tracking-tight ${dk ? "text-white" : "text-slate-900"}`}
            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem" }}
          >
            Mahh Blog
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <div ref={featuresRef} className="relative">
            <button
              onClick={() => setFeaturesOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${navText}`}
            >
              Features
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {featuresOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute left-0 mt-1 w-44 overflow-hidden rounded-xl border backdrop-blur-xl p-1 shadow-lg ${dropdownBg}`}
                >
                  {navLinks.map(({ label, to, icon: Icon }) => (
                    <Link key={label} to={to} onClick={() => setFeaturesOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${navText}`}>
                      <Icon className="h-4 w-4 text-sky-500" />
                      {label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/pricing"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${navText}`}>
            <Tag className="h-3.5 w-3.5 text-amber-500" />
            Premium
          </Link>

          <Link to="/"
            activeProps={{ className: dk ? "!text-sky-400 font-semibold" : "!text-sky-600 font-semibold" }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${navText}`}>
            Blog
          </Link>

          <span className={`mx-1 select-none ${dk ? "text-slate-600" : "text-sky-300"}`}>✦</span>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle} aria-label="Toggle theme"
            className={`grid h-9 w-9 place-items-center rounded-xl border transition-all duration-200 ${
              dk ? "border-white/10 bg-slate-800 text-yellow-400 hover:bg-slate-700"
                 : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600"
            }`}>
            {dk ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div ref={userRef} className="relative">
              <button onClick={() => setUserOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-all ${
                  dk ? "border-white/10 bg-slate-800 text-slate-300 hover:border-sky-500/40"
                     : "border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:shadow-md"
                }`}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-[10px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[80px] truncate text-xs sm:block">{name}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${userOpen ? "rotate-180" : ""} ${dk ? "text-slate-400" : "text-slate-400"}`} />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-1 w-44 overflow-hidden rounded-xl border backdrop-blur-xl p-1 shadow-lg ${dropdownBg}`}
                  >
                    <Link to="/profile" onClick={() => setUserOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${navText}`}>
                      <User className="h-4 w-4 text-sky-500" /> Profile
                    </Link>
                    <button onClick={handleSignOut}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors ${dk ? "hover:bg-red-900/20" : "hover:bg-red-50"}`}>
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/signin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-sky-600 hover:to-blue-700">
              Sign up free
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen((v) => !v)}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition-all md:hidden ${
              dk ? "border-white/10 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-700"
            }`}>
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden border-t md:hidden ${dk ? "border-white/8 bg-slate-900" : "border-slate-100 bg-white"}`}
          >
            <nav className="flex flex-col gap-1 px-4 py-3">
              <Link to="/" onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${navText}`}>
                <BookOpen className="h-4 w-4 text-sky-500" /> Articles
              </Link>
              <Link to="/pricing" onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${navText}`}>
                <Tag className="h-4 w-4 text-amber-500" /> Premium
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${navText}`}>
                <User className="h-4 w-4 text-sky-500" /> Profile
              </Link>
              {!user ? (
                <Link to="/signin" onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                  Sign up free
                </Link>
              ) : (
                <button onClick={handleSignOut}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors ${dk ? "hover:bg-red-900/20" : "hover:bg-red-50"}`}>
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading progress bar */}
      <div className="relative h-[2px] w-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-blue-500 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.header>
  );
}
