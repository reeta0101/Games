import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar({
  currentUser,
  location,
  onToggleTheme,
  onLogout,
}) {
  const isActive = (path) => location.pathname === path;
  const initial = currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || "G";
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07101d]/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl pr-2"
          aria-label="Study Arcade home"
        >
          <span className="flex h-10 items-center rounded-xl border border-[#40e0f0]/30 bg-[#40e0f0]/10 px-3 text-xs font-black tracking-[0.32em] text-[#40e0f0] shadow-[0_0_20px_rgba(64,224,240,0.12)] transition-all duration-300 group-hover:border-[#40e0f0]/55 group-hover:shadow-[0_0_28px_rgba(64,224,240,0.22)]">
            STUDY
          </span>
          <span className="text-sm font-bold tracking-[0.14em] text-white/75 transition group-hover:text-white">
            arcade
          </span>
        </Link>

        <nav
          className="order-3 flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-1 sm:order-none sm:w-auto"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`touch-target inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 sm:flex-none ${
                  active
                    ? "bg-white/12 text-white shadow-[0_12px_30px_rgba(2,6,23,0.22)]"
                    : "text-slate-400 hover:bg-white/7 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="hidden items-center gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-400/8 px-3.5 py-2 text-sm text-slate-100 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-xs font-black text-emerald-200">
                {initial}
              </span>
              <span className="max-w-32 truncate">{currentUser.name}</span>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="touch-target inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/7 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="touch-target inline-flex items-center rounded-xl border border-[#40e0f0]/35 bg-[#40e0f0]/10 px-3.5 py-2 text-sm font-semibold text-[#40e0f0] transition hover:bg-[#40e0f0]/18"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={onToggleTheme}
            className="touch-target rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
            type="button"
            aria-label="Toggle color theme"
            title="Toggle color theme"
          >
            Theme
          </button>

          {currentUser ? (
            <button
              onClick={onLogout}
              className="touch-target rounded-xl border border-rose-300/15 bg-rose-500/8 px-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/14"
              type="button"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signup"
              className="touch-target inline-flex items-center rounded-xl border border-[#40e0f0]/35 bg-[#40e0f0]/10 px-3 text-sm font-semibold text-[#40e0f0] transition hover:bg-[#40e0f0]/18 sm:hidden"
            >
              Join
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
