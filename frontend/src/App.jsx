import { useEffect } from "react";
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
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const GAME_MODES = [
  {
    id: "alphabet",
    path: "/alphabet",
    title: "Alphabet Quiz",
    badge: "Memory",
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
    hero: "X³",
    intro: "Cubes of numbers from 1 to 30.",
    rules: "wrong = game over",
    reference: "Practice cubes of numbers from 1 to 30.",
    accent: "#a78bfa",
    summary: "What is the cube of the number?",
    details: "A challenging cube calculations mode with a purple arcade accent.",
  },
  {
    id: "stateCapital",
    path: "/state-capital",
    title: "State Capital Quiz",
    badge: "GK Memory",
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
    title: "Periodic Table Quiz",
    badge: "Chemistry",
    hero: "PT",
    intro: "Atomic number and weight for all elements.",
    rules: "wrong = game over",
    reference: "Elements 1-118 with rounded atomic weights.",
    accent: "#f59e0b",
    summary: "Choose the element's atomic number and atomic weight.",
    details: "A chemistry recall drill for periodic table facts.",
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

function HomePage({ darkMode, currentUser }) {
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

          <div className="grid gap-4 sm:grid-cols-2">
            {GAME_MODES.map((game) => (
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
              { label: "Modes", value: "6 + football", accent: "#f0e040" },
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
            element={
              <HomePage
                darkMode={darkMode}
                currentUser={currentUser}
              />
            }
          />
          <Route path="/alphabet" element={<AlphabetQuiz />} />
          <Route path="/square" element={<SquareQuiz />} />
          <Route path="/cube" element={<CubeQuiz />} />
          <Route path="/state-capital" element={<StateCapitalQuiz />} />
          <Route path="/world-capital" element={<WorldCapitalQuiz />} />
          <Route path="/periodic-table" element={<PeriodicTableQuiz />} />
          <Route
            path="*"
            element={
              <HomePage
                darkMode={darkMode}
                currentUser={currentUser}
              />
            }
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
