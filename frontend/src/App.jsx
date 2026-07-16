import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { toggleTheme } from "./features/theme/themeSlice";
import { logout } from "./features/auth/authSlice";
import FootBall from "./pages/FootBall";
import AuthPage from "./pages/AuthPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import TestPage from "./pages/TestPage";
import QuizzesPage from "./pages/QuizzesPage";
import AlphabetQuiz from "./pages/AlphabetQuiz";
import SquareQuiz from "./pages/SquareQuiz";
import StateCapitalQuiz from "./pages/StateCapitalQuiz";
import WorldCapitalQuiz from "./pages/WorldCapitalQuiz";
import CubeQuiz from "./pages/CubeQuiz";
import PeriodicTableQuiz from "./pages/PeriodicTableQuiz";
import MultiplicationQuiz from "./pages/MultiplicationQuiz";
import ReverseAlphabetQuiz from "./pages/ReverseAlphabetQuiz";
import PrimeQuiz from "./pages/PrimeQuiz";
import RomanQuiz from "./pages/RomanQuiz";
import CountryCurrencyQuiz from "./pages/CountryCurrencyQuiz";
import ElementSymbolQuiz from "./pages/ElementSymbolQuiz";
import OneWordSubstitutionQuiz from "./pages/OneWordSubstitutionQuiz";
import IndianPresidentQuiz from "./pages/IndianPresidentQuiz";
import IndianVicePresidentQuiz from "./pages/IndianVicePresidentQuiz";
import NationalOfficialsQuiz from "./pages/NationalOfficialsQuiz";
import StateOfficialsQuiz from "./pages/StateOfficialsQuiz";
import DiseaseCauseQuiz from "./pages/DiseaseCauseQuiz";
import AnimalKingdomQuiz from "./pages/AnimalKingdomQuiz";
import SiUnitsQuiz from "./pages/SiUnitsQuiz";
import ScientificNameQuiz from "./pages/ScientificNameQuiz";
import StateDanceQuiz from "./pages/StateDanceQuiz";
import OrganizationHqQuiz from "./pages/OrganizationHqQuiz";
import InventionQuiz from "./pages/InventionQuiz";
import CompanyOriginQuiz from "./pages/CompanyOriginQuiz";
import FamousQuotesQuiz from "./pages/FamousQuotesQuiz";
import RiverOriginQuiz from "./pages/RiverOriginQuiz";
import NationalParkQuiz from "./pages/NationalParkQuiz";
import LandmarkCountryQuiz from "./pages/LandmarkCountryQuiz";
import VitaminDeficiencyQuiz from "./pages/VitaminDeficiencyQuiz";
import IndianNationalQuiz from "./pages/IndianNationalQuiz";
import FamousBattlesQuiz from "./pages/FamousBattlesQuiz";
import CompoundFormulaQuiz from "./pages/CompoundFormulaQuiz";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FeedbackSection from "./components/FeedbackSection";
import Leaderboard from "./pages/Leaderboard";
import ChallengePage from "./pages/ChallengePage";
import FriendsPage from "./pages/FriendsPage";
import LobbyPage from "./pages/LobbyPage";
import { GlobalSocketProvider } from "./contexts/GlobalSocketContext";
import InteractiveMapPage from "./pages/InteractiveMapPage";
import ProfilePage from "./pages/ProfilePage";
import MobileBottomNav from "./components/MobileBottomNav";
import { MODE_LABELS, getLeaderboard, getTimeAgo } from "./utils/leaderboard";
import { GAME_MODES, CATEGORIES, recordRecentGame, getRecentGames } from "./utils/gameConstants";
import Analytics from "./components/Analytics";

// GAME_MODES is now imported from ./utils/gameConstants.js

function ArcadeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(64,224,240,0.07),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.06),_transparent_50%),linear-gradient(180deg,_#080812,_#0a0a0f)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(64,224,240,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(64,224,240,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />

      {/* Floating orbs */}
      <div className="animate-float-orb absolute top-[10%] left-[15%] h-64 w-64 rounded-full bg-[#40e0f0]/[0.03] blur-3xl" />
      <div className="animate-float-orb-slow absolute top-[50%] right-[10%] h-80 w-80 rounded-full bg-[#a78bfa]/[0.03] blur-3xl" />
      <div className="animate-float-orb-fast absolute bottom-[15%] left-[40%] h-48 w-48 rounded-full bg-[#f0e040]/[0.02] blur-3xl" />

      {/* Scanning line */}
      <div className="animate-scan-line absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#40e0f0]/20 to-transparent" />
    </div>
  );
}

const DIFF_TABS = [
  { key: "beginner", label: "Beginner", icon: "🌱" },
  { key: "intermediate", label: "Intermediate", icon: "⚡" },
  { key: "advanced", label: "Advanced", icon: "🔥" },
];

function GameLeaderboardCard({ game, activeDiff }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLeaderboard(game.id, activeDiff, 5)
      .then((data) => {
        if (mounted) setEntries(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [game.id, activeDiff]);

  return (
    <div className="premium-card rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.25em] mb-1"
            style={{ color: game.accent, textShadow: `0 0 10px ${game.accent}40` }}
          >
            {MODE_LABELS[game.id] || game.title}
          </p>
          <h3 className="text-lg font-black text-white leading-tight">{game.title}</h3>
        </div>
        <Link
          to={game.path}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          Play
        </Link>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto space-y-1.5 pr-1">
        {loading ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-4 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-4 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
            No scores yet
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-slate-900/40 px-3 py-2.5 rounded-xl text-sm border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="min-w-0 flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : index === 1 ? 'bg-slate-300/20 text-slate-300' : index === 2 ? 'bg-amber-600/20 text-amber-500' : 'bg-white/5 text-slate-500'}`}>
                  {index + 1}
                </div>
                <p className="truncate font-semibold text-slate-200">
                  {entry.name}
                </p>
              </div>
              <div className="font-black tracking-wide" style={{ color: game.accent, textShadow: `0 0 8px ${game.accent}30` }}>
                {entry.score}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AllGameLeaderboards() {
  const [activeDiff, setActiveDiff] = useState("intermediate");

  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f0e040]/90">
            Leaderboards
          </p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Top 20 scores for every quiz
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Best per player
        </p>
      </div>

      {/* Difficulty tabs */}
      <div className="mb-5 flex gap-2">
        {DIFF_TABS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDiff(d.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition ${
              activeDiff === d.key
                ? "border-[#f0e040]/60 bg-[#f0e040]/10 text-[#f0e040]"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GAME_MODES.map((game) => (
          <GameLeaderboardCard
            key={game.id}
            game={game}
            activeDiff={activeDiff}
          />
        ))}
      </div>
    </section>
  );
}

// CATEGORIES is now imported from ./utils/gameConstants.js

function getStudyStats() {
  try {
    const lb = JSON.parse(localStorage.getItem("arcade_leaderboard") || "[]");
    const today = new Date().toDateString();
    const todayCount = lb.filter(
      (e) => new Date(e.timestamp).toDateString() === today,
    ).length;
    return {
      totalGames: lb.length,
      todayGames: todayCount,
      quizCount: GAME_MODES.length,
    };
  } catch {
    return { totalGames: 0, todayGames: 0, quizCount: GAME_MODES.length };
  }
}

// recordRecentGame and getRecentGames are now imported from ./utils/gameConstants.js

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getPersonalBest(gameId) {
  try {
    const hs = JSON.parse(localStorage.getItem("arcade_high_scores") || "{}");
    for (const user of Object.values(hs)) {
      for (const key of Object.keys(user)) {
        if (key.startsWith(gameId + "__")) return user[key];
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

const STUDY_STEPS = [
  { label: "Pick", detail: "Choose a topic or search by goal." },
  { label: "Read", detail: "Review the quick reference first." },
  { label: "Play", detail: "Answer fast and learn from feedback." },
];

function HomePage({ currentUser }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const stats = getStudyStats();

  const categoryCounts = useMemo(() => {
    return GAME_MODES.reduce((counts, game) => {
      counts[game.category] = (counts[game.category] || 0) + 1;
      return counts;
    }, {});
  }, []);

  const filteredGames = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return GAME_MODES.filter((game) => {
      const matchesCategory =
        activeCategory === "All" || game.category === activeCategory;
      const matchesSearch =
        !query ||
        [game.title, game.badge, game.category, game.summary, game.details]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const featuredGame = filteredGames[0] || GAME_MODES[0];
  // Recently played — read from localStorage, map to GAME_MODES objects
  const recentlyPlayed = useMemo(() => {
    const recent = getRecentGames(); // [{ id, playedAt }]
    const result = [];
    for (const r of recent) {
      const game = GAME_MODES.find((g) => g.id === r.id);
      if (game) result.push({ ...game, playedAt: r.playedAt });
    }
    return result;
  }, []);

  const hasRecent = recentlyPlayed.length > 0;

  const recommendedGames = useMemo(() => {
    const seen = new Set([featuredGame.id]);
    return [...filteredGames, ...GAME_MODES]
      .filter((game) => {
        if (seen.has(game.id)) return false;
        seen.add(game.id);
        return true;
      })
      .slice(0, 4);
  }, [featuredGame.id, filteredGames]);

  return (
    <main className="mx-auto max-w-7xl px-3 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:gap-10 items-stretch">
        <div className="space-y-6 h-full flex flex-col">
          <div className="surface relative overflow-hidden rounded-3xl p-5 animate-fade-in-up sm:p-6 lg:p-6 flex-1 flex flex-col">
            {/* Decorative orbiting dot */}
            <div className="pointer-events-none absolute right-12 top-12 hidden sm:block">
              <div className="relative h-[120px] w-[120px]">
                <div className="animate-orbit absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#40e0f0]/40 shadow-[0_0_12px_rgba(64,224,240,0.5)]" />
                <div
                  className="animate-orbit absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#a78bfa]/30 shadow-[0_0_10px_rgba(167,139,250,0.4)]"
                  style={{ animationDelay: "-7s", animationDuration: "15s" }}
                />
              </div>
            </div>

            {/* Corner glow accent */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#40e0f0]/[0.06] blur-3xl animate-float-orb" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#a78bfa]/[0.04] blur-3xl animate-float-orb-slow" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-4 lg:gap-6">
              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#40e0f0]/25 bg-[#40e0f0]/8 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#40e0f0] animate-glow-pulse">
                  <span className="h-2 w-2 rounded-full bg-[#40e0f0] shadow-[0_0_12px_rgba(64,224,240,0.85)]" />
                  {GAME_MODES.length} focused quizzes
                </div>

                <h1 className="text-3xl font-black leading-[1.06] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Study smarter with quick,
                  <span className="block bg-gradient-to-r from-[#40e0f0] via-[#a78bfa] to-[#40e0f0] bg-clip-text text-transparent animate-gradient-text mt-1">
                    playable drills
                  </span>
                </h1>
              </div>

              {/* Hero Image Section */}
              <div className="min-w-0 w-full max-w-[200px] mx-auto lg:max-w-[260px] relative animate-float flex justify-center lg:justify-end">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#40e0f0]/20 to-[#a78bfa]/20 rounded-full blur-3xl opacity-60"></div>
                <img 
                  src="/images/hero.png" 
                  alt="Study Arcade Hero" 
                  className="relative w-full max-h-32 lg:max-h-40 object-contain drop-shadow-[0_20px_50px_rgba(64,224,240,0.3)] transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Row 2: Subtitle */}
              <div className="lg:col-span-2 pt-1">
                <p className="text-sm leading-6 text-slate-300 sm:text-base lg:max-w-4xl">
                  Pick a topic, read the reference, then practice under time
                  pressure with instant feedback and local progress tracking.
                </p>
              </div>

              {/* Row 3: Buttons */}
              <div className="lg:col-span-2 flex flex-wrap gap-3 pt-2">
                <Link
                  to={featuredGame.path}
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-[#40e0f0]/40 bg-[#40e0f0]/14 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#40e0f0] shadow-[0_18px_40px_rgba(64,224,240,0.12)] transition hover:bg-[#40e0f0]/22 hover:shadow-[0_18px_50px_rgba(64,224,240,0.2)] whitespace-nowrap flex-1 sm:flex-none"
                >
                  <span className="text-base">▶</span>
                  Start {featuredGame.title}
                </Link>
                <a
                  href="#quiz-library"
                  className="touch-target inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/8 whitespace-nowrap flex-1 sm:flex-none"
                >
                  Browse quizzes
                </a>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-6">
              {[
                {
                  label: "Read first",
                  value: "Reference tables",
                  icon: "📖",
                },
                {
                  label: "Fast feedback",
                  value: "Correct or game over",
                  icon: "⚡",
                },
                {
                  label: "Keyboard ready",
                  value: "Use A, B, C, D",
                  icon: "⌨️",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-black/18 p-5 transition hover:border-white/15 hover:bg-black/25 overflow-hidden"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 whitespace-nowrap">
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white whitespace-nowrap">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Neon border trace at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] neon-border" />
          </div>

          {/* ── Mobile login banner (hidden on xl where aside is visible) ── */}
          {!currentUser && (
            <div
              className="xl:hidden relative overflow-hidden rounded-3xl border border-[#40e0f0]/20 bg-gradient-to-r from-[#40e0f0]/8 via-[#07101d] to-[#a78bfa]/8 p-5 animate-fade-in-up"
              style={{ animationDelay: "0.08s" }}
            >
              <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#40e0f0]/6 to-transparent" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#40e0f0]/30 bg-[#40e0f0]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#40e0f0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#40e0f0] animate-pulse" />
                    Free to join
                  </span>
                  <p className="mt-2 text-base font-black text-white">
                    Save scores &amp; beat the leaderboard
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Create a free account to track your progress.
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    to="/signup"
                    className="touch-target inline-flex items-center justify-center rounded-2xl border border-[#40e0f0]/50 bg-[#40e0f0]/15 px-5 py-2.5 text-sm font-black text-[#40e0f0] transition hover:bg-[#40e0f0]/25"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="touch-target inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}


        </div>

        <aside
          className="space-y-4 animate-fade-in-up h-full flex flex-col"
          style={{ animationDelay: "0.14s" }}
        >
          <div className="surface rounded-3xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#40e0f0]/80">
              Study dashboard
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">
              {currentUser
                ? `Welcome, ${currentUser.name}`
                : "Start practicing"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your scores are stored locally, so you can keep practicing without
              setup friction.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                {
                  label: "Today",
                  value: stats.todayGames,
                  accent: "#40e0f0",
                  delay: "0s",
                },
                {
                  label: "Total",
                  value: stats.totalGames,
                  accent: "#a78bfa",
                  delay: "0.1s",
                },
                {
                  label: "Quizzes",
                  value: stats.quizCount,
                  accent: "#f59e0b",
                  delay: "0.2s",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.035] p-3 text-center transition hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <div
                    className="text-2xl font-black tabular-nums animate-counter-pop"
                    style={{ color: s.accent, animationDelay: s.delay }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface rounded-3xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f0e040]/80">
              Better study flow
            </p>
            <div className="mt-4 space-y-3">
              {STUDY_STEPS.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#f0e040]/25 bg-[#f0e040]/10 text-xs font-black text-[#f0e040]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{step.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentUser ? (
            <div className="surface rounded-3xl p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-lg font-black text-emerald-300">
                  {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-emerald-400">● Logged in</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Your scores are saved under your name on the leaderboard.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-[#40e0f0]/20 bg-gradient-to-br from-[#40e0f0]/10 via-[#07101d] to-[#a78bfa]/10 p-6 shadow-[0_0_40px_rgba(64,224,240,0.06)]">
              {/* Glow blobs */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#40e0f0]/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#a78bfa]/10 blur-2xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#40e0f0]/30 bg-[#40e0f0]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#40e0f0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#40e0f0] animate-pulse" />
                  Free to join
                </span>

                <h3 className="mt-3 text-xl font-black text-white leading-snug">
                  Save your scores &amp; climb the leaderboard
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Create a free account to track your best scores, appear on
                  leaderboards, and pick up where you left off.
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    to="/signup"
                    className="touch-target flex w-full items-center justify-center gap-2 rounded-2xl border border-[#40e0f0]/50 bg-[#40e0f0]/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#40e0f0] shadow-[0_0_20px_rgba(64,224,240,0.12)] transition hover:bg-[#40e0f0]/25 hover:shadow-[0_0_30px_rgba(64,224,240,0.2)]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    className="touch-target flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Already have an account? Login
                  </Link>
                </div>

                <p className="mt-4 text-center text-[10px] text-slate-600 uppercase tracking-[0.15em]">
                  No payment · No email required
                </p>
              </div>
            </div>
          )}

          <div className="surface rounded-3xl p-5 mt-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]/80">
              Tip
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Start on Beginner, review the reference after misses, then move to
              Advanced when recall feels automatic.
            </p>
          </div>
        </aside>
      </section>

      <section
        className="surface mt-6 rounded-3xl p-5 animate-fade-in-up sm:p-6"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f0e040]/80">
              {hasRecent ? "Recently played" : "Recommended drills"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Keep playing from here
            </h2>
          </div>
          <a
            href="#quiz-library"
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#40e0f0] transition hover:text-white"
          >
            View all
          </a>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(hasRecent ? recentlyPlayed : recommendedGames).map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className="interactive-lift group flex min-h-24 items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black"
                style={{
                  borderColor: `${game.accent}55`,
                  color: game.accent,
                  background: `${game.accent}12`,
                }}
              >
                {game.hero}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">
                  {game.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {game.category}
                </p>
                {hasRecent && game.playedAt && (
                  <p className="mt-0.5 text-[10px] text-slate-600 uppercase tracking-[0.14em]">
                    🕐 {timeAgo(game.playedAt)}
                  </p>
                )}
                <p
                  className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100"
                  style={{ color: game.accent }}
                >
                  Play again →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="quiz-library"
        className="surface mt-6 rounded-3xl p-4 animate-fade-in-up sm:p-5"
        style={{ animationDelay: "0.08s" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f0e040]/80">
              Quiz library
            </p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Find your next drill
            </h2>
          </div>

          <label className="block lg:w-80">
            <span className="sr-only">Search quizzes</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search math, capitals, biology..."
              className="touch-target w-full rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#40e0f0]/60 focus:bg-black/30"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.label;
            const count =
              cat.label === "All"
                ? GAME_MODES.length
                : categoryCounts[cat.label] || 0;

            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                aria-pressed={active}
                className={`interactive-lift touch-target shrink-0 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "border-[#40e0f0]/45 bg-[#40e0f0]/12 text-[#40e0f0] shadow-[0_0_18px_rgba(64,224,240,0.1)]"
                    : "border-white/8 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
                type="button"
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
                <span className="ml-2 rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredGames.length === 0 ? (
          <div className="mt-5 animate-fade-in rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-4xl mb-3">🔎</div>
            <p className="mb-1 text-lg font-bold text-white">No quiz found</p>
            <p className="text-sm text-slate-400">
              Try a different search term or switch back to All.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredGames.map((game, i) => {
              const best = getPersonalBest(game.id);
              return (
                <Link
                  key={game.id}
                  to={game.path}
                  className="interactive-lift group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] p-5 text-left animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 35, 280)}ms` }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1 neon-border"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${game.accent}, transparent)`,
                      backgroundSize: "200% 100%",
                      animation: "neonTrace 3s linear infinite",
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 h-28 w-28 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `${game.accent}33` }}
                  />

                  <div className="relative flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-lg font-black transition-shadow duration-300 group-hover:shadow-[0_0_18px_var(--accent-glow)]"
                      style={{
                        borderColor: `${game.accent}55`,
                        color: game.accent,
                        background: `${game.accent}12`,
                        "--accent-glow": `${game.accent}40`,
                      }}
                    >
                      {game.hero}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                          style={{
                            color: game.accent,
                            background: `${game.accent}12`,
                          }}
                        >
                          {game.badge}
                        </span>
                        {best > 0 && (
                          <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Best <span className="text-white">{best}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-extrabold tracking-tight text-white">
                        {game.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-400">
                        {game.details}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        <span>{game.category}</span>
                        <span>•</span>
                        <span>{game.rules}</span>
                      </div>

                      <span
                        className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        style={{ color: game.accent }}
                      >
                        Study and play <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <FeedbackSection />
      <AllGameLeaderboards />
    </main>
  );
}

function ArcadeLayout() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(
        "games-auth-user",
        JSON.stringify(currentUser),
      );
    } else {
      window.localStorage.removeItem("games-auth-user");
    }
  }, [currentUser]);

  if (location.pathname === "/football") {
    return <FootBall />;
  }

  return (
    <div className="min-h-screen text-slate-100">
      <ArcadeBackground />
      <div className="relative z-10">
        <Navbar
          currentUser={currentUser}
          location={location}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={() => dispatch(logout())}
        />


        <div className="pb-20 sm:pb-0">
          <Routes>
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route path="/alphabet" element={<AlphabetQuiz />} />
            <Route path="/square" element={<SquareQuiz />} />
            <Route path="/cube" element={<CubeQuiz />} />
            <Route path="/state-capital" element={<StateCapitalQuiz />} />
            <Route path="/world-capital" element={<WorldCapitalQuiz />} />
            <Route path="/periodic-table" element={<PeriodicTableQuiz />} />
            <Route path="/multiplication" element={<MultiplicationQuiz />} />
            <Route path="/reverse-alphabet" element={<ReverseAlphabetQuiz />} />
            <Route path="/prime" element={<PrimeQuiz />} />
            <Route path="/roman" element={<RomanQuiz />} />
            <Route path="/country-currency" element={<CountryCurrencyQuiz />} />
            <Route path="/element-symbol" element={<ElementSymbolQuiz />} />
            <Route path="/one-word-sub" element={<OneWordSubstitutionQuiz />} />
            <Route path="/indian-president" element={<IndianPresidentQuiz />} />
            <Route
              path="/national-officials"
              element={<NationalOfficialsQuiz />}
            />
            <Route path="/state-officials" element={<StateOfficialsQuiz />} />
            <Route path="/disease-cause" element={<DiseaseCauseQuiz />} />
            <Route path="/animal-kingdom" element={<AnimalKingdomQuiz />} />
            <Route path="/si-units" element={<SiUnitsQuiz />} />
            <Route path="/scientific-name" element={<ScientificNameQuiz />} />
            <Route path="/state-dance" element={<StateDanceQuiz />} />
            <Route path="/organization-hq" element={<OrganizationHqQuiz />} />
            <Route path="/inventions" element={<InventionQuiz />} />
            <Route path="/company-origin" element={<CompanyOriginQuiz />} />
            <Route path="/famous-quotes" element={<FamousQuotesQuiz />} />
            <Route path="/river-origin" element={<RiverOriginQuiz />} />
            <Route path="/national-parks" element={<NationalParkQuiz />} />
            <Route path="/landmark-country" element={<LandmarkCountryQuiz />} />
            <Route
              path="/vitamin-deficiency"
              element={<VitaminDeficiencyQuiz />}
            />
            <Route path="/indian-national" element={<IndianNationalQuiz />} />
            <Route path="/famous-battles" element={<FamousBattlesQuiz />} />
            <Route path="/compound-formula" element={<CompoundFormulaQuiz />} />
            <Route
              path="/indian-vice-president"
              element={<IndianVicePresidentQuiz />}
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/test-page" element={<TestPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/map" element={<InteractiveMapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <MobileBottomNav />
        <Footer />
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    let visitorId = sessionStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('visitorId', visitorId);
    }

    const pingServer = () => {
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/stats/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId })
      }).catch(console.error);
    };

    pingServer();
    const interval = setInterval(pingServer, 60000); // every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <GlobalSocketProvider>
        <Analytics />
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/*" element={<ArcadeLayout />} />
        </Routes>
      </GlobalSocketProvider>
    </BrowserRouter>
  );
}

export default App;
