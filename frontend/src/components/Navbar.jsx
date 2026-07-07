import { Link } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "alphabet",
    path: "/alphabet",
    title: "Alphabet Quiz",
    accent: "#f0e040",
  },
  {
    id: "square",
    path: "/square",
    title: "Square Quiz",
    accent: "#40e0f0",
  },
  {
    id: "periodicTable",
    path: "/periodic-table",
    title: "Periodic Table",
    accent: "#f59e0b",
  },
  {
    id: "stateCapital",
    path: "/state-capital",
    title: "State Capital Quiz",
    accent: "#fb7185",
  },
  {
    id: "football",
    path: "/football",
    title: "Football",
    accent: "#39ff14",
  },
  {
    id: "leaderboard",
    path: "/leaderboard",
    title: "🏆 Leaderboard",
    accent: "#f0e040",
  },
];

export default function Navbar({
  darkMode,
  currentUser,
  location,
  onToggleTheme,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0f]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black tracking-[0.45em] text-[#f0e040] shadow-[0_0_18px_rgba(240,224,64,0.14)] transition group-hover:border-[#f0e040]/40">
              ARCADE
            </span>
            <span className="text-sm uppercase tracking-[0.35em] text-slate-400">
              My React
            </span>
          </Link>
        </div>

        <nav className="-mx-3 flex max-w-[100vw] flex-nowrap items-center gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <Link
            to="/"
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${location.pathname === "/" ? "border-[#f0e040]/60 bg-[#f0e040]/10 text-[#f0e040]" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"}`}
          >
            Home
          </Link>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className="group shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm"
                style={{
                  borderColor: active
                    ? `${item.accent}66`
                    : "rgba(255,255,255,0.1)",
                  color: active ? item.accent : "#cbd5e1",
                  background: active
                    ? `${item.accent}12`
                    : "rgba(255,255,255,0.05)",
                  boxShadow: active
                    ? `0 0 0 1px ${item.accent}20, 0 14px 30px rgba(0,0,0,0.18)`
                    : "none",
                }}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex w-full flex-wrap items-center gap-2 self-start sm:w-auto sm:gap-3 xl:self-auto">
          {currentUser ? (
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]" />
              Hi, {currentUser.name}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 sm:px-4 sm:text-sm"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-[#40e0f0]/40 bg-[#40e0f0]/10 px-3 py-2 text-xs font-medium text-[#40e0f0] transition hover:border-[#40e0f0]/60 hover:bg-[#40e0f0]/15 sm:px-4 sm:text-sm"
              >
                Signup
              </Link>
            </>
          )}
          <button
            onClick={onToggleTheme}
            className={`rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${darkMode ? "border-[#f0e040]/40 bg-[#f0e040]/10 text-[#f0e040] hover:border-[#f0e040]/60" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"}`}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
          {currentUser && (
            <button
              onClick={onLogout}
              className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-100 transition hover:border-rose-500/50 hover:bg-rose-500/15 sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
