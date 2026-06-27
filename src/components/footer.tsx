import { Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme-context";
import { useMounted } from "@/lib/use-mounted";
import logoImg from "@/assets/logo.png.png";

const LINKS = {
  Explore: [
    { label: "All Articles", to: "/" },
    { label: "Premium", to: "/pricing" },
    { label: "Profile", to: "/profile" },
  ],
  Account: [
    { label: "Sign In", to: "/signin" },
    { label: "Sign Up", to: "/signin" },
  ],
};

export function Footer() {
  const { theme } = useTheme();
  const mounted = useMounted();
  const dk = mounted && theme === "dark";

  return (
    <footer className={`mt-auto border-t transition-colors duration-300 ${dk ? "border-white/8 bg-slate-900/80" : "border-slate-200 bg-white/80"}`}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <img
                src={logoImg}
                alt="Mahh Blog logo"
                className="h-10 w-10 object-contain transition-opacity group-hover:opacity-70"
              />
              <div>
                <span className={`block text-base font-bold tracking-tight ${dk ? "text-white" : "text-slate-900"}`}>
                  Mahh Blog
                </span>
                <span className={`block text-[11px] ${dk ? "text-slate-500" : "text-slate-500"}`}>
                  Mind · Body · Wellbeing
                </span>
              </div>
            </Link>
            <p className={`mt-4 max-w-xs text-sm leading-relaxed ${dk ? "text-slate-400" : "text-slate-500"}`}>
              Long-form essays and field notes on living well — mind, body, and everything in between.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${dk ? "text-slate-400" : "text-slate-500"}`}>
                {section}
              </p>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className={`text-sm transition-colors ${dk ? "text-slate-400 hover:text-sky-400" : "text-slate-600 hover:text-sky-600"}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row ${dk ? "border-white/8 text-slate-500" : "border-slate-200 text-slate-400"}`}>
          <span>© {new Date().getFullYear()} Mahh Blog. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className={`h-1 w-1 rounded-full ${dk ? "bg-sky-500" : "bg-sky-400"}`} />
            <span>Built with ❤️ for wellness</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
