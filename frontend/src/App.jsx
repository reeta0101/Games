import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { toggleTheme } from "./features/theme/themeSlice";
import { logout } from "./features/auth/authSlice";
import FootBall from "./pages/FootBall";
import AuthPage from "./pages/AuthPage";
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
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Leaderboard from "./pages/Leaderboard";
import {
  MODE_LABELS,
  getLeaderboard,
  getTimeAgo,
} from "./utils/leaderboard";

const GAME_MODES = [
  {
    id: "nationalOfficials",
    path: "/national-officials",
    title: "National Officials",
    badge: "General Knowledge",
    category: "General Knowledge",
    hero: "GOV",
    intro: "Who currently holds this important national office?",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Current Indian constitutional and national officials.",
    accent: "#f59e0b",
    summary: "Who is the...",
    details: "Important office holders in India.",
  },
  {
    id: "stateOfficials",
    path: "/state-officials",
    title: "State Chief Ministers",
    badge: "General Knowledge",
    category: "General Knowledge",
    hero: "CM",
    intro: "Who is the current Chief Minister of this state?",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Current Chief Ministers of all 28 states.",
    accent: "#ef4444",
    summary: "Who is the Chief Minister of...",
    details: "Match the state to its current CM.",
  },
  {
    id: "alphabet",
    path: "/alphabet",
    title: "Alphabet Quiz",
    badge: "Memory",
    category: "Memory & Logic",
    hero: "A→Z",
    intro: "Identify letter positions instantly.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "A·B·C·D·E·F·G·H·I·J·K·L·M·N·O·P·Q·R·S·T·U·V·W·X·Y·Z",
    accent: "#f0e040",
    summary: "What position is the letter?",
    details: "A fast recall drill built around alphabet position memory.",
  },
  {
    id: "square",
    path: "/square",
    title: "Square Quiz",
    badge: "Quant",
    category: "Mathematics",
    hero: "X²",
    intro: "Squares of numbers from 1 to 100.",
    rules: "<1.5s = 12pts · <3s = 8pts · <5s = 4pts · wrong = over",
    reference: "Practice squares of numbers from 1 to 100.",
    accent: "#40e0f0",
    summary: "What is the square of the number?",
    details: "A quick mental math mode with a cyan arcade accent.",
  },
  {
    id: "cube",
    path: "/cube",
    title: "Cube Quiz",
    badge: "Quant",
    category: "Mathematics",
    hero: "X³",
    intro: "Cubes of numbers from 1 to 30.",
    rules: "wrong = game over",
    reference: "Practice cubes of numbers from 1 to 30.",
    accent: "#a78bfa",
    summary: "What is the cube of the number?",
    details:
      "A challenging cube calculations mode with a purple arcade accent.",
  },
  {
    id: "stateCapital",
    path: "/state-capital",
    title: "State Capital Quiz",
    badge: "GK Memory",
    category: "General Knowledge",
    hero: "IND",
    intro: "Indian state capitals at exam speed.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Covers the 28 Indian states only, not union territories.",
    accent: "#fb7185",
    summary: "Find the capital of the state. ",
    details: "A general knowledge memory test with a pink accent.",
  },
  {
    id: "worldCapital",
    path: "/world-capital",
    title: "World Capital Quiz",
    badge: "🌍 World GK",
    category: "General Knowledge",
    hero: "🌍",
    intro: "All 195 countries — test your world knowledge.",
    rules: "wrong = game over",
    reference: "All 195 countries — from Afghanistan to Zimbabwe.",
    accent: "#34d399",
    summary: "Name the capital of every country on Earth.",
    details: "A comprehensive world geography quiz with an emerald accent.",
  },
  {
    id: "periodicTable",
    path: "/periodic-table",
    title: "Element → (Atomic Number, Atomic Weight)",
    badge: "Chemistry",
    category: "Chemistry",
    hero: "Z|W",
    intro: "Match each element to its atomic number and atomic weight.",
    rules: "wrong = game over",
    reference: "Elements 1-118 with rounded atomic weights.",
    accent: "#f59e0b",
    summary: "Pick the correct atomic number and atomic weight.",
    details: "A chemistry recall drill — element to (Z, W) pairs.",
  },
  {
    id: "multiplication",
    path: "/multiplication",
    title: "Multiplication Quiz",
    badge: "Quant",
    category: "Mathematics",
    hero: "A×B",
    intro: "Times tables from 2 to 15 — speed counts.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Products of two numbers between 2 and 15.",
    accent: "#22d3ee",
    summary: "What is the product?",
    details: "A fast times-table drill with a cyan accent.",
  },
  {
    id: "reverseAlphabet",
    path: "/reverse-alphabet",
    title: "Reverse Alphabet Quiz",
    badge: "Memory",
    category: "Memory & Logic",
    hero: "Z←A",
    intro: "Given a position, name the letter.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "A=1 · B=2 · … · Z=26",
    accent: "#e879f9",
    summary: "Which letter is at this position?",
    details: "The flip side of Alpha Quiz — position to letter recall.",
  },
  {
    id: "prime",
    path: "/prime",
    title: "Prime Number Quiz",
    badge: "Quant",
    category: "Mathematics",
    hero: "P#",
    intro: "Spot the prime among four numbers.",
    rules: "wrong = game over",
    reference: "Primes between 2 and 100.",
    accent: "#f97316",
    summary: "Pick the only prime number.",
    details: "A number theory challenge with an orange accent.",
  },
  {
    id: "roman",
    path: "/roman",
    title: "Roman Numerals Quiz",
    badge: "Classics",
    category: "Miscellaneous",
    hero: "IV",
    intro: "Convert Roman numerals to decimal values.",
    rules: "wrong = game over",
    reference: "Numbers 1–100 in standard Roman notation.",
    accent: "#84cc16",
    summary: "What is the value of the numeral?",
    details: "Decode numerals from I to C with a lime accent.",
  },
  {
    id: "countryCurrency",
    path: "/country-currency",
    title: "Country → Currency",
    badge: "🌍 World GK",
    category: "General Knowledge",
    hero: "💱",
    intro: "Match each country to its official currency.",
    rules: "wrong = game over",
    reference: "All 195 countries — from Afghanistan to Zimbabwe.",
    accent: "#2dd4bf",
    summary: "What currency does this country use?",
    details: "A world economics and geography quiz with a teal accent.",
  },
  {
    id: "elementSymbol",
    path: "/element-symbol",
    title: "Element Name → Element Symbol",
    badge: "Chemistry",
    category: "Chemistry",
    hero: "C·Fe",
    intro: "Match each element name to its chemical symbol.",
    rules: "wrong = game over",
    reference: "Elements 1-118 — from H to Og.",
    accent: "#eab308",
    summary: "What is the symbol for this element?",
    details: "Name to symbol recall — C, Fe, Au, and all 118 elements.",
  },
  {
    id: "oneWordSub",
    path: "/one-word-sub",
    title: "One Word Substitution",
    badge: "Vocabulary",
    category: "English",
    hero: "OWS",
    intro: "One word for the given phrase.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "100 common one-word substitutions.",
    accent: "#c084fc",
    summary: "Pick the one-word substitution for the phrase.",
    details: "A vocabulary quiz covering 100 common OWS entries.",
  },
  {
    id: "indianPresident",
    path: "/indian-president",
    title: "Indian Presidents",
    badge: "India GK",
    category: "General Knowledge",
    hero: "IND",
    intro: "Order → President name.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "1st to 15th President of India.",
    accent: "#f97316",
    summary: "Who was the Nth President of India?",
    details: "From Rajendra Prasad (1st) to Droupadi Murmu (15th).",
  },
  {
    id: "indianVicePresident",
    path: "/indian-vice-president",
    title: "Indian Vice Presidents",
    badge: "India GK",
    category: "General Knowledge",
    hero: "IVP",
    intro: "Order → Vice President name.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "1st to 14th Vice President of India.",
    accent: "#fb7185",
    summary: "Who was the Nth Vice President of India?",
    details: "From S. Radhakrishnan (1st) to Jagdeep Dhankhar (14th).",
  },
];

