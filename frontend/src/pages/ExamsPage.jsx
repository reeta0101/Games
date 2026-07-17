import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizFeed from "../components/QuizFeed";
import "../QuizStyles.css";

// Glob import all JSON files under data/
const allModules = import.meta.glob("../data/**/*.json");

/* ──────────────────────────────────────────────
   CATEGORY GROUPS
────────────────────────────────────────────── */
const CATEGORIES = [
  {
    key: "all",
    label: "All",
    icon: "🗂️",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
  },
  {
    key: "cs",
    label: "Computer Science",
    icon: "💻",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.35)",
  },
  {
    key: "company",
    label: "Company",
    icon: "🏢",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
  },
  {
    key: "general",
    label: "General",
    icon: "📚",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.35)",
  },
  {
    key: "english",
    label: "English",
    icon: "📖",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.35)",
  },
];

/* ──────────────────────────────────────────────
   SUBJECT METADATA  (icon · accent · label · group)
────────────────────────────────────────────── */
const SUBJECT_META = {
  // ── Computer Science ──────────────────────
  dbms: { icon: "🗄️", accent: "#3b82f6", label: "DBMS", group: "cs" },
  cn: {
    icon: "🌐",
    accent: "#10b981",
    label: "Computer Networks",
    group: "cs",
  },
  oops: { icon: "🧩", accent: "#a78bfa", label: "OOP", group: "cs" },
  dsa: { icon: "⚡", accent: "#f59e0b", label: "DSA", group: "cs" },
  os: {
    icon: "🖥️",
    accent: "#ec4899",
    label: "Operating Systems",
    group: "cs",
  },
  "system-design": {
    icon: "🏗️",
    accent: "#06b6d4",
    label: "System Design",
    group: "cs",
  },
  python: { icon: "🐍", accent: "#3b82f6", label: "Python", group: "cs" },
  java: { icon: "☕", accent: "#f89820", label: "Java", group: "cs" },

  // ── Company ───────────────────────────────
  amazon: { icon: "🛒", accent: "#f97316", label: "Amazon", group: "company" },
  tcs: { icon: "🏢", accent: "#8b5cf6", label: "TCS", group: "company" },
  infosys: {
    icon: "🔵",
    accent: "#3b82f6",
    label: "Infosys",
    group: "company",
  },
  wipro: { icon: "🌿", accent: "#22c55e", label: "Wipro", group: "company" },
  microsoft365: {
    icon: "🪟",
    accent: "#0ea5e9",
    label: "Microsoft 365",
    group: "company",
  },

  // ── General ───────────────────────────────
  aptitude: {
    icon: "🧮",
    accent: "#eab308",
    label: "Aptitude",
    group: "general",
  },
  "biology-exam": {
    icon: "🧬",
    accent: "#84cc16",
    label: "Biology Exam",
    group: "general",
  },
  "general-knowledge-exam": {
    icon: "🌍",
    accent: "#d97706",
    label: "GK Exam",
    group: "general",
  },
  quizdata: {
    icon: "📋",
    accent: "#6366f1",
    label: "Quiz Data",
    group: "general",
  },

  // ── English ───────────────────────────────
  english: {
    icon: "📖",
    accent: "#f43f5e",
    label: "English",
    group: "english",
  },
  synonyms: {
    icon: "📝",
    accent: "#0ea5e9",
    label: "Synonyms",
    group: "english",
  },
  antonyms: {
    icon: "🔄",
    accent: "#8b5cf6",
    label: "Antonyms",
    group: "english",
  },
  pos: {
    icon: "🧩",
    accent: "#10b981",
    label: "Parts of Speech",
    group: "english",
  },
  "error-spotting": {
    icon: "🔍",
    accent: "#f59e0b",
    label: "Spot the Error",
    group: "english",
  },
  "active-voice": {
    icon: "🗣️",
    accent: "#06b6d4",
    label: "Active Voice",
    group: "english",
    comingSoon: true,
  },
  "passive-voice": {
    icon: "🔄",
    accent: "#0891b2",
    label: "Passive Voice",
    group: "english",
    comingSoon: true,
  },
  "direct-indirect": {
    icon: "💬",
    accent: "#0e7490",
    label: "Direct & Indirect",
    group: "english",
    comingSoon: true,
  },
  tenses: {
    icon: "⏱️",
    accent: "#155e75",
    label: "Tenses",
    group: "english",
    comingSoon: true,
  },
  prepositions: {
    icon: "📍",
    accent: "#164e63",
    label: "Prepositions",
    group: "english",
    comingSoon: true,
  },
  conjunctions: {
    icon: "🔗",
    accent: "#0c4a6e",
    label: "Conjunctions",
    group: "english",
    comingSoon: true,
  },
};

