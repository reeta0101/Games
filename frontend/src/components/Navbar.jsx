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
    id: "cube",
    path: "/cube",
    title: "Cube Quiz",
    accent: "#a78bfa",
  },
  {
    id: "stateCapital",
    path: "/state-capital",
    title: "State Capital Quiz",
    accent: "#fb7185",
  },
  {
    id: "worldCapital",
    path: "/world-capital",
    title: "World Capital Quiz",
    accent: "#34d399",
  },
  {
    id: "periodicTable",
    path: "/periodic-table",
    title: "Periodic Table Quiz",
    accent: "#f59e0b",
  },
  {
    id: "multiplication",
    path: "/multiplication",
    title: "Multiplication Quiz",
    accent: "#22c55e",
  },
  {
    id: "reverseAlphabet",
    path: "/reverse-alphabet",
    title: "Reverse Alphabet Quiz",
    accent: "#f472b6",
  },
  {
    id: "prime",
    path: "/prime",
    title: "Prime Number Quiz",
    accent: "#38bdf8",
  },
  {
    id: "roman",
    path: "/roman",
    title: "Roman Numerals Quiz",
    accent: "#facc15",
  },
  {
    id: "countryCurrency",
    path: "/country-currency",
    title: "Country Currency Quiz",
    accent: "#2dd4bf",
  },
  {
    id: "elementSymbol",
    path: "/element-symbol",
    title: "Element Symbol Quiz",
    accent: "#fb923c",
  },
  {
    id: "oneWordSub",
    path: "/one-word-sub",
    title: "One Word Substitution",
    accent: "#c084fc",
  },
  {
    id: "indianPresident",
    path: "/indian-president",
    title: "Indian Presidents",
    accent: "#f97316",
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
    title: "Leaderboard",
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
              {NAV_ITEMS.find((item) => item.path === location.pathname)?.title || "Games Portal"}
            </span>
          </Link>
        </div>

        <nav className="-mx-3 flex max-w-[100vw] flex-nowrap items-center gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <Link
            to="/"
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${location.pathname === "/" ? "border-[#f0e040]/60 bg-[#f0e040]/10 text-[#f0e040]" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"}`}
          >
            Home
          </Link>
          <div className="relative shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-32 sm:w-48 rounded-full border border-white/10 bg-black/20 py-2 pl-9 pr-4 text-xs text-slate-200 outline-none transition focus:border-[#40e0f0]/40 focus:bg-white/10 sm:text-sm"
            />
          </div>
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