const NAV_ITEMS = [];
const GameModePage = null;

function ArcadeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(240,224,64,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(64,224,240,0.08),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(251,113,133,0.08),_transparent_30%),linear-gradient(180deg,_#080812,_#0a0a0f)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(240,224,64,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(240,224,64,0.035)_1px,transparent_1px)] bg-[size:40px_40px] opacity-70" />
    </div>
  );
}

const DIFF_TABS = [
  { key: "beginner", label: "Beginner", icon: "🌱" },
  { key: "intermediate", label: "Intermediate", icon: "⚡" },
  { key: "advanced", label: "Advanced", icon: "🔥" },
];

function AllGameLeaderboards() {
  const leaderboard = getLeaderboard();
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
        {GAME_MODES.map((game) => {
          const entries = leaderboard
            .filter((e) => e.mode === game.id && e.difficulty === activeDiff)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

          return (
            <div
              key={game.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: game.accent }}
                  >
                    {MODE_LABELS[game.id] || game.title}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-white">
                    {game.title}
                  </h3>
                </div>
                <Link
                  to={game.path}
                  className="shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/10"
                >
                  Play
                </Link>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {entries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-4 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
                    No scores yet
                  </div>
                ) : (
                  entries.map((entry, index) => (
                    <div
                      key={`${entry.name}-${entry.timestamp}-${index}`}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <span
                        className="w-6 text-center text-sm font-black"
                        style={{
                          color:
                            index === 0
                              ? "#ffd700"
                              : index === 1
                                ? "#c0c0c0"
                                : index === 2
                                  ? "#cd7f32"
                                  : game.accent,
                        }}
                      >
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">
                          {entry.name}
                        </div>
                        <div className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-500">
                          {entry.questions || "?"}Q ·{" "}
                          {getTimeAgo(entry.timestamp)}
                        </div>
                      </div>
                      <div
                        className="text-lg font-black"
                        style={{ color: game.accent }}
                      >
                        {entry.score}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const CATEGORIES = ["All", "Mathematics", "Biology", "Chemistry", "General Knowledge", "Memory & Logic", "English", "Miscellaneous"];

function HomePage({ darkMode, currentUser }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredGames = activeCategory === "All" 
    ? GAME_MODES 
    : GAME_MODES.filter(game => game.category === activeCategory);

  return (
    <main className="mx-auto max-w-7xl px-3 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-[#40e0f0] shadow-[0_0_16px_rgba(64,224,240,0.8)]" />
            Games portal
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#f0e040]/90">
              ARCADE
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Choose Quiz.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              Pick a quiz, choose a difficulty, and play from the same
              responsive arcade menu on desktop or mobile.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition ${
                  activeCategory === category
                    ? "border-[#40e0f0]/60 bg-[#40e0f0]/10 text-[#40e0f0]"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredGames.length === 0 ? (
             <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center sm:p-12">
               <p className="text-xl font-bold text-white mb-2">Coming Soon!</p>
               <p className="text-slate-400">We are working on adding amazing {activeCategory} games. Stay tuned.</p>
             </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  to={game.path}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08] sm:rounded-[1.75rem] sm:p-6"
                  style={{
                    boxShadow: `0 0 0 1px ${game.accent}18, 0 20px 45px rgba(0,0,0,0.22)`,
                  }}
                >
                  <div
                    className="mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]"
                    style={{
                      borderColor: `${game.accent}55`,
                      color: game.accent,
                      background: `${game.accent}10`,
                    }}
                  >
                    {game.badge}
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.12em]">
                    {game.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {game.summary}
                  </p>
                  <span
                    className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.3em] transition group-hover:translate-x-1"
                    style={{ color: game.accent }}
                  >
                    Play →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#40e0f0]">
                Session
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Ready to play
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right text-xs text-slate-300">
              Theme
              <div
                className="mt-1 font-semibold"
                style={{ color: darkMode ? "#f0e040" : "#40e0f0" }}
              >
                {darkMode ? "Night arc" : "Studio arc"}
              </div>
            </div>
          </div>

          {currentUser ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Logged in
              </p>
              <div className="mt-3 text-xl font-bold text-white sm:text-2xl">
                Welcome back, {currentUser.name}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Your account stays stored locally so the app can reopen in the
                same state on the next visit.
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Guest mode
              </p>
              <div className="mt-3 text-xl font-bold text-white sm:text-2xl">
                Login or create an account
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Use the auth links in the navbar to save a local profile before
                entering the game menu.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full border border-[#fb7185]/40 bg-[#fb7185]/10 px-4 py-2 text-sm font-medium text-[#fb7185] transition hover:bg-[#fb7185]/15"
                >
                  Signup
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Modes", value: "12 + football", accent: "#f0e040" },
              { label: "Palette", value: "Neon arc", accent: "#40e0f0" },
              { label: "Storage", value: "Local auth", accent: "#fb7185" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {item.label}
                </div>
                <div
                  className="mt-2 text-lg font-bold"
                  style={{ color: item.accent }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
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
    <div className="min-h-screen overflow-x-hidden text-slate-100 font-mono">
      <ArcadeBackground />
      <div className="relative z-10">
        <Navbar
          darkMode={darkMode}
          currentUser={currentUser}
          location={location}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={() => dispatch(logout())}
        />

        <Routes>
          <Route
            path="/"
            element={<HomePage darkMode={darkMode} currentUser={currentUser} />}
          />
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
          <Route path="/national-officials" element={<NationalOfficialsQuiz />} />
          <Route path="/state-officials" element={<StateOfficialsQuiz />} />

          <Route
            path="/indian-vice-president"
            element={<IndianVicePresidentQuiz />}
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="*"
            element={<HomePage darkMode={darkMode} currentUser={currentUser} />}
          />
        </Routes>
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
}

function Layout() {
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

  // If we're on the football page, render it full-screen without the app shell
  if (location.pathname === "/football") {
    return <FootBall />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          <Link to="/">MyApp</Link>
        </h1>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div
              className={`hidden sm:flex items-center gap-3 rounded-full px-4 py-2 text-sm ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"}`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Hi, {currentUser.name}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
              >
                Signup
              </Link>
            </>
          )}
          <Link
            to="/football"
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-green-600 text-white hover:bg-green-700"
          >
            ⚽ Football
          </Link>
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              darkMode
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          {currentUser && (
            <button
              onClick={() => dispatch(logout())}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${darkMode ? "bg-red-900/60 text-red-100 hover:bg-red-900" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            {currentUser ? `Welcome back, ${currentUser.name}` : "Welcome to"}{" "}
            <span className="text-purple-600">MyApp</span>
          </h2>
          <p
            className={`text-xl mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {currentUser
              ? "Your account is saved locally and ready for the next session."
              : "Build amazing things with React and Tailwind CSS"}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/football"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Play Football ⚽
            </Link>
            {!currentUser && (
              <Link
                to="/signup"
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Create account
              </Link>
            )}
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Fast",
              desc: "Built with Vite for lightning fast development",
            },
            {
              title: "Modern",
              desc: "Using React 19 with the latest features",
            },
            { title: "Stylish", desc: "Beautiful UI with Tailwind CSS" },
          ].map((feature, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl transition-colors duration-300 ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2 text-purple-600">
                {feature.title}
              </h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-6 text-center transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-600"
        }`}
      >
        <p>© 2024 MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

void NAV_ITEMS;
void GameModePage;
void Layout;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/*" element={<ArcadeLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