const GROUP_LABELS = {
  cs: { label: "Computer Science", icon: "💻", color: "#3b82f6" },
  company: { label: "Company", icon: "🏢", color: "#f59e0b" },
  general: { label: "General", icon: "📚", color: "#10b981" },
  english: { label: "English", icon: "📖", color: "#f43f5e" },
};

const DIFFICULTY_NAMES = ["easy", "medium", "hard"];

const EXCLUDED_IDS = [
  "hr-questions",
  "interview-guides",
  "challenges",
  "quizgames",
  "learning",
];

const DIFF_CONFIG = [
  {
    key: "easy",
    label: "Easy",
    icon: "🟢",
    desc: "Beginner-friendly concepts",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.35)",
  },
  {
    key: "medium",
    label: "Medium",
    icon: "🟡",
    desc: "Intermediate level questions",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
  },
  {
    key: "hard",
    label: "Hard",
    icon: "🔴",
    desc: "Advanced & tricky problems",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
  },
  {
    key: "mixed",
    label: "Mixed",
    icon: "🎲",
    desc: "All difficulties shuffled",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
  },
];

const MODE_CONFIG = [
  {
    key: "practice",
    label: "Practice Mode",
    icon: "📝",
    desc: "Learn at your own pace with instant feedback after each answer",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.35)",
  },
  {
    key: "test",
    label: "Time Exam Mode",
    icon: "🎯",
    desc: "Simulate a real exam with a countdown timer (1 min per question)",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getMeta(id) {
  return (
    SUBJECT_META[id] || {
      icon: "📋",
      accent: "#6366f1",
      label: id.charAt(0).toUpperCase() + id.slice(1),
      group: "general",
    }
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ExamsPage() {
  /* ─── Quiz state ─── */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizMode, setQuizMode] = useState("practice");
  const [testConfig, setTestConfig] = useState({
    active: false,
    duration: 30,
    timeRemaining: 0,
  });
  const [activeDifficulty, setActiveDifficulty] = useState("mixed");

  /* ─── Filter + modal state ─── */
  const [activeGroup, setActiveGroup] = useState("all"); // current tab
  const [pendingCategory, setPendingCategory] = useState(null);
  const [modalStep, setModalStep] = useState("difficulty");
  const [pendingDifficulty, setPendingDifficulty] = useState(null);

  /* ─── Build category list from glob ─── */
  const allCategories = useMemo(() => {
    const folderMap = {};
    Object.keys(allModules).forEach((path) => {
      const segments = path.split("/");
      const filename = segments[segments.length - 1];
      const folder = segments[segments.length - 2];
      const fileId = filename.replace(".json", "");
      if (!folderMap[folder]) folderMap[folder] = {};
      folderMap[folder][fileId] = path;
    });

    return Object.entries(folderMap)
      .filter(([folder]) => !EXCLUDED_IDS.includes(folder.toLowerCase()))
      .map(([folder, files]) => {
        const hasDifficultySplit = DIFFICULTY_NAMES.every((d) => files[d]);
        const meta = getMeta(folder);
        return {
          id: folder,
          displayName: meta.label,
          group: meta.group || "general",
          hasDifficultySplit,
          files: hasDifficultySplit
            ? Object.fromEntries(
                Object.entries(files).filter(([k]) =>
                  DIFFICULTY_NAMES.includes(k),
                ),
              )
            : files,
        };
      })
      .filter((cat) => Object.keys(cat.files).length > 0);
  }, []);

  /* ─── Filtered list based on active tab ─── */
  const visibleCategories = useMemo(() => {
    let cats = allCategories;
    if (activeGroup !== "all") {
      cats = cats.filter((c) => c.group === activeGroup);
    }
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      cats = cats.filter(
        (c) =>
          c.displayName.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.group.toLowerCase().includes(query)
      );
    }
    return cats;
  }, [allCategories, activeGroup, searchTerm]);

  /* ─── Group counts for tab badges ─── */
  const groupCounts = useMemo(() => {
    const counts = { all: allCategories.length };
    allCategories.forEach((c) => {
      counts[c.group] = (counts[c.group] || 0) + 1;
    });
    return counts;
  }, [allCategories]);

  /* ─── Load questions ─── */
  const handleSelectCategory = useCallback(
    async (category, difficulty, mode) => {
      setSelectedCategory(category.id);
      setQuizMode(mode);
      setActiveDifficulty(difficulty);
      setLoading(true);
      setError("");
      try {
        let questions = [];
        if (category.hasDifficultySplit) {
          if (difficulty === "mixed") {
            const paths = DIFFICULTY_NAMES.filter((d) => category.files[d]).map(
              (d) => category.files[d],
            );
            const results = await Promise.all(
              paths.map((p) => allModules[p]()),
            );
            questions = shuffle(results.flatMap((r) => r.default || r || []));
          } else {
            const path = category.files[difficulty];
            if (path) {
              const m = await allModules[path]();
              questions = m.default || m || [];
            }
          }
        } else {
          const singlePath =
            category.files[category.id] || Object.values(category.files)[0];
          if (singlePath) {
            const m = await allModules[singlePath]();
            questions = m.default || m || [];
          }
        }
        setQuizData(questions);
        if (mode === "test") {
          const totalSeconds = questions.length * 60;
          setTestConfig({
            active: true,
            duration: questions.length,
            timeRemaining: totalSeconds,
          });
        } else {
          setTestConfig({ active: false, duration: 30, timeRemaining: 0 });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleBack = () => {
    setSelectedCategory(null);
    setQuizData([]);
    setTestConfig({ active: false, duration: 30, timeRemaining: 0 });
  };

  const closeModal = () => {
    setPendingCategory(null);
    setPendingDifficulty(null);
    setModalStep("difficulty");
  };

  const openModal = (category) => {
    setPendingCategory(category);
    setPendingDifficulty(null);
    setModalStep(category.hasDifficultySplit ? "difficulty" : "mode");
  };

  const handleDifficultySelect = (diff) => {
    setPendingDifficulty(diff);
    setModalStep("mode");
  };

  const handleModeSelect = (mode) => {
    if (!pendingCategory) return;
    const diff = pendingCategory.hasDifficultySplit
      ? pendingDifficulty
      : "mixed";
    handleSelectCategory(pendingCategory, diff, mode);
    closeModal();
  };

  /* ─── Selection grid ─── */
  const groupedVisible = useMemo(() => {
    if (activeGroup !== "all") return { [activeGroup]: visibleCategories };
    // Group by category
    const groups = {};
    visibleCategories.forEach((cat) => {
      const g = cat.group || "general";
      if (!groups[g]) groups[g] = [];
      groups[g].push(cat);
    });
    return groups;
  }, [activeGroup, visibleCategories]);

  /* ─── Active quiz view ─── */
  if (selectedCategory) {
    const meta = getMeta(selectedCategory);
    const diffLabel = DIFF_CONFIG.find((d) => d.key === activeDifficulty);
    const groupInfo = GROUP_LABELS[meta.group] || {
      label: "General",
      icon: "📚",
      color: "#10b981",
    };
    return (
      <div className="fixed inset-0 z-[100] w-full h-[100dvh] flex flex-col bg-[#0f172a] overflow-hidden">
        <div className="p-3 sm:p-4 flex flex-row justify-between items-center gap-3 border-b border-slate-700/60 bg-[#0a0f1a]/90 backdrop-blur sticky top-0 z-20">
          <button
            onClick={handleBack}
            className="text-white hover:text-slate-300 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800/80 border border-white/10 text-sm flex items-center gap-1.5 shrink-0 transition-colors"
          >
            ← <span className="hidden sm:inline">Back to Exams</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{meta.icon}</span>
            <div className="min-w-0 text-right">
              <h2 className="text-sm sm:text-lg font-black text-white/90 truncate leading-tight">
                {
                  allCategories.find((c) => c.id === selectedCategory)
                    ?.displayName
                }
              </h2>
              <div className="flex items-center justify-end gap-1.5 mt-0.5 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: groupInfo.color,
                    background: `${groupInfo.color}15`,
                    border: `1px solid ${groupInfo.color}30`,
                  }}
                >
                  {groupInfo.icon} {groupInfo.label}
                </span>
                {diffLabel && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      color: diffLabel.color,
                      background: diffLabel.bg,
                      border: `1px solid ${diffLabel.border}`,
                    }}
                  >
                    {diffLabel.icon} {diffLabel.label}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${quizMode === "test" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}
                >
                  {quizMode === "test" ? "🎯 Exam" : "📝 Practice"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <QuizFeed
            quizData={quizData}
            isDarkMode={true}
            isLoading={loading}
            error={error}
            quizMode={quizMode}
            testConfig={testConfig}
            setTestConfig={setTestConfig}
            activeCategory={selectedCategory}
          />
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 relative z-10">
      {/* ── TWO-STEP MODAL ── */}
      <AnimatePresence>
        {pendingCategory && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              key={modalStep}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #0f172a 0%, #111827 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Modal header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">
                      {getMeta(pendingCategory.id).icon}
                    </span>
                    <span className="text-white font-black text-lg leading-tight">
                      {pendingCategory.displayName}
                    </span>
                    {/* Group badge */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color:
                          (GROUP_LABELS[pendingCategory.group] || {}).color ||
                          "#a78bfa",
                        background: `${(GROUP_LABELS[pendingCategory.group] || {}).color || "#a78bfa"}15`,
                        border: `1px solid ${(GROUP_LABELS[pendingCategory.group] || {}).color || "#a78bfa"}30`,
                      }}
                    >
                      {
                        (GROUP_LABELS[pendingCategory.group] || { icon: "📚" })
                          .icon
                      }{" "}
                      {
                        (
                          GROUP_LABELS[pendingCategory.group] || {
                            label: "General",
                          }
                        ).label
                      }
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {modalStep === "difficulty"
                      ? "Step 1 of 2 — Choose your difficulty level"
                      : `Step ${pendingCategory.hasDifficultySplit ? "2 of 2" : "1 of 1"} — Choose exam mode`}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-500 hover:text-white transition-colors mt-1 shrink-0"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Step progress dots */}
              {pendingCategory.hasDifficultySplit && (
                <div className="flex justify-center gap-2 pt-4 px-6">
                  {["difficulty", "mode"].map((step) => (
                    <div
                      key={step}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: modalStep === step ? "32px" : "10px",
                        background:
                          modalStep === step
                            ? getMeta(pendingCategory.id).accent
                            : "rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Step 1: Difficulty */}
              {modalStep === "difficulty" && (
                <div className="p-5 grid grid-cols-2 gap-3">
                  {DIFF_CONFIG.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => handleDifficultySelect(d.key)}
                      className="group relative flex flex-col items-center gap-3 p-5 rounded-xl border text-center transition-all duration-200 hover:scale-[1.03]"
                      style={{ borderColor: d.border, background: d.bg }}
                    >
                      <span className="text-3xl">{d.icon}</span>
                      <div>
                        <p className="font-black text-white text-sm">
                          {d.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          {d.desc}
                        </p>
                      </div>
                      <span
                        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: d.color }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Mode */}
              {modalStep === "mode" && (
                <div className="p-5 flex flex-col gap-3">
                  {pendingDifficulty && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">
                        {
                          DIFF_CONFIG.find((d) => d.key === pendingDifficulty)
                            ?.icon
                        }{" "}
                        {
                          DIFF_CONFIG.find((d) => d.key === pendingDifficulty)
                            ?.label
                        }{" "}
                        selected
                      </span>
                      {pendingCategory.hasDifficultySplit && (
                        <button
                          onClick={() => setModalStep("difficulty")}
                          className="text-[10px] text-slate-500 hover:text-white transition-colors underline underline-offset-2"
                        >
                          ← Change
                        </button>
                      )}
                    </div>
                  )}
                  {MODE_CONFIG.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => handleModeSelect(m.key)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group hover:scale-[1.01]"
                      style={{ borderColor: m.border, background: m.bg }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110"
                          style={{ background: `${m.color}20` }}
                        >
                          {m.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-white">{m.label}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {m.desc}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-slate-500 group-hover:translate-x-1 transition-transform"
                        style={{ color: m.color }}
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="px-5 pb-5">
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="mb-8 animate-fade-in-up">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a78bfa]/90">
          Exam Center
        </p>
        <h1 className="mt-1 text-4xl font-black text-white sm:text-5xl">
          All Exams
        </h1>
        <p className="mt-2 text-sm text-slate-400 mb-6">
          Select a subject · choose difficulty · choose mode
        </p>
        <div className="max-w-md relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exams..."
            className="w-full rounded-2xl border border-white/10 bg-black/24 pl-12 pr-4 py-3 text-sm text-white outline-none transition focus:border-[#40e0f0]/60 focus:bg-black/30"
          />
        </div>
      </div>

      {/* ── Category Tab Bar ── */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeGroup === cat.key;
          const count = groupCounts[cat.key] || 0;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveGroup(cat.key)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: cat.bg,
                      border: `1.5px solid ${cat.border}`,
                      color: cat.color,
                      boxShadow: `0 4px 20px ${cat.color}20`,
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1.5px solid rgba(255,255,255,0.08)",
                      color: "#64748b",
                    }
              }
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black"
                style={
                  isActive
                    ? { background: cat.color, color: "#fff" }
                    : { background: "rgba(255,255,255,0.08)", color: "#94a3b8" }
                }
              >
                {count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ boxShadow: `inset 0 0 0 1.5px ${cat.color}` }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Subject sections ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {Object.keys(groupedVisible).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔎</div>
              <h2 className="text-xl font-bold text-white">No exams found</h2>
              <p className="text-slate-400 text-sm mt-2">Try a different search term.</p>
            </div>
          ) : (
            Object.entries(groupedVisible).map(([groupKey, cats]) => {
              const grp = GROUP_LABELS[groupKey] || {
                label: groupKey,
                icon: "📂",
                color: "#6366f1",
              };
            return (
              <div key={groupKey} className="mb-10">
                {/* Section heading (only in "All" view) */}
                {activeGroup === "all" && (
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border"
                      style={{
                        color: grp.color,
                        background: `${grp.color}12`,
                        borderColor: `${grp.color}30`,
                      }}
                    >
                      <span className="text-base">{grp.icon}</span>
                      <span>{grp.label}</span>
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{ background: grp.color, color: "#fff" }}
                      >
                        {cats.length}
                      </span>
                    </div>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: `linear-gradient(90deg, ${grp.color}30, transparent)`,
                      }}
                    />
                  </div>
                )}

                {/* Cards grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cats.map((category, i) => {
                    const meta = getMeta(category.id);
                    const isComingSoon = meta.comingSoon === true;
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        onClick={() =>
                          isComingSoon ? null : openModal(category)
                        }
                        className={`interactive-lift group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0a0a0f] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all hover:border-white/15 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] ${isComingSoon ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        {/* Hover glow */}
                        <div
                          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(circle at 30% 20%, ${meta.accent}12, transparent 65%)`,
                          }}
                        />

                        {/* Coming Soon Badge */}
                        {isComingSoon && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse border border-amber-400/50">
                              🚧 Coming Soon
                            </div>
                          </div>
                        )}

                        {/* Top row: icon + difficulty pills */}
                        <div className="relative flex items-start justify-between">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                            style={{
                              borderColor: `${meta.accent}55`,
                              color: meta.accent,
                              background: `${meta.accent}12`,
                            }}
                          >
                            {meta.icon}
                          </div>
                          {category.hasDifficultySplit ? (
                            <div
                              className="flex gap-1"
                              title="Has Easy · Medium · Hard levels"
                            >
                              {DIFFICULTY_NAMES.map((d) => {
                                const dc = DIFF_CONFIG.find((x) => x.key === d);
                                return (
                                  <span key={d} className="text-sm">
                                    {dc.icon}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span
                              className="text-[10px] font-bold px-2 py-1 rounded-lg"
                              style={{
                                color: grp.color,
                                background: `${grp.color}15`,
                                border: `1px solid ${grp.color}25`,
                              }}
                            >
                              {grp.icon}
                            </span>
                          )}
                        </div>

                        {/* Name + subtitle */}
                        <div className="relative mt-4 flex-1">
                          <h3 className="text-lg font-black tracking-tight text-white">
                            {category.displayName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            {isComingSoon
                              ? "Coming soon..."
                              : category.hasDifficultySplit
                                ? "Easy · Medium · Hard · Mixed"
                                : "Question dataset"}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="relative mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.18em]"
                            style={{
                              color: isComingSoon ? "#f59e0b" : meta.accent,
                            }}
                          >
                            {isComingSoon ? "Notify Me" : "Start"}
                          </span>
                          <span
                            className="opacity-50 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 text-sm"
                            style={{ color: meta.accent }}
                          >
                            {isComingSoon ? "🔔" : "→"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          }))}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
